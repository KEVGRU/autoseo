import { describe, expect, it } from "vitest";
import type { CheckAnswer, ReadinessResult } from "@/features/visibility-check/types";
import {
  READINESS_BOTS,
  analyzePageHtml,
  brandStats,
  buildBrandDefs,
  engineSummary,
  estimateCheckCostUsd,
  evaluateBotAccess,
  overallScore,
  positionQuality,
  ruleActions,
  scoreAnswerText,
  scoreReadiness,
  summarizeVisibility,
  topSources,
  type ReadinessBase,
} from "./visibility-scoring";

const byToken = (bots: ReturnType<typeof evaluateBotAccess>) => Object.fromEntries(bots.map((b) => [b.token, b]));

describe("AI crawler access per bot (robots.txt)", () => {
  it("covers the 11 crawlers of the free check", () => {
    expect(READINESS_BOTS.map((b) => b.token)).toEqual([
      "GPTBot",
      "OAI-SearchBot",
      "ChatGPT-User",
      "ClaudeBot",
      "Claude-SearchBot",
      "PerplexityBot",
      "Google-Extended",
      "Applebot-Extended",
      "Bingbot",
      "CCBot",
      "meta-externalagent",
    ]);
    expect(READINESS_BOTS.find((b) => b.token === "OAI-SearchBot")?.purpose).toBe("search");
    expect(READINESS_BOTS.find((b) => b.token === "GPTBot")?.purpose).toBe("training");
  });

  it("allows everything without a robots.txt", () => {
    const bots = evaluateBotAccess(null);
    expect(bots.every((b) => b.status === "allowed" && b.homepageAllowed && b.source === "none")).toBe(true);
  });

  it("treats a 5xx robots.txt as full disallow (RFC 9309)", () => {
    const bots = evaluateBotAccess("User-agent: *\nAllow: /", {
      unreachable: true,
    });
    expect(bots.every((b) => b.status === "blocked" && !b.homepageAllowed)).toBe(true);
  });

  it("blocks bots named in their own group and falls back to the wildcard group for the rest", () => {
    const robots = ["User-agent: GPTBot", "User-agent: CCBot", "Disallow: /", "", "User-agent: *", "Disallow: /cart", "Disallow: /admin/"].join("\n");
    const bots = byToken(evaluateBotAccess(robots));
    expect(bots.GPTBot!.status).toBe("blocked");
    expect(bots.GPTBot!.rule).toBe("Disallow: /");
    expect(bots.GPTBot!.line).toBe(3);
    expect(bots.GPTBot!.source).toBe("specific");
    expect(bots.CCBot!.status).toBe("blocked");
    // Wildcard rules for cart/admin paths are normal → allowed.
    expect(bots["OAI-SearchBot"]!.status).toBe("allowed");
    expect(bots["OAI-SearchBot"]!.source).toBe("wildcard");
    expect(bots.PerplexityBot!.homepageAllowed).toBe(true);
  });

  it("marks path restrictions in a bot-specific group and a blocked homepage path as partial", () => {
    const robots = [
      "User-agent: PerplexityBot",
      "Disallow: /products/",
      "",
      "User-agent: ClaudeBot",
      "Disallow: /",
      "Allow: /blog/",
      "",
      "User-agent: Bingbot",
      "Disallow: /de/",
    ].join("\n");
    const bots = byToken(evaluateBotAccess(robots, { homepagePath: "/de/" }));
    expect(bots.PerplexityBot!.status).toBe("partial");
    expect(bots.PerplexityBot!.rule).toBe("Disallow: /products/");
    // Root disallowed with an Allow exception, homepage (/de/) disallowed too → blocked.
    expect(bots.ClaudeBot!.status).toBe("blocked");
    // Root allowed but the homepage the site redirects to is disallowed → partial.
    expect(bots.Bingbot!.status).toBe("partial");
    expect(bots.Bingbot!.homepageAllowed).toBe(false);
  });

  it("matches user-agent tokens case-insensitively and by product token", () => {
    const bots = byToken(evaluateBotAccess("User-agent: meta-externalagent/1.1\nDisallow: /\n\nUser-agent: claude-searchbot\nDisallow: /"));
    expect(bots["meta-externalagent"]!.status).toBe("blocked");
    expect(bots["Claude-SearchBot"]!.status).toBe("blocked");
    expect(bots.ClaudeBot!.status).toBe("allowed");
  });
});

