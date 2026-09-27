import "server-only";
import { AI_BOTS } from "./bots";
import { analyzeHtml } from "./html";
import { evaluateRobots, parseRobots, ROBOTS_MAX_BYTES, type ParsedRobots } from "./robots";
import { isAllowedHostname, safeFetch, SafeFetchError, type SafeResponse } from "./safe-fetch";
import { scoreSignals, type Signals } from "./score";
import type { BotResult, CheckEvent, CheckResult, StepId } from "./types";

/**
 * The free AI visibility check: fetches a page the way a crawler does (no JavaScript), reads robots.txt, llms.txt
 * and the sitemap, and scores how ready the site is to be read and cited by AI engines. It measures readiness, not
 * what AI engines actually answer — that is what AutoSEO's tracking does.
 */

const USER_AGENT = "Mozilla/5.0 (compatible; AutoSEO-Check/1.0; +https://autoseo.codext.de/ai-visibility-check)";
const OVERALL_TIMEOUT_MS = 25_000;
const CACHE_TTL_MS = 10 * 60_000;
const CACHE_MAX = 500;
const MAX_IN_FLIGHT = 6;

export class CheckInputError extends Error {}
export class CheckBusyError extends Error {}

/** Normalizes user input ("example.com", "https://www.example.com/page") to the https URL that is checked. */
export function normalizeTarget(input: string): URL {
  const raw = input.trim();
  if (!raw || raw.length > 500) throw new CheckInputError("Enter a domain, e.g. example.com.");
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    throw new CheckInputError("That doesn't look like a domain. Try e.g. example.com.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new CheckInputError("Only http and https websites can be checked.");
  if (url.username || url.password || (url.port && url.port !== "80" && url.port !== "443")) {
    throw new CheckInputError("Enter a public website without credentials or custom ports.");
  }
  const host = url.hostname.replace(/\.$/, "");
  if (/^[\d.]+$/.test(host) || host.startsWith("[")) throw new CheckInputError("Enter a domain name, not an IP address.");
  if (!isAllowedHostname(host)) throw new CheckInputError("This domain is not publicly reachable.");
  const path = `${url.pathname}${url.search}`.slice(0, 500);
  return new URL(`https://${host}${path}`);
}

function looksLikeHtml(res: SafeResponse): boolean {
  return /html/i.test(res.headers["content-type"] ?? "") || /^\s*<(!doctype|html|head|body)\b/i.test(res.body.slice(0, 500));
}

/** A CDN/WAF challenge instead of the page (what an AI crawler would likely get as well). */
function looksChallenged(res: SafeResponse): boolean {
  if (![403, 429, 503].includes(res.status)) return false;
  if (res.headers["cf-mitigated"]) return true;
  return /(cf-chl|challenge-platform|just a moment|captcha|verify (that )?you are (a )?human|attention required|datadome|perimeterx|incapsula|access denied)/i.test(
    res.body.slice(0, 20_000),
  );
}

async function fetchPage(target: URL, signal: AbortSignal): Promise<{ res: SafeResponse | null; https: boolean; error: string | null }> {
  const opts = { maxBytes: 2_500_000, timeoutMs: 12_000, signal, userAgent: USER_AGENT };
  try {
    return { res: await safeFetch(target.toString(), opts), https: true, error: null };
  } catch (err) {
    const e = err instanceof SafeFetchError ? err : new SafeFetchError("connection", String(err));
    if (e.code === "dns" || e.code === "blocked" || e.code === "invalid_url") return { res: null, https: false, error: e.code };
    // HTTPS doesn't work (certificate, closed port 443, timeout): try plain HTTP so the rest can still be checked.
    try {
      const plain = new URL(target);
      plain.protocol = "http:";
      const res = await safeFetch(plain.toString(), opts);
      return { res, https: res.finalUrl.startsWith("https:"), error: null };
    } catch {
      return { res: null, https: false, error: e.code };
    }
  }
}

async function probeHttpRedirect(host: string, signal: AbortSignal): Promise<boolean | null> {
  try {
    const res = await safeFetch(`http://${host}/`, { maxBytes: 16_384, timeoutMs: 6_000, signal, maxRedirects: 0, userAgent: USER_AGENT });
    if (res.status >= 300 && res.status < 400) return (res.headers.location ?? "").startsWith("https://");
    return res.status >= 200 && res.status < 300 ? false : null;
  } catch {
    return null; // port 80 closed or unreachable: nothing is served without TLS
  }
}

async function fetchOptional(url: string, signal: AbortSignal, maxBytes: number, accept: string): Promise<SafeResponse | null> {
  try {
    return await safeFetch(url, { maxBytes, timeoutMs: 8_000, signal, accept, userAgent: USER_AGENT });
  } catch {
    return null;
  }
}

function botResults(robots: ParsedRobots | null, state: CheckResult["robots"]["state"], path: string): BotResult[] {
  return AI_BOTS.map((bot) => {
    const base = { token: bot.token, operator: bot.operator, purpose: bot.purpose, mayIgnoreRobots: Boolean(bot.mayIgnoreRobots) };
    if (state === "unreachable") return { ...base, allowed: false, source: "unreachable" as const, rule: null };
    if (!robots) return { ...base, allowed: true, source: "no-robots" as const, rule: null };
    const v = evaluateRobots(robots, bot.token, path);
    return {
      ...base,
      allowed: v.allowed,
      source: v.group,
      rule: v.rule ? { type: v.rule.allow ? ("allow" as const) : ("disallow" as const), pattern: v.rule.pattern, line: v.rule.line } : null,
    };
  });
}

async function check(target: URL, emit: (e: CheckEvent) => void): Promise<CheckResult> {
  const started = performance.now();
  const signal = AbortSignal.timeout(OVERALL_TIMEOUT_MS);
  const step = (id: StepId, status: "running" | "done") => emit({ type: "step", step: id, status });

  step("fetch", "running");
  const [page, httpRedirect] = await Promise.all([fetchPage(target, signal), probeHttpRedirect(target.hostname, signal)]);
  step("fetch", "done");

  const res = page.res;
  const challenged = res ? looksChallenged(res) : false;
  const signals: Signals = {
    version: 1,
    input: target.hostname,
    host: target.hostname,
    url: target.toString(),
    checkedAt: new Date().toISOString(),
    durationMs: 0,
    http: {
      finalUrl: res?.finalUrl ?? null,
      status: res?.status ?? null,
      error: page.error,
      https: page.https,
      httpRedirectsToHttps: page.https ? httpRedirect : null,
      redirects: res?.redirects ?? [],
      ttfbMs: res?.ttfbMs ?? null,
      totalMs: res?.timeMs ?? null,
      contentType: res?.headers["content-type"] ?? null,
      bytes: res?.bytes ?? null,
      hsts: Boolean(res?.headers["strict-transport-security"]),
      xRobotsTag: res?.headers["x-robots-tag"] ?? null,
      challenged,
    },
    robots: { url: null, status: null, state: "skipped", sitemaps: [], bots: [] },
    llms: { url: null, status: null, present: false, valid: false, title: null, bytes: 0 },
    sitemap: { url: null, status: null, found: false, source: null, urls: null, index: false },
    page: null,
  };

  if (res) {
    const final = new URL(res.finalUrl);
    const origin = final.origin;

    step("robots", "running");
    const robotsUrl = `${origin}/robots.txt`;
    const [robotsRes, llmsRes] = await Promise.all([
      fetchOptional(robotsUrl, signal, ROBOTS_MAX_BYTES, "text/plain,*/*;q=0.5"),
      fetchOptional(`${origin}/llms.txt`, signal, 262_144, "text/plain,text/markdown;q=0.9,*/*;q=0.1"),
    ]);
    let parsed: ParsedRobots | null = null;
    let state: CheckResult["robots"]["state"];
    if (!robotsRes || robotsRes.status === 429 || robotsRes.status >= 500) state = "unreachable";
    else if (robotsRes.status >= 200 && robotsRes.status < 300 && !looksLikeHtml(robotsRes)) {
      state = "ok";
      parsed = parseRobots(robotsRes.body);
    } else state = "missing"; // 4xx (or an HTML page instead of a robots.txt): crawlers may fetch everything
    signals.robots = {
      url: robotsUrl,
      status: robotsRes?.status ?? null,
      state,
      sitemaps: [...new Set(parsed?.sitemaps ?? [])].slice(0, 20),
      bots: botResults(parsed, state, `${final.pathname}${final.search}`),
    };
    step("robots", "done");

    step("files", "running");
    if (llmsRes) {
      const present = llmsRes.status === 200 && !looksLikeHtml(llmsRes) && llmsRes.body.trim().length > 0;
      const firstLine = llmsRes.body.split(/\r?\n/).find((l) => l.trim()) ?? "";
      const h1 = present ? firstLine.match(/^#\s+(.+)/)?.[1]?.trim() ?? null : null;
      signals.llms = { url: llmsRes.finalUrl, status: llmsRes.status, present, valid: Boolean(h1), title: h1?.slice(0, 120) ?? null, bytes: llmsRes.bytes };
    } else {
      signals.llms.url = `${origin}/llms.txt`;
    }
    const declared = signals.robots.sitemaps.filter((u) => /^https?:\/\//i.test(u));
    const candidates: { url: string; source: "robots" | "default" }[] = declared.length
      ? [{ url: declared[0]!, source: "robots" }]
      : [
          { url: `${origin}/sitemap.xml`, source: "default" },
          { url: `${origin}/sitemap_index.xml`, source: "default" },
        ];
    for (const candidate of candidates) {
      const sm = await fetchOptional(candidate.url, signal, 1_000_000, "application/xml,text/xml;q=0.9,*/*;q=0.5");
      const head = sm?.body.slice(0, 5000) ?? "";
      const gz = /\.gz($|\?)/i.test(candidate.url) || /gzip|octet-stream/i.test(sm?.headers["content-type"] ?? "");
      const index = /<sitemapindex\b/i.test(head);
      const found = Boolean(sm && sm.status === 200 && (index || /<urlset\b/i.test(head) || gz));
      signals.sitemap = {
        url: sm?.finalUrl ?? candidate.url,
        status: sm?.status ?? null,
        found,
        source: candidate.source,
        urls: found && !gz ? (sm!.body.match(/<loc\b/gi) ?? []).length : null,
        index,
      };
      if (found) break;
    }
    step("files", "done");

    step("analyze", "running");
    const isHtml = /html/i.test(res.headers["content-type"] ?? "") || /^\s*</.test(res.body.slice(0, 200));
    if (res.status >= 200 && res.status < 300 && isHtml && !challenged) {
      const facts = analyzeHtml(res.body);
      const rendering = facts.wordCount >= 150 ? "server" : facts.wordCount >= 50 ? "thin" : facts.spaSignals.length || facts.scriptCount >= 3 ? "js" : "thin";
      signals.page = {
        title: facts.title,
        description: facts.description,
        canonical: facts.canonical,
        lang: facts.lang,
        hreflang: facts.hreflang,
        h1: facts.h1,
        h2Count: facts.h2Count,
        wordCount: facts.wordCount,
        rendering,
        spaSignals: facts.spaSignals,
        scriptCount: facts.scriptCount,
        jsonLd: facts.jsonLd,
        microdata: facts.microdata,
        metaRobots: facts.metaRobots,
        noindex: /\b(noindex|none)\b/i.test(facts.metaRobots ?? ""),
        og: facts.og,
      };
    }
    step("analyze", "done");
  }

  const scored = scoreSignals(signals);
  return { ...signals, ...scored, durationMs: Math.round(performance.now() - started) };
}

/* ─────────────────────────── Cache and load limits ─────────────────────────── */

const cache = new Map<string, { at: number; result: CheckResult }>();
const inFlight = new Map<string, Promise<CheckResult>>();

/**
 * Runs a check with a 10-minute result cache per URL (repeat checks don't hit the target site again),
 * de-duplication of identical concurrent checks and a global cap on parallel checks.
 */
export async function runCheck(input: string, emit: (e: CheckEvent) => void = () => {}): Promise<CheckResult> {
  const target = normalizeTarget(input);
  const key = target.toString();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return { ...hit.result, input };
  const running = inFlight.get(key);
  if (running) return { ...(await running), input };
  if (inFlight.size >= MAX_IN_FLIGHT) throw new CheckBusyError("Too many checks are running right now. Please try again in a minute.");
  const promise = check(target, emit);
  inFlight.set(key, promise);
  try {
    const result = await promise;
    cache.set(key, { at: Date.now(), result });
    if (cache.size > CACHE_MAX) {
      for (const [k, v] of cache) if (Date.now() - v.at >= CACHE_TTL_MS || cache.size > CACHE_MAX) cache.delete(k);
    }
    return { ...result, input };
  } finally {
    inFlight.delete(key);
  }
}
