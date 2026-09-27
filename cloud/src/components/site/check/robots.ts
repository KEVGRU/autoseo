/**
 * robots.txt parser and matcher following RFC 9309 and Google's documented behaviour
 * (https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt):
 *
 * - Groups start with one or more `user-agent` lines; a user-agent line after a rule starts a new group.
 * - A crawler obeys the groups whose product token equals its own (case-insensitive, all such groups merged);
 *   only when none exists does it fall back to the `*` groups. No matching group means everything is allowed.
 * - The most specific rule wins (longest pattern); on a tie between allow and disallow, allow wins.
 * - `*` matches any sequence of characters, `$` at the end anchors the pattern to the end of the path.
 * - `/robots.txt` itself is always allowed. Rules before the first user-agent line are ignored.
 *
 * Pure module (no I/O) so it can be unit tested. Matching is O(pattern × path), so hostile files can't cause
 * catastrophic regex backtracking.
 */

export type RobotsRule = { allow: boolean; pattern: string; line: number };
export type RobotsGroup = { agents: string[]; rules: RobotsRule[]; line: number };
export type ParsedRobots = { groups: RobotsGroup[]; sitemaps: string[] };

export type RobotsVerdict = {
  allowed: boolean;
  /** Which groups applied: groups naming the bot, the `*` groups, or none at all. */
  group: "specific" | "wildcard" | "none";
  /** The deciding rule (null when no rule matched the path). */
  rule: RobotsRule | null;
};

/** RFC 9309 asks crawlers to parse at least 500 KiB; anything beyond is ignored. */
export const ROBOTS_MAX_BYTES = 512 * 1024;

const USER_AGENT_KEYS = new Set(["user-agent", "useragent", "user agent"]);
const ALLOW_KEYS = new Set(["allow"]);
// Google accepts a few common misspellings of "disallow".
const DISALLOW_KEYS = new Set(["disallow", "dissallow", "dissalow", "disalow", "diasllow", "disallaw"]);

/**
 * Product token of a user-agent value: `*`, or the leading run of letters, `-` and `_`
 * ("GPTBot/1.1" → "gptbot"), lowercased. Returns "" for values that can't name a crawler.
 */
export function productToken(value: string): string {
  const v = value.trim();
  if (v.startsWith("*")) return "*";
  const m = v.match(/^[A-Za-z_-]+/);
  return m ? m[0].toLowerCase() : "";
}

export function parseRobots(input: string): ParsedRobots {
  const text = input.replace(/^﻿/, "");
  const groups: RobotsGroup[] = [];
  const sitemaps: string[] = [];
  let current: RobotsGroup | null = null;
  let collectingAgents = false;

  const lines = text.split(/\r\n|\r|\n/);
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]!;
    const hash = raw.indexOf("#");
    const line = (hash >= 0 ? raw.slice(0, hash) : raw).trim();
    if (!line) continue;
    const colon = line.indexOf(":");
    if (colon <= 0) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (USER_AGENT_KEYS.has(key)) {
      if (!current || !collectingAgents) {
        current = { agents: [], rules: [], line: i + 1 };
        groups.push(current);
      }
      const token = productToken(value);
      if (token) current.agents.push(token);
      collectingAgents = true;
      continue;
    }
    if (key === "sitemap") {
      if (value) sitemaps.push(value);
      continue;
    }
    if (!current) continue; // rules before the first user-agent line belong to no group
    collectingAgents = false;
    const allow = ALLOW_KEYS.has(key);
    if (!allow && !DISALLOW_KEYS.has(key)) continue; // crawl-delay, host, clean-param, …
    if (!value) continue; // an empty allow/disallow value means "no restriction"
    current.rules.push({ allow, pattern: normalizePattern(value), line: i + 1 });
  }
  return { groups, sitemaps };
}

/** Rules that apply to a crawler token (all groups naming it, else all `*` groups). */
export function rulesFor(robots: ParsedRobots, token: string): { group: RobotsVerdict["group"]; rules: RobotsRule[] } {
  const t = token.toLowerCase();
  const specific = robots.groups.filter((g) => g.agents.includes(t));
  if (specific.length) return { group: "specific", rules: specific.flatMap((g) => g.rules) };
  const wildcard = robots.groups.filter((g) => g.agents.includes("*"));
  if (wildcard.length) return { group: "wildcard", rules: wildcard.flatMap((g) => g.rules) };
  return { group: "none", rules: [] };
}

/**
 * Whether `pattern` matches the beginning of `path` (Google's matching algorithm: `*` = any sequence,
 * a trailing `$` = end of path, everything else literal).
 */
export function matchesPattern(pattern: string, path: string): boolean {
  const n = path.length;
  // Sorted set of path offsets the pattern prefix can end at.
  let positions: number[] = [0];
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i]!;
    if (ch === "$" && i === pattern.length - 1) return positions[positions.length - 1] === n;
    if (ch === "*") {
      const from = positions[0]!;
      positions = [];
      for (let p = from; p <= n; p++) positions.push(p);
      continue;
    }
    const next: number[] = [];
    for (const p of positions) if (p < n && path[p] === ch) next.push(p + 1);
    if (!next.length) return false;
    positions = next;
  }
  return true;
}

/** Decides whether `token` may fetch `path` (path + query, e.g. "/shop?page=2"). */
export function evaluateRobots(robots: ParsedRobots, token: string, path: string): RobotsVerdict {
  const target = normalizePath(path);
  const { group, rules } = rulesFor(robots, token);
  if (target === "/robots.txt") return { allowed: true, group, rule: null };
  let bestAllow: RobotsRule | null = null;
  let bestDisallow: RobotsRule | null = null;
  for (const rule of rules) {
    if (!matchesPattern(rule.pattern, target)) continue;
    if (rule.allow) {
      if (!bestAllow || rule.pattern.length > bestAllow.pattern.length) bestAllow = rule;
    } else if (!bestDisallow || rule.pattern.length > bestDisallow.pattern.length) {
      bestDisallow = rule;
    }
  }
  if (!bestDisallow) return { allowed: true, group, rule: bestAllow };
  if (bestAllow && bestAllow.pattern.length >= bestDisallow.pattern.length) return { allowed: true, group, rule: bestAllow };
  return { allowed: false, group, rule: bestDisallow };
}

/** Percent-encodes non-ASCII characters and uppercases existing escapes, as Google does for patterns. */
function normalizePattern(value: string): string {
  let out = "";
  for (const ch of value) {
    out += ch.charCodeAt(0) > 0x7e || ch === " " ? encodeURIComponent(ch) : ch;
  }
  return out.replace(/%[0-9a-f]{2}/gi, (m) => m.toUpperCase());
}

function normalizePath(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return normalizePattern(p);
}
