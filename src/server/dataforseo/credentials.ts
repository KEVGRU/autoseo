import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { workspaceProviderCredentials, type WorkspaceProviderConfig } from "@/server/db/schema";
import { decryptJson, encryptJson } from "@/server/crypto";
import { getSetting } from "@/server/settings";
import { getProjectWorkspaceId } from "@/server/cloud/tenancy";

/**
 * DataForSEO credential lookup. On a shared AutoSEO Cloud instance every customer is a workspace owner, so "the
 * customer's own DataForSEO key" is stored per workspace (`workspace_provider_credentials`); the instance setting
 * (Admin → Data Providers) is the fallback for workspaces without own credentials.
 */

export type DfsScope = "workspace" | "instance";
export type DfsCredentials = { login: string; password: string; sandbox: boolean; scope: DfsScope };
export type WorkspaceEnrichmentMode = NonNullable<WorkspaceProviderConfig["mode"]>;

type WorkspaceRow = typeof workspaceProviderCredentials.$inferSelect;

const TTL_MS = 5_000;
const rowCache = new Map<string, { at: number; row: WorkspaceRow | null }>();

async function workspaceRow(workspaceId: string): Promise<WorkspaceRow | null> {
  const hit = rowCache.get(workspaceId);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.row;
  const [row] = await db
    .select()
    .from(workspaceProviderCredentials)
    .where(and(eq(workspaceProviderCredentials.workspaceId, workspaceId), eq(workspaceProviderCredentials.provider, "dataforseo")))
    .limit(1);
  rowCache.set(workspaceId, { at: Date.now(), row: row ?? null });
  return row ?? null;
}

function decryptPassword(row: WorkspaceRow): string | null {
  if (!row.secret) return null;
  try {
    return decryptJson<{ password?: string }>(row.secret).password || null;
  } catch (err) {
    console.error(`[dataforseo] could not decrypt workspace credentials (${row.workspaceId})`, err);
    return null;
  }
}

/**
 * The workspace's own credentials when set, otherwise the instance credentials, otherwise null. The workspace comes
 * from `workspaceId` or, for callers that only know the project, from `projectId`.
 */
export async function getDfsCredentials(ctx: { workspaceId?: string | null; projectId?: string | null }): Promise<DfsCredentials | null> {
  const workspaceId = ctx.workspaceId ?? (ctx.projectId ? await getProjectWorkspaceId(ctx.projectId) : null);
  if (workspaceId) {
    const row = await workspaceRow(workspaceId);
    const password = row ? decryptPassword(row) : null;
    if (row?.config.login && password) return { login: row.config.login, password, sandbox: Boolean(row.config.sandbox), scope: "workspace" };
  }
  const s = await getSetting("dataforseo");
  return s.login && s.password ? { login: s.login, password: s.password, sandbox: s.sandbox, scope: "instance" } : null;
}

/** Enrichment mode chosen by the workspace (Settings → Workspace → Data providers); null = instance default. */
export async function getWorkspaceEnrichmentMode(workspaceId: string | null | undefined): Promise<WorkspaceEnrichmentMode | null> {
  if (!workspaceId) return null;
  return (await workspaceRow(workspaceId))?.config.mode ?? null;
}

/** Client-safe view of a workspace's DataForSEO settings (never includes the password). */
export type WorkspaceDfsView = {
  login: string;
  sandbox: boolean;
  mode: WorkspaceEnrichmentMode | null;
  hasPassword: boolean;
  status: WorkspaceRow["status"];
  lastTestedAt: Date | null;
  lastError: string | null;
  updatedAt: Date | null;
};

export async function getWorkspaceDfsView(workspaceId: string): Promise<WorkspaceDfsView> {
  rowCache.delete(workspaceId);
  const row = await workspaceRow(workspaceId);
  return {
    login: row?.config.login ?? "",
    sandbox: Boolean(row?.config.sandbox),
    mode: row?.config.mode ?? null,
    hasPassword: Boolean(row?.secret),
    status: row?.status ?? "untested",
    lastTestedAt: row?.lastTestedAt ?? null,
    lastError: row?.lastError ?? null,
    updatedAt: row?.updatedAt ?? null,
  };
}

/**
 * Upserts a workspace's DataForSEO settings. `password: undefined` keeps the stored one; `""` clears it. Changing the
 * login without a new password clears the stored password (credentials always belong together).
 */
