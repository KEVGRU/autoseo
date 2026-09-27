import { appHost, cloudPlan, engines, featureRows, homeFaq, installCommand, overview, price, seoSuite } from "@/components/marketing/content";
import { getLanding } from "@/components/marketing/catalog";
import {
  featurePath,
  featureSlugs,
  integrationCategorySlugs,
  integrationPath,
  integrationSlugs,
  integrationsPath,
  platformPath,
  platformSlugs,
  sitePages,
  solutionPath,
  solutionSlugs,
  solutionsPath,
} from "@/components/marketing/catalog/routes";
import { blogPostPath, blogRssPath } from "@/components/site/blog/paths";
import { getPosts } from "@/content/blog";
import playbooks from "@/content/company/playbooks.en";
import { playbookPath } from "@/components/site/company/paths";
import { absoluteUrl, site } from "@/lib/site";

/** Markdown list of the landing pages of one section. */
function pageList(items: { title: string; path: string; summary: string }[]) {
  return items.map((item) => `- [${item.title}](${absoluteUrl(item.path)}): ${item.summary}`).join("\n");
}

export const dynamic = "force-static";

/** llms.txt (https://llmstxt.org): a plain-markdown summary of the product for AI assistants and answer engines. */
export function GET() {
  const landing = getLanding("en");
  const body = `# ${site.name}

> ${site.name} is an open-source (MIT) AI visibility (GEO) and SEO platform by ${site.company}. It tracks how AI answer engines mention and cite a brand — ${engines.map((e) => e.name).join(", ")} — alongside keyword research, rank tracking, backlinks, site audits, Search Console, GA4, content optimization and white-label reports. Self-host it for free or get a workspace in the fully managed AutoSEO Cloud for ${price}/month.

## Key facts

- License: MIT. Source code: ${site.github}
- Self-hosted: free forever, every feature, runs on any Linux server with Docker. Docker image: \`${site.image}:latest\`. One-line installer: \`${installCommand}\`
- AutoSEO Cloud: ${price} per workspace per month, billed monthly via Stripe, cancel anytime. Every customer gets their own workspace in one shared, fully managed AutoSEO instance at https://${appHost}, hosted in Germany; workspace data is logically separated in a shared database. Includes every feature, unlimited users, up to ${cloudPlan.projects} projects and $${cloudPlan.includedUsageUsd} of AI and data-provider usage per month (fair use). AI providers, DataForSEO and email are managed by the Codext team (no API keys needed); updates are automatic; one-click sign-in from ${site.host}; email support. After cancellation the workspace is paused and its data deleted after 30 days. Prices exclude VAT where applicable; business customers only.
- AI work can run on the customer's own Claude Code or Codex CLI through a lightweight local agent (unlimited, also in the Cloud). Self-hosted installations can alternatively use their own API keys (Anthropic, OpenAI, OpenRouter, Perplexity, Gemini, xAI, Mistral, DeepSeek) and their own DataForSEO account.
- Full control or an own instance: self-host the identical open-source app. Cloud data can be exported as reports and tables (CSV, Google Sheets, PPTX, PDF).

## Features

${overview.items.map((item) => `- **${item.title}:** ${item.body}`).join("\n")}

### Details

${[...featureRows, seoSuite].map((f) => `- **${f.eyebrow}:** ${f.bullets.join("; ")}.`).join("\n")}

## Pages

- [Home](${absoluteUrl("/")}): product overview, features, comparison and FAQ
- [Pricing](${absoluteUrl("/pricing")}): self-hosted (free) vs. Cloud (${price}/month) and billing FAQ
- [German home page / Startseite auf Deutsch](${absoluteUrl("/de")}) and [German pricing / Preise](${absoluteUrl("/de/pricing")})
- [Self-hosting guide](${absoluteUrl("/self-hosting")}): installer, Docker Compose, Coolify, updates and backups
- [GitHub repository](${site.github}): source code, issues and README
- [Sign up](${absoluteUrl("/signup")}): start an AutoSEO Cloud subscription
- [Security](${absoluteUrl("/security")}): ${landing.security.meta.description}
- [Support](${absoluteUrl("/support")}): ${landing.support.meta.description}
- [Imprint](${absoluteUrl("/imprint")}), [Privacy policy](${absoluteUrl("/privacy")}), [Terms of service](${absoluteUrl("/terms")})

Every product, platform, solution, integration, resource and company page below also exists in German under /de (same path after /de).

### Product

${pageList(featureSlugs.map((slug) => ({ title: landing.features[slug].nav, path: featurePath(slug), summary: landing.features[slug].summary })))}

### AI platforms

${pageList(platformSlugs.map((slug) => ({ title: landing.platforms[slug].nav, path: platformPath(slug), summary: landing.platforms[slug].summary })))}

### Solutions

- [All solutions](${absoluteUrl(solutionsPath)}): AutoSEO for every team and industry
${pageList(solutionSlugs.map((slug) => ({ title: landing.solutions[slug].nav, path: solutionPath(slug), summary: landing.solutions[slug].summary })))}

### Integrations

- [All integrations](${absoluteUrl(integrationsPath)}): ${landing.integrationsHub.meta.description}
${pageList(integrationCategorySlugs.map((slug) => ({ title: landing.integrationCategories[slug].nav, path: integrationPath(slug), summary: landing.integrationCategories[slug].summary })))}
${pageList(integrationSlugs.map((slug) => ({ title: landing.integrations[slug].nav, path: integrationPath(slug), summary: landing.integrations[slug].summary })))}

### Resources

- [${landing.ui.pages.aiVisibilityCheck}](${absoluteUrl(sitePages.aiVisibilityCheck)}): check without login whether AI crawlers can read a site
- [${landing.ui.pages.aiAgentInstructions}](${absoluteUrl(sitePages.aiAgentInstructions)}), also as Markdown: ${absoluteUrl(`${sitePages.aiAgentInstructions}.md`)}
- [${landing.ui.pages.entityConnections}](${absoluteUrl(sitePages.entityConnections)})
- [${landing.ui.pages.blog}](${absoluteUrl(sitePages.blog)}) (RSS: ${absoluteUrl(blogRssPath)})
${pageList(getPosts("en").map((post) => ({ title: post.title, path: blogPostPath(post.slug), summary: post.description })))}
- [${landing.ui.pages.caseStudies}](${absoluteUrl(sitePages.caseStudies)}): reproducible GEO playbooks
${pageList(playbooks.map((p) => ({ title: p.hero.title, path: playbookPath(p.slug), summary: p.teaser })))}

### Company

${(["enterprise", "customers", "partnerProgram", "affiliateProgram", "careers", "press", "webinars", "exhibitions"] as const)
  .map((key) => `- [${landing.ui.pages[key]}](${absoluteUrl(sitePages[key])})`)
  .join("\n")}

## FAQ

${homeFaq.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n")}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
