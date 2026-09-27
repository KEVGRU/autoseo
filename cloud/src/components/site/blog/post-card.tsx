import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { BlogPost } from "@/content/blog";
import { cn } from "@/lib/utils";
import type { Locale } from "../types";
import { blogLabels, formatDate, tagLabels } from "./labels";
import { blogPostPath } from "./paths";
import { localizeContentHref } from "./localize";

export function postHref(slug: string, locale: Locale) {
  return localizeContentHref(blogPostPath(slug), locale);
}

/** Date and reading time, e.g. "September 26, 2026 · 12 min read". */
export function PostMeta({ post, locale, className }: { post: BlogPost; locale: Locale; className?: string }) {
  const t = blogLabels[locale];
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground", className)}>
      <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
      <span aria-hidden="true">·</span>
      <span>
        {post.readingMinutes} {t.minRead}
      </span>
    </p>
  );
}

export function TagChips({ tags, locale, className }: { tags: BlogPost["tags"]; locale: Locale; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label={blogLabels[locale].topics}>
      {tags.map((tag) => (
        <li key={tag} className="rounded-full border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {tagLabels[locale][tag]}
        </li>
      ))}
    </ul>
  );
}

/** Post teaser for grids. The whole card is clickable through the stretched title link. */
export function PostCard({ post, locale, headingLevel = "h3" }: { post: BlogPost; locale: Locale; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className="group relative flex h-full flex-col rounded-2xl border bg-card p-6 transition-shadow focus-within:ring-3 focus-within:ring-ring/60 hover:shadow-[0_12px_32px_-16px_oklch(0_0_0/0.2)]">
      <TagChips tags={post.tags} locale={locale} />
      <Heading className="mt-4 text-lg leading-snug font-semibold tracking-tight text-balance">
        <Link href={postHref(post.slug, locale)} className="outline-none after:absolute after:inset-0 after:rounded-2xl">
          {post.title}
        </Link>
      </Heading>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{post.description}</p>
      <div className="mt-auto flex items-end justify-between gap-3 pt-6">
        <PostMeta post={post} locale={locale} />
        <ArrowUpRight
          className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </div>
    </article>
  );
}
