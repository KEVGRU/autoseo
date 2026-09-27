import type { FeaturePage } from "../../types";

export default {
  slug: "rest-api",
  nav: "REST API",
  summary: "Alle Kennzahlen, Prompts, Antworten und Audits per REST API mit OpenAPI-Spezifikation.",
  meta: {
    title: "SEO-API: REST-Zugriff auf AI-Visibility-Daten",
    description:
      "Die SEO-API von AutoSEO liefert AI-Visibility-Kennzahlen, Prompts, Antworten, Keywords, Rankings und Audits per REST – mit OpenAPI, API-Keys und OAuth 2.1.",
  },
  hero: {
    eyebrow: "REST API",
    title: "Eine SEO-API für all Ihre AI-Visibility-Daten.",
    muted: "REST, JSON und OpenAPI.",
    subtitle:
      "AutoSEO stellt seine Daten über eine versionierte REST API bereit: Projekte, Prompts, KI-Antworten, Kennzahlen, Wettbewerber, Quellen, Keywords, Rank Tracker, Audits, Reports und Aufgaben. Authentifizieren Sie sich mit API-Keys mit Scopes oder per OAuth 2.1 und generieren Sie Clients aus der OpenAPI-Spezifikation.",
  },
  visual: "terminal",
  stats: [
    { value: 4, label: "Key-Scopes", note: "read, write, spend, export" },
    { value: 120, label: "Anfragen pro Minute", note: "Standardlimit pro Key" },
    { value: 5000, label: "Antworten pro Exportseite", note: "Als JSON oder CSV" },
    { value: 0, prefix: "$", label: "Self-Hosting", note: "API inklusive, MIT-Lizenz" },
  ],
  why: {
    eyebrow: "Warum das wichtig ist",
    title: "Ihre Daten gehören in Ihren Stack,",
    muted: "nicht nur ins Dashboard.",
    body: "Daten zu AI Visibility und SEO sind am wertvollsten, wenn sie in die Tools fließen, die Sie ohnehin nutzen: BI-Dashboards, Data Warehouses, Kundenportale und interne Automatisierungen. Die REST API macht die Zahlen aus AutoSEO für all diese Systeme verfügbar.",
    points: [
      {
        title: "Reporting in eigener Hand",
        body: "Holen Sie Kennzahlen und Zeitreihen in Ihr BI-Tool, Ihr Data Warehouse oder Ihre Tabellen – in Ihrem Rhythmus und in Ihrem Format.",
      },
      {
        title: "Routine automatisieren",
        body: "Legen Sie Projekte an, fügen Sie Prompts hinzu und starten Sie Site Audits oder Ranking-Checks aus Skripten und Pipelines, statt sich durch die App zu klicken.",
      },
      {
        title: "Auf offenen Standards gebaut",
        body: "OpenAPI-Spezifikation, JSON-Antworten und Bearer-Tokens: Jede Programmiersprache, jeder HTTP-Client und jeder Codegenerator kann mit AutoSEO sprechen.",
      },
    ],
  },
  capabilities: {
    eyebrow: "Was Sie damit tun können",
    title: "Was die API abdeckt,",
    muted: "aus jeder Programmiersprache.",
    items: [
      {
        icon: "chart",
        title: "AI-Visibility-Kennzahlen",
        body: "Visibility, Mention Rate, Citation Rate und Position als Summen oder Zeitreihen, gefiltert nach Engine, Tag und Zeitraum.",
      },
      {
        icon: "message-square",
        title: "Prompts und Antworten",
        body: "Prompts auflisten und anlegen, einzelne KI-Antworten mit ihren Zitaten lesen und Wettbewerber, Quellen und Query Fan-outs abrufen.",
      },
      {
        icon: "search",
        title: "SEO-Recherche und Tracking",
        body: "Keyword-Recherche, SERPs, Domain- und Backlink-Daten, gespeicherte Keywords, Rank Tracker und Local SEO – alles mit denselben Keys.",
      },
      {
        icon: "gauge",
        title: "Audits und Crawlability",
        body: "Site Audits starten und stoppen, Probleme, Seiten und Lighthouse-Ergebnisse lesen, Läufe vergleichen und als CSV oder JSON exportieren.",
      },
      {
        icon: "file-text",
        title: "Reports und Aufgaben",
        body: "Reports anlegen, teilen und generieren sowie Optimierungsaufgaben lesen, aktualisieren und kommentieren.",
      },
      {
        icon: "download",
        title: "Bulk-Export",
        body: "Exportieren Sie alle Prompts mit Kennzahlen und jede KI-Antwort eines Zeitraums als JSON oder CSV – bis zu 5.000 Antworten pro Seite.",
      },
    ],
  },
  steps: {
    eyebrow: "So funktioniert es",
    title: "Vom API-Key zur ersten Anfrage",
    muted: "in drei Schritten.",
    items: [
      {
        title: "API-Key mit Scopes anlegen",
        body: "Erstellen Sie unter Settings → API & MCP einen Key mit den nötigen Scopes und beschränken Sie ihn optional auf einzelne Projekte. Der Key wird nur einmal angezeigt.",
      },
      {
        title: "OpenAPI-Spezifikation lesen",
        body: "Die Spezifikation liegt unter /api/v1/openapi.json Ihrer AutoSEO-URL, die Dokumentation unter Settings → API & MCP.",
      },
      {
        title: "Erste Anfrage senden",
        body: "Übergeben Sie den Key als Bearer-Token. Jede Antwort nutzt dasselbe JSON-Format mit Request-ID, und die Nutzung sehen Sie in Ihren API-Einstellungen.",
      },
    ],
  },
  faq: [
    {
      q: "Hat AutoSEO eine API?",
      a: "Ja. AutoSEO enthält eine versionierte REST API unter /api/v1 mit OpenAPI-Spezifikation – beim Self-Hosting und in AutoSEO Cloud. Sie deckt Projekte, Prompts, KI-Antworten und Kennzahlen, SEO-Recherche, Rank Tracking, Site Audits, Analytics, Reports und Aufgaben ab.",
    },
    {
      q: "Wie authentifiziere ich mich bei der AutoSEO-API?",
      a: "Erstellen Sie unter Settings → API & MCP einen API-Key und senden Sie ihn als Bearer-Token im Authorization-Header. Anwendungen können stattdessen OAuth 2.1 mit PKCE nutzen. Keys und Tokens werden nur als Hash gespeichert und lassen sich jederzeit widerrufen.",
    },
    {
      q: "Was sind Scopes bei API-Keys?",
      a: "Scopes begrenzen, was ein Key darf: read umfasst Projekte, Kennzahlen, Wettbewerber, Quellen, Aufgaben und Reports; write erlaubt das Anlegen von Projekten, Prompts und Tags; spend erlaubt alles, was Kosten verursacht, etwa DataForSEO-Recherchen oder KI-Generierung; export erlaubt Massenexporte. Ihre Rollenrechte gelten zusätzlich.",
    },
    {
      q: "Gibt es eine OpenAPI-Spezifikation?",
      a: "Ja. AutoSEO stellt die OpenAPI-Spezifikation unter /api/v1/openapi.json bereit. Importieren Sie sie in Postman, Insomnia oder einen Codegenerator und erhalten Sie einen typisierten Client für Ihre Programmiersprache.",
    },
    {
      q: "Gibt es Rate Limits?",
      a: "Ja. Jeder API-Key und jedes OAuth-Token ist standardmäßig auf 120 Anfragen pro Minute begrenzt; beim Self-Hosting können Admins das Limit im Admin-Bereich ändern. Fehlgeschlagene Anmeldeversuche werden pro IP begrenzt.",
    },
    {
      q: "Kann ich alle KI-Antworten über die API exportieren?",
      a: "Ja. Der Export-Endpunkt liefert alle Prompts mit ihren Kennzahlen und eine Zeile pro KI-Antwort im gewählten Zeitraum, als JSON oder CSV. Er ist paginiert mit bis zu 5.000 Antworten pro Seite und kann den vollständigen Antworttext enthalten.",
    },
    {
      q: "REST API oder MCP-Server – was soll ich nutzen?",
      a: "Nutzen Sie die REST API für Skripte, Integrationen und Dashboards, die vorhersehbares JSON brauchen. Nutzen Sie den MCP-Server, wenn ein KI-Agent wie Claude Code, Codex oder Cursor mit Ihren Daten arbeiten soll. Beide verwenden dieselben API-Keys und Scopes.",
    },
    {
      q: "Kostet die API extra?",
      a: "Nein. Die REST API ist Teil der Open-Source-App AutoSEO und in jedem AutoSEO-Cloud-Workspace für 50\u00a0$ pro Monat enthalten. Endpunkte, die DataForSEO oder KI-Anbieter aufrufen, brauchen den spend-Scope; beim Self-Hosting rechnen diese Anbieter direkt mit Ihnen ab, in der Cloud zählen sie zur inkludierten Nutzung im Wert von 10\u00a0$.",
    },
  ],
  related: ["mcp-server", "ai-seo-agent", "report-builder", "ai-visibility-tracking"],
  cta: {
    title: "Nutzen Sie Ihre AI-Visibility-Daten überall",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies FeaturePage;
