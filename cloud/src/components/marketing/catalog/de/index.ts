/** German landing-page copy. Generated list — keep in sync with ../routes.ts. */
import type { LandingCatalog } from "../types";
import ui from "./ui";
import integrationsHub from "./integrations-hub";
import security from "./security";
import support from "./support";
import featureAiVisibilityTracking from "./features/ai-visibility-tracking";
import featurePromptResearch from "./features/prompt-research";
import featureAiCompetitorAnalysis from "./features/ai-competitor-analysis";
import featureAiBrandSentiment from "./features/ai-brand-sentiment";
import featureAiCitationTracking from "./features/ai-citation-tracking";
import featureQueryFanoutAnalysis from "./features/query-fanout-analysis";
import featureAiShoppingVisibility from "./features/ai-shopping-visibility";
import featureAiAdsTracking from "./features/ai-ads-tracking";
import featureAiTrafficAnalytics from "./features/ai-traffic-analytics";
import featureAiSearchAttribution from "./features/ai-search-attribution";
import featureAiBotTraffic from "./features/ai-bot-traffic";
import featureAiCrawlability from "./features/ai-crawlability";
import featureAiSeoTasks from "./features/ai-seo-tasks";
import featureAiContentOptimization from "./features/ai-content-optimization";
import featureAiFactCheck from "./features/ai-fact-check";
import featureKeywordResearch from "./features/keyword-research";
import featureRankTracking from "./features/rank-tracking";
import featureSiteAudit from "./features/site-audit";
import featureReportBuilder from "./features/report-builder";
import featureAiSeoAgent from "./features/ai-seo-agent";
import featureRestApi from "./features/rest-api";
import featureMcpServer from "./features/mcp-server";
import platformChatgpt from "./platforms/chatgpt";
import platformPerplexity from "./platforms/perplexity";
import platformClaude from "./platforms/claude";
import platformGemini from "./platforms/gemini";
import platformGoogleAiMode from "./platforms/google-ai-mode";
import platformGoogleAiOverviews from "./platforms/google-ai-overviews";
import platformMicrosoftCopilot from "./platforms/microsoft-copilot";
import platformGrok from "./platforms/grok";
import platformMistral from "./platforms/mistral";
import platformDeepseek from "./platforms/deepseek";
import platformMetaAi from "./platforms/meta-ai";
import platformQwen from "./platforms/qwen";
import platformKimi from "./platforms/kimi";
import platformSabia from "./platforms/sabia";
import platformSolar from "./platforms/solar";
import solutionGeoTeams from "./solutions/geo-teams";
import solutionContentTeams from "./solutions/content-teams";
import solutionPrBrandTeams from "./solutions/pr-brand-teams";
import solutionCustomerExperience from "./solutions/customer-experience";
import solutionAgencies from "./solutions/agencies";
import solutionECommerce from "./solutions/e-commerce";
import solutionFinance from "./solutions/finance";
import solutionSaasTech from "./solutions/saas-tech";
import solutionHealthcare from "./solutions/healthcare";
import solutionPharma from "./solutions/pharma";
import solutionAutomotive from "./solutions/automotive";
import solutionTravel from "./solutions/travel";
import categoryCms from "./integration-categories/cms";
import categoryAnalytics from "./integration-categories/analytics";
import categorySearchConsole from "./integration-categories/search-console";
import categoryBotTraffic from "./integration-categories/bot-traffic";
import categoryAttribution from "./integration-categories/attribution";
import categoryProjectManagement from "./integration-categories/project-management";
import categoryDataReporting from "./integration-categories/data-reporting";
import integrationWordpress from "./integrations/wordpress";
import integrationWebflow from "./integrations/webflow";
import integrationShopify from "./integrations/shopify";
import integrationGoogleAnalytics from "./integrations/google-analytics";
import integrationGoogleSearchConsole from "./integrations/google-search-console";
import integrationCloudflare from "./integrations/cloudflare";
import integrationHubspot from "./integrations/hubspot";
import integrationSalesforce from "./integrations/salesforce";
import integrationJira from "./integrations/jira";
import integrationLinear from "./integrations/linear";
import integrationFramer from "./integrations/framer";
import integrationMatomo from "./integrations/matomo";
import integrationPiwikPro from "./integrations/piwik-pro";
import integrationBingWebmasterTools from "./integrations/bing-webmaster-tools";
import integrationAkamai from "./integrations/akamai";
import integrationServerLogs from "./integrations/server-logs";
import integrationAsana from "./integrations/asana";
import integrationClickup from "./integrations/clickup";
import integrationMonday from "./integrations/monday";
import integrationTrello from "./integrations/trello";
import integrationNotion from "./integrations/notion";
import integrationAwork from "./integrations/awork";
import integrationLookerStudio from "./integrations/looker-studio";
import integrationStripe from "./integrations/stripe";
import integrationWoocommerce from "./integrations/woocommerce";
import integrationShopware from "./integrations/shopware";
import integrationPipedrive from "./integrations/pipedrive";
import integrationAttio from "./integrations/attio";
import integrationClose from "./integrations/close";
import integrationIntercom from "./integrations/intercom";
import integrationCalendly from "./integrations/calendly";
import integrationZapier from "./integrations/zapier";
import integrationN8n from "./integrations/n8n";
import integrationCustomWebhook from "./integrations/custom-webhook";
import integrationTypeform from "./integrations/typeform";
import integrationTally from "./integrations/tally";
import integrationJotform from "./integrations/jotform";
import integrationGravityForms from "./integrations/gravity-forms";
import integrationFormstack from "./integrations/formstack";
import integrationSurveymonkey from "./integrations/surveymonkey";
import integrationFairing from "./integrations/fairing";
import integrationKnocommerce from "./integrations/knocommerce";
import integrationZigpoll from "./integrations/zigpoll";

