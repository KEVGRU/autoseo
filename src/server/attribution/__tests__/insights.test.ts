import { describe, expect, it } from "vitest";
import {
  computeHiddenAiRevenue,
  computeResponseRate,
  computeVisibilityCorrelation,
  correlationStrength,
  pearson,
  type HiddenAiRevenueInput,
} from "../insights";

const base: HiddenAiRevenueInput = {
  currency: "EUR",
  responses: 200,
  aiResponses: 30,
  orders: 1000,
  valuedOrders: 1000,
  orderRevenue: 80_000,
  analyticsAiRevenue: 2_000,
  analyticsCurrency: "EUR",
  analyticsSource: "Google Analytics",
};

describe("computeHiddenAiRevenue", () => {
  it("estimates survey share × orders × AOV minus analytics AI revenue", () => {
    const r = computeHiddenAiRevenue(base);
    expect(r.surveyAiShare).toBe(15);
    expect(r.aov).toBe(80);
    expect(r.estimatedAiRevenue).toBe(12_000);
    expect(r.value).toBe(10_000);
    expect(r.reason).toBeNull();
  });
  it("floors at zero when analytics already sees more AI revenue", () => {
    expect(computeHiddenAiRevenue({ ...base, analyticsAiRevenue: 50_000 }).value).toBe(0);
  });
  it("uses only valued orders for the AOV but all orders for volume", () => {
    const r = computeHiddenAiRevenue({ ...base, valuedOrders: 500, orderRevenue: 50_000 });
    expect(r.aov).toBe(100);
    expect(r.estimatedAiRevenue).toBe(15_000);
  });
  it("explains why it cannot compute", () => {
    expect(computeHiddenAiRevenue({ ...base, responses: 0, aiResponses: 0 }).value).toBeNull();
    expect(computeHiddenAiRevenue({ ...base, orders: 0, valuedOrders: 0, orderRevenue: 0 }).reason).toMatch(/orders/);
    expect(computeHiddenAiRevenue({ ...base, valuedOrders: 0, orderRevenue: 0 }).reason).toMatch(/order value/);
    const mismatch = computeHiddenAiRevenue({ ...base, analyticsCurrency: "USD" });
    expect(mismatch.value).toBeNull();
    expect(mismatch.currencyMismatch).toBe(true);
    expect(mismatch.estimatedAiRevenue).toBe(12_000);
  });
  it("subtracts nothing without an analytics source and says so", () => {
    const r = computeHiddenAiRevenue({ ...base, analyticsAiRevenue: null, analyticsCurrency: null, analyticsSource: null });
    expect(r.value).toBe(12_000);
    expect(r.reason).toMatch(/analytics/i);
  });
});

describe("computeResponseRate", () => {
  it("divides answered orders by orders", () => {
    expect(computeResponseRate({ orders: 400, answeredOrders: 100, responses: 150 }).value).toBe(25);
  });
  it("is null without orders and never exceeds 100%", () => {
    expect(computeResponseRate({ orders: 0, answeredOrders: 0, responses: 3 }).value).toBeNull();
    expect(computeResponseRate({ orders: 2, answeredOrders: 5, responses: 5 }).value).toBe(100);
  });
});

describe("pearson", () => {
  it("returns 1 / -1 for perfectly (anti-)correlated series", () => {
    expect(pearson([1, 2, 3, 4], [2, 4, 6, 8])).toBeCloseTo(1);
    expect(pearson([1, 2, 3, 4], [8, 6, 4, 2])).toBeCloseTo(-1);
  });
  it("is null for zero variance or too few points", () => {
    expect(pearson([1, 1, 1], [1, 2, 3])).toBeNull();
    expect(pearson([1], [1])).toBeNull();
  });
  it("classifies strength", () => {
    expect(correlationStrength(0.8)).toBe("strong");
    expect(correlationStrength(-0.4)).toBe("moderate");
    expect(correlationStrength(0.15)).toBe("weak");
    expect(correlationStrength(0.02)).toBe("none");
    expect(correlationStrength(null)).toBeNull();
  });
});

describe("computeVisibilityCorrelation", () => {
  const days = Array.from({ length: 10 }, (_, i) => `2026-09-${String(i + 1).padStart(2, "0")}`);
  it("needs at least 7 paired days", () => {
    const vis = days.slice(0, 6).map((date, i) => ({ date, visibility: 10 + i }));
    const r = computeVisibilityCorrelation(vis, []);
    expect(r.responses).toBeNull();
    expect(r.pairedDays).toBe(6);
  });
  it("skips days without tracking and counts missing responses as 0", () => {
    const vis = days.map((date, i) => ({ date, visibility: i === 3 ? null : 10 + i * 2 }));
    const daily = days.map((date, i) => ({ date, aiResponses: i, aiRevenue: i * 100 }));
    const r = computeVisibilityCorrelation(vis, daily);
    expect(r.pairedDays).toBe(9);
    expect(r.responses).toBeCloseTo(1);
    expect(r.revenue).toBeCloseTo(1);
    expect(r.strength).toBe("strong");
  });
});
