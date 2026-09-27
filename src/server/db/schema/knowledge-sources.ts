// Schema for connected knowledge sources (Notion, Google Drive, Slack, uploads, URLs) that ground
// content generation in the brand's own expertise. Chunks are full-text indexed (tsvector + GIN).
import { pgTable, text, integer, jsonb, index, boolean, customType } from "drizzle-orm/pg-core";
import { id, createdAt, updatedAt, ts } from "./_helpers";
import { projects, users } from "./core";

export const KNOWLEDGE_SOURCE_KINDS = ["notion", "gdrive", "slack", "upload", "url"] as const;
export type KnowledgeSourceKind = (typeof KNOWLEDGE_SOURCE_KINDS)[number];

export const KNOWLEDGE_SOURCE_STATUSES = ["pending", "syncing", "ready", "error"] as const;
export type KnowledgeSourceStatus = (typeof KNOWLEDGE_SOURCE_STATUSES)[number];

/** Non-secret connector settings (the token lives encrypted in `secret`). */
export type KnowledgeSourceConfig = {
  /** notion: only pages under these page/database ids (empty = every page shared with the integration) */
  rootIds?: string[];
  /** notion/workspace display name (from the token check) */
  workspaceName?: string | null;
  /** gdrive: linked workspace Google account (google_accounts.id) */
  googleAccountId?: string;
  googleEmail?: string | null;
  /** gdrive: folder to sync (null = files shared with / owned by the account, most recent first) */
  folderId?: string | null;
  folderName?: string | null;
  /** slack: channel ids + names to read */
  channels?: { id: string; name: string }[];
  /** slack: history window in days */
  days?: number;
  teamUrl?: string | null;
  teamName?: string | null;
  /** url: pages to fetch */
  urls?: string[];
  /** url: also follow same-site links found on those pages */
  followLinks?: boolean;
  /** Max documents per sync */
  maxDocs?: number;
  /** upload: original file names */
  files?: { docId: string; name: string; bytes: number; uploadedAt: string }[];
};

export const knowledgeSources = pgTable(
  "knowledge_sources",
  {
    id: id("ksr"),
    projectId: text()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    kind: text({ enum: KNOWLEDGE_SOURCE_KINDS }).notNull(),
    name: text().notNull(),
    config: jsonb().$type<KnowledgeSourceConfig>().notNull().default({}),
    /** Encrypted token (Notion integration token / Slack bot token). */
    secret: text(),
    status: text({ enum: KNOWLEDGE_SOURCE_STATUSES }).notNull().default("pending"),
    error: text(),
    /** Non-fatal notes of the last sync (skipped files, unreadable channels, limits reached). */
    notes: jsonb().$type<string[]>().notNull().default([]),
    /** Re-sync daily (remote sources only). */
    autoSync: boolean().notNull().default(true),
    lastSyncAt: ts(),
    docCount: integer().notNull().default(0),
    chunkCount: integer().notNull().default(0),
    /** Sync job currently running for this source. */
    jobId: text(),
    createdBy: text().references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("knowledge_sources_project_idx").on(t.projectId, t.kind)],
);

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

/** Retrieval unit (~800 tokens with overlap). `tsv` is written on insert with the project's text-search config. */
export const knowledgeChunks = pgTable(
  "knowledge_chunks",
  {
    id: id("kch"),
    sourceId: text()
      .notNull()
      .references(() => knowledgeSources.id, { onDelete: "cascade" }),
    projectId: text()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    /** Stable id of the document within the source (Notion page id, Drive file id, URL, …). */
    docId: text().notNull(),
    title: text().notNull().default(""),
    url: text(),
    /** Chunk index within the document. */
    position: integer().notNull().default(0),
    text: text().notNull(),
    tokens: integer().notNull().default(0),
    /** Postgres text-search config the tsv was built with (german, english, simple, …). */
    lang: text().notNull().default("simple"),
    tsv: tsvector(),
    docUpdatedAt: ts(),
    createdAt: createdAt(),
  },
  (t) => [
    index("knowledge_chunks_source_doc_idx").on(t.sourceId, t.docId),
    index("knowledge_chunks_project_idx").on(t.projectId),
    index("knowledge_chunks_tsv_idx").using("gin", t.tsv),
  ],
);
