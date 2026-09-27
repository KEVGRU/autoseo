import "server-only";
import { defineJob, defineSchedule } from "../define";
import { VISIBILITY_CHECK_JOB, failStaleChecks, purgeExpiredChecks, runVisibilityCheck } from "@/server/free-tools/visibility-check";

/** Free AI Visibility Check: readiness → brand/prompts → answers on up to 3 engines → actions. */
defineJob<{ checkId: string }>({
  type: VISIBILITY_CHECK_JOB,
  concurrency: 2,
  timeoutMs: 14 * 60_000,
  // Billed engine calls: never replay a check.
  retryable: false,
  run: async (payload) => {
    const row = await runVisibilityCheck(payload.checkId);
    return {
      status: row?.status ?? "missing",
      score: row?.score ?? null,
      costUsd: row?.costUsd ?? 0,
    };
  },
});

/** Hourly: fail checks whose job died, delete expired checks (incl. emails). */
defineSchedule({
  name: "free-tools.ai-check-maintenance",
  cron: "23 * * * *",
  tick: async () => {
    const stale = await failStaleChecks();
    const purged = await purgeExpiredChecks();
    if (stale || purged) console.info(`[ai-check] maintenance: ${stale} stale failed, ${purged} expired deleted`);
  },
});
