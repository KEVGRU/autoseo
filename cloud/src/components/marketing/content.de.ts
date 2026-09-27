/**
 * German marketing copy for /de (Sie-Form). Mirrors `copy` in content.ts — the type keeps both languages in sync.
 * Product terms that German SEO teams use in English (AI Visibility, GEO, Self-Hosting, Prompt, Rank Tracking …)
 * stay English. Guides, legal pages and the app are English-only and linked as such.
 */
import { site } from "@/lib/site";
import type { FeatureRow, Faq, FooterColumn, LinkItem, MarketingCopy, Plan } from "./content";
import { appHost, cloudPlan, engines, featureRows as enFeatureRows, seoSuite as enSeoSuite, actions as enActions, security as enSecurity, developers as enDevelopers } from "./content";

const price = `${site.priceMonthlyUsd}\u00a0$`;
const installCommand = `curl -fsSL https://${site.host}/install | bash`;
const { projects: cloudProjects, includedUsageUsd } = cloudPlan;
const includedUsage = `${includedUsageUsd}\u00a0$`;

const mainNav: LinkItem[] = [
  { label: "Funktionen", href: "/de#features" },
  { label: "Preise", href: "/de/pricing" },
  { label: "Self-Hosting", href: "/self-hosting" },
];

const authLinks = {
  login: { label: "Anmelden", href: "/login" },
  signup: { label: "Jetzt starten", href: "/signup" },
};

const hero = {
  eyebrow: "Open Source · MIT-Lizenz",
  eyebrowCta: "Auf GitHub ansehen",
  titleLead: "Was ChatGPT & Co. über Ihre Marke sagen",
  titleAccent: "– und wie Sie es verbessern",
  subtitle:
    "AutoSEO ist die Open-Source-Plattform für AI Visibility und SEO. Sehen Sie, was ChatGPT, Perplexity, Gemini, Claude und Google AI Overviews über Sie sagen und welchen Quellen sie vertrauen – und schließen Sie die Lücken mit einer kompletten SEO-Suite und einem KI-Agenten, der mit Ihrem eigenen Claude Code oder Codex arbeitet.",
  primaryCta: { label: `Für ${price}/Monat starten`, href: "/signup" },
  secondaryCta: { label: "Kostenlos selbst hosten", href: "/self-hosting" },
  installLabel: "Oder auf dem eigenen Server installieren",
  assurances: ["Ihr Workspace in Minuten", "Monatlich kündbar", "Open Source (MIT)"],
  screenshotAlt:
    "AutoSEO-Dashboard mit AI-Visibility-Score, Mention Rate, Citation Rate und Wettbewerber-Ranking über alle KI-Engines",
  mobileAlt: "AutoSEO-Dashboard für AI Visibility auf dem Smartphone",
  answerCard: {
    label: "Getrackter Prompt",
    prompt: "\u201eWelches Open-Source-Tool misst meine Marke in der KI-Suche?\u201c",
    engines: ["ChatGPT", "Perplexity", "Gemini", "Claude", "AI Overviews"],
    stats: [
      { label: "Erwähnt", value: "Ja" },
      { label: "Zitiert", value: "3 Quellen" },
      { label: "Position", value: "#1" },
    ],
    answerFrom: "Antwort von",
    live: "Live",
  },
};

const engineStrip = {
  title: "Misst die Antwortmaschinen, die Ihre Kunden wirklich nutzen",
  subtitle: "Ihre Prompts laufen automatisch in 16 KI-Engines und 143 Märkten – jede Antwort wird gespeichert.",
};

const problem = {
  eyebrow: "Warum Generative Engine Optimization",
  title: "Suche wird zur Antwort. Die meisten Marken wissen nicht, was dort über sie steht.",
  subtitle:
    "Immer mehr Menschen fragen KI-Assistenten, welches Produkt sie kaufen, welche Agentur sie beauftragen oder welches Tool sie testen sollen. Die Antwort nennt eine Handvoll Marken und zitiert ein paar Seiten – und klassische SEO-Tools sehen davon nichts.",
  points: [
    {
      title: "Die KI stellt die Shortlist zusammen",
      body: "Eine einzige Antwort ersetzt zehn blaue Links. Nennt das Modell Sie nicht, sind Sie nicht im Gespräch – ganz gleich, wie gut Sie ranken.",
    },
    {
      title: "Antworten entstehen aus Quellen",
      body: "KI-Engines stützen sich auf Testberichte, Vergleichslisten, Foren und Dokumentationen. Erwähnen diese Seiten Sie nicht, tut es die Antwort auch nicht.",
    },
    {
      title: "Rank Tracker sehen das nicht",
      body: "Positions-Tracking verrät Ihnen nicht, ob ChatGPT Sie empfiehlt, was es falsch darstellt oder welchen Wettbewerber es bevorzugt.",
    },
  ],
  loopTitle: "So schließt AutoSEO den Kreis",
  loop: [
    { title: "Messen", body: "Tägliche Antworten aus 16 KI-Engines" },
    { title: "Verstehen", body: "Wettbewerber, Sentiment und Quellen" },
    { title: "Verbessern", body: "Aufgaben, Content und technische Fixes" },
    { title: "Berichten", body: "White-Label-Reports für jeden Kunden" },
  ],
};

