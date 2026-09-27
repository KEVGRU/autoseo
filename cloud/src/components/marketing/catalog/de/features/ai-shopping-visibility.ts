import type { FeaturePage } from "../../types";

export default {
  slug: "ai-shopping-visibility",
  nav: "KI-Shopping-Sichtbarkeit",
  summary: "Tracken Sie, welche Produkte KI-Engines empfehlen und in Shopping-Karten zeigen.",
  meta: {
    title: "ChatGPT Shopping: Produkt-Sichtbarkeit tracken",
    description:
      "Sehen Sie, welche Produkte ChatGPT-Shopping-Karten und Google AI Overviews zu Ihren Prompts zeigen – mit Preisen, Shops und den Marken Ihrer Wettbewerber.",
  },
  hero: {
    eyebrow: "KI-Shopping-Sichtbarkeit",
    title: "Produkt-Sichtbarkeit in ChatGPT Shopping & Co.",
    muted: "Sehen Sie, was die KI Käufern zeigt.",
    subtitle:
      "AutoSEO erfasst die Produkte, die KI-Engines in ihren Antworten nennen, und die Shopping-Karten, die sie anzeigen – von der ChatGPT-App bis zu Google AI Overviews – mit Preisen, Bewertungen, Shops und den Marken dahinter.",
  },
  visual: "products",
  stats: [
    { value: 4, label: "Engines mit Shopping-Daten", note: "ChatGPT-App, AI Overviews, AI Mode, Copilot" },
    { value: 16, label: "Engines für Produktnennungen", note: "Im Antworttext genannte Produkte" },
    { value: 143, label: "Märkte", note: "Preise und Shops je Land" },
    { value: 0, prefix: "$", label: "Self-Hosting", note: "MIT-Lizenz, alle Funktionen" },
  ],
  why: {
    eyebrow: "Warum das wichtig ist",
    title: "Die KI empfiehlt Produkte,",
    muted: "nicht nur Marken.",
    body: "Fragen Sie einen Assistenten nach dem besten Laufschuh oder einem leisen Geschirrspüler, antwortet er mit konkreten Modellen, Preisen und Bezugsquellen. Stehen Ihre Produkte nicht in dieser Liste, sehen Käufer mit genau dieser Frage sie nicht.",
    points: [
      {
        title: "Shopping-Karten kommen mit der Antwort",
        body: "Angezeigte Produktlisten zeigen Preis, Bewertung und Shop direkt neben dem Text. Käufer können vergleichen, bevor sie einen Shop besuchen.",
      },
      {
        title: "Modelle zählen, nicht nur Marken",
        body: "Eine Marke kann sichtbar sein, während ihr bestes Produkt fehlt. Daten auf Produktebene zeigen, welche Modelle die KI tatsächlich empfiehlt.",
      },
      {
        title: "Shops prägen das Angebot",
        body: "Der Händler hinter einer Shopping-Karte bestimmt Preis und Verfügbarkeit, die Käufer sehen. Wenn Sie wissen, welche Shops die KI zeigt, können Sie diese Listings gezielt pflegen.",
      },
    ],
  },
  capabilities: {
    eyebrow: "Was Sie tracken",
    title: "Jedes Produkt, das die KI zeigt,",
    muted: "in einer Liste.",
    items: [
      {
        icon: "shopping-bag",
        title: "Produkte in KI-Antworten",
        body: "Im Antworttext genannte Produkte und Produkte aus angezeigten Shopping-Listen – zusammengeführt in einer Liste mit Auftritten und Veränderungen über die Zeit.",
      },
      {
        icon: "chart",
        title: "Preise, Bewertungen und Rezensionen",
        body: "Aktueller und früherer Preis, Währung, Bewertung und Anzahl der Rezensionen, wie in der Shopping-Karte angezeigt.",
      },
      {
        icon: "store",
        title: "Shops und Händler",
        body: "Aus welchen Shops die KI Produkte zeigt – mit Auftritten, Anteil, Produktanzahl und Durchschnittspreis sowie Preisen je Shop für jedes Produkt.",
      },
      {
        icon: "swords",
        title: "Marken hinter den Produkten",
        body: "Wessen Produkte die KI am häufigsten empfiehlt – mit Produktanzahl, Erwähnungen, Sentiment und Anteil, zugeordnet zu Ihrer Marke und Ihren getrackten Wettbewerbern.",
      },
      {
        icon: "list-checks",
        title: "Produkteigenschaften",
        body: "Wichtige Fakten, die eine Antwort zu einem Produkt nennt, etwa Preis oder Kapazität – aus dem Text extrahiert.",
      },
      {
        icon: "search",
        title: "Prompts und Engines",
        body: "Für jedes Produkt: die Prompts und Engines, in denen es erscheint, die letzten Auftritte und der Verlauf über die Zeit.",
      },
    ],
  },
  steps: {
    eyebrow: "So funktioniert es",
    title: "Vom Kauf-Prompt zu Produktdaten",
    muted: "in drei Schritten.",
    items: [
      {
        title: "Kauf-Prompts tracken",
        body: "Hinterlegen Sie die Produktfragen Ihrer Käufer und aktivieren Sie die ChatGPT-App, Google AI Overviews, AI Mode oder Copilot über DataForSEO.",
      },
      {
        title: "AutoSEO extrahiert die Produkte",
        body: "Shopping-Karten werden mit Preis, Bewertung und Shop ausgelesen. Ein KI-Durchlauf ergänzt Produkte aus dem Antworttext und ordnet Marken Ihnen und Ihren Wettbewerbern zu.",
      },
      {
        title: "Vergleichen und handeln",
        body: "Sehen Sie, welche Modelle, Preise und Shops in der Antwort auftauchen, filtern Sie nach Engine und Tag und exportieren Sie die Produktliste als CSV.",
      },
    ],
  },
  faq: [
    {
      q: "Was bedeutet Shopping-Sichtbarkeit in der KI-Suche?",
      a: "Shopping-Sichtbarkeit misst, wie oft Ihre Produkte erscheinen, wenn KI-Assistenten Kauffragen beantworten – im Text genannt oder als Karte mit Preis und Shop. AutoSEO trackt beides für Ihre Prompts und vergleicht Ihre Produkte mit denen Ihrer Wettbewerber.",
    },
    {
      q: "Wie tracke ich meine Produkte in ChatGPT Shopping?",
      a: "Hinterlegen Sie produktbezogene Prompts im Tracker und aktivieren Sie die Engine ChatGPT (App) über DataForSEO. AutoSEO speichert die Produktkarten, die ChatGPT anzeigt, mit Preis, Bewertung, Rezensionen und Shop und listet jedes Produkt auf der Seite „Products“.",
    },
    {
      q: "Welche KI-Engines zeigen Shopping-Ergebnisse?",
      a: "AutoSEO erfasst Shopping-Listen aus der ChatGPT-App sowie aus Ergebnissen von Google AI Overviews, Google AI Mode und Microsoft Copilot über DataForSEO. Im Antworttext genannte Produkte extrahiert der KI-Analyseschritt aus jeder getrackten Engine.",
    },
    {
      q: "Sehe ich Produkte und Preise meiner Wettbewerber?",
      a: "Ja. Produkte werden, wo möglich, ihrer Marke zugeordnet. So filtern Sie nach Marke und sehen, wessen Produkte die KI am häufigsten empfiehlt. Die Produktdetails zeigen Preise je Shop und wie oft jedes Produkt erschienen ist.",
    },
    {
      q: "Muss ich meinen Produktkatalog hochladen?",
      a: "Nein. Das Produkt-Tracking arbeitet direkt mit den KI-Antworten. Die Zuordnung zu Ihrer Marke und Ihren Wettbewerbern erfolgt über Markennamen und alternative Schreibweisen.",
    },
    {
      q: "Warum erscheint ein Produkt ohne Preis?",
      a: "Preise, Bewertungen und Shops stammen aus angezeigten Shopping-Karten. Produkte, die nur im Antworttext genannt wurden, haben keine Listing-Daten; AutoSEO kennzeichnet sie als LLM-Nennungen.",
    },
    {
      q: "Ist das Tracking der KI-Shopping-Sichtbarkeit kostenlos?",
      a: "Das Produkt-Tracking ist Teil der Open-Source-App AutoSEO und beim Self-Hosting kostenlos; die Shopping-Daten kommen dann über Ihren eigenen DataForSEO-Account, der die Nutzung direkt abrechnet. AutoSEO Cloud bietet Ihnen einen verwalteten Workspace für 50\u00a0$ pro Monat, KI- und Datennutzung im Wert von 10\u00a0$ inklusive.",
    },
  ],
  related: ["ai-ads-tracking", "ai-competitor-analysis", "ai-brand-sentiment", "ai-visibility-tracking"],
  cta: {
    title: "Sehen Sie, welche Produkte die KI Ihren Käufern empfiehlt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies FeaturePage;
