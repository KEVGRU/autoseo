import { getCopy } from "@/components/marketing/i18n";
import { absoluteUrl, site } from "@/lib/site";
import { ENGINE_FACTS, INTEGRATION_FACTS, QID, sources, wikidata } from "@/content/facts/data";
import { integrationCategory } from "@/content/facts/tables";
import { ids } from "../jsonld";
import type { Locale } from "../types";

type Node = Record<string, unknown>;

/** Stable @ids of the fact-page entities (the organization and software ids are shared with the whole site). */
export const factIds = {
  organization: ids.organization,
  software: ids.software,
  website: ids.website,
  sourceCode: absoluteUrl("/#source-code"),
  dockerImage: absoluteUrl("/entity-connections#docker-image"),
  cloud: absoluteUrl("/entity-connections#autoseo-cloud"),
  license: absoluteUrl("/entity-connections#mit-license"),
  place: absoluteUrl("/entity-connections#wolpertshausen"),
  restApi: absoluteUrl("/entity-connections#rest-api"),
  mcp: absoluteUrl("/entity-connections#mcp-server"),
  geo: absoluteUrl("/entity-connections#geo"),
  seo: absoluteUrl("/entity-connections#seo"),
  engines: absoluteUrl("/entity-connections#ai-engines"),
  integrations: absoluteUrl("/entity-connections#integrations"),
};

