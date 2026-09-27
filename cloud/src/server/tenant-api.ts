/**
 * Client for the shared app's tenant API (docs/CLOUD.md → "Tenant API"): one workspace per Cloud customer.
 * No server-only import and an injectable `fetch`, so it can be unit tested.
 */

export class TenantApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "TenantApiError";
  }
}

export type TenantStatus = "active" | "suspended";
export type TenantLimits = { monthlyBudgetUsd?: number; maxProjects?: number };

export type TenantPutBody = {
  ownerEmail: string;
  ownerName?: string;
  workspaceName: string;
  status?: TenantStatus;
  suspendedReason?: string;
  limits?: TenantLimits;
};

export type TenantPutResult = { tenantId: string; workspaceId: string; ownerUserId: string; status: TenantStatus };

export type TenantInfo = {
  tenantId: string;
  workspaceId: string;
  status: TenantStatus;
  name: string;
  members: number;
  projects: number;
  spendThisMonthUsd: number;
  limits: TenantLimits;
};

export type MailConfig = { smtpUrl: string; from: string } | null;

export type TenantApiOptions = {
  baseUrl: string;
  secret: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
  /** Extra attempts after network errors, 429 and 5xx (every call is idempotent). */
  retries?: number;
  retryDelayMs?: number;
};

const TENANT_ID = /^[A-Za-z0-9_-]{1,64}$/;

function tenantPath(tenantId: string): string {
  if (!TENANT_ID.test(tenantId)) throw new TenantApiError(`Invalid tenant id "${tenantId}"`, 0);
  return `/api/cloud/tenants/${tenantId}`;
}

function count(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toTenantInfo(raw: Record<string, unknown>): TenantInfo {
  const limits = (raw.limits ?? {}) as TenantLimits;
  return {
    tenantId: String(raw.tenantId ?? ""),
    workspaceId: String(raw.workspaceId ?? ""),
    status: raw.status === "suspended" ? "suspended" : "active",
    name: String(raw.name ?? ""),
    members: count(raw.members),
    projects: count(raw.projects),
    spendThisMonthUsd: Number(raw.spendThisMonthUsd) || 0,
    limits: {
      ...(limits.monthlyBudgetUsd != null ? { monthlyBudgetUsd: Number(limits.monthlyBudgetUsd) } : {}),
      ...(limits.maxProjects != null ? { maxProjects: Number(limits.maxProjects) } : {}),
    },
  };
}

function describe(status: number, body: unknown): string {
  const message = (body as { error?: unknown; message?: unknown } | null)?.error ?? (body as { message?: unknown } | null)?.message;
  if (status === 401 || status === 403) return `Shared app rejected the API secret (${status}). Check CLOUD_API_SECRET / AUTOSEO_CLOUD_API_SECRET.`;
  if (status === 404) return "Shared app tenant API not found (404) — is AUTOSEO_CLOUD_API_SECRET set on the app?";
  return [`Shared app API error ${status}`, typeof message === "string" ? message : ""].filter(Boolean).join(": ");
}

export function createTenantApi(opts: TenantApiOptions) {
  const baseUrl = opts.baseUrl.replace(/\/+$/, "");
  const doFetch = opts.fetch ?? fetch;
  const timeoutMs = opts.timeoutMs ?? 15_000;
  const retries = opts.retries ?? 2;
  const retryDelayMs = opts.retryDelayMs ?? 500;

  async function request<T>(method: "GET" | "PUT" | "DELETE", path: string, body?: unknown, allow404 = false): Promise<T | null> {
    let lastError: TenantApiError | null = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, retryDelayMs * 2 ** (attempt - 1)));
      let res: Response;
      try {
        res = await doFetch(`${baseUrl}${path}`, {
          method,
          headers: {
            Authorization: `Bearer ${opts.secret}`,
            Accept: "application/json",
            ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
          },
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal: AbortSignal.timeout(timeoutMs),
          cache: "no-store",
        });
      } catch (err) {
        const reason = err instanceof Error ? (err.cause instanceof Error ? err.cause.message : err.message) : String(err);
        lastError = new TenantApiError(`Could not reach the shared app at ${baseUrl}: ${reason}`, 0);
        continue;
      }
      const text = await res.text();
      let parsed: unknown = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = text;
      }
      if (res.ok) return parsed as T;
      if (res.status === 404 && allow404) return null;
      lastError = new TenantApiError(describe(res.status, parsed), res.status, parsed);
      if (res.status !== 429 && res.status < 500) break;
    }
    throw lastError ?? new TenantApiError("Shared app request failed", 0);
  }

  return {
    async health(): Promise<{ ok: boolean; commit?: string }> {
      return (await request<{ ok: boolean; commit?: string }>("GET", "/api/cloud/health"))!;
    },
    /** Idempotent upsert: creates owner + workspace on first call, then updates name / status / limits. */
    async putTenant(tenantId: string, body: TenantPutBody): Promise<TenantPutResult> {
      return (await request<TenantPutResult>("PUT", tenantPath(tenantId), body))!;
    },
    /** Null when the tenant doesn't exist. */
    async getTenant(tenantId: string): Promise<TenantInfo | null> {
      const raw = await request<Record<string, unknown>>("GET", tenantPath(tenantId), undefined, true);
      return raw ? toTenantInfo(raw) : null;
    },
    /** Deletes the workspace with all its data. A missing tenant counts as deleted. */
    async deleteTenant(tenantId: string): Promise<void> {
      await request("DELETE", tenantPath(tenantId), undefined, true);
    },
    async putConfig(body: { mail: MailConfig }): Promise<void> {
      await request("PUT", "/api/cloud/config", body);
    },
  };
}

export type TenantApi = ReturnType<typeof createTenantApi>;
