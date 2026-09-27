import { isProjectScopedPermission, type Permission } from "./permissions";

/**
 * Effective project access — pure, isomorphic resolver (unit tested in effective-access.test.ts).
 *
 * Model: workspace → project groups (tree: brand / region / team / client …) → projects.
 *
 * 1. A workspace membership is always required. Group or project assignments never grant access to a workspace
 *    the user isn't a member of (removing someone from the workspace also removes their group/project rows).
 * 2. On the shared AutoSEO Cloud, members of a suspended workspace have no access (instance admins still do).
 *    Instance admins get no implicit project access beyond that — they use the admin panel.
 * 3. Access to a project: the workspace role covers all projects (`allProjects` / `projects.all`), OR the user
 *    has an explicit project assignment, OR the user is a member of the project's group or of any ancestor group.
 * 4. Role for a project — the most specific assignment wins, a more specific one overrides a broader one in both
 *    directions (it can widen or narrow):
 *      project assignment with a role override  →  nearest group (project's group, then its parents)
 *      →  workspace role.
 * 5. Only project-scoped permissions (PROJECT_SCOPED_PERMISSIONS) come from that role. Workspace-level
 *    permissions (members, settings/API keys, usage, agents, workspace, instance admin) always come from the
 *    workspace role, and `allProjects` of a group/project role is ignored — a group role never reaches beyond
 *    its subtree.
 * 6. Without "project.view" in the resulting permissions there is no access at all (a "No access" override hides
 *    a project from an all-projects member). Unknown role keys fail closed (no project permissions → no access).
 *    Parent chains are walked at most MAX_GROUP_DEPTH levels and stop at a cycle; groups of other workspaces are
 *    ignored.
 */

export const MAX_GROUP_DEPTH = 8;

export type RoleDef = { key: string; name?: string; permissions: readonly string[]; allProjects: boolean };
export type GroupNode = { id: string; parentId: string | null; workspaceId: string; name?: string };

export type AccessSource = "project" | "group" | "workspace";

export type WorkspaceAccessInput = {
  workspaceId: string;
  /** Workspace role key; null = not a member. */
  workspaceRoleKey: string | null;
  workspaceStatus: "active" | "suspended";
  sharedCloud: boolean;
  isInstanceAdmin: boolean;
  /** All groups of the workspace (by id). */
  groups: ReadonlyMap<string, GroupNode>;
  /** The user's group memberships in this workspace: groupId → roleKey. */
  groupRoles: ReadonlyMap<string, string>;
  /** The user's project assignments: projectId → role override (null = inherit). */
  projectAssignments: ReadonlyMap<string, string | null>;
  roles: ReadonlyMap<string, RoleDef>;
};

export type ProjectRef = { id: string; workspaceId: string; groupId: string | null };

export type EffectiveAccess =
  | { access: false; reason: "not_member" | "suspended" | "other_workspace" | "not_assigned" | "no_view" }
  | {
      access: true;
      /** How access was granted. */
      via: "all_projects" | "project" | "group";
      roleKey: string;
      source: AccessSource;
      /** Group whose role applies (source "group"). */
      sourceGroupId: string | null;
      permissions: Set<Permission>;
    };

/** Ancestor chain of a group (itself first), bounded by MAX_GROUP_DEPTH, stopping at cycles / foreign groups. */
export function groupChain(groups: ReadonlyMap<string, GroupNode>, groupId: string | null, workspaceId: string): GroupNode[] {
  const chain: GroupNode[] = [];
  const seen = new Set<string>();
  let current = groupId ? groups.get(groupId) : undefined;
  while (current && chain.length < MAX_GROUP_DEPTH && !seen.has(current.id) && current.workspaceId === workspaceId) {
    chain.push(current);
    seen.add(current.id);
    current = current.parentId ? groups.get(current.parentId) : undefined;
  }
  return chain;
}

/** True when moving `groupId` under `newParentId` would create a cycle (or exceed the depth limit). */
export function wouldCreateCycle(groups: ReadonlyMap<string, GroupNode>, groupId: string, newParentId: string | null): boolean {
  if (!newParentId) return false;
  if (newParentId === groupId) return true;
  const seen = new Set<string>();
  let current = groups.get(newParentId);
  let steps = 0;
  while (current) {
    if (current.id === groupId || seen.has(current.id)) return true;
    seen.add(current.id);
    if (++steps > MAX_GROUP_DEPTH * 4) return true;
    current = current.parentId ? groups.get(current.parentId) : undefined;
  }
  return false;
}

/** Depth of a group (1 = top level) — Infinity for broken (cyclic) chains. */
export function groupDepth(groups: ReadonlyMap<string, GroupNode>, groupId: string): number {
  let depth = 0;
  const seen = new Set<string>();
  let current = groups.get(groupId);
  while (current) {
    if (seen.has(current.id)) return Infinity;
    seen.add(current.id);
    depth++;
    current = current.parentId ? groups.get(current.parentId) : undefined;
  }
  return depth;
}

/** Height of the subtree below a group (0 = leaf). */
export function subtreeHeight(groups: ReadonlyMap<string, GroupNode>, groupId: string): number {
  const children = new Map<string, string[]>();
  for (const g of groups.values()) if (g.parentId) children.set(g.parentId, [...(children.get(g.parentId) ?? []), g.id]);
  const walk = (id: string, seen: Set<string>): number => {
    if (seen.has(id) || seen.size > MAX_GROUP_DEPTH * 4) return 0;
    const next = new Set(seen).add(id);
    return Math.max(0, ...(children.get(id) ?? []).map((c) => 1 + walk(c, next)));
  };
  return walk(groupId, new Set());
}

