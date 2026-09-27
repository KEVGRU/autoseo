import fs from "node:fs";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/server/db/client";
import {
  apiRequestLogs,
  auditLogs,
  jobs,
  notifications,
  projects,
  roles,
  usageEvents,
  users,
  workspaceMembers,
  workspaces,
} from "@/server/db/schema";
import { env } from "@/server/env";
import type { CurrentSession } from "@/server/auth/session";
import { getUserContext } from "@/server/auth/context";
import { resolveCredential } from "@/server/api/auth";
import { authenticateRequest } from "@/server/api/handler";
import { ApiError } from "@/server/api/errors";
import { createEphemeralApiKey } from "@/server/api/keys";
import { createRole, updateRoles } from "@/server/admin/roles";
import { MemberError } from "@/server/admin/members";
import { projectLimitFor } from "@/server/projects";
import { enqueueJob } from "@/server/jobs/queue";
import { assertBudget, BudgetExceededError, recordUsage } from "@/server/usage";
import { ADMIN_SUSPENSION_REASON, invalidateTenancyCache, isProjectActive, suspensionReasons } from "./tenancy";
import { deleteTenant } from "./tenants";
import { GET as healthRoute } from "@/app/api/cloud/health/route";
import { DELETE as deleteRoute, GET as getRoute, PUT as putRoute } from "@/app/api/cloud/tenants/[tenantId]/route";
import { PUT as configRoute } from "@/app/api/cloud/config/route";

// The signed-in user of getUserContext() is whatever the test sets here.
let sessionUserId: string | null = null;
vi.mock("@/server/auth/session", async (orig) => {
  const actual = await orig<typeof import("@/server/auth/session")>();
  return {
    ...actual,
    getCurrentSession: async (): Promise<CurrentSession | null> => {
      if (!sessionUserId) return null;
      const [user] = await db.select().from(users).where(eq(users.id, sessionUserId));
      return user ? ({ user, session: { id: "ses_test" } } as unknown as CurrentSession) : null;
    },
  };
});

// Instance-wide budgets (Admin → Limits) of the dev DB must not interfere with the per-workspace checks.
vi.mock("@/server/settings", async (orig) => {
  const actual = await orig<typeof import("@/server/settings")>();
  return {
    ...actual,
    getSetting: (async (key: Parameters<typeof actual.getSetting>[0]) => {
      const value = await actual.getSetting(key);
      return key === "limits" ? { ...value, dailyBudgetUsd: 0, monthlyBudgetUsd: 0 } : value;
    }) as typeof actual.getSetting,
  };
});

const SECRET = "test-cloud-secret-".padEnd(64, "x");
const suffix = Math.random().toString(36).slice(2, 8);
const mutableEnv = env as { cloudApiSecret: string | null };

function setSharedCloud(on: boolean) {
  mutableEnv.cloudApiSecret = on ? SECRET : null;
  invalidateTenancyCache();
}