export async function saveWorkspaceDfs(
  workspaceId: string,
  input: { login: string; password?: string; sandbox: boolean; mode: WorkspaceEnrichmentMode },
  actorId: string | null,
) {
  const current = await workspaceRow(workspaceId);
  const login = input.login.trim();
  const loginChanged = (current?.config.login ?? "") !== login;
  let secret: string | null = current?.secret ?? null;
  if (input.password !== undefined) secret = input.password ? encryptJson({ password: input.password }) : null;
  else if (loginChanged) secret = null;
  if (!login) secret = null;
  const credentialsChanged = loginChanged || input.password !== undefined || Boolean(current?.config.sandbox) !== input.sandbox;
  const config: WorkspaceProviderConfig = { login, sandbox: input.sandbox, mode: input.mode };
  const reset = credentialsChanged ? { status: "untested" as const, lastTestedAt: null, lastError: null } : {};
  await db
    .insert(workspaceProviderCredentials)
    .values({ workspaceId, provider: "dataforseo", config, secret, updatedBy: actorId, ...reset })
    .onConflictDoUpdate({
      target: [workspaceProviderCredentials.workspaceId, workspaceProviderCredentials.provider],
      set: { config, secret, updatedBy: actorId, updatedAt: new Date(), ...reset },
    });
  rowCache.delete(workspaceId);
}

/** Removes the workspace's own DataForSEO credentials (keeps the chosen mode). */
export async function removeWorkspaceDfsCredentials(workspaceId: string, actorId: string | null) {
  await db
    .update(workspaceProviderCredentials)
    .set({
      secret: null,
      config: { mode: (await workspaceRow(workspaceId))?.config.mode },
      status: "untested",
      lastTestedAt: null,
      lastError: null,
      updatedBy: actorId,
      updatedAt: new Date(),
    })
    .where(and(eq(workspaceProviderCredentials.workspaceId, workspaceId), eq(workspaceProviderCredentials.provider, "dataforseo")));
  rowCache.delete(workspaceId);
}

export type DfsTestResult = { ok: boolean; message: string; balance?: number | null; latencyMs?: number };

/**
 * Checks credentials against the free `/v3/appendix/user_data` endpoint (fixed DataForSEO host — no user-controlled
 * URL). Used by Settings → Workspace before the DataForSEO client accepts per-workspace credentials.
 */
export async function testDfsCredentials(creds: { login: string; password: string; sandbox: boolean }): Promise<DfsTestResult> {
  const started = Date.now();
  const host = creds.sandbox ? "https://sandbox.dataforseo.com" : "https://api.dataforseo.com";
  let res: Response;
  try {
    res = await fetch(`${host}/v3/appendix/user_data`, {
      headers: { Authorization: `Basic ${Buffer.from(`${creds.login}:${creds.password}`).toString("base64")}` },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err) {
    return { ok: false, message: `DataForSEO is not reachable: ${err instanceof Error ? err.message : String(err)}` };
  }
  const latencyMs = Date.now() - started;
  if (res.status === 401) return { ok: false, message: "DataForSEO rejected the login or API password (401).", latencyMs };
  if (res.status === 402) return { ok: false, message: "The DataForSEO account has insufficient funds (402).", latencyMs };
  if (!res.ok) return { ok: false, message: `DataForSEO answered HTTP ${res.status}.`, latencyMs };
  const json = (await res.json().catch(() => null)) as {
    status_code?: number;
    status_message?: string;
    tasks?: { status_code?: number; status_message?: string; result?: { login?: string; money?: { balance?: number } }[] }[];
  } | null;
  const task = json?.tasks?.[0];
  if (!task || (task.status_code ?? 0) >= 40000)
    return { ok: false, message: task?.status_message || json?.status_message || "Unexpected DataForSEO response.", latencyMs };
  const balance = task.result?.[0]?.money?.balance ?? null;
  return { ok: true, message: `Connected as ${task.result?.[0]?.login ?? creds.login}`, balance, latencyMs };
}

/** Tests the stored workspace credentials (or `override` values not saved yet) and records the outcome. */
export async function testWorkspaceDfs(workspaceId: string, override?: { login?: string; password?: string; sandbox?: boolean }): Promise<DfsTestResult> {
  rowCache.delete(workspaceId);
  const row = await workspaceRow(workspaceId);
  const login = override?.login?.trim() || row?.config.login || "";
  const password = override?.password || (row && (!override?.login || override.login.trim() === row.config.login) ? decryptPassword(row) : null);
  const sandbox = override?.sandbox ?? Boolean(row?.config.sandbox);
  if (!login || !password) return { ok: false, message: "Enter the DataForSEO API login and API password first." };
  const result = await testDfsCredentials({ login, password, sandbox });
  // Only the stored credentials get a recorded status.
  const testedStored = row && login === row.config.login && !override?.password && sandbox === Boolean(row.config.sandbox);
  if (testedStored) {
    await db
      .update(workspaceProviderCredentials)
      .set({ status: result.ok ? "ok" : "error", lastTestedAt: new Date(), lastError: result.ok ? null : result.message })
      .where(eq(workspaceProviderCredentials.id, row.id));
    rowCache.delete(workspaceId);
  }
  return result;
}