export const catalog: LandingCatalog = {
  ui,
  features: {
    "ai-visibility-tracking": featureAiVisibilityTracking,
    "prompt-research": featurePromptResearch,
    "ai-competitor-analysis": featureAiCompetitorAnalysis,
    "ai-brand-sentiment": featureAiBrandSentiment,
    "ai-citation-tracking": featureAiCitationTracking,
    "query-fanout-analysis": featureQueryFanoutAnalysis,
    "ai-shopping-visibility": featureAiShoppingVisibility,
    "ai-ads-tracking": featureAiAdsTracking,
    "ai-traffic-analytics": featureAiTrafficAnalytics,
    "ai-search-attribution": featureAiSearchAttribution,
    "ai-bot-traffic": featureAiBotTraffic,
    "ai-crawlability": featureAiCrawlability,
    "ai-seo-tasks": featureAiSeoTasks,
    "ai-content-optimization": featureAiContentOptimization,
    "ai-fact-check": featureAiFactCheck,
    "keyword-research": featureKeywordResearch,
    "rank-tracking": featureRankTracking,
    "site-audit": featureSiteAudit,
    "report-builder": featureReportBuilder,
    "ai-seo-agent": featureAiSeoAgent,
    "rest-api": featureRestApi,
    "mcp-server": featureMcpServer,
  },
  platforms: {
    "chatgpt": platformChatgpt,
    "perplexity": platformPerplexity,
    "claude": platformClaude,
    "gemini": platformGemini,
    "google-ai-mode": platformGoogleAiMode,
    "google-ai-overviews": platformGoogleAiOverviews,
    "microsoft-copilot": platformMicrosoftCopilot,
    "grok": platformGrok,
    "mistral": platformMistral,
    "deepseek": platformDeepseek,
    "meta-ai": platformMetaAi,
    "qwen": platformQwen,
    "kimi": platformKimi,
    "sabia": platformSabia,
    "solar": platformSolar,
  },
  solutions: {
    "geo-teams": solutionGeoTeams,
    "content-teams": solutionContentTeams,
    "pr-brand-teams": solutionPrBrandTeams,
    "customer-experience": solutionCustomerExperience,
    "agencies": solutionAgencies,
    "e-commerce": solutionECommerce,
    "finance": solutionFinance,
    "saas-tech": solutionSaasTech,
    "healthcare": solutionHealthcare,
    "pharma": solutionPharma,
    "automotive": solutionAutomotive,
    "travel": solutionTravel,
  },
  integrationCategories: {
    "cms": categoryCms,
    "analytics": categoryAnalytics,
    "search-console": categorySearchConsole,
    "bot-traffic": categoryBotTraffic,
    "attribution": categoryAttribution,
    "project-management": categoryProjectManagement,
    "data-reporting": categoryDataReporting,
  },
  integrations: {
    "wordpress": integrationWordpress,
    "webflow": integrationWebflow,
    "shopify": integrationShopify,
    "google-analytics": integrationGoogleAnalytics,
    "google-search-console": integrationGoogleSearchConsole,
    "cloudflare": integrationCloudflare,
    "hubspot": integrationHubspot,
    "salesforce": integrationSalesforce,
    "jira": integrationJira,
    "linear": integrationLinear,
    "framer": integrationFramer,
    "matomo": integrationMatomo,
    "piwik-pro": integrationPiwikPro,
    "bing-webmaster-tools": integrationBingWebmasterTools,
    "akamai": integrationAkamai,
    "server-logs": integrationServerLogs,
    "asana": integrationAsana,
    "clickup": integrationClickup,
    "monday": integrationMonday,
    "trello": integrationTrello,
    "notion": integrationNotion,
    "awork": integrationAwork,
    "looker-studio": integrationLookerStudio,
    "stripe": integrationStripe,
    "woocommerce": integrationWoocommerce,
    "shopware": integrationShopware,
    "pipedrive": integrationPipedrive,
    "attio": integrationAttio,
    "close": integrationClose,
    "intercom": integrationIntercom,
    "calendly": integrationCalendly,
    "zapier": integrationZapier,
    "n8n": integrationN8n,
    "custom-webhook": integrationCustomWebhook,
    "typeform": integrationTypeform,
    "tally": integrationTally,
    "jotform": integrationJotform,
    "gravity-forms": integrationGravityForms,
    "formstack": integrationFormstack,
    "surveymonkey": integrationSurveymonkey,
    "fairing": integrationFairing,
    "knocommerce": integrationKnocommerce,
    "zigpoll": integrationZigpoll,
  },
  integrationsHub,
  security,
  support,
};
