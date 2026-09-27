import type { IntegrationPage } from "../../types";

export default {
  slug: "shopify",
  name: "Shopify",
  nav: "Shopify",
  summary: "Shopify-Bestellungen und Umsatz per Custom Pixel der KI-Suche zuordnen.",
  meta: {
    title: "Shopify: Bestellungen aus der KI-Suche messen",
    description:
      "Ordnen Sie Shopify-Bestellungen und Umsatz ChatGPT, Perplexity und anderen KI-Assistenten zu – mit Custom Pixel und Umfrage, ganz ohne Shopify-App.",
  },
  hero: {
    subtitle:
      "Fügen Sie ein Shopify Custom Pixel und das Umfrage-Snippet von AutoSEO hinzu und sehen Sie, welche Bestellungen von ChatGPT, Perplexity und anderen KI-Assistenten kamen – mit Bestellwert und Währung, ganz ohne App-Installation.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Shopify-Integration",
    items: [
      "Ein Custom Pixel, das jeden abgeschlossenen Checkout meldet: Bestell-ID, Wert, Währung und Positionen",
      "E-Mail-Adressen werden im Browser per SHA-256 gehasht – die Klartext-Adresse wird nie übertragen",
      "Eine Umfrage „Wie sind Sie auf uns aufmerksam geworden?“ in Ihrem Shop mit ChatGPT, Perplexity, Claude, Gemini und Copilot als Antworten",
      "Bestellungen werden per Bestell-ID, E-Mail-Hash oder Browser den Umfrageantworten zugeordnet",
      "Umsatz aus der KI-Suche im Vergleich zu Suche, Social, Werbung, Empfehlung und Content",
      "Das Veröffentlichen von Blogartikeln in Shopify folgt in Kürze",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Shopify und AutoSEO",
    items: [
      {
        icon: "euro",
        title: "Umsatz aus der KI-Suche belegen",
        body: "Sehen Sie, welchen Bestellwert Käufer in einem Zeitraum der KI-Suche zuschreiben, und vergleichen Sie ihn mit allen anderen Kanälen.",
      },
      {
        icon: "sparkles",
        title: "Wissen, welcher Assistent den Kauf ausgelöst hat",
        body: "Wer „KI-Suche“ angibt, kann ChatGPT, Perplexity, Claude, Gemini oder Copilot nennen – so sehen Sie, welche Assistenten zu Bestellungen führen.",
      },
      {
        icon: "target",
        title: "GEO-Arbeit mit Bestellungen untermauern",
        body: "Zeigen Sie Stakeholdern den Umsatz, der der KI-Suche zugeordnet ist, neben Ihren AI-Visibility-Kennzahlen im selben Projekt.",
      },
      {
        icon: "chart",
        title: "Mit KI-Traffic aus GA4 vergleichen",
        body: "Verbinden Sie zusätzlich Google Analytics, und der Umsatz aus Sitzungen von KI-Plattformen erscheint neben den Umfragewerten.",
      },
      {
        icon: "lock",
        title: "Kundendaten minimal halten",
        body: "Das Pixel überträgt keine E-Mail im Klartext, und die Umfrage merkt sich bereits gegebene Antworten im Local Storage statt in Cookies.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Shopify in vier Schritten verbinden –",
    muted: "ohne App-Installation.",
    items: [
      {
        title: "Shopify-Einrichtung in AutoSEO öffnen",
        body: "Öffnen Sie in Ihrem Projekt Attribution → Integrations → Shopify. AutoSEO zeigt den Code für das Custom Pixel und das Snippet für Ihren Shop.",
      },
      {
        title: "Custom Pixel hinzufügen",
        body: "Öffnen Sie im Shopify-Admin Einstellungen → Kundenereignisse → Benutzerdefiniertes Pixel hinzufügen, fügen Sie den Code ein, wählen Sie die Berechtigungen laut Einrichtungsanleitung und speichern Sie.",
      },
      {
        title: "Umfrage-Snippet ins Theme einfügen",
        body: "Fügen Sie das Snippet in theme.liquid vor </head> ein (Onlineshop → Themes → Code bearbeiten), damit Besucher die Frage „Wie sind Sie auf uns aufmerksam geworden?“ beantworten können.",
      },
      {
        title: "Testbestellung aufgeben",
        body: "Der Checkout erscheint innerhalb von Sekunden unter Webhook Logs. Ab dann werden Bestellungen und Umfrageantworten automatisch zusammengeführt.",
      },
    ],
  },
  faq: [
    {
      q: "Wie messe ich Shopify-Umsätze aus ChatGPT?",
      a: "Installieren Sie das Custom Pixel von AutoSEO unter Einstellungen → Kundenereignisse und fügen Sie das Umfrage-Snippet in Ihr Theme ein. Das Pixel meldet jeden abgeschlossenen Checkout, die Umfrage fragt Käufer, wie sie Sie gefunden haben, und AutoSEO führt beides zusammen – so erscheinen Bestellungen aus ChatGPT und anderen KI-Assistenten samt Umsatz.",
    },
    {
      q: "Muss ich eine Shopify-App installieren?",
      a: "Nein. Die Integration nutzt die integrierten Custom Pixels von Shopify und ein Snippet in Ihrem Theme. Es gibt keine App zu installieren und keinen Zugriff auf die Shopify API freizugeben.",
    },
    {
      q: "Welche Daten überträgt das Shopify-Pixel?",
      a: "Bestell-ID, Bestellwert, Währung, Positionen (Name, Menge, Preis, SKU) sowie einen SHA-256-Hash der E-Mail-Adresse mit maskierter Vorschau. Die E-Mail-Adresse im Klartext verlässt nie den Browser.",
    },
    {
      q: "Woher weiß AutoSEO, dass eine Bestellung aus der KI-Suche kam?",
      a: "Aus der Antwort des Käufers auf „Wie sind Sie auf uns aufmerksam geworden?“. AutoSEO ordnet die Antwort der Bestellung per Bestell-ID, E-Mail-Hash oder demselben Browser zu und schaut dabei bis zu 90 Tage zurück. Freitext-Antworten wie „ChatGPT“ zählen als KI-Suche.",
    },
    {
      q: "Kann AutoSEO Blogartikel in Shopify veröffentlichen?",
      a: "Noch nicht – das Veröffentlichen optimierter Artikel in einem Shopify-Blog folgt in Kürze. Schon heute können Sie Content-Entwürfe in WordPress oder Webflow veröffentlichen oder als HTML bzw. Markdown exportieren.",
    },
    {
      q: "Ist die Shopify-Integration im Preis enthalten?",
      a: "Ja. Attribution und alle Integrationen sind Teil der Open-Source-App: kostenlos beim Self-Hosting oder in einem AutoSEO-Cloud-Workspace für 50\u00a0$ im Monat enthalten, inklusive 10\u00a0$ KI- und Datennutzung.",
    },
  ],
  cta: {
    title: "Sehen Sie, welche Bestellungen die KI-Suche bringt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
