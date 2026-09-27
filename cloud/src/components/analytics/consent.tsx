"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readAdParams } from "@/lib/ad-params";
import {
  CONSENT_COOKIE,
  CONVERSION_COOKIE,
  LEGACY_CONSENT_COOKIE,
  consentCookieString,
  cookieName,
  deleteCookieEverywhere,
  deleteCookieString,
  isRepoUrl,
  isXAdVisit,
  mustReloadToUnload,
  parseConsent,
  readConsentCookie,
  readCookie,
  shouldPromptForX,
  thirdPartyAllowedOn,
} from "@/lib/consent";
import { claimPurchaseConversionAction } from "@/server/actions/analytics";
import { site } from "@/lib/site";
import { trackEvent } from "./tracker";
import { clearXCookies, isXPixelLoaded, loadXPixel, randomConversionId, xConversion } from "./x-pixel";

/**
 * Consent for X (Twitter) conversion tracking. The card asks only visitors who landed from one of our X ads and
 * haven't decided yet; "Privacy choices" in the footer opens it for everyone. With consent, X's pixel runs on every
 * page except sign-in, admin and API paths. The choice is the only thing stored (cookie `__Host-autoseo_consent`), and
 * only once a button is clicked.
 */

const OPEN_EVENT = "autoseo:privacy-choices";
/** One reload per page load to remove the pixel (the reloaded page never loads it on an excluded path). */
let unloadRequested = false;

type ConsentState = {
  x: boolean | null;
  /** Whether this page load started from an X ad — decided once and kept across client-side navigation. */
  xAdLanding: boolean;
  settingsOpen: boolean;
};

const SERVER_STATE: ConsentState = { x: null, xAdLanding: false, settingsOpen: false };
let state: ConsentState | null = null;
const listeners = new Set<() => void>();

const secure = () => location.protocol === "https:";

function readConsent() {
  return readConsentCookie((name) => readCookie(document.cookie, name)).x;
}

/**
 * The consent cookie's old, unprefixed name (https only): a "no" moves to the `__Host-` name, a "yes" never does — any
 * codext.de subdomain could have planted it. The old cookie is deleted host-only and for Domain=codext.de.
 */
function migrateLegacyCookie() {
  const legacy = readCookie(document.cookie, LEGACY_CONSENT_COOKIE);
  if (!secure() || legacy === null) return;
  if (parseConsent(legacy).x === false && readCookie(document.cookie, CONSENT_COOKIE) === null) {
    document.cookie = consentCookieString({ x: false }, true);
  }
  for (const deletion of deleteCookieEverywhere(LEGACY_CONSENT_COOKIE, location.hostname)) document.cookie = deletion;
}

function getState(): ConsentState {
  if (!state) {
    migrateLegacyCookie();
    state = { x: readConsent(), xAdLanding: isXAdVisit(readAdParams(location.search)), settingsOpen: false };
  }
  return state;
}

