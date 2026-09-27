import { absoluteUrl, site } from "@/lib/site";
import { CATEGORY_SUITES, CATEGORY_TOOLS, counts, ENGINE_FACTS, FACTS_UPDATED, INTEGRATION_FACTS, QID, sources, wikidata } from "./data";
import { backendLabel, integrationCategory } from "./tables";
import type { Entity, EntityMap } from "./types";

const { legal } = site;
const home = `https://${site.host}`;
const readme = { source: "README — github.com/codextde/autoseo", href: sources.readme };
const imprint = { source: `Imprint — ${site.host}/imprint`, href: absoluteUrl("/imprint") };
const license = { source: "LICENSE — github.com/codextde/autoseo", href: sources.license };
const factSheet = { source: `AI agent instructions — ${site.host}`, href: absoluteUrl("/ai-agent-instructions") };

/** Exact category descriptions from src/lib/integrations-catalog.ts (quoted as evidence). */
const catalogQuote = {
  analytics: "Human traffic from AI platforms, conversions & revenue",
  search_console: "Search queries, impressions and AI-style prompts",
  bot_traffic: "AI crawler visits from your CDN or server logs",
  data_reporting: "Export your data to BI tools, agents and scripts",
  project_management: "Push optimization tasks to your PM tool",
  attribution: "Tie leads, deals and orders to AI search",
  cms: "Publish optimized content directly to your site",
} as const;

const integrationEntities: Entity[] = INTEGRATION_FACTS.map((c) => {
  const cat = integrationCategory.en[c.key];
  return {
    id: `integrations-${c.key.replace(/_/g, "-")}`,
    name: `${cat.label} integrations`,
    kind: "Integration category",
    description: `${cat.purpose}.`,
    identifiers: [{ label: "Source: integrations-catalog.ts", href: sources.integrations }],
    relations: [{ predicate: "INTEGRATED_WITH", target: "AutoSEO", href: "#autoseo" }],
    members: c.items.map((i) => ({ name: i.name, detail: i.status === "beta" ? "beta" : i.status === "coming_soon" ? "coming soon" : undefined })),
    evidence: [{ quote: catalogQuote[c.key], source: "src/lib/integrations-catalog.ts", href: sources.integrations }],
  };
});

