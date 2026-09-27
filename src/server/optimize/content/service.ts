import "server-only";
import { and, asc, desc, eq, inArray, isNotNull, sql, type SQL } from "drizzle-orm";
import { db } from "@/server/db/client";
import {
  contentPersonas,
  contentPieces,
  contentScoreSnapshots,
  jobs,
  type ContentCitation,
  type ContentGrounding,
  type ContentEntity,
  type ContentFaq,
  type ContentStatus,
} from "@/server/db/schema";
import { markdownToText, slugify } from "@/server/optimize/markdown";
import { scoreContent } from "./aeo-score";

export type ContentRow = typeof contentPieces.$inferSelect;

export type ContentListItem = {
  id: string;
  title: string;
  kind: "article" | "rewrite";
  status: ContentStatus;
  targetPrompt: string | null;
  targetKeyword: string | null;
  aeoScore: number | null;
  baselineScore: number | null;
  wordCount: number;
  publishedUrl: string | null;
  publishProvider: string | null;
  sourceUrl: string | null;
  generationStage: string | null;
  error: string | null;
  updatedAt: string;
  createdAt: string;
};

export function toContentListItem(r: ContentRow): ContentListItem {
  return {
    id: r.id,
    title: r.title,
    kind: r.kind,
    status: r.status,
    targetPrompt: r.targetPrompt,
    targetKeyword: r.targetKeyword,
    aeoScore: r.aeoScore,
    baselineScore: r.baselineScore,
    wordCount: r.wordCount,
    publishedUrl: r.publishedUrl,
    publishProvider: r.publishProvider,
    sourceUrl: r.sourceUrl,
    generationStage: r.generationStage,
    error: r.error,
    updatedAt: r.updatedAt.toISOString(),
    createdAt: r.createdAt.toISOString(),
  };
}

export async function listContent(projectId: string): Promise<ContentListItem[]> {
  const rows = await db.select().from(contentPieces).where(eq(contentPieces.projectId, projectId)).orderBy(desc(contentPieces.updatedAt)).limit(1000);
  return rows.map(toContentListItem);
}

export async function contentDashboard(projectId: string) {
  const [agg] = await db
    .select({
      avg: sql<number | null>`avg(${contentPieces.aeoScore}) filter (where ${contentPieces.status} not in ('generating', 'failed'))`.mapWith((v) => (v == null ? null : Number(v))),
      optimized: sql<number>`count(*) filter (where ${contentPieces.aeoScore} >= 70 and ${contentPieces.status} not in ('generating', 'failed'))`.mapWith(Number),
      primary: sql<number>`count(*) filter (where ${contentPieces.aeoScore} >= 87 and ${contentPieces.status} not in ('generating', 'failed'))`.mapWith(Number),
      published: sql<number>`count(*) filter (where ${contentPieces.status} = 'published')`.mapWith(Number),
      review: sql<number>`count(*) filter (where ${contentPieces.status} = 'in_review')`.mapWith(Number),
      drafts: sql<number>`count(*) filter (where ${contentPieces.status} = 'draft')`.mapWith(Number),
      generating: sql<number>`count(*) filter (where ${contentPieces.status} = 'generating')`.mapWith(Number),
      total: sql<number>`count(*)`.mapWith(Number),
    })
    .from(contentPieces)
    .where(eq(contentPieces.projectId, projectId));

  const improving = await db
    .select({
      id: contentPieces.id,
      title: contentPieces.title,
      score: contentPieces.aeoScore,
      baseline: contentPieces.baselineScore,
      url: contentPieces.publishedUrl,
      sourceUrl: contentPieces.sourceUrl,
    })
    .from(contentPieces)
    .where(and(eq(contentPieces.projectId, projectId), isNotNull(contentPieces.aeoScore), isNotNull(contentPieces.baselineScore)))
    .orderBy(desc(sql`${contentPieces.aeoScore} - ${contentPieces.baselineScore}`))
    .limit(5);

  // Weekly average score trend (from snapshots)
  const trend = (await db.execute(sql`
    select to_char(date_trunc('week', created_at), 'YYYY-MM-DD') as week, round(avg(score))::int as score, count(distinct content_id)::int as pages
    from content_score_snapshots where project_id = ${projectId} and created_at > now() - interval '120 days'
    group by 1 order by 1`)) as unknown as Array<{ week: string; score: number; pages: number }>;

  return {
    avgScore: agg?.avg == null ? null : Math.round(agg.avg),
    optimized: agg?.optimized ?? 0,
    primary: agg?.primary ?? 0,
    published: agg?.published ?? 0,
    review: agg?.review ?? 0,
    drafts: agg?.drafts ?? 0,
    generating: agg?.generating ?? 0,
    total: agg?.total ?? 0,
    improving: improving
      .filter((r) => (r.score ?? 0) > (r.baseline ?? 0))
      .map((r) => ({ id: r.id, title: r.title, score: r.score!, baseline: r.baseline!, delta: r.score! - r.baseline!, url: r.url ?? r.sourceUrl })),
    trend: trend.map((t) => ({ date: t.week, score: Number(t.score), pages: Number(t.pages) })),
  };
}

