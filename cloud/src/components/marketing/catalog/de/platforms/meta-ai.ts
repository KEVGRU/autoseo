import type { PlatformPage } from "../../types";

export default {
  slug: "meta-ai",
  name: "Meta AI",
  vendor: "Meta",
  nav: "Meta-AI-Tracking",
  summary: "Sehen Sie, wann Meta AI Ihre Marke empfiehlt und welche Quellen es zitiert.",
  meta: {
    title: "Meta-AI-Sichtbarkeit tracken: Markenerwähnungen",
    description:
      "Tracken Sie, wie Meta AI Ihre Marke erwähnt, zitiert und neben Wettbewerbern platziert – mit Websuche. Open-Source-Tool über die Meta Model API.",
  },
  hero: {
    eyebrow: "Meta-AI-Sichtbarkeit tracken",
    title: "Sehen Sie, was Meta AI über Ihre Marke sagt",
    muted: "– mit aktivierter Websuche.",
    subtitle:
      "Meta AI beantwortet Fragen direkt in WhatsApp, Instagram und Facebook. AutoSEO führt die Prompts Ihrer Kunden mit Websuche im Modell von Meta aus und zeigt, ob Sie erwähnt werden, wie Sie beschrieben werden, wer neben Ihnen empfohlen wird und welche Seiten zitiert werden.",
  },
  demo: {
    prompt: "Wie sehe ich am einfachsten, wie KI-Assistenten über meine Marke sprechen?",
    answer: "Probieren Sie Acme: Es trackt, wie Assistenten Ihre Marke erwähnen, welche Quellen sie zitieren und wie Sie im Vergleich zu Wettbewerbern abschneiden.",
    citations: ["acme.com", "reddit.com", "g2.com"],
  },
  why: {
    eyebrow: "Warum Meta AI zählt",
    title: "Meta AI antwortet in Apps, die Menschen ohnehin nutzen.",
    muted: "Ist Ihre Marke dabei?",
    body: "Meta AI ist in WhatsApp, Instagram und Facebook integriert und unter meta.ai erreichbar. Menschen fragen mitten im Chat nach Empfehlungen – die Marken, die Meta AI nennt, erreichen Kunden also dort, wo sie ohnehin Zeit verbringen.",
    points: [
      {
        title: "Kurze Antworten, wenige Namen",
        body: "Antworten mitten im Chat sind kurz. Nur wenige Marken passen hinein – umso wichtiger ist es, eine davon zu sein.",
      },
      {
        title: "Die Websuche prägt die Antwort",
        body: "Mit Websuche greift Meta AI auf aktuelle Seiten zurück. Die Quellen hinter einer Antwort zeigen, wo Ihre Marke auftauchen muss.",
      },
      {
        title: "Eine eigene Shortlist",
        body: "Meta AI kann andere Marken empfehlen als ChatGPT oder Gemini. Separates Tracking zeigt Lücken, die Sie sonst übersehen würden.",
      },
    ],
  },
  method: {
    eyebrow: "So trackt AutoSEO Meta AI",
    title: "Meta AI über die API von Meta –",
    muted: "oder als Simulation.",
    body: "AutoSEO fragt das Modell von Meta über die Meta Model API mit Metas eigener Websuche ab; ein OpenRouter-Key dient als Rückfallebene. Auf einer selbst gehosteten Instanz hinterlegen Sie Ihren eigenen Meta-Key unter Admin → AI Providers. In AutoSEO Cloud laufen die Engines über die Anbieter, die das Codext-Team angebunden hat; die Nutzung wird auf das enthaltene Kontingent angerechnet.",
    items: [
      {
        title: "Meta Model API",
        body: "Das Muse-Spark-Modell von Meta mit Metas Websuche für Ihren Markt, inklusive der ausgeführten Suchanfragen, sofern die API sie liefert. Ohne Meta-Key nutzt ein OpenRouter-Key dasselbe Modell, dann mit der Websuche von OpenRouter.",
      },
      {
        title: "KI-Simulation als Rückfallebene",
        body: "Ist kein echtes Backend verfügbar, kann ein KI-Modell mit Websuche anstelle von Meta AI antworten. Diese Antworten tragen das Label „Simulated“ und sind als Tendenz gedacht: Ein echtes Backend hat immer Vorrang, und Admins können die Rückfallebene abschalten.",
      },
    ],
  },
  tracked: {
    eyebrow: "Was getrackt wird",
    title: "Alles, was Meta AI über Ihre Marke sagt",
    items: [
      {
        icon: "radar",
        title: "Markenerwähnungen",
        body: "Ob Meta AI Ihre Marke bei jedem Prompt nennt – und die Mention Rate im Zeitverlauf.",
      },
      {
        icon: "link",
        title: "Zitate",
        body: "Die Seiten, die Meta AI aus seiner Websuche zitiert – Ihre und die aller anderen.",
      },
      {
        icon: "swords",
        title: "Share of Voice",
        body: "Welche Wettbewerber Meta AI neben Ihnen empfiehlt und an welcher Position.",
      },
      {
        icon: "heart",
        title: "Sentiment und Darstellung",
        body: "Wie Meta AI Sie beschreibt: Lob, Kritik und die Eigenschaften, die es immer wieder nennt.",
      },
      {
        icon: "target",
        title: "Top-Empfehlungen",
        body: "Wo Meta AI eine Marke als beste Wahl für einen Anwendungsfall nennt – und ob Sie es sind.",
      },
      {
        icon: "map-pin",
        title: "Märkte und Sprachen",
        body: "Derselbe Prompt für verschiedene Länder und Sprachen, direkt nebeneinander verglichen.",
      },
    ],
  },
  crawlers: {
    eyebrow: "Die Crawler von Meta",
    title: "Wissen Sie, welche Meta-Crawler Ihre Website lesen",
    body: "Meta betreibt eigene Crawler, unter anderem für das KI-Training. Der Crawlability-Check von AutoSEO prüft Ihre robots.txt und Ihre Seiten dafür, und die Bot-Analytics zeigen, wie oft sie vorbeikommen.",
    bots: [
      { token: "meta-externalagent", purpose: "Crawlt das Web für Meta, auch Inhalte, die für das Training der KI-Modelle genutzt werden können" },
      { token: "FacebookBot", purpose: "Crawlt öffentliche Seiten, um die Sprachmodelle von Meta zu verbessern" },
    ],
  },
  faq: [
    {
      q: "Wie tracke ich die Sichtbarkeit meiner Marke in Meta AI?",
      a: "Hinterlegen Sie die Prompts Ihrer Kunden, wählen Sie Meta AI als Engine und legen Sie einen Zeitplan fest. AutoSEO führt die Prompts mit Websuche aus, speichert jede Antwort und zeigt Mention Rate, Citation Rate, Position und Sentiment für Ihre Marke und Ihre Wettbewerber.",
    },
    {
      q: "Trackt AutoSEO Meta AI in WhatsApp und Instagram?",
      a: "AutoSEO fragt das Modell von Meta über die Meta Model API mit Websuche ab, nicht die Apps WhatsApp, Instagram oder Facebook selbst. Die Antworten zeigen, wie das Modell von Meta Ihre Marke sieht und welche Quellen es nutzt.",
    },
    {
      q: "Brauche ich einen API-Key von Meta?",
      a: "Nicht in AutoSEO Cloud – dort verwalten Sie keine Anbieter-Keys; die Engines laufen über die Anbieter, die das Codext-Team angebunden hat (fragen Sie uns, welche aktiviert sind). Beim Self-Hosting hinterlegen Sie einen Key für die Meta Model API unter Admin → AI Providers – oder einen OpenRouter-Key, der dasselbe Modell mit der Websuche von OpenRouter nutzt. Ohne beide kann eine KI-Simulation einspringen – gekennzeichnet als „Simulated“ und nur als Tendenz gedacht.",
    },
    {
      q: "Was ist der Unterschied zwischen der Meta-API und OpenRouter?",
      a: "Beide nutzen dasselbe Modell von Meta. Über die Meta Model API sucht es mit Metas eigener Websuche; über OpenRouter findet die Websuche von OpenRouter die Quellen. Weil sich die Quellen unterscheiden, können auch die Antworten abweichen.",
    },
    {
      q: "Wie verbessere ich meine Sichtbarkeit in Meta AI?",
      a: "Veröffentlichen Sie klare Antworten auf Ihre getrackten Prompts, halten Sie Ihre Seiten crawlbar und sorgen Sie für Erwähnungen in den Quellen, die Meta AI bereits zitiert. AutoSEO zeigt diese Quellen und macht aus den Lücken priorisierte Aufgaben.",
    },
    {
      q: "Kann ich Meta AI mit anderen KI-Engines vergleichen?",
      a: "Ja. Tracken Sie dieselben Prompts in ChatGPT, Perplexity, Gemini, Claude und weiteren Engines und vergleichen Sie die Sichtbarkeit je Engine in einem Dashboard.",
    },
  ],
  cta: {
    title: "Finden Sie heraus, was Meta AI über Sie sagt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies PlatformPage;
