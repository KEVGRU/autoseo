import type { IntegrationPage } from "../../types";

export default {
  slug: "matomo",
  name: "Matomo",
  nav: "Matomo",
  summary: "Besuche aus ChatGPT, Perplexity und anderen KI-Plattformen aus Ihrem Matomo importieren.",
  meta: {
    title: "Matomo: KI-Traffic von ChatGPT & Co. messen",
    description:
      "Verbinden Sie Matomo mit AutoSEO und sehen Sie Besuche, Zielerreichungen und Umsatz aus ChatGPT, Perplexity & Co. – selbst gehostet oder in der Matomo Cloud.",
  },
  hero: {
    subtitle:
      "Verbinden Sie Ihr selbst gehostetes Matomo oder Matomo Cloud mit einem Auth-Token mit Lesezugriff und sehen Sie, welche KI-Assistenten Besucher schicken, wo sie landen und ob sie konvertieren – direkt neben Ihrem organischen Such-Traffic.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Matomo-Integration",
    items: [
      "Funktioniert mit selbst gehostetem Matomo und Matomo Cloud",
      "Besuche aus 19 KI-Plattformen, erkannt anhand der Referrer-URL",
      "Einstiegsseite, Land, Interaktion, Zielerreichungen und E-Commerce-Umsatz je KI-Besuch",
      "Ein Vergleich von KI-Besuchern und organischer Suche aus derselben Matomo-Website",
      "Bis zu 16 Monate Historie beim ersten Sync, danach tägliche Updates",
      "Lesezugriff genügt – das Token wird im Request-Body gesendet, nie in der URL",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Matomo und AutoSEO",
    items: [
      {
        icon: "chart",
        title: "KI-Traffic ohne Google Analytics messen",
        body: "Behalten Sie Ihr datenschutzfreundliches Analytics-Setup und sehen Sie trotzdem, wie viele Besucher ChatGPT, Perplexity, Claude, Gemini und Copilot schicken.",
      },
      {
        icon: "trending-up",
        title: "KI-Besucher mit organischer Suche vergleichen",
        body: "Sehen Sie Besuche aus KI-Plattformen neben Besuchen aus Suchmaschinen derselben Website – gemessen mit derselben Definition von Interaktion.",
      },
      {
        icon: "euro",
        title: "Sehen, was KI-Besuche wert sind",
        body: "Zielerreichungen und E-Commerce-Bestellungen aus KI-Besuchen zeigen, ob dieser Traffic zu Ergebnissen führt.",
      },
      {
        icon: "file-text",
        title: "Die Seiten finden, die KI empfiehlt",
        body: "Die Einstiegsseiten von KI-Besuchern zeigen, auf welche Inhalte Assistenten verlinken – und wo Sie als Nächstes investieren sollten.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Matomo in vier Schritten verbinden –",
    muted: "mit einem Token mit Lesezugriff.",
    items: [
      {
        title: "Auth-Token erstellen",
        body: "Öffnen Sie in Matomo Administration → Persönlich → Sicherheit → Auth-Tokens und erstellen Sie ein Token für einen Benutzer mit Ansichtszugriff auf die Website.",
      },
      {
        title: "Analytics-Einstellungen öffnen",
        body: "Öffnen Sie in Ihrem AutoSEO-Projekt Analytics → Human Traffic → Settings oder Integrations → Matomo.",
      },
      {
        title: "URL, Site-ID und Token eingeben",
        body: "Geben Sie die Basis-URL Ihres Matomo (ohne index.php), die numerische Site-ID und das Token ein und testen Sie die Verbindung.",
      },
      {
        title: "Ersten Sync abwarten",
        body: "AutoSEO importiert im Hintergrund bis zu 16 Monate Besuche aus KI-Plattformen und synchronisiert danach täglich.",
      },
    ],
  },
  faq: [
    {
      q: "Wie tracke ich ChatGPT-Traffic in Matomo?",
      a: "Verbinden Sie Matomo mit Ihrer Matomo-URL, der Site-ID und einem Auth-Token mit AutoSEO. AutoSEO lädt Besuche, deren Referrer ChatGPT oder eine andere KI-Plattform ist, und zeigt sie mit Einstiegsseiten, Zielerreichungen und Umsatz – ohne Matomo-Segmente oder Plugins.",
    },
    {
      q: "Funktioniert das mit selbst gehostetem Matomo?",
      a: "Ja, solange Ihr AutoSEO-Server die Matomo-URL erreicht. Auf einer selbst gehosteten AutoSEO-Instanz kann ein Admin Matomo-Hosts im privaten Netzwerk unter Admin → Authentication freigeben; AutoSEO Cloud verbindet sich nur mit öffentlichen Adressen.",
    },
    {
      q: "Welche Matomo-Berechtigungen braucht AutoSEO?",
      a: "Ansichtszugriff auf die Website genügt. AutoSEO ruft nur die Reporting API von Matomo auf, und das Token wird mit AES-256-GCM verschlüsselt in der Datenbank von AutoSEO gespeichert.",
    },
    {
      q: "Welche KI-Plattformen erkennt AutoSEO in Matomo?",
      a: "19 Plattformen, darunter ChatGPT, Perplexity, Google Gemini, Claude, Copilot, Meta AI, DeepSeek, Grok und Mistral Le Chat. Besuche werden anhand der Referrer-URL zugeordnet.",
    },
    {
      q: "Wie oft werden die Matomo-Daten synchronisiert?",
      a: "Täglich. Der erste Sync importiert bis zu 16 Monate Historie, und in den Einstellungen können Sie jederzeit einen Sync manuell starten.",
    },
  ],
  cta: {
    title: "Sehen Sie, was KI-Traffic wert ist",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
