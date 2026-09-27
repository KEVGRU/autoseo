/**
 * Alert kind catalogue (isomorphic): labels, parameter defaults and the default rule set.
 * The evaluators live in src/server/alerts/evaluate.ts.
 */
import type { AlertChannels, AlertKind, AlertParams } from "@/server/db/schema/alerts";

export type AlertParamField = "threshold" | "windowDays" | "engines" | "tags" | "minSeverity";

export type AlertKindGroup = "AI visibility" | "Competitors & market" | "Sentiment" | "Sources & fact check" | "Crawlers & traffic" | "Tracking";

export type AlertKindMeta = {
  label: string;
  description: string;
  group: AlertKindGroup;
  /** Label + unit of `threshold` (absent = the kind has no threshold). */
  threshold?: { label: string; unit: string; min: number; max: number; step: number; help: string };
  defaults: { threshold?: number; windowDays: number; cooldownHours: number };
  fields: AlertParamField[];
  /** Data the evaluator needs (shown in the rule dialog). */
  source: string;
  /** Page (relative to /p/{projectId}) to investigate. */
  path: string;
};

export const ALERT_KIND_META: Record<AlertKind, AlertKindMeta> = {
  visibility_drop: {
    label: "Visibility drop",
    description: "AI visibility (answers naming or citing your brand) fell versus the previous window.",
    group: "AI visibility",
    threshold: { label: "Drop of at least", unit: "pp", min: 1, max: 100, step: 1, help: "Percentage points, e.g. 41% → 30% is an 11 pp drop." },
    defaults: { threshold: 10, windowDays: 7, cooldownHours: 24 },
    fields: ["threshold", "windowDays", "engines", "tags"],
    source: "AI tracking answers",
    path: "/ai/tracker",
  },
  sov_drop: {
    label: "Share of voice drop",
    description: "Your share of all brand mentions (you + tracked competitors) fell.",
    group: "AI visibility",
    threshold: { label: "Drop of at least", unit: "pp", min: 1, max: 100, step: 1, help: "Percentage points of share of voice." },
    defaults: { threshold: 5, windowDays: 7, cooldownHours: 24 },
    fields: ["threshold", "windowDays", "engines", "tags"],
    source: "AI tracking answers",
    path: "/ai/competitors",
  },
  position_drop: {
    label: "Position drop",
    description: "Your average position among the brands named in answers got worse.",
    group: "AI visibility",
    threshold: { label: "Worse by at least", unit: "positions", min: 0.1, max: 20, step: 0.1, help: "Average position (1 = named first); e.g. 2.1 → 3.4 is 1.3 positions worse." },
    defaults: { threshold: 1, windowDays: 7, cooldownHours: 24 },
    fields: ["threshold", "windowDays", "engines", "tags"],
    source: "AI tracking answers",
    path: "/ai/tracker",
  },
  competitor_overtake: {
    label: "Competitor overtakes you",
    description: "A tracked competitor is now mentioned in more answers than your brand (it was behind before).",
    group: "Competitors & market",
    threshold: { label: "Lead of at least", unit: "pp", min: 0, max: 50, step: 1, help: "How far ahead (mention rate, percentage points) the competitor must be." },
    defaults: { threshold: 0, windowDays: 7, cooldownHours: 24 },
    fields: ["threshold", "windowDays", "engines", "tags"],
    source: "AI tracking answers",
    path: "/ai/competitors",
  },
  new_competitor: {
    label: "New competitor",
    description: "A brand you don't track started appearing in AI answers (or was auto-added as a competitor).",
    group: "Competitors & market",
    threshold: { label: "Named in at least", unit: "answers", min: 1, max: 100, step: 1, help: "Answers in the window that must name the new brand." },
    defaults: { threshold: 2, windowDays: 7, cooldownHours: 6 },
    fields: ["threshold", "windowDays", "engines", "tags"],
    source: "AI tracking answers",
    path: "/ai/competitors",
  },
  sentiment_drop: {
    label: "Sentiment drop",
    description: "Average sentiment about your brand (0–100) fell.",
    group: "Sentiment",
    threshold: { label: "Drop of at least", unit: "points", min: 1, max: 100, step: 1, help: "Sentiment points on the 0–100 scale." },
    defaults: { threshold: 10, windowDays: 7, cooldownHours: 24 },
    fields: ["threshold", "windowDays", "engines", "tags"],
    source: "AI tracking answers (analysis pass)",
    path: "/ai/sentiment",
  },
  criticism_spike: {
    label: "Criticism spike",
    description: "More negative statements about your brand than in the previous window.",
    group: "Sentiment",
    threshold: { label: "Increase of at least", unit: "%", min: 10, max: 1000, step: 10, help: "Relative increase of criticism statements (min. 3 statements)." },
    defaults: { threshold: 50, windowDays: 7, cooldownHours: 24 },
    fields: ["threshold", "windowDays", "engines", "tags"],
    source: "AI tracking answers (analysis pass)",
    path: "/ai/sentiment",
  },
  new_ad: {
    label: "New ad",
    description: "A new ad (competitor or third party) appeared next to AI answers.",
    group: "Competitors & market",
    defaults: { windowDays: 7, cooldownHours: 6 },
    fields: ["windowDays", "engines"],
    source: "AI tracking answers with ads (e.g. ChatGPT, Perplexity, Google AI Mode)",
    path: "/ai/ads",
  },
  citation_lost: {
    label: "Citation lost",
    description: "One of your pages was cited in the previous window but not anymore.",
    group: "Sources & fact check",
    threshold: { label: "Previously cited at least", unit: "times", min: 1, max: 100, step: 1, help: "Citations in the previous window before a loss counts." },
    defaults: { threshold: 2, windowDays: 7, cooldownHours: 24 },
    fields: ["threshold", "windowDays", "engines", "tags"],
    source: "AI tracking citations",
    path: "/ai/sources",
  },
  fact_check_deviation: {
    label: "Fact-check deviation",
    description: "AI engines state something that contradicts your label, is off-label, unsupported, outdated or breaks one of your fact-check rules.",
    group: "Sources & fact check",
    defaults: { windowDays: 7, cooldownHours: 1 },
    fields: ["windowDays", "engines", "minSeverity"],
    source: "Fact Check (assets with reference documents)",
    path: "/fact-check/findings",
  },
  crawler_missing: {
    label: "AI crawler missing",
    description: "An AI crawler that visited your site before has stopped coming.",
    group: "Crawlers & traffic",
    threshold: { label: "Previously at least", unit: "visits", min: 1, max: 10000, step: 1, help: "Visits in the previous window before an absence counts." },
    defaults: { threshold: 5, windowDays: 7, cooldownHours: 24 },
    fields: ["threshold", "windowDays"],
    source: "Bot Traffic (server logs or CDN integration)",
    path: "/analytics/bots",
  },
  bot_error_spike: {
    label: "Bot error spike",
    description: "AI crawlers get more error responses (HTTP 4xx/5xx) than before.",
    group: "Crawlers & traffic",
    threshold: { label: "Error rate of at least", unit: "%", min: 1, max: 100, step: 1, help: "Share of AI crawler requests answered with 4xx/5xx (min. 20 requests, +5 pp vs before)." },
    defaults: { threshold: 10, windowDays: 7, cooldownHours: 24 },
    fields: ["threshold", "windowDays"],
    source: "Bot Traffic (server logs or CDN integration)",
    path: "/analytics/bots",
  },
  ai_traffic_drop: {
    label: "AI traffic drop",
    description: "Sessions referred by AI platforms (ChatGPT, Perplexity, Gemini …) fell.",
    group: "Crawlers & traffic",
    threshold: { label: "Drop of at least", unit: "%", min: 5, max: 100, step: 5, help: "Relative drop in AI-referred sessions (min. 20 sessions before)." },
    defaults: { threshold: 30, windowDays: 7, cooldownHours: 24 },
    fields: ["threshold", "windowDays"],
    source: "Human Traffic (Google Analytics, Matomo or Piwik PRO)",
    path: "/analytics/traffic",
  },
  run_failed: {
    label: "Tracking run failed",
    description: "An AI tracking run failed, or too many of its prompts × engines errored.",
    group: "Tracking",
    threshold: { label: "Partial runs with at least", unit: "% failed", min: 1, max: 100, step: 1, help: "Partial runs alert when this share of their tasks failed; failed runs always alert." },
    defaults: { threshold: 50, windowDays: 2, cooldownHours: 1 },
    fields: ["threshold", "windowDays"],
    source: "AI tracking runs",
    path: "/ai/tracker",
  },
};