const ssrHtml = `<!doctype html><html lang="de"><head><title>Solar storage | Acme</title>
<meta name="description" content="Balcony solar storage systems.">
<link rel="canonical" href="https://acme.test/">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"Acme"}</script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Product","name":"Box"}</script>
</head><body><h1>Acme solar storage</h1><main>${"<p>Our balcony power plant storage keeps your solar energy for the evening and night so you use more of what you produce.</p>".repeat(12)}
${Array.from({ length: 8 }, (_, i) => `<a href="/p${i}">Page ${i}</a>`).join("")}</main></body></html>`;

const csrHtml = `<!doctype html><html><head><title>App</title><script src="/static/js/main.js"></script></head>
<body><noscript>You need to enable JavaScript to run this app.</noscript><div id="root"></div></body></html>`;

describe("raw-HTML page signals (SSR detection)", () => {
  it("detects server-rendered content, metadata and JSON-LD types", () => {
    const p = analyzePageHtml(ssrHtml, "https://acme.test/");
    expect(p.rendering).toBe("ssr");
    expect(p.wordCount).toBeGreaterThan(150);
    expect(p.title).toBe("Solar storage | Acme");
    expect(p.metaDescription).toBe("Balcony solar storage systems.");
    expect(p.canonical).toBe("https://acme.test/");
    expect(p.lang).toBe("de");
    expect(p.h1Count).toBe(1);
    expect(p.jsonLdCount).toBe(2);
    expect(p.jsonLdTypes).toEqual(expect.arrayContaining(["Organization", "Product"]));
    expect(p.noindex).toBe(false);
  });

  it("detects JS-only apps (empty root, enable-JavaScript notice)", () => {
    const p = analyzePageHtml(csrHtml, "https://app.test/");
    expect(p.rendering).toBe("csr");
    expect(p.wordCount).toBeLessThan(40);
    expect(p.jsonLdCount).toBe(0);
  });

  it("reads noindex and AI opt-out directives from meta robots and X-Robots-Tag", () => {
    const html = `<html><head><meta name="robots" content="noindex, nofollow"><meta name="gptbot" content="noai"></head><body></body></html>`;
    const p = analyzePageHtml(html, "https://x.test/", "nosnippet");
    expect(p.noindex).toBe(true);
    expect(p.aiDirectives).toEqual(expect.arrayContaining(["noai", "nosnippet"]));
  });
});

function base(overrides: Partial<ReadinessBase> = {}): ReadinessBase {
  return {
    checkedAt: "2026-09-26T00:00:00.000Z",
    requestedUrl: "https://acme.test/",
    finalUrl: "https://acme.test/",
    http: {
      status: 200,
      redirects: [],
      https: true,
      ttfbMs: 120,
      xRobotsTag: null,
      error: null,
    },
    robots: {
      url: "https://acme.test/robots.txt",
      found: true,
      status: 200,
      unreachable: false,
      sitemaps: 1,
      error: null,
    },
    bots: evaluateBotAccess("User-agent: *\nDisallow: /cart"),
    llmsTxt: {
      url: "https://acme.test/llms.txt",
      present: true,
      status: 200,
      title: "Acme",
      links: 12,
      issues: [],
    },
    page: analyzePageHtml(ssrHtml, "https://acme.test/"),
    firewall: {
      userAgent: "OAI-SearchBot",
      status: 200,
      verdict: "ok",
      reason: null,
    },
    ...overrides,
  };
}

