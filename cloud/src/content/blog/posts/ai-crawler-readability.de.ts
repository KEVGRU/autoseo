import type { BlogPost } from "../types";

const OPENAI = "https://developers.openai.com/api/docs/bots";
const ANTHROPIC = "https://support.claude.com/en/articles/8896518";
const PERPLEXITY = "https://docs.perplexity.ai/guides/bots";
const GOOGLE_CRAWLERS = "https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers";
const GOOGLE_AI = "https://developers.google.com/search/docs/appearance/ai-features";
const GOOGLE_META = "https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag";
const GOOGLE_JS = "https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics";
const APPLE = "https://support.apple.com/en-us/119829";
const BING = "https://blogs.bing.com/webmaster/October-2025/Bing-Introduces-Support-for-the-data-nosnippet-HTML-Attribute";
const META = "https://developers.facebook.com/docs/sharing/webmasters/web-crawlers";
const CCBOT = "https://commoncrawl.org/ccbot";
const VERCEL = "https://vercel.com/blog/the-rise-of-the-ai-crawler";
const LLMSTXT = "https://llmstxt.org/";
const CLOUDFLARE = "https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/";
const RFC9309 = "https://www.rfc-editor.org/rfc/rfc9309.html";

export const post: BlogPost = {
  slug: "ai-crawler-readability",
  title: "Können KI-Crawler Ihre Website lesen? Alle Bots im Überblick",
  description:
    "Welche KI-Crawler Ihre Website besuchen, welche die robots.txt befolgen und wie JavaScript, Snippet-Regeln, CDN-Bot-Schutz und llms.txt den Zugriff prägen.",
  date: "2026-09-26",
  authorSlug: "autoseo-team",
  tags: ["ai-crawlers", "technical"],
  readingMinutes: 12,
  lead:
    "Die meisten KI-Crawler lesen Ihre Website wie ein einfacher HTTP-Client: Sie suchen in der robots.txt nach ihrem eigenen Token, laden das HTML und führen laut einer Drittanalyse meist kein JavaScript aus. Ob sie Ihre Inhalte erreichen, hängt von vier Ebenen ab, die Sie steuern: robots.txt-Regeln pro Crawler, Ihr CDN oder Ihre Firewall, Seitenanweisungen wie `noindex` und `nosnippet` und die Frage, ob der Text im serverseitig gerenderten HTML steht. Such-Indexer und nutzerausgelöste Abrufe entscheiden darüber, ob Sie zitiert werden können; Trainings-Crawler wie GPTBot und ClaudeBot lassen sich getrennt davon ausschließen.",
  blocks: [
    { type: "h2", text: "Welche KI-Crawler besuchen Ihre Website, und was tut jeder davon?" },
    {
      type: "p",
      text: "Die Anbieter trennen ihre Bots inzwischen nach Aufgabe: **Trainings-Crawler** sammeln Inhalte für Modelle, **Such-Indexer** bauen den Index auf, den ein Assistent durchsucht, und **nutzerausgelöste Abrufe** laden eine Seite, weil jemand danach gefragt hat. Google-Extended und Applebot-Extended sind reine Steuer-Tokens für die robots.txt und rufen selbst keine Seiten ab.",
    },
    {
      type: "table",
      head: ["Crawler", "Betreiber", "Zweck (laut Anbieter, gekürzt)", "robots.txt-Token", "Quelle"],
      rows: [
        ["GPTBot", "OpenAI", "Inhalte, die für das Training der OpenAI-Basismodelle genutzt werden können", "`GPTBot`", `[OpenAI (2026)](${OPENAI})`],
        ["OAI-SearchBot", "OpenAI", "Zeigt Websites in der ChatGPT-Suche an", "`OAI-SearchBot`", `[OpenAI (2026)](${OPENAI})`],
        ["ChatGPT-User", "OpenAI", "Nutzeraktionen in ChatGPT und Custom GPTs", "Keins; Regeln gelten evtl. nicht („may not apply“)", `[OpenAI (2026)](${OPENAI})`],
        ["ClaudeBot", "Anthropic", "Webinhalte für das Modelltraining", "`ClaudeBot`", `[Anthropic (2026)](${ANTHROPIC})`],
        ["Claude-SearchBot", "Anthropic", "Indexierung für bessere Suchergebnisse in Claude", "`Claude-SearchBot`", `[Anthropic (2026)](${ANTHROPIC})`],
        ["Claude-User", "Anthropic", "Ruft Seiten ab, wenn Nutzer Claude fragen", "`Claude-User`", `[Anthropic (2026)](${ANTHROPIC})`],
        ["PerplexityBot", "Perplexity", "Suchergebnisse in Perplexity; kein Training", "`PerplexityBot`", `[Perplexity (2026)](${PERPLEXITY})`],
        ["Perplexity-User", "Perplexity", "Besucht Seiten, um eine Nutzerfrage zu beantworten", "`Perplexity-User`, ignoriert robots.txt aber in der Regel", `[Perplexity (2026)](${PERPLEXITY})`],
        ["Googlebot", "Google", "Google-Suche einschließlich AI Overviews und AI Mode", "`Googlebot`", `[Google (2025)](${GOOGLE_AI})`],
        ["Google-Extended", "Google", "Steuer-Token: Gemini-Training und Grounding in Gemini-Apps und Vertex AI", "`Google-Extended`", `[Google (2026)](${GOOGLE_CRAWLERS})`],
        ["Bingbot", "Microsoft", "Bing-Index, der auch Copilot speist", "`bingbot`", `[Bing (2025)](${BING})`],
        ["Applebot", "Apple", "Suche in Spotlight, Siri und Safari; ggf. auch Training von Apple-Modellen", "`Applebot`", `[Apple (2026)](${APPLE})`],
        ["Applebot-Extended", "Apple", "Steuer-Token: Opt-out aus dem Apple-Modelltraining", "`Applebot-Extended`", `[Apple (2026)](${APPLE})`],
        ["Meta-WebIndexer", "Meta", "Suchergebnisse von Meta AI", "`meta-webindexer`", `[Meta (2026)](${META})`],
        ["Meta-ExternalAgent", "Meta", "Training von Basismodellen oder Produktverbesserung", "`meta-externalagent`", `[Meta (2026)](${META})`],
        ["Meta-ExternalFetcher", "Meta", "Links auf Nutzeranfrage; kann robots.txt umgehen („may bypass“)", "`meta-externalfetcher`", `[Meta (2026)](${META})`],
        ["CCBot", "Common Crawl", "Offenes Webarchiv von Common Crawl", "`CCBot`", `[Common Crawl (2026)](${CCBOT})`],
      ],
      caption: "Anbieterdokumentation, Stand September 2026. AI Overviews und AI Mode nutzen den regulären Google-Suchindex, und Microsoft beschreibt Copilot als „powered by Bing“.",
    },

    { type: "h2", text: "Halten sich KI-Crawler an die robots.txt?" },
    {
      type: "p",
      text: "Die automatischen Crawler ja, nach Aussage ihrer Anbieter. Bei nutzerausgelösten Abrufen unterscheidet sich die Formulierung deutlich:",
    },
    {
      type: "ul",
      items: [
        "**OpenAI:** GPTBot und OAI-SearchBot lassen sich unabhängig voneinander steuern. Für ChatGPT-User gilt: Weil ein Nutzer die Aktion auslöst, gelten robots.txt-Regeln möglicherweise nicht („may not apply“).",
        "**Anthropic:** Die Bots respektieren „do not crawl“-Signale über die Standardanweisungen der robots.txt, Claude-User eingeschlossen. Unterstützt wird auch das nicht standardisierte `Crawl-delay`.",
        "**Perplexity:** PerplexityBot befolgt die robots.txt; Perplexity-User „generally ignores robots.txt rules“, da ein Nutzer den Abruf angefordert hat.",
        "**Google:** Die allgemeinen Crawler befolgen beim automatischen Crawlen stets die robots.txt („always obey“).",
        "**Meta:** Meta-ExternalFetcher kann robots.txt-Regeln umgehen („may bypass“).",
        "**Apple:** Applebot respektiert robots.txt-Anweisungen, die sich bei allgemeinen Such-Crawls an Applebot richten.",
      ],
    },
    {
      type: "p",
      text: "Änderungen brauchen Zeit: OpenAI nennt rund 24 Stunden, Perplexity bis zu 24 Stunden. Und die robots.txt ist eine Bitte, kein Schloss: Laut [RFC 9309](" +
        RFC9309 +
        ") sind ihre Regeln „not a form of access authorization“. OpenAI, Anthropic, Perplexity, Apple und Common Crawl veröffentlichen IP-Bereiche zur Verifizierung, Google dokumentiert Reverse-DNS-Muster. Anthropic warnt, dass eine IP-Sperre auch das Lesen Ihrer robots.txt verhindern kann; der dokumentierte Opt-out bleibt deshalb die robots.txt.",
    },

    { type: "h2", text: "Wie erlauben Sie KI-Suche, schließen aber Training aus?" },
    {
      type: "p",
      text: "Legen Sie Such-Indexer und Trainings-Crawler in getrennte Gruppen. Die folgende Vorlage hält eine Website in KI-Antworten zitierbar und widerspricht dem Modelltraining; ersetzen Sie die Beispielpfade durch Ihre eigenen.",
    },
    {
      type: "code",
      lang: "text",
      title: "robots.txt",
      code: `# KI-Such-Indexer und nutzerausgelöste Abrufe: erlaubt
User-agent: OAI-SearchBot
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: PerplexityBot
User-agent: meta-webindexer
Disallow: /warenkorb/
Disallow: /konto/

# Modelltraining (Crawler und Steuer-Tokens): ausgeschlossen
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: meta-externalagent
User-agent: CCBot
Disallow: /

# Alle anderen, auch Googlebot, Bingbot und Applebot
User-agent: *
Disallow: /warenkorb/
Disallow: /konto/

Sitemap: https://www.example.com/sitemap.xml`,
    },
    { type: "h3", text: "Welche Einschränkungen gelten?" },
    {
      type: "ol",
      items: [
        "**Gruppen erben nicht.** Nach RFC 9309 folgt ein Crawler der Gruppe, die ihn nennt, und nutzt die Platzhalter-Gruppe nur, wenn keine passt. Wiederholen Sie Ihre Ausschlüsse daher in jeder Gruppe.",
        "**Google-Extended betrifft mehr als Training.** Das Token regelt auch das Grounding in Gemini-Apps und auf Vertex AI, wirkt aber nicht auf die Google-Suche und entfernt Sie daher nicht aus AI Overviews oder AI Mode.",
        "**Manche Crawler haben mehrere Zwecke.** Applebot-Daten können auch Apple-Modelle trainieren (Opt-out über Applebot-Extended), und Meta-ExternalAgent dient Training oder Produktverbesserung.",
        "**Googlebot oder Bingbot zu sperren ist kein Trainings-Opt-out.** Damit verlassen Sie die Google-Suche samt KI-Funktionen bzw. den Bing-Index hinter Copilot.",
        "**Nutzerausgelöste Abrufe** wie ChatGPT-User, Perplexity-User und Meta-ExternalFetcher ignorieren diese Regeln womöglich, deshalb fehlen sie in der Datei.",
        "**Halten Sie die Datei erreichbar.** Liefert die robots.txt einen Serverfehler (5xx), sollen Crawler laut RFC 9309 von einem vollständigen Verbot ausgehen.",
        "**CCBot ist eine Abwägung:** Er speist ein öffentliches Archiv, dessen Weiterverwendung Sie nicht kontrollieren.",
      ],
    },

    { type: "h2", text: "Können KI-Crawler JavaScript-gerenderte Inhalte lesen?" },
    {
      type: "p",
      text: "Manche ja, und die meisten Anbieter schweigen dazu. [Google beschreibt](" +
        GOOGLE_JS +
        ") eine Pipeline aus Crawling, Rendering und Indexierung, in der Googlebot JavaScript in einer stets aktuellen Chromium-Version ausführt, und nennt serverseitiges oder Pre-Rendering dennoch „a great idea“, weil „not all bots can run JavaScript“. Apple schreibt, Applebot könne Inhalte in einem Browser rendern. Die Crawler-Seiten von OpenAI, Anthropic und Perplexity äußern sich nicht zum Rendering.",
    },
    {
      type: "p",
      text: "Die beste öffentliche Evidenz stammt von Dritten. In [The rise of the AI crawler](" +
        VERCEL +
        ") (Dezember 2024) werteten Vercel und MERJ den Crawler-Traffic im Vercel-Netzwerk aus und kamen zu dem Schluss, dass „none of the major AI crawlers currently render JavaScript“. GPTBot und Claude luden zwar JavaScript-Dateien (11,50 % bzw. 23,84 % ihrer Anfragen), führten sie aber nicht aus; Googles Gemini und AppleBot renderten die Seiten.",
    },
    {
      type: "p",
      text: "Das ist eine fast zwei Jahre alte Momentaufnahme einer einzelnen Plattform. Die Schlussfolgerung gilt trotzdem: Was zitiert werden soll (Produktfakten, Preise, technische Daten, Antworten, interne Links), gehört per serverseitigem Rendering oder statischer Generierung ins initiale HTML.",
    },

    { type: "h2", text: "Welche Seitenanweisungen halten Inhalte aus KI-Antworten heraus?" },
    {
      type: "p",
      text: "Bei Google übernehmen die KI-Funktionen die Regeln der Suche. Ein unterstützender Link in AI Overviews oder AI Mode setzt voraus, dass die Seite indexiert ist und mit Snippet in der Google-Suche erscheinen darf; zusätzliche Anforderungen gibt es nicht. Die Stellschrauben sind `noindex`, `nosnippet`, `max-snippet` und `data-nosnippet`, gesetzt als Meta-Robots-Tag oder als `X-Robots-Tag`-Header, der sich auch an einen einzelnen Crawler richten kann (`X-Robots-Tag: googlebot: nofollow`).",
    },
    {
      type: "table",
      head: ["Aussage", "Was die Quelle sagt", "Quelle (Jahr)"],
      rows: [
        ["`nosnippet` wirkt auf Googles KI-Funktionen", "Verhindert auch, dass Inhalte als „direct input for AI Overviews and AI Mode“ dienen", `[Google Search Central (2026)](${GOOGLE_META})`],
        ["`max-snippet` begrenzt den KI-Input", "Begrenzt auch, wie viel Inhalt als direkter Input für beide genutzt werden darf", `[Google Search Central (2026)](${GOOGLE_META})`],
        ["Bing wendet `data-nosnippet` auf KI-Antworten an", "Markierte Inhalte werden „excluded from snippets and AI summaries“", `[Bing Webmaster Blog (2025)](${BING})`],
        ["Google braucht keine KI-Sonderdateien", "„You don't need to create new machine readable files, AI text files, or markup to appear in these features.“", `[Google Search Central (2025)](${GOOGLE_AI})`],
      ],
      caption: "Direkte Aussagen aus Primärdokumentation, Stand September 2026.",
    },
    {
      type: "p",
      text: "Der Haken: Diese Anweisungen kürzen oder entfernen auch Ihre regulären Snippets, und Google dokumentiert keinen Schalter nur für die KI-Funktionen. Prüfen Sie Templates auf Altlasten wie ein `max-snippet:0` aus der Staging-Umgebung. Wie sich die beiden Google-Oberflächen unterscheiden, lesen Sie in [AI Mode vs. AI Overviews](/blog/ai-mode-vs-ai-overviews).",
    },

    { type: "h2", text: "Kann ein CDN oder eine Firewall KI-Crawler unbemerkt blockieren?" },
    {
      type: "p",
      text: "Ja. Die robots.txt kann einen Crawler erlauben, den Ihr Edge-Netzwerk anschließend blockiert oder mit einer Challenge abfängt. Cloudflare ist das deutlichste Beispiel, weil sich dort gerade die Standardwerte geändert haben. Stand September 2026 ordnet [die Dokumentation](" +
        CLOUDFLARE +
        ") KI-Bots nach Verhalten: **Search** (Indexierung, um später Fragen zu beantworten), **Agent** (Echtzeit-Aktivität im Auftrag einer Person, etwa „chat fetch bots and browser-use agents“) und **Training**. Jede Kategorie lässt sich auf allen Seiten blockieren, nur auf Seiten mit Werbung blockieren oder zulassen.",
    },
    {
      type: "p",
      text: "Seit dem 15. September 2026 erhalten neue Domains als Standard: Training und Agent werden auf Seiten mit Werbung blockiert, Search bleibt erlaubt. Crawler mit gemischtem Zweck (Search und Training) werden von jeder Konfiguration blockiert, die Training sperrt, auch von der alten Einstellung **Block AI bots**. Auf einer neuen Domain kann also ein nutzerausgelöster Abruf einer werbefinanzierten Seite standardmäßig scheitern. Prüfen Sie **Security Settings → Configure AI bot policies** (Bezeichnungen Stand September 2026) sowie eigene Firewall-Regeln bei jedem CDN, das Sie nutzen, und testen Sie mit echten Anfragen.",
    },

    { type: "h2", text: "Hilft eine llms.txt KI-Crawlern beim Lesen Ihrer Website?" },
    {
      type: "p",
      text: "Offizielle Belege dafür gibt es nicht, und sie steuert nichts. [llms.txt](" +
        LLMSTXT +
        ") ist ein Vorschlag von Jeremy Howard, erstmals am 3. September 2024 veröffentlicht und am 10. August 2026 als v2 überarbeitet: eine Markdown-Datei unter `/llms.txt` mit dem Seitennamen als H1, einer kurzen Zusammenfassung und H2-Abschnitten mit den wichtigsten Links. Sie ist kein formaler Standard und erteilt oder verweigert keinen Zugriff.",
    },
    {
      type: "p",
      text: "Der Vorschlag verweist darauf, dass OpenAI, Anthropic und Googles Gemini-Team llms.txt-Dateien für ihre Entwicklerdokumentation veröffentlichen; veröffentlichen heißt aber nicht auslesen. Google stellt klar, dass für AI Overviews und AI Mode keine KI-Textdateien nötig sind. Keine der hier zitierten Crawler-Dokumentationen erwähnt das Auslesen von llms.txt, und Stand September 2026 haben wir keine offizielle Zusage von OpenAI, Anthropic, Perplexity, Microsoft oder Google gefunden, die Datei zu nutzen.",
    },
    {
      type: "p",
      text: "Wenn Sie trotzdem eine veröffentlichen, halten Sie sie korrekt und synchron mit Ihrer Sitemap, und machen Sie sie nie zum einzigen Ort für wichtige Inhalte.",
    },

    { type: "h2", text: "Was bedeutet das für Sie?" },
    {
      type: "p",
      text: "Zugang ist die Voraussetzung für Zitationen, keine Garantie (was Zitationen bringt, zeigt [welche GEO-Techniken wirken](/blog/geo-techniques)). Für den Zugang selbst:",
    },
    {
      type: "ol",
      items: [
        "**Entscheiden Sie nach Zweck, nicht nach Anbieter.** Lassen Sie Such-Indexer und nutzerausgelöste Abrufe zu; über Trainings-Crawler entscheiden Sie separat.",
        "**Testen Sie den Weg, nicht nur die Datei.** Rufen Sie wichtige Seiten mit dem User-Agent jedes Crawlers ab und prüfen Sie die Bot-Einstellungen Ihres CDN nach jeder Sicherheitsänderung.",
        "**Rendern Sie serverseitig, was zitiert werden soll:** Preise, Produktfakten, Dokumentation und FAQs.",
        "**Prüfen Sie Templates** auf `noindex`, `nosnippet` und `max-snippet:0` bei Seiten, die zitiert werden sollen.",
        "**Halten Sie die robots.txt schnell und mit Status 200 erreichbar**, nennen Sie darin Ihre Sitemap und planen Sie einen Tag für Änderungen ein.",
        "**Verifizieren Sie in Logs per IP, nicht per User-Agent.** Einen GPTBot-User-Agent kann jeder senden.",
        "**Behandeln Sie llms.txt als optionale Ordnungsaufgabe.**",
      ],
    },
    { type: "h3", text: "Beispiel: Crawler-Zugang für eine Preisseite reparieren" },
    {
      type: "p",
      text: "Beispiel (hypothetisch; alle Zahlen sind illustrativ): Ein B2B-Softwareanbieter möchte von ChatGPT, Claude und Perplexity zitiert werden, das Modelltraining aber ausschließen.",
    },
    {
      type: "ol",
      items: [
        "Seine robots.txt sperrt GPTBot und ClaudeBot bewusst; ein Crawlability-Check bestätigt, dass OAI-SearchBot, Claude-SearchBot und PerplexityBot erlaubt sind.",
        "Der Live-Abruf widerspricht: Mit diesen drei User-Agents liefert `/preise` HTTP 403, ein Browser erhält 200. Ursache ist eine Firewall-Regel aus einem früheren Scraping-Vorfall, die fast alle Nicht-Browser-User-Agents sperrt.",
        "Das rohe HTML von `/preise` enthält 30 Wörter und einen leeren `#root`-Container; Crawler ohne JavaScript sehen keine Preise.",
        "Das Doku-Template setzt seitenweit `max-snippet:0`, ein Überbleibsel aus dem Staging.",
        "Das Team nimmt die veröffentlichten IP-Bereiche der Such-Crawler von der Firewall-Regel aus, rendert `/preise` vor, entfernt `max-snippet:0` und startet den Check erneut.",
        "Zwei Wochen Logs zeigen OAI-SearchBot und PerplexityBot mit Status 200 auf `/preise`, von IPs innerhalb der veröffentlichten Bereiche: Die Korrektur hat die echten Crawler erreicht, nicht nur einen Test.",
      ],
    },

    { type: "h2", text: "Wie prüfen Sie den Crawler-Zugang mit AutoSEO?" },
    {
      type: "p",
      text: "Der [KI-Crawlability-Check](/ai-crawlability) wertet die robots.txt für 25 KI- und Such-Crawler-Tokens aus (plus zwei SEO-Tool-Crawler, angezeigt, aber nicht bewertet), einschließlich des Anteils von bis zu 300 Sitemap-URLs, die jeder davon nicht abrufen darf, und behandelt eine robots.txt mit 5xx-Fehler als Komplettsperre. Er ruft bis zu drei wichtige Seiten mit dem User-Agent jedes Crawlers ab und vergleicht Status, Weiterleitungen und Wortzahl mit einem Browser-Abruf; so werden Firewall-Challenges sichtbar. Außerdem liest er Meta-Robots und `X-Robots-Tag` (auch botspezifische Tags wie `gptbot`), beurteilt anhand des rohen HTML, ob Seiten von JavaScript abhängen, validiert die llms.txt und prüft Sitemaps, Canonicals und JSON-LD.",
    },
    {
      type: "p",
      text: "Die Befunde enthalten Korrekturvorschläge, etwa ein robots.txt-Snippet, das gesperrte Such-Crawler wieder zulässt und Ihre bestehenden Ausschlüsse beibehält, oder einen llms.txt-Entwurf auf Basis Ihres letzten [Site-Audits](/site-audit). Checks laufen auf Wunsch wöchentlich oder monatlich mit Benachrichtigung bei sinkendem Score, oder über `run_crawlability_check` im [MCP-Server](/mcp-server). Der Score gewichtet Such- und nutzerausgelöste Crawler dreimal so stark wie Trainings-Crawler; llms.txt macht 10 von 100 Punkten aus. Angesichts der obigen Evidenz sollten Sie eine fehlende Datei geringer gewichten als einen gesperrten Such-Crawler.",
    },
    {
      type: "p",
      text: "Der User-Agent-Test läuft von AutoSEO-Servern aus; eine Firewall, die nur verifizierte Crawler-IPs zulässt, kann also den Test sperren, den echten Crawler aber durchlassen. Klarheit bringen Logs: [KI-Bot-Traffic](/ai-bot-traffic) importiert Access-Logs (nginx, Apache, Cloudflare Logpush, Akamai DataStream 2, NDJSON; bis 1 GB) oder empfängt sie per Cloudflare Worker ([Bot-Traffic-Integrationen](/integrations/bot-traffic), [Cloudflare](/integrations/cloudflare)). Jeder Abruf wird einem Crawler zugeordnet und mit den veröffentlichten IP-Bereichen von OpenAI, Anthropic, Perplexity, Google, Microsoft und Apple abgeglichen. So trennen Sie verifizierte Besuche von vermutlich gefälschten und sehen Statuscodes pro Pfad.",
    },
    {
      type: "callout",
      tone: "info",
      title: "Methode und Grenzen",
      text: "Dieser Beitrag fasst Anbieterdokumentation (Stand September 2026), RFC 9309 und eine Drittanalyse (Vercel und MERJ, 2024) zusammen; AutoSEO verfügt über keinen eigenen Crawler-Datensatz. Crawler-Listen und CDN-Standards ändern sich häufig, und der JavaScript-Befund kann veraltet sein. Aussagen zu nutzerausgelösten Abrufen geben die vorsichtigen Formulierungen der Anbieter wieder, keine Garantien. Prüfen Sie die verlinkten Seiten erneut, bevor Sie Sperren einrichten.",
    },
  ],
  faq: [
    {
      q: "Verschwindet meine Website aus der ChatGPT-Suche, wenn ich GPTBot sperre?",
      a: "Nein. Laut OpenAI werden GPTBot (Training) und OAI-SearchBot (ChatGPT-Suche) unabhängig voneinander gesteuert. Websites, die OAI-SearchBot ausschließen, erscheinen nicht in den Suchantworten von ChatGPT, können aber weiterhin als Navigationslinks auftauchen.",
    },
    {
      q: "Hält eine Sperre von Google-Extended meine Inhalte aus AI Overviews heraus?",
      a: "Nein. Google-Extended wirkt laut Google nicht auf die Aufnahme in die Google-Suche, und AI Overviews sowie AI Mode verlinken indexierte, snippetfähige Seiten. Um dort weniger zu zeigen, nutzen Sie `nosnippet`, `data-nosnippet`, `max-snippet` oder `noindex`, die auch reguläre Snippets betreffen.",
    },
    {
      q: "Wie erkenne ich, ob eine Anfrage wirklich von GPTBot oder ClaudeBot stammt?",
      a: "Gleichen Sie die IP mit der veröffentlichten Liste des Anbieters ab, etwa `openai.com/gptbot.json` oder `claude.com/crawling/bots.json`; Google und Apple dokumentieren zusätzlich Reverse-DNS-Prüfungen. Ein passender User-Agent allein beweist nichts.",
    },
    {
      q: "Wie lange dauert es, bis KI-Crawler robots.txt-Änderungen übernehmen?",
      a: "OpenAI nennt für seine Suchsysteme rund 24 Stunden, Perplexity bis zu 24 Stunden. Laut RFC 9309 sollen Crawler eine zwischengespeicherte robots.txt nicht länger als 24 Stunden nutzen, sofern die Datei erreichbar ist. Planen Sie mindestens einen Tag ein und prüfen Sie die Wirkung in Ihren Logs.",
    },
    {
      q: "Sollte ich trotzdem eine llms.txt veröffentlichen?",
      a: "Das ist optional. Kein großer KI-Anbieter hat offiziell erklärt, dass seine Crawler sie nutzen, und Google braucht für AI Overviews und AI Mode keine KI-Textdateien. Wenn Sie eine veröffentlichen, halten Sie sie aktuell und verstehen Sie sie als Hilfe für Agenten, nicht als Zugriffssteuerung.",
    },
  ],
  sources: [
    { label: "OpenAI: Overview of OpenAI Crawlers (2026)", href: OPENAI },
    { label: "Anthropic: Does Anthropic crawl data from the web, and how can site owners block the crawler? (2026)", href: ANTHROPIC },
    { label: "Perplexity: Perplexity Crawlers (2026)", href: PERPLEXITY },
    { label: "Google Search Central: Google's common crawlers (2026)", href: GOOGLE_CRAWLERS },
    { label: "Google Search Central: AI features and your website (2025)", href: GOOGLE_AI },
    { label: "Google Search Central: Robots meta tag, data-nosnippet, and X-Robots-Tag specifications (2026)", href: GOOGLE_META },
    { label: "Google Search Central: Understand JavaScript SEO basics (2026)", href: GOOGLE_JS },
    { label: "Apple: About Applebot (2026)", href: APPLE },
    { label: "Bing Webmaster Blog: Bing Introduces Support for the data-nosnippet HTML Attribute (2025)", href: BING },
    { label: "Meta for Developers: Meta Web Crawlers (2026)", href: META },
    { label: "Common Crawl: CCBot (2026)", href: CCBOT },
    { label: "Vercel und MERJ: The rise of the AI crawler (2024)", href: VERCEL },
    { label: "Jeremy Howard: The /llms.txt file, llmstxt.org (2024, v2 2026)", href: LLMSTXT },
    { label: "Cloudflare Docs: Block AI Bots und AI-Bot-Richtlinien (2026)", href: CLOUDFLARE },
    { label: "IETF: RFC 9309, Robots Exclusion Protocol (2022)", href: RFC9309 },
  ],
};