/** Organization, software, source code and Cloud service — the core entities, richer than the site-wide nodes. */
export function coreFactNodes(locale: Locale): Node[] {
  const { legal } = site;
  const { schema } = getCopy(locale);
  return [
    {
      "@type": "Organization",
      "@id": factIds.organization,
      name: legal.name,
      legalName: legal.name,
      url: legal.website,
      email: legal.email,
      telephone: legal.phone,
      vatID: legal.vatId,
      identifier: { "@type": "PropertyValue", propertyID: "Handelsregister", name: legal.registerCourt, value: legal.registerNumber },
      address: {
        "@type": "PostalAddress",
        streetAddress: legal.street,
        postalCode: legal.postalCode,
        addressLocality: legal.city,
        addressCountry: legal.countryCode,
      },
      location: { "@id": factIds.place },
      sameAs: [sources.githubOrg],
    },
    {
      "@type": "SoftwareApplication",
      "@id": factIds.software,
      name: site.name,
      description: schema.softwareDescription,
      url: `https://${site.host}`,
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "AI visibility (GEO/AEO) and SEO software",
      operatingSystem: "Linux (Docker); web browser",
      softwareRequirements: "Docker with Compose v2",
      license: "https://opensource.org/licenses/MIT",
      isAccessibleForFree: true,
      author: { "@id": factIds.organization },
      publisher: { "@id": factIds.organization },
      sameAs: [sources.repo, sources.dockerImage],
      about: [{ "@id": factIds.geo }, { "@id": factIds.seo }],
      offers: [
        {
          "@type": "Offer",
          name: schema.selfHostedOffer.name,
          description: schema.selfHostedOffer.description,
          price: "0",
          priceCurrency: "USD",
          url: absoluteUrl("/self-hosting"),
        },
        {
          "@type": "Offer",
          name: schema.cloudOffer.name,
          description: schema.cloudOffer.description,
          price: String(site.priceMonthlyUsd),
          priceCurrency: "USD",
          url: absoluteUrl(locale === "de" ? "/de/pricing" : "/pricing"),
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
    },
    {
      "@type": "SoftwareSourceCode",
      "@id": factIds.sourceCode,
      name: `${site.name} source code`,
      codeRepository: sources.repo,
      programmingLanguage: "TypeScript",
      runtimePlatform: "Node.js, Docker",
      license: "https://opensource.org/licenses/MIT",
      author: { "@id": factIds.organization },
      targetProduct: { "@id": factIds.software },
    },
    {
      "@type": "Service",
      "@id": factIds.cloud,
      name: "AutoSEO Cloud",
      serviceType: "Managed hosting of AutoSEO",
      url: absoluteUrl(locale === "de" ? "/de/pricing" : "/pricing"),
      provider: { "@id": factIds.organization },
      isRelatedTo: { "@id": factIds.software },
      offers: {
        "@type": "Offer",
        price: String(site.priceMonthlyUsd),
        priceCurrency: "USD",
        priceSpecification: { "@type": "UnitPriceSpecification", price: String(site.priceMonthlyUsd), priceCurrency: "USD", unitText: "MONTH", valueAddedTaxIncluded: false },
      },
    },
  ];
}

/** Every other entity of the entity map: license, image, place, APIs, engines, integrations, category terms. */
export function entityGraphNodes(locale: Locale): Node[] {
  const categories = integrationCategory[locale];
  return [
    { "@type": "CreativeWork", "@id": factIds.license, name: "MIT License", url: "https://opensource.org/licenses/MIT", sameAs: [wikidata(QID.mitLicense)] },
    {
      "@type": "Place",
      "@id": factIds.place,
      name: `${site.legal.city}, Germany`,
      sameAs: [wikidata(QID.wolpertshausen)],
      containedInPlace: { "@type": "Country", name: "Germany", sameAs: [wikidata(QID.germany)] },
    },
    {
      "@type": "SoftwareApplication",
      "@id": factIds.dockerImage,
      name: `${site.image} (Docker image)`,
      url: sources.dockerImage,
      applicationCategory: "Container image",
      operatingSystem: "Linux",
      isBasedOn: { "@id": factIds.sourceCode },
      publisher: { "@id": factIds.organization },
      license: "https://opensource.org/licenses/MIT",
    },
    {
      "@type": "WebAPI",
      "@id": factIds.restApi,
      name: "AutoSEO REST API v1",
      documentation: sources.apiRoutes,
      provider: { "@id": factIds.organization },
      isRelatedTo: { "@id": factIds.software },
    },
    {
      "@type": "WebAPI",
      "@id": factIds.mcp,
      name: "AutoSEO MCP server",
      description: "Model Context Protocol server (Streamable HTTP) with more than 100 tools.",
      documentation: sources.mcpServer,
      provider: { "@id": factIds.organization },
      isRelatedTo: { "@id": factIds.software },
      sameAs: [wikidata(QID.mcp)],
    },
    {
      "@type": "DefinedTerm",
      "@id": factIds.geo,
      name: "Generative engine optimization (GEO)",
      alternateName: ["GEO", "Answer engine optimization", "AEO", "AI visibility", "LLM optimization", "LLMO"],
      sameAs: [wikidata(QID.geo)],
    },
    { "@type": "DefinedTerm", "@id": factIds.seo, name: "Search engine optimization (SEO)", alternateName: "SEO", sameAs: [wikidata(QID.seo)] },
    {
      "@type": "ItemList",
      "@id": factIds.engines,
      name: "AI engines monitored by AutoSEO",
      numberOfItems: ENGINE_FACTS.length,
      itemListElement: ENGINE_FACTS.map((e, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "SoftwareApplication",
          name: e.name,
          applicationCategory: "AI assistant / answer engine",
          ...(e.wikidata?.product ? { sameAs: [wikidata(e.wikidata.product)] } : {}),
          author: { "@type": "Organization", name: e.vendor, ...(e.wikidata?.vendor ? { sameAs: [wikidata(e.wikidata.vendor)] } : {}) },
        },
      })),
    },
    {
      "@type": "ItemList",
      "@id": factIds.integrations,
      name: "AutoSEO integrations",
      itemListElement: INTEGRATION_FACTS.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "ItemList",
          name: categories[c.key].label,
          description: categories[c.key].purpose,
          itemListElement: c.items.map((item, j) => ({ "@type": "ListItem", position: j + 1, name: item.name })),
        },
      })),
    },
  ];
}
