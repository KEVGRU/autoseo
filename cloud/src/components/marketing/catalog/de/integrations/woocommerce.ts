import type { IntegrationPage } from "../../types";

export default {
  slug: "woocommerce",
  name: "WooCommerce",
  nav: "WooCommerce",
  summary: "Bezahlte WooCommerce-Bestellungen und Checkout-Antworten per signiertem Webhook zuordnen.",
  meta: {
    title: "WooCommerce-Bestellungen der KI-Suche zuordnen",
    description:
      "Ordnen Sie WooCommerce-Bestellungen ChatGPT, Perplexity und anderen KI-Assistenten zu: Signierte Webhooks senden bezahlte Bestellungen samt Checkout-Frage.",
  },
  hero: {
    subtitle:
      "Richten Sie einen nativen WooCommerce-Webhook ein, und AutoSEO speichert jede bezahlte Bestellung mit Wert, Währung und Positionen – und übernimmt die Antwort auf „Wie sind Sie auf uns aufmerksam geworden?“, wenn Ihr Checkout danach fragt.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der WooCommerce-Integration",
    items: [
      "Die integrierten Webhooks von WooCommerce – kein AutoSEO-Plugin nötig",
      "Jede Zustellung per gemeinsamem Secret geprüft (HMAC-Signatur)",
      "Nur bezahlte Bestellungen mit dem Status processing, completed oder on-hold",
      "Bestellnummer, Summe, Währung, Rechnungs-E-Mail und bis zu 50 Positionen",
      "Ein Checkout-Feld „Wie sind Sie auf uns aufmerksam geworden?“ in den Bestell-Metadaten wird als Antwort gespeichert",
      "Bestellungen werden Website-Antworten per Bestellnummer oder E-Mail-Hash zugeordnet, bis zu 90 Tage rückwirkend",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit WooCommerce und AutoSEO",
    items: [
      {
        icon: "store",
        title: "Umsatz je Kanal für Ihren Shop",
        body: "Sehen Sie, welchen Bestellwert Kunden der KI-Suche zuschreiben – neben Suche, Social, Werbung, Empfehlungen und Content.",
      },
      {
        icon: "message-square",
        title: "Ihre Checkout-Frage weiter nutzen",
        body: "Fragt Ihr Checkout bereits, wie Kunden Sie gefunden haben, kommt die Antwort mit der Bestellung – ganz ohne Pop-up.",
      },
      {
        icon: "sparkles",
        title: "Umsatz je Assistent aufteilen",
        body: "Wer „KI-Suche“ antwortet, kann ChatGPT, Perplexity, Claude, Gemini oder Copilot nennen – so sehen Sie, welcher Assistent verkauft hat.",
      },
      {
        icon: "list-checks",
        title: "Sehen, was gekauft wurde",
        body: "Positionen werden mit jeder Bestellung gespeichert, sodass jede zugeordnete Antwort die Produkte hinter dem Umsatz zeigt.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "WooCommerce in vier Schritten verbinden –",
    muted: "per nativem Webhook.",
    items: [
      {
        title: "URL und Secret erzeugen",
        body: "Öffnen Sie in Ihrem Projekt Attribution → Integrations → WooCommerce und klicken Sie auf Connect. Kopieren Sie Webhook-URL und Secret – beide werden nur einmal angezeigt.",
      },
      {
        title: "Webhook in WooCommerce anlegen",
        body: "Öffnen Sie in WordPress WooCommerce → Settings → Advanced → Webhooks → Add webhook. Setzen Sie den Status auf Active und das Topic auf „Order updated“; bei Bedarf legen Sie einen zweiten für „Order created“ an.",
      },
      {
        title: "URL und Secret eintragen",
        body: "Tragen Sie die AutoSEO-URL als Delivery URL ein, fügen Sie das Secret ein, behalten Sie die API-Version WP REST API Integration v3 bei und speichern Sie.",
      },
      {
        title: "Testbestellung aufgeben",
        body: "Sobald die Bestellung bezahlt ist, erscheint sie unter Webhook Logs und wird mit der Umfrageantwort des Käufers zusammengeführt.",
      },
    ],
  },
  faq: [
    {
      q: "Wie tracke ich WooCommerce-Verkäufe aus ChatGPT?",
      a: "Verbinden Sie WooCommerce per nativem Bestell-Webhook und binden Sie das AutoSEO-Snippet in Ihrem Shop ein, damit Käufer „Wie sind Sie auf uns aufmerksam geworden?“ beantworten können. AutoSEO ordnet jede bezahlte Bestellung der Antwort zu und weist Umsatz aus ChatGPT und anderen Assistenten als KI-Suche aus.",
    },
    {
      q: "Brauche ich ein WordPress-Plugin?",
      a: "Nicht für die Bestellungen: Die integrierten Webhooks von WooCommerce senden sie. Für die Umfrage binden Sie das AutoSEO-Snippet im Head Ihrer Website ein – etwa mit einem Header-Plugin wie WPCode oder in der header.php Ihres Child-Themes.",
    },
    {
      q: "Welche WooCommerce-Bestellungen werden gezählt?",
      a: "Bestellungen mit dem Status processing, completed oder on-hold. Ausstehende, fehlgeschlagene oder stornierte Bestellungen werden übersprungen, bis sie bezahlt sind, und eine mehrfach aktualisierte Bestellung wird über ihre Bestellnummer nur einmal gespeichert.",
    },
    {
      q: "Kann AutoSEO unser eigenes Checkout-Feld lesen?",
      a: "Ja. Enthalten die Bestell-Metadaten ein Feld, dessen Schlüssel nach „Wie sind Sie auf uns aufmerksam geworden?“ aussieht – etwa hdyhau oder hear_about –, wird sein Wert mit der Bestellung als Antwort gespeichert. Hat der Käufer schon die Website-Umfrage beantwortet, wird die Bestellung stattdessen mit dieser Antwort verknüpft.",
    },
    {
      q: "Was, wenn das Website-Snippet denselben Kauf meldet?",
      a: "Die Bestellung wird nur einmal gespeichert. Conversions werden über die Bestellnummer dedupliziert, und die Werte aus dem signierten Webhook haben Vorrang vor Kauf-Events, die der Browser meldet.",
    },
    {
      q: "Wie ist der WooCommerce-Webhook abgesichert?",
      a: "WooCommerce signiert jede Zustellung mit Ihrem Secret, und AutoSEO lehnt alles mit fehlender oder falscher Signatur ab. Das Token der URL wird nur als Hash gespeichert, Rechnungs-E-Mails als Hash mit maskierter Vorschau.",
    },
    {
      q: "Ist die WooCommerce-Integration im Preis enthalten?",
      a: "Ja. Attribution und alle Integrationen sind Teil der Open-Source-App: kostenlos beim Self-Hosting oder in einem AutoSEO-Cloud-Workspace für 50\u00a0$ im Monat enthalten, inklusive 10\u00a0$ KI- und Datennutzung.",
    },
  ],
  cta: {
    title: "Geben Sie der KI-Suche eine Umsatzzahl",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
