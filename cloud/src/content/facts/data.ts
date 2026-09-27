/**
 * Language-independent facts about AutoSEO shared by the fact sheet, the entity map and their Markdown/JSON-LD
 * exports. Each block names the file of the open-source repository it was taken from, so it can be re-checked
 * (and updated) when the product changes. Last synced with the repository on FACTS_UPDATED.
 */
import { site } from "@/lib/site";

export const FACTS_UPDATED = "2026-09-26";

/** Host of the shared AutoSEO Cloud instance (one workspace per customer, see docs/CLOUD.md). */
export const cloudAppHost = "app.autoseo.codext.de";

const blob = (path: string) => `${site.github}/blob/main/${path}`;

/** Public source files behind the statements on the fact pages. */
export const sources = {
  repo: site.github,
  readme: `${site.github}#readme`,
  license: blob("LICENSE"),
  security: blob("SECURITY.md"),
  selfHosting: blob("docs/SELF_HOSTING.md"),
  cloud: blob("docs/CLOUD.md"),
  engines: blob("src/lib/engines.ts"),
  engineApis: blob("src/server/ai/engines/api.ts"),
  engineDataForSeo: blob("src/server/ai/engines/dataforseo.ts"),
  engineAgent: blob("src/server/ai/engines/agent.ts"),
  engineSimulation: blob("src/server/ai/engines/simulated.ts"),
  metricDefinitions: blob("src/features/ai-insights/lib/metrics.ts"),
  trackerMetrics: blob("src/server/ai/metrics.ts"),
  brandMetrics: blob("src/server/ai/insights/brand-metrics.ts"),
  brandMatching: blob("src/server/ai/analysis/brand-match.ts"),
  answerSchema: blob("src/server/db/schema/ai.ts"),
  trackingRuns: blob("src/server/ai/tracking/runs.ts"),
  enrichment: blob("src/server/enrichment/policy.ts"),
  integrations: blob("src/lib/integrations-catalog.ts"),
  mcpServer: blob("src/server/mcp/server.ts"),
  mcpTools: blob("src/server/mcp/tools/index.ts"),
  apiRoutes: `${site.github}/tree/main/src/app/api/v1`,
  dockerImage: "https://github.com/codextde/autoseo/pkgs/container/autoseo",
  githubOrg: "https://github.com/codextde",
  codext: "https://www.codext.de",
  codextImprint: "https://www.codext.de/impressum",
} as const;

/** Counts that change with the product (re-check in the files named in `sources`). */
export const counts = {
  engines: 16,
  engineVendors: 13,
  mcpTools: 126,
  mcpToolGroups: 17,
  agentSkills: 17,
  crawlerChecks: 29,
  reportTemplates: 11,
};

export type Backend = "dataforseo" | "api" | "agent" | "ai";

export type EngineFact = {
  id: string;
  name: string;
  vendor: string;
  /** Backends in "auto" preference order (src/lib/engines.ts). */
  backends: Backend[];
  /** DataForSEO endpoint family. */
  dataforseo?: string;
  /** Vendor API and its search tool (technical names, not translated). */
  api?: string;
  /** The vendor API has no web search: answers from model knowledge, without citations. */
  apiNoWebSearch?: boolean;
  agent?: "Claude Code" | "Codex CLI";
  /** Verified Wikidata items (engine / product and vendor). */
  wikidata?: { product?: string; vendor?: string };
};

