import "server-only";
import { recordUsage, assertBudget } from "@/server/usage";
import { getDfsCredentials, type DfsCredentials } from "./credentials";

export class DataForSeoError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public path?: string,
  ) {
    super(message);
  }
}

export class DataForSeoNotConfiguredError extends DataForSeoError {
  constructor() {
    super("DataForSEO is not configured. An admin can add credentials in Admin → Data Providers.");
  }
}

export type DfsContext = {
  projectId?: string | null;
  workspaceId?: string | null;
  userId?: string | null;
  /** Feature label for usage tracking, e.g. "keyword_research". */
  feature: string;
};

type DfsTask<T> = {
  id: string;
  status_code: number;
  status_message: string;
  cost: number;
  path: string[];
  data?: Record<string, unknown>;
  result: T[] | null;
};

type DfsResponse<T> = {
  status_code: number;
  status_message: string;
  cost: number;
  tasks_count: number;
  tasks_error: number;
  tasks: DfsTask<T>[];
};

/** DataForSEO usable for this workspace (its own account or the instance account); no ctx = instance account only. */
export async function isDataForSeoConfigured(ctx: { workspaceId?: string | null; projectId?: string | null } = {}): Promise<boolean> {
  return (await getDfsCredentials(ctx)) != null;
}

function authHeader(c: DfsCredentials) {
  return `Basic ${Buffer.from(`${c.login}:${c.password}`).toString("base64")}`;
}

function baseUrlFor(c: DfsCredentials) {
  return c.sandbox ? "https://sandbox.dataforseo.com" : "https://api.dataforseo.com";
}

/** The workspace's own account is billed by DataForSEO directly: no instance/workspace budget, usage cost recorded as 0. */
function usageCost(c: DfsCredentials, cost: number) {
  return c.scope === "workspace"
    ? { costUsd: 0, meta: { credentialScope: c.scope, ownAccountCostUsd: cost } }
    : { costUsd: cost, meta: { credentialScope: c.scope } };
}

function settingsHint(c: DfsCredentials) {
  return c.scope === "workspace" ? "Settings → Workspace → Data providers" : "Admin → Data Providers";
}

/** The workspace's own credentials (workspace from ctx.workspaceId or the project), else the instance account. */
async function credentialsFor(ctx: Pick<DfsContext, "projectId" | "workspaceId">): Promise<DfsCredentials> {
  const creds = await getDfsCredentials({ workspaceId: ctx.workspaceId, projectId: ctx.projectId });
  if (!creds) throw new DataForSeoNotConfiguredError();
  return creds;
}

function assertHttpOk(res: Response, creds: DfsCredentials, path: string) {
  if (res.status === 401) throw new DataForSeoError(`DataForSEO rejected the credentials (401). Check ${settingsHint(creds)}.`, 401, path);
  if (res.status === 402) throw new DataForSeoError("DataForSEO account has insufficient funds (402).", 402, path);
  if (!res.ok) throw new DataForSeoError(`DataForSEO HTTP ${res.status}`, res.status, path);
}

/**
 * Low-level DataForSEO call. `path` like "/v3/dataforseo_labs/google/keyword_ideas/live".
 * Returns the first task (DataForSEO wraps every request in tasks[]). Records cost usage.
 */
