/**
 * Result of the free AI visibility check (API response, client-safe). Copy is not part of the result: fixes are
 * ids with parameters, localized by the UI (`copy.ts`), so the same JSON serves both languages.
 */
import type { BotPurpose } from "./bots";

export type CategoryKey = "crawlers" | "content" | "structure" | "discovery" | "technical";

export type StepId = "fetch" | "robots" | "files" | "analyze";

export type BotResult = {
  token: string;
  operator: string;
  purpose: BotPurpose;
  allowed: boolean;
  /** Which robots.txt groups applied. "unreachable": robots.txt failed with 5xx/429/network error. */
  source: "specific" | "wildcard" | "none" | "no-robots" | "unreachable";
  rule: { type: "allow" | "disallow"; pattern: string; line: number } | null;
  mayIgnoreRobots: boolean;
};

export type FixSeverity = "high" | "medium" | "low";

export type FixId =
  | "unreachable"
  | "http_error"
  | "bot_protection"
  | "https_missing"
  | "http_no_redirect"
  | "slow_response"
  | "long_redirect_chain"
  | "robots_unreachable"
  | "robots_blocks_all"
  | "search_bots_blocked"
  | "user_bots_blocked"
  | "training_bots_blocked"
  | "noindex"
  | "js_only"
  | "thin_content"
  | "no_jsonld"
  | "jsonld_invalid"
  | "no_entity_schema"
  | "title_missing"
  | "title_length"
  | "description_missing"
  | "description_length"
  | "canonical_missing"
  | "canonical_other_host"
  | "lang_missing"
  | "h1_missing"
  | "sitemap_missing"
  | "llms_missing"
  | "llms_invalid";

export type Fix = {
  id: FixId;
  severity: FixSeverity;
  category: CategoryKey;
  /** Score points this issue costs (for ordering). */
  points: number;
  params?: Record<string, string | number>;
};

export type CheckResult = {
  version: 1;
  input: string;
  host: string;
  url: string;
  checkedAt: string;
  durationMs: number;
  score: number;
  categories: { key: CategoryKey; score: number; weight: number }[];
  http: {
    finalUrl: string | null;
    status: number | null;
    error: string | null;
    https: boolean;
    /** Plain http:// redirects to https:// (null when it couldn't be tested). */
    httpRedirectsToHttps: boolean | null;
    redirects: { url: string; status: number }[];
    ttfbMs: number | null;
    totalMs: number | null;
    contentType: string | null;
    bytes: number | null;
    hsts: boolean;
    xRobotsTag: string | null;
    /** The response looked like a bot challenge (CDN/WAF). */
    challenged: boolean;
  };
  robots: {
    url: string | null;
    status: number | null;
    state: "ok" | "missing" | "unreachable" | "skipped";
    sitemaps: string[];
    bots: BotResult[];
  };
  llms: { url: string | null; status: number | null; present: boolean; valid: boolean; title: string | null; bytes: number };
  sitemap: { url: string | null; status: number | null; found: boolean; source: "robots" | "default" | null; urls: number | null; index: boolean };
  page: {
    title: string | null;
    description: string | null;
    canonical: string | null;
    lang: string | null;
    hreflang: string[];
    h1: string[];
    h2Count: number;
    wordCount: number;
    rendering: "server" | "thin" | "js" | "unknown";
    spaSignals: string[];
    scriptCount: number;
    jsonLd: { blocks: number; errors: number; types: string[] };
    microdata: boolean;
    metaRobots: string | null;
    noindex: boolean;
    og: { title: boolean; description: boolean; image: boolean };
  } | null;
  fixes: Fix[];
};

/** Streamed progress events (NDJSON) of POST /api/ai-visibility-check with `Accept: application/x-ndjson`. */
export type CheckEvent =
  | { type: "step"; step: StepId; status: "running" | "done" }
  | { type: "result"; result: CheckResult }
  | { type: "error"; error: string; code: string };
