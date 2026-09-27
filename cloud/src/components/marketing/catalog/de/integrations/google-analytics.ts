import type { IntegrationPage } from "../../types";

export default {
  slug: "google-analytics",
  name: "Google Analytics",
  nav: "Google Analytics",
  summary: "Sitzungen, Conversions und Umsatz aus KI-Plattformen in Ihren GA4-Daten sehen.",
  meta: {
    title: "Google Analytics: KI-Traffic in GA4 messen",
    description:
      "Verbinden Sie Google Analytics 4 mit AutoSEO und sehen Sie Sitzungen, Conversions und Umsatz aus ChatGPT, Perplexity, Gemini & Co. – täglich synchronisiert.",
  },
  hero: {
    subtitle:
      "Verbinden Sie GA4 mit Ihrem Google-Konto und sehen Sie, wie viele Besucher ChatGPT, Perplexity, Gemini, Claude und Copilot Ihnen schicken, wo sie landen und was daraus wird – täglich synchronisiert.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Google-Analytics-Integration",
    items: [
      "Anmeldung mit Google (OAuth) und reiner Lesezugriff auf Analytics",
      "Sitzungen, Sitzungen mit Interaktion, Schlüsselereignisse und Umsatz aus 19 KI-Plattformen",
      "Ein Flow von KI-Modell über Seite bis Ergebnis für jeden Assistenten",
      "Landingpages und Länder der Besucher aus KI-Plattformen",
      "Bis zu 16 Monate Historie beim ersten Sync, danach tägliche Updates",
      "Search Opportunities, die Rankings aus der Search Console mit GA4-Conversions verbinden",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Google Analytics und AutoSEO",
    items: [
      {
        icon: "chart",
        title: "Menschlichen Traffic aus KI messen",
        body: "Sehen Sie, welche KI-Assistenten Besucher schicken und wie sich dieser Traffic Tag für Tag oder Monat für Monat entwickelt.",
      },
      {
        icon: "file-text",
        title: "Die Seiten finden, auf die KI verweist",
        body: "Vergleichen Sie Landingpages nach Sitzungen, Conversions und Umsatz aus KI-Plattformen – und sehen Sie, welche Inhalte KI-Besuche in Ergebnisse verwandeln.",
      },
      {
        icon: "euro",
        title: "Umsatz neben die Attribution stellen",
        body: "Der GA4-Umsatz aus Sitzungen von KI-Plattformen erscheint in Attribution neben den Deal-Werten, die Käufer der KI-Suche zuschreiben.",
      },
      {
        icon: "gauge",
        title: "Die Messung überprüfen",
        body: "Der Check zur GA4-Messqualität zeigt, ob Conversions aus Sitzungen von KI-Plattformen korrekt gemessen werden können.",
      },
      {
        icon: "trending-up",
        title: "Seiten knapp vor der Spitze priorisieren",
        body: "Mit verbundener Search Console werden Seiten auf Position 4–20 nach Nachfrage, Geschäftswert aus GA4 und Abstand zur Spitze bewertet.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Google Analytics in vier Schritten verbinden –",
    muted: "mit Lesezugriff per OAuth.",
    items: [
      {
        title: "Einstellungen von Human Traffic öffnen",
        body: "Öffnen Sie in Ihrem Projekt Analytics → Human Traffic → Settings oder Integrations → Google Analytics.",
      },
      {
        title: "Mit Google anmelden",
        body: "Erteilen Sie Lesezugriff auf Google Analytics. Im selben Schritt wird auch Lesezugriff auf die Search Console angefragt, sodass beide dasselbe Google-Konto nutzen können.",
      },
      {
        title: "GA4-Property auswählen",
        body: "Wählen Sie das Google-Konto und die GA4-Property, die die Website dieses Projekts misst. AutoSEO übernimmt deren Zeitzone und Währung.",
      },
      {
        title: "Ersten Sync abwarten",
        body: "AutoSEO importiert im Hintergrund bis zu 16 Monate Traffic aus KI-Plattformen und synchronisiert danach täglich.",
      },
    ],
  },
  faq: [
    {
      q: "Wie tracke ich ChatGPT-Traffic in Google Analytics?",
      a: "Verbinden Sie GA4 mit AutoSEO. Es liest Sitzungen nach Quelle über die GA4 Data API und erkennt Besuche von chatgpt.com und anderen KI-Plattformen – auch utm_source-Werte wie chatgpt. Eigene Channel-Gruppen müssen Sie dafür nicht anlegen.",
    },
    {
      q: "Welche KI-Plattformen erkennt AutoSEO in GA4?",
      a: "19 Plattformen, darunter ChatGPT, Perplexity, Google Gemini, Claude, Copilot, Meta AI, DeepSeek, Grok, Mistral Le Chat, You.com und Kagi Assistant. Jede wird separat ausgewiesen, mit ihren Landingpages und Conversions.",
    },
    {
      q: "Welchen Zugriff braucht AutoSEO auf Google Analytics?",
      a: "Nur Lesezugriff über den Google-Scope analytics.readonly – AutoSEO kann Ihre GA4-Einrichtung also nicht verändern. Tokens werden verschlüsselt in der Datenbank von AutoSEO gespeichert, und beim Trennen werden die Verbindung und alle importierten Daten des Projekts entfernt.",
    },
    {
      q: "Wie oft werden die Daten aus Google Analytics synchronisiert?",
      a: "Täglich. Der erste Sync importiert bis zu 16 Monate Historie, und in den Einstellungen können Sie jederzeit einen Sync manuell starten.",
    },
    {
      q: "Funktioniert AutoSEO mit Universal Analytics?",
      a: "Nein. AutoSEO nutzt die GA4 Data API und funktioniert deshalb nur mit Properties von Google Analytics 4.",
    },
    {
      q: "Brauche ich für das Self-Hosting einen Google-OAuth-Client?",
      a: "Ja. Auf einer selbst gehosteten Instanz hinterlegt ein Admin einmalig einen Google-OAuth-Client unter Admin → Data Providers; danach kann jeder Nutzer sein Google-Konto verbinden. In AutoSEO Cloud verwaltet das Codext-Team den OAuth-Client zentral für die gemeinsame App – Workspace-Owner hinterlegen keinen eigenen.",
    },
  ],
  cta: {
    title: "Sehen Sie, was KI-Traffic wert ist",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
