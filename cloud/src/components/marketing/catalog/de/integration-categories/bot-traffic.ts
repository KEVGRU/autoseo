import type { IntegrationCategoryPage } from "../../types";

export default {
  slug: "bot-traffic",
  nav: "Bot-Traffic-Integrationen",
  summary: "Sehen, welche KI-Crawler Ihre Website lesen – über Cloudflare, Akamai oder Server-Logs.",
  meta: {
    title: "KI-Crawler tracken: Cloudflare, Akamai & Logs",
    description:
      "KI-Crawler tracken mit Cloudflare, Akamai oder Server-Logs: Sehen Sie, welche Seiten GPTBot, ClaudeBot und PerplexityBot abrufen, geprüft per IP-Bereich.",
  },
  hero: {
    eyebrow: "Bot-Traffic-Integrationen",
    title: "KI-Crawler dort tracken, wo sie Ihre Website erreichen.",
    muted: "Im CDN oder in Ihren Logs.",
    subtitle:
      "Verbinden Sie Cloudflare, Akamai oder Ihre Server-Logs, und AutoSEO erfasst jeden Besuch von GPTBot, ClaudeBot, PerplexityBot, Google-Extended und anderen KI-Crawlern – welche Seiten sie abrufen, wie oft und mit welchem Statuscode.",
  },
  benefits: {
    eyebrow: "Was Sie bekommen",
    title: "Sehen Sie, was KI-Engines lesen,",
    muted: "bevor sie antworten.",
    items: [
      {
        icon: "bot",
        title: "Jeder KI-Crawler, nach Zweck",
        body: "Besuche werden nach Crawler, Unternehmen und Zweck gruppiert – Modelltraining, Suchindex oder Abruf für die Frage eines Nutzers. So unterscheiden Sie GPTBot von ChatGPT-User.",
      },
      {
        icon: "shield-check",
        title: "Gefälschte Bots erkannt",
        body: "Anfragen werden mit den IP-Bereichen abgeglichen, die OpenAI, Anthropic, Perplexity, Google, Microsoft und Apple veröffentlichen. Die Listen werden täglich aktualisiert.",
      },
      {
        icon: "file-text",
        title: "Seiten und Fehler je Crawler",
        body: "Sehen Sie die URLs, die jeder Crawler abruft, und die, die mit 4xx oder 5xx scheitern. Wiederholte Fehler werden zu priorisierten Aufgaben.",
      },
      {
        icon: "zap",
        title: "Gestreamt oder hochgeladen",
        body: "Streamen Sie per Cloudflare Worker, Logpush oder Akamai DataStream 2, senden Sie NDJSON aus jedem Backend oder laden Sie Logdateien bis 1 GB hoch.",
      },
    ],
  },
  faq: [
    {
      q: "Wie tracke ich KI-Crawler auf meiner Website?",
      a: "Verbinden Sie eine Log-Quelle: einen Cloudflare Worker oder Logpush, Akamai DataStream 2 oder die Server-Log-API für nginx, Apache oder jedes andere Backend. AutoSEO erkennt KI-Crawler am User-Agent, prüft sie über IP-Bereiche und speichert nur Crawler-Anfragen.",
    },
    {
      q: "Funktioniert die Cloudflare-Integration im kostenlosen Tarif?",
      a: "Ja. Der Cloudflare Worker funktioniert in jedem Tarif; Logpush setzt einen Enterprise-Tarif voraus. Der Worker reicht Antworten unverändert durch und meldet Bot-Besuche im Hintergrund.",
    },
    {
      q: "Kann ich stattdessen Server-Logdateien hochladen?",
      a: "Ja. Laden Sie Access-Logs bis 1 GB hoch, auch gzip-komprimiert – im Combined-Format von nginx oder Apache, im W3C/IIS-Format, als Cloudflare- oder Akamai-JSON oder als NDJSON. Für laufende Daten senden Sie NDJSON an die Ingest-API; Beispiele für nginx, Vector und Fluent Bit finden Sie in der App.",
    },
    {
      q: "Welche KI-Crawler erkennt AutoSEO?",
      a: "Unter anderem GPTBot, OAI-SearchBot und ChatGPT-User von OpenAI, ClaudeBot und Claude-User von Anthropic, PerplexityBot, Google-Extended, Applebot-Extended, Meta-ExternalAgent, Bytespider, Amazonbot und CCBot – dazu Googlebot, Bingbot und gängige SEO-Crawler.",
    },
    {
      q: "Werden Fastly und AWS CloudFront unterstützt?",
      a: "Beide Connectoren folgen demnächst. Bis dahin senden Sie deren Logs über die Server-Log-API oder laden Logdateien hoch.",
    },
    {
      q: "Speichert AutoSEO die Anfragen meiner menschlichen Besucher?",
      a: "Nein. Zeilen von normalen Besuchern werden ignoriert; gespeichert werden nur Anfragen bekannter Crawler, und doppelte Zeilen werden übersprungen.",
    },
    {
      q: "Ist das Tracking von KI-Bots kostenlos?",
      a: "Ja. Alle Bot-Traffic-Connectoren sind Teil der Open-Source-App und kostenlos selbst hostbar. AutoSEO Cloud enthält sie in einem verwalteten Workspace für 50\u00a0$ im Monat, inklusive 10\u00a0$ für KI- und Datennutzung.",
    },
  ],
  cta: {
    title: "Erfahren Sie, welche KI-Crawler Ihre Seiten lesen",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationCategoryPage;
