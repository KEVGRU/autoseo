import type { IntegrationPage } from "../../types";

export default {
  slug: "shopware",
  name: "Shopware",
  nav: "Shopware",
  summary: "Aufgegebene Shopware-6-Bestellungen an AutoSEO senden und der KI-Suche zuordnen.",
  meta: {
    title: "Shopware-Bestellungen der KI-Suche zuordnen",
    description:
      "Ordnen Sie Shopware-6-Bestellungen ChatGPT, Perplexity und anderen KI-Assistenten zu: Ein Flow-Builder-Webhook sendet jede Bestellung an AutoSEO.",
  },
  hero: {
    subtitle:
      "Fügen Sie einem Flow im Shopware Flow Builder die Aktion „Call webhook“ hinzu, und jede aufgegebene Bestellung erreicht AutoSEO mit Bestellnummer, Summe, Währung und Kunden-E-Mail – zusammengeführt mit der Antwort, die der Käufer in Ihrer Storefront gegeben hat.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Shopware-Integration",
    items: [
      "Ein Flow im Flow Builder auf „Checkout / Order / Placed“ – kein Shopware-Plugin von AutoSEO",
      "Bestellnummer, Gesamtbetrag, Währung und Kunden-E-Mail in einem kurzen JSON-Body",
      "Der Body folgt dem AutoSEO-Schema, Bestellungen werden also ohne Field Mapping gelesen",
      "Die AutoSEO-Umfrage in Ihrer Storefront fragt „Wie sind Sie auf uns aufmerksam geworden?“",
      "Bestellungen werden Antworten per Bestellnummer oder E-Mail-Hash zugeordnet, bis zu 90 Tage rückwirkend",
      "Kunden-E-Mails werden beim Eingang gehasht und nur als maskierte Vorschau angezeigt",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Shopware und AutoSEO",
    items: [
      {
        icon: "store",
        title: "Umsatz aus der KI-Suche für Ihren Shop",
        body: "Sehen Sie, welchen Bestellwert Käufer der KI-Suche zuschreiben – neben Suche, Social, Werbung, Empfehlungen und Content.",
      },
      {
        icon: "message-square",
        title: "Direkt nach dem Checkout fragen",
        body: "Löst Ihre Storefront ein Kauf-Event von GA4, Google Ads oder Meta Pixel aus, kann sich die Umfrage direkt nach dem Checkout öffnen und die Transaktions-ID dieses Kaufs mit der Antwort senden.",
      },
      {
        icon: "sparkles",
        title: "Wissen, welcher Assistent verkauft hat",
        body: "Wer „KI-Suche“ wählt, kann ChatGPT, Perplexity, Claude, Gemini oder Copilot nennen – so teilt sich der Umsatz je Assistent auf.",
      },
      {
        icon: "target",
        title: "Ihre GEO-Arbeit mit Bestellungen belegen",
        body: "Zeigen Sie zugeordneten Umsatz neben Ihren AI-Visibility-Kennzahlen im selben AutoSEO-Projekt.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Shopware in fünf Schritten verbinden –",
    muted: "per Flow-Builder-Webhook.",
    items: [
      {
        title: "Webhook-URL erzeugen",
        body: "Öffnen Sie in Ihrem Projekt Attribution → Integrations → Shopware und klicken Sie auf Connect. Kopieren Sie die Webhook-URL – sie wird nur einmal angezeigt.",
      },
      {
        title: "Flow anlegen",
        body: "Öffnen Sie in der Shopware-Administration Settings → Flow Builder → Add flow und wählen Sie den Trigger „Checkout / Order / Placed“.",
      },
      {
        title: "Aktion „Call webhook“ hinzufügen",
        body: "Methode POST, Ihre Webhook-URL, Content-Type JSON und der Body aus der Anleitung mit Bestellnummer, Summe, ISO-Währungscode und Kunden-E-Mail.",
      },
      {
        title: "Umfrage-Snippet einbinden",
        body: "Binden Sie das AutoSEO-Snippet in der base.html.twig Ihres Themes ein (Block layout_head_javascript_tracking) oder laden Sie es über einen Tag Manager.",
      },
      {
        title: "Testbestellung aufgeben",
        body: "Speichern Sie den Flow, geben Sie eine Bestellung auf und prüfen Sie sie unter Webhook Logs. Danach werden Bestellungen und Antworten automatisch zusammengeführt.",
      },
    ],
  },
  faq: [
    {
      q: "Wie tracke ich Shopware-Bestellungen aus ChatGPT?",
      a: "Senden Sie aufgegebene Bestellungen per Flow-Builder-Aktion „Call webhook“ an AutoSEO und binden Sie das AutoSEO-Umfrage-Snippet in Ihrer Storefront ein. AutoSEO ordnet jede Bestellung der Antwort des Käufers zu und weist Umsatz aus ChatGPT und anderen Assistenten als KI-Suche aus.",
    },
    {
      q: "Welche Shopware-Versionen werden unterstützt?",
      a: "Die Einrichtung ist für Shopware 6 und dessen Flow Builder gebaut. Bietet Ihre Edition die Aktion „Call webhook“ nicht, senden Sie dasselbe JSON über Zapier, Make, n8n oder eine eigene Integration an dieselbe URL.",
    },
    {
      q: "Welche Daten sendet der Shopware-Webhook?",
      a: "Nur das, was Sie in den Body schreiben. Die Anleitung nutzt Bestellnummer, Gesamtbetrag, ISO-Währungscode und Kunden-E-Mail; die E-Mail wird beim Eingang gehasht und nur als maskierte Vorschau angezeigt.",
    },
    {
      q: "Wie werden Shopware-Bestellungen Umfrageantworten zugeordnet?",
      a: "Per Bestellnummer, wenn die Antwort dieselbe Transaktions-ID trägt, sonst über den Hash der E-Mail-Adresse, die der Käufer in ein Formular auf Ihrer Website eingegeben hat. AutoSEO schaut bis zu 90 Tage nach einer offenen Antwort zurück und verknüpft jede Bestellung mit höchstens einer Antwort.",
    },
    {
      q: "Werden Stornierungen oder Erstattungen synchronisiert?",
      a: "Nein. Der Flow meldet jede Bestellung beim Aufgeben, spätere Statusänderungen erreichen AutoSEO nicht. Der zugeordnete Umsatz spiegelt also aufgegebene Bestellungen wider.",
    },
    {
      q: "Ist die Shopware-Integration im Preis enthalten?",
      a: "Ja. Attribution und alle Integrationen sind Teil der Open-Source-App: kostenlos beim Self-Hosting oder in einem AutoSEO-Cloud-Workspace für 50\u00a0$ im Monat enthalten, inklusive 10\u00a0$ KI- und Datennutzung.",
    },
  ],
  cta: {
    title: "Finden Sie heraus, welche Bestellungen die KI-Suche bringt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
