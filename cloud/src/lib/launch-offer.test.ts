import { describe, expect, it } from "vitest";
import { formatUsd, isLaunchOfferOpen, launchOffer, offerStatus, parseBillingPlan, spotsLeft, timeLeft } from "./launch-offer";

describe("launchOffer", () => {
  it("halves the first year of the yearly plan", () => {
    expect(launchOffer.regularYearlyUsd).toBe(600);
    expect(launchOffer.firstYearUsd).toBe(300);
    expect(launchOffer.monthlyEquivalentUsd).toBe(25);
    expect(launchOffer.savingsUsd).toBe(300);
  });

  it("ends at the end of Sep 30 (US Pacific)", () => {
    expect(new Date(launchOffer.endsAtMs).toISOString()).toBe("2026-10-01T06:59:59.000Z");
  });
});

describe("isLaunchOfferOpen", () => {
  const before = Date.parse("2026-09-28T12:00:00Z");
  const after = Date.parse("2026-10-01T07:00:00Z");

  it("is open before the deadline while spots are left or unknown", () => {
    expect(isLaunchOfferOpen(before)).toBe(true);
    expect(isLaunchOfferOpen(before, null)).toBe(true);
    expect(isLaunchOfferOpen(before, 1)).toBe(true);
  });

  it("closes when the spots are gone or the deadline has passed", () => {
    expect(isLaunchOfferOpen(before, 0)).toBe(false);
    expect(isLaunchOfferOpen(after)).toBe(false);
    expect(isLaunchOfferOpen(after, 50)).toBe(false);
  });

  it("builds the public status", () => {
    expect(offerStatus(before, 42)).toEqual({ open: true, endsAt: launchOffer.endsAt, spotsLeft: 42, spotsTotal: 100 });
  });
});

describe("spotsLeft", () => {
  it("counts down from the cap and never goes below zero", () => {
    expect(spotsLeft(0)).toBe(100);
    expect(spotsLeft(37)).toBe(63);
    expect(spotsLeft(100)).toBe(0);
    expect(spotsLeft(120)).toBe(0);
    expect(spotsLeft(-1)).toBe(100);
  });
});

describe("parseBillingPlan", () => {
  it("accepts only known plans", () => {
    expect(parseBillingPlan("yearly")).toBe("yearly");
    expect(parseBillingPlan("monthly")).toBe("monthly");
    expect(parseBillingPlan("weekly")).toBeNull();
    expect(parseBillingPlan(undefined)).toBeNull();
    expect(parseBillingPlan(["yearly"])).toBeNull();
  });
});

describe("timeLeft", () => {
  it("splits the remaining time and stops at zero", () => {
    const now = Date.parse("2026-09-27T00:00:00Z");
    expect(timeLeft(now + ((2 * 24 + 3) * 3600 + 4 * 60 + 5) * 1000, now)).toEqual({ days: 2, hours: 3, minutes: 4, seconds: 5 });
    expect(timeLeft(now - 1000, now)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });
});

describe("formatUsd", () => {
  it("drops cents for whole amounts", () => {
    expect(formatUsd(300)).toBe("$300");
    expect(formatUsd(25)).toBe("$25");
    expect(formatUsd(12.5)).toBe("$12.50");
  });
});
