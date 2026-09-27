/** Date ranges for the growth report and the weekly digest (UTC, pure). */

export type Range = { from: Date; to: Date };

export const DAY_MS = 24 * 60 * 60 * 1000;
/** The cookieless statistics and the growth funnel went live on this day (UTC). */
export const ANALYTICS_START = new Date("2026-09-27T00:00:00Z");
/** The weekly digest goes out on Monday from this hour (UTC) on. */
const DIGEST_HOUR_UTC = 7;

export function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** The last `days` UTC calendar days, today included (`to` is exclusive). */
export function periodRange(days: number, now: Date = new Date()): Range {
  const to = new Date(startOfUtcDay(now).getTime() + DAY_MS);
  return { from: new Date(to.getTime() - days * DAY_MS), to };
}

/** "YYYY-MM-DD" for every UTC day in the range, oldest first. */
export function daysIn(range: Range): string[] {
  const out: string[] = [];
  for (let t = startOfUtcDay(range.from).getTime(); t < range.to.getTime(); t += DAY_MS) out.push(new Date(t).toISOString().slice(0, 10));
  return out;
}

/** ISO 8601 week of a date, e.g. "2026-W39". */
export function isoWeekKey(date: Date): string {
  const thursday = startOfUtcDay(date);
  thursday.setUTCDate(thursday.getUTCDate() - ((thursday.getUTCDay() + 6) % 7) + 3);
  const year = thursday.getUTCFullYear();
  const week = 1 + Math.floor((thursday.getTime() - Date.UTC(year, 0, 1)) / DAY_MS / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/**
 * The weekly digest covers the previous ISO week (Monday to Monday) and compares it with the week before. It is due
 * from Monday 07:00 UTC on; `week` names the reported week and dedupes the email.
 */
export function digestSchedule(now: Date = new Date()): { due: boolean; week: string; current: Range; previous: Range } {
  const today = startOfUtcDay(now);
  const monday = new Date(today.getTime() - ((today.getUTCDay() + 6) % 7) * DAY_MS);
  const current = { from: new Date(monday.getTime() - 7 * DAY_MS), to: monday };
  return {
    due: now.getTime() >= monday.getTime() + DIGEST_HOUR_UTC * 60 * 60 * 1000,
    week: isoWeekKey(current.from),
    current,
    previous: { from: new Date(monday.getTime() - 14 * DAY_MS), to: current.from },
  };
}
