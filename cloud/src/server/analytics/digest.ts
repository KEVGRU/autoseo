import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { events } from "@/server/db/schema";
import { env } from "@/server/env";
import { appUrl } from "@/server/http";
import { logEvent, logEventOnce } from "@/server/events";
import { sendMail } from "@/server/email";
import { growthDigestEmail, type DigestRow } from "@/server/email/templates";
import type { BreakdownRow } from "./breakdown";
import { DAY_MS, digestSchedule } from "./periods";
import { growthReport } from "./report";

/** A week's digest is retried at most this often when SMTP fails. */
const MAX_FAILURES = 3;

async function countWeekEvents(type: string, week: string): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(events)
    .where(and(eq(events.type, type), sql`${events.data} ->> 'week' = ${week}`));
  return row?.n ?? 0;
}

const topByVisitors = (rows: BreakdownRow[]): DigestRow[] =>
  [...rows]
    .sort((a, b) => b.visitors - a.visitors || b.accounts - a.accounts)
    .slice(0, 5)
    .map((r) => ({ name: r.key, visitors: r.visitors, accounts: r.accounts, paid: r.paid }));

const dateLabel = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/**
 * Housekeeping: from Monday 07:00 UTC, emails last week's numbers (vs the week before) to OPERATOR_EMAIL, or the
 * first ADMIN_EMAILS entry. Sent once per ISO week — the "growth.digest_sent" event is claimed before sending, so
 * restarts, repeated ticks and overlapping containers during a deploy don't send it twice.
 */
export async function sendGrowthDigestIfDue(now: Date = new Date()): Promise<void> {
  const schedule = digestSchedule(now);
  const to = env.operatorEmail || env.adminEmails[0];
  if (!schedule.due || !to) return;
  if ((await countWeekEvents("growth.digest_sent", schedule.week)) > 0) return;
  if ((await countWeekEvents("growth.digest_failed", schedule.week)) >= MAX_FAILURES) return;

  const [current, previous] = await Promise.all([growthReport(schedule.current), growthReport(schedule.previous)]);
  const claim = await logEventOnce("growth.digest_sent", "week", { data: { week: schedule.week, to } });
  if (!claim) return;

  const lastDay = new Date(schedule.current.to.getTime() - DAY_MS);
  const mail = growthDigestEmail({
    week: schedule.week,
    period: `${dateLabel(schedule.current.from)} – ${dateLabel(lastDay)}, ${lastDay.getUTCFullYear()}`,
    metrics: [
      { label: "Visitors", current: current.visitors, previous: previous.visitors },
      { label: "Accounts", current: current.accounts, previous: previous.accounts },
      { label: "Checkouts", current: current.checkouts, previous: previous.checkouts },
      { label: "Paid", current: current.paid, previous: previous.paid },
    ],
    mrr: `$${current.mrrUsd.toLocaleString("en-US", { minimumFractionDigits: current.mrrUsd % 1 ? 2 : 0, maximumFractionDigits: 2 })}`,
    activeSubscriptions: current.activeSubscriptions,
    channels: topByVisitors(current.channels),
    campaigns: topByVisitors(current.campaigns),
    url: appUrl("/admin?tab=growth&days=7"),
  });
  const res = await sendMail({ to, ...mail });
  if (res.transport === "smtp" && !res.delivered) {
    // Release the claim so the next housekeeping run tries again.
    await db.delete(events).where(eq(events.id, claim));
    await logEvent("growth.digest_failed", { data: { week: schedule.week, to, error: res.error } });
    return;
  }
  await db
    .update(events)
    .set({ data: { week: schedule.week, to, transport: res.transport, delivered: res.delivered } })
    .where(eq(events.id, claim));
}
