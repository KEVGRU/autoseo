/**
 * SEO services without DataForSEO: every service resolves to AI enrichment (stubbed LLM + HTTP), maps the estimates to
 * the regular row shapes and labels the result `enrichment.source = "ai"`. Also covers the 402 → AI fallback.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  dfs: { login: "", password: "", sandbox: false, defaultLocationCode: 2276, defaultLanguageCode: "de", mode: "auto", fallbackOnError: true } as Record<string, unknown>,
  llmData: [] as unknown[],
  prompts: [] as string[],
  cache: new Map<string, unknown>(),
}));

vi.mock("@/server/settings", () => ({
  getSetting: async (key: string) => {
    if (key === "dataforseo") return state.dfs;
    if (key === "limits") return { dailyBudgetUsd: 0, monthlyBudgetUsd: 0 };
    return {};
  },
}));

vi.mock("@/server/db/client", () => {
  const make = (): unknown =>
    new Proxy(function () {}, {
      get: (_t, prop) => (prop === "then" ? (resolve: (v: unknown) => void) => resolve([]) : make()),
      apply: () => make(),
    });
  return { db: make(), rawSql: make() };
});

vi.mock("./cache", async (orig) => {
  const actual = await orig<typeof import("./cache")>();
  return {
    ...actual,
    cacheGet: async (key: string) => (state.cache.has(key) ? { value: state.cache.get(key), createdAt: new Date() } : null),
    cacheGetMany: async (keys: string[]) => new Map(keys.filter((k) => state.cache.has(k)).map((k) => [k, { value: state.cache.get(k), createdAt: new Date() }])),
    cacheSet: async (key: string, _ns: string, _p: unknown, value: unknown) => void state.cache.set(key, value),
  };
});

vi.mock("@/server/ai/llm", () => ({
  AiNotConfiguredError: class extends Error {},
  availableLlmProviders: async () => ["anthropic"],
  runLlm: vi.fn(async (req: { prompt: string }) => {
    state.prompts.push(req.prompt);
    return { provider: "anthropic", model: "claude-opus-5", text: "", citations: [{ url: "https://www.example.com/" }, { url: "https://rival.com/x" }], data: state.llmData.shift() };
  }),
}));

vi.mock("@/server/optimize/net", () => ({
  safeFetch: vi.fn(async (url: string) => {
    const html = url.includes("blog.") ? '<a href="https://example.com/pricing">pricing</a>' : "";
    return { ok: true, status: 200, url, headers: new Headers(), body: Buffer.from(html), text: () => html, json: () => ({}) };
  }),
}));

import { researchKeywords, getSerpAnalysis, fetchKeywordMetricsForList } from "./keywords";
import { getDomainKeywordsPage, getDomainOverview } from "./domain";
import { getBacklinksOverview, getBacklinksRows } from "./backlinks";
import type { SeoContext } from "./context";

const ctx: SeoContext = {
  projectId: "prj_test",
  workspaceId: "wsp_test",
  userId: "usr_test",
  project: { name: "Example", domain: "example.com", country: "DE", language: "de" },
  market: { locationCode: 2276, languageCode: "de" },
  canRun: true,
};

beforeEach(() => {
  state.dfs = { ...state.dfs, login: "", password: "", mode: "auto" };
  state.llmData = [];
  state.prompts = [];
  state.cache.clear();
  vi.unstubAllGlobals();
});

describe("SEO services on AI enrichment", () => {
  it("keyword research returns AI ideas without trends, labelled as AI", async () => {
    state.llmData.push({ keywords: [{ keyword: "solar", searchVolume: 9000, cpcUsd: 1.2, difficulty: 55, intent: "commercial", confidence: "medium" }, { keyword: "solar kaufen", searchVolume: 800 }] });
    const res = await researchKeywords(ctx, { keywords: ["Solar"] });
    expect(res.provider).toBe("ai");
    expect(res.enrichment).toMatchObject({ source: "ai", meta: { model: "claude-opus-5" } });
    expect(res.rows[0]).toMatchObject({ keyword: "solar", searchVolume: 9000, cpc: 1.2, competition: null, keywordDifficulty: 55, intent: "commercial", trend: [] });
    expect(state.prompts[0]).toContain("Germany");
  });

  it("SERP analysis maps verified AI results to SERP rows (depth ≤ 20, no traffic/backlink data)", async () => {
    state.llmData.push({ items: [{ position: 1, url: "https://rival.com/x", title: "Rival" }], features: ["video"] });
    const res = await getSerpAnalysis(ctx, { keyword: "solar", depth: 100 });
    expect(res.depth).toBe(20);
    expect(res.enrichment.source).toBe("ai");
    expect(res.items[0]).toMatchObject({ rank: 1, domain: "rival.com", etv: null, backlinks: null });
  });

  it("keyword metrics carry source + confidence", async () => {
    state.llmData.push({ keywords: [{ keyword: "solar", searchVolume: 100, confidence: "high" }] });
    const rows = await fetchKeywordMetricsForList(ctx, { keywords: ["solar"], locationCode: 2276, languageCode: "de", feature: "keyword_research" });
    expect(rows).toEqual([expect.objectContaining({ keyword: "solar", searchVolume: 100, monthlySearches: [], source: "ai", confidence: "high" })]);
  });

  it("domain overview + keywords share one AI profile call", async () => {
    state.llmData.push({
      organicTrafficEst: 1200,
      organicKeywordsEst: 90,
      topKeywords: [{ keyword: "example tool", positionEst: 2, volumeEst: 1000, url: "https://example.com/tool" }],
      topPages: [],
      competitors: [],
      confidence: "low",
    });
    const [overview, page] = await Promise.all([
      getDomainOverview(ctx, { domain: "example.com" }),
      getDomainKeywordsPage(ctx, { domain: "example.com", page: 1, pageSize: 50 }),
    ]);
    expect(state.prompts).toHaveLength(1);
    expect(overview).toMatchObject({ organicTraffic: 1200, organicKeywords: 90, hasData: true, enrichment: { source: "ai" } });
    expect(page.rows[0]).toMatchObject({ keyword: "example tool", position: 2, searchVolume: 1000, url: "https://example.com/tool" });
    expect(page.enrichment.source).toBe("ai");
  });

  it("backlinks return a labelled sample, never totals", async () => {
    state.llmData.push({ items: [{ url: "https://blog.other.org/post", title: "Post" }] });
    const overview = await getBacklinksOverview(ctx, { target: "example.com" });
    const rows = await getBacklinksRows(ctx, { target: "example.com" });
    expect(overview.summary.backlinks).toBeNull();
    expect(overview.aiSample).toEqual({ pages: 1, referringDomains: 1, linkingPages: 1, mentionOnlyPages: 0 });
    expect(rows.rows[0]).toMatchObject({ domainFrom: "blog.other.org", urlTo: "https://example.com/pricing", anchor: "pricing", isDofollow: true });
    expect(state.prompts).toHaveLength(1);
  });

  it("falls back to AI when DataForSEO answers 402", async () => {
    state.dfs = { ...state.dfs, login: "user", password: "pw" };
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 402 })));
    state.llmData.push({ keywords: [{ keyword: "solar", searchVolume: 5 }] });
    const res = await researchKeywords(ctx, { keywords: ["solar"] });
    expect(res.enrichment.source).toBe("ai");
    expect(res.enrichment.fallbackReason).toMatch(/insufficient funds/i);
  });

  it("read-only users only get cached AI estimates", async () => {
    await expect(researchKeywords({ ...ctx, canRun: false }, { keywords: ["uncached"] })).rejects.toMatchObject({ code: "PERMISSION" });
  });
});
