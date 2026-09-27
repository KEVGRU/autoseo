import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/server/env";
import { auditSsoFailure, completeOidcLogin } from "@/server/auth/oidc/flow";
import { OidcFlowError } from "@/server/auth/oidc/protocol";

/**
 * GET /api/auth/oidc/callback — the only redirect URI registered at identity providers
 * (`<app url>/api/auth/oidc/callback`). Errors land on /login with a reason code (no IdP details).
 */
export async function GET(request: NextRequest) {
  try {
    const { redirectTo } = await completeOidcLogin(new URL(request.url));
    return NextResponse.redirect(new URL(redirectTo, env.appUrl), { headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
  } catch (err) {
    const reason = err instanceof OidcFlowError ? err.reason : "error";
    if (!(err instanceof OidcFlowError)) console.error("[oidc] callback failed", err);
    auditSsoFailure(reason, err instanceof OidcFlowError && reason !== "idp_error" ? err.message : undefined);
    const login = new URL("/login", env.appUrl);
    login.searchParams.set("error", "oidc");
    login.searchParams.set("reason", reason);
    return NextResponse.redirect(login, { headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
  }
}
