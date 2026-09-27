import type { IntegrationPage } from "../../types";

export default {
  slug: "bing-webmaster-tools",
  name: "Bing Webmaster Tools",
  nav: "Bing Webmaster Tools",
  summary: "Bing-Suchanfragen und -Seiten in AutoSEO holen und darin KI-typische Prompts finden.",
  meta: {
    title: "Bing Webmaster Tools: KI-Prompts finden",
    description:
      "Verbinden Sie die Bing Webmaster Tools per API-Key mit AutoSEO, importieren Sie Bing-Suchanfragen und -Seiten täglich und finden Sie KI-typische Prompts darin.",
  },
  hero: {
    subtitle:
      "Verbinden Sie die Bing Webmaster Tools per API-Key und sehen Sie Suchanfragen, Seiten, Klicks und Impressionen aus Bing neben Google – inklusive der dialogartigen Suchanfragen, die sich in der KI-Suche zu tracken lohnen.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Bing-Webmaster-Tools-Integration",
    items: [
      "Suchanfragen und Seiten aus Bing mit Klicks, Impressionen und durchschnittlicher Position",
      "Tägliche Klicks und Impressionen für die gesamte Website",
      "KI-typische Prompts und Intent-Labels – genau wie bei der Google Search Console",
      "Ein Umschalter zwischen Google und Bing im Search-Console-Bereich Ihres Projekts",
      "Jede Bing-Suchanfrage mit einem Klick ins AI Visibility Tracking übernehmen",
      "Tägliche Synchronisierung mit einem API-Key pro Projekt",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit den Bing Webmaster Tools und AutoSEO",
    items: [
      {
        icon: "search",
        title: "Die Suchmaschine hinter Copilot im Blick",
        body: "Bing liefert auch die Suchergebnisse für Copilot – Ihre Suchanfragen und Positionen in Bing lohnen sich deshalb neben Google.",
      },
      {
        icon: "message-square",
        title: "Prompts in Bing-Suchanfragen finden",
        body: "Dialogartige Suchanfragen und Fragen aus Bing werden als KI-Prompts markiert und lassen sich mit einem Klick in der AI Visibility tracken.",
      },
      {
        icon: "layers",
        title: "Google und Bing vergleichen",
        body: "Wechseln Sie in denselben Ansichten zwischen Google und Bing und sehen Sie, wo sich Suchanfragen und Seiten unterscheiden.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Bing in drei Schritten verbinden –",
    muted: "mit einem API-Key.",
    items: [
      {
        title: "API-Key erstellen",
        body: "Öffnen Sie in den Bing Webmaster Tools Einstellungen → API-Zugriff und erstellen Sie einen API-Key für das Konto, in dem Ihre Website verifiziert ist.",
      },
      {
        title: "Site-URL und Key eingeben",
        body: "Öffnen Sie in Ihrem Projekt Analytics → Search Console → Settings mit der Quelle Bing oder Integrations → Bing Webmaster Tools. Geben Sie die Site-URL exakt wie in Bing registriert sowie den API-Key ein.",
      },
      {
        title: "Testen und synchronisieren",
        body: "AutoSEO prüft, ob die Website zum Konto hinter dem Key gehört, importiert dann Suchanfragen und Seiten und synchronisiert täglich.",
      },
    ],
  },
  faq: [
    {
      q: "Wie verbinde ich die Bing Webmaster Tools mit AutoSEO?",
      a: "Erstellen Sie in den Bing Webmaster Tools unter Einstellungen → API-Zugriff einen API-Key und geben Sie ihn zusammen mit Ihrer Site-URL in den Search-Console-Einstellungen des Projekts oder auf der Integrations-Seite ein. AutoSEO prüft vor dem ersten Sync, ob die Website zu diesem Bing-Konto gehört.",
    },
    {
      q: "Warum sollte ich Bing für die AI Visibility tracken?",
      a: "Bing liefert die Suchergebnisse für Copilot, und die Suchanfragen in Bing zeigen, wie Menschen ihre Fragen formulieren. AutoSEO markiert die dialogartigen Anfragen, damit Sie sie als Prompts tracken können.",
    },
    {
      q: "Was liefert Bing im Vergleich zur Google Search Console nicht?",
      a: "Bing meldet keine Länder und hat keine URL Inspection API, und seine Daten unterstützen nicht die Kombination aus Suchanfrage und Seite, die Search Opportunities brauchen. Diese Ansichten bleiben Google vorbehalten.",
    },
    {
      q: "Brauche ich einen eigenen Bing-API-Key?",
      a: "In AutoSEO Cloud ja – jedes Projekt nutzt seinen eigenen Key. Auf einer selbst gehosteten Instanz kann ein Admin zusätzlich einen instanzweiten Key unter Admin → Data Providers hinterlegen, der dann für Websites auf der jeweiligen Projekt-Domain gilt.",
    },
    {
      q: "Wo wird mein Bing-API-Key gespeichert?",
      a: "Er wird mit AES-256-GCM verschlüsselt in der Datenbank von AutoSEO gespeichert und nie an den Browser zurückgegeben. Er dient ausschließlich für Aufrufe der Bing Webmaster API.",
    },
  ],
  cta: {
    title: "Ergänzen Sie Ihre Suchdaten um Bing",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