export const entityConnectionsEn: EntityMap = {
  path: "/entity-connections",
  crumb: "Entity connections",
  meta: {
    title: "Entity Connections: AutoSEO, Codext GmbH and Related Entities",
    description:
      "Machine-readable map of AutoSEO and its related entities — Codext GmbH, the GitHub repository, Docker image, AutoSEO Cloud, monitored AI engines, integrations and the GEO category — with identifiers, relationships and evidence.",
  },
  hero: {
    eyebrow: "Entity map",
    title: "Entity connections: AutoSEO",
    subtitle:
      "A machine-readable map of AutoSEO and the entities connected to it. Every entry states its relationships explicitly and backs them with a quote from a source you can open — so an AI system building an entity for AutoSEO doesn't have to guess.",
  },
  updated: FACTS_UPDATED,
  labels: {
    updated: "Last updated",
    factSheet: "Full fact sheet",
    toc: "Entities",
    identifiers: "Verified identifiers",
    relations: "Relationships",
    members: "Includes",
    evidence: "Evidence",
    retrieved: "retrieved",
    noIdentifiers: "No external identifier — described by the evidence below.",
    jsonLd: "The same graph is embedded in this page as schema.org JSON-LD (@graph).",
  },
  intro: [
    "Identifiers are listed only where they were verified: our own domains, the GitHub repository and package, and Wikidata items whose label and description were checked. Codext GmbH and AutoSEO have no Wikidata items at the time of writing; none are claimed.",
    "Relationships use explicit predicates (DEVELOPED_BY, LICENSED_UNDER, MONITORS, …). Evidence quotes are verbatim from the linked source.",
  ],
  groups: [
    {
      id: "company",
      title: "Company and location",
      entities: [
        {
          id: "codext-gmbh",
          name: legal.name,
          kind: "Organization",
          description: `German software company (GmbH) that develops and publishes AutoSEO and operates AutoSEO Cloud. Registered office: ${legal.street}, ${legal.postalCode} ${legal.city}, Germany; commercial register ${legal.registerCourt}, ${legal.registerNumber}; VAT ID ${legal.vatId}.`,
          url: legal.website,
          identifiers: [
            { label: "codext.de", href: sources.codext },
            { label: "Imprint (codext.de)", href: sources.codextImprint },
            { label: "GitHub organization codextde", href: sources.githubOrg },
          ],
          relations: [
            { predicate: "DEVELOPS", target: "AutoSEO", href: "#autoseo" },
            { predicate: "PUBLISHES", target: `${site.image} (Docker image)`, href: "#docker-image" },
            { predicate: "OPERATES", target: "AutoSEO Cloud", href: "#autoseo-cloud" },
            { predicate: "HEADQUARTERED_IN", target: `${legal.city}, Germany`, href: "#wolpertshausen" },
            { predicate: "REGISTERED_AT", target: `${legal.registerCourt} (${legal.registerNumber})` },
            { predicate: "MANAGED_BY", target: `${legal.managingDirector} (managing director)` },
          ],
          evidence: [
            { quote: `Registergericht / Register court: ${legal.registerCourt}`, ...imprint },
            { quote: `Registernummer / Register number: ${legal.registerNumber}`, ...imprint },
            { quote: `Copyright (c) 2026 ${legal.name} and AutoSEO contributors`, ...license },
          ],
        },
        {
          id: "wolpertshausen",
          name: `${legal.city}, Germany`,
          kind: "Place",
          description: `Municipality in Baden-Württemberg, Germany; registered office of ${legal.name}.`,
          identifiers: [
            { label: `Wikidata ${QID.wolpertshausen} (${legal.city})`, href: wikidata(QID.wolpertshausen) },
            { label: `Wikidata ${QID.germany} (Germany)`, href: wikidata(QID.germany) },
          ],
          relations: [{ predicate: "LOCATION_OF", target: legal.name, href: "#codext-gmbh" }],
          evidence: [{ quote: `${legal.street}, ${legal.postalCode} ${legal.city}`, ...imprint }],
        },
      ],
    },
    {
      id: "product",
      title: "Product, code and distribution",
      entities: [
        {
          id: "autoseo",
          name: "AutoSEO",
          kind: "Software application",
          description:
            "Open-source (MIT) AI visibility (GEO/AEO) and SEO platform. Tracks how AI answer engines mention, rank and cite a brand for tracked prompts, next to keyword research, rank tracking, backlinks, site audits, Search Console, GA4, attribution, content tools and white-label reports. Self-hosted for free or used as AutoSEO Cloud.",
          url: home,
          identifiers: [
            { label: site.host, href: home },
            { label: "github.com/codextde/autoseo", href: sources.repo },
          ],
          relations: [
            { predicate: "DEVELOPED_BY", target: legal.name, href: "#codext-gmbh" },
            { predicate: "LICENSED_UNDER", target: "MIT License", href: "#mit-license" },
            { predicate: "SOURCE_CODE_AT", target: "github.com/codextde/autoseo", href: "#repository" },
            { predicate: "DISTRIBUTED_AS", target: site.image, href: "#docker-image" },
            { predicate: "OFFERED_AS_SERVICE", target: "AutoSEO Cloud", href: "#autoseo-cloud" },
            { predicate: "MONITORS", target: `${counts.engines} AI engines`, href: "#ai-engines" },
            { predicate: "IMPLEMENTS", target: "REST API v1 (OpenAPI), MCP server", href: "#rest-api" },
            { predicate: "INTEGRATES_WITH", target: "Analytics, Search Console, bot traffic, reporting, project management, attribution and CMS tools", href: "#integrations" },
            { predicate: "OPERATES_IN_CATEGORY", target: "Generative engine optimization (GEO); search engine optimization (SEO)", href: "#geo" },
            { predicate: "BUILT_WITH", target: "Next.js, React, PostgreSQL, Docker", href: "#tech-stack" },
          ],
          evidence: [
            { quote: "AI visibility (GEO/AEO) and classic SEO, analytics, attribution, content and reporting.", ...readme },
            { quote: "Open source and yours. MIT licensed.", ...readme },
          ],
        },
        {
          id: "repository",
          name: "github.com/codextde/autoseo",
          kind: "Source code repository",
          description: "Public GitHub repository with the complete source code of AutoSEO (TypeScript), the self-hosting setup and the AutoSEO Cloud website.",
          url: sources.repo,
          identifiers: [{ label: "GitHub repository", href: sources.repo }],
          relations: [
            { predicate: "SOURCE_CODE_OF", target: "AutoSEO", href: "#autoseo" },
            { predicate: "OWNED_BY", target: `${legal.name} (GitHub organization codextde)`, href: "#codext-gmbh" },
            { predicate: "LICENSED_UNDER", target: "MIT License", href: "#mit-license" },
          ],
          evidence: [{ quote: "MIT License", ...license }],
        },
        {
          id: "docker-image",
          name: site.image,
          kind: "Container image",
          description: "Prebuilt Docker image of AutoSEO on the GitHub Container Registry, used by the one-line installer, Docker Compose and Coolify deployments.",
          url: sources.dockerImage,
          identifiers: [{ label: "GitHub package", href: sources.dockerImage }],
          relations: [
            { predicate: "PACKAGES", target: "AutoSEO", href: "#autoseo" },
            { predicate: "BUILT_FROM", target: "github.com/codextde/autoseo", href: "#repository" },
            { predicate: "PUBLISHED_BY", target: legal.name, href: "#codext-gmbh" },
          ],
          evidence: [
            { quote: `Docker Compose with the prebuilt image ${site.image}`, ...readme },
            { quote: `Latest published image (${site.image}:latest)`, source: "SECURITY.md — github.com/codextde/autoseo", href: sources.security },
          ],
        },
        {
          id: "mit-license",
          name: "MIT License",
          kind: "Software license",
          description: "Permissive open-source license under which AutoSEO's source code is published.",
          url: "https://opensource.org/licenses/MIT",
          identifiers: [
            { label: "opensource.org/licenses/MIT", href: "https://opensource.org/licenses/MIT" },
            { label: `Wikidata ${QID.mitLicense}`, href: wikidata(QID.mitLicense) },
            { label: "LICENSE file", href: sources.license },
          ],
          relations: [{ predicate: "LICENSE_OF", target: "AutoSEO", href: "#autoseo" }],
          evidence: [{ quote: "MIT License", ...license }],
        },
        {
          id: "website",
          name: site.host,
          kind: "Website",
          description: "Official website of AutoSEO: product information, pricing, self-hosting guide, sign-up and billing for AutoSEO Cloud.",
          url: home,
          identifiers: [{ label: site.host, href: home }],
          relations: [
            { predicate: "PUBLISHED_BY", target: legal.name, href: "#codext-gmbh" },
            { predicate: "ABOUT", target: "AutoSEO", href: "#autoseo" },
            { predicate: "SELLS", target: "AutoSEO Cloud", href: "#autoseo-cloud" },
          ],
          evidence: [{ quote: `Legal notice for ${site.host} and AutoSEO Cloud.`, ...imprint }],
        },
        {
          id: "autoseo-cloud",
          name: "AutoSEO Cloud",
          kind: "Service (managed hosting)",
          description: `Managed AutoSEO operated by ${legal.name}: each customer gets a workspace in one shared, managed instance hosted in Germany, with every feature, unlimited users, up to ${site.cloudPlan.projects} projects and $${site.cloudPlan.includedUsageUsd} of monthly AI and data usage included, for $${site.priceMonthlyUsd} per workspace per month (excl. VAT, business customers).`,
          url: absoluteUrl("/pricing"),
          identifiers: [{ label: `${site.host}/pricing`, href: absoluteUrl("/pricing") }],
          relations: [
            { predicate: "OPERATED_BY", target: legal.name, href: "#codext-gmbh" },
            { predicate: "RUNS", target: "AutoSEO", href: "#autoseo" },
            { predicate: "HOSTED_IN", target: "Germany" },
            { predicate: "PRICED_AT", target: `$${site.priceMonthlyUsd} per workspace per month` },
          ],
          evidence: [
            { quote: "Your own workspace in our fully managed AutoSEO, hosted in Germany.", source: `Pricing — ${site.host}/pricing`, href: absoluteUrl("/pricing") },
            { quote: "AutoSEO Cloud runs exactly this repository, operated for you", ...readme },
          ],
        },
        {
          id: "tech-stack",
          name: "AutoSEO technology stack",
          kind: "Technology",
          description: "Technologies AutoSEO is built with and runs on.",
          identifiers: [
            { label: `Wikidata ${QID.nextjs} (Next.js)`, href: wikidata(QID.nextjs) },
            { label: `Wikidata ${QID.postgresql} (PostgreSQL)`, href: wikidata(QID.postgresql) },
            { label: `Wikidata ${QID.docker} (Docker)`, href: wikidata(QID.docker) },
          ],
          relations: [{ predicate: "USED_BY", target: "AutoSEO", href: "#autoseo" }],
          members: [
            { name: "Next.js 16", href: wikidata(QID.nextjs) },
            { name: "React 19" },
            { name: "TypeScript" },
            { name: "PostgreSQL 17", href: wikidata(QID.postgresql) },
            { name: "Drizzle ORM" },
            { name: "Tailwind CSS v4" },
            { name: "Docker", href: wikidata(QID.docker) },
          ],
          evidence: [{ quote: "Stack: Next.js 16 · React 19 · Tailwind v4 · shadcn/ui · PostgreSQL 17 · Drizzle.", ...readme }],
        },
        {
          id: "free-check",
          name: "AutoSEO AI visibility check",
          kind: "Free web tool",
          description: "Free, instant check on the AutoSEO website of whether AI crawlers can reach and read a site: robots.txt rules for 15 AI and search crawlers, server-rendered content, structured data, metadata, llms.txt, sitemap and HTTP basics.",
          url: absoluteUrl("/ai-visibility-check"),
          identifiers: [{ label: `${site.host}/ai-visibility-check`, href: absoluteUrl("/ai-visibility-check") }],
          relations: [
            { predicate: "OFFERED_BY", target: legal.name, href: "#codext-gmbh" },
            { predicate: "RELATED_TO", target: "AutoSEO", href: "#autoseo" },
          ],
          evidence: [{ quote: "Can AI engines read your website?", source: `AI visibility check — ${site.host}`, href: absoluteUrl("/ai-visibility-check") }],
        },
      ],
    },
    {
      id: "interfaces",
      title: "Interfaces",
      entities: [
        {
          id: "rest-api",
          name: "AutoSEO REST API v1",
          kind: "Web API",
          description: "HTTP API of every AutoSEO instance under /api/v1 with an OpenAPI specification at /api/v1/openapi.json; authenticated with OAuth 2.1 or API keys scoped read, write, spend and export.",
          identifiers: [{ label: "Route handlers (src/app/api/v1)", href: sources.apiRoutes }],
          relations: [
            { predicate: "PART_OF", target: "AutoSEO", href: "#autoseo" },
            { predicate: "DESCRIBED_BY", target: "OpenAPI specification (/api/v1/openapi.json)" },
          ],
          evidence: [{ quote: "REST: https://seo.example.com/api/v1 (OpenAPI at /api/v1/openapi.json, docs under Settings → API & MCP)", ...readme }],
        },
        {
          id: "mcp-server",
          name: "AutoSEO MCP server",
          kind: "Model Context Protocol server",
          description: `MCP server of every AutoSEO instance at /api/mcp (Streamable HTTP, JSON responses, protocol revisions 2024-11-05 to 2025-11-25) with ${counts.mcpTools} tools in ${counts.mcpToolGroups} groups, for Claude Code, Codex, Cursor and other MCP clients.`,
          identifiers: [
            { label: `Wikidata ${QID.mcp} (Model Context Protocol)`, href: wikidata(QID.mcp) },
            { label: "src/server/mcp/server.ts", href: sources.mcpServer },
          ],
          relations: [
            { predicate: "PART_OF", target: "AutoSEO", href: "#autoseo" },
            { predicate: "IMPLEMENTS", target: "Model Context Protocol" },
          ],
          evidence: [
            { quote: "MCP (streamable HTTP): https://seo.example.com/api/mcp — OAuth 2.1 or API key", ...readme },
            { quote: "REST API and an MCP server with 100+ tools.", ...readme },
          ],
        },
        {
          id: "local-agent",
          name: "AutoSEO local agent",
          kind: "Software component",
          description: "Lightweight agent that connects a user's Claude Code or Codex CLI to an AutoSEO instance (outbound HTTPS only, signed self-updates), so AI work runs on the user's own subscription.",
          identifiers: [{ label: "src/server/ai/engines/agent.ts", href: sources.engineAgent }],
          relations: [
            { predicate: "PART_OF", target: "AutoSEO", href: "#autoseo" },
            { predicate: "CONNECTS", target: "Claude Code (Anthropic), Codex CLI (OpenAI)" },
          ],
          evidence: [{ quote: "All AI work runs through your local Claude Code or Codex CLI via a lightweight agent", ...readme }],
        },
      ],
    },
    {
      id: "measurement",
      title: "What AutoSEO measures",
      entities: [
        {
          id: "ai-engines",
          name: "AI engines monitored by AutoSEO",
          kind: "Concept (list of AI answer engines)",
          description: `${counts.engines} AI engine surfaces from ${counts.engineVendors} vendors whose answers AutoSEO collects and analyses. Backends per engine: ${Object.values(backendLabel.en).join(", ")}.`,
          identifiers: [{ label: "src/lib/engines.ts", href: sources.engines }],
          relations: [
            { predicate: "MONITORED_BY", target: "AutoSEO", href: "#autoseo" },
            { predicate: "INCLUDES", target: ENGINE_FACTS.map((e) => `${e.name} (${e.vendor})`).join(", ") },
          ],
          members: ENGINE_FACTS.map((e) => ({
            name: `${e.name} — ${e.vendor}`,
            detail: e.backends.map((b) => backendLabel.en[b]).join(", "),
            href: e.wikidata?.product ? wikidata(e.wikidata.product) : e.wikidata?.vendor ? wikidata(e.wikidata.vendor) : undefined,
          })),
          evidence: [
            { quote: `AutoSEO tracks ${counts.engines} AI engine surfaces from ${counts.engineVendors} vendors`, ...factSheet, href: absoluteUrl("/ai-agent-instructions#engines") },
            { quote: 'an AI model with web search imitates the engine (labelled "Simulated")', source: "src/lib/engines.ts", href: sources.engines },
          ],
        },
        {
          id: "dataforseo",
          name: "DataForSEO",
          kind: "Third-party data provider",
          description: "SEO and AI data API that AutoSEO can use as a backend for AI engine answers (AI Optimization and SERP APIs) and for measured SEO data — with the customer's own account when self-hosted.",
          url: "https://dataforseo.com",
          identifiers: [{ label: "dataforseo.com", href: "https://dataforseo.com" }],
          relations: [{ predicate: "DATA_PROVIDER_FOR", target: "AutoSEO (optional backend)", href: "#autoseo" }],
          evidence: [{ quote: "DataForSEO answer engines (endpoints verified against docs.dataforseo.com/v3, 2026-09)", source: "src/server/ai/engines/dataforseo.ts", href: sources.engineDataForSeo }],
        },
        {
          id: "methodology",
          name: "AutoSEO measurement methodology",
          kind: "Method",
          description: "One stored answer per prompt, engine and day; each prompt is asked for its market; metrics are reported over periods and compared with the previous period because answers vary between runs.",
          identifiers: [{ label: "src/server/db/schema/ai.ts", href: sources.answerSchema }],
          relations: [
            { predicate: "USED_BY", target: "AutoSEO", href: "#autoseo" },
            { predicate: "PRODUCES", target: "AutoSEO metrics", href: "#metrics" },
          ],
          evidence: [{ quote: 'uniqueIndex("ai_answers_unique_day_uq").on(t.promptId, t.engine, t.answerDate)', source: "src/server/db/schema/ai.ts", href: sources.answerSchema }],
        },
        {
          id: "metrics",
          name: "AutoSEO AI visibility metrics",
          kind: "Metric set",
          description: "Published metric definitions; formulas on the fact sheet.",
          url: absoluteUrl("/ai-agent-instructions#metrics"),
          identifiers: [{ label: "src/features/ai-insights/lib/metrics.ts", href: sources.metricDefinitions }],
          relations: [{ predicate: "MEASURED_BY", target: "AutoSEO", href: "#autoseo" }],
          members: [
            { name: "Visibility", detail: "answers naming or citing the brand ÷ all answers" },
            { name: "Mention rate", detail: "answers naming the brand ÷ all answers" },
            { name: "Mentions", detail: "every occurrence of the brand name" },
            { name: "Citation rate", detail: "answers citing the brand's domains ÷ all answers" },
            { name: "Citations", detail: "answers citing the brand's domains, once per answer" },
            { name: "Citation share", detail: "brand citations ÷ citations of all brands in the set" },
            { name: "Share of voice", detail: "answers naming the brand ÷ appearances of all brands in the set" },
            { name: "Average position", detail: "sum of positions ÷ answers naming the brand" },
            { name: "#1 share / Top-3 share", detail: "answers with position 1 / 1–3 ÷ answers naming the brand" },
            { name: "Head-to-head", detail: "wins ÷ (wins + losses) against one competitor" },
            { name: "Mention depth", detail: "offset of the first mention ÷ answer length" },
            { name: "Sentiment", detail: "0–100 from an LLM analysis" },
          ],
          evidence: [{ quote: "Answers in which the brand appears at all (named or cited) ÷ all answers.", source: "src/features/ai-insights/lib/metrics.ts", href: sources.metricDefinitions }],
        },
      ],
    },
    {
      id: "integrations",
      title: "Integrations",
      intro: `Integration categories of AutoSEO as listed in the app. The full list with purposes is on the [fact sheet](/ai-agent-instructions#integrations).`,
      entities: integrationEntities,
    },
    {
      id: "category",
      title: "Category",
      entities: [
        {
          id: "geo",
          name: "Generative engine optimization (GEO)",
          kind: "Defined term (category)",
          description: "Measuring and improving how a brand is described, ranked and cited in AI-generated answers; also called answer engine optimization (AEO), AI search optimization, AI visibility or LLM optimization (LLMO).",
          identifiers: [{ label: `Wikidata ${QID.geo}`, href: wikidata(QID.geo) }],
          relations: [
            { predicate: "PRACTICED_WITH", target: "AutoSEO", href: "#autoseo" },
            { predicate: "BUILDS_ON", target: "Search engine optimization (SEO)", href: "#seo" },
          ],
          evidence: [
            {
              quote: "Generative engine optimization is the practice of improving how often and how favorably AI assistants mention and cite your brand in their answers.",
              source: `FAQ — ${site.host}`,
              href: home,
            },
          ],
        },
        {
          id: "seo",
          name: "Search engine optimization (SEO)",
          kind: "Defined term (category)",
          description: "Improving a website's visibility in search engine results; AutoSEO includes a classic SEO suite next to AI visibility.",
          identifiers: [{ label: `Wikidata ${QID.seo}`, href: wikidata(QID.seo) }],
          relations: [{ predicate: "PRACTICED_WITH", target: "AutoSEO", href: "#autoseo" }],
          evidence: [{ quote: "next to a complete SEO suite: keyword research, rank tracking, site audits, backlinks, Search Console, GA4 and white-label reports.", ...readme }],
        },
        {
          id: "category-tools",
          name: "Tools in the same category",
          kind: "Concept (peer set)",
          description: "Other products in the AI visibility / GEO category, named without any statement about their features or prices.",
          identifiers: [],
          relations: [{ predicate: "SAME_CATEGORY_AS", target: "AutoSEO", href: "#autoseo" }],
          members: [...CATEGORY_TOOLS.map((name) => ({ name })), ...CATEGORY_SUITES.map((name) => ({ name, detail: "AI-visibility features of an SEO suite" }))],
          evidence: [{ quote: `Tools in the same category include ${CATEGORY_TOOLS.join(", ")}`, ...factSheet, href: absoluteUrl("/ai-agent-instructions#category") }],
        },
      ],
    },
  ],
};
