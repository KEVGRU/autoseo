import type { IntegrationCategoryPage } from "../../types";

export default {
  slug: "analytics",
  nav: "Analytics-Integrationen",
  summary: "Besuche, Conversions und Umsatz aus KI-Plattformen in GA4, Matomo oder Piwik PRO messen.",
  meta: {
    title: "KI-Traffic in GA4, Matomo & Piwik PRO messen",
    description:
      "KI-Traffic in GA4, Matomo oder Piwik PRO messen: AutoSEO zeigt die Sitzungen, Conversions und Umsätze, die Ihnen ChatGPT, Perplexity, Gemini & Co. bringen.",
  },
  hero: {
    eyebrow: "Analytics-Integrationen",
    title: "KI-Traffic in GA4, Matomo und Piwik PRO messen.",
    muted: "Besuche, Conversions, Umsatz.",
    subtitle:
      "Verbinden Sie Ihr Analytics-Tool, und AutoSEO importiert die Besuche, die KI-Assistenten Ihnen schicken – von ChatGPT, Perplexity, Gemini, Claude, Copilot und vier weiteren –, zusammen mit den Landingpages und dem, was Besucher dort tun.",
  },
  benefits: {
    eyebrow: "Was Sie bekommen",
    title: "Von der KI-Antwort zum Umsatz",
    muted: "in einer Ansicht.",
    items: [
      {
        icon: "chart",
        title: "KI-Referrals getrennt ausgewiesen",
        body: "Besuche von neun KI-Plattformen werden über Referrer und utm_source erkannt und getrennt vom übrigen Traffic ausgewiesen – je Plattform und Landingpage.",
      },
      {
        icon: "git-fork",
        title: "KI-Modell → Seite → Ergebnis",
        body: "Eine Flow-Ansicht zeigt, welcher Assistent Besucher auf welche Art von Seite geschickt hat – Produkt, Preise, Blog, Vergleich oder Support – und ob sie konvertiert haben.",
      },
      {
        icon: "euro",
        title: "Conversions und Umsatz",
        body: "Key Events, Zielerreichungen, Transaktionen und Umsatz je KI-Plattform, verglichen mit dem Vorzeitraum – aus dem Tool, das Sie verbinden.",
      },
      {
        icon: "target",
        title: "Suchpotenziale",
        body: "Ist zusätzlich die Search Console verbunden, bewertet AutoSEO Seiten auf den Positionen 4–20 nach Nachfrage, Geschäftswert aus GA4 und Abstand zur Spitze.",
      },
    ],
  },
  faq: [
    {
      q: "Wie tracke ich ChatGPT-Traffic in Google Analytics 4?",
      a: "Verbinden Sie Google Analytics in AutoSEO mit Ihrem Google-Konto und wählen Sie die GA4-Property. AutoSEO liest Sitzungen, Key Events und Umsatz über die GA4 Data API und weist Besuche von ChatGPT, Perplexity, Gemini und anderen Assistenten getrennt aus. Ihre GA4-Konfiguration bleibt unverändert.",
    },
    {
      q: "Welche KI-Plattformen erkennt AutoSEO in Analytics-Daten?",
      a: "ChatGPT, Perplexity, Google Gemini, Claude, Microsoft Copilot, Meta AI, DeepSeek, Grok, Mistral Le Chat und elf weitere – insgesamt 20 Plattformen. Besuche werden über die Referrer-Domain und über Quellwerte wie utm_source=chatgpt zugeordnet.",
    },
    {
      q: "Funktioniert AutoSEO mit Matomo und Piwik PRO?",
      a: "Ja. Matomo – in der Cloud oder selbst gehostet – verbinden Sie mit URL, Site-ID und einem Auth-Token mit Leserechten. Piwik PRO verbinden Sie mit API-Client-Zugangsdaten. Beide importieren KI-Besuche, Conversions und Umsatz genau wie GA4.",
    },
    {
      q: "Wie oft werden die Analytics-Daten aktualisiert?",
      a: "Verbundene Analytics-Tools synchronisieren einmal täglich, und Sie können jederzeit manuell synchronisieren. AutoSEO speichert bis zu 16 Monate an importierten Traffic-Daten.",
    },
    {
      q: "Wie prüfe ich, ob GA4 KI-Conversions korrekt misst?",
      a: "AutoSEO prüft die verbundene GA4-Property auf einen Web-Datenstream, erweiterte Messung und eingerichtete Key Events und warnt, wenn fehlende Key Events Conversions aus KI-Traffic verbergen würden. Traffic-Reports weisen außerdem auf Probleme wie einen hohen Anteil an Sitzungen mit der Quelle „(not set)“ hin.",
    },
    {
      q: "Ist die Analytics-Integration kostenlos?",
      a: "Ja. Alle Analytics-Integrationen sind Teil der Open-Source-App und kostenlos selbst hostbar. AutoSEO Cloud enthält sie in einem verwalteten Workspace für 50\u00a0$ im Monat, inklusive 10\u00a0$ für KI- und Datennutzung.",
    },
  ],
  cta: {
    title: "Finden Sie heraus, was KI-Traffic wert ist",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationCategoryPage;
