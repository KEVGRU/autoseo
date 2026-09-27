import "server-only";
import { sql, type SQL } from "drizzle-orm";
import { db } from "@/server/db/client";
import { parseBrandScope, type BrandScope } from "@/features/ai-insights/lib/metrics";

/**
 * Shared filter model for all AI insight views (competitors, sentiment, sources, products, ads,
 * home). Periods are inclusive UTC day ranges on `answer_date`; deltas compare against the
 * previous period of equal length.
 */
export type InsightFilter = {
  projectId: string;
  preset: string;
  from: string;
  to: string;
  prevFrom: string;
  prevTo: string;
  days: number;
  /** Empty = all engines. */
  engines: string[];
  /** Empty = all tags. */
  tagIds: string[];
  /** Brand set for Position / Share of Voice / #1 & Top-3 share (default "tracked"). */
  brandScope?: BrandScope;
  /** Answer markets (ISO country); empty = all markets. */
  countries?: string[];
  /** Prompt slices; empty = all. */
  funnelStages?: string[];
  intents?: string[];
  personas?: string[];
  /** Answer model versions (ai_answers.model); empty = all. */
  modelVersions?: string[];
  /** Drop answers of the AI simulation (provider "ai"); default: included. */
  excludeSimulated?: boolean;
};

export type SearchParams = Record<string, string | string[] | undefined>;

const DAY = 86_400_000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ID_RE = /^[a-z0-9_-]{1,64}$/i;
export const COUNTRY_RE = /^[A-Z]{2}$/;
export const FUNNEL_RE = /^(tofu|mofu|bofu)$/;
/** Free-text prompt attributes (intent / persona labels). */
export const LABEL_RE = /^[\p{L}\p{N} _&/.'+-]{1,80}$/u;
/** Model version ids (ai_answers.model), e.g. "gpt-4o-search-preview", "google-ai-overview". */
export const MODEL_RE = /^[\w.:/@+-]{1,120}$/;

export function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(day: string, n: number): string {
  return isoDay(new Date(Date.parse(`${day}T00:00:00Z`) + n * DAY));
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY) + 1;
}

