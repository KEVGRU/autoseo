import { describe, expect, it } from "vitest";
import {
  MAX_GROUP_DEPTH,
  groupChain,
  groupDepth,
  findWidening,
  groupsWithDescendants,
  maxProjectPermissions,
  resolveAccessibleProjects,
  resolveProjectAccess,
  subtreeHeight,
  wouldCreateCycle,
  type GroupNode,
  type RoleDef,
  type WorkspaceAccessInput,
} from "./effective-access";
import { BUILTIN_ROLES } from "./permissions";

const WS = "wsp_a";
const roles = new Map<string, RoleDef>(BUILTIN_ROLES.map((r) => [r.key, { key: r.key, permissions: r.permissions, allProjects: r.allProjects }]));
roles.set("viewer_export", { key: "viewer_export", permissions: ["project.view", "data.export", "members.manage"], allProjects: true });
roles.set("regional_admin", {
  key: "regional_admin",
  permissions: ["project.view", "prompts.manage", "reports.manage", "reports.share", "data.export", "projects.manage", "settings.manage", "admin.access"],
  allProjects: true,
});

// Tree: brand (EU) → region (DACH) → team (Berlin); second root "Clients".
const groupList: GroupNode[] = [
  { id: "g_brand", parentId: null, workspaceId: WS },
  { id: "g_dach", parentId: "g_brand", workspaceId: WS },
  { id: "g_berlin", parentId: "g_dach", workspaceId: WS },
  { id: "g_clients", parentId: null, workspaceId: WS },
  { id: "g_foreign", parentId: null, workspaceId: "wsp_other" },
];
const groups = new Map(groupList.map((g) => [g.id, g]));

function input(over: Partial<WorkspaceAccessInput> = {}): WorkspaceAccessInput {
  return {
    workspaceId: WS,
    workspaceRoleKey: "member",
    workspaceStatus: "active",
    sharedCloud: false,
    isInstanceAdmin: false,
    groups,
    groupRoles: new Map(),
    projectAssignments: new Map(),
    roles,
    ...over,
  };
}

const berlin = { id: "prj_berlin", workspaceId: WS, groupId: "g_berlin" };
const dach = { id: "prj_dach", workspaceId: WS, groupId: "g_dach" };
const loose = { id: "prj_loose", workspaceId: WS, groupId: null };
const client = { id: "prj_client", workspaceId: WS, groupId: "g_clients" };

function granted(res: ReturnType<typeof resolveProjectAccess>) {
  if (!res.access) throw new Error(`expected access, got ${res.reason}`);
  return res;
}

describe("resolveProjectAccess — workspace level", () => {
  it("requires a workspace membership", () => {
    expect(resolveProjectAccess(input({ workspaceRoleKey: null, groupRoles: new Map([["g_brand", "admin"]]) }), berlin)).toEqual({
      access: false,
      reason: "not_member",
    });
  });

  it("gives all-project roles access with the workspace role", () => {
    const res = granted(resolveProjectAccess(input({ workspaceRoleKey: "admin" }), loose));
    expect(res.via).toBe("all_projects");
    expect(res.source).toBe("workspace");
    expect(res.permissions.has("prompts.manage")).toBe(true);
    expect(res.permissions.has("data.export")).toBe(true);
  });

  it("denies selected-projects members without any assignment", () => {
    expect(resolveProjectAccess(input(), loose)).toEqual({ access: false, reason: "not_assigned" });
  });

  it("rejects projects of another workspace", () => {
    expect(resolveProjectAccess(input({ workspaceRoleKey: "owner" }), { id: "x", workspaceId: "wsp_other", groupId: null }).access).toBe(false);
  });
});

