import "server-only";
import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { groupMembers, projectGroups, projectMembers, projects, roles, users, workspaceMembers } from "@/server/db/schema";
import { logAudit } from "@/server/audit";
import { MemberError } from "@/server/admin/members";
import {
  MAX_GROUP_DEPTH,
  findWidening,
  groupChain,
  groupDepth,
  resolveProjectAccess,
  subtreeHeight,
  wouldCreateCycle,
  type GroupNode,
  type WorkspaceAccessInput,
} from "@/server/auth/effective-access";
import { isProjectScopedPermission, PERMISSIONS, type Permission } from "@/server/auth/permissions";
import { loadWorkspaceMemberInputs } from "@/server/auth/project-access";

/**
 * Project groups (brand / region / team / client hierarchy) and project-level roles. Callers must have checked
 * `members.manage` with all-project access in the workspace (see group-actions.ts); role grants are additionally
 * bounded by the caller's own permissions (`grantableBy`).
 */

type Actor = { id: string; email: string };
export type GroupKind = (typeof projectGroups.$inferSelect)["kind"];
export const GROUP_KINDS: GroupKind[] = ["brand", "region", "team", "client", "other"];

export type GroupTreeNode = {
  id: string;
  parentId: string | null;
  name: string;
  kind: GroupKind;
  position: number;
  projectIds: string[];
  members: { userId: string; roleKey: string }[];
};

async function workspaceGroups(workspaceId: string) {
  return db.select().from(projectGroups).where(eq(projectGroups.workspaceId, workspaceId)).orderBy(asc(projectGroups.position), asc(projectGroups.name));
}

function nodeMap(rows: { id: string; parentId: string | null; workspaceId: string }[]): Map<string, GroupNode> {
  return new Map(rows.map((g) => [g.id, { id: g.id, parentId: g.parentId, workspaceId: g.workspaceId }]));
}

async function loadGroup(workspaceId: string, groupId: string) {
  const [g] = await db
    .select()
    .from(projectGroups)
    .where(and(eq(projectGroups.id, groupId), eq(projectGroups.workspaceId, workspaceId)))
    .limit(1);
  if (!g) throw new MemberError("Group not found.");
  return g;
}

async function assertWorkspaceMember(workspaceId: string, userId: string) {
  const [m] = await db
    .select({ userId: workspaceMembers.userId })
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)))
    .limit(1);
  if (!m) throw new MemberError("That person is not a member of this workspace.");
}

async function assertProjectInWorkspace(workspaceId: string, projectId: string) {
  const [p] = await db
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)))
    .limit(1);
  if (!p) throw new MemberError("Project not found.");
  return p;
}

/**
 * Only project-scoped permissions of a role apply at group/project level. A non-instance-admin may grant a role
 * there only when they hold all of those permissions themselves (no escalation through groups).
 */
export async function assertGrantableRole(roleKey: string, grantor: { isInstanceAdmin: boolean; permissions: Set<Permission> }) {
  const [role] = await db.select().from(roles).where(eq(roles.key, roleKey)).limit(1);
  if (!role) throw new MemberError("Unknown role.");
  if (grantor.isInstanceAdmin) return role;
  const missing = role.permissions.filter((p) => isProjectScopedPermission(p) && !grantor.permissions.has(p));
  if (missing.length) {
    throw new MemberError(
      `You can't grant the “${role.name}” role — it includes permissions you don't have (${missing.map((p) => PERMISSIONS[p as Permission]?.label ?? p).join(", ")}).`,
    );
  }
  return role;
}

/** Who changes groups: grants are bounded by their workspace permissions, and they can't widen their own access. */
export type GroupEditor = { userId: string; isInstanceAdmin: boolean; permissions: Set<Permission> };

function assertNotSelf(editor: GroupEditor, userId: string) {
  if (!editor.isInstanceAdmin && editor.userId === userId) {
    throw new MemberError("You can't change your own group or project roles — ask another administrator.");
  }
}

/** Moving something under `groupId` hands its projects the roles of that group's chain — all must be grantable. */
async function assertChainGrantable(workspaceId: string, groupId: string | null, editor: GroupEditor) {
  if (!groupId || editor.isInstanceAdmin) return;
  const ids = groupChain(nodeMap(await workspaceGroups(workspaceId)), groupId, workspaceId).map((g) => g.id);
  if (!ids.length) return;
  const rows = await db.selectDistinct({ roleKey: groupMembers.roleKey }).from(groupMembers).where(inArray(groupMembers.groupId, ids));
  for (const r of rows) await assertGrantableRole(r.roleKey, editor);
}

