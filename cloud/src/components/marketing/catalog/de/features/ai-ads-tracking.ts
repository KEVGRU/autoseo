import type { FeaturePage } from "../../types";

export default {
  slug: "ai-ads-tracking",
  nav: "Anzeigen in KI-Antworten",
  summary: "Welche Anzeigen neben KI-Antworten zu Ihren Prompts erscheinen – und wer sie schaltet.",
  meta: {
    title: "Anzeigen in ChatGPT & AI Overviews tracken",
    description:
      "Tracken Sie Anzeigen in KI-Antworten: Welche gesponserten Platzierungen zeigen ChatGPT und Google AI Overviews zu Ihren Prompts, wer wirbt und wie oft?",
  },
  hero: {
    eyebrow: "KI-Ads-Tracking",
    title: "Anzeigen in KI-Antworten tracken.",
    muted: "Sehen Sie, wer für den Platz neben der Antwort zahlt.",
    subtitle:
      "AutoSEO erfasst die gesponserten Platzierungen, die Engines mit ihren Antworten zeigen – in der ChatGPT-App, in Google AI Overviews, AI Mode und Copilot-Ergebnissen – mit Werbetreibendem, Headline, Landingpage und Häufigkeit jeder Anzeige.",
  },
  visual: "products",
  stats: [
    { value: 4, label: "Engines mit Anzeigendaten", note: "ChatGPT-App, AI Overviews, AI Mode, Copilot" },
    { value: 4, label: "Anzeigen-Kennzahlen", note: "Auftritte, Anzeigen, Werbetreibende, Antworten mit Anzeigen" },
    { value: 143, label: "Märkte", note: "Anzeigen je Land und Sprache" },
    { value: 0, prefix: "$", label: "Self-Hosting", note: "MIT-Lizenz, alle Funktionen" },
  ],
  why: {
    eyebrow: "Warum das wichtig ist",
    title: "KI-Antworten können Anzeigen enthalten.",
    muted: "Organische Sichtbarkeit ist nur die halbe Wahrheit.",
    body: "Wo eine KI-Antwort mit gesponserten Ergebnissen erscheint, kann ein Wettbewerber direkt neben Ihrer organischen Erwähnung stehen – oder an ihrer Stelle. Wer Anzeigen zusammen mit Antworten trackt, sieht, wer bei den für Sie wichtigen Fragen für Aufmerksamkeit bezahlt.",
    points: [
      {
        title: "Wettbewerber können den Platz kaufen",
        body: "Eine Anzeige der Konkurrenz neben einer Antwort, die Sie empfiehlt, kann trotzdem den Klick bekommen. Das merken Sie nur, wenn Sie das ganze Ergebnis betrachten.",
      },
      {
        title: "Anzeigentexte verraten die Positionierung",
        body: "Headlines und Beschreibungen zeigen, welche Botschaften und Angebote Wettbewerber zu welchem Thema ausspielen.",
      },
      {
        title: "Paid und organisch gehören zusammen",
        body: "Anzeigen neben Erwähnungen, Zitaten und Produkten zeigen, wo bezahlte Platzierungen Lücken füllen und wo Ihre organische Sichtbarkeit schon ausreicht.",
      },
    ],
  },
  capabilities: {
    eyebrow: "Was Sie tracken",
    title: "Jede Anzeige neben einer KI-Antwort,",
    muted: "und wer dahintersteht.",
    items: [
      {
        icon: "megaphone",
        title: "Anzeigen-Auftritte",
        body: "Wie oft gesponserte Platzierungen zu Ihren Prompts erscheinen und wie viele Antworten Anzeigen enthalten – mit Veränderung zum Vorzeitraum.",
      },
      {
        icon: "building",
        title: "Top-Werbetreibende",
        body: "Wer am meisten wirbt – mit Anzahl der Anzeigen, Auftritten und Anteil sowie Markierungen für Ihre eigene Marke und getrackte Wettbewerber.",
      },
      {
        icon: "eye",
        title: "Anzeigenmotive",
        body: "Headline, Beschreibung, Bild und Landingpage jeder Anzeige – dedupliziert, sodass dasselbe Motiv nur einmal zählt.",
      },
      {
        icon: "trending-up",
        title: "Rang und Bewertung",
        body: "Die durchschnittliche Position jeder Anzeige unter den gesponserten Ergebnissen und ihre Bewertung, sofern die Engine eine anzeigt.",
      },
      {
        icon: "bot",
        title: "Engines und Antworten",
        body: "Welche Engines eine Anzeige zeigen, wie oft sie im Zeitverlauf erschien und mit welchen Prompts und Antworten.",
      },
      {
        icon: "search",
        title: "Filter und Suche",
        body: "Schlüsseln Sie Anzeigen nach Zeitraum, Engine und Prompt-Tag auf oder suchen Sie nach Werbetreibendem und Headline.",
      },
    ],
  },
  steps: {
    eyebrow: "So funktioniert es",
    title: "Vom getrackten Prompt zur Anzeigenübersicht",
    muted: "in drei Schritten.",
    items: [
      {
        title: "Kommerzielle Prompts tracken",
        body: "Hinterlegen Sie die Kauf- und Vergleichsfragen Ihres Markts und aktivieren Sie Engines, die über DataForSEO Anzeigen liefern.",
      },
      {
        title: "AutoSEO erfasst jede Platzierung",
        body: "Gesponserte Ergebnisse werden mit Werbetreibendem, Headline, Landingpage und Position gespeichert und Ihrer Domain bzw. denen Ihrer Wettbewerber zugeordnet.",
      },
      {
        title: "Paid und organisch vergleichen",
        body: "Lesen Sie jede Anzeige zusammen mit der Antwort, neben der sie erschien, und vergleichen Sie die Werbetreibenden mit Ihrem Wettbewerber-Ranking.",
      },
    ],
  },
  faq: [
    {
      q: "Was ist KI-Ads-Tracking?",
      a: "KI-Ads-Tracking erfasst bezahlte Platzierungen, die zusammen mit KI-generierten Antworten erscheinen – etwa gesponserte Ergebnisse in der ChatGPT-App oder Anzeigen in Google AI Overviews. AutoSEO zeigt, wer zu Ihren Prompts wirbt, mit welchen Motiven und wie oft.",
    },
    {
      q: "Wie sehe ich Anzeigen in ChatGPT-Antworten?",
      a: "Aktivieren Sie die Engine ChatGPT (App) über DataForSEO und tracken Sie Ihre Prompts. Enthält die angezeigte ChatGPT-Antwort gesponserte Platzierungen, speichert AutoSEO sie mit Werbetreibendem, Headline und Landingpage und listet sie auf der Seite „Ads“.",
    },
    {
      q: "Für welche KI-Engines werden Anzeigen getrackt?",
      a: "Anzeigen werden aus der ChatGPT-App sowie aus Ergebnissen von Google AI Overviews, Google AI Mode und Microsoft Copilot erfasst, jeweils über DataForSEO. Bei AI Overviews und Copilot gehören auch die Suchanzeigen auf derselben Ergebnisseite dazu.",
    },
    {
      q: "Kann ich sehen, welche Wettbewerber in KI-Antworten werben?",
      a: "Ja. Werbetreibende werden über Domain und Markenname Ihrer Domain und Ihren getrackten Wettbewerbern zugeordnet und im Ranking der Werbetreibenden markiert. Auch Werbetreibende, die Sie nicht tracken, stehen in der Liste – so sehen Sie alle, die zu Ihren Prompts werben.",
    },
    {
      q: "Wie werden doppelte Anzeigen gezählt?",
      a: "Eine Anzeige wird über Werbetreibenden, Headline und Landingpage erkannt, wobei Tracking-Parameter aus der URL entfernt werden. Jeder weitere Auftritt zählt für dieselbe Anzeige – die Zahlen zeigen also Reichweite statt Duplikate.",
    },
    {
      q: "Brauche ich DataForSEO für das Tracking von KI-Anzeigen?",
      a: "Ja. Anzeigen stammen aus den angezeigten Ergebnissen, die DataForSEO für die ChatGPT-App, Google und Bing liefert. In AutoSEO Cloud laufen KI- und Datenfunktionen über die Anbieter, die das Codext-Team angebunden hat; die Nutzung zählt auf die monatlich enthaltenen 10\u00a0$. Beim Self-Hosting verbinden Sie Ihren eigenen DataForSEO-Account, und AutoSEO protokolliert jeden kostenpflichtigen Aufruf, damit Admins Ausgabenlimits festlegen können.",
    },
    {
      q: "Ist KI-Ads-Tracking kostenlos?",
      a: "Das Anzeigen-Tracking ist Teil der Open-Source-App AutoSEO und beim Self-Hosting kostenlos; die DataForSEO-Nutzung rechnet dann DataForSEO ab. AutoSEO Cloud bietet Ihnen einen verwalteten Workspace für 50\u00a0$ pro Monat, KI- und Datennutzung im Wert von 10\u00a0$ inklusive.",
    },
  ],
  related: ["ai-shopping-visibility", "ai-competitor-analysis", "ai-visibility-tracking", "ai-citation-tracking"],
  cta: {
    title: "Sehen Sie, wer in Ihrem Markt neben KI-Antworten wirbt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies FeaturePage;
