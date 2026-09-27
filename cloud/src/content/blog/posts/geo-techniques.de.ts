import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "geo-techniques",
  title: "Welche GEO-Techniken wirken? Was die Forschung zeigt",
  description:
    "GEO-Forschung im Überblick: welche Textänderungen im GEO-Paper (KDD 2024) KI-Sichtbarkeit brachten, warum neuere Studien widersprechen und wie Sie das testen.",
  date: "2026-09-26",
  authorSlug: "autoseo-team",
  tags: ["geo", "research"],
  readingMinutes: 13,
  lead:
    "Die Forschung stützt GEO nur in einer engen Form. Im ursprünglichen GEO-Paper (Aggarwal et al., KDD 2024) steigerte das Ergänzen von Zitaten, Statistiken oder Quellenangaben den Anteil einer Quelle an einer KI-generierten Antwort um 30–40 % auf der Hauptmetrik, Keyword-Stuffing half dagegen nicht. Spätere Benchmarks sind skeptischer: C-SEO Bench (2025) fand die meisten dieser Umformulierungen für den Zitationsrang wirkungslos oder sogar schädlich, die Position eines Dokuments im abgerufenen Kontext wog deutlich schwerer. Dieser Beitrag fasst die Studien zusammen (AutoSEO hat keine eigenen Tests durchgeführt) und zeigt, wie Sie eine Technik mit Ihren eigenen Prompts prüfen.",
  blocks: [
    { type: "h2", text: "Was hat das ursprüngliche GEO-Paper getestet?" },
    {
      type: "p",
      text: "[GEO: Generative Engine Optimization](https://arxiv.org/abs/2311.09735) von Aggarwal et al. erschien im November 2023 auf arXiv und 2024 auf der KDD. Es führte **GEO-bench** ein: 10.000 Suchanfragen aus neun Quellen wie MS MARCO, ELI5 und Perplexity.ai Discover, 25 Themenbereichen zugeordnet und zu rund 80 % informational.",
    },
    {
      type: "p",
      text: "Die „Generative Engine“ war eine eigene Pipeline der Autoren: Zu jeder Anfrage erhielt `gpt-3.5-turbo` die fünf besten Google-Treffer und schrieb daraus eine Antwort mit Quellenangaben (fünf Durchläufe bei Temperatur 0,7). Anschließend schrieb ein Sprachmodell eine der fünf Quellen mit einer von neun Methoden um, und die Autoren maßen, wie viel der neuen Antwort auf diese Quelle entfiel.",
    },
    {
      type: "ul",
      items: [
        "**Inhaltliche Ergänzungen:** Cite Sources (Quellen zitieren), Quotation Addition (Zitate), Statistics Addition (Statistiken).",
        "**Stil:** Fluency Optimization (flüssiger Text), Easy-to-Understand (einfachere Sprache), Authoritative (überzeugenderer, autoritativer Ton).",
        "**Wortwahl:** Keyword Stuffing (mehr Suchbegriffe wie im klassischen SEO), Unique Words, Technical Terms.",
      ],
    },
    {
      type: "p",
      text: "Sichtbarkeit wurde zweifach gemessen. **Position-Adjusted Word Count** ist der Anteil der Antwortwörter in Sätzen, die die Quelle zitieren, wobei frühe Sätze stärker zählen. **Subjective Impression** ist eine Bewertung durch GPT-3.5 nach sieben Kriterien wie Relevanz, Einfluss und Klickwahrscheinlichkeit.",
    },

    { type: "h2", text: "Welche Techniken steigerten die Sichtbarkeit, welche nicht?" },
    {
      type: "p",
      text: "Auf GEO-bench lag die unoptimierte Ausgangsbasis bei 19,3 auf beiden Metriken. Nach der Umformulierung erreichte **Quotation Addition** 27,2 beim Position-Adjusted Word Count, **Statistics Addition** 25,2, **Fluency Optimization** 24,7 und **Cite Sources** 24,6. Die Autoren fassen Cite Sources, Quotation Addition und Statistics Addition als relative Verbesserung von 30–40 % beim Position-Adjusted Word Count und 15–30 % bei der Subjective Impression zusammen; die besten Methoden lagen 41 % bzw. 28 % über der Basis.",
    },
    {
      type: "p",
      text: "Auch reine Stiländerungen halfen: Fluency Optimization und Easy-to-Understand brachten laut Paper 15–30 % mehr Sichtbarkeit. **Keyword Stuffing** kam auf 17,7, also unter die Basis; die Autoren sprechen von „little to no improvement“. Unique Words (20,5) bewegte kaum etwas.",
    },
    {
      type: "p",
      text: "Zwei Ergebnisse werden oft zitiert. Erstens profitierten schlechter platzierte Quellen am stärksten: Cite Sources steigerte die Sichtbarkeit der in Google auf Rang 5 stehenden Quelle um 115,1 %, während die Quelle auf Rang 1 im Schnitt 30,3 % verlor. Zweitens übertraf die Kombination aus Fluency Optimization und Statistics Addition jede Einzelmethode um mehr als 5,5 %, gemessen an 200 Anfragen.",
    },
    {
      type: "p",
      text: "Die Wirkung hing vom Thema ab: Authoritative wirkte am besten bei Debatten- und Geschichtsfragen, Quotation Addition bei „People & Society“, Statistics Addition bei Recht und Verwaltung.",
    },
    { type: "h3", text: "Was geschah bei Perplexity.ai?" },
    {
      type: "p",
      text: "Das Paper testete auch Perplexity.ai, allerdings nicht über die Live-Websuche. Da Perplexity keine Quell-URLs annahm, luden die Autoren die Quelltexte als Dateien hoch und prüften 200 Testanfragen. Quotation Addition verbesserte den Position-Adjusted Word Count um 22 %, Cite Sources und Statistics Addition zeigten laut Paper Verbesserungen von bis zu 9 % und 37 % auf den beiden Metriken, Keyword Stuffing schnitt 10 % schlechter ab als die Basis.",
    },
    {
      type: "callout",
      tone: "warn",
      title: "Die wichtigste Einschränkung",
      text: "In allen GEO-bench-Experimenten war die Seite bereits eine von fünf Quellen im Kontext, und die Umformulierung stammte von einem Sprachmodell. Das Paper misst, wie viel Antwortanteil eine bereits abgerufene Quelle erhält. Ob eine Änderung dazu führt, dass eine Seite überhaupt abgerufen, von einer produktiven KI-Suche zitiert oder angeklickt wird, testet es nicht.",
    },

    { type: "h2", text: "Was fanden spätere Studien?" },
    { type: "h3", text: "C-SEO Bench (2025): Die meisten Umformulierungen verbesserten den Zitationsrang nicht" },
    {
      type: "p",
      text: "[C-SEO Bench](https://arxiv.org/abs/2506.11097) von Puerto et al. (NeurIPS 2025, Datasets and Benchmarks Track) prüfte acht GEO-Methoden und zwei neuere Verfahren an mehr als 1.900 Anfragen und 16.000 Dokumenten, für Fragebeantwortung und Produktempfehlungen. Als Antwortmaschinen dienten `gpt-4o-mini`, `claude-3-5-haiku`, `o3` und `o4-mini`; gemessen wurde der **Zitationsrang**, nicht der Wortanteil.",
    },
    {
      type: "p",
      text: "Die meisten Methoden erzielten im Mittel nahezu keinen Effekt, viele sogar einen signifikant negativen: Statistics senkte den Rang in 19 von 24 untersuchten Konstellationen, bei Produktempfehlungen mit Haiku 3.5 waren 26 von 30 Fällen signifikant negativ. Stand das Dokument dagegen an erster Stelle im Kontext des Modells, fielen die Gewinne weit größer aus, etwa 2,77 ± 2,31 Rangplätze für den Bereich Retail mit gpt-4o-mini. Je mehr Wettbewerber dieselbe Methode nutzten, desto stärker schrumpften die Gewinne gegen null.",
    },
    {
      type: "p",
      text: "Die Autoren erklären den Unterschied mit der Metrik: Ein höherer Wortanteil bedeutet nicht, dass das Modell eine Quelle bevorzugt. Die Ergebnisse beider Papers zu Modellpräferenzen widersprechen sich ihrer Ansicht nach nicht.",
    },
    { type: "h3", text: "Ranking-Manipulation funktioniert im Labor, bleibt aber Manipulation" },
    {
      type: "p",
      text: "[Pfrommer et al.](https://arxiv.org/abs/2406.03589) (EMNLP 2024) bauten mit RAGDOLL einen Datensatz aus 1.147 Produktseiten aus fünf Produktgruppen und zeigten, dass Sprachmodelle Produktname, Dokumentinhalt und Position im Kontext sehr unterschiedlich gewichten. Per Tree-of-Attacks-Jailbreak erzeugter Text schob schlecht platzierte Produkte nach oben und wirkte auch bei Perplexity. [Kumar und Lakkaraju](https://arxiv.org/abs/2404.07981) (2024) hoben fiktive Kaffeemaschinen mit einer „strategic text sequence“ in den Empfehlungen von Llama-2 nach oben. [Nestaas et al.](https://arxiv.org/abs/2406.18382) (2024) demonstrierten solche Angriffe bei Bing und Perplexity und beschreiben ein Gefangenendilemma: Alle greifen an, und die Antworten werden für alle schlechter.",
    },
    { type: "h3", text: "Chen et al. (2025): KI-Suche bevorzugt Earned Media" },
    {
      type: "p",
      text: "[Chen, Wang, Chen und Koudas](https://arxiv.org/abs/2509.08919) (University of Toronto) verglichen Google mit den API-Varianten von GPT-4o Search, Claude, Gemini und Perplexity, mit Daten aus dem August 2025. Sie berichten von einer systematischen, deutlichen Bevorzugung von Earned Media (unabhängige Drittquellen) gegenüber markeneigenen und sozialen Inhalten: Bei US-Anfragen zu Unterhaltungselektronik stammten 92,1 % der Quellen der KI-Suche aus Earned Media. Die Studie ist beobachtend, und die Autoren bezeichnen ihre Quellenklassifikation selbst als teilweise subjektiv.",
    },
    { type: "h3", text: "AutoGEO (2025): gelernte, maschinenspezifische Regeln" },
    {
      type: "p",
      text: "[AutoGEO](https://arxiv.org/abs/2510.11438) (Wu et al., 2025) ließ Sprachmodelle erklären, warum ein Dokument sichtbarer war als ein anderes, und leitete daraus Regeln für Umformulierungen ab. Auf simulierten Antwortmaschinen mit `gemini-2.5-flash-lite`, `gpt-4o-mini` und `claude-3-haiku` stiegen die GEO-Metriken im Schnitt um 35,99 %, ohne dass die Antwortqualität litt. Die Regelsätze der drei Modelle überschnitten sich zu 78,95–84,21 %, mit umfassender Themenabdeckung als gemeinsamer Regel; bei E-Commerce-Anfragen zählten dagegen konkrete Handlungsempfehlungen mehr als tiefe Erklärungen.",
    },
    { type: "h3", text: "2026: Messrauschen und eine nüchterne Übersichtsarbeit" },
    {
      type: "p",
      text: "[Sielinski](https://arxiv.org/abs/2603.08924) (Preprint 2026) fragte Perplexity, OpenAI SearchGPT und Gemini neun Tage lang täglich sowie im Zehn-Minuten-Takt ab. Wiederholte Durchläufe derselben Anfrage zitierten unterschiedliche Domains: Die mediane Jaccard-Überschneidung auf Domainebene (1,0 = identisch) lag bei 0,29–0,31 für Gemini, 0,33–0,40 für SearchGPT und 0,50 für Perplexity. Unterschiede im Zitationsanteil unter 5–7 Prozentpunkten lagen meist im Rauschen.",
    },
    {
      type: "p",
      text: "Eine [Übersichtsarbeit zu 45 Studien](https://arxiv.org/abs/2607.14035) von Martinez (Juli 2026) kommt zu dem Schluss, dass bereits abgerufene Inhalte ihre Zitation nachweislich verändern können, aber keine untersuchte Technik einen stabilen, langfristigen, plattformübergreifenden kausalen Effekt auf die organische Auffindbarkeit oder das Nutzerverhalten zeigt. Eine [Analyse von 602 Prompts aus 2026](https://arxiv.org/abs/2604.25707) fand, dass Seiten mit mehr Einfluss auf Antworten tendenziell länger, besser strukturiert und reicher an Definitionen, Zahlen und Schritten sind; das ist eine Korrelation, kein getesteter Eingriff.",
    },

    { type: "h2", text: "Wie schneiden die Techniken im direkten Vergleich ab?" },
    {
      type: "table",
      head: ["Technik", "Befund", "Quelle (Jahr)"],
      rows: [
        [
          "Zitate ergänzen",
          "GEO-bench: 19,3 → 27,2 (Position-Adjusted Word Count); +22 % bei Perplexity (hochgeladene Dateien). C-SEO Bench: nahe null.",
          "Aggarwal et al. (2024); Puerto et al. (2025)",
        ],
        [
          "Statistiken ergänzen",
          "GEO-bench: 19,3 → 25,2; +37 % Subjective Impression bei Perplexity. C-SEO Bench: schlechterer Rang in 19 von 24 Konstellationen.",
          "Aggarwal et al. (2024); Puerto et al. (2025)",
        ],
        [
          "Quellen zitieren",
          "GEO-bench: 19,3 → 24,6; +115,1 % für die Quelle auf Rang 5, −30,3 % für Rang 1. C-SEO Bench: nahe null.",
          "Aggarwal et al. (2024); Puerto et al. (2025)",
        ],
        [
          "Flüssigerer Stil, einfachere Sprache",
          "GEO-bench: 15–30 % mehr Sichtbarkeit. C-SEO Bench: in den meisten Konstellationen nahe null.",
          "Aggarwal et al. (2024); Puerto et al. (2025)",
        ],
        ["Keyword-Stuffing", "GEO-bench: 17,7 statt 19,3; bei Perplexity 10 % schlechter als die Basis.", "Aggarwal et al. (2024)"],
        [
          "Besseres Ranking beim Abruf (klassisches SEO)",
          "Erste Position im Kontext: 2,77 ± 2,31 Rangplätze Gewinn (Retail, gpt-4o-mini), weit mehr als jede Umformulierung.",
          "Puerto et al. (2025); Pfrommer et al. (2024)",
        ],
        ["Gelernte, maschinenspezifische Umformulierung", "Im Schnitt +35,99 % auf GEO-Metriken bei stabiler Antwortqualität, auf simulierten Antwortmaschinen.", "Wu et al. (2025)"],
        ["Berichterstattung durch Dritte", "92,1 % Earned-Media-Quellen in der KI-Suche bei US-Unterhaltungselektronik (beobachtend, August 2025).", "Chen et al. (2025)"],
        [
          "Versteckte Anweisungen, Prompt Injection",
          "Hebt Produkte im Labor sowie bei Perplexity und Bing; manipulativ.",
          "Pfrommer et al. (2024); Nestaas et al. (2024)",
        ],
      ],
      caption: "Effektgrößen so, wie die Papers sie angeben; Benchmarks, Modelle und Metriken unterscheiden sich zwischen den Zeilen.",
    },

    { type: "h2", text: "Warum widersprechen sich die Studien?" },
    {
      type: "ul",
      items: [
        "**Unterschiedliche Zielgrößen.** GEO misst den Wortanteil, C-SEO Bench den Zitationsrang, Chen et al. die Quellenmischung. Keine Studie misst Traffic oder Umsatz.",
        "**Fester Kontext.** Laborstudien geben dem Modell wenige Dokumente vor. Produktive KI-Suchen entscheiden erst, ob und was sie abrufen (siehe [Query Fan-out](/blog/query-fan-out)).",
        "**Modelle und Zeitpunkt.** GEO nutzte 2023 `gpt-3.5-turbo`, C-SEO Bench Modelle aus 2024 und 2025. Produktive Systeme ändern sich ohne Ankündigung.",
        "**Ein Akteur oder viele.** Gewinne schrumpfen, wenn Wettbewerber ebenfalls optimieren, und nur wenige Experimente liefen gegen ein Live-Produkt.",
      ],
    },
    {
      type: "p",
      text: "Googles eigene Dokumentation weist in dieselbe Richtung wie C-SEO Bench: Für AI Overviews und AI Mode gebe es keine zusätzlichen Anforderungen und keine speziellen Optimierungen, die Best Practices für SEO blieben relevant ([Google Search Central](https://developers.google.com/search/docs/appearance/ai-features), zuletzt aktualisiert im Dezember 2025).",
    },

    { type: "h2", text: "Was bedeutet das für Ihre Inhalte?" },
    {
      type: "ul",
      items: [
        "**Zuerst abgerufen werden.** Die Position beim Abruf war in C-SEO Bench der stärkste Hebel. Crawlbarkeit, Indexierung und klassische Rankings kommen vor jeder Umformulierung; siehe [wie KI-Crawler Ihre Seiten lesen](/blog/ai-crawler-readability).",
        "**Nur belegbare Fakten ergänzen.** Statistiken, Zitate und Quellen halfen im GEO-Paper, doch die Ergänzungen dort erzeugte ein Sprachmodell. Verwenden Sie nur Zahlen und Zitate mit Quelle, und verlinken Sie diese.",
        "**Teilfragen abdecken.** Umfassende Abdeckung war eine gemeinsame AutoGEO-Regel; bei Kaufanfragen zählten konkrete Handlungsempfehlungen mehr als Erklärungen.",
        "**Berichterstattung durch Dritte gewinnen.** Wenn KI-Suche Earned Media bevorzugt, können unabhängige Tests ebenso zählen wie Ihre eigene Seite.",
        "**Auf Keyword-Stuffing und versteckte Anweisungen verzichten.** Ersteres half nicht, Letzteres ist Manipulation.",
        "**Jede Technik als Hypothese behandeln.** Testen Sie sie an Ihren eigenen Prompts, bevor Sie sie auf die ganze Website ausrollen.",
      ],
    },

    { type: "h2", text: "Wie testen Sie eine GEO-Technik selbst?" },
    { type: "p", text: "Ein Laboreffekt zeigt, was einen Versuch wert ist, nicht, was auf Ihren Seiten passiert. Ein einfacher kontrollierter Test:" },
    {
      type: "ol",
      items: [
        "**Testgruppe wählen.** Nehmen Sie getrackte Prompts, für die die zu ändernde Seite eine plausible Antwort ist, und versehen Sie sie mit einem Tag für die Testgruppe.",
        "**Kontrollgruppe wählen.** Taggen Sie vergleichbare Prompts, deren Seiten Sie nicht anfassen; sie fangen Updates der KI-Suchen und saisonale Effekte ab.",
        "**Ausgangswert erfassen.** Tracken Sie beide Gruppen täglich über die relevanten KI-Antwortmaschinen, mindestens zwei bis vier Wochen vor jeder Änderung.",
        "**Eine Seite, eine Technik ändern.** Ergänzen Sie etwa belegte Statistiken. Notieren Sie das Veröffentlichungsdatum und ändern Sie sonst nichts an der Seite.",
        "**Weiter tracken.** Lassen Sie Antwortmaschinen, Märkte und Prompt-Formulierungen nach der Änderung mehrere Wochen unverändert.",
        "**Differenzen vergleichen.** Vergleichen Sie Erwähnungs- und Zitationsrate von Test- und Kontrollgruppe vor und nach der Änderung. Steigen beide Gruppen, liegt es vermutlich nicht an Ihrer Änderung.",
        "**Rauschen ernst nehmen.** Antworten schwanken von Durchlauf zu Durchlauf. Mehr Prompts und mehr Tage verringern die Unsicherheit; Unterschiede von wenigen Punkten sind oft Rauschen.",
      ],
    },
    { type: "p", text: "**Beispiel:** Ein fiktiver Anbieter von Rechnungssoftware testet Statistics Addition an seinem Preisratgeber. Alle Zahlen sind illustrativ." },
    {
      type: "ol",
      items: [
        "Das Team taggt 30 Prompts zu Rechnungskosten als `test-stats` und 30 Prompts zu anderen Funktionen als `control`.",
        "In vier Wochen Ausgangsmessung über ChatGPT, Perplexity und Google AI Overviews zeigt die Testgruppe eine illustrative Zitationsrate von 12 %, die Kontrollgruppe 10 %.",
        "Das Team ergänzt fünf Statistiken im Preisratgeber, jeweils mit Link zur Originalumfrage, und ändert sonst nichts.",
        "Vier Wochen später liegt die Testgruppe bei illustrativen 17 %, die Kontrollgruppe bei 11 %. Die Differenz der Differenzen beträgt 4 Punkte (5 minus 1).",
        "Angesichts der in der Forschung berichteten Schwankungen sind 4 Punkte bei 30 Prompts nicht belastbar; das Team verlängert den Test und nimmt weitere Prompts auf, bevor es entscheidet.",
      ],
    },

    { type: "h2", text: "Wie messen Sie das mit AutoSEO?" },
    { type: "p", text: "AutoSEO misst Prompts, es sagt Ihnen nicht, welche Technik wirkt. Laut Open-Source-Code bietet es:" },
    {
      type: "ul",
      items: [
        "**Prompt-Tracking über mehrere KI-Suchen.** Prompts laufen täglich, wöchentlich oder monatlich auf den aktivierten Antwortmaschinen, etwa ChatGPT, Perplexity, Google AI Overviews, Google AI Mode, Gemini, Claude und Microsoft Copilot ([AI Visibility Tracking](/ai-visibility-tracking)). Pro Prompt, Antwortmaschine und Tag wird eine Antwort gespeichert; Wiederholungen sammeln sich also über die Tage.",
        "**Klar definierte Kennzahlen.** Sichtbarkeit (Antworten, die Sie nennen oder zitieren), Erwähnungsrate, Zitationsrate (Antworten, die eine Ihrer Seiten zitieren), durchschnittliche Position und Share of Voice, jeweils im Vergleich zum gleich langen Vorzeitraum.",
        "**Tags für Test- und Kontrollgruppen.** Prompts lassen sich taggen, und Tracker, Trends sowie die Tools des [MCP-Servers](/mcp-server) filtern Kennzahlen nach Tag und Antwortmaschine.",
        "**Quellen.** Die meistzitierten URLs und Domains, aufgeteilt in eigene, Wettbewerber- und Drittquellen, dazu eine Lückenanalyse gegenüber Wettbewerbern ([AI Citation Tracking](/ai-citation-tracking)).",
        "**Content-Bewertung.** Ein AEO-Score aus sechs gewichteten Säulen (Extractability, Fact density, Structure, Schema markup, Depth, Metadata), auch für eine bestehende URL vor der Überarbeitung ([AI Content Optimization](/ai-content-optimization)). Er ist eine heuristische Checkliste, kein validierter Prädiktor für Zitationen.",
        "**[Prompt Research](/prompt-research),** um das Prompt-Set nach Thema, Persona und Funnel-Phase aufzubauen.",
      ],
    },
    {
      type: "p",
      text: "Jede gespeicherte Antwort hält fest, welches Backend sie erzeugt hat; ist keine direkte Quelle konfiguriert, kann ein Modell mit Websuche eine Antwortmaschine nachahmen, gekennzeichnet als simuliert. Halten Sie das Backend während eines Tests konstant.",
    },
    {
      type: "callout",
      tone: "info",
      title: "Methode und Grenzen",
      text: "Dieser Beitrag fasst veröffentlichte Studien und offizielle Dokumentation mit Stand September 2026 zusammen. AutoSEO verfügt über keinen eigenen Datensatz und hat dafür keine Experimente durchgeführt. Die meisten Studien arbeiteten mit Benchmarks, festem Kontext oder simulierten Antwortmaschinen und mit Modellen, die produktive Systeme inzwischen ersetzt haben; mehrere Quellen aus 2026 sind Preprints ohne Peer Review. Effektgrößen sind so wiedergegeben, wie die Papers sie angeben, und nicht studienübergreifend vergleichbar.",
    },
  ],
  faq: [
    {
      q: "Ist GEO etwas anderes als SEO?",
      a: "Teilweise. Das GEO-Paper optimiert, wie viel einer KI-Antwort auf eine bereits abgerufene Seite entfällt. C-SEO Bench und Googles Dokumentation deuten darauf hin, dass das Abgerufenwerden, also klassisches SEO, der größere Hebel bleibt.",
    },
    {
      q: "Werden Seiten mit Statistiken häufiger zitiert?",
      a: "Im GEO-Paper hob Statistics Addition den Position-Adjusted Word Count auf GEO-bench von 19,3 auf 25,2. C-SEO Bench fand, dass dieselbe Methode den Zitationsrang in 19 von 24 Konstellationen senkte. Ergänzen Sie Statistiken, weil sie Lesern helfen und belegt sind, und messen Sie die Wirkung an Ihren eigenen Prompts.",
    },
    {
      q: "Wie lange sollte ein GEO-Test laufen?",
      a: "Lange genug, um Ihre Änderung von der natürlichen Schwankung der Antworten zu trennen: einige Wochen täglicher Ausgangsmessung und einige Wochen danach, mit einer Kontrollgruppe von Prompts.",
    },
    {
      q: "Sollte ich Seiten automatisch für GEO umschreiben lassen?",
      a: "AutoGEO verbesserte GEO-Metriken auf simulierten Antwortmaschinen, und C-SEO Bench fand, dass die Vorteile früher Anwender schrumpfen, sobald Wettbewerber nachziehen. Prüfen Sie jede automatische Überarbeitung auf Richtigkeit, besonders ergänzte Zahlen und Zitate, und testen Sie sie vorab.",
    },
    {
      q: "Warum zitieren verschiedene KI-Suchen unterschiedliche Quellen?",
      a: "Sie rufen Inhalte unterschiedlich ab, nutzen verschiedene Modelle und ändern sich laufend. Chen et al. berichten Unterschiede bei Domainvielfalt, Aktualität und Empfindlichkeit gegenüber Formulierungen, und Sielinski maß geringe Überschneidungen selbst zwischen wiederholten Durchläufen derselben KI-Suche. Tracken Sie jede Antwortmaschine separat.",
    },
  ],
  sources: [
    { label: "arXiv / KDD 2024: Aggarwal et al., GEO: Generative Engine Optimization (2024)", href: "https://arxiv.org/abs/2311.09735" },
    { label: "arXiv / NeurIPS 2025: Puerto et al., C-SEO Bench: Does Conversational SEO Work? (2025)", href: "https://arxiv.org/abs/2506.11097" },
    { label: "arXiv / EMNLP 2024: Pfrommer et al., Ranking Manipulation for Conversational Search Engines (2024)", href: "https://arxiv.org/abs/2406.03589" },
    { label: "arXiv: Kumar und Lakkaraju, Manipulating Large Language Models to Increase Product Visibility (2024)", href: "https://arxiv.org/abs/2404.07981" },
    { label: "arXiv: Nestaas et al., Adversarial Search Engine Optimization for Large Language Models (2024)", href: "https://arxiv.org/abs/2406.18382" },
    { label: "arXiv: Chen et al., Generative Engine Optimization: How to Dominate AI Search (2025)", href: "https://arxiv.org/abs/2509.08919" },
    { label: "arXiv: Wu et al., What Generative Search Engines Like and How to Optimize Web Content Cooperatively (2025)", href: "https://arxiv.org/abs/2510.11438" },
    { label: "arXiv: Sielinski, Quantifying Uncertainty in AI Visibility (2026)", href: "https://arxiv.org/abs/2603.08924" },
    { label: "arXiv: Martinez, A Critical Survey of Generative Engine Optimization 2023–2026 (2026)", href: "https://arxiv.org/abs/2607.14035" },
    { label: "arXiv: From Citation Selection to Citation Absorption (2026)", href: "https://arxiv.org/abs/2604.25707" },
    { label: "Google Search Central: KI-Funktionen und Ihre Website (2025)", href: "https://developers.google.com/search/docs/appearance/ai-features" },
  ],
};
