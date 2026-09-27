import type { FeaturePage } from "../../types";

export default {
  slug: "ai-traffic-analytics",
  nav: "KI-Traffic-Analyse",
  summary: "Wie viele Besucher ChatGPT, Perplexity und Gemini schicken – und was daraus wird.",
  meta: {
    title: "KI-Traffic messen: Besucher aus ChatGPT & Co.",
    description:
      "KI-Traffic aus ChatGPT, Perplexity, Gemini und Claude messen – mit GA4, Matomo oder Piwik PRO: Sitzungen, Conversions und Umsatz je KI-Plattform. Open Source.",
  },
  hero: {
    eyebrow: "KI-Traffic-Analyse",
    title: "Messen Sie den KI-Traffic auf Ihrer Website.",
    muted: "Bis zur Conversion.",
    subtitle:
      "Verbinden Sie Google Analytics 4, Matomo oder Piwik PRO – AutoSEO erkennt jede Sitzung, die ChatGPT, Perplexity, Gemini, Claude, Copilot und 15 weitere KI-Plattformen vermitteln, samt Landingpages, Conversions und Umsatz. Search Console und Bing Webmaster Tools zeigen, welche Ihrer Suchanfragen schon wie KI-Prompts klingen.",
  },
  visual: "traffic",
  stats: [
    { value: 20, label: "Erkannte KI-Plattformen", note: "Von ChatGPT bis Character.AI" },
    { value: 3, label: "Analytics-Tools", note: "GA4, Matomo, Piwik PRO" },
    { value: 16, label: "Monate Historie", note: "Beim ersten Sync importiert" },
    { value: 0, prefix: "$", label: "Self-Hosting", note: "MIT-Lizenz, alle Funktionen" },
  ],
  why: {
    eyebrow: "Warum das wichtig ist",
    title: "Sichtbarkeit ist nur die halbe Miete.",
    muted: "Klicks zeigen, ob sie sich auszahlt.",
    body: "Erwähnungen in KI-Antworten zählen vor allem dann, wenn Menschen durchklicken und kaufen. Standard-Reports in Analytics verbuchen diesen Traffic als Referral oder Direct – der Kanal taucht in den Zahlen, über die Ihr Team berichtet, gar nicht auf.",
    points: [
      {
        title: "KI-Referrals gehen im Referral-Report unter",
        body: "Besucher aus KI-Assistenten kommen über Dutzende Hostnamen und utm_source-Werte. AutoSEO ordnet jede Sitzung genau einer KI-Plattform zu – so wird der Kanal als Ganzes sichtbar.",
      },
      {
        title: "Jede Plattform schickt andere Besucher",
        body: "Ein Assistent schickt Leser in Ihren Blog, ein anderer Käufer direkt auf die Preisseite. Zahlen je Plattform zeigen, wo der Wert entsteht.",
      },
      {
        title: "Suchanfragen werden zu Prompts",
        body: "Lange, als Frage formulierte Suchanfragen in der Search Console zeigen, was Menschen die KI fragen. Wer sie früh erkennt, weiß, welche Prompts sich zu tracken lohnen.",
      },
    ],
  },
  capabilities: {
    eyebrow: "Was Sie bekommen",
    title: "Jeder KI-Besucher, vom Referral bis zum Umsatz –",
    muted: "in einem Report.",
    items: [
      {
        icon: "chart",
        title: "Sitzungen, Conversions und Umsatz",
        body: "KI-vermittelte Sitzungen pro Tag oder Monat mit Conversions und Umsatz, im Vergleich zum Vorzeitraum und aufgeteilt nach Plattform.",
      },
      {
        icon: "bot",
        title: "20 KI-Plattformen erkannt",
        body: "ChatGPT, Perplexity, Gemini, Claude, Copilot, Meta AI, DeepSeek, Grok, Mistral Le Chat und weitere – erkannt an Sitzungsquelle oder Referrer.",
      },
      {
        icon: "workflow",
        title: "Modell → Seite → Ergebnis",
        body: "Verfolgen Sie die Besucher jeder KI-Plattform bis zur Landingpage und weiter zu Sitzungen, Conversions, Conversion Rate oder Seitenintention.",
      },
      {
        icon: "globe",
        title: "Landingpages, Länder, Engagement",
        body: "Tabellen nach URL, Land und Plattform mit Engagement-Rate, Verweildauer, Conversion Rate und Umsatz – filterbar nach KI-Plattform.",
      },
      {
        icon: "search",
        title: "Search-Console-Insights",
        body: "Suchanfragen, Seiten und Länder aus Google Search Console und Bing Webmaster Tools – mit einem Filter für Anfragen, die wie KI-Prompts klingen.",
      },
      {
        icon: "target",
        title: "Potenziale und URL-Prüfung",
        body: "Seiten auf Position 4–20, bewertet mit Engagement-Daten aus GA4, dazu Indexierungsstatus, Canonical und Rich Results jeder URL bei Google.",
      },
    ],
  },
  steps: {
    eyebrow: "So funktioniert es",
    title: "Vom Analytics-Login zum Report für den KI-Kanal",
    muted: "in drei Schritten.",
    items: [
      {
        title: "Analytics verbinden",
        body: "Melden Sie sich mit Google an und wählen Sie Ihre GA4-Property – oder verbinden Sie Matomo oder Piwik PRO per API-Zugang. Ein Health Check meldet GA4-Setups, die keine Conversions messen können.",
      },
      {
        title: "AutoSEO importiert und ordnet zu",
        body: "Der erste Sync importiert bis zu 16 Monate KI-vermittelter Sitzungen, danach aktualisieren sich die Daten täglich. Jede Sitzung wird einer KI-Plattform zugeordnet.",
      },
      {
        title: "Plattformen vergleichen und handeln",
        body: "Filtern Sie nach Plattform, analysieren Sie Landingpages und verbinden Sie die Search Console, um Anfragen zu finden, die schon wie Prompts aussehen.",
      },
    ],
  },
  faq: [
    {
      q: "Wie messe ich Traffic aus ChatGPT in Google Analytics 4?",
      a: "Verbinden Sie GA4 über Ihr Google-Konto mit AutoSEO und wählen Sie die Property. AutoSEO liest die Sitzungen über die GA4 Data API und ordnet jede Sitzung, deren Quelle auf ChatGPT verweist – etwa chatgpt.com oder utm_source=chatgpt –, der Plattform ChatGPT zu. Eine eigene Channel-Gruppe brauchen Sie dafür nicht.",
    },
    {
      q: "Welche KI-Plattformen erkennt AutoSEO?",
      a: "ChatGPT, Perplexity, Google Gemini, Claude, Microsoft Copilot, Meta AI, DeepSeek, Grok, Mistral Le Chat, You.com, Phind, Poe, Duck.ai, HuggingChat, Pi, Kagi Assistant, Qwen, Kimi, Sabiá und Character.AI. Jede Plattform wird an ihren Domains und gängigen utm_source-Werten erkannt.",
    },
    {
      q: "Funktioniert das auch mit Matomo oder Piwik PRO?",
      a: "Ja. Verbinden Sie Matomo – selbst gehostet oder in der Cloud – mit einem Auth-Token mit Lesezugriff, oder Piwik PRO mit API-Client-Zugangsdaten. KI-vermittelte Besuche werden aus jeder Quelle im selben Format gespeichert, die Reports sehen also gleich aus, egal welches Tool Sie nutzen.",
    },
    {
      q: "Sehe ich auch den Umsatz aus KI-Traffic?",
      a: "Ja. Conversions und Umsatz kommen aus Ihrem Analytics-Tool und werden je KI-Plattform, Landingpage und Land angezeigt. Für Deals und Bestellungen, bei denen der KI-Einfluss keinen Klick hinterlassen hat, nutzen Sie die Attribution für KI-Suche, die Käufer direkt fragt.",
    },
    {
      q: "Wie weit reichen die Daten zurück?",
      a: "Der erste Sync importiert bis zu 16 Monate Historie. Danach synchronisiert AutoSEO einmal täglich und hält ein rollierendes Zeitfenster von 16 Monaten vor.",
    },
    {
      q: "Was sind KI-Prompts in der Search Console?",
      a: "Suchanfragen, die klingen wie etwas, das man in ChatGPT eintippt: lang, im Gesprächston oder als Frage formuliert. AutoSEO markiert sie in Ihren Daten aus Google Search Console und Bing Webmaster Tools und ordnet ihnen eine Suchintention zu. Die besten übernehmen Sie ins AI Visibility Tracking.",
    },
    {
      q: "Ist die KI-Traffic-Analyse kostenlos?",
      a: "Die KI-Traffic-Analyse ist Teil der Open-Source-App AutoSEO und beim Self-Hosting mit allen Funktionen kostenlos. AutoSEO Cloud bietet Ihnen einen verwalteten Workspace für 50\u00a0$ pro Monat, KI- und Datennutzung im Wert von 10\u00a0$ inklusive. Die Anbindung von Google Analytics, Matomo, Piwik PRO oder der Search Console kostet nichts extra.",
    },
  ],
  related: ["ai-search-attribution", "ai-bot-traffic", "ai-visibility-tracking", "report-builder"],
  cta: {
    title: "Finden Sie heraus, wie viel Traffic KI Ihnen schon bringt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies FeaturePage;
