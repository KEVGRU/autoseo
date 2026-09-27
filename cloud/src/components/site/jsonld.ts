import { absoluteUrl, site } from "@/lib/site";
import { plainText } from "./inline";
import type { Faq, Locale } from "./types";

type Node = Record<string, unknown>;

const organizationId = absoluteUrl("/#organization");
const websiteId = absoluteUrl("/#website");
const softwareId = absoluteUrl("/#software");

export const ids = { organization: organizationId, website: websiteId, software: softwareId };

export function graph(...nodes: (Node | null | undefined)[]): Node {
  return { "@context": "https://schema.org", "@graph": nodes.filter(Boolean) };
}

export function webPageNode({ path, name, description, locale, type = "WebPage" }: { path: string; name: string; description: string; locale: Locale; type?: string }): Node {
  return {
    "@type": type,
    "@id": absoluteUrl(`${path}#webpage`),
    url: absoluteUrl(path),
    name,
    description,
    inLanguage: locale,
    isPartOf: { "@id": websiteId },
    publisher: { "@id": organizationId },
    about: { "@id": softwareId },
  };
}

export function breadcrumbNode(items: { name: string; path: string }[]): Node {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqNode(items: Faq[], path: string, locale: Locale): Node | null {
  if (!items.length) return null;
  return {
    "@type": "FAQPage",
    "@id": absoluteUrl(`${path}#faq`),
    inLanguage: locale,
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: plainText(f.q),
      acceptedAnswer: { "@type": "Answer", text: plainText(f.a) },
    })),
  };
}

export function articleNode({
  path,
  headline,
  description,
  datePublished,
  dateModified,
  author,
  locale,
  keywords,
}: {
  path: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author: { name: string; path: string };
  locale: Locale;
  keywords?: string[];
}): Node {
  return {
    "@type": "BlogPosting",
    "@id": absoluteUrl(`${path}#article`),
    mainEntityOfPage: { "@id": absoluteUrl(`${path}#webpage`) },
    headline,
    description,
    datePublished,
    dateModified: dateModified ?? datePublished,
    inLanguage: locale,
    author: { "@type": "Organization", name: author.name, url: absoluteUrl(author.path) },
    publisher: { "@id": organizationId },
    image: absoluteUrl("/opengraph-image"),
    ...(keywords?.length ? { keywords: keywords.join(", ") } : {}),
  };
}

/** Minimal Organization + SoftwareApplication nodes so every page can reference them by @id. */
export function coreNodes(): Node[] {
  const { legal } = site;
  return [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: legal.name,
      url: legal.website,
      logo: absoluteUrl("/icon.svg"),
      email: legal.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: legal.street,
        postalCode: legal.postalCode,
        addressLocality: legal.city,
        addressCountry: legal.countryCode,
      },
      sameAs: ["https://github.com/codextde", site.github],
    },
    {
      "@type": "SoftwareApplication",
      "@id": softwareId,
      name: site.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Linux, Docker",
      license: "https://opensource.org/licenses/MIT",
      url: site.url,
      codeRepository: site.github,
      publisher: { "@id": organizationId },
    },
  ];
}
