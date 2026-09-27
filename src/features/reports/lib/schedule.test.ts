import { describe, expect, it } from "vitest";
import { computeNextRun, describeSchedule, parseRecipients, resolveScheduleRange, zonedParts, zonedTimeToUtc, type ScheduleTiming } from "./schedule";

const weekly = (o: Partial<ScheduleTiming> = {}): ScheduleTiming => ({ cadence: "weekly", weekday: 1, monthDay: 1, hour: 8, timezone: "UTC", ...o });
const monthly = (o: Partial<ScheduleTiming> = {}): ScheduleTiming => ({ cadence: "monthly", weekday: 1, monthDay: 1, hour: 8, timezone: "UTC", ...o });
const iso = (d: Date) => d.toISOString();

describe("zonedTimeToUtc", () => {
  it("converts regular wall-clock times", () => {
    expect(iso(zonedTimeToUtc(2026, 1, 15, 8, 0, "Europe/Berlin"))).toBe("2026-01-15T07:00:00.000Z");
    expect(iso(zonedTimeToUtc(2026, 7, 15, 8, 0, "Europe/Berlin"))).toBe("2026-07-15T06:00:00.000Z");
    expect(iso(zonedTimeToUtc(2026, 7, 15, 8, 0, "America/New_York"))).toBe("2026-07-15T12:00:00.000Z");
    expect(iso(zonedTimeToUtc(2026, 7, 15, 8, 0, "UTC"))).toBe("2026-07-15T08:00:00.000Z");
  });

  it("moves times inside a spring-forward gap to the first valid instant after it", () => {
    // Berlin 2026-03-29: 02:00 CET → 03:00 CEST (01:00Z)
    expect(iso(zonedTimeToUtc(2026, 3, 29, 2, 0, "Europe/Berlin"))).toBe("2026-03-29T01:00:00.000Z");
    // New York 2026-03-08: 02:00 EST → 03:00 EDT (07:00Z)
    expect(iso(zonedTimeToUtc(2026, 3, 8, 2, 0, "America/New_York"))).toBe("2026-03-08T07:00:00.000Z");
  });

  it("resolves ambiguous fall-back times to the first occurrence", () => {
    // Berlin 2026-10-25: 03:00 CEST → 02:00 CET; 02:00 happens at 00:00Z and 01:00Z
    expect(iso(zonedTimeToUtc(2026, 10, 25, 2, 0, "Europe/Berlin"))).toBe("2026-10-25T00:00:00.000Z");
    // New York 2026-11-01: 01:00 happens at 05:00Z (EDT) and 06:00Z (EST)
    expect(iso(zonedTimeToUtc(2026, 11, 1, 1, 0, "America/New_York"))).toBe("2026-11-01T05:00:00.000Z");
  });

  it("falls back to UTC for invalid zones", () => {
    expect(iso(zonedTimeToUtc(2026, 5, 1, 9, 0, "Not/AZone"))).toBe("2026-05-01T09:00:00.000Z");
  });
});

