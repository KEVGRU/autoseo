/**
 * UI copy of the free AI visibility check (tool, results, fix explanations) in both languages. The page passes
 * one language to the client component as a prop, so only that language is shipped to the browser.
 */
import type { BotPurpose } from "./bots";
import type { CategoryKey, FixId, StepId } from "./types";

export type FixCopy = { title: string; body: string; how: string };

export type CheckCopy = {
  form: {
    label: string;
    placeholder: string;
    submit: string;
    running: string;
    examples: string;
    privacy: string;
  };
  steps: Record<StepId, string>;
  stepState: { pending: string; running: string; done: string };
  errors: { network: string; generic: string; rateLimited: string };
  unreachable: Record<string, string>;
  result: {
    scoreLabel: string;
    outOf: string;
    grades: { good: string; fair: string; poor: string };
    gradeText: { good: string; fair: string; poor: string };
    checked: string;
    duration: string;
    cached: string;
    again: string;
    categoriesTitle: string;
    categories: Record<CategoryKey, { label: string; hint: string }>;
    fixesTitle: string;
    fixesEmpty: string;
    severity: { high: string; medium: string; low: string };
    howLabel: string;
    botsTitle: string;
    botsSubtitle: string;
    botsHead: { bot: string; purpose: string; status: string; rule: string };
    purposes: Record<BotPurpose, string>;
    allowed: string;
    blocked: string;
    source: { specific: string; wildcard: string; none: string; "no-robots": string; unreachable: string };
    mayIgnore: string;
    detailsTitle: string;
    details: {
      http: string;
      status: string;
      finalUrl: string;
      redirects: string;
      https: string;
      httpRedirect: string;
      ttfb: string;
      hsts: string;
      content: string;
      words: string;
      rendering: string;
      renderingValue: { server: string; thin: string; js: string; unknown: string };
      spa: string;
      metadata: string;
      title: string;
      description: string;
      canonical: string;
      lang: string;
      hreflang: string;
      h1: string;
      schema: string;
      jsonLd: string;
      types: string;
      files: string;
      robots: string;
      robotsState: { ok: string; missing: string; unreachable: string; skipped: string };
      llms: string;
      sitemap: string;
      urls: string;
      yes: string;
      no: string;
      none: string;
      notTested: string;
    };
    readinessNote: string;
    cta: { title: string; body: string; primary: string; secondary: string };
  };
  fixes: Record<FixId, FixCopy>;
};

