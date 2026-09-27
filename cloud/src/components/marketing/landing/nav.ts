import { site } from "@/lib/site";
import { getLanding } from "../catalog";
import {
  featurePath,
  featureSlugs,
  industrySolutions,
  integrationCategorySlugs,
  integrationPath,
  featuredIntegrations,
  integrationsPath,
  platformPath,
  platformSlugs,
  sitePages,
  solutionPath,
  solutionsPath,
  teamSolutions,
  type FeatureSlug,
  type SitePage,
} from "../catalog/routes";
import { getCopy } from "../i18n";
import { localizeHref, type Locale } from "../locales";

export type NavLink = { label: string; href: string; description?: string; external?: boolean };
export type NavGroup = { title: string; links: NavLink[] };

/** Product pages grouped for the mega menu. */
const productGroups: { key: "aiVisibility" | "seo" | "analytics" | "optimize" | "developers"; slugs: FeatureSlug[] }[] = [
  {
    key: "aiVisibility",
    slugs: [
      "ai-visibility-tracking",
      "prompt-research",
      "ai-competitor-analysis",
      "ai-brand-sentiment",
      "ai-citation-tracking",
      "query-fanout-analysis",
      "ai-shopping-visibility",
      "ai-ads-tracking",
    ],
  },
  { key: "seo", slugs: ["keyword-research", "rank-tracking", "site-audit", "ai-crawlability"] },
  { key: "analytics", slugs: ["ai-traffic-analytics", "ai-search-attribution", "ai-bot-traffic"] },
  { key: "optimize", slugs: ["ai-seo-tasks", "ai-content-optimization", "ai-fact-check", "report-builder", "ai-seo-agent"] },
  { key: "developers", slugs: ["rest-api", "mcp-server"] },
];

/** Every link of the site navigation for one language (footer, header menus, mobile menu). */
export function siteNav(locale: Locale) {
  const { features, platforms, solutions, integrationCategories, integrations, ui } = getLanding(locale);
  const { footer } = getCopy(locale);
  const href = (path: string) => localizeHref(path, locale);
  const feature = (slug: FeatureSlug): NavLink => ({
    label: features[slug].nav,
    href: href(featurePath(slug)),
    description: features[slug].summary,
  });

  const copyLinks = footer.columns.flatMap((column) => column.links);
  const byHref = (target: string) => copyLinks.find((link) => link.href === target || link.href === href(target));
  const pick = (targets: string[]) => targets.flatMap((t) => byHref(t) ?? []);
  const legalColumn = footer.columns.find((column) => column.links.some((link) => link.href === "/imprint"));
  const page = (key: SitePage): NavLink => ({ label: ui.pages[key], href: href(sitePages[key]) });

  return {
    productGroups: productGroups.map(({ key, slugs }) => ({ title: ui.menu[key], links: slugs.map(feature) })),
    product: featureSlugs.map(feature),
    platforms: platformSlugs.map((slug) => ({
      label: platforms[slug].nav,
      href: href(platformPath(slug)),
      description: platforms[slug].summary,
    })),
    solutionsByTeam: teamSolutions.map((slug) => ({
      label: solutions[slug].nav,
      href: href(solutionPath(slug)),
      description: solutions[slug].summary,
    })),
    solutionsByIndustry: industrySolutions.map((slug) => ({
      label: solutions[slug].nav,
      href: href(solutionPath(slug)),
      description: solutions[slug].summary,
    })),
    solutionsHub: { label: ui.allSolutions, href: href(solutionsPath) },
    integrations: [
      { label: ui.allIntegrations, href: href(integrationsPath) },
      ...integrationCategorySlugs.map((slug) => ({ label: integrationCategories[slug].nav, href: href(integrationPath(slug)) })),
      ...featuredIntegrations.map((slug) => ({ label: integrations[slug].nav, href: href(integrationPath(slug)) })),
    ],
    resources: [
      page("blog"),
      page("caseStudies"),
      page("aiVisibilityCheck"),
      page("webinars"),
      page("exhibitions"),
      page("press"),
      page("aiAgentInstructions"),
      page("entityConnections"),
      ...pick(["/self-hosting", site.github, "/llms.txt"]),
    ] as NavLink[],
    company: [
      ...pick(["/pricing"]),
      page("enterprise"),
      page("customers"),
      page("partnerProgram"),
      page("affiliateProgram"),
      page("careers"),
      { label: ui.securityNav, href: href("/security") },
      { label: ui.supportNav, href: href("/support") },
      ...pick([`${site.github}/issues`, "/signup", "/login"]),
    ] as NavLink[],
    legal: [...((legalColumn?.links ?? []) as NavLink[]).map((l) => ({ ...l, href: href(l.href) })), page("affiliateTerms")],
    legalTitle: legalColumn?.title ?? ui.legal,
  };
}
