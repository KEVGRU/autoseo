/**
 * Blog registry: every post in both languages, in the order of `blogSlugs` (newest first, first = featured).
 * Posts are plain data modules; the renderer lives in `@/components/site/blog`.
 */
import { blogSlugs, type BlogSlug } from "@/components/site/blog/paths";
import { post as aiCrawlerReadabilityDe } from "./posts/ai-crawler-readability.de";
import { post as aiCrawlerReadabilityEn } from "./posts/ai-crawler-readability.en";
import { post as aiModeVsAiOverviewsDe } from "./posts/ai-mode-vs-ai-overviews.de";
import { post as aiModeVsAiOverviewsEn } from "./posts/ai-mode-vs-ai-overviews.en";
import { post as aiSearchAttributionDe } from "./posts/ai-search-attribution.de";
import { post as aiSearchAttributionEn } from "./posts/ai-search-attribution.en";
import { post as chatgptPluginDe } from "./posts/chatgpt-plugin.de";
import { post as chatgptPluginEn } from "./posts/chatgpt-plugin.en";
import { post as claudeConnectorDe } from "./posts/claude-connector.de";
import { post as claudeConnectorEn } from "./posts/claude-connector.en";
import { post as geoTechniquesDe } from "./posts/geo-techniques.de";
import { post as geoTechniquesEn } from "./posts/geo-techniques.en";
import { post as queryFanOutDe } from "./posts/query-fan-out.de";
import { post as queryFanOutEn } from "./posts/query-fan-out.en";
import type { BlogPost, Locale } from "./types";

export { getAuthor } from "./authors";
export type { BlogAuthor, BlogPost, BlogSource, BlogTag } from "./types";

const posts: Record<Locale, Record<BlogSlug, BlogPost>> = {
  en: {
    "query-fan-out": queryFanOutEn,
    "ai-search-attribution": aiSearchAttributionEn,
    "ai-mode-vs-ai-overviews": aiModeVsAiOverviewsEn,
    "geo-techniques": geoTechniquesEn,
    "ai-crawler-readability": aiCrawlerReadabilityEn,
    "claude-connector": claudeConnectorEn,
    "chatgpt-plugin": chatgptPluginEn,
  },
  de: {
    "query-fan-out": queryFanOutDe,
    "ai-search-attribution": aiSearchAttributionDe,
    "ai-mode-vs-ai-overviews": aiModeVsAiOverviewsDe,
    "geo-techniques": geoTechniquesDe,
    "ai-crawler-readability": aiCrawlerReadabilityDe,
    "claude-connector": claudeConnectorDe,
    "chatgpt-plugin": chatgptPluginDe,
  },
};

/** All posts of a language, newest first (ties keep the `blogSlugs` order). */
export function getPosts(locale: Locale): BlogPost[] {
  const order = new Map<string, number>(blogSlugs.map((slug, i) => [slug, i]));
  return blogSlugs
    .map((slug) => posts[locale][slug])
    .sort((a, b) => b.date.localeCompare(a.date) || (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
}

export function getPost(locale: Locale, slug: string): BlogPost | undefined {
  return (posts[locale] as Record<string, BlogPost | undefined>)[slug];
}

/** Up to `count` other posts, the ones sharing the most tags first. */
export function relatedPosts(locale: Locale, slug: string, count = 3): BlogPost[] {
  const current = getPost(locale, slug);
  if (!current) return [];
  const all = getPosts(locale).filter((p) => p.slug !== slug);
  const score = (p: BlogPost) => p.tags.filter((t) => current.tags.includes(t)).length;
  return all
    .map((p, i) => ({ p, i, s: score(p) }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, count)
    .map(({ p }) => p);
}

/** Posts by one author. */
export function postsByAuthor(locale: Locale, authorSlug: string): BlogPost[] {
  return getPosts(locale).filter((p) => p.authorSlug === authorSlug);
}
