import type { IntegrationsHubPage } from "../types";

export default {
  meta: {
    title: "Integrationen für AI Visibility & SEO",
    description:
      "Integrationen für AutoSEO: GA4, Search Console, Cloudflare, Shopify, HubSpot, WordPress, Jira und über 40 weitere Tools für Analytics, Attribution und Content.",
  },
  hero: {
    eyebrow: "Integrationen",
    title: "Integrationen für AI Visibility und SEO.",
    muted: "Verbinden Sie die Tools, die Sie schon nutzen.",
    subtitle:
      "Holen Sie Traffic-, Such-, Crawler- und Umsatzdaten in Ihre AI-Visibility-Arbeit – und senden Sie Aufgaben, Inhalte und Daten zurück in die Tools Ihres Teams. Jede Integration ist in der Open-Source-App enthalten.",
  },
  descriptions: {
    /* CMS */
    wordpress: "Als Entwurf oder live veröffentlichen, mit JSON-LD und Yoast- oder Rank-Math-Meta.",
    webflow: "Webflow-CMS-Items aus Ihren Entwürfen anlegen und veröffentlichen.",
    framer: "Entwürfe per Server API in Framer-Collections veröffentlichen oder als CSV exportieren.",
    shopify_cms: "Optimierte Artikel in Ihrem Shopify-Blog veröffentlichen.",

    /* Analytics */
    google_analytics: "Sitzungen, Key Events und Umsatz aus KI-Plattformen über die GA4 Data API.",
    matomo: "KI-Besuche, Ziele und Umsatz aus Matomo – in der Cloud oder selbst gehostet.",
    piwik_pro: "KI-Sitzungen und Conversions über API-Zugangsdaten von Piwik PRO.",

    /* Search Console */
    google_search_console: "Suchanfragen, Seiten und Länder aus der Google-Suche, KI-Prompts markiert.",
    bing_webmaster: "Suchanfragen und Seiten aus Bing, direkt neben Ihren Google-Daten.",

    /* Bot-Traffic */
    cloudflare: "KI-Crawler-Besuche per Cloudflare Worker oder Logpush streamen.",
    akamai: "DataStream-2-Logs an Ihren HTTPS-Endpunkt in AutoSEO senden.",
    server_logs: "NDJSON aus nginx, Apache oder jedem Backend senden – oder Logdateien hochladen.",
    fastly: "Echtzeit-Log-Streaming von Fastly.",
    cloudfront: "Echtzeit-Logs aus Amazon-CloudFront-Distributionen.",

    /* Attribution */
    hubspot: "Kontakte und Deals samt Deal-Wert aus einem HubSpot-Workflow senden.",
    salesforce: "Leads und Opportunities aus einem Salesforce Flow senden.",
    shopify: "Ein Custom Pixel ordnet Shopify-Bestellungen und Umsatz der KI-Suche zu.",
    stripe: "Signierte Webhooks machen Checkouts und Rechnungen zu Conversions.",
    woocommerce: "Native Bestell-Webhooks von WooCommerce, geprüft mit einem gemeinsamen Secret.",
    shopware: "Neue Bestellungen aus dem Shopware Flow Builder senden.",
    typeform: "Typeform-Webhooks; die Frage nach der Herkunft wird automatisch erkannt.",
    tally: "Tally-Webhooks mit automatisch aufgelösten Antwortoptionen.",
    jotform: "Jotform-Einsendungen per Webhook erfassen.",
    gravity_forms: "WordPress-Formulare über das Webhooks Add-On erfassen.",
    formstack: "Formstack-Einsendungen per Webhook erfassen.",
    surveymonkey: "Antworten einer SurveyMonkey-Umfrage über die API importieren.",
    fairing: "Post-Purchase-Antworten mit Bestellnummer und Summe importieren.",
    knocommerce: "Post-Purchase-Umfragen aus KnoCommerce importieren.",
    zigpoll: "Onsite- und Post-Purchase-Umfragen aus Zigpoll importieren.",
    pipedrive: "Pipedrive-Deal-Webhooks mit Wert und Währung.",
    attio: "Datensätze und Deals aus einem Attio-Workflow senden.",
    close: "Close-Webhooks für Leads und Opportunities.",
    intercom: "Kontakt-Webhooks mit der Antwort in einem Custom Attribute.",
    calendly: "Antworten auf Buchungsfragen aus Calendly-Webhooks.",
    zapier: "Antworten aus jeder App über Zapier oder Make senden.",
    n8n: "Antworten aus jedem n8n-Workflow senden.",
    custom_webhook: "Beliebige Leads oder Bestellungen als JSON senden und Felder einmal zuordnen.",

    /* Projektmanagement */
    jira: "Jira-Issues mit formatierter Beschreibung anlegen und den Status synchronisieren.",
    linear: "Linear-Issues anlegen und Aufgaben schließen, sobald das Issue erledigt ist.",
    asana: "Asana-Aufgaben in einem Projekt anlegen und den Status synchronisieren.",
    clickup: "ClickUp-Aufgaben mit Priorität und Tags anlegen und den Status synchronisieren.",
    monday: "Items auf einem monday.com-Board mit allen Aufgabendetails anlegen.",
    trello: "Trello-Karten anlegen; eine Karte in „Done“ schließt die Aufgabe.",
    notion: "Seiten in einer Notion-Datenbank anlegen, Schritte als To-dos.",
    awork: "awork-Projektaufgaben anlegen und den Status synchronisieren.",

    /* Daten & Reporting */
    rest_api: "REST API v1 mit OpenAPI für Prompts, Visibility, Traffic und Reports.",
    mcp: "Claude, ChatGPT, Cursor oder VS Code mit über 100 MCP-Tools verbinden.",
    looker_studio: "Looker-Studio-Dashboards per API-Key auf Basis der REST API bauen.",
    google_sheets: "Tabellen zu Keywords, Rankings, Backlinks und Audits nach Google Sheets exportieren.",
  },
  categories: {
    eyebrow: "Alle Integrationen",
    title: "Jede Integration,",
    muted: "sortiert nach ihrem Zweck.",
  },
  faq: [
    {
      q: "Mit welchen Tools lässt sich AutoSEO verbinden?",
      a: "Analytics: Google Analytics 4, Matomo und Piwik PRO. Suche: Google Search Console und Bing Webmaster Tools. Bot-Traffic: Cloudflare, Akamai und Server-Logs. Attribution: Shops, Zahlungsanbieter, Formulare, Umfragen und CRMs wie Shopify, Stripe, HubSpot und Salesforce. Aufgaben: Jira, Linear, Asana, ClickUp und weitere. Content: WordPress, Webflow und Framer. Daten: REST API, MCP, Looker Studio und Google Sheets.",
    },
    {
      q: "Sind die Integrationen im Preis enthalten?",
      a: "Ja. Jede Integration ist Teil der Open-Source-App – kostenlos selbst hostbar oder in einem AutoSEO-Cloud-Workspace für 50\u00a0$ im Monat enthalten, inklusive 10\u00a0$ für KI- und Datennutzung. Tarife der verbundenen Tools selbst rechnen deren Anbieter ab.",
    },
    {
      q: "Was bedeuten „Beta“ und „Demnächst“?",
      a: "Beta-Integrationen sind heute verfügbar, können sich aber noch ändern: WordPress, Webflow, Framer und Looker Studio. „Demnächst“ kennzeichnet Connectoren in Entwicklung: Shopify als CMS, Fastly und AWS CloudFront. Die Shopify-Attribution funktioniert bereits heute.",
    },
    {
      q: "Wie werden Zugangsdaten für Integrationen gespeichert?",
      a: "In der Datenbank von AutoSEO – beim Self-Hosting auf Ihrem eigenen Server, bei AutoSEO Cloud in Deutschland. API-Tokens und Passwörter werden mit AES-256-GCM verschlüsselt und nie an den Browser zurückgegeben; Tokens für eingehende Webhooks werden nur als Hash gespeichert.",
    },
    {
      q: "Wo verbinde ich Integrationen in AutoSEO?",
      a: "Öffnen Sie in Ihrem Projekt die Seite Integrations mit dem vollständigen Katalog. Integrationen, die zu einem Modul gehören – Attribution-Quellen, CMS- und Aufgaben-Tools, Bot-Traffic-Connectoren –, führen direkt zur Einrichtung im jeweiligen Modul.",
    },
    {
      q: "Kann ich ein Tool verbinden, das hier fehlt?",
      a: "Meistens ja. Die Attribution nimmt jede JSON-Nutzlast über einen eigenen Webhook, Zapier, Make oder n8n an, Aufgaben-Events gehen als signierte Webhooks hinaus, und REST API und MCP-Server geben Skripten und KI-Agenten Zugriff auf all Ihre Daten.",
    },
  ],
  cta: {
    title: "Verbinden Sie Ihren Stack in wenigen Minuten",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationsHubPage;
