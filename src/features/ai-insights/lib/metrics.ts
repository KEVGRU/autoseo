/**
 * AI visibility KPI catalogue (finseo definitions). Isomorphic: used by the server query layer
 * and the client views.
 */
export type MetricKey =
  | "visibility"
  | "mentionRate"
  | "mentions"
  | "citationRate"
  | "citations"
  | "sentiment"
  | "avgPosition"
  | "mentionDepth"
  | "sov"
  | "firstShare"
  | "top3Share"
  | "citationShare";

export type MetricFormat = "percent" | "number" | "decimal" | "score";

export type MetricDef = {
  label: string;
  format: MetricFormat;
  /** Lower is better (position, depth). */
  invert?: boolean;
  hint: string;
};

export const METRICS: Record<MetricKey, MetricDef> = {
  visibility: { label: "Visibility", format: "percent", hint: "Answers in which the brand appears at all (named or cited) ÷ all answers." },
  mentionRate: { label: "Mention Rate", format: "percent", hint: "Answers that name the brand ÷ all answers." },
  mentions: { label: "Mentions", format: "number", hint: "Total times the brand is named — every occurrence counts, so one answer can add several." },
  citationRate: { label: "Citation Rate", format: "percent", hint: "Answers citing the brand's own domain ÷ all answers." },
  citations: { label: "Citations", format: "number", hint: "Answers that cite one of the brand's domains (counted once per answer)." },
  sentiment: { label: "Sentiment", format: "score", hint: "0–100. 80–100 strongly positive, 60–79 positive, 40–59 neutral or mixed, 0–39 critical." },
  avgPosition: {
    label: "Avg Position",
    format: "decimal",
    invert: true,
    hint: "Sum of the brand's ordinal positions ÷ answers where it appears (1 = named first). Lower is better.",
  },
  mentionDepth: { label: "Mention Depth", format: "percent", invert: true, hint: "Char offset of the first mention ÷ answer length (0% = top, 100% = end). Lower is better." },
  sov: { label: "Share of Voice", format: "percent", hint: "Answers naming the brand ÷ answer-appearances of all brands in the selected brand set." },
  firstShare: { label: "#1 Share", format: "percent", hint: "Answers where the brand is named first ÷ answers where it appears." },
  top3Share: { label: "Top-3 Share", format: "percent", hint: "Answers where the brand is among the first three brands named ÷ answers where it appears." },
  citationShare: { label: "Citation Share", format: "percent", hint: "The brand's citations ÷ citations of all brands in the selected brand set." },
};

/** Which brands Position and Share of Voice are computed against (finseo "competitor set"). */
export type BrandScope = "tracked" | "all";

export const BRAND_SCOPES: { value: BrandScope; label: string; short: string; hint: string }[] = [
  { value: "tracked", label: "Tracked brands", short: "Tracked", hint: "Position and Share of Voice among your brand and your competitor list." },
  { value: "all", label: "All brands", short: "All", hint: "Position and Share of Voice among every brand AI names, including brands you don't track." },
];

export function parseBrandScope(v: string | null | undefined): BrandScope {
  return v === "all" ? "all" : "tracked";
}

/* ───────────── Formulas (finseo KPI definitions — docs.finseo.ai/getting-started/kpis) ───────────── */

/** `num ÷ den × 100`, null when there is nothing to divide by. */
export function share(num: number, den: number): number | null {
  return den > 0 ? (num / den) * 100 : null;
}

/** Visibility: answers where the brand appears ÷ all tracked answers (each answer counts once). */
export function visibilityRate(answersWithBrand: number, answers: number): number | null {
  return share(answersWithBrand, answers);
}

/** Share of Voice: answers naming the brand ÷ answer-appearances of all brands in the set. */
export function shareOfVoice(brandAnswers: number, allBrandAppearances: number): number | null {
  return share(brandAnswers, allBrandAppearances);
}

/** Average Position: sum of ordinal positions ÷ answers where the brand appears. */
export function averagePosition(positions: number[]): number | null {
  return positions.length ? positions.reduce((a, p) => a + p, 0) / positions.length : null;
}

/** #1 Share: answers where the brand is named first ÷ answers where it appears. */
export function firstShareOf(firsts: number, appeared: number): number | null {
  return share(firsts, appeared);
}

/** Top-3 Share: answers where the brand is among the first three named ÷ answers where it appears. */
export function top3ShareOf(top3: number, appeared: number): number | null {
  return share(top3, appeared);
}

/** Head-to-Head: answers naming both where yours is named first ÷ decided answers (ties excluded). */
export function headToHeadRate(wins: number, losses: number): number | null {
  return share(wins, wins + losses);
}

/** Mention Depth of one answer: char offset of the mention ÷ answer length × 100 (0 = top). */
export function mentionDepthOf(charOffset: number, answerLength: number): number {
  return answerLength > 0 ? Math.min(100, Math.max(0, (charOffset / answerLength) * 100)) : 0;
}

/** Citation Share: the brand's citations ÷ citations of all brands. */
export function citationShareOf(brandCitations: number, allCitations: number): number | null {
  return share(brandCitations, allCitations);
}

export type SentimentTone = "strong" | "positive" | "neutral" | "critical" | "none";

export const METRIC_KEYS = Object.keys(METRICS) as MetricKey[];

export type MetricValues = Record<MetricKey, number | null>;

export function emptyMetrics(): MetricValues {
  return Object.fromEntries(METRIC_KEYS.map((k) => [k, null])) as MetricValues;
}

export function formatMetric(key: MetricKey, v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "—";
  const def = METRICS[key];
  switch (def.format) {
    case "percent":
      return `${v.toFixed(1)}%`;
    case "decimal":
      return v.toFixed(1);
    case "score":
      return Math.round(v).toString();
    default:
      return Math.round(v).toLocaleString("en-US");
  }
}

/** finseo sentiment bands on the rounded score: 80–100 / 60–79 / 40–59 / 0–39. */
export function sentimentLabel(score: number | null | undefined): { label: string; tone: SentimentTone } {
  if (score == null || Number.isNaN(score)) return { label: "No data", tone: "none" };
  const s = Math.round(score);
  if (s >= 80) return { label: "Strongly positive", tone: "strong" };
  if (s >= 60) return { label: "Positive", tone: "positive" };
  if (s >= 40) return { label: "Neutral", tone: "neutral" };
  return { label: "Critical", tone: "critical" };
}
