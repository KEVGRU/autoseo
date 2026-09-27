import { describe, expect, it } from "vitest";
import { emptyBundle } from "@/features/reports/lib/bundle";
import { CHARTS, LISTS, TABLES, resolveChart, resolveList, resolveToken } from "@/features/reports/lib/catalog";
import { mapAttribution, mapBotTraffic, mapHumanTraffic, type BotOverviewLike, type TrafficOverviewLike } from "./block-mappers";

const overview: BotOverviewLike = {
  totals: { visits: 120, prevVisits: 100, uniqueUrls: 30, prevUniqueUrls: 25, ok: 100, redirects: 5, clientErrors: 12, serverErrors: 3, verified: 90 },
  daily: [
    { date: "2026-09-01", b0: 10, b1: 5, other: 1 },
    { date: "2026-09-02", b0: 7, b1: 0, other: 0 },
  ],
  series: [
    { key: "b0", label: "GPTBot" },
    { key: "b1", label: "ClaudeBot" },
    { key: "other", label: "Other bots" },
  ],
  bots: [
    { bot: "GPTBot", company: "OpenAI", visits: 80, prevVisits: 60, pages: 20 },
    { bot: "ClaudeBot", company: "Anthropic", visits: 40, prevVisits: 40, pages: 12 },
  ],
  hasAnyData: true,
};

describe("mapBotTraffic", () => {
  it("maps totals, daily trend per bot, top pages and error pages", () => {
    const b = mapBotTraffic(
      overview,
      [
        { path: "/pricing", visits: 30, bots: ["GPTBot", "ClaudeBot"] },
        { path: "/", visits: 20, bots: ["GPTBot"] },
      ],
      [
        { path: "/old", errors: 9, breakdown: [{ status: "404", count: 9 }, { status: "200", count: 1 }] },
        { path: "/api", errors: 3, breakdown: [{ status: "500", count: 2 }, { status: "503", count: 1 }] },
        { path: "/fine", errors: 0, breakdown: [{ status: "200", count: 4 }] },
      ],
    )!;
    expect(b.visits).toBe(120);
    expect(b.trend).toEqual([
      { date: "2026-09-01", total: 16, values: { b0: 10, b1: 5, other: 1 } },
      { date: "2026-09-02", total: 7, values: { b0: 7, b1: 0, other: 0 } },
    ]);
    expect(b.topPages).toEqual([
      { path: "/pricing", visits: 30, bots: 2 },
      { path: "/", visits: 20, bots: 1 },
    ]);
    expect(b.errorPages).toEqual([
      { path: "/old", status: 404, hits: 9 },
      { path: "/api", status: 500, hits: 3 },
    ]);
  });
  it("returns null when no bot traffic was ever recorded", () => {
    expect(mapBotTraffic({ ...overview, hasAnyData: false }, [], [])).toBeNull();
  });
});

describe("mapAttribution", () => {
  const summary = {
    currency: "USD",
    responses: 40,
    aiResponses: 10,
    dealValue: 20000,
    aiDealValue: 6500.456,
    previous: { responses: 30, aiResponses: 6, dealValue: 15000, aiDealValue: 4000 },
    byChannel: [
      { channel: "search", label: "Search engine", responses: 20, dealValue: 9000 },
      { channel: "ai_search", label: "AI search", responses: 10, dealValue: 6500.456 },
    ],
    byAiDetail: [{ detail: "chatgpt", label: "ChatGPT", responses: 7, dealValue: 5000 }],
    conversions: { total: 12, merged: 8, value: 3100 },
    insights: { hiddenAiRevenue: { value: 1234 } },
  };
  it("maps leads, deal value and channel split (AI flagged)", () => {
    const a = mapAttribution(summary, 55)!;
    expect(a).toMatchObject({ currency: "USD", responses: 40, aiResponses: 10, prevAiResponses: 6, aiDealValue: 6500.46, conversionsValue: 3100, hiddenAiRevenue: 1234 });
    expect(a.byChannel.map((c) => [c.channel, c.isAi])).toEqual([
      ["search", false],
      ["ai_search", true],
    ]);
    expect(a.byAiPlatform).toEqual([{ key: "chatgpt", label: "ChatGPT", responses: 7, dealValue: 5000 }]);
  });
  it("is null before the first attribution answer", () => {
    expect(mapAttribution(summary, 0)).toBeNull();
  });
});

