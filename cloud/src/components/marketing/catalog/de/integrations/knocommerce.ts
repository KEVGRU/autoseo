import type { IntegrationPage } from "../../types";

export default {
  slug: "knocommerce",
  name: "KnoCommerce",
  nav: "KnoCommerce",
  summary: "KnoCommerce-Antworten mit Bestelldaten importieren und Umsatz der KI-Suche zuordnen.",
  meta: {
    title: "KnoCommerce-Attribution für die KI-Suche",
    description:
      "Importieren Sie abgeschlossene KnoCommerce-Umfragen stündlich mit Bestellname, Betrag und Währung und sehen Sie den Umsatz, den Käufer der KI-Suche zuschreiben.",
  },
  hero: {
    subtitle:
      "Legen Sie in KnoCommerce API-Zugangsdaten an und verbinden Sie sie mit AutoSEO. Abgeschlossene Umfrageantworten kommen stündlich mit ihren Bestelldaten an, und Antworten mit ChatGPT, Perplexity oder einem anderen Assistenten zählen als KI-Suche.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der KnoCommerce-Integration",
    items: [
      "Anbindung mit Client-ID und Client-Secret von KnoCommerce (Scope RESPONSES)",
      "Abgeschlossene Antworten werden stündlich importiert, dazu Sync now",
      "Bestellname oder -nummer, Betrag und Währung an jeder Antwort",
      "Die Herkunftsfrage wird an ihrem Label erkannt – oder Sie legen die Question-ID fest",
      "„Sonstiges“-Antworten werden als Freitext übernommen und ebenfalls eingeordnet",
      "CSV-Upload, wenn Ihr Kno-Tarif keinen API-Zugang enthält",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit KnoCommerce und AutoSEO",
    items: [
      {
        icon: "euro",
        title: "Umsatz allein aus der Umfrage zuordnen",
        body: "Jede Antwort trägt ihre Bestellsumme – AutoSEO summiert den Umsatz aus der KI-Suche, noch bevor Sie eine Bestellquelle verbinden.",
      },
      {
        icon: "sparkles",
        title: "Käufer je Assistent zählen",
        body: "ChatGPT, Perplexity, Claude, Gemini, Copilot und weitere erhalten innerhalb der KI-Suche jeweils eine eigene Zählung.",
      },
      {
        icon: "chart",
        title: "Mit dem KI-Traffic aus GA4 vergleichen",
        body: "Verbinden Sie zusätzlich Google Analytics, und der umfragebasierte KI-Umsatz erscheint neben dem Umsatz aus KI-Referral-Sitzungen.",
      },
      {
        icon: "shopping-bag",
        title: "Mit Ihren Bestelldaten zusammenführen",
        body: "Bestellungen aus Shopify, WooCommerce, Shopware oder Stripe werden per Bestell-ID oder E-Mail-Hash den Antworten zugeordnet – jeder Wert zählt einmal.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "KnoCommerce in drei Schritten verbinden –",
    muted: "mit API-Zugangsdaten.",
    items: [
      {
        title: "API-Zugangsdaten anlegen",
        body: "Öffnen Sie in KnoCommerce Settings → API und legen Sie Client-ID und Client-Secret mit dem Scope RESPONSES an. Der API-Zugang hängt von Ihrem Kno-Tarif ab.",
      },
      {
        title: "In AutoSEO verbinden",
        body: "Öffnen Sie Attribution → Integrations → KnoCommerce, fügen Sie Client-ID und Secret ein und klicken Sie auf Connect. AutoSEO holt ein Access Token und startet den ersten Import.",
      },
      {
        title: "Synchronisieren lassen",
        body: "Abgeschlossene Antworten kommen stündlich an. Ohne API-Zugang exportieren Sie Antworten als CSV und laden sie stattdessen mit Import CSV hoch.",
      },
    ],
  },
  faq: [
    {
      q: "Wie verbinde ich KnoCommerce mit AutoSEO?",
      a: "Legen Sie in KnoCommerce unter Settings → API Zugangsdaten mit dem Scope RESPONSES an und fügen Sie Client-ID und Secret unter Attribution → Integrations → KnoCommerce ein. AutoSEO importiert abgeschlossene Antworten stündlich und ordnet ihren Bestellwert dem Kanal zu, den die Käufer genannt haben.",
    },
    {
      q: "Welchen KnoCommerce-Tarif brauche ich?",
      a: "Einen mit API-Zugang, denn AutoSEO liest Antworten über die KnoCommerce-API. Ist er in Ihrem Tarif nicht enthalten, exportieren Sie Antworten als CSV und nutzen Import CSV in AutoSEO.",
    },
    {
      q: "Welche KnoCommerce-Antworten werden importiert?",
      a: "Beim ersten Abgleich abgeschlossene Antworten der letzten 90 Tage, danach stündlich die neuen. AutoSEO übernimmt die Antwort auf die Frage, deren Label wie „Wie sind Sie auf uns aufmerksam geworden?“ klingt – oder auf die Question-ID, die Sie festlegen.",
    },
    {
      q: "Wie werden KnoCommerce-Antworten Bestellungen zugeordnet?",
      a: "Jede Antwort bringt Bestellname oder -nummer und Betrag mit, der Umsatz wird also direkt zugeordnet. Kommen Bestellungen auch aus Shopify, WooCommerce, Shopware oder Stripe, führt AutoSEO sie per Bestell-ID oder E-Mail-Hash zusammen und zählt jeden Wert einmal.",
    },
    {
      q: "Wo werden meine KnoCommerce-Zugangsdaten gespeichert?",
      a: "Mit AES-256-GCM verschlüsselt in der Datenbank von AutoSEO. Sie dienen nur dazu, ein Access Token anzufordern und Ihre Umfrageantworten zu lesen.",
    },
    {
      q: "Ist die KnoCommerce-Integration kostenlos?",
      a: "Ja. Die Attribution und alle ihre Integrationen gehören zur Open-Source-App: kostenlos beim Self-Hosting oder enthalten in einem AutoSEO-Cloud-Workspace für 50\u00a0$ pro Monat. Antworten werden mit festen Regeln eingeordnet, nicht mit KI-Guthaben.",
    },
  ],
  cta: {
    title: "Sehen Sie den Umsatz, den Käufer der KI-Suche zuschreiben",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
