/**
 * Pure mappers from the analytics / attribution query results to the report data bundle blocks
 * (bot traffic, attribution, AI human traffic). No DB access — unit-tested.
 */
import type { AttributionData, BotTrafficData, HumanTrafficData } from "@/features/reports/lib/bundle";

const round = (v: number, d = 1) => Math.round(v * 10 ** d) / 10 ** d;

/* ───────────────────────────── Bot traffic ───────────────────────────── */

export type BotOverviewLike = {
  totals: { visits: number; prevVisits: number; uniqueUrls: number; prevUniqueUrls: number; ok: number; redirects: number; clientErrors: number; serverErrors: number; verified: number };
  daily: Record<string, string | number>[];
  series: { key: string; label: string }[];
  bots: { bot: string; company: string; visits: number; prevVisits: number; pages: number }[];
  hasAnyData: boolean;
};

export type CrawledPageLike = { path: string; visits: number; bots: string[] };
export type PerformanceRowLike = { path: string; errors: number; breakdown: { status: string; count: number }[] };

/** null when the project never received bot traffic (nothing connected / uploaded). */
export function mapBotTraffic(overview: BotOverviewLike, pages: CrawledPageLike[], perf: PerformanceRowLike[]): BotTrafficData | null {
  if (!overview.hasAnyData) return null;
  const trendBots = overview.series.map((s) => ({ key: s.key, label: s.label }));
  const trend = overview.daily.map((d) => {
    const values: Record<string, number> = {};
    let total = 0;
    for (const s of trendBots) {
      const v = Number(d[s.key]) || 0;
      values[s.key] = v;
      total += v;
    }
    return { date: String(d.date), total, values };
  });
  const errorPages = perf
    .filter((r) => r.errors > 0)
    .map((r) => {
      const worst = r.breakdown.filter((b) => Number(b.status) >= 400).sort((a, b) => b.count - a.count)[0];
      return { path: r.path, status: worst ? Number(worst.status) : 0, hits: r.errors };
    })
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 10);
  return {
    visits: overview.totals.visits,
    prevVisits: overview.totals.prevVisits,
    uniqueUrls: overview.totals.uniqueUrls,
    prevUniqueUrls: overview.totals.prevUniqueUrls,
    ok: overview.totals.ok,
    redirects: overview.totals.redirects,
    clientErrors: overview.totals.clientErrors,
    serverErrors: overview.totals.serverErrors,
    verified: overview.totals.verified,
    bots: overview.bots.slice(0, 12).map((b) => ({ bot: b.bot, company: b.company, visits: b.visits, prevVisits: b.prevVisits, pages: b.pages })),
    trend,
    trendBots,
    topPages: pages.slice(0, 15).map((p) => ({ path: p.path, visits: p.visits, bots: p.bots.length })),
    errorPages,
  };
}

/* ───────────────────────────── Attribution ───────────────────────────── */

export type AttributionSummaryLike = {
  currency: string;
  responses: number;
  aiResponses: number;
  dealValue: number;
  aiDealValue: number;
  previous: { responses: number; aiResponses: number; dealValue: number; aiDealValue: number };
  byChannel: { channel: string; label: string; responses: number; dealValue: number }[];
  byAiDetail: { detail: string; label: string; responses: number; dealValue: number }[];
  conversions: { total: number; merged: number; value: number };
  insights?: { hiddenAiRevenue?: { value: number | null } | null } | null;
};

