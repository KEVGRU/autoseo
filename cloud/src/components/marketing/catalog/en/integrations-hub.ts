import type { IntegrationsHubPage } from "../types";

export default {
  meta: {
    title: "Integrations for AI Visibility & SEO",
    description:
      "Connect AutoSEO to GA4, Search Console, Cloudflare, Shopify, HubSpot, WordPress, Jira and 40+ more integrations for analytics, attribution, content and tasks.",
  },
  hero: {
    eyebrow: "Integrations",
    title: "Integrations for AI visibility and SEO.",
    muted: "Connect the tools you already use.",
    subtitle:
      "Bring traffic, search, crawler and revenue data into your AI visibility work — and send tasks, content and data back out to your team's tools. Every integration is included in the open-source app.",
  },
  descriptions: {
    /* CMS */
    wordpress: "Publish drafts or live posts with JSON-LD and Yoast or Rank Math meta.",
    webflow: "Create and publish Webflow CMS collection items from your drafts.",
    framer: "Publish drafts to Framer CMS collections via the Server API, or export CSV and HTML.",
    shopify_cms: "Publish optimized articles to your Shopify blog.",

    /* Analytics */
    google_analytics: "Sessions, key events and revenue from AI platforms via the GA4 Data API.",
    matomo: "AI-referred visits, goals and revenue from cloud or self-hosted Matomo.",
    piwik_pro: "AI-referred sessions and conversions via Piwik PRO API credentials.",

    /* Search Console */
    google_search_console: "Queries, pages and countries from Google Search, with AI-style prompts flagged.",
    bing_webmaster: "Bing search queries and pages, next to your Google data.",

    /* Bot traffic */
    cloudflare: "Stream AI crawler visits with a Cloudflare Worker or Logpush.",
    akamai: "Send DataStream 2 logs to your AutoSEO HTTPS endpoint.",
    server_logs: "Push NDJSON from nginx, Apache or any backend, or upload log files.",
    fastly: "Real-time log streaming from Fastly.",
    cloudfront: "Real-time logs from Amazon CloudFront distributions.",

    /* Attribution */
    hubspot: "Send contacts and deals from a HubSpot workflow, with deal value.",
    salesforce: "Send leads and opportunities from a Salesforce Flow.",
    shopify: "A custom pixel attributes Shopify orders and revenue to AI search.",
    stripe: "Signed webhooks turn checkouts and invoices into conversions.",
    woocommerce: "Native WooCommerce order webhooks, verified with a shared secret.",
    shopware: "Send placed orders from the Shopware Flow Builder.",
    typeform: "Typeform webhooks; the “How did you hear about us?” answer is detected.",
    tally: "Tally form webhooks with automatic option labels.",
    jotform: "Capture Jotform submissions via webhook.",
    gravity_forms: "Capture WordPress form submissions via the Webhooks Add-On.",
    formstack: "Capture Formstack form submissions via webhook.",
    surveymonkey: "Import responses of a SurveyMonkey survey via its API.",
    fairing: "Import post-purchase survey answers with order ID and total.",
    knocommerce: "Import KnoCommerce post-purchase survey responses.",
    zigpoll: "Import Zigpoll on-site and post-purchase poll answers.",
    pipedrive: "Pipedrive deal webhooks with value and currency.",
    attio: "Send records and deals from an Attio workflow.",
    close: "Close webhooks for leads and opportunities.",
    intercom: "Contact webhooks with the answer in a custom attribute.",
    calendly: "Booking-question answers from Calendly invitee webhooks.",
    zapier: "Send answers from any app through Zapier or Make.",
    n8n: "Send answers from any n8n workflow.",
    custom_webhook: "POST any lead or order as JSON and map the fields once.",

    /* Project management */
    jira: "Create Jira issues with formatted descriptions and sync their status.",
    linear: "Create Linear issues and close tasks when the issue is done.",
    asana: "Create Asana tasks in a project and sync their status.",
    clickup: "Create ClickUp tasks with priority and tags, and sync their status.",
    monday: "Create items on a monday.com board with the full task details.",
    trello: "Create Trello cards; moving a card to Done closes the task.",
    notion: "Create pages in a Notion database with steps as to-dos.",
    awork: "Create awork project tasks and sync their status.",

    /* Data & reporting */
    rest_api: "REST API v1 with OpenAPI spec for prompts, visibility, traffic and reports.",
    mcp: "Connect Claude, ChatGPT, Cursor or VS Code with 100+ MCP tools.",
    looker_studio: "Build Looker Studio dashboards on the REST API with an API key.",
    google_sheets: "Export keyword, ranking, backlink and audit tables to Google Sheets.",
  },
  categories: {
    eyebrow: "All integrations",
    title: "Every integration,",
    muted: "grouped by what it does.",
  },
  faq: [
    {
      q: "Which tools does AutoSEO integrate with?",
      a: "Analytics: Google Analytics 4, Matomo and Piwik PRO. Search: Google Search Console and Bing Webmaster Tools. Bot traffic: Cloudflare, Akamai and server logs. Attribution: shops, payments, forms, surveys and CRMs such as Shopify, Stripe, HubSpot and Salesforce. Tasks: Jira, Linear, Asana, ClickUp and more. Content: WordPress, Webflow and Framer. Data: REST API, MCP, Looker Studio and Google Sheets.",
    },
    {
      q: "Are integrations included in the price?",
      a: "Yes. Every integration is part of the open-source app — free to self-host, or included in an AutoSEO Cloud workspace for $50 per month with $10 of AI and data usage included. Plans of the connected tools themselves are billed by their vendors.",
    },
    {
      q: "What do “beta” and “coming soon” mean?",
      a: "Beta integrations are available today but may still change: WordPress, Webflow, Framer and Looker Studio. Coming soon marks connectors in development: Shopify as a CMS, Fastly and AWS CloudFront. Shopify attribution already works today.",
    },
    {
      q: "How are integration credentials stored?",
      a: "In AutoSEO's database — on your own server when you self-host, or in AutoSEO Cloud, hosted in Germany. API tokens and passwords are encrypted with AES-256-GCM and never sent back to the browser, and inbound webhook tokens are stored only as hashes.",
    },
    {
      q: "Where do I connect integrations in AutoSEO?",
      a: "Open Integrations in your project for the full catalog. Integrations that belong to a module — attribution sources, CMS and task tools, bot traffic connectors — link straight to their setup in that module.",
    },
    {
      q: "Can I connect a tool that isn't listed?",
      a: "Usually, yes. Attribution accepts any JSON payload through a custom webhook, Zapier, Make or n8n, task events go out as signed webhooks, and the REST API and MCP server give scripts and AI agents access to all your data.",
    },
  ],
  cta: {
    title: "Connect your stack in minutes",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationsHubPage;