/** Rejects a structural change (simulated by `mutate`) that would widen the editor's own project access. */
async function assertNoSelfWidening(
  workspaceId: string,
  editor: GroupEditor,
  mutate: (input: WorkspaceAccessInput, projectRows: ProjectRow[]) => { input: WorkspaceAccessInput; projects: ProjectRow[] },
) {
  if (editor.isInstanceAdmin) return;
  const before = (await loadWorkspaceMemberInputs(workspaceId)).get(editor.userId);
  if (!before) return;
  const rows = await db
    .select({ id: projects.id, workspaceId: projects.workspaceId, groupId: projects.groupId })
    .from(projects)
    .where(eq(projects.workspaceId, workspaceId));
  const after = mutate(before, rows);
  if (findWidening(before, after.input, rows, after.projects)) {
    throw new MemberError("This change would give you more access than you have today — ask another administrator to make it.");
  }
}

type ProjectRow = { id: string; workspaceId: string; groupId: string | null };

/* ───────────────────────────── Read ───────────────────────────── */

export async function listGroupTree(workspaceId: string): Promise<GroupTreeNode[]> {
  const groups = await workspaceGroups(workspaceId);
  if (!groups.length) return [];
  const ids = groups.map((g) => g.id);
  const [projectRows, memberRows] = await Promise.all([
    db.select({ id: projects.id, groupId: projects.groupId }).from(projects).where(and(eq(projects.workspaceId, workspaceId), inArray(projects.groupId, ids))),
    db
      .select({ groupId: groupMembers.groupId, userId: groupMembers.userId, roleKey: groupMembers.roleKey })
      .from(groupMembers)
      .innerJoin(workspaceMembers, and(eq(workspaceMembers.userId, groupMembers.userId), eq(workspaceMembers.workspaceId, workspaceId)))
      .where(inArray(groupMembers.groupId, ids)),
  ]);
  return groups.map((g) => ({
    id: g.id,
    parentId: g.parentId,
    name: g.name,
    kind: g.kind,
    position: g.position,
    projectIds: projectRows.filter((p) => p.groupId === g.id).map((p) => p.id),
    members: memberRows.filter((m) => m.groupId === g.id).map((m) => ({ userId: m.userId, roleKey: m.roleKey })),
  }));
}

/** Project role overrides of the workspace (project assignments with a role). */
export async function listProjectRoleOverrides(workspaceId: string) {
  return db
    .select({ projectId: projectMembers.projectId, userId: projectMembers.userId, roleKey: projectMembers.roleKey })
    .from(projectMembers)
    .innerJoin(projects, eq(projects.id, projectMembers.projectId))
    .where(and(eq(projects.workspaceId, workspaceId), sql`${projectMembers.roleKey} IS NOT NULL`));
}

export type AccessPreviewRow = {
  projectId: string;
  projectName: string;
  projectDomain: string;
  groupId: string | null;
  access: boolean;
  via: "all_projects" | "project" | "group" | null;
  source: "project" | "group" | "workspace" | null;
  roleKey: string | null;
  sourceGroupId: string | null;
  permissions: Permission[];
};

/** Effective access of one member to every project of the workspace (for the "effective access" preview). */
export async function previewUserAccess(workspaceId: string, userId: string): Promise<AccessPreviewRow[]> {
  const [inputs, projectRows] = await Promise.all([
    loadWorkspaceMemberInputs(workspaceId),
    db
      .select({ id: projects.id, name: projects.name, domain: projects.domain, groupId: projects.groupId, workspaceId: projects.workspaceId })
      .from(projects)
      .where(and(eq(projects.workspaceId, workspaceId), eq(projects.archived, false)))
      .orderBy(asc(projects.name)),
  ]);
  const input = inputs.get(userId);
  if (!input) throw new MemberError("That person is not an active member of this workspace.");
  return projectRows.map((p) => {
    const res = resolveProjectAccess(input, p);
    return {
      projectId: p.id,
      projectName: p.name,
      projectDomain: p.domain,
      groupId: p.groupId,
      access: res.access,
      via: res.access ? res.via : null,
      source: res.access ? res.source : null,
      roleKey: res.access ? res.roleKey : null,
      sourceGroupId: res.access ? res.sourceGroupId : null,
      permissions: res.access ? [...res.permissions].filter((x) => isProjectScopedPermission(x)) : [],
    };
  });
}

/* ───────────────────────────── Groups ───────────────────────────── */

function cleanName(name: string) {
  const trimmed = name.trim().slice(0, 80);
  if (!trimmed) throw new MemberError("Name is required.");
  return trimmed;
}

