import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { and, count, eq, inArray, or, sql, type AnyColumn } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db/client";
import {
  apiRequestLogs,
  auditLogs,
  feedback,
  jobs,
  logUploads,
  notifications,
  projects,
  usageEvents,
  users,
  workspaceMembers,
  workspaces,
  type WorkspaceSettings,
} from "@/server/db/schema";
import { env } from "@/server/env";
import { logAudit } from "@/server/audit";
import { createWorkspace, ensureBuiltinRoles } from "@/server/auth/membership";
import { isValidEmail, normalizeEmail } from "@/server/auth/domains";
import { updateSetting } from "@/server/settings";
import { spendSince } from "@/server/usage";
import { eraseUser } from "@/server/admin/erasure";
import { deleteUploadByUrl } from "@/server/admin/uploads";
import { invalidateTenancyCache } from "./tenancy";

/**
 * AutoSEO Cloud tenant lifecycle on the shared instance (docs/CLOUD.md → "Tenant API"): one workspace per
 * customer, identified by the cloud's opaque tenant id (`workspaces.cloud_tenant_id`).
 */

export const TENANT_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

const AUDIT_META = { source: "cloud" } as const;

export const tenantInputSchema = z.object({
  ownerEmail: z
    .string()
    .trim()
    .max(320)
    .transform(normalizeEmail)
    // Template characters are rejected like on the cloud side (docs/MANAGED_INSTANCES.md).
    .refine((e) => isValidEmail(e) && !/[{}$`]/.test(e), "Invalid email address"),
  ownerName: z.string().trim().max(120).optional(),
  workspaceName: z.string().trim().min(1).max(80),
  status: z.enum(["active", "suspended"]).optional(),
  suspendedReason: z.string().trim().max(500).nullish(),
  /** Per key: a number sets the limit, null removes it, a missing key keeps the current value. */
  limits: z
    .object({
      monthlyBudgetUsd: z.number().min(0).max(1_000_000).nullish(),
      maxProjects: z.number().int().min(0).max(100_000).nullish(),
    })
    .optional(),
});
export type TenantInput = z.infer<typeof tenantInputSchema>;

export const cloudConfigSchema = z.object({
  mail: z
    .object({
      smtpUrl: z.string().trim().max(2000).regex(/^smtps?:\/\/\S+$/, "smtpUrl must be an smtp:// or smtps:// URL"),
      from: z.string().trim().min(3).max(320),
    })
    .nullable(),
});

export type TenantSummary = { tenantId: string; workspaceId: string; ownerUserId: string; status: "active" | "suspended" };

export class TenantError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function findTenantWorkspace(tenantId: string) {
  return db
    .select()
    .from(workspaces)
    .where(eq(workspaces.cloudTenantId, tenantId))
    .limit(1)
    .then((rows) => rows[0] ?? null);
}

function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; cause?: { code?: string } } | null;
  return e?.code === "23505" || e?.cause?.code === "23505";
}

function mergeLimits(current: WorkspaceSettings, limits: TenantInput["limits"]): WorkspaceSettings {
  const next: WorkspaceSettings = { ...current };
  for (const key of ["monthlyBudgetUsd", "maxProjects"] as const) {
    const value = limits?.[key];
    if (value === null) delete next[key];
    else if (value !== undefined) next[key] = value;
  }
  return next;
}

/** The owner account; created on first use (never an instance admin). */
async function ensureOwner(email: string, name: string | undefined) {
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) return existing;
  const [created] = await db
    .insert(users)
    .values({ email, name: name || email.split("@")[0], isInstanceAdmin: false, status: "active" })
    .onConflictDoNothing()
    .returning();
  if (created) return created;
  const [raced] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return raced!;
}

/**
 * Idempotent upsert: creates the owner and the workspace on the first call, then keeps name, status and
 * limits in sync. A new `ownerEmail` is added as another owner; previous owners stay members (removing
 * people is left to the workspace itself).
 */
export async function upsertTenant(tenantId: string, input: TenantInput): Promise<TenantSummary & { created: boolean }> {
  const [{ n: userCount } = { n: 0 }] = await db.select({ n: count() }).from(users);
  // The operator account (AUTOSEO_OWNER_EMAIL) must exist first, otherwise a customer would claim the instance.
  if (!userCount) throw new TenantError("The instance is not set up yet.", 503);
  await ensureBuiltinRoles();
  const owner = await ensureOwner(input.ownerEmail, input.ownerName);

  let ws = await findTenantWorkspace(tenantId);
  let created = false;
  for (let attempt = 0; !ws; attempt++) {
    try {
      const status = input.status ?? "active";
      ws = await createWorkspace(input.workspaceName, {
        cloudTenantId: tenantId,
        status,
        suspendedReason: status === "suspended" ? (input.suspendedReason ?? null) : null,
        settings: mergeLimits({}, input.limits),
      });
      created = true;
    } catch (err) {
      // A concurrent call created the tenant (tenant id) or took the slug — look again / retry with a new slug.
      if (!isUniqueViolation(err) || attempt >= 3) throw err;
      ws = await findTenantWorkspace(tenantId);
    }
  }
  if (!created) {
    const workspaceId = ws.id;
    // Row lock: concurrent calls (e.g. a rename racing a suspension) must not write back stale status or limits.
    ws = await db.transaction(async (tx) => {
      const [current] = await tx.select().from(workspaces).where(eq(workspaces.id, workspaceId)).for("update");
      // Omitted fields keep their current value.
      const status = input.status ?? current!.status;
      const suspendedReason =
        status === "suspended" ? (input.suspendedReason === undefined ? current!.suspendedReason : input.suspendedReason) : null;
      const [updated] = await tx
        .update(workspaces)
        .set({ name: input.workspaceName, status, suspendedReason, settings: mergeLimits(current!.settings ?? {}, input.limits) })
        .where(eq(workspaces.id, workspaceId))
        .returning();
      return updated!;
    });
  }
  await db
    .insert(workspaceMembers)
    .values({ workspaceId: ws!.id, userId: owner.id, roleKey: "owner" })
    .onConflictDoUpdate({ target: [workspaceMembers.workspaceId, workspaceMembers.userId], set: { roleKey: "owner" } });
  invalidateTenancyCache();

  void logAudit(created ? "cloud.tenant_created" : "cloud.tenant_updated", {
    actor: null,
    targetType: "workspace",
    targetId: ws!.id,
    workspaceId: ws!.id,
    meta: { ...AUDIT_META, tenantId, status: ws!.status, owner: owner.email, limits: ws!.settings },
  });
  return { tenantId, workspaceId: ws!.id, ownerUserId: owner.id, status: ws!.status, created };
}

/** Tenant summary for the cloud dashboard. Polled by the cloud, so it is not audited (mutations are). */
export async function getTenant(tenantId: string) {
  const ws = await findTenantWorkspace(tenantId);
  if (!ws) return null;
  const now = new Date();
  const [[members], [active], spent] = await Promise.all([
    db.select({ n: count() }).from(workspaceMembers).where(eq(workspaceMembers.workspaceId, ws.id)),
    db
      .select({ n: count() })
      .from(projects)
      .where(and(eq(projects.workspaceId, ws.id), eq(projects.archived, false))),
    spendSince(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)), ws.id),
  ]);
  return {
    tenantId,
    workspaceId: ws.id,
    status: ws.status,
    name: ws.name,
    members: Number(members?.n ?? 0),
    projects: Number(active?.n ?? 0),
    spendThisMonthUsd: Math.round(spent * 10_000) / 10_000,
    limits: ws.settings ?? {},
  };
}

async function removeDir(...segments: string[]) {
  if (segments.some((s) => !s)) return;
  const dir = path.resolve(env.dataDir, ...segments);
  if (!dir.startsWith(path.resolve(env.dataDir) + path.sep)) return;
  await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
}

/**
 * Deletes a tenant's workspace with all of its data and files, purges workspace-keyed rows without foreign keys
 * and erases the accounts whose only membership was this workspace. Workspaces created in the app (no tenant
 * id, e.g. the operator's) can never be reached through here. Returns null when the tenant doesn't exist.
 */
export async function deleteTenant(tenantId: string) {
  const ws = await findTenantWorkspace(tenantId);
  if (!ws?.cloudTenantId) return null;

  const projectRows = await db.select({ id: projects.id, logoUrl: projects.logoUrl }).from(projects).where(eq(projects.workspaceId, ws.id));
  const projectIds = projectRows.map((p) => p.id);
  const uploads = projectIds.length
    ? await db.select({ id: logUploads.id }).from(logUploads).where(inArray(logUploads.projectId, projectIds))
    : [];
  // Members without any other workspace are erased afterwards (never instance admins).
  const members = await db
    .select({
      id: users.id,
      email: users.email,
      isInstanceAdmin: users.isInstanceAdmin,
      others: sql<number>`(select count(*)::int from workspace_members o where o.user_id = ${users.id} and o.workspace_id <> ${ws.id})`,
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(users.id, workspaceMembers.userId))
    .where(eq(workspaceMembers.workspaceId, ws.id));
  const orphans = members.filter((m) => Number(m.others) === 0 && !m.isInstanceAdmin);

  const inProjects = (column: AnyColumn) => (projectIds.length ? inArray(column, projectIds) : sql`false`);
  const counts: Record<string, number> = {};
  await db.transaction(async (tx) => {
    // Rows keyed by workspace / project without a foreign key (they would outlive the workspace otherwise).
    const purged = async (key: string, rows: Promise<unknown[]>) => {
      counts[key] = (await rows).length;
    };
    await purged("usage_events", tx.delete(usageEvents).where(or(eq(usageEvents.workspaceId, ws.id), inProjects(usageEvents.projectId))).returning({ id: usageEvents.id }));
    await purged("jobs", tx.delete(jobs).where(or(eq(jobs.workspaceId, ws.id), inProjects(jobs.projectId))).returning({ id: jobs.id }));
    await purged("audit_logs", tx.delete(auditLogs).where(or(eq(auditLogs.workspaceId, ws.id), inProjects(auditLogs.projectId))).returning({ id: auditLogs.id }));
    await purged("api_request_logs", tx.delete(apiRequestLogs).where(eq(apiRequestLogs.workspaceId, ws.id)).returning({ id: apiRequestLogs.id }));
    await purged("notifications", tx.delete(notifications).where(inProjects(notifications.projectId)).returning({ id: notifications.id }));
    await purged("feedback", tx.delete(feedback).where(inProjects(feedback.projectId)).returning({ id: feedback.id }));
    if (projectIds.length) await tx.update(users).set({ lastProjectId: null }).where(inArray(users.lastProjectId, projectIds));
    // Cascades: projects (and all project data), memberships, invitations, API keys, agents, reports, templates.
    await tx.delete(workspaces).where(and(eq(workspaces.id, ws.id), sql`${workspaces.cloudTenantId} is not null`));
  });
  counts.projects = projectIds.length;
  invalidateTenancyCache();

  // Files: project logos, chat attachments, fact-check PDFs, pending log uploads, report assets.
  for (const p of projectRows) {
    await deleteUploadByUrl(p.logoUrl, "logos");
    await removeDir("chat", p.id);
    await removeDir("fact-check", p.id.replace(/[^a-z0-9_]/gi, ""));
  }
  for (const u of uploads) await fs.rm(path.join(env.dataDir, "uploads", "logs", `${u.id}.log`), { force: true }).catch(() => {});
  await removeDir("report-assets", ws.id.replace(/[^a-z0-9_]/gi, ""));

  let erased = 0;
  for (const m of orphans) {
    // Skip anyone who joined another workspace meanwhile (e.g. a new tenant with the same owner email).
    const [{ n: memberships } = { n: 0 }] = await db.select({ n: count() }).from(workspaceMembers).where(eq(workspaceMembers.userId, m.id));
    if (memberships > 0) continue;
    try {
      await eraseUser(m.id, { confirmEmail: m.email, actor: null, initiatedBy: "cloud" });
      erased++;
    } catch (err) {
      console.error(`[cloud] could not erase user ${m.id} of tenant ${tenantId}:`, err instanceof Error ? err.message : err);
    }
  }
  counts.users_erased = erased;

  // Kept after the purge (no workspace id), ids and counts only.
  void logAudit("cloud.tenant_deleted", { actor: null, targetType: "workspace", targetId: ws.id, meta: { ...AUDIT_META, tenantId, counts } });
  return { tenantId, workspaceId: ws.id, counts };
}

/** Platform default mail server (`PUT /api/cloud/config`); null removes it. */
export async function setPlatformMail(mail: z.infer<typeof cloudConfigSchema>["mail"]) {
  await updateSetting("platformMail", { smtpUrl: mail?.smtpUrl ?? "", from: mail?.from ?? "" });
  void logAudit("cloud.config_updated", { actor: null, targetType: "settings", targetId: "platformMail", meta: { ...AUDIT_META, mail: Boolean(mail) } });
  return { mail: Boolean(mail) };
}
