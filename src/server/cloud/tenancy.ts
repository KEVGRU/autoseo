import "server-only";
import { eq, inArray, sql, type AnyColumn, type SQL } from "drizzle-orm";
import { db } from "@/server/db/client";
import { projects, workspaces, type WorkspaceSettings } from "@/server/db/schema";
import { isSharedCloud } from "@/server/env";

/**
 * Multi-tenant rules of the shared AutoSEO Cloud instance (docs/CLOUD.md). Every check is a no-op unless
 * `AUTOSEO_CLOUD_API_SECRET` is set, so self-hosted instances behave exactly as before.
 */

export type WorkspaceTenancy = {
  status: "active" | "suspended";
  /** Workspace belongs to an AutoSEO Cloud customer (created by the tenant API). */
  tenant: boolean;
  settings: WorkspaceSettings;
};

const TTL_MS = 10_000;
const workspaceCache = new Map<string, { at: number; value: WorkspaceTenancy | null }>();
const projectCache = new Map<string, { at: number; workspaceId: string | null }>();

function fresh<T extends { at: number }>(entry: T | undefined): T | undefined {
  return entry && Date.now() - entry.at < TTL_MS ? entry : undefined;
}

/** Drops cached workspace state (the tenant API calls this after every change). */
export function invalidateTenancyCache() {
  workspaceCache.clear();
  projectCache.clear();
}

/** Status, tenant flag and limits of a workspace (cached for a few seconds). */
export async function getWorkspaceTenancy(workspaceId: string): Promise<WorkspaceTenancy | null> {
  const hit = fresh(workspaceCache.get(workspaceId));
  if (hit) return hit.value;
  const [row] = await db
    .select({ status: workspaces.status, cloudTenantId: workspaces.cloudTenantId, settings: workspaces.settings })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);
  const value = row ? { status: row.status, tenant: row.cloudTenantId !== null, settings: row.settings ?? {} } : null;
  workspaceCache.set(workspaceId, { at: Date.now(), value });
  return value;
}

export async function getProjectWorkspaceId(projectId: string): Promise<string | null> {
  const hit = fresh(projectCache.get(projectId));
  if (hit) return hit.workspaceId;
  const [row] = await db.select({ workspaceId: projects.workspaceId }).from(projects).where(eq(projects.id, projectId)).limit(1);
  const workspaceId = row?.workspaceId ?? null;
  projectCache.set(projectId, { at: Date.now(), workspaceId });
  return workspaceId;
}

/** False only for suspended workspaces on the shared cloud instance. */
export async function isWorkspaceActive(workspaceId: string | null | undefined): Promise<boolean> {
  if (!isSharedCloud() || !workspaceId) return true;
  return (await getWorkspaceTenancy(workspaceId))?.status !== "suspended";
}

/** False when the project's workspace is suspended (shared cloud only). */
export async function isProjectActive(projectId: string | null | undefined): Promise<boolean> {
  if (!isSharedCloud() || !projectId) return true;
  return isWorkspaceActive(await getProjectWorkspaceId(projectId));
}

/** Customer workspace of the shared cloud (no instance-wide fallbacks such as the admin's Bing key). */
export async function isTenantWorkspace(workspaceId: string | null | undefined): Promise<boolean> {
  if (!isSharedCloud() || !workspaceId) return false;
  return Boolean((await getWorkspaceTenancy(workspaceId))?.tenant);
}

export async function isTenantProject(projectId: string | null | undefined): Promise<boolean> {
  if (!isSharedCloud() || !projectId) return false;
  return isTenantWorkspace(await getProjectWorkspaceId(projectId));
}

/** Per-workspace limits set by the cloud (empty outside the shared cloud). */
export async function getWorkspaceLimits(workspaceId: string | null | undefined): Promise<WorkspaceSettings> {
  if (!isSharedCloud() || !workspaceId) return {};
  return (await getWorkspaceTenancy(workspaceId))?.settings ?? {};
}

/** `suspendedReason` the cloud sends when its team pauses a workspace (not a billing problem). */
export const ADMIN_SUSPENSION_REASON = "admin";

/** Suspension reasons of the given workspaces (for the "workspace paused" page). */
export async function suspensionReasons(workspaceIds: string[]): Promise<(string | null)[]> {
  if (!workspaceIds.length) return [];
  const rows = await db.select({ reason: workspaces.suspendedReason }).from(workspaces).where(inArray(workspaces.id, workspaceIds));
  return rows.map((r) => r.reason);
}

/** SQL condition: the workspace id in `column` is not suspended (always true outside the shared cloud). */
export function activeWorkspaceSql(column: AnyColumn | SQL): SQL {
  if (!isSharedCloud()) return sql`true`;
  return sql`not exists (select 1 from workspaces sw where sw.id = ${column} and sw.status = 'suspended')`;
}

/** SQL condition: the project id in `column` does not belong to a suspended workspace. */
export function activeProjectSql(column: AnyColumn | SQL): SQL {
  if (!isSharedCloud()) return sql`true`;
  return sql`not exists (select 1 from projects sp join workspaces sw on sw.id = sp.workspace_id where sp.id = ${column} and sw.status = 'suspended')`;
}

