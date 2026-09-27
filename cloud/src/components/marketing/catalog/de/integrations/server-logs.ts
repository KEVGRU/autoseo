import type { IntegrationPage } from "../../types";

export default {
  slug: "server-logs",
  name: "Server-Logs",
  nav: "Server-Logs / API",
  summary: "KI-Crawler in Logs von nginx, Apache oder jedem Backend auswerten – live oder per Upload.",
  meta: {
    title: "Logfile-Analyse für KI-Crawler",
    description:
      "Finden Sie GPTBot, ClaudeBot und andere KI-Crawler in Ihren Server-Logs – per NDJSON aus nginx, Apache oder jedem Backend oder per Upload bis 1 GB.",
  },
  hero: {
    subtitle:
      "Senden Sie Access-Logs aus nginx, Apache oder jedem Backend an die Ingest-API von AutoSEO – oder laden Sie eine Logdatei hoch – und sehen Sie, welche KI-Crawler Ihre Seiten lesen, wie oft und mit welchen Statuscodes.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Log-Auswertung",
    items: [
      "Eine NDJSON-Ingest-API mit Bearer-Token, gzip-Bodies werden automatisch erkannt",
      "Upload von Logdateien bis 1 GB: nginx, Apache, Cloudflare, Akamai, NDJSON oder IIS, unkomprimiert oder als .gz",
      "Fertige Konfigurationen für nginx, Vector und Fluent Bit",
      "Besuche von 27 bekannten KI-, Such- und SEO-Crawlern; andere Zeilen werden ignoriert",
      "IP-Verifizierung anhand veröffentlichter Crawler-IP-Bereiche, gefälschte Anfragen werden markiert",
      "Doppelte Anfragen werden übersprungen – ein erneut gesendetes Log schadet nicht",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Ihren Server-Logs und AutoSEO",
    items: [
      {
        icon: "server",
        title: "KI-Crawler ohne CDN tracken",
        body: "Sie hosten auf eigenen Servern oder bei einem Anbieter ohne Log-Streaming? Ihre Access-Logs genügen.",
      },
      {
        icon: "download",
        title: "Historie mit einem Upload auswerten",
        body: "Laden Sie das Access-Log des letzten Monats hoch und sehen Sie, welche KI-Crawler Sie besucht haben, bevor Sie den Live-Import eingerichtet haben.",
      },
      {
        icon: "bot",
        title: "Arten von KI-Crawlern unterscheiden",
        body: "Sehen Sie Trainings-Crawler wie GPTBot, Such-Crawler wie OAI-SearchBot und nutzerausgelöste Abrufe wie ChatGPT-User getrennt voneinander.",
      },
      {
        icon: "gauge",
        title: "Fehler für Bots finden",
        body: "Statuscodes pro Anfrage zeigen, welche Seiten KI-Crawler nicht abrufen können – damit Sie sie beheben, bevor sie aus Antworten verschwinden.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "In vier Schritten starten –",
    muted: "live oder per Datei.",
    items: [
      {
        title: "Ingest-Token erstellen",
        body: "Öffnen Sie in Ihrem Projekt Analytics → Bot Traffic → Sync → Server Logs / API und erstellen Sie ein Token. Es wird nur einmal angezeigt.",
      },
      {
        title: "Access-Logs als JSON schreiben",
        body: "Nutzen Sie das nginx-Logformat aus dem Sync-Tab oder senden Sie eigenes NDJSON mit timestamp, user_agent und path – dazu ip und status für Verifizierung und Fehleranalyse.",
      },
      {
        title: "An AutoSEO senden",
        body: "Senden Sie die Zeilen per POST mit Authorization: Bearer und Ihrem Token – oder nutzen Sie die Konfigurationen für Vector und Fluent Bit, die nur Crawler-Anfragen weiterleiten.",
      },
      {
        title: "Oder eine Logdatei hochladen",
        body: "Klicken Sie in Bot Traffic auf Upload Logs, wählen Sie das Format oder lassen Sie es erkennen und laden Sie eine Datei bis 1 GB hoch.",
      },
    ],
  },
  faq: [
    {
      q: "Wie finde ich KI-Crawler in meinen Server-Logs?",
      a: "Laden Sie ein Access-Log in AutoSEO hoch oder senden Sie Ihre Logzeilen an die Ingest-API. AutoSEO erkennt 27 KI-, Such- und SEO-Crawler am User Agent, verifiziert sie anhand ihrer veröffentlichten IP-Bereiche und zeigt Besuche je Bot, Seite und Statuscode.",
    },
    {
      q: "Welche Logformate unterstützt AutoSEO?",
      a: "nginx und Apache im Format combined, common und vhost_combined, Cloudflare-Logpush-JSON, Akamai-DataStream-2-JSON, NDJSON und W3C-Extended-Logs aus IIS – mit einer heuristischen Erkennung für eigene Formate. Uploads können unkomprimiert oder gzip-komprimiert sein.",
    },
    {
      q: "Welche Limits hat die Ingest-API?",
      a: "Bis zu 16 MB und 20.000 Zeilen pro Anfrage sowie 1.200 Anfragen pro Minute und Token. Größere Logdateien laden Sie in der App hoch, jeweils bis 1 GB.",
    },
    {
      q: "Speichert AutoSEO meine vollständigen Access-Logs?",
      a: "Nein. Nur Anfragen bekannter Crawler werden behalten; Zeilen menschlicher Besucher werden ignoriert. Duplikate mit gleichem Bot, Zeitstempel, IP und Pfad werden übersprungen.",
    },
    {
      q: "Wie ist die Ingest-API abgesichert?",
      a: "Jede Anfrage braucht das Ingest-Token Ihres Projekts als Bearer-Token. AutoSEO speichert davon nur einen Hash, und Sie können es jederzeit rotieren oder widerrufen.",
    },
  ],
  cta: {
    title: "Sehen Sie, welche KI-Crawler Ihre Website lesen",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
