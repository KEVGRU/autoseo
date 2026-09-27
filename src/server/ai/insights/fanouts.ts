import "server-only";
import { sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db/client";
import { AiNotConfiguredError, runLlm } from "@/server/ai/llm";
import { BudgetExceededError } from "@/server/usage";
import { isDemoProjectId } from "@/server/ai/demo/guard";
import { FANOUT_INTENTS, guessFanoutIntent, type FanoutIntent } from "@/features/ai-insights/lib/fanout-intents";
import type { DayRange } from "@/features/ai-tracking/period";
import type { FanoutRow as LegacyFanoutRow } from "@/features/ai-tracking/types";
import { buildPageIndex, scoreCoverage, type Coverage, type OwnPage, type PageIndex } from "./fanout-coverage";
import { rows, scope, type InsightFilter } from "./filters";

/**
 * Query fan-out analysis: the sub-queries AI engines searched while answering tracked prompts,
 * with their search intent, word count, content coverage by own pages, how often the own brand
 * is mentioned / cited in the answers that ran them, and the domains those answers cite.
 * Plus the follow-up questions engines suggest (Perplexity related questions, SERP related
 * searches and People Also Ask).
 */

export type FanoutFilter = {
  projectId: string;
  from: string;
  to: string;
  engines?: string[];
  tagIds?: string[];
  promptId?: string;
  q?: string;
  /** Fan-out search intents (not the prompt intent slice). */
  intents?: string[];
  /** Full insight scope (markets, prompt slices, model versions, simulated answers…); replaces engines/tagIds/from/to. */
  scope?: InsightFilter;
};

export type FanoutRow = LegacyFanoutRow & {
  intent: FanoutIntent | null;
  wordCount: number;
  coverage: Coverage | null;
  coverageUrl: string | null;
  answers: number;
  /** % of answers that ran this query and name the own brand / cite an own page. */
  brandMentionedPct: number | null;
  ownCitedPct: number | null;
  topDomains: { domain: string; answers: number }[];
};

export type FanoutStats = {
  totalQueries: number;
  totalOccurrences: number;
  answersWithFanouts: number;
  avgWords: number | null;
  unclassified: number;
  coverageKnown: number;
  intents: { intent: string; queries: number; occurrences: number }[];
  coverage: { coverage: string; queries: number }[];
  lengths: { bucket: string; queries: number }[];
  engines: { engine: string; answers: number; fanouts: number; perAnswer: number; avgWords: number | null; followups: number }[];
};

export type FollowupRow = {
  question: string;
  kind: "related" | "paa" | "followup";
  frequency: number;
  engines: string[];
  prompts: { id: string; text: string }[];
  firstSeen: string;
  lastSeen: string;
};

const esc = (s: string) => s.replace(/[%_\\]/g, (m) => `\\${m}`);

function where(f: FanoutFilter, alias: string): SQL {
  const a = sql.raw(alias);
  const promptFilter = f.promptId ? sql` and ${a}.prompt_id = ${f.promptId}` : sql``;
  if (f.scope) return sql`${scope(f.scope, alias)}${promptFilter}`;
  const parts: SQL[] = [sql`${a}.project_id = ${f.projectId}`, sql`${a}.answer_date between ${f.from}::date and ${f.to}::date`];
  if (f.engines?.length) parts.push(sql`${a}.engine in ${f.engines}`);
  if (f.tagIds?.length) parts.push(sql`${a}.prompt_id in (select l.prompt_id from prompt_tag_links l where l.tag_id in ${f.tagIds})`);
  return sql`${sql.join(parts, sql` and `)}${promptFilter}`;
}

async function promptTexts(projectId: string, ids: string[]): Promise<Map<string, string>> {
  if (!ids.length) return new Map();
  const res = await rows<{ id: string; text: string }>(sql`select id, text from prompts where project_id = ${projectId} and id in ${ids}`);
  return new Map(res.map((r) => [r.id, r.text]));
}

const num = (v: unknown) => (v == null ? null : Number(v));

/** Fan-out queries grouped case-insensitively, most frequent first (max 2000). */
export async function getFanoutRows(f: FanoutFilter): Promise<FanoutRow[]> {
  const search = f.q?.trim() ? sql`and f.query ilike ${`%${esc(f.q.trim())}%`}` : sql``;
  const intents = f.intents?.length
    ? f.intents.includes("unclassified")
      ? sql`and (f.intent is null or f.intent in ${f.intents})`
      : sql`and f.intent in ${f.intents}`
    : sql``;
  const data = await rows<{
    k: string;
    query: string;
    freq: number;
    engines: string[] | null;
    prompt_ids: string[] | null;
    first_seen: string;
    last_seen: string;
    intent: FanoutIntent | null;
    word_count: number | null;
    coverage: Coverage | null;
    coverage_url: string | null;
    answers: number;
    mentioned: number | null;
    cited: number | null;
    top_domains: { domain: string; n: number }[] | null;
  }>(sql`
    with f as (
      select lower(trim(f.query)) as k, f.query, f.engine, f.prompt_id, f.answer_id, f.answer_date, f.intent, f.word_count, f.coverage, f.coverage_url
      from ai_fanouts f
      where ${where(f, "f")} ${search} ${intents}
    ), g as (
      select k, min(query) as query, count(*)::int as freq, array_agg(distinct engine) as engines, array_agg(distinct prompt_id) as prompt_ids,
             min(answer_date)::text as first_seen, max(answer_date)::text as last_seen,
             mode() within group (order by intent) as intent, max(word_count)::int as word_count,
             (array_agg(coverage order by answer_date desc) filter (where coverage is not null))[1] as coverage,
             (array_agg(coverage_url order by answer_date desc) filter (where coverage_url is not null))[1] as coverage_url,
             count(distinct answer_id)::int as answers
      from f group by k
      order by freq desc, last_seen desc
      limit 2000
    ), ans as (
      select distinct f.k, f.answer_id from f join g on g.k = f.k
    ), stats as (
      select ans.k, avg(case when a.brand_mentioned then 100.0 else 0 end)::float8 as mentioned,
             avg(case when a.brand_cited then 100.0 else 0 end)::float8 as cited
      from ans join ai_answers a on a.id = ans.answer_id group by ans.k
    ), doms as (
      select k, domain, n, row_number() over (partition by k order by n desc, domain) as rn
      from (
        select ans.k, s.domain, count(distinct c.answer_id)::int as n
        from ans join ai_citations c on c.answer_id = ans.answer_id join ai_sources s on s.id = c.source_id
        group by 1, 2
      ) x
    )
    select g.*, stats.mentioned, stats.cited,
           (select json_agg(json_build_object('domain', d.domain, 'n', d.n) order by d.rn) from doms d where d.k = g.k and d.rn <= 3) as top_domains
    from g left join stats on stats.k = g.k
    order by g.freq desc, g.last_seen desc`);
  const texts = await promptTexts(f.projectId, [...new Set(data.flatMap((r) => r.prompt_ids ?? []))]);
  return data.map((r) => ({
    query: r.query,
    frequency: Number(r.freq),
    engines: (r.engines ?? []).filter(Boolean),
    prompts: (r.prompt_ids ?? []).map((id) => ({ id, text: texts.get(id) ?? "" })),
    firstSeen: r.first_seen,
    lastSeen: r.last_seen,
    intent: r.intent,
    wordCount: r.word_count ?? r.query.trim().split(/\s+/).length,
    coverage: r.coverage,
    coverageUrl: r.coverage_url,
    answers: Number(r.answers),
    brandMentionedPct: num(r.mentioned),
    ownCitedPct: num(r.cited),
    topDomains: (r.top_domains ?? []).map((d) => ({ domain: d.domain, answers: Number(d.n) })),
  }));
}

/** Legacy signature (tracker metrics, reports): project + period + search. */
export async function getFanouts(projectId: string, range: DayRange, q?: string): Promise<FanoutRow[]> {
  return getFanoutRows({ projectId, from: range.from, to: range.to, q });
}

export async function getFanoutStats(f: FanoutFilter): Promise<FanoutStats> {
  const [totals, intents, coverage, lengths, engines] = await Promise.all([
    rows<{ q: number; occ: number; answers: number; words: number | null; unclassified: number; cov: number }>(sql`
      select count(distinct lower(trim(f.query)))::int as q, count(*)::int as occ, count(distinct f.answer_id)::int as answers,
             avg(f.word_count)::float8 as words,
             count(distinct lower(trim(f.query))) filter (where f.intent is null)::int as unclassified,
             count(distinct lower(trim(f.query))) filter (where f.coverage is not null)::int as cov
      from ai_fanouts f where ${where(f, "f")}`),
    rows<{ intent: string | null; q: number; occ: number }>(sql`
      select f.intent, count(distinct lower(trim(f.query)))::int as q, count(*)::int as occ
      from ai_fanouts f where ${where(f, "f")} group by 1 order by 3 desc`),
    rows<{ coverage: string | null; q: number }>(sql`
      select f.coverage, count(distinct lower(trim(f.query)))::int as q from ai_fanouts f where ${where(f, "f")} group by 1`),
    rows<{ bucket: string; q: number }>(sql`
      select case when coalesce(f.word_count, 0) <= 3 then '1–3' when f.word_count <= 6 then '4–6' when f.word_count <= 10 then '7–10' else '11+' end as bucket,
             count(distinct lower(trim(f.query)))::int as q
      from ai_fanouts f where ${where(f, "f")} group by 1`),
    rows<{ engine: string; answers: number; fanouts: number; with_fanouts: number; words: number | null; followups: number }>(sql`
      select a.engine, count(distinct a.id)::int as answers,
             (select count(*) from ai_fanouts f where ${where(f, "f")} and f.engine = a.engine)::int as fanouts,
             (select count(distinct f.answer_id) from ai_fanouts f where ${where(f, "f")} and f.engine = a.engine)::int as with_fanouts,
             (select avg(f.word_count) from ai_fanouts f where ${where(f, "f")} and f.engine = a.engine)::float8 as words,
             (select count(*) from ai_followups u where ${where(f, "u")} and u.engine = a.engine)::int as followups
      from ai_answers a where a.status = 'ok' and ${where({ ...f, q: undefined }, "a")}
      group by a.engine order by 3 desc`),
  ]);
  const t = totals[0];
  const order = ["1–3", "4–6", "7–10", "11+"];
  return {
    totalQueries: Number(t?.q ?? 0),
    totalOccurrences: Number(t?.occ ?? 0),
    answersWithFanouts: Number(t?.answers ?? 0),
    avgWords: num(t?.words),
    unclassified: Number(t?.unclassified ?? 0),
    coverageKnown: Number(t?.cov ?? 0),
    intents: intents.map((i) => ({ intent: i.intent ?? "unclassified", queries: Number(i.q), occurrences: Number(i.occ) })),
    coverage: coverage.map((c) => ({ coverage: c.coverage ?? "unknown", queries: Number(c.q) })),
    lengths: order.map((b) => ({ bucket: b, queries: Number(lengths.find((l) => l.bucket === b)?.q ?? 0) })),
    engines: engines
      .filter((e) => Number(e.fanouts) > 0 || Number(e.followups) > 0)
      .map((e) => ({
        engine: e.engine,
        answers: Number(e.answers),
        fanouts: Number(e.fanouts),
        perAnswer: Number(e.answers) ? Number(e.fanouts) / Number(e.answers) : 0,
        avgWords: num(e.words),
        followups: Number(e.followups),
      })),
  };
}

export async function getFollowupRows(f: FanoutFilter): Promise<FollowupRow[]> {
  const search = f.q?.trim() ? sql`and u.question ilike ${`%${esc(f.q.trim())}%`}` : sql``;
  const data = await rows<{ question: string; kind: FollowupRow["kind"]; n: number; engines: string[] | null; prompt_ids: string[] | null; first_seen: string; last_seen: string }>(sql`
    select min(u.question) as question, mode() within group (order by u.kind) as kind, count(*)::int as n,
           array_agg(distinct u.engine) as engines, array_agg(distinct u.prompt_id) as prompt_ids,
           min(u.answer_date)::text as first_seen, max(u.answer_date)::text as last_seen
    from ai_followups u
    where ${where(f, "u")} ${search}
    group by lower(trim(u.question))
    order by n desc, last_seen desc
    limit 2000`);
  const texts = await promptTexts(f.projectId, [...new Set(data.flatMap((r) => r.prompt_ids ?? []))]);
  return data.map((r) => ({
    question: r.question,
    kind: r.kind,
    frequency: Number(r.n),
    engines: (r.engines ?? []).filter(Boolean),
    prompts: (r.prompt_ids ?? []).map((id) => ({ id, text: texts.get(id) ?? "" })),
    firstSeen: r.first_seen,
    lastSeen: r.last_seen,
  }));
}

/* ───────────────────────────── Coverage ───────────────────────────── */

type SitemapNode = { path?: string; samples?: string[]; children?: SitemapNode[] };

/** Own pages known to AutoSEO: sitemap (Brand Knowledge), own pages cited by AI, catalog products. */
export async function loadOwnPages(projectId: string): Promise<{ pages: OwnPage[]; brandTokens: string[] }> {
  const [project, sitemap, cited, catalog] = await Promise.all([
    rows<{ name: string; domain: string; brand: { aliases?: string[] } | null }>(sql`select name, domain, brand from projects where id = ${projectId}`),
    rows<{ data: { origin?: string; tree?: SitemapNode } }>(sql`select data from brand_knowledge where project_id = ${projectId} and kind = 'sitemap' and status = 'ready'`),
    rows<{ url: string; title: string | null }>(sql`select url, title from ai_sources where project_id = ${projectId} and ownership = 'own' limit 5000`),
    rows<{ url: string | null; name: string }>(sql`select url, name from catalog_products where project_id = ${projectId} limit 20000`),
  ]);
  const pages: OwnPage[] = [];
  const tree = sitemap[0]?.data?.tree;
  const origin = sitemap[0]?.data?.origin ?? (project[0] ? `https://${project[0].domain}` : "");
  const walk = (n: SitemapNode | undefined, depth: number) => {
    if (!n || depth > 8) return;
    for (const s of n.samples ?? []) if (typeof s === "string") pages.push({ url: s });
    if (n.path && n.path !== "/" && origin) pages.push({ url: `${origin.replace(/\/$/, "")}${n.path}` });
    for (const c of n.children ?? []) walk(c, depth + 1);
  };
  walk(tree, 0);
  for (const c of cited) pages.push({ url: c.url, title: c.title });
  for (const c of catalog) if (c.url) pages.push({ url: c.url, title: c.name });
  const p = project[0];
  const brandTokens = p
    ? [p.name.replace(/^Demo · /, ""), ...(p.brand?.aliases ?? []), p.domain.split(".")[0] ?? ""].flatMap((s) => s.toLowerCase().split(/[^\p{L}\p{N}]+/u)).filter((s) => s.length >= 3)
    : [];
  return { pages, brandTokens };
}

async function pageIndexFor(projectId: string): Promise<{ idx: PageIndex; brandTokens: string[] }> {
  const { pages, brandTokens } = await loadOwnPages(projectId);
  return { idx: buildPageIndex(pages), brandTokens };
}

const json = (v: unknown) => sql`${JSON.stringify(v)}::jsonb`;

/** (Re)computes coverage of the project's fan-out queries against the own pages. */
export async function computeFanoutCoverage(projectId: string, opts: { all?: boolean } = {}): Promise<{ queries: number; covered: number; partial: number; gap: number; pages: number }> {
  const { idx, brandTokens } = await pageIndexFor(projectId);
  const keys = await rows<{ k: string }>(sql`
    select distinct lower(trim(query)) as k from ai_fanouts where project_id = ${projectId} ${opts.all ? sql`` : sql`and coverage is null`} limit 20000`);
  const out = { queries: keys.length, covered: 0, partial: 0, gap: 0, pages: idx.pages.length };
  if (!keys.length) return out;
  const vals = keys.map((r) => {
    const c = scoreCoverage(r.k, idx, brandTokens);
    if (c) out[c.coverage]++;
    return { k: r.k, coverage: c?.coverage ?? null, url: c?.url ?? null };
  });
  for (let i = 0; i < vals.length; i += 1000) {
    await db.execute(sql`
      update ai_fanouts f set coverage = v.coverage, coverage_url = v.url
      from jsonb_to_recordset(${json(vals.slice(i, i + 1000))}) as v(k text, coverage text, url text)
      where f.project_id = ${projectId} and lower(trim(f.query)) = v.k`);
  }
  return out;
}

/* ───────────────────────────── Intent classification ───────────────────────────── */

const intentSchema = z.object({
  items: z.array(z.object({ i: z.number().describe("Index of the query in the list"), intent: z.enum(FANOUT_INTENTS) })),
});

async function llmIntents(project: { id: string; workspaceId: string }, queries: string[]): Promise<Map<number, FanoutIntent>> {
  const res = await runLlm({
    purpose: "ai_fanout_intents",
    system: "You classify web search queries by search intent. Answer with JSON only.",
    prompt: `Classify each search query an AI assistant ran by its search intent:
- review: tests, ratings, experiences, pros/cons, "is X good"
- comparison: X vs Y, differences, which is better
- pricing: prices, costs, deals, cheapest, budget
- alternatives: alternatives to / competitors of something
- freshness: latest / new / current-year information, news
- how-to: instructions, setup, guides, "how to"
- other: anything else (definitions, best-of lists without the above, general facts)

Queries:
${queries.map((q, i) => `${i}. ${q}`).join("\n")}

Return one item per query with its index "i".`,
    schema: intentSchema,
    effort: "low",
    maxTokens: 4000,
    route: "auto",
    agentMode: "lean",
    projectId: project.id,
    workspaceId: project.workspaceId,
  });
  return new Map(res.data.items.filter((x) => x.i >= 0 && x.i < queries.length).map((x) => [x.i, x.intent]));
}

export type ClassifySummary = { queries: number; heuristic: number; llm: number; fallback: number; remaining: number; coverage: Awaited<ReturnType<typeof computeFanoutCoverage>> | null; llmError: string | null };

/**
 * Classifies unclassified fan-out queries of a project: keyword rules first, the rest in LLM
 * batches (no LLM for demo projects or when no AI provider is configured → "other"). Also fills
 * word counts and coverage. Idempotent; processes at most `maxQueries` distinct queries per call.
 */
export async function classifyFanouts(projectId: string, opts: { maxQueries?: number; llm?: boolean } = {}): Promise<ClassifySummary> {
  const [project] = await rows<{ id: string; workspace_id: string }>(sql`select id, workspace_id from projects where id = ${projectId}`);
  if (!project) throw new Error(`Project ${projectId} not found`);
  await db.execute(sql`
    update ai_fanouts set word_count = coalesce(array_length(regexp_split_to_array(trim(query), '\\s+'), 1), 0)
    where project_id = ${projectId} and word_count is null`);
  const max = opts.maxQueries ?? 600;
  const pending = await rows<{ k: string; query: string }>(sql`
    select lower(trim(query)) as k, min(query) as query from ai_fanouts
    where project_id = ${projectId} and intent is null
    group by 1 order by count(*) desc limit ${max}`);
  const summary: ClassifySummary = { queries: pending.length, heuristic: 0, llm: 0, fallback: 0, remaining: 0, coverage: null, llmError: null };
  const result = new Map<string, FanoutIntent>();
  const unknown: { k: string; query: string }[] = [];
  for (const p of pending) {
    const g = guessFanoutIntent(p.query);
    if (g) {
      result.set(p.k, g);
      summary.heuristic++;
    } else unknown.push(p);
  }
  const useLlm = opts.llm !== false && unknown.length > 0 && !(await isDemoProjectId(projectId));
  if (useLlm) {
    for (let i = 0; i < unknown.length; i += 80) {
      const batch = unknown.slice(i, i + 80);
      try {
        const got = await llmIntents({ id: project.id, workspaceId: project.workspace_id }, batch.map((b) => b.query));
        batch.forEach((b, j) => {
          const intent = got.get(j);
          if (intent) {
            result.set(b.k, intent);
            summary.llm++;
          }
        });
      } catch (err) {
        summary.llmError = err instanceof Error ? err.message.slice(0, 300) : String(err);
        if (!(err instanceof AiNotConfiguredError || err instanceof BudgetExceededError)) console.error(`[ai-fanouts] intent LLM batch failed for ${projectId}:`, summary.llmError);
        break;
      }
    }
  }
  for (const u of unknown) {
    if (!result.has(u.k)) {
      result.set(u.k, "other");
      summary.fallback++;
    }
  }
  const vals = [...result.entries()].map(([k, intent]) => ({ k, intent }));
  for (let i = 0; i < vals.length; i += 1000) {
    await db.execute(sql`
      update ai_fanouts f set intent = v.intent
      from jsonb_to_recordset(${json(vals.slice(i, i + 1000))}) as v(k text, intent text)
      where f.project_id = ${projectId} and f.intent is null and lower(trim(f.query)) = v.k`);
  }
  summary.coverage = await computeFanoutCoverage(projectId);
  const [left] = await rows<{ n: number }>(sql`select count(distinct lower(trim(query)))::int as n from ai_fanouts where project_id = ${projectId} and intent is null`);
  summary.remaining = Number(left?.n ?? 0);
  return summary;
}

export async function countUnclassifiedFanouts(projectId: string): Promise<number> {
  const [r] = await rows<{ n: number }>(sql`select count(distinct lower(trim(query)))::int as n from ai_fanouts where project_id = ${projectId} and intent is null`);
  return Number(r?.n ?? 0);
}
