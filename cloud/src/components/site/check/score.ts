/**
 * Scoring of the free AI visibility check. Pure: takes the collected signals, returns the weighted score (0–100),
 * the category scores and a prioritized fix list. Weights reflect what decides whether AI engines can use a page
 * at all: crawler access and server-rendered content first, then structure, discovery files and HTTP basics.
 */
import { PURPOSE_WEIGHT, type BotPurpose } from "./bots";
import type { CategoryKey, CheckResult, Fix, FixId, FixSeverity } from "./types";

export type Signals = Omit<CheckResult, "score" | "categories" | "fixes">;

export const CATEGORY_WEIGHTS: Record<CategoryKey, number> = { crawlers: 30, content: 25, structure: 20, technical: 15, discovery: 10 };

const SEVERITY_ORDER: Record<FixSeverity, number> = { high: 0, medium: 1, low: 2 };

/** Schema.org types that describe who is behind a site (entity signals for AI engines). */
const ENTITY_TYPES = new Set([
  "Organization",
  "Corporation",
  "LocalBusiness",
  "OnlineStore",
  "OnlineBusiness",
  "Store",
  "Brand",
  "Person",
  "NGO",
  "EducationalOrganization",
  "MedicalOrganization",
  "GovernmentOrganization",
  "NewsMediaOrganization",
  "WebSite",
  "Product",
  "SoftwareApplication",
  "Service",
]);

function isEntityType(type: string): boolean {
  return ENTITY_TYPES.has(type) || /(Organization|Business|Store)$/.test(type);
}

export function sameSite(a: string, b: string): boolean {
  const strip = (h: string) => h.toLowerCase().replace(/^www\./, "");
  return strip(a) === strip(b);
}

