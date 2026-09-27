/**
 * Search intents of query fan-outs (the sub-queries AI engines search while answering) and the
 * keyword fallback used when no AI provider is available. Pure module — server + UI.
 */

export const FANOUT_INTENTS = ["review", "comparison", "pricing", "alternatives", "freshness", "how-to", "other"] as const;

export type FanoutIntent = (typeof FANOUT_INTENTS)[number];

export const FANOUT_INTENT_INFO: Record<FanoutIntent, { label: string; color: string; description: string }> = {
  review: { label: "Reviews", color: "#a855f7", description: "Tests, ratings, experiences, pros & cons" },
  comparison: { label: "Comparison", color: "#f97316", description: "X vs Y, which is better, differences" },
  pricing: { label: "Pricing", color: "#22c55e", description: "Prices, costs, deals, budget options" },
  alternatives: { label: "Alternatives", color: "#ec4899", description: "Alternatives to / competitors of a brand" },
  freshness: { label: "Freshness", color: "#0ea5e9", description: "Latest, new, current year" },
  "how-to": { label: "How-to", color: "#eab308", description: "Guides, setup, instructions" },
  other: { label: "Other", color: "#a8a29e", description: "General information / best-of searches" },
};

export function isFanoutIntent(v: unknown): v is FanoutIntent {
  return typeof v === "string" && (FANOUT_INTENTS as readonly string[]).includes(v);
}

export function fanoutIntentInfo(v: string | null | undefined) {
  return isFanoutIntent(v) ? FANOUT_INTENT_INFO[v] : { label: "Unclassified", color: "#d6d3d1", description: "Not classified yet" };
}

/** Words in a query (whitespace separated, punctuation-only tokens ignored). */
export function wordCount(query: string): number {
  return query
    .trim()
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

/** Priority order: the most specific intent wins ("X vs Y price" → comparison). */
const RULES: [FanoutIntent, RegExp][] = [
  ["alternatives", /\balternativ(e|es|en|a|as)?\b|\binstead of\b|\bsimilar to\b|\bcompetitors?\b|\bkonkurrenten?\b|\bstatt\b|\bersatz f(ü|ue)r\b|\blike\s+\w+\s+but\b/],
  ["comparison", /\bvs\.?\b|\bversus\b|\bcompar(e|ed|ison|isons|ing)\b|\bdifference(s)? between\b|\bwhich is better\b|\bbetter than\b|\bvergleich\w*|\bunterschied\w*|\bor\b.+\bwhich\b|\bcomparatif\b|\bcomparativa\b/],
  ["pricing", /\bprice[sd]?\b|\bpricing\b|\bcosts?\b|\bcheap(est|er)?\b|\baffordable\b|\bbudget\b|\bhow much\b|\bdeals?\b|\bdiscounts?\b|\bcoupons?\b|\bsale\b|\bunder\s*[$€£]?\s*\d|\bpreis\w*|\bkosten\w*|\bg(ü|ue)nstig\w*|\bbillig\w*|\bangebot\w*|\brabatt\w*|\bwas kostet\b|\bunter\s*\d+\s*(€|euro)|\bprix\b|\bprecio\b/],
  ["review", /\breviews?\b|\breviewed\b|\bratings?\b|\brated\b|\btests?\b|\btested\b|\btestbericht\w*|\btestsieger\b|\berfahrung\w*|\bbewertung\w*|\bworth it\b|\blohnt sich\b|\bpros and cons\b|\bvor- und nachteile\b|\bopinions?\b|\breddit\b|\btrustpilot\b|\bstiftung warentest\b|\bavis\b|\bopiniones\b/],
  ["how-to", /\bhow (to|do|does|can|much energy)\b|\bguide\b|\btutorial\b|\bstep by step\b|\binstall(ation|ing)?\b|\bset ?up\b|\bdiy\b|\banleitung\b|\binstallieren\b|\beinrichten\b|\bmontage\b|\bwie (kann|funktioniert|installiere|baue|montiere)\b|\bcomment\b|\bc(ó|o)mo\b/],
  ["freshness", /\b20[2-3]\d\b|\blatest\b|\bnewest\b|\bnew\b|\brecent(ly)?\b|\bthis year\b|\bcurrent(ly)?\b|\btoday\b|\bupdated?\b|\baktuell\w*|\bneu(e|en|er|es|este|esten)?\b|\bnouveau\b|\bnuevo\b/],
];

/** Keyword intent of a fan-out query, or null when no rule applies (the LLM decides, else "other"). */
export function guessFanoutIntent(query: string): FanoutIntent | null {
  const q = query.toLowerCase();
  for (const [intent, re] of RULES) if (re.test(q)) return intent;
  return null;
}
