import {
  pgTable,
  text,
  boolean,
  integer,
  jsonb,
  index,
  uniqueIndex,
  doublePrecision,
  primaryKey,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { id, createdAt, updatedAt, ts } from "./_helpers";

/* ───────────────────────────── Identity ───────────────────────────── */

export const users = pgTable(
  "users",
  {
    id: id("usr"),
    email: text().notNull(),
    name: text(),
    avatarUrl: text(),
    /** Instance-level admin (access to /admin). Independent of workspace roles. */
    isInstanceAdmin: boolean().notNull().default(false),
    status: text({ enum: ["active", "disabled"] })
      .notNull()
      .default("active"),
    locale: text().notNull().default("en"),
    lastProjectId: text(),
    lastLoginAt: ts(),
    preferences: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("users_email_uq").on(t.email)],
);

/** One row per logged-in device. Sessions last 1 year by default (configurable). */
export const sessions = pgTable(
  "sessions",
  {
    id: id("ses"),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text().notNull(),
    userAgent: text(),
    ip: text(),
    deviceLabel: text(),
    expiresAt: ts().notNull(),
    lastSeenAt: ts().notNull().defaultNow(),
    revokedAt: ts(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("sessions_token_uq").on(t.tokenHash), index("sessions_user_idx").on(t.userId)],
);

/** Magic-link / one-time-code login attempts. Only hashes are stored. */
export const loginTokens = pgTable(
  "login_tokens",
  {
    id: id("lgt"),
    email: text().notNull(),
    userId: text().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text().notNull(),
    codeHash: text(),
    purpose: text({ enum: ["login", "invite", "setup"] })
      .notNull()
      .default("login"),
    redirectTo: text(),
    requestIp: text(),
    requestUserAgent: text(),
    attempts: integer().notNull().default(0),
    expiresAt: ts().notNull(),
    usedAt: ts(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("login_tokens_hash_uq").on(t.tokenHash), index("login_tokens_email_idx").on(t.email)],
);

/* ──────────────────────────── Workspaces ──────────────────────────── */

/** Per-workspace limits set by AutoSEO Cloud (docs/CLOUD.md). Unset keys fall back to Admin → Limits. */
export type WorkspaceSettings = {
  /** Monthly provider spend (USD) this workspace may use, on top of the instance budget. */
  monthlyBudgetUsd?: number;
  /** Max. active projects (overrides `limits.maxProjectsPerWorkspace`). */
  maxProjects?: number;
};

export const workspaces = pgTable("workspaces", {
  id: id("wsp"),
  name: text().notNull(),
  slug: text().notNull().unique(),
  logoUrl: text(),
  /** Workspace-level branding used by reports (agency name, colors…) */
  branding: jsonb()
    .$type<{ agencyName?: string; primaryColor?: string; accentColor?: string; logoUrl?: string }>()
    .notNull()
    .default({}),
  /** Suspended workspaces (AutoSEO Cloud subscription ended) are hidden from their members and stop all work. */
  status: text({ enum: ["active", "suspended"] })
    .notNull()
    .default("active"),
  suspendedReason: text(),
  /** AutoSEO Cloud tenant id; null for workspaces created in the app (e.g. the operator's). */
  cloudTenantId: text().unique(),
  settings: jsonb().$type<WorkspaceSettings>().notNull().default({}),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/** Roles are editable in Admin → Roles. Built-in roles cannot be deleted. */
export const roles = pgTable("roles", {
  id: id("rol"),
  key: text().notNull().unique(),
  name: text().notNull(),
  description: text(),
  permissions: jsonb().$type<string[]>().notNull().default([]),
  builtin: boolean().notNull().default(false),
  /** Members with a role where allProjects=false only see projects they were given access to. */
  allProjects: boolean().notNull().default(false),
  sortOrder: integer().notNull().default(100),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    workspaceId: text()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleKey: text().notNull(),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.workspaceId, t.userId] })],
);

export const invitations = pgTable(
  "invitations",
  {
    id: id("inv"),
    workspaceId: text()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    email: text().notNull(),
    roleKey: text().notNull(),
    projectIds: jsonb().$type<string[]>().notNull().default([]),
    makeInstanceAdmin: boolean().notNull().default(false),
    tokenHash: text().notNull(),
    invitedBy: text().references(() => users.id, { onDelete: "set null" }),
    message: text(),
    status: text({ enum: ["pending", "accepted", "revoked", "expired"] })
      .notNull()
      .default("pending"),
    expiresAt: ts().notNull(),
    acceptedAt: ts(),
    lastSentAt: ts(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("invitations_token_uq").on(t.tokenHash), index("invitations_email_idx").on(t.email)],
);

/* ───────────────────────────── Projects ───────────────────────────── */

export type ProjectBrand = {
  /** Brand names/aliases that count as "your brand" in AI answers. */
  aliases: string[];
  /** Additional domains that count as own citations. */
  domains: string[];
  description?: string;
  industry?: string;
};

export const projects = pgTable(
  "projects",
  {
    id: id("prj"),
    workspaceId: text()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text().notNull(),
    domain: text().notNull(),
    websiteUrl: text(),
    logoUrl: text(),
    description: text(),
    /** ISO country code of the tracking market, e.g. "DE" */
    country: text().notNull().default("US"),
    language: text().notNull().default("en"),
    brand: jsonb().$type<ProjectBrand>().notNull().default({ aliases: [], domains: [] }),
    /** Pitch projects expire after pitchDurationDays (finseo "Pitch · Zalando"). */
    isPitch: boolean().notNull().default(false),
    pitchExpiresAt: ts(),
    archived: boolean().notNull().default(false),
    /** Enabled AI engines for prompt tracking (engine ids, see server/ai/engines). */
    engines: jsonb().$type<string[]>().notNull().default(["chatgpt", "perplexity", "ai_overview"]),
    trackingFrequency: text({ enum: ["daily", "weekly", "monthly", "paused"] })
      .notNull()
      .default("daily"),
    settings: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    onboardingState: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    /** Project group (brand / region / team / client) — group members inherit access, see effective-access.ts. */
    groupId: text().references((): AnyPgColumn => projectGroups.id, { onDelete: "set null" }),
    createdBy: text().references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("projects_workspace_idx").on(t.workspaceId), index("projects_group_idx").on(t.groupId)],
);

/** Explicit project access for roles without allProjects (Member/Client). */
export const projectMembers = pgTable(
  "project_members",
  {
    projectId: text()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Per-project role override (null = inherit from the project's groups / the workspace role). */
    roleKey: text(),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.userId] })],
);

/**
 * Project groups: a tree (brand → region → team …) inside one workspace. Members of a group get access to every
 * project in it and its sub-groups with the group's role; see src/server/auth/effective-access.ts for the rules.
 */
export const projectGroups = pgTable(
  "project_groups",
  {
    id: id("pgr"),
    workspaceId: text()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    parentId: text().references((): AnyPgColumn => projectGroups.id, { onDelete: "cascade" }),
    name: text().notNull(),
    kind: text({ enum: ["brand", "region", "team", "client", "other"] })
      .notNull()
      .default("other"),
    position: integer().notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("project_groups_workspace_idx").on(t.workspaceId), index("project_groups_parent_idx").on(t.parentId)],
);

/** Role of a workspace member in a project group (inherited by its sub-groups and projects). */
export const groupMembers = pgTable(
  "group_members",
  {
    groupId: text()
      .notNull()
      .references(() => projectGroups.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleKey: text().notNull(),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.groupId, t.userId] }), index("group_members_user_idx").on(t.userId)],
);

