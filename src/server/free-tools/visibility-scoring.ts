/**
 * Free AI Visibility Check — pure scoring (no I/O, unit tested):
 * robots.txt access per AI crawler, raw-HTML page signals, the AI readiness score + findings, brand matching of AI
 * answers, the visibility score and rule-based actions.
 */
import { classifyAccess, formatRule, isAllowed, parseRobotsTxt } from "../audit-crawler/robots";
import { extractHtmlSignals, parseDirectives } from "../crawlability/html-signals";
import { matchBrands, ownBrandTerms, type BrandDef } from "../ai/analysis/brand-match";
import { urlDomain } from "../ai/analysis/sources";
import { AI_BOTS } from "../../lib/engines";
import type {
  BrandStat,
  CheckAction,
  CheckAnswer,
  CheckBrand,
  CheckCitation,
  EngineSummary,
  ReadinessBot,
  ReadinessBotPurpose,
  ReadinessCategory,
  ReadinessCategoryKey,
  ReadinessFinding,
  ReadinessPage,
  ReadinessResult,
  SourceStat,
  VisibilitySummary,
} from "../../features/visibility-check/types";

/* ───────────────────────────── AI crawlers ───────────────────────────── */

/** The crawlers the free check reports on (robots.txt product tokens). */
export const READINESS_BOT_TOKENS = [
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
] as const;

export const READINESS_BOTS = READINESS_BOT_TOKENS.map((token) => {
  const bot = AI_BOTS.find((b) => b.token === token)!;
  return {
    token,
    name: bot.name,
    company: bot.company,
    purpose: bot.purpose as ReadinessBotPurpose,
  };
});

/** Search / user-triggered fetchers decide whether AI answers can cite you; training crawlers matter less. */
export function botWeight(purpose: ReadinessBotPurpose): number {
  return purpose === "training" ? 1 : 3;
}

/**
 * robots.txt access per AI crawler (RFC 9309 semantics via the audit crawler's parser).
 * - blocked: the site root and the homepage are disallowed
 * - partial: the homepage or the root is disallowed (with exceptions), or a group naming the bot restricts paths
 * - allowed: otherwise (wildcard rules for /cart, /admin … are normal and not counted)
 * A robots.txt answering 5xx means "disallow everything" (RFC 9309 §2.3.1.4).
 */
export function evaluateBotAccess(robotsText: string | null, opts: { unreachable?: boolean; homepagePath?: string } = {}): ReadinessBot[] {
  const homepagePath = opts.homepagePath || "/";
  if (opts.unreachable) {
    return READINESS_BOTS.map((b) => ({
      ...b,
      status: "blocked",
      homepageAllowed: false,
      rule: "robots.txt unreachable (HTTP 5xx)",
      line: null,
      source: "none",
    }));
  }
  const robots = parseRobotsTxt(robotsText);
  return READINESS_BOTS.map((bot) => {
    const cls = classifyAccess(robots, bot.token);
    const home = isAllowed(robots, bot.token, homepagePath);
    const disallows = cls.group.rules.filter((r) => r.type === "disallow" && r.path);
    let status: ReadinessBot["status"];
    if (!cls.rootVerdict.allowed && !home.allowed) status = "blocked";
    else if (!home.allowed || !cls.rootVerdict.allowed) status = "partial";
    else if (cls.group.source === "specific" && disallows.length) status = "partial";
    else status = "allowed";
    const decisive =
      (!home.allowed ? home.rule : null) ?? (!cls.rootVerdict.allowed ? cls.rootVerdict.rule : null) ?? (status === "partial" ? (disallows[0] ?? null) : null);
    return {
      ...bot,
      status,
      homepageAllowed: home.allowed,
      rule: formatRule(decisive),
      line: decisive?.line ?? null,
      source: cls.group.source,
    };
  });
}

/* ───────────────────────────── Page signals ───────────────────────────── */

const AI_USAGE_DIRECTIVES = new Set(["noai", "noimageai", "nosnippet", "max-snippet:0"]);

