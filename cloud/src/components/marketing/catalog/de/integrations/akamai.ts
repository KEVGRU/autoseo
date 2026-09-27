import type { IntegrationPage } from "../../types";

export default {
  slug: "akamai",
  name: "Akamai",
  nav: "Akamai",
  summary: "Besuche von KI-Crawlern aus Akamai DataStream 2 nahezu in Echtzeit an AutoSEO senden.",
  meta: {
    title: "KI-Crawler mit Akamai DataStream 2 tracken",
    description:
      "Senden Sie Logs aus Akamai DataStream 2 an AutoSEO und sehen Sie, welche KI-Crawler wie GPTBot, ClaudeBot und PerplexityBot Ihre Seiten abrufen.",
  },
  hero: {
    subtitle:
      "Leiten Sie einen Stream aus Akamai DataStream 2 an Ihren AutoSEO-Endpunkt und sehen Sie, welche KI-Crawler Ihre Seiten abrufen, welche Statuscodes sie erhalten und ob sie echt sind.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Akamai-Integration",
    items: [
      "Zustellung per DataStream 2 an einen Custom-HTTPS-Endpunkt im JSON-Format, gzip erlaubt",
      "Authentifizierung mit einem Bearer-Token in einem eigenen Header – nur als Hash gespeichert",
      "Besuche von 27 bekannten KI-, Such- und SEO-Crawlern; alle anderen Zeilen werden ignoriert",
      "IP-Verifizierung anhand der IP-Bereiche, die die Betreiber veröffentlichen – gefälschte Anfragen werden markiert",
      "Gecrawlte Seiten, Besuche pro Tag und Antwortstatus für jeden Bot",
      "Daten erscheinen wenige Minuten nach dem Aktivieren des Streams",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Akamai und AutoSEO",
    items: [
      {
        icon: "bot",
        title: "KI-Crawler am Edge sehen",
        body: "Ihr CDN sieht jede Anfrage – auch die, die am Edge aus dem Cache beantwortet werden und nie in Ihren Origin-Logs auftauchen.",
      },
      {
        icon: "shield-check",
        title: "Gefälschte Crawler erkennen",
        body: "Anfragen, deren User Agent sich als GPTBot oder ClaudeBot ausgibt, die aber von außerhalb der veröffentlichten IP-Bereiche kommen, werden als gefälscht markiert.",
      },
      {
        icon: "gauge",
        title: "Fehler für Bots erkennen",
        body: "Statuscodes pro Anfrage zeigen, wann KI-Crawler Weiterleitungen, 4xx- oder 5xx-Antworten statt Ihrer Inhalte erhalten.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Akamai in vier Schritten verbinden –",
    muted: "mit DataStream 2.",
    items: [
      {
        title: "Ingest-Token erstellen",
        body: "Öffnen Sie in Ihrem Projekt Analytics → Bot Traffic → Sync → Akamai und erstellen Sie ein Token. Es wird nur einmal angezeigt.",
      },
      {
        title: "DataStream-2-Stream anlegen",
        body: "Legen Sie im Akamai Control Center einen Stream für Ihre Property an – mit dem Logformat JSON und den Feldern reqTimeSec, cliIP, reqHost, reqMethod, reqPath, queryStr, statusCode, UA und totalBytes.",
      },
      {
        title: "Custom-HTTPS-Ziel festlegen",
        body: "Nutzen Sie die Endpunkt-URL aus AutoSEO, keine Authentifizierung und einen eigenen Header Authorization: Bearer mit Ihrem Token. gzip-Komprimierung ist erlaubt.",
      },
      {
        title: "Stream aktivieren",
        body: "Besuche von Crawlern erscheinen innerhalb weniger Minuten unter Bot Traffic.",
      },
    ],
  },
  faq: [
    {
      q: "Wie tracke ich KI-Crawler mit Akamai?",
      a: "Legen Sie einen Stream in DataStream 2 mit einem Custom-HTTPS-Ziel an, das auf Ihren AutoSEO-Ingest-Endpunkt zeigt und Ihr Ingest-Token im Authorization-Header mitsendet. AutoSEO behält nur Anfragen bekannter Crawler und zeigt sie unter Bot Traffic.",
    },
    {
      q: "Welche Felder aus DataStream 2 braucht AutoSEO?",
      a: "reqTimeSec, cliIP, reqHost, reqMethod, reqPath, queryStr, statusCode, UA und totalBytes im Logformat JSON. Die Client-IP wird gebraucht, um Crawler anhand ihrer veröffentlichten IP-Bereiche zu verifizieren.",
    },
    {
      q: "Speichert AutoSEO alle meine Akamai-Logs?",
      a: "Nein. Zeilen von menschlichen Besuchern und unbekannten Bots werden ignoriert, doppelte Crawler-Anfragen übersprungen. Gespeichert werden nur Besuche der 27 bekannten KI-, Such- und SEO-Crawler.",
    },
    {
      q: "Wie ist der Akamai-Ingest-Endpunkt abgesichert?",
      a: "Jede Anfrage braucht das Ingest-Token Ihres Projekts, das AutoSEO nur als Hash speichert. Sie können das Token jederzeit rotieren oder widerrufen; das alte funktioniert dann sofort nicht mehr.",
    },
  ],
  cta: {
    title: "Sehen Sie, welche KI-Crawler Ihren Edge erreichen",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
