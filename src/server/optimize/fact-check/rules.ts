/**
 * Pure evaluation of deterministic fact-check rules (no server-only / path-alias imports so it is
 * unit-testable). Semantics per rule kind:
 *
 * - numeric_range: `terms` name the figure ("APR", "Zinssatz", "dose"). Every number that appears in
 *   the statement (claim + AI quote) within the same sentence and ≤ 120 characters of a term is
 *   checked; when the rule has a unit (e.g. "%", "mg") or currency (e.g. "EUR") only numbers
 *   carrying that unit/currency count. A range ("3,9–12,9 %") is checked at both ends. Any value
 *   below `min` or above `max` is a violation.
 * - forbidden: any of `terms` (word/phrase, case-insensitive, whole words) in the statement is a
 *   violation — optionally only when the statement is about one of `triggerTerms`.
 * - required: when the statement is in scope (mentions one of `triggerTerms`; empty = every
 *   statement about the asset) the AI answer must contain at least one of `terms` (checked in the
 *   whole answer when available, otherwise in the statement) — otherwise it is a violation.
 *
 * Rules apply to the statement's asset (or every asset when `assetId` is null) and market (or every
 * market when `market` is null; GB ≙ UK).
 */

export type FcRuleKindValue = "numeric_range" | "forbidden" | "required";
export type RuleSeverity = "critical" | "major" | "minor";

export type EvalRule = {
  id: string;
  name: string;
  kind: FcRuleKindValue;
  assetId: string | null;
  terms: string[];
  triggerTerms: string[];
  min: number | null;
  max: number | null;
  unit: string | null;
  currency: string | null;
  market: string | null;
  severity: RuleSeverity;
  active: boolean;
};

export type EvalStatement = {
  assetId: string;
  market: string;
  claim: string;
  quote?: string | null;
  /** Full answer text (used by "required" rules). */
  answerText?: string | null;
};

export type RuleViolation = {
  ruleId: string;
  ruleName: string;
  kind: FcRuleKindValue;
  severity: RuleSeverity;
  /** What was found (value, term) — null for "required" rules. */
  found: string | null;
  /** What the rule expects, e.g. "3.9–12.9 %". */
  expected: string;
  explanation: string;
};

/* ───────────────────────────── Helpers ───────────────────────────── */

