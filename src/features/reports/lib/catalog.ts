import { format as formatDate, parseISO } from "date-fns";
import { getCountry } from "@/lib/countries";
import type { DataBundle, Kpis } from "./bundle";
import type { ChartType } from "./types";

/*
 * Live data catalog: every token, chart binding, list source and live table the report builder
 * can insert. Each entry resolves against a DataBundle, so switching project ("one deck, every
 * client") or date range re-resolves the whole deck.
 */

export type ValueFormat =
  | "text"
  | "percent"
  | "number"
  | "compact"
  | "position"
  | "score"
  | "delta_pp"
  | "delta_num"
  | "delta_pos"
  | "delta_pct"
  | "currency"
  | "decimal"
  | "duration";

export type ResolveCtx = {
  bundle: DataBundle | null;
  report?: { title?: string; subtitle?: string | null };
  /** Pre-resolved values (public share pages never receive the raw bundle). */
  resolved?: ResolvedData | null;
};

export type TokenDef = {
  label: string;
  category: string;
  format: ValueFormat;
  description?: string;
  /** For deltas: false when a negative change is good (e.g. position). */
  higherIsBetter?: boolean;
  /** ISO currency of `currency` values (default EUR). */
  currency?: (b: DataBundle) => string | null | undefined;
  get: (b: DataBundle, ctx: ResolveCtx) => string | number | null;
};

const nf = (digits = 0) => new Intl.NumberFormat("en-US", { maximumFractionDigits: digits, minimumFractionDigits: 0 });

/** "45s", "1m 12s", "1h 5m" */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

export function formatValue(value: string | number | null | undefined, format: ValueFormat, currency = "EUR"): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") return value;
  if (!Number.isFinite(value)) return "—";
  switch (format) {
    case "percent":
      return `${nf(1).format(value)}%`;
    case "number":
      return nf(0).format(value);
    case "compact":
      return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
    case "position":
      return `#${nf(1).format(value)}`;
    case "score":
      return nf(0).format(Math.round(value));
    case "delta_pp":
      return `${value > 0 ? "+" : value < 0 ? "−" : "±"}${nf(1).format(Math.abs(value))} pp`;
    case "delta_num":
      return `${value > 0 ? "+" : value < 0 ? "−" : "±"}${nf(0).format(Math.abs(value))}`;
    case "delta_pos":
      return `${value > 0 ? "+" : value < 0 ? "−" : "±"}${nf(1).format(Math.abs(value))}`;
    case "delta_pct":
      return `${value > 0 ? "+" : value < 0 ? "−" : "±"}${nf(1).format(Math.abs(value))}%`;
    case "currency":
      try {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "EUR", maximumFractionDigits: 0 }).format(value);
      } catch {
        return `${nf(0).format(value)} ${currency}`;
      }
    case "decimal":
      return nf(2).format(value);
    case "duration":
      return formatDuration(value);
    default:
      return String(value);
  }
}

const diff = (a: number | null | undefined, b: number | null | undefined) =>
  a === null || a === undefined || b === null || b === undefined ? null : Math.round((a - b) * 10) / 10;