const overview = {
  eyebrow: "Plattform",
  title: "Eine Open-Source-Plattform für AI Visibility und SEO",
  subtitle: "Alles, was ein modernes Suchteam braucht, in einer App – statt fünf Abos mühsam zu kombinieren.",
  items: [
    {
      icon: "sparkles",
      title: "AI Visibility",
      body: "Prompt-Recherche, automatisches Tracking, Trends, Prompt Flow, Standorte und Query Fan-outs über 16 Engines.",
    },
    {
      icon: "swords",
      title: "Wettbewerber & Sentiment",
      body: "Share of Voice, Erwähnungstiefe, Sentiment, Lob und Kritik sowie direkte Empfehlungsvergleiche.",
    },
    {
      icon: "link",
      title: "Quellen & Zitate",
      body: "Jede URL, die KI-Engines zitieren – nach Content-Typ gruppiert, inklusive Lücken, wo Wettbewerber zitiert werden und Sie nicht.",
    },
    {
      icon: "search",
      title: "Komplette SEO-Suite",
      body: "Keyword-Recherche, Rank Tracking, Domain-Übersicht, Backlinks, Site Audits mit Lighthouse und Local SEO.",
    },
    {
      icon: "chart",
      title: "Analytics & Attribution",
      body: "Traffic aus KI-Plattformen via GA4, Besuche von KI-Crawlern, Search-Console-Insights und Umsatz-Attribution.",
    },
    {
      icon: "wand",
      title: "Optimierungen",
      body: "Belegbare Aufgaben, Content-Briefings und Entwürfe, Crawlability-Checks und Faktenprüfung von KI-Antworten.",
    },
    {
      icon: "presentation",
      title: "White-Label-Reports",
      body: "Report-Builder per Drag-and-drop mit Brand Kits, 11 Vorlagen, PPTX- und PDF-Export sowie Freigabelinks.",
    },
    {
      icon: "bot",
      title: "Agent-Modus & API",
      body: "Chatten Sie mit Ihren Daten über Ihr eigenes Claude Code oder Codex. REST API, MCP-Server und Plugins inklusive.",
    },
  ],
};

/** Screenshots are shared with the English page; only the alt texts differ. */
const enRow = (id: string) => enFeatureRows.find((row) => row.id === id)!;

const featureRows: FeatureRow[] = [
  {
    id: "ai-visibility",
    eyebrow: "AI Visibility Tracking",
    title: "Wissen, wann KI Sie empfiehlt – und wann nicht",
    body: "Hinterlegen Sie die Fragen Ihrer Kunden, wählen Sie Märkte und Engines – AutoSEO führt die Prompts automatisch aus. Jede Antwort wird gespeichert, bewertet und über die Zeit verglichen. So belegen Sie, was wirklich wirkt.",
    bullets: [
      "Visibility, Mention Rate, Citation Rate und durchschnittliche Position je Prompt und Engine",
      "Trends, Aufschlüsselungen, Prompt Flow zwischen Zeiträumen und eine Karte der Ergebnisse nach Standort",
      "Query Fan-outs: die Suchanfragen, die KI-Engines im Hintergrund stellen",
      "Prompt-Recherche nach Thema, Funnel-Stufe und Persona – damit Sie wissen, was Sie tracken sollten",
    ],
    image: { ...enRow("ai-visibility").image, alt: "AutoSEO-Tracker für AI Visibility mit Trenddiagramm und getrackten Prompts je KI-Engine" },
  },
  {
    id: "competitors",
    eyebrow: "Wettbewerber & Sentiment",
    title: "Sehen Sie, wen KI bevorzugt – und warum",
    body: "Vergleichen Sie Ihre Marke mit jedem Wettbewerber, der in KI-Antworten auftaucht. Verstehen Sie die Tonalität jeder Antwort und die Eigenschaften, die KI mit Ihnen verbindet – und mit den anderen.",
    bullets: [
      "Visibility-Ranking mit Erwähnungstiefe, durchschnittlicher Position und Aufschlüsselung je Modell",
      "Sentiment-Score, Lob und Kritik sowie Markenwahrnehmung nach Themen",
      "Head-to-Head: Wer schneidet besser ab, wenn KI Sie mit einem Wettbewerber vergleicht?",
      "Produkte und Anzeigen, die in KI-Antworten erscheinen",
    ],
    image: { ...enRow("competitors").image, alt: "AutoSEO-Wettbewerberranking mit Visibility, Mention Rate und Sentiment in KI-Antworten" },
    secondary: { ...enRow("competitors").secondary!, alt: "AutoSEO-Sentimentübersicht mit dem Anteil von Lob, neutralen Aussagen und Kritik im Zeitverlauf" },
  },
  {
    id: "sources",
    eyebrow: "Quellen & Zitate",
    title: "Finden Sie die Seiten, die KI-Antworten prägen",
    body: "KI-Engines bauen ihre Antworten aus Quellen. AutoSEO zeigt jede zitierte URL, gruppiert sie nach Content-Typ und hebt hervor, wo Wettbewerber zitiert werden und Sie nicht – Ihre Outreach-Liste, sofort einsatzbereit.",
    bullets: [
      "Meistzitierte Quellen im Zeitverlauf mit Anzahl der Zitate und Prompts",
      "Quelltypen wie Vergleichslisten, Testberichte, UGC, Dokumentation und Video",
      "Analyse je Quelle: welche Prompts sie zitieren und welche Marken sie erwähnt",
      "Crawlability-Checks für KI-Bots, robots.txt und llms.txt",
    ],
    image: { ...enRow("sources").image, alt: "AutoSEO-Quellenanalyse mit den meistzitierten URLs, Content-Typen und Anzahl der Zitate" },
  },
  {
    id: "agent",
    eyebrow: "Agent-Modus",
    title: "Ein KI-Analyst für SEO, der mit Ihrem eigenen Abo arbeitet",
    body: "Chatten Sie mit all Ihren AutoSEO-Daten. Der Agent-Modus nutzt Ihr eigenes Claude Code oder Codex CLI über einen schlanken lokalen Agenten – die aufwendige KI-Arbeit läuft also über das Abo, das Sie ohnehin bezahlen. API-Anbieter dienen nur als Fallback.",
    bullets: [
      "Alle AutoSEO-Werkzeuge stehen dem Agenten zur Verfügung: Tracking, Keywords, Audits und Reports",
      "Lokale Agenten verbinden sich ausschließlich ausgehend per HTTPS – keine offenen Ports",
      "Jeder Job läuft in einer frischen, isolierten CLI-Sitzung; Agenten aktualisieren sich bei jedem Deployment selbst",
      "Kein lokaler Agent? Dann nutzt AutoSEO API-Anbieter wie Anthropic, OpenAI und OpenRouter",
    ],
    image: { ...enRow("agent").image, alt: "AutoSEO im Agent-Modus: Chat, der Fragen zu AI-Visibility-Daten beantwortet" },
  },
  {
    id: "reports",
    eyebrow: "White-Label-Reports",
    title: "Kundenfertige Reports in Minuten statt Tagen",
    body: "Gestalten Sie Präsentationen im eigenen Branding mit Live-Daten im Drag-and-drop-Editor – oder starten Sie mit einer von 11 Vorlagen. Präsentieren Sie im Browser, exportieren Sie nach PowerPoint oder PDF oder teilen Sie einen passwortgeschützten Link.",
    bullets: [
      "Brand Kits mit Logo und Farben Ihrer Agentur",
      "Live-Datenfelder und Diagramme, die sich mit dem Berichtszeitraum aktualisieren",
      "PPTX- und PDF-Export, Präsentationsmodus und Freigabelinks",
      "KI-generierte HTML-Reports direkt aus dem Agent-Modus",
    ],
    image: { ...enRow("reports").image, alt: "AutoSEO-Report-Builder mit einer gebrandeten Folie zu AI-Visibility-Kennzahlen" },
  },
];

