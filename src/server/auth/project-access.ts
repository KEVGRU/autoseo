import "server-only";
import { and, eq, inArray, or, type SQL } from "drizzle-orm";
import { db } from "@/server/db/client";
import { groupMembers, projectGroups, projectMembers, projects, roles, users, workspaceMembers, workspaces } from "@/server/db/schema";
import { isSharedCloud } from "@/server/env";
import {
  reachableGroupIds,
  resolveAccessibleProjects,
  resolveProjectAccess,
  type EffectiveAccess,
  type GroupNode,
  type RoleDef,
  type WorkspaceAccessInput,
} from "./effective-access";

/** DB loader for the pure resolver in effective-access.ts (see the rules documented there). */

export type AccessMembership = { workspaceId: string; roleKey: string; status: "active" | "suspended" };
export type GrantedAccess = Extract<EffectiveAccess, { access: true }>;
type Project = typeof projects.$inferSelect;

export async function loadRoleDefs(): Promise<Map<string, RoleDef>> {
  const rows = await db.select({ key: roles.key, name: roles.name, permissions: roles.permissions, allProjects: roles.allProjects }).from(roles);
  return new Map(rows.map((r) => [r.key, r]));
}

/** Resolver input for each of the user's workspaces (one round of queries for all of them). */
export async function loadAccessInputs(args: {
  userId: string;
  isInstanceAdmin: boolean;
  memberships: AccessMembership[];
  roles?: Map<string, RoleDef>;
}): Promise<Map<string, WorkspaceAccessInput>> {
  const out = new Map<string, WorkspaceAccessInput>();
  const ids = [...new Set(args.memberships.map((m) => m.workspaceId))];
  if (!ids.length) return out;
  const [roleMap, groupRows, memberRows, assignmentRows] = await Promise.all([
    args.roles ? Promise.resolve(args.roles) : loadRoleDefs(),
    db
      .select({ id: projectGroups.id, parentId: projectGroups.parentId, workspaceId: projectGroups.workspaceId, name: projectGroups.name })
      .from(projectGroups)
      .where(inArray(projectGroups.workspaceId, ids)),
    db
      .select({ groupId: groupMembers.groupId, roleKey: groupMembers.roleKey, workspaceId: projectGroups.workspaceId })
      .from(groupMembers)
      .innerJoin(projectGroups, eq(projectGroups.id, groupMembers.groupId))
      .where(and(eq(groupMembers.userId, args.userId), inArray(projectGroups.workspaceId, ids))),
    db
      .select({ projectId: projectMembers.projectId, roleKey: projectMembers.roleKey, workspaceId: projects.workspaceId })
      .from(projectMembers)
      .innerJoin(projects, eq(projects.id, projectMembers.projectId))
      .where(and(eq(projectMembers.userId, args.userId), inArray(projects.workspaceId, ids))),
  ]);
  const shared = isSharedCloud();
  for (const m of args.memberships) {
    const groups = new Map<string, GroupNode>(groupRows.filter((g) => g.workspaceId === m.workspaceId).map((g) => [g.id, g]));
    out.set(m.workspaceId, {
      workspaceId: m.workspaceId,
      workspaceRoleKey: m.roleKey,
      workspaceStatus: m.status,
      sharedCloud: shared,
      isInstanceAdmin: args.isInstanceAdmin,
      groups,
      groupRoles: new Map(memberRows.filter((r) => r.workspaceId === m.workspaceId).map((r) => [r.groupId, r.roleKey])),
      projectAssignments: new Map(assignmentRows.filter((r) => r.workspaceId === m.workspaceId).map((r) => [r.projectId, r.roleKey])),
      roles: roleMap,
    });
  }
  return out;
}

/**
 * Projects of the given workspaces the user can reach, with their effective access. Candidate rows are narrowed
 * in SQL (all-project workspaces, assigned projects, projects in reachable groups); the resolver has the final say.
 */