describe("AI readiness score", () => {
  it("gives a well-prepared site a perfect score and only passing findings", () => {
    const r = scoreReadiness(base());
    expect(r.score).toBe(100);
    expect(r.categories.reduce((a, c) => a + c.max, 0)).toBe(100);
    expect(r.findings.every((f) => f.severity === "pass")).toBe(true);
  });

  it("penalizes blocked AI search crawlers with a critical finding and an allow snippet", () => {
    const r = scoreReadiness(
      base({
        bots: evaluateBotAccess("User-agent: OAI-SearchBot\nUser-agent: PerplexityBot\nDisallow: /"),
      }),
    );
    const crawlers = r.categories.find((c) => c.key === "crawlers")!;
    expect(crawlers.score).toBeLessThan(35);
    const f = r.findings[0]!;
    expect(f.id).toBe("answer-bots-blocked");
    expect(f.severity).toBe("critical");
    expect(f.snippet).toContain("User-agent: OAI-SearchBot\nAllow: /");
    expect(f.snippet).toContain("User-agent: PerplexityBot\nAllow: /");
  });

  it("weights training crawlers lower than search crawlers", () => {
    const training = scoreReadiness(base({ bots: evaluateBotAccess("User-agent: GPTBot\nDisallow: /") }));
    const search = scoreReadiness(
      base({
        bots: evaluateBotAccess("User-agent: OAI-SearchBot\nDisallow: /"),
      }),
    );
    expect(training.score).toBeGreaterThan(search.score);
    expect(training.findings.find((f) => f.id === "training-bots-blocked")?.severity).toBe("info");
  });

  it("flags JS-only pages, missing JSON-LD, noindex and HTTP errors", () => {
    const csr = scoreReadiness(base({ page: analyzePageHtml(csrHtml, "https://app.test/") }));
    expect(csr.findings.find((f) => f.id === "rendering")?.severity).toBe("critical");
    expect(csr.categories.find((c) => c.key === "rendering")?.score).toBe(0);
    expect(csr.findings.find((f) => f.id === "jsonld-missing")?.snippet).toContain('"@type": "Organization"');

    const noindex = scoreReadiness(base({ page: { ...base().page!, noindex: true } }));
    expect(noindex.findings[0]!.id).toBe("noindex");
    expect(noindex.categories.find((c) => c.key === "metadata")?.score).toBe(0);

    const down = scoreReadiness(base({ http: { ...base().http, status: 503 } }));
    expect(down.findings.some((f) => f.id === "http-status" && f.severity === "critical")).toBe(true);
    expect(down.score).toBeLessThanOrEqual(40);
  });

  it("treats a missing llms.txt as optional info and a firewall block as a warning", () => {
    const r = scoreReadiness(
      base({
        llmsTxt: {
          url: "x",
          present: false,
          status: 404,
          title: null,
          links: 0,
          issues: [],
        },
        firewall: {
          userAgent: "OAI-SearchBot",
          status: 403,
          verdict: "blocked",
          reason: "HTTP 403",
        },
      }),
    );
    expect(r.findings.find((f) => f.id === "llms")?.severity).toBe("info");
    expect(r.findings.find((f) => f.id === "firewall")?.severity).toBe("warning");
    expect(r.score).toBe(100 - 5 - 8);
  });
});

const brand = {
  name: "Solakon",
  aliases: ["Solakon ONE"],
  competitors: [
    { name: "Anker SOLIX", domain: "anker.com" },
    { name: "Zendure", domain: "zendure.de" },
    { name: "EcoFlow", domain: null },
  ],
};

function answer(engine: string, promptIndex: number, text: string, citations: string[] = []): CheckAnswer {
  const defs = buildBrandDefs("solakon.de", brand);
  return {
    engine,
    promptIndex,
    provider: "dataforseo",
    model: "m",
    simulated: false,
    noAnswer: !text.trim(),
    excerpt: text,
    costUsd: 0.02,
    ...scoreAnswerText(
      text,
      citations.map((url) => ({ url, title: null })),
      defs,
    ),
  };
}

