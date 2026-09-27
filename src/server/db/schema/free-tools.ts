// Schema for the "free-tools" module (open-seo's 8 free SEO tools, in-app + public /free-tools).
// Owned by the free-tools module; see docs/ARCHITECTURE.md and docs/research/open-seo-inventory.md §22.
import { bigint, boolean, doublePrecision, index, integer, jsonb, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import type {
  CheckBrand,
  CheckProgress,
  CheckPrompt,
  CheckResults,
  ReadinessResult,
  VisibilityCheckStatus,
  VisibilityCheckStep,
  VisibilityCheckSurface,
} from "@/features/visibility-check/types";
import { createdAt, ts, updatedAt } from "./_helpers";
import { projects, users, workspaces } from "./core";

/**
 * Result cache shared by the public tools and the in-app hub (replaces open-seo's per-colo Cache API).
 * `key` = `{tool}|{cacheKey}`. Failure envelopes (`ok=false`) are cached briefly so a failing target isn't retried
 * in a loop — the DataForSEO money was already spent.
 */
export const freeToolCache = pgTable(
  "free_tool_cache",
  {
    key: text().primaryKey(),
    tool: text().notNull(),
    ok: boolean().notNull(),
    data: jsonb().$type<unknown>(),
    error: text(),
    expiresAt: ts().notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("free_tool_cache_expires_idx").on(t.expiresAt)],
);

/**
 * Daily budget ledger for the public tools (replaces open-seo's `FreeToolBudget` Durable Object).
 * One row per UTC day and counter key: `all` (every paid tool), `tool:{slug}`, `visitor:{sha256(day:ip)}`.
 * Reservations lock the rows of one request (`SELECT … FOR UPDATE`) and apply every ceiling in one transaction.
 */
export const freeToolCounters = pgTable(
  "free_tool_counters",
  {
    /** UTC day, `YYYY-MM-DD`. */
    day: text().notNull(),
    key: text().notNull(),
    /** Reserved billable DataForSEO calls (never refunded, like open-seo). */
    calls: integer().notNull().default(0),
    /** Reserved estimated spend in millionths of a USD. */
    microUsd: bigint({ mode: "number" }).notNull().default(0),
    /** Requests answered (cache hits + provider runs, incl. free RDAP lookups). */
    runs: integer().notNull().default(0),
    cacheHits: integer().notNull().default(0),
    /** Requests refused by the protection pipeline (rate limit, verification, budget). */
    blocked: integer().notNull().default(0),
    updatedAt: updatedAt(),
  },
  (t) => [primaryKey({ columns: [t.day, t.key] })],
);

/**
 * Free AI Visibility Check (public `/free-tools/ai-visibility-check` + in-app tools hub). The id is an unguessable
 * capability (`fvc_` + 128 random bits): whoever has the link can view the report. Rows expire after 30 days and are
 * deleted by the cleanup schedule (incl. the optional email).
 */
export const freeVisibilityChecks = pgTable(
  "free_visibility_checks",
  {
    id: text().primaryKey(),
    domain: text().notNull(),
    /** ISO market ("DE", "UK", …). */
    country: text().notNull(),
    language: text().notNull(),
    /** Optional address the result link is mailed to. */
    email: text(),
    surface: text().$type<VisibilityCheckSurface>().notNull().default("public"),
    status: text().$type<VisibilityCheckStatus>().notNull().default("queued"),
    step: text().$type<VisibilityCheckStep>().notNull().default("queued"),
    progress: jsonb().$type<CheckProgress>(),
    brand: jsonb().$type<CheckBrand>(),
    prompts: jsonb().$type<CheckPrompt[]>().notNull().default([]),
    results: jsonb().$type<CheckResults>(),
    readiness: jsonb().$type<ReadinessResult>(),
    /** Overall 0–100 (readiness + visibility), readiness only when the AI part could not run. */
    score: integer(),
    readinessScore: integer(),
    visibilityScore: integer(),
    /** Actual provider spend reported by the engines (USD). */
    costUsd: doublePrecision().notNull().default(0),
    /** Spend charged to the public free-tools budget ledger: reserved (estimate) at start, reconciled to the actual spend when done. */
    reservedUsd: doublePrecision().notNull().default(0),
    /** false when the daily budget was exhausted at start: readiness only, no paid AI calls. */
    aiAllowed: boolean().notNull().default(true),
    /** Day-scoped sha256 of the visitor IP (public checks), never the raw IP. */
    ipHash: text(),
    userId: text().references(() => users.id, { onDelete: "set null" }),
    workspaceId: text().references(() => workspaces.id, { onDelete: "set null" }),
    /** Project the in-app check was started from (costs are attributed to it). */
    projectId: text().references(() => projects.id, { onDelete: "set null" }),
    /** Project created from this check ("Track this daily"). */
    convertedProjectId: text().references(() => projects.id, { onDelete: "set null" }),
    error: text(),
    emailSentAt: ts(),
    startedAt: ts(),
    completedAt: ts(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    expiresAt: ts().notNull(),
  },
  (t) => [
    index("free_visibility_checks_ip_idx").on(t.ipHash, t.createdAt),
    index("free_visibility_checks_created_idx").on(t.createdAt),
    index("free_visibility_checks_expires_idx").on(t.expiresAt),
    index("free_visibility_checks_project_idx").on(t.projectId, t.createdAt),
    index("free_visibility_checks_domain_idx").on(t.domain, t.country, t.createdAt),
  ],
);
