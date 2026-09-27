import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { env, isSharedCloud } from "@/server/env";
import { createSession, getRequestMeta } from "@/server/auth/session";
import { normalizeEmail } from "@/server/auth/domains";
import { safeNext } from "@/server/auth/login";
import { claimSsoNonce, verifySsoToken } from "@/server/auth/sso";
import { isSsoEnforcedFor } from "@/server/auth/oidc/providers";
import { startOidcLogin } from "@/server/auth/oidc/flow";
import { rateLimit } from "@/server/rate-limit";
import { logAudit } from "@/server/audit";

/** One-click sign-in from the AutoSEO Cloud dashboard (only when AUTOSEO_SSO_SECRET is set). */
export async function GET(request: NextRequest) {
  const fail = () => NextResponse.redirect(new URL("/login?error=sso", env.appUrl));
  const secret = env.bootstrap.ssoSecret;
  if (!secret || secret.length < 32) return fail();
  const { ip } = await getRequestMeta();
  if (!rateLimit(`sso:${ip ?? "unknown"}`, 30, 60 * 60 * 1000)) return fail();

  const claims = verifySsoToken(secret, request.nextUrl.searchParams.get("token") ?? "");
  if (!claims || !claimSsoNonce(claims.nonce, claims.exp)) return fail();

  const email = normalizeEmail(claims.email);
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || user.status !== "active") return fail();
  // Shared cloud: the cloud signs for customers only — the operator's admin accounts sign in with email.
  if (isSharedCloud() && user.isInstanceAdmin) return fail();

  // A workspace that enforces its own SSO for this domain: go through the identity provider instead.
  if (await isSsoEnforcedFor(email)) {
    try {
      return NextResponse.redirect(await startOidcLogin({ email, next: claims.next }));
    } catch {
      return NextResponse.redirect(new URL("/login?error=oidc&reason=provider_unavailable", env.appUrl));
    }
  }

  await createSession(user.id);
  void logAudit("auth.login", { actor: { id: user.id, email }, meta: { via: "cloud-sso" } });
  return NextResponse.redirect(new URL(safeNext(claims.next) ?? "/", env.appUrl));
}
