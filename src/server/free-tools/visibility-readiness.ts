import "server-only";
/**
 * Free AI Visibility Check — deterministic AI readiness (no AI cost). A handful of polite requests to the target:
 * homepage (browser UA), robots.txt, llms.txt and one homepage request with an AI crawler user agent. Every fetch goes
 * through the SSRF-safe client (DNS pinned, private ranges blocked on every redirect hop).
 */
import { fetchRobotsTxt } from "../audit-crawler/discovery";
import { CHALLENGE_BODY_MARKERS } from "../audit-crawler/fetch-page";
import { readTextCapped, safeFetchFollow } from "../audit-crawler/safe-fetch";
import { CrawlTargetBlockedError, normalizeStartUrlInput } from "../audit-crawler/url-policy";
import { BOT_PROFILES, BROWSER_USER_AGENT } from "../crawlability/bots";
import { looksLikeHtml, validateLlmsTxt } from "../crawlability/llms-txt";
import type { FirewallVerdict, ReadinessResult } from "@/features/visibility-check/types";
import { analyzePageHtml, evaluateBotAccess, scoreReadiness, type ReadinessBase } from "./visibility-scoring";

const MAX_HTML_BYTES = 2 * 1024 * 1024;
const PROBE_BOT = "OAI-SearchBot";

const BROWSER_HEADERS = {
  "User-Agent": BROWSER_USER_AGENT,
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9,de;q=0.8",
};

type Homepage = {
  requestedUrl: string;
  finalUrl: string | null;
  status: number | null;
  redirects: Array<{ url: string; status: number }>;
  ttfbMs: number | null;
  xRobotsTag: string | null;
  html: string | null;
  error: string | null;
};

