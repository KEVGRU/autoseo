import { describe, expect, it } from "vitest";
import { outcomeDelta, outcomeWindows, promptKey } from "./outcome-window";

describe("outcomeWindows", () => {
  it("builds 14-day windows around the resolution day", () => {
    const w = outcomeWindows(new Date("2026-03-15T17:30:00Z"));
    expect(w.before).toEqual({ from: "2026-03-01", to: "2026-03-14", days: 14 });
    expect(w.after).toEqual({ from: "2026-03-16", to: "2026-03-29", days: 14 });
    expect(w.afterDueAt.toISOString()).toBe("2026-03-30T00:00:00.000Z");
  });
});

describe("outcomeDelta", () => {
  const base = { visibility: 20, mentionRate: 15, citationRate: 5, shareOfVoice: 10, answers: 40 };
  it("returns percentage-point changes", () => {
    expect(outcomeDelta(base, { visibility: 32.5, mentionRate: 15, citationRate: 2, shareOfVoice: null, answers: 38 })).toEqual({
      visibility: 12.5,
      mentionRate: 0,
      citationRate: -3,
      shareOfVoice: null,
    });
  });
  it("is empty without data on either side", () => {
    expect(outcomeDelta(base, null).visibility).toBeNull();
    expect(outcomeDelta({ ...base, answers: 0 }, base).visibility).toBeNull();
  });
});

describe("promptKey", () => {
  it("normalizes case, whitespace and trailing punctuation", () => {
    expect(promptKey("  Best  Solar Balcony?  ")).toBe(promptKey("best solar balcony"));
  });
});
