import { localizeHref } from "@/components/marketing/locales";
import type { Block, Locale } from "../types";
import { blogPath } from "./paths";

/**
 * Link target of an English content path for a language: blog pages map to /de/blog/…, other pages to their German
 * version when one exists (English-only pages such as /self-hosting stay English). External links pass through.
 */
export function localizeContentHref(href: string, locale: Locale): string {
  if (locale === "en" || !href.startsWith("/")) return href;
  const [path, hash] = href.split("#");
  if (path === blogPath || path?.startsWith(`${blogPath}/`)) return `/de${href}`;
  return localizeHref(hash !== undefined ? `${path}#${hash}` : href, locale);
}

const INTERNAL_LINK = /\]\((\/[^)\s]*)\)/g;

/** Rewrites internal `[label](/path)` links of an inline-markup string to the given language. */
export function localizeText(text: string, locale: Locale): string {
  if (locale === "en") return text;
  return text.replace(INTERNAL_LINK, (_m, href: string) => `](${localizeContentHref(href, locale)})`);
}

/** Content blocks with internal links pointing at the given language (content is written with English paths). */
export function localizeBlocks(blocks: Block[], locale: Locale): Block[] {
  if (locale === "en") return blocks;
  const t = (text: string) => localizeText(text, locale);
  return blocks.map((block): Block => {
    switch (block.type) {
      case "p":
      case "h2":
      case "h3":
        return { ...block, text: t(block.text) };
      case "ul":
      case "ol":
        return { ...block, items: block.items.map(t) };
      case "table":
        return { ...block, head: block.head.map(t), rows: block.rows.map((row) => row.map(t)) };
      case "callout":
        return { ...block, text: t(block.text) };
      case "quote":
        return { ...block, text: t(block.text), cite: block.cite && t(block.cite) };
      default:
        return block;
    }
  });
}
