import type { Metadata } from "next";
import type { Faq, PageMeta } from "../catalog/types";
import { JsonLd } from "../json-ld";
import { localizeHref, type Locale } from "../locales";
import { pageMetadata } from "../metadata";
import { breadcrumbs, faqPage, graph, organization, softwareApplication, webPage } from "../structured-data";

/** Metadata of a landing page that exists in both languages; `enPath` is the English path. */
export function landingMetadata(meta: PageMeta, enPath: string, locale: Locale): Metadata {
  return pageMetadata({
    title: meta.title,
    description: meta.description,
    path: localizeHref(enPath, locale),
    locale,
    translationOf: enPath,
  });
}

/** WebPage + BreadcrumbList + FAQPage (+ the product) for a landing page. */
export function LandingJsonLd({
  enPath,
  locale,
  meta,
  trail,
  faq,
}: {
  enPath: string;
  locale: Locale;
  meta: PageMeta;
  /** Breadcrumb items after "Home"; items without a path use the page itself. */
  trail: { name: string; enPath?: string }[];
  faq: Faq[];
}) {
  const path = localizeHref(enPath, locale);
  return (
    <JsonLd
      data={graph(
        organization(),
        webPage({ path, name: meta.title, description: meta.description, locale }),
        softwareApplication(locale),
        breadcrumbs(
          trail.map((item) => ({ name: item.name, path: localizeHref(item.enPath ?? enPath, locale) })),
          locale,
        ),
        ...(faq.length ? [faqPage(faq, path, locale)] : []),
      )}
    />
  );
}
