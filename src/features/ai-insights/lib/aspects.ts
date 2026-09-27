/**
 * Fixed sentiment scorecard aspects (finseo "Sentiment scorecard"). Statements extracted from AI
 * answers carry one of these aspects (LLM pass; a keyword fallback labels older statements).
 * Pure module — shared by the analysis, the insight queries and the UI.
 */

export const SENTIMENT_ASPECTS = [
  "quality",
  "price",
  "value",
  "performance",
  "features",
  "reliability",
  "design",
  "support",
  "service",
  "usability",
  "availability",
] as const;

export type SentimentAspect = (typeof SENTIMENT_ASPECTS)[number];

export const ASPECT_INFO: Record<SentimentAspect, { label: string; description: string }> = {
  quality: { label: "Quality", description: "Build quality, materials, craftsmanship, sustainability" },
  price: { label: "Price", description: "Absolute price level, fees, discounts" },
  value: { label: "Value", description: "Value for money, price–performance" },
  performance: { label: "Performance", description: "Speed, power, efficiency, output" },
  features: { label: "Features", description: "Functionality, options, integrations" },
  reliability: { label: "Reliability", description: "Durability, lifespan, warranty, defects" },
  design: { label: "Design", description: "Look, size, weight, form factor" },
  support: { label: "Support", description: "Customer support, help, documentation" },
  service: { label: "Service", description: "Delivery, installation, returns, after-sales" },
  usability: { label: "Usability", description: "Ease of use, setup, handling" },
  availability: { label: "Availability", description: "Stock, where to buy, lead times" },
};

export function isAspect(v: unknown): v is SentimentAspect {
  return typeof v === "string" && (SENTIMENT_ASPECTS as readonly string[]).includes(v);
}

export function aspectLabel(v: string | null | undefined): string {
  return isAspect(v) ? ASPECT_INFO[v].label : "Unclassified";
}

/** Normalizes an LLM label ("Value for money", "PRICE") to a fixed aspect, or null. */
export function normalizeAspect(v: string | null | undefined): SentimentAspect | null {
  if (!v) return null;
  const s = v.trim().toLowerCase();
  if (isAspect(s)) return s;
  return guessAspect({ attribute: s });
}

/** Aspect score = praise ÷ (praise + criticism) × 100; null when nothing was said. */
export function aspectScore(praise: number, criticism: number): number | null {
  const d = praise + criticism;
  return d > 0 ? (praise / d) * 100 : null;
}

/**
 * Keyword rules (EN + DE) in priority order — "value for money" must win over "money", "easy
 * installation" over "installation", "delivery time" over "delivery".
 */
const RULES: [SentimentAspect, RegExp][] = [
  ["value", /value|worth|bang for|for the money|preis[- ]?leistung|price[- /]?performance|price[- ]to[- ]performance|cost[- ]effective|rentab|amorti|payback|roi\b|lohnt/],
  ["availability", /availab|in stock|out of stock|sold out|stock|verfügbar|verfuegbar|lieferbar|lieferzeit|delivery time|lead time|wait(ing)? time|where to buy|ausverkauft/],
  ["usability", /ease of use|easy|usab|user[- ]friendly|intuitive|simple|setup|set-up|plug[- ]and[- ]play|handling|bedien|einfach|benutzerfreundlich|montage(freundlich)?|install(ation)? ease|learning curve|convenien/],
  ["reliability", /reliab|durab|lifespan|life span|longevity|warrant|garantie|gewährleistung|haltbar|langlebig|zuverläss|zuverlaess|robust|defect|defekt|failure|breakdown|ausfall|stabil|safety|sicherheit|certif|zertifi/],
  ["support", /support|help|hotline|documentation|docs\b|manual|anleitung|community|kundendienst|kundensupport|response time|erreichbar/],
  ["service", /service|deliver|shipping|versand|lieferung|install(ation|er)?\b|montage|return|refund|rückgabe|rueckgabe|after[- ]sales|kundenservice|onboarding|consult|beratung/],
  ["price", /price|pricing|cost|cheap|expensive|afford|budget|fee|subscription|discount|preis|kosten|teuer|günstig|guenstig|billig|rabatt|förder|foerder|tarif/],
  ["performance", /perform|speed|fast|slow|power|efficien|output|capacity|battery|yield|ertrag|leistung|effizien|wirkungsgrad|watt|kwh|range|throughput|latency|accuracy|cushion|comfort|breathab|grip|traction|stability|dämpfung|daempfung|komfort/],
  ["features", /feature|function|option|integrat|\bapp\b|smart|compatib|ausstattung|funktion|extras|capabilit|connectivity|modular|expandab|erweiterbar|monitoring|software/],
  ["design", /design|look|style|aesthet|size|sizing|\bfit\b|weight|compact|form factor|colou?r|optik|aussehen|passform|portable|dimension|footprint|appearance/],
  ["quality", /quality|qualität|qualitaet|material|build|craftsman|verarbeitung|premium|finish|component|workmanship|sustainab|ethical|eco[- ]?friendly|recycl|nachhaltig/],
];

function match(text: string | null | undefined): SentimentAspect | null {
  if (!text) return null;
  const s = text.toLowerCase();
  for (const [aspect, re] of RULES) if (re.test(s)) return aspect;
  return null;
}

/** Heuristic aspect from a statement's attribute → theme → quote (null when nothing matches). */
export function guessAspect(input: { attribute?: string | null; theme?: string | null; quote?: string | null }): SentimentAspect | null {
  return match(input.attribute) ?? match(input.theme) ?? match(input.quote);
}
