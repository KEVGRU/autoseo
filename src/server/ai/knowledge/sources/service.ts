import "server-only";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import {
  knowledgeChunks,
  knowledgeSources,
  projects,
  type ContentGrounding,
  type KnowledgeSourceConfig,
  type KnowledgeSourceKind,
} from "@/server/db/schema";
import { decryptJson, encryptJson } from "@/server/crypto";
import { enqueueJob } from "@/server/jobs/queue";
import { chunkText } from "./chunking";
import { buildOrTsQuery, excerpt, formatKnowledgeContext, rerankChunks, tsConfigForLanguage, type RetrievalCandidate } from "./retrieval";
import { fetchNotionDocs } from "./notion";
import { fetchSlackDocs } from "./slack";
import { driveAccessToken, fetchDriveDocs } from "./gdrive";
import { fetchUrlDocs } from "./url";
import { KnowledgeSourceError, type FetchResult, type SourceDoc } from "./types";

export const KNOWLEDGE_SYNC_JOB = "knowledge.source.sync";
export const REMOTE_KINDS: KnowledgeSourceKind[] = ["notion", "gdrive", "slack", "url"];

export const SOURCE_KIND_LABEL: Record<KnowledgeSourceKind, string> = {
  notion: "Notion",
  gdrive: "Google Drive",
  slack: "Slack",
  upload: "Upload",
  url: "Website",
};

type SourceRow = typeof knowledgeSources.$inferSelect;
type SourceSecret = { token: string };

/** Client-safe view (never includes the token). */
export type PublicKnowledgeSource = {
  id: string;
  kind: KnowledgeSourceKind;
  name: string;
  status: SourceRow["status"];
  error: string | null;
  notes: string[];
  autoSync: boolean;
  lastSyncAt: string | null;
  docCount: number;
  chunkCount: number;
  hasSecret: boolean;
  config: KnowledgeSourceConfig;
  createdAt: string;
};

export function toPublicSource(r: SourceRow): PublicKnowledgeSource {
  return {
    id: r.id,
    kind: r.kind,
    name: r.name,
    status: r.status,
    error: r.error,
    notes: r.notes ?? [],
    autoSync: r.autoSync,
    lastSyncAt: r.lastSyncAt?.toISOString() ?? null,
    docCount: r.docCount,
    chunkCount: r.chunkCount,
    hasSecret: !!r.secret,
    config: r.config ?? {},
    createdAt: r.createdAt.toISOString(),
  };
}

export async function listKnowledgeSources(projectId: string): Promise<PublicKnowledgeSource[]> {
  const rows = await db.select().from(knowledgeSources).where(eq(knowledgeSources.projectId, projectId)).orderBy(desc(knowledgeSources.createdAt));
  return rows.map(toPublicSource);
}

export async function getKnowledgeSource(projectId: string, sourceId: string): Promise<SourceRow | null> {
  const [row] = await db
    .select()
    .from(knowledgeSources)
    .where(and(eq(knowledgeSources.projectId, projectId), eq(knowledgeSources.id, sourceId)))
    .limit(1);
  return row ?? null;
}

export function encryptSourceToken(token: string): string {
  return encryptJson({ token: token.trim() } satisfies SourceSecret);
}

function sourceToken(row: SourceRow): string {
  if (!row.secret) throw new KnowledgeSourceError("The access token is missing — reconnect this source.");
  try {
    return decryptJson<SourceSecret>(row.secret).token;
  } catch {
    throw new KnowledgeSourceError("The stored token can't be decrypted — reconnect this source.");
  }
}

export async function createKnowledgeSource(input: {
  projectId: string;
  kind: KnowledgeSourceKind;
  name: string;
  config: KnowledgeSourceConfig;
  token?: string | null;
  autoSync?: boolean;
  userId: string | null;
}): Promise<SourceRow> {
  const [row] = await db
    .insert(knowledgeSources)
    .values({
      projectId: input.projectId,
      kind: input.kind,
      name: input.name.slice(0, 200),
      config: input.config,
      secret: input.token ? encryptSourceToken(input.token) : null,
      autoSync: input.kind === "upload" ? false : (input.autoSync ?? true),
      status: input.kind === "upload" ? "ready" : "pending",
      createdBy: input.userId,
    })
    .returning();
  return row!;
}

