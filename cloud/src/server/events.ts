import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { events } from "@/server/db/schema";

/** Appends to the audit log. Never throws — logging must not break the flow it records. */
export async function logEvent(
  type: string,
  opts: { userId?: string | null; instanceId?: string | null; data?: Record<string, unknown> } = {},
): Promise<void> {
  try {
    await db.insert(events).values({
      type,
      userId: opts.userId ?? null,
      instanceId: opts.instanceId ?? null,
      data: opts.data ?? {},
    });
  } catch (err) {
    console.error(`[events] failed to record ${type}`, err);
  }
}

/**
 * Appends `type` only if no event of that type with the same `data[key]` exists yet. Serialized with a transaction
 * advisory lock, so concurrent callers (webhook + redirect, two containers during a deploy) can't both record it.
 * Returns the new event's id, or null when it already existed or couldn't be recorded. Never throws.
 */
export async function logEventOnce(
  type: string,
  key: string,
  opts: { userId?: string | null; instanceId?: string | null; data: Record<string, unknown> },
): Promise<string | null> {
  const value = String(opts.data[key] ?? "");
  try {
    return await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`${type}:${value}`}))`);
      const [existing] = await tx
        .select({ id: events.id })
        .from(events)
        .where(and(eq(events.type, type), sql`${events.data} ->> ${key} = ${value}`))
        .limit(1);
      if (existing) return null;
      const [row] = await tx
        .insert(events)
        .values({ type, userId: opts.userId ?? null, instanceId: opts.instanceId ?? null, data: opts.data })
        .returning({ id: events.id });
      return row?.id ?? null;
    });
  } catch (err) {
    console.error(`[events] failed to record ${type} once`, err);
    return null;
  }
}

export async function latestEvents(limit = 200) {
  return db.select().from(events).orderBy(desc(events.createdAt)).limit(limit);
}