export async function getContent(projectId: string, id: string): Promise<ContentRow | null> {
  const [row] = await db
    .select()
    .from(contentPieces)
    .where(and(eq(contentPieces.projectId, projectId), eq(contentPieces.id, id)))
    .limit(1);
  return row ?? null;
}

/**
 * Fan-out queries AI engines ran for the piece's target prompt (tracked prompt with the same text),
 * most frequent first — input for the Depth pillar's fan-out coverage.
 */
export async function loadTargetFanouts(projectId: string, targetPrompt: string | null | undefined, limit = 25): Promise<string[]> {
  const target = (targetPrompt ?? "").trim();
  if (!target) return [];
  const rows = (await db.execute(sql`
    select min(f.query) as query, count(*)::int as n
    from ai_fanouts f join prompts p on p.id = f.prompt_id
    where f.project_id = ${projectId} and p.project_id = ${projectId} and lower(trim(p.text)) = lower(${target})
      and f.answer_date > (now() - interval '120 days')::date
    group by lower(trim(f.query)) order by n desc, 1 limit ${limit}`)) as unknown as Array<{ query: string; n: number }>;
  return rows.map((r) => r.query);
}

/** Internal knowledge citations ground the draft but aren't visible on the page — they don't count for fact density. */
export function publicCitations(citations: ContentCitation[] | null | undefined): ContentCitation[] {
  return (citations ?? []).filter((c) => c.type !== "internal");
}

export function computeScore(
  row: Pick<ContentRow, "title" | "body" | "metaTitle" | "metaDescription" | "slug" | "schemaJsonLd" | "faqs" | "targetKeyword" | "targetPrompt" | "entities" | "citations">,
  fanouts?: string[],
) {
  return scoreContent({
    title: row.title,
    body: row.body,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    slug: row.slug,
    schemaJsonLd: row.schemaJsonLd,
    faqs: row.faqs,
    targetKeyword: row.targetKeyword,
    targetPrompt: row.targetPrompt,
    entities: row.entities,
    citations: publicCitations(row.citations),
    fanouts,
  });
}

/** Recomputes score + word count, snapshots the score when it changed. */
export async function rescoreAndSnapshot(row: ContentRow): Promise<{ score: number; pillars: Record<string, number> }> {
  const result = computeScore(row, await loadTargetFanouts(row.projectId, row.targetPrompt).catch(() => []));
  const wordCount = markdownToText(row.body).split(/\s+/).filter(Boolean).length;
  await db
    .update(contentPieces)
    .set({ aeoScore: result.score, pillarScores: result.pillars, wordCount, baselineScore: row.baselineScore ?? result.score })
    .where(eq(contentPieces.id, row.id));
  const [last] = await db
    .select({ score: contentScoreSnapshots.score, createdAt: contentScoreSnapshots.createdAt })
    .from(contentScoreSnapshots)
    .where(eq(contentScoreSnapshots.contentId, row.id))
    .orderBy(desc(contentScoreSnapshots.createdAt))
    .limit(1);
  if (!last || last.score !== result.score) {
    await db.insert(contentScoreSnapshots).values({ contentId: row.id, projectId: row.projectId, score: result.score, pillars: result.pillars });
  }
  return { score: result.score, pillars: result.pillars };
}

export type ContentPatch = {
  title?: string;
  body?: string;
  status?: ContentStatus;
  targetPrompt?: string | null;
  targetKeyword?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  slug?: string | null;
  schemaJsonLd?: string | null;
  faqs?: ContentFaq[];
  entities?: ContentEntity[];
  citations?: ContentCitation[];
  personaId?: string | null;
  grounding?: ContentGrounding | null;
};

