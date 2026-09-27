import type { PlatformPage } from "../../types";

export default {
  slug: "kimi",
  name: "Kimi",
  vendor: "Moonshot AI",
  nav: "Kimi-Tracking",
  summary: "Sehen Sie, wann Kimi Ihre Marke empfiehlt und welche Seiten es zitiert.",
  meta: {
    title: "Kimi-Sichtbarkeit tracken: Markenerwähnungen",
    description:
      "Tracken Sie, wie Kimi von Moonshot AI Ihre Marke erwähnt, zitiert und neben Wettbewerbern platziert – mit Websuche. Open-Source-Tool für Ihre KI-Sichtbarkeit.",
  },
  hero: {
    eyebrow: "Kimi-Sichtbarkeit tracken",
    title: "Sehen Sie, was Kimi über Ihre Marke sagt",
    muted: "– und was es zitiert.",
    subtitle:
      "Kimi, der Assistent von Moonshot AI, sucht vor der Antwort im Web. AutoSEO führt die Prompts Ihrer Kunden in Kimi aus und zeigt, ob Sie erwähnt werden, wie Sie beschrieben werden, wer neben Ihnen empfohlen wird und welche Seiten Kimi zitiert.",
  },
  demo: {
    prompt: "Welches Open-Source-Tool eignet sich für Sichtbarkeit in der KI-Suche?",
    answer: "Acme ist eine solide Open-Source-Option: Es trackt Markenerwähnungen und Zitate in KI-Assistenten und läuft auf Ihrem eigenen Server.",
    citations: ["acme.com", "github.com", "reddit.com"],
  },
  why: {
    eyebrow: "Warum Kimi zählt",
    title: "Kimi sucht im Web, bevor es antwortet.",
    muted: "Welche Quellen wählt es?",
    body: "Kimi ist der KI-Assistent von Moonshot AI. Mit Websuche bezieht Kimi aktuelle Seiten ein und nennt die Marken, die es für am relevantesten hält – nicht unbedingt dieselben wie ChatGPT oder Gemini.",
    points: [
      {
        title: "Quellen hinter jeder Antwort",
        body: "Die Websuche von Kimi liefert die genutzten Seiten mit. Sie zeigen, welche Quellen den Blick auf Ihre Kategorie prägen.",
      },
      {
        title: "Eine eigene Shortlist",
        body: "Die Empfehlungen von Kimi können sich von denen anderer Assistenten unterscheiden. Separates Tracking zeigt Lücken, die Sie sonst übersehen würden.",
      },
      {
        title: "Änderungen, die Sie sonst verpassen",
        body: "Neue Modellversionen und neue Seiten verändern Antworten ohne Vorwarnung. Regelmäßiges Tracking zeigt, wann es passiert ist.",
      },
    ],
  },
  method: {
    eyebrow: "So trackt AutoSEO Kimi",
    title: "Kimi über die Moonshot-API –",
    muted: "oder als Simulation.",
    body: "AutoSEO fragt Kimi über die API von Moonshot AI mit serverseitiger Websuche ab. Auf einer selbst gehosteten Instanz hinterlegen Sie Ihren eigenen Moonshot-Key unter Admin → AI Providers. In AutoSEO Cloud laufen die Engines über die Anbieter, die das Codext-Team angebunden hat; die Nutzung wird auf das enthaltene Kontingent angerechnet.",
    items: [
      {
        title: "Moonshot-API",
        body: "Kimi-Antworten mit den Quellen aus der Websuche sowie den ausgeführten Suchanfragen, sofern die API sie liefert. Die Suche von Moonshot nimmt keinen Standort entgegen, daher übergibt AutoSEO Ihren Markt in den Anweisungen.",
      },
      {
        title: "KI-Simulation als Rückfallebene",
        body: "Ist kein echtes Backend verfügbar, kann ein KI-Modell mit Websuche anstelle von Kimi antworten. Diese Antworten tragen das Label „Simulated“ und sind als Tendenz gedacht: Ein echtes Backend hat immer Vorrang, und Admins können die Rückfallebene abschalten.",
      },
    ],
  },
  tracked: {
    eyebrow: "Was getrackt wird",
    title: "Alles, was Kimi über Ihre Marke sagt",
    items: [
      {
        icon: "radar",
        title: "Markenerwähnungen",
        body: "Ob Kimi Ihre Marke bei jedem Prompt nennt – und die Mention Rate im Zeitverlauf.",
      },
      {
        icon: "link",
        title: "Zitate",
        body: "Die Seiten, die Kimi aus seiner Websuche zitiert – Ihre und die aller anderen.",
      },
      {
        icon: "swords",
        title: "Share of Voice",
        body: "Welche Wettbewerber Kimi neben Ihnen empfiehlt und an welcher Position.",
      },
      {
        icon: "heart",
        title: "Sentiment und Darstellung",
        body: "Wie Kimi Sie beschreibt: Lob, Kritik und die Eigenschaften, die es immer wieder nennt.",
      },
      {
        icon: "git-fork",
        title: "Query Fan-outs",
        body: "Die Suchanfragen, die Kimi hinter einer Antwort stellt – sofern die API sie liefert.",
      },
      {
        icon: "map-pin",
        title: "Märkte und Sprachen",
        body: "Derselbe Prompt für verschiedene Länder und Sprachen, direkt nebeneinander verglichen.",
      },
    ],
  },
  faq: [
    {
      q: "Wie tracke ich die Sichtbarkeit meiner Marke in Kimi?",
      a: "Hinterlegen Sie die Prompts Ihrer Kunden, wählen Sie Kimi als Engine und legen Sie einen Zeitplan fest. AutoSEO führt die Prompts mit Websuche aus, speichert jede Antwort mit ihren Quellen und zeigt Mention Rate, Citation Rate, Position und Sentiment für Ihre Marke und Ihre Wettbewerber.",
    },
    {
      q: "Trackt AutoSEO die Kimi-App?",
      a: "AutoSEO fragt Kimi über die API von Moonshot AI mit Websuche ab, nicht die Kimi-App selbst. Die Antworten zeigen, wie die Kimi-Modelle Ihre Marke sehen und welche Quellen sie nutzen.",
    },
    {
      q: "Brauche ich einen Moonshot-API-Key?",
      a: "Nicht in AutoSEO Cloud – dort verwalten Sie keine Anbieter-Keys; die Engines laufen über die Anbieter, die das Codext-Team angebunden hat (fragen Sie uns, welche aktiviert sind). Beim Self-Hosting hinterlegen Sie Ihren eigenen Key von Moonshot AI unter Admin → AI Providers. Ohne Key kann eine KI-Simulation einspringen – gekennzeichnet als „Simulated“ und nur als Tendenz gedacht.",
    },
    {
      q: "Kann ich Kimi für verschiedene Länder tracken?",
      a: "Ja, mit einer Einschränkung. Die Websuche von Moonshot nimmt keinen Standort entgegen, daher nennt AutoSEO Kimi Ihren Markt in den Anweisungen, und Kimi antwortet in der Sprache Ihres Prompts. Unterschiede zwischen Märkten sind deshalb als Näherung zu verstehen.",
    },
    {
      q: "Wie verbessere ich meine Sichtbarkeit in Kimi?",
      a: "Veröffentlichen Sie klare Antworten auf Ihre getrackten Prompts, halten Sie Ihre Seiten crawlbar und sorgen Sie für Erwähnungen in den Quellen, die Kimi bereits zitiert. AutoSEO zeigt diese Quellen und macht aus den Lücken priorisierte Aufgaben.",
    },
    {
      q: "Kann ich Kimi mit anderen KI-Engines vergleichen?",
      a: "Ja. Tracken Sie dieselben Prompts in ChatGPT, Perplexity, Gemini, Claude und weiteren Engines und vergleichen Sie die Sichtbarkeit je Engine in einem Dashboard.",
    },
  ],
  cta: {
    title: "Finden Sie heraus, was Kimi über Sie sagt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies PlatformPage;