export async function updateKnowledgeSource(
  projectId: string,
  sourceId: string,
  patch: { name?: string; autoSync?: boolean; config?: Partial<KnowledgeSourceConfig>; token?: string | null },
): Promise<SourceRow> {
  const row = await getKnowledgeSource(projectId, sourceId);
  if (!row) throw new KnowledgeSourceError("Source not found.");
  const [next] = await db
    .update(knowledgeSources)
    .set({
      ...(patch.name ? { name: patch.name.slice(0, 200) } : {}),
      ...(patch.autoSync !== undefined && row.kind !== "upload" ? { autoSync: patch.autoSync } : {}),
      ...(patch.config ? { config: { ...row.config, ...patch.config } } : {}),
      ...(patch.token ? { secret: encryptSourceToken(patch.token) } : {}),
    })
    .where(eq(knowledgeSources.id, row.id))
    .returning();
  return next!;
}

export async function deleteKnowledgeSource(projectId: string, sourceId: string): Promise<boolean> {
  const rows = await db
    .delete(knowledgeSources)
    .where(and(eq(knowledgeSources.projectId, projectId), eq(knowledgeSources.id, sourceId)))
    .returning({ id: knowledgeSources.id });
  return rows.length > 0;
}

/* ───────────────────────────── Sync ───────────────────────────── */

/** Queues a (re-)sync. Returns false when the queue refused it (demo projects never sync). */
export async function enqueueKnowledgeSync(row: Pick<SourceRow, "id" | "projectId" | "kind">, userId: string | null): Promise<boolean> {
  if (row.kind === "upload") return false;
  const job = await enqueueJob(
    KNOWLEDGE_SYNC_JOB,
    { sourceId: row.id, projectId: row.projectId },
    { projectId: row.projectId, createdBy: userId, dedupeKey: `${KNOWLEDGE_SYNC_JOB}:${row.id}`, maxAttempts: 1, priority: 80 },
  );
  if (!job) {
    await db
      .update(knowledgeSources)
      .set({ status: "error", error: "Sync is disabled for demo projects." })
      .where(and(eq(knowledgeSources.id, row.id), sql`${knowledgeSources.status} <> 'syncing'`));
    return false;
  }
  await db.update(knowledgeSources).set({ status: "syncing", error: null, jobId: job.id }).where(eq(knowledgeSources.id, row.id));
  return true;
}

async function projectLanguage(projectId: string): Promise<{ language: string; workspaceId: string }> {
  const [p] = await db.select({ language: projects.language, workspaceId: projects.workspaceId }).from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!p) throw new KnowledgeSourceError("Project not found.");
  return p;
}

async function fetchSourceDocs(row: SourceRow, workspaceId: string): Promise<FetchResult> {
  const cfg = row.config ?? {};
  switch (row.kind) {
    case "notion":
      return fetchNotionDocs(sourceToken(row), { rootIds: cfg.rootIds, maxDocs: cfg.maxDocs });
    case "slack":
      return fetchSlackDocs(sourceToken(row), { channels: cfg.channels ?? [], days: cfg.days, teamUrl: cfg.teamUrl, maxDocs: cfg.maxDocs });
    case "gdrive": {
      if (!cfg.googleAccountId) throw new KnowledgeSourceError("Pick a Google account for this source.");
      const token = await driveAccessToken(cfg.googleAccountId, workspaceId);
      return fetchDriveDocs(token, { folderId: cfg.folderId, maxDocs: cfg.maxDocs });
    }
    case "url":
      return fetchUrlDocs({ urls: cfg.urls ?? [], followLinks: cfg.followLinks, maxDocs: cfg.maxDocs });
    case "upload":
      return { docs: [], notes: [] };
  }
}

type ChunkInsert = typeof knowledgeChunks.$inferInsert;