const pctChange = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 1000) / 10 : null);
const fmtDay = (iso: string) => {
  try {
    return formatDate(parseISO(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
};

function kpi(key: keyof Kpis, label: string, format: ValueFormat, category = "AI Visibility", description?: string): Record<string, TokenDef> {
  const deltaFormat: ValueFormat = format === "percent" ? "delta_pp" : format === "position" ? "delta_pos" : "delta_num";
  const lowerBetter = key === "avgPosition";
  const base = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
  return {
    [`ai.${base}`]: { label, category, format, description, get: (b) => b.ai.current[key] },
    [`ai.${base}_delta`]: {
      label: `${label} change`,
      category,
      format: deltaFormat,
      higherIsBetter: !lowerBetter,
      description: `Change vs. previous period`,
      get: (b) => diff(b.ai.current[key], b.ai.previous[key]),
    },
    [`ai.${base}_prev`]: { label: `${label} (previous period)`, category, format, get: (b) => b.ai.previous[key] },
  };
}

const own = (b: DataBundle) => b.ai.brands.find((r) => r.isOwn) ?? null;
const rivals = (b: DataBundle) => b.ai.brands.filter((r) => !r.isOwn);
const leader = (b: DataBundle) => rivals(b)[0] ?? null;

function grade(score: number | null): string | null {
  if (score === null) return null;
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "E";
}

const bt = (b: DataBundle) => b.other.bots ?? null;
const ht = (b: DataBundle) => b.other.humanTraffic ?? null;
const at = (b: DataBundle) => b.other.attribution ?? null;
const shareOf = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 1000) / 10 : null);

export const TOKENS: Record<string, TokenDef> = {
  /* ── General ── */
  "brand.name": { label: "Brand name", category: "General", format: "text", get: (b) => b.project.name },
  "client.name": { label: "Client name", category: "General", format: "text", get: (b) => b.project.clientName },
  "agency.name": { label: "Agency name", category: "General", format: "text", get: (b) => b.agency.name || null },
  "agency.website": { label: "Agency website", category: "General", format: "text", get: (b) => b.agency.website },
  "agency.email": { label: "Agency email", category: "General", format: "text", get: (b) => b.agency.email },
  "project.domain": { label: "Website", category: "General", format: "text", get: (b) => b.project.domain },
  "project.market": {
    label: "Tracking market",
    category: "General",
    format: "text",
    get: (b) => getCountry(b.project.country)?.name ?? b.project.country,
  },
  "report.title": { label: "Report title", category: "General", format: "text", get: (_b, c) => c.report?.title ?? null },
  "report.subtitle": { label: "Report subtitle", category: "General", format: "text", get: (_b, c) => c.report?.subtitle ?? null },
  "report.period": { label: "Reporting period", category: "General", format: "text", get: (b) => b.period.label },
  "report.period_start": { label: "Period start", category: "General", format: "text", get: (b) => fmtDay(b.period.from) },
  "report.period_end": { label: "Period end", category: "General", format: "text", get: (b) => fmtDay(b.period.to) },
  "report.month": {
    label: "Reporting month",
    category: "General",
    format: "text",
    get: (b) => {
      try {
        return formatDate(parseISO(b.period.to), "MMMM yyyy");
      } catch {
        return null;
      }
    },
  },
  "report.date": { label: "Date", category: "General", format: "text", get: (b) => fmtDay(b.generatedAt.slice(0, 10)) },
  "report.days": { label: "Days in period", category: "General", format: "number", get: (b) => b.period.days },

  /* ── AI visibility KPIs ── */
  ...kpi("visibility", "Visibility score", "percent", "AI Visibility", "Answers naming or citing the brand ÷ all answers"),
  ...kpi("mentionRate", "Mention rate", "percent", "AI Visibility", "Answers naming the brand ÷ all answers"),
  ...kpi("citationRate", "Citation rate", "percent", "AI Visibility", "Answers citing an own domain ÷ all answers"),
  ...kpi("avgPosition", "Avg. position", "position", "AI Visibility", "Mean rank among brands named in an answer"),
  ...kpi("sentiment", "Sentiment", "score", "Sentiment", "Mean own-brand sentiment (0–100)"),
  ...kpi("shareOfVoice", "Share of voice", "percent", "Competitors", "Own mentions ÷ all brand mentions"),
  ...kpi("geoScore", "GEO score", "score", "AI Visibility", "Composite: 45% visibility, 25% citation rate, 15% sentiment, 15% position"),
  "ai.geo_grade": { label: "GEO grade", category: "AI Visibility", format: "text", get: (b) => grade(b.ai.current.geoScore) },
  "ai.answers": { label: "AI answers analysed", category: "AI Visibility", format: "number", get: (b) => b.ai.answers },
  "ai.answers_delta": {
    label: "AI answers change",
    category: "AI Visibility",
    format: "delta_num",
    get: (b) => b.ai.answers - b.ai.prevAnswers,
  },
  "ai.mentions": { label: "Answers mentioning brand", category: "AI Visibility", format: "number", get: (b) => b.ai.counts.mentionAnswers },
  "ai.citations": { label: "Citations (own domain)", category: "Citations", format: "number", get: (b) => b.ai.counts.ownCitations },
  "ai.cited_answers": { label: "Answers citing brand", category: "Citations", format: "number", get: (b) => b.ai.counts.citedAnswers },
  "ai.total_citations": { label: "All citations in answers", category: "Citations", format: "number", get: (b) => b.ai.counts.totalCitations },
  "ai.sources": { label: "Distinct cited sources", category: "Citations", format: "number", get: (b) => b.ai.counts.sources },
  "ai.own_citation_share": {
    label: "Own share of citations",
    category: "Citations",
    format: "percent",
    get: (b) => (b.ai.counts.totalCitations ? Math.round((b.ai.counts.ownCitations / b.ai.counts.totalCitations) * 1000) / 10 : null),
  },
  "ai.top_source": { label: "Top cited source", category: "Citations", format: "text", get: (b) => b.ai.sources[0]?.domain ?? null },
  "ai.top_source_type": {
    label: "Top source type",
    category: "Citations",
    format: "text",
    get: (b) => [...b.ai.sourceTypes].sort((x, y) => y.citations - x.citations)[0]?.label ?? null,
  },
  "ai.tracked_prompts": { label: "Tracked prompts", category: "Prompts", format: "number", get: (b) => b.ai.counts.trackedPrompts },
  "ai.prompts_visible": { label: "Prompts where visible", category: "Prompts", format: "number", get: (b) => b.ai.counts.promptsVisible },
  "ai.prompts_invisible": { label: "Prompts where invisible", category: "Prompts", format: "number", get: (b) => b.ai.counts.promptsInvisible },
  "ai.prompt_coverage": {
    label: "Prompt coverage",
    category: "Prompts",
    format: "percent",
    description: "Prompts with at least one visible answer ÷ prompts with answers",
    get: (b) => (b.ai.counts.promptsWithData ? Math.round((b.ai.counts.promptsVisible / b.ai.counts.promptsWithData) * 1000) / 10 : null),
  },
  "ai.top_prompt": {
    label: "Best performing prompt",
    category: "Prompts",
    format: "text",
    get: (b) => [...b.ai.prompts].filter((p) => p.visibility !== null).sort((x, y) => (y.visibility ?? 0) - (x.visibility ?? 0))[0]?.text ?? null,
  },
  "ai.engines": { label: "AI engines tracked", category: "AI Visibility", format: "number", get: (b) => b.ai.counts.engines },
  "ai.best_engine": {
    label: "Best engine",
    category: "AI Visibility",
    format: "text",
    get: (b) => [...b.ai.engines].filter((e) => e.visibility !== null).sort((x, y) => (y.visibility ?? 0) - (x.visibility ?? 0))[0]?.label ?? null,
  },
  "ai.best_engine_visibility": {
    label: "Best engine visibility",
    category: "AI Visibility",
    format: "percent",
    get: (b) => [...b.ai.engines].filter((e) => e.visibility !== null).sort((x, y) => (y.visibility ?? 0) - (x.visibility ?? 0))[0]?.visibility ?? null,
  },
  "ai.worst_engine": {
    label: "Weakest engine",
    category: "AI Visibility",
    format: "text",
    get: (b) => [...b.ai.engines].filter((e) => e.visibility !== null).sort((x, y) => (x.visibility ?? 0) - (y.visibility ?? 0))[0]?.label ?? null,
  },
  "ai.worst_engine_visibility": {
    label: "Weakest engine visibility",
    category: "AI Visibility",
    format: "percent",
    get: (b) => [...b.ai.engines].filter((e) => e.visibility !== null).sort((x, y) => (x.visibility ?? 0) - (y.visibility ?? 0))[0]?.visibility ?? null,
  },

  /* ── Competitors ── */
  "ai.competitors": { label: "Competitors tracked", category: "Competitors", format: "number", get: (b) => b.ai.counts.competitors },
  "ai.rank": {
    label: "Visibility rank",
    category: "Competitors",
    format: "text",
    get: (b) => {
      const idx = b.ai.brands.findIndex((r) => r.isOwn);
      return idx >= 0 && b.ai.answers ? `#${idx + 1}` : null;
    },
  },
  "ai.rank_of": {
    label: "Brands ranked",
    category: "Competitors",
    format: "text",
    get: (b) => (b.ai.brands.length && b.ai.answers ? `of ${b.ai.brands.length}` : null),
  },
  "ai.top_competitor": { label: "Top competitor", category: "Competitors", format: "text", get: (b) => leader(b)?.name ?? null },
  "ai.top_competitor_visibility": {
    label: "Top competitor visibility",
    category: "Competitors",
    format: "percent",
    get: (b) => leader(b)?.visibility ?? null,
  },
  "ai.visibility_gap": {
    label: "Gap to top competitor",
    category: "Competitors",
    format: "delta_pp",
    description: "Own visibility minus the strongest competitor's visibility",
    get: (b) => diff(own(b)?.visibility ?? b.ai.current.visibility, leader(b)?.visibility),
  },
  "ai.leader": { label: "Visibility leader", category: "Competitors", format: "text", get: (b) => (b.ai.answers ? (b.ai.brands[0]?.name ?? null) : null) },

  /* ── Sentiment ── */
  "ai.praise_share": {
    label: "Praise share",
    category: "Sentiment",
    format: "percent",
    get: (b) => {
      const t = b.ai.sentimentMix.praise + b.ai.sentimentMix.neutral + b.ai.sentimentMix.criticism;
      return t ? Math.round((b.ai.sentimentMix.praise / t) * 1000) / 10 : null;
    },
  },
  "ai.criticism_share": {
    label: "Criticism share",
    category: "Sentiment",
    format: "percent",
    get: (b) => {
      const t = b.ai.sentimentMix.praise + b.ai.sentimentMix.neutral + b.ai.sentimentMix.criticism;
      return t ? Math.round((b.ai.sentimentMix.criticism / t) * 1000) / 10 : null;
    },
  },
  "ai.top_praise": { label: "Top praise", category: "Sentiment", format: "text", get: (b) => b.ai.praise[0]?.quote ?? null },
  "ai.top_criticism": { label: "Top criticism", category: "Sentiment", format: "text", get: (b) => b.ai.criticism[0]?.quote ?? null },

  /* ── SEO, traffic & tasks (other modules; null when not connected) ── */
  "seo.audit_score": { label: "Site audit score", category: "SEO & Traffic", format: "score", get: (b) => b.other.audit?.score ?? null },
  "seo.audit_critical": { label: "Critical audit issues", category: "SEO & Traffic", format: "number", get: (b) => b.other.audit?.critical ?? null },
  "seo.audit_pages": { label: "Pages crawled", category: "SEO & Traffic", format: "number", get: (b) => b.other.audit?.pages ?? null },
  "seo.crawlability_score": {
    label: "AI crawlability score",
    category: "SEO & Traffic",
    format: "score",
    get: (b) => b.other.crawlability?.score ?? null,
  },
  "gsc.clicks": { label: "Search clicks", category: "SEO & Traffic", format: "compact", get: (b) => b.other.searchConsole?.clicks ?? null },
  "gsc.clicks_delta": {
    label: "Search clicks change",
    category: "SEO & Traffic",
    format: "delta_pct",
    get: (b) => (b.other.searchConsole ? pctChange(b.other.searchConsole.clicks, b.other.searchConsole.prevClicks) : null),
  },
  "gsc.impressions": {
    label: "Search impressions",
    category: "SEO & Traffic",
    format: "compact",
    get: (b) => b.other.searchConsole?.impressions ?? null,
  },
  /* ── AI traffic: human visitors referred by AI platforms (GA4 / Matomo / Piwik PRO) ── */
  "traffic.ai_sessions": {
    label: "Sessions from AI platforms",
    category: "AI Traffic",
    format: "compact",
    get: (b) => b.other.aiTraffic?.sessions ?? null,
  },
  "traffic.ai_sessions_delta": {
    label: "AI sessions change",
    category: "AI Traffic",
    format: "delta_pct",
    get: (b) => (b.other.aiTraffic ? pctChange(b.other.aiTraffic.sessions, b.other.aiTraffic.prevSessions) : null),
  },
  "traffic.ai_conversions": {
    label: "Conversions from AI",
    category: "AI Traffic",
    format: "number",
    get: (b) => b.other.aiTraffic?.conversions ?? null,
  },
  "traffic.ai_revenue": {
    label: "Revenue from AI",
    category: "AI Traffic",
    format: "currency",
    currency: (b) => ht(b)?.currency,
    get: (b) => b.other.aiTraffic?.revenue ?? null,
  },
  "traffic.ai_revenue_delta": {
    label: "AI revenue change",
    category: "AI Traffic",
    format: "delta_pct",
    get: (b) => (ht(b) ? pctChange(ht(b)!.revenue, ht(b)!.prevRevenue) : null),
  },
  "traffic.ai_share": {
    label: "AI share of all visits",
    category: "AI Traffic",
    format: "percent",
    description: "Sessions referred by AI platforms ÷ all sessions of the site",
    get: (b) => (ht(b) ? shareOf(ht(b)!.sessions, ht(b)!.allSessions) : null),
  },
  "traffic.ai_conversion_rate": {
    label: "AI visitor conversion rate",
    category: "AI Traffic",
    format: "percent",
    get: (b) => ht(b)?.benchmark?.ai.conversionRate ?? null,
  },
  "traffic.ai_engagement_rate": {
    label: "AI visitor engagement rate",
    category: "AI Traffic",
    format: "percent",
    get: (b) => ht(b)?.benchmark?.ai.engagementRate ?? null,
  },
  "traffic.ai_avg_engagement": {
    label: "AI visitor avg. engagement time",
    category: "AI Traffic",
    format: "duration",
    get: (b) => ht(b)?.benchmark?.ai.avgEngagementSeconds ?? null,
  },
  "traffic.ai_pages_per_session": {
    label: "AI visitor pages / session",
    category: "AI Traffic",
    format: "decimal",
    get: (b) => ht(b)?.benchmark?.ai.pagesPerSession ?? null,
  },
  "traffic.organic_sessions": {
    label: "Organic search sessions",
    category: "AI Traffic",
    format: "compact",
    description: "Benchmark: sessions from organic search in the same analytics source",
    get: (b) => ht(b)?.benchmark?.organic?.sessions ?? null,
  },
  "traffic.organic_conversion_rate": {
    label: "Organic conversion rate",
    category: "AI Traffic",
    format: "percent",
    get: (b) => ht(b)?.benchmark?.organic?.conversionRate ?? null,
  },
  "traffic.organic_engagement_rate": {
    label: "Organic engagement rate",
    category: "AI Traffic",
    format: "percent",
    get: (b) => ht(b)?.benchmark?.organic?.engagementRate ?? null,
  },
  "traffic.organic_avg_engagement": {
    label: "Organic avg. engagement time",
    category: "AI Traffic",
    format: "duration",
    get: (b) => ht(b)?.benchmark?.organic?.avgEngagementSeconds ?? null,
  },
  "traffic.organic_pages_per_session": {
    label: "Organic pages / session",
    category: "AI Traffic",
    format: "decimal",
    get: (b) => ht(b)?.benchmark?.organic?.pagesPerSession ?? null,
  },
  "traffic.ai_vs_organic_conversion": {
    label: "AI vs organic conversion",
    category: "AI Traffic",
    format: "text",
    description: "How often AI visitors convert compared with organic search visitors (e.g. 2.1×)",
    get: (b) => {
      const a = ht(b)?.benchmark?.ai.conversionRate;
      const o = ht(b)?.benchmark?.organic?.conversionRate;
      return a != null && o ? `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(a / o)}×` : null;
    },
  },
  "traffic.top_platform": { label: "Top AI traffic source", category: "AI Traffic", format: "text", get: (b) => ht(b)?.platforms[0]?.name ?? null },
  "traffic.top_landing_page": { label: "Top AI landing page", category: "AI Traffic", format: "text", get: (b) => ht(b)?.pages[0]?.page ?? null },
  "traffic.source": { label: "Analytics source", category: "AI Traffic", format: "text", get: (b) => ht(b)?.providerLabel ?? null },

  /* ── AI crawlers (server logs / CDN) ── */
  "bots.visits": {
    label: "AI crawler visits",
    category: "Bot Traffic",
    format: "compact",
    description: "Requests by AI crawlers (GPTBot, ClaudeBot, PerplexityBot …)",
    get: (b) => bt(b)?.visits ?? null,
  },
  "bots.visits_delta": {
    label: "AI crawler visits change",
    category: "Bot Traffic",
    format: "delta_pct",
    get: (b) => (bt(b) ? pctChange(bt(b)!.visits, bt(b)!.prevVisits) : null),
  },
  "bots.pages": { label: "Pages crawled by AI", category: "Bot Traffic", format: "number", get: (b) => bt(b)?.uniqueUrls ?? null },
  "bots.crawlers": { label: "Active AI crawlers", category: "Bot Traffic", format: "number", get: (b) => bt(b)?.bots.length ?? null },
  "bots.top_bot": { label: "Most active AI crawler", category: "Bot Traffic", format: "text", get: (b) => bt(b)?.bots[0]?.bot ?? null },
  "bots.errors": {
    label: "Crawl errors (4xx / 5xx)",
    category: "Bot Traffic",
    format: "number",
    get: (b) => (bt(b) ? bt(b)!.clientErrors + bt(b)!.serverErrors : null),
  },
  "bots.error_rate": {
    label: "Crawl error rate",
    category: "Bot Traffic",
    format: "percent",
    get: (b) => (bt(b) ? shareOf(bt(b)!.clientErrors + bt(b)!.serverErrors, bt(b)!.visits) : null),
  },
  "bots.success_rate": { label: "Crawl success rate (2xx)", category: "Bot Traffic", format: "percent", get: (b) => (bt(b) ? shareOf(bt(b)!.ok, bt(b)!.visits) : null) },

  /* ── Attribution ("How did you hear about us?") ── */
  "attribution.leads": { label: "Attributed leads", category: "Attribution", format: "number", get: (b) => at(b)?.responses ?? null },
  "attribution.ai_leads": { label: "Leads from AI search", category: "Attribution", format: "number", get: (b) => at(b)?.aiResponses ?? null },
  "attribution.ai_leads_delta": {
    label: "AI leads change",
    category: "Attribution",
    format: "delta_num",
    get: (b) => (at(b) ? at(b)!.aiResponses - at(b)!.prevAiResponses : null),
  },
  "attribution.ai_share": {
    label: "AI share of leads",
    category: "Attribution",
    format: "percent",
    get: (b) => (at(b) ? shareOf(at(b)!.aiResponses, at(b)!.responses) : null),
  },
  "attribution.deal_value": { label: "Deal value (all channels)", category: "Attribution", format: "currency", currency: (b) => at(b)?.currency, get: (b) => at(b)?.dealValue ?? null },
  "attribution.ai_deal_value": { label: "Deal value from AI search", category: "Attribution", format: "currency", currency: (b) => at(b)?.currency, get: (b) => at(b)?.aiDealValue ?? null },
  "attribution.ai_deal_value_delta": {
    label: "AI deal value change",
    category: "Attribution",
    format: "delta_pct",
    get: (b) => (at(b) ? pctChange(at(b)!.aiDealValue, at(b)!.prevAiDealValue) : null),
  },
  "attribution.other_deal_value": {
    label: "Deal value from other channels",
    category: "Attribution",
    format: "currency",
    currency: (b) => at(b)?.currency,
    get: (b) => (at(b) ? Math.round((at(b)!.dealValue - at(b)!.aiDealValue) * 100) / 100 : null),
  },
  "attribution.ai_deal_share": {
    label: "AI share of deal value",
    category: "Attribution",
    format: "percent",
    get: (b) => (at(b) ? shareOf(at(b)!.aiDealValue, at(b)!.dealValue) : null),
  },
  "attribution.top_ai_platform": { label: "AI assistant named most", category: "Attribution", format: "text", get: (b) => at(b)?.byAiPlatform[0]?.label ?? null },
  "attribution.hidden_ai_revenue": {
    label: "Hidden AI revenue (estimate)",
    category: "Attribution",
    format: "currency",
    description: "Survey AI share × orders × average order value − AI revenue already attributed by analytics",
    currency: (b) => at(b)?.currency,
    get: (b) => at(b)?.hiddenAiRevenue ?? null,
  },
  "attribution.conversions_value": {
    label: "Matched conversion revenue",
    category: "Attribution",
    format: "currency",
    currency: (b) => at(b)?.currency,
    get: (b) => at(b)?.conversionsValue ?? null,
  },
  "tasks.open": { label: "Open optimization tasks", category: "Tasks", format: "number", get: (b) => b.other.openTasks },
};

/** The fields shown first in the Data panel (finseo order). */
export const FEATURED_TOKENS = [
  "brand.name",
  "report.period",
  "report.date",
  "client.name",
  "agency.name",
  "ai.visibility",
  "ai.citations",
  "ai.tracked_prompts",
];

export function resolveToken(key: string, ctx: ResolveCtx): { value: string | number | null; text: string; def?: TokenDef } {
  const def = TOKENS[key];
  if (!def) return { value: null, text: `{{${key}}}` };
  if (ctx.resolved) {
    const r = ctx.resolved.tokens[key];
    return r ? { value: r.value, text: r.text, def } : { value: null, text: "—", def };
  }
  if (!ctx.bundle) return { value: null, text: "…", def };
  let value: string | number | null = null;
  let currency: string | undefined;
  try {
    value = def.get(ctx.bundle, ctx);
    currency = def.currency?.(ctx.bundle) ?? undefined;
  } catch {
    value = null;
  }
  return { value, text: formatValue(value, def.format, currency), def };
}

/** Sign tone of a delta token: 1 good, -1 bad, 0 neutral. */
export function deltaTone(key: string, value: string | number | null): -1 | 0 | 1 {
  if (typeof value !== "number" || value === 0) return 0;
  const def = TOKENS[key];
  const good = def?.higherIsBetter === false ? value < 0 : value > 0;
  return good ? 1 : -1;
}

/* ───────────────────────────── Charts ───────────────────────────── */

export type ChartSeriesData = {
  kind: "series";
  x: string[];
  series: { key: string; label: string; values: (number | null)[]; isOwn?: boolean }[];
  format: ValueFormat;
  /** ISO currency for `currency` values */
  currency?: string;
};
export type ChartCategoryData = {
  kind: "categories";
  items: { label: string; value: number; isOwn?: boolean }[];
  format: ValueFormat;
  currency?: string;
};
export type ChartData = ChartSeriesData | ChartCategoryData;

export type ChartDef = {
  label: string;
  category: string;
  types: ChartType[];
  defaultType: ChartType;
  description: string;
  get: (b: DataBundle, opts: { limit?: number }) => ChartData;
};

function trendChart(field: "visibility" | "mentionRate" | "citationRate" | "sentiment" | "position", label: string, format: ValueFormat) {
  return (b: DataBundle): ChartData => ({
    kind: "series",
    x: b.ai.trend.map((p) => p.date),
    series: [{ key: field, label, values: b.ai.trend.map((p) => p[field]), isOwn: true }],
    format,
  });
}

const r1 = (v: number) => Math.round(v * 10) / 10;

export const CHARTS: Record<string, ChartDef> = {
  "trend.visibility": {
    label: "Visibility trend",
    category: "Trends",
    types: ["area", "line", "bar"],
    defaultType: "area",
    description: "Daily visibility score over the reporting period",
    get: trendChart("visibility", "Visibility", "percent"),
  },
  "trend.mention_rate": {
    label: "Mention rate trend",
    category: "Trends",
    types: ["area", "line", "bar"],
    defaultType: "line",
    description: "Daily mention rate",
    get: trendChart("mentionRate", "Mention rate", "percent"),
  },
  "trend.citation_rate": {
    label: "Citation rate trend",
    category: "Trends",
    types: ["area", "line", "bar"],
    defaultType: "line",
    description: "Daily citation rate",
    get: trendChart("citationRate", "Citation rate", "percent"),
  },
  "trend.sentiment": {
    label: "Sentiment trend",
    category: "Trends",
    types: ["line", "area", "bar"],
    defaultType: "line",
    description: "Daily own-brand sentiment",
    get: trendChart("sentiment", "Sentiment", "score"),
  },
  "trend.position": {
    label: "Position trend",
    category: "Trends",
    types: ["line", "bar"],
    defaultType: "line",
    description: "Daily average position among named brands",
    get: trendChart("position", "Avg. position", "position"),
  },
  "trend.brands": {
    label: "Visibility vs. competitors",
    category: "Competitors",
    types: ["line", "area"],
    defaultType: "line",
    description: "Daily visibility of your brand and the strongest competitors",
    get: (b, { limit }) => {
      const brands = b.ai.brandTrend.brands.slice(0, limit ?? 4);
      return {
        kind: "series",
        x: b.ai.brandTrend.rows.map((r) => r.date),
        series: brands.map((br) => ({
          key: br.key,
          label: br.name,
          isOwn: br.isOwn,
          values: b.ai.brandTrend.rows.map((r) => r.values[br.key] ?? null),
        })),
        format: "percent",
      };
    },
  },
  "brands.visibility": {
    label: "Competitor ranking",
    category: "Competitors",
    types: ["hbar", "bar", "donut"],
    defaultType: "hbar",
    description: "Visibility by brand (you highlighted)",
    get: (b, { limit }) => ({
      kind: "categories",
      items: b.ai.brands
        .filter((r) => r.visibility !== null)
        .slice(0, limit ?? 8)
        .map((r) => ({ label: r.name, value: r.visibility ?? 0, isOwn: r.isOwn })),
      format: "percent",
    }),
  },
  "brands.mention_rate": {
    label: "Mention rate by brand",
    category: "Competitors",
    types: ["hbar", "bar"],
    defaultType: "hbar",
    description: "Share of answers naming each brand",
    get: (b, { limit }) => ({
      kind: "categories",
      items: [...b.ai.brands]
        .filter((r) => r.mentionRate !== null)
        .sort((x, y) => (y.mentionRate ?? 0) - (x.mentionRate ?? 0))
        .slice(0, limit ?? 8)
        .map((r) => ({ label: r.name, value: r.mentionRate ?? 0, isOwn: r.isOwn })),
      format: "percent",
    }),
  },
  "brands.share_of_voice": {
    label: "Share of voice",
    category: "Competitors",
    types: ["donut", "hbar", "bar"],
    defaultType: "donut",
    description: "Share of all brand mentions",
    get: (b, { limit }) => {
      const rows = [...b.ai.brands].filter((r) => r.mentions > 0).sort((x, y) => y.mentions - x.mentions);
      const top = rows.slice(0, limit ?? 6);
      const rest = rows.slice(limit ?? 6).reduce((s, r) => s + (r.shareOfVoice ?? 0), 0);
      const items = top.map((r) => ({ label: r.name, value: r.shareOfVoice ?? 0, isOwn: r.isOwn }));
      if (rest > 0) items.push({ label: "Others", value: r1(rest), isOwn: false });
      return { kind: "categories", items, format: "percent" };
    },
  },
  "engines.visibility": {
    label: "Engine split",
    category: "AI Visibility",
    types: ["bar", "hbar", "donut"],
    defaultType: "bar",
    description: "Visibility per AI engine",
    get: (b, { limit }) => ({
      kind: "categories",
      items: b.ai.engines
        .filter((e) => e.visibility !== null)
        .slice(0, limit ?? 11)
        .map((e) => ({ label: e.label, value: e.visibility ?? 0 })),
      format: "percent",
    }),
  },
  "engines.answers": {
    label: "Answers per engine",
    category: "AI Visibility",
    types: ["donut", "bar", "hbar"],
    defaultType: "donut",
    description: "How many answers each engine produced",
    get: (b, { limit }) => ({
      kind: "categories",
      items: b.ai.engines.slice(0, limit ?? 11).map((e) => ({ label: e.label, value: e.answers })),
      format: "number",
    }),
  },
  "sources.types": {
    label: "Source types",
    category: "Citations",
    types: ["donut", "hbar", "bar"],
    defaultType: "donut",
    description: "Citations by content type (listicle, UGC, article…)",
    get: (b, { limit }) => ({
      kind: "categories",
      items: [...b.ai.sourceTypes]
        .sort((x, y) => y.citations - x.citations)
        .slice(0, limit ?? 8)
        .map((s) => ({ label: s.label, value: s.citations })),
      format: "number",
    }),
  },
  "sources.top": {
    label: "Top cited sources",
    category: "Citations",
    types: ["hbar", "bar"],
    defaultType: "hbar",
    description: "Most cited domains in AI answers",
    get: (b, { limit }) => ({
      kind: "categories",
      items: b.ai.sources.slice(0, limit ?? 8).map((s) => ({ label: s.domain, value: s.citations, isOwn: s.ownership === "own" })),
      format: "number",
    }),
  },
  "sources.ownership": {
    label: "Citation ownership",
    category: "Citations",
    types: ["donut", "bar"],
    defaultType: "donut",
    description: "Own vs. competitor vs. third-party citations",
    get: (b) => {
      const sum = (o: string) => b.ai.sources.filter((s) => s.ownership === o).reduce((a, s) => a + s.citations, 0);
      return {
        kind: "categories",
        items: [
          { label: "Own", value: sum("own"), isOwn: true },
          { label: "Competitors", value: sum("competitor") },
          { label: "Third-party", value: sum("third_party") },
        ].filter((i) => i.value > 0),
        format: "number",
      };
    },
  },
  "prompts.coverage": {
    label: "Answer coverage",
    category: "Prompts",
    types: ["donut", "bar", "hbar"],
    defaultType: "donut",
    description: "Mentioned + cited, mentioned only, cited only, not visible",
    get: (b) => {
      const c = b.ai.coverage;
      return {
        kind: "categories",
        items: [
          { label: "Mentioned + cited", value: c.mentionedCited, isOwn: true },
          { label: "Mentioned only", value: c.mentionedOnly },
          { label: "Cited only", value: c.citedOnly },
          { label: "Not visible", value: c.notVisible },
        ],
        format: "number",
      };
    },
  },
  "funnel.visibility": {
    label: "Visibility by funnel stage",
    category: "Prompts",
    types: ["bar", "hbar"],
    defaultType: "bar",
    description: "TOFU / MOFU / BOFU visibility",
    get: (b) => ({
      kind: "categories",
      items: b.ai.funnel.filter((f) => f.visibility !== null).map((f) => ({ label: f.label, value: f.visibility ?? 0 })),
      format: "percent",
    }),
  },
  "topics.visibility": {
    label: "Visibility by topic",
    category: "Prompts",
    types: ["hbar", "bar"],
    defaultType: "hbar",
    description: "Visibility per prompt topic",
    get: (b, { limit }) => ({
      kind: "categories",
      items: b.ai.topics
        .filter((t) => t.visibility !== null)
        .slice(0, limit ?? 8)
        .map((t) => ({ label: t.topic, value: t.visibility ?? 0 })),
      format: "percent",
    }),
  },
  "sentiment.mix": {
    label: "Sentiment mix",
    category: "Sentiment",
    types: ["donut", "bar", "hbar"],
    defaultType: "donut",
    description: "Praise / neutral / criticism statements about you",
    get: (b) => ({
      kind: "categories",
      items: [
        { label: "Praise", value: b.ai.sentimentMix.praise, isOwn: true },
        { label: "Neutral", value: b.ai.sentimentMix.neutral },
        { label: "Criticism", value: b.ai.sentimentMix.criticism },
      ],
      format: "number",
    }),
  },
};

/* Bot traffic, AI human traffic and attribution charts (empty until the source is connected). */
const emptySeries = (format: ValueFormat = "number"): ChartSeriesData => ({ kind: "series", x: [], series: [], format });
const emptyCats = (format: ValueFormat = "number"): ChartCategoryData => ({ kind: "categories", items: [], format });

Object.assign(CHARTS, {
  "bots.trend": {
    label: "AI crawler visits by bot",
    category: "Bot Traffic",
    types: ["area", "line", "bar"],
    defaultType: "line",
    description: "Daily visits of the most active AI crawlers",
    get: (b, { limit }) => {
      const x = bt(b);
      if (!x) return emptySeries();
      const keys = x.trendBots.slice(0, limit ?? 6);
      return { kind: "series", x: x.trend.map((t) => t.date), series: keys.map((k) => ({ key: k.key, label: k.label, values: x.trend.map((t) => t.values[k.key] ?? 0) })), format: "number" };
    },
  },
  "bots.total_trend": {
    label: "AI crawler visits trend",
    category: "Bot Traffic",
    types: ["area", "line", "bar"],
    defaultType: "area",
    description: "Daily visits of all AI crawlers",
    get: (b) => {
      const x = bt(b);
      if (!x) return emptySeries();
      return { kind: "series", x: x.trend.map((t) => t.date), series: [{ key: "visits", label: "AI crawler visits", values: x.trend.map((t) => t.total), isOwn: true }], format: "number" };
    },
  },
  "bots.by_bot": {
    label: "Visits per AI crawler",
    category: "Bot Traffic",
    types: ["hbar", "bar", "donut"],
    defaultType: "hbar",
    description: "Which AI crawlers visit most (GPTBot, ClaudeBot, PerplexityBot …)",
    get: (b, { limit }) => {
      const x = bt(b);
      return x ? { kind: "categories", items: x.bots.slice(0, limit ?? 8).map((r) => ({ label: r.bot, value: r.visits })), format: "number" } : emptyCats();
    },
  },
  "bots.status_mix": {
    label: "Crawl status mix",
    category: "Bot Traffic",
    types: ["donut", "bar", "hbar"],
    defaultType: "donut",
    description: "Responses AI crawlers got: OK, redirects, client and server errors",
    get: (b) => {
      const x = bt(b);
      if (!x) return emptyCats();
      return {
        kind: "categories",
        items: [
          { label: "OK (2xx)", value: x.ok, isOwn: true },
          { label: "Redirects (3xx)", value: x.redirects },
          { label: "Client errors (4xx)", value: x.clientErrors },
          { label: "Server errors (5xx)", value: x.serverErrors },
        ].filter((i) => i.value > 0),
        format: "number",
      };
    },
  },
  "traffic.trend": {
    label: "AI visitors trend",
    category: "AI Traffic",
    types: ["area", "line", "bar"],
    defaultType: "area",
    description: "Daily sessions referred by AI platforms",
    get: (b) => {
      const x = ht(b);
      if (!x) return emptySeries();
      return { kind: "series", x: x.trend.map((t) => t.date), series: [{ key: "sessions", label: "AI sessions", values: x.trend.map((t) => t.sessions), isOwn: true }], format: "number" };
    },
  },
  "traffic.platforms": {
    label: "AI visitors by platform",
    category: "AI Traffic",
    types: ["hbar", "donut", "bar"],
    defaultType: "hbar",
    description: "Sessions per AI platform (ChatGPT, Perplexity, Gemini …)",
    get: (b, { limit }) => {
      const x = ht(b);
      return x ? { kind: "categories", items: x.platforms.slice(0, limit ?? 8).map((p) => ({ label: p.name, value: p.sessions })), format: "number" } : emptyCats();
    },
  },
  "traffic.platform_conversions": {
    label: "Conversions by AI platform",
    category: "AI Traffic",
    types: ["hbar", "bar", "donut"],
    defaultType: "hbar",
    description: "Conversions (key events / goals) per AI platform",
    get: (b, { limit }) => {
      const x = ht(b);
      return x
        ? { kind: "categories", items: [...x.platforms].sort((p, q) => q.conversions - p.conversions).slice(0, limit ?? 8).filter((p) => p.conversions > 0).map((p) => ({ label: p.name, value: p.conversions })), format: "number" }
        : emptyCats();
    },
  },
  "traffic.platform_revenue": {
    label: "Revenue by AI platform",
    category: "AI Traffic",
    types: ["hbar", "bar", "donut"],
    defaultType: "hbar",
    description: "Revenue of sessions referred by each AI platform",
    get: (b, { limit }) => {
      const x = ht(b);
      return x
        ? {
            kind: "categories",
            items: [...x.platforms].sort((p, q) => q.revenue - p.revenue).slice(0, limit ?? 8).filter((p) => p.revenue > 0).map((p) => ({ label: p.name, value: p.revenue })),
            format: "currency",
            currency: x.currency,
          }
        : emptyCats("currency");
    },
  },
  "attribution.channels": {
    label: "Leads by channel",
    category: "Attribution",
    types: ["donut", "hbar", "bar"],
    defaultType: "donut",
    description: "Self-reported channel of new leads — AI search highlighted",
    get: (b, { limit }) => {
      const x = at(b);
      return x ? { kind: "categories", items: x.byChannel.slice(0, limit ?? 8).map((c) => ({ label: c.label, value: c.responses, isOwn: c.isAi })), format: "number" } : emptyCats();
    },
  },
  "attribution.deal_value": {
    label: "Deal value by channel",
    category: "Attribution",
    types: ["hbar", "bar", "donut"],
    defaultType: "hbar",
    description: "Deal value of leads per channel — AI search vs. the rest",
    get: (b, { limit }) => {
      const x = at(b);
      return x
        ? {
            kind: "categories",
            items: [...x.byChannel].sort((p, q) => q.dealValue - p.dealValue).filter((c) => c.dealValue > 0).slice(0, limit ?? 8).map((c) => ({ label: c.label, value: c.dealValue, isOwn: c.isAi })),
            format: "currency",
            currency: x.currency,
          }
        : emptyCats("currency");
    },
  },
  "attribution.ai_platforms": {
    label: "Leads by AI assistant",
    category: "Attribution",
    types: ["hbar", "donut", "bar"],
    defaultType: "hbar",
    description: "Which AI assistants leads named (ChatGPT, Perplexity …)",
    get: (b, { limit }) => {
      const x = at(b);
      return x ? { kind: "categories", items: x.byAiPlatform.slice(0, limit ?? 8).map((p) => ({ label: p.label, value: p.responses })), format: "number" } : emptyCats();
    },
  },
} satisfies Record<string, ChartDef>);

export function resolveChart(metric: string, bundle: DataBundle | null, opts: { limit?: number } = {}): ChartData | null {
  const def = CHARTS[metric];
  if (!def || !bundle) return null;
  try {
    return def.get(bundle, opts);
  } catch {
    return null;
  }
}

export function chartIsEmpty(data: ChartData | null): boolean {
  if (!data) return true;
  if (data.kind === "series") return !data.x.length || data.series.every((s) => s.values.every((v) => v === null));
  return !data.items.length || data.items.every((i) => !i.value);
}

/* ───────────────────────────── Lists ───────────────────────────── */

export type ListRow = {
  label: string;
  sub?: string | null;
  value?: string | null;
  /** 0..1 for bar rendering */
  ratio?: number | null;
  highlight?: boolean;
  domain?: string | null;
};

export type ListDef = {
  label: string;
  category: string;
  description: string;
  empty: string;
  get: (b: DataBundle, limit: number) => ListRow[];
};

const ratioOf = (v: number | null | undefined, max: number) => (v === null || v === undefined || !max ? 0 : Math.max(0, Math.min(1, v / max)));

export const LISTS: Record<string, ListDef> = {
  "list.competitors": {
    label: "Top competitors",
    category: "Competitors",
    description: "Brands ranked by visibility (you included)",
    empty: "No competitor data yet",
    get: (b, limit) => {
      const rows = b.ai.brands.filter((r) => r.visibility !== null).slice(0, limit);
      const max = Math.max(1, ...rows.map((r) => r.visibility ?? 0));
      return rows.map((r) => ({
        label: r.name,
        sub: r.domain,
        value: formatValue(r.visibility, "percent"),
        ratio: ratioOf(r.visibility, max),
        highlight: r.isOwn,
        domain: r.domain,
      }));
    },
  },
  "list.rivals": {
    label: "Competitors only",
    category: "Competitors",
    description: "Competitors ranked by visibility (without you)",
    empty: "No competitor data yet",
    get: (b, limit) => {
      const rows = rivals(b).filter((r) => r.visibility !== null).slice(0, limit);
      const max = Math.max(1, ...rows.map((r) => r.visibility ?? 0));
      return rows.map((r) => ({ label: r.name, sub: r.domain, value: formatValue(r.visibility, "percent"), ratio: ratioOf(r.visibility, max), domain: r.domain }));
    },
  },
  "list.sources": {
    label: "Top sources",
    category: "Citations",
    description: "Most cited domains",
    empty: "No citations yet",
    get: (b, limit) => {
      const rows = b.ai.sources.slice(0, limit);
      const max = Math.max(1, ...rows.map((r) => r.citations));
      return rows.map((r) => ({
        label: r.domain,
        sub: r.contentType,
        value: `${formatValue(r.citations, "number")}×`,
        ratio: ratioOf(r.citations, max),
        highlight: r.ownership === "own",
        domain: r.domain,
      }));
    },
  },
  "list.own_pages": {
    label: "Your cited pages",
    category: "Citations",
    description: "Own URLs cited by AI engines",
    empty: "None of your pages were cited yet",
    get: (b, limit) => {
      const rows = b.ai.ownPages.slice(0, limit);
      const max = Math.max(1, ...rows.map((r) => r.citations));
      return rows.map((r) => ({
        label: r.title || r.url.replace(/^https?:\/\/(www\.)?/, ""),
        sub: r.url.replace(/^https?:\/\/(www\.)?/, ""),
        value: `${r.citations}×`,
        ratio: ratioOf(r.citations, max),
      }));
    },
  },
  "list.top_prompts": {
    label: "Top prompts",
    category: "Prompts",
    description: "Prompts where you are most visible",
    empty: "No prompt results yet",
    get: (b, limit) =>
      [...b.ai.prompts]
        .filter((p) => p.visibility !== null && (p.visibility ?? 0) > 0)
        .sort((x, y) => (y.visibility ?? 0) - (x.visibility ?? 0))
        .slice(0, limit)
        .map((p) => ({ label: p.text, sub: p.topic, value: formatValue(p.visibility, "percent"), ratio: (p.visibility ?? 0) / 100 })),
  },
  "list.gap_prompts": {
    label: "Prompt gaps",
    category: "Prompts",
    description: "Prompts where AI never mentions or cites you",
    empty: "No gaps — you are visible on every prompt",
    get: (b, limit) =>
      b.ai.prompts
        .filter((p) => p.category === "none")
        .slice(0, limit)
        .map((p) => ({ label: p.text, sub: p.topic, value: "0%", ratio: 0 })),
  },
  "list.engines": {
    label: "AI engines",
    category: "AI Visibility",
    description: "Visibility per engine",
    empty: "No engine data yet",
    get: (b, limit) =>
      b.ai.engines.slice(0, limit).map((e) => ({ label: e.label, sub: `${e.answers} answers`, value: formatValue(e.visibility, "percent"), ratio: (e.visibility ?? 0) / 100 })),
  },
  "list.topics": {
    label: "Topics",
    category: "Prompts",
    description: "Visibility per topic",
    empty: "No topics yet",
    get: (b, limit) =>
      b.ai.topics.slice(0, limit).map((t) => ({ label: t.topic, sub: `${t.prompts} prompts`, value: formatValue(t.visibility, "percent"), ratio: (t.visibility ?? 0) / 100 })),
  },
  "list.praise": {
    label: "What AI praises",
    category: "Sentiment",
    description: "Positive statements about your brand",
    empty: "No praise extracted yet",
    get: (b, limit) => b.ai.praise.slice(0, limit).map((s) => ({ label: s.quote, sub: s.attribute ?? s.theme })),
  },
  "list.criticism": {
    label: "What AI criticises",
    category: "Sentiment",
    description: "Negative statements about your brand",
    empty: "No criticism extracted yet",
    get: (b, limit) => b.ai.criticism.slice(0, limit).map((s) => ({ label: s.quote, sub: s.attribute ?? s.theme })),
  },
  "list.fanouts": {
    label: "Query fan-outs",
    category: "Prompts",
    description: "Searches AI engines ran while answering",
    empty: "No fan-out queries yet",
    get: (b, limit) => {
      const rows = b.ai.fanouts.slice(0, limit);
      const max = Math.max(1, ...rows.map((r) => r.count));
      return rows.map((r) => ({ label: r.query, value: `${r.count}×`, ratio: ratioOf(r.count, max) }));
    },
  },
  "list.tasks": {
    label: "Open tasks",
    category: "Tasks",
    description: "Highest-priority optimization tasks",
    empty: "No open tasks",
    get: (b, limit) =>
      (b.other.tasks ?? []).slice(0, limit).map((t) => ({
        label: t.title,
        sub: t.category.replace(/_/g, " "),
        value: t.impact >= 7 ? "High impact" : t.impact >= 4 ? "Medium" : "Low",
        ratio: t.impact / 10,
      })),
  },
};

const plainPath = (p: string) => p.replace(/^https?:\/\/(www\.)?/, "") || "/";

Object.assign(LISTS, {
  "list.bots": {
    label: "AI crawlers",
    category: "Bot Traffic",
    description: "AI crawlers by visits",
    empty: "No AI crawler visits in this period",
    get: (b, limit) => {
      const rows = (bt(b)?.bots ?? []).slice(0, limit);
      const max = Math.max(1, ...rows.map((r) => r.visits));
      return rows.map((r) => ({ label: r.bot, sub: r.company || null, value: formatValue(r.visits, "compact"), ratio: ratioOf(r.visits, max) }));
    },
  },
  "list.crawled_pages": {
    label: "Most crawled pages",
    category: "Bot Traffic",
    description: "Pages AI crawlers requested most",
    empty: "No pages crawled by AI bots in this period",
    get: (b, limit) => {
      const rows = (bt(b)?.topPages ?? []).slice(0, limit);
      const max = Math.max(1, ...rows.map((r) => r.visits));
      return rows.map((r) => ({ label: plainPath(r.path), sub: `${r.bots} crawler${r.bots === 1 ? "" : "s"}`, value: `${formatValue(r.visits, "number")}×`, ratio: ratioOf(r.visits, max) }));
    },
  },
  "list.crawl_errors": {
    label: "Crawl errors",
    category: "Bot Traffic",
    description: "Pages that returned 4xx / 5xx to AI crawlers",
    empty: "No crawl errors — AI crawlers got clean responses",
    get: (b, limit) =>
      (bt(b)?.errorPages ?? []).slice(0, limit).map((r) => ({ label: plainPath(r.path), sub: r.status ? `HTTP ${r.status}` : "Error", value: `${formatValue(r.hits, "number")}×` })),
  },
  "list.ai_platforms": {
    label: "AI visitors by platform",
    category: "AI Traffic",
    description: "Sessions and conversions per AI platform",
    empty: "No AI-referred visitors in this period",
    get: (b, limit) => {
      const rows = (ht(b)?.platforms ?? []).slice(0, limit);
      const max = Math.max(1, ...rows.map((r) => r.sessions));
      return rows.map((r) => ({
        label: r.name,
        sub: `${formatValue(r.conversions, "number")} conversions${r.revenue ? ` · ${formatValue(r.revenue, "currency", ht(b)?.currency)}` : ""}`,
        value: formatValue(r.sessions, "compact"),
        ratio: ratioOf(r.sessions, max),
      }));
    },
  },
  "list.ai_landing_pages": {
    label: "Top AI landing pages",
    category: "AI Traffic",
    description: "Pages where AI-referred visitors land",
    empty: "No AI landing pages in this period",
    get: (b, limit) => {
      const rows = (ht(b)?.pages ?? []).slice(0, limit);
      const max = Math.max(1, ...rows.map((r) => r.sessions));
      return rows.map((r) => ({ label: plainPath(r.page), sub: `${formatValue(r.conversions, "number")} conversions`, value: formatValue(r.sessions, "compact"), ratio: ratioOf(r.sessions, max) }));
    },
  },
  "list.attribution_channels": {
    label: "Leads by channel",
    category: "Attribution",
    description: "Where new leads say they heard about you",
    empty: "No attribution answers in this period",
    get: (b, limit) => {
      const x = at(b);
      const rows = (x?.byChannel ?? []).slice(0, limit);
      const max = Math.max(1, ...rows.map((r) => r.responses));
      return rows.map((r) => ({
        label: r.label,
        sub: r.dealValue ? formatValue(r.dealValue, "currency", x?.currency) : null,
        value: formatValue(r.responses, "number"),
        ratio: ratioOf(r.responses, max),
        highlight: r.isAi,
      }));
    },
  },
  "list.attribution_ai": {
    label: "AI assistants named by leads",
    category: "Attribution",
    description: "AI assistants leads credited (ChatGPT, Perplexity …)",
    empty: "No leads credited AI search in this period",
    get: (b, limit) => {
      const x = at(b);
      const rows = (x?.byAiPlatform ?? []).slice(0, limit);
      const max = Math.max(1, ...rows.map((r) => r.responses));
      return rows.map((r) => ({
        label: r.label,
        sub: r.dealValue ? formatValue(r.dealValue, "currency", x?.currency) : null,
        value: formatValue(r.responses, "number"),
        ratio: ratioOf(r.responses, max),
      }));
    },
  },
} satisfies Record<string, ListDef>);

export function resolveList(source: string, bundle: DataBundle | null, limit: number): { rows: ListRow[]; empty: string } {
  const def = LISTS[source];
  if (!def) return { rows: [], empty: "Unknown list" };
  if (!bundle) return { rows: [], empty: "Loading…" };
  try {
    return { rows: def.get(bundle, limit), empty: def.empty };
  } catch {
    return { rows: [], empty: def.empty };
  }
}

/* ───────────────────────────── Live tables ───────────────────────────── */

export type TableDef = {
  label: string;
  columns: string[];
  align: ("left" | "right")[];
  get: (b: DataBundle, limit: number) => { cells: string[]; highlight?: boolean }[];
};

export const TABLES: Record<string, TableDef> = {
  "table.competitors": {
    label: "Competitor benchmark",
    columns: ["Brand", "Visibility", "Mention rate", "Position", "Sentiment"],
    align: ["left", "right", "right", "right", "right"],
    get: (b, limit) =>
      b.ai.brands.slice(0, limit).map((r) => ({
        cells: [
          r.name,
          formatValue(r.visibility, "percent"),
          formatValue(r.mentionRate, "percent"),
          formatValue(r.avgPosition, "position"),
          formatValue(r.sentiment, "score"),
        ],
        highlight: r.isOwn,
      })),
  },
  "table.engines": {
    label: "Engine breakdown",
    columns: ["Engine", "Answers", "Visibility", "Mention rate", "Citation rate"],
    align: ["left", "right", "right", "right", "right"],
    get: (b, limit) =>
      b.ai.engines.slice(0, limit).map((e) => ({
        cells: [e.label, formatValue(e.answers, "number"), formatValue(e.visibility, "percent"), formatValue(e.mentionRate, "percent"), formatValue(e.citationRate, "percent")],
      })),
  },
  "table.prompts": {
    label: "Prompt performance",
    columns: ["Prompt", "Visibility", "Mention rate", "Citation rate"],
    align: ["left", "right", "right", "right"],
    get: (b, limit) =>
      [...b.ai.prompts]
        .sort((x, y) => (y.visibility ?? -1) - (x.visibility ?? -1))
        .slice(0, limit)
        .map((p) => ({
          cells: [p.text, formatValue(p.visibility, "percent"), formatValue(p.mentionRate, "percent"), formatValue(p.citationRate, "percent")],
        })),
  },
  "table.sources": {
    label: "Source analysis",
    columns: ["Source", "Type", "Citations", "Prompts"],
    align: ["left", "left", "right", "right"],
    get: (b, limit) =>
      b.ai.sources.slice(0, limit).map((s) => ({
        cells: [s.domain, s.contentType, formatValue(s.citations, "number"), formatValue(s.prompts, "number")],
        highlight: s.ownership === "own",
      })),
  },
  "table.tasks": {
    label: "Action plan",
    columns: ["Task", "Category", "Impact", "Effort"],
    align: ["left", "left", "right", "right"],
    get: (b, limit) =>
      (b.other.tasks ?? []).slice(0, limit).map((t) => ({
        cells: [t.title, t.category.replace(/_/g, " "), `${t.impact}/10`, `${t.effort}/10`],
      })),
  },
};

const pctText = (v: number | null | undefined) => formatValue(v ?? null, "percent");

Object.assign(TABLES, {
  "table.bots": {
    label: "AI crawler breakdown",
    columns: ["Crawler", "Company", "Visits", "Change", "Pages"],
    align: ["left", "left", "right", "right", "right"],
    get: (b, limit) =>
      (bt(b)?.bots ?? []).slice(0, limit).map((r) => ({
        cells: [r.bot, r.company || "—", formatValue(r.visits, "number"), formatValue(pctChange(r.visits, r.prevVisits), "delta_pct"), formatValue(r.pages, "number")],
      })),
  },
  "table.crawl_errors": {
    label: "Crawl errors",
    columns: ["Page", "Status", "Hits"],
    align: ["left", "right", "right"],
    get: (b, limit) => (bt(b)?.errorPages ?? []).slice(0, limit).map((r) => ({ cells: [plainPath(r.path), r.status ? String(r.status) : "—", formatValue(r.hits, "number")] })),
  },
  "table.ai_traffic": {
    label: "AI visitors by platform",
    columns: ["Platform", "Sessions", "Engagement", "Conversions", "Revenue"],
    align: ["left", "right", "right", "right", "right"],
    get: (b, limit) => {
      const x = ht(b);
      return (x?.platforms ?? []).slice(0, limit).map((r) => ({
        cells: [r.name, formatValue(r.sessions, "number"), pctText(r.engagementRate), formatValue(r.conversions, "number"), formatValue(r.revenue, "currency", x?.currency)],
      }));
    },
  },
  "table.ai_landing_pages": {
    label: "Top AI landing pages",
    columns: ["Page", "Sessions", "Conversions", "Revenue"],
    align: ["left", "right", "right", "right"],
    get: (b, limit) => {
      const x = ht(b);
      return (x?.pages ?? []).slice(0, limit).map((r) => ({
        cells: [plainPath(r.page), formatValue(r.sessions, "number"), formatValue(r.conversions, "number"), formatValue(r.revenue, "currency", x?.currency)],
      }));
    },
  },
  "table.ai_vs_organic": {
    label: "AI vs organic engagement",
    columns: ["Metric", "AI visitors", "Organic search", "Difference"],
    align: ["left", "right", "right", "right"],
    get: (b) => {
      const bm = ht(b)?.benchmark;
      if (!bm) return [];
      const rows: [string, number | null, number | null, ValueFormat][] = [
        ["Engagement rate", bm.ai.engagementRate, bm.organic?.engagementRate ?? null, "percent"],
        ["Avg. engagement time", bm.ai.avgEngagementSeconds, bm.organic?.avgEngagementSeconds ?? null, "duration"],
        ["Pages / session", bm.ai.pagesPerSession, bm.organic?.pagesPerSession ?? null, "decimal"],
        ["Conversion rate", bm.ai.conversionRate, bm.organic?.conversionRate ?? null, "percent"],
      ];
      return rows.map(([label, a, o, f]) => ({
        cells: [label, formatValue(a, f), bm.organic ? formatValue(o, f) : "not available", a !== null && o ? formatValue(Math.round(((a - o) / o) * 1000) / 10, "delta_pct") : "—"],
      }));
    },
  },
  "table.attribution": {
    label: "Attribution by channel",
    columns: ["Channel", "Leads", "Share", "Deal value"],
    align: ["left", "right", "right", "right"],
    get: (b, limit) => {
      const x = at(b);
      if (!x) return [];
      return x.byChannel.slice(0, limit).map((c) => ({
        cells: [c.label, formatValue(c.responses, "number"), pctText(shareOf(c.responses, x.responses)), formatValue(c.dealValue, "currency", x.currency)],
        highlight: c.isAi,
      }));
    },
  },
} satisfies Record<string, TableDef>);

/** Replaces {{token}} placeholders in a plain string. */
export function interpolate(text: string, ctx: ResolveCtx): string {
  return text.replace(/\{\{\s*([a-z][a-z0-9_.]*)\s*\}\}/g, (_m, key: string) => resolveToken(key, ctx).text);
}

export const TOKEN_CATEGORIES = ["General", "AI Visibility", "Competitors", "Citations", "Prompts", "Sentiment", "SEO & Traffic", "AI Traffic", "Bot Traffic", "Attribution", "Tasks"];

/* ───────────────────────────── Pre-resolved data (public shares) ───────────────────────────── */

export type ResolvedData = {
  tokens: Record<string, { value: string | number | null; text: string }>;
  charts: Record<string, ChartData | null>;
  lists: Record<string, { rows: ListRow[]; empty: string }>;
  tables: Record<string, { cells: string[]; highlight?: boolean }[]>;
  images: { agencyLogo: string | null; clientLogo: string | null };
  meta: { clientName: string; periodLabel: string };
};

const chartKey = (metric: string, limit?: number) => `${metric}|${limit ?? ""}`;
const listKey = (source: string, limit: number) => `${source}|${limit}`;

/** True when the context can resolve data (bundle or pre-resolved map). */
export function hasData(ctx: ResolveCtx): boolean {
  return !!(ctx.bundle || ctx.resolved);
}

export function chartFor(ctx: ResolveCtx, metric: string, opts: { limit?: number } = {}): ChartData | null {
  if (ctx.resolved) return ctx.resolved.charts[chartKey(metric, opts.limit)] ?? null;
  return resolveChart(metric, ctx.bundle, opts);
}

export function listFor(ctx: ResolveCtx, source: string, limit: number): { rows: ListRow[]; empty: string } {
  if (ctx.resolved) return ctx.resolved.lists[listKey(source, limit)] ?? { rows: [], empty: LISTS[source]?.empty ?? "" };
  return resolveList(source, ctx.bundle, limit);
}

export function tableFor(ctx: ResolveCtx, source: string, limit: number): { cells: string[]; highlight?: boolean }[] {
  if (ctx.resolved) return ctx.resolved.tables[listKey(source, limit)] ?? [];
  const def = TABLES[source];
  if (!def || !ctx.bundle) return [];
  try {
    return def.get(ctx.bundle, limit);
  } catch {
    return [];
  }
}

export function logoFor(ctx: ResolveCtx, token: "agency.logo" | "client.logo"): string | null {
  if (ctx.resolved) return token === "agency.logo" ? ctx.resolved.images.agencyLogo : ctx.resolved.images.clientLogo;
  return (token === "agency.logo" ? ctx.bundle?.agency.logo : ctx.bundle?.project.clientLogo) ?? null;
}

type DeckLike = {
  slides: {
    notes?: string;
    background: { image?: { kind: string; token?: string } };
    elements: import("./types").SlideElement[];
  }[];
};

const TOKEN_RE = /\{\{\s*([a-z][a-z0-9_.]*)\s*\}\}/g;

/**
 * Resolves exactly the values a deck references (tokens, chart/list/table bindings, logos) so a
 * public share page can render without receiving the project's full data bundle.
 */
export function resolveDeckData(deck: DeckLike, ctx: ResolveCtx): ResolvedData {
  const tokens = new Set<string>(["client.name", "report.period"]);
  const charts = new Map<string, { metric: string; limit?: number }>();
  const lists = new Map<string, { source: string; limit: number }>();
  const tables = new Map<string, { source: string; limit: number }>();
  const addText = (text: string | undefined) => {
    for (const m of (text ?? "").matchAll(TOKEN_RE)) tokens.add(m[1]!);
  };
  for (const slide of deck.slides) {
    addText(slide.notes);
    for (const el of slide.elements) {
      switch (el.type) {
        case "text":
          for (const p of el.paragraphs) for (const r of p.runs) if (r.token) tokens.add(r.token);
          break;
        case "kpi":
          tokens.add(el.metric);
          if (el.deltaMetric) tokens.add(el.deltaMetric);
          addText(el.label);
          if (el.sparkline) charts.set(chartKey(el.sparkline), { metric: el.sparkline });
          break;
        case "score":
          tokens.add(el.metric);
          addText(el.label);
          break;
        case "chart":
          charts.set(chartKey(el.metric, el.options.limit), { metric: el.metric, limit: el.options.limit });
          break;
        case "list":
          lists.set(listKey(el.source, el.limit), { source: el.source, limit: el.limit });
          break;
        case "table":
          if (el.mode === "live" && el.source) tables.set(listKey(el.source, el.limit), { source: el.source, limit: el.limit });
          else for (const row of el.rows) for (const cell of row) addText(cell);
          break;
      }
    }
  }
  const out: ResolvedData = {
    tokens: {},
    charts: {},
    lists: {},
    tables: {},
    images: { agencyLogo: logoFor({ ...ctx, resolved: null }, "agency.logo"), clientLogo: logoFor({ ...ctx, resolved: null }, "client.logo") },
    meta: { clientName: ctx.bundle?.project.clientName ?? "", periodLabel: ctx.bundle?.period.label ?? "" },
  };
  const base: ResolveCtx = { ...ctx, resolved: null };
  for (const key of tokens) {
    if (!TOKENS[key]) continue;
    const r = resolveToken(key, base);
    out.tokens[key] = { value: r.value, text: r.text };
  }
  for (const [k, c] of charts) out.charts[k] = resolveChart(c.metric, ctx.bundle, { limit: c.limit });
  for (const [k, l] of lists) out.lists[k] = resolveList(l.source, ctx.bundle, l.limit);
  for (const [k, t] of tables) out.tables[k] = tableFor(base, t.source, t.limit);
  return out;
}
