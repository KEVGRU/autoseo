import type { IntegrationPage } from "../../types";

export default {
  slug: "fairing",
  name: "Fairing",
  nav: "Fairing",
  summary: "Fairing-Antworten nach dem Kauf mit Bestellwert importieren und KI-Umsatz sehen.",
  meta: {
    title: "Fairing-Attribution für die KI-Suche",
    description:
      "Importieren Sie Fairing-Antworten nach dem Kauf stündlich mit Bestellnummer und Betrag und sehen Sie, wie viel Umsatz Käufer der KI-Suche zuschreiben.",
  },
  hero: {
    subtitle:
      "Verbinden Sie Fairing mit einem API-Key. AutoSEO importiert jede Antwort auf „Wie sind Sie auf uns aufmerksam geworden?“ aus Ihrer Post-Purchase-Umfrage – mit Bestellnummer, Betrag und Währung – und summiert den Umsatz, den Käufer der KI-Suche zuschreiben.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Fairing-Integration",
    items: [
      "Stündlicher Import über die Fairing-API mit Ihrem API-Key, dazu Sync now",
      "Bestellnummer, Bestellsumme und Währung an jeder Antwort",
      "Nur Fragen im Stil von „Wie sind Sie auf uns aufmerksam geworden?“ – oder die Question-ID Ihrer Wahl",
      "Nachfragen zur Präzisierung werden übersprungen, „Sonstiges“-Antworten als Freitext übernommen",
      "UTM Source, UTM Medium, verweisende Website und Landingpage als Kontext",
      "CSV-Upload für ältere Exporte",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Fairing und AutoSEO",
    items: [
      {
        icon: "euro",
        title: "Umsatz aus der KI-Suche, Bestellung für Bestellung",
        body: "Jede Antwort kommt mit ihrer Bestellsumme – der Umsatz aus der KI-Suche summiert sich ohne zweite Bestellquelle.",
      },
      {
        icon: "sparkles",
        title: "Sehen, welcher Assistent den Käufer brachte",
        body: "Antworten wie „ChatGPT“ oder „auf Perplexity gesehen“ werden je Assistent gezählt – neben Suche, Social und Werbung.",
      },
      {
        icon: "eye",
        title: "Jede Antwort im Kontext lesen",
        body: "Öffnen Sie eine Antwort und sehen Sie die Bestellung, die Landingpage und die UTM-Parameter, die mitkamen.",
      },
      {
        icon: "trending-up",
        title: "Umsatz mit der AI Visibility abgleichen",
        body: "AutoSEO korreliert Ihre tägliche AI Visibility aus dem Tracker mit den Antworten „KI-Suche“ und dem Umsatz aus Ihrer Umfrage.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Fairing in drei Schritten verbinden –",
    muted: "mit einem API-Key.",
    items: [
      {
        title: "Fairing-API-Key kopieren",
        body: "Öffnen Sie in Fairing Settings → Integrations → API und kopieren Sie den API-Key.",
      },
      {
        title: "In AutoSEO verbinden",
        body: "Öffnen Sie Attribution → Integrations → Fairing, fügen Sie den Key ein, legen Sie optional eine Question-ID fest und klicken Sie auf Connect. Der erste Import umfasst die letzten 90 Tage.",
      },
      {
        title: "Synchron bleiben",
        body: "Neue Antworten kommen stündlich an. Mit Sync now aktualisieren Sie sofort, mit Import CSV übernehmen Sie ältere Exporte.",
      },
    ],
  },
  faq: [
    {
      q: "Wie messe ich mit Fairing den Umsatz aus der KI-Suche?",
      a: "Verbinden Sie Fairing mit Ihrem API-Key mit AutoSEO. AutoSEO importiert Ihre Antworten auf „Wie sind Sie auf uns aufmerksam geworden?“ samt Bestellsumme, zählt Antworten mit ChatGPT oder einem anderen Assistenten als KI-Suche und summiert den Umsatz je Kanal und Assistent.",
    },
    {
      q: "Welche Fairing-Fragen werden importiert?",
      a: "Standardmäßig jede Frage, die wie „Wie sind Sie auf uns aufmerksam geworden?“ oder „How did you hear about us?“ klingt. Legen Sie beim Verbinden eine Question-ID fest, um nur diese Frage zu importieren. Nachfragen zur Präzisierung werden übersprungen.",
    },
    {
      q: "Wird Umsatz doppelt gezählt, wenn auch meine Shopify-Bestellungen verbunden sind?",
      a: "Nein. Eine Bestellung wird genau einer Antwort zugeordnet – per Bestell-ID oder E-Mail-Hash –, und der Bestellwert wird nur übernommen, wenn die Antwort noch keinen hat.",
    },
    {
      q: "Wie weit reicht der Fairing-Import zurück?",
      a: "Die erste Synchronisierung holt Antworten der letzten 90 Tage. Danach werden stündlich nur neue Antworten abgerufen. Ältere Daten exportieren Sie in Fairing und laden die CSV-Datei hoch.",
    },
    {
      q: "Was speichert AutoSEO aus Fairing?",
      a: "Die Antwort und gegebenenfalls den „Sonstiges“-Text, Bestellnummer, Betrag und Währung, UTM Source und Medium, verweisende Website und Landingpage – und die E-Mail-Adresse der Käufer als SHA-256-Hash mit maskierter Vorschau. Ihr API-Key wird verschlüsselt gespeichert.",
    },
    {
      q: "Ist die Fairing-Integration kostenlos?",
      a: "Ja. Die Attribution und alle ihre Integrationen gehören zur Open-Source-App: kostenlos beim Self-Hosting oder enthalten in einem AutoSEO-Cloud-Workspace für 50\u00a0$ pro Monat. Antworten werden mit festen Regeln eingeordnet, nicht mit KI-Guthaben.",
    },
  ],
  cta: {
    title: "Beziffern Sie den Umsatz aus der KI-Suche",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
