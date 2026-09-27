/**
 * Every integration of the open-source app, mirrored from `src/lib/integrations-catalog.ts` in the repo root
 * (same keys and statuses). Descriptions are localized in `integrations-hub.ts` of each language.
 */
import type { DirectoryEntry } from "./types";

export const directory: DirectoryEntry[] = [
  /* CMS */
  { key: "wordpress", name: "WordPress", category: "cms", domain: "wordpress.org", color: "#21759b", status: "beta", page: "wordpress" },
  { key: "webflow", name: "Webflow", category: "cms", domain: "webflow.com", color: "#146ef5", status: "beta", page: "webflow" },
  { key: "framer", name: "Framer", category: "cms", domain: "framer.com", color: "#0055ff", status: "beta", page: "framer" },
  { key: "shopify_cms", name: "Shopify", category: "cms", domain: "shopify.com", color: "#95bf47", status: "coming-soon", page: "shopify" },

  /* Analytics */
  { key: "google_analytics", name: "Google Analytics", category: "analytics", domain: "analytics.google.com", color: "#e37400", page: "google-analytics" },
  { key: "matomo", name: "Matomo", category: "analytics", domain: "matomo.org", color: "#3152a0", page: "matomo" },
  { key: "piwik_pro", name: "Piwik PRO", category: "analytics", domain: "piwik.pro", color: "#1c3e8f", page: "piwik-pro" },

  /* Search Console */
  { key: "google_search_console", name: "Google Search Console", category: "search-console", domain: "search.google.com", color: "#4285f4", page: "google-search-console" },
  { key: "bing_webmaster", name: "Bing Webmaster Tools", category: "search-console", domain: "bing.com", color: "#008373", page: "bing-webmaster-tools" },

  /* Bot traffic */
  { key: "cloudflare", name: "Cloudflare", category: "bot-traffic", domain: "cloudflare.com", color: "#f38020", page: "cloudflare" },
  { key: "akamai", name: "Akamai", category: "bot-traffic", domain: "akamai.com", color: "#0096d6", page: "akamai" },
  { key: "server_logs", name: "Server logs / API", category: "bot-traffic", color: "#0f0f0f", page: "server-logs" },
  { key: "fastly", name: "Fastly", category: "bot-traffic", domain: "fastly.com", color: "#ff282d", status: "coming-soon" },
  { key: "cloudfront", name: "AWS CloudFront", category: "bot-traffic", domain: "aws.amazon.com", color: "#8c4fff", status: "coming-soon" },

  /* Attribution */
  { key: "hubspot", name: "HubSpot", category: "attribution", domain: "hubspot.com", color: "#ff7a59", page: "hubspot" },
  { key: "salesforce", name: "Salesforce", category: "attribution", domain: "salesforce.com", color: "#00a1e0", page: "salesforce" },
  { key: "shopify", name: "Shopify", category: "attribution", domain: "shopify.com", color: "#95bf47", page: "shopify" },
  { key: "stripe", name: "Stripe", category: "attribution", domain: "stripe.com", color: "#635bff", page: "stripe" },
  { key: "woocommerce", name: "WooCommerce", category: "attribution", domain: "woocommerce.com", color: "#7f54b3", page: "woocommerce" },
  { key: "shopware", name: "Shopware", category: "attribution", domain: "shopware.com", color: "#189eff", page: "shopware" },
  { key: "typeform", name: "Typeform", category: "attribution", domain: "typeform.com", color: "#262627", page: "typeform" },
  { key: "tally", name: "Tally", category: "attribution", domain: "tally.so", color: "#111111", page: "tally" },
  { key: "jotform", name: "Jotform", category: "attribution", domain: "jotform.com", color: "#ff6100", page: "jotform" },
  { key: "gravity_forms", name: "Gravity Forms", category: "attribution", domain: "gravityforms.com", color: "#f15a2b", page: "gravity-forms" },
  { key: "formstack", name: "Formstack", category: "attribution", domain: "formstack.com", color: "#21b573", page: "formstack" },
  { key: "surveymonkey", name: "SurveyMonkey", category: "attribution", domain: "surveymonkey.com", color: "#00bf6f", page: "surveymonkey" },
  { key: "fairing", name: "Fairing", category: "attribution", domain: "fairing.co", color: "#1f2937", page: "fairing" },
  { key: "knocommerce", name: "KnoCommerce", category: "attribution", domain: "knocommerce.com", color: "#2563eb", page: "knocommerce" },
  { key: "zigpoll", name: "Zigpoll", category: "attribution", domain: "zigpoll.com", color: "#0ea5e9", page: "zigpoll" },
  { key: "pipedrive", name: "Pipedrive", category: "attribution", domain: "pipedrive.com", color: "#1a1a1a", page: "pipedrive" },
  { key: "attio", name: "Attio", category: "attribution", domain: "attio.com", color: "#111111", page: "attio" },
  { key: "close", name: "Close", category: "attribution", domain: "close.com", color: "#1e40af", page: "close" },
  { key: "intercom", name: "Intercom", category: "attribution", domain: "intercom.com", color: "#1f8ded", page: "intercom" },
  { key: "calendly", name: "Calendly", category: "attribution", domain: "calendly.com", color: "#006bff", page: "calendly" },
  { key: "zapier", name: "Zapier / Make", category: "attribution", domain: "zapier.com", color: "#ff4f00", page: "zapier" },
  { key: "n8n", name: "n8n", category: "attribution", domain: "n8n.io", color: "#ea4b71", page: "n8n" },
  { key: "custom_webhook", name: "Custom webhook", category: "attribution", color: "#0f0f0f", page: "custom-webhook" },

  /* Project management */
  { key: "jira", name: "Jira", category: "project-management", domain: "atlassian.com", color: "#0052cc", page: "jira" },
  { key: "linear", name: "Linear", category: "project-management", domain: "linear.app", color: "#5e6ad2", page: "linear" },
  { key: "asana", name: "Asana", category: "project-management", domain: "asana.com", color: "#f06a6a", page: "asana" },
  { key: "clickup", name: "ClickUp", category: "project-management", domain: "clickup.com", color: "#7b68ee", page: "clickup" },
  { key: "monday", name: "monday.com", category: "project-management", domain: "monday.com", color: "#ff3d57", page: "monday" },
  { key: "trello", name: "Trello", category: "project-management", domain: "trello.com", color: "#0079bf", page: "trello" },
  { key: "notion", name: "Notion", category: "project-management", domain: "notion.so", color: "#111111", page: "notion" },
  { key: "awork", name: "awork", category: "project-management", domain: "awork.com", color: "#2e3bff", page: "awork" },

  /* Data & reporting */
  { key: "rest_api", name: "AutoSEO REST API", category: "data-reporting", color: "#0f0f0f", feature: "rest-api" },
  { key: "mcp", name: "AutoSEO MCP server", category: "data-reporting", color: "#16a34a", feature: "mcp-server" },
  { key: "looker_studio", name: "Looker Studio", category: "data-reporting", domain: "lookerstudio.google.com", color: "#4285f4", status: "beta", page: "looker-studio" },
  { key: "google_sheets", name: "Google Sheets", category: "data-reporting", domain: "sheets.google.com", color: "#0f9d58" },
];

/** Two-letter glyph for an integration (no vendor logos). */
export function monogram(name: string) {
  const words = name.replace(/^(AutoSEO|Google|AWS|Microsoft) /, "").split(/[\s/.-]+/).filter(Boolean);
  return (words.length > 1 ? `${words[0][0]}${words[1][0]}` : words[0].slice(0, 2)).toUpperCase();
}
