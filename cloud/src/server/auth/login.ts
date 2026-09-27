import "server-only";
import { cookies } from "next/headers";
import { and, desc, eq, gt, isNull, lt, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { loginTokens, users } from "@/server/db/schema";
import { hmac, randomDigits, randomToken, sha256, timingSafeEqualStr } from "@/server/crypto";
import { env, isAdminEmail } from "@/server/env";
import { appUrl, getRequestMeta, safeNext } from "@/server/http";
import { rateLimit } from "@/server/rate-limit";
import { sendMail } from "@/server/email";
import { magicLinkEmail } from "@/server/email/templates";
import { logEvent } from "@/server/events";
import { getSetting, isSmtpConfigured } from "@/server/settings";
import { rateLimitIpKey } from "@/server/ip";
import { signupAttribution } from "@/server/analytics/store";
import { attributionSummary } from "@/server/analytics/attribution";
import { CONVERSION_COOKIE, CONVERSION_MAX_AGE_S, cookieName, readConsentCookie } from "@/lib/consent";
import { createSession } from "./session";
import { maskEmail } from "./mask-email";

const LINK_MINUTES = 20;
const MAX_CODE_ATTEMPTS = 5;
/** Wrong codes per email per 24 h, across all tokens (stored in the database, so it survives restarts). */
const DAILY_CODE_ATTEMPTS = 20;
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
let lastGlobalLimitLog = 0;
// "{", "}", "$" and backticks are rejected: the email ends up in a customer instance's environment, where they are
// template syntax for Coolify ({{team.X}}) and Compose (${X}).
const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"{}$`]+@[^\s@<>()[\]\\,;:"{}$`]+\.[^\s@<>()[\]\\,;:"{}$`]{2,}$/;

export function normalizeEmail(raw: string): string {
  return String(raw ?? "").trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return email.length <= 254 && EMAIL_PATTERN.test(email);
}

export type LoginRequestResult =
  | { ok: true; email: string; transport: "smtp" | "log"; throttled?: boolean }
  | { ok: false; error: string };

/** Step 1: email a magic link + 6-digit code. Anyone may sign up; the account is created on first verified sign-in. */
export async function requestLogin(rawEmail: string, next: string | null, mode: "login" | "signup"): Promise<LoginRequestResult> {
  const email = normalizeEmail(rawEmail);
  if (!isValidEmail(email)) return { ok: false, error: "Please enter a valid email address." };

  const { ip, userAgent } = await getRequestMeta();
  if (!rateLimit(`login:ip:${rateLimitIpKey(ip)}`, 20, HOUR)) {
    return { ok: false, error: "Too many sign-in emails requested. Please wait a while and try again." };
  }
  if (!rateLimit(`login:email:${email}`, 5, HOUR)) {
    // Don't send another email, but let the person use the link or code they already have.
    const transport = isSmtpConfigured(await getSetting("smtp")) ? "smtp" : "log";
    return { ok: true, email, transport, throttled: true };
  }
  // The client IP can be spoofed when the origin is reached without Cloudflare: cap total sends to protect
  // the sender reputation of the SMTP server.
  if (!rateLimit("login:global", 300, HOUR)) {
    console.error("[auth] ALERT: global sign-in email limit (300/h) reached — possible abuse, no more sign-in emails are sent");
    if (Date.now() - lastGlobalLimitLog > 10 * 60 * 1000) {
      lastGlobalLimitLog = Date.now();
      await logEvent("auth.global_limit_reached", { data: { limitPerHour: 300, ip } });
    }
    return { ok: false, error: "We're receiving a lot of sign-in requests right now. Please try again in a few minutes." };
  }

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  const token = randomToken(32);
  const code = randomDigits(6);
  await db.insert(loginTokens).values({
    email,
    tokenHash: sha256(token),
    codeHash: hmac(`${email}:${code}`, "login-code"),
    redirectTo: safeNext(next),
    requestIp: ip,
    // Which channel/campaign brought a new account (from this browser's page views; never fails the sign-in).
    attribution: existing ? null : await signupAttribution(ip, userAgent),
    expiresAt: new Date(Date.now() + LINK_MINUTES * 60 * 1000),
  });

  const mail = magicLinkEmail({
    url: appUrl(`/auth/verify?token=${encodeURIComponent(token)}`),
    code,
    minutes: LINK_MINUTES,
    signup: mode === "signup" && !existing,
    ip,
  });
  const result = await sendMail({ to: email, ...mail });
  await logEvent("auth.login_requested", { userId: existing?.id, data: { email, transport: result.transport, delivered: result.delivered } });
  if (result.transport === "smtp" && !result.delivered) {
    return { ok: false, error: "We couldn't send the email right now. Please try again in a moment." };
  }
  return { ok: true, email, transport: result.transport };
}

type VerifyResult = { ok: true; redirectTo: string } | { ok: false; error: string };

