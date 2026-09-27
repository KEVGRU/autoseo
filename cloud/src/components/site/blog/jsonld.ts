import type { BlogAuthor, BlogPost } from "@/content/blog";
import { absoluteUrl, site } from "@/lib/site";
import { plainText } from "../inline";
import { articleNode, ids } from "../jsonld";
import type { Locale } from "../types";
import { blogLabels, tagLabels } from "./labels";
import { blogAuthorPath, blogPath, blogPostPath } from "./paths";
import { localizeContentHref } from "./localize";

type Node = Record<string, unknown>;

const blogId = (locale: Locale) => absoluteUrl(`${localizeContentHref(blogPath, locale)}#blog`);
const authorId = (slug: string, locale: Locale) => absoluteUrl(`${localizeContentHref(blogAuthorPath(slug), locale)}#author`);

/** Number of words of a post (lead, body and FAQ), for `wordCount`. */
export function postWordCount(post: BlogPost): number {
  const texts = [
    post.lead,
    ...post.blocks.flatMap((b) => {
      switch (b.type) {
        case "p":
        case "h2":
        case "h3":
        case "callout":
        case "quote":
          return [b.text];
        case "ul":
        case "ol":
          return b.items;
        case "table":
          return [...b.head, ...b.rows.flat()];
        default:
          return [];
      }
    }),
    ...post.faq.flatMap((f) => [f.q, f.a]),
  ];
  return plainText(texts.join(" ")).split(/\s+/).filter(Boolean).length;
}

/** The blog as a schema.org `Blog` listing its posts. */
export function blogNode(posts: BlogPost[], locale: Locale): Node {
  const t = blogLabels[locale];
  return {
    "@type": "Blog",
    "@id": blogId(locale),
    url: absoluteUrl(localizeContentHref(blogPath, locale)),
    name: t.metaTitle,
    description: t.metaDescription,
    inLanguage: locale,
    publisher: { "@id": ids.organization },
    isPartOf: { "@id": ids.website },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      "@id": absoluteUrl(`${localizeContentHref(blogPostPath(post.slug), locale)}#article`),
      url: absoluteUrl(localizeContentHref(blogPostPath(post.slug), locale)),
      headline: post.title,
      datePublished: post.date,
      dateModified: post.updated ?? post.date,
    })),
  };
}

/** `BlogPosting` of one post: article node plus citations, word count, topics and the blog it belongs to. */
export function postNode(post: BlogPost, author: BlogAuthor, locale: Locale): Node {
  const path = localizeContentHref(blogPostPath(post.slug), locale);
  const base = articleNode({
    path,
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated,
    author: { name: author.name, path: localizeContentHref(blogAuthorPath(author.slug), locale) },
    locale,
    keywords: post.tags.map((tag) => tagLabels[locale][tag]),
  });
  return {
    ...base,
    author: {
      "@type": "Organization",
      "@id": authorId(author.slug, locale),
      name: author.name,
      url: absoluteUrl(localizeContentHref(blogAuthorPath(author.slug), locale)),
      parentOrganization: { "@id": ids.organization },
    },
    abstract: plainText(post.lead),
    articleSection: post.tags.map((tag) => tagLabels[locale][tag])[0],
    wordCount: postWordCount(post),
    isPartOf: { "@id": blogId(locale) },
    about: { "@id": ids.software },
    citation: post.sources.map((s) => ({ "@type": "CreativeWork", name: s.label, url: s.href })),
    copyrightHolder: { "@id": ids.organization },
  };
}

/** Author page: `ProfilePage` about the author (the AutoSEO Team as part of the company). */
export function authorNode(author: BlogAuthor, locale: Locale): Node {
  const path = localizeContentHref(blogAuthorPath(author.slug), locale);
  return {
    "@type": "ProfilePage",
    "@id": absoluteUrl(`${path}#webpage`),
    url: absoluteUrl(path),
    name: author.name,
    inLanguage: locale,
    isPartOf: { "@id": ids.website },
    mainEntity: {
      "@type": "Organization",
      "@id": authorId(author.slug, locale),
      name: author.name,
      description: plainText(author.bio),
      url: absoluteUrl(path),
      email: site.contactEmail,
      parentOrganization: { "@id": ids.organization },
      sameAs: [site.github],
    },
  };
}