const seoSuite = {
  ...enSeoSuite,
  eyebrow: "Komplette SEO-Suite",
  title: "Alle klassischen SEO-Tools – direkt neben Ihren KI-Daten",
  body: "AI Visibility baut auf solidem SEO auf. AutoSEO enthält die Recherche- und Monitoring-Tools, für die Sie sonst separat bezahlen – auf Basis von DataForSEO und Ihren eigenen Google-Konten.",
  bullets: [
    "Keyword-Recherche, gespeicherte Keyword-Listen und Rank Tracking nach Standort",
    "Domain-Übersicht und Backlink-Analyse",
    "Site Audit mit Problemen, Seiten, Lighthouse-Scores und Crawl-Vergleichen",
    "Local SEO, Search Console und GA4 – plus Export als CSV und nach Google Sheets",
  ],
  images: [
    { ...enSeoSuite.images[0], alt: "AutoSEO-Keyword-Recherche mit Suchvolumen, Schwierigkeit und Suchintention" },
    { ...enSeoSuite.images[1], alt: "AutoSEO-Rank-Tracking mit Keyword-Positionen im Zeitverlauf" },
    { ...enSeoSuite.images[2], alt: "AutoSEO-Site-Audit mit Health Score, Problemen und Lighthouse-Ergebnissen" },
  ],
};

const actions = {
  eyebrow: "Von der Erkenntnis zur Umsetzung",
  title: "Machen Sie aus KI-Antworten konkrete Aufgaben",
  image: { ...enActions.image, alt: "AutoSEO-Aufgabenliste mit priorisierten, belegbaren Maßnahmen für AI Visibility und SEO" },
  secondary: {
    ...enActions.secondary,
    alt: "AutoSEO-Bot-Traffic-Analyse mit täglichen Besuchen von KI-Crawlern wie GPTBot und ClaudeBot",
  },
  items: [
    {
      icon: "list",
      title: "Priorisierte Aufgaben",
      body: "Erkenntnisse aus Visibility, Zitaten, Wettbewerbern und Crawl-Daten werden zu belegbaren Aufgaben, die Sie an Jira, Linear und weitere Tools übergeben.",
    },
    {
      icon: "file",
      title: "Content-Briefings & Entwürfe",
      body: "Datenbasierte Briefings und Entwürfe, geschrieben für KI-Zitate – bereit zur Veröffentlichung in WordPress, Webflow und anderen CMS.",
    },
    {
      icon: "shield",
      title: "Faktencheck",
      body: "Prüfen Sie, was KI-Engines über Ihre Produkte behaupten, gegen Ihre eigenen Referenzdokumente und verfolgen Sie Abweichungen.",
    },
    {
      icon: "bot",
      title: "Bot- & Traffic-Analytics",
      body: "Sehen Sie, welche KI-Crawler Ihre Seiten besuchen, wie viele Besucher KI-Plattformen schicken und was daraus wird.",
    },
  ],
};

