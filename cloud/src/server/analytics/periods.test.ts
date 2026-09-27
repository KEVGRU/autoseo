import { describe, expect, it } from "vitest";
import { daysIn, digestSchedule, isoWeekKey, periodRange } from "./periods";

describe("periodRange", () => {
  it("covers the last N UTC days including today", () => {
    const range = periodRange(7, new Date("2026-09-27T15:30:00Z"));
    expect(range.from.toISOString()).toBe("2026-09-21T00:00:00.000Z");
    expect(range.to.toISOString()).toBe("2026-09-28T00:00:00.000Z");
    expect(daysIn(range)).toEqual(["2026-09-21", "2026-09-22", "2026-09-23", "2026-09-24", "2026-09-25", "2026-09-26", "2026-09-27"]);
  });
});

describe("isoWeekKey", () => {
  it("follows ISO 8601 week numbering", () => {
    expect(isoWeekKey(new Date("2026-09-27T12:00:00Z"))).toBe("2026-W39"); // Sunday
    expect(isoWeekKey(new Date("2026-09-28T00:00:00Z"))).toBe("2026-W40"); // Monday
    expect(isoWeekKey(new Date("2026-01-01T00:00:00Z"))).toBe("2026-W01");
    expect(isoWeekKey(new Date("2027-01-01T00:00:00Z"))).toBe("2026-W53");
    expect(isoWeekKey(new Date("2024-12-30T00:00:00Z"))).toBe("2025-W01");
  });
});

describe("digestSchedule", () => {
  it("is not due on Monday before 07:00 UTC", () => {
    expect(digestSchedule(new Date("2026-09-28T06:59:00Z")).due).toBe(false);
  });

  it("reports the previous ISO week from Monday 07:00 UTC on", () => {
    const schedule = digestSchedule(new Date("2026-09-28T07:00:00Z"));
    expect(schedule.due).toBe(true);
    expect(schedule.week).toBe("2026-W39");
    expect(schedule.current.from.toISOString()).toBe("2026-09-21T00:00:00.000Z");
    expect(schedule.current.to.toISOString()).toBe("2026-09-28T00:00:00.000Z");
    expect(schedule.previous.from.toISOString()).toBe("2026-09-14T00:00:00.000Z");
    expect(schedule.previous.to.toISOString()).toBe("2026-09-21T00:00:00.000Z");
  });

  it("keeps the same week key for the rest of the week", () => {
    expect(digestSchedule(new Date("2026-10-04T23:00:00Z"))).toMatchObject({ due: true, week: "2026-W39" });
    expect(digestSchedule(new Date("2026-09-27T12:00:00Z"))).toMatchObject({ due: true, week: "2026-W38" });
  });
});
