import { describe, expect, it } from "vitest";
import { dedupeHash, dropBy, inCooldown, isErrorSpike, isSpike, magnitudeSeverity, planFiring, relativeChange } from "./plan";
import { describeRule, resolveParams } from "@/features/alerts/kinds";

const now = new Date("2026-09-26T12:00:00Z");
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000);

describe("planFiring (dedupe + cooldown)", () => {
  it("fires new findings and remembers them as open", () => {
    const p = planFiring({ keys: ["a", "b"], open: [], lastFiredAt: null, cooldownHours: 24, now });
    expect(p.fire).toEqual(["a", "b"]);
    expect(p.nextOpen).toEqual(["a", "b"]);
    expect(p.deferred).toBe(false);
  });

  it("does not fire findings that are still open (dedupe)", () => {
    const p = planFiring({ keys: ["a", "b"], open: ["a", "b"], lastFiredAt: hoursAgo(30), cooldownHours: 24, now });
    expect(p.fire).toEqual([]);
    expect(p.nextOpen).toEqual(["a", "b"]);
  });

  it("only fires the new key when some are already open", () => {
    const p = planFiring({ keys: ["a", "c"], open: ["a", "b"], lastFiredAt: hoursAgo(30), cooldownHours: 24, now });
    expect(p.fire).toEqual(["c"]);
    expect(p.nextOpen).toEqual(["a", "c"]); // "b" cleared → can fire again later
  });

  it("re-fires a finding after it cleared and came back", () => {
    const cleared = planFiring({ keys: [], open: ["a"], lastFiredAt: hoursAgo(30), cooldownHours: 24, now });
    expect(cleared.nextOpen).toEqual([]);
    const again = planFiring({ keys: ["a"], open: cleared.nextOpen, lastFiredAt: hoursAgo(30), cooldownHours: 24, now });
    expect(again.fire).toEqual(["a"]);
  });

  it("defers new findings during the cooldown without marking them open", () => {
    const p = planFiring({ keys: ["a", "new"], open: ["a"], lastFiredAt: hoursAgo(2), cooldownHours: 6, now });
    expect(p.fire).toEqual([]);
    expect(p.deferred).toBe(true);
    expect(p.nextOpen).toEqual(["a"]);
    const later = planFiring({ keys: ["a", "new"], open: p.nextOpen, lastFiredAt: hoursAgo(7), cooldownHours: 6, now });
    expect(later.fire).toEqual(["new"]);
  });

  it("treats cooldown 0 as no cooldown", () => {
    expect(inCooldown(hoursAgo(0), 0, now)).toBe(false);
    expect(inCooldown(hoursAgo(0.5), 1, now)).toBe(true);
    expect(inCooldown(null, 24, now)).toBe(false);
  });

  it("builds an order-independent dedupe hash", () => {
    expect(dedupeHash(["b", "a"])).toBe(dedupeHash(["a", "b"]));
    expect(dedupeHash(["a"])).not.toBe(dedupeHash(["a", "b"]));
  });
});

describe("thresholds", () => {
  it("fires a drop only at or above the threshold", () => {
    expect(dropBy({ current: 30, previous: 41, threshold: 10 })).toBe(-11);
    expect(dropBy({ current: 32, previous: 41, threshold: 10 })).toBeNull();
    expect(dropBy({ current: 45, previous: 41, threshold: 1 })).toBeNull();
    expect(dropBy({ current: null, previous: 41, threshold: 1 })).toBeNull();
  });

  it("inverts the direction for lower-is-better metrics (position)", () => {
    expect(dropBy({ current: 3.4, previous: 2.1, threshold: 1, lowerIsBetter: true })).toBe(1.3);
    expect(dropBy({ current: 1.5, previous: 2.1, threshold: 0.1, lowerIsBetter: true })).toBeNull();
  });

  it("detects criticism spikes with a minimum count", () => {
    expect(isSpike({ current: 6, previous: 4, thresholdPct: 50 })).toBe(true);
    expect(isSpike({ current: 5, previous: 4, thresholdPct: 50 })).toBe(false);
    expect(isSpike({ current: 2, previous: 0, thresholdPct: 50 })).toBe(false);
    expect(isSpike({ current: 3, previous: 0, thresholdPct: 50 })).toBe(true);
  });

  it("detects bot error spikes (rate, sample size and rise)", () => {
    expect(isErrorSpike({ errors: 5, total: 40, prevErrors: 1, prevTotal: 40, thresholdPct: 10 }).spike).toBe(true);
    expect(isErrorSpike({ errors: 5, total: 40, prevErrors: 4, prevTotal: 40, thresholdPct: 10 }).spike).toBe(false); // +2.5 pp only
    expect(isErrorSpike({ errors: 5, total: 10, prevErrors: 0, prevTotal: 10, thresholdPct: 10 }).spike).toBe(false); // too few requests
    expect(isErrorSpike({ errors: 2, total: 40, prevErrors: 0, prevTotal: 40, thresholdPct: 10 }).spike).toBe(false); // 5% < 10%
  });

  it("computes relative change and severity", () => {
    expect(relativeChange(70, 100)).toBe(-30);
    expect(relativeChange(10, 0)).toBeNull();
    expect(magnitudeSeverity(-12, 10)).toBe("warning");
    expect(magnitudeSeverity(-20, 10)).toBe("critical");
  });
});

describe("kind catalogue", () => {
  it("applies defaults and clamps the window", () => {
    expect(resolveParams("visibility_drop", {})).toMatchObject({ threshold: 10, windowDays: 7 });
    expect(resolveParams("new_ad", { threshold: 5 }).threshold).toBeUndefined();
    expect(resolveParams("sov_drop", { windowDays: 500 }).windowDays).toBe(90);
    expect(resolveParams("sov_drop", { engines: [] }).engines).toBeUndefined();
  });

  it("describes rules for humans", () => {
    expect(describeRule("visibility_drop", { threshold: 12, windowDays: 14, engines: ["chatgpt", "perplexity"] })).toBe(
      "Drop of at least 12 pp · 14-day window · 2 engines",
    );
  });
});