const developers = {
  eyebrow: "API, MCP & Plugins",
  title: "Verbinden Sie AutoSEO mit jedem Agenten und Workflow",
  body: "Alles in der App ist auch programmatisch verfügbar. Verbinden Sie Claude Code, Codex oder Cursor mit AutoSEO und lassen Sie Ihre Agenten mit echten SEO- und AI-Visibility-Daten arbeiten.",
  bullets: [
    "REST API v1 mit OpenAPI-Spezifikation",
    "MCP-Server mit über 100 Tools – OAuth 2.1 oder API-Keys",
    "API-Keys mit Scopes: read, write, spend und export",
    "17 Agent Skills und Plugins für Claude Code, Codex und Cursor",
  ],
  snippets: [
    {
      title: "Claude Code",
      code: enDevelopers.snippets[0].code
        .replace("# Plugin: MCP server + 17 skills", "# Plugin: MCP-Server + 17 Skills")
        .replace("# Or only the MCP server", "# Oder nur den MCP-Server"),
    },
    enDevelopers.snippets[1],
  ],
};

const security = {
  ...enSecurity,
  eyebrow: "Admin & Sicherheit",
  title: "Gebaut für Teams, Agenturen und Security-Reviews",
  body: "Laden Sie Ihr Team und Ihre Kunden ein, legen Sie genau fest, wer welches Projekt sieht, und behalten Sie einen vollständigen Audit-Trail. Beim Self-Hosting konfigurieren Sie E-Mail, KI-Anbieter, Branding und Limits im Admin-Bereich – in AutoSEO Cloud übernehmen wir das für Sie.",
  bullets: [
    "Passwortlose Anmeldung per Magic Link mit Einmalcodes und Freigabeliste für E-Mail-Domains",
    "Rollen Owner, Admin, Member und Client, eigene Rollen und Zugriff pro Projekt",
    "Audit-Log, DSGVO-Export und -Löschung, tägliche und monatliche Ausgabenlimits",
    "Secrets mit AES-256-GCM verschlüsselt; API-Keys und Tokens nur als Hash gespeichert",
  ],
  image: { ...enSecurity.image, alt: "AutoSEO-Admin-Bereich mit Nutzern, Rollen und Berechtigungen" },
  mobileNote: "Vollständig für Mobilgeräte optimiert, im hellen und im dunklen Modus.",
};

const steps = {
  eyebrow: "AutoSEO Cloud",
  title: "Ihr AutoSEO-Workspace – in wenigen Minuten startklar",
  subtitle: "Dieselbe Open-Source-App, vollständig von uns in Deutschland betrieben. Keine Server, keine Updates, keine API-Keys einzurichten.",
  items: [
    {
      title: "Mit E-Mail registrieren",
      body: "Kein Passwort nötig. Wir senden Ihnen einen Magic Link – ein Klick, und Sie sind in Ihrem Dashboard.",
    },
    {
      title: "Workspace benennen und Abo abschließen",
      body: `Geben Sie Ihrem Workspace einen Namen und schließen Sie das Abo für ${price}/Monat ab. Die Zahlung läuft sicher über Stripe.`,
    },
    {
      title: "AutoSEO mit einem Klick öffnen",
      body: `Ihr Workspace steht sofort unter ${appHost} bereit – KI-Anbieter, SEO-Daten und E-Mail-Versand sind bereits eingerichtet. Laden Sie Ihr Team ein und legen Sie Ihr erstes Projekt an.`,
    },
  ],
  cta: { label: `Für ${price}/Monat starten`, href: "/signup" },
  stepLabel: "Schritt",
  mocks: {
    email: "sie@firma.de",
    sendLink: "Magic Link senden",
    workspaceLabel: "Workspace",
    workspaceName: "Acme Marketing",
    plan: `${price}/Monat`,
    running: "Workspace bereit",
    open: "AutoSEO öffnen",
  },
};

const openSource = {
  eyebrow: "Open Source",
  title: "MIT-lizenziert. Für immer Ihres.",
  body: "Jede Funktion von AutoSEO steckt im öffentlichen Repository. Betreiben Sie es kostenlos auf Ihrem eigenen Server, prüfen Sie den Code vor Ihrem Security-Review oder schicken Sie einen Pull Request. AutoSEO Cloud nutzt exakt dasselbe Image.",
  bullets: [
    "Self-Hosting per Einzeiler, Docker Compose oder Coolify",
    "Volle Kontrolle gewünscht? Betreiben Sie die identische App auf Ihrem eigenen Server",
    "Eigene KI-Keys oder lokale Claude-Code- und Codex-Agenten",
    "Beim Self-Hosting bleiben Ihre Daten in Ihrer eigenen PostgreSQL-Datenbank",
  ],
  primaryCta: { label: "Auf GitHub ansehen", href: site.github },
  secondaryCta: { label: "Zur Self-Hosting-Anleitung", href: "/self-hosting" },
};

