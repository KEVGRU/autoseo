import type { Metadata } from "next";
import { ogLocale } from "@/components/marketing/locales";
import { absoluteUrl, site } from "@/lib/site";
import type { Locale } from "./types";

/** German counterpart of an English path: every page in this folder exists in both languages (`/de` + path). */
export function localizePath(enPath: string, locale: Locale): string {
  if (locale === "en") return enPath;
  return enPath === "/" ? "/de" : `/de${enPath}`;
}

/** Home link of a language (breadcrumb root). */
export const homeCrumb: Record<Locale, { label: string; href: string }> = {
  en: { label: "Home", href: "/" },
  de: { label: "Startseite", href: "/de" },
};

/**
 * Metadata for a bilingual page: canonical URL, hreflang alternates (en, de, x-default), Open Graph and Twitter
 * card. Uses the default social image unless the route has its own opengraph-image file.
 */
export function siteMetadata({
  title,
  description,
  enPath,
  locale,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  ownImage,
  noindex,
}: {
  title: string;
  description: string;
  enPath: string;
  locale: Locale;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  ownImage?: boolean;
  noindex?: boolean;
}): Metadata {
  const path = localizePath(enPath, locale);
  const fullTitle = `${title} · ${site.name}`;
  const images = ownImage ? {} : { images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: site.name }] };
  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: { en: enPath, de: localizePath(enPath, "de"), "x-default": enPath },
    },
    openGraph: {
      type,
      siteName: site.name,
      locale: ogLocale[locale],
      alternateLocale: locale === "de" ? ogLocale.en : ogLocale.de,
      url: path,
      title: fullTitle,
      description,
      ...(type === "article" ? { publishedTime, modifiedTime, authors } : {}),
      ...images,
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, ...images },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export { absoluteUrl };
