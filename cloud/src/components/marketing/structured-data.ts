import { absoluteUrl, site } from "@/lib/site";
import type { Faq } from "./content";
import { getCopy } from "./i18n";
import type { Locale } from "./locales";

const ids = {
  organization: absoluteUrl("/#organization"),
  website: absoluteUrl("/#website"),
  software: absoluteUrl("/#software"),
  sourceCode: absoluteUrl("/#source-code"),
};

type Node = Record<string, unknown>;

export function graph(...nodes: Node[]): Node {
  return { "@context": "https://schema.org", "@graph": nodes };
}

export function organization(): Node {
  const { legal } = site;
  return {
    "@type": "Organization",
    "@id": ids.organization,
    name: legal.name,
    legalName: legal.name,
    url: legal.website,
    logo: absoluteUrl("/icon.svg"),
    email: legal.email,
    telephone: legal.phone,
    vatID: legal.vatId,
    address: {
      "@type": "PostalAddress",
      streetAddress: legal.street,
      postalCode: legal.postalCode,
      addressLocality: legal.city,
      addressCountry: legal.countryCode,
    },
    sameAs: ["https://github.com/codextde"],
  };
}

export function website(): Node {
  return {
    "@type": "WebSite",
    "@id": ids.website,
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: ["en", "de"],
    publisher: { "@id": ids.organization },
  };
}

/** The page itself, carrying its language. */
export function webPage({ path, name, description, locale }: { path: string; name: string; description: string; locale: Locale }): Node {
  return {
    "@type": "WebPage",
    "@id": absoluteUrl(`${path}#webpage`),
    url: absoluteUrl(path),
    name,
    description,
    inLanguage: locale,
    isPartOf: { "@id": ids.website },
    about: { "@id": ids.software },
    publisher: { "@id": ids.organization },
  };
}

export function softwareApplication(locale: Locale = "en"): Node {
  const { schema } = getCopy(locale);
  const pricingPath = locale === "de" ? "/de/pricing" : "/pricing";
  return {
    "@type": "SoftwareApplication",
    "@id": ids.software,
    name: site.name,
    description: schema.softwareDescription,
    url: site.url,
    image: absoluteUrl("/opengraph-image"),
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "SEO and AI visibility software",
    operatingSystem: "Web, Linux (Docker)",
    license: "https://opensource.org/licenses/MIT",
    isAccessibleForFree: true,
    sameAs: [site.github],
    publisher: { "@id": ids.organization },
    offers: [
      {
        "@type": "Offer",
        name: schema.selfHostedOffer.name,
        description: schema.selfHostedOffer.description,
        price: "0",
        priceCurrency: "USD",
        url: absoluteUrl("/self-hosting"),
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: schema.cloudOffer.name,
        description: schema.cloudOffer.description,
        price: String(site.priceMonthlyUsd),
        priceCurrency: "USD",
        url: absoluteUrl(pricingPath),
        availability: "https://schema.org/InStock",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: String(site.priceMonthlyUsd),
          priceCurrency: "USD",
          unitText: "MONTH",
          billingDuration: "P1M",
          valueAddedTaxIncluded: false,
        },
      },
    ],
  };
}

export function sourceCode(): Node {
  return {
    "@type": "SoftwareSourceCode",
    "@id": ids.sourceCode,
    name: `${site.name} source code`,
    codeRepository: site.github,
    programmingLanguage: "TypeScript",
    runtimePlatform: "Node.js, Docker",
    license: "https://opensource.org/licenses/MIT",
    targetProduct: { "@id": ids.software },
    publisher: { "@id": ids.organization },
  };
}

export function faqPage(faqs: Faq[], path: string, locale: Locale = "en"): Node {
  return {
    "@type": "FAQPage",
    "@id": absoluteUrl(`${path}#faq`),
    inLanguage: locale,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbs(items: { name: string; path: string }[], locale: Locale = "en"): Node {
  const { ui } = getCopy(locale);
  const all = [{ name: ui.homeLabel, path: ui.homeHref }, ...items];
  return {
    "@type": "BreadcrumbList",
    itemListElement: all.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