export async function createGroup(workspaceId: string, input: { name: string; kind: GroupKind; parentId: string | null }, actor: Actor) {
  const name = cleanName(input.name);
  const all = await workspaceGroups(workspaceId);
  if (all.length >= 500) throw new MemberError("A workspace can have at most 500 groups.");
  if (input.parentId) {
    if (!all.some((g) => g.id === input.parentId)) throw new MemberError("Parent group not found.");
    if (groupDepth(nodeMap(all), input.parentId) + 1 > MAX_GROUP_DEPTH) throw new MemberError(`Groups can be nested at most ${MAX_GROUP_DEPTH} levels deep.`);
  }
  const siblings = all.filter((g) => g.parentId === input.parentId);
  const [row] = await db
    .insert(projectGroups)
    .values({ workspaceId, name, kind: input.kind, parentId: input.parentId, position: siblings.length ? Math.max(...siblings.map((s) => s.position)) + 1 : 0 })
    .returning();
  void logAudit("group.created", { actor, targetType: "group", targetId: row!.id, workspaceId, meta: { name, kind: input.kind, parentId: input.parentId } });
  return row!;
}

export async function updateGroup(
  workspaceId: string,
  groupId: string,
  input: { name?: string; kind?: GroupKind; parentId?: string | null },
  editor: GroupEditor,
  actor: Actor,
) {
  const group = await loadGroup(workspaceId, groupId);
  const set: Partial<typeof projectGroups.$inferInsert> = {};
  if (input.name !== undefined) set.name = cleanName(input.name);
  if (input.kind !== undefined) set.kind = input.kind;
  if (input.parentId !== undefined && input.parentId !== group.parentId) {
    const all = await workspaceGroups(workspaceId);
    const nodes = nodeMap(all);
    if (input.parentId && !nodes.has(input.parentId)) throw new MemberError("Parent group not found.");
    if (wouldCreateCycle(nodes, groupId, input.parentId)) throw new MemberError("A group can't be moved into itself or one of its sub-groups.");
    const newDepth = (input.parentId ? groupDepth(nodes, input.parentId) : 0) + 1 + subtreeHeight(nodes, groupId);
    if (newDepth > MAX_GROUP_DEPTH) throw new MemberError(`Groups can be nested at most ${MAX_GROUP_DEPTH} levels deep.`);
    const newParent = input.parentId;
    await assertChainGrantable(workspaceId, newParent, editor);
    await assertNoSelfWidening(workspaceId, editor, (i, rows) => {
      const groups = new Map(i.groups);
      const g = groups.get(groupId);
      if (g) groups.set(groupId, { ...g, parentId: newParent });
      return { input: { ...i, groups }, projects: rows };
    });
    set.parentId = input.parentId;
    const siblings = all.filter((g) => g.parentId === input.parentId);
    set.position = siblings.length ? Math.max(...siblings.map((s) => s.position)) + 1 : 0;
  }
  if (!Object.keys(set).length) return group;
  const [row] = await db.update(projectGroups).set(set).where(eq(projectGroups.id, groupId)).returning();
  void logAudit(set.parentId !== undefined ? "group.moved" : "group.updated", {
    actor,
    targetType: "group",
    targetId: groupId,
    workspaceId,
    meta: {
      ...(set.name && set.name !== group.name ? { name: { from: group.name, to: set.name } } : {}),
      ...(set.kind && set.kind !== group.kind ? { kind: set.kind } : {}),
      ...(set.parentId !== undefined ? { parentId: { from: group.parentId, to: set.parentId } } : {}),
    },
  });
  return row!;
}

/** Deletes a group: its sub-groups and projects move up to the parent group; its member roles are removed. */
export async function deleteGroup(workspaceId: string, groupId: string, editor: GroupEditor, actor: Actor) {
  const group = await loadGroup(workspaceId, groupId);
  await assertNoSelfWidening(workspaceId, editor, (i, rows) => {
    const groups = new Map([...i.groups].filter(([id]) => id !== groupId).map(([id, g]) => [id, g.parentId === groupId ? { ...g, parentId: group.parentId } : g]));
    const groupRoles = new Map([...i.groupRoles].filter(([id]) => id !== groupId));
    return {
      input: { ...i, groups, groupRoles },
      projects: rows.map((p) => (p.groupId === groupId ? { ...p, groupId: group.parentId } : p)),
    };
  });
  await db.transaction(async (tx) => {
    await tx
      .update(projectGroups)
      .set({ parentId: group.parentId })
      .where(and(eq(projectGroups.parentId, groupId), eq(projectGroups.workspaceId, workspaceId)));
    await tx.update(projects).set({ groupId: group.parentId }).where(and(eq(projects.groupId, groupId), eq(projects.workspaceId, workspaceId)));
    await tx.delete(projectGroups).where(eq(projectGroups.id, groupId));
  });
  void logAudit("group.deleted", { actor, targetType: "group", targetId: groupId, workspaceId, meta: { name: group.name, movedTo: group.parentId } });
}

