import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { defineJob, defineSchedule } from "@/server/jobs/define";
import { enqueueJob } from "@/server/jobs/queue";
import { runContentGeneration, runUrlOptimization, type GenerationOptions } from "./generate";
import { generatePersonasWithAi, insertLibraryPersonas } from "./personas";
import { CONTENT_CITE_JOB, CONTENT_CLAIMS_JOB, runCitationRewrite, runClaimCheck } from "./claims";

export const CONTENT_GENERATE_JOB = "optimize.content.generate";
export const CONTENT_OPTIMIZE_URL_JOB = "optimize.content.optimize_url";
export const CONTENT_PERSONAS_JOB = "optimize.content.personas";

export function enqueueContentGeneration(projectId: string, contentId: string, options: GenerationOptions, userId: string | null) {
  return enqueueJob(CONTENT_GENERATE_JOB, { contentId, options }, { projectId, createdBy: userId, dedupeKey: `${CONTENT_GENERATE_JOB}:${contentId}`, maxAttempts: 1, priority: 60 });
}

export function enqueueUrlOptimization(projectId: string, contentId: string, rewrite: boolean, userId: string | null) {
  return enqueueJob(CONTENT_OPTIMIZE_URL_JOB, { contentId, rewrite }, { projectId, createdBy: userId, dedupeKey: `${CONTENT_OPTIMIZE_URL_JOB}:${contentId}`, maxAttempts: 1, priority: 60 });
}

export function enqueuePersonaGeneration(projectId: string, topic: string, userId: string | null) {
  return enqueueJob(CONTENT_PERSONAS_JOB, { projectId, topic }, { projectId, createdBy: userId, dedupeKey: `${CONTENT_PERSONAS_JOB}:${projectId}:${topic.toLowerCase()}`, maxAttempts: 1, priority: 70 });
}

defineJob<{ contentId: string; options?: GenerationOptions }>({
  type: CONTENT_GENERATE_JOB,
  concurrency: 2,
  timeoutMs: 45 * 60_000,
  retryable: false,
  async run(payload) {
    return runContentGeneration(payload.contentId, payload.options ?? {});
  },
});

defineJob<{ contentId: string; rewrite?: boolean }>({
  type: CONTENT_OPTIMIZE_URL_JOB,
  concurrency: 2,
  timeoutMs: 25 * 60_000,
  retryable: false,
  async run(payload) {
    return runUrlOptimization(payload.contentId, { rewrite: payload.rewrite !== false });
  },
});

defineJob<{ projectId: string; topic: string }>({
  type: CONTENT_PERSONAS_JOB,
  concurrency: 2,
  timeoutMs: 10 * 60_000,
  retryable: false,
  async run(payload) {
    try {
      const n = await generatePersonasWithAi(payload.projectId, payload.topic);
      if (n >= 12) return { created: n, source: "ai" };
      return { created: n + (await insertLibraryPersonas(payload.projectId, payload.topic)), source: "ai+library" };
    } catch (err) {
      // Keep the library usable even when the AI call fails.
      const n = await insertLibraryPersonas(payload.projectId, payload.topic);
      return { created: n, source: "library", error: err instanceof Error ? err.message : String(err) };
    }
  },
});

defineJob<{ contentId: string }>({
  type: CONTENT_CLAIMS_JOB,
  concurrency: 2,
  timeoutMs: 20 * 60_000,
  retryable: false,
  run: (payload) => runClaimCheck(payload.contentId),
});

defineJob<{ contentId: string }>({
  type: CONTENT_CITE_JOB,
  concurrency: 2,
  timeoutMs: 20 * 60_000,
  retryable: false,
  run: (payload) => runCitationRewrite(payload.contentId),
});

/** Claim checks / citation rewrites whose job disappeared (crash, restart) stop spinning in the editor. */
defineSchedule({
  name: "optimize.content.claims_recover",
  cron: "*/10 * * * *",
  tick: async () => {
    await db.execute(sql`
      UPDATE content_pieces c SET claim_checks = c.claim_checks || jsonb_build_object(
          'status', CASE WHEN c.claim_checks->>'status' = 'rewriting' THEN 'done' ELSE 'failed' END,
          'error', CASE WHEN c.claim_checks->>'status' = 'rewriting' THEN 'Rewrite was interrupted. Please try again.' ELSE 'Claim check was interrupted. Please run it again.' END)
      WHERE c.claim_checks->>'status' IN ('running', 'rewriting')
        AND c.updated_at < now() - interval '10 minutes'
        AND NOT EXISTS (SELECT 1 FROM jobs j WHERE j.type IN (${CONTENT_CLAIMS_JOB}, ${CONTENT_CITE_JOB}) AND j.status IN ('queued', 'running') AND j.payload->>'contentId' = c.id)`);
  },
});