function setState(patch: Partial<ConsentState>) {
  state = { ...getState(), ...patch };
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

/** A click on a link to GitHub (repository, self-hosting docs). */
function isOurRepoLink(target: Element): boolean {
  const link = target.closest<HTMLAnchorElement>("a[href]");
  if (!link) return false;
  try {
    return isRepoUrl(new URL(link.href, location.href), site.github);
  } catch {
    return false;
  }
}

/** Add to cart goes to X at most once per page load, with one id so X can dedupe. */
let addToCartSent = false;

/**
 * With consent: a click that starts a Stripe checkout (buttons marked `data-x-add-to-cart`, and only when its form
 * would submit) is X's Add to cart, a click on a link to our GitHub repository its Download. Runs in the capture
 * phase, so the event is queued before the checkout's server action navigates to Stripe, without holding it up.
 */
function onConsentedClick(event: MouseEvent) {
  if (!(event.target instanceof Element)) return;
  const checkout = event.target.closest("[data-x-add-to-cart]");
  if (checkout) {
    if (addToCartSent || checkout.closest("form")?.checkValidity() === false) return;
    addToCartSent = true;
    xConversion("addToCart", { conversion_id: randomConversionId() });
  } else if (isOurRepoLink(event.target)) {
    xConversion("download", {});
  }
}

function decide(allow: boolean) {
  document.cookie = consentCookieString({ x: allow }, secure());
  if (!allow && (isXPixelLoaded() || document.cookie.includes("_tw"))) {
    // A loaded pixel can only be removed by reloading the page: do it right away, in this click.
    clearXCookies();
    trackEvent("consent_x_denied");
    location.reload();
    return;
  }
  trackEvent(allow ? "consent_x_granted" : "consent_x_denied");
  setState({ x: allow, settingsOpen: false });
}

const copy = {
  en: {
    title: "Ads on X",
    ad: "You came here from one of our ads on X. May X (Twitter) measure whether the ad led to a sign-up or purchase and show our ads again to visitors? This sets cookies from X and sends data about your visit to X. Optional; change it anytime under “Privacy choices” in the footer.",
    settingsTitle: "Privacy choices",
    settings:
      "Our own statistics work without cookies. Conversion tracking by X (Twitter) is optional: it sets cookies from X and sends data about your visit to X, so X can measure whether our ads lead to sign-ups or purchases and show our ads again.",
    status: { true: "Currently allowed.", false: "Currently declined.", null: "Not allowed (no choice made)." },
    allow: "Allow",
    decline: "Decline",
    more: "Details in our privacy policy",
    close: "Close",
    privacy: "/privacy#x-conversion-tracking",
  },
  de: {
    title: "Anzeigen auf X",
    ad: "Sie sind über eine unserer Anzeigen auf X hier. Dürfen wir X (Twitter) messen lassen, ob die Anzeige zu einer Registrierung oder einem Kauf geführt hat, und unsere Anzeigen Besuchern erneut zeigen? Dabei setzt X Cookies und erhält Daten zu Ihrem Besuch. Freiwillig – jederzeit änderbar unter „Datenschutz-Einstellungen“ im Footer.",
    settingsTitle: "Datenschutz-Einstellungen",
    settings:
      "Unsere eigene Statistik kommt ohne Cookies aus. Die Conversion-Messung durch X (Twitter) ist freiwillig: Dabei setzt X Cookies und erhält Daten zu Ihrem Besuch, damit X messen kann, ob unsere Anzeigen zu Registrierungen oder Käufen führen, und unsere Anzeigen erneut zeigen kann.",
    status: { true: "Derzeit erlaubt.", false: "Derzeit abgelehnt.", null: "Nicht erlaubt (keine Auswahl getroffen)." },
    allow: "Erlauben",
    decline: "Ablehnen",
    more: "Details in der Datenschutzerklärung",
    close: "Schließen",
    privacy: "/de/privacy#x-conversion-tracking",
  },
};

/**
 * Dashboard after a paid checkout (rendered while the purchase cookie from /api/billing/return exists): claims the
 * conversion on the server, which reports each one only once, and sends it to X — only with consent.
 */
export function XPurchaseConversion() {
  useEffect(() => {
    if (readConsent() !== true) return;
    // After this commit, so Next's router has patched `history` before the pixel cleans up the address bar.
    const timer = setTimeout(() => {
      claimPurchaseConversionAction()
        .then((c) => c && xConversion("purchase", { value: c.value, currency: c.currency, conversion_id: c.conversionId }))
        .catch(() => {});
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  return null;
}

/** "Privacy choices" link for the footers: opens the consent card for everyone. */
export function PrivacyChoicesButton({ label, className }: { label: string; className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      {label}
    </button>
  );
}

/** Mounted once in the root layout, next to the statistics tracker. */
export function ConsentManager() {
  const pathname = usePathname();
  const current = useSyncExternalStore(subscribe, getState, () => SERVER_STATE);

  useEffect(() => {
    const open = () => setState({ settingsOpen: true });
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  // With consent: X's pixel on every allowed page, and a sign-up the server flagged (cookie __Host-autoseo_cv) goes
  // to X. A client-side navigation into an excluded path (sign-in, admin) reloads the page, so the pixel is gone.
  useEffect(() => {
    if (!pathname) return;
    if (mustReloadToUnload(isXPixelLoaded(), pathname)) {
      if (!unloadRequested) {
        unloadRequested = true;
        location.replace(location.href);
      }
      return;
    }
    if (current.x !== true || !thirdPartyAllowedOn(pathname)) return;
    // After this commit, so Next's router has patched `history` before the pixel cleans up the address bar.
    const timer = setTimeout(() => {
      loadXPixel();
      const name = cookieName(CONVERSION_COOKIE, secure());
      if (readCookie(document.cookie, name) === "lead") {
        document.cookie = deleteCookieString(name);
        xConversion("lead", { conversion_id: randomConversionId() });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [current.x, pathname]);

  useEffect(() => {
    if (current.x !== true) return;
    document.addEventListener("click", onConsentedClick, { capture: true });
    return () => document.removeEventListener("click", onConsentedClick, { capture: true });
  }, [current.x]);

  const path = pathname ?? "/";
  const mode = current.settingsOpen ? "settings" : shouldPromptForX({ path, xAdLanding: current.xAdLanding, choice: current.x }) ? "ad" : null;
  if (!mode) return null;
  const t = path === "/de" || path.startsWith("/de/") ? copy.de : copy.en;
  const settings = mode === "settings";

  return (
    <section
      aria-label={settings ? t.settingsTitle : t.title}
      className="fixed inset-x-3 bottom-[5.5rem] z-40 rounded-xl border bg-card p-4 text-sm text-card-foreground shadow-[0_18px_50px_-12px_oklch(0_0_0/0.35)] sm:inset-x-auto sm:bottom-24 sm:left-6 sm:max-w-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-semibold">{settings ? t.settingsTitle : t.title}</h2>
        {settings && (
          <button
            type="button"
            onClick={() => setState({ settingsOpen: false })}
            aria-label={t.close}
            className="-mt-1 -mr-1 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <p className="mt-1.5 leading-relaxed text-muted-foreground">{settings ? t.settings : t.ad}</p>
      {settings && <p className="mt-1.5 font-medium">{t.status[String(current.x) as "true" | "false" | "null"]}</p>}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" aria-pressed={current.x === true} onClick={() => decide(true)}>
          {t.allow}
        </Button>
        <Button type="button" variant="outline" aria-pressed={current.x === false} onClick={() => decide(false)}>
          {t.decline}
        </Button>
      </div>
      <Link href={t.privacy} className="mt-2.5 inline-block text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">
        {t.more}
      </Link>
    </section>
  );
}