describe("computeNextRun", () => {
  it("weekly: same day later, or the next matching weekday", () => {
    // Monday 2026-09-28 07:00Z → Monday 08:00Z same day
    expect(iso(computeNextRun(weekly(), new Date("2026-09-28T07:00:00Z")))).toBe("2026-09-28T08:00:00.000Z");
    // exactly at the slot → next week (strictly after)
    expect(iso(computeNextRun(weekly(), new Date("2026-09-28T08:00:00Z")))).toBe("2026-10-05T08:00:00.000Z");
    // Saturday → following Monday
    expect(iso(computeNextRun(weekly(), new Date("2026-09-26T12:00:00Z")))).toBe("2026-09-28T08:00:00.000Z");
    // Sunday (0)
    expect(iso(computeNextRun(weekly({ weekday: 0, hour: 18 }), new Date("2026-09-26T12:00:00Z")))).toBe("2026-09-27T18:00:00.000Z");
  });

  it("weekly in a time zone uses the local weekday and hour", () => {
    // Europe/Berlin Monday 08:00 local in summer = 06:00Z; at Sunday 23:30Z it is already Monday 01:30 local
    expect(iso(computeNextRun(weekly({ timezone: "Europe/Berlin" }), new Date("2026-09-27T23:30:00Z")))).toBe("2026-09-28T06:00:00.000Z");
    // Asia/Tokyo Monday 08:00 local = Sunday 23:00Z
    expect(iso(computeNextRun(weekly({ timezone: "Asia/Tokyo" }), new Date("2026-09-27T12:00:00Z")))).toBe("2026-09-27T23:00:00.000Z");
  });

  it("keeps the local hour across DST changes", () => {
    const s = weekly({ weekday: 0, hour: 8, timezone: "Europe/Berlin" });
    // Sunday 2026-10-25 is the fall-back day: 08:00 CET = 07:00Z (the week before it was 06:00Z)
    expect(iso(computeNextRun(s, new Date("2026-10-18T07:00:00Z")))).toBe("2026-10-25T07:00:00.000Z");
    expect(iso(computeNextRun(s, new Date("2026-10-11T00:00:00Z")))).toBe("2026-10-11T06:00:00.000Z");
    // spring forward 2026-03-29 (Sunday): 08:00 CEST = 06:00Z
    expect(iso(computeNextRun(s, new Date("2026-03-28T12:00:00Z")))).toBe("2026-03-29T06:00:00.000Z");
    // a slot inside the gap (02:00 local) runs at 03:00 CEST
    expect(iso(computeNextRun({ ...s, hour: 2 }, new Date("2026-03-28T12:00:00Z")))).toBe("2026-03-29T01:00:00.000Z");
    // New York weekly Monday 09:00 across the November change
    const ny = weekly({ timezone: "America/New_York", hour: 9 });
    expect(iso(computeNextRun(ny, new Date("2026-10-27T00:00:00Z")))).toBe("2026-11-02T14:00:00.000Z");
    expect(iso(computeNextRun(ny, new Date("2026-10-20T00:00:00Z")))).toBe("2026-10-26T13:00:00.000Z");
  });

  it("monthly: runs on the day, clamps to the month's last day", () => {
    expect(iso(computeNextRun(monthly(), new Date("2026-09-26T12:00:00Z")))).toBe("2026-10-01T08:00:00.000Z");
    expect(iso(computeNextRun(monthly({ monthDay: 31 }), new Date("2026-09-26T12:00:00Z")))).toBe("2026-09-30T08:00:00.000Z");
    expect(iso(computeNextRun(monthly({ monthDay: 31 }), new Date("2026-09-30T08:00:00Z")))).toBe("2026-10-31T08:00:00.000Z");
    // February (non-leap 2027, leap 2028)
    expect(iso(computeNextRun(monthly({ monthDay: 30 }), new Date("2027-02-01T00:00:00Z")))).toBe("2027-02-28T08:00:00.000Z");
    expect(iso(computeNextRun(monthly({ monthDay: 29 }), new Date("2028-02-01T00:00:00Z")))).toBe("2028-02-29T08:00:00.000Z");
    expect(iso(computeNextRun(monthly({ monthDay: 29 }), new Date("2027-02-01T00:00:00Z")))).toBe("2027-02-28T08:00:00.000Z");
    // year rollover
    expect(iso(computeNextRun(monthly({ monthDay: 15 }), new Date("2026-12-20T00:00:00Z")))).toBe("2027-01-15T08:00:00.000Z");
  });

  it("monthly in a time zone on month end", () => {
    // Europe/Berlin last day of October 2026 at 08:00 CET (after fall-back) = 07:00Z
    expect(iso(computeNextRun(monthly({ monthDay: 31, timezone: "Europe/Berlin" }), new Date("2026-10-01T00:00:00Z")))).toBe("2026-10-31T07:00:00.000Z");
    // Pacific/Auckland 1st of the month 08:00 local = previous day 19:00Z (NZST +12) / 20:00Z (NZDT +13 → 19:00Z)
    expect(iso(computeNextRun(monthly({ timezone: "Pacific/Auckland" }), new Date("2026-06-15T00:00:00Z")))).toBe("2026-06-30T20:00:00.000Z");
  });

  it("clamps out-of-range inputs", () => {
    expect(iso(computeNextRun(monthly({ monthDay: 0, hour: 30 }), new Date("2026-09-26T12:00:00Z")))).toBe("2026-10-01T23:00:00.000Z");
    expect(iso(computeNextRun(weekly({ weekday: 8 }), new Date("2026-09-26T12:00:00Z")))).toBe("2026-09-28T08:00:00.000Z");
  });
});

