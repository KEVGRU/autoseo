// Schema for the "reports" module (Report Builder: slide decks, AI HTML reports, templates,
// brand kits, uploaded assets, public share links). Owned by that module; see docs/ARCHITECTURE.md.
import { sql } from "drizzle-orm";
import { pgTable, text, integer, jsonb, index, uniqueIndex, boolean, primaryKey, date } from "drizzle-orm/pg-core";
import { id, createdAt, updatedAt, ts } from "./_helpers";
import { projects, users, workspaces } from "./core";

export type ReportDateRange = {
  /** 7d | 30d | 90d | mtd | last_month | custom */
  preset: string;
  from?: string;
  to?: string;
};

/**
 * A report. `kind = "deck"` is a slide deck edited in the canvas editor (`document` holds the deck
 * JSON, see src/features/reports/lib/types.ts). `kind = "html"` is an agent-written, self-contained
 * HTML report (open-seo style) rendered in a CSP sandbox.
 */
export const reports = pgTable(
  "reports",
  {
    id: id("rpt"),
    projectId: text()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    workspaceId: text()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    kind: text({ enum: ["deck", "html"] })
      .notNull()
      .default("deck"),
    title: text().notNull(),
    subtitle: text(),
    /** Library template key or `tpl:<id>` of a workspace template the report was created from. */
    templateKey: text(),
    status: text({ enum: ["draft", "published"] })
      .notNull()
      .default("draft"),
    /** Deck JSON (kind = deck). */
    document: jsonb().$type<Record<string, unknown>>(),
    /** Optimistic concurrency counter, bumped on every document save. */
    version: integer().notNull().default(1),
    dateRange: jsonb().$type<ReportDateRange>().notNull().default({ preset: "30d" }),
    /** Denormalized counts for the list view. */
    slideCount: integer().notNull().default(0),
    chartCount: integer().notNull().default(0),
    /** Theme colors shown as "Branding" dots in the list. */
    brandColors: jsonb().$type<string[]>().notNull().default([]),

    /* ── AI HTML reports (kind = html) ── */
    html: text(),
    summary: text(),
    prompt: text(),
    aiStatus: text({ enum: ["idle", "queued", "running", "ready", "failed"] })
      .notNull()
      .default("idle"),
    aiError: text(),
    aiJobId: text(),
    /** Client label for agent-written reports ("Claude Code", "Codex", "API key", "AutoSEO app"). */
    createdByLabel: text(),
    sizeBytes: integer().notNull().default(0),

    /* ── Public share link ── */
    shareToken: text(),
    shareEnabled: boolean().notNull().default(false),
    sharePasswordHash: text(),
    shareExpiresAt: ts(),
    /** live = data re-resolved on every view; snapshot = frozen data captured at publish time */
    shareMode: text({ enum: ["live", "snapshot"] })
      .notNull()
      .default("live"),
    snapshot: jsonb().$type<Record<string, unknown>>(),
    snapshotAt: ts(),
    shareViews: integer().notNull().default(0),
    sharedAt: ts(),
    publishedAt: ts(),

    createdBy: text().references(() => users.id, { onDelete: "set null" }),
    updatedBy: text().references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("reports_project_idx").on(t.projectId, t.updatedAt),
    uniqueIndex("reports_share_token_uq").on(t.shareToken),
  ],
);

/** "My Templates" — workspace-scoped report templates (Save → Save as template). */
export const reportTemplates = pgTable(
  "report_templates",
  {
    id: id("rtp"),
    workspaceId: text()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    kind: text({ enum: ["deck", "html"] })
      .notNull()
      .default("deck"),
    name: text().notNull(),
    description: text(),
    /** Deck JSON for deck templates. */
    document: jsonb().$type<Record<string, unknown>>(),
    /** Instructions for AI HTML report templates (audience, sections, tone, accent…). */
    instructions: text(),
    slideCount: integer().notNull().default(0),
    sourceReportId: text(),
    createdBy: text().references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("report_templates_workspace_idx").on(t.workspaceId, t.updatedAt)],
);

/** Uploaded images (report assets, logos, icons) stored on disk under DATA_DIR. */
export const reportAssets = pgTable(
  "report_assets",
  {
    id: id("ras"),
    workspaceId: text()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    /** null = workspace-level asset (agency logo…) */
    projectId: text().references(() => projects.id, { onDelete: "cascade" }),
    kind: text({ enum: ["image", "logo", "icon"] })
      .notNull()
      .default("image"),
    fileName: text().notNull(),
    mimeType: text().notNull(),
    sizeBytes: integer().notNull(),
    width: integer(),
    height: integer(),
    /** Path relative to DATA_DIR. */
    storagePath: text().notNull(),
    sha256: text().notNull(),
    createdBy: text().references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
  },
  (t) => [index("report_assets_workspace_idx").on(t.workspaceId, t.createdAt)],
);

export type BrandKitData = {
  /* agency (workspace scope) */
  agencyName?: string;
  agencyWebsite?: string;
  agencyEmail?: string;
  agencyLogo?: string;
  /* client (project scope) */
  clientName?: string;
  clientLogo?: string;
  clientColor?: string;
  /* look */
  mode?: "dark" | "light";
  accentColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  headingFont?: string;
  bodyFont?: string;
};

