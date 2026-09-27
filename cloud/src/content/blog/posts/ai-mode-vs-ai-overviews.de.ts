import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "ai-mode-vs-ai-overviews",
  title: "Google AI Mode vs. AI Overviews: Unterschiede und Messung",
  description:
    "AI Overviews erscheinen in den Suchergebnissen, AI Mode ist eine eigene Dialogsuche. Die Unterschiede, die Zählweise in der Search Console und die Messung.",
  date: "2026-09-26",
  authorSlug: "autoseo-team",
  tags: ["google", "ai-search", "measurement"],
  readingMinutes: 13,
  lead: "AI Overviews (auf Deutsch „Übersicht mit KI“) sind eine KI-Zusammenfassung, die Google in manche normale Ergebnisseiten einfügt; AI Mode (KI-Modus) ist ein eigener, dialogorientierter Suchmodus, in dem die KI-Antwort das Ergebnis ist und jede Nachfrage als neue Suchanfrage zählt. Beide können mit unterschiedlichen Gemini-Modellen arbeiten und verlinken unterschiedliche Quellen, deshalb sollten Sie sie getrennt messen. Die Search Console rechnet beide in den Suchtyp „Web“ ein; der neue Leistungsbericht zu generativen KI-Funktionen zeigt Impressionen, aber keine Klicks, keine Suchanfragen und keine Trennung der beiden Funktionen. Welche Seiten die jeweilige Funktion zitiert, sehen Sie nur, wenn Sie die Prompts selbst abfragen.",
  blocks: [
    { type: "h2", text: "Worin unterscheiden sich AI Overviews und AI Mode?" },
    {
      type: "p",
      text: "Google beschreibt beide über ihre Aufgabe. AI Overviews sollen helfen, schneller den Kern eines komplexen Themas zu erfassen, und erscheinen nur dann auf der normalen Ergebnisseite, wenn Googles Systeme sie für einen Mehrwert halten; deshalb werden sie laut Google oft gar nicht ausgelöst. AI Mode ist für Anfragen gedacht, die weitere Recherche, Schlussfolgern oder komplexe Vergleiche erfordern ([Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)). Den KI-Modus öffnen Nutzer bewusst: über den Tab auf google.com, über google.com/ai oder in der Google-App ([Google Search Help](https://support.google.com/websearch/answer/16011537)).",
    },
    {
      type: "p",
      text: "Die Grenze verschwimmt. Seit Januar 2026 führt eine Nachfrage aus einer AI Overview direkt in den AI Mode ([Google, 2026](https://blog.google/products-and-platforms/products/search/ai-mode-ai-overviews-updates/)); im Mai 2026 meldete Google, dass dieser Übergang weltweit auf Desktop und Mobilgeräten verfügbar ist ([Google, 2026](https://blog.google/products-and-platforms/products/search/search-io-2026/)). Für die Messung bleiben es zwei Oberflächen mit unterschiedlichen Auslösern, Modellen und Links.",
    },
    {
      type: "table",
      head: ["Merkmal", "AI Overviews", "AI Mode", "Quelle (Jahr)"],
      rows: [
        [
          "Einstieg",
          "Wird in die normale Ergebnisseite eingefügt, wenn Google einen Mehrwert sieht; fehlt oft",
          "Eigener Modus: Tab „KI-Modus“, google.com/ai, Google-App",
          "[Google Search Central (2025)](https://developers.google.com/search/docs/appearance/ai-features); [Google Search Help (2026)](https://support.google.com/websearch/answer/16011537)",
        ],
        [
          "Interaktion",
          "Eine Zusammenfassung; eine Nachfrage wechselt in den AI Mode",
          "Dialog mit Nachfragen; Eingabe per Text, Sprache, Bild oder Datei",
          "[Google (2026)](https://blog.google/products-and-platforms/products/search/ai-mode-ai-overviews-updates/); [Google Search Help (2026)](https://support.google.com/websearch/answer/16011537)",
        ],
        [
          "Query Fan-out",
          "Kann Fan-out nutzen",
          "Zerlegt die Frage in Unterthemen und sucht parallel; Deep Search kann Hunderte Suchen auslösen",
          "[Google Search Central (2025)](https://developers.google.com/search/docs/appearance/ai-features); [Google (2025)](https://blog.google/products/search/google-search-ai-mode-update/)",
        ],
        [
          "Standardmodell (letzte offizielle Angabe)",
          "Gemini 3, weltweit Standard seit Januar 2026",
          "Gemini 3.5 Flash, weltweit Standard seit Mai 2026; Gemini 3 Pro für einen Teil der Nutzer wählbar",
          "[Google (2026)](https://blog.google/products-and-platforms/products/search/ai-mode-ai-overviews-updates/); [Google (2026)](https://blog.google/products-and-platforms/products/search/search-io-2026/)",
        ],
        [
          "Verfügbarkeit",
          "Über 200 Märkte; in Deutschland seit März 2025 (Deutsch und Englisch)",
          "Über 200 Länder und Gebiete seit Oktober 2025; Deutschland gelistet, Deutsch unterstützt",
          "[Google Ads Help (2026)](https://support.google.com/google-ads/answer/16297775); [Google (2025)](https://blog.google/feed/were-bringing-the-helpfulness-of-ai-overviews-to-more-countries-in-europe/); [Google (2025)](https://blog.google/products-and-platforms/products/search/ai-mode-expands-languages-locations/)",
        ],
        [
          "Links in der Search Console",
          "Die AI Overview belegt eine Position; alle ihre Links erhalten diese Position",
          "Position nach den Regeln der normalen Ergebnisseite; Nachfrage = neue Suchanfrage",
          "[Search Console Help (2026)](https://support.google.com/webmasters/answer/7042828)",
        ],
        [
          "Anzeigen",
          "Über oder unter der AI Overview in allen Märkten; innerhalb nur auf Englisch in 12 Ländern (nicht Deutschland)",
          "Test in den USA",
          "[Google Ads Help (2026)](https://support.google.com/google-ads/answer/16297775); [Google Ads Help (2025)](https://support.google.com/google-ads/answer/16756291)",
        ],
        [
          "Reichweite (Angaben von Google)",
          "Über 2,5 Milliarden monatlich aktive Nutzer",
          "Über eine Milliarde monatliche Nutzer",
          "[Google (2026)](https://blog.google/products-and-platforms/products/search/new-controls-website-owners/)",
        ],
      ],
      caption: "Stand: September 2026. Modelle, Verfügbarkeit und Anzeigenformate ändern sich häufig; den aktuellen Stand zeigen die verlinkten Seiten.",
    },

    { type: "h2", text: "Wie entstehen die Antworten in AI Overviews und AI Mode?" },
    {
      type: "p",
      text: "Beide greifen auf den Google-Suchindex zu. Googles [Leitfaden zur Optimierung für generative KI-Funktionen](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) nennt zwei Techniken: Retrieval-augmented Generation (Grounding), bei der die Kern-Rankingsysteme der Suche passende Seiten abrufen, und Query Fan-out, also parallele, verwandte Suchanfragen, die das Modell selbst erzeugt. Googles Beispiel: Aus „how to fix a lawn that's full of weeds“ können Teilanfragen wie „best herbicides for lawns“ oder „how to prevent weeds in lawn“ werden.",
    },
    {
      type: "p",
      text: "Eine Seite kann also für eine Teilanfrage zitiert werden, für die sie rankt, auch wenn sie für die eingetippte Frage nicht rankt. Der AI Mode setzt bewusst darauf: Google zufolge stellt er eine Vielzahl von Suchanfragen gleichzeitig ([Google, 2025](https://blog.google/products/search/google-search-ai-mode-update/)). Die Fan-out-Anfragen veröffentlicht Google für keine der beiden Funktionen; mehr dazu in [Query Fan-out erklärt](/blog/query-fan-out).",
    },
    {
      type: "p",
      text: "Zu den Modellen ist Google eindeutig: AI Mode und AI Overviews können unterschiedliche Modelle und Techniken verwenden, daher unterscheiden sich Antworten und Links ([Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)). Im Mai 2025 kam eine angepasste Version von Gemini 2.5 in den USA in beide Funktionen, im Januar 2026 wurde Gemini 3 Standard für AI Overviews, im Mai 2026 Gemini 3.5 Flash Standard für den AI Mode. Jede Messung beschreibt also eine bestimmte Modellgeneration.",
    },
    {
      type: "p",
      text: "Der AI Mode kann zudem personalisieren: Personal Intelligence berücksichtigt frühere Suchen, sofern Nutzer volljährig sind und den Suchverlauf aktiviert haben ([Google Search Help](https://support.google.com/websearch/answer/16011537)). Ein Tracking-Tool sieht eine nicht personalisierte Antwort, nicht die jedes einzelnen Nutzers.",
    },

    { type: "h2", text: "Wo sind AI Overviews und AI Mode verfügbar, auch in Deutschland?" },
    {
      type: "p",
      text: "AI Overviews starteten zur Google I/O 2024 ([Google, 2025](https://blog.google/products/search/google-search-ai-mode-update/)) und kamen im März 2025 nach Deutschland, Österreich und in die Schweiz, auf Deutsch und Englisch, zunächst für angemeldete Nutzer ab 18 Jahren ([Google, 2025](https://blog.google/feed/were-bringing-the-helpfulness-of-ai-overviews-to-more-countries-in-europe/)). Googles Anzeigen-Dokumentation spricht inzwischen von über 200 Märkten mit AI Overviews ([Google Ads Help](https://support.google.com/google-ads/answer/16297775)).",
    },
    {
      type: "p",
      text: "Der AI Mode wurde im Mai 2025 für alle Nutzer in den USA freigeschaltet. Im Oktober 2025 kamen mehr als 35 Sprachen und über 40 Länder und Gebiete hinzu, insgesamt über 200, darunter viele in Europa ([Google, 2025](https://blog.google/products-and-platforms/products/search/ai-mode-expands-languages-locations/)). Stand September 2026 führt die Hilfeseite zum KI-Modus Deutschland, Österreich und die Schweiz auf, Deutsch gehört zu den unterstützten Sprachen.",
    },
    {
      type: "p",
      text: "Einzelne Funktionen sind enger begrenzt: Gemini 3 Pro im AI Mode und interaktive Visualisierungen gibt es nur auf Englisch ([Google Search Help](https://support.google.com/websearch/answer/16011537)). Für das Tracking heißt das: Markt und Sprache sind getrennte Variablen. Ein englischer Prompt in Deutschland ist ein anderer Test als ein deutscher.",
    },

    { type: "h2", text: "Wie zählt die Search Console Traffic aus AI Overviews und AI Mode?" },
    {
      type: "p",
      text: "Websites in KI-Funktionen sind laut Google im gesamten Suchtraffic der Search Console enthalten, im Leistungsbericht unter dem Suchtyp „Web“ ([Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)). Einen Filter, der Klicks aus AI Overviews oder AI Mode isoliert, gibt es dort nicht. Die Zählregeln je Funktion ([Search Console Help](https://support.google.com/webmasters/answer/7042828)):",
    },
    {
      type: "ul",
      items: [
        "**AI Overviews:** Ein Klick auf einen Link zu einer externen Seite zählt als Klick, für Impressionen gelten die Standardregeln. „Eine Übersicht mit KI belegt eine einzelne Position in den Suchergebnissen und alle Links in der Übersicht mit KI haben dieselbe Position.“",
        "**AI Mode:** Klicks zählen genauso; die Position folgt derselben Methodik wie auf einer normalen Ergebnisseite. Eine Nachfrage gilt als neue Suchanfrage, alle Daten der neuen Antwort werden dieser Anfrage zugeordnet.",
        "**Beide:** Daten aus Experimenten in Search Labs enthält die Search Console nicht.",
      ],
    },
    { type: "h3", text: "Was bringt der neue Leistungsbericht zu generativen KI-Funktionen?" },
    {
      type: "p",
      text: "Am 3. Juni 2026 begann Google, einen eigenen Bericht mit einem Teil der Websites in Großbritannien zu testen; seit dem 31. August 2026 ist er für alle Websites weltweit verfügbar ([Google, 2026](https://blog.google/products-and-platforms/products/search/new-controls-website-owners/)). Der **Leistungsbericht zu generativen KI-Funktionen** für die Google Suche zeigt Impressionen aus AI Overviews und AI Mode, gruppierbar nach Seiten, Ländern, Zeitraum und Gerätetyp und filterbar nach textbasierter oder multimodaler Websuche ([Search Console Help](https://support.google.com/webmasters/answer/16984139)).",
    },
    {
      type: "p",
      text: "Drei Details sind für die Interpretation wichtig. Die Daten stammen aus dem Suchtyp „Web“ des normalen Leistungsberichts, KI-Impressionen bleiben also auch in Ihren Gesamtzahlen. Das Diagramm aggregiert nach Property: Zwei Ergebnisse derselben Website in einer KI-Funktion zählen als eine Impression. Und die Hilfeseite nennt beide Funktionen, ohne eine Möglichkeit zu beschreiben, sie zu trennen.",
    },
    {
      type: "callout",
      tone: "warn",
      title: "Was die Search Console weiterhin nicht zeigt",
      text: "Welche Suchanfragen die Impressionen ausgelöst haben, ob sie aus einer AI Overview oder dem AI Mode stammen, wie viele Klicks jede Funktion gebracht hat, was die Antwort über Ihre Marke sagt und welche Wettbewerber zitiert wurden. Dafür brauchen Sie Tracking auf Prompt-Ebene.",
    },

    { type: "h2", text: "Kann Google Analytics Besuche aus dem AI Mode unterscheiden?" },
    {
      type: "p",
      text: "Nicht mit einer von Google dokumentierten Methode. Für Klicks aus AI Overviews oder AI Mode gibt es keinen eigenen Referrer, keine eigene Quelle und keinen eigenen Kanal; in GA4 stecken diese Besuche in Ihrem organischen Google-Traffic. Google empfiehlt die Search Console für die Suchleistung und Tools wie Google Analytics für Conversions und Verweildauer. Außerdem behauptet Google, Klicks von Ergebnisseiten mit AI Overviews seien hochwertiger ([Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)); überprüfen lässt sich das von außen nicht.",
    },
    {
      type: "p",
      text: "Praktikabel ist die Verknüpfung auf Seitenebene: Welche Seiten gewinnen Impressionen im KI-Leistungsbericht, und wie entwickeln sich organische Sitzungen und Conversions dieser Landingpages in GA4? Das ist Korrelation, keine Attribution.",
    },

    { type: "h2", text: "Wie schließen Sie Inhalte aus, und was steuert Google-Extended?" },
    {
      type: "p",
      text: "Es gibt drei Hebel mit unterschiedlicher Wirkung:",
    },
    {
      type: "ul",
      items: [
        "**Snippet-Steuerung und noindex.** `nosnippet`, `data-nosnippet` und `max-snippet` begrenzen, was Google aus Ihren Seiten in der Suche zeigt, KI-Funktionen eingeschlossen; `noindex` entfernt die Seite. Als unterstützender Link infrage kommt nur eine Seite, die indexiert ist und mit Snippet angezeigt werden darf ([Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)).",
        "**Einstellung für generative KI in der Search Console.** Unter **Einstellungen > Generative KI in der Google Suche** können Sie mit der Option „Links und Inhalte meiner Website von generativen KI-Funktionen der Google Suche ausschließen“ Ihre Website aus AI Overviews, AI Mode und den KI-Funktionen in Discover nehmen, inklusive Grounding. Dann erhalten Sie aus diesen Funktionen weder Zugriffe noch Impressionen. Laut Google ist die Einstellung kein Rankingsignal für die übrige Suche; der Ausschluss greift nach 1–2 Tagen, teils später ([Search Console Help](https://support.google.com/webmasters/answer/16908024)).",
        "**Google-Extended.** Dieses robots.txt-Token steuert das Training künftiger Gemini-Modelle und das Grounding in Gemini-Apps und Vertex AI. Auf die Aufnahme in die Google Suche hat es laut Google keinen Einfluss ([Google-Crawler-Dokumentation](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers#google-extended)); eine Sperre entfernt Sie also nicht aus AI Overviews oder AI Mode.",
      ],
    },

    { type: "h2", text: "Was bedeutet das für Ihr Messkonzept?" },
    {
      type: "ol",
      items: [
        "**Beide Funktionen getrennt tracken.** Fragen Sie dieselben Prompts in beiden ab; eine gemeinsame „Google-KI“-Kennzahl verdeckt, dass Modelle, Auslöser und Links verschieden sind.",
        "**Search Console für Summen nutzen, nicht für die Zuordnung.** Der Leistungsbericht enthält KI-Klicks, der KI-Leistungsbericht zeigt, welche Seiten und Länder KI-Impressionen erhalten. Keiner trennt AI Overviews von AI Mode.",
        "**Prompts aus echten Fragen ableiten.** Nutzen Sie lange, dialogartige Suchanfragen aus der Search Console und Kundenfragen: AI Overviews erscheinen laut Google vor allem bei Fragen ohne die eine richtige Antwort ([Google Ads Help](https://support.google.com/google-ads/answer/16297775)), der AI Mode ist für komplexe Vergleiche gedacht.",
        "**Pro Markt und Sprache messen.** Deutschland auf Deutsch und Deutschland auf Englisch sind zwei Tests.",
        "**Trends statt Momentaufnahmen.** Antworten schwanken zwischen Abfragen, Modelle wechseln mehrmals im Jahr; vermerken Sie Modellwechsel in Ihren Auswertungen.",
        "**Inhalte verbessern, nicht Seiten vervielfachen.** Google empfiehlt eigenständige Inhalte mit echtem Mehrwert und warnt: Seiten für Fan-out-Anfragen, die vor allem KI-Antworten manipulieren sollen, verstoßen gegen die Richtlinie zum Missbrauch skalierter Inhalte ([Google Search Central](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)).",
        "**Vor einem Ausschluss den KI-Leistungsbericht prüfen.** Google verweist selbst darauf, um die Auswirkung auf den Traffic abzuschätzen.",
      ],
    },

    { type: "h2", text: "Beispiel: Wie messen Sie ein Thema in beiden Funktionen?" },
    {
      type: "p",
      text: "Beispiel (hypothetisch; alle Zahlen sind illustrativ, keine echten Daten): Ein deutscher Onlineshop verkauft Espressomaschinen und will wissen, wie sichtbar er bei Einsteigerfragen ist.",
    },
    {
      type: "ol",
      items: [
        "Das Team zieht lange, fragenartige Suchanfragen aus der Search Console, etwa „welche siebträgermaschine für anfänger“, und macht aus 20 davon Prompts.",
        "Es fragt sie wöchentlich in AI Overviews und AI Mode ab, Markt Deutschland, Sprache Deutsch.",
        "Nach vier Wochen (illustrativ): Eine AI Overview erschien bei 12 der 20 Prompts und zitierte den Shop viermal, eine Zitationsrate von 20 % über alle 20. Der AI Mode beantwortete alle 20, zitierte den Shop zweimal (10 %), nannte die Marke aber sechsmal.",
        "Die Quellenangaben zeigen: Der AI Mode bevorzugt die Vergleichsseite eines Wettbewerbers und einen Forenthread; der Kaufratgeber des Shops erscheint vor allem in AI Overviews.",
        "In der Search Console zeigt der KI-Leistungsbericht Impressionen für den Kaufratgeber in Deutschland, die Klicks bleiben flach. Welche Funktion die Impressionen erzeugt hat, ist dort nicht erkennbar.",
        "Das Team ergänzt den bestehenden Ratgeber um eigene Testergebnisse und eine Vergleichstabelle, statt 20 fast identische Seiten zu veröffentlichen, und vergleicht die nächsten vier Wochen mit der Ausgangsbasis.",
      ],
    },
    {
      type: "p",
      text: "Das Prompt-Tracking zeigt, welche Funktion wen zitiert; die Search Console zeigt, ob Google Impressionen und Klicks erfasst hat. Sie brauchen beides.",
    },

    { type: "h2", text: "Wie messen Sie AI Overviews und AI Mode mit AutoSEO?" },
    {
      type: "p",
      text: "AutoSEO erfasst Google AI Overviews und Google AI Mode als zwei getrennte Engines ([AI-Overviews-Tracking](/ai-visibility-tracking/google-ai-overviews), [AI-Mode-Tracking](/ai-visibility-tracking/google-ai-mode)). Die Antworten kommen von DataForSEO, AI Overviews von der Google-Ergebnisseite und AI Mode über DataForSEOs AI-Mode-Schnittstelle, jeweils für den gewählten Markt und die gewählte Sprache. Ohne DataForSEO weicht AutoSEO standardmäßig auf eine Simulation aus (ein Modell mit Websuche, etwa Gemini mit Google-Search-Grounding, ahmt die Funktion nach), gespeichert und angezeigt als **Simulated** (ein Admin kann das abschalten). Werten Sie solche Antworten als Richtwert, nicht als Googles eigene. AutoSEO speichert den Antworttext, die verlinkten Quellen als Zitationen sowie Produkte und Anzeigen in der Antwort. Zeigt Google für einen Prompt keine AI Overview, zählt die leere Antwort als „nicht sichtbar“; die Sichtbarkeit in AI Overviews spiegelt also auch wider, wie oft überhaupt eine erscheint.",
    },
    {
      type: "p",
      text: "Daraus berechnet AutoSEO Sichtbarkeit, Erwähnungsrate, Zitationsrate, durchschnittliche Position, Share of Voice und Sentiment, je Engine und Land und im Vergleich zum Vorzeitraum; abgefragt wird täglich, wöchentlich oder monatlich. Das [AI-Citation-Tracking](/ai-citation-tracking) zeigt, welche Ihrer Seiten und welche Seiten von Wettbewerbern jede Funktion verlinkt.",
    },
    {
      type: "p",
      text: "Die [Google-Search-Console-Integration](/integrations/google-search-console) synchronisiert Ihre Web-Suchdaten täglich und ergänzt eine Ansicht **AI Prompts**, die lange, dialogartige Suchanfragen markiert (heuristisch), eine Striking-Distance-Liste (beste Seite auf Position 5–20) und Suchchancen, die Seiten auf Position 4–20 mit organischen Landingpage-Daten aus GA4 verknüpfen. Suchanfragen aus der Search Console lassen sich als Prompts übernehmen; dieselben Daten stehen KI-Assistenten über den [MCP-Server](/mcp-server) zur Verfügung.",
    },
    {
      type: "p",
      text: "Die Grenzen: AutoSEO erfasst einzelne, nicht personalisierte Desktop-Antworten und stellt im AI Mode keine Nachfragen. Google legt die Fan-out-Anfragen hinter beiden Funktionen nicht offen, daher enthalten DataForSEO-Antworten für diese beiden Engines keine (simulierte Antworten speichern die eigenen Suchen des Ersatzmodells, nicht die von Google); die [Query-Fan-out-Analyse](/query-fanout-analysis) speist sich aus Engines, deren Antworten ihre Teilanfragen enthalten. Der Leistungsbericht zu generativen KI-Funktionen ist nicht Teil der Search-Console-Synchronisierung.",
    },

    {
      type: "callout",
      tone: "info",
      title: "Methode und Grenzen",
      text: "Dieser Beitrag fasst öffentliche Dokumentation und Ankündigungen von Google mit Stand September 2026 zusammen; AutoSEO verfügt über keinen eigenen Datensatz. Gut dokumentiert: die Zählregeln der Search Console, die Felder des Berichts und die Ausschlussoptionen. Schnell veränderlich: Standardmodelle, Verfügbarkeit einzelner Funktionen, Anzeigenformate und Link-Darstellung. Nicht veröffentlicht: die Fan-out-Anfragen, die Auswahl der zitierten Links und eine Klickaufteilung nach Funktion. Nutzerzahlen und die Aussage zu „hochwertigeren Klicks“ sind Angaben von Google selbst.",
    },
  ],
  faq: [
    {
      q: "Gibt es im Leistungsbericht der Search Console einen Filter für den AI Mode?",
      a: "Nein. AI Overviews und AI Mode werden im Suchtyp „Web“ mitgezählt. Der Leistungsbericht zu generativen KI-Funktionen zeigt KI-Impressionen nach Seite, Land, Zeitraum und Gerät, aber keine Klicks, keine Suchanfragen und keine dokumentierte Trennung der beiden Funktionen.",
    },
    {
      q: "Brauche ich spezielles Markup oder eine KI-Textdatei, um in AI Overviews oder AI Mode zu erscheinen?",
      a: "Nein. Laut Google gibt es keine zusätzlichen technischen Anforderungen, keine nötigen maschinenlesbaren Dateien, KI-Textdateien oder speziellen schema.org-Auszeichnungen. Die Seite muss indexiert sein und mit Snippet angezeigt werden dürfen.",
    },
    {
      q: "Entfernt eine Sperre von Google-Extended meine Website aus AI Overviews?",
      a: "Nein. Google-Extended betrifft das Training von Gemini-Modellen und das Grounding in Gemini-Apps und Vertex AI; auf die Aufnahme in die Google Suche wirkt es laut Google nicht. Für den Ausschluss aus AI Overviews und AI Mode nutzen Sie die Einstellung für generative KI in der Search Console oder Snippet-Steuerungen wie nosnippet.",
    },
    {
      q: "Schadet ein Ausschluss aus den KI-Funktionen meinen normalen Rankings?",
      a: "Laut Google ist die Einstellung kein Ranking- oder Aufnahmesignal für die übrige Suche. Sie verlieren aber alle Zugriffe und Impressionen aus den ausgeschlossenen Funktionen; prüfen Sie deshalb vorher den KI-Leistungsbericht.",
    },
    {
      q: "Warum weicht eine getrackte AI-Mode-Antwort von dem ab, was ich im Browser sehe?",
      a: "Antworten hängen von Standort, Sprache, Gerät und Zeitpunkt ab, und der AI Mode kann anhand Ihres Suchverlaufs personalisieren. Tracking erfasst eine neutrale Einzelantwort je Markt; vergleichen Sie daher Trends über mehrere Abfragen.",
    },
  ],
  sources: [
    { label: "Google Search Central: AI features and your website (2025)", href: "https://developers.google.com/search/docs/appearance/ai-features" },
    {
      label: "Google Search Central: Optimizing your website for generative AI features on Google Search (2026)",
      href: "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide",
    },
    { label: "Search Console Help: What are impressions, position, and clicks? (2026)", href: "https://support.google.com/webmasters/answer/7042828" },
    { label: "Search Console Help: Generative AI performance report (Search) (2026)", href: "https://support.google.com/webmasters/answer/16984139" },
    { label: "Search Console Help: Search generative AI control (2026)", href: "https://support.google.com/webmasters/answer/16908024" },
    {
      label: "Google: New opportunities, control and insights for website owners (2026)",
      href: "https://blog.google/products-and-platforms/products/search/new-controls-website-owners/",
    },
    {
      label: "Google Crawling Infrastructure: Google-Extended (2026)",
      href: "https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers#google-extended",
    },
    { label: "Google Search Help: AI Mode in Google Search (2026)", href: "https://support.google.com/websearch/answer/16011537" },
    {
      label: "Google: Just ask anything: a seamless new Search experience (2026)",
      href: "https://blog.google/products-and-platforms/products/search/ai-mode-ai-overviews-updates/",
    },
    { label: "Google: A new era for AI Search, I/O 2026 (2026)", href: "https://blog.google/products-and-platforms/products/search/search-io-2026/" },
    { label: "Google: AI Mode in Google Search, updates from I/O 2025 (2025)", href: "https://blog.google/products/search/google-search-ai-mode-update/" },
    {
      label: "Google: AI Mode is now available in more languages and locations (2025)",
      href: "https://blog.google/products-and-platforms/products/search/ai-mode-expands-languages-locations/",
    },
    {
      label: "Google: Bringing AI Overviews to more countries in Europe (2025)",
      href: "https://blog.google/feed/were-bringing-the-helpfulness-of-ai-overviews-to-more-countries-in-europe/",
    },
    { label: "Google Ads Help: About ads and AI Overviews (2026)", href: "https://support.google.com/google-ads/answer/16297775" },
    { label: "Google Ads Help: Google Ads Highlights of 2025 (2025)", href: "https://support.google.com/google-ads/answer/16756291" },
  ],
};