describe("resolveScheduleRange", () => {
  const at = new Date("2026-10-01T06:00:00Z"); // Thursday
  it("rolling windows end yesterday", () => {
    expect(resolveScheduleRange("last_7", at, "UTC")).toEqual({ preset: "custom", from: "2026-09-24", to: "2026-09-30" });
    expect(resolveScheduleRange("last_30", at, "UTC")).toEqual({ preset: "custom", from: "2026-09-01", to: "2026-09-30" });
    expect(resolveScheduleRange("last_14", at, "UTC")).toEqual({ preset: "custom", from: "2026-09-17", to: "2026-09-30" });
  });
  it("calendar windows", () => {
    expect(resolveScheduleRange("last_month", at, "UTC")).toEqual({ preset: "custom", from: "2026-09-01", to: "2026-09-30" });
    expect(resolveScheduleRange("last_week", at, "UTC")).toEqual({ preset: "custom", from: "2026-09-21", to: "2026-09-27" });
    expect(resolveScheduleRange("last_quarter", at, "UTC")).toEqual({ preset: "custom", from: "2026-07-01", to: "2026-09-30" });
    expect(resolveScheduleRange("last_quarter", new Date("2026-02-10T00:00:00Z"), "UTC")).toEqual({ preset: "custom", from: "2025-10-01", to: "2025-12-31" });
    expect(resolveScheduleRange("last_month", new Date("2026-01-01T09:00:00Z"), "UTC")).toEqual({ preset: "custom", from: "2025-12-01", to: "2025-12-31" });
    expect(resolveScheduleRange("last_month", new Date("2028-03-01T09:00:00Z"), "UTC")).toEqual({ preset: "custom", from: "2028-02-01", to: "2028-02-29" });
  });
  it("month to date falls back to the previous month on the 1st", () => {
    expect(resolveScheduleRange("month_to_date", new Date("2026-10-15T09:00:00Z"), "UTC")).toEqual({ preset: "custom", from: "2026-10-01", to: "2026-10-14" });
    expect(resolveScheduleRange("month_to_date", at, "UTC")).toEqual({ preset: "custom", from: "2026-09-01", to: "2026-09-30" });
  });
  it("uses the local date of the time zone", () => {
    // 2026-09-30T23:30Z is already Oct 1 in Berlin → previous month = September
    expect(resolveScheduleRange("last_month", new Date("2026-09-30T23:30:00Z"), "Europe/Berlin")).toEqual({ preset: "custom", from: "2026-09-01", to: "2026-09-30" });
    expect(resolveScheduleRange("last_month", new Date("2026-09-30T23:30:00Z"), "UTC")).toEqual({ preset: "custom", from: "2026-08-01", to: "2026-08-31" });
  });
  it("report keeps the report's own range", () => {
    expect(resolveScheduleRange("report", at, "UTC", { preset: "90d" })).toEqual({ preset: "90d" });
    expect(resolveScheduleRange("report", at, "UTC", null)).toEqual({ preset: "30d" });
  });
});

describe("helpers", () => {
  it("zonedParts", () => {
    expect(zonedParts(new Date("2026-01-01T00:30:00Z"), "America/Los_Angeles")).toMatchObject({ y: 2025, m: 12, d: 31, h: 16, min: 30 });
  });
  it("describeSchedule", () => {
    expect(describeSchedule(weekly({ timezone: "Europe/Berlin" }))).toBe("Every Monday at 08:00 (Europe/Berlin)");
    expect(describeSchedule(monthly({ monthDay: 2 }))).toBe("Monthly on the 2nd at 08:00 (UTC)");
    expect(describeSchedule(monthly({ monthDay: 31 }))).toBe("Monthly on the last day at 08:00 (UTC)");
  });
  it("parseRecipients", () => {
    expect(parseRecipients("A@Example.com, b@example.org;\nnot-an-email  a@example.com")).toEqual({
      valid: ["a@example.com", "b@example.org"],
      invalid: ["not-an-email"],
    });
    expect(parseRecipients(["<x@y.io>"]).valid).toEqual(["x@y.io"]);
  });
});