/**
 * Brand kits. `scope = "workspace"` holds the agency kit (name, logo, colors, fonts); a project id
 * as scope holds the client overrides (client name, logo, color).
 */
export const reportBrandKits = pgTable(
  "report_brand_kits",
  {
    workspaceId: text()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    scope: text().notNull(),
    data: jsonb().$type<BrandKitData>().notNull().default({}),
    updatedBy: text().references(() => users.id, { onDelete: "set null" }),
    updatedAt: updatedAt(),
  },
  (t) => [primaryKey({ columns: [t.workspaceId, t.scope] })],
);

/* ───────────────────────────── Scheduled delivery ───────────────────────────── */

export const REPORT_SCHEDULE_CADENCES = ["weekly", "monthly"] as const;
export const REPORT_SCHEDULE_FORMATS = ["link", "pptx", "both"] as const;
/** Reporting window of a scheduled send, resolved in the schedule's time zone at send time. */
export const REPORT_RANGE_PRESETS = ["last_7", "last_14", "last_30", "last_90", "last_week", "last_month", "last_quarter", "month_to_date", "report"] as const;
export type ReportRangePreset = (typeof REPORT_RANGE_PRESETS)[number];
export type ReportDeliveryResult = { email: string; delivered: boolean; transport: "smtp" | "log"; error?: string };

/**
 * Recurring email delivery of a report ("schedule automatic delivery by email"). The
 * `reports.schedule.tick` job claims due rows (`nextRunAt <= now`, FOR UPDATE SKIP LOCKED), advances
 * `nextRunAt` and queues `reports.schedule.send`.
 */
export const reportSchedules = pgTable(
  "report_schedules",
  {
    id: id("rsc"),
    reportId: text()
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    projectId: text()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    cadence: text({ enum: REPORT_SCHEDULE_CADENCES }).notNull().default("monthly"),
    /** 0 = Sunday … 6 = Saturday (weekly). */
    weekday: integer().notNull().default(1),
    /** 1–31 (monthly); days past the end of a month send on its last day. */
    monthDay: integer().notNull().default(1),
    /** Local hour (0–23) in `timezone`. */
    hour: integer().notNull().default(8),
    /** IANA time zone, e.g. Europe/Berlin. */
    timezone: text().notNull().default("UTC"),
    recipients: text().array().notNull().default(sql`'{}'::text[]`),
    format: text({ enum: REPORT_SCHEDULE_FORMATS }).notNull().default("both"),
    rangePreset: text({ enum: REPORT_RANGE_PRESETS }).notNull().default("last_month"),
    /** Custom subject line (null = "<report title> — <period>"). */
    subject: text(),
    message: text(),
    /** How long the emailed share link stays valid. */
    linkExpiryDays: integer().notNull().default(30),
    enabled: boolean().notNull().default(true),
    nextRunAt: ts(),
    lastSentAt: ts(),
    /** sent | logged (SMTP not configured) | partial | failed */
    lastStatus: text(),
    lastError: text(),
    createdBy: text().references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("report_schedules_due_idx").on(t.enabled, t.nextRunAt), index("report_schedules_report_idx").on(t.reportId)],
);

/**
 * One email delivery of a report (scheduled or "Send now"): delivery log + the expiring, frozen
 * share link sent to the recipients (`/share/r/<token>` resolves these tokens too).
 */
export const reportDeliveries = pgTable(
  "report_deliveries",
  {
    id: id("rdl"),
    scheduleId: text().references(() => reportSchedules.id, { onDelete: "set null" }),
    reportId: text()
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    projectId: text()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    trigger: text({ enum: ["schedule", "manual"] })
      .notNull()
      .default("schedule"),
    /** The schedule slot this delivery belongs to (null for manual sends) — unique per schedule. */
    dueAt: ts(),
    rangeFrom: date({ mode: "string" }),
    rangeTo: date({ mode: "string" }),
    periodLabel: text(),
    format: text({ enum: REPORT_SCHEDULE_FORMATS }).notNull(),
    recipients: text().array().notNull().default(sql`'{}'::text[]`),
    /** Public link token (format link | both); resolved like `reports.shareToken`. */
    token: text(),
    expiresAt: ts(),
    /** Frozen data bundle for the link (dropped once the link expired). */
    snapshot: jsonb().$type<Record<string, unknown>>(),
    status: text({ enum: ["sending", "sent", "logged", "partial", "failed"] })
      .notNull()
      .default("sending"),
    error: text(),
    results: jsonb().$type<ReportDeliveryResult[]>().notNull().default([]),
    pptxBytes: integer(),
    views: integer().notNull().default(0),
    createdBy: text().references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    finishedAt: ts(),
  },
  (t) => [
    uniqueIndex("report_deliveries_slot_uq").on(t.scheduleId, t.dueAt),
    uniqueIndex("report_deliveries_token_uq").on(t.token),
    index("report_deliveries_report_idx").on(t.reportId, t.createdAt),
  ],
);
