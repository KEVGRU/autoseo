/** Ad-network conversions (pure, unit tested). Only sent to a network when the visitor consented (consent.tsx). */
import crypto from "node:crypto";
import type Stripe from "stripe";

export type PurchaseConversion = { conversionId: string; value: number; currency: string };

type PaidSession = Pick<
  Stripe.Checkout.Session,
  "id" | "client_reference_id" | "status" | "payment_status" | "amount_subtotal" | "total_details" | "currency"
>;

/**
 * A paid Checkout Session of this user as a purchase conversion: value excluding tax, after discounts. The id is
 * `opaqueId(session.id)` (an HMAC), so the Stripe session id never leaves our servers; it is deterministic, so the
 * network dedupes repeats. Null for someone else's, unfinished or unpaid (trial, 100% discount) sessions.
 */
export function purchaseConversion(session: PaidSession, userId: string, opaqueId: (sessionId: string) => string): PurchaseConversion | null {
  if (session.client_reference_id !== userId || session.status !== "complete" || session.payment_status !== "paid") return null;
  const cents = (session.amount_subtotal ?? 0) - (session.total_details?.amount_discount ?? 0);
  return { conversionId: opaqueId(session.id), value: Math.max(0, cents) / 100, currency: (session.currency ?? "usd").toUpperCase() };
}

/** Signs a cookie payload (the server passes an HMAC with its master key). */
export type Signer = (payload: string) => string;
/** HMAC purpose of the purchase cookie's signature. */
export const PURCHASE_SIGNATURE = "x-purchase-cookie";

/** Cookie value for a pending purchase conversion: base64url JSON (bound to the account) plus its signature. */
export function encodePurchaseCookie(conversion: PurchaseConversion, userId: string, sign: Signer): string {
  const payload = Buffer.from(JSON.stringify({ ...conversion, u: userId })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/**
 * A pending purchase conversion from its cookie — only with a valid signature and for this account, so nobody can
 * report (or flood the audit log with) purchases by writing the cookie themselves. Null for anything else.
 */
export function decodePurchaseCookie(value: string | null | undefined, userId: string, sign: Signer): PurchaseConversion | null {
  if (!value || value.length > 700) return null;
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = value.slice(0, dot);
  const mac = Buffer.from(value.slice(dot + 1));
  const expected = Buffer.from(sign(payload));
  if (mac.length !== expected.length || !crypto.timingSafeEqual(mac, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<PurchaseConversion> & { u?: unknown };
    if (data.u !== userId) return null;
    if (typeof data.conversionId !== "string" || !/^[0-9a-f]{64}$/.test(data.conversionId)) return null;
    if (typeof data.value !== "number" || !Number.isFinite(data.value) || data.value < 0) return null;
    if (typeof data.currency !== "string" || !/^[A-Z]{3}$/.test(data.currency)) return null;
    return { conversionId: data.conversionId, value: data.value, currency: data.currency };
  } catch {
    return null;
  }
}

/** Where the Stripe success return (/api/billing/return) sends the browser. Never carries the session id on. */
export function billingReturnTarget(signedIn: boolean): string {
  return signedIn ? "/dashboard?checkout=success" : "/login?next=%2Fdashboard";
}
