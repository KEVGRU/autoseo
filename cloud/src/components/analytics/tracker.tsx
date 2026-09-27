"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { readAdParams, type UtmKey } from "@/lib/ad-params";

/**
 * Cookieless first-party statistics (privacy policy → "Privacy-friendly usage statistics"). Sends page views and a
 * few clicks to /api/e: the path, the referrer's host (external, first page view of a page load only), utm_*
 * values and which ad network's click id is in the URL — never the rest of the URL, the click id itself, cookies
 * or anything stored in the browser.
 */

const ENDPOINT = "/api/e";
const UNTRACKED = /^\/(?:admin|dashboard|auth|api)(?:\/|$)/;
const EVENT_NAME = /^[a-z0-9_]{1,40}$/;

type Payload = {
  n: string;
  p: string;
  r?: string;
  u?: Partial<Record<UtmKey, string>>;
  c?: string;
  props?: Record<string, string>;
};

function send(payload: Payload) {
  if (navigator.webdriver) return;
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon?.(ENDPOINT, body)) return;
  } catch {
    // Fall through to fetch.
  }
  fetch(ENDPOINT, { method: "POST", body, keepalive: true, credentials: "same-origin", headers: { "Content-Type": "text/plain" } }).catch(() => {});
}

/** Sends one interaction from code (e.g. a consent choice), like the click listener does for marked elements. */
export function trackEvent(name: string, props?: Record<string, string>) {
  const path = location.pathname;
  if (UNTRACKED.test(path) || !EVENT_NAME.test(name)) return;
  send({ n: name, p: path, ...(props ? { props } : {}) });
}

function externalReferrerHost(): string | undefined {
  try {
    const host = new URL(document.referrer).hostname;
    return host && host !== location.hostname ? host : undefined;
  } catch {
    return undefined;
  }
}

function pageview(path: string, firstOfLoad: boolean) {
  const { utm, clickSource } = readAdParams(location.search);
  const payload: Payload = { n: "pageview", p: path };
  if (firstOfLoad) payload.r = externalReferrerHost();
  if (Object.keys(utm).length) payload.u = utm;
  if (clickSource) payload.c = clickSource;
  send(payload);
}

/** GitHub, where our repository and the self-hosting instructions live (X counts a click there as a Download). */
export function isGitHubUrl(url: URL): boolean {
  return url.hostname === "github.com" || url.hostname.endsWith(".github.com");
}

function label(el: Element): string {
  return (el.textContent || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().slice(0, 60);
}

/**
 * One delegated listener: anything marked `data-track="name"` (+ `data-track-label`), sign-up CTAs (with the
 * `?plan=` they link to) and GitHub links. A marked sign-up link counts as both.
 */
function onClick(event: MouseEvent) {
  const path = location.pathname;
  if (UNTRACKED.test(path) || !(event.target instanceof Element)) return;
  const tracked = event.target.closest<HTMLElement>("[data-track]");
  const name = tracked?.dataset.track;
  if (tracked && name && EVENT_NAME.test(name)) {
    const trackLabel = tracked.dataset.trackLabel?.slice(0, 60);
    send({ n: name, p: path, ...(trackLabel ? { props: { label: trackLabel } } : {}) });
  }
  const link = event.target.closest<HTMLAnchorElement>("a[href]");
  if (!link) return;
  let url: URL;
  try {
    url = new URL(link.href, location.href);
  } catch {
    return;
  }
  if (url.origin === location.origin && url.pathname === "/signup") {
    const plan = url.searchParams.get("plan")?.slice(0, 20);
    send({ n: "cta_signup", p: path, props: { href: url.pathname, label: label(link), from: path, ...(plan ? { plan } : {}) } });
  } else if (isGitHubUrl(url)) {
    send({ n: "outbound_github", p: path, props: { href: url.pathname.slice(0, 100), from: path } });
  }
}

/**
 * Mounted once in the root layout; skips the signed-in, auth and API areas itself. Self-contained (no props, no
 * context), so other client widgets can be mounted next to it.
 */
export function AnalyticsTracker() {
  const pathname = usePathname();
  const firstOfLoad = useRef(true);
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    // Strict Mode runs effects twice in development; one page view per path change.
    if (!pathname || lastPath.current === pathname) return;
    lastPath.current = pathname;
    const first = firstOfLoad.current;
    firstOfLoad.current = false;
    if (!UNTRACKED.test(pathname)) pageview(pathname, first);
  }, [pathname]);

  useEffect(() => {
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
