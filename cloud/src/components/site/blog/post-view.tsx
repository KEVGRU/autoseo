import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";
import { FaqList } from "@/components/marketing/faq";
import { JsonLd } from "@/components/marketing/json-ld";
import { Container, LogoMark, SectionHeading } from "@/components/marketing/primitives";
import type { BlogAuthor, BlogPost } from "@/content/blog";
import { Blocks, tocEntries } from "../blocks";
import { Inline, plainText } from "../inline";
import { breadcrumbNode, coreNodes, faqNode, graph, webPageNode } from "../jsonld";
import { homeCrumb } from "../metadata";
import { SectionView } from "../sections";
import type { Locale } from "../types";
import { BlogHero } from "./blog-hero";
import { postNode } from "./jsonld";
import { blogLabels, formatDate, tagLabels } from "./labels";
import { localizeBlocks, localizeContentHref, localizeText } from "./localize";
import { blogAuthorPath, blogPath, blogPostPath } from "./paths";
import { PostCard } from "./post-card";
import { Toc } from "./toc";

const FAQ_ID = "faq";
const SOURCES_ID = "sources";

function hostname(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

/** Author card below the article. */
export function AuthorBox({ author, locale, heading }: { author: BlogAuthor; locale: Locale; heading?: string }) {
  const href = localizeContentHref(blogAuthorPath(author.slug), locale);
  return (
    <aside aria-label={heading ?? author.name} className="rounded-2xl border bg-card p-6">
      {heading && <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{heading}</p>}
      <div className="mt-4 flex items-start gap-4">
        <LogoMark className="size-12 shrink-0 rounded-[0.8rem] ring-1 ring-transparent dark:ring-white/15" />
        <div className="min-w-0">
          <p className="font-semibold">
            <Link href={href} className="hover:underline hover:underline-offset-4 focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none">
              {author.name}
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">{author.role}</p>
        </div>
      </div>
      <p className="mt-4 text-[0.95rem] leading-7 text-foreground/85 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4">
        <Inline text={localizeText(author.bio, locale)} />
      </p>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {author.links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              target={link.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noopener"
              className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/** Full blog post: JSON-LD, hero with meta, answer-first lead, sticky table of contents, body, FAQ, sources, author. */
export function PostView({ post, author, related, locale }: { post: BlogPost; author: BlogAuthor; related: BlogPost[]; locale: Locale }) {
  const t = blogLabels[locale];
  const home = homeCrumb[locale];
  const blogHref = localizeContentHref(blogPath, locale);
  const path = localizeContentHref(blogPostPath(post.slug), locale);
  const blocks = localizeBlocks(post.blocks, locale);
  const toc = [
    ...tocEntries(blocks),
    ...(post.faq.length ? [{ id: FAQ_ID, text: t.faq }] : []),
    ...(post.sources.length ? [{ id: SOURCES_ID, text: t.sources }] : []),
  ];
  const authorHref = localizeContentHref(blogAuthorPath(author.slug), locale);

  return (
    <>
      <JsonLd
        data={graph(
          ...coreNodes(),
          webPageNode({ path, name: post.title, description: post.description, locale }),
          postNode(post, author, locale),
          breadcrumbNode([
            { name: home.label, path: home.href },
            { name: t.crumb, path: blogHref },
            { name: post.title, path },
          ]),
          faqNode(post.faq, path, locale),
        )}
      />
      <BlogHero
        trail={[home, { label: t.crumb, href: blogHref }]}
        current={post.title}
        wide
        eyebrow={
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm font-semibold tracking-wide text-green-700 uppercase dark:text-green-400" aria-label={t.topics}>
            {post.tags.map((tag) => (
              <li key={tag}>{tagLabels[locale][tag]}</li>
            ))}
          </ul>
        }
        title={post.title}
      >
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
          <Link href={authorHref} className="flex items-center gap-2.5 rounded-full font-medium text-foreground hover:underline hover:underline-offset-4 focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none">
            <LogoMark className="size-8 rounded-[0.55rem] ring-1 ring-transparent dark:ring-white/15" />
            <span>
              <span className="sr-only">{t.by} </span>
              {author.name}
            </span>
          </Link>
          <p>
            {t.published} <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
          </p>
          {post.updated && post.updated !== post.date && (
            <p>
              {t.updated} <time dateTime={post.updated}>{formatDate(post.updated, locale)}</time>
            </p>
          )}
          <p>
            {post.readingMinutes} {t.minRead}
          </p>
        </div>
      </BlogHero>

      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
          <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:pb-6">
            <details className="mk-faq group rounded-xl border bg-card lg:hidden">
              <summary className="flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none">
                {t.onThisPage}
                <ChevronRight className="size-4 text-muted-foreground transition-transform group-open:rotate-90" aria-hidden="true" />
              </summary>
              <Toc entries={toc} className="mx-4 mb-4" />
            </details>
            <nav aria-label={t.onThisPage} className="hidden lg:block">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t.onThisPage}</p>
              <Toc entries={toc} className="mt-3" />
            </nav>
          </aside>

          <article className="min-w-0 max-w-3xl">
            <section aria-label={t.inShort} className="rounded-2xl border border-green-600/25 bg-brand-soft/40 p-5 sm:p-6">
              <p className="text-xs font-semibold tracking-wide text-green-700 uppercase dark:text-green-400">{t.inShort}</p>
              <p className="mt-2 text-[1.05rem] leading-7 text-pretty sm:text-lg sm:leading-8 text-foreground [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]">
                <Inline text={localizeText(post.lead, locale)} />
              </p>
            </section>

            <Blocks blocks={blocks} className="mt-10" />

            {post.faq.length > 0 && (
              <section aria-labelledby={FAQ_ID} className="mt-14">
                <h2 id={FAQ_ID} className="scroll-mt-24 text-2xl font-semibold tracking-tight">
                  {t.faq}
                </h2>
                <div className="mt-6">
                  <FaqList items={post.faq.map((f) => ({ q: plainText(f.q), a: plainText(f.a) }))} />
                </div>
              </section>
            )}

            {post.sources.length > 0 && (
              <section aria-labelledby={SOURCES_ID} className="mt-14">
                <h2 id={SOURCES_ID} className="scroll-mt-24 text-2xl font-semibold tracking-tight">
                  {t.sources}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">{t.sourcesNote}</p>
                <ol className="mt-5 list-decimal space-y-3 pl-5 text-[0.95rem] leading-6 marker:text-muted-foreground">
                  {post.sources.map((source) => (
                    <li key={source.href} className="pl-1">
                      <a
                        href={source.href}
                        target="_blank"
                        rel="noopener"
                        className="font-medium underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground [overflow-wrap:anywhere]"
                      >
                        {plainText(source.label)}
                        <ExternalLink className="ml-1 inline size-3.5 align-[-0.1em] text-muted-foreground" aria-hidden="true" />
                      </a>
                      <span className="block text-sm text-muted-foreground">{hostname(source.href)}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <div className="mt-14">
              <AuthorBox author={author} locale={locale} heading={t.aboutAuthor} />
            </div>
          </article>
        </div>
      </Container>

      {related.length > 0 && (
        <section aria-labelledby="keep-reading" className="border-t bg-card/40 py-14 sm:py-20">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading id="keep-reading" align="left" title={t.keepReading} />
              <Link href={blogHref} className="text-sm font-medium underline underline-offset-4 hover:no-underline">
                {t.backToBlog}
              </Link>
            </div>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <PostCard post={p} locale={locale} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <BlogCta locale={locale} />
    </>
  );
}

/** Closing call to action (dark panel) shared by all blog pages. */
export function BlogCta({ locale }: { locale: Locale }) {
  const t = blogLabels[locale];
  return (
    <SectionView
      index={0}
      section={{
        kind: "cta",
        id: "get-started",
        title: t.ctaTitle,
        body: t.ctaBody,
        primary: { label: t.ctaPrimary, href: "/signup" },
        secondary: { label: t.ctaSecondary, href: "/self-hosting" },
      }}
    />
  );
}
