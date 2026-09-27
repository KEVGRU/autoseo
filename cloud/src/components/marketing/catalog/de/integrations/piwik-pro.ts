import type { IntegrationPage } from "../../types";

export default {
  slug: "piwik-pro",
  name: "Piwik PRO",
  nav: "Piwik PRO",
  summary: "Sitzungen, Conversions und Umsatz aus KI-Plattformen aus Piwik PRO importieren.",
  meta: {
    title: "Piwik PRO: KI-Traffic aus ChatGPT & Co. messen",
    description:
      "Verbinden Sie Piwik PRO per API-Client mit AutoSEO und sehen Sie Sitzungen, Zielerreichungen und Umsatz aus ChatGPT, Perplexity und anderen KI-Plattformen.",
  },
  hero: {
    subtitle:
      "Verbinden Sie Piwik PRO mit den Zugangsdaten eines API-Clients und sehen Sie, wie viele Sitzungen ChatGPT, Perplexity, Gemini und andere KI-Assistenten auf Ihre Website bringen – mit Einstiegsseiten, Conversions und einem Vergleich zur organischen Suche.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Piwik-PRO-Integration",
    items: [
      "Anbindung über einen API-Client von Piwik PRO (Client-ID und Secret) – kein Benutzerpasswort",
      "Sitzungen aus 19 KI-Plattformen, gefiltert nach Quelle in der Analytics API von Piwik PRO",
      "Einstiegsseiten, Länder, Absprünge, Verweildauer sowie Ziel- und E-Commerce-Conversions",
      "Umsatz und Seitenaufrufe, sofern Ihr Piwik-PRO-Konto sie bereitstellt",
      "Ein Vergleich von KI-Sitzungen und organischer Suche aus derselben Website",
      "Bis zu 16 Monate Historie beim ersten Sync, danach tägliche Updates",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Piwik PRO und AutoSEO",
    items: [
      {
        icon: "shield-check",
        title: "Datenschutzfreundlichen Stack behalten",
        body: "Messen Sie KI-Traffic in der Analytics-Plattform, die Ihr Datenschutzteam bereits freigegeben hat, statt einen weiteren Tracker einzubauen.",
      },
      {
        icon: "trending-up",
        title: "KI mit organischer Suche vergleichen",
        body: "Sehen Sie Sitzungen aus KI-Plattformen neben organischen Such-Sitzungen derselben Website im selben Zeitraum.",
      },
      {
        icon: "target",
        title: "KI-Traffic mit Conversions verbinden",
        body: "Ziel- und E-Commerce-Conversions je KI-Plattform zeigen, welche Assistenten Besucher schicken, die tatsächlich handeln.",
      },
      {
        icon: "file-text",
        title: "Die Seiten finden, auf die KI verlinkt",
        body: "Die Einstiegsseiten von KI-Sitzungen zeigen, welche Inhalte Assistenten zitieren und wohin sie Menschen schicken.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Piwik PRO in vier Schritten verbinden –",
    muted: "mit API-Client-Zugangsdaten.",
    items: [
      {
        title: "API-Zugangsdaten erstellen",
        body: "Öffnen Sie in Piwik PRO Menu → Profile → API credentials und legen Sie einen Client an. Kopieren Sie Client-ID und Client-Secret.",
      },
      {
        title: "Site-ID ermitteln",
        body: "Öffnen Sie Administration → Sites & apps und kopieren Sie die ID der Website oder App, die Sie auswerten möchten.",
      },
      {
        title: "In AutoSEO verbinden",
        body: "Öffnen Sie in Ihrem Projekt Analytics → Human Traffic → Settings oder Integrations → Piwik PRO, geben Sie Konto-URL, Site-ID, Client-ID und Secret ein und testen Sie die Verbindung.",
      },
      {
        title: "Ersten Sync abwarten",
        body: "AutoSEO importiert im Hintergrund bis zu 16 Monate Sitzungen aus KI-Plattformen und synchronisiert danach täglich.",
      },
    ],
  },
  faq: [
    {
      q: "Wie tracke ich KI-Traffic in Piwik PRO?",
      a: "Verbinden Sie Piwik PRO mit einem API-Client und Ihrer Site-ID mit AutoSEO. AutoSEO fragt Sitzungen ab, deren Quelle ChatGPT, Perplexity oder eine andere KI-Plattform ist, und zeigt sie mit Einstiegsseiten, Conversions und Umsatz.",
    },
    {
      q: "Welche Piwik-PRO-Zugangsdaten braucht AutoSEO?",
      a: "Ihre Konto-URL (zum Beispiel https://ihrefirma.piwik.pro), die ID der Website oder App sowie Client-ID und Secret eines API-Clients mit Zugriff auf diese Website. AutoSEO tauscht sie gegen kurzlebige Zugriffstokens.",
    },
    {
      q: "Warum fehlt der Umsatz für meine Piwik-PRO-Website?",
      a: "Manche Piwik-PRO-Konten lehnen Umsatz- oder Seitenaufruf-Metriken in Abfragen auf Sitzungsebene ab. AutoSEO importiert dann die übrigen Metriken und lässt diese Spalten weg, statt den Sync abzubrechen.",
    },
    {
      q: "Wie oft werden die Daten aus Piwik PRO synchronisiert?",
      a: "Täglich. Der erste Sync importiert bis zu 16 Monate Historie, und in den Einstellungen können Sie jederzeit einen Sync manuell starten.",
    },
    {
      q: "Wo werden meine Piwik-PRO-Zugangsdaten gespeichert?",
      a: "Das Client-Secret wird mit AES-256-GCM verschlüsselt in der Datenbank von AutoSEO gespeichert und nie an den Browser zurückgegeben. Ändern Sie die Konto-URL, wird das gespeicherte Secret verworfen – es gelangt also nie an einen anderen Host.",
    },
  ],
  cta: {
    title: "Sehen Sie, was KI-Traffic wert ist",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