export async function setProjectGroup(workspaceId: string, projectId: string, groupId: string | null, editor: GroupEditor, actor: Actor) {
  const project = await assertProjectInWorkspace(workspaceId, projectId);
  if (groupId) await loadGroup(workspaceId, groupId);
  await assertChainGrantable(workspaceId, groupId, editor);
  await assertNoSelfWidening(workspaceId, editor, (i, rows) => ({ input: i, projects: rows.map((p) => (p.id === projectId ? { ...p, groupId } : p)) }));
  await db.update(projects).set({ groupId }).where(and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)));
  void logAudit("group.project_assigned", { actor, targetType: "project", targetId: projectId, workspaceId, projectId, meta: { project: project.name, groupId } });
}

/* ───────────────────────────── Group members ───────────────────────────── */

export async function setGroupMember(
  workspaceId: string,
  groupId: string,
  userId: string,
  roleKey: string,
  editor: GroupEditor,
  actor: Actor,
) {
  assertNotSelf(editor, userId);
  await loadGroup(workspaceId, groupId);
  await assertWorkspaceMember(workspaceId, userId);
  await assertGrantableRole(roleKey, editor);
  await db
    .insert(groupMembers)
    .values({ groupId, userId, roleKey })
    .onConflictDoUpdate({ target: [groupMembers.groupId, groupMembers.userId], set: { roleKey } });
  void logAudit("group.member_set", { actor, targetType: "user", targetId: userId, workspaceId, meta: { groupId, roleKey } });
}

export async function removeGroupMember(workspaceId: string, groupId: string, userId: string, editor: GroupEditor, actor: Actor) {
  assertNotSelf(editor, userId);
  await loadGroup(workspaceId, groupId);
  await db.delete(groupMembers).where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)));
  void logAudit("group.member_removed", { actor, targetType: "user", targetId: userId, workspaceId, meta: { groupId } });
}

/* ───────────────────────────── Project roles ───────────────────────────── */

/**
 * Sets (or clears with `roleKey` null) a member's role override for one project. Setting a role also grants
 * access to the project; clearing keeps the plain project assignment.
 */
export async function setProjectRole(
  workspaceId: string,
  projectId: string,
  userId: string,
  roleKey: string | null,
  editor: GroupEditor,
  actor: Actor,
) {
  assertNotSelf(editor, userId);
  await assertProjectInWorkspace(workspaceId, projectId);
  await assertWorkspaceMember(workspaceId, userId);
  if (roleKey) await assertGrantableRole(roleKey, editor);
  if (roleKey) {
    await db
      .insert(projectMembers)
      .values({ projectId, userId, roleKey })
      .onConflictDoUpdate({ target: [projectMembers.projectId, projectMembers.userId], set: { roleKey } });
  } else {
    await db.update(projectMembers).set({ roleKey: null }).where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)));
  }
  void logAudit("member.project_role_changed", { actor, targetType: "user", targetId: userId, workspaceId, projectId, meta: { roleKey } });
}

/** Members of the workspace for pickers (active + disabled, disabled ones are shown but can't sign in). */
export async function listWorkspacePeople(workspaceId: string) {
  return db
    .select({ userId: users.id, email: users.email, name: users.name, avatarUrl: users.avatarUrl, roleKey: workspaceMembers.roleKey, status: users.status })
    .from(workspaceMembers)
    .innerJoin(users, eq(users.id, workspaceMembers.userId))
    .where(eq(workspaceMembers.workspaceId, workspaceId))
    .orderBy(asc(users.email));
}

/** Ungrouped projects count (for the tree's "No group" bucket). */
export async function countUngroupedProjects(workspaceId: string) {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(projects)
    .where(and(eq(projects.workspaceId, workspaceId), isNull(projects.groupId), eq(projects.archived, false)));
  return Number(row?.n ?? 0);
}

/** Lightweight group list (id, parent, name, kind) for pickers and breadcrumbs. */
export async function listGroupOptions(workspaceId: string) {
  return db
    .select({ id: projectGroups.id, parentId: projectGroups.parentId, name: projectGroups.name, kind: projectGroups.kind })
    .from(projectGroups)
    .where(eq(projectGroups.workspaceId, workspaceId))
    .orderBy(asc(projectGroups.position), asc(projectGroups.name));
}
