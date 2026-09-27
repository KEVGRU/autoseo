/** Localized tables built from the shared facts (used by the fact sheet and the entity map). */
import type { Locale } from "@/components/site/types";
import { ENGINE_FACTS, INTEGRATION_FACTS, type Backend, type IntegrationCategoryKey } from "./data";

export const backendLabel: Record<Locale, Record<Backend, string>> = {
  en: { dataforseo: "DataForSEO", api: "Direct API", agent: "Local agent", ai: "AI simulation" },
  de: { dataforseo: "DataForSEO", api: "Direkte API", agent: "Lokaler Agent", ai: "KI-Simulation" },
};

const noWebSearch: Record<Locale, string> = { en: "no web search, answers from model knowledge", de: "ohne Websuche, Antworten aus dem Modellwissen" };

/** One row per engine: name, vendor, backends in auto order with their technical route. */
export function engineRows(locale: Locale): string[][] {
  const l = backendLabel[locale];
  return ENGINE_FACTS.map((e) => {
    const routes = e.backends.map((b) => {
      if (b === "dataforseo") return `**${l.dataforseo}:** ${e.dataforseo}`;
      if (b === "api") return `**${l.api}:** ${e.api}${e.apiNoWebSearch ? ` (${noWebSearch[locale]})` : ""}`;
      if (b === "agent") return `**${l.agent}:** ${e.agent}`;
      return `**${l.ai}**`;
    });
    return [`**${e.name}**`, e.vendor, routes.join(" · ")];
  });
}

export const integrationCategory: Record<Locale, Record<IntegrationCategoryKey, { label: string; purpose: string }>> = {
  en: {
    analytics: { label: "Analytics", purpose: "Human traffic from AI platforms, conversions and revenue" },
    search_console: { label: "Search Console", purpose: "Search queries, impressions and AI-style prompts" },
    bot_traffic: { label: "Bot traffic", purpose: "AI crawler visits from CDN or server logs" },
    data_reporting: { label: "Data & reporting", purpose: "Export data to BI tools, agents and scripts" },
    project_management: { label: "Project management", purpose: "Push prioritized optimization tasks and sync status" },
    attribution: { label: "Attribution", purpose: "Tie leads, deals and orders to AI search" },
    cms: { label: "CMS", purpose: "Publish optimized content to the website" },
  },
  de: {
    analytics: { label: "Analytics", purpose: "Menschlicher Traffic von KI-Plattformen, Conversions und Umsatz" },
    search_console: { label: "Search Console", purpose: "Suchanfragen, Impressionen und KI-typische Prompts" },
    bot_traffic: { label: "Bot-Traffic", purpose: "Besuche von KI-Crawlern aus CDN- oder Server-Logs" },
    data_reporting: { label: "Daten & Reporting", purpose: "Datenexport in BI-Tools, Agenten und Skripte" },
    project_management: { label: "Projektmanagement", purpose: "Priorisierte Optimierungsaufgaben übertragen und Status synchronisieren" },
    attribution: { label: "Attribution", purpose: "Leads, Deals und Bestellungen der KI-Suche zuordnen" },
    cms: { label: "CMS", purpose: "Optimierte Inhalte auf der Website veröffentlichen" },
  },
};

const statusLabel: Record<Locale, { beta: string; coming_soon: string }> = {
  en: { beta: "beta", coming_soon: "coming soon" },
  de: { beta: "Beta", coming_soon: "in Vorbereitung" },
};

export function integrationList(locale: Locale, key: IntegrationCategoryKey): string {
  const items = INTEGRATION_FACTS.find((c) => c.key === key)?.items ?? [];
  return items.map((i) => (i.status ? `${i.name} (${statusLabel[locale][i.status]})` : i.name)).join(", ");
}

export function integrationRows(locale: Locale): string[][] {
  return INTEGRATION_FACTS.map((c) => {
    const cat = integrationCategory[locale][c.key];
    return [`**${cat.label}**`, cat.purpose, integrationList(locale, c.key)];
  });
}
