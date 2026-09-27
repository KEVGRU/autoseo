import type { IntegrationPage } from "../../types";

export default {
  slug: "looker-studio",
  name: "Looker Studio",
  nav: "Looker Studio",
  summary: "Build Looker Studio dashboards on AutoSEO data via Google Sheets or the REST API.",
  meta: {
    title: "Looker Studio Dashboards for AI Visibility",
    description:
      "Build Looker Studio dashboards on AutoSEO data — export tables to Google Sheets or pull prompts, answers, mentions and citations from the REST API.",
  },
  hero: {
    subtitle:
      "There's no dedicated Looker Studio connector yet. Export AutoSEO tables to Google Sheets, or load answers, prompts, mentions and citations from the REST API — and build your dashboards on top.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "for Looker Studio dashboards",
    items: [
      "Beta: data reaches Looker Studio through Google Sheets, not a native connector",
      "Export tables such as tracked prompts, competitors, sources, fan-outs, tasks and rankings to Google Sheets",
      "REST API export of answers, prompts, mentions, citations and fan-outs as CSV or NDJSON",
      "Incremental exports with a since parameter for scheduled refreshes",
      "API keys with separate read, write, spend and export scopes",
      "The built-in Report Builder as an alternative for client-ready decks",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Looker Studio and AutoSEO",
    items: [
      {
        icon: "presentation",
        title: "Add AI visibility to existing dashboards",
        body: "Put mention rates, citations and competitor data into the Looker Studio reports your stakeholders already read.",
      },
      {
        icon: "chart",
        title: "Blend with GA4 and Search Console",
        body: "In Looker Studio, combine an AutoSEO sheet with your GA4 or Search Console data sources in one report.",
      },
      {
        icon: "refresh",
        title: "Refresh on a schedule",
        body: "A small script — for example in Google Apps Script — can call the export endpoint with your API key and append new rows to the sheet Looker Studio reads.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Get data into Looker Studio",
    muted: "in three steps.",
    items: [
      {
        title: "Export a table to Google Sheets",
        body: "Open a table in AutoSEO, choose Export → Google Sheets and connect your Google account the first time. AutoSEO creates the spreadsheet in your Drive.",
      },
      {
        title: "Or pull data from the REST API",
        body: "Under Settings → API & MCP, create a key with the export scope and call GET /api/v1/projects/{projectId}/export with format=csv.",
      },
      {
        title: "Add the sheet in Looker Studio",
        body: "In Looker Studio, add a Google Sheets data source that points to the spreadsheet and build your charts.",
      },
    ],
  },
  faq: [
    {
      q: "Is there an AutoSEO connector for Looker Studio?",
      a: "Not yet — the integration is in beta. Today you connect through Google Sheets: export tables from AutoSEO or fill a sheet from the REST API, then use it as a Looker Studio data source.",
    },
    {
      q: "Which AutoSEO data can I use in Looker Studio?",
      a: "Any table with Export → Google Sheets, plus the REST API export of answers, prompts, mentions, citations and fan-outs as CSV or NDJSON. Other endpoints cover visibility metrics, AI traffic, Search Console and attribution data.",
    },
    {
      q: "How do I keep a Looker Studio dashboard up to date?",
      a: "Sheets exports are snapshots. For regular updates, call the export endpoint on a schedule with since set to the previous high-water mark and append the new rows to your sheet.",
    },
    {
      q: "What access does the Google Sheets export need?",
      a: "Google's drive.file permission, which only covers spreadsheets AutoSEO creates. On a self-hosted instance, an admin first registers a Google OAuth client under Admin → Data Providers.",
    },
    {
      q: "Is the REST API included in AutoSEO?",
      a: "Yes. The REST API, the MCP server and all exports are part of the open-source app: free when you self-host, and included in an AutoSEO Cloud workspace.",
    },
  ],
  cta: {
    title: "Bring AI visibility into your dashboards",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
