import type { Metadata } from "next";
import { site } from "@/lib/site";
import { getCopy } from "./i18n";
import { languageAlternates, ogLocale, type Locale, type TranslatedPath } from "./locales";

type PageMeta = {
  /** Page title without the site suffix (the root layout template appends "· AutoSEO"). */
  title: string;
  description: string;
  path: string;
  locale?: Locale;
  /** English path of a page that also exists in German; adds hreflang alternates (en, de, x-default). */
  translationOf?: TranslatedPath;
  /** Use the title as-is, without the template suffix. */
  absolute?: boolean;
  /** The route has its own opengraph-image file (Next.js then fills og:image and twitter:image). */
  ownImage?: boolean;
};

/**
 * Per-page metadata with canonical URL, hreflang alternates, Open Graph and Twitter card. A page-level `openGraph`
 * object replaces the parent's, so the default image is set explicitly here.
 */
export function pageMetadata({ title, description, path, locale = "en", translationOf, absolute, ownImage }: PageMeta): Metadata {
  const fullTitle = absolute ? title : `${title} · ${site.name}`;
  // Default social card (src/app/opengraph-image.tsx). Leave the key out entirely for routes with their own
  // opengraph-image file; even `images: undefined` suppresses it.
  const images = ownImage
    ? {}
    : { images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: getCopy(locale).meta.ogAlt }] };
  return {
    title: absolute ? { absolute: title } : title,
    description,
    alternates: {
      canonical: path,
      ...(translationOf ? { languages: languageAlternates(translationOf) } : {}),
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: ogLocale[locale],
      ...(translationOf ? { alternateLocale: locale === "de" ? ogLocale.en : ogLocale.de } : {}),
      url: path,
      title: fullTitle,
      description,
      ...images,
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, ...images },
  };
}