export function normMarket(c: string | null | undefined): string {
  const u = (c ?? "").trim().toUpperCase();
  return u === "GB" ? "UK" : u;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Case-insensitive whole-word / whole-phrase matcher (unicode aware, flexible whitespace). */
export function termRegex(term: string): RegExp | null {
  const t = term.trim();
  if (!t) return null;
  const body = t.split(/\s+/).map(escapeRe).join("\\s+");
  return new RegExp(`(?<![\\p{L}\\p{N}])${body}(?![\\p{L}\\p{N}])`, "giu");
}

function normalizeText(s: string): string {
  return s.normalize("NFKC").replace(/\u00a0|\u202f/g, " ");
}

/** Finds all occurrences of the terms: [start, end, term] sorted by start. */
export function findTerms(text: string, terms: string[]): { start: number; end: number; term: string }[] {
  const out: { start: number; end: number; term: string }[] = [];
  for (const term of terms) {
    const re = termRegex(term);
    if (!re) continue;
    for (const m of text.matchAll(re)) out.push({ start: m.index!, end: m.index! + m[0].length, term: term.trim() });
  }
  return out.sort((a, b) => a.start - b.start);
}

export function mentionsAny(text: string, terms: string[]): boolean {
  return terms.some((t) => {
    const re = termRegex(t);
    return !!re && re.test(text);
  });
}

/* ───────────────────────────── Numbers ───────────────────────────── */

const UNIT_ALIASES: Record<string, string> = {
  "%": "%",
  percent: "%",
  per_cent: "%",
  prozent: "%",
  pct: "%",
  "%p.a.": "%",
  mg: "mg",
  milligram: "mg",
  milligrams: "mg",
  milligramm: "mg",
  g: "g",
  gram: "g",
  grams: "g",
  gramm: "g",
  kg: "kg",
  µg: "µg",
  mcg: "µg",
  ml: "ml",
  l: "l",
  liter: "l",
  litre: "l",
  kwh: "kwh",
  kw: "kw",
  w: "w",
  watt: "w",
  wp: "wp",
  v: "v",
  h: "h",
  hour: "h",
  hours: "h",
  stunde: "h",
  stunden: "h",
  day: "day",
  days: "day",
  tag: "day",
  tage: "day",
  tagen: "day",
  month: "month",
  months: "month",
  monat: "month",
  monate: "month",
  monaten: "month",
  year: "year",
  years: "year",
  jahr: "year",
  jahre: "year",
  jahren: "year",
  x: "x",
};

const CURRENCY_ALIASES: Record<string, string> = {
  "€": "EUR",
  eur: "EUR",
  euro: "EUR",
  euros: "EUR",
  $: "USD",
  usd: "USD",
  "us$": "USD",
  dollar: "USD",
  dollars: "USD",
  "£": "GBP",
  gbp: "GBP",
  chf: "CHF",
  fr: "CHF",
  "¥": "JPY",
  jpy: "JPY",
};

export function normalizeUnit(u: string | null | undefined): string | null {
  if (!u) return null;
  const k = u.trim().toLowerCase().replace(/\s+/g, "");
  if (!k) return null;
  return UNIT_ALIASES[k] ?? k;
}

export function normalizeCurrency(c: string | null | undefined): string | null {
  if (!c) return null;
  const k = c.trim().toLowerCase();
  if (!k) return null;
  return CURRENCY_ALIASES[k] ?? k.toUpperCase();
}

/**
 * Parses a number written with English or German separators: "1,234.56", "1.234,56", "3,9", "12.9",
 * "10 000". A single separator followed by exactly three digits is a thousands separator unless the
 * integer part is 0 ("0,125" = 0.125); otherwise it is the decimal separator.
 */
export function parseLocaleNumber(raw: string): number | null {
  const s = raw.replace(/[\s\u00a0\u202f']/g, "");
  if (!/^\d[\d.,]*$/.test(s)) return null;
  const lastDot = s.lastIndexOf(".");
  const lastComma = s.lastIndexOf(",");
  let normalized: string;
  if (lastDot >= 0 && lastComma >= 0) {
    const dec = lastDot > lastComma ? "." : ",";
    const thou = dec === "." ? "," : ".";
    normalized = s.split(thou).join("").replace(dec, ".");
  } else if (lastDot >= 0 || lastComma >= 0) {
    const sep = lastDot >= 0 ? "." : ",";
    const parts = s.split(sep);
    if (parts.length > 2) normalized = parts.join("");
    else {
      const [int, frac] = parts as [string, string];
      normalized = frac.length === 3 && int !== "0" ? int + frac : `${int}.${frac}`;
    }
  } else normalized = s;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export type NumericMention = {
  value: number;
  raw: string;
  unit: string | null;
  currency: string | null;
  start: number;
  end: number;
};

const NUM = String.raw`\d{1,3}(?:[.,]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?`;
const CUR_PREFIX = String.raw`(?:(€|\$|£|¥|US\$|EUR|USD|GBP|CHF)\s?)?`;
const UNIT_SUFFIX = String.raw`(?:\s?(%\s?p\.\s?a\.|%|€|\$|£|EUR|USD|GBP|CHF|Euro|Euros|Dollar|Dollars|percent|per\s?cent|Prozent|pct|µg|mcg|mg|kg|g|ml|l|kWh|kW|Wp|W|V|hours?|h|Stunden?|days?|Tage?n?|months?|Monate?n?|years?|Jahre?n?|x)(?![\p{L}]))?`;
const NUMBER_RE = new RegExp(`${CUR_PREFIX}(${NUM})${UNIT_SUFFIX}`, "giu");
const RANGE_JOIN = /^\s*(?:–|—|-|to|bis|and|und|until)\s*$/i;

function classify(token: string | undefined): { unit: string | null; currency: string | null } {
  if (!token) return { unit: null, currency: null };
  const t = token.replace(/\s+/g, "").toLowerCase();
  if (t.startsWith("%")) return { unit: "%", currency: null };
  const cur = CURRENCY_ALIASES[t];
  if (cur) return { unit: null, currency: cur };
  return { unit: normalizeUnit(t), currency: null };
}

/** Dates and times are not figures: blanked out (same length, so offsets stay valid). */
const DATE_RE = /\b(?:\d{4}-\d{1,2}-\d{1,2}|\d{1,2}\.\d{1,2}\.\d{2,4}|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}:\d{2})\b/g;

/** Extracts numbers with their unit / currency. Range starts inherit the unit of the range end. */
export function extractNumericMentions(input: string): NumericMention[] {
  const text = normalizeText(input).replace(DATE_RE, (m) => " ".repeat(m.length));
  const out: NumericMention[] = [];
  for (const m of text.matchAll(NUMBER_RE)) {
    const value = parseLocaleNumber(m[2]!);
    if (value == null) continue;
    // Skip digits glued to letters/digits (model names like "X5", identifiers).
    const before = text[m.index! - 1];
    if (before && /[\p{L}\d]/u.test(before)) continue;
    const pre = classify(m[1]);
    const post = classify(m[3]);
    out.push({
      value,
      raw: m[0].trim(),
      unit: post.unit ?? pre.unit,
      currency: pre.currency ?? post.currency,
      start: m.index!,
      end: m.index! + m[0].length,
    });
  }
  // "3,9–12,9 %", "3.9 to 12.9%", "zwischen 3,9 und 12,9 %": the first number inherits the unit.
  for (let i = out.length - 2; i >= 0; i--) {
    const a = out[i]!;
    const b = out[i + 1]!;
    if (a.unit || a.currency) continue;
    if (!(b.unit || b.currency)) continue;
    if (RANGE_JOIN.test(text.slice(a.end, b.start))) {
      a.unit = b.unit;
      a.currency = b.currency;
    }
  }
  return out;
}

const ABBREVIATIONS = new Set(
  "ca approx e.g i.e z.b u.a d.h bzw vs etc inkl incl zzgl ggf evtl usw mind max min nr no p.a pa rd st jan feb mar apr jun jul aug sep sept oct okt nov dec dez".split(" "),
);

/**
 * Sentence spans; a period only ends a sentence before whitespace (decimals like "3.9" stay inside)
 * and not after abbreviations ("ab ca. 799 €", "z. B.").
 */
function sentenceBounds(text: string): [number, number][] {
  const out: [number, number][] = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    const next = text[i + 1];
    if (c === "." && (next === undefined || /\s/.test(next))) {
      const word = /([\p{L}.]+)$/u.exec(text.slice(Math.max(start, i - 12), i))?.[1]?.toLowerCase().replace(/^\.+/, "");
      if (word && (ABBREVIATIONS.has(word) || /^\p{L}$/u.test(word))) continue;
    }
    const endsSentence = c === "\n" || ((c === "." || c === "!" || c === "?") && (next === undefined || /\s/.test(next)));
    if (endsSentence) {
      out.push([start, i + 1]);
      start = i + 1;
    }
  }
  if (start < text.length) out.push([start, text.length]);
  return out.filter(([a, b]) => text.slice(a, b).trim().length > 0);
}

const MAX_TERM_DISTANCE = 120;

/** Numbers that describe one of the terms: same sentence and close to a term occurrence. */
export function numbersNearTerms(input: string, terms: string[]): NumericMention[] {
  const text = normalizeText(input);
  const hits = findTerms(text, terms);
  if (!hits.length) return [];
  const numbers = extractNumericMentions(text);
  const sentences = sentenceBounds(text);
  const sentenceOf = (pos: number) => sentences.findIndex(([a, b]) => pos >= a && pos < b);
  return numbers.filter((n) => {
    const s = sentenceOf(n.start);
    return hits.some((h) => {
      if (sentenceOf(h.start) !== s) return false;
      const dist = n.start >= h.end ? n.start - h.end : h.start >= n.end ? h.start - n.end : 0;
      return dist <= MAX_TERM_DISTANCE;
    });
  });
}

/* ───────────────────────────── Evaluation ───────────────────────────── */

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 1000) / 1000);
}

