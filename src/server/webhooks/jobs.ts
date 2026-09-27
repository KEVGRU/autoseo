import "server-only";
// Jobs for the outbound webhook bus (registered via src/server/jobs/handlers/webhooks.ts).
import { and, inArray, lt, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { webhookDeliveries } from "@/server/db/schema";
import { activeProjectSql } from "@/server/cloud/tenancy";
import { defineJob, defineSchedule } from "@/server/jobs/define";
import { DELIVER_JOB, runDelivery } from "./deliver";
import { afterTrackingRunFinished } from "./emitters";

/** Delivery log retention. */
const DELIVERY_RETENTION_DAYS = 30;

defineJob<{ deliveryId: string }>({
  type: DELIVER_JOB,
  concurrency: 4,
  timeoutMs: 60_000,
  async run(payload, ctx) {
    return runDelivery(payload.deliveryId, { attempts: ctx.job.attempts, maxAttempts: ctx.job.maxAttempts });
  },
});

/** Daily: drop delivery log rows older than the retention window; close deliveries whose job was lost. */
defineSchedule({
  name: "webhooks.prune",
  cron: "41 3 * * *",
  async tick() {
    const cutoff = new Date(Date.now() - DELIVERY_RETENTION_DAYS * 86_400_000);
    await db.delete(webhookDeliveries).where(lt(webhookDeliveries.createdAt, cutoff));
    // Retries end after ≈ 1.5 h; anything still open a day later lost its job (e.g. a crashed worker).
    await db
      .update(webhookDeliveries)
      .set({ status: "failed", error: "The delivery job was lost — replay it from the delivery log." })
      .where(and(inArray(webhookDeliveries.status, ["pending", "retrying"]), lt(webhookDeliveries.createdAt, new Date(Date.now() - 86_400_000))));
  },
});

/**
 * Every 5 minutes: `tracking.run_completed` for runs that finished recently (idempotent per run, so it
 * coexists with a direct call from the tracking-run lifecycle) and an alert evaluation right after a run.
 */
defineSchedule({
  name: "webhooks.tracking_runs",
  cron: "*/5 * * * *",
  async tick() {
    const rows = (await db.execute(sql`
      select r.id, r.finished_at >= now() - interval '6 minutes' as fresh
      from ai_runs r
      where r.status in ('completed', 'partial', 'failed') and r.finished_at >= now() - interval '30 minutes'
        and ${activeProjectSql(sql`r.project_id`)}
        and (
          exists (select 1 from webhook_endpoints e where e.project_id = r.project_id and e.active and e.events && array['tracking.run_completed', '*']::text[])
          or (r.finished_at >= now() - interval '6 minutes' and exists (select 1 from alert_rules a where a.project_id = r.project_id and a.active))
        )`)) as unknown as { id: string; fresh: boolean }[];
    for (const r of rows) await afterTrackingRunFinished(r.id, { evaluateAlerts: r.fresh });
  },
});
