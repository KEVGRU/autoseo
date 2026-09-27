import { describe, expect, it } from "vitest";
import { findCrawledNotCited, findMissingCrawlers, isContentPath, normalizeCrawlPath, type KnownCrawler } from "./coverage";
import { buildCloudflareWorkerScript, explainCloudflareError, matchZoneForDomain, routePatternForZone, workerNameForZone } from "./cloudflare-worker";

const KNOWN: KnownCrawler[] = [
  { token: "GPTBot", name: "GPTBot", company: "OpenAI", purpose: "training" },
  { token: "OAI-SearchBot", name: "OAI-SearchBot", company: "OpenAI", purpose: "search" },
  { token: "ChatGPT-User", name: "ChatGPT-User", company: "OpenAI", purpose: "user" },
  { token: "PerplexityBot", name: "PerplexityBot", company: "Perplexity", purpose: "search" },
  { token: "AhrefsBot", name: "AhrefsBot", company: "Ahrefs", purpose: "seo" },
];

describe("findMissingCrawlers", () => {
  it("lists AI crawlers without visits (SEO tools excluded), search bots first, never-seen first", () => {
    const visits = new Map([["GPTBot", 12]]);
    const lastSeen = new Map([["PerplexityBot", "2026-01-02T00:00:00.000Z"]]);
    const robots = new Map([["oai-searchbot", { verdict: "blocked" as const, rule: "Disallow: /" }]]);
    const r = findMissingCrawlers(KNOWN, visits, lastSeen, robots);
    expect(r.map((b) => b.token)).toEqual(["OAI-SearchBot", "PerplexityBot", "ChatGPT-User"]);
    expect(r[0]).toMatchObject({ robots: "blocked", robotsRule: "Disallow: /", lastSeen: null });
    expect(r[1]!.lastSeen).toBe("2026-01-02T00:00:00.000Z");
    expect(r[2]!.robots).toBeNull();
  });
  it("handles a missing crawlability check", () => {
    expect(findMissingCrawlers(KNOWN, new Map(), new Map(), null).every((b) => b.robots === null)).toBe(true);
  });
});

describe("normalizeCrawlPath", () => {
  it("drops host, query, fragment and trailing slashes", () => {
    expect(normalizeCrawlPath("https://www.Example.com/Pricing/?utm=1#x")).toBe("/pricing");
    expect(normalizeCrawlPath("/blog/post/")).toBe("/blog/post");
    expect(normalizeCrawlPath("https://example.com")).toBe("/");
    expect(normalizeCrawlPath("/")).toBe("/");
    expect(normalizeCrawlPath("/caf%C3%A9")).toBe("/café");
    expect(normalizeCrawlPath("/bad%E0%A4%A")).toBe("/bad%e0%a4%a");
  });
});

describe("findCrawledNotCited", () => {
  const row = (path: string, visits = 1) => ({ path, host: "example.com", bots: ["GPTBot"], visits, lastVisited: "2026-09-01T00:00:00.000Z" });
  it("keeps content pages that were never cited, skipping assets and duplicates", () => {
    const crawled = [row("/pricing", 9), row("/blog/a/", 5), row("/blog/a?ref=x", 2), row("/robots.txt", 50), row("/app.js", 3), row("/", 4)];
    const out = findCrawledNotCited(crawled, ["https://example.com/pricing/", "https://www.example.com/"]);
    expect(out.map((r) => r.path)).toEqual(["/blog/a/"]);
  });
  it("classifies content paths", () => {
    expect(isContentPath("/guides/solar")).toBe(true);
    expect(isContentPath("/images/x.webp")).toBe(false);
    expect(isContentPath("/.well-known/security.txt")).toBe(false);
    expect(isContentPath("/llms.txt")).toBe(false);
  });
});

describe("cloudflare worker helpers", () => {
  it("derives worker name, route and zone", () => {
    expect(workerNameForZone("Solakon.de")).toBe("autoseo-bots-solakon-de");
    expect(workerNameForZone("a".repeat(80) + ".com").length).toBeLessThanOrEqual(63);
    expect(routePatternForZone("Example.com")).toBe("*example.com/*");
    const zones = [{ name: "example.com" }, { name: "shop.example.com" }, { name: "other.org" }];
    expect(matchZoneForDomain(zones, "www.example.com")?.name).toBe("example.com");
    expect(matchZoneForDomain(zones, "https://shop.example.com/x")?.name).toBe("shop.example.com");
    expect(matchZoneForDomain(zones, "nope.net")).toBeNull();
  });
  it("builds a module worker that reads the token from the secret binding", () => {
    const js = buildCloudflareWorkerScript({ projectId: "prj_x", endpoint: "https://app.example.com/api/webhooks/server-logs", generatedAt: new Date("2026-09-26") });
    expect(js).toContain("export default");
    expect(js).toContain("env.AUTOSEO_TOKEN");
    expect(js).toContain('"https://app.example.com/api/webhooks/server-logs"');
    expect(js).not.toMatch(/fslg_/);
  });
  it("explains permission errors without leaking anything", () => {
    expect(explainCloudflareError("script", 403, [{ code: 10000, message: "Authentication error" }])).toMatch(/Workers Scripts › Edit/);
    expect(explainCloudflareError("routes", 400, [{ code: 10000, message: "Authentication error" }])).toMatch(/Workers Routes › Edit/);
    expect(explainCloudflareError("zones", 401, [])).toMatch(/invalid or expired/);
    expect(explainCloudflareError("zones", 403, [{ code: 9109, message: "Invalid access token" }])).toMatch(/invalid or expired/);
    expect(explainCloudflareError("zone", 500, [{ code: 1, message: "boom" }])).toBe("Cloudflare API error (HTTP 500): boom.");
  });
});