const plans: Plan[] = [
  {
    id: "self-hosted",
    name: "Self-Hosted",
    price: `0\u00a0$`,
    period: "dauerhaft kostenlos",
    description: "Für Teams, die AutoSEO auf eigener Infrastruktur betreiben möchten.",
    features: [
      "Alle Funktionen, keine Limits",
      "MIT-Lizenz – nutzen Sie es, wie Sie möchten",
      "Läuft auf Ihrem eigenen Server – volle Kontrolle über Ihre Daten",
      "Eigene KI-Keys, lokale Agenten und eigener DataForSEO-Account",
      "Installation per Einzeiler, Docker Compose oder Coolify",
      "Community-Support über GitHub",
    ],
    cta: { label: "Auf eigenem Server installieren", href: "/self-hosting" },
  },
  {
    id: "cloud",
    name: "Cloud",
    price,
    period: "pro Workspace / Monat",
    description: "Ihr eigener Workspace in unserem voll verwalteten AutoSEO, gehostet in Deutschland.",
    features: [
      "Alle Funktionen inklusive",
      "Unbegrenzt Nutzer in Ihrem Workspace",
      `Bis zu ${cloudProjects} Projekte`,
      `KI- & SEO-Datennutzung im Wert von ${includedUsage}/Monat inklusive (Fair Use)`,
      "Unbegrenzt KI über Ihr eigenes Claude-Code- bzw. Codex-Abo per lokalem Agenten",
      "KI-Anbieter, DataForSEO und E-Mail von uns verwaltet – keine API-Keys nötig",
      "Automatische Updates",
      "Anmeldung per Klick aus Ihrem Dashboard",
      "Support per E-Mail",
    ],
    cta: { label: `Für ${price}/Monat starten`, href: "/signup" },
    highlight: true,
    badge: "Voll verwaltet",
    note: "Monatliche Abrechnung · jederzeit kündbar",
  },
];

const pricingNotes = [
  `AutoSEO Cloud enthält KI- und Datenanbieter-Nutzung im Wert von ${includedUsage} pro Workspace und Monat (Fair Use). KI-Funktionen laufen zusätzlich ohne Limit über Ihr eigenes Claude-Code- bzw. Codex-Abo per lokalem Agenten.`,
  "Alle Preise zzgl. gesetzlicher MwSt., sofern anfallend. AutoSEO Cloud richtet sich ausschließlich an Geschäftskunden.",
];

const comparison = {
  eyebrow: "Vergleich",
  title: "AutoSEO vs. geschlossene AI-Visibility-Tools",
  subtitle: "Wie eine Open-Source-Plattform im Vergleich zu typischer Closed-Source-SaaS dieser Kategorie abschneidet.",
  columns: ["AutoSEO", "Typische Closed-Source-SaaS"],
  rows: [
    { label: "Quellcode", ours: "Open Source (MIT)", theirs: "Proprietär" },
    { label: "Betrieb", ours: "Ihr eigener Server oder unsere verwaltete Cloud in Deutschland", theirs: "Nur die Cloud des Anbieters" },
    { label: "Volle Datenkontrolle", ours: "Self-Hosting: alle Daten auf Ihrem Server", theirs: "Immer auf der Plattform des Anbieters" },
    { label: "KI-Kosten", ours: "Ihr Claude-Code-/Codex-Abo, eigene Keys oder inkludierte Cloud-Nutzung", theirs: "In Credits oder Tariflimits gebündelt" },
    { label: "Nutzer & Projekte", ours: `Unbegrenzt Nutzer; ${cloudProjects} Projekte in der Cloud, unbegrenzt beim Self-Hosting`, theirs: "Meist durch den Tarif begrenzt" },
    { label: "Klassische SEO-Suite", ours: "Inklusive", theirs: "Oft ein separates Tool" },
    { label: "API & MCP-Server", ours: "Inklusive", theirs: "Je nach Tarif" },
    { label: "Preis", ours: `Self-Hosting kostenlos · ${price}/Monat verwaltet`, theirs: "Meist gestaffelt nach Prompts oder Nutzern" },
  ],
  labels: { feature: "Merkmal", ours: "AutoSEO:", theirs: "Closed-Source-SaaS:" },
};

