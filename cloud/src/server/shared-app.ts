import "server-only";
import crypto from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/server/db/client";
import { instances, users, type Instance } from "@/server/db/schema";
import { env, isSharedBackendConfigured } from "@/server/env";
import { getSetting } from "@/server/settings";
import { logEvent } from "@/server/events";
import { instanceMailServer } from "@/server/smtp-url";
import { createTenantApi, type TenantApi, type TenantStatus } from "@/server/tenant-api";
import {
  buildTenantPayload,
  mailConfigPayload,
  normalizePlan,
  tenantStatusFor,
  usageSummary,
  type PlanLimits,
  type UsageSummary,
} from "@/server/tenant-rules";

/** Tenant API of the shared app, or null when this deployment only uses dedicated (Coolify) instances. */
export function sharedTenantApi(opts: { timeoutMs?: number; retries?: number } = {}): TenantApi | null {
  if (!isSharedBackendConfigured()) return null;
  return createTenantApi({ baseUrl: env.sharedApp.internalUrl, secret: env.sharedApp.apiSecret, ...opts });
}

/** Usage vs. included budget for the dashboard; null when the shared app can't answer quickly. */
export async function tenantUsage(instance: Instance): Promise<UsageSummary | null> {
  const api = sharedTenantApi({ timeoutMs: 4_000, retries: 0 });
  if (!api || instance.backend !== "shared") return null;
  try {
    const info = await api.getTenant(instance.id);
    return info ? usageSummary(info, await getPlanLimits()) : null;
  } catch {
    return null;
  }
}

export function requireSharedTenantApi(): TenantApi {
  const api = sharedTenantApi();
  if (!api) throw new Error("The shared app is not configured (CLOUD_APP_INTERNAL_URL / CLOUD_API_SECRET).");
  return api;
}

export async function getPlanLimits(): Promise<PlanLimits> {
  // Invalid stored values fall back to the defaults — a 0 budget would block paid usage in every workspace.
  return normalizePlan(await getSetting("plan"));
}

/** Upserts the instance's tenant with the given status (plan limits included). */
export async function syncTenant(instance: Instance, status: TenantStatus, suspendedReason?: string): Promise<void> {
  if (!instance.userId) throw new Error("The workspace has no owner account.");
  const [owner] = await db.select().from(users).where(eq(users.id, instance.userId)).limit(1);
  if (!owner) throw new Error("The owner account no longer exists.");
  const body = buildTenantPayload({
    workspaceName: instance.workspaceName,
    owner: { email: owner.email, name: owner.name },
    status,
    limits: await getPlanLimits(),
    suspendedReason,
  });
  await requireSharedTenantApi().putTenant(instance.id, body);
}

/** Admin → Plan saved: push the new limits to every existing shared tenant (keeping its status). */
export async function pushPlanLimitsToTenants(actor: string): Promise<{ updated: number; failed: number }> {
  const rows = await db
    .select()
    .from(instances)
    .where(and(eq(instances.backend, "shared"), inArray(instances.status, ["running", "stopped", "provisioning"])));
  let updated = 0;
  const failures: string[] = [];
  for (const row of rows) {
    try {
      await syncTenant(row, tenantStatusFor(row.status));
      updated++;
    } catch (err) {
      failures.push(`${row.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  await logEvent("plan.limits_pushed", { data: { actor, updated, failed: failures.length, errors: failures.slice(0, 10) } });
  return { updated, failed: failures.length };
}

declare global {
  var __cloudMailSync: { fingerprint: string; at: number; lastErrorAt: number } | undefined;
}
const MAIL_SYNC_MS = 60 * 60 * 1000;

/**
 * Pushes the platform mail server customers' workspaces use (`PUT /api/cloud/config`): the customer-instances
 * server, or the main one when sharing is on, or null. Sent when it changed, at most hourly otherwise, or forced
 * (after the admin saved SMTP settings). Never throws.
 */
export async function syncSharedMailConfig(opts: { force?: boolean } = {}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const api = sharedTenantApi();
  if (!api) return { ok: true, skipped: true };
  const mail = instanceMailServer(await getSetting("smtp"), await getSetting("instanceSmtp"));
  const body = mailConfigPayload(mail);
  const fingerprint = crypto.createHash("sha256").update(JSON.stringify(body)).digest("hex");
  const state = (globalThis.__cloudMailSync ??= { fingerprint: "", at: 0, lastErrorAt: 0 });
  if (!opts.force && state.fingerprint === fingerprint && Date.now() - state.at < MAIL_SYNC_MS) return { ok: true, skipped: true };
  try {
    await api.putConfig(body);
    const changed = state.fingerprint !== fingerprint;
    state.fingerprint = fingerprint;
    state.at = Date.now();
    if (changed || opts.force) await logEvent("shared_app.mail_config_pushed", { data: { source: mail.source, mail: body.mail ? "set" : "none" } });
    return { ok: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    if (Date.now() - state.lastErrorAt > MAIL_SYNC_MS) {
      state.lastErrorAt = Date.now();
      console.error("[shared-app] mail config push failed:", error);
      await logEvent("shared_app.mail_config_failed", { data: { error } });
    }
    return { ok: false, error };
  }
}

export async function sharedAppHealth(): Promise<{ configured: boolean; ok: boolean; commit?: string; error?: string }> {
  // Rendered on the admin page: answer fast instead of retrying.
  const api = sharedTenantApi({ timeoutMs: 5_000, retries: 0 });
  if (!api) return { configured: false, ok: false };
  try {
    const res = await api.health();
    return { configured: true, ok: !!res?.ok, commit: res?.commit };
  } catch (err) {
    return { configured: true, ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
