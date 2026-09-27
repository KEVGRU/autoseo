import type { IntegrationPage } from "../../types";

export default {
  slug: "cloudflare",
  name: "Cloudflare",
  nav: "Cloudflare",
  summary: "Besuche von KI-Crawlern in Echtzeit per Cloudflare Worker oder Logpush erfassen.",
  meta: {
    title: "KI-Crawler mit Cloudflare tracken",
    description:
      "Tracken Sie GPTBot, ClaudeBot, PerplexityBot und andere KI-Crawler auf Ihrer Cloudflare-Zone in Echtzeit – per Worker in jedem Tarif oder Logpush (Enterprise).",
  },
  hero: {
    subtitle:
      "Stellen Sie einen kleinen Cloudflare Worker bereit – oder leiten Sie Logpush im Enterprise-Tarif an AutoSEO – und sehen Sie, welche KI-Crawler Ihre Seiten besuchen, wie oft und mit welchen Statuscodes.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Cloudflare-Integration",
    items: [
      "Ein Worker für jeden Cloudflare-Tarif, Logpush für Enterprise-Zonen",
      "Besuche von 27 bekannten KI-, Such- und SEO-Crawlern in Echtzeit, darunter GPTBot, ClaudeBot und PerplexityBot",
      "IP-Verifizierung anhand der IP-Bereiche, die die Betreiber veröffentlichen – gefälschte Anfragen werden markiert",
      "Gecrawlte Seiten, Besuche pro Tag und Antwortstatus für jeden Bot",
      "Antworten bleiben unverändert – die Meldung läuft im Hintergrund",
      "Ein Ingest-Token, das nur als Hash gespeichert wird und sich jederzeit rotieren lässt",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Cloudflare und AutoSEO",
    items: [
      {
        icon: "bot",
        title: "Sehen, welche KI-Crawler Ihre Website lesen",
        body: "Finden Sie heraus, ob GPTBot, ClaudeBot, PerplexityBot und Google-Extended Ihre Seiten tatsächlich abrufen – und wie oft.",
      },
      {
        icon: "shield-check",
        title: "Echte Bots von Fälschungen trennen",
        body: "Jede Anfrage wird mit den veröffentlichten IP-Bereichen des Betreibers abgeglichen, damit gefälschte User Agents Ihre Zahlen nicht verzerren.",
      },
      {
        icon: "gauge",
        title: "Crawl-Fehler früh erkennen",
        body: "Statuscodes pro Anfrage zeigen, wann KI-Crawler auf Weiterleitungen oder Fehler statt auf Ihre Inhalte stoßen.",
      },
      {
        icon: "file-text",
        title: "Prüfen, ob neue Seiten gecrawlt werden",
        body: "Kontrollieren Sie nach dem Veröffentlichen oder Aktualisieren von Inhalten in der Liste der gecrawlten Seiten, ob KI-Crawler sie abrufen.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Cloudflare in vier Schritten verbinden –",
    muted: "in jedem Tarif.",
    items: [
      {
        title: "Ingest-Token erstellen",
        body: "Öffnen Sie in Ihrem Projekt Analytics → Bot Traffic → Sync → Cloudflare und erstellen Sie ein Token. Es wird nur einmal angezeigt.",
      },
      {
        title: "Worker bereitstellen",
        body: "Laden Sie das Worker-Skript herunter – es enthält keine Secrets – und deployen Sie es mit Wrangler oder im Cloudflare-Dashboard. Hinterlegen Sie das Token als Secret AUTOSEO_TOKEN.",
      },
      {
        title: "Route hinzufügen",
        body: "Leiten Sie Ihre Website mit einer Workers Route wie example.com/* durch den Worker. Antworten werden unverändert durchgereicht.",
      },
      {
        title: "Bot-Besuche verfolgen",
        body: "Anfragen von Crawlern werden gemeldet, sobald sie eintreffen. Im Enterprise-Tarif kann ein Logpush-Job an AutoSEO den Worker ersetzen.",
      },
    ],
  },
  faq: [
    {
      q: "Wie tracke ich KI-Crawler mit Cloudflare?",
      a: "Erstellen Sie in AutoSEO ein Ingest-Token, stellen Sie den AutoSEO-Worker mit diesem Token als Secret bereit und legen Sie eine Route für Ihre Website an. Danach wird jede Anfrage eines bekannten KI- oder Such-Crawlers in Echtzeit an AutoSEO gemeldet.",
    },
    {
      q: "Verändert der Worker meine Antworten?",
      a: "Nein. Er leitet jede Anfrage an Ihren Origin weiter und gibt die Antwort unverändert zurück. Nur Anfragen bekannter Crawler-User-Agents lösen eine Meldung im Hintergrund aus, und eine fehlgeschlagene Meldung beeinträchtigt die Seite nie.",
    },
    {
      q: "Brauche ich einen Cloudflare-Enterprise-Tarif?",
      a: "Nein. Der Worker läuft in jedem Cloudflare-Tarif; seine Anfragen zählen zu Ihrem normalen Workers-Kontingent. Logpush ist eine Alternative für Enterprise-Zonen, die HTTP-Request-Logs als komprimiertes NDJSON sendet – gespeichert werden nur Crawler-Anfragen.",
    },
    {
      q: "Welche Crawler erkennt AutoSEO?",
      a: "27 KI-, Such- und SEO-Crawler, darunter GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, Googlebot, Bingbot, Applebot-Extended, Meta-ExternalAgent, Bytespider und CCBot. Jeder andere Traffic wird ignoriert.",
    },
    {
      q: "Welche Daten sendet der Worker an AutoSEO?",
      a: "Eine Zeile pro Crawler-Anfrage: Zeitstempel, IP-Adresse, Methode, Host, Pfad, Statuscode, User Agent und Antwortgröße. Anfragen menschlicher Besucher werden nicht gemeldet.",
    },
    {
      q: "Was, wenn meine Website nicht über Cloudflare läuft?",
      a: "AutoSEO nimmt auch Akamai DataStream 2 an, bietet eine NDJSON-Ingest-API für nginx, Apache oder jedes Backend und erlaubt den manuellen Upload von Logdateien bis 1 GB.",
    },
  ],
  cta: {
    title: "Sehen Sie, welche KI-Crawler Ihre Website lesen",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
