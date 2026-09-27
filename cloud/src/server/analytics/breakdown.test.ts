import { describe, expect, it } from "vitest";
import { buildBreakdown, campaignKey, conversionRate } from "./breakdown";

describe("conversionRate", () => {
  it("returns a percentage with one decimal, or null for nothing", () => {
    expect(conversionRate(1, 3)).toBe(33.3);
    expect(conversionRate(0, 10)).toBe(0);
    expect(conversionRate(2, 0)).toBeNull();
  });
});

describe("campaignKey", () => {
  it("joins source, campaign and content", () => {
    expect(campaignKey("x", "launch_sep26", "ad1_chatgpt_image")).toBe("x / launch_sep26 / ad1_chatgpt_image");
    expect(campaignKey("x", null, null)).toBe("x / – / –");
    expect(campaignKey(null, null, null)).toBeNull();
  });
});

describe("buildBreakdown", () => {
  it("merges visitors with accounts, checkouts and paid per key", () => {
    const rows = buildBreakdown({
      visitors: [
        ["Paid social", 120],
        ["Direct", 300],
        ["Organic search", 40],
      ],
      accounts: ["Paid social", "Paid social", "Direct", null, "Unknown"],
      checkouts: ["Paid social", "Direct"],
      paid: ["Paid social"],
    });
    expect(rows).toEqual([
      { key: "Paid social", visitors: 120, accounts: 2, checkouts: 1, paid: 1 },
      { key: "Direct", visitors: 300, accounts: 1, checkouts: 1, paid: 0 },
      { key: "Unknown", visitors: 0, accounts: 1, checkouts: 0, paid: 0 },
      { key: "Organic search", visitors: 40, accounts: 0, checkouts: 0, paid: 0 },
    ]);
  });
});