export function scoreSignals(s: Signals): Pick<CheckResult, "score" | "categories" | "fixes"> {
  const fixes: Fix[] = [];
  const add = (id: FixId, severity: FixSeverity, category: CategoryKey, points: number, params?: Fix["params"]) =>
    fixes.push({ id, severity, category, points: Math.round(points * 10) / 10, ...(params ? { params } : {}) });
  const weight = (c: CategoryKey, lostShare: number) => CATEGORY_WEIGHTS[c] * lostShare;

  const reachable = s.http.status !== null && s.http.status >= 200 && s.http.status < 300;
  const page = reachable && !s.http.challenged ? s.page : null;

  /* ── Technical ── */
  let technical = 0;
  if (s.http.status === null) {
    add("unreachable", "high", "technical", CATEGORY_WEIGHTS.technical, { error: s.http.error ?? "connection" });
  } else if (s.http.challenged) {
    add("bot_protection", "high", "crawlers", weight("crawlers", 0.5), { status: s.http.status });
  } else if (!reachable) {
    add("http_error", "high", "technical", weight("technical", 0.4), { status: s.http.status });
  } else {
    technical += 40;
  }
  if (s.http.status !== null) {
    if (s.http.https) technical += 30;
    else add("https_missing", "high", "technical", weight("technical", 0.3));
    if (s.http.httpRedirectsToHttps === false) add("http_no_redirect", "low", "technical", weight("technical", 0.05));
    else technical += 5;
    const ttfb = s.http.ttfbMs ?? Infinity;
    if (ttfb < 800) technical += 20;
    else if (ttfb < 2000) {
      technical += 12;
      add("slow_response", "low", "technical", weight("technical", 0.08), { ms: Math.round(ttfb) });
    } else {
      technical += 4;
      add("slow_response", "medium", "technical", weight("technical", 0.16), { ms: Number.isFinite(ttfb) ? Math.round(ttfb) : 0 });
    }
    if (s.http.redirects.length <= 2) technical += 5;
    else add("long_redirect_chain", "low", "technical", weight("technical", 0.05), { hops: s.http.redirects.length });
  }

  /* ── Crawler access ── */
  let crawlers = 0;
  if (s.http.status !== null) {
    const bots = s.robots.bots;
    if (s.robots.state === "unreachable") {
      add("robots_unreachable", "high", "crawlers", CATEGORY_WEIGHTS.crawlers, { status: s.robots.status ?? 0 });
    } else {
      const byPurpose = (p: BotPurpose) => bots.filter((b) => b.purpose === p);
      for (const purpose of ["search", "user", "training"] as const) {
        const group = byPurpose(purpose);
        if (!group.length) continue;
        crawlers += PURPOSE_WEIGHT[purpose] * (group.filter((b) => b.allowed).length / group.length) * 100;
      }
      const blocked = (p: BotPurpose) => byPurpose(p).filter((b) => !b.allowed);
      const blockedAll = bots.length > 0 && bots.every((b) => !b.allowed) && bots.every((b) => b.source === "wildcard");
      if (blockedAll) {
        add("robots_blocks_all", "high", "crawlers", CATEGORY_WEIGHTS.crawlers);
      } else {
        const search = blocked("search");
        const user = blocked("user");
        const training = blocked("training");
        if (search.length) {
          add("search_bots_blocked", "high", "crawlers", weight("crawlers", (PURPOSE_WEIGHT.search * search.length) / byPurpose("search").length), {
            bots: search.map((b) => b.token).join(", "),
          });
        }
        if (user.length) {
          add("user_bots_blocked", "medium", "crawlers", weight("crawlers", (PURPOSE_WEIGHT.user * user.length) / byPurpose("user").length), {
            bots: user.map((b) => b.token).join(", "),
          });
        }
        if (training.length) {
          add("training_bots_blocked", "low", "crawlers", weight("crawlers", (PURPOSE_WEIGHT.training * training.length) / byPurpose("training").length), {
            bots: training.map((b) => b.token).join(", "),
          });
        }
      }
    }
    if (s.http.challenged) crawlers *= 0.5;
    const noindex = Boolean(page?.noindex) || /\b(noindex|none)\b/i.test(s.http.xRobotsTag ?? "");
    if (noindex) {
      add("noindex", "high", "crawlers", weight("crawlers", 0.4));
      crawlers *= 0.6;
    }
  }

  /* ── Content readable without JavaScript ── */
  let content = 0;
  if (page) {
    if (page.rendering === "js") {
      content = 5;
      add("js_only", "high", "content", weight("content", 0.95), { words: page.wordCount });
    } else if (page.rendering === "thin") {
      content = page.wordCount >= 50 ? 50 : 20;
      add("thin_content", "medium", "content", weight("content", (100 - content) / 100), { words: page.wordCount });
    } else {
      content = page.wordCount >= 300 ? 100 : 85;
    }
  }

  /* ── Structure: structured data and metadata ── */
  let structureRaw = 0;
  const STRUCTURE_MAX = 18;
  const lost = (points: number) => weight("structure", points / STRUCTURE_MAX);
  if (page) {
    const { jsonLd } = page;
    const parsed = jsonLd.blocks - jsonLd.errors;
    if (parsed > 0) structureRaw += 6;
    else if (jsonLd.blocks > 0) {
      structureRaw += 2;
      add("jsonld_invalid", "medium", "structure", lost(6), { errors: jsonLd.errors });
    } else {
      if (page.microdata) structureRaw += 3;
      add("no_jsonld", "medium", "structure", lost(page.microdata ? 5 : 8));
    }
    if (parsed > 0) {
      if (jsonLd.types.some(isEntityType)) structureRaw += 2;
      else add("no_entity_schema", "low", "structure", lost(2), { types: jsonLd.types.slice(0, 6).join(", ") });
    }
    if (!page.title) add("title_missing", "medium", "structure", lost(3));
    else {
      structureRaw += 2;
      if (page.title.length >= 20 && page.title.length <= 70) structureRaw += 1;
      else add("title_length", "low", "structure", lost(1), { length: page.title.length });
    }
    if (!page.description) add("description_missing", "medium", "structure", lost(3));
    else {
      structureRaw += 2;
      if (page.description.length >= 50 && page.description.length <= 170) structureRaw += 1;
      else add("description_length", "low", "structure", lost(1), { length: page.description.length });
    }
    if (!page.canonical) add("canonical_missing", "low", "structure", lost(1));
    else {
      let host: string | null = null;
      try {
        host = new URL(page.canonical, s.http.finalUrl ?? s.url).hostname;
      } catch {
        host = null;
      }
      const finalHost = new URL(s.http.finalUrl ?? s.url).hostname;
      if (host && !sameSite(host, finalHost)) add("canonical_other_host", "medium", "structure", lost(1), { canonical: page.canonical.slice(0, 120) });
      else structureRaw += 1;
    }
    if (page.lang) structureRaw += 1;
    else add("lang_missing", "low", "structure", lost(1));
    if (page.h1.length) structureRaw += 2;
    else add("h1_missing", "low", "structure", lost(2));
  }
  const structure = Math.round((structureRaw / STRUCTURE_MAX) * 100);

  /* ── Discovery files ── */
  let discovery = 0;
  if (s.http.status !== null) {
    if (s.sitemap.found) discovery += 70;
    else add("sitemap_missing", "medium", "discovery", weight("discovery", 0.7));
    if (s.llms.present && s.llms.valid) discovery += 30;
    else if (s.llms.present) {
      discovery += 15;
      add("llms_invalid", "low", "discovery", weight("discovery", 0.15));
    } else add("llms_missing", "low", "discovery", weight("discovery", 0.3));
  }

  const categories: CheckResult["categories"] = (
    [
      ["crawlers", crawlers],
      ["content", content],
      ["structure", structure],
      ["technical", technical],
      ["discovery", discovery],
    ] as const
  ).map(([key, value]) => ({ key, score: Math.max(0, Math.min(100, Math.round(value))), weight: CATEGORY_WEIGHTS[key] }));
  const score = Math.round(categories.reduce((sum, c) => sum + (c.score * c.weight) / 100, 0));
  fixes.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || b.points - a.points);
  return { score, categories, fixes };
}
