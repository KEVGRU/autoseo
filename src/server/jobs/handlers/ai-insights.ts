import "server-only";
// Job handlers for AI insight enrichments (fan-out intents & coverage, backfill of older data).
import { sql, type SQL } from "drizzle-orm";
import { defineJob, defineSchedule } from "../define";
import { enqueueJob } from "../queue";
import { db } from "@/server/db/client";
import { classifyFanouts, computeFanoutCoverage } from "@/server/ai/insights/fanouts";
import { backfillInsights } from "@/server/ai/insights/backfill";

async function projectIds(where: SQL): Promise<string[]> {
  const res = await db.execute(where);
  return Array.from(res as unknown as Iterable<{ id: string }>).map((r) => r.id);
}

/** Intent (keywords → LLM batches) + word count + coverage for a project's unclassified fan-out queries. */
defineJob<{ projectId: string; recomputeCoverage?: boolean }>({
  type: "ai.fanouts.classify",
  concurrency: 1,
  timeoutMs: 30 * 60_000,
  run: async (p, ctx) => {
    const runs = [];
    for (let i = 0; i < 10; i++) {
      const r = await classifyFanouts(p.projectId);
      runs.push(r);
      await ctx.progress({ round: i + 1, remaining: r.remaining });
      if (!r.remaining || !r.queries || (await ctx.isCancelled())) break;
    }
    const coverage = p.recomputeCoverage ? await computeFanoutCoverage(p.projectId, { all: true }) : null;
    return { runs, coverage };
  },
});

/** Daily: refresh fan-out coverage (the sitemap / own pages / catalog may have changed). */
defineSchedule({
  name: "ai.fanouts.coverage",
  cron: "35 4 * * *",
  tick: async () => {
    await enqueueJob("ai.fanouts.coverage", {}, { dedupeKey: "ai.fanouts.coverage", maxAttempts: 1 });
  },
});

defineJob<Record<string, never>>({
  type: "ai.fanouts.coverage",
  concurrency: 1,
  retryable: false,
  timeoutMs: 30 * 60_000,
  run: async () => {
    const ids = await projectIds(sql`select distinct project_id as id from ai_fanouts where answer_date >= current_date - 180`);
    const out: Record<string, unknown> = {};
    for (const id of ids) out[id] = await computeFanoutCoverage(id, { all: true });
    return out;
  },
});

/**
 * Backfill of insight enrichments for existing data (sources, aspects, follow-ups, ad click
 * params, fan-out intent/coverage, catalog matches). Without projectId: every project.
 * Enqueued by `scripts/backfill-insights.mjs`.
 */
defineJob<{ projectId?: string; llm?: boolean }>({
  type: "ai.insights.backfill",
  concurrency: 1,
  retryable: false,
  timeoutMs: 60 * 60_000,
  run: async (p, ctx) => {
    const ids = p.projectId ? [p.projectId] : await projectIds(sql`select id from projects order by created_at`);
    const results = [];
    for (const [i, id] of ids.entries()) {
      results.push(await backfillInsights(id, { llm: p.llm }));
      await ctx.progress({ done: i + 1, total: ids.length });
      if (await ctx.isCancelled()) break;
    }
    return { projects: results };
  },
});