export async function saveContent(projectId: string, id: string, patch: ContentPatch, userId: string) {
  const row = await getContent(projectId, id);
  if (!row) throw new Error("Content not found");
  if (row.status === "generating" && patch.status === undefined) throw new Error("This draft is still being generated.");
  const next = { ...row, ...patch, updatedBy: userId };
  if (patch.slug !== undefined) next.slug = patch.slug ? slugify(patch.slug) : null;
  await db
    .update(contentPieces)
    .set({ ...patch, slug: next.slug, updatedBy: userId })
    .where(eq(contentPieces.id, id));
  const scored = await rescoreAndSnapshot(next);
  if (patch.status === "published" && row.status !== "published") {
    const { emitContentPublished } = await import("@/server/webhooks/emitters");
    await emitContentPublished(projectId, id, { provider: null });
  }
  return { ...scored, slug: next.slug, updatedAt: new Date().toISOString() };
}

export async function createContent(
  projectId: string,
  input: {
    title: string;
    kind?: "article" | "rewrite";
    status?: ContentStatus;
    targetPrompt?: string | null;
    targetKeyword?: string | null;
    topic?: string | null;
    language?: string;
    personaId?: string | null;
    taskId?: string | null;
    sourceUrl?: string | null;
    brief?: ContentRow["brief"];
    body?: string;
    generationStage?: string | null;
    grounding?: ContentGrounding | null;
  },
  userId: string | null,
) {
  const [row] = await db
    .insert(contentPieces)
    .values({
      projectId,
      title: input.title,
      kind: input.kind ?? "article",
      status: input.status ?? "draft",
      targetPrompt: input.targetPrompt ?? null,
      targetKeyword: input.targetKeyword ?? null,
      topic: input.topic ?? null,
      language: input.language ?? "en",
      personaId: input.personaId ?? null,
      taskId: input.taskId ?? null,
      sourceUrl: input.sourceUrl ?? null,
      brief: input.brief ?? null,
      body: input.body ?? "",
      slug: slugify(input.targetKeyword || input.title),
      generationStage: input.generationStage ?? null,
      grounding: input.grounding ?? null,
      createdBy: userId,
      updatedBy: userId,
    })
    .returning();
  return row!;
}

export async function deleteContent(projectId: string, ids: string[]) {
  await db.delete(contentPieces).where(and(eq(contentPieces.projectId, projectId), inArray(contentPieces.id, ids)));
}

export async function contentJobState(projectId: string, contentId: string) {
  const [row] = await db
    .select({ status: contentPieces.status, stage: contentPieces.generationStage, error: contentPieces.error, updatedAt: contentPieces.updatedAt })
    .from(contentPieces)
    .where(and(eq(contentPieces.projectId, projectId), eq(contentPieces.id, contentId)))
    .limit(1);
  return row ? { ...row, updatedAt: row.updatedAt.toISOString() } : null;
}

export async function scoreHistory(contentId: string) {
  const rows = await db
    .select({ score: contentScoreSnapshots.score, createdAt: contentScoreSnapshots.createdAt })
    .from(contentScoreSnapshots)
    .where(eq(contentScoreSnapshots.contentId, contentId))
    .orderBy(asc(contentScoreSnapshots.createdAt))
    .limit(200);
  return rows.map((r) => ({ date: r.createdAt.toISOString(), score: r.score }));
}

/* ─────────────── Personas ─────────────── */

export async function listPersonas(projectId: string) {
  return db.select().from(contentPersonas).where(eq(contentPersonas.projectId, projectId)).orderBy(asc(contentPersonas.topic), asc(contentPersonas.name));
}

export async function personaJobsRunning(projectId: string) {
  const rows = await db
    .select({ payload: jobs.payload })
    .from(jobs)
    .where(and(eq(jobs.projectId, projectId), eq(jobs.type, "optimize.content.personas"), inArray(jobs.status, ["queued", "running"])));
  return rows.map((r) => String((r.payload as { topic?: string }).topic ?? ""));
}

/* ─────────────── Published content performance ─────────────── */

/** Host-less, protocol-less, slash-trimmed URL key ("example.com/blog/x") for matching across tables. */
export function urlKey(url: string): string | null {
  try {
    const u = new URL(url);
    return `${u.hostname.replace(/^www\./, "").toLowerCase()}${u.pathname.replace(/\/+$/, "") || ""}`;
  } catch {
    return null;
  }
}

/** Path part of a URL key ("/blog/x", "/" for the homepage). */
function keyPath(key: string): string {
  const slash = key.indexOf("/");
  return slash >= 0 ? key.slice(slash) : "/";
}