export async function listAccessibleProjects(
  inputs: Map<string, WorkspaceAccessInput>,
  opts: { includeArchived?: boolean } = {},
): Promise<{ project: Project; access: GrantedAccess }[]> {
  const conds: SQL[] = [];
  for (const input of inputs.values()) {
    const role = input.workspaceRoleKey ? input.roles.get(input.workspaceRoleKey) : undefined;
    if (role && (role.allProjects || role.permissions.includes("projects.all"))) {
      conds.push(eq(projects.workspaceId, input.workspaceId));
      continue;
    }
    const assigned = [...input.projectAssignments.keys()];
    const groupIds = [...reachableGroupIds(input)];
    const parts: SQL[] = [];
    if (assigned.length) parts.push(inArray(projects.id, assigned));
    if (groupIds.length) parts.push(inArray(projects.groupId, groupIds));
    if (parts.length) conds.push(and(eq(projects.workspaceId, input.workspaceId), or(...parts))!);
  }
  if (!conds.length) return [];
  const where = opts.includeArchived ? or(...conds) : and(eq(projects.archived, false), or(...conds));
  const rows = await db.select().from(projects).where(where);
  const out: { project: Project; access: GrantedAccess }[] = [];
  for (const input of inputs.values()) {
    out.push(...resolveAccessibleProjects(input, rows.filter((p) => p.workspaceId === input.workspaceId)));
  }
  return out.sort((a, b) => a.project.name.localeCompare(b.project.name));
}

/** Effective access of one user to one project (null input = not a member of the project's workspace). */
export function projectAccessFor(input: WorkspaceAccessInput | undefined, project: Pick<Project, "id" | "workspaceId" | "groupId">): EffectiveAccess {
  if (!input) return { access: false, reason: "not_member" };
  return resolveProjectAccess(input, project);
}

/** Resolver inputs for every member of a workspace (member lists, "who can access this project", previews). */
export async function loadWorkspaceMemberInputs(workspaceId: string): Promise<Map<string, WorkspaceAccessInput>> {
  const [roleMap, wsRows, memberRows, groupRows, groupMemberRows, assignmentRows] = await Promise.all([
    loadRoleDefs(),
    db.select({ status: workspaces.status }).from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1),
    db
      .select({ userId: workspaceMembers.userId, roleKey: workspaceMembers.roleKey, isInstanceAdmin: users.isInstanceAdmin })
      .from(workspaceMembers)
      .innerJoin(users, eq(users.id, workspaceMembers.userId))
      .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(users.status, "active"))),
    db
      .select({ id: projectGroups.id, parentId: projectGroups.parentId, workspaceId: projectGroups.workspaceId, name: projectGroups.name })
      .from(projectGroups)
      .where(eq(projectGroups.workspaceId, workspaceId)),
    db
      .select({ groupId: groupMembers.groupId, userId: groupMembers.userId, roleKey: groupMembers.roleKey })
      .from(groupMembers)
      .innerJoin(projectGroups, eq(projectGroups.id, groupMembers.groupId))
      .where(eq(projectGroups.workspaceId, workspaceId)),
    db
      .select({ projectId: projectMembers.projectId, userId: projectMembers.userId, roleKey: projectMembers.roleKey })
      .from(projectMembers)
      .innerJoin(projects, eq(projects.id, projectMembers.projectId))
      .where(eq(projects.workspaceId, workspaceId)),
  ]);
  const status = wsRows[0]?.status ?? "active";
  const groups = new Map<string, GroupNode>(groupRows.map((g) => [g.id, g]));
  const shared = isSharedCloud();
  const out = new Map<string, WorkspaceAccessInput>();
  for (const m of memberRows) {
    out.set(m.userId, {
      workspaceId,
      workspaceRoleKey: m.roleKey,
      workspaceStatus: status,
      sharedCloud: shared,
      isInstanceAdmin: m.isInstanceAdmin,
      groups,
      groupRoles: new Map(groupMemberRows.filter((r) => r.userId === m.userId).map((r) => [r.groupId, r.roleKey])),
      projectAssignments: new Map(assignmentRows.filter((r) => r.userId === m.userId).map((r) => [r.projectId, r.roleKey])),
      roles: roleMap,
    });
  }
  return out;
}

/** Active workspace members who can access a project, with their effective access. */
export async function listProjectAccessUsers(projectId: string): Promise<{ userId: string; access: GrantedAccess }[]> {
  const [project] = await db
    .select({ id: projects.id, workspaceId: projects.workspaceId, groupId: projects.groupId })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  if (!project) return [];
  const inputs = await loadWorkspaceMemberInputs(project.workspaceId);
  const out: { userId: string; access: GrantedAccess }[] = [];
  for (const [userId, input] of inputs) {
    const access = resolveProjectAccess(input, project);
    if (access.access) out.push({ userId, access });
  }
  return out;
}