/** What AI crawlers see in the raw HTML (they don't run JavaScript): text, metadata, JSON-LD, directives. */
export function analyzePageHtml(html: string, url: string, xRobotsTag: string | null = null): ReadinessPage {
  const s = extractHtmlSignals(html, url);
  const directives = parseDirectives(s.metaRobots, xRobotsTag);
  const general = directives.filter((d) => d.scope === "all" || READINESS_BOT_TOKENS.some((t) => t.toLowerCase() === d.scope));
  return {
    title: s.title.trim(),
    metaDescription: s.metaDescription.trim(),
    canonical: s.canonical,
    lang: s.lang,
    h1Count: s.h1Count,
    wordCount: s.wordCount,
    rendering: s.rendering.verdict,
    frameworks: s.rendering.frameworks,
    jsonLdTypes: s.jsonLd.types,
    jsonLdCount: s.jsonLd.count,
    jsonLdInvalid: s.jsonLd.invalid,
    noindex: general.some((d) => d.directive === "noindex"),
    aiDirectives: [...new Set(general.filter((d) => AI_USAGE_DIRECTIVES.has(d.directive)).map((d) => d.directive))],
  };
}

/* ───────────────────────────── Readiness score ───────────────────────────── */

export type ReadinessBase = Omit<ReadinessResult, "score" | "categories" | "findings">;

const CATEGORY_LABELS: Record<ReadinessCategoryKey, { label: string; max: number }> = {
  crawlers: { label: "AI crawler access", max: 35 },
  rendering: { label: "Server-rendered content", max: 20 },
  structured: { label: "Structured data", max: 15 },
  metadata: { label: "Title, description & canonical", max: 15 },
  http: { label: "HTTP & HTTPS", max: 10 },
  llms: { label: "llms.txt", max: 5 },
};

const ENTITY_TYPES = /^(Organization|Corporation|LocalBusiness|OnlineStore|Store|Brand|Person|NGO|EducationalOrganization|MedicalOrganization|WebSite)$/i;
const CONTENT_TYPES =
  /^(Product|ProductGroup|Offer|AggregateOffer|Service|SoftwareApplication|FAQPage|HowTo|Article|BlogPosting|NewsArticle|Review|AggregateRating|Recipe|Event|Course|ItemList|BreadcrumbList)$/i;

const ACCESS_VALUE = { allowed: 1, partial: 0.5, blocked: 0 } as const;

function listNames(bots: ReadinessBot[]): string {
  const names = bots.map((b) => b.name);
  return names.length <= 2 ? names.join(" and ") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

function robotsAllowSnippet(bots: ReadinessBot[]): string {
  return bots.map((b) => `User-agent: ${b.token}\nAllow: /`).join("\n\n");
}

function organizationSnippet(base: ReadinessBase): string {
  const origin = (() => {
    try {
      return new URL(base.finalUrl ?? base.requestedUrl).origin;
    } catch {
      return base.requestedUrl;
    }
  })();
  const name = (base.page?.title.split(/\s[|–—-]\s/)[0] ?? "").trim() || new URL(origin).hostname.replace(/^www\./, "");
  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name,
      url: origin,
      logo: `${origin}/logo.png`,
      sameAs: ["https://www.linkedin.com/company/…"],
    },
    null,
    2,
  );
}