export function describeExpected(rule: Pick<EvalRule, "kind" | "min" | "max" | "unit" | "currency" | "terms">): string {
  if (rule.kind === "numeric_range") {
    const suffix = rule.unit ? ` ${rule.unit.trim()}` : rule.currency ? ` ${rule.currency.trim().toUpperCase()}` : "";
    if (rule.min != null && rule.max != null) return `${fmt(rule.min)}–${fmt(rule.max)}${suffix}`;
    if (rule.min != null) return `≥ ${fmt(rule.min)}${suffix}`;
    if (rule.max != null) return `≤ ${fmt(rule.max)}${suffix}`;
    return "any value";
  }
  const list = rule.terms.map((t) => `“${t.trim()}”`).join(", ");
  return rule.kind === "forbidden" ? `never ${list}` : `mention ${list}`;
}

export function ruleApplies(rule: EvalRule, st: Pick<EvalStatement, "assetId" | "market">): boolean {
  if (!rule.active) return false;
  if (rule.assetId && rule.assetId !== st.assetId) return false;
  if (rule.market && normMarket(rule.market) !== normMarket(st.market)) return false;
  return true;
}

function unitMatches(n: NumericMention, rule: EvalRule): boolean {
  const unit = normalizeUnit(rule.unit);
  const currency = normalizeCurrency(rule.currency);
  if (currency && n.currency !== currency) return false;
  if (unit && n.unit !== unit) return false;
  if (!unit && !currency) {
    // Without a unit, bare years ("since 2019") are not the figure.
    if (!n.unit && !n.currency && Number.isInteger(n.value) && n.value >= 1900 && n.value <= 2100) return false;
  }
  return true;
}

