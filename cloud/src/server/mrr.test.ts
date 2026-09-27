import { describe, expect, it } from "vitest";
import { invoiceNetCents, subscriptionMrr } from "./mrr";

const plan = (unit_amount: number, interval: "month" | "year", quantity = 1) => ({
  items: {
    data: [{ quantity, price: { unit_amount, recurring: { interval, interval_count: 1 } as never } }],
  },
});
const invoice = (net: number | null, subtotal = 0, discounts: number[] = []) => ({
  total_excluding_tax: net,
  subtotal,
  total_discount_amounts: discounts.map((amount) => ({ amount }) as never),
});

describe("subscriptionMrr", () => {
  it("uses the monthly invoice as is", () => {
    expect(subscriptionMrr(plan(5000, "month"), invoice(5000))).toEqual({ planInterval: "month", mrrCents: 5000 });
  });

  it("spreads a yearly invoice over 12 months, after the launch discount", () => {
    expect(subscriptionMrr(plan(60000, "year"), invoice(30000))).toEqual({ planInterval: "year", mrrCents: 2500 });
    expect(subscriptionMrr(plan(60000, "year"), invoice(60000))).toEqual({ planInterval: "year", mrrCents: 5000 });
  });

  it("counts a trial ($0 invoice) as 0", () => {
    expect(subscriptionMrr(plan(5000, "month"), invoice(0))).toEqual({ planInterval: "month", mrrCents: 0 });
  });

  it("falls back to price × quantity without an invoice", () => {
    expect(subscriptionMrr(plan(60000, "year", 2), null)).toEqual({ planInterval: "year", mrrCents: 10000 });
  });

  it("returns nulls without a recurring price", () => {
    expect(subscriptionMrr({ items: { data: [] } }, invoice(5000))).toEqual({ planInterval: null, mrrCents: null });
  });
});

describe("invoiceNetCents", () => {
  it("prefers total_excluding_tax, else subtotal minus discounts", () => {
    expect(invoiceNetCents(invoice(4200, 9999))).toBe(4200);
    expect(invoiceNetCents(invoice(null, 60000, [30000]))).toBe(30000);
    expect(invoiceNetCents(invoice(null, 1000, [2000]))).toBe(0);
  });
});