export const ALERT_KIND_GROUPS: AlertKindGroup[] = ["AI visibility", "Competitors & market", "Sentiment", "Sources & fact check", "Crawlers & traffic", "Tracking"];

export const ALERT_KIND_LIST = Object.keys(ALERT_KIND_META) as AlertKind[];

export const WINDOW_OPTIONS = [1, 2, 3, 7, 14, 30] as const;

export const SEVERITY_LABEL = { info: "Info", warning: "Warning", critical: "Critical" } as const;

/** Params with the kind's defaults applied (window clamped to 1–90 days). */
export function resolveParams(kind: AlertKind, params: AlertParams): Required<Pick<AlertParams, "windowDays">> & AlertParams {
  const meta = ALERT_KIND_META[kind];
  const windowDays = Math.min(90, Math.max(1, Math.round(params.windowDays ?? meta.defaults.windowDays)));
  return {
    ...params,
    windowDays,
    threshold: meta.threshold ? (params.threshold ?? meta.defaults.threshold) : undefined,
    engines: params.engines?.length ? params.engines : undefined,
    tags: params.tags?.length ? params.tags : undefined,
  };
}

/** One-line human summary of a rule ("Drop of at least 10 pp · 7-day window · 2 engines"). */
export function describeRule(kind: AlertKind, params: AlertParams): string {
  const meta = ALERT_KIND_META[kind];
  const p = resolveParams(kind, params);
  const parts: string[] = [];
  if (meta.threshold && p.threshold != null) {
    const unit = meta.threshold.unit;
    parts.push(`${meta.threshold.label.toLowerCase()} ${p.threshold}${unit.startsWith("%") ? "" : " "}${unit}`);
  }
  parts.push(`${p.windowDays}-day window`);
  if (p.engines?.length) parts.push(`${p.engines.length} engine${p.engines.length === 1 ? "" : "s"}`);
  if (p.tags?.length) parts.push(`${p.tags.length} tag${p.tags.length === 1 ? "" : "s"}`);
  if (kind === "fact_check_deviation" && p.minSeverity) parts.push(`${p.minSeverity}+ severity`);
  const text = parts.join(" · ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const DEFAULT_CHANNELS: AlertChannels = { inApp: true, emails: [], slack: false, webhook: true };

/** Rules created for every project on the first visit of the Alerts page (all editable). */
export const DEFAULT_RULES: { name: string; kind: AlertKind; params: AlertParams }[] = [
  { name: "Visibility drop", kind: "visibility_drop", params: { threshold: 10, windowDays: 7 } },
  { name: "Sentiment drop", kind: "sentiment_drop", params: { threshold: 10, windowDays: 7 } },
  { name: "New competitor", kind: "new_competitor", params: { threshold: 2, windowDays: 7 } },
  { name: "Tracking run failed", kind: "run_failed", params: { threshold: 50, windowDays: 2 } },
];
