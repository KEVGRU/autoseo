import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "query-fan-out",
  title: "Query Fan-out erklärt: Wie KI-Suchen eine Frage aufteilen",
  description:
    "Query Fan-out erklärt: Wie Google AI Mode, ChatGPT, Claude und Perplexity eine Frage in viele Suchanfragen zerlegen und was das für Ihre Inhalte bedeutet.",
  date: "2026-09-26",
  authorSlug: "autoseo-team",
  tags: ["query-fan-out", "google", "geo"],
  readingMinutes: 12,
  lead:
    "Query Fan-out bezeichnet das Verfahren, mit dem KI-Suchen einen Prompt in mehrere Teilanfragen zerlegen, diese Suchen ausführen und aus den kombinierten Ergebnissen eine einzige Antwort erstellen. Google benennt die Technik ausdrücklich für AI Mode und schreibt, dass auch AI Overviews sie nutzen können; OpenAI, Anthropic, die Gemini API von Google und Perplexity dokumentieren dasselbe Muster mehrerer Suchen pro Anfrage. Das ist relevant, weil Seiten für die Teilanfragen abgerufen werden und nicht nur für den Prompt, den jemand eingegeben hat. Wer zitiert werden will, muss deshalb auch die Unterthemen abdecken, nach denen eine Engine sucht.",
  blocks: [
    { type: "h2", text: "Was ist Query Fan-out?" },
    {
      type: "p",
      text: "Query Fan-out ist ein Abrufmuster. Statt den Prompt unverändert an einen Suchindex zu schicken, leitet ein Sprachmodell daraus mehrere engere Suchanfragen ab, führt sie aus und schreibt aus den Treffern eine Antwort. Google hat den Begriff im März 2025 beim Start von AI Mode öffentlich verwendet: Verwandte Suchen laufen gleichzeitig über Unterthemen und mehrere Datenquellen hinweg ([Google, 2025](https://blog.google/products-and-platforms/products/search/ai-mode-search/)).",
    },
    {
      type: "quote",
      text: "breaking down your question into subtopics and issuing a multitude of queries simultaneously",
      cite: "Google zu AI Mode auf der I/O 2025 (sinngemäß: die Frage in Unterthemen zerlegen und viele Suchanfragen gleichzeitig stellen)",
    },
    {
      type: "p",
      text: "Hinter einer Frage wie „Lohnt sich eine Wärmepumpe für ein Haus aus den 1970er-Jahren?“ stecken mehrere Informationsbedürfnisse: Einbaukosten, Anforderungen an die Dämmung, Betriebskosten im Vergleich zu Gas, Förderung, Lautstärke. Ein Fan-out-System macht daraus einzelne Suchen, und jede kann andere Seiten liefern. Die Antwort zitiert am Ende die Quellen, die den jeweiligen Teil am besten abgedeckt haben.",
    },
    {
      type: "p",
      text: "Die Idee ist älter als AI Mode. Die Self-Ask-Methode von Press et al. zeigte, dass ein Modell, das sich selbst Folgefragen stellt und diese per Suchmaschine beantwortet, bei mehrstufigen Fragen genauer wird ([Findings of EMNLP 2023](https://arxiv.org/abs/2210.03350)). Microsoft beschrieb 2023 für die Deep Search in Bing einen verwandten Ansatz: Die Anfrage wird im Namen der Nutzer umformuliert, und die Varianten werden ebenfalls gesucht ([Bing, 2023](https://blogs.bing.com/search-quality-insights/december-2023/Introducing-Deep-Search)).",
    },

    { type: "h2", text: "Welche KI-Suchen nutzen Query Fan-out?" },
    {
      type: "p",
      text: "Jede große KI-Antwortmaschine, die ihr Suchverhalten dokumentiert, beschreibt eine Form mehrerer, vom Modell erzeugter Suchen pro Anfrage. Die Details unterscheiden sich, ebenso wie der Teil, den Sie davon sehen können. Wie sich die beiden KI-Oberflächen von Google grundsätzlich unterscheiden, lesen Sie in [AI Mode vs. AI Overviews](/blog/ai-mode-vs-ai-overviews).",
    },
    {
      type: "table",
      head: ["Aussage", "Was die Quelle sagt", "Quelle (Jahr)"],
      rows: [
        [
          "Google AI Mode nutzt Fan-out",
          "AI Mode stellt mehrere verwandte Suchanfragen gleichzeitig, über Unterthemen und mehrere Datenquellen hinweg, und führt die Ergebnisse zusammen.",
          "[Google: Expanding AI Overviews and introducing AI Mode](https://blog.google/products-and-platforms/products/search/ai-mode-search/) (2025)",
        ],
        [
          "Deep Search geht weiter",
          "Deep Search nutzt dieselbe Technik in größerem Umfang und kann Hunderte Suchen für einen vollständig belegten Bericht ausführen.",
          "[Google: AI in Search, I/O 2025](https://blog.google/products-and-platforms/products/search/google-search-ai-mode-update/) (2025)",
        ],
        [
          "Auch AI Overviews können es nutzen",
          "Laut Googles Dokumentation für Website-Betreiber können AI Overviews und AI Mode Query Fan-out verwenden, um eine Antwort zu erstellen.",
          "[Google Search Central: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) (2025)",
        ],
        [
          "Auch visuelle Suchen fächern auf",
          "Ein Engineering Director der Google-Suche erklärt zur visuellen Suche in AI Mode, sie führe etwa ein Dutzend Suchen in der Zeit einer einzigen aus.",
          "[Google: Ask a Techspert](https://blog.google/company-news/inside-google/googlers/how-google-ai-visual-search-works/) (2026)",
        ],
        [
          "ChatGPT formuliert Prompts in Suchanfragen um",
          "Die ChatGPT-Suche formuliert einen Prompt in der Regel in eine oder mehrere gezielte Suchanfragen um und kann nach Sichtung der ersten Treffer spezifischere Anfragen nachschieben.",
          "[OpenAI Help Center: Searching the web with ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) (2026)",
        ],
        [
          "Claude sucht mehrfach",
          "Claude entscheidet selbst, wann es sucht, und der Suchschritt kann sich innerhalb einer Anfrage wiederholen: meist 1–3 Suchen für einfache Fakten, 10 oder mehr für vergleichende Recherchen.",
          "[Anthropic: Web search tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool) (2026)",
        ],
        [
          "Gemini erzeugt eigene Suchanfragen",
          "Beim Grounding mit der Google-Suche erzeugt das Modell eine oder mehrere Suchanfragen, und die Antwort enthält die ausgeführten Anfragen.",
          "[Google AI for Developers: Grounding with Google Search](https://ai.google.dev/gemini-api/docs/google-search) (2026)",
        ],
        [
          "Perplexity sucht nach",
          "Pro Search plant mehrstufige Recherchen und kann Folgesuchen starten, die auf früheren Ergebnissen aufbauen.",
          "[Perplexity: Pro Search upgraded](https://www.perplexity.ai/hub/blog/pro-search-upgraded-for-more-advanced-problem-solving) (2024)",
        ],
      ],
      caption: "Öffentliche Aussagen zu mehreren Suchen pro Prompt, geprüft im September 2026.",
    },
    {
      type: "p",
      text: "Zwei Feinheiten sind wichtig. Google schreibt „may use“, also nutzt nicht zwingend jede AI Overview ein Fan-out. Und die Entwickler-APIs beschreiben, wie ein Modell sucht, wenn Sie es per API aufrufen; die Apps für Endnutzer können sich anders verhalten. Laut OpenAI Help Center kann ChatGPT zum Beispiel gespeicherte Erinnerungen (Memory) nutzen, wenn es eine Suchanfrage umformuliert.",
    },

    { type: "h2", text: "Was sagen Googles Patente zu Fan-out, und was beweisen sie nicht?" },
    {
      type: "p",
      text: "Patente werden gern als Beleg dafür zitiert, wie AI Mode funktioniert. Sie zeigen, was Google angemeldet hat, nicht, was produktiv läuft. Drei werden besonders häufig genannt:",
    },
    {
      type: "ul",
      items: [
        "**US11769017B1, „Generative summaries for search results“** (erteilt 2023): beschreibt eine LLM-Zusammenfassung, die nicht nur auf Dokumenten zur eigentlichen Anfrage beruht, sondern auch auf Dokumenten zu verwandten, kürzlich gestellten und implizierten Anfragen ([Google Patents](https://patents.google.com/patent/US11769017B1/en)).",
        "**US20240289407A1, „Search with stateful chat“** (Anmeldung, veröffentlicht 2024): Anspruch 1 umfasst das Erzeugen synthetischer Anfragen aus der Modellausgabe und die Auswahl von Suchergebnis-Dokumenten, die zur ursprünglichen Anfrage und zu diesen synthetischen Anfragen passen ([Google Patents](https://patents.google.com/patent/US20240289407A1/en)).",
        "**WO2024064249A1, „Systems and methods for prompt-based query generation for diverse retrieval“** (veröffentlicht 2024): Trotz des Titels geht es hier darum, mit einem LLM synthetische Anfrage-Dokument-Paare zu erzeugen, um ein Retrieval-Modell zu trainieren. Ein Fan-out zum Zeitpunkt der Antwort beschreibt es nicht ([Google Patents](https://patents.google.com/patent/WO2024064249A1/en)).",
      ],
    },
    {
      type: "p",
      text: "Die ersten beiden beschreiben dieselbe Grundform wie Googles Blogbeiträge: zusätzliche Anfragen ableiten, für alle abrufen, zusammenfassen. Keines verrät, wie viele Teilanfragen AI Mode ausführt, wie Ergebnisse gewichtet werden oder welche Teile tatsächlich im Einsatz sind.",
    },

    { type: "h2", text: "Warum ist Query Fan-out für Ihre Inhalte wichtig?" },
    {
      type: "p",
      text: "**Abgerufen wird pro Teilanfrage.** Sucht eine Engine als eine ihrer Fan-outs nach „Wärmepumpe Betriebskosten vs. Gasheizung“, kommen die Seiten, die für diese Teilanfrage ranken, als Quelle infrage, auch wenn sie für den eingegebenen Prompt nie gerankt haben. Google schreibt, dass seine Modelle beim Erstellen einer Antwort weitere unterstützende Seiten finden und so eine breitere und vielfältigere Auswahl an Links zeigen als die klassische Websuche ([Search Central](https://developers.google.com/search/docs/appearance/ai-features)).",
    },
    {
      type: "p",
      text: "**Die Abdeckung von Unterthemen wird sichtbar.** Eine Fan-out-Liste zeigt, welche Fakten die Engine gebraucht hat. Fragen die Teilanfragen immer wieder nach Preisen, Kompatibilität und Alternativen, überlässt eine Seite, die nur die Hauptfrage beantwortet, diese Teile anderen Quellen.",
    },
    {
      type: "p",
      text: "**Die Planung verschiebt sich von einzelnen Keywords zu Fragenbündeln.** Keyword-Recherche zeigt, was Menschen eintippen. Fan-outs zeigen, wonach eine Engine in ihrem Namen sucht, und diese Suchen sind oft länger und spezifischer. Google weist darauf hin, dass Menschen in seinen KI-Funktionen längere, spezifischere Fragen und Folgefragen stellen ([Search Central Blog, 2025](https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search)).",
    },
    {
      type: "callout",
      tone: "tip",
      title: "Ein Arbeitsmodell",
      text: "Der Prompt bestimmt das Thema, die Fan-outs bestimmen, welche Seiten gelesen werden. Das ist eine Schlussfolgerung aus der oben genannten Dokumentation, keine veröffentlichte Regel eines Anbieters. Sie erklärt aber, warum Seiten, die konkrete Teilfragen sauber beantworten, auch für breite Prompts zitiert werden.",
    },

    { type: "h2", text: "Wo liegen die Grenzen von Fan-out-Daten?" },
    {
      type: "ul",
      items: [
        "**Fan-outs schwanken von Durchlauf zu Durchlauf.** In allen dokumentierten Systemen entscheidet das Modell, ob und wonach es sucht, und ChatGPT kann je nach ersten Treffern weitere Anfragen stellen. Derselbe Prompt kann an verschiedenen Tagen andere Teilanfragen erzeugen. Werten Sie eine einzelne Beobachtung als Anekdote und achten Sie auf wiederkehrende Teilanfragen.",
        "**Nicht alle Fan-outs sind sichtbar.** Google veröffentlicht die Teilanfragen hinter AI Mode und AI Overviews nicht, und die Search Console führt Traffic aus KI-Funktionen im Suchtyp „Web“ mit, nicht pro Teilanfrage. Laut [API-Dokumentation von OpenAI](https://developers.openai.com/api/docs/guides/tools-web-search) enthält eine Suchaktion meist, aber nicht immer, die ausgeführten Suchanfragen.",
        "**Engines unterscheiden sich.** ChatGPT kann umformulierte Anfragen an Suchpartner schicken, Gemini stützt sich auf die Google-Suche, Claude nutzt das Web-Search-Tool von Anthropic. Jede Engine hat eigenen Index und eigenes Ranking; eine Teilanfrage, die Ihre Seite in einer Engine nach oben bringt, muss das in einer anderen nicht tun.",
        "**API-Antworten sind ein Näherungswert.** Über Entwickler-APIs gesammelte Fan-outs zeigen, wie ein Modell unter API-Bedingungen sucht. Die App für Endnutzer kann durch Memory, Standort oder Modellwahl abweichen.",
        "**Gemini ist nicht AI Mode.** Die Suchanfragen, die die Gemini API für Antworten mit Grounding meldet, sind die von Gemini, kein Blick in das Fan-out von AI Mode, auch wenn beide die Google-Suche nutzen.",
      ],
    },

    { type: "h2", text: "Was bedeutet das für Sie, und wie planen Sie Inhalte entlang von Fan-outs?" },
    {
      type: "ol",
      items: [
        "**Fan-outs wiederholt erfassen:** aus Engines, die sie offenlegen, über mehrere Durchläufe und Engines hinweg, für die Prompts, die geschäftlich zählen.",
        "**Normalisieren und zählen:** Fassen Sie nahezu identische Teilanfragen zusammen und sortieren Sie nach Häufigkeit über Durchläufe, Engines und Prompts. Wiederkehr sagt mehr als jede einzelne Liste.",
        "**Nach Unterthemen gruppieren,** etwa Preise, Vergleiche, Kompatibilität, Anleitungen und Aktualität. Jede Gruppe ist ein Kandidat für einen Abschnitt, einen FAQ-Eintrag oder eine eigene Seite.",
        "**Gruppen bestehenden URLs zuordnen:** Legen Sie fest, welche Seite welche Gruppe beantwortet, und erstellen Sie nur dann eine neue Seite, wenn keine bestehende das Unterthema tragen kann, ohne unscharf zu werden.",
        "**Passagen schreiben, die die Teilanfrage direkt beantworten:** Fakt, Zahl oder Empfehlung in den ersten Satz des Abschnitts, mit Datum und Quelle, wo es darauf ankommt. Laut Google gibt es für KI-Funktionen keine besonderen Anforderungen außer Indexierung und Snippet-Berechtigung. Es geht also um gute Inhalte, gegliedert nach den Fragen, die Engines stellen. Weitere Techniken finden Sie unter [GEO-Techniken](/blog/geo-techniques).",
        "**Grundlagen prüfen:** crawlbar, indexiert, wichtige Inhalte als Text (siehe [Lesbarkeit für KI-Crawler](/blog/ai-crawler-readability)).",
        "**Zitationen neu messen:** nach der Änderung pro Engine für den Prompt, nicht nur Rankings für das Hauptkeyword.",
      ],
    },

    { type: "h2", text: "Wie sieht eine Fan-out-Analyse in der Praxis aus?" },
    {
      type: "p",
      text: "**Beispiel:** ExampleTrack ist ein fiktives Unternehmen, das Zeiterfassungssoftware für kleine Agenturen verkauft. Alle Zahlen sind illustrativ und keine gemessenen Daten.",
    },
    {
      type: "ol",
      items: [
        "Das Team trackt vier Wochen lang täglich den Prompt „Welches Zeiterfassungstool eignet sich für eine Designagentur mit zehn Leuten?“ in ChatGPT, Claude, Gemini und Perplexity.",
        "In diesem Zeitraum führen die Engines rund 40 unterschiedliche Teilanfragen aus (illustrativ). Nach dem Zusammenfassen von Dubletten kehren fünf häufig wieder (Tabelle unten).",
        "Das Team gruppiert sie: Preise, Integrationen mit Projektmanagement-Tools, Rechnungsstellung, Aktualität und ein direkter Vergleich.",
        "Es ordnet die Gruppen der eigenen Website zu: Preise stehen nur in einer Grafik, Integrationen und Rechnungsstellung haben keine Seite, der Bestenlisten-Artikel stammt von 2023, und den Vergleich gibt es nur als Vertriebsfolie.",
        "Es stellt die Preise pro Nutzer als Text mit „Stand“-Datum dar, ergänzt einen Abschnitt zu Integrationen und Rechnungsstellung mit kurzer FAQ, aktualisiert den Bestenlisten-Artikel und veröffentlicht eine faire Vergleichsseite.",
        "Nach weiteren vier Wochen vergleicht es pro Engine, wie oft die eigenen Seiten für den Prompt zitiert werden, mit dem ersten Zeitraum.",
      ],
    },
    {
      type: "table",
      head: ["Teilanfrage (illustrativ)", "Gesehen in Durchläufen", "Engines", "Eigene Seite, die sie beantwortet"],
      rows: [
        ["zeiterfassung software agentur preis pro nutzer", "18", "ChatGPT, Perplexity", "Preisseite, Preise nur in einer Grafik"],
        ["zeiterfassung tool mit projektmanagement integration", "11", "Claude, Gemini", "Keine"],
        ["zeiterfassung mit rechnungsstellung für kleine teams", "9", "ChatGPT, Gemini", "Keine"],
        ["beste zeiterfassung app für designer 2026", "7", "Perplexity", "Bestenlisten-Artikel von 2023"],
        ["ExampleTrack vs wettbewerber für agenturen", "5", "ChatGPT", "Keine"],
      ],
      caption: "Illustrative Zahlen für ein fiktives Unternehmen, keine gemessenen Daten.",
    },
    {
      type: "p",
      text: "Das Beispiel zeigt die Reihenfolge der Arbeit: wiederholt beobachten, zählen, gruppieren, Seiten zuordnen, Passagen verbessern, Zitationen erneut messen. Eine Zitation garantiert das nicht, aber es beseitigt die offensichtlichen Gründe, warum keine kommt.",
    },

    { type: "h2", text: "Wie erfassen Sie Fan-out-Anfragen mit AutoSEO?" },
    {
      type: "p",
      text: "AutoSEO speichert Fan-outs als Teil des [KI-Sichtbarkeits-Trackings](/ai-visibility-tracking), allerdings nur, wenn der Anbieter sie liefert. Stand September 2026 erfasst der Code Teilanfragen für ChatGPT, Claude, Gemini und Perplexity, wenn die Antworten über DataForSEO kommen (einschließlich des ChatGPT-App-Scrapers), sowie über die direkten APIs von OpenAI, Anthropic, Gemini, die Agent API von Perplexity, xAI (Grok), Mistral, Meta AI und Kimi, wenn deren Antworten Suchanfragen enthalten. Über DataForSEO kommen für Google AI Overviews, Google AI Mode und Microsoft Copilot keine Fan-outs. Laufen diese Engines stattdessen über die simulierte Ausweichlösung von AutoSEO (ein Modell mit Websuche ahmt die Engine nach, gekennzeichnet als **Simulated**), stammen die gespeicherten Anfragen von diesem Modell und nicht von Google oder Microsoft. Die API von DeepSeek hat keine Websuche, und Antworten des lokalen Agenten enthalten ebenfalls keine Fan-outs.",
    },
    {
      type: "ul",
      items: [
        "**Seite Query Fanouts:** Die Teilanfragen jeder Antwort werden mit Prompt, Engine und Datum gespeichert. Die Seite fasst sie über alle Antworten zusammen und zeigt Häufigkeit, Engines, auslösende Prompts sowie erstes und letztes Auftreten, mit Suche, Zeitraumfilter und CSV-Download ([Query-Fan-out-Analyse](/query-fanout-analysis)).",
        "**Pro Antwort:** Die Antwortansicht listet die **Fan-out queries** neben Antworttext und Quellenangaben.",
        "**Einzelne Prompts testen:** Der Prompt Explorer schickt einen Prompt live über DataForSEO an ChatGPT, Claude, Gemini oder Perplexity und zeigt die Teilanfragen unter **Related queries the model considered** ([Prompt-Recherche](/prompt-research)).",
        "**Content-Pläne:** Für getrackte Prompts mit mindestens zwei Antworten, bei denen Engines mindestens zwei fremde Seiten und keine eigene zitieren, legt AutoSEO eine Content-Gap-Aufgabe an. Deren Gliederungsvorschlag nutzt die häufigsten Fan-outs des Prompts als Überschriften. Den Entwurf können Sie mit den [Content-Werkzeugen](/ai-content-optimization) schreiben.",
        "**Agenten, API und Reports:** Das MCP-Tool `get_query_fanouts` und der REST-Endpunkt `GET /api/v1/projects/{projectId}/fanouts` liefern dieselben gruppierten Daten (Standardzeitraum: 90 Tage) für eigene Agenten und Skripte ([MCP-Server](/mcp-server)); Reports können einen Baustein **Query fan-outs** enthalten.",
      ],
    },
    {
      type: "p",
      text: "Wenn Sie das mit Ihren eigenen Prompts ausprobieren möchten, können Sie AutoSEO kostenlos [selbst hosten](/self-hosting) oder AutoSEO Cloud für [50 US-Dollar pro Monat](/pricing) nutzen.",
    },
    {
      type: "callout",
      tone: "info",
      title: "Methode und Grenzen",
      text: "Dieser Beitrag fasst öffentliche Dokumentation, Patente und Forschung mit Stand 26. September 2026 zusammen. AutoSEO verfügt über keinen eigenen Datensatz, und das Beispiel oben ist fiktiv. Google beschreibt Fan-out für AI Mode und AI Overviews, veröffentlicht aber weder die Teilanfragen noch deren Anzahl pro Antwort. Patente zeigen angemeldete Ideen, keine Produktivsysteme. Suchwerkzeuge ändern sich schnell: Anthropic hat 2026 zwei neue Versionen seines Web-Search-Tools veröffentlicht, OpenAI hat seine Preview-Suchmodelle im Juli 2026 abgeschaltet. Den aktuellen Stand finden Sie in den verlinkten Quellen.",
    },
  ],
  faq: [
    {
      q: "Ist Query Fan-out dasselbe wie Query Expansion?",
      a: "Verwandt, aber nicht identisch. Klassische Query Expansion ergänzt eine einzelne Anfrage um Synonyme oder verwandte Begriffe. Fan-out stellt, wie Google es beschreibt, mehrere getrennte Suchen zu verschiedenen Unterthemen und führt die Ergebnisse zu einer Antwort zusammen. Die Deep Search von Bing lag 2023 dazwischen: Sie formulierte die Anfrage um und suchte auch die Varianten.",
    },
    {
      q: "Kann ich die Fan-out-Anfragen von Google AI Mode sehen?",
      a: "Nicht direkt. Google dokumentiert, dass AI Mode und AI Overviews Fan-out nutzen können, veröffentlicht die Teilanfragen aber nicht, und die Search Console führt KI-Traffic im Suchtyp „Web“ mit. Beobachten können Sie Teilanfragen von Engines, deren APIs sie liefern, etwa ChatGPT, Claude, Gemini und Perplexity, und diese mit diesem Vorbehalt als Näherungswert nutzen.",
    },
    {
      q: "Brauche ich für jede Fan-out-Anfrage eine eigene Seite?",
      a: "Nein. Viele Teilanfragen sind Varianten desselben Bedürfnisses und gehören in einen Abschnitt oder eine FAQ einer bestehenden Seite. Eine neue Seite lohnt sich, wenn eine Gruppe von Teilanfragen regelmäßig wiederkehrt, geschäftlich relevant ist und keine bestehende URL sie beantworten kann, ohne unscharf zu werden.",
    },
    {
      q: "Wie viele Suchen führt eine KI-Suche pro Prompt aus?",
      a: "Das hängt von Engine, Modus und Prompt ab. Laut Anthropic brauchen einfache Faktenfragen meist ein bis drei Suchen, vergleichende Recherchen zehn oder mehr; Google gibt für Deep Search Hunderte an. Kein Anbieter sagt eine feste Zahl zu, deshalb ist die Wiederkehr über mehrere Durchläufe ein besseres Signal als jede einzelne Liste.",
    },
    {
      q: "Wie oft sollte ich Fan-outs erneut prüfen?",
      a: "So oft, dass Sie erkennen, welche Teilanfragen wiederkehren. Fan-outs ändern sich mit Modell, Suchergebnissen und Datum, daher liefert tägliches oder wöchentliches Tracking über mehrere Wochen ein verlässlicheres Bild als eine einmalige Prüfung. Prüfen Sie außerdem nach größeren Updates von Modellen oder Suchwerkzeugen.",
    },
  ],
  sources: [
    { label: "Google: Expanding AI Overviews and introducing AI Mode (2025)", href: "https://blog.google/products-and-platforms/products/search/ai-mode-search/" },
    { label: "Google: AI in Search: Going beyond information to intelligence (I/O 2025)", href: "https://blog.google/products-and-platforms/products/search/google-search-ai-mode-update/" },
    { label: "Google: Ask a Techspert: How does AI understand my visual searches? (2026)", href: "https://blog.google/company-news/inside-google/googlers/how-google-ai-visual-search-works/" },
    { label: "Google Search Central: AI features and your website (2025)", href: "https://developers.google.com/search/docs/appearance/ai-features" },
    { label: "Google Search Central Blog: Top ways to ensure your content performs well in Google's AI experiences on Search (2025)", href: "https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search" },
    { label: "Google Patents: US11769017B1, Generative summaries for search results (2023)", href: "https://patents.google.com/patent/US11769017B1/en" },
    { label: "Google Patents: US20240289407A1, Search with stateful chat (2024)", href: "https://patents.google.com/patent/US20240289407A1/en" },
    { label: "Google Patents: WO2024064249A1, Prompt-based query generation for diverse retrieval (2024)", href: "https://patents.google.com/patent/WO2024064249A1/en" },
    { label: "OpenAI Help Center: Searching the web with ChatGPT (2026)", href: "https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt" },
    { label: "OpenAI API docs: Web search (2026)", href: "https://developers.openai.com/api/docs/guides/tools-web-search" },
    { label: "Anthropic: Web search tool, Claude API docs (2026)", href: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool" },
    { label: "Google AI for Developers: Grounding with Google Search (2026)", href: "https://ai.google.dev/gemini-api/docs/google-search" },
    { label: "Perplexity: Pro Search: Upgraded for more advanced problem-solving (2024)", href: "https://www.perplexity.ai/hub/blog/pro-search-upgraded-for-more-advanced-problem-solving" },
    { label: "Microsoft Bing Blogs: Introducing deep search (2023)", href: "https://blogs.bing.com/search-quality-insights/december-2023/Introducing-Deep-Search" },
    { label: "Press et al.: Measuring and Narrowing the Compositionality Gap in Language Models (Findings of EMNLP 2023)", href: "https://arxiv.org/abs/2210.03350" },
  ],
};