const homeFaq: Faq[] = [
  {
    q: "Was ist AutoSEO?",
    a: "AutoSEO ist eine Open-Source-Plattform für AI Visibility (GEO) und SEO. Sie misst, wie KI-Antwortmaschinen wie ChatGPT, Perplexity, Gemini, Claude und Google AI Overviews über Ihre Marke sprechen, und kombiniert das mit Keyword-Recherche, Rank Tracking, Backlinks, Site Audits, Analytics, Content-Tools und White-Label-Reports in einer einzigen App.",
  },
  {
    q: "Was ist Generative Engine Optimization (GEO)?",
    a: "GEO bedeutet, gezielt zu verbessern, wie oft und wie positiv KI-Assistenten Ihre Marke in ihren Antworten erwähnen und zitieren. GEO baut auf SEO auf: Die Seiten, die KI-Engines zitieren, müssen weiterhin crawlbar, relevant und vertrauenswürdig sein. AutoSEO misst Ihre AI Visibility und zeigt, an welchen Quellen, Themen und Wettbewerbern Sie ansetzen sollten.",
  },
  {
    q: "Welche KI-Engines trackt AutoSEO?",
    a: "ChatGPT (Suche und App), Perplexity, Google AI Overviews, Google AI Mode, Gemini, Claude, Microsoft Copilot, Grok, Mistral, DeepSeek, Meta AI, Qwen, Kimi, Sabiá und Solar. Engines, Märkte und Tracking-Frequenz legen Sie pro Projekt fest.",
  },
  {
    q: "Ist AutoSEO wirklich kostenlos?",
    a: "Ja. Die komplette Anwendung ist Open Source unter der MIT-Lizenz und lässt sich mit allen Funktionen kostenlos selbst hosten. Sie zahlen nur für Ihren Server und die Drittanbieter-APIs, die Sie nutzen möchten. AutoSEO Cloud ist für Teams gedacht, die den Betrieb uns überlassen wollen.",
  },
  {
    q: "Was ist der Unterschied zwischen Self-Hosting und AutoSEO Cloud?",
    a: `Die Software ist identisch. Beim Self-Hosting betreiben Sie Ihre eigene Instanz und behalten die volle Kontrolle über Server und Daten. Mit AutoSEO Cloud erhalten Sie einen eigenen Workspace in unserer voll verwalteten Instanz unter ${appHost}, gehostet in Deutschland: KI-Anbieter, SEO-Daten und E-Mail-Versand werden von uns verwaltet, Updates laufen automatisch, und Nutzung im Wert von ${includedUsage} pro Monat ist inklusive – für ${price} pro Monat.`,
  },
  {
    q: "Brauche ich API-Keys für die KI-Engines?",
    a: `Nicht mit AutoSEO Cloud: KI-Anbieter und DataForSEO werden von uns verwaltet, und Nutzung im Wert von ${includedUsage} pro Monat ist inklusive. Zusätzlich können Sie Ihr eigenes Claude-Code- oder Codex-Abo über einen schlanken lokalen Agenten verbinden und KI-Funktionen ohne Limit nutzen. Beim Self-Hosting nutzen Sie den lokalen Agenten oder hinterlegen API-Keys von Anthropic, OpenAI, OpenRouter, Perplexity, Gemini, xAI, Mistral, DeepSeek, Meta, Alibaba Cloud (Qwen), Moonshot AI (Kimi), Maritaca AI (Sabiá) oder Upstage (Solar); Google AI Overviews, AI Mode und Copilot werden über DataForSEO getrackt. Ohne DataForSEO lassen sich diese Engines optional per KI-Modell mit Websuche simulieren, und SEO-Daten basieren dann auf KI-Schätzungen – beides klar gekennzeichnet.`,
  },
  {
    q: "Gibt es Kosten über das Abo hinaus?",
    a: `Nicht bei AutoSEO Cloud. Das Abo enthält KI- und Datenanbieter-Nutzung im Wert von ${includedUsage} pro Monat (Fair Use). Ist sie aufgebraucht, sind kostenpflichtige Funktionen bis zum nächsten Monat eingeschränkt – KI-Funktionen laufen über Ihr eigenes Claude-Code- oder Codex-Abo per lokalem Agenten weiter. Beim Self-Hosting rechnen Anbieter wie DataForSEO oder Ihr KI-Anbieter direkt mit Ihnen ab, und AutoSEO lässt Sie tägliche und monatliche Ausgabenlimits festlegen.`,
  },
  {
    q: "Kann ich von AutoSEO Cloud zum Self-Hosting wechseln?",
    a: "Ja. AutoSEO Cloud nutzt dieselbe Open-Source-App, die Sie auch selbst hosten können – Sie können also jederzeit eine eigene Instanz aufsetzen. Da Cloud-Workspaces in einer gemeinsamen Datenbank liegen, gibt es keine Migration per Klick: Exportieren Sie Ihre Reports und Tabellen (CSV, Google Sheets, PPTX oder PDF) und legen Sie Projekte und Prompts auf Ihrem eigenen Server an.",
  },
  {
    q: "Eignet sich AutoSEO für Agenturen?",
    a: `Ja. Organisieren Sie Kunden in Projekten, geben Sie Kunden mit der Client-Rolle eingeschränkten Zugriff und versenden Sie White-Label-Reports mit Ihrem eigenen Brand Kit. Es gibt keine Gebühren pro Nutzer. AutoSEO Cloud enthält bis zu ${cloudProjects} Projekte pro Workspace; beim Self-Hosting gibt es kein Projektlimit.`,
  },
  {
    q: "Wo werden meine Daten gespeichert?",
    a: "AutoSEO Cloud läuft auf Servern in Deutschland. Jeder Kunde erhält einen eigenen Workspace, dessen Daten innerhalb einer gemeinsamen Datenbank logisch von anderen Workspaces getrennt sind. Beim Self-Hosting bleiben Ihre Daten auf Ihrem Server – abgesehen von Anfragen an die Drittanbieter, die Sie selbst konfigurieren.",
  },
  {
    q: "Funktioniert AutoSEO für den deutschsprachigen Markt?",
    a: "Ja. Sie tracken Prompts auf Deutsch für Deutschland, Österreich und die Schweiz – oder für jeden anderen der 143 Märkte. Die Oberfläche ist auf Englisch; E-Mails, den Onboarding-Assistenten und Ihre Reports kann jede Person in ihren Einstellungen auf Deutsch umstellen.",
  },
  {
    q: "Gibt es einen Auftragsverarbeitungsvertrag (AVV)?",
    a: `Ja. Für personenbezogene Daten in Ihrem Cloud-Workspace handeln wir als Auftragsverarbeiter nach Art. 28 DSGVO. Den AVV erhalten Sie auf Anfrage per E-Mail an ${site.legal.email}. Beim Self-Hosting verlassen Ihre Daten Ihre eigene Infrastruktur gar nicht erst.`,
  },
];