/** Ids of the given groups and all their descendants (within the workspace, depth-bounded like groupChain). */
export function groupsWithDescendants(groups: ReadonlyMap<string, GroupNode>, roots: Iterable<string>, workspaceId: string): Set<string> {
  const rootSet = new Set(roots);
  const out = new Set<string>();
  for (const g of groups.values()) {
    if (g.workspaceId !== workspaceId) continue;
    if (groupChain(groups, g.id, workspaceId).some((a) => rootSet.has(a.id))) out.add(g.id);
  }
  return out;
}

function roleCoversAllProjects(role: RoleDef | undefined): boolean {
  return Boolean(role && (role.allProjects || role.permissions.includes("projects.all")));
}

function workspaceScoped(role: RoleDef | undefined): Permission[] {
  return ((role?.permissions ?? []) as Permission[]).filter((p) => !isProjectScopedPermission(p));
}

function projectScoped(role: RoleDef | undefined): Permission[] {
  return ((role?.permissions ?? []) as Permission[]).filter((p) => isProjectScopedPermission(p));
}

/** Resolves a user's access and permissions for one project. */
export function resolveProjectAccess(input: WorkspaceAccessInput, project: ProjectRef): EffectiveAccess {
  if (project.workspaceId !== input.workspaceId) return { access: false, reason: "other_workspace" };
  if (!input.workspaceRoleKey) return { access: false, reason: "not_member" };
  if (input.sharedCloud && input.workspaceStatus === "suspended" && !input.isInstanceAdmin) return { access: false, reason: "suspended" };

  const workspaceRole = input.roles.get(input.workspaceRoleKey);
  const chain = groupChain(input.groups, project.groupId, input.workspaceId);
  const nearestGroup = chain.find((g) => input.groupRoles.has(g.id)) ?? null;
  const assigned = input.projectAssignments.has(project.id);
  const override = assigned ? (input.projectAssignments.get(project.id) ?? null) : null;

  const via = roleCoversAllProjects(workspaceRole) ? "all_projects" : assigned ? "project" : nearestGroup ? "group" : null;
  if (!via) return { access: false, reason: "not_assigned" };

  let roleKey: string;
  let source: AccessSource;
  let sourceGroupId: string | null = null;
  if (override) {
    roleKey = override;
    source = "project";
  } else if (nearestGroup) {
    roleKey = input.groupRoles.get(nearestGroup.id)!;
    source = "group";
    sourceGroupId = nearestGroup.id;
  } else {
    roleKey = input.workspaceRoleKey;
    source = "workspace";
  }
  // Unknown (deleted) role keys fail closed: no project permissions from them.
  const effectiveRole = input.roles.get(roleKey);
  const permissions = new Set<Permission>([...workspaceScoped(workspaceRole), ...projectScoped(effectiveRole)]);
  // A role without "View project data" hides the project (UI, REST and MCP alike) — e.g. a "No access" override.
  if (!permissions.has("project.view")) return { access: false, reason: "no_view" };
  return { access: true, via, roleKey, source, sourceGroupId, permissions };
}

/**
 * Projects (of `candidates`) the user can access, with their effective permissions. Used for project lists;
 * `resolveProjectAccess` is the single source of truth, this only batches it.
 */
export function resolveAccessibleProjects<P extends ProjectRef>(
  input: WorkspaceAccessInput,
  candidates: readonly P[],
): { project: P; access: Extract<EffectiveAccess, { access: true }> }[] {
  const out: { project: P; access: Extract<EffectiveAccess, { access: true }> }[] = [];
  for (const project of candidates) {
    const access = resolveProjectAccess(input, project);
    if (access.access) out.push({ project, access });
  }
  return out;
}

/** Group ids whose projects are reachable through group membership (member groups + their sub-groups). */
export function reachableGroupIds(input: Pick<WorkspaceAccessInput, "groups" | "groupRoles" | "workspaceId">): Set<string> {
  return groupsWithDescendants(input.groups, input.groupRoles.keys(), input.workspaceId);
}

/**
 * Project-scoped permissions the user holds in at least one project of the workspace (workspace role or any
 * group/project role). Only an upper bound for pre-checks — the per-project check stays authoritative.
 */
export function maxProjectPermissions(input: WorkspaceAccessInput): Set<Permission> {
  const out = new Set<Permission>();
  if (!input.workspaceRoleKey) return out;
  if (input.sharedCloud && input.workspaceStatus === "suspended" && !input.isInstanceAdmin) return out;
  const keys = [input.workspaceRoleKey, ...input.groupRoles.values(), ...[...input.projectAssignments.values()].filter((k): k is string => Boolean(k))];
  for (const key of keys) for (const p of projectScoped(input.roles.get(key))) out.add(p);
  return out;
}

/**
 * First project where `after` grants access or a permission that `before` didn't (null = nothing widened). Used to
 * stop managers from widening their own access by restructuring groups (moving/deleting groups or projects).
 */
export function findWidening(
  before: WorkspaceAccessInput,
  after: WorkspaceAccessInput,
  projectsBefore: readonly ProjectRef[],
  projectsAfter: readonly ProjectRef[],
): { projectId: string; permission: Permission | "access" } | null {
  const afterById = new Map(projectsAfter.map((p) => [p.id, p]));
  for (const p of projectsBefore) {
    const next = afterById.get(p.id);
    if (!next) continue;
    const a = resolveProjectAccess(after, next);
    if (!a.access) continue;
    const b = resolveProjectAccess(before, p);
    if (!b.access) return { projectId: p.id, permission: "access" };
    for (const perm of a.permissions) if (!b.permissions.has(perm)) return { projectId: p.id, permission: perm };
  }
  return null;
}
