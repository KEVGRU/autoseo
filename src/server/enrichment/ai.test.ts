/**
 * AI enrichment with a stubbed LLM, cache and HTTP layer: schema mapping, batching, citation / live URL verification.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const llm = vi.hoisted(() => ({ calls: [] as { purpose: string; prompt: string }[], responses: [] as unknown[] }));
const store = vi.hoisted(() => new Map<string, unknown>());
const http = vi.hoisted(() => ({ status: new Map<string, number>(), html: new Map<string, string>() }));

vi.mock("@/server/ai/llm", () => ({
  runLlm: vi.fn(async (req: { purpose: string; prompt: string }) => {
    llm.calls.push({ purpose: req.purpose, prompt: req.prompt });
    const next = llm.responses.shift();
    if (typeof next === "function") return (next as (r: typeof req) => unknown)(req);
    return next;
  }),
}));

vi.mock("@/server/seo/cache", () => ({
  buildCacheKey: (prefix: string, params: Record<string, unknown>) => `${prefix}:${JSON.stringify(params)}`,
  cacheGet: vi.fn(async (key: string) => (store.has(key) ? { value: store.get(key), createdAt: new Date() } : null)),
  cacheGetMany: vi.fn(async (keys: string[]) => new Map(keys.filter((k) => store.has(k)).map((k) => [k, { value: store.get(k), createdAt: new Date() }]))),
  cacheSet: vi.fn(async (key: string, _ns: string, _p: unknown, value: unknown) => void store.set(key, value)),
}));

vi.mock("@/server/optimize/net", () => ({
  safeFetch: vi.fn(async (url: string) => {
    const status = http.status.get(url) ?? 404;
    const html = http.html.get(url) ?? "";
    return { ok: status >= 200 && status < 300, status, url, headers: new Headers(), body: Buffer.from(html), text: () => html, json: () => ({}) };
  }),
}));

import { aiKeywordMetrics, aiLinkMentions, aiSerp, extractLinksToDomain, toConfidence, toNumber, AiCacheMissError } from "./ai";

const market = { locationCode: 2276, languageCode: "de" };
const ctx = { projectId: "prj_1", workspaceId: "ws_1", userId: "usr_1" };

beforeEach(() => {
  llm.calls.length = 0;
  llm.responses.length = 0;
  store.clear();
  http.status.clear();
  http.html.clear();
});

describe("number / confidence normalizers", () => {
  it("parses model-formatted numbers", () => {
    expect(toNumber(1200)).toBe(1200);
    expect(toNumber("1,200")).toBe(1200);
    expect(toNumber("1.200")).toBe(1200);
    expect(toNumber("0,85")).toBe(0.85);
    expect(toNumber("$2.40")).toBe(2.4);
    expect(toNumber("12k")).toBe(12000);
    expect(toNumber("n/a")).toBeNull();
    expect(toNumber(null)).toBeNull();
  });
  it("maps confidence words", () => {
    expect(toConfidence("High")).toBe("high");
    expect(toConfidence("medium-ish")).toBe("medium");
    expect(toConfidence(undefined)).toBe("low");
  });
});

describe("aiKeywordMetrics", () => {
  it("maps + clamps estimates, drops keywords it did not ask for, fills skipped ones with nulls, caches per keyword", async () => {
    llm.responses.push({
      provider: "anthropic",
      model: "claude-opus-5",
      text: "{}",
      citations: [{ url: "https://trends.google.com/x" }],
      data: {
        keywords: [
          { keyword: "Balkonkraftwerk", searchVolume: "74,000", cpcUsd: "0,85", difficulty: 140, intent: "Commercial", trend: "rising", confidence: "high" },
          { keyword: "invented keyword", searchVolume: 5, confidence: "high" },
        ],
      },
    });
    const res = await aiKeywordMetrics(ctx, { keywords: ["balkonkraftwerk", "solar speicher"], market });
    expect(llm.calls[0]!.purpose).toBe("enrich_keyword_metrics");
    expect(llm.calls[0]!.prompt).toContain("Germany");
    expect(res.rows).toEqual([
      { keyword: "balkonkraftwerk", searchVolume: 74000, cpcUsd: 0.85, difficulty: 100, intent: "commercial", trend: "up", confidence: "high" },
      { keyword: "solar speicher", searchVolume: null, cpcUsd: null, difficulty: null, intent: null, trend: null, confidence: "low" },
    ]);
    expect(res.meta?.source).toBe("ai");
    expect(res.meta?.model).toBe("claude-opus-5");

    // Second call is served from the per-keyword cache (only the missing keyword goes to the model).
    llm.responses.push({ provider: "anthropic", model: "m", text: "{}", citations: [{ url: "https://x.org" }], data: { keywords: [] } });
    const again = await aiKeywordMetrics(ctx, { keywords: ["balkonkraftwerk", "solar speicher"], market });
    expect(again.cachedCount).toBe(1);
    expect(llm.calls).toHaveLength(2);
    expect(llm.calls[1]!.prompt).toContain("solar speicher");
    expect(llm.calls[1]!.prompt).not.toContain("1. balkonkraftwerk");
  });

  it("batches 50 keywords per call and downgrades confidence without web evidence", async () => {
    const keywords = Array.from({ length: 120 }, (_, i) => `kw ${i}`);
    for (let b = 0; b < 3; b++) {
      llm.responses.push((req: { prompt: string }) => ({
        provider: "openrouter",
        model: "x",
        text: "",
        citations: [],
        data: { keywords: [...req.prompt.matchAll(/^\d+\. (kw \d+)$/gm)].map((m) => ({ keyword: m[1], searchVolume: 10, confidence: "high" })) },
      }));
    }
    const res = await aiKeywordMetrics(ctx, { keywords, market });
    expect(llm.calls).toHaveLength(3);
    expect(res.rows).toHaveLength(120);
    expect(res.rows.every((r) => r.searchVolume === 10 && r.confidence === "low")).toBe(true);
  });

  it("never calls the model for cache-only callers", async () => {
    await expect(aiKeywordMetrics({ ...ctx, cacheOnly: true }, { keywords: ["x"], market })).rejects.toBeInstanceOf(AiCacheMissError);
    expect(llm.calls).toHaveLength(0);
  });
});

describe("aiSerp", () => {
  it("keeps cited or live-verified URLs, drops invented ones and renumbers", async () => {
    http.status.set("https://live-but-uncited.com/page", 200);
    llm.responses.push({
      provider: "anthropic",
      model: "claude-opus-5",
      text: "",
      citations: [{ url: "https://www.solakon.de/balkonkraftwerk/" }, { url: "https://www.test.de/solar" }],
      data: {
        items: [
          { position: 1, url: "https://solakon.de/balkonkraftwerk", title: "Solakon", description: "Balkonkraftwerke" },
          { position: 2, url: "https://hallucinated.example/fake", title: "Fake" },
          { position: 3, url: "https://www.test.de/other-page", title: "Test" },
          { position: 4, url: "https://live-but-uncited.com/page", title: "Live" },
          { position: 5, url: "not-a-url", title: "Broken" },
        ],
        features: ["People Also Ask", "local-pack"],
        confidence: "medium",
      },
    });
    const res = await aiSerp(ctx, { keyword: "Balkonkraftwerk", market });
    expect(res.items.map((i) => [i.position, i.domain, i.verification])).toEqual([
      [1, "solakon.de", "cited"],
      [2, "test.de", "host"],
      [3, "live-but-uncited.com", "reachable"],
    ]);
    expect(res.features).toEqual(["people_also_ask", "local_pack"]);
    expect(res.meta.confidence).toBe("medium");
  });

  it("treats local-agent citations that echo its own answer as unverified", async () => {
    const answer = '{"items":[{"position":1,"url":"https://invented.example/a"}]}';
    llm.responses.push({
      provider: "agent",
      model: "claude",
      text: answer,
      citations: [{ url: "https://invented.example/a" }],
      data: { items: [{ position: 1, url: "https://invented.example/a", title: "A" }] },
    });
    const res = await aiSerp(ctx, { keyword: "x", market });
    expect(res.items).toHaveLength(0);
  });
});

describe("aiLinkMentions", () => {
  it("reads real link data from the live page and drops pages that don't mention the domain", async () => {
    http.status.set("https://blog.example.org/review", 200);
    http.html.set(
      "https://blog.example.org/review",
      '<p>We tested <a href="https://www.solakon.de/shop?ref=1" rel="nofollow ugc">Solakon <b>Shop</b></a> and <a href="/local">local</a></p>',
    );
    http.status.set("https://forum.example.net/t/1", 200);
    http.html.set("https://forum.example.net/t/1", "<p>Nothing about the brand here</p>");
    http.status.set("https://news.example.com/a", 200);
    http.html.set("https://news.example.com/a", "<p>solakon.de announced a new battery</p>");
    llm.responses.push({
      provider: "openai",
      model: "gpt-5",
      text: "",
      citations: [{ url: "https://blog.example.org/review" }],
      data: {
        items: [
          { url: "https://blog.example.org/review", title: "Review", snippet: "…", linksToDomain: true },
          { url: "https://forum.example.net/t/1", title: "Forum" },
          { url: "https://news.example.com/a", title: "News" },
          { url: "https://www.solakon.de/about", title: "Own page" },
        ],
      },
    });
    const res = await aiLinkMentions(ctx, { domain: "solakon.de", limit: 10 });
    expect(res.items.map((i) => i.url)).toEqual(["https://blog.example.org/review", "https://news.example.com/a"]);
    expect(res.items[0]!.links).toEqual([{ url: "https://www.solakon.de/shop?ref=1", anchor: "Solakon Shop", nofollow: true }]);
    expect(res.items[0]!.linksToDomain).toBe(true);
    expect(res.items[1]!.linksToDomain).toBe(false);
  });

  it("extractLinksToDomain resolves relative URLs and ignores other hosts", () => {
    const html = `<a href='https://shop.acme.com/x'>Shop</a><a href="/rel">Rel</a><a href="https://other.com">Other</a><a href=https://acme.com/y rel=sponsored>Y</a>`;
    expect(extractLinksToDomain(html, "https://acme.com/page", "acme.com")).toEqual([
      { url: "https://shop.acme.com/x", anchor: "Shop", nofollow: false },
      { url: "https://acme.com/rel", anchor: "Rel", nofollow: false },
      { url: "https://acme.com/y", anchor: "Y", nofollow: true },
    ]);
  });
});
