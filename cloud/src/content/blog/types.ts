/**
 * Content model of the blog. Plain data only: every string may use the inline markup of
 * `@/components/site/inline.tsx` (**bold**, *italic*, `code`, [label](href)). One file per post and language in
 * `posts/<slug>.<locale>.ts`; both languages share the slug. Internal links are written as English paths
 * (`/mcp-server`, `/blog/query-fan-out`) and localized by the renderer for German.
 */
import type { Block, Faq, Locale } from "@/components/site/types";

export type { Block, Faq, Locale };

/** Topic ids of the blog (labels per language live in `index.ts`). */
export type BlogTag =
  | "ai-search"
  | "measurement"
  | "attribution"
  | "geo"
  | "research"
  | "google"
  | "query-fan-out"
  | "technical"
  | "ai-crawlers"
  | "mcp"
  | "claude"
  | "chatgpt"
  | "how-to";

export type AuthorSlug = "autoseo-team";

export type BlogSource = { label: string; href: string };

export type BlogPost = {
  slug: string;
  /** Headline (h1) and <title>. */
  title: string;
  /** Meta description, at most ~160 characters. */
  description: string;
  /** ISO dates (YYYY-MM-DD). */
  date: string;
  updated?: string;
  authorSlug: AuthorSlug;
  tags: BlogTag[];
  readingMinutes: number;
  /** Answer-first summary shown above the body (inline markup). */
  lead: string;
  blocks: Block[];
  faq: Faq[];
  sources: BlogSource[];
};

export type BlogAuthor = {
  slug: AuthorSlug;
  name: string;
  /** Short role line, e.g. "Builders of AutoSEO at Codext GmbH". */
  role: string;
  /** One-paragraph bio (inline markup). */
  bio: string;
  /** Longer author-page text. */
  about: Block[];
  links: { label: string; href: string }[];
};
