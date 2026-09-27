import type { IntegrationPage } from "../../types";

export default {
  slug: "gravity-forms",
  name: "Gravity Forms",
  nav: "Gravity Forms",
  summary: "Gravity-Forms-Einträge aus WordPress an AutoSEO senden und Leads der KI-Suche zuordnen.",
  meta: {
    title: "Gravity Forms: Attribution für die KI-Suche",
    description:
      "Gravity Forms per Webhooks Add-On mit AutoSEO verbinden, die Herkunftsfrage als channelId senden und sehen, welche WordPress-Leads aus der KI-Suche kommen.",
  },
  hero: {
    subtitle:
      "Senden Sie Einträge mit dem Gravity Forms Webhooks Add-On von Ihrer WordPress-Website an AutoSEO. Benennen Sie drei Felder im Request-Body – und jeder Eintrag kommt direkt im Format von AutoSEO an, ohne Zuordnungsschritt.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Gravity-Forms-Integration",
    items: [
      "Nutzt das Gravity Forms Webhooks Add-On – kein AutoSEO-Plugin für WordPress",
      "Senden Sie channelId, respondentEmail und pageUrl, und Einträge werden ohne Zuordnungsschritt gelesen",
      "Lieber alle Felder senden? AutoSEO erkennt Gravity-Forms-Einträge, und Sie ordnen sie einmal zu",
      "Die Einbettungs-URL des Formulars wird mit jeder Antwort gespeichert",
      "Funktioniert neben den WooCommerce-Bestell-Webhooks derselben WordPress-Website",
      "E-Mail-Adressen nur als SHA-256-Hash mit maskierter Vorschau",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Gravity Forms und AutoSEO",
    items: [
      {
        icon: "building",
        title: "B2B-Leads aus WordPress zuordnen",
        body: "Kontakt-, Angebots- und Demo-Formulare mit Gravity Forms melden, wie jeder Lead auf Sie aufmerksam wurde.",
      },
      {
        icon: "shopping-bag",
        title: "Mit WooCommerce-Bestellungen verbinden",
        body: "Verbinden Sie auch WooCommerce, und AutoSEO führt Formularantworten und bezahlte Bestellungen per E-Mail-Hash zusammen – inklusive Bestellwert.",
      },
      {
        icon: "map-pin",
        title: "Wissen, auf welcher Seite das Formular stand",
        body: "Die Einbettungs-URL zeigt, ob Leads aus der KI-Suche über eine Preisseite, eine Landingpage oder die Kontaktseite kommen.",
      },
      {
        icon: "sparkles",
        title: "Sehen, welcher Assistent den Lead brachte",
        body: "Antworten mit ChatGPT, Perplexity, Claude, Gemini oder Copilot werden je Assistent gezählt.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Gravity Forms in vier Schritten verbinden –",
    muted: "mit dem Webhooks Add-On.",
    items: [
      {
        title: "Webhook-URL erzeugen",
        body: "Öffnen Sie in Ihrem Projekt Attribution → Integrations → Gravity Forms und klicken Sie auf Connect. Kopieren Sie die URL – sie wird nur einmal angezeigt.",
      },
      {
        title: "Webhook-Feed anlegen",
        body: "Installieren Sie in WordPress das Gravity Forms Webhooks Add-On und öffnen Sie Ihr Formular → Settings → Webhooks → Add New.",
      },
      {
        title: "URL, Methode und Felder festlegen",
        body: "Request URL: Ihre Webhook-URL, Method: POST, Format: JSON. Wählen Sie unter Request Body „Select Fields“ und fügen Sie channelId (Ihre Frage), respondentEmail (das E-Mail-Feld) und pageUrl (die Embed URL) hinzu.",
      },
      {
        title: "Testeintrag absenden",
        body: "Füllen Sie das Formular einmal aus und prüfen Sie den Eintrag unter Webhook Logs. Nur wenn Sie stattdessen alle Felder senden, bestätigen Sie eine Zuordnung unter Field Mapping.",
      },
    ],
  },
  faq: [
    {
      q: "Wie sehe ich, welche Gravity-Forms-Leads aus der KI-Suche kommen?",
      a: "Fügen Sie Ihrem Formular das Feld „Wie sind Sie auf uns aufmerksam geworden?“ hinzu und senden Sie Einträge per Webhook-Feed aus dem Gravity Forms Webhooks Add-On an AutoSEO. Antworten mit ChatGPT, Perplexity oder einem anderen Assistenten zählen als KI-Suche – je Assistent.",
    },
    {
      q: "Brauche ich das Gravity Forms Webhooks Add-On?",
      a: "Ja. AutoSEO empfängt Einträge über den Webhook-Feed des Add-ons. Ein eigenes AutoSEO-Plugin müssen Sie in WordPress nicht installieren.",
    },
    {
      q: "Warum heißen die Felder channelId, respondentEmail und pageUrl?",
      a: "Das sind die Feldnamen des dokumentierten Webhook-Schemas von AutoSEO. Einträge mit diesen Namen werden sofort gelesen – der Zuordnungsschritt entfällt komplett.",
    },
    {
      q: "Kann ich Gravity Forms mit WooCommerce kombinieren?",
      a: "Ja. Verbinden Sie zusätzlich den Bestell-Webhook von WooCommerce. AutoSEO führt eine Formularantwort und eine bezahlte Bestellung mit derselben E-Mail-Adresse zusammen und nutzt den Bestellwert – ohne ihn doppelt zu zählen.",
    },
    {
      q: "Ist die Gravity-Forms-Integration kostenlos?",
      a: "Ja. Die Attribution und alle ihre Integrationen gehören zur Open-Source-App: kostenlos beim Self-Hosting oder enthalten in einem AutoSEO-Cloud-Workspace für 50\u00a0$ pro Monat. Antworten werden mit festen Regeln eingeordnet, nicht mit KI-Guthaben.",
    },
  ],
  cta: {
    title: "Sehen Sie, welche WordPress-Leads die KI-Suche bringt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
