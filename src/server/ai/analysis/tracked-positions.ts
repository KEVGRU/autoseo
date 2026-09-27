import "server-only";
import { sql, type SQL } from "drizzle-orm";
import { db } from "@/server/db/client";

type Executor = { execute: (query: SQL) => Promise<unknown> };

/**
 * SQL that (re)computes the tracked-set positions of a project: `ai_mentions.tracked_position`
 * (ordinal among own brand + competitor list, by first mention) and
 * `ai_answers.brand_position_tracked` (the own brand's tracked position). Needed whenever the
 * competitor list changes, because mentions are re-linked to / detached from competitors.
 * The same statements (without the project filter) backfill existing rows in the migration.
 */
export function trackedPositionStatements(projectId: string | null): SQL[] {
  const pm = projectId ? sql`and m.project_id = ${projectId}` : sql``;
  const pa = projectId ? sql`and a.project_id = ${projectId}` : sql``;
  return [
    sql`
      update ai_mentions m set tracked_position = r.rn
      from (
        select m.id, row_number() over (partition by m.answer_id order by m.char_offset, m.brand_name)::int rn
        from ai_mentions m
        where (m.is_own or m.competitor_id is not null) ${pm}
      ) r
      where m.id = r.id and m.tracked_position is distinct from r.rn`,
    sql`
      update ai_mentions m set tracked_position = null
      where not m.is_own and m.competitor_id is null and m.tracked_position is not null ${pm}`,
    sql`
      update ai_answers a set brand_position_tracked = o.tracked_position
      from (
        select m.answer_id, min(m.tracked_position) tracked_position from ai_mentions m where m.is_own ${pm} group by 1
      ) o
      where a.id = o.answer_id and a.brand_position_tracked is distinct from o.tracked_position ${pa}`,
    sql`
      update ai_answers a set brand_position_tracked = null
      where a.brand_position_tracked is not null ${pa}
        and not exists (select 1 from ai_mentions m where m.answer_id = a.id and m.is_own)`,
  ];
}

/** Recomputes tracked positions for one project (after competitors were added, renamed or removed). */
export async function recomputeTrackedPositions(projectId: string, exec: Executor = db): Promise<void> {
  for (const statement of trackedPositionStatements(projectId)) await exec.execute(statement);
}
