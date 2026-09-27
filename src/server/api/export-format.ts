import { csvCell } from "@/server/optimize/csv";

/**
 * Pure helpers of the bulk export (REST `/export`, `/export/bulk`): dataset/format enums, `since`
 * parsing, DB row → DTO mappers, CSV columns and the NDJSON serializer. No DB access (unit-tested).
 */

export const EXPORT_DATASETS = ["answers", "prompts", "mentions", "citations", "fanouts"] as const;
export type ExportDataset = (typeof EXPORT_DATASETS)[number];

export const EXPORT_FORMATS = ["json", "csv", "ndjson"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

/** `since`: a calendar day (UTC midnight) or an ISO 8601 timestamp (offset optional → UTC). */
export const SINCE_RE = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}(?::?\d{2})?)?)?$/i;

export function parseSince(raw: string): Date | null {
  const v = raw.trim();
  if (!SINCE_RE.test(v)) return null;
  let iso = v.replace(" ", "T");
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) iso += "T00:00:00Z";
  else if (!/(?:Z|[+-]\d{2}(?::?\d{2})?)$/i.test(iso)) iso += "Z";
  // "+02" → "+02:00", "+0200" → "+02:00" (Date.parse only takes ±HH:MM).
  iso = iso.replace(/([+-]\d{2})(\d{2})$/, "$1:$2").replace(/([+-]\d{2})$/, "$1:00");
  const t = Date.parse(iso);
  return Number.isFinite(t) ? new Date(t) : null;
}

type Raw = Record<string, unknown>;

const str = (v: unknown): string => (v == null ? "" : String(v));
const strN = (v: unknown): string | null => (v == null || v === "" ? null : String(v));
const numN = (v: unknown): number | null => (v == null || v === "" || !Number.isFinite(Number(v)) ? null : Number(v));
const int = (v: unknown): number => (v == null || !Number.isFinite(Number(v)) ? 0 : Math.round(Number(v)));
const round1 = (v: unknown): number | null => {
  const n = numN(v);
  return n == null ? null : Math.round(n * 10) / 10;
};

export type ExportMention = {
  mentionId: string;
  answerId: string;
  date: string;
  createdAt: string;
  promptId: string;
  prompt: string;
  country: string;
  language: string;
  model: string;
  modelVersion: string | null;
  brand: string;
  isOwnBrand: boolean;
  competitorId: string | null;
  position: number;
  trackedPosition: number | null;
  mentionDepth: number | null;
  occurrences: number;
  cited: boolean;
  recommended: boolean;
  sentiment: number | null;
  snippet: string | null;
};

export function toExportMention(r: Raw): ExportMention {
  return {
    mentionId: str(r.id),
    answerId: str(r.answer_id),
    date: str(r.d),
    createdAt: str(r.created_at),
    promptId: str(r.prompt_id),
    prompt: str(r.prompt),
    country: str(r.country),
    language: str(r.language),
    model: str(r.engine),
    modelVersion: strN(r.model),
    brand: str(r.brand_name),
    isOwnBrand: Boolean(r.is_own),
    competitorId: strN(r.competitor_id),
    position: int(r.position),
    trackedPosition: numN(r.tracked_position),
    mentionDepth: round1(r.depth_pct),
    occurrences: int(r.occurrences),
    cited: Boolean(r.cited),
    recommended: Boolean(r.recommended),
    sentiment: round1(r.sentiment),
    snippet: strN(r.snippet),
  };
}

export type ExportCitation = {
  citationId: string;
  answerId: string;
  date: string;
  createdAt: string;
  promptId: string;
  prompt: string;
  country: string;
  language: string;
  model: string;
  position: number;
  sourceId: string;
  url: string;
  domain: string;
  title: string | null;
  contentType: string | null;
  ownership: string;
  competitorId: string | null;
  competitor: string | null;
};

export function toExportCitation(r: Raw): ExportCitation {
  return {
    citationId: str(r.id),
    answerId: str(r.answer_id),
    date: str(r.d),
    createdAt: str(r.created_at),
    promptId: str(r.prompt_id),
    prompt: str(r.prompt),
    country: str(r.country),
    language: str(r.language),
    model: str(r.engine),
    position: int(r.position),
    sourceId: str(r.source_id),
    url: str(r.url),
    domain: str(r.domain),
    title: strN(r.title),
    contentType: strN(r.content_type),
    ownership: str(r.ownership) || "third_party",
    competitorId: strN(r.competitor_id),
    competitor: strN(r.competitor_name),
  };
}

export type ExportFanout = {
  fanoutId: string;
  answerId: string;
  date: string;
  createdAt: string;
  promptId: string;
  prompt: string;
  country: string;
  language: string;
  model: string;
  query: string;
  intent: string | null;
  wordCount: number | null;
  coverage: string | null;
  coverageUrl: string | null;
};

export function toExportFanout(r: Raw): ExportFanout {
  return {
    fanoutId: str(r.id),
    answerId: str(r.answer_id),
    date: str(r.d),
    createdAt: str(r.created_at),
    promptId: str(r.prompt_id),
    prompt: str(r.prompt),
    country: str(r.country),
    language: str(r.language),
    model: str(r.engine),
    query: str(r.query),
    intent: strN(r.intent),
    wordCount: numN(r.word_count),
    coverage: strN(r.coverage),
    coverageUrl: strN(r.coverage_url),
  };
}