const pricingFaq: Faq[] = [
  {
    q: "Wie funktioniert die Abrechnung?",
    a: `AutoSEO Cloud kostet ${price} pro Workspace und Monat und wird monatlich abgerechnet. Zahlungen wickeln wir sicher über Stripe ab, und Sie erhalten für jede Zahlung eine Rechnung.`,
  },
  {
    q: "Ist die Mehrwertsteuer enthalten?",
    a: "Nein, alle Preise verstehen sich zzgl. MwSt. Sofern Umsatzsteuer anfällt, weisen wir sie auf Basis Ihrer Rechnungsdaten aus. AutoSEO Cloud richtet sich ausschließlich an Geschäftskunden.",
  },
  {
    q: "Kann ich jederzeit kündigen?",
    a: "Ja. Sie kündigen jederzeit in Ihrem Dashboard. Ihr Workspace bleibt bis zum Ende des aktuellen Abrechnungszeitraums verfügbar, danach wird nichts mehr berechnet.",
  },
  {
    q: "Was passiert nach der Kündigung mit meinen Daten?",
    a: "Endet Ihr Abo, wird Ihr Workspace pausiert: Er lässt sich nicht mehr öffnen, und geplantes Tracking stoppt. Wir bewahren Ihre Daten 30 Tage lang auf, damit Sie das Abo reaktivieren und nahtlos weitermachen können. Danach werden Workspace und Daten endgültig gelöscht.",
  },
  {
    q: "Kann ich meine Daten exportieren?",
    a: "Ja. In der App exportieren Sie Tabellen als CSV oder nach Google Sheets, laden Reports als PPTX oder PDF herunter und können einen DSGVO-Export Ihrer personenbezogenen Daten anfordern. Da Cloud-Workspaces eine gemeinsame, verwaltete Datenbank nutzen, bieten wir keine vollständigen Datenbank-Exporte an – wer die volle Kontrolle über seine Daten möchte, hostet die identische Open-Source-App selbst.",
  },
  {
    q: "Sind KI- und SEO-Datenkosten enthalten?",
    a: `Ja, bis zu ${includedUsage} pro Workspace und Monat (Fair Use). KI-Anbieter und DataForSEO werden von uns verwaltet, Sie brauchen also keine eigenen Accounts oder API-Keys (eigene Keys und ein eigener DataForSEO-Account sind beim Self-Hosting möglich). KI-Funktionen laufen zusätzlich ohne Limit über Ihr eigenes Claude-Code- bzw. Codex-Abo per lokalem Agenten.`,
  },
  {
    q: "Wie viele Nutzer und Projekte sind enthalten?",
    a: `Unbegrenzt viele Nutzer – laden Sie Ihr ganzes Team und Ihre Kunden in Ihren Workspace ein – und bis zu ${cloudProjects} Projekte (Websites oder Marken). Mehr Projekte oder eine eigene Instanz? Beim Self-Hosting gibt es keine Limits.`,
  },
  {
    q: "Ist die Self-Hosted-Version eingeschränkt?",
    a: "Nein. Self-Hosted AutoSEO enthält alle Funktionen ohne Limits bei Nutzern, Projekten oder Prompts; Sie nutzen eigene KI-Keys oder lokale Agenten und Ihren eigenen DataForSEO-Account. Cloud-Kunden bezahlen für Hosting, Betrieb, inkludierte Nutzung und Support – nicht für Funktionen.",
  },
  {
    q: "Gibt es einen Auftragsverarbeitungsvertrag (AVV)?",
    a: `Ja. Für Daten in Ihrem Cloud-Workspace handeln wir als Auftragsverarbeiter nach Art. 28 DSGVO. Den AVV erhalten Sie auf Anfrage per E-Mail an ${site.legal.email}.`,
  },
];

const finalCta = {
  title: "Finden Sie heraus, was KI über Ihre Marke sagt",
  subtitle: `Holen Sie sich Ihren eigenen AutoSEO-Cloud-Workspace für ${price}/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.`,
  primary: { label: `Für ${price}/Monat starten`, href: "/signup" },
  secondary: { label: "Kostenlos selbst hosten", href: "/self-hosting" },
};

const footerColumns: FooterColumn[] = [
  {
    title: "Produkt",
    links: [
      { label: "Funktionen", href: "/de#features" },
      { label: "Preise", href: "/de/pricing" },
      { label: "Jetzt starten", href: "/signup" },
      { label: "Anmelden", href: "/login" },
    ],
  },
  {
    title: "Open Source",
    links: [
      { label: "GitHub", href: site.github, external: true },
      { label: "Self-Hosting-Anleitung", href: "/self-hosting" },
      { label: "Problem melden", href: `${site.github}/issues`, external: true },
      { label: "llms.txt", href: "/llms.txt" },
    ],
  },
  {
    title: "Rechtliches",
    links: [
      { label: "Impressum", href: "/imprint" },
      { label: "Datenschutz", href: "/privacy" },
      { label: "Nutzungsbedingungen", href: "/terms" },
    ],
  },
];

const footer = {
  tagline: "Die Open-Source-Plattform für AI Visibility und SEO. Messen, verstehen und verbessern Sie, wie KI-Suchen über Ihre Marke sprechen.",
  columns: footerColumns,
  copyright: `${site.name} ist Open Source unter der MIT-Lizenz.`,
  madeBy: `Entwickelt von ${site.company} in Deutschland`,
  note: "Die Self-Hosting-Anleitung ist auf Englisch verfügbar.",
};