export const ENGINE_FACTS: EngineFact[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    vendor: "OpenAI",
    backends: ["dataforseo", "api", "agent", "ai"],
    dataforseo: "AI Optimization API · LLM Responses (chat_gpt)",
    api: "OpenAI Responses API + `web_search`",
    agent: "Codex CLI",
    wikidata: { product: "Q115564437", vendor: "Q21708200" },
  },
  {
    id: "chatgpt_gui",
    name: "ChatGPT (app)",
    vendor: "OpenAI",
    backends: ["dataforseo", "agent", "ai"],
    dataforseo: "AI Optimization API · ChatGPT LLM Scraper (answer as rendered in the app, incl. shopping cards)",
    agent: "Codex CLI",
    wikidata: { product: "Q115564437", vendor: "Q21708200" },
  },
  {
    id: "perplexity",
    name: "Perplexity",
    vendor: "Perplexity",
    backends: ["dataforseo", "api", "ai"],
    dataforseo: "AI Optimization API · LLM Responses (perplexity)",
    api: "Perplexity Agent API (`/v1/agent`) with search results",
    wikidata: { product: "Q123403392", vendor: "Q124333951" },
  },
  {
    id: "ai_overview",
    name: "Google AI Overviews",
    vendor: "Google",
    backends: ["dataforseo", "ai"],
    dataforseo: "SERP API · Google organic results with AI Overview",
    wikidata: { vendor: "Q95" },
  },
  {
    id: "google_ai_mode",
    name: "Google AI Mode",
    vendor: "Google",
    backends: ["dataforseo", "ai"],
    dataforseo: "SERP API · Google AI Mode",
    wikidata: { vendor: "Q95" },
  },
  {
    id: "gemini",
    name: "Gemini",
    vendor: "Google",
    backends: ["dataforseo", "api", "ai"],
    dataforseo: "AI Optimization API · LLM Responses (gemini)",
    api: "Gemini API `generateContent` + Google Search grounding",
    wikidata: { product: "Q116698014", vendor: "Q95" },
  },
  {
    id: "claude",
    name: "Claude",
    vendor: "Anthropic",
    backends: ["dataforseo", "api", "agent", "ai"],
    dataforseo: "AI Optimization API · LLM Responses (claude)",
    api: "Anthropic Messages API + web search tool",
    agent: "Claude Code",
    wikidata: { product: "Q118876059", vendor: "Q116758847" },
  },
  {
    id: "copilot",
    name: "Microsoft Copilot",
    vendor: "Microsoft",
    backends: ["dataforseo", "ai"],
    dataforseo: "SERP API · Bing organic results with the Copilot answer",
    wikidata: { product: "Q116793893", vendor: "Q2283" },
  },
  { id: "grok", name: "Grok", vendor: "xAI", backends: ["api", "ai"], api: "xAI Responses API + `web_search`", wikidata: { product: "Q123361035" } },
  {
    id: "mistral",
    name: "Mistral",
    vendor: "Mistral AI",
    backends: ["api", "ai"],
    api: "Mistral Conversations API + `web_search`",
    wikidata: { vendor: "Q119718658" },
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    vendor: "DeepSeek",
    backends: ["api", "ai"],
    api: "DeepSeek chat completions",
    apiNoWebSearch: true,
    wikidata: { product: "Q132324293", vendor: "Q131577453" },
  },
  {
    id: "meta_ai",
    name: "Meta AI",
    vendor: "Meta",
    backends: ["api", "ai"],
    api: "Meta Model API + `web_search` (or the same model via OpenRouter with OpenRouter's web search)",
    wikidata: { vendor: "Q380" },
  },
  {
    id: "qwen",
    name: "Qwen",
    vendor: "Alibaba Cloud",
    backends: ["api", "ai"],
    api: "Alibaba Model Studio / DashScope with web search and sources",
    wikidata: { product: "Q130234299", vendor: "Q17062154" },
  },
  {
    id: "kimi",
    name: "Kimi",
    vendor: "Moonshot AI",
    backends: ["api", "ai"],
    api: "Moonshot Responses API + server-side `web_search`",
    wikidata: { product: "Q131993396", vendor: "Q130270266" },
  },
  {
    id: "sabia",
    name: "Sabiá",
    vendor: "Maritaca AI",
    backends: ["api", "ai"],
    api: "Maritaca chat completions with web search (sources = links cited in the answer)",
  },
  {
    id: "solar",
    name: "Solar",
    vendor: "Upstage",
    backends: ["api", "ai"],
    api: "Upstage chat completions",
    apiNoWebSearch: true,
    wikidata: { vendor: "Q127983087" },
  },
];

/** Engines enabled for new projects (src/lib/engines.ts DEFAULT_ENGINES). */
export const DEFAULT_ENGINE_NAMES = ["ChatGPT", "Perplexity", "Google AI Overviews"];

export type IntegrationCategoryKey = "analytics" | "search_console" | "bot_traffic" | "data_reporting" | "project_management" | "attribution" | "cms";

export type IntegrationItem = { name: string; status?: "beta" | "coming_soon" };

/** Integration catalog by category (src/lib/integrations-catalog.ts). */
export const INTEGRATION_FACTS: { key: IntegrationCategoryKey; items: IntegrationItem[] }[] = [
  { key: "analytics", items: [{ name: "Google Analytics (GA4)" }, { name: "Piwik PRO" }, { name: "Matomo" }] },
  { key: "search_console", items: [{ name: "Google Search Console" }, { name: "Bing Webmaster Tools" }] },
  {
    key: "bot_traffic",
    items: [{ name: "Cloudflare" }, { name: "Akamai" }, { name: "Server Logs / API" }, { name: "Fastly", status: "coming_soon" }, { name: "AWS CloudFront", status: "coming_soon" }],
  },
  { key: "data_reporting", items: [{ name: "Looker Studio", status: "beta" }, { name: "AutoSEO MCP" }, { name: "AutoSEO API" }] },
  {
    key: "project_management",
    items: ["ClickUp", "Asana", "Linear", "Jira", "Monday.com", "Trello", "Notion", "awork"].map((name) => ({ name })),
  },
  {
    key: "attribution",
    items: [
      "HubSpot",
      "Salesforce",
      "Typeform",
      "Zapier / Make",
      "Shopify",
      "Stripe",
      "WooCommerce",
      "Shopware",
      "Fairing",
      "KnoCommerce",
      "Zigpoll",
      "SurveyMonkey",
      "Tally",
      "Custom Webhook",
      "Jotform",
      "Gravity Forms",
      "Formstack",
      "Attio",
      "Pipedrive",
      "Close",
      "Calendly",
      "Intercom",
      "n8n",
    ].map((name) => ({ name })),
  },
  { key: "cms", items: [{ name: "WordPress", status: "beta" }, { name: "Webflow", status: "beta" }, { name: "Framer", status: "beta" }, { name: "Shopify", status: "beta" }] },
];

/** Tools in the same category, named without any claims about them. */
export const CATEGORY_TOOLS = ["Profound", "Peec AI", "Otterly.AI", "Scrunch AI", "Finseo"];
export const CATEGORY_SUITES = ["Semrush", "Ahrefs"];

/** Verified Wikidata items (checked 2026-09-26). */
export const wikidata = (qid: string) => `https://www.wikidata.org/wiki/${qid}`;
export const QID = {
  mitLicense: "Q334661",
  germany: "Q183",
  wolpertshausen: "Q81088",
  geo: "Q134083964",
  seo: "Q180711",
  docker: "Q15206305",
  nextjs: "Q56062435",
  postgresql: "Q192490",
  mcp: "Q133436854",
  github: "Q364",
} as const;
