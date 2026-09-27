/**
 * Locales of the marketing site: English at the root, German under /de. Client-safe (imports no copy), so the
 * language switch and the root <html lang> wrapper can use it without pulling translations into the bundle.
 */
import { blogPaths } from "../site/blog/paths";
import { landingPaths, sitePages, translatedPrefixes } from "./catalog/routes";

export const locales = ["en", "de"] as const;
export type Locale = (typeof locales)[number];

export const ogLocale: Record<Locale, string> = { en: "en_US", de: "de_DE" };

/**
 * Marketing pages that exist in both languages: English path → German path. Landing pages keep their English slug
 * under /de. Everything else (the self-hosting guide) is English-only.
 */
const translatedPaths: Record<string, string> = {
  "/": "/de",
  "/pricing": "/de/pricing",
  "/launch": "/de/launch",
  "/imprint": "/de/imprint",
  "/privacy": "/de/privacy",
  "/terms": "/de/terms",
  ...Object.fromEntries(
    [...landingPaths, ...Object.values(sitePages), ...blogPaths].map((path) => [path, `/de${path}`]),
  ),
};

/** German path of an English page, if it has one. */
function germanPath(enPath: string): string | undefined {
  if (translatedPaths[enPath]) return translatedPaths[enPath];
  if (translatedPrefixes.some((prefix) => enPath.startsWith(prefix))) return `/de${enPath}`;
  return undefined;
}

/** English path of a page that also exists in German. */
export type TranslatedPath = string;

export function isTranslatedPath(enPath: string): boolean {
  return germanPath(enPath) !== undefined;
}

export function localeFromPath(pathname: string): Locale {
  return pathname === "/de" || pathname.startsWith("/de/") ? "de" : "en";
}

/** The counterpart of `pathname` in `target`; pages without a translation fall back to that language's home page. */
export function localizedPath(pathname: string, target: Locale): string {
  if (localeFromPath(pathname) === target) return pathname;
  if (target === "de") return germanPath(pathname) ?? "/de";
  // Every German page is a translation: its English counterpart is the same path without /de.
  const en = pathname === "/de" ? "/" : pathname.slice(3);
  return germanPath(en) ? en : "/";
}

/**
 * Link target of an English path for a language: the German version under /de when it exists, otherwise the
 * English page (guides and legal texts are English-only). External URLs and anchors pass through unchanged.
 */
export function localizeHref(enHref: string, locale: Locale): string {
  if (locale === "en" || !enHref.startsWith("/")) return enHref;
  const [path, hash] = enHref.split("#");
  const target = germanPath(path || "/");
  if (!target) return enHref;
  return hash ? `${target}#${hash}` : target;
}

/** hreflang alternates (incl. x-default) for a translated page, keyed by its English path. */
export function languageAlternates(enPath: TranslatedPath) {
  return { en: enPath, de: germanPath(enPath) ?? enPath, "x-default": enPath };
}
