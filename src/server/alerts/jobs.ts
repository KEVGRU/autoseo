import "server-only";
// Jobs for the alerts engine (registered via src/server/jobs/handlers/alerts.ts).
import { and, eq, lt } from "drizzle-orm";
import { db } from "@/server/db/client";
import { alertEvents, alertRules, projects } from "@/server/db/schema";
import { activeProjectSql } from "@/server/cloud/tenancy";
import { defineJob, defineSchedule } from "@/server/jobs/define";
import { enqueueJob } from "@/server/jobs/queue";
import { ALERT_DELIVER_JOB, runAlertDelivery } from "./deliver";
import { evaluateProject } from "./evaluate";

export const EVALUATE_JOB = "alerts.evaluate.project";

/** Alert history retention. */
const EVENT_RETENTION_DAYS = 365;

/** Queues one evaluation of the project's active rules (deduped while one is pending). */
export async function enqueueAlertEvaluation(projectId: string) {
  return enqueueJob(EVALUATE_JOB, { projectId }, { projectId, dedupeKey: `${EVALUATE_JOB}:${projectId}`, maxAttempts: 2, priority: 120 });
}

defineJob<{ projectId: string }>({
  type: EVALUATE_JOB,
  concurrency: 2,
  timeoutMs: 5 * 60_000,
  async run(payload) {
    const results = await evaluateProject(payload.projectId);
    return {
      rules: results.length,
      fired: results.filter((r) => r.fired).map((r) => ({ ruleId: r.ruleId, eventId: r.fired!.id })),
      errors: results.filter((r) => r.error).map((r) => ({ ruleId: r.ruleId, error: r.error })),
    };
  },
});

defineJob<{ eventId: string }>({
  type: ALERT_DELIVER_JOB,
  concurrency: 2,
  timeoutMs: 2 * 60_000,
  async run(payload) {
    return runAlertDelivery(payload.eventId);
  },
});

/** Hourly: evaluate every project with active alert rules. */
defineSchedule({
  name: "alerts.evaluate",
  cron: "7 * * * *",
  async tick() {
    const rows = await db
      .selectDistinct({ projectId: alertRules.projectId })
      .from(alertRules)
      .innerJoin(projects, eq(projects.id, alertRules.projectId))
      .where(and(eq(alertRules.active, true), eq(projects.archived, false), activeProjectSql(alertRules.projectId)));
    for (const r of rows) await enqueueAlertEvaluation(r.projectId);
  },
});

/** Daily: drop alert events older than the retention window. */
defineSchedule({
  name: "alerts.prune",
  cron: "53 3 * * *",
  async tick() {
    await db.delete(alertEvents).where(lt(alertEvents.firedAt, new Date(Date.now() - EVENT_RETENTION_DAYS * 86_400_000)));
  },
});