/** Prompt row of `listPromptsWithMetrics` (the `Prompt` schema of GET /prompts). */
export type ExportPrompt = {
  id: string;
  text: string;
  country: string;
  language: string;
  status: string;
  markets?: string[] | null;
  funnelStage?: string | null;
  intent?: string | null;
  persona?: string | null;
  tags: { id: string; name: string }[];
  models: string[];
  createdAt: string;
  lastRunAt: string | null;
  metrics: {
    isVisible: boolean;
    answers: number;
    visibility: number | null;
    visibilityChange: number | null;
    totalMentions: number;
    mentionedAnswers?: number;
    mentionRate: number | null;
    ownDomainCitations: number;
    citationRate: number | null;
    sentiment: number | null;
    avgPosition: number | null;
  };
  competitorsMentioned: { id: string | null; name: string; mentions: number }[];
};

/** `since` for prompts: created or last run at/after the timestamp. */
export function promptChangedSince(p: Pick<ExportPrompt, "createdAt" | "lastRunAt">, since: Date): boolean {
  const t = since.getTime();
  const created = Date.parse(p.createdAt);
  const run = p.lastRunAt ? Date.parse(p.lastRunAt) : Number.NaN;
  return (Number.isFinite(created) && created >= t) || (Number.isFinite(run) && run >= t);
}

type Column<T> = [header: string, get: (row: T) => unknown];

const list = (v: unknown[] | null | undefined) => (v ?? []).join("; ");

export const PROMPT_CSV_COLUMNS: Column<ExportPrompt>[] = [
  ["promptId", (p) => p.id],
  ["prompt", (p) => p.text],
  ["country", (p) => p.country],
  ["markets", (p) => list(p.markets ?? [p.country])],
  ["language", (p) => p.language],
  ["status", (p) => p.status],
  ["funnelStage", (p) => p.funnelStage ?? null],
  ["intent", (p) => p.intent ?? null],
  ["persona", (p) => p.persona ?? null],
  ["tags", (p) => list(p.tags.map((t) => t.name))],
  ["models", (p) => list(p.models)],
  ["createdAt", (p) => p.createdAt],
  ["lastRunAt", (p) => p.lastRunAt],
  ["answers", (p) => p.metrics.answers],
  ["isVisible", (p) => p.metrics.isVisible],
  ["visibility", (p) => p.metrics.visibility],
  ["visibilityChange", (p) => p.metrics.visibilityChange],
  ["mentionRate", (p) => p.metrics.mentionRate],
  ["totalMentions", (p) => p.metrics.totalMentions],
  ["citationRate", (p) => p.metrics.citationRate],
  ["ownDomainCitations", (p) => p.metrics.ownDomainCitations],
  ["sentiment", (p) => p.metrics.sentiment],
  ["avgPosition", (p) => p.metrics.avgPosition],
  ["competitorsMentioned", (p) => list(p.competitorsMentioned.map((c) => c.name))],
];

/** CSV columns = every DTO key in declaration order (DTOs are flat). */
function flatColumns<T extends object>(keys: (keyof T & string)[]): Column<T>[] {
  return keys.map((k) => [k, (row: T) => row[k]]);
}

export const MENTION_CSV_COLUMNS = flatColumns<ExportMention>([
  "date", "createdAt", "mentionId", "answerId", "promptId", "prompt", "country", "language", "model", "modelVersion", "brand", "isOwnBrand",
  "competitorId", "position", "trackedPosition", "mentionDepth", "occurrences", "cited", "recommended", "sentiment", "snippet",
]);

export const CITATION_CSV_COLUMNS = flatColumns<ExportCitation>([
  "date", "createdAt", "citationId", "answerId", "promptId", "prompt", "country", "language", "model", "position", "sourceId", "url", "domain",
  "title", "contentType", "ownership", "competitorId", "competitor",
]);

export const FANOUT_CSV_COLUMNS = flatColumns<ExportFanout>([
  "date", "createdAt", "fanoutId", "answerId", "promptId", "prompt", "country", "language", "model", "query", "intent", "wordCount", "coverage",
  "coverageUrl",
]);

/** Numbers stay numeric (a negative change is not a formula); everything else gets the injection guard of `csvCell`. */
function cell(v: unknown): string {
  return typeof v === "number" ? (Number.isFinite(v) ? String(v) : "") : csvCell(v);
}

/** CSV (header row + one line per row). */
export function rowsToCsv<T>(rows: T[], columns: Column<T>[]): string {
  return [columns.map((c) => cell(c[0])).join(","), ...rows.map((r) => columns.map((c) => cell(c[1](r))).join(","))].join("\n") + "\n";
}

/** Newline-delimited JSON: one compact object per line (JSON.stringify escapes embedded newlines). */
export function toNdjson(rows: unknown[]): string {
  return rows.map((r) => JSON.stringify(r)).join("\n") + (rows.length ? "\n" : "");
}

export function exportFilename(domain: string, dataset: ExportDataset, from: string, to: string, page: number, ext: "csv" | "ndjson"): string {
  return `${domain.replace(/[^a-z0-9.-]/gi, "_")}-${dataset}-${from}-${to}-p${page}.${ext}`;
}
