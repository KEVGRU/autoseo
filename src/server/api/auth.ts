import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { apiKeys, projects, roles, users, workspaceMembers, workspaces } from "@/server/db/schema";
import { isProjectScopedPermission, type Permission } from "@/server/auth/permissions";
import { listAccessibleProjects, loadAccessInputs } from "@/server/auth/project-access";
import { API_KEY_PREFIX, OAUTH_ACCESS_TOKEN_PREFIX, type ApiScope, isApiScope } from "@/features/api-settings/scopes";
import { isSharedCloud } from "@/server/env";
import { ApiError } from "./errors";
import { hashSecret } from "./tokens";

export type ApiProject = typeof projects.$inferSelect;

/** Role permission required to create API keys, approve OAuth apps and keep using them. */
export const API_CREDENTIALS_PERMISSION: Permission = "settings.manage";

export const WORKSPACE_PAUSED_MESSAGE = "This workspace is paused. Reactivate the subscription to use the API again.";

/** Whether a workspace member currently holds a role permission. */
export async function memberHasPermission(workspaceId: string, userId: string, permission: Permission): Promise<boolean> {
  const [row] = await db
    .select({ permissions: roles.permissions })
    .from(workspaceMembers)
    .innerJoin(roles, eq(roles.key, workspaceMembers.roleKey))
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)))
    .limit(1);
  return Boolean(row && (row.permissions as string[]).includes(permission));
}

/** The authenticated caller of a REST / MCP request (API key or OAuth access token). */
export type ApiPrincipal = {
  credentialId: string;
  kind: "api" | "oauth" | "session";
  /** Key name, or the OAuth client name for access tokens. */
  name: string;
  /** OAuth client id (kind "oauth") — null for API keys. */
  clientId: string | null;
  user: { id: string; email: string; name: string | null };
  workspace: { id: string; name: string; slug: string };
  /** Workspace role of the user. */
  roleKey: string;
  /**
   * Current permissions (re-read on every request): the workspace role's until a project is resolved with
   * `getApiProject`, then that project's effective permissions (group / project role overrides).
   */
  permissions: Set<Permission>;
  /** Permissions of the workspace role — workspace-level checks (API credentials, creating projects …). */
  workspacePermissions: Set<Permission>;
  /** Project-scoped permission the current REST route / MCP tool needs; `getApiProject` enforces it per project. */
  requiredPermission?: Permission;
  scopes: Set<ApiScope>;
  /** Project restriction of the credential (null = all projects the user can access). */
  restrictedProjectIds: string[] | null;
  /** Role grants access to every project of the workspace. */
  allProjectsRole: boolean;
  /** Stable key for per-credential rate limiting. */
  rateKey: string;
};

/**
 * Resolves a bearer credential. Returns null for unknown, revoked or expired credentials and for
 * users who lost access to the key's workspace; throws a 403 `ApiError` when the workspace is suspended. Role permissions are re-read on every request, so
 * demoting a user immediately narrows what their keys can do.
 */
export async function resolveCredential(token: string): Promise<ApiPrincipal | null> {
  if (!token || token.length > 512) return null;
  if (!token.startsWith(API_KEY_PREFIX) && !token.startsWith(OAUTH_ACCESS_TOKEN_PREFIX)) return null;
  const [row] = await db
    .select({ key: apiKeys, user: users, workspace: workspaces })
    .from(apiKeys)
    .innerJoin(users, eq(users.id, apiKeys.userId))
    .innerJoin(workspaces, eq(workspaces.id, apiKeys.workspaceId))
    .where(eq(apiKeys.keyHash, hashSecret(token)))
    .limit(1);
  if (!row) return null;
  const { key, user, workspace } = row;
  if (key.revokedAt) return null;
  if (key.expiresAt && key.expiresAt.getTime() <= Date.now()) return null;
  if (user.status !== "active") return null;
  // Shared cloud: a suspended workspace's keys, OAuth tokens and agent session keys stop working (403, not 401,
  // so MCP clients don't discard their tokens).
  if (isSharedCloud() && workspace.status === "suspended") throw new ApiError("forbidden", WORKSPACE_PAUSED_MESSAGE);

  const [member] = await db
    .select({ roleKey: workspaceMembers.roleKey })
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspace.id), eq(workspaceMembers.userId, user.id)))
    .limit(1);
  if (!member) return null;
  const [role] = await db.select().from(roles).where(eq(roles.key, member.roleKey)).limit(1);
  const permissions = new Set((role?.permissions ?? []) as Permission[]);
  // Holding long-lived API credentials (API keys, OAuth apps) needs the same permission as creating
  // them; demoting the owner disables their keys and connected apps immediately. Session keys are
  // minted by the platform for a user's own agent chat and only need normal project access.
  if (key.kind !== "session" && !permissions.has(API_CREDENTIALS_PERMISSION)) return null;

  return {
    credentialId: key.id,
    kind: key.kind,
    name: key.name,
    clientId: key.oauthClientId,
    user: { id: user.id, email: user.email, name: user.name },
    workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug },
    roleKey: member.roleKey,
    permissions,
    workspacePermissions: new Set(permissions),
    scopes: new Set((key.scopes ?? []).filter((s): s is ApiScope => isApiScope(s))),
    restrictedProjectIds: key.projectIds ?? null,
    allProjectsRole: Boolean(role?.allProjects) || permissions.has("projects.all"),
    rateKey: key.kind === "oauth" ? `oauth:${key.oauthClientId}:${user.id}:${workspace.id}` : `key:${key.id}`,
  };
}

