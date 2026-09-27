import type { FeaturePage } from "../../types";

export default {
  slug: "rank-tracking",
  nav: "Rank Tracking",
  summary: "Google-Positionen auf Desktop und mobil verfolgen – nach Land oder Stadt.",
  meta: {
    title: "Rank Tracker: Google-Rankings mobil & lokal prüfen",
    description:
      "Google-Rankings auf Desktop und Smartphone nach Land oder Stadt tracken. Open-Source-Rank-Tracker mit täglichen, wöchentlichen oder monatlichen Checks.",
  },
  hero: {
    eyebrow: "Rank Tracker",
    title: "Rank Tracking für die Keywords, die zählen.",
    muted: "Desktop, mobil und lokal.",
    subtitle:
      "Tracken Sie bis zu 1.000 Keywords pro Domain in 143 Märkten, auf Wunsch bis auf Stadtebene. AutoSEO prüft Google täglich, wöchentlich oder monatlich und zeigt Positionen, Gewinner und Verlierer, SERP-Features und einen geschätzten Visibility-Wert – für Ihre Website und Ihre Wettbewerber.",
  },
  visual: "rankchart",
  screenshot: {
    src: "/screenshots/rank-tracking.png",
    alt: "AutoSEO-Rank-Tracking mit Diagramm der Positionsverteilung und Keyword-Positionen im Zeitverlauf",
    url: "seo/rank-tracking",
  },
  stats: [
    { value: 1000, label: "Keywords pro Domain", note: "Bis zu 500 getrackte Domains pro Projekt" },
    { value: 143, label: "Märkte", note: "Land, Sprache und Stadt" },
    { value: 100, label: "SERP-Tiefe", note: "Von 10 bis 100 Ergebnissen" },
    { value: 0, prefix: "$", label: "Self-Hosting", note: "MIT-Lizenz, alle Funktionen" },
  ],
  why: {
    eyebrow: "Warum das wichtig ist",
    title: "Rankings bringen weiterhin die Klicks.",
    muted: "Und sie ändern sich jede Woche.",
    body: "Organische Ergebnisse sind nach wie vor eine zentrale Quelle für Suchtraffic – und Google platziert inzwischen AI Overviews, „Ähnliche Fragen“ und Local Packs darüber. Ein Rank Tracker zeigt Ihnen, wann eine Seite abrutscht, welcher Wettbewerber ihren Platz übernommen hat und was jetzt über Ihnen steht.",
    points: [
      {
        title: "Durchschnitte verbergen Details",
        body: "Die Search Console mittelt Positionen über Suchanfragen, Geräte und Orte. Ein Rank Tracker prüft genau das Keyword, das Gerät und den Ort, die Sie interessieren.",
      },
      {
        title: "Mobil und lokal ranken anders",
        body: "Dasselbe Keyword kann auf dem Desktop auf Seite eins und mobil auf Seite zwei stehen – oder von Stadt zu Stadt anders ranken.",
      },
      {
        title: "Auch Wettbewerber bewegen sich",
        body: "Mit getrackten Wettbewerber-Domains sehen Sie, wer gewinnt, wenn Sie verlieren – und wo Sie zuerst reagieren sollten.",
      },
    ],
  },
  capabilities: {
    eyebrow: "Was Sie tracken",
    title: "Jede Position, die zählt,",
    muted: "Keyword für Keyword.",
    items: [
      {
        icon: "trending-up",
        title: "Positionen auf Desktop und mobil",
        body: "Prüfen Sie jedes Keyword auf dem Desktop, mobil oder beides – mit rankender URL und der Veränderung seit dem letzten Check.",
      },
      {
        icon: "map-pin",
        title: "Land und Stadt",
        body: "Tracken Sie national in 143 Märkten oder wählen Sie eine Stadt, einen Landkreis oder eine Region für lokale Ergebnisse – mit lokalem Suchvolumen.",
      },
      {
        icon: "gauge",
        title: "Visibility, Gewinner und Verlierer",
        body: "Ein geschätzter Anteil der möglichen Klicks, Keywords in den Top 3 und Top 10 und was sich über 1, 7, 30 oder 90 Tage verbessert oder verschlechtert hat.",
      },
      {
        icon: "calendar",
        title: "Verlauf und Trends",
        body: "Ein Diagramm der Positionsverteilung, eine Matrix aller Checks nach Datum mit Pfeilen nach oben und unten und ein Trenddiagramm je Keyword.",
      },
      {
        icon: "eye",
        title: "SERP-Features",
        body: "Sehen Sie, welche Features zu jedem Keyword erscheinen – AI Overviews, Featured Snippets, „Ähnliche Fragen“, Local Packs, Videos, Shopping und mehr.",
      },
      {
        icon: "swords",
        title: "Wettbewerber-Domains",
        body: "Tracken Sie jede beliebige Domain, nicht nur Ihre eigene, und starten Sie mit Keyword-Vorschlägen aus den Rankings, die die Domain bereits hat.",
      },
    ],
  },
  steps: {
    eyebrow: "So funktioniert es",
    title: "Von der Keyword-Liste zum Ranking-Report",
    muted: "in drei Schritten.",
    items: [
      {
        title: "Domain und Markt festlegen",
        body: "Geben Sie Ihre Domain oder die eines Wettbewerbers ein, wählen Sie Land und Sprache, optional eine Stadt, und entscheiden Sie sich für Desktop, mobil oder beides.",
      },
      {
        title: "Keywords und Rhythmus wählen",
        body: "Fügen Sie Ihre Keywords ein oder übernehmen Sie Vorschläge und wählen Sie tägliche, wöchentliche, monatliche oder manuelle Checks. AutoSEO zeigt die geschätzten Kosten pro Check und pro Monat.",
      },
      {
        title: "Positionen und Bewegungen verfolgen",
        body: "Jeder Check wird gespeichert. Vergleichen Sie Zeiträume, filtern Sie nach Position, Suchvolumen oder Difficulty und exportieren Sie die Tabelle als CSV oder nach Google Sheets.",
      },
    ],
  },
  faq: [
    {
      q: "Was ist ein Rank Tracker?",
      a: "Ein Rank Tracker prüft, an welcher Position Ihre Seiten bei Google für eine feste Liste von Keywords erscheinen, und speichert die Positionen im Zeitverlauf. Der Rank Tracker von AutoSEO prüft Desktop- und Mobilergebnisse nach Land oder Stadt und ergänzt Suchvolumen, Difficulty, SERP-Features und die rankende URL.",
    },
    {
      q: "Wie oft werden die Rankings geprüft?",
      a: "Sie legen es je getrackter Domain fest: täglich, wöchentlich, monatlich oder nur, wenn Sie den Check manuell starten. Geplante Checks laufen über die Standard-Task-Queue von DataForSEO und kosten rund 30\u00a0% eines Live-Checks.",
    },
    {
      q: "Kann ich lokale Rankings nach Stadt tracken?",
      a: "Ja. Zusätzlich zum Land können Sie eine Stadt, einen Landkreis oder eine Region wählen, und AutoSEO prüft die Ergebnisse für genau diesen Ort. Die Keyword-Tabelle zeigt dann das lokale Suchvolumen.",
    },
    {
      q: "Kann ich die Rankings meiner Wettbewerber tracken?",
      a: "Ja. Jede Domain kann eine getrackte Domain sein – Sie verfolgen Wettbewerber also mit denselben Keywords, Märkten und Geräten wie Ihre eigene Website. Ein Projekt kann bis zu 500 Domains tracken.",
    },
    {
      q: "Wie viele Keywords kann ich tracken?",
      a: "Bis zu 1.000 Keywords pro getrackter Domain und bis zu 500 getrackte Domains pro Projekt. Tägliche und monatliche Ausgabenlimits halten die Datenkosten im Rahmen.",
    },
    {
      q: "Zeigt der Rank Tracker AI Overviews an?",
      a: "Ja. AutoSEO markiert die SERP-Features jeder Ergebnisseite, darunter AI Overviews, Featured Snippets und „Ähnliche Fragen“. Was AI Overviews tatsächlich über Ihre Marke sagen, zeigt Ihnen das AI Visibility Tracking.",
    },
    {
      q: "Was kostet Rank Tracking?",
      a: "Rank Tracking ist Teil der kostenlosen Open-Source-App AutoSEO. Jeder SERP-Check ist eine kostenpflichtige DataForSEO-Anfrage, deren Preis von der Zahl der Keywords, den Geräten und der Tracking-Tiefe abhängt; AutoSEO zeigt eine Schätzung, bevor Sie einen Zeitplan speichern. Beim Self-Hosting rechnet DataForSEO direkt mit Ihnen ab; AutoSEO Cloud bietet Ihnen einen verwalteten Workspace für 50\u00a0$ pro Monat, KI- und Datennutzung im Wert von 10\u00a0$ inklusive.",
    },
  ],
  related: ["keyword-research", "site-audit", "ai-visibility-tracking", "report-builder"],
  cta: {
    title: "Wissen, wo Sie ranken – jede Woche",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies FeaturePage;
