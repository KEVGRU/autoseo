import { describe, expect, it } from "vitest";
import { evaluateRobots, matchesPattern, parseRobots, productToken } from "./robots";

const allowed = (txt: string, token: string, path: string) => evaluateRobots(parseRobots(txt), token, path).allowed;

describe("matchesPattern", () => {
  it("matches prefixes literally", () => {
    expect(matchesPattern("/fish", "/fish")).toBe(true);
    expect(matchesPattern("/fish", "/fish.html")).toBe(true);
    expect(matchesPattern("/fish", "/fishheads/yummy.html")).toBe(true);
    expect(matchesPattern("/fish", "/Fish.asp")).toBe(false);
    expect(matchesPattern("/fish", "/catfish")).toBe(false);
    expect(matchesPattern("/fish/", "/fish")).toBe(false);
  });

  it("supports * and a trailing $", () => {
    expect(matchesPattern("/*.php", "/index.php")).toBe(true);
    expect(matchesPattern("/*.php", "/folder/filename.php?parameters")).toBe(true);
    expect(matchesPattern("/*.php", "/windows.PHP")).toBe(false);
    expect(matchesPattern("/*.php$", "/filename.php")).toBe(true);
    expect(matchesPattern("/*.php$", "/filename.php?parameters")).toBe(false);
    expect(matchesPattern("/*.php$", "/filename.php5")).toBe(false);
    expect(matchesPattern("/fish*.php", "/fishheads/catfish.php?parameters")).toBe(true);
    expect(matchesPattern("*", "/anything")).toBe(true);
    expect(matchesPattern("/$", "/")).toBe(true);
    expect(matchesPattern("/$", "/page")).toBe(false);
  });

  it("stays fast on hostile patterns", () => {
    const pattern = `/${"*a".repeat(200)}b`;
    const path = `/${"a".repeat(2000)}`;
    const t = performance.now();
    expect(matchesPattern(pattern, path)).toBe(false);
    expect(performance.now() - t).toBeLessThan(1000);
  });
});

describe("parseRobots / evaluateRobots", () => {
  it("allows everything without matching groups or rules", () => {
    expect(allowed("", "GPTBot", "/")).toBe(true);
    expect(allowed("User-agent: Googlebot\nDisallow: /", "GPTBot", "/")).toBe(true);
    expect(allowed("User-agent: *\nDisallow:", "GPTBot", "/")).toBe(true);
  });

  it("uses the specific group instead of *", () => {
    const txt = "User-agent: *\nDisallow: /\n\nUser-agent: GPTBot\nAllow: /";
    expect(allowed(txt, "GPTBot", "/")).toBe(true);
    expect(allowed(txt, "ClaudeBot", "/")).toBe(false);
    expect(evaluateRobots(parseRobots(txt), "GPTBot", "/").group).toBe("specific");
    expect(evaluateRobots(parseRobots(txt), "ClaudeBot", "/").group).toBe("wildcard");
  });

  it("does not fall back to * when a specific group exists but has no matching rule", () => {
    const txt = "User-agent: *\nDisallow: /\n\nUser-agent: PerplexityBot\nDisallow: /private/";
    expect(allowed(txt, "PerplexityBot", "/")).toBe(true);
    expect(allowed(txt, "PerplexityBot", "/private/x")).toBe(false);
  });

  it("matches user agents case-insensitively and ignores version suffixes", () => {
    expect(allowed("User-agent: gptbot\nDisallow: /", "GPTBot", "/")).toBe(false);
    expect(allowed("user-agent: GPTBot/1.1\ndisallow: /", "GPTBot", "/")).toBe(false);
    expect(allowed("USER-AGENT: CLAUDEBOT\nDISALLOW: /", "ClaudeBot", "/")).toBe(false);
    expect(productToken("  Meta-ExternalAgent/1.1 (+https://…)")).toBe("meta-externalagent");
  });

  it("merges multiple user-agent lines into one group and separate groups for the same agent", () => {
    const txt = "User-agent: GPTBot\nUser-agent: ClaudeBot\nDisallow: /a\n\nUser-agent: GPTBot\nDisallow: /b";
    expect(allowed(txt, "ClaudeBot", "/a")).toBe(false);
    expect(allowed(txt, "ClaudeBot", "/b")).toBe(true);
    expect(allowed(txt, "GPTBot", "/a")).toBe(false);
    expect(allowed(txt, "GPTBot", "/b")).toBe(false);
  });

  it("starts a new group when a user-agent follows rules or other fields", () => {
    const txt = "User-agent: a\nCrawl-delay: 5\nUser-agent: GPTBot\nDisallow: /";
    expect(allowed(txt, "GPTBot", "/")).toBe(false);
    expect(allowed(txt, "a", "/")).toBe(true);
  });

  it("picks the longest matching rule and lets allow win ties", () => {
    const txt = "User-agent: *\nDisallow: /shop\nAllow: /shop/public\nAllow: /page\nDisallow: /*.html";
    expect(allowed(txt, "OAI-SearchBot", "/shop/cart")).toBe(false);
    expect(allowed(txt, "OAI-SearchBot", "/shop/public/item")).toBe(true);
    expect(allowed(txt, "OAI-SearchBot", "/page")).toBe(true);
    expect(allowed(txt, "OAI-SearchBot", "/page.html")).toBe(false); // "/*.html" (7 chars) beats "/page" (5)
    const tie = "User-agent: *\nAllow: /folder\nDisallow: /folder";
    expect(allowed(tie, "GPTBot", "/folder/page")).toBe(true);
    const tie2 = "User-agent: *\nDisallow: /$\nAllow: /$";
    expect(allowed(tie2, "GPTBot", "/")).toBe(true);
  });

  it("reports the deciding rule with its line number", () => {
    const txt = "# comment\nUser-agent: *\nAllow: /page\nDisallow: /*.html\n";
    const v = evaluateRobots(parseRobots(txt), "GPTBot", "/page.html");
    expect(v.allowed).toBe(false);
    expect(v.rule).toEqual({ allow: false, pattern: "/*.html", line: 4 });
  });

  it("ignores comments, rules before any user-agent line and unknown fields; collects sitemaps", () => {
    const txt = "﻿Disallow: /\nSitemap: https://example.com/sitemap.xml\r\nUser-agent: * # everyone\r\nDisallow: /tmp # temp\r\nCrawl-delay: 10\r\nHost: example.com";
    const parsed = parseRobots(txt);
    expect(parsed.sitemaps).toEqual(["https://example.com/sitemap.xml"]);
    expect(allowed(txt, "GPTBot", "/")).toBe(true);
    expect(allowed(txt, "GPTBot", "/tmp/x")).toBe(false);
  });

  it("always allows /robots.txt and handles non-ASCII paths", () => {
    expect(allowed("User-agent: *\nDisallow: /", "GPTBot", "/robots.txt")).toBe(true);
    expect(allowed("User-agent: *\nDisallow: /über", "GPTBot", "/%C3%BCber/x")).toBe(false);
    expect(allowed("User-agent: *\nDisallow: /%c3%bcber", "GPTBot", "/%C3%BCber")).toBe(false);
  });

  it("accepts common misspellings of disallow", () => {
    expect(allowed("User-agent: *\nDissallow: /", "GPTBot", "/")).toBe(false);
  });
});
