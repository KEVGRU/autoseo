import type { SolutionPage } from "../../types";

export default {
  slug: "geo-teams",
  nav: "Für GEO- & SEO-Teams",
  summary: "AI Visibility messen, Lücken finden und Fixes umsetzen – direkt neben Ihren SEO-Daten.",
  meta: {
    title: "GEO-Plattform für SEO-, GEO- und AEO-Teams",
    description:
      "GEO-Plattform für SEO-Teams: Prompts in 16 KI-Engines tracken, Zitat-Lücken und Fan-outs finden, Aufgaben ableiten. Open Source, kostenlos selbst hosten.",
  },
  hero: {
    eyebrow: "AutoSEO für GEO- & SEO-Teams",
    title: "Eine GEO-Plattform für KI-Suche und SEO.",
    muted: "Messen, verbessern, belegen.",
    subtitle:
      "Tracken Sie Ihre Prompts in 16 KI-Engines, sehen Sie, welche Quellen und Hintergrundsuchen jede Antwort prägen, und machen Sie aus jeder Lücke eine belegbare Aufgabe – neben Keyword-Recherche, Rank Tracking und Site Audits.",
  },
  visual: "ranking",
  challenges: {
    eyebrow: "Die Herausforderung",
    title: "Die KI-Suche braucht eigene Daten.",
    muted: "Ihr SEO-Stack sieht sie nicht.",
    items: [
      {
        title: "Rankings zeigen keine Empfehlungen",
        body: "Eine Seite kann bei Google auf Platz eins stehen, während ChatGPT drei Wettbewerber empfiehlt. Positions-Tracking übersieht die Antwortebene komplett.",
      },
      {
        title: "Viele Tools, kein Gesamtbild",
        body: "Prompt-Tracking im einen Tool, Keywords im zweiten, Crawler-Logs im dritten. Allein das Zusammenführen kostet die halbe Woche.",
      },
      {
        title: "Schwer zu belegen, was gewirkt hat",
        body: "Antworten ändern sich mit jedem Modell-Update. Ohne gespeicherte Antworten im Zeitverlauf lässt sich nicht zeigen, welcher Fix die Visibility bewegt hat.",
      },
    ],
  },
  workflow: {
    eyebrow: "So nutzen GEO-Teams AutoSEO",
    title: "Von der Prompt-Recherche zum umgesetzten Fix,",
    muted: "ein Workflow.",
    items: [
      {
        icon: "lightbulb",
        title: "Die Prompts finden, die zählen",
        body: "Generieren Sie Prompts nach Thema, Funnel-Stufe und Persona, prüfen Sie die Suchnachfrage und übernehmen Sie die besten in den Tracker.",
        feature: "prompt-research",
      },
      {
        icon: "radar",
        title: "16 Engines nach Zeitplan tracken",
        body: "Visibility, Mention Rate, Citation Rate und durchschnittliche Position je Prompt, Engine und Markt – täglich, wöchentlich oder monatlich.",
        feature: "ai-visibility-tracking",
      },
      {
        icon: "git-fork",
        title: "Die Suchen hinter jeder Antwort sehen",
        body: "Query Fan-outs zeigen, welche Suchen Engines vor der Antwort ausführen – und welche Fragen Ihre Seiten abdecken müssen.",
        feature: "query-fanout-analysis",
      },
      {
        icon: "link",
        title: "Zitat-Lücken schließen",
        body: "Finden Sie Domains und Seiten, die Engines für Wettbewerber zitieren, aber nicht für Sie – gruppiert nach Content-Typ.",
        feature: "ai-citation-tracking",
      },
      {
        icon: "shield-check",
        title: "Zugang für KI-Crawler prüfen",
        body: "robots.txt-Regeln je KI-Bot, llms.txt, Meta Robots und Rendering im Roh-HTML – geprüft für Ihre wichtigsten Seiten.",
        feature: "ai-crawlability",
      },
      {
        icon: "list-checks",
        title: "Belegbare Aufgaben umsetzen",
        body: "Erkenntnisse aus allen Datenquellen werden zu priorisierten Aufgaben mit Impact und Aufwand – übergeben an Jira, Linear, Asana und weitere Tools.",
        feature: "ai-seo-tasks",
      },
    ],
  },
  prompts: {
    eyebrow: "Beispiel-Prompts",
    title: "Prompts, die GEO-Teams entlang des Funnels tracken",
    items: [
      "Was ist die beste Buchhaltungssoftware für Freiberufler?",
      "Wie finde ich den richtigen Anbieter für die Lohnabrechnung in einem kleinen Unternehmen?",
      "Welche E-Mail-Marketing-Tools lassen sich mit Shopify verbinden?",
      "Acme oder der größte Wettbewerber – was ist besser für kleine Teams?",
      "Die besten Alternativen zu Acme für Großunternehmen",
      "Ist Acme seinen Preis wert?",
    ],
  },
  outcomes: {
    eyebrow: "Warum GEO-Teams AutoSEO wählen",
    title: "AI Visibility und SEO",
    muted: "in einem Datenmodell.",
    items: [
      {
        title: "Eine zentrale Datenbasis",
        body: "KI-Antworten, Zitate, Keywords, Rankings, Audits, Search Console und GA4 liegen im selben Projekt – jede Erkenntnis hat Kontext.",
      },
      {
        title: "Gebaut für technische Teams",
        body: "REST API, ein MCP-Server mit über 100 Tools und der Agent-Modus mit Ihrem eigenen Claude Code oder Codex automatisieren, was Sie sonst von Hand erledigen.",
      },
      {
        title: "Keine Preise pro Prompt",
        body: "AutoSEO rechnet weder pro Prompt noch pro Nutzer ab. Die Cloud enthält KI- und Datennutzung im Wert von 10\u00a0$ pro Monat; beim Self-Hosting zahlen Sie die Anbieter direkt und setzen eigene Ausgabenlimits.",
      },
    ],
  },
  faq: [
    {
      q: "Was ist eine GEO-Plattform?",
      a: "Eine GEO-Plattform (Generative Engine Optimization) misst, wie KI-Assistenten wie ChatGPT, Perplexity und Gemini Ihre Marke erwähnen und zitieren, und hilft Ihnen, das zu verbessern. AutoSEO trackt Ihre Prompts in 16 KI-Engines, analysiert Quellen, Wettbewerber und Sentiment und macht aus Lücken konkrete Aufgaben – neben einer kompletten SEO-Suite.",
    },
    {
      q: "Was ist der Unterschied zwischen GEO, AEO und SEO?",
      a: "SEO optimiert Seiten für Rankings in den Suchergebnissen. AEO (Answer Engine Optimization) und GEO (Generative Engine Optimization) zielen darauf, in KI-generierten Antworten genannt und zitiert zu werden. Beides hängt zusammen: KI-Engines stützen sich auf crawlbare, vertrauenswürdige Seiten – deshalb vereint AutoSEO beides an einem Ort.",
    },
    {
      q: "Welche KI-Engines kann ein GEO-Team mit AutoSEO tracken?",
      a: "ChatGPT (Suche und App), Perplexity, Google AI Overviews, Google AI Mode, Gemini, Claude, Microsoft Copilot, Grok, Mistral, DeepSeek, Meta AI, Qwen, Kimi, Sabiá und Solar – insgesamt 16 Engines. Engines, Märkte und einen täglichen, wöchentlichen oder monatlichen Zeitplan legen Sie pro Projekt fest.",
    },
    {
      q: "Kann ich AutoSEO mit unseren bestehenden SEO-Daten verbinden?",
      a: "Ja. Verbinden Sie Google Search Console, Bing Webmaster Tools, GA4, Matomo oder Piwik PRO sowie Bot-Traffic aus Cloudflare, Akamai oder Ihren Server-Logs. Keyword-, SERP- und Backlink-Daten liefert DataForSEO.",
    },
    {
      q: "Können wir GEO-Arbeit mit KI-Agenten automatisieren?",
      a: "Ja. Im Agent-Modus chatten Sie über Ihr eigenes Claude Code oder Codex mit allen Projektdaten. Die REST API und ein MCP-Server mit über 100 Tools geben Ihren eigenen Agenten und Skripten Zugriff auf dieselben Daten.",
    },
    {
      q: "Was kostet AutoSEO für ein Inhouse-Team?",
      a: "Die Open-Source-Edition lässt sich mit allen Funktionen und ohne Limits kostenlos selbst hosten; DataForSEO und KI-Anbieter rechnen ihre Nutzung direkt ab. AutoSEO Cloud kostet 50\u00a0$ pro Workspace und Monat – mit bis zu 10 Projekten, unbegrenzt vielen Nutzern und KI- und Datennutzung im Wert von 10\u00a0$ inklusive.",
    },
  ],
  related: ["content-teams", "agencies", "saas-tech"],
  cta: {
    title: "Geben Sie Ihrem GEO-Programm echte Daten",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies SolutionPage;