export type ContentPerformanceRow = {
  id: string;
  title: string;
  url: string;
  aiCitations: number;
  aiEngines: string[];
  botHits: number;
  bots: string[];
  gscClicks: number;
  gscImpressions: number;
};

/**
 * What happened to published pages in the last 30 days: citations in tracked AI answers, AI crawler
 * hits (bot traffic logs) and Google Search Console clicks — read-only lookups on existing tables.
 */
export async function contentPerformance(projectId: string): Promise<{ rows: ContentPerformanceRow[]; sources: { citations: boolean; bots: boolean; gsc: boolean } }> {
  const pieces = await db
    .select({ id: contentPieces.id, title: contentPieces.title, publishedUrl: contentPieces.publishedUrl, sourceUrl: contentPieces.sourceUrl, kind: contentPieces.kind, status: contentPieces.status })
    .from(contentPieces)
    .where(and(eq(contentPieces.projectId, projectId), sql`(${contentPieces.publishedUrl} is not null or (${contentPieces.kind} = 'rewrite' and ${contentPieces.sourceUrl} is not null))`))
    .orderBy(desc(contentPieces.updatedAt))
    .limit(200);
  const items = pieces
    .map((p) => {
      const url = p.publishedUrl ?? p.sourceUrl!;
      return { ...p, url, key: urlKey(url) };
    })
    .filter((p): p is typeof p & { key: string } => !!p.key);
  if (!items.length) return { rows: [], sources: { citations: false, bots: false, gsc: false } };
  const keys = [...new Set(items.map((i) => i.key))];
  const paths = [...new Set(items.map((i) => keyPath(i.key)))];
  const keyList = sql.join(keys.map((k) => sql`${k}`), sql`, `);
  const pathList = sql.join(paths.map((k) => sql`${k}`), sql`, `);
  const norm = (col: SQL) => sql`rtrim(regexp_replace(split_part(split_part(lower(${col}), '#', 1), '?', 1), '^https?://(www\\.)?', ''), '/')`;

  const [cit, bots, gsc] = await Promise.all([
    db.execute(sql`
      select ${norm(sql`s.url`)} as key, count(*)::int as n, array_agg(distinct c.engine) as engines
      from ai_citations c join ai_sources s on s.id = c.source_id
      where c.project_id = ${projectId} and s.project_id = ${projectId} and c.answer_date >= (current_date - 30)
        and ${norm(sql`s.url`)} in (${keyList})
      group by 1`) as unknown as Promise<Array<{ key: string; n: number; engines: string[] }>>,
    db.execute(sql`
      select coalesce(nullif(rtrim(split_part(path, '?', 1), '/'), ''), '/') as path, count(*)::int as n, array_agg(distinct bot) as bots
      from analytics_bot_visits
      where project_id = ${projectId} and ts >= now() - interval '30 days'
        and coalesce(nullif(rtrim(split_part(path, '?', 1), '/'), ''), '/') in (${pathList})
      group by 1`) as unknown as Promise<Array<{ path: string; n: number; bots: string[] }>>,
    db.execute(sql`
      select ${norm(sql`page`)} as key, sum(clicks)::int as clicks, sum(impressions)::int as impressions
      from analytics_sc_pages
      where project_id = ${projectId} and source = 'google' and date >= (current_date - 28)
        and ${norm(sql`page`)} in (${keyList})
      group by 1`) as unknown as Promise<Array<{ key: string; clicks: number; impressions: number }>>,
  ]);
  const citBy = new Map(cit.map((r) => [r.key, r]));
  const botBy = new Map(bots.map((r) => [r.path, r]));
  const gscBy = new Map(gsc.map((r) => [r.key, r]));
  const rows = items.map((i) => {
    const c = citBy.get(i.key);
    const b = botBy.get(keyPath(i.key));
    const g = gscBy.get(i.key);
    return {
      id: i.id,
      title: i.title,
      url: i.url,
      aiCitations: Number(c?.n ?? 0),
      aiEngines: (c?.engines ?? []).filter(Boolean),
      botHits: Number(b?.n ?? 0),
      bots: (b?.bots ?? []).filter(Boolean),
      gscClicks: Number(g?.clicks ?? 0),
      gscImpressions: Number(g?.impressions ?? 0),
    };
  });
  return { rows, sources: { citations: cit.length > 0, bots: bots.length > 0, gsc: gsc.length > 0 } };
}
