import "server-only";
import { and, eq, inArray, lt } from "drizzle-orm";
import { db } from "@/server/db/client";
import { instances, sessions, stripeEvents } from "@/server/db/schema";
import { settleReservation } from "@/server/stripe";
import { isReleasableReservation } from "@/server/billing-rules";
import { logEvent } from "@/server/events";
import { purgeExpiredLoginTokens } from "@/server/auth/login";
import { syncSharedMailConfig } from "@/server/shared-app";
import { purgeAnalyticsEvents, purgeAnalyticsSalts } from "@/server/analytics/store";
import { sendGrowthDigestIfDue } from "@/server/analytics/digest";
import {
  checkInstanceHealth,
  checkSharedTenant,
  markInstanceHealthy,
  markInstanceUnhealthy,
  markStartTimedOut,
  provisionInstance,
  START_TIMEOUT_MS,
} from "@/server/provisioning";

const TICK_MS = 30_000;
const RUNNING_CHECK_MS = 10 * 60 * 1000;
const HOUSEKEEPING_MS = 60 * 60 * 1000;
/** Visitor-hash salts are purged on their own timer too, so a long busy tick can't delay it. */
const SALT_PURGE_MS = 10 * 60 * 1000;
/** Unpaid reservations release their address this long after they were made (new checkouts don't extend it). */
const PENDING_TTL_MS = 48 * 60 * 60 * 1000;
const STRIPE_EVENT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

declare global {
  var __cloudReconciler:
    | { timer: NodeJS.Timeout; saltTimer: NodeJS.Timeout; busy: boolean; lastRunningCheck: number; lastHousekeeping: number }
    | undefined;
}

/** Advances provisioning instances (resume, health → running, timeout → failed). */
async function reconcileProvisioning() {
  const rows = await db.select().from(instances).where(eq(instances.status, "provisioning"));
  const now = Date.now();
  for (const row of rows) {
    // Shared workspaces are provisioned in one idempotent call: just (re)try when due.
    if (row.backend === "shared" || !row.startRequestedAt) {
      // Not started yet: (re)run provisioning unless we are in a backoff window.
      if (!row.nextProvisionAt || row.nextProvisionAt.getTime() <= now) await provisionInstance(row.id, "reconciler");
      continue;
    }
    if (await checkInstanceHealth(row.host)) {
      await markInstanceHealthy(row);
    } else if (now - row.startRequestedAt.getTime() > START_TIMEOUT_MS) {
      await markStartTimedOut(row);
    }
  }
}

async function checkRunningInstances() {
  // Shared workspaces: running ones for health, stopped ones to catch a tenant that is active by mistake.
  const rows = await db.select().from(instances).where(inArray(instances.status, ["running", "stopped"]));
  for (const row of rows) {
    if (row.backend === "shared") await checkSharedTenant(row);
    else if (row.status !== "running") continue;
    else if (await checkInstanceHealth(row.host)) await markInstanceHealthy(row);
    else await markInstanceUnhealthy(row);
  }
}

async function releaseStaleReservations() {
  const now = Date.now();
  const stale = await db
    .select()
    .from(instances)
    .where(
      and(
        eq(instances.status, "pending_payment"),
        eq(instances.complimentary, false),
        lt(instances.createdAt, new Date(now - PENDING_TTL_MS)),
      ),
    );
  for (const row of stale) {
    if (!isReleasableReservation(row, now, PENDING_TTL_MS)) continue;
    try {
      // A live subscription or late payment is processed instead of dropped; an open checkout is expired first.
      // A paid checkout whose subscription died (incomplete_expired / canceled) no longer holds the address.
      if ((await settleReservation(row)) === "keep") continue;
    } catch (err) {
      console.warn(`[reconciler] keeping reservation ${row.slug}: checkout could not be verified`, err);
      continue;
    }
    const [deleted] = await db
      .delete(instances)
      .where(and(eq(instances.id, row.id), eq(instances.status, "pending_payment")))
      .returning({ id: instances.id });
    if (deleted) await logEvent("instance.reservation_expired", { instanceId: row.id, userId: row.userId, data: { slug: row.slug } });
  }
}

async function housekeeping() {
  await releaseStaleReservations();
  await purgeExpiredLoginTokens();
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  await db.delete(stripeEvents).where(lt(stripeEvents.createdAt, new Date(Date.now() - STRIPE_EVENT_RETENTION_MS)));
  await purgeAnalyticsEvents();
  await sendGrowthDigestIfDue();
}

async function tick() {
  const state = globalThis.__cloudReconciler;
  if (!state || state.busy) return;
  state.busy = true;
  try {
    // Every tick (not hourly), so a day's visitor-hash salt is gone within a minute of the second midnight.
    await purgeAnalyticsSalts();
    // Platform mail server for the shared app: pushed on the first tick after boot, then when it changes or hourly.
    await syncSharedMailConfig();
    await reconcileProvisioning();
    const now = Date.now();
    if (now - state.lastRunningCheck >= RUNNING_CHECK_MS) {
      state.lastRunningCheck = now;
      await checkRunningInstances();
    }
    if (now - state.lastHousekeeping >= HOUSEKEEPING_MS) {
      state.lastHousekeeping = now;
      await housekeeping();
    }
  } catch (err) {
    console.error("[reconciler] tick failed", err);
  } finally {
    state.busy = false;
  }
}

/** Starts the single background loop (guarded on globalThis so hot reloads don't start a second one). */
export function startReconciler(): void {
  if (globalThis.__cloudReconciler) return;
  const timer = setInterval(() => void tick(), TICK_MS);
  timer.unref?.();
  const saltTimer = setInterval(() => void purgeAnalyticsSalts().catch((err) => console.error("[reconciler] salt purge failed", err)), SALT_PURGE_MS);
  saltTimer.unref?.();
  globalThis.__cloudReconciler = { timer, saltTimer, busy: false, lastRunningCheck: 0, lastHousekeeping: 0 };
  setTimeout(() => void tick(), 5_000).unref?.();
  console.info(`[reconciler] started (every ${TICK_MS / 1000}s)`);
}
