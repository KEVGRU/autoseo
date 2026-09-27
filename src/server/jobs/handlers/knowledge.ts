import "server-only";
// Job handlers + schedules for connected knowledge sources (Notion, Google Drive, Slack, URLs).
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { knowledgeSources } from "@/server/db/schema";
import { defineJob, defineSchedule } from "../define";
import { enqueueKnowledgeSync, KNOWLEDGE_SYNC_JOB, REMOTE_KINDS, runKnowledgeSync } from "@/server/ai/knowledge/sources/service";

defineJob<{ sourceId: string; projectId?: string }>({
  type: KNOWLEDGE_SYNC_JOB,
  concurrency: 2,
  timeoutMs: 30 * 60_000,
  retryable: false,
  run: (payload) => runKnowledgeSync(payload.sourceId),
});

/** Daily re-sync of remote sources with auto-sync enabled. */
defineSchedule({
  name: "knowledge.sources.daily",
  cron: "43 3 * * *",
  tick: async () => {
    const rows = await db
      .select({ id: knowledgeSources.id, projectId: knowledgeSources.projectId, kind: knowledgeSources.kind })
      .from(knowledgeSources)
      .where(and(eq(knowledgeSources.autoSync, true), inArray(knowledgeSources.kind, REMOTE_KINDS), sql`${knowledgeSources.status} <> 'syncing'`));
    for (const r of rows) await enqueueKnowledgeSync(r, null);
  },
});

/** Sources stuck in "syncing" after a crash (job gone or finished) are marked failed. */
defineSchedule({
  name: "knowledge.sources.recover",
  cron: "*/10 * * * *",
  tick: async () => {
    await db.execute(sql`
      UPDATE knowledge_sources s SET status = 'error', error = 'Sync was interrupted. Please sync again.', job_id = NULL
      WHERE s.status = 'syncing' AND (s.job_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM jobs j WHERE j.id = s.job_id AND j.status IN ('queued', 'running')))
        AND s.updated_at < now() - interval '5 minutes'`);
  },
});
