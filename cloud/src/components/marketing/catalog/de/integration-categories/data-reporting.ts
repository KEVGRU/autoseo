import type { IntegrationCategoryPage } from "../../types";

export default {
  slug: "data-reporting",
  nav: "Daten- & Reporting-Integrationen",
  summary: "AutoSEO-Daten in BI-Tools, Tabellen, Skripte und KI-Agenten bringen.",
  meta: {
    title: "SEO-Daten per API, MCP, Looker & Sheets",
    description:
      "SEO-Daten aus AutoSEO nutzen: REST API mit OpenAPI-Spezifikation, MCP-Server mit über 100 Tools für KI-Agenten, Looker Studio und Google-Sheets-Export.",
  },
  hero: {
    eyebrow: "Daten- & Reporting-Integrationen",
    title: "Ihre SEO-Daten in jedem Reporting-Tool.",
    muted: "Oder fragen Sie einen KI-Agenten.",
    subtitle:
      "Alles, was AutoSEO trackt, ist auch außerhalb der App verfügbar: eine dokumentierte REST API, ein MCP-Server für Claude, ChatGPT, Cursor und VS Code, Looker-Studio-Dashboards auf Basis der API und Exporte nach Google Sheets mit einem Klick.",
  },
  benefits: {
    eyebrow: "Was Sie bauen können",
    title: "Ihre Daten, nicht eingesperrt",
    muted: "in einem Dashboard.",
    items: [
      {
        icon: "code",
        title: "REST API mit OpenAPI",
        body: "REST v1 deckt Projekte, Prompts, Antworten, Kennzahlen, Wettbewerber, Quellen, Analytics, Attribution, Audits, Aufgaben und Reports ab – mit OpenAPI-Spezifikation für Ihren Client-Code.",
      },
      {
        icon: "brain",
        title: "MCP-Server für KI-Agenten",
        body: "Über 100 Tools per Streamable HTTP, mit OAuth 2.1 oder API-Key – so können Claude, ChatGPT, Cursor oder VS Code Ihre Daten abfragen und damit arbeiten.",
      },
      {
        icon: "presentation",
        title: "Dashboards in Looker Studio",
        body: "Bauen Sie Looker-Studio-Dashboards mit einem API-Key auf Basis der REST API. Die Looker-Studio-Integration ist in der Beta.",
      },
      {
        icon: "download",
        title: "Export nach Google Sheets",
        body: "Senden Sie Tabellen zu Keywords, Rankings, Backlinks und Site Audit in eine neue Tabelle in Ihrem Google Drive – oder laden Sie sie als CSV herunter.",
      },
    ],
  },
  faq: [
    {
      q: "Hat AutoSEO eine API?",
      a: "Ja. AutoSEO hat eine REST API v1 mit OpenAPI-Spezifikation unter /api/v1/openapi.json. API-Keys haben die Scopes read, write, spend und export und lassen sich auf bestimmte Projekte beschränken.",
    },
    {
      q: "Kann ich AutoSEO per MCP mit Claude oder ChatGPT verbinden?",
      a: "Ja. AutoSEO betreibt einen MCP-Server unter /api/mcp mit über 100 Tools. Clients melden sich per OAuth 2.1 oder API-Key an, und Plugins für Claude Code, Codex und Cursor bündeln den Server mit 17 Agent Skills.",
    },
    {
      q: "Wie baue ich ein Looker-Studio-Dashboard mit AutoSEO-Daten?",
      a: "Erstellen Sie unter Settings → API & MCP einen API-Key und bauen Sie Ihre Looker-Studio-Dashboards auf Basis der AutoSEO REST API. Die Integration ist in der Beta. Für einen einmaligen Stand exportieren Sie eine Tabelle nach Google Sheets und nutzen sie als Datenquelle.",
    },
    {
      q: "Kann ich SEO-Daten nach Google Sheets exportieren?",
      a: "Ja. Tabellen aus Keyword-Recherche, gespeicherten Keywords, Rank Tracking, Domain-Übersicht, Backlinks, Local SEO und Site Audit landen als neue Google-Tabelle in Ihrem Drive. AutoSEO fragt nur Zugriff auf die Dateien an, die es selbst erstellt.",
    },
    {
      q: "Kann ein API-Key in meinem Namen Geld ausgeben?",
      a: "Nur mit dem Scope spend. Ohne ihn kann ein Key nichts starten, was Kosten verursacht – etwa DataForSEO-Recherchen, KI-Generierung oder Tracking-Läufe –, und die Person hinter dem Key braucht zusätzlich die passende Rollenberechtigung.",
    },
    {
      q: "Sind API und MCP inklusive?",
      a: "Ja. REST API, MCP-Server und alle Exporte sind Teil der Open-Source-App und kostenlos selbst hostbar; kostenpflichtige Aufrufe wie DataForSEO-Recherchen rechnet dann der Anbieter ab. Ein AutoSEO-Cloud-Workspace für 50\u00a0$ im Monat bietet denselben Zugriff, inklusive 10\u00a0$ für KI- und Datennutzung.",
    },
  ],
  cta: {
    title: "Setzen Sie Ihre AI-Visibility-Daten ein",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationCategoryPage;
