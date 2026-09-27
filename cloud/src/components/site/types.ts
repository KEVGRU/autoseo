/**
 * Content model for the long-form marketing pages (blog, company, resources, facts). Plain data only: every string
 * may use the inline markup of `inline.tsx` (**bold**, *italic*, `code`, [label](href)). One file per page and
 * language; both languages share the exported shape so the renderer and the checks can compare them.
 */
import type { Locale } from "@/components/marketing/locales";

export type { Locale };

export type Cta = { label: string; href: string };
export type Faq = { q: string; a: string };
export type Step = { title: string; body: string };
export type Stat = { value: string; label: string; source?: { label: string; href: string } };

/** Lucide icon names available to cards (see `icons.tsx`). */
export type IconName =
  | "activity"
  | "bot"
  | "book"
  | "briefcase"
  | "building"
  | "calendar"
  | "chart"
  | "check"
  | "code"
  | "database"
  | "download"
  | "file"
  | "flask"
  | "gauge"
  | "git"
  | "globe"
  | "handshake"
  | "heart"
  | "key"
  | "layers"
  | "link"
  | "list"
  | "lock"
  | "mail"
  | "megaphone"
  | "message"
  | "network"
  | "presentation"
  | "rocket"
  | "scale"
  | "search"
  | "server"
  | "shield"
  | "sparkles"
  | "star"
  | "swords"
  | "target"
  | "users"
  | "wand"
  | "video";

export type Card = { title: string; body: string; icon?: IconName; href?: string; badge?: string };

/** Long-form content blocks (blog posts, legal texts, fact sheets). */
export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string; id?: string }
  | { type: "h3"; text: string; id?: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][]; caption?: string }
  | { type: "callout"; tone?: "info" | "tip" | "warn"; title?: string; text: string }
  | { type: "code"; lang?: string; code: string; title?: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "image"; src: string; alt: string; caption?: string; width: number; height: number };

/** Page sections for structured pages (enterprise, press, partner program, …). */
export type Section =
  | { kind: "cards"; id?: string; eyebrow?: string; title: string; subtitle?: string; cards: Card[]; columns?: 2 | 3 | 4 }
  | { kind: "steps"; id?: string; eyebrow?: string; title: string; subtitle?: string; steps: Step[] }
  | { kind: "stats"; id?: string; title?: string; subtitle?: string; stats: Stat[] }
  | { kind: "prose"; id?: string; eyebrow?: string; title?: string; blocks: Block[] }
  | { kind: "checklist"; id?: string; eyebrow?: string; title: string; subtitle?: string; items: string[]; aside?: Block[] }
  | { kind: "table"; id?: string; eyebrow?: string; title: string; subtitle?: string; head: string[]; rows: string[][]; note?: string }
  | { kind: "faq"; id?: string; title?: string; subtitle?: string; items: Faq[] }
  | { kind: "code"; id?: string; eyebrow?: string; title: string; subtitle?: string; tabs: { label: string; lang?: string; code: string }[] }
  | { kind: "links"; id?: string; eyebrow?: string; title: string; subtitle?: string; links: { label: string; href: string; description?: string }[] }
  | { kind: "split"; id?: string; eyebrow?: string; title: string; body: string; bullets?: string[]; cta?: Cta; image?: { src: string; alt: string; width: number; height: number } }
  | { kind: "cta"; id?: string; title: string; body?: string; primary: Cta; secondary?: Cta };

export type Hero = { eyebrow?: string; title: string; subtitle?: string; ctas?: Cta[]; updated?: string };

/** A structured page: metadata, hero and sections. `path` is the English path; German lives under /de + path. */
export type SitePage = {
  path: string;
  crumb: string;
  meta: { title: string; description: string };
  hero: Hero;
  sections: Section[];
};

export type Localized<T> = Record<Locale, T>;