describe("answer scoring", () => {
  const defs = buildBrandDefs("solakon.de", brand);

  it("finds the own brand (name, alias, domain) and its position among tracked brands", () => {
    const a = answer("chatgpt", 0, "Top picks: **Zendure SolarFlow**, then Anker SOLIX and the Solakon ONE. [link](https://solakon.de/one)", [
      "https://www.solakon.de/one",
      "https://reddit.com/r/solar",
    ]);
    expect(a.mentioned).toBe(true);
    expect(a.position).toBe(3);
    expect(a.brands).toEqual(["c1", "c0", "own"]);
    expect(a.ownCited).toBe(true);
    expect(a.citations.map((c) => c.domain)).toEqual(["solakon.de", "reddit.com"]);
  });

  it("does not count citation URLs or partial words as mentions", () => {
    const a = answer("perplexity", 1, "EcoFlow leads. See https://solakon.de/blog for details. Solakonia is unrelated.");
    expect(a.mentioned).toBe(false);
    expect(a.position).toBeNull();
    expect(a.brands).toEqual(["c2"]);
  });

  it("summarizes visibility, brands, sources and engines", () => {
    const answers = [
      answer("chatgpt", 0, "Solakon is the best, then Zendure.", ["https://solakon.de", "https://reddit.com/x"]),
      answer("chatgpt", 1, "Zendure and Anker SOLIX.", ["https://reddit.com/y", "https://anker.com/p"]),
      answer("perplexity", 0, "Anker SOLIX first, Solakon second.", ["https://test.de/a"]),
      answer("perplexity", 1, "Nothing relevant.", []),
    ];
    const v = summarizeVisibility(answers)!;
    expect(v.answers).toBe(4);
    expect(v.mentions).toBe(2);
    expect(v.mentionRate).toBe(50);
    expect(v.avgPosition).toBe(1.5);
    expect(v.citationRate).toBe(25);
    // 0.7 × 0.5 + 0.2 × (1 + 0.8) / 4 + 0.1 × 0.25
    expect(v.score).toBe(Math.round(100 * (0.35 + 0.09 + 0.025)));

    const stats = brandStats(answers, defs, {
      own: "solakon.de",
      c0: "anker.com",
      c1: "zendure.de",
      c2: null,
    });
    expect(stats[0]).toMatchObject({
      key: "own",
      mentions: 2,
      mentionRate: 50,
      avgPosition: 1.5,
      firstPlace: 1,
    });
    expect(stats.find((s) => s.key === "c1")).toMatchObject({
      mentions: 2,
      firstPlace: 1,
    });
    expect(stats.find((s) => s.key === "c2")).toMatchObject({
      mentions: 0,
      mentionRate: 0,
      avgPosition: null,
    });

    const sources = topSources(answers, defs);
    expect(sources[0]).toMatchObject({
      domain: "reddit.com",
      answers: 2,
      owner: "other",
    });
    expect(sources.find((s) => s.domain === "solakon.de")?.owner).toBe("own");
    expect(sources.find((s) => s.domain === "anker.com")).toMatchObject({
      owner: "competitor",
      competitor: "Anker SOLIX",
    });

    const e = engineSummary(
      {
        id: "perplexity",
        name: "Perplexity",
        provider: "api",
        simulated: false,
        error: null,
      },
      answers,
      defs,
    );
    expect(e).toMatchObject({
      answers: 2,
      mentions: 1,
      mentionRate: 50,
      avgPosition: 2,
      ownCitations: 0,
      topCompetitor: "Anker SOLIX",
    });
  });

  it("scores prominence and blends readiness with visibility", () => {
    expect([1, 2, 3, 4, 7].map(positionQuality)).toEqual([1, 0.8, 0.65, 0.5, 0.4]);
    expect(positionQuality(null)).toBe(0);
    expect(summarizeVisibility([])).toBeNull();
    expect(overallScore(80, null)).toBe(80);
    expect(overallScore(80, 20)).toBe(Math.round(0.35 * 80 + 0.65 * 20));
    expect(estimateCheckCostUsd(3, 5)).toBe(0.55);
  });
});

describe("rule-based actions", () => {
  it("puts blocked crawlers and low visibility first, max 3, grounded in measured data", () => {
    const readiness = scoreReadiness(
      base({
        bots: evaluateBotAccess("User-agent: OAI-SearchBot\nDisallow: /"),
        llmsTxt: {
          url: "x",
          present: false,
          status: 404,
          title: null,
          links: 0,
          issues: [],
        },
      }),
    ) as Pick<ReadinessResult, "findings">;
    const answers = [answer("chatgpt", 0, "Zendure is best.", ["https://reddit.com/x"]), answer("chatgpt", 1, "Zendure again.", ["https://test.de/y"])];
    const defs = buildBrandDefs("solakon.de", brand);
    const ai = {
      visibility: summarizeVisibility(answers),
      brands: brandStats(answers, defs, {}),
      sources: topSources(answers, defs),
    };
    const actions = ruleActions(readiness, ai);
    expect(actions).toHaveLength(3);
    expect(actions[0]!.title).toBe("Let AI search crawlers in");
    expect(actions[1]!.detail).toContain("reddit.com");
    expect(actions[2]!.title).toContain("Zendure");
  });

  it("works without AI data", () => {
    const readiness = scoreReadiness(base({ page: analyzePageHtml(csrHtml, "https://app.test/") }));
    const actions = ruleActions(readiness, null);
    expect(actions[0]!.title).toBe("Server-render your main content");
    expect(actions.length).toBeGreaterThan(0);
  });
});