function docsToChunks(row: Pick<SourceRow, "id" | "projectId">, docs: SourceDoc[], lang: string): ChunkInsert[] {
  const out: ChunkInsert[] = [];
  for (const doc of docs) {
    for (const c of chunkText(doc.text, { maxTokens: 800, overlapTokens: 100 })) {
      out.push({
        sourceId: row.id,
        projectId: row.projectId,
        docId: doc.docId.slice(0, 500),
        title: doc.title.slice(0, 500),
        url: doc.url?.slice(0, 2000) ?? null,
        position: c.position,
        text: c.text,
        tokens: c.tokens,
        lang,
        docUpdatedAt: doc.updatedAt ?? null,
      });
    }
  }
  return out;
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function insertChunks(tx: Tx, rows: ChunkInsert[]) {
  for (let i = 0; i < rows.length; i += 200) {
    const batch = rows.slice(i, i + 200);
    await tx.insert(knowledgeChunks).values(
      batch.map((r) => ({
        ...r,
        // Title weighs more than body text in ts_rank.
        tsv: sql`setweight(to_tsvector(${r.lang}::regconfig, ${r.title ?? ""}), 'A') || setweight(to_tsvector(${r.lang}::regconfig, ${r.text}), 'B')`,
      })),
    );
  }
}

async function refreshCounts(sourceId: string) {
  const [c] = await db
    .select({ docs: sql<number>`count(distinct ${knowledgeChunks.docId})`.mapWith(Number), chunks: sql<number>`count(*)`.mapWith(Number) })
    .from(knowledgeChunks)
    .where(eq(knowledgeChunks.sourceId, sourceId));
  return { docCount: c?.docs ?? 0, chunkCount: c?.chunks ?? 0 };
}

/** Job body: fetches all documents of a remote source and replaces its chunks. */
export async function runKnowledgeSync(sourceId: string): Promise<Record<string, unknown>> {
  const [row] = await db.select().from(knowledgeSources).where(eq(knowledgeSources.id, sourceId)).limit(1);
  if (!row) return { skipped: "missing" };
  if (row.kind === "upload") return { skipped: "upload" };
  await db.update(knowledgeSources).set({ status: "syncing", error: null }).where(eq(knowledgeSources.id, row.id));
  try {
    const { language, workspaceId } = await projectLanguage(row.projectId);
    const lang = tsConfigForLanguage(language);
    const { docs, notes } = await fetchSourceDocs(row, workspaceId);
    const chunks = docsToChunks(row, docs, lang);
    await db.transaction(async (tx) => {
      await tx.delete(knowledgeChunks).where(eq(knowledgeChunks.sourceId, row.id));
      await insertChunks(tx, chunks);
    });
    const counts = await refreshCounts(row.id);
    await db
      .update(knowledgeSources)
      .set({ ...counts, status: "ready", error: null, notes: notes.slice(0, 30), lastSyncAt: new Date(), jobId: null })
      .where(eq(knowledgeSources.id, row.id));
    return { docs: counts.docCount, chunks: counts.chunkCount, notes: notes.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(knowledgeSources)
      .set({ status: "error", error: message.slice(0, 1000), jobId: null, lastSyncAt: new Date() })
      .where(eq(knowledgeSources.id, row.id));
    return { failed: message };
  }
}

/** Adds (or replaces, by content hash) uploaded documents on an upload source. */
export async function addUploadedDocs(source: SourceRow, docs: { doc: SourceDoc; name: string; bytes: number }[]) {
  const { language } = await projectLanguage(source.projectId);
  const lang = tsConfigForLanguage(language);
  const chunks = docsToChunks(source, docs.map((d) => d.doc), lang);
  const ids = docs.map((d) => d.doc.docId);
  await db.transaction(async (tx) => {
    if (ids.length) await tx.delete(knowledgeChunks).where(and(eq(knowledgeChunks.sourceId, source.id), inArray(knowledgeChunks.docId, ids)));
    await insertChunks(tx, chunks);
  });
  const now = new Date().toISOString();
  const files = [
    ...(source.config.files ?? []).filter((f) => !ids.includes(f.docId)),
    ...docs.map((d) => ({ docId: d.doc.docId, name: d.name, bytes: d.bytes, uploadedAt: now })),
  ].slice(-500);
  const counts = await refreshCounts(source.id);
  await db
    .update(knowledgeSources)
    .set({ ...counts, config: { ...source.config, files }, status: "ready", error: null, lastSyncAt: new Date() })
    .where(eq(knowledgeSources.id, source.id));
  return counts;
}

/** Removes one uploaded document from an upload source. */
export async function removeUploadedDoc(source: SourceRow, docId: string) {
  await db.delete(knowledgeChunks).where(and(eq(knowledgeChunks.sourceId, source.id), eq(knowledgeChunks.docId, docId)));
  const counts = await refreshCounts(source.id);
  await db
    .update(knowledgeSources)
    .set({ ...counts, config: { ...source.config, files: (source.config.files ?? []).filter((f) => f.docId !== docId) } })
    .where(eq(knowledgeSources.id, source.id));
  return counts;
}

/* ───────────────────────────── Retrieval ───────────────────────────── */

export type KnowledgeHit = {
  chunkId: string;
  sourceId: string;
  sourceName: string;
  sourceKind: KnowledgeSourceKind;
  docId: string;
  title: string;
  url: string | null;
  text: string;
  excerpt: string;
  score: number;
  matched: string[];
};

type CandidateRow = RetrievalCandidate & { url: string | null; sourceName: string; sourceKind: KnowledgeSourceKind };

/**
 * Full-text search over a project's knowledge chunks (Postgres tsvector + GIN, OR-query on the
 * content terms), re-ranked by term coverage with at most two chunks per document.
 */
export async function searchKnowledge(projectId: string, query: string, k = 8, opts: { sourceIds?: string[] } = {}): Promise<KnowledgeHit[]> {
  const tsq = buildOrTsQuery(query);
  if (!tsq) return [];
  if (opts.sourceIds && !opts.sourceIds.length) return [];
  const { language } = await projectLanguage(projectId);
  const cfg = tsConfigForLanguage(language);
  const limit = Math.max(1, Math.min(50, k));
  const sourceFilter = opts.sourceIds?.length ? sql`and c.source_id in (${sql.join(opts.sourceIds.map((id) => sql`${id}`), sql`, `)})` : sql``;
  const rows = (await db.execute(sql`
    select c.id, c.source_id as "sourceId", c.doc_id as "docId", c.title, c.url, c.text,
      s.name as "sourceName", s.kind as "sourceKind",
      ts_rank_cd(c.tsv, q, 32) as rank
    from knowledge_chunks c
    join knowledge_sources s on s.id = c.source_id,
      to_tsquery(${cfg}::regconfig, ${tsq}) q
    where c.project_id = ${projectId} and c.tsv @@ q ${sourceFilter}
    order by rank desc
    limit ${limit * 8}`)) as unknown as Array<CandidateRow & { rank: string | number }>;
  const candidates = rows.map((r) => ({ ...r, rank: Number(r.rank) }));
  return rerankChunks(query, candidates, limit).map((c) => ({
    chunkId: c.id,
    sourceId: c.sourceId,
    sourceName: c.sourceName,
    sourceKind: c.sourceKind,
    docId: c.docId,
    title: c.title,
    url: c.url,
    text: c.text,
    excerpt: excerpt(c.text, query),
    score: c.score,
    matched: c.matched,
  }));
}

/** Source ids a grounding setting allows (null = all sources of the project). */
async function groundingSourceIds(projectId: string, grounding: ContentGrounding | null | undefined): Promise<string[] | null> {
  if (grounding?.mode === "none") return [];
  if (grounding?.mode !== "selected") return null;
  const ids = (grounding.sourceIds ?? []).slice(0, 50);
  if (!ids.length) return [];
  const rows = await db
    .select({ id: knowledgeSources.id })
    .from(knowledgeSources)
    .where(and(eq(knowledgeSources.projectId, projectId), inArray(knowledgeSources.id, ids)));
  return rows.map((r) => r.id);
}

export type GroundingContext = { hits: KnowledgeHit[]; prompt: string };

/** Retrieves internal knowledge for a generation prompt, honoring the piece's "Ground in" setting. */
export async function retrieveGrounding(projectId: string, grounding: ContentGrounding | null | undefined, query: string, k = 6): Promise<GroundingContext> {
  const ids = await groundingSourceIds(projectId, grounding);
  if (ids && !ids.length) return { hits: [], prompt: "" };
  const hits = await searchKnowledge(projectId, query, k, ids ? { sourceIds: ids } : {});
  const prompt = formatKnowledgeContext(
    hits.map((h) => ({ title: h.title, url: h.url, sourceName: h.sourceName, sourceKind: SOURCE_KIND_LABEL[h.sourceKind], text: h.text })),
  );
  return { hits, prompt };
}

/** Pseudo-URL for internal documents without a web address (kept stable for citation dedupe). */
export function internalDocUrl(hit: Pick<KnowledgeHit, "sourceId" | "docId" | "url">): string {
  return hit.url && /^https?:\/\//i.test(hit.url) ? hit.url : `knowledge://${hit.sourceId}/${encodeURIComponent(hit.docId)}`;
}

/** Counts for the Sources tab header / API. */
export async function knowledgeTotals(projectId: string) {
  const [t] = await db
    .select({ sources: sql<number>`count(*)`.mapWith(Number), docs: sql<number>`coalesce(sum(${knowledgeSources.docCount}), 0)`.mapWith(Number), chunks: sql<number>`coalesce(sum(${knowledgeSources.chunkCount}), 0)`.mapWith(Number) })
    .from(knowledgeSources)
    .where(eq(knowledgeSources.projectId, projectId));
  return { sources: t?.sources ?? 0, docs: t?.docs ?? 0, chunks: t?.chunks ?? 0 };
}