function call(method: string, pathname: string, body?: unknown, auth: string | null = `Bearer ${SECRET}`) {
  return new Request(`http://localhost${pathname}`, {
    method,
    headers: { ...(auth ? { authorization: auth } : {}), ...(body !== undefined ? { "content-type": "application/json" } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

const tenantCtx = (tenantId: string) => ({ params: Promise.resolve({ tenantId }) }) as RouteContext<"/api/cloud/tenants/[tenantId]">;

async function put(tenantId: string, body: Record<string, unknown>) {
  const res = await putRoute(call("PUT", `/api/cloud/tenants/${tenantId}`, body), tenantCtx(tenantId));
  return { status: res.status, body: (await res.json()) as Record<string, unknown> };
}

const tenantIds: string[] = [];
function newTenantId(label: string) {
  const id = `t_${label}_${suffix}`;
  tenantIds.push(id);
  return id;
}
const email = (label: string) => `cloud.${label}.${suffix}@autoseo.test`;

let operatorId = "";

beforeAll(async () => {
  // An instance admin must exist (the tenant API refuses to claim an empty instance).
  const [op] = await db.insert(users).values({ email: email("operator"), name: "Operator", isInstanceAdmin: true }).returning();
  operatorId = op!.id;
});

afterEach(() => {
  sessionUserId = null;
  setSharedCloud(true);
});

afterAll(async () => {
  setSharedCloud(true);
  for (const id of tenantIds) await deleteTenant(id);
  await db.delete(users).where(inArray(users.email, [email("operator"), email("owner"), email("owner2"), email("colleague"), email("admin-role"), email("gone")]));
  mutableEnv.cloudApiSecret = null;
});

describe("tenant API auth", () => {
  it("does not exist without AUTOSEO_CLOUD_API_SECRET and rejects wrong secrets", async () => {
    setSharedCloud(false);
    expect((await healthRoute(call("GET", "/api/cloud/health"))).status).toBe(404);
    expect((await putRoute(call("PUT", "/api/cloud/tenants/x", {}), tenantCtx("x"))).status).toBe(404);

    setSharedCloud(true);
    expect((await healthRoute(call("GET", "/api/cloud/health", undefined, null))).status).toBe(401);
    expect((await healthRoute(call("GET", "/api/cloud/health", undefined, "Bearer nope"))).status).toBe(401);
    expect((await getRoute(call("GET", "/api/cloud/tenants/x", undefined, `Bearer ${SECRET}x`), tenantCtx("x"))).status).toBe(401);
    expect((await configRoute(call("PUT", "/api/cloud/config", { mail: null }, "Basic abc"))).status).toBe(401);
    const ok = await healthRoute(call("GET", "/api/cloud/health"));
    expect(ok.status).toBe(200);
    expect(await ok.json()).toMatchObject({ ok: true });
  });

  it("validates the tenant id and body", async () => {
    const long = "a".repeat(65);
    expect((await getRoute(call("GET", `/api/cloud/tenants/${long}`), tenantCtx(long))).status).toBe(400);
    const id = newTenantId("invalid");
    expect((await put(id, { ownerEmail: "not-an-email", workspaceName: "X" })).status).toBe(400);
    expect((await put(id, { ownerEmail: "a{b}@example.com", workspaceName: "X" })).status).toBe(400);
    expect((await put(id, { ownerEmail: email("owner"), workspaceName: "" })).status).toBe(400);
    expect((await put(id, { ownerEmail: email("owner"), workspaceName: "X", status: "deleted" })).status).toBe(400);
    expect((await configRoute(call("PUT", "/api/cloud/config", { mail: { smtpUrl: "http://x", from: "a@b.c" } }))).status).toBe(400);
    expect((await getRoute(call("GET", `/api/cloud/tenants/${id}`), tenantCtx(id))).status).toBe(404);
  });
});

describe("tenant upsert (integration, dev DB)", () => {
  it("is idempotent and keeps name, status and limits in sync", async () => {
    const id = newTenantId("upsert");
    const first = await put(id, { ownerEmail: email("owner").toUpperCase(), workspaceName: "Acme", limits: { monthlyBudgetUsd: 5, maxProjects: 2 } });
    expect(first.status).toBe(201);
    expect(first.body).toMatchObject({ tenantId: id, status: "active" });
    const again = await put(id, { ownerEmail: email("owner"), workspaceName: "Acme" });
    expect(again.status).toBe(200);
    expect(again.body).toEqual(first.body);

    const wsRows = await db.select().from(workspaces).where(eq(workspaces.cloudTenantId, id));
    expect(wsRows).toHaveLength(1);
    expect(wsRows[0]!.settings).toEqual({ monthlyBudgetUsd: 5, maxProjects: 2 });
    const [owner] = await db.select().from(users).where(eq(users.id, first.body.ownerUserId as string));
    expect(owner).toMatchObject({ email: email("owner"), isInstanceAdmin: false, status: "active" });
    const members = await db.select().from(workspaceMembers).where(eq(workspaceMembers.workspaceId, wsRows[0]!.id));
    expect(members).toEqual([expect.objectContaining({ userId: owner!.id, roleKey: "owner" })]);

    // Rename, drop one limit, change the owner email (the previous owner stays).
    await put(id, { ownerEmail: email("owner2"), workspaceName: "Acme GmbH", limits: { maxProjects: null } });
    const res = await getRoute(call("GET", `/api/cloud/tenants/${id}`), tenantCtx(id));
    expect(await res.json()).toEqual({
      tenantId: id,
      workspaceId: first.body.workspaceId,
      status: "active",
      name: "Acme GmbH",
      members: 2,
      projects: 0,
      spendThisMonthUsd: 0,
      limits: { monthlyBudgetUsd: 5 },
    });
    // Mutations are audited; reads are not (the cloud polls GET on every dashboard render).
    const audited = async (action: string) =>
      (await db.select().from(auditLogs).where(and(eq(auditLogs.workspaceId, first.body.workspaceId as string), eq(auditLogs.action, action)))).length;
    await vi.waitFor(async () => expect(await audited("cloud.tenant_updated")).toBeGreaterThan(0));
    expect(await audited("cloud.tenant_created")).toBe(1);
    expect(await audited("cloud.tenant_viewed")).toBe(0);

    // Status: omitted keeps the current one; suspended carries a reason; active clears it.
    await put(id, { ownerEmail: email("owner"), workspaceName: "Acme GmbH", status: "suspended", suspendedReason: "unpaid" });
    await put(id, { ownerEmail: email("owner"), workspaceName: "Acme GmbH" });
    let [ws] = await db.select().from(workspaces).where(eq(workspaces.cloudTenantId, id));
    expect(ws).toMatchObject({ status: "suspended", suspendedReason: "unpaid" });
    await put(id, { ownerEmail: email("owner"), workspaceName: "Acme GmbH", status: "suspended", suspendedReason: ADMIN_SUSPENSION_REASON });
    expect(await suspensionReasons([ws!.id])).toEqual([ADMIN_SUSPENSION_REASON]);
    await put(id, { ownerEmail: email("owner"), workspaceName: "Acme GmbH", status: "active" });
    [ws] = await db.select().from(workspaces).where(eq(workspaces.cloudTenantId, id));
    expect(ws).toMatchObject({ status: "active", suspendedReason: null });
    expect(await suspensionReasons([ws!.id])).toEqual([null]);
  });

  it("creates a single workspace under concurrent calls", async () => {
    const id = newTenantId("race");
    const results = await Promise.all([1, 2, 3].map(() => put(id, { ownerEmail: email("owner"), workspaceName: "Race Co" })));
    expect(results.every((r) => r.status === 200 || r.status === 201)).toBe(true);
    expect(new Set(results.map((r) => r.body.workspaceId)).size).toBe(1);
    expect(await db.select().from(workspaces).where(eq(workspaces.cloudTenantId, id))).toHaveLength(1);
  });
});

describe("suspended workspaces (integration, dev DB)", () => {
  it("hide the workspace from members, block API credentials and stop new jobs; resume restores access", async () => {
    const id = newTenantId("suspend");
    const { body } = await put(id, { ownerEmail: email("owner"), workspaceName: "Paused Co" });
    const workspaceId = body.workspaceId as string;
    const ownerId = body.ownerUserId as string;
    const [project] = await db.insert(projects).values({ workspaceId, name: "Site", domain: `paused-${suffix}.test` }).returning();
    const key = await createEphemeralApiKey({ workspaceId, userId: ownerId, projectIds: null, scopes: ["read"], ttlMs: 60_000, label: "test" });
    const apiRequest = () => new Request("http://localhost/api/v1/me", { headers: { authorization: `Bearer ${key.token}` } });

    sessionUserId = ownerId;
    expect((await getUserContext())!.memberships.map((m) => m.workspace.id)).toContain(workspaceId);
    expect(await resolveCredential(key.token)).not.toBeNull();

    await put(id, { ownerEmail: email("owner"), workspaceName: "Paused Co", status: "suspended" });
    const ctx = (await getUserContext())!;
    expect(ctx.memberships.map((m) => m.workspace.id)).not.toContain(workspaceId);
    expect(ctx.pausedWorkspaces).toEqual(expect.arrayContaining([{ id: workspaceId, name: "Paused Co" }]));
    await expect(resolveCredential(key.token)).rejects.toBeInstanceOf(ApiError);
    const denied = await authenticateRequest(apiRequest(), "/api/v1");
    expect(denied).toMatchObject({ ok: false, status: 403 });
    expect(await isProjectActive(project!.id)).toBe(false);
    expect(await enqueueJob("test.noop", { projectId: project!.id }, { projectId: project!.id })).toBeNull();

    // Instance admins still see suspended workspaces.
    await db.insert(workspaceMembers).values({ workspaceId, userId: operatorId, roleKey: "member" });
    sessionUserId = operatorId;
    expect((await getUserContext())!.memberships.map((m) => m.workspace.id)).toContain(workspaceId);

    // Self-hosted (no secret): the status column is ignored entirely.
    setSharedCloud(false);
    sessionUserId = ownerId;
    expect((await getUserContext())!.memberships.map((m) => m.workspace.id)).toContain(workspaceId);
    expect(await resolveCredential(key.token)).not.toBeNull();

    setSharedCloud(true);
    await put(id, { ownerEmail: email("owner"), workspaceName: "Paused Co", status: "active" });
    expect((await getUserContext())!.memberships.map((m) => m.workspace.id)).toContain(workspaceId);
    expect(await resolveCredential(key.token)).not.toBeNull();
    const job = await enqueueJob("test.noop", { projectId: project!.id }, { projectId: project!.id, runAt: new Date(Date.now() + 3600_000) });
    expect(job).not.toBeNull();
    await db.delete(jobs).where(eq(jobs.id, job!.id));
  });
});

describe("instance admin access on the shared cloud", () => {
  it("comes from the account flag only — roles can't grant admin.access", async () => {
    await expect(createRole({ name: `Cloud admin ${suffix}`, permissions: ["admin.access"], allProjects: true }, { id: operatorId, email: email("operator") })).rejects.toBeInstanceOf(
      MemberError,
    );
    const [member] = await db.select().from(roles).where(eq(roles.key, "member"));
    await expect(
      updateRoles([{ key: "member", permissions: [...member!.permissions, "admin.access"] }], { id: operatorId, email: email("operator") }),
    ).rejects.toBeInstanceOf(MemberError);
    expect((await db.select().from(roles).where(eq(roles.key, "member")))[0]!.permissions).toEqual(member!.permissions);

    // A pre-existing role with admin.access is ignored while the instance is a shared cloud instance.
    const roleKey = `cloud_admin_${suffix}`;
    await db.insert(roles).values({ key: roleKey, name: "Legacy admin", permissions: ["admin.access", "project.view"] });
    const id = newTenantId("adminrole");
    const { body } = await put(id, { ownerEmail: email("admin-role"), workspaceName: "Role Co" });
    await db.update(workspaceMembers).set({ roleKey }).where(eq(workspaceMembers.userId, body.ownerUserId as string));
    try {
      sessionUserId = body.ownerUserId as string;
      expect((await getUserContext())!.isInstanceAdmin).toBe(false);
      setSharedCloud(false);
      expect((await getUserContext())!.isInstanceAdmin).toBe(true);
    } finally {
      setSharedCloud(true);
      await db.update(workspaceMembers).set({ roleKey: "owner" }).where(eq(workspaceMembers.userId, body.ownerUserId as string));
      await db.delete(roles).where(eq(roles.key, roleKey));
    }
  });
});

describe("per-workspace limits (integration, dev DB)", () => {
  it("enforces the workspace's monthly budget, counting spend by workspace and by project", async () => {
    const id = newTenantId("budget");
    const { body } = await put(id, { ownerEmail: email("owner"), workspaceName: "Budget Co", limits: { monthlyBudgetUsd: 1 } });
    const workspaceId = body.workspaceId as string;
    const [project] = await db.insert(projects).values({ workspaceId, name: "Site", domain: `budget-${suffix}.test` }).returning();
    await db.insert(usageEvents).values([
      { provider: "dataforseo", feature: "test", workspaceId, costUsd: 0.6 },
      { provider: "anthropic", feature: "test", projectId: project!.id, costUsd: 0.5 },
    ]);

    await expect(assertBudget(0, { workspaceId })).rejects.toBeInstanceOf(BudgetExceededError);
    await expect(assertBudget(0, { projectId: project!.id })).rejects.toBeInstanceOf(BudgetExceededError);
    // Other workspaces and instance-level calls are unaffected.
    await expect(assertBudget(0.5, {})).resolves.toBeUndefined();

    await put(id, { ownerEmail: email("owner"), workspaceName: "Budget Co", limits: { monthlyBudgetUsd: 5 } });
    await expect(assertBudget(0.5, { workspaceId })).resolves.toBeUndefined();
    await expect(assertBudget(4, { projectId: project!.id })).rejects.toBeInstanceOf(BudgetExceededError);

    // Usage recorded with only a project id is attributed to its workspace (deleting the project keeps the spend).
    await recordUsage({ provider: "openai", feature: "test", projectId: project!.id, costUsd: 0.01 });
    const [row] = await db.select().from(usageEvents).where(and(eq(usageEvents.projectId, project!.id), eq(usageEvents.provider, "openai")));
    expect(row!.workspaceId).toBe(workspaceId);

    // A budget of 0 includes no paid usage; self-hosted instances have no per-workspace budget at all.
    await put(id, { ownerEmail: email("owner"), workspaceName: "Budget Co", limits: { monthlyBudgetUsd: 0 } });
    await expect(assertBudget(0, { workspaceId })).rejects.toBeInstanceOf(BudgetExceededError);
    setSharedCloud(false);
    await expect(assertBudget(0, { workspaceId })).resolves.toBeUndefined();
  });

  it("uses the workspace's project limit instead of Admin → Limits", async () => {
    const id = newTenantId("projects");
    const { body } = await put(id, { ownerEmail: email("owner"), workspaceName: "Limit Co", limits: { maxProjects: 3 } });
    expect(await projectLimitFor(body.workspaceId as string)).toBe(3);
    setSharedCloud(false);
    expect(await projectLimitFor(body.workspaceId as string)).not.toBe(3);
  });
});

describe("tenant deletion (integration, dev DB)", () => {
  it("purges the workspace, its rows and files, and erases users without other workspaces", async () => {
    const id = newTenantId("delete");
    const { body } = await put(id, { ownerEmail: email("gone"), workspaceName: "Gone Co" });
    const workspaceId = body.workspaceId as string;
    const ownerId = body.ownerUserId as string;
    // A colleague who also belongs to another tenant keeps their account.
    const other = newTenantId("keep");
    const kept = await put(other, { ownerEmail: email("colleague"), workspaceName: "Kept Co" });
    const colleagueId = kept.body.ownerUserId as string;
    await db.insert(workspaceMembers).values({ workspaceId, userId: colleagueId, roleKey: "member" });

    const [project] = await db.insert(projects).values({ workspaceId, name: "Site", domain: `gone-${suffix}.test` }).returning();
    const projectId = project!.id;
    await db.insert(usageEvents).values([
      { provider: "dataforseo", feature: "test", workspaceId, costUsd: 0.1 },
      { provider: "dataforseo", feature: "test", projectId, costUsd: 0.1 },
    ]);
    await db.insert(jobs).values([{ type: "test.noop", projectId, runAt: new Date(Date.now() + 3600_000) }]);
    await db.insert(auditLogs).values([{ action: "test.event", workspaceId }, { action: "test.event", projectId }]);
    await db.insert(apiRequestLogs).values({ workspaceId, path: "/api/v1/me", method: "GET", status: 200 });
    await db.insert(notifications).values({ userId: colleagueId, projectId, kind: "test", title: "About the deleted project" });
    const chatFile = path.join(env.dataDir, "chat", projectId, "test.txt");
    const assetFile = path.join(env.dataDir, "report-assets", workspaceId, "test.png");
    for (const f of [chatFile, assetFile]) {
      fs.mkdirSync(path.dirname(f), { recursive: true });
      fs.writeFileSync(f, "x");
    }

    const res = await deleteRoute(call("DELETE", `/api/cloud/tenants/${id}`), tenantCtx(id));
    expect(res.status).toBe(200);
    expect((await deleteRoute(call("DELETE", `/api/cloud/tenants/${id}`), tenantCtx(id))).status).toBe(404);
    expect((await getRoute(call("GET", `/api/cloud/tenants/${id}`), tenantCtx(id))).status).toBe(404);

    expect(await db.select().from(workspaces).where(eq(workspaces.id, workspaceId))).toHaveLength(0);
    expect(await db.select().from(projects).where(eq(projects.id, projectId))).toHaveLength(0);
    expect(await db.select().from(usageEvents).where(eq(usageEvents.workspaceId, workspaceId))).toHaveLength(0);
    expect(await db.select().from(usageEvents).where(eq(usageEvents.projectId, projectId))).toHaveLength(0);
    expect(await db.select().from(jobs).where(eq(jobs.projectId, projectId))).toHaveLength(0);
    expect(await db.select().from(auditLogs).where(eq(auditLogs.workspaceId, workspaceId))).toHaveLength(0);
    expect(await db.select().from(auditLogs).where(eq(auditLogs.projectId, projectId))).toHaveLength(0);
    expect(await db.select().from(apiRequestLogs).where(eq(apiRequestLogs.workspaceId, workspaceId))).toHaveLength(0);
    expect(await db.select().from(notifications).where(eq(notifications.projectId, projectId))).toHaveLength(0);
    expect(fs.existsSync(path.dirname(chatFile))).toBe(false);
    expect(fs.existsSync(path.dirname(assetFile))).toBe(false);

    expect(await db.select().from(users).where(eq(users.id, ownerId))).toHaveLength(0);
    expect(await db.select().from(users).where(eq(users.id, colleagueId))).toHaveLength(1);
    // The operator is never erased (instance admin, and not a member here).
    expect(await db.select().from(users).where(eq(users.id, operatorId))).toHaveLength(1);
  });
});
