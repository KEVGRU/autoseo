import { getAuthor, getPosts } from "@/content/blog";
import { absoluteUrl } from "@/lib/site";
import { plainText } from "../inline";
import type { Locale } from "../types";
import { blogLabels, tagLabels } from "./labels";
import { blogPath, blogPostPath, blogRssPath } from "./paths";
import { localizeContentHref } from "./localize";

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const rfc822 = (isoDay: string) => new Date(`${isoDay}T08:00:00Z`).toUTCString();

/** RSS 2.0 feed of one language (answer-first lead as the item description). */
export function rssFeed(locale: Locale): Response {
  const t = blogLabels[locale];
  const posts = getPosts(locale);
  const blogUrl = absoluteUrl(localizeContentHref(blogPath, locale));
  const selfUrl = absoluteUrl(localizeContentHref(blogRssPath, locale));
  const lastBuild = posts.map((p) => p.updated ?? p.date).sort().at(-1);
  const items = posts.map((post) => {
    const url = absoluteUrl(localizeContentHref(blogPostPath(post.slug), locale));
    const author = getAuthor(locale, post.authorSlug);
    return [
      "    <item>",
      `      <title>${escapeXml(post.title)}</title>`,
      `      <link>${escapeXml(url)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
      `      <pubDate>${rfc822(post.date)}</pubDate>`,
      `      <dc:creator>${escapeXml(author.name)}</dc:creator>`,
      ...post.tags.map((tag) => `      <category>${escapeXml(tagLabels[locale][tag])}</category>`),
      `      <description>${escapeXml(plainText(post.lead))}</description>`,
      "    </item>",
    ].join("\n");
  });
  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">`,
    "  <channel>",
    `    <title>${escapeXml(t.rssTitle)}</title>`,
    `    <link>${escapeXml(blogUrl)}</link>`,
    `    <description>${escapeXml(t.rssDescription)}</description>`,
    `    <language>${locale === "de" ? "de-DE" : "en-US"}</language>`,
    ...(lastBuild ? [`    <lastBuildDate>${rfc822(lastBuild)}</lastBuildDate>`] : []),
    `    <atom:link href="${escapeXml(selfUrl)}" rel="self" type="application/rss+xml" />`,
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
