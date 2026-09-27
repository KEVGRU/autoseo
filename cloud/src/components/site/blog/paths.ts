/**
 * Paths of the blog (English; German lives under /de with the same slugs). Client-safe and dependency-free: identifiers
 * only, so the sitemap, footer, llms.txt and language switch (`locales.ts`) can link to the blog without importing post
 * content or creating an import cycle.
 */

/** Post slugs, newest first (the first one is featured on the index). */
export const blogSlugs = [
  "query-fan-out",
  "ai-search-attribution",
  "ai-mode-vs-ai-overviews",
  "geo-techniques",
  "ai-crawler-readability",
  "claude-connector",
  "chatgpt-plugin",
] as const;
export type BlogSlug = (typeof blogSlugs)[number];

export const blogAuthorSlugs = ["autoseo-team"] as const;

export const blogPath = "/blog";
export const blogPostPath = (slug: string) => `${blogPath}/${slug}`;
export const blogAuthorPath = (slug: string) => `${blogPath}/author/${slug}`;
export const blogRssPath = `${blogPath}/rss.xml`;

/** English paths of every blog page (all of them also exist under /de). */
export const blogPaths: string[] = [blogPath, ...blogSlugs.map(blogPostPath), ...blogAuthorSlugs.map(blogAuthorPath)];

export function isBlogSlug(value: string): value is BlogSlug {
  return (blogSlugs as readonly string[]).includes(value);
}