/** Share a project with an external email (finseo "Project Sharing"). */
export const projectShares = pgTable("project_shares", {
  id: id("psh"),
  projectId: text()
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  email: text().notNull(),
  roleKey: text().notNull().default("client"),
  status: text({ enum: ["pending", "active", "revoked"] })
    .notNull()
    .default("pending"),
  invitedBy: text().references(() => users.id, { onDelete: "set null" }),
  createdAt: createdAt(),
});

/* ───────────────────────────── Settings ───────────────────────────── */

/** Instance settings. `value` for plain values, `secret` holds AES-GCM encrypted JSON. */
export const appSettings = pgTable("app_settings", {
  key: text().primaryKey(),
  value: jsonb().$type<unknown>(),
  secret: text(),
  updatedBy: text().references(() => users.id, { onDelete: "set null" }),
  updatedAt: updatedAt(),
});

/* ─────────────────────────── Audit / usage ─────────────────────────── */

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: id("aud"),
    actorId: text().references(() => users.id, { onDelete: "set null" }),
    actorEmail: text(),
    action: text().notNull(),
    targetType: text(),
    targetId: text(),
    workspaceId: text(),
    projectId: text(),
    ip: text(),
    meta: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    createdAt: createdAt(),
  },
  (t) => [index("audit_logs_created_idx").on(t.createdAt), index("audit_logs_action_idx").on(t.action)],
);

export const usageEvents = pgTable(
  "usage_events",
  {
    id: id("use"),
    workspaceId: text(),
    projectId: text(),
    userId: text(),
    /** e.g. dataforseo, anthropic, openai, local_agent */
    provider: text().notNull(),
    /** e.g. keyword_research, ai_tracking, site_audit, agent_chat */
    feature: text().notNull(),
    endpoint: text(),
    units: integer().notNull().default(1),
    costUsd: doublePrecision().notNull().default(0),
    meta: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    createdAt: createdAt(),
  },
  (t) => [
    index("usage_events_created_idx").on(t.createdAt),
    index("usage_events_project_idx").on(t.projectId, t.createdAt),
  ],
);