/** AI readiness score (0–100), per-category scores and findings (worst first). */
export function scoreReadiness(base: ReadinessBase): {
  score: number;
  categories: ReadinessCategory[];
  findings: ReadinessFinding[];
} {
  const findings: ReadinessFinding[] = [];
  const pts: Record<ReadinessCategoryKey, number> = {
    crawlers: 0,
    rendering: 0,
    structured: 0,
    metadata: 0,
    http: 0,
    llms: 0,
  };
  const page = base.page;
  const status = base.http.status;
  const pageOk = status !== null && status >= 200 && status < 300 && !!page;

  // AI crawler access (35)
  const totalWeight = base.bots.reduce((a, b) => a + botWeight(b.purpose), 0) || 1;
  const access = base.bots.reduce((a, b) => a + botWeight(b.purpose) * ACCESS_VALUE[b.status], 0) / totalWeight;
  pts.crawlers = CATEGORY_LABELS.crawlers.max * access;
  const blockedAnswerBots = base.bots.filter((b) => b.purpose !== "training" && b.status === "blocked");
  const partialAnswerBots = base.bots.filter((b) => b.purpose !== "training" && b.status === "partial");
  const blockedTraining = base.bots.filter((b) => b.purpose === "training" && b.status !== "allowed");
  if (base.robots.unreachable) {
    findings.push({
      id: "robots-unreachable",
      severity: "critical",
      category: "crawlers",
      title: "robots.txt returns a server error",
      detail: `${base.robots.url} answered HTTP ${base.robots.status}. Crawlers must then treat the whole site as disallowed, so AI search engines skip it.`,
      fix: "Serve robots.txt with HTTP 200 (or 404 if you don't need one).",
    });
  } else if (blockedAnswerBots.length) {
    findings.push({
      id: "answer-bots-blocked",
      severity: "critical",
      category: "crawlers",
      title: `${listNames(blockedAnswerBots)} ${blockedAnswerBots.length === 1 ? "is" : "are"} blocked`,
      detail:
        "These crawlers fetch pages for AI search answers and citations. While they are blocked, ChatGPT search, Claude, Perplexity or Copilot can't read or cite your site.",
      fix: "Allow them in robots.txt (more specific groups win over `User-agent: *`).",
      snippet: robotsAllowSnippet(blockedAnswerBots),
    });
  }
  if (partialAnswerBots.length && !base.robots.unreachable) {
    findings.push({
      id: "answer-bots-partial",
      severity: "warning",
      category: "crawlers",
      title: `${listNames(partialAnswerBots)} can only crawl part of the site`,
      detail: `robots.txt restricts ${partialAnswerBots.length === 1 ? "this AI search crawler" : "these AI search crawlers"} (${partialAnswerBots
        .map((b) => `${b.name}: ${b.rule ?? "restricted"}`)
        .join("; ")}). Pages they can't fetch can't be cited in AI answers.`,
      fix: "Check that product, category and guide pages are not disallowed for them.",
    });
  }
  if (blockedTraining.length && !base.robots.unreachable) {
    findings.push({
      id: "training-bots-blocked",
      severity: "info",
      category: "crawlers",
      title: `Training crawlers restricted: ${listNames(blockedTraining)}`,
      detail:
        "Future model versions won't learn about your brand from your own site. That's a legitimate choice — just make sure it's deliberate, and keep the search crawlers open.",
    });
  }
  if (!blockedAnswerBots.length && !partialAnswerBots.length && !base.robots.unreachable) {
    findings.push({
      id: "answer-bots-open",
      severity: "pass",
      category: "crawlers",
      title: "AI search crawlers are allowed",
      detail: base.robots.found
        ? "robots.txt lets OAI-SearchBot, ChatGPT-User, Claude-SearchBot, PerplexityBot and Bingbot fetch your homepage."
        : "No robots.txt found, so every crawler is allowed.",
    });
  }
  if (base.firewall?.verdict === "blocked") {
    pts.crawlers -= 8;
    findings.push({
      id: "firewall",
      severity: "warning",
      category: "crawlers",
      title: "Your firewall may block AI crawlers",
      detail: `Requesting the homepage as ${base.firewall.userAgent} returned ${base.firewall.reason ?? "an error"} while a regular browser got the page. Real crawlers come from verified IP ranges and may pass — check your CDN / WAF bot settings (e.g. Cloudflare "Block AI bots").`,
      fix: "Allow verified AI search crawlers in your CDN / WAF bot rules.",
    });
  }
  if (page?.aiDirectives.length) {
    pts.crawlers -= 5;
    findings.push({
      id: "ai-directives",
      severity: "warning",
      category: "crawlers",
      title: `The homepage opts out of AI usage (${page.aiDirectives.join(", ")})`,
      detail:
        "These meta robots / X-Robots-Tag directives tell search and AI systems not to show snippets or use the content, which limits how answers can quote you.",
      fix: "Remove the directive unless you deliberately want to stay out of AI answers.",
    });
  }

  // HTTP & HTTPS (10)
  if (status === null) {
    findings.push({
      id: "http-error",
      severity: "critical",
      category: "http",
      title: "The homepage could not be loaded",
      detail: base.http.error ? `Error: ${base.http.error}` : "The request failed.",
      fix: "Make sure the site is reachable over HTTPS without a login.",
    });
  } else if (status >= 400) {
    findings.push({
      id: "http-status",
      severity: "critical",
      category: "http",
      title: `The homepage answers HTTP ${status}`,
      detail: [401, 403, 429, 503].includes(status)
        ? `Our checker (an automated request from a data center, like AI crawlers) got HTTP ${status} instead of the page. If browsers see the page, bot protection is turning automated visitors away — AI crawlers that are treated the same can't read or cite your site. Page-level checks below could not run.`
        : "Crawlers that get an error page instead of content can't learn anything about your brand. Page-level checks below could not run.",
      fix: [401, 403, 429, 503].includes(status)
        ? "Allow verified AI search crawlers (OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-SearchBot, Bingbot) in your CDN / WAF bot rules."
        : "Serve the homepage with HTTP 200.",
    });
  } else {
    pts.http += 6;
    if (base.http.https) pts.http += 2;
    else
      findings.push({
        id: "no-https",
        severity: "warning",
        category: "http",
        title: "The site doesn't end up on HTTPS",
        detail: "Most AI and search systems prefer secure pages as sources.",
        fix: "Redirect all HTTP traffic to HTTPS.",
      });
    if (base.http.redirects.length <= 2) pts.http += 2;
    else
      findings.push({
        id: "redirect-chain",
        severity: "info",
        category: "http",
        title: `${base.http.redirects.length} redirects before the homepage`,
        detail: base.http.redirects.map((r) => `${r.status} ${r.url}`).join(" → "),
        fix: "Link and redirect straight to the final URL.",
      });
  }

  if (pageOk && page) {
    // Server-rendered content (20)
    if (page.rendering === "ssr") {
      pts.rendering = 20;
      findings.push({
        id: "rendering",
        severity: "pass",
        category: "rendering",
        title: "Content is in the HTML",
        detail: `The homepage ships ${page.wordCount} words of text without JavaScript — AI crawlers can read it.`,
      });
    } else if (page.rendering === "partial") {
      pts.rendering = 10;
      findings.push({
        id: "rendering",
        severity: "warning",
        category: "rendering",
        title: `Only ${page.wordCount} words without JavaScript`,
        detail: "Most AI crawlers don't execute JavaScript. Text that only appears after rendering is invisible to them.",
        fix: "Server-render (or pre-render) your main content, headings and product information.",
      });
    } else {
      findings.push({
        id: "rendering",
        severity: "critical",
        category: "rendering",
        title: "The homepage is empty without JavaScript",
        detail: `The raw HTML contains ${page.wordCount} words${page.frameworks.length ? ` (${page.frameworks.join(", ")} app)` : ""}. AI crawlers see an empty page.`,
        fix: "Enable server-side rendering or static pre-rendering for public pages.",
      });
    }

    // Structured data (15)
    const hasEntity = page.jsonLdTypes.some((t) => ENTITY_TYPES.test(t));
    const hasContent = page.jsonLdTypes.some((t) => CONTENT_TYPES.test(t));
    if (page.jsonLdCount > 0) pts.structured += 7;
    if (hasEntity) pts.structured += 4;
    if (hasContent) pts.structured += 4;
    if (page.jsonLdInvalid > 0) {
      pts.structured = Math.max(0, pts.structured - 3);
      findings.push({
        id: "jsonld-invalid",
        severity: "warning",
        category: "structured",
        title: `${page.jsonLdInvalid} JSON-LD block${page.jsonLdInvalid === 1 ? "" : "s"} can't be parsed`,
        detail: "Invalid JSON is ignored by crawlers.",
        fix: "Validate the markup with the Schema.org validator.",
      });
    }
    if (page.jsonLdCount === 0) {
      findings.push({
        id: "jsonld-missing",
        severity: "warning",
        category: "structured",
        title: "No structured data (JSON-LD) on the homepage",
        detail: "Schema.org markup tells AI systems unambiguously who you are and what you offer (organization, products, prices, ratings).",
        fix: "Add Organization markup (plus Product / Service / FAQPage where relevant).",
        snippet: `<script type="application/ld+json">\n${organizationSnippet(base)}\n</script>`,
      });
    } else if (!hasEntity) {
      findings.push({
        id: "jsonld-no-entity",
        severity: "info",
        category: "structured",
        title: "No Organization markup",
        detail: `Found ${page.jsonLdTypes.join(", ") || "JSON-LD"}, but nothing that describes the company itself.`,
        fix: "Add an Organization block with name, logo and sameAs profiles.",
        snippet: `<script type="application/ld+json">\n${organizationSnippet(base)}\n</script>`,
      });
    } else {
      findings.push({
        id: "jsonld",
        severity: "pass",
        category: "structured",
        title: "Structured data found",
        detail: page.jsonLdTypes.slice(0, 8).join(", "),
      });
    }

    // Metadata (15)
    if (page.title) pts.metadata += 4;
    else
      findings.push({
        id: "title",
        severity: "warning",
        category: "metadata",
        title: "Missing <title>",
        detail: "The title is the first thing crawlers and answer engines use to label your page.",
        fix: "Add a descriptive title with your brand and main offer.",
      });
    if (page.metaDescription) pts.metadata += 4;
    else
      findings.push({
        id: "description",
        severity: "warning",
        category: "metadata",
        title: "Missing meta description",
        detail: "A clear one-sentence summary helps AI systems describe your brand correctly.",
        fix: "Add a meta description (120–160 characters) that says what you offer and for whom.",
      });
    if (page.canonical) pts.metadata += 3;
    else
      findings.push({
        id: "canonical",
        severity: "info",
        category: "metadata",
        title: "No canonical URL",
        detail: "A canonical tag consolidates duplicate URLs into one source.",
        fix: 'Add <link rel="canonical" href="…">.',
      });
    if (page.lang) pts.metadata += 2;
    else
      findings.push({
        id: "lang",
        severity: "info",
        category: "metadata",
        title: "No language declared",
        detail: "Without <html lang> the page language has to be guessed.",
        fix: 'Set <html lang="…">.',
      });
    if (page.h1Count > 0) pts.metadata += 2;
    if (page.noindex) {
      pts.metadata = 0;
      findings.push({
        id: "noindex",
        severity: "critical",
        category: "metadata",
        title: "The homepage is set to noindex",
        detail: "AI search engines rely on search indexes (Bing, Google). A noindex page drops out of them.",
        fix: "Remove the noindex directive from public pages.",
      });
    }
  }

  // llms.txt (5)
  if (base.llmsTxt.present) {
    pts.llms = base.llmsTxt.issues.length ? 3 : 5;
    findings.push({
      id: "llms",
      severity: base.llmsTxt.issues.length ? "info" : "pass",
      category: "llms",
      title: base.llmsTxt.issues.length ? "llms.txt found, with issues" : "llms.txt found",
      detail: base.llmsTxt.issues.length
        ? base.llmsTxt.issues.slice(0, 3).join(" ")
        : `${base.llmsTxt.links} links${base.llmsTxt.title ? ` · “${base.llmsTxt.title}”` : ""}.`,
    });
  } else {
    findings.push({
      id: "llms",
      severity: "info",
      category: "llms",
      title: "No llms.txt",
      detail: "An optional, emerging convention: a markdown map of your most important pages for AI assistants. Cheap to add; not used by Google.",
      fix: "Publish /llms.txt with a one-line summary and links to key pages.",
    });
  }

  const categories = (Object.keys(CATEGORY_LABELS) as ReadinessCategoryKey[]).map((key) => ({
    key,
    label: CATEGORY_LABELS[key].label,
    max: CATEGORY_LABELS[key].max,
    score: Math.max(0, Math.min(CATEGORY_LABELS[key].max, Math.round(pts[key]))),
  }));
  const score = Math.max(
    0,
    Math.min(
      100,
      categories.reduce((a, c) => a + c.score, 0),
    ),
  );
  const order = { critical: 0, warning: 1, info: 2, pass: 3 } as const;
  findings.sort((a, b) => order[a.severity] - order[b.severity]);
  return { score, categories, findings };
}

