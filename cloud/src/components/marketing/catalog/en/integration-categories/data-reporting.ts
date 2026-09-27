import type { IntegrationCategoryPage } from "../../types";

export default {
  slug: "data-reporting",
  nav: "Data & reporting integrations",
  summary: "Get AutoSEO data into BI tools, spreadsheets, scripts and AI agents.",
  meta: {
    title: "SEO Data Integrations: API, MCP, Looker, Sheets",
    description:
      "SEO data integrations for AutoSEO: a REST API with OpenAPI spec, an MCP server with 100+ tools for AI agents, Looker Studio dashboards and Sheets exports.",
  },
  hero: {
    eyebrow: "Data & reporting integrations",
    title: "Your SEO data, in every tool you report with.",
    muted: "Or ask an AI agent.",
    subtitle:
      "Everything AutoSEO tracks is available outside the app: a documented REST API, an MCP server for Claude, ChatGPT, Cursor and VS Code, Looker Studio dashboards on top of the API and one-click exports to Google Sheets.",
  },
  benefits: {
    eyebrow: "What you can build",
    title: "Your data, not locked",
    muted: "in a dashboard.",
    items: [
      {
        icon: "code",
        title: "REST API with OpenAPI",
        body: "REST v1 covers projects, prompts, answers, metrics, competitors, sources, analytics, attribution, audits, tasks and reports, with an OpenAPI spec for your client code.",
      },
      {
        icon: "brain",
        title: "MCP server for AI agents",
        body: "More than 100 tools over streamable HTTP, with OAuth 2.1 or an API key, so Claude, ChatGPT, Cursor or VS Code can query and work with your data.",
      },
      {
        icon: "presentation",
        title: "Dashboards in Looker Studio",
        body: "Build Looker Studio dashboards on top of the REST API with an API key. The Looker Studio integration is in beta.",
      },
      {
        icon: "download",
        title: "Export to Google Sheets",
        body: "Send keyword, ranking, backlink and site audit tables to a new spreadsheet in your Google Drive, or download them as CSV.",
      },
    ],
  },
  faq: [
    {
      q: "Does AutoSEO have an API?",
      a: "Yes. AutoSEO has a REST API v1 with an OpenAPI spec at /api/v1/openapi.json. API keys carry read, write, spend and export scopes and can be limited to specific projects.",
    },
    {
      q: "Can I connect AutoSEO to Claude or ChatGPT via MCP?",
      a: "Yes. AutoSEO runs an MCP server at /api/mcp with more than 100 tools. Clients sign in with OAuth 2.1 or an API key, and plugins for Claude Code, Codex and Cursor bundle the server with 17 agent skills.",
    },
    {
      q: "How do I build a Looker Studio dashboard with AutoSEO data?",
      a: "Create an API key under Settings → API & MCP and build your Looker Studio dashboards on top of the AutoSEO REST API. The integration is in beta. For a one-off snapshot, export a table to Google Sheets and use the sheet as a data source.",
    },
    {
      q: "Can I export SEO data to Google Sheets?",
      a: "Yes. Tables in keyword research, saved keywords, rank tracking, domain overview, backlinks, local SEO and site audit export to a new Google Sheet in your Drive. AutoSEO only asks for access to the files it creates.",
    },
    {
      q: "Can an API key spend money on my behalf?",
      a: "Only with the spend scope. Without it, a key can't start anything that costs money, such as DataForSEO research, AI generation or tracking runs, and the key's user also needs the matching role permission.",
    },
    {
      q: "Is API and MCP access included?",
      a: "Yes. The REST API, the MCP server and all exports are part of the open-source app and free to self-host; paid calls such as DataForSEO research are then billed by the provider. An AutoSEO Cloud workspace for $50 per month includes the same access and $10 of AI and data usage.",
    },
  ],
  cta: {
    title: "Put your AI visibility data to work",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationCategoryPage;