/* ────────────────────────────── API keys ───────────────────────────── */

export const apiKeys = pgTable(
  "api_keys",
  {
    id: id("key"),
    workspaceId: text()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text().notNull(),
    prefix: text().notNull(),
    keyHash: text().notNull(),
    scopes: jsonb().$type<Array<"read" | "write" | "spend" | "export">>().notNull().default(["read"]),
    /** null = all projects */
    projectIds: jsonb().$type<string[] | null>(),
    /**
     * "api" for manually created keys, "oauth" for OAuth access tokens (MCP clients), "session" for
     * short-lived keys handed to local agent chat sessions (hidden from the key list).
     */
    kind: text({ enum: ["api", "oauth", "session"] })
      .notNull()
      .default("api"),
    oauthClientId: text(),
    requestCount: integer().notNull().default(0),
    lastUsedAt: ts(),
    expiresAt: ts(),
    revokedAt: ts(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("api_keys_hash_uq").on(t.keyHash)],
);

export const apiRequestLogs = pgTable(
  "api_request_logs",
  {
    id: id("arq"),
    apiKeyId: text(),
    workspaceId: text(),
    path: text().notNull(),
    method: text().notNull(),
    status: integer().notNull(),
    durationMs: integer().notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("api_request_logs_created_idx").on(t.workspaceId, t.createdAt)],
);

/* ───────────────────────────── Jobs queue ──────────────────────────── */

export const jobs = pgTable(
  "jobs",
  {
    id: id("job"),
    type: text().notNull(),
    payload: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    status: text({ enum: ["queued", "running", "succeeded", "failed", "cancelled"] })
      .notNull()
      .default("queued"),
    priority: integer().notNull().default(100),
    runAt: ts().notNull().defaultNow(),
    attempts: integer().notNull().default(0),
    maxAttempts: integer().notNull().default(3),
    dedupeKey: text(),
    lockedBy: text(),
    lockedAt: ts(),
    progress: jsonb().$type<Record<string, unknown>>(),
    result: jsonb().$type<unknown>(),
    lastError: text(),
    projectId: text(),
    workspaceId: text(),
    createdBy: text(),
    startedAt: ts(),
    finishedAt: ts(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("jobs_pick_idx").on(t.status, t.runAt, t.priority),
    index("jobs_project_idx").on(t.projectId, t.createdAt),
    uniqueIndex("jobs_dedupe_uq").on(t.dedupeKey),
  ],
);

/* ───────────────────────── UX: bookmarks, notifications ───────────────────────── */

export const bookmarks = pgTable("bookmarks", {
  id: id("bmk"),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  projectId: text().references(() => projects.id, { onDelete: "cascade" }),
  name: text().notNull(),
  path: text().notNull(),
  shared: boolean().notNull().default(false),
  createdAt: createdAt(),
});

export const notifications = pgTable(
  "notifications",
  {
    id: id("ntf"),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: text(),
    kind: text().notNull(),
    title: text().notNull(),
    body: text(),
    href: text(),
    readAt: ts(),
    createdAt: createdAt(),
  },
  (t) => [index("notifications_user_idx").on(t.userId, t.createdAt)],
);

export const feedback = pgTable("feedback", {
  id: id("fdb"),
  userId: text().references(() => users.id, { onDelete: "set null" }),
  projectId: text(),
  kind: text().notNull().default("feedback"),
  message: text().notNull(),
  path: text(),
  createdAt: createdAt(),
});

/* ───────────────────────────── Integrations ───────────────────────────── */

/**
 * Per-project connections to external services (Search Console, GA4, Bing, Cloudflare,
 * PM tools, CRMs, CMS…). `secret` holds encrypted credentials/tokens (see server/crypto).
 */
export const integrations = pgTable(
  "integrations",
  {
    id: id("int"),
    projectId: text()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    /** Provider key, e.g. google_search_console, google_analytics, bing_webmaster, cloudflare, linear, hubspot, wordpress */
    provider: text().notNull(),
    status: text({ enum: ["connected", "error", "pending", "disconnected"] })
      .notNull()
      .default("connected"),
    /** Non-secret config (selected property/site, account names, options). */
    config: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    secret: text(),
    /** Public webhook/ingest token hash (SHA-256) when the integration receives data. */
    tokenHash: text(),
    tokenPrefix: text(),
    connectedBy: text().references(() => users.id, { onDelete: "set null" }),
    lastSyncAt: ts(),
    lastError: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("integrations_project_provider_uq").on(t.projectId, t.provider),
    index("integrations_token_idx").on(t.tokenHash),
  ],
);