export async function dfsPost<T = Record<string, unknown>>(
  path: string,
  body: unknown[],
  ctx: DfsContext,
  opts: { timeoutMs?: number; estimatedCostUsd?: number } = {},
): Promise<DfsTask<T>> {
  const creds = await credentialsFor(ctx);
  if (creds.scope === "instance") await assertBudget(opts.estimatedCostUsd ?? 0, ctx);
  const url = `${baseUrlFor(creds)}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 120_000);
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader(creds),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (err) {
    throw new DataForSeoError(`DataForSEO request failed: ${err instanceof Error ? err.message : String(err)}`, undefined, path);
  } finally {
    clearTimeout(timer);
  }
  assertHttpOk(res, creds, path);
  const json = (await res.json()) as DfsResponse<T>;
  const task = json.tasks?.[0];
  const cost = Number(json.cost ?? task?.cost ?? 0);
  await recordUsage({
    provider: "dataforseo",
    feature: ctx.feature,
    endpoint: path,
    projectId: ctx.projectId,
    workspaceId: ctx.workspaceId,
    userId: ctx.userId,
    ...usageCost(creds, cost),
  });
  if (!task) throw new DataForSeoError(json.status_message || "Empty DataForSEO response", json.status_code, path);
  if (task.status_code >= 40000) {
    throw new DataForSeoError(`DataForSEO: ${task.status_message} (${task.status_code})`, task.status_code, path);
  }
  return task;
}

export async function dfsGet<T = Record<string, unknown>>(path: string, ctx: DfsContext): Promise<DfsTask<T>> {
  const creds = await credentialsFor(ctx);
  const res = await fetch(`${baseUrlFor(creds)}${path}`, {
    headers: { Authorization: authHeader(creds) },
    cache: "no-store",
  });
  assertHttpOk(res, creds, path);
  const json = (await res.json()) as DfsResponse<T>;
  const task = json.tasks?.[0];
  if (!task) throw new DataForSeoError(json.status_message || "Empty DataForSEO response", json.status_code, path);
  const cost = Number(json.cost ?? 0);
  if (cost > 0) {
    await recordUsage({
      provider: "dataforseo",
      feature: ctx.feature,
      endpoint: path,
      projectId: ctx.projectId,
      workspaceId: ctx.workspaceId,
      userId: ctx.userId,
      ...usageCost(creds, cost),
    });
  }
  return task;
}

/**
 * Account info incl. balance. No ctx = the instance account (Admin → Data Providers "Test connection"); with a
 * workspace, that workspace's own account when it has one.
 */
export async function dfsUserData(ctx: { workspaceId?: string | null } = {}): Promise<{ login: string; balance: number } | null> {
  const creds = await getDfsCredentials(ctx);
  if (!creds) return null;
  const res = await fetch(`${baseUrlFor(creds)}/v3/appendix/user_data`, {
    headers: { Authorization: authHeader(creds) },
    cache: "no-store",
  });
  if (!res.ok) throw new DataForSeoError(`DataForSEO HTTP ${res.status}`, res.status);
  const json = (await res.json()) as DfsResponse<{ login: string; money: { balance: number } }>;
  const r = json.tasks?.[0]?.result?.[0];
  return r ? { login: r.login, balance: r.money?.balance ?? 0 } : null;
}

/**
 * Like `dfsPost`, but returns every task of the response (e.g. `task_post` batches of up to 100 tasks).
 * Records the total cost once. Never retried by callers: a task_post is billed at post time.
 * Task-level statuses are NOT thrown — callers inspect each task's `status_code` (20100 = created).
 */
export async function dfsPostTasks<T = Record<string, unknown>>(
  path: string,
  body: unknown[],
  ctx: DfsContext,
  opts: { timeoutMs?: number; estimatedCostUsd?: number } = {},
): Promise<{ statusCode: number; statusMessage: string; cost: number; tasks: DfsTask<T>[] }> {
  const creds = await credentialsFor(ctx);
  if (creds.scope === "instance") await assertBudget(opts.estimatedCostUsd ?? 0, ctx);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 120_000);
  let res: Response;
  try {
    res = await fetch(`${baseUrlFor(creds)}${path}`, {
      method: "POST",
      headers: {
        Authorization: authHeader(creds),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (err) {
    throw new DataForSeoError(`DataForSEO request failed: ${err instanceof Error ? err.message : String(err)}`, undefined, path);
  } finally {
    clearTimeout(timer);
  }
  assertHttpOk(res, creds, path);
  const json = (await res.json()) as DfsResponse<T>;
  const cost = Number(json.cost ?? (json.tasks ?? []).reduce((sum, t) => sum + Number(t.cost ?? 0), 0));
  await recordUsage({
    provider: "dataforseo",
    feature: ctx.feature,
    endpoint: path,
    units: json.tasks?.length ?? 0,
    projectId: ctx.projectId,
    workspaceId: ctx.workspaceId,
    userId: ctx.userId,
    ...usageCost(creds, cost),
  });
  return { statusCode: json.status_code, statusMessage: json.status_message, cost, tasks: json.tasks ?? [] };
}

export type { DfsTask };
