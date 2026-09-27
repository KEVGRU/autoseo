/**
 * Consent for optional third-party conversion tracking (pure, shared by the browser and the server). Only X is
 * offered today; further providers are added to CONSENT_PROVIDERS. The choice lives in one first-party cookie,
 * written only when the visitor clicks Allow / Decline.
 */
import { isAdVisit, type AdParams } from "./ad-params";

export const CONSENT_PROVIDERS = ["x"] as const;
export type ConsentProvider = (typeof CONSENT_PROVIDERS)[number];
/** true = allowed, false = declined, null = not asked / no decision yet. */
export type ConsentChoices = Record<ConsentProvider, boolean | null>;

/**
 * Cookie names. `__Host-` cookies (Secure, Path=/, no Domain) can't be planted by another codext.de subdomain;
 * browsers only accept them over https, so http://localhost uses the plain names (see cookieName).
 */
export const CONSENT_COOKIE = "__Host-autoseo_consent";
/** Pending sign-up conversion set by the server ("lead"), fired and deleted by the browser. */
export const CONVERSION_COOKIE = "__Host-autoseo_cv";
/** Paid checkout waiting to be reported (HttpOnly, set by /api/billing/return, claimed once by the dashboard). */
export const PURCHASE_COOKIE = "__Host-autoseo_purchase";
/** The consent cookie's name before the `__Host-` prefix — read once, migrated and deleted. */
export const LEGACY_CONSENT_COOKIE = "autoseo_consent";
export const CONSENT_MAX_AGE_S = 180 * 24 * 60 * 60;
export const CONVERSION_MAX_AGE_S = 10 * 60;

/** Paths where no third-party script may ever run: sign-in pages and links, admin and API. */
const NO_THIRD_PARTY = /^\/(?:admin|auth|api|login|signup)(?:\/|$)/;
/** Where the consent card itself may appear (it is our own UI; the pixel still waits for an allowed page). */
const NO_PROMPT = /^\/(?:admin|auth|api)(?:\/|$)/;
/** Query parameters that must never reach a third party. */
const SENSITIVE_PARAMS = ["token", "session_id", "code"];
/** The only query parameters a third party may see: campaign values and X's own click id. */
const THIRD_PARTY_PARAMS = /^(?:utm_(?:source|medium|campaign|content|term)|twclid)$/;

/** `__Host-` name on https, the plain name on http://localhost. */
export function cookieName(name: string, secure: boolean): string {
  return secure ? name : name.replace(/^__Host-/, "");
}

/** `document.cookie` assignment that deletes a cookie (a `__Host-` one only with Secure). */
export function deleteCookieString(name: string): string {
  return `${name}=; Path=/; Max-Age=0${name.startsWith("__Host-") ? "; Secure" : ""}`;
}

/** Deletes a cookie host-only and for every parent domain (e.g. one planted with Domain=codext.de). */
export function deleteCookieEverywhere(name: string, hostname: string): string[] {
  return [deleteCookieString(name), ...cookieDomains(hostname).map((domain) => `${deleteCookieString(name)}; Domain=${domain}`)];
}