/* ───────────────────────────── AI answers ───────────────────────────── */

/** Own brand ("own") + competitors ("c0", "c1", …) as brand-matcher definitions. */
export function buildBrandDefs(domain: string, brand: Pick<CheckBrand, "name" | "aliases" | "competitors">): BrandDef[] {
  const defs: BrandDef[] = [
    {
      key: "own",
      name: brand.name,
      terms: ownBrandTerms({
        name: brand.name,
        domain,
        brand: { aliases: brand.aliases },
      }),
      domains: [domain],
      isOwn: true,
      competitorId: null,
    },
  ];
  brand.competitors.forEach((c, i) => {
    const terms = [c.name, ...(c.domain ? [c.domain] : [])].filter((t) => t.trim().length >= 2);
    defs.push({
      key: `c${i}`,
      name: c.name,
      terms,
      domains: c.domain ? [c.domain] : [],
      isOwn: false,
      competitorId: null,
    });
  });
  return defs;
}

const MAX_CITATIONS = 12;

/** Brand hits for one answer: own mention + position among tracked brands, brands named, own domain cited. */
export function scoreAnswerText(
  text: string,
  citations: Array<{ url: string; title: string | null }>,
  defs: BrandDef[],
): Pick<CheckAnswer, "mentioned" | "position" | "brands" | "ownCited" | "citations"> {
  const cites: CheckCitation[] = [];
  const seen = new Set<string>();
  for (const c of citations) {
    const domain = urlDomain(c.url);
    if (!domain || seen.has(c.url)) continue;
    seen.add(c.url);
    cites.push({ url: c.url, domain, title: c.title });
  }
  const hits = matchBrands(
    text,
    defs,
    cites.map((c) => c.domain),
  );
  const own = hits.find((h) => h.isOwn);
  const ownDomains = defs.find((d) => d.isOwn)?.domains ?? [];
  const ownCited = cites.some((c) => ownDomains.some((d) => c.domain === d || c.domain.endsWith(`.${d}`)));
  return {
    mentioned: Boolean(own),
    position: own?.position ?? null,
    brands: hits.map((h) => h.key),
    ownCited,
    citations: cites.slice(0, MAX_CITATIONS),
  };
}

