import "server-only";
// Registered via src/server/jobs/handlers/optimize.ts.
import { defineJob, defineSchedule } from "@/server/jobs/define";
import { enqueueJob } from "@/server/jobs/queue";
import { processTaskOutcomes } from "./outcome";

const OUTCOMES_JOB = "optimize.tasks.outcomes";

defineJob({
  type: OUTCOMES_JOB,
  concurrency: 1,
  timeoutMs: 15 * 60_000,
  retryable: false,
  run: async () => processTaskOutcomes(),
});

/** Visibility before/after resolved tasks: catch-up snapshots and 14-day follow-up measurements. */
defineSchedule({
  name: OUTCOMES_JOB,
  cron: "35 * * * *",
  tick: async () => {
    await enqueueJob(OUTCOMES_JOB, {}, { dedupeKey: OUTCOMES_JOB, priority: 180, maxAttempts: 1 });
  },
});