describe("resolveProjectAccess — inheritance", () => {
  it("grants selected-projects members access through an ancestor group", () => {
    const res = granted(resolveProjectAccess(input({ groupRoles: new Map([["g_brand", "member"]]) }), berlin));
    expect(res.via).toBe("group");
    expect(res.source).toBe("group");
    expect(res.sourceGroupId).toBe("g_brand");
  });

  it("uses the nearest group role (team overrides brand)", () => {
    const res = granted(resolveProjectAccess(input({ groupRoles: new Map([["g_brand", "member"], ["g_berlin", "client"]]) }), berlin));
    expect(res.roleKey).toBe("client");
    expect(res.sourceGroupId).toBe("g_berlin");
    expect(res.permissions.has("project.view")).toBe(true);
    expect(res.permissions.has("prompts.manage")).toBe(false);
    expect(res.permissions.has("data.export")).toBe(false);
  });

  it("does not grant sibling or parent projects from a sub-group membership", () => {
    const i = input({ groupRoles: new Map([["g_berlin", "member"]]) });
    expect(resolveProjectAccess(i, dach).access).toBe(false);
    expect(resolveProjectAccess(i, client).access).toBe(false);
    expect(resolveProjectAccess(i, loose).access).toBe(false);
  });

  it("a project role override beats every group role", () => {
    const res = granted(
      resolveProjectAccess(input({ groupRoles: new Map([["g_berlin", "client"]]), projectAssignments: new Map([["prj_berlin", "admin"]]) }), berlin),
    );
    expect(res.source).toBe("project");
    expect(res.roleKey).toBe("admin");
    expect(res.permissions.has("prompts.manage")).toBe(true);
  });

  it("a plain project assignment (no override) inherits the group role, then the workspace role", () => {
    const viaGroup = granted(
      resolveProjectAccess(input({ groupRoles: new Map([["g_brand", "client"]]), projectAssignments: new Map([["prj_berlin", null]]) }), berlin),
    );
    expect(viaGroup.via).toBe("project");
    expect(viaGroup.roleKey).toBe("client");
    const viaWorkspace = granted(resolveProjectAccess(input({ projectAssignments: new Map([["prj_loose", null]]) }), loose));
    expect(viaWorkspace.source).toBe("workspace");
    expect(viaWorkspace.roleKey).toBe("member");
  });

  it("narrows an all-projects workspace role for one project", () => {
    const res = granted(resolveProjectAccess(input({ workspaceRoleKey: "admin", projectAssignments: new Map([["prj_client", "client"]]) }), client));
    expect(res.via).toBe("all_projects");
    expect(res.permissions.has("prompts.manage")).toBe(false);
    // Workspace-level permissions still come from the workspace role.
    expect(res.permissions.has("members.manage")).toBe(true);
    expect(res.permissions.has("settings.manage")).toBe(true);
  });

  it("never takes workspace-level or instance permissions from a group/project role", () => {
    const res = granted(resolveProjectAccess(input({ workspaceRoleKey: "client", groupRoles: new Map([["g_brand", "regional_admin"]]) }), berlin));
    expect(res.permissions.has("projects.manage")).toBe(true);
    expect(res.permissions.has("reports.share")).toBe(true);
    expect(res.permissions.has("settings.manage")).toBe(false);
    expect(res.permissions.has("admin.access")).toBe(false);
    expect(res.permissions.has("projects.all")).toBe(false);
  });

  it("ignores allProjects of a group role (no access outside the subtree)", () => {
    const i = input({ workspaceRoleKey: "client", groupRoles: new Map([["g_dach", "viewer_export"]]) });
    expect(resolveProjectAccess(i, berlin).access).toBe(true);
    expect(resolveProjectAccess(i, loose).access).toBe(false);
    expect(granted(resolveProjectAccess(i, berlin)).permissions.has("members.manage")).toBe(false);
  });

  it("fails closed for deleted role keys", () => {
    expect(resolveProjectAccess(input({ workspaceRoleKey: "admin", groupRoles: new Map([["g_berlin", "gone"]]) }), berlin)).toEqual({
      access: false,
      reason: "no_view",
    });
  });

  it("hides a project behind a role without project.view (a \"No access\" override)", () => {
    const withNoAccess = new Map(roles).set("no_access", { key: "no_access", permissions: [], allProjects: false });
    const i = input({ workspaceRoleKey: "admin", roles: withNoAccess, projectAssignments: new Map([["prj_client", "no_access"]]) });
    expect(resolveProjectAccess(i, client)).toEqual({ access: false, reason: "no_view" });
    expect(resolveProjectAccess(i, loose).access).toBe(true);
  });

  it("drops access when the group membership is removed", () => {
    const withMembership = input({ groupRoles: new Map([["g_dach", "member"]]) });
    expect(resolveProjectAccess(withMembership, berlin).access).toBe(true);
    expect(resolveProjectAccess(input(), berlin).access).toBe(false);
  });
});

describe("resolveProjectAccess — tenant rules", () => {
  it("hides suspended workspaces on the shared cloud, except for instance admins", () => {
    const suspended = input({ workspaceRoleKey: "owner", workspaceStatus: "suspended", sharedCloud: true });
    expect(resolveProjectAccess(suspended, loose)).toEqual({ access: false, reason: "suspended" });
    expect(resolveProjectAccess({ ...suspended, isInstanceAdmin: true }, loose).access).toBe(true);
    // Self-hosted instances don't suspend workspaces.
    expect(resolveProjectAccess({ ...suspended, sharedCloud: false }, loose).access).toBe(true);
  });

  it("gives instance admins no implicit project access without membership", () => {
    expect(resolveProjectAccess(input({ workspaceRoleKey: null, isInstanceAdmin: true }), loose).access).toBe(false);
  });
});

