import "server-only";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { optimizeTasks, prompts, type TaskOutcome, type TaskOutcomeWindow } from "@/server/db/schema";
import { getTrackerKpis, type TrackerFilter } from "@/server/ai/metrics";
import type { DayRange, PeriodRange } from "@/features/ai-tracking/period";
import { outcomeWindows, promptKey } from "./outcome-window";

type TaskRow = typeof optimizeTasks.$inferSelect;

/** Tracked prompt ids matching the task's target prompt texts (empty = project-wide snapshot). */
async function resolvePromptIds(projectId: string, targetPrompts: string[]): Promise<string[]> {
  if (!targetPrompts.length) return [];
  const wanted = new Set(targetPrompts.map(promptKey));
  const rows = await db.select({ id: prompts.id, text: prompts.text }).from(prompts).where(eq(prompts.projectId, projectId));
  return rows.filter((p) => wanted.has(promptKey(p.text))).map((p) => p.id);
}

async function measure(projectId: string, promptIds: string[], range: DayRange): Promise<TaskOutcomeWindow> {
  const filter: TrackerFilter = promptIds.length ? { projectId, promptIds, status: "all" } : { projectId };
  const period: PeriodRange = { ...range, prev: range, preset: "custom" };
  const { current } = await getTrackerKpis(filter, period);
  return {
    from: range.from,
    to: range.to,
    visibility: current.visibility,
    mentionRate: current.mentionRate,
    citationRate: current.citationRate,
    shareOfVoice: current.shareOfVoice,
    answers: current.answers,
  };
}

/** Stores the "before" visibility snapshot for resolved tasks (status done). */
export async function snapshotTaskOutcomes(projectId: string, taskIds: string[]): Promise<number> {
  if (!taskIds.length) return 0;
  const tasks = await db
    .select()
    .from(optimizeTasks)
    .where(and(eq(optimizeTasks.projectId, projectId), inArray(optimizeTasks.id, taskIds), eq(optimizeTasks.status, "done")));
  let n = 0;
  for (const t of tasks) {
    if (!t.resolvedAt) continue;
    await db.update(optimizeTasks).set({ outcome: await buildBefore(t, t.resolvedAt) }).where(eq(optimizeTasks.id, t.id));
    n++;
  }
  return n;
}

async function buildBefore(t: TaskRow, resolvedAt: Date): Promise<TaskOutcome> {
  const w = outcomeWindows(resolvedAt);
  const promptIds = await resolvePromptIds(t.projectId, t.targetPrompts);
  return {
    resolvedAt: resolvedAt.toISOString(),
    promptIds,
    before: await measure(t.projectId, promptIds, w.before),
    after: null,
    afterDueAt: w.afterDueAt.toISOString(),
    measuredAt: null,
  };
}

/** Snapshot best-effort (never blocks a status change). */
export async function snapshotTaskOutcomesSafe(projectId: string, taskIds: string[]) {
  try {
    await snapshotTaskOutcomes(projectId, taskIds);
  } catch (err) {
    console.error("[optimize] task outcome snapshot failed", err);
  }
}

/**
 * Catch-up + follow-up pass (hourly): clears outcomes of reopened tasks, snapshots "before" for
 * tasks resolved elsewhere (PM status sync, API) and measures "after" once the window is complete.
 */
export async function processTaskOutcomes(limit = 200): Promise<{ cleared: number; snapshotted: number; measured: number }> {
  const cleared = await db
    .update(optimizeTasks)
    .set({ outcome: null })
    .where(and(sql`${optimizeTasks.outcome} is not null`, sql`${optimizeTasks.status} <> 'done'`))
    .returning({ id: optimizeTasks.id });

  const missing = await db
    .select()
    .from(optimizeTasks)
    .where(
      and(
        eq(optimizeTasks.status, "done"),
        sql`${optimizeTasks.resolvedAt} is not null`,
        sql`${optimizeTasks.resolvedAt} > now() - interval '120 days'`,
        sql`(${optimizeTasks.outcome} is null or abs(extract(epoch from ((${optimizeTasks.outcome}->>'resolvedAt')::timestamptz - ${optimizeTasks.resolvedAt}))) > 1)`,
      ),
    )
    .limit(limit);
  for (const t of missing) {
    await db.update(optimizeTasks).set({ outcome: await buildBefore(t, t.resolvedAt!) }).where(eq(optimizeTasks.id, t.id));
  }

  const due = await db
    .select()
    .from(optimizeTasks)
    .where(
      and(
        eq(optimizeTasks.status, "done"),
        sql`${optimizeTasks.outcome} is not null`,
        sql`jsonb_typeof(${optimizeTasks.outcome}->'after') is distinct from 'object'`,
        sql`(${optimizeTasks.outcome}->>'afterDueAt')::timestamptz <= now()`,
      ),
    )
    .limit(limit);
  for (const t of due) {
    const o = t.outcome!;
    const w = outcomeWindows(new Date(o.resolvedAt));
    const after = await measure(t.projectId, o.promptIds, w.after);
    await db
      .update(optimizeTasks)
      .set({ outcome: { ...o, after, measuredAt: new Date().toISOString() } })
      .where(eq(optimizeTasks.id, t.id));
  }
  return { cleared: cleared.length, snapshotted: missing.length, measured: due.length };
}