const en: CheckCopy = {
  form: {
    label: "Website to check",
    placeholder: "example.com",
    submit: "Check my site",
    running: "Checking…",
    examples: "Try:",
    privacy: "No sign-up, no email. We fetch a few public URLs of the site you enter, once, and store nothing.",
  },
  steps: {
    fetch: "Fetching the page like a crawler (no JavaScript)",
    robots: "Reading robots.txt for 15 AI and search crawlers",
    files: "Looking for llms.txt and the XML sitemap",
    analyze: "Analyzing text, metadata and structured data",
  },
  stepState: { pending: "Waiting", running: "In progress", done: "Done" },
  errors: {
    network: "The check could not be reached. Check your connection and try again.",
    generic: "The check failed. Please try again.",
    rateLimited: "You've run several checks in a short time. Please wait a few minutes.",
  },
  unreachable: {
    dns: "The domain could not be resolved (DNS).",
    blocked: "The domain does not resolve to a public address.",
    timeout: "The server did not respond within the time limit.",
    tls: "The TLS certificate could not be verified and plain HTTP did not work either.",
    connection: "The server refused or dropped the connection.",
    too_many_redirects: "The page redirects too many times.",
    decode: "The response could not be decoded.",
    invalid_url: "The URL is not valid.",
  },
  result: {
    scoreLabel: "AI readiness score",
    outOf: "of 100",
    grades: { good: "Good", fair: "Needs work", poor: "Poor" },
    gradeText: {
      good: "AI crawlers can reach and read this site. Now find out what AI engines actually say about it.",
      fair: "AI engines can read parts of this site, but some issues make it harder to cite. Start with the fixes below.",
      poor: "AI engines will struggle to read or cite this site. The fixes below are ordered by impact.",
    },
    checked: "Checked",
    duration: "in {s} s",
    cached: "Result from the last 10 minutes",
    again: "Check another site",
    categoriesTitle: "Score breakdown",
    categories: {
      crawlers: { label: "AI crawler access", hint: "robots.txt rules, noindex and bot protection" },
      content: { label: "Readable without JavaScript", hint: "Text in the HTML that crawlers receive" },
      structure: { label: "Structure & metadata", hint: "JSON-LD, title, description, canonical, language, H1" },
      technical: { label: "HTTP & performance", hint: "Status, HTTPS, redirects, response time" },
      discovery: { label: "Discovery files", hint: "XML sitemap and llms.txt" },
    },
    fixesTitle: "Prioritized fixes",
    fixesEmpty: "No issues found. Nice work.",
    severity: { high: "High impact", medium: "Medium", low: "Low" },
    howLabel: "How to fix",
    botsTitle: "AI crawler access",
    botsSubtitle: "What robots.txt allows each crawler on the checked page.",
    botsHead: { bot: "Crawler", purpose: "Purpose", status: "Access", rule: "Deciding rule" },
    purposes: { search: "AI search / index", user: "User-initiated fetch", training: "Model training" },
    allowed: "Allowed",
    blocked: "Blocked",
    source: {
      specific: "own group",
      wildcard: "via User-agent: *",
      none: "no rule applies",
      "no-robots": "no robots.txt",
      unreachable: "robots.txt unreachable",
    },
    mayIgnore: "The vendor says this user-initiated agent may not follow robots.txt.",
    detailsTitle: "Everything we found",
    details: {
      http: "HTTP",
      status: "Status",
      finalUrl: "Final URL",
      redirects: "Redirects",
      https: "HTTPS",
      httpRedirect: "http:// → https://",
      ttfb: "Time to first byte",
      hsts: "HSTS header",
      content: "Content",
      words: "Words in the HTML",
      rendering: "Rendering",
      renderingValue: {
        server: "Server-rendered",
        thin: "Little text in the HTML",
        js: "Needs JavaScript",
        unknown: "Not analyzed",
      },
      spa: "App-shell signals",
      metadata: "Metadata",
      title: "Title",
      description: "Meta description",
      canonical: "Canonical",
      lang: "Language",
      hreflang: "hreflang alternates",
      h1: "H1",
      schema: "Structured data",
      jsonLd: "JSON-LD blocks",
      types: "Types",
      files: "Files",
      robots: "robots.txt",
      robotsState: { ok: "Found", missing: "Not found (everything allowed)", unreachable: "Unreachable (crawlers assume: blocked)", skipped: "Not checked" },
      llms: "llms.txt",
      sitemap: "XML sitemap",
      urls: "{n} URLs listed",
      yes: "Yes",
      no: "No",
      none: "None",
      notTested: "Not tested",
    },
    readinessNote:
      "This check measures whether AI engines **can** read your site. It does not show what ChatGPT, Perplexity, Gemini or Claude actually **answer** about your brand — that needs tracked prompts over time.",
    cta: {
      title: "Track what AI engines actually answer",
      body: "AutoSEO runs your prompts on ChatGPT, Perplexity, Gemini, Claude, Google AI Overviews and more, and shows visibility, position, citations and sentiment next to your competitors.",
      primary: "Start AutoSEO",
      secondary: "Self-host for free",
    },
  },
  fixes: {
    unreachable: {
      title: "The site could not be fetched",
      body: "{error} If our checker can't load the page, AI crawlers most likely can't either.",
      how: "Make sure the domain resolves, the server answers on port 443 with a valid certificate, and the homepage returns HTTP 200.",
    },
    http_error: {
      title: "The page returns HTTP {status}",
      body: "Crawlers only use pages that answer with a 2xx status. Error pages are not indexed or cited.",
      how: "Serve the page with status 200. If it moved, redirect permanently (301/308) to the new URL.",
    },
    bot_protection: {
      title: "A bot challenge blocks automated visitors (HTTP {status})",
      body: "The site answered our checker with a CDN/WAF challenge instead of the page. AI crawlers usually get the same challenge and can't read or cite your content. Some CDNs block AI crawlers by default.",
      how: "In your CDN or WAF (e.g. Cloudflare → Security → Bots), allow verified search and AI crawlers you want to be visible in, such as Googlebot, Bingbot, OAI-SearchBot, Claude-SearchBot and PerplexityBot.",
    },
    https_missing: {
      title: "HTTPS does not work",
      body: "The page could only be loaded over plain HTTP (or the certificate is invalid). Search and AI engines prefer secure pages, and many clients refuse invalid certificates.",
      how: "Install a valid TLS certificate (e.g. Let's Encrypt) and serve every page over https://.",
    },
    http_no_redirect: {
      title: "http:// does not redirect to https://",
      body: "The plain HTTP version of the site answers without redirecting, so two versions of every page exist.",
      how: "Redirect all http:// requests permanently (301) to the https:// URL.",
    },
    slow_response: {
      title: "Slow server response ({ms} ms to first byte)",
      body: "AI crawlers and user-initiated fetches work with tight time budgets. Slow responses mean fewer pages crawled and a higher risk of time-outs when a user asks an assistant about your page.",
      how: "Cache HTML at the edge or server, reduce server-side work per request, and aim for well under 800 ms to first byte.",
    },
    long_redirect_chain: {
      title: "Long redirect chain ({hops} hops)",
      body: "Every redirect costs time and crawl budget; long chains are sometimes abandoned.",
      how: "Link and redirect directly to the final URL in a single hop.",
    },
    robots_unreachable: {
      title: "robots.txt is unreachable (status {status})",
      body: "When robots.txt answers with a server error (5xx) or 429, or doesn't answer at all, crawlers following RFC 9309 must assume the whole site is disallowed.",
      how: "Serve /robots.txt with status 200 (or 404 if you have none). Check your CDN, firewall and server logs for errors on that URL.",
    },
    robots_blocks_all: {
      title: "robots.txt blocks all crawlers",
      body: "A `User-agent: *` group with `Disallow: /` applies to every crawler that has no group of its own — including all AI search crawlers. Your content can't be indexed for AI answers.",
      how: "Remove `Disallow: /` from the `*` group, or add groups that allow the crawlers you want (e.g. `User-agent: OAI-SearchBot` + `Allow: /`).",
    },
    search_bots_blocked: {
      title: "AI search crawlers are blocked: {bots}",
      body: "These crawlers build the indexes that AI search products cite from. Blocked, your pages can't appear as sources in those answers.",
      how: "In robots.txt, remove the Disallow rules that match these crawlers or add a specific group with `Allow: /` for each of them.",
    },
    user_bots_blocked: {
      title: "User-initiated AI fetchers are blocked: {bots}",
      body: "These agents load a page when a user asks an assistant about it (e.g. pastes your URL). Blocking them means the assistant can't read the page for that user.",
      how: "Allow these agents in robots.txt unless you deliberately want to keep assistants from reading your pages.",
    },
    training_bots_blocked: {
      title: "Model-training crawlers are blocked: {bots}",
      body: "Blocking training crawlers is a legitimate choice and doesn't block AI search crawlers. It can reduce how well future models know your brand from your own content.",
      how: "Keep the block if it's intentional. Otherwise allow them in robots.txt. Blocking Google-Extended does not affect Google Search or AI Overviews.",
    },
    noindex: {
      title: "The page is set to noindex",
      body: "A robots meta tag or X-Robots-Tag header tells search engines not to index this page. Search-grounded AI answers (Google AI Overviews, Copilot, ChatGPT search) then can't use it.",
      how: "Remove `noindex` (or `none`) from the robots meta tag and the X-Robots-Tag header on pages that should be found.",
    },
    js_only: {
      title: "The content needs JavaScript ({words} words in the HTML)",
      body: "The HTML delivered to crawlers is an almost empty app shell. Most AI crawlers don't execute JavaScript, so they see no content to understand or cite.",
      how: "Render the content on the server: server-side rendering or static generation (e.g. Next.js, Nuxt, Astro, SvelteKit), or pre-rendering for crawlers.",
    },
    thin_content: {
      title: "Very little text in the HTML ({words} words)",
      body: "AI engines quote and summarize text. With little readable text in the initial HTML there is little to cite.",
      how: "Put the key information — what you offer, for whom, facts, prices, FAQs — as real text in the server-rendered HTML.",
    },
    no_jsonld: {
      title: "No JSON-LD structured data",
      body: "Structured data states facts about your organization, products and pages in a machine-readable way. It helps search and AI systems identify who is behind the site.",
      how: "Add schema.org JSON-LD: at least Organization (name, logo, sameAs profiles) and WebSite; plus Product, Service, Article or FAQPage where they fit.",
    },
    jsonld_invalid: {
      title: "{errors} JSON-LD block(s) can't be parsed",
      body: "Invalid JSON is ignored completely, so the structured data in these blocks has no effect.",
      how: "Validate the markup with the Schema.org validator (validator.schema.org) or Google's Rich Results Test and fix the JSON syntax.",
    },
    no_entity_schema: {
      title: "Structured data doesn't describe the organization",
      body: "JSON-LD was found ({types}), but nothing that says who is behind the site (Organization, LocalBusiness, Person, WebSite, Product …).",
      how: "Add an Organization (or LocalBusiness/Person) node with name, url, logo and sameAs links to your official profiles.",
    },
    title_missing: {
      title: "No page title",
      body: "The title is the first thing search and AI systems use to understand what a page is about.",
      how: "Add a unique, descriptive <title> of roughly 30–60 characters.",
    },
    title_length: {
      title: "Title length is off ({length} characters)",
      body: "Very short titles say little; very long ones get truncated.",
      how: "Aim for roughly 30–60 characters that name the page topic and your brand.",
    },
    description_missing: {
      title: "No meta description",
      body: "The meta description is a short summary that search engines often show and systems use to understand the page.",
      how: "Add a unique meta description of roughly 120–160 characters.",
    },
    description_length: {
      title: "Meta description length is off ({length} characters)",
      body: "Descriptions that are too short say little; long ones get cut off.",
      how: "Aim for roughly 120–160 characters that summarize the page.",
    },
    canonical_missing: {
      title: "No canonical URL",
      body: "Without a canonical tag, duplicates (parameters, trailing slashes, http/https) compete with each other.",
      how: 'Add <link rel="canonical" href="…"> with the preferred absolute URL of the page.',
    },
    canonical_other_host: {
      title: "Canonical points to another site ({canonical})",
      body: "A canonical on a different host tells search engines to index the other site instead of this one.",
      how: "Point the canonical to this page's own preferred URL, unless the content really is a copy.",
    },
    lang_missing: {
      title: "No language declared",
      body: "The lang attribute tells crawlers and assistants which language the page is in — relevant for answering in the right market.",
      how: 'Set the language on the html element, e.g. <html lang="en">.',
    },
    h1_missing: {
      title: "No H1 heading",
      body: "A clear main heading helps systems identify the page topic and structure the content.",
      how: "Add exactly one descriptive H1 as real text (not only in an image).",
    },
    sitemap_missing: {
      title: "No XML sitemap found",
      body: "A sitemap lists the URLs you want crawled and helps crawlers discover new and updated pages.",
      how: "Publish /sitemap.xml (most CMSs generate one) and reference it in robots.txt with `Sitemap: https://…/sitemap.xml`.",
    },
    llms_missing: {
      title: "No llms.txt",
      body: "llms.txt is a proposed convention (llmstxt.org) for a Markdown summary of your site for AI assistants. Major AI crawlers don't document using it yet, so it's low priority — but it's cheap and helps tools and agents that do read it.",
      how: "Publish /llms.txt: a # title, a short > summary and links to your most important pages with one-line descriptions.",
    },
    llms_invalid: {
      title: "llms.txt doesn't start with a # title",
      body: "The llms.txt proposal expects a Markdown file that starts with an H1 (the site or project name).",
      how: "Start the file with `# Your name`, followed by a short `>` summary and sections with links.",
    },
  },
};

