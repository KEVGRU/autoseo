import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { billingReturnTarget, decodePurchaseCookie, encodePurchaseCookie, purchaseConversion } from "./conversions";

const opaque = (id: string) => crypto.createHmac("sha256", "test-key").update(`x-conversion:${id}`).digest("hex");

const session = (over: Partial<Parameters<typeof purchaseConversion>[0]> = {}) => ({
  id: "cs_live_a1B2c3",
  client_reference_id: "usr_1",
  status: "complete" as const,
  payment_status: "paid" as const,
  amount_subtotal: 60000,
  total_details: { amount_discount: 30000, amount_shipping: 0, amount_tax: 5700 },
  currency: "usd",
  ...over,
});

describe("purchaseConversion", () => {
  it("reports the net value after discounts, excluding tax", () => {
    const conversion = purchaseConversion(session(), "usr_1", opaque);
    expect(conversion).toMatchObject({ value: 300, currency: "USD" });
    expect(purchaseConversion(session({ amount_subtotal: 5000, total_details: null }), "usr_1", opaque)?.value).toBe(50);
  });

  it("uses an opaque, deterministic id instead of the Stripe session id", () => {
    const a = purchaseConversion(session(), "usr_1", opaque)!;
    expect(a.conversionId).toMatch(/^[0-9a-f]{64}$/);
    expect(a.conversionId).not.toContain("cs_");
    expect(purchaseConversion(session(), "usr_1", opaque)!.conversionId).toBe(a.conversionId);
    expect(purchaseConversion(session({ id: "cs_live_other" }), "usr_1", opaque)!.conversionId).not.toBe(a.conversionId);
  });

  it("ignores other users' and unpaid sessions (trials, 100% discounts)", () => {
    expect(purchaseConversion(session(), "usr_2", opaque)).toBeNull();
    expect(purchaseConversion(session({ status: "open" }), "usr_1", opaque)).toBeNull();
    expect(purchaseConversion(session({ payment_status: "no_payment_required" }), "usr_1", opaque)).toBeNull();
  });
});

describe("purchase cookie", () => {
  const sign = (payload: string) => crypto.createHmac("sha256", "test-key").update(`x-purchase-cookie:${payload}`).digest("hex");
  const conversion = () => purchaseConversion(session(), "usr_1", opaque)!;

  it("round-trips a signed conversion for its account", () => {
    const value = encodePurchaseCookie(conversion(), "usr_1", sign);
    expect(decodePurchaseCookie(value, "usr_1", sign)).toEqual(conversion());
  });

  it("rejects unsigned, re-signed, tampered and other accounts' cookies", () => {
    const value = encodePurchaseCookie(conversion(), "usr_1", sign);
    const [payload] = value.split(".");
    const forge = (data: unknown) => {
      const p = Buffer.from(JSON.stringify(data)).toString("base64url");
      return `${p}.${sign(p)}`;
    };
    expect(decodePurchaseCookie(payload, "usr_1", sign)).toBeNull();
    expect(decodePurchaseCookie(`${payload}.${"0".repeat(64)}`, "usr_1", sign)).toBeNull();
    const otherKey = (p: string) => crypto.createHmac("sha256", "attacker").update(p).digest("hex");
    expect(decodePurchaseCookie(encodePurchaseCookie(conversion(), "usr_1", otherKey), "usr_1", sign)).toBeNull();
    const tampered = Buffer.from(JSON.stringify({ ...conversion(), value: 99999, u: "usr_1" })).toString("base64url");
    expect(decodePurchaseCookie(`${tampered}.${value.split(".")[1]}`, "usr_1", sign)).toBeNull();
    expect(decodePurchaseCookie(value, "usr_2", sign)).toBeNull();
    // Even correctly signed, the content is validated.
    expect(decodePurchaseCookie(forge({ conversionId: "cs_live_a1B2c3", value: 300, currency: "USD", u: "usr_1" }), "usr_1", sign)).toBeNull();
    expect(decodePurchaseCookie(forge({ conversionId: "a".repeat(64), value: -1, currency: "USD", u: "usr_1" }), "usr_1", sign)).toBeNull();
    expect(decodePurchaseCookie("not a cookie", "usr_1", sign)).toBeNull();
    expect(decodePurchaseCookie(null, "usr_1", sign)).toBeNull();
  });
});

describe("billingReturnTarget", () => {
  it("never passes the session id on", () => {
    expect(billingReturnTarget(true)).toBe("/dashboard?checkout=success");
    expect(billingReturnTarget(false)).toBe("/login?next=%2Fdashboard");
  });
});