describe("group tree helpers", () => {
  it("walks the ancestor chain nearest first", () => {
    expect(groupChain(groups, "g_berlin", WS).map((g) => g.id)).toEqual(["g_berlin", "g_dach", "g_brand"]);
  });

  it("ignores groups of other workspaces", () => {
    expect(groupChain(groups, "g_foreign", WS)).toEqual([]);
    const mixed = new Map(groups).set("g_x", { id: "g_x", parentId: "g_foreign", workspaceId: WS });
    expect(groupChain(mixed, "g_x", WS).map((g) => g.id)).toEqual(["g_x"]);
  });

  it("survives cycles and bounds the depth", () => {
    const cyclic = new Map<string, GroupNode>([
      ["a", { id: "a", parentId: "b", workspaceId: WS }],
      ["b", { id: "b", parentId: "a", workspaceId: WS }],
    ]);
    expect(groupChain(cyclic, "a", WS).map((g) => g.id)).toEqual(["a", "b"]);
    expect(groupDepth(cyclic, "a")).toBe(Infinity);
    const deep = new Map<string, GroupNode>();
    for (let i = 0; i < 20; i++) deep.set(`d${i}`, { id: `d${i}`, parentId: i ? `d${i - 1}` : null, workspaceId: WS });
    expect(groupChain(deep, "d19", WS)).toHaveLength(MAX_GROUP_DEPTH);
    // A cyclic tree still resolves (no infinite loop) and grants nothing unexpected.
    const res = resolveProjectAccess(input({ groups: cyclic, groupRoles: new Map([["b", "member"]]) }), { id: "p", workspaceId: WS, groupId: "a" });
    expect(res.access).toBe(true);
  });

  it("detects moves that would create a cycle", () => {
    expect(wouldCreateCycle(groups, "g_brand", "g_berlin")).toBe(true);
    expect(wouldCreateCycle(groups, "g_dach", "g_dach")).toBe(true);
    expect(wouldCreateCycle(groups, "g_berlin", "g_clients")).toBe(false);
    expect(wouldCreateCycle(groups, "g_berlin", null)).toBe(false);
  });

  it("computes depth, subtree height and descendants", () => {
    expect(groupDepth(groups, "g_berlin")).toBe(3);
    expect(subtreeHeight(groups, "g_brand")).toBe(2);
    expect(subtreeHeight(groups, "g_berlin")).toBe(0);
    expect([...groupsWithDescendants(groups, ["g_dach"], WS)].sort()).toEqual(["g_berlin", "g_dach"]);
  });
});

describe("batch helpers", () => {
  it("lists accessible projects with their permissions", () => {
    const list = resolveAccessibleProjects(input({ groupRoles: new Map([["g_dach", "client"]]), projectAssignments: new Map([["prj_loose", null]]) }), [
      berlin,
      dach,
      loose,
      client,
    ]);
    expect(list.map((x) => x.project.id)).toEqual(["prj_berlin", "prj_dach", "prj_loose"]);
    expect(list.find((x) => x.project.id === "prj_loose")!.access.permissions.has("prompts.manage")).toBe(true);
    expect(list.find((x) => x.project.id === "prj_dach")!.access.permissions.has("prompts.manage")).toBe(false);
  });

  it("computes an upper bound of project permissions", () => {
    const max = maxProjectPermissions(input({ workspaceRoleKey: "client", groupRoles: new Map([["g_dach", "member"]]) }));
    expect(max.has("prompts.manage")).toBe(true);
    expect(max.has("members.manage")).toBe(false);
    expect(maxProjectPermissions(input({ workspaceRoleKey: null })).size).toBe(0);
  });
});

describe("findWidening (no self-escalation through group restructuring)", () => {
  it("detects gained access and gained permissions, ignores narrowing", () => {
    const narrowed = input({ workspaceRoleKey: "admin", groupRoles: new Map([["g_berlin", "client"]]) });
    // Moving the Berlin project out of the narrowing group gives the admin role back → widening.
    expect(findWidening(narrowed, narrowed, [berlin], [{ ...berlin, groupId: null }])).toMatchObject({ projectId: "prj_berlin" });
    // Moving a loose project into the narrowing group only narrows.
    expect(findWidening(narrowed, narrowed, [loose], [{ ...loose, groupId: "g_berlin" }])).toBeNull();
    // Re-parenting "Clients" under DACH gives a selected-projects member access through their DACH role.
    const member = input({ groupRoles: new Map([["g_dach", "member"]]) });
    const moved = new Map(groups).set("g_clients", { id: "g_clients", parentId: "g_dach", workspaceId: WS });
    expect(findWidening(member, { ...member, groups: moved }, [client], [client])).toEqual({ projectId: "prj_client", permission: "access" });
  });
});
