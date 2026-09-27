import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentSession } from "@/server/auth/session";
import { hmac } from "@/server/crypto";
import { env } from "@/server/env";
import { appUrl } from "@/server/http";
import { processCheckoutRedirect } from "@/server/stripe";
import { PURCHASE_SIGNATURE, billingReturnTarget, encodePurchaseCookie, purchaseConversion } from "@/server/analytics/conversions";
import { CONVERSION_MAX_AGE_S, PURCHASE_COOKIE, cookieName, readConsentCookie } from "@/lib/consent";

export const dynamic = "force-dynamic";

/**
 * Stripe Checkout's success URL (`?session_id={CHECKOUT_SESSION_ID}`). Processes the checkout (the webhook may be
 * slower) and continues to /dashboard?checkout=success, so the session id never sits in a page's address. For a
 * visitor who allowed X conversion tracking, a paid checkout is left for the dashboard in a 10-minute HttpOnly
 * cookie with an opaque id (never the session id); the dashboard reports it to X once.
 */
export async function GET(req: Request) {
  const current = await getCurrentSession();
  if (!current) return NextResponse.redirect(appUrl(billingReturnTarget(false)), 303);
  const sessionId = new URL(req.url).searchParams.get("session_id") ?? "";
  const checkout = await processCheckoutRedirect(sessionId, current.user.id);
  const res = NextResponse.redirect(appUrl(billingReturnTarget(true)), 303);
  res.headers.set("Cache-Control", "no-store");
  const jar = await cookies();
  if (checkout && readConsentCookie((name) => jar.get(name)?.value, !env.isLocal).x === true) {
    const conversion = purchaseConversion(checkout, current.user.id, (id) => hmac(id, "x-conversion"));
    if (conversion) {
      const value = encodePurchaseCookie(conversion, current.user.id, (payload) => hmac(payload, PURCHASE_SIGNATURE));
      res.cookies.set(cookieName(PURCHASE_COOKIE, !env.isLocal), value, {
        httpOnly: true,
        secure: !env.isLocal,
        sameSite: "lax",
        path: "/",
        maxAge: CONVERSION_MAX_AGE_S,
      });
    }
  }
  return res;
}
