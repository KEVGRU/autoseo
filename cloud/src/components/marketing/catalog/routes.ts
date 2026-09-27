/**
 * Slugs and paths of the SEO landing pages (features, AI platforms, solutions, integrations, company pages).
 * Client-safe: no copy, only identifiers — the language switch, sitemap and footer derive their links from here.
 * Every page exists in English at the root and in German under /de with the same slug.
 */

/** Product pages, served at `/<slug>`. Order = footer and menu order. */
export const featureSlugs = [
  "ai-visibility-tracking",
  "prompt-research",
  "ai-competitor-analysis",
  "ai-brand-sentiment",
  "ai-citation-tracking",
  "query-fanout-analysis",
  "ai-shopping-visibility",
  "ai-ads-tracking",
  "ai-traffic-analytics",
  "ai-search-attribution",
  "ai-bot-traffic",
  "ai-crawlability",
  "ai-seo-tasks",
  "ai-content-optimization",
  "ai-fact-check",
  "keyword-research",
  "rank-tracking",
  "site-audit",
  "report-builder",
  "ai-seo-agent",
  "rest-api",
  "mcp-server",
] as const;
export type FeatureSlug = (typeof featureSlugs)[number];

/** AI answer engines, served at `/ai-visibility-tracking/<slug>`. */
export const platformSlugs = [
  "chatgpt",
  "perplexity",
  "claude",
  "gemini",
  "google-ai-mode",
  "google-ai-overviews",
  "microsoft-copilot",
  "grok",
  "mistral",
  "deepseek",
  "meta-ai",
  "qwen",
  "kimi",
  "sabia",
  "solar",
] as const;
export type PlatformSlug = (typeof platformSlugs)[number];

/** Teams and industries, served at `/solutions/<slug>`. */
export const solutionSlugs = [
  "geo-teams",
  "content-teams",
  "pr-brand-teams",
  "customer-experience",
  "agencies",
  "e-commerce",
  "finance",
  "saas-tech",
  "healthcare",
  "pharma",
  "automotive",
  "travel",
] as const;
export type SolutionSlug = (typeof solutionSlugs)[number];

/** Integration categories, served at `/integrations/<slug>` next to single integrations. */
export const integrationCategorySlugs = [
  "cms",
  "analytics",
  "search-console",
  "bot-traffic",
  "attribution",
  "project-management",
  "data-reporting",
] as const;
export type IntegrationCategorySlug = (typeof integrationCategorySlugs)[number];

/** Integrations with their own page, served at `/integrations/<slug>`. */
export const integrationSlugs = [
  "wordpress",
  "webflow",
  "shopify",
  "google-analytics",
  "google-search-console",
  "cloudflare",
  "hubspot",
  "salesforce",
  "jira",
  "linear",
  "framer",
  "matomo",
  "piwik-pro",
  "bing-webmaster-tools",
  "akamai",
  "server-logs",
  "asana",
  "clickup",
  "monday",
  "trello",
  "notion",
  "awork",
  "looker-studio",
  "stripe",
  "woocommerce",
  "shopware",
  "pipedrive",
  "attio",
  "close",
  "intercom",
  "calendly",
  "zapier",
  "n8n",
  "custom-webhook",
  "typeform",
  "tally",
  "jotform",
  "gravity-forms",
  "formstack",
  "surveymonkey",
  "fairing",
  "knocommerce",
  "zigpoll",
] as const;
export type IntegrationSlug = (typeof integrationSlugs)[number];

/** Integrations listed in the footer and menus (the hub and category pages list all of them). */
export const featuredIntegrations: IntegrationSlug[] = [
  "wordpress",
  "webflow",
  "shopify",
  "google-analytics",
  "google-search-console",
  "cloudflare",
  "hubspot",
  "salesforce",
  "jira",
  "linear",
];

export const featurePath = (slug: FeatureSlug) => `/${slug}`;
export const platformPath = (slug: PlatformSlug) => `/ai-visibility-tracking/${slug}`;
export const solutionPath = (slug: SolutionSlug) => `/solutions/${slug}`;
export const integrationPath = (slug: IntegrationSlug | IntegrationCategorySlug) => `/integrations/${slug}`;
export const integrationsPath = "/integrations";
export const solutionsPath = "/solutions";

/** Solutions grouped for menus and the hub. */
export const teamSolutions: SolutionSlug[] = ["geo-teams", "content-teams", "pr-brand-teams", "customer-experience", "agencies"];
export const industrySolutions: SolutionSlug[] = ["e-commerce", "finance", "saas-tech", "healthcare", "pharma", "automotive", "travel"];

/** Company pages with a German version. */
export const companyPaths = ["/security", "/support"] as const;

/**
 * Pages built outside this catalog (company, resources, facts and the free check; copy in src/content, components in
 * src/components/site). All exist under /de with the same slug. Plain paths here so client code (the language switch)
 * doesn't import their copy; the sitemap and llms.txt read the registries in src/content directly.
 */
export const sitePages = {
  enterprise: "/enterprise",
  customers: "/customers",
  caseStudies: "/case-studies",
  press: "/press",
  careers: "/careers",
  webinars: "/webinars",
  exhibitions: "/exhibitions",
  partnerProgram: "/partner-program",
  affiliateProgram: "/affiliate-program",
  affiliateTerms: "/affiliate-terms",
  aiAgentInstructions: "/ai-agent-instructions",
  entityConnections: "/entity-connections",
  aiVisibilityCheck: "/ai-visibility-check",
  blog: "/blog",
} as const;
export type SitePage = keyof typeof sitePages;

/** Sections whose sub pages all exist in both languages (playbooks, blog posts and authors). */
export const translatedPrefixes = ["/case-studies/", "/blog/"] as const;

/** English paths of every landing page that also exists under /de. */
export const landingPaths: string[] = [
  ...featureSlugs.map(featurePath),
  ...platformSlugs.map(platformPath),
  solutionsPath,
  ...solutionSlugs.map(solutionPath),
  integrationsPath,
  ...integrationCategorySlugs.map(integrationPath),
  ...integrationSlugs.map(integrationPath),
  ...companyPaths,
];

export function isFeatureSlug(value: string): value is FeatureSlug {
  return (featureSlugs as readonly string[]).includes(value);
}
export function isPlatformSlug(value: string): value is PlatformSlug {
  return (platformSlugs as readonly string[]).includes(value);
}
export function isSolutionSlug(value: string): value is SolutionSlug {
  return (solutionSlugs as readonly string[]).includes(value);
}
export function isIntegrationSlug(value: string): value is IntegrationSlug {
  return (integrationSlugs as readonly string[]).includes(value);
}
export function isIntegrationCategorySlug(value: string): value is IntegrationCategorySlug {
  return (integrationCategorySlugs as readonly string[]).includes(value);
}
