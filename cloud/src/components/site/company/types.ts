/**
 * Content model of the company pages that need more than a plain `SitePage`: reproducible GEO playbooks
 * (/case-studies/[slug]) and the press kit's downloadable assets. Plain data with the inline markup of `../inline.tsx`.
 */
import type { Block, Card, Faq, IconName, SitePage, Step } from "../types";

/** One prompt of a playbook's prompt set (imported into the AutoSEO tracker as CSV: prompt,tags). */
export type PlaybookPrompt = { prompt: string; tags: string[] };

/** A reproducible playbook: methodology, not a customer result. Both languages share the slug. */
export type Playbook = {
  slug: string;
  crumb: string;
  icon: IconName;
  meta: { title: string; description: string };
  hero: { title: string; subtitle: string };
  /** One-sentence summary for the index card. */
  teaser: string;
  /** Short key facts shown under the hero (label → value). */
  facts: { label: string; value: string }[];
  goal: Block[];
  audience: string[];
  prompts: { intro: string; placeholders: string[]; rows: PlaybookPrompt[] };
  engines: { intro: string; head: string[]; rows: string[][] };
  baseline: Step[];
  actions: Card[];
  measure: { items: string[]; aside: Block[] };
  variance: Block[];
  limitations: string[];
  faq: Faq[];
  /** Background articles (blog posts, guides) in the page's language. */
  reading?: { label: string; href: string; description: string }[];
  /** Slugs of related playbooks. */
  related: string[];
};

export type PressLogo = { label: string; src: string; format: string; size: string };
export type PressScreenshot = { src: string; alt: string; caption: string; width: number; height: number };

/** Press kit: a regular `SitePage` plus downloadable assets rendered after the section `assetsAfter`. */
export type PressPage = SitePage & {
  assetsAfter: string;
  logos: { title: string; subtitle: string; items: PressLogo[] };
  screenshots: { title: string; subtitle: string; items: PressScreenshot[] };
};
