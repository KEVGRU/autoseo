/**
 * AI visitors vs. organic search visitors — engagement benchmark (pure, unit-tested).
 * Inputs are period totals of the AI-referred rows and of the organic-search channel rows.
 */

export type EngagementTotals = {
  sessions: number;
  engagedSessions: number;
  engagementSeconds: number;
  /** null = page views not reported by the connector */
  pageviews: number | null;
  convertedSessions: number;
  conversions: number;
  revenue: number;
};

export type EngagementStats = {
  sessions: number;
  engagementRate: number | null;
  avgEngagementSeconds: number | null;
  pagesPerSession: number | null;
  conversionRate: number | null;
  conversions: number;
  revenue: number;
  revenuePerSession: number | null;
};

export type BenchmarkMetricKey = "engagementRate" | "avgEngagementSeconds" | "pagesPerSession" | "conversionRate" | "revenuePerSession";

export type BenchmarkMetric = {
  key: BenchmarkMetricKey;
  label: string;
  format: "percent" | "seconds" | "decimal" | "currency";
  ai: number | null;
  organic: number | null;
  /** Relative difference of AI vs organic in % ((ai − organic) ÷ organic); null when not comparable. */
  diffPct: number | null;
  /** Which side performs better (all metrics: higher is better). */
  leader: "ai" | "organic" | "tie" | null;
};

const round = (v: number, digits = 1) => Math.round(v * 10 ** digits) / 10 ** digits;

export function engagementStats(t: EngagementTotals): EngagementStats {
  const s = t.sessions;
  return {
    sessions: s,
    engagementRate: s > 0 ? round((t.engagedSessions / s) * 100) : null,
    avgEngagementSeconds: s > 0 ? round(t.engagementSeconds / s) : null,
    pagesPerSession: s > 0 && t.pageviews !== null && t.pageviews > 0 ? round(t.pageviews / s, 2) : null,
    conversionRate: s > 0 ? round((Math.min(t.convertedSessions, s) / s) * 100, 2) : null,
    conversions: round(t.conversions, 2),
    revenue: round(t.revenue, 2),
    revenuePerSession: s > 0 ? round(t.revenue / s, 2) : null,
  };
}

const METRICS: { key: BenchmarkMetricKey; label: string; format: BenchmarkMetric["format"] }[] = [
  { key: "engagementRate", label: "Engagement rate", format: "percent" },
  { key: "avgEngagementSeconds", label: "Avg. engagement time", format: "seconds" },
  { key: "pagesPerSession", label: "Pages / session", format: "decimal" },
  { key: "conversionRate", label: "Conversion rate", format: "percent" },
  { key: "revenuePerSession", label: "Revenue / session", format: "currency" },
];

/** Side-by-side metrics; `organic` null (not available) keeps the AI values and leaves the comparison empty. */
export function compareEngagement(ai: EngagementStats, organic: EngagementStats | null): BenchmarkMetric[] {
  return METRICS.map((m) => {
    const a = ai[m.key];
    const o = organic ? organic[m.key] : null;
    const comparable = a !== null && o !== null;
    const diffPct = comparable && o !== 0 ? round(((a - o) / Math.abs(o)) * 100) : null;
    const leader = !comparable ? null : Math.abs(a - o) < 1e-9 ? "tie" : a > o ? "ai" : "organic";
    return { key: m.key, label: m.label, format: m.format, ai: a, organic: o, diffPct, leader };
  });
}

/** One-sentence takeaway ("AI visitors convert 2.1× as often as organic visitors."), or null. */
export function benchmarkHeadline(metrics: BenchmarkMetric[]): string | null {
  const conv = metrics.find((m) => m.key === "conversionRate");
  const eng = metrics.find((m) => m.key === "engagementRate");
  const pick = conv && conv.ai !== null && conv.organic ? conv : eng && eng.ai !== null && eng.organic ? eng : null;
  if (!pick || pick.ai === null || !pick.organic) return null;
  const ratio = pick.ai / pick.organic;
  const what = pick.key === "conversionRate" ? "convert" : "engage";
  if (Math.abs(ratio - 1) < 0.05) return `AI visitors ${what} about as often as organic search visitors.`;
  if (ratio >= 1.15) return `AI visitors ${what} ${round(ratio, 1)}× as often as organic search visitors.`;
  if (ratio > 1) return `AI visitors ${what} ${round((ratio - 1) * 100)}% more often than organic search visitors.`;
  return `AI visitors ${what} ${round((1 - ratio) * 100)}% less often than organic search visitors.`;
}
