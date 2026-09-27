"use server";

import { cookies } from "next/headers";
import { getCurrentSession } from "@/server/auth/session";
import { hmac } from "@/server/crypto";
import { env } from "@/server/env";
import { logEventOnce } from "@/server/events";
import { PURCHASE_SIGNATURE, decodePurchaseCookie, type PurchaseConversion } from "@/server/analytics/conversions";
import { PURCHASE_COOKIE, cookieName, readConsentCookie } from "@/lib/consent";

/**
 * The dashboard's pending purchase conversion (signed cookie from /api/billing/return): read and deleted here, and
 * claimed once per conversion id (audit event "x.purchase_conversion"), so a reload or an old link can't report it
 * again. Unsigned, foreign or tampered cookies are dropped without an audit entry. Null when there is nothing (new)
 * to report or the visitor hasn't allowed X conversion tracking.
 */
export async function claimPurchaseConversionAction(): Promise<PurchaseConversion | null> {
  const jar = await cookies();
  const name = cookieName(PURCHASE_COOKIE, !env.isLocal);
  const raw = jar.get(name)?.value;
  if (jar.has(name)) jar.delete({ name, path: "/", secure: !env.isLocal, httpOnly: true, sameSite: "lax" });
  const current = await getCurrentSession();
  if (!raw || !current) return null;
  const conversion = decodePurchaseCookie(raw, current.user.id, (payload) => hmac(payload, PURCHASE_SIGNATURE));
  if (!conversion || readConsentCookie((n) => jar.get(n)?.value, !env.isLocal).x !== true) return null;
  const claimed = await logEventOnce("x.purchase_conversion", "conversionId", { userId: current.user.id, data: { ...conversion } });
  return claimed ? conversion : null;
}
