/**
 * X (Twitter) conversion pixel — only ever called after the visitor allowed it (consent.tsx), and only after Next's
 * router has patched `history` (callers defer to a timeout), so the URL clean-up below sticks. Every page view and
 * event carries an explicit `page_location` (origin, path, campaign values; uwt.js also uses it in place of the
 * referrer), so X is never told a sign-in token, a Stripe session id or anything else from the address bar.
 */
import { site } from "@/lib/site";
import {
  cookieDomains,
  referrerOrigin,
  thirdPartyAllowedOn,
  thirdPartyPageLocation,
  thirdPartySafeSearch,
  xCookieNames,
} from "@/lib/consent";

type Twq = ((...args: unknown[]) => void) & { exe?: (...args: unknown[]) => void; queue: unknown[][]; version: string };

declare global {
  interface Window {
    twq?: Twq;
  }
}

const PIXEL = site.tracking.xPixel;
const SCRIPT_URL = "https://static.ads-twitter.com/uwt.js";
/**
 * uwt.js features that would send more than our privacy policy describes, switched off per pixel before `config`:
 * automatic button-click events, advanced matching (reads form fields for email / phone / names), data-layer
 * tracking, and dwell / page-leave events. uwt.js only honours the string "false".
 */
const DISABLED_FEATURES = ["autoConfig", "autoAdvancedMatching", "dataLayerTracking", "autoDwellTracking"];
/** Page the pixel last recorded (one page view per path, also under React Strict Mode). */
let configuredPath: string | null = null;
/** Our pixel function once it is on the page — not `window.twq`, which anything else could define. */
let pixel: Twq | null = null;

function scrubLocation() {
  const safe = thirdPartySafeSearch(location.search);
  if (safe !== location.search) window.history.replaceState(null, "", `${location.pathname}${safe}${location.hash}`);
}

function pageLocation(): string {
  return thirdPartyPageLocation(location.origin, location.pathname, location.search);
}

function scrubReferrer() {
  const origin = referrerOrigin(document.referrer);
  try {
    Object.defineProperty(document, "referrer", { configurable: true, get: () => origin });
  } catch {
    // Not redefinable in this browser: the HTTP Referer to X is origin-only anyway (Referrer-Policy).
  }
}

/**
 * Loads X's base pixel once and records the current page (config plus the Page view event). False where no third party
 * may run (/auth, /admin, /api).
 */
export function loadXPixel(): boolean {
  if (!thirdPartyAllowedOn(location.pathname)) return false;
  scrubLocation();
  if (!pixel) {
    scrubReferrer();
    // X's standard base snippet: queue calls until uwt.js has loaded.
    const twq = ((...args: unknown[]) => {
      if (twq.exe) twq.exe(...args);
      else twq.queue.push(args);
    }) as Twq;
    twq.version = "1.1";
    twq.queue = [];
    window.twq = pixel = twq;
    for (const feature of DISABLED_FEATURES) twq("set", feature, "false", PIXEL.id);
    const script = document.createElement("script");
    script.async = true;
    script.src = SCRIPT_URL;
    document.head.appendChild(script);
  }
  if (configuredPath !== location.pathname) {
    configuredPath = location.pathname;
    const page_location = pageLocation();
    pixel("set", { page_location });
    pixel("config", PIXEL.id, { page_location });
    pixel("event", PIXEL.events.pageView, { page_location });
  }
  return true;
}

export function xConversion(event: keyof typeof PIXEL.events, params: Record<string, string | number>): void {
  if (loadXPixel()) pixel!("event", PIXEL.events[event], { ...params, page_location: pageLocation() });
}

/** Whether this page loaded our X pixel (a reload is the only way to remove it again). */
export function isXPixelLoaded(): boolean {
  return pixel !== null;
}

/** Deletes X's first-party cookies (_twclid, …) for this host and its parent domains. */
export function clearXCookies(): void {
  for (const name of xCookieNames(document.cookie)) {
    document.cookie = `${name}=; Path=/; Max-Age=0`;
    for (const domain of cookieDomains(location.hostname)) document.cookie = `${name}=; Path=/; Max-Age=0; Domain=${domain}`;
  }
}

/** Random id for conversions without a natural one (X dedupes events by conversion_id). */
export function randomConversionId(): string {
  return typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}