/** Value of one cookie from a `document.cookie` / Cookie header string. */
export function readCookie(cookies: string | null | undefined, name: string): string | null {
  for (const part of (cookies ?? "").split(";")) {
    const eq = part.indexOf("=");
    if (eq > 0 && part.slice(0, eq).trim() === name) {
      try {
        return decodeURIComponent(part.slice(eq + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}

/** Parses the consent cookie value ("x=1", "x=0"); unknown providers and values are ignored. */
export function parseConsent(value: string | null | undefined): ConsentChoices {
  const choices: ConsentChoices = { x: null };
  for (const pair of (value ?? "").split(/[&,]/)) {
    const [key, flag] = pair.split("=");
    if ((CONSENT_PROVIDERS as readonly string[]).includes(key ?? "") && (flag === "1" || flag === "0")) {
      choices[key as ConsentProvider] = flag === "1";
    }
  }
  return choices;
}

export function serializeConsent(choices: ConsentChoices): string {
  return CONSENT_PROVIDERS.filter((p) => choices[p] !== null)
    .map((p) => `${p}=${choices[p] ? 1 : 0}`)
    .join("&");
}

/** `document.cookie` assignment for the consent choice (180 days). */
export function consentCookieString(choices: ConsentChoices, secure: boolean): string {
  return `${cookieName(CONSENT_COOKIE, secure)}=${serializeConsent(choices)}; Path=/; Max-Age=${CONSENT_MAX_AGE_S}; SameSite=Lax${secure ? "; Secure" : ""}`;
}

/**
 * The visitor's choice. Over https only the `__Host-` cookie counts; a cookie under the old, unprefixed name can be
 * planted by any codext.de subdomain (Domain=codext.de), so it is only ever honoured as a "no" — never as consent.
 * On http://localhost the plain name is the real one. `secure` defaults to the page's protocol in the browser and to
 * https on the server; server callers pass `!env.isLocal`.
 */
export function readConsentCookie(
  read: (name: string) => string | null | undefined,
  secure: boolean = typeof location === "undefined" || location.protocol === "https:",
): ConsentChoices {
  if (!secure) return parseConsent(read(cookieName(CONSENT_COOKIE, false)));
  const current = read(CONSENT_COOKIE);
  if (current != null) return parseConsent(current);
  const legacy = parseConsent(read(LEGACY_CONSENT_COOKIE));
  return Object.fromEntries(CONSENT_PROVIDERS.map((p) => [p, legacy[p] === false ? false : null])) as ConsentChoices;
}

/** Arrived from one of our ads on X: X's click id in the URL, or a paid campaign with utm_source x / twitter. */
export function isXAdVisit(ad: AdParams): boolean {
  if (ad.clickSource === "x") return true;
  const source = ad.utm.source?.toLowerCase();
  return isAdVisit(ad) && (source === "x" || source === "twitter");
}

export function thirdPartyAllowedOn(path: string): boolean {
  return !NO_THIRD_PARTY.test(path);
}

/**
 * A pixel that is already running can't be removed from the page: after a client-side navigation into an excluded
 * path the page has to be reloaded. The reloaded page doesn't load it, so this can't loop.
 */
export function mustReloadToUnload(pixelLoaded: boolean, path: string): boolean {
  return pixelLoaded && !thirdPartyAllowedOn(path);
}

/** The prompt is only shown to X-ad visitors who haven't decided yet, never in sign-in links, admin or API paths. */
export function shouldPromptForX(input: { path: string; xAdLanding: boolean; choice: boolean | null }): boolean {
  return input.choice === null && input.xAdLanding && !NO_PROMPT.test(input.path);
}

/**
 * Address-bar query without sign-in tokens, codes and Stripe session ids (removed before a third-party script
 * runs). Returns the input unchanged when there is nothing to remove, so the page only rewrites its URL if needed.
 */
export function thirdPartySafeSearch(search: string): string {
  if (!search || search === "?") return "";
  const params = new URLSearchParams(search);
  let changed = false;
  for (const key of SENSITIVE_PARAMS) {
    if (params.has(key)) {
      params.delete(key);
      changed = true;
    }
  }
  if (!changed) return search;
  const rest = params.toString();
  return rest ? `?${rest}` : "";
}

/**
 * The page location a third party is told (X: `page_location`, which uwt.js also uses in place of the referrer):
 * origin and path, plus only campaign values and X's click id outside the signed-in area.
 */
export function thirdPartyPageLocation(origin: string, path: string, search: string): string {
  if (path === "/dashboard" || path.startsWith("/dashboard/")) return `${origin}${path}`;
  const params = new URLSearchParams(search);
  const kept = new URLSearchParams();
  for (const [key, value] of params) if (THIRD_PARTY_PARAMS.test(key)) kept.append(key, value);
  const query = kept.toString();
  return `${origin}${path}${query ? `?${query}` : ""}`;
}

/** Origin of a referrer (or "" for none / invalid): third parties never see our or anyone's paths and queries. */
export function referrerOrigin(referrer: string): string {
  try {
    return referrer ? `${new URL(referrer).origin}/` : "";
  } catch {
    return "";
  }
}

/** Domains an ad network may have set first-party cookies for: the host and each parent domain (not the TLD). */
export function cookieDomains(hostname: string): string[] {
  const labels = hostname.split(".");
  if (labels.length < 2 || /^\d+(\.\d+){3}$/.test(hostname)) return [hostname];
  const out: string[] = [];
  for (let i = 0; i < labels.length - 1; i++) out.push(labels.slice(i).join("."));
  return out;
}

/** A link into one repository (`repo` like https://github.com/codextde/autoseo), not just anywhere on its host. */
export function isRepoUrl(url: URL, repo: string): boolean {
  const base = new URL(repo);
  const root = base.pathname.replace(/\/+$/, "").toLowerCase();
  const path = url.pathname.toLowerCase();
  return url.hostname === base.hostname && (path === root || path === `${root}.git` || path.startsWith(`${root}/`));
}

/** Names of X's first-party cookies (`_twclid`, `_twpid`, …) in a `document.cookie` string. */
export function xCookieNames(cookies: string): string[] {
  return cookies
    .split(";")
    .map((part) => part.split("=")[0]!.trim())
    .filter((name) => name.startsWith("_tw"));
}