/** Evaluates one rule against a statement; null when the rule is satisfied or does not apply. */
export function evaluateRule(rule: EvalRule, st: EvalStatement): RuleViolation | null {
  if (!ruleApplies(rule, st)) return null;
  const statementText = [st.claim, st.quote && st.quote !== st.claim ? st.quote : ""].filter(Boolean).join("\n");
  const expected = describeExpected(rule);
  const base = { ruleId: rule.id, ruleName: rule.name, kind: rule.kind, severity: rule.severity, expected };
  const terms = rule.terms.map((t) => t.trim()).filter(Boolean);
  const triggers = rule.triggerTerms.map((t) => t.trim()).filter(Boolean);
  if (triggers.length && !mentionsAny(statementText, triggers)) return null;

  if (rule.kind === "numeric_range") {
    if (!terms.length || (rule.min == null && rule.max == null)) return null;
    const values = numbersNearTerms(statementText, terms).filter((n) => unitMatches(n, rule));
    const bad = values.find((n) => (rule.min != null && n.value < rule.min) || (rule.max != null && n.value > rule.max));
    if (!bad) return null;
    return {
      ...base,
      found: bad.raw,
      explanation: `Violates rule “${rule.name}”: the answer states ${bad.raw}, allowed is ${expected}.`,
    };
  }

  if (rule.kind === "forbidden") {
    const hit = findTerms(normalizeText(statementText), terms)[0];
    if (!hit) return null;
    const found = normalizeText(statementText).slice(hit.start, hit.end);
    return { ...base, found, explanation: `Violates rule “${rule.name}”: the answer uses forbidden wording “${found}”.` };
  }

  // required
  if (!terms.length) return null;
  const haystack = normalizeText(st.answerText?.trim() ? `${statementText}\n${st.answerText}` : statementText);
  if (mentionsAny(haystack, terms)) return null;
  return {
    ...base,
    found: null,
    explanation: `Violates rule “${rule.name}”: the answer does not ${expected}${triggers.length ? ` when talking about ${triggers.map((t) => `“${t}”`).join(", ")}` : ""}.`,
  };
}

const SEVERITY_RANK: Record<RuleSeverity, number> = { critical: 3, major: 2, minor: 1 };

/** All violations of a statement, most severe first. */
export function evaluateRules(rules: EvalRule[], st: EvalStatement): RuleViolation[] {
  return rules
    .map((r) => evaluateRule(r, st))
    .filter((v): v is RuleViolation => v !== null)
    .sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);
}

/** Validates rule input semantics; returns an error message or null. */
export function validateRule(rule: Pick<EvalRule, "kind" | "terms" | "min" | "max">): string | null {
  const terms = rule.terms.map((t) => t.trim()).filter(Boolean);
  if (!terms.length) {
    return rule.kind === "numeric_range"
      ? "Add at least one keyword that names the figure (e.g. APR, dose)."
      : rule.kind === "forbidden"
        ? "Add at least one forbidden word or phrase."
        : "Add at least one required word or phrase.";
  }
  if (rule.kind === "numeric_range") {
    if (rule.min == null && rule.max == null) return "Set a minimum, a maximum or both.";
    if (rule.min != null && rule.max != null && rule.min > rule.max) return "The minimum must not be greater than the maximum.";
  }
  return null;
}
