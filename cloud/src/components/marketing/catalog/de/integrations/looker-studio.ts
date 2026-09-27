import type { IntegrationPage } from "../../types";

export default {
  slug: "looker-studio",
  name: "Looker Studio",
  nav: "Looker Studio",
  summary: "Looker-Studio-Dashboards auf AutoSEO-Daten bauen – über Google Sheets oder die REST API.",
  meta: {
    title: "Looker Studio: Dashboards für AI Visibility",
    description:
      "Bauen Sie Looker-Studio-Dashboards auf AutoSEO-Daten – exportieren Sie Tabellen nach Google Sheets oder laden Sie Prompts, Antworten und Zitate per REST API.",
  },
  hero: {
    subtitle:
      "Einen eigenen Looker-Studio-Connector gibt es noch nicht. Exportieren Sie AutoSEO-Tabellen nach Google Sheets oder laden Sie Antworten, Prompts, Erwähnungen und Zitate per REST API – und bauen Sie Ihre Dashboards darauf auf.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "für Looker-Studio-Dashboards",
    items: [
      "Beta: Daten gelangen über Google Sheets in Looker Studio, nicht über einen eigenen Connector",
      "Tabellen wie getrackte Prompts, Wettbewerber, Quellen, Fan-outs, Aufgaben und Rankings direkt nach Google Sheets exportieren",
      "REST-API-Export von Antworten, Prompts, Erwähnungen, Zitaten und Fan-outs als CSV oder NDJSON",
      "Inkrementelle Exporte mit dem Parameter since für regelmäßige Aktualisierungen",
      "API-Keys mit getrennten Scopes für read, write, spend und export",
      "Der integrierte Report-Builder als Alternative für kundenfertige Präsentationen",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Looker Studio und AutoSEO",
    items: [
      {
        icon: "presentation",
        title: "AI Visibility in bestehende Dashboards bringen",
        body: "Bringen Sie Mention Rate, Zitate und Wettbewerberdaten in die Looker-Studio-Reports, die Ihre Stakeholder ohnehin lesen.",
      },
      {
        icon: "chart",
        title: "Mit GA4 und Search Console kombinieren",
        body: "Verknüpfen Sie in Looker Studio ein AutoSEO-Sheet mit Ihren Datenquellen aus GA4 oder der Search Console in einem Report.",
      },
      {
        icon: "refresh",
        title: "Regelmäßig aktualisieren",
        body: "Ein kleines Skript – zum Beispiel mit Google Apps Script – kann den Export-Endpunkt mit Ihrem API-Key abrufen und neue Zeilen an das Sheet anhängen, das Looker Studio liest.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Daten in Looker Studio bringen –",
    muted: "in drei Schritten.",
    items: [
      {
        title: "Tabelle nach Google Sheets exportieren",
        body: "Öffnen Sie eine Tabelle in AutoSEO, wählen Sie Export → Google Sheets und verbinden Sie beim ersten Mal Ihr Google-Konto. AutoSEO legt die Tabelle in Ihrem Drive an.",
      },
      {
        title: "Oder Daten per REST API laden",
        body: "Erstellen Sie unter Settings → API & MCP einen Key mit dem Scope export und rufen Sie GET /api/v1/projects/{projectId}/export mit format=csv auf.",
      },
      {
        title: "Sheet in Looker Studio hinzufügen",
        body: "Fügen Sie in Looker Studio eine Google-Sheets-Datenquelle hinzu, die auf die Tabelle zeigt, und bauen Sie Ihre Diagramme.",
      },
    ],
  },
  faq: [
    {
      q: "Gibt es einen AutoSEO-Connector für Looker Studio?",
      a: "Noch nicht – die Integration ist in der Beta. Heute verbinden Sie sich über Google Sheets: Exportieren Sie Tabellen aus AutoSEO oder befüllen Sie ein Sheet über die REST API und nutzen Sie es als Datenquelle in Looker Studio.",
    },
    {
      q: "Welche AutoSEO-Daten kann ich in Looker Studio nutzen?",
      a: "Jede Tabelle mit Export → Google Sheets sowie den REST-API-Export von Antworten, Prompts, Erwähnungen, Zitaten und Fan-outs als CSV oder NDJSON. Weitere Endpunkte liefern Visibility-Kennzahlen, KI-Traffic, Search-Console- und Attributionsdaten.",
    },
    {
      q: "Wie halte ich ein Looker-Studio-Dashboard aktuell?",
      a: "Exporte nach Google Sheets sind Momentaufnahmen. Für regelmäßige Updates rufen Sie den Export-Endpunkt nach Zeitplan mit since auf der letzten High-Water-Mark auf und hängen die neuen Zeilen an Ihr Sheet an.",
    },
    {
      q: "Welchen Zugriff braucht der Export nach Google Sheets?",
      a: "Die Google-Berechtigung drive.file, die nur Tabellen umfasst, die AutoSEO selbst anlegt. Auf einer selbst gehosteten Instanz hinterlegt ein Admin zuvor einen Google-OAuth-Client unter Admin → Data Providers.",
    },
    {
      q: "Ist die REST API in AutoSEO enthalten?",
      a: "Ja. REST API, MCP-Server und alle Exporte sind Teil der Open-Source-App: kostenlos beim Self-Hosting und in einem AutoSEO-Cloud-Workspace enthalten.",
    },
  ],
  cta: {
    title: "Bringen Sie AI Visibility in Ihre Dashboards",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
