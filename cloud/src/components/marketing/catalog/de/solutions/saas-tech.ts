import type { SolutionPage } from "../../types";

export default {
  slug: "saas-tech",
  nav: "Für SaaS & Tech",
  summary: "Empfohlen werden, wenn Käufer KI nach Software fragen – und die Pipeline daraus sehen.",
  meta: {
    title: "GEO für SaaS: Empfehlungen in der KI-Suche",
    description:
      "GEO für SaaS: Sehen Sie, wann ChatGPT, Claude und Perplexity Ihre Software empfehlen, gewinnen Sie Vergleichs-Prompts und ordnen Sie Deals der KI-Suche zu.",
  },
  hero: {
    eyebrow: "AutoSEO für SaaS & Tech",
    title: "Damit die KI-Suche Ihre Software empfiehlt.",
    muted: "GEO für SaaS- und Tech-Unternehmen.",
    subtitle:
      "Käufer fragen KI nach dem besten Tool, der besten Alternative und danach, wie Produkte im Vergleich abschneiden. AutoSEO trackt diese Prompts in 16 Engines, zeigt, welche Bewertungen, Dokumentationen und Vergleichsseiten die Antworten prägen, und ordnet Deals und Abos der KI-Suche zu.",
  },
  visual: "answer",
  challenges: {
    eyebrow: "Die Herausforderung",
    title: "Software-Shortlists entstehen im KI-Chat.",
    muted: "Nicht jeder Anbieter schafft es darauf.",
    items: [
      {
        title: "Vergleichs-Prompts entscheiden Deals",
        body: "Käufer fragen Assistenten nach dem besten Tool und den besten Alternativen. Die Antwort nennt wenige Anbieter – mehr nicht.",
      },
      {
        title: "Docs und Bewertungen prägen die Antwort",
        body: "Engines zitieren Dokumentationen, Bewertungsportale, Foren und Vergleichsartikel. Sind Ihre Vorteile nicht dort dokumentiert, wo Crawler sie lesen können, werden sie nicht zitiert.",
      },
      {
        title: "Pipeline ohne Quelle",
        body: "Eine Demo-Anfrage von jemandem, der in ChatGPT recherchiert hat, verrät das selten. Die KI-Suche bleibt im CRM unsichtbar.",
      },
    ],
  },
  workflow: {
    eyebrow: "So nutzen SaaS-Teams AutoSEO",
    title: "Vom Vergleichs-Prompt",
    muted: "zum gewonnenen Deal.",
    items: [
      {
        icon: "swords",
        title: "Vergleichs-Prompts gewinnen",
        body: "Head-to-Head-Ergebnisse, „Am besten für …“-Empfehlungen und Share of Voice gegenüber jedem Anbieter, den KI neben Ihnen nennt.",
        feature: "ai-competitor-analysis",
      },
      {
        icon: "book",
        title: "Docs und Seiten für KI lesbar machen",
        body: "Prüfen Sie den Zugriff für KI-Bots, llms.txt und das Rendering im Roh-HTML für Ihre Dokumentation, Preis- und Funktionsseiten.",
        feature: "ai-crawlability",
      },
      {
        icon: "link",
        title: "Die Bewertungen und Threads finden, die zählen",
        body: "Bewertungsportale, Foren, Dokumentationen und Vergleichsartikel, die Engines für Wettbewerber zitieren, aber nicht für Sie.",
        feature: "ai-citation-tracking",
      },
      {
        icon: "bot",
        title: "Sehen, welche KI-Crawler Ihre Website lesen",
        body: "Besuche von GPTBot, ClaudeBot, PerplexityBot und weiteren – aus Cloudflare, Akamai oder Ihren Server-Logs.",
        feature: "ai-bot-traffic",
      },
      {
        icon: "euro",
        title: "Pipeline der KI-Suche zuordnen",
        body: "Verbinden Sie HubSpot, Salesforce, Pipedrive oder Stripe und sehen Sie Leads, Deals und Abos, die aus der KI-Suche kamen.",
        feature: "ai-search-attribution",
      },
      {
        icon: "terminal",
        title: "Mit eigenen Agenten automatisieren",
        body: "Ein MCP-Server mit über 100 Tools, eine REST API und der Agent-Modus mit Ihrem eigenen Claude Code oder Codex.",
        feature: "mcp-server",
      },
    ],
  },
  prompts: {
    eyebrow: "Beispiel-Prompts",
    title: "Prompts, die Software-Käufer der KI stellen",
    items: [
      "Was ist das beste CRM für ein B2B-Start-up mit 20 Mitarbeitenden?",
      "Die besten Alternativen zu Acme für Enterprise-Teams",
      "Acme oder der größte Wettbewerber – wer hat die besseren Integrationen?",
      "Welche Projektmanagement-Tools haben einen kostenlosen Tarif?",
      "Ist Acme SOC-2-zertifiziert?",
      "Wie verbinde ich Acme mit Slack?",
      "Open-Source-Alternativen zu teuren Analytics-Tools",
    ],
  },
  outcomes: {
    eyebrow: "Warum SaaS-Teams AutoSEO wählen",
    title: "Kommen Sie auf die KI-Shortlist –",
    muted: "und sehen Sie, was sie wert ist.",
    items: [
      {
        title: "Wissen, wo Sie gewinnen und verlieren",
        body: "Head-to-Head-Aussagen, Empfehlungen und Share of Voice je Engine zeigen, an welchen Vergleichen Sie zuerst arbeiten sollten.",
      },
      {
        title: "Dokumentation, die Engines lesen können",
        body: "Crawlability-Checks und Bot-Traffic zeigen, ob KI-Crawler die Seiten erreichen, die Ihr Produkt erklären.",
      },
      {
        title: "KI-Suche in Ihren Pipeline-Reports",
        body: "Leads, Deals und Abos aus der KI-Suche – neben den Kanälen, über die Ihr Team bereits berichtet.",
      },
    ],
  },
  faq: [
    {
      q: "Wie werden SaaS-Unternehmen von ChatGPT empfohlen?",
      a: "ChatGPT und andere Engines empfehlen Software, die sie in vertrauenswürdigen Quellen finden: Bewertungsportale, Vergleichsartikel, Foren, Dokumentationen und Ihre eigene Website. Tracken Sie die Kategorie- und Vergleichs-Prompts Ihrer Käufer, finden Sie die Quellen, die Wettbewerber bevorzugen, und dokumentieren Sie Ihre Vorteile dort, wo Engines sie lesen und zitieren können.",
    },
    {
      q: "Kann AutoSEO „Alternativen“- und Vergleichs-Prompts tracken?",
      a: "Ja. Legen Sie Prompts wie „Die besten Alternativen zu Acme“ oder „Acme oder der größte Wettbewerber“ in einem Projekt an. AutoSEO zeigt, wer auf welcher Position genannt wird, wer Head-to-Head-Vergleiche gewinnt und welche Quellen die Engines zitieren.",
    },
    {
      q: "Wie ordne ich Pipeline der KI-Suche zu?",
      a: "Senden Sie Kontakte und Deals aus HubSpot, Salesforce oder Pipedrive per Webhook an AutoSEO – oder Zahlungen und Abos aus Stripe. Ergänzen Sie Ihre Formulare um die Frage „Wie sind Sie auf uns aufmerksam geworden?“, dann ordnet AutoSEO Antworten, Deal-Werte und Conversions der KI-Suche und dem jeweiligen Assistenten zu.",
    },
    {
      q: "Sollten wir eine llms.txt-Datei anlegen?",
      a: "Eine llms.txt-Datei gibt KI-Systemen eine kuratierte Übersicht Ihrer wichtigsten Seiten, etwa Dokumentation und Preise. Der Crawlability-Check von AutoSEO validiert Ihre llms.txt und Ihre robots.txt-Regeln je KI-Bot – so sehen Sie, was jeder Crawler lesen darf.",
    },
    {
      q: "Können unsere Entwickler AutoSEO-Daten in eigenen Tools nutzen?",
      a: "Ja. Alles ist über die REST API v1 mit OpenAPI-Spezifikation und einen MCP-Server mit über 100 Tools verfügbar – per OAuth 2.1 oder API-Keys mit Scopes. Plugins für Claude Code, Codex und Cursor bringen 17 Agent Skills mit.",
    },
    {
      q: "Ist AutoSEO Open Source?",
      a: "Ja. AutoSEO steht unter der MIT-Lizenz und lässt sich mit allen Funktionen kostenlos selbst hosten – Ihr Security-Team kann den Code prüfen. AutoSEO Cloud betreibt dieselbe App als verwalteten Workspace, gehostet in Deutschland, für 50\u00a0$ pro Monat – inklusive KI- und Datennutzung im Wert von 10\u00a0$.",
    },
  ],
  related: ["geo-teams", "content-teams", "customer-experience"],
  cta: {
    title: "Finden Sie heraus, welche Tools KI in Ihrer Kategorie empfiehlt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies SolutionPage;