/** null when the project has never recorded an attribution answer. */
export function mapAttribution(s: AttributionSummaryLike, totalResponsesEver: number): AttributionData | null {
  if (totalResponsesEver <= 0) return null;
  return {
    currency: s.currency,
    responses: s.responses,
    aiResponses: s.aiResponses,
    prevResponses: s.previous.responses,
    prevAiResponses: s.previous.aiResponses,
    dealValue: round(s.dealValue, 2),
    aiDealValue: round(s.aiDealValue, 2),
    prevAiDealValue: round(s.previous.aiDealValue, 2),
    conversionsValue: round(s.conversions.value, 2),
    hiddenAiRevenue: s.insights?.hiddenAiRevenue?.value ?? null,
    byChannel: [...s.byChannel]
      .sort((a, b) => b.responses - a.responses)
      .map((c) => ({ channel: c.channel, label: c.label, responses: c.responses, dealValue: round(c.dealValue, 2), isAi: c.channel === "ai_search" })),
    byAiPlatform: s.byAiDetail.slice(0, 10).map((d) => ({ key: d.detail, label: d.label, responses: d.responses, dealValue: round(d.dealValue, 2) })),
  };
}

/* ───────────────────────────── AI human traffic ───────────────────────────── */

export type TrafficOverviewLike = {
  kpis: { sessions: number; conversions: number; revenue: number; prevSessions: number; prevConversions: number; prevRevenue: number; allSessions: number };
  series: Record<string, string | number>[];
  seriesKeys: { key: string }[];
  platforms: { platform: string; name: string; sessions: number; conversions: number; revenue: number }[];
  hasData: boolean;
};
export type TrafficTableRowLike = { key: string; label: string; sessions: number; engagedSessions: number; engagementRate: number | null; conversions: number; revenue: number };
export type BenchmarkLike = {
  ai: { sessions: number; engagementRate: number | null; avgEngagementSeconds: number | null; pagesPerSession: number | null; conversionRate: number | null };
  organic: { sessions: number; engagementRate: number | null; avgEngagementSeconds: number | null; pagesPerSession: number | null; conversionRate: number | null } | null;
};

export function mapHumanTraffic(
  source: { provider: string; label: string; currency: string },
  overview: TrafficOverviewLike,
  byPlatform: TrafficTableRowLike[],
  byPage: TrafficTableRowLike[],
  benchmark: BenchmarkLike | null,
): HumanTrafficData | null {
  if (!overview.hasData) return null;
  const engagement = new Map(byPlatform.map((r) => [r.key, r]));
  const keys = overview.seriesKeys.map((k) => k.key);
  const pick = (b: BenchmarkLike["ai"]) => ({
    engagementRate: b.engagementRate,
    avgEngagementSeconds: b.avgEngagementSeconds,
    pagesPerSession: b.pagesPerSession,
    conversionRate: b.conversionRate,
  });
  return {
    provider: source.provider,
    providerLabel: source.label,
    currency: source.currency,
    sessions: overview.kpis.sessions,
    prevSessions: overview.kpis.prevSessions,
    engagedSessions: byPlatform.reduce((a, r) => a + r.engagedSessions, 0),
    conversions: round(overview.kpis.conversions, 2),
    prevConversions: round(overview.kpis.prevConversions, 2),
    revenue: round(overview.kpis.revenue, 2),
    prevRevenue: round(overview.kpis.prevRevenue, 2),
    allSessions: overview.kpis.allSessions,
    platforms: overview.platforms.slice(0, 12).map((p) => {
      const e = engagement.get(p.platform);
      return {
        platform: p.platform,
        name: p.name,
        sessions: p.sessions,
        conversions: round(p.conversions, 2),
        revenue: round(p.revenue, 2),
        engagementRate: e?.engagementRate == null ? null : round(e.engagementRate),
      };
    }),
    pages: byPage
      .filter((r) => r.key && r.key !== "__unknown__")
      .slice(0, 15)
      .map((r) => ({ page: r.label, sessions: r.sessions, conversions: round(r.conversions, 2), revenue: round(r.revenue, 2) })),
    trend: overview.series.map((d) => ({ date: String(d.date), sessions: keys.reduce((a, k) => a + (Number(d[k]) || 0), 0) })),
    benchmark: benchmark ? { ai: pick(benchmark.ai), organic: benchmark.organic ? { sessions: benchmark.organic.sessions, ...pick(benchmark.organic) } : null } : null,
  };
}