async function fetchHomepage(url: string): Promise<Homepage> {
  try {
    const { response, finalUrl, hops, ttfbMs } = await safeFetchFollow(url, {
      headers: BROWSER_HEADERS,
      timeoutMs: 20_000,
    });
    const isHtml = (response.headers.get("content-type") ?? "").includes("html");
    const { text } = isHtml ? await readTextCapped(response, MAX_HTML_BYTES) : { text: "" };
    if (!isHtml) await response.body?.cancel().catch(() => {});
    return {
      requestedUrl: url,
      finalUrl,
      status: response.status,
      redirects: hops.map((h) => ({ url: h.url, status: h.status })),
      ttfbMs,
      xRobotsTag: response.headers.get("x-robots-tag"),
      html: isHtml && text ? text : null,
      error: null,
    };
  } catch (err) {
    if (err instanceof CrawlTargetBlockedError) throw err;
    return {
      requestedUrl: url,
      finalUrl: null,
      status: null,
      redirects: [],
      ttfbMs: null,
      xRobotsTag: null,
      html: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function checkLlmsTxt(origin: string): Promise<ReadinessResult["llmsTxt"]> {
  const url = `${origin}/llms.txt`;
  try {
    const { response } = await safeFetchFollow(url, {
      headers: { ...BROWSER_HEADERS, Accept: "text/plain,text/markdown,*/*" },
      timeoutMs: 10_000,
    });
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      await response.body?.cancel().catch(() => {});
      return {
        url,
        present: false,
        status: response.status,
        title: null,
        links: 0,
        issues: [],
      };
    }
    const { text } = await readTextCapped(response, 512 * 1024);
    // SPAs often answer every path with their HTML shell — that is not an llms.txt.
    if (looksLikeHtml(text, contentType))
      return {
        url,
        present: false,
        status: response.status,
        title: null,
        links: 0,
        issues: [],
      };
    const v = validateLlmsTxt(text, { contentType, origin });
    return {
      url,
      present: true,
      status: response.status,
      title: v.title,
      links: v.linkCount + v.inlineLinkCount,
      issues: [...v.errors, ...v.warnings].slice(0, 5),
    };
  } catch {
    return {
      url,
      present: false,
      status: null,
      title: null,
      links: 0,
      issues: [],
    };
  }
}

function isChallenge(status: number, headers: { get(name: string): string | null }, body: string): boolean {
  if (headers.get("cf-mitigated")) return true;
  const snippet = body.slice(0, 6000).toLowerCase();
  if ((status === 403 || status === 503 || status === 429) && CHALLENGE_BODY_MARKERS.some((m) => snippet.includes(m))) return true;
  return status >= 400 && /captcha|cf-chl-|challenge-platform|px-captcha|datadome|perimeterx|access denied/i.test(snippet);
}

/** Homepage as an AI search crawler vs. what the browser got (indicative only; real crawlers use verified IPs). */
async function probeAsCrawler(home: Homepage, browserWords: number | null): Promise<ReadinessResult["firewall"]> {
  const url = home.finalUrl;
  const userAgent = BOT_PROFILES.find((b) => b.token === PROBE_BOT)?.userAgent;
  if (!url || !userAgent || home.status === null || home.status >= 400) return null;
  try {
    const { response } = await safeFetchFollow(url, {
      headers: {
        "User-Agent": userAgent,
        Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
      },
      timeoutMs: 15_000,
    });
    const isHtml = (response.headers.get("content-type") ?? "").includes("html");
    const { text } = isHtml || response.status >= 400 ? await readTextCapped(response, 1024 * 1024) : { text: "" };
    if (!isHtml && response.status < 400) await response.body?.cancel().catch(() => {});
    const status = response.status;
    let verdict: FirewallVerdict = "ok";
    let reason: string | null = null;
    if (isChallenge(status, response.headers, text)) {
      verdict = "blocked";
      reason = `a bot challenge (HTTP ${status})`;
    } else if (status >= 400) {
      verdict = "blocked";
      reason = `HTTP ${status}`;
    } else if (isHtml && browserWords && browserWords >= 50) {
      const words = analyzePageHtml(text, url).wordCount;
      if (words < browserWords * 0.5) {
        verdict = "different";
        reason = `only ${words} words (browser: ${browserWords})`;
      }
    }
    return { userAgent: PROBE_BOT, status, verdict, reason };
  } catch (err) {
    return {
      userAgent: PROBE_BOT,
      status: null,
      verdict: "error",
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Runs the AI readiness checks for a domain. Throws CrawlTargetBlockedError for private / internal targets. */
export async function runReadinessCheck(domain: string): Promise<ReadinessResult> {
  const requestedUrl = normalizeStartUrlInput(`https://${domain}/`);
  let home = await fetchHomepage(requestedUrl);
  if (home.status === null && !domain.startsWith("www.")) {
    // Some sites only answer on www (no apex A record / TLS on the apex).
    const www = await fetchHomepage(normalizeStartUrlInput(`https://www.${domain}/`));
    if (www.status !== null) home = www;
  }
  const finalUrl = home.finalUrl ?? home.requestedUrl;
  const final = new URL(finalUrl);
  const origin = final.origin;
  const page = home.html ? analyzePageHtml(home.html, finalUrl, home.xRobotsTag) : null;

  const [robotsFetch, llmsTxt, firewall] = await Promise.all([
    fetchRobotsTxt(origin, BROWSER_USER_AGENT),
    checkLlmsTxt(origin),
    probeAsCrawler(home, page?.wordCount ?? null),
  ]);
  const unreachable = robotsFetch.status !== null && robotsFetch.status >= 500;
  const sitemaps = robotsFetch.text ? (robotsFetch.text.match(/^\s*sitemap\s*:/gim)?.length ?? 0) : 0;

  const base: ReadinessBase = {
    checkedAt: new Date().toISOString(),
    requestedUrl: home.requestedUrl,
    finalUrl: home.finalUrl,
    http: {
      status: home.status,
      redirects: home.redirects,
      https: final.protocol === "https:",
      ttfbMs: home.ttfbMs,
      xRobotsTag: home.xRobotsTag,
      error: home.error,
    },
    robots: {
      url: `${origin}/robots.txt`,
      found: robotsFetch.text !== null,
      status: robotsFetch.status,
      unreachable,
      sitemaps,
      error: robotsFetch.error,
    },
    bots: evaluateBotAccess(robotsFetch.text, {
      unreachable,
      homepagePath: final.pathname || "/",
    }),
    llmsTxt,
    page,
    firewall,
  };
  return { ...base, ...scoreReadiness(base) };
}