/** 1 for first place, then decreasing. */
export function positionQuality(position: number | null): number {
  if (!position) return 0;
  if (position === 1) return 1;
  if (position === 2) return 0.8;
  if (position === 3) return 0.65;
  if (position === 4) return 0.5;
  return 0.4;
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const pct = (part: number, total: number) => (total ? round1((part / total) * 100) : 0);

/** Visibility summary over all answers: mention rate, average position, citation rate and the composite score. */
export function summarizeVisibility(answers: Pick<CheckAnswer, "mentioned" | "position" | "ownCited">[]): VisibilitySummary | null {
  if (!answers.length) return null;
  const mentions = answers.filter((a) => a.mentioned).length;
  const positions = answers.filter((a) => a.mentioned && a.position).map((a) => a.position!);
  const cited = answers.filter((a) => a.ownCited).length;
  const mentionRate = mentions / answers.length;
  const prominence = answers.reduce((s, a) => s + (a.mentioned ? positionQuality(a.position) : 0), 0) / answers.length;
  const citationRate = cited / answers.length;
  return {
    answers: answers.length,
    mentions,
    mentionRate: pct(mentions, answers.length),
    avgPosition: positions.length ? round1(positions.reduce((a, b) => a + b, 0) / positions.length) : null,
    citationRate: pct(cited, answers.length),
    score: Math.round(100 * (0.7 * mentionRate + 0.2 * prominence + 0.1 * citationRate)),
  };
}

/** Per-brand mention rate / average position / first places (own brand first, then by mentions). */
export function brandStats(answers: Pick<CheckAnswer, "brands">[], defs: BrandDef[], domains: Record<string, string | null>): BrandStat[] {
  const total = answers.length;
  return defs
    .map((d) => {
      let mentions = 0;
      let first = 0;
      const positions: number[] = [];
      for (const a of answers) {
        const idx = a.brands.indexOf(d.key);
        if (idx === -1) continue;
        mentions += 1;
        positions.push(idx + 1);
        if (idx === 0) first += 1;
      }
      return {
        key: d.key,
        name: d.name,
        domain: domains[d.key] ?? null,
        isOwn: d.isOwn,
        mentions,
        mentionRate: pct(mentions, total),
        avgPosition: positions.length ? round1(positions.reduce((a, b) => a + b, 0) / positions.length) : null,
        firstPlace: first,
      };
    })
    .sort((a, b) => b.mentions - a.mentions || Number(b.isOwn) - Number(a.isOwn) || a.name.localeCompare(b.name));
}

/** Most cited domains (by number of answers citing them), with owner. */
export function topSources(answers: Pick<CheckAnswer, "citations">[], defs: BrandDef[], limit = 12): SourceStat[] {
  const byDomain = new Map<string, SourceStat>();
  for (const a of answers) {
    const counted = new Set<string>();
    for (const c of a.citations) {
      if (counted.has(c.domain)) continue;
      counted.add(c.domain);
      const cur = byDomain.get(c.domain);
      if (cur) {
        cur.answers += 1;
        continue;
      }
      const owner = defs.find((d) => d.domains.some((bd) => c.domain === bd || c.domain.endsWith(`.${bd}`)));
      byDomain.set(c.domain, {
        domain: c.domain,
        answers: 1,
        owner: owner ? (owner.isOwn ? "own" : "competitor") : "other",
        competitor: owner && !owner.isOwn ? owner.name : null,
        sampleUrl: c.url,
        sampleTitle: c.title,
      });
    }
  }
  return [...byDomain.values()].sort((a, b) => b.answers - a.answers || a.domain.localeCompare(b.domain)).slice(0, limit);
}

/** Per-engine summary for the engines table. */
export function engineSummary(
  engine: {
    id: string;
    name: string;
    provider: string | null;
    simulated: boolean;
    error: string | null;
  },
  answers: CheckAnswer[],
  defs: BrandDef[],
): EngineSummary {
  const mine = answers.filter((a) => a.engine === engine.id);
  const v = summarizeVisibility(mine);
  const compCounts = new Map<string, number>();
  for (const a of mine) for (const k of a.brands) if (k !== "own") compCounts.set(k, (compCounts.get(k) ?? 0) + 1);
  const topKey = [...compCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  return {
    engine: engine.id,
    name: engine.name,
    provider: mine[0]?.provider ?? engine.provider,
    simulated: mine.length ? mine.some((a) => a.simulated) : engine.simulated,
    answers: mine.length,
    mentions: v?.mentions ?? 0,
    mentionRate: v?.mentionRate ?? 0,
    avgPosition: v?.avgPosition ?? null,
    ownCitations: mine.filter((a) => a.ownCited).length,
    topCompetitor: topKey ? (defs.find((d) => d.key === topKey)?.name ?? null) : null,
    error: engine.error,
  };
}

/** Overall score: readiness only when no answers were collected, otherwise weighted towards measured visibility. */
export function overallScore(readiness: number, visibility: number | null): number {
  if (visibility === null) return readiness;
  return Math.round(0.35 * readiness + 0.65 * visibility);
}

/* ───────────────────────────── Rule-based actions ───────────────────────────── */

/**
 * Up to 3 prioritized actions derived from the measured findings (used when no AI provider can write them, and as
 * grounding for the AI-written ones). Never invents data: every action cites a finding or a measured number.
 */
export function ruleActions(
  readiness: Pick<ReadinessResult, "findings">,
  ai: {
    visibility: VisibilitySummary | null;
    brands: BrandStat[];
    sources: SourceStat[];
  } | null,
): CheckAction[] {
  const out: CheckAction[] = [];
  const has = (id: string) => readiness.findings.find((f) => f.id === id && f.severity !== "pass");
  const push = (a: CheckAction) => {
    if (out.length < 3 && !out.some((x) => x.title === a.title)) out.push(a);
  };

  const blocked = has("answer-bots-blocked") ?? has("robots-unreachable");
  if (blocked)
    push({
      title: "Let AI search crawlers in",
      detail: `${blocked.title}. ${blocked.fix ?? ""}`.trim(),
      impact: "high",
      effort: "low",
      category: "crawlers",
    });
  const noindex = has("noindex");
  if (noindex)
    push({
      title: "Remove noindex from the homepage",
      detail: noindex.detail,
      impact: "high",
      effort: "low",
      category: "technical",
    });
  const http = has("http-status") ?? has("http-error");
  if (http)
    push({
      title: "Make the homepage load for crawlers",
      detail: `${http.title}. ${http.fix ?? ""}`.trim(),
      impact: "high",
      effort: "medium",
      category: "technical",
    });
  const rendering = has("rendering");
  if (rendering && rendering.severity === "critical")
    push({
      title: "Server-render your main content",
      detail: `${rendering.detail} ${rendering.fix ?? ""}`.trim(),
      impact: "high",
      effort: "high",
      category: "technical",
    });

  if (ai?.visibility) {
    const v = ai.visibility;
    const leader = ai.brands.find((b) => !b.isOwn && b.mentions > 0);
    const thirdParty = ai.sources.filter((s) => s.owner === "other").slice(0, 3);
    if (v.mentionRate < 50 && thirdParty.length) {
      push({
        title: "Get covered on the sources AI cites",
        detail: `AI answers named you in ${v.mentionRate}% of the answers. The most cited third-party sources were ${thirdParty.map((s) => s.domain).join(", ")} — pitch them, get listed or answer there.`,
        impact: "high",
        effort: "medium",
        category: "mentions",
      });
    }
    if (leader && leader.mentions > v.mentions) {
      push({
        title: `Publish a comparison page: you vs. ${leader.name}`,
        detail: `${leader.name} was named in ${leader.mentionRate}% of the answers, you in ${v.mentionRate}%. An honest comparison page gives answer engines a source that includes you whenever ${leader.name} comes up.`,
        impact: "medium",
        effort: "medium",
        category: "content",
      });
    }
    if (v.mentions > 0 && v.citationRate === 0) {
      push({
        title: "Earn citations to your own pages",
        detail:
          "You were mentioned, but none of the answers cited your website. Publish pages that answer the buyer questions directly (FAQs, pricing, specs) so engines can link to you.",
        impact: "medium",
        effort: "medium",
        category: "content",
      });
    }
  }

  const partial = has("answer-bots-partial");
  if (partial)
    push({
      title: "Open key pages to AI search crawlers",
      detail: partial.detail,
      impact: "medium",
      effort: "low",
      category: "crawlers",
    });
  if (rendering && rendering.severity === "warning")
    push({
      title: "Put more of the page into the HTML",
      detail: `${rendering.detail} ${rendering.fix ?? ""}`.trim(),
      impact: "medium",
      effort: "medium",
      category: "technical",
    });
  const jsonld = has("jsonld-missing") ?? has("jsonld-no-entity");
  if (jsonld)
    push({
      title: "Add Organization structured data",
      detail: `${jsonld.detail} ${jsonld.fix ?? ""}`.trim(),
      impact: "medium",
      effort: "low",
      category: "structured-data",
    });
  const firewall = has("firewall");
  if (firewall)
    push({
      title: "Check your firewall's bot rules",
      detail: firewall.detail,
      impact: "medium",
      effort: "low",
      category: "crawlers",
    });
  const description = has("description");
  if (description)
    push({
      title: "Write a clear meta description",
      detail: description.fix ?? description.detail,
      impact: "low",
      effort: "low",
      category: "content",
    });
  const llms = has("llms");
  if (llms?.title.startsWith("llms.txt found"))
    push({ title: "Tidy up your llms.txt", detail: llms.detail, impact: "low", effort: "low", category: "content" });
  else if (llms) push({ title: "Publish an llms.txt", detail: llms.fix ?? llms.detail, impact: "low", effort: "low", category: "content" });
  return out;
}

/* ───────────────────────────── Cost ───────────────────────────── */

/** Conservative per-answer estimate (web-search answers via DataForSEO / direct APIs) and per-check LLM overhead. */
export const EST_USD_PER_ANSWER = 0.03;
export const EST_USD_LLM_OVERHEAD = 0.1;

export function estimateCheckCostUsd(engines: number, prompts: number): number {
  return Math.round((engines * prompts * EST_USD_PER_ANSWER + EST_USD_LLM_OVERHEAD) * 100) / 100;
}
