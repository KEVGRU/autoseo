import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { projects, roles, workspaceMembers, workspaces } from "@/server/db/schema";
import { isSharedCloud } from "@/server/env";
import { getCurrentSession, type SessionUser } from "./session";
import type { Permission } from "./permissions";
import type { AccessSource, WorkspaceAccessInput } from "./effective-access";
import { listAccessibleProjects, loadAccessInputs, projectAccessFor } from "./project-access";

export type Membership = {
  workspace: typeof workspaces.$inferSelect;
  roleKey: string;
  roleName: string;
  permissions: Set<Permission>;
  allProjects: boolean;
};

export type UserContext = {
  user: SessionUser;
  sessionId: string;
  memberships: Membership[];
  isInstanceAdmin: boolean;
  /** Shared AutoSEO Cloud: the user's suspended workspaces, which are left out of `memberships`. */
  pausedWorkspaces: { id: string; name: string }[];
};

export type ProjectContext = UserContext & {
  project: typeof projects.$inferSelect;
  /** Workspace membership (workspace role + its permissions). */
  membership: Membership;
  /** Effective permissions in this project (workspace role + group / project role overrides, see effective-access.ts). */
  permissions: Set<Permission>;
  /** Where the project role comes from. */
  access: { roleKey: string; roleName: string; source: AccessSource; sourceGroupId: string | null; via: "all_projects" | "project" | "group" };
};

export const loadRoles = cache(async () => {
  const rows = await db.select().from(roles);
  return new Map(rows.map((r) => [r.key, r]));
});

/** Full user context incl. workspace memberships and resolved role permissions. */
export const getUserContext = cache(async (): Promise<UserContext | null> => {
  const current = await getCurrentSession();
  if (!current) return null;
  const roleMap = await loadRoles();
  const rows = await db
    .select({ workspace: workspaces, roleKey: workspaceMembers.roleKey })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(eq(workspaceMembers.userId, current.user.id));

  const memberships: Membership[] = rows.map((r) => {
    const role = roleMap.get(r.roleKey);
    return {
      workspace: r.workspace,
      roleKey: r.roleKey,
      roleName: role?.name ?? r.roleKey,
      permissions: new Set((role?.permissions ?? []) as Permission[]),
      allProjects: role?.allProjects ?? false,
    };
  });

  // On the shared cloud instance only the account flag makes an instance admin — never a workspace role.
  const shared = isSharedCloud();
  const isInstanceAdmin =
    current.user.isInstanceAdmin || (!shared && memberships.some((m) => m.permissions.has("admin.access")));
  // Suspended workspaces are invisible to their members; instance admins still see them.
  const paused = shared && !isInstanceAdmin ? memberships.filter((m) => m.workspace.status === "suspended") : [];

  return {
    user: current.user,
    sessionId: current.session.id,
    memberships: paused.length ? memberships.filter((m) => !paused.includes(m)) : memberships,
    isInstanceAdmin,
    pausedWorkspaces: paused.map((m) => ({ id: m.workspace.id, name: m.workspace.name })),
  };
});

/** Resolver input (groups, group roles, project assignments) for each workspace of the current user. */
export const getAccessInputs = cache(async (): Promise<Map<string, WorkspaceAccessInput>> => {
  const ctx = await getUserContext();
  if (!ctx) return new Map();
  return loadAccessInputs({
    userId: ctx.user.id,
    isInstanceAdmin: ctx.isInstanceAdmin,
    memberships: ctx.memberships.map((m) => ({ workspaceId: m.workspace.id, roleKey: m.roleKey, status: m.workspace.status })),
    roles: new Map([...(await loadRoles()).values()].map((r) => [r.key, r])),
  });
});

/** Projects the user can access (across all workspaces), with their effective permissions. */
export const getAccessibleProjectsWithAccess = cache(async () => listAccessibleProjects(await getAccessInputs()));

/** Projects the user can access (across all workspaces). */
export const getAccessibleProjects = cache(async () => (await getAccessibleProjectsWithAccess()).map((x) => x.project));

export function hasPermission(
  ctx: { permissions: Set<Permission> } | Membership,
  permission: Permission,
): boolean {
  return ctx.permissions.has(permission);
}

export const getProjectContext = cache(async (projectId: string): Promise<ProjectContext | null> => {
  const ctx = await getUserContext();
  if (!ctx) return null;
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project) return null;
  const membership = ctx.memberships.find((m) => m.workspace.id === project.workspaceId);
  if (!membership) return null;
  const access = projectAccessFor((await getAccessInputs()).get(project.workspaceId), project);
  if (!access.access) return null;
  const role = (await loadRoles()).get(access.roleKey);
  return {
    ...ctx,
    project,
    membership,
    permissions: access.permissions,
    access: { roleKey: access.roleKey, roleName: role?.name ?? access.roleKey, source: access.source, sourceGroupId: access.sourceGroupId, via: access.via },
  };
});
