import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/server/env";
import { auditSsoFailure, startOidcLogin } from "@/server/auth/oidc/flow";
import { OidcFlowError } from "@/server/auth/oidc/protocol";

/**
 * GET /api/auth/oidc/start?email=…&next=… (provider chosen by the email's domain) or ?provider=instance.
 * Sets the sealed flow-state cookie and redirects to the identity provider.
 */
export async function GET(request: NextRequest) {
  // Only flows started from this app (sign-in page, bookmarks): a cross-site link must not be able to sign a
  // visitor into an account of the link author's choosing (login CSRF through an IdP the attacker controls).
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") {
    return NextResponse.redirect(new URL("/login", env.appUrl), { headers: { "Cache-Control": "no-store" } });
  }
  const q = request.nextUrl.searchParams;
  const email = q.get("email")?.slice(0, 320) ?? null;
  const providerKey = q.get("provider")?.slice(0, 64) ?? null;
  const next = q.get("next")?.slice(0, 2048) ?? null;
  try {
    const url = await startOidcLogin({ email, providerKey, next });
    return NextResponse.redirect(url, { headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
  } catch (err) {
    const reason = err instanceof OidcFlowError ? err.reason : "provider_unavailable";
    if (!(err instanceof OidcFlowError)) console.error("[oidc] start failed", err);
    auditSsoFailure(reason);
    const login = new URL("/login", env.appUrl);
    login.searchParams.set("error", "oidc");
    login.searchParams.set("reason", reason);
    return NextResponse.redirect(login, { headers: { "Cache-Control": "no-store" } });
  }
}
