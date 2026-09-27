import type { IntegrationPage } from "../../types";

export default {
  slug: "zigpoll",
  name: "Zigpoll",
  nav: "Zigpoll",
  summary: "Zigpoll-Antworten mit Bestellwert und Seitenkontext importieren und der KI-Suche zuordnen.",
  meta: {
    title: "Zigpoll-Attribution für die KI-Suche",
    description:
      "Importieren Sie Zigpoll-Antworten stündlich – mit Bestellwert, Seiten-URL und Referrer – und sehen Sie, welche Käufer über die KI-Suche zu Ihnen kamen.",
  },
  hero: {
    subtitle:
      "Verbinden Sie Zigpoll mit einem API-Key und der ID Ihrer Frage „Wie sind Sie auf uns aufmerksam geworden?“. AutoSEO importiert Antworten stündlich mit Bestellwert, Seiten-URL, UTM-Parametern und ursprünglichem Referrer und ordnet sie der KI-Suche und Ihren anderen Kanälen zu.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Zigpoll-Integration",
    items: [
      "Stündlicher Import über die Zigpoll-API, dazu Sync now",
      "Import auf eine Frage (Slide), eine ganze Umfrage oder Ihr Konto begrenzen",
      "Bestellwert sowie Bestellnummer oder Shopify-Order-ID aus den Metadaten der Antwort",
      "Seiten-URL, UTM Source und Medium sowie ursprünglicher Referrer als Kontext",
      "Offene Antworten werden anhand ihres Freitexts eingeordnet",
      "CSV-Upload für exportierte Antworten",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Zigpoll und AutoSEO",
    items: [
      {
        icon: "store",
        title: "On-Site- und Danke-Seiten-Umfragen zuordnen",
        body: "Wo immer Ihre Umfrage läuft: Antworten mit Bestelldaten bringen ihren Wert mit in AutoSEO.",
      },
      {
        icon: "sparkles",
        title: "Käufer je Assistent zählen",
        body: "Antworten mit ChatGPT, Perplexity, Claude, Gemini oder Copilot werden innerhalb der KI-Suche je Assistent gezählt.",
      },
      {
        icon: "search",
        title: "Antworten mit Referrern vergleichen",
        body: "Ursprünglicher Referrer und UTM-Parameter stehen neben jeder Antwort – so sehen Sie, was Käufer sagen und woher Analytics sie vermutet.",
      },
      {
        icon: "euro",
        title: "Mit Ihren Bestellungen zusammenführen",
        body: "Bestellungen aus Shopify, WooCommerce, Shopware oder Stripe werden per Bestell-ID oder E-Mail-Hash den Umfrageantworten zugeordnet – jeder Wert zählt einmal.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Zigpoll in drei Schritten verbinden –",
    muted: "mit einem API-Key.",
    items: [
      {
        title: "API-Key kopieren",
        body: "Öffnen Sie in Zigpoll Settings → API key und kopieren Sie den Key. Der API-Zugang setzt den Premium-Tarif von Zigpoll voraus.",
      },
      {
        title: "Question-ID finden",
        body: "Kopieren Sie die ID Ihrer Frage „Wie sind Sie auf uns aufmerksam geworden?“ (Slide). Eine Poll-ID oder Account-ID funktioniert auch, importiert aber jede Frage darin.",
      },
      {
        title: "In AutoSEO verbinden",
        body: "Öffnen Sie Attribution → Integrations → Zigpoll, fügen Sie Key und ID ein und klicken Sie auf Connect. Der erste Import umfasst die letzten 90 Tage, danach kommen neue Antworten stündlich.",
      },
    ],
  },
  faq: [
    {
      q: "Wie verbinde ich Zigpoll mit AutoSEO?",
      a: "Kopieren Sie Ihren API-Key aus den Zigpoll-Einstellungen und die ID Ihrer Frage „Wie sind Sie auf uns aufmerksam geworden?“ und verbinden Sie beides unter Attribution → Integrations → Zigpoll. AutoSEO importiert Antworten stündlich und ordnet sie der KI-Suche und Ihren anderen Kanälen zu.",
    },
    {
      q: "Warum sollte ich die Question-ID (Slide) festlegen?",
      a: "Mit einer Slide-ID importiert AutoSEO nur die Antworten dieser Frage. Mit einer Poll- oder Account-ID wird jede Antwort im gewählten Bereich importiert – Antworten auf andere Fragen landen dann ebenfalls in Ihren Attributionsdaten.",
    },
    {
      q: "Welchen Zigpoll-Tarif brauche ich?",
      a: "Der API-Zugang setzt den Premium-Tarif von Zigpoll voraus. Ohne ihn exportieren Sie Ihre Antworten als CSV und laden sie mit Import CSV in AutoSEO hoch.",
    },
    {
      q: "Wie werden Zigpoll-Antworten Bestellungen zugeordnet?",
      a: "Enthalten die Metadaten einer Antwort eine Bestellnummer oder Shopify-Order-ID, nutzt AutoSEO sie als Bestellschlüssel – zusammen mit dem Bestellwert. Bestellungen aus Ihren anderen Quellen werden per Bestell-ID oder E-Mail-Hash zusammengeführt, und jeder Wert zählt einmal.",
    },
    {
      q: "Ist die Zigpoll-Integration kostenlos?",
      a: "Ja. Die Attribution und alle ihre Integrationen gehören zur Open-Source-App: kostenlos beim Self-Hosting oder enthalten in einem AutoSEO-Cloud-Workspace für 50\u00a0$ pro Monat. Antworten werden mit festen Regeln eingeordnet, nicht mit KI-Guthaben.",
    },
  ],
  cta: {
    title: "Sehen Sie, welche Käufer die KI-Suche bringt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
