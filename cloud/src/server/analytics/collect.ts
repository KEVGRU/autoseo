/**
 * Input rules of the cookieless statistics collector (POST /api/e): payload validation and normalization, bot and
 * device detection, the daily visitor hash. Pure, so it can be unit tested.
 */
import crypto from "node:crypto";
import { z } from "zod";
import { CLICK_SOURCES, type ClickSource } from "@/lib/ad-params";
import { normalizeReferrerHost } from "./channels";

export const MAX_BODY_BYTES = 2048;
/** Events the browser may send. `ai_check` is recorded by the server itself. */
export const CLIENT_EVENTS = [
  "pageview",
  "cta_signup",
  "outbound_github",
  "self_host_copy",
  "launch_offer_click",
  "consent_x_granted",
  "consent_x_denied",
] as const;
/** Signed-in, auth and API areas are never recorded. */
const UNTRACKED_PATH = /^\/(?:admin|dashboard|auth|api)(?:\/|$)/;

const utmValue = z.string().max(500).optional();
const propValue = z.union([z.string().max(200), z.number(), z.boolean()]);

const Payload = z.object({
  n: z.enum(CLIENT_EVENTS),
  p: z.string().min(1).max(2000),
  r: z.string().max(500).optional(),
  u: z.object({ source: utmValue, medium: utmValue, campaign: utmValue, content: utmValue, term: utmValue }).optional(),
  c: z.enum(CLICK_SOURCES).optional(),
  props: z
    .record(z.string().regex(/^[a-z_]{1,24}$/), propValue)
    .refine((o) => Object.keys(o).length <= 8)
    .optional(),
});

export type Utm = { source: string | null; medium: string | null; campaign: string | null; content: string | null; term: string | null };

export type CollectInput = {
  name: string;
  path: string;
  referrerHost: string | null;
  utm: Utm;
  clickSource: ClickSource | null;
  props: Record<string, string | number | boolean> | null;
};

/** Pathname only (no query or fragment), without a trailing slash, at most 300 characters. */
export function normalizePath(raw: string): string | null {
  const path = raw.split(/[?#]/, 1)[0]!.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  const trimmed = path.length > 1 ? path.replace(/\/+$/, "") || "/" : path;
  return trimmed.slice(0, 300);
}

export function isTrackedPath(path: string): boolean {
  return !UNTRACKED_PATH.test(path);
}

/** Path of a same-site `Referer` (the page a server-side interaction was started from), or null. */
export function refererPath(referer: string | null | undefined, ownHosts: readonly string[]): string | null {
  if (!referer) return null;
  try {
    const url = new URL(referer);
    if (!ownHosts.some((h) => normalizeReferrerHost(h) === normalizeReferrerHost(url.host))) return null;
    const path = normalizePath(url.pathname);
    return path && isTrackedPath(path) ? path : null;
  } catch {
    return null;
  }
}

/**
 * utm_* value: trimmed, lowercased, whitespace collapsed, at most 100 characters. Values with characters outside
 * a-z 0-9 . _ - + and space are dropped (null), as are empty ones.
 */
export function normalizeUtm(raw: string | null | undefined): string | null {
  const value = (raw ?? "").replace(/\s+/g, " ").trim().toLowerCase().slice(0, 100).trim();
  return value && /^[a-z0-9._\-+ ]+$/.test(value) ? value : null;
}

/**
 * Validates and normalizes a browser payload. Null when it is malformed, names a server-only event, or is for a
 * path that is never recorded. Referrers, utm_* and click sources are only kept for page views.
 */
export function parseCollectPayload(json: unknown): CollectInput | null {
  const parsed = Payload.safeParse(json);
  if (!parsed.success) return null;
  const { n, p, r, u, c, props } = parsed.data;
  const path = normalizePath(p);
  if (!path || !isTrackedPath(path)) return null;
  const pageview = n === "pageview";
  const cleanProps = props
    ? Object.fromEntries(Object.entries(props).map(([k, v]) => [k, typeof v === "string" ? v.trim().slice(0, 100) : v]))
    : null;
  return {
    name: n,
    path,
    referrerHost: pageview ? normalizeReferrerHost(r) : null,
    utm: {
      source: pageview ? normalizeUtm(u?.source) : null,
      medium: pageview ? normalizeUtm(u?.medium) : null,
      campaign: pageview ? normalizeUtm(u?.campaign) : null,
      content: pageview ? normalizeUtm(u?.content) : null,
      term: pageview ? normalizeUtm(u?.term) : null,
    },
    clickSource: pageview ? (c ?? null) : null,
    props: pageview || !cleanProps || !Object.keys(cleanProps).length ? null : cleanProps,
  };
}

const BOT_UA =
  /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|page speed|preview|facebookexternalhit|curl|wget|python|httpclient|http-client|java\/|go-http|okhttp|axios|node-fetch|undici|libwww|phantomjs|selenium|puppeteer|playwright|scrapy|monitor|uptime|pingdom|ahrefs|semrush|mj12|dataforseo|chatgpt-user|gptbot|claude-web|perplexity|bytespider|inspectiontool|screenshot|validator|feedfetcher|embedly|whatsapp|discord|slack|telegram|vercel/i;

/** Crawlers, monitors, link previews and scripts — and anything without a user agent. */
export function isBot(userAgent: string | null | undefined): boolean {
  const ua = (userAgent ?? "").trim();
  if (ua.length < 10 || ua.length > 1000) return true;
  // "Cubot" is a phone brand, not a bot.
  return BOT_UA.test(ua.replace(/cubot/gi, ""));
}

export type Device = "mobile" | "tablet" | "desktop";

export function deviceFromUserAgent(userAgent: string | null | undefined): Device {
  const ua = userAgent ?? "";
  if (/ipad|tablet|kindle|silk\/|playbook|nexus (?:7|9|10)\b|sm-t\d/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua))) return "tablet";
  if (/mobi|iphone|ipod|android|windows phone|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
}

/** Two-letter country from Cloudflare's CF-IPCountry ("XX" = unknown and "T1" = Tor are dropped). */
export function normalizeCountry(raw: string | null | undefined): string | null {
  const value = (raw ?? "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(value) || value === "XX" || value === "T1") return null;
  return value;
}

/** UTC calendar day ("YYYY-MM-DD") — the lifetime of one visitor-hash salt. */
export function utcDay(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Daily visitor hash: the same browser (IP + user agent) on the same site gives the same hash for one UTC day.
 * Once the day's salt is deleted, the hash can't be linked to the IP address any more.
 */
export function visitorHash(salt: string, ip: string | null, userAgent: string, host: string): string {
  return crypto.createHash("sha256").update(`${salt}\n${ip ?? ""}\n${userAgent}\n${host}`).digest("hex");
}
