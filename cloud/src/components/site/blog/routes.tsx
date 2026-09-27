import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuthor, getPost, getPosts, postsByAuthor, relatedPosts, type BlogAuthor } from "@/content/blog";
import { plainText } from "../inline";
import { siteMetadata } from "../metadata";
import type { Locale } from "../types";
import { AuthorView, BlogIndexView } from "./index-view";
import { blogLabels, tagLabels } from "./labels";
import { blogAuthorPath, blogAuthorSlugs, blogPath, blogPostPath, blogRssPath, blogSlugs } from "./paths";
import { localizeContentHref } from "./localize";
import { PostView } from "./post-view";

/**
 * Route modules shared by the English and German blog routes, which only re-export them (plus
 * `dynamicParams = false`, so unknown slugs 404). Every page and both RSS feeds are prerendered at build time.
 */
type Params<K extends string> = { params: Promise<Record<K, string>> };

/** Adds the language's RSS feed to a page's metadata (`<link rel="alternate" type="application/rss+xml">`). */
function withFeed(metadata: Metadata, locale: Locale): Metadata {
  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      types: { "application/rss+xml": [{ url: localizeContentHref(blogRssPath, locale), title: blogLabels[locale].rssTitle }] },
    },
  };
}

/** Cuts text at a word boundary so it fits a meta description. */
function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

function authorsOf(locale: Locale): Record<string, BlogAuthor> {
  return Object.fromEntries(blogAuthorSlugs.map((slug) => [slug, getAuthor(locale, slug)]));
}

export function blogIndexRoute(locale: Locale) {
  const t = blogLabels[locale];
  return {
    metadata: withFeed(siteMetadata({ title: t.metaTitle, description: t.metaDescription, enPath: blogPath, locale }), locale),
    Page: () => <BlogIndexView posts={getPosts(locale)} authors={authorsOf(locale)} locale={locale} />,
  };
}

export function blogPostRoute(locale: Locale) {
  return {
    generateStaticParams: () => blogSlugs.map((slug) => ({ slug })),
    async generateMetadata({ params }: Params<"slug">): Promise<Metadata> {
      const { slug } = await params;
      const post = getPost(locale, slug);
      if (!post) return {};
      const author = getAuthor(locale, post.authorSlug);
      return withFeed(
        {
          ...siteMetadata({
            title: post.title,
            description: post.description,
            enPath: blogPostPath(slug),
            locale,
            type: "article",
            publishedTime: post.date,
            modifiedTime: post.updated ?? post.date,
            authors: [author.name],
            ownImage: true,
          }),
          authors: [{ name: author.name, url: localizeContentHref(blogAuthorPath(author.slug), locale) }],
          keywords: post.tags.map((tag) => tagLabels[locale][tag]),
        },
        locale,
      );
    },
    async Page({ params }: Params<"slug">) {
      const { slug } = await params;
      const post = getPost(locale, slug);
      if (!post) notFound();
      return <PostView post={post} author={getAuthor(locale, post.authorSlug)} related={relatedPosts(locale, slug)} locale={locale} />;
    },
  };
}

export function blogAuthorRoute(locale: Locale) {
  return {
    generateStaticParams: () => blogAuthorSlugs.map((slug) => ({ slug })),
    async generateMetadata({ params }: Params<"slug">): Promise<Metadata> {
      const { slug } = await params;
      if (!(blogAuthorSlugs as readonly string[]).includes(slug)) return {};
      const author = getAuthor(locale, slug as (typeof blogAuthorSlugs)[number]);
      const t = blogLabels[locale];
      return withFeed(
        siteMetadata({
          title: `${author.name} · ${t.crumb}`,
          description: truncate(plainText(author.bio), 160),
          enPath: blogAuthorPath(slug),
          locale,
        }),
        locale,
      );
    },
    async Page({ params }: Params<"slug">) {
      const { slug } = await params;
      if (!(blogAuthorSlugs as readonly string[]).includes(slug)) notFound();
      const author = getAuthor(locale, slug as (typeof blogAuthorSlugs)[number]);
      return <AuthorView author={author} posts={postsByAuthor(locale, slug)} locale={locale} />;
    },
  };
}