async function completeLogin(row: typeof loginTokens.$inferSelect): Promise<VerifyResult> {
  // Single use, atomically: two concurrent verifications can't both win.
  const [claimed] = await db
    .update(loginTokens)
    .set({ usedAt: new Date() })
    .where(and(eq(loginTokens.id, row.id), isNull(loginTokens.usedAt)))
    .returning({ id: loginTokens.id });
  if (!claimed) return { ok: false, error: "This sign-in link or code was already used." };

  const admin = isAdminEmail(row.email);
  const [created] = await db
    .insert(users)
    .values({ email: row.email, isAdmin: admin, attribution: row.attribution })
    .onConflictDoNothing({ target: users.email })
    .returning();
  const user = created ?? (await db.select().from(users).where(eq(users.email, row.email)).limit(1))[0];
  if (!user) return { ok: false, error: "Sign-in failed. Please try again." };
  if (user.isAdmin !== admin) await db.update(users).set({ isAdmin: admin }).where(eq(users.id, user.id));

  await createSession(user.id);
  await logEvent(created ? "auth.signup" : "auth.login", {
    userId: user.id,
    data: { email: user.email, ...(created ? attributionSummary(row.attribution) : {}) },
  });
  if (created) await flagSignupConversion();
  // Invalidate any other outstanding links/codes for this email.
  await db
    .update(loginTokens)
    .set({ usedAt: new Date() })
    .where(and(eq(loginTokens.email, row.email), isNull(loginTokens.usedAt)));
  return { ok: true, redirectTo: safeNext(row.redirectTo) ?? "/dashboard" };
}

/**
 * Only for visitors who allowed X conversion tracking: a 10-minute marker that makes the next page report the sign-up
 * to X (components/analytics/consent.tsx). Without that consent nothing is set.
 */
async function flagSignupConversion(): Promise<void> {
  const jar = await cookies();
  if (readConsentCookie((name) => jar.get(name)?.value, !env.isLocal).x !== true) return;
  jar.set(cookieName(CONVERSION_COOKIE, !env.isLocal), "lead", { path: "/", sameSite: "lax", secure: !env.isLocal, maxAge: CONVERSION_MAX_AGE_S });
}

/** Step 2a: the magic link was opened and confirmed on this device. */
export async function verifyLoginToken(token: string): Promise<VerifyResult> {
  if (!token || token.length > 200) return { ok: false, error: "This sign-in link is invalid." };
  const hash = sha256(token);
  const [row] = await db.select().from(loginTokens).where(eq(loginTokens.tokenHash, hash)).limit(1);
  if (!row || !timingSafeEqualStr(row.tokenHash, hash) || row.usedAt) {
    return { ok: false, error: "This sign-in link is invalid or was already used." };
  }
  if (row.expiresAt < new Date()) return { ok: false, error: "This sign-in link has expired. Request a new one." };
  return completeLogin(row);
}

/** Step 2b: the 6-digit code was typed on the device that requested it. */
export async function verifyLoginCode(rawEmail: string, rawCode: string): Promise<VerifyResult> {
  const email = normalizeEmail(rawEmail);
  const code = String(rawCode ?? "").replace(/\s+/g, "");
  if (!/^\d{6}$/.test(code)) return { ok: false, error: "Enter the 6-digit code from the email." };
  const { ip } = await getRequestMeta();
  if (!rateLimit(`code:ip:${rateLimitIpKey(ip)}`, 30, HOUR) || !rateLimit(`code:email:${email}`, 10, HOUR)) {
    return { ok: false, error: "Too many attempts. Please request a new sign-in email later." };
  }
  const [daily] = await db
    .select({ attempts: sql<number>`coalesce(sum(${loginTokens.attempts}), 0)::int` })
    .from(loginTokens)
    .where(and(eq(loginTokens.email, email), gt(loginTokens.createdAt, new Date(Date.now() - DAY))));
  if ((daily?.attempts ?? 0) >= DAILY_CODE_ATTEMPTS) {
    return { ok: false, error: "Too many code attempts today. Use the sign-in link from the email instead." };
  }
  const [row] = await db
    .select()
    .from(loginTokens)
    .where(and(eq(loginTokens.email, email), isNull(loginTokens.usedAt), gt(loginTokens.expiresAt, new Date())))
    .orderBy(desc(loginTokens.createdAt))
    .limit(1);
  if (!row) return { ok: false, error: "The code is invalid or has expired." };
  // Reserve an attempt atomically *before* comparing so parallel guesses can't share one attempt.
  const [reserved] = await db
    .update(loginTokens)
    .set({ attempts: sql`${loginTokens.attempts} + 1` })
    .where(and(eq(loginTokens.id, row.id), lt(loginTokens.attempts, MAX_CODE_ATTEMPTS), isNull(loginTokens.usedAt)))
    .returning({ id: loginTokens.id });
  if (!reserved) return { ok: false, error: "Too many wrong codes. Request a new sign-in email." };
  if (!timingSafeEqualStr(row.codeHash, hmac(`${email}:${code}`, "login-code"))) {
    return { ok: false, error: "That code is incorrect." };
  }
  return completeLogin(row);
}

/**
 * For the confirm page: which account a magic link signs into (masked), without consuming it.
 * Null for unknown, used or expired links.
 */
export async function peekLoginToken(token: string): Promise<{ maskedEmail: string } | null> {
  if (!token || token.length > 200) return null;
  const hash = sha256(token);
  const [row] = await db
    .select({ email: loginTokens.email, tokenHash: loginTokens.tokenHash, usedAt: loginTokens.usedAt, expiresAt: loginTokens.expiresAt })
    .from(loginTokens)
    .where(eq(loginTokens.tokenHash, hash))
    .limit(1);
  if (!row || !timingSafeEqualStr(row.tokenHash, hash) || row.usedAt || row.expiresAt < new Date()) return null;
  return { maskedEmail: maskEmail(row.email) };
}

/** Housekeeping (reconciler): drop sign-in tokens that expired more than a day ago. */
export async function purgeExpiredLoginTokens(): Promise<void> {
  await db.delete(loginTokens).where(lt(loginTokens.expiresAt, new Date(Date.now() - 24 * 60 * 60 * 1000)));
}
