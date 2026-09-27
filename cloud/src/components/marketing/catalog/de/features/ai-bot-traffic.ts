import type { FeaturePage } from "../../types";

export default {
  slug: "ai-bot-traffic",
  nav: "KI-Crawler-Analyse",
  summary: "Welche KI-Crawler Ihre Seiten abrufen, wie oft – und wie Ihr Server darauf antwortet.",
  meta: {
    title: "KI-Crawler-Analyse: GPTBot, ClaudeBot & Co.",
    description:
      "KI-Crawler analysieren: Besuche von GPTBot, ClaudeBot, PerplexityBot und 24 weiteren Bots aus Logfiles, Cloudflare oder Akamai – per IP-Bereich verifiziert.",
  },
  hero: {
    eyebrow: "Analyse des KI-Bot-Traffics",
    title: "Sehen Sie, welche KI-Crawler Ihre Website lesen.",
    muted: "Seite für Seite, Tag für Tag.",
    subtitle:
      "KI-Engines können nur zitieren, was ihre Crawler abgerufen haben. AutoSEO liest Ihre Server-Logs, Ihr CDN oder hochgeladene Logfiles, erkennt 27 KI- und Such-Crawler – von GPTBot und ClaudeBot bis PerplexityBot und OAI-SearchBot –, prüft sie gegen die veröffentlichten IP-Bereiche und zeigt, welche Seiten sie besuchen und wie Ihre Website antwortet.",
  },
  visual: "bots",
  screenshot: {
    src: "/screenshots/bot-traffic.png",
    alt: "AutoSEO-Analyse des Bot-Traffics mit Crawler-Besuchen pro Tag für Googlebot, GPTBot, ChatGPT-User und ClaudeBot sowie dem Anteil verifizierter Anfragen",
    url: "analytics/bots",
  },
  stats: [
    { value: 27, label: "Erkannte Crawler", note: "KI-, Such- und SEO-Bots" },
    { value: 6, label: "Verifizierte Betreiber", note: "Über veröffentlichte IP-Bereiche" },
    { value: 3, label: "Live-Connectoren", note: "Cloudflare, Akamai, Server-Logs" },
    { value: 1, suffix: " GB", label: "Logfile-Uploads", note: "Unkomprimiert oder gzip, pro Datei" },
  ],
  why: {
    eyebrow: "Warum das wichtig ist",
    title: "Kein Crawl, kein Zitat.",
    muted: "Jede KI-Antwort beginnt mit einem Abruf.",
    body: "Bevor eine KI-Engine Ihre Preisseite zitieren kann, muss ihr Crawler sie abrufen – fürs Training, für einen Suchindex oder live, während ein Nutzer fragt. Ob das passiert ist, zeigen nur die Server-Logs. Die meisten Analytics-Tools filtern Bots dagegen komplett heraus.",
    points: [
      {
        title: "Training, Suche und Nutzerabrufe unterscheiden sich",
        body: "GPTBot sammelt Trainingsdaten, OAI-SearchBot baut einen Suchindex auf, ChatGPT-User ruft Seiten live für einen Nutzer ab. Jeder Bot verrät etwas anderes.",
      },
      {
        title: "Gefälschte Bots verzerren das Bild",
        body: "Jeder kann einen GPTBot-User-Agent senden. Der Abgleich der IP-Adresse mit den veröffentlichten Bereichen des Betreibers trennt echte Crawler von Scrapern.",
      },
      {
        title: "Fehler kosten Zitate",
        body: "Ein Crawler, der auf wichtigen Seiten 404-Fehler, Weiterleitungsketten oder Serverfehler bekommt, hat nichts zu zitieren. Statuscodes je Bot zeigen, wo Sie ansetzen.",
      },
    ],
  },
  capabilities: {
    eyebrow: "Was Sie bekommen",
    title: "Jeder Besuch eines KI-Crawlers –",
    muted: "verifiziert und aufgeschlüsselt.",
    items: [
      {
        icon: "bot",
        title: "27 Crawler, nach Zweck gruppiert",
        body: "Bots von OpenAI, Anthropic, Perplexity, Google, Microsoft, Apple, Meta, Amazon und weiteren – gekennzeichnet als Training, Suchindex, nutzerausgelöst oder SEO-Tool.",
      },
      {
        icon: "shield-check",
        title: "IP-Verifizierung",
        body: "Anfragen der Crawler von OpenAI, Anthropic, Perplexity, Google, Microsoft und Apple werden mit deren veröffentlichten IP-Bereichen abgeglichen, gefälschte Besuche separat gezählt.",
      },
      {
        icon: "chart",
        title: "Besuche pro Tag und pro Bot",
        body: "Tägliche Crawler-Besuche, eindeutige URLs und Trends gegenüber dem Vorzeitraum – plus der Zeitpunkt, an dem jeder Bot zuletzt da war.",
      },
      {
        icon: "file-text",
        title: "Gecrawlte Seiten",
        body: "Welche URLs jeder Crawler wie oft abgerufen hat – so sehen Sie, ob Preis-, Produkt- und Doku-Seiten gelesen werden.",
      },
      {
        icon: "gauge",
        title: "Antwortverhalten",
        body: "Statuscodes je Crawler – Erfolg, Weiterleitung, Client- und Serverfehler –, um Seiten zu finden, die nur für Bots scheitern.",
      },
      {
        icon: "server",
        title: "Logs, CDN oder API",
        body: "Laden Sie Logs von nginx, Apache, Cloudflare, Akamai oder als NDJSON hoch, streamen Sie per Cloudflare Worker, Logpush oder Akamai DataStream 2 – oder senden Sie NDJSON aus jedem Backend.",
      },
    ],
  },
  steps: {
    eyebrow: "So funktioniert es",
    title: "Von rohen Logs zum Crawler-Report",
    muted: "in drei Schritten.",
    items: [
      {
        title: "Datenquelle wählen",
        body: "Laden Sie ein Logfile hoch, richten Sie den Cloudflare Worker in jedem Tarif ein, nutzen Sie Logpush oder Akamai DataStream 2 – oder liefern Sie Logs über nginx, Vector oder Fluent Bit.",
      },
      {
        title: "AutoSEO filtert und verifiziert",
        body: "Gespeichert werden nur Crawler-Anfragen. Jede wird einem Bot zugeordnet, wo möglich mit veröffentlichten IP-Bereichen abgeglichen und dedupliziert.",
      },
      {
        title: "Lücken finden und beheben",
        body: "Sehen Sie, welche Bots wichtige Seiten auslassen oder auf Fehler stoßen, und finden Sie mit einem Crawlability-Check die Ursache.",
      },
    ],
  },
  faq: [
    {
      q: "Was ist KI-Bot-Traffic?",
      a: "KI-Bot-Traffic sind die Anfragen von KI-Crawlern an Ihre Website: Trainings-Crawler wie GPTBot und ClaudeBot, Such-Crawler wie OAI-SearchBot und PerplexityBot sowie nutzerausgelöste Abrufe wie ChatGPT-User, die eine Seite laden, während sie eine Frage beantworten. Er taucht in Server-Logs auf, nicht in der normalen Web-Analyse.",
    },
    {
      q: "Wie sehe ich, ob ChatGPT meine Website crawlt?",
      a: "Suchen Sie in Ihren Server- oder CDN-Logs nach GPTBot, OAI-SearchBot und ChatGPT-User. AutoSEO übernimmt das für Sie: Laden Sie ein Logfile hoch oder verbinden Sie Cloudflare, Akamai oder einen Log-Shipper, und Sie sehen jeden Besuch dieser Crawler mit den abgerufenen Seiten und Statuscodes.",
    },
    {
      q: "Welche KI-Crawler erkennt AutoSEO?",
      a: "27 User-Agents, darunter GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Perplexity-User, Googlebot, GoogleOther, Bingbot, Applebot, Meta-ExternalAgent, Bytespider, Amazonbot, DuckAssistBot, MistralAI-User und CCBot. SEO-Crawler wie AhrefsBot und SemrushBot werden zum Vergleich angezeigt.",
    },
    {
      q: "Wie funktioniert die Bot-Verifizierung?",
      a: "OpenAI, Anthropic, Perplexity, Google, Microsoft und Apple veröffentlichen die IP-Bereiche ihrer Crawler. AutoSEO lädt diese Listen und prüft die IP-Adresse jeder Anfrage. Ein Besuch, der sich als GPTBot ausgibt, aber von einer unbekannten Adresse kommt, gilt als nicht verifiziert.",
    },
    {
      q: "Bremst der Cloudflare Worker meine Website aus?",
      a: "Der Worker gibt jede Antwort unverändert weiter und meldet Bot-Besuche im Hintergrund. Im Cloudflare-Enterprise-Tarif können Sie stattdessen Logpush nutzen, das Logs sendet, ohne Anfragen überhaupt zu berühren.",
    },
    {
      q: "Geht das auch ohne Zugriff auf das CDN?",
      a: "Ja. Laden Sie Access-Logs von nginx, Apache oder anderen Servern unkomprimiert oder als gzip mit bis zu 1 GB hoch, oder senden Sie NDJSON mit einem Projekt-Token an die Ingest-API. Connectoren für Fastly und AWS CloudFront sind als „demnächst“ gelistet.",
    },
    {
      q: "Ist die Analyse des KI-Bot-Traffics kostenlos?",
      a: "Die Bot-Traffic-Analyse ist Teil der Open-Source-App AutoSEO und beim Self-Hosting mit allen Funktionen kostenlos. AutoSEO Cloud bietet Ihnen einen verwalteten Workspace für 50\u00a0$ pro Monat, KI- und Datennutzung im Wert von 10\u00a0$ inklusive. Logfile-Uploads und die Connectoren für Cloudflare und Akamai kosten nichts extra.",
    },
  ],
  related: ["ai-crawlability", "ai-traffic-analytics", "site-audit", "ai-citation-tracking"],
  cta: {
    title: "Sehen Sie, welche KI-Crawler Ihre Website lesen",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies FeaturePage;
