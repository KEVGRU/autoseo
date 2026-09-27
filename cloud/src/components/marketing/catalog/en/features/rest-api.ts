import type { FeaturePage } from "../../types";

export default {
  slug: "rest-api",
  nav: "REST API",
  summary: "Every metric, prompt, answer and audit over a REST API with an OpenAPI spec.",
  meta: {
    title: "SEO API: REST Access to AI Visibility Data",
    description:
      "AutoSEO's SEO API gives you AI visibility metrics, prompts, answers, keywords, rankings, audits and reports over REST. OpenAPI spec, scoped keys, OAuth 2.1.",
  },
  hero: {
    eyebrow: "REST API",
    title: "An SEO API for all your AI visibility data.",
    muted: "REST, JSON and OpenAPI.",
    subtitle:
      "AutoSEO exposes its data over a versioned REST API: projects, prompts, AI answers, metrics, competitors, sources, keywords, rank trackers, audits, reports and tasks. Authenticate with scoped API keys or OAuth 2.1 and generate clients from the OpenAPI spec.",
  },
  visual: "terminal",
  stats: [
    { value: 4, label: "Key scopes", note: "Read, write, spend, export" },
    { value: 120, label: "Requests per minute", note: "Default limit per key" },
    { value: 5000, label: "Answers per export page", note: "As JSON or CSV" },
    { value: 0, prefix: "$", label: "Self-hosted", note: "API included, MIT licensed" },
  ],
  why: {
    eyebrow: "Why it matters",
    title: "Your data belongs in your stack,",
    muted: "not only in a dashboard.",
    body: "AI visibility and SEO data is most useful when it reaches the tools you already use: BI dashboards, data warehouses, client portals and internal automations. The REST API makes the numbers in AutoSEO available to all of them.",
    points: [
      {
        title: "Own your reporting",
        body: "Pull metrics and time series into your BI tool, warehouse or spreadsheets on your own schedule and in your own format.",
      },
      {
        title: "Automate the routine",
        body: "Create projects, add prompts, start site audits or rank checks from scripts and pipelines instead of clicking through the app.",
      },
      {
        title: "Built on open standards",
        body: "An OpenAPI spec, JSON responses and bearer tokens mean any language, HTTP client or code generator can talk to AutoSEO.",
      },
    ],
  },
  capabilities: {
    eyebrow: "What you can do",
    title: "What the API covers,",
    muted: "from any language.",
    items: [
      {
        icon: "chart",
        title: "AI visibility metrics",
        body: "Visibility, mention rate, citation rate and position as totals or time series, filtered by engine, tag and period.",
      },
      {
        icon: "message-square",
        title: "Prompts and answers",
        body: "List and create prompts, read single AI answers with their citations, and pull competitors, sources and query fan-outs.",
      },
      {
        icon: "search",
        title: "SEO research and tracking",
        body: "Keyword research, SERPs, domain and backlink data, saved keywords, rank trackers and local SEO — all with the same keys.",
      },
      {
        icon: "gauge",
        title: "Audits and crawlability",
        body: "Start and stop site audits, read issues, pages and Lighthouse results, compare runs and export them as CSV or JSON.",
      },
      {
        icon: "file-text",
        title: "Reports and tasks",
        body: "Create, share and generate reports, and read, update or comment on optimization tasks.",
      },
      {
        icon: "download",
        title: "Bulk export",
        body: "Export every prompt with its metrics and every AI answer in a period as JSON or CSV, up to 5,000 answers per page.",
      },
    ],
  },
  steps: {
    eyebrow: "How it works",
    title: "From API key to first request",
    muted: "in three steps.",
    items: [
      {
        title: "Create a scoped API key",
        body: "Under Settings → API & MCP, create a key with the scopes you need and optionally limit it to specific projects. The key is shown once.",
      },
      {
        title: "Read the OpenAPI spec",
        body: "The spec is served at /api/v1/openapi.json on your AutoSEO URL, and the docs live under Settings → API & MCP.",
      },
      {
        title: "Send your first request",
        body: "Pass the key as a bearer token. Every response uses the same JSON envelope with a request ID, and usage shows up in your API settings.",
      },
    ],
  },
  faq: [
    {
      q: "Does AutoSEO have an API?",
      a: "Yes. AutoSEO includes a versioned REST API at /api/v1 with an OpenAPI specification, self-hosted and in AutoSEO Cloud. It covers projects, prompts, AI answers and metrics, SEO research, rank tracking, site audits, analytics, reports and tasks.",
    },
    {
      q: "How do I authenticate with the AutoSEO API?",
      a: "Create an API key under Settings → API & MCP and send it as a bearer token in the Authorization header. Apps can use OAuth 2.1 with PKCE instead. Keys and tokens are stored only as hashes and can be revoked at any time.",
    },
    {
      q: "What are API key scopes?",
      a: "Scopes limit what a key can do. Read covers projects, metrics, competitors, sources, tasks and reports; write lets it create projects, prompts and tags; spend allows anything that costs money, such as DataForSEO research or AI generation; export allows bulk exports. Your role permissions still apply on top.",
    },
    {
      q: "Is there an OpenAPI specification?",
      a: "Yes. AutoSEO serves its OpenAPI spec at /api/v1/openapi.json. Import it into Postman, Insomnia or a code generator to get a typed client in your language.",
    },
    {
      q: "Are there rate limits?",
      a: "Yes. Each API key or OAuth token is limited to 120 requests per minute by default; when you self-host, admins can change the limit in the admin panel. Failed authentication attempts are rate-limited per IP.",
    },
    {
      q: "Can I export all AI answers through the API?",
      a: "Yes. The export endpoint returns all prompts with their metrics and one row per AI answer in the chosen period, as JSON or CSV. It's paginated with up to 5,000 answers per page and can include the full answer text.",
    },
    {
      q: "Should I use the REST API or the MCP server?",
      a: "Use the REST API for scripts, integrations and dashboards that need predictable JSON. Use the MCP server when an AI agent such as Claude Code, Codex or Cursor should work with your data. Both use the same API keys and scopes.",
    },
    {
      q: "Does the API cost extra?",
      a: "No. The REST API is part of the open-source AutoSEO app and included in every AutoSEO Cloud workspace for $50 per month. Endpoints that call DataForSEO or AI providers need the spend scope; when you self-host, those providers bill you directly, and in Cloud they count toward the $10 of included usage.",
    },
  ],
  related: ["mcp-server", "ai-seo-agent", "report-builder", "ai-visibility-tracking"],
  cta: {
    title: "Put your AI visibility data to work",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies FeaturePage;