const ui = {
  homeHref: "/de",
  homeLabel: "Startseite",
  skipToContent: "Zum Inhalt springen",
  mainNavLabel: "Hauptnavigation",
  mobileNavLabel: "Mobile Navigation",
  menu: "Menü",
  openMenu: "Menü öffnen",
  closeMenu: "Menü schließen",
  language: "Sprache",
  toggleTheme: "Dunkelmodus umschalten",
  github: "GitHub",
  starOnGitHub: "Auf GitHub ansehen",
  copy: "In die Zwischenablage kopieren",
  copied: "Kopiert",
  copiedAnnouncement: "In die Zwischenablage kopiert",
  copyItem: "{name} kopieren",
  copyInstall: "Installationsbefehl kopieren",
  engineBy: "von",
};

const sectionLabels = {
  featureDetails: "Funktionen im Detail",
  moreFeatures: "Weitere Funktionen",
  security: "Administration und Sicherheit",
  plans: "Tarife",
};

const pricingTeaser = {
  eyebrow: "Preise",
  title: "Einfache Preise. Keine Gebühren pro Nutzer.",
  subtitle: "Alle Funktionen in beiden Varianten. Sie bezahlen für Hosting und Support – nie für Funktionen.",
  link: { label: "Preisdetails und FAQ zur Abrechnung", href: "/de/pricing" },
};

const faqSection = {
  eyebrow: "FAQ",
  title: "Häufige Fragen",
  contactBefore: "Noch etwas offen?",
  emailUs: "Schreiben Sie uns",
  contactMiddle: "oder starten Sie eine Diskussion auf",
  contactAfter: ".",
};

const pricingPage = {
  crumb: "Preise",
  eyebrow: "Preise",
  title: "Einfache, faire Preise",
  subtitle: `Alle Funktionen in beiden Varianten. Hosten Sie die Open-Source-Edition kostenlos selbst – oder nutzen Sie Ihren eigenen Workspace in unserer voll verwalteten Cloud für ${price} im Monat.`,
  included: {
    eyebrow: "In beiden Varianten enthalten",
    title: "Die komplette Plattform, ohne Feature-Grenzen",
    subtitle: "Self-Hosted und Cloud nutzen exakt dieselbe Open-Source-Anwendung.",
  },
  faq: { eyebrow: "FAQ zur Abrechnung", title: "Fragen zur Abrechnung" },
};

const meta = {
  home: {
    title: "AutoSEO – Open-Source-Plattform für AI SEO & GEO",
    description:
      "Sehen Sie, wie ChatGPT, Perplexity, Gemini, Claude und Google AI Overviews Ihre Marke erwähnen. Open-Source-Plattform für GEO & SEO – kostenlos oder 50 $/Monat.",
  },
  pricing: {
    title: "Preise: kostenlos selbst hosten oder 50 $/Monat",
    description:
      "AutoSEO-Preise: Hosten Sie die Open-Source-Plattform für AI SEO & GEO kostenlos selbst oder nutzen Sie einen verwalteten Cloud-Workspace für 50 $ pro Monat.",
  },
  ogAlt: "AutoSEO – sehen Sie, was KI-Suchen über Ihre Marke sagen. Open Source, kostenlos selbst hosten, Cloud für 50 $/Monat.",
  ogTitle: "Was ChatGPT & Co. über Ihre Marke sagen – und wie Sie es verbessern",
  ogChips: ["Open Source", "Self-Hosting kostenlos", `Cloud ${price}/Monat`],
  pricingOgAlt: "AutoSEO-Preise – kostenlos selbst hosten oder 50 $/Monat für einen voll verwalteten Cloud-Workspace.",
  pricingOgEyebrow: "Preise",
  pricingOgTitle: "Kostenlos selbst hosten. Voll verwaltet für 50 $ im Monat.",
};

const schema = {
  softwareDescription:
    "AutoSEO ist die Open-Source-Plattform für AI Visibility und SEO. Verfolgen Sie, wie ChatGPT, Perplexity, Gemini, Claude und Google AI Overviews Ihre Marke erwähnen, recherchieren Sie Keywords, tracken Sie Rankings, prüfen Sie Ihre Website und automatisieren Sie Content – kostenlos selbst hosten oder als voll verwaltete AutoSEO Cloud für 50 $/Monat.",
  selfHostedOffer: {
    name: "Self-Hosted",
    description: "Open-Source-Edition unter MIT-Lizenz mit allen Funktionen, betrieben auf Ihrem eigenen Server.",
  },
  cloudOffer: {
    name: "AutoSEO Cloud",
    description: `Ihr eigener Workspace in der voll verwalteten AutoSEO Cloud, gehostet in Deutschland: alle Funktionen, unbegrenzt Nutzer, bis zu ${cloudProjects} Projekte und Nutzung im Wert von ${includedUsage} pro Monat inklusive. Monatliche Abrechnung.`,
  },
  pricingName: "Preise",
};

export const copy: MarketingCopy = {
  price,
  installCommand,
  appHost,
  mainNav,
  authLinks,
  engines,
  hero,
  engineStrip,
  problem,
  overview,
  featureRows,
  seoSuite,
  actions,
  developers,
  security,
  steps,
  openSource,
  plans,
  pricingNotes,
  comparison,
  homeFaq,
  pricingFaq,
  finalCta,
  footer,
  ui,
  sectionLabels,
  pricingTeaser,
  faqSection,
  pricingPage,
  meta,
  schema,
};