type AccessibleEntry = { project: ApiProject; permissions: Set<Permission> };
const projectCache = new WeakMap<ApiPrincipal, Promise<AccessibleEntry[]>>();

function accessibleEntries(p: ApiPrincipal): Promise<AccessibleEntry[]> {
  let cached = projectCache.get(p);
  if (!cached) {
    cached = loadAccessibleEntries(p);
    projectCache.set(p, cached);
  }
  return cached;
}

/** Projects this credential may access: key restriction ∩ the user's current project access (incl. project groups). */
export async function accessibleProjects(p: ApiPrincipal): Promise<ApiProject[]> {
  return (await accessibleEntries(p)).map((e) => e.project);
}

async function loadAccessibleEntries(p: ApiPrincipal): Promise<AccessibleEntry[]> {
  // Suspended workspaces never get here (resolveCredential rejects them), so the status is "active".
  const inputs = await loadAccessInputs({
    userId: p.user.id,
    isInstanceAdmin: false,
    memberships: [{ workspaceId: p.workspace.id, roleKey: p.roleKey, status: "active" }],
  });
  const allowed = p.restrictedProjectIds ? new Set(p.restrictedProjectIds) : null;
  return (
    (await listAccessibleProjects(inputs))
      // Same rule as the UI (`requireProject(…, "project.view")`): no view permission, no project data.
      .filter((r) => r.access.permissions.has("project.view"))
      .filter((r) => !allowed || allowed.has(r.project.id))
      .map((r) => ({ project: r.project, permissions: r.access.permissions }))
  );
}

/**
 * Loads a project the caller may access, or throws 404 (never leaks existence of other projects). Enforces
 * `p.requiredPermission` for this project (403) and scopes `p.permissions` to the project's effective permissions.
 */
export async function getApiProject(p: ApiPrincipal, projectId: string): Promise<ApiProject> {
  const entry = (await accessibleEntries(p)).find((x) => x.project.id === projectId);
  if (!entry) throw new ApiError("not_found", "Project not found or not accessible with this credential.");
  if (p.requiredPermission && !entry.permissions.has(p.requiredPermission)) {
    throw new ApiError("forbidden", `Your role in this project does not allow this (${p.requiredPermission}).`, {
      requiredPermission: p.requiredPermission,
    });
  }
  p.permissions = entry.permissions;
  return entry.project;
}

/** Effective permissions of the caller in one of its accessible projects (empty set when not accessible). */
export async function apiProjectPermissions(p: ApiPrincipal, projectId: string): Promise<Set<Permission>> {
  return (await accessibleEntries(p)).find((x) => x.project.id === projectId)?.permissions ?? new Set();
}

/** Project-scoped permissions the caller holds in at least one accessible project (pre-check upper bound). */
export async function maxApiProjectPermissions(p: ApiPrincipal): Promise<Set<Permission>> {
  const out = new Set<Permission>();
  for (const e of await accessibleEntries(p)) for (const perm of e.permissions) if (isProjectScopedPermission(perm)) out.add(perm);
  return out;
}

export async function getApiProjectsByIds(p: ApiPrincipal, ids: string[]): Promise<ApiProject[]> {
  if (!ids.length) return [];
  const list = await accessibleProjects(p);
  const set = new Set(ids);
  return list.filter((x) => set.has(x.id));
}

/** Public label of the credential type (whoami / GET /me). */
export function credentialKindLabel(p: ApiPrincipal): "api_key" | "oauth_token" | "session_key" {
  return p.kind === "oauth" ? "oauth_token" : p.kind === "session" ? "session_key" : "api_key";
}

export function hasScope(p: ApiPrincipal, scope: ApiScope): boolean {
  return p.scopes.has(scope);
}

export function requireScope(p: ApiPrincipal, scope: ApiScope) {
  if (!p.scopes.has(scope)) {
    throw new ApiError("insufficient_scope", `This credential lacks the "${scope}" scope.`, { requiredScope: scope });
  }
}

/**
 * Write operations also require the matching role permission of the key's owner. Before a project is resolved
 * this is the workspace role; afterwards the project's effective permissions (see `getApiProject`).
 */
export function requirePermission(p: ApiPrincipal, permission: Permission) {
  if (!p.permissions.has(permission)) {
    throw new ApiError("forbidden", `Your role does not allow this (${permission}).`, { requiredPermission: permission });
  }
}

/** Utility for callers that need to check several projects at once. */
export async function assertProjectIdsAccessible(p: ApiPrincipal, ids: string[]) {
  const found = await getApiProjectsByIds(p, ids);
  if (found.length !== new Set(ids).size) throw new ApiError("not_found", "One or more projects are not accessible.");
}

