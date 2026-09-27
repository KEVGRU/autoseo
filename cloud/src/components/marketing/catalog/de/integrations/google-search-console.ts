import type { IntegrationPage } from "../../types";

export default {
  slug: "google-search-console",
  name: "Google Search Console",
  nav: "Google Search Console",
  summary: "KI-typische Prompts und Seiten knapp vor den Top-Positionen in der Search Console finden.",
  meta: {
    title: "Google Search Console: KI-Prompts finden",
    description:
      "Verbinden Sie die Google Search Console mit AutoSEO, finden Sie KI-typische Prompts in Ihren Suchanfragen und tracken Sie diese direkt in der KI-Suche.",
  },
  hero: {
    subtitle:
      "Verbinden Sie die Search Console mit Ihrem Google-Konto und machen Sie aus bis zu 16 Monaten Suchanfragen, Seiten und Ländern Prompts zum Tracken, Seiten zum Verbessern und konkrete Aufgaben.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Search-Console-Integration",
    items: [
      "Suchanfragen, Seiten und Länder aus der Google-Suche, täglich synchronisiert",
      "Bis zu 16 Monate Historie beim ersten Sync",
      "Eine Ansicht „AI Prompts“, die dialogartige Suchanfragen und Fragen markiert",
      "Intent-Labels: Recommend, Information, Comparison und Action",
      "Jede Suchanfrage mit einem Klick ins AI Visibility Tracking übernehmen",
      "URL-Prüfung des Indexstatus direkt in AutoSEO",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit der Search Console und AutoSEO",
    items: [
      {
        icon: "message-square",
        title: "Prompts entdecken, die Menschen schon stellen",
        body: "Lange, dialogartige Suchanfragen zeigen, wie Menschen Fragen formulieren – genauso wie gegenüber KI-Assistenten. Tracken Sie sie mit einem Klick als Prompts.",
      },
      {
        icon: "trending-up",
        title: "Seiten knapp vor der Spitze nach vorn bringen",
        body: "Verbinden Sie zusätzlich GA4, und Search Opportunities bewerten Seiten auf Position 4–20 nach Nachfrage, Geschäftswert und Abstand zur Spitze.",
      },
      {
        icon: "list-checks",
        title: "Aufgaben aus Ihren Suchdaten",
        body: "Nicht getrackte dialogartige Suchanfragen und Seiten mit Impressionen, aber schwachem Snippet werden zu priorisierten Aufgaben.",
      },
      {
        icon: "search",
        title: "Indexierung prüfen, ohne das Tool zu wechseln",
        body: "Prüfen Sie den Indexstatus einer URL über die URL Inspection API von Google und behalten Sie die Ergebnisse in einer Historie.",
      },
      {
        icon: "globe",
        title: "Sehen, wo Sie gefunden werden",
        body: "Schlüsseln Sie Klicks und Impressionen nach Ländern auf und entscheiden Sie, welche Märkte Sie in der KI-Suche tracken.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Search Console in vier Schritten verbinden –",
    muted: "mit Lesezugriff per OAuth.",
    items: [
      {
        title: "Search-Console-Einstellungen öffnen",
        body: "Öffnen Sie in Ihrem Projekt Analytics → Search Console → Settings oder Integrations → Google Search Console.",
      },
      {
        title: "Mit Google anmelden",
        body: "Erteilen Sie Lesezugriff mit dem Google-Konto, das Zugriff auf Ihre Search-Console-Property hat.",
      },
      {
        title: "Property auswählen",
        body: "Wählen Sie die Search-Console-Property, die zur Website dieses Projekts passt.",
      },
      {
        title: "Ersten Sync abwarten",
        body: "AutoSEO importiert im Hintergrund bis zu 16 Monate Suchanfragen, Seiten und Länder und synchronisiert danach täglich.",
      },
    ],
  },
  faq: [
    {
      q: "Wie finde ich KI-Prompts in der Google Search Console?",
      a: "Verbinden Sie die Search Console mit AutoSEO und öffnen Sie die Ansicht „AI Prompts“. Sie markiert dialogartige Suchanfragen und Fragen – so, wie Menschen ChatGPT und andere Assistenten fragen – und Sie können diese ins AI Visibility Tracking übernehmen.",
    },
    {
      q: "Welchen Zugriff braucht AutoSEO auf die Search Console?",
      a: "Nur Lesezugriff über den Google-Scope webmasters.readonly. AutoSEO kann weder Einstellungen ändern noch Sitemaps einreichen oder URLs entfernen. Beim Trennen werden die Verbindung und die importierten Daten des Projekts entfernt.",
    },
    {
      q: "Wie viel Search-Console-Historie importiert AutoSEO?",
      a: "Bis zu 16 Monate – das Maximum, das Google vorhält. Nach dem ersten Sync werden die Daten täglich aktualisiert.",
    },
    {
      q: "Unterstützt AutoSEO auch die Bing Webmaster Tools?",
      a: "Ja. Die Bing Webmaster Tools werden per API-Key verbunden und zeigen Suchanfragen und Seiten aus Bing im selben Search-Console-Bereich. Bing liefert außerdem die Suchergebnisse für Copilot.",
    },
    {
      q: "Wie viele URLs kann ich prüfen?",
      a: "Google erlaubt 2.000 URL-Prüfungen pro Property und Tag sowie 600 pro Minute. Ergebnisse, die jünger als 24 Stunden sind, liefert AutoSEO aus der Historie, statt Google erneut abzufragen.",
    },
    {
      q: "Brauche ich für das Self-Hosting einen Google-OAuth-Client?",
      a: "Ja. Auf einer selbst gehosteten Instanz hinterlegt ein Admin einmalig einen Google-OAuth-Client unter Admin → Data Providers; danach kann jeder Nutzer sein Google-Konto verbinden. In AutoSEO Cloud verwaltet das Codext-Team den OAuth-Client zentral für die gemeinsame App – Workspace-Owner hinterlegen keinen eigenen.",
    },
  ],
  cta: {
    title: "Machen Sie aus Suchdaten AI Visibility",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