/** Every day in [from, to] (inclusive). */
export function dayRange(from: string, to: string): string[] {
  const out: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

export function param(sp: SearchParams, key: string): string | undefined {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

export function listParam(sp: SearchParams, key: string, re: RegExp = ID_RE, max = 50): string[] {
  const raw = param(sp, key);
  if (!raw) return [];
  return [...new Set(raw.split(",").map((s) => s.trim()).filter((s) => re.test(s)))].slice(0, max);
}

const PRESET_DAYS: Record<string, number> = { "7d": 7, "14d": 14, "30d": 30, "90d": 90, "180d": 180, "365d": 365 };

export function parseInsightFilter(
  projectId: string,
  sp: SearchParams,
  opts: { defaultPeriod?: string; today?: string } = {},
): InsightFilter {
  const today = opts.today ?? isoDay(new Date());
  let preset = param(sp, "period") ?? opts.defaultPeriod ?? "30d";
  let from: string;
  let to: string;
  const cFrom = param(sp, "from");
  const cTo = param(sp, "to");
  if (preset === "custom" && cFrom && DATE_RE.test(cFrom)) {
    from = cFrom;
    to = cTo && DATE_RE.test(cTo) ? cTo : today;
    if (to > today) to = today;
    if (from > to) [from, to] = [to, from];
    // Hard cap (2 years) to keep queries bounded.
    if (daysBetween(from, to) > 730) from = addDays(to, -729);
  } else {
    if (!PRESET_DAYS[preset]) preset = opts.defaultPeriod ?? "30d";
    to = today;
    from = addDays(today, -((PRESET_DAYS[preset] ?? 30) - 1));
  }
  const days = daysBetween(from, to);
  return {
    projectId,
    preset,
    from,
    to,
    prevTo: addDays(from, -1),
    prevFrom: addDays(from, -days),
    days,
    engines: listParam(sp, "models", /^[a-z_]{2,32}$/),
    tagIds: listParam(sp, "tags"),
    brandScope: parseBrandScope(param(sp, "brands")),
    countries: listParam(sp, "markets", COUNTRY_RE),
    funnelStages: listParam(sp, "funnel", FUNNEL_RE),
    intents: listParam(sp, "intent", LABEL_RE),
    personas: listParam(sp, "persona", LABEL_RE),
    modelVersions: listParam(sp, "mv", MODEL_RE),
    excludeSimulated: param(sp, "simulated") === "exclude",
  };
}

/* ───────────────────────────── SQL helpers ───────────────────────────── */

export type Range = "cur" | "prev" | "both" | { from: string; to: string };

export function rangeBounds(f: InsightFilter, range: Range): { from: string; to: string } {
  if (range === "cur") return { from: f.from, to: f.to };
  if (range === "prev") return { from: f.prevFrom, to: f.prevTo };
  if (range === "both") return { from: f.prevFrom, to: f.to };
  return range;
}

/**
 * Scope predicate for any AI fact table that carries `project_id`, `prompt_id`, `engine` and
 * `answer_date` (ai_answers, ai_mentions, ai_citations, ai_statements, …). Always filters by
 * project, only counts active prompts, and applies engine/tag filters.
 */
export function scope(f: InsightFilter, alias: string, range: Range = "cur", opts: { engines?: boolean; answerIdColumn?: string } = {}): SQL {
  const a = sql.raw(alias);
  const { from, to } = rangeBounds(f, range);
  const promptConds: SQL[] = [];
  if (f.tagIds.length) promptConds.push(sql` and p.id in (select l.prompt_id from prompt_tag_links l where l.tag_id in ${f.tagIds})`);
  if (f.funnelStages?.length) promptConds.push(sql` and p.funnel_stage in ${f.funnelStages}`);
  if (f.intents?.length) promptConds.push(sql` and p.intent in ${f.intents}`);
  if (f.personas?.length) promptConds.push(sql` and p.persona in ${f.personas}`);
  const parts: SQL[] = [
    sql`${a}.project_id = ${f.projectId}`,
    sql`${a}.answer_date between ${from}::date and ${to}::date`,
    sql`${a}.prompt_id in (select p.id from prompts p where p.project_id = ${f.projectId} and p.status = 'active'${sql.join(promptConds, sql``)})`,
  ];
  if (opts.engines !== false && f.engines.length) parts.push(sql`${a}.engine in ${f.engines}`);
  // Market and model version live on the answer (a prompt can run in several markets).
  const onAnswers = alias === "a" && !opts.answerIdColumn;
  const x = sql.raw(onAnswers ? alias : "x");
  const answerConds: SQL[] = [];
  if (f.countries?.length) answerConds.push(sql`${x}.country in ${f.countries}`);
  if (f.modelVersions?.length) answerConds.push(sql`${x}.model in ${f.modelVersions}`);
  if (f.excludeSimulated) answerConds.push(sql`${x}.provider <> 'ai'`);
  if (answerConds.length && onAnswers) parts.push(...answerConds);
  else if (answerConds.length) {
    parts.push(
      sql`${a}.${sql.raw(opts.answerIdColumn ?? "answer_id")} in (select x.id from ai_answers x where x.project_id = ${f.projectId} and x.answer_date between ${from}::date and ${to}::date and ${sql.join(answerConds, sql` and `)})`,
    );
  }
  return sql.join(parts, sql` and `);
}

/** Runs a raw query and returns plain rows. Cast counts with ::int and averages with ::float8. */
export async function rows<T>(query: SQL): Promise<T[]> {
  const res = await db.execute(query);
  return Array.from(res as unknown as Iterable<T>);
}

export function pct(n: number, d: number): number | null {
  return d > 0 ? (n / d) * 100 : null;
}

export function delta(cur: number | null | undefined, prev: number | null | undefined): number | null {
  if (cur == null || prev == null) return null;
  return cur - prev;
}

export function avg(sum: number, count: number): number | null {
  return count > 0 ? sum / count : null;
}

/** Serialises filter state back to a query string (for links that keep the current filters). */
export function filterQuery(f: InsightFilter, extra: Record<string, string | null | undefined> = {}): string {
  const p = new URLSearchParams();
  if (f.preset !== "30d") p.set("period", f.preset);
  if (f.preset === "custom") {
    p.set("from", f.from);
    p.set("to", f.to);
  }
  if (f.engines.length) p.set("models", f.engines.join(","));
  if (f.tagIds.length) p.set("tags", f.tagIds.join(","));
  if (f.brandScope === "all") p.set("brands", "all");
  if (f.countries?.length) p.set("markets", f.countries.join(","));
  if (f.funnelStages?.length) p.set("funnel", f.funnelStages.join(","));
  if (f.intents?.length) p.set("intent", f.intents.join(","));
  if (f.personas?.length) p.set("persona", f.personas.join(","));
  if (f.modelVersions?.length) p.set("mv", f.modelVersions.join(","));
  if (f.excludeSimulated) p.set("simulated", "exclude");
  for (const [k, v] of Object.entries(extra)) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `?${s}` : "";
}
