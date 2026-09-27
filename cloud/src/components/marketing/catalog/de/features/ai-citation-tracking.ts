import type { FeaturePage } from "../../types";

export default {
  slug: "ai-citation-tracking",
  nav: "KI-Zitate tracken",
  summary: "Welche Seiten KI-Engines zu Ihren Prompts zitieren – und wo Sie gelistet sein sollten.",
  meta: {
    title: "KI-Zitate tracken: Quellen von ChatGPT & Co.",
    description:
      "KI-Zitate tracken: Welche Quellen nutzen ChatGPT, Perplexity und AI Overviews? Seiten und Domains nach Typ – plus Quellen, die Wettbewerber nennen, nicht Sie.",
  },
  hero: {
    eyebrow: "Citation Tracking",
    title: "KI-Zitate tracken, Quelle für Quelle.",
    muted: "Finden Sie die Seiten, die Antworten prägen.",
    subtitle:
      "AutoSEO erfasst jede URL, die KI-Engines bei der Beantwortung Ihrer Prompts zitieren, gruppiert sie nach Domain und Content-Typ und zeigt, welche Quellen Ihre Wettbewerber nennen, aber nicht Sie – Ihre Outreach-Liste, sofort einsatzbereit.",
  },
  visual: "sources",
  screenshot: {
    src: "/screenshots/sources.png",
    alt: "AutoSEO-Quellenansicht mit den meistzitierten Domains im Zeitverlauf, Quelltypen und einer Tabelle zur Quellenanalyse",
    url: "ai/sources",
  },
  stats: [
    { value: 13, label: "Quelltypen", note: "Von Vergleichslisten bis Doku" },
    { value: 3, label: "Eigentümer-Klassen", note: "Ihre, Wettbewerber, Dritte" },
    { value: 16, label: "KI-Engines", note: "Überall, wo Engines Quellen liefern" },
    { value: 0, prefix: "$", label: "Self-Hosting", note: "MIT-Lizenz, alle Funktionen" },
  ],
  why: {
    eyebrow: "Warum das wichtig ist",
    title: "KI-Antworten entstehen aus Quellen.",
    muted: "Rein in die Quellen, rein in die Antwort.",
    body: "Engines mit Websuche wie die ChatGPT-Suche, Perplexity und Google AI Overviews lesen Seiten, bevor sie antworten, und verlinken die genutzten. Die Seiten, denen sie vertrauen, beeinflussen, welche Marken erscheinen. Citation Tracking zeigt Ihnen, welche Seiten das sind.",
    points: [
      {
        title: "Seiten Dritter haben Gewicht",
        body: "Testberichte, Vergleichslisten, Foren und Videos werden oft häufiger zitiert als Markenseiten. Erwähnen diese Sie nicht, tut es die Antwort oft auch nicht.",
      },
      {
        title: "Ihre Seiten müssen zitierbar sein",
        body: "Die Citation Rate zeigt, wie oft Engines auf Ihre Domain verlinken. Viele Erwähnungen bei niedriger Citation Rate heißen: Die KI kennt Sie, belegt das aber mit fremden Seiten.",
      },
      {
        title: "Quellen ändern sich",
        body: "Neue Artikel werden aufgegriffen, alte fallen heraus. Regelmäßiges Tracking zeigt, welche Quellen an Einfluss gewinnen.",
      },
    ],
  },
  capabilities: {
    eyebrow: "Was Sie tracken",
    title: "Jede zitierte Seite,",
    muted: "mit dem Kontext, der zählt.",
    items: [
      {
        icon: "link",
        title: "Meistzitierte Quellen",
        body: "Die Domains und Seiten, die KI-Engines zu Ihren Prompts am häufigsten zitieren – mit Zitaten im Zeitverlauf und Veränderung zum Vorzeitraum.",
      },
      {
        icon: "layers",
        title: "Quelltypen",
        body: "Zitate, gruppiert in 13 Content-Typen wie Vergleichslisten, Kaufratgeber, Testberichte, UGC, News, Video, Shops und Dokumentation.",
      },
      {
        icon: "shield-check",
        title: "Eigentümer",
        body: "Jede Quelle ist als Ihre Domain, Domain eines Wettbewerbers oder Drittseite klassifiziert. So filtern Sie gezielt nach Seiten, die Sie nicht kontrollieren.",
      },
      {
        icon: "search",
        title: "Quellenanalyse",
        body: "Für eine Seite oder Domain: Zitate im Zeitverlauf, Engines, durchschnittliche Zitatposition, die zitierenden Prompts und die daneben genannten Marken.",
      },
      {
        icon: "target",
        title: "Wo Sie fehlen",
        body: "Der Anteil der Antworten mit dieser Quelle, die auch Sie nennen. Quellen, die ohne Sie zitiert werden, sind die Stellen, an denen ein Eintrag Ihre Sichtbarkeit direkt beeinflusst.",
      },
      {
        icon: "lightbulb",
        title: "Playbooks zum Gelistetwerden",
        body: "Nächste Schritte je Content-Typ – eine Vergleichsliste pitchen, einen Kaufratgeber beliefern, sich in einen Forenthread einbringen – plus Aufgaben zu Zitatlücken, die Sie an Ihr Projekttool übergeben.",
      },
    ],
  },
  steps: {
    eyebrow: "So funktioniert es",
    title: "Vom Zitat zur Outreach-Liste",
    muted: "in drei Schritten.",
    items: [
      {
        title: "Prompts in zitierenden Engines tracken",
        body: "Aktivieren Sie Engines, die Quellen liefern – etwa ChatGPT, Perplexity, Google AI Overviews, AI Mode, Gemini und Claude – für die Märkte, in denen Sie verkaufen.",
      },
      {
        title: "AutoSEO bereinigt und klassifiziert",
        body: "Zitierte URLs werden von Tracking-Parametern befreit, nach Seite und Domain gruppiert und nach Content-Typ und Eigentümer gekennzeichnet.",
      },
      {
        title: "Dort gelistet werden, wo es zählt",
        body: "Filtern Sie nach Drittquellen, die Wettbewerber zitieren, aber nicht Sie, folgen Sie dem Playbook und beobachten Sie Ihre Zitate und Erwähnungen über die Zeit.",
      },
    ],
  },
  faq: [
    {
      q: "Was ist Citation Tracking in der KI-Suche?",
      a: "Citation Tracking erfasst, welche Webseiten KI-Assistenten als Quellen verlinken, wenn sie eine Frage beantworten. AutoSEO speichert jedes Zitat zu Ihren getrackten Prompts, gruppiert es nach Seite, Domain und Content-Typ und zeigt, wie oft Ihre eigene Domain zitiert wird.",
    },
    {
      q: "Wie finde ich heraus, welche Quellen ChatGPT zitiert?",
      a: "Tracken Sie Ihre Prompts mit aktiviertem ChatGPT. AutoSEO speichert jede Quelle, auf die eine Antwort verlinkt. Die Quellenansicht listet so die Seiten und Domains, auf die sich ChatGPT bei Ihren Themen stützt – je Prompt und im Zeitverlauf.",
    },
    {
      q: "Was ist der Unterschied zwischen Erwähnung und Zitat?",
      a: "Eine Erwähnung bedeutet, dass die Antwort Ihre Marke im Text nennt. Ein Zitat bedeutet, dass die Antwort auf eine Seite Ihrer Domain als Quelle verlinkt. AutoSEO misst beides: Die Mention Rate zeigt, ob die KI Sie kennt, die Citation Rate, ob sie Ihre Seiten als Beleg nutzt.",
    },
    {
      q: "Welche KI-Engines zeigen Quellen an?",
      a: "Engines, die vor der Antwort im Web suchen, liefern Quellen – darunter ChatGPT, Perplexity, Google AI Overviews, Google AI Mode, Gemini, Claude, Microsoft Copilot, Grok, Mistral, Meta AI, Qwen, Kimi und Sabiá. DeepSeek und Solar antworten aus dem Modellwissen, ohne Zitate. Ob eine Antwort Zitate enthält, hängt von der Engine und vom Anbieter ab, über den AutoSEO sie abruft.",
    },
    {
      q: "Wie werde ich von KI-Engines zitiert?",
      a: "Sorgen Sie dafür, dass Ihre Seiten crawlbar sind und die Frage direkt mit konkreten Fakten beantworten, und lassen Sie sich auf den Drittseiten listen, die Engines bereits zitieren. AutoSEO zeigt diese Seiten, schlägt nächste Schritte je Content-Typ vor und erstellt Aufgaben für Quellen, die Wettbewerber zitieren, aber nicht Sie.",
    },
    {
      q: "Kann ich die Liste der zitierten Quellen exportieren?",
      a: "Ja. Die Quellenanalyse lässt sich nach Seite oder Domain als CSV exportieren, und der Report-Builder bietet Bausteine für die meistzitierten Quellen, Quelltypen und Zitat-Eigentümer. REST API und MCP-Server liefern die Top-Quellen für Ihre eigenen Tools.",
    },
    {
      q: "Ist das Tracking von KI-Zitaten kostenlos?",
      a: "Citation Tracking ist Teil der Open-Source-App AutoSEO und beim Self-Hosting kostenlos; DataForSEO- und KI-API-Nutzung rechnen dann diese Anbieter ab. AutoSEO Cloud bietet Ihnen einen verwalteten Workspace für 50\u00a0$ pro Monat, KI- und Datennutzung im Wert von 10\u00a0$ inklusive.",
    },
  ],
  related: ["ai-visibility-tracking", "ai-competitor-analysis", "ai-crawlability", "ai-seo-tasks"],
  cta: {
    title: "Sehen Sie, welchen Seiten die KI in Ihrem Markt vertraut",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies FeaturePage;