describe("mapHumanTraffic", () => {
  const ov: TrafficOverviewLike = {
    kpis: { sessions: 300, conversions: 12.345, revenue: 999.999, prevSessions: 200, prevConversions: 10, prevRevenue: 500, allSessions: 10000 },
    series: [
      { date: "2026-09-01", chatgpt: 10, perplexity: 5 },
      { date: "2026-09-02", chatgpt: 3, perplexity: 0 },
    ],
    seriesKeys: [{ key: "chatgpt" }, { key: "perplexity" }],
    platforms: [
      { platform: "chatgpt", name: "ChatGPT", sessions: 200, conversions: 10, revenue: 900 },
      { platform: "perplexity", name: "Perplexity", sessions: 100, conversions: 2.345, revenue: 99.999 },
    ],
    hasData: true,
  };
  const row = (key: string, label: string, sessions: number, engaged: number) => ({ key, label, sessions, engagedSessions: engaged, engagementRate: (engaged / sessions) * 100, conversions: 1, revenue: 10 });
  it("maps KPIs, platforms with engagement, pages and the benchmark", () => {
    const h = mapHumanTraffic(
      { provider: "google_analytics", label: "Google Analytics", currency: "EUR" },
      ov,
      [row("chatgpt", "ChatGPT", 200, 150), row("perplexity", "Perplexity", 100, 33)],
      [row("/pricing", "/pricing", 120, 90), row("__unknown__", "(unknown page)", 5, 1)],
      {
        ai: { sessions: 300, engagementRate: 61, avgEngagementSeconds: 80, pagesPerSession: 2.5, conversionRate: 4 },
        organic: { sessions: 5000, engagementRate: 55, avgEngagementSeconds: 60, pagesPerSession: null, conversionRate: 2 },
      },
    )!;
    expect(h).toMatchObject({ provider: "google_analytics", sessions: 300, prevSessions: 200, engagedSessions: 183, conversions: 12.35, revenue: 1000, allSessions: 10000 });
    expect(h.platforms[0]).toEqual({ platform: "chatgpt", name: "ChatGPT", sessions: 200, conversions: 10, revenue: 900, engagementRate: 75 });
    expect(h.platforms[1]!.engagementRate).toBe(33);
    expect(h.pages).toEqual([{ page: "/pricing", sessions: 120, conversions: 1, revenue: 10 }]);
    expect(h.trend).toEqual([
      { date: "2026-09-01", sessions: 15 },
      { date: "2026-09-02", sessions: 3 },
    ]);
    expect(h.benchmark?.organic).toMatchObject({ sessions: 5000, conversionRate: 2, pagesPerSession: null });
  });
  it("is null without data", () => {
    expect(mapHumanTraffic({ provider: "matomo", label: "Matomo", currency: "EUR" }, { ...ov, hasData: false }, [], [], null)).toBeNull();
  });
});

describe("catalog bindings for the new blocks", () => {
  const b = emptyBundle({ id: "p", name: "Acme", domain: "acme.com" });
  it("resolve to empty values / empty charts until the sources are connected", () => {
    expect(resolveToken("bots.visits", { bundle: b }).text).toBe("—");
    expect(resolveToken("attribution.ai_leads", { bundle: b }).text).toBe("—");
    expect(resolveToken("traffic.ai_vs_organic_conversion", { bundle: b }).text).toBe("—");
    for (const key of Object.keys(CHARTS)) expect(resolveChart(key, b), key).not.toBeNull();
    for (const key of ["list.bots", "list.crawled_pages", "list.crawl_errors", "list.ai_platforms", "list.ai_landing_pages", "list.attribution_channels", "list.attribution_ai"]) {
      expect(resolveList(key, b, 5), key).toEqual({ rows: [], empty: LISTS[key]!.empty });
    }
    for (const [key, def] of Object.entries(TABLES)) expect(def.get(b, 5), key).toEqual([]);
  });
  it("formats connected data (currency of the source, durations, ratios)", () => {
    const x = emptyBundle({ id: "p", name: "Acme", domain: "acme.com" });
    x.other.humanTraffic = mapHumanTraffic(
      { provider: "google_analytics", label: "Google Analytics", currency: "USD" },
      {
        kpis: { sessions: 300, conversions: 12, revenue: 1500, prevSessions: 200, prevConversions: 10, prevRevenue: 500, allSessions: 6000 },
        series: [],
        seriesKeys: [],
        platforms: [{ platform: "chatgpt", name: "ChatGPT", sessions: 300, conversions: 12, revenue: 1500 }],
        hasData: true,
      },
      [],
      [],
      {
        ai: { sessions: 300, engagementRate: 61, avgEngagementSeconds: 80, pagesPerSession: 2.5, conversionRate: 4 },
        organic: { sessions: 5000, engagementRate: 55, avgEngagementSeconds: 60, pagesPerSession: 3.25, conversionRate: 2 },
      },
    );
    x.other.aiTraffic = { sessions: 300, conversions: 12, revenue: 1500, prevSessions: 200 };
    expect(resolveToken("traffic.ai_revenue", { bundle: x }).text).toBe("$1,500");
    expect(resolveToken("traffic.ai_share", { bundle: x }).text).toBe("5%");
    expect(resolveToken("traffic.ai_avg_engagement", { bundle: x }).text).toBe("1m 20s");
    expect(resolveToken("traffic.organic_pages_per_session", { bundle: x }).text).toBe("3.25");
    expect(resolveToken("traffic.ai_vs_organic_conversion", { bundle: x }).text).toBe("2×");
    const table = TABLES["table.ai_vs_organic"]!.get(x, 10);
    expect(table[3]!.cells).toEqual(["Conversion rate", "4%", "2%", "+100%"]);
    const chart = resolveChart("traffic.platform_revenue", x);
    expect(chart).toMatchObject({ kind: "categories", format: "currency", currency: "USD", items: [{ label: "ChatGPT", value: 1500 }] });
  });
});
