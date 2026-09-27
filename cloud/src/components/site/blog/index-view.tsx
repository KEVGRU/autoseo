import Link from "next/link";
import { ArrowRight, Rss } from "lucide-react";
import { JsonLd } from "@/components/marketing/json-ld";
import { Container, CtaLink, LogoMark, SectionHeading } from "@/components/marketing/primitives";
import type { BlogAuthor, BlogPost, BlogTag } from "@/content/blog";
import { Blocks, tocEntries } from "../blocks";
import { Inline } from "../inline";
import { breadcrumbNode, coreNodes, graph, webPageNode } from "../jsonld";
import { homeCrumb } from "../metadata";
import type { Locale } from "../types";
import { BlogHero } from "./blog-hero";
import { authorNode, blogNode } from "./jsonld";
import { blogLabels, tagLabels } from "./labels";
import { localizeBlocks, localizeContentHref, localizeText } from "./localize";
import { blogAuthorPath, blogPath, blogRssPath } from "./paths";
import { PostCard, PostMeta, postHref, TagChips } from "./post-card";
import { PostGrid } from "./post-grid";
import { BlogCta } from "./post-view";

/** Large teaser of the newest post: answer-first lead and the questions the article answers. */
function FeaturedPost({ post, author, locale }: { post: BlogPost; author: BlogAuthor; locale: Locale }) {
  const t = blogLabels[locale];
  const questions = tocEntries(post.blocks).slice(0, 5);
  const href = postHref(post.slug, locale);
  return (
    <article className="group relative grid overflow-hidden rounded-3xl border bg-card lg:grid-cols-[1.15fr_1fr]">
      <div className="flex flex-col p-6 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{t.featured}</span>
          <TagChips tags={post.tags} locale={locale} />
        </div>
        <h2 className="mt-5 text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-3xl">
          <Link href={href} className="outline-none after:absolute after:inset-0 after:rounded-3xl focus-visible:underline">
            {post.title}
          </Link>
        </h2>
        <p className="mt-4 text-[1.02rem] leading-7 text-pretty text-muted-foreground">{post.description}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-8">
          <div className="flex items-center gap-3">
            <LogoMark className="size-8 rounded-[0.55rem] ring-1 ring-transparent dark:ring-white/15" />
            <div>
              <p className="text-sm font-medium">{author.name}</p>
              <PostMeta post={post} locale={locale} className="text-xs" />
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium" aria-hidden="true">
            {t.readArticle}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
      <div className="relative border-t bg-muted/30 p-6 sm:p-8 lg:border-t-0 lg:border-l lg:p-10">
        <div className="mk-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative">
          <p className="text-xs font-semibold tracking-wide text-green-700 uppercase dark:text-green-400">{t.inShort}</p>
          <p className="mt-3 line-clamp-6 text-[0.95rem] leading-7 text-foreground/85 [&_code]:font-mono [&_code]:text-[0.9em]">
            <Inline text={stripLinks(localizeText(post.lead, locale))} />
          </p>
          {questions.length > 0 && (
            <ol className="mt-6 space-y-2 border-t pt-5 text-sm">
              {questions.map((q, i) => (
                <li key={q.id} className="flex gap-3">
                  <span className="font-mono text-xs leading-5 font-semibold text-green-700 dark:text-green-400">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-muted-foreground">{q.text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </article>
  );
}

/** Links inside the card would nest interactive elements in the stretched link; keep their labels only. */
function stripLinks(text: string) {
  return text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, "$1");
}

/** Blog index: featured post, topic filter and all posts. */
export function BlogIndexView({ posts, authors, locale }: { posts: BlogPost[]; authors: Record<string, BlogAuthor>; locale: Locale }) {
  const t = blogLabels[locale];
  const home = homeCrumb[locale];
  const path = localizeContentHref(blogPath, locale);
  const [featured, ...rest] = posts;
  const usedTags = [...new Set(posts.flatMap((p) => p.tags))] as BlogTag[];
  const counts = Array.from({ length: posts.length + 1 }, (_, n) => t.articles(n));
  const featuredAuthor = featured ? authors[featured.authorSlug] : undefined;

  return (
    <>
      <JsonLd
        data={graph(
          ...coreNodes(),
          webPageNode({ path, name: t.metaTitle, description: t.metaDescription, locale, type: "CollectionPage" }),
          blogNode(posts, locale),
          breadcrumbNode([
            { name: home.label, path: home.href },
            { name: t.crumb, path },
          ]),
        )}
      />
      <BlogHero trail={[home]} current={t.crumb} eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle}>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <CtaLink href="/signup" size="md" arrow>
            {t.ctaPrimary}
          </CtaLink>
          <a
            href={localizeContentHref(blogRssPath, locale)}
            className="inline-flex h-10 items-center gap-2 rounded-full border bg-card px-4 text-sm font-medium text-foreground shadow-xs hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
          >
            <Rss className="size-4 text-orange-600 dark:text-orange-400" aria-hidden="true" />
            {t.rss}
          </a>
        </div>
      </BlogHero>

      {featured && featuredAuthor && (
        <section aria-label={t.featured} className="pt-12 sm:pt-16">
          <Container>
            <FeaturedPost post={featured} author={featuredAuthor} locale={locale} />
          </Container>
        </section>
      )}

      <section aria-labelledby="all-posts" className="py-12 sm:py-16">
        <Container>
          <SectionHeading id="all-posts" align="left" title={t.allPosts} className="mb-8" />
          <PostGrid
            labels={{ filter: t.filterLabel, all: t.allTopics, count: counts }}
            tags={usedTags.map((id) => ({ id, label: tagLabels[locale][id] }))}
            featuredKey={rest.length ? featured?.slug : undefined}
            items={posts.map((post) => ({
              key: post.slug,
              tags: post.tags,
              card: <PostCard post={post} locale={locale} />,
            }))}
          />
        </Container>
      </section>

      <BlogCta locale={locale} />
    </>
  );
}

/** Author page: bio, how the team writes, contact and every article by the author. */
export function AuthorView({ author, posts, locale }: { author: BlogAuthor; posts: BlogPost[]; locale: Locale }) {
  const t = blogLabels[locale];
  const home = homeCrumb[locale];
  const blogHref = localizeContentHref(blogPath, locale);
  const path = localizeContentHref(blogAuthorPath(author.slug), locale);
  return (
    <>
      <JsonLd
        data={graph(
          ...coreNodes(),
          authorNode(author, locale),
          breadcrumbNode([
            { name: home.label, path: home.href },
            { name: t.crumb, path: blogHref },
            { name: author.name, path },
          ]),
        )}
      />
      <BlogHero
        trail={[home, { label: t.crumb, href: blogHref }]}
        current={author.name}
        eyebrow={
          <div className="flex items-center gap-3">
            <LogoMark className="size-12 rounded-[0.8rem] ring-1 ring-transparent dark:ring-white/15" />
            <p className="text-sm font-semibold tracking-wide text-green-700 uppercase dark:text-green-400">{author.role}</p>
          </div>
        }
        title={author.name}
        subtitle={<Inline text={stripLinks(localizeText(author.bio, locale))} />}
      >
        <ul className="mt-6 flex flex-wrap gap-2">
          {author.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener"
                className="inline-flex h-9 items-center rounded-full border bg-card px-4 text-sm font-medium hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </BlogHero>

      <Container className="py-12 sm:py-16">
        <div className="max-w-3xl">
          <Blocks blocks={localizeBlocks(author.about, locale)} />
        </div>
      </Container>

      <section aria-labelledby="author-posts" className="border-t bg-card/40 py-12 sm:py-16">
        <Container>
          <SectionHeading
            id="author-posts"
            align="left"
            title={`${t.allArticlesBy} ${author.name}`}
            subtitle={t.articles(posts.length)}
          />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.slug}>
                <PostCard post={post} locale={locale} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <BlogCta locale={locale} />
    </>
  );
}