const de: CheckCopy = {
  form: {
    label: "Zu prüfende Website",
    placeholder: "beispiel.de",
    submit: "Website prüfen",
    running: "Wird geprüft …",
    examples: "Beispiel:",
    privacy: "Ohne Anmeldung, ohne E-Mail. Wir rufen einige öffentliche URLs der eingegebenen Website einmalig ab und speichern nichts.",
  },
  steps: {
    fetch: "Seite wie ein Crawler abrufen (ohne JavaScript)",
    robots: "robots.txt für 15 KI- und Such-Crawler auswerten",
    files: "Nach llms.txt und XML-Sitemap suchen",
    analyze: "Text, Metadaten und strukturierte Daten analysieren",
  },
  stepState: { pending: "Wartet", running: "Läuft", done: "Fertig" },
  errors: {
    network: "Der Check ist nicht erreichbar. Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
    generic: "Der Check ist fehlgeschlagen. Bitte versuchen Sie es erneut.",
    rateLimited: "Sie haben in kurzer Zeit mehrere Checks gestartet. Bitte warten Sie einige Minuten.",
  },
  unreachable: {
    dns: "Die Domain konnte nicht aufgelöst werden (DNS).",
    blocked: "Die Domain verweist auf keine öffentliche Adresse.",
    timeout: "Der Server hat nicht innerhalb des Zeitlimits geantwortet.",
    tls: "Das TLS-Zertifikat ließ sich nicht verifizieren, und unverschlüsseltes HTTP funktionierte ebenfalls nicht.",
    connection: "Der Server hat die Verbindung abgelehnt oder abgebrochen.",
    too_many_redirects: "Die Seite leitet zu oft weiter.",
    decode: "Die Antwort konnte nicht dekodiert werden.",
    invalid_url: "Die URL ist ungültig.",
  },
  result: {
    scoreLabel: "KI-Readiness-Score",
    outOf: "von 100",
    grades: { good: "Gut", fair: "Ausbaufähig", poor: "Schwach" },
    gradeText: {
      good: "KI-Crawler können diese Website erreichen und lesen. Finden Sie jetzt heraus, was KI-Suchmaschinen tatsächlich über sie sagen.",
      fair: "KI-Suchmaschinen können Teile der Website lesen, einige Probleme erschweren aber das Zitieren. Beginnen Sie mit den Maßnahmen unten.",
      poor: "KI-Suchmaschinen werden diese Website nur schwer lesen oder zitieren können. Die Maßnahmen unten sind nach Wirkung sortiert.",
    },
    checked: "Geprüft",
    duration: "in {s} s",
    cached: "Ergebnis aus den letzten 10 Minuten",
    again: "Andere Website prüfen",
    categoriesTitle: "Aufschlüsselung",
    categories: {
      crawlers: { label: "Zugang für KI-Crawler", hint: "robots.txt-Regeln, noindex und Bot-Schutz" },
      content: { label: "Ohne JavaScript lesbar", hint: "Text im HTML, das Crawler erhalten" },
      structure: { label: "Struktur & Metadaten", hint: "JSON-LD, Title, Description, Canonical, Sprache, H1" },
      technical: { label: "HTTP & Performance", hint: "Status, HTTPS, Weiterleitungen, Antwortzeit" },
      discovery: { label: "Discovery-Dateien", hint: "XML-Sitemap und llms.txt" },
    },
    fixesTitle: "Priorisierte Maßnahmen",
    fixesEmpty: "Keine Probleme gefunden. Sehr gut.",
    severity: { high: "Hohe Wirkung", medium: "Mittel", low: "Gering" },
    howLabel: "So beheben Sie es",
    botsTitle: "Zugang für KI-Crawler",
    botsSubtitle: "Was die robots.txt jedem Crawler für die geprüfte Seite erlaubt.",
    botsHead: { bot: "Crawler", purpose: "Zweck", status: "Zugriff", rule: "Entscheidende Regel" },
    purposes: { search: "KI-Suche / Index", user: "Abruf auf Nutzeranfrage", training: "Modelltraining" },
    allowed: "Erlaubt",
    blocked: "Blockiert",
    source: {
      specific: "eigene Gruppe",
      wildcard: "über User-agent: *",
      none: "keine Regel greift",
      "no-robots": "keine robots.txt",
      unreachable: "robots.txt nicht erreichbar",
    },
    mayIgnore: "Laut Anbieter befolgt dieser nutzerinitiierte Agent die robots.txt unter Umständen nicht.",
    detailsTitle: "Alle Befunde",
    details: {
      http: "HTTP",
      status: "Status",
      finalUrl: "Finale URL",
      redirects: "Weiterleitungen",
      https: "HTTPS",
      httpRedirect: "http:// → https://",
      ttfb: "Zeit bis zum ersten Byte",
      hsts: "HSTS-Header",
      content: "Inhalt",
      words: "Wörter im HTML",
      rendering: "Rendering",
      renderingValue: {
        server: "Serverseitig gerendert",
        thin: "Wenig Text im HTML",
        js: "Benötigt JavaScript",
        unknown: "Nicht analysiert",
      },
      spa: "App-Shell-Signale",
      metadata: "Metadaten",
      title: "Title",
      description: "Meta-Description",
      canonical: "Canonical",
      lang: "Sprache",
      hreflang: "hreflang-Alternativen",
      h1: "H1",
      schema: "Strukturierte Daten",
      jsonLd: "JSON-LD-Blöcke",
      types: "Typen",
      files: "Dateien",
      robots: "robots.txt",
      robotsState: {
        ok: "Gefunden",
        missing: "Nicht vorhanden (alles erlaubt)",
        unreachable: "Nicht erreichbar (Crawler gehen von Sperre aus)",
        skipped: "Nicht geprüft",
      },
      llms: "llms.txt",
      sitemap: "XML-Sitemap",
      urls: "{n} URLs gelistet",
      yes: "Ja",
      no: "Nein",
      none: "Keine",
      notTested: "Nicht getestet",
    },
    readinessNote:
      "Dieser Check misst, ob KI-Suchmaschinen Ihre Website lesen **können**. Er zeigt nicht, was ChatGPT, Perplexity, Gemini oder Claude tatsächlich über Ihre Marke **antworten** — dafür braucht es getrackte Prompts über einen Zeitraum.",
    cta: {
      title: "Tracken Sie, was KI-Suchmaschinen wirklich antworten",
      body: "AutoSEO stellt Ihre Prompts an ChatGPT, Perplexity, Gemini, Claude, Google AI Overviews und weitere Engines und zeigt Sichtbarkeit, Position, Zitierungen und Sentiment im Vergleich zu Ihren Wettbewerbern.",
      primary: "AutoSEO starten",
      secondary: "Kostenlos selbst hosten",
    },
  },
  fixes: {
    unreachable: {
      title: "Die Website konnte nicht abgerufen werden",
      body: "{error} Wenn unser Checker die Seite nicht laden kann, können es KI-Crawler sehr wahrscheinlich auch nicht.",
      how: "Stellen Sie sicher, dass die Domain auflöst, der Server auf Port 443 mit gültigem Zertifikat antwortet und die Startseite HTTP 200 liefert.",
    },
    http_error: {
      title: "Die Seite liefert HTTP {status}",
      body: "Crawler verwenden nur Seiten mit einem 2xx-Status. Fehlerseiten werden weder indexiert noch zitiert.",
      how: "Liefern Sie die Seite mit Status 200 aus. Ist sie umgezogen, leiten Sie dauerhaft (301/308) auf die neue URL weiter.",
    },
    bot_protection: {
      title: "Eine Bot-Abfrage blockiert automatisierte Besucher (HTTP {status})",
      body: "Die Website hat unserem Checker statt der Seite eine CDN-/WAF-Challenge ausgeliefert. KI-Crawler erhalten meist dieselbe Abfrage und können Ihre Inhalte weder lesen noch zitieren. Manche CDNs blockieren KI-Crawler standardmäßig.",
      how: "Erlauben Sie in Ihrem CDN oder Ihrer WAF (z. B. Cloudflare → Security → Bots) verifizierte Such- und KI-Crawler, in denen Sie sichtbar sein möchten, etwa Googlebot, Bingbot, OAI-SearchBot, Claude-SearchBot und PerplexityBot.",
    },
    https_missing: {
      title: "HTTPS funktioniert nicht",
      body: "Die Seite ließ sich nur über unverschlüsseltes HTTP laden (oder das Zertifikat ist ungültig). Such- und KI-Systeme bevorzugen sichere Seiten, viele Clients lehnen ungültige Zertifikate ab.",
      how: "Installieren Sie ein gültiges TLS-Zertifikat (z. B. Let's Encrypt) und liefern Sie jede Seite über https:// aus.",
    },
    http_no_redirect: {
      title: "http:// leitet nicht auf https:// weiter",
      body: "Die unverschlüsselte Variante der Website antwortet ohne Weiterleitung – damit existiert jede Seite doppelt.",
      how: "Leiten Sie alle http://-Anfragen dauerhaft (301) auf die https://-URL weiter.",
    },
    slow_response: {
      title: "Langsame Serverantwort ({ms} ms bis zum ersten Byte)",
      body: "KI-Crawler und Abrufe auf Nutzeranfrage arbeiten mit knappen Zeitbudgets. Langsame Antworten bedeuten weniger gecrawlte Seiten und ein höheres Risiko von Timeouts, wenn jemand einen Assistenten nach Ihrer Seite fragt.",
      how: "Cachen Sie HTML am Edge oder auf dem Server, reduzieren Sie die serverseitige Arbeit pro Anfrage und peilen Sie deutlich unter 800 ms bis zum ersten Byte an.",
    },
    long_redirect_chain: {
      title: "Lange Weiterleitungskette ({hops} Sprünge)",
      body: "Jede Weiterleitung kostet Zeit und Crawl-Budget; lange Ketten werden mitunter abgebrochen.",
      how: "Verlinken und leiten Sie direkt in einem Schritt auf die finale URL weiter.",
    },
    robots_unreachable: {
      title: "robots.txt ist nicht erreichbar (Status {status})",
      body: "Antwortet die robots.txt mit einem Serverfehler (5xx) oder 429 oder gar nicht, müssen Crawler nach RFC 9309 davon ausgehen, dass die gesamte Website gesperrt ist.",
      how: "Liefern Sie /robots.txt mit Status 200 aus (oder 404, wenn Sie keine haben). Prüfen Sie CDN, Firewall und Server-Logs auf Fehler bei dieser URL.",
    },
    robots_blocks_all: {
      title: "robots.txt sperrt alle Crawler",
      body: "Eine Gruppe `User-agent: *` mit `Disallow: /` gilt für jeden Crawler ohne eigene Gruppe – auch für alle KI-Such-Crawler. Ihre Inhalte können nicht für KI-Antworten indexiert werden.",
      how: "Entfernen Sie `Disallow: /` aus der `*`-Gruppe oder ergänzen Sie Gruppen, die die gewünschten Crawler zulassen (z. B. `User-agent: OAI-SearchBot` + `Allow: /`).",
    },
    search_bots_blocked: {
      title: "KI-Such-Crawler sind blockiert: {bots}",
      body: "Diese Crawler bauen die Indizes auf, aus denen KI-Suchprodukte zitieren. Sind sie blockiert, können Ihre Seiten dort nicht als Quelle erscheinen.",
      how: "Entfernen Sie in der robots.txt die Disallow-Regeln, die diese Crawler treffen, oder ergänzen Sie je Crawler eine eigene Gruppe mit `Allow: /`.",
    },
    user_bots_blocked: {
      title: "KI-Abrufe auf Nutzeranfrage sind blockiert: {bots}",
      body: "Diese Agenten laden eine Seite, wenn jemand einen Assistenten danach fragt (z. B. Ihre URL einfügt). Sind sie blockiert, kann der Assistent die Seite für diese Person nicht lesen.",
      how: "Erlauben Sie diese Agenten in der robots.txt, es sei denn, Sie möchten bewusst verhindern, dass Assistenten Ihre Seiten lesen.",
    },
    training_bots_blocked: {
      title: "Crawler für Modelltraining sind blockiert: {bots}",
      body: "Trainings-Crawler zu blockieren ist eine legitime Entscheidung und sperrt keine KI-Such-Crawler. Es kann aber dazu führen, dass künftige Modelle Ihre Marke weniger aus Ihren eigenen Inhalten kennen.",
      how: "Behalten Sie die Sperre, wenn sie gewollt ist. Andernfalls erlauben Sie die Crawler in der robots.txt. Eine Sperre von Google-Extended wirkt sich nicht auf die Google-Suche oder AI Overviews aus.",
    },
    noindex: {
      title: "Die Seite ist auf noindex gesetzt",
      body: "Ein Robots-Meta-Tag oder X-Robots-Tag-Header weist Suchmaschinen an, die Seite nicht zu indexieren. Suchbasierte KI-Antworten (Google AI Overviews, Copilot, ChatGPT-Suche) können sie dann nicht verwenden.",
      how: "Entfernen Sie `noindex` (bzw. `none`) aus dem Robots-Meta-Tag und dem X-Robots-Tag-Header aller Seiten, die gefunden werden sollen.",
    },
    js_only: {
      title: "Der Inhalt benötigt JavaScript ({words} Wörter im HTML)",
      body: "Das HTML, das Crawler erhalten, ist eine nahezu leere App-Shell. Die meisten KI-Crawler führen kein JavaScript aus und sehen daher keinen Inhalt, den sie verstehen oder zitieren könnten.",
      how: "Rendern Sie die Inhalte auf dem Server: Server-Side Rendering oder statische Generierung (z. B. Next.js, Nuxt, Astro, SvelteKit) oder Pre-Rendering für Crawler.",
    },
    thin_content: {
      title: "Sehr wenig Text im HTML ({words} Wörter)",
      body: "KI-Suchmaschinen zitieren und fassen Text zusammen. Steht im initialen HTML kaum lesbarer Text, gibt es wenig zu zitieren.",
      how: "Stellen Sie die zentralen Informationen – Angebot, Zielgruppe, Fakten, Preise, FAQs – als echten Text in das serverseitig gerenderte HTML.",
    },
    no_jsonld: {
      title: "Keine strukturierten Daten (JSON-LD)",
      body: "Strukturierte Daten beschreiben Fakten zu Unternehmen, Produkten und Seiten maschinenlesbar. Sie helfen Such- und KI-Systemen zu erkennen, wer hinter der Website steht.",
      how: "Ergänzen Sie schema.org-JSON-LD: mindestens Organization (Name, Logo, sameAs-Profile) und WebSite; dazu Product, Service, Article oder FAQPage, wo passend.",
    },
    jsonld_invalid: {
      title: "{errors} JSON-LD-Block/Blöcke nicht lesbar",
      body: "Ungültiges JSON wird komplett ignoriert – die strukturierten Daten in diesen Blöcken sind wirkungslos.",
      how: "Prüfen Sie das Markup mit dem Schema.org-Validator (validator.schema.org) oder Googles Test für Rich-Suchergebnisse und korrigieren Sie die JSON-Syntax.",
    },
    no_entity_schema: {
      title: "Strukturierte Daten beschreiben nicht das Unternehmen",
      body: "JSON-LD ist vorhanden ({types}), aber nichts sagt aus, wer hinter der Website steht (Organization, LocalBusiness, Person, WebSite, Product …).",
      how: "Ergänzen Sie einen Organization-Knoten (oder LocalBusiness/Person) mit name, url, logo und sameAs-Links zu Ihren offiziellen Profilen.",
    },
    title_missing: {
      title: "Kein Seitentitel",
      body: "Der Title ist das Erste, woran Such- und KI-Systeme erkennen, worum es auf einer Seite geht.",
      how: "Ergänzen Sie einen eindeutigen, beschreibenden <title> mit etwa 30–60 Zeichen.",
    },
    title_length: {
      title: "Title-Länge unpassend ({length} Zeichen)",
      body: "Sehr kurze Titel sagen wenig aus, sehr lange werden abgeschnitten.",
      how: "Peilen Sie etwa 30–60 Zeichen an, die Thema der Seite und Ihre Marke nennen.",
    },
    description_missing: {
      title: "Keine Meta-Description",
      body: "Die Meta-Description ist eine kurze Zusammenfassung, die Suchmaschinen oft anzeigen und Systeme zum Verständnis der Seite nutzen.",
      how: "Ergänzen Sie eine eindeutige Meta-Description mit etwa 120–160 Zeichen.",
    },
    description_length: {
      title: "Länge der Meta-Description unpassend ({length} Zeichen)",
      body: "Zu kurze Beschreibungen sagen wenig aus, lange werden abgeschnitten.",
      how: "Peilen Sie etwa 120–160 Zeichen an, die die Seite zusammenfassen.",
    },
    canonical_missing: {
      title: "Keine Canonical-URL",
      body: "Ohne Canonical-Tag konkurrieren Duplikate (Parameter, Slash am Ende, http/https) miteinander.",
      how: 'Ergänzen Sie <link rel="canonical" href="…"> mit der bevorzugten absoluten URL der Seite.',
    },
    canonical_other_host: {
      title: "Canonical verweist auf eine andere Website ({canonical})",
      body: "Ein Canonical auf einen anderen Host fordert Suchmaschinen auf, statt dieser Seite die andere zu indexieren.",
      how: "Lassen Sie das Canonical auf die eigene bevorzugte URL der Seite zeigen – es sei denn, der Inhalt ist tatsächlich eine Kopie.",
    },
    lang_missing: {
      title: "Keine Sprache angegeben",
      body: "Das lang-Attribut zeigt Crawlern und Assistenten, in welcher Sprache die Seite verfasst ist – wichtig, um im richtigen Markt zu antworten.",
      how: 'Setzen Sie die Sprache am html-Element, z. B. <html lang="de">.',
    },
    h1_missing: {
      title: "Keine H1-Überschrift",
      body: "Eine klare Hauptüberschrift hilft Systemen, das Thema der Seite zu erkennen und den Inhalt zu gliedern.",
      how: "Ergänzen Sie genau eine aussagekräftige H1 als echten Text (nicht nur in einem Bild).",
    },
    sitemap_missing: {
      title: "Keine XML-Sitemap gefunden",
      body: "Eine Sitemap listet die URLs, die gecrawlt werden sollen, und hilft Crawlern, neue und geänderte Seiten zu finden.",
      how: "Veröffentlichen Sie /sitemap.xml (die meisten CMS erzeugen sie automatisch) und verweisen Sie in der robots.txt darauf: `Sitemap: https://…/sitemap.xml`.",
    },
    llms_missing: {
      title: "Keine llms.txt",
      body: "llms.txt ist eine vorgeschlagene Konvention (llmstxt.org) für eine Markdown-Zusammenfassung Ihrer Website für KI-Assistenten. Große KI-Crawler dokumentieren bisher nicht, dass sie die Datei nutzen – geringe Priorität, aber mit wenig Aufwand umgesetzt und hilfreich für Tools und Agenten, die sie lesen.",
      how: "Veröffentlichen Sie /llms.txt: ein # Titel, eine kurze > Zusammenfassung und Links zu Ihren wichtigsten Seiten mit je einer Zeile Beschreibung.",
    },
    llms_invalid: {
      title: "llms.txt beginnt nicht mit einem # Titel",
      body: "Der llms.txt-Vorschlag sieht eine Markdown-Datei vor, die mit einer H1 (Name der Website oder des Projekts) beginnt.",
      how: "Beginnen Sie die Datei mit `# Ihr Name`, gefolgt von einer kurzen `>`-Zusammenfassung und Abschnitten mit Links.",
    },
  },
};

export const checkCopy: Record<"en" | "de", CheckCopy> = { en, de };

/** Replaces `{name}` placeholders. */
export function fill(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (m, key: string) => (key in params ? String(params[key]) : m));
}
