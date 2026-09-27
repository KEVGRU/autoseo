/**
 * Static copy of the /ai-visibility-check page (hero, explanations, FAQ) in both languages. The interactive tool's
 * copy lives in `copy.ts`.
 */
import type { Faq, Hero, Locale, Section } from "../types";

export type CheckPageContent = {
  path: string;
  crumb: string;
  meta: { title: string; description: string };
  hero: Hero;
  app: { name: string; description: string; features: string[] };
  sections: Section[];
};

const faqEn: Faq[] = [
  {
    q: "What does the free AI visibility check test?",
    a: "Whether AI engines can reach and read your site: what your robots.txt allows 15 AI and search crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended, Googlebot, Bingbot, Applebot-Extended, Meta-ExternalAgent, Amazonbot, CCBot), whether the content is in the HTML without JavaScript, which JSON-LD types and metadata the page has, whether llms.txt and an XML sitemap exist, and HTTP basics such as status, HTTPS, redirects and response time.",
  },
  {
    q: "Does the check show whether ChatGPT or Perplexity mention my brand?",
    a: "No. It measures readiness — whether AI engines can read and cite your pages — not what they answer. To see actual answers you have to run prompts against the engines over time, because answers vary between runs. That is what [AutoSEO's AI visibility tracking](/ai-visibility-tracking) does: it asks ChatGPT, Perplexity, Gemini, Claude, Google AI Overviews and other engines your prompts on a schedule and measures visibility, position, citations and sentiment.",
  },
  {
    q: "How is the score calculated?",
    a: "Five weighted categories: AI crawler access 30%, content readable without JavaScript 25%, structure and metadata 20%, HTTP and performance 15%, discovery files 10%. Within crawler access, AI search crawlers count 65%, user-initiated fetchers 20% and training crawlers 15%. Every issue appears in the fix list with its severity; the list is sorted by impact.",
  },
  {
    q: "Should I allow AI training crawlers like GPTBot or ClaudeBot?",
    a: "That is a business decision, and the check treats it as one: blocked training crawlers only cost a few points and are listed as low priority. Blocking a training crawler does not block the same vendor's search crawler — GPTBot and OAI-SearchBot, or ClaudeBot and Claude-SearchBot, are controlled separately — and blocking Google-Extended does not affect Google Search or AI Overviews.",
  },
  {
    q: "How does the check evaluate robots.txt?",
    a: "Like a crawler following RFC 9309 and Google's documentation: a crawler obeys the groups that name it (case-insensitive) and only falls back to `User-agent: *` when none exists; the longest matching rule wins and allow wins a tie; `*` and `$` wildcards are supported. A robots.txt that answers with a server error counts as \"everything disallowed\", a 404 as \"everything allowed\". The table shows the deciding rule and its line number.",
  },
  {
    q: "Do I need an llms.txt?",
    a: "It helps, but it is not critical. llms.txt is a proposed convention (llmstxt.org) for a Markdown summary of a site for AI assistants. The major AI crawlers don't document using it, so the check gives it only 3 of 100 points. An XML sitemap matters more.",
  },
  {
    q: "Why does the result mention a bot challenge?",
    a: "Your CDN or firewall answered our checker with a challenge page (for example a Cloudflare bot check) instead of your content. Our checker identifies itself honestly as `AutoSEO-Check/1.0`; AI crawlers are usually treated the same way, and some CDNs block AI crawlers by default. Allow the verified crawlers you want to be visible in.",
  },
  {
    q: "Does the check run JavaScript?",
    a: "No, deliberately. It reads the HTML exactly as a crawler receives it. If your content only appears after JavaScript runs, most AI crawlers won't see it — and neither does the check.",
  },
  {
    q: "Can I check a single page instead of the homepage?",
    a: "Yes. Enter the full URL. The page itself is analyzed and robots.txt is evaluated for that path; robots.txt, llms.txt and the sitemap are read from the site's root.",
  },
  {
    q: "What happens with the data?",
    a: "There is no sign-up and no email. The checked domain and the result are not stored in a database: results are kept in memory for 10 minutes so that repeated checks don't hit the site again, and your IP address is used in memory for rate limiting. The check fetches only public URLs and refuses private or internal addresses.",
  },
];

const faqDe: Faq[] = [
  {
    q: "Was prüft der kostenlose KI-Sichtbarkeits-Check?",
    a: "Ob KI-Suchmaschinen Ihre Website erreichen und lesen können: was Ihre robots.txt 15 KI- und Such-Crawlern erlaubt (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended, Googlebot, Bingbot, Applebot-Extended, Meta-ExternalAgent, Amazonbot, CCBot), ob der Inhalt ohne JavaScript im HTML steht, welche JSON-LD-Typen und Metadaten die Seite hat, ob llms.txt und eine XML-Sitemap existieren sowie HTTP-Grundlagen wie Status, HTTPS, Weiterleitungen und Antwortzeit.",
  },
  {
    q: "Zeigt der Check, ob ChatGPT oder Perplexity meine Marke nennen?",
    a: "Nein. Er misst die Voraussetzungen – ob KI-Suchmaschinen Ihre Seiten lesen und zitieren können –, nicht deren Antworten. Um tatsächliche Antworten zu sehen, müssen Prompts über einen Zeitraum an die Engines gestellt werden, denn Antworten schwanken von Lauf zu Lauf. Genau das macht das [KI-Sichtbarkeits-Tracking von AutoSEO](/de/ai-visibility-tracking): Es stellt Ihre Prompts regelmäßig an ChatGPT, Perplexity, Gemini, Claude, Google AI Overviews und weitere Engines und misst Sichtbarkeit, Position, Zitierungen und Sentiment.",
  },
  {
    q: "Wie wird der Score berechnet?",
    a: "Aus fünf gewichteten Kategorien: Zugang für KI-Crawler 30 %, ohne JavaScript lesbarer Inhalt 25 %, Struktur und Metadaten 20 %, HTTP und Performance 15 %, Discovery-Dateien 10 %. Innerhalb des Crawler-Zugangs zählen KI-Such-Crawler 65 %, Abrufe auf Nutzeranfrage 20 % und Trainings-Crawler 15 %. Jedes Problem erscheint mit seiner Priorität in der Maßnahmenliste, sortiert nach Wirkung.",
  },
  {
    q: "Sollte ich KI-Trainings-Crawler wie GPTBot oder ClaudeBot zulassen?",
    a: "Das ist eine geschäftliche Entscheidung, und der Check behandelt sie so: Blockierte Trainings-Crawler kosten nur wenige Punkte und erscheinen mit geringer Priorität. Eine Sperre für einen Trainings-Crawler blockiert nicht den Such-Crawler desselben Anbieters – GPTBot und OAI-SearchBot bzw. ClaudeBot und Claude-SearchBot werden getrennt gesteuert –, und eine Sperre von Google-Extended wirkt sich nicht auf die Google-Suche oder AI Overviews aus.",
  },
  {
    q: "Wie wertet der Check die robots.txt aus?",
    a: "Wie ein Crawler nach RFC 9309 und der Google-Dokumentation: Ein Crawler befolgt die Gruppen, die ihn nennen (ohne Beachtung der Groß- und Kleinschreibung), und fällt nur dann auf `User-agent: *` zurück, wenn es keine gibt; die längste passende Regel gewinnt, bei Gleichstand gewinnt Allow; die Platzhalter `*` und `$` werden unterstützt. Antwortet die robots.txt mit einem Serverfehler, gilt „alles gesperrt“, bei 404 „alles erlaubt“. Die Tabelle zeigt die entscheidende Regel samt Zeilennummer.",
  },
  {
    q: "Brauche ich eine llms.txt?",
    a: "Sie hilft, ist aber nicht entscheidend. llms.txt ist eine vorgeschlagene Konvention (llmstxt.org) für eine Markdown-Zusammenfassung einer Website für KI-Assistenten. Die großen KI-Crawler dokumentieren nicht, dass sie die Datei nutzen, deshalb erhält sie im Check nur 3 von 100 Punkten. Eine XML-Sitemap ist wichtiger.",
  },
  {
    q: "Warum erwähnt das Ergebnis eine Bot-Abfrage?",
    a: "Ihr CDN oder Ihre Firewall hat unserem Checker statt Ihrer Inhalte eine Challenge-Seite geliefert (etwa einen Cloudflare-Bot-Check). Unser Checker gibt sich offen als `AutoSEO-Check/1.0` zu erkennen; KI-Crawler werden in der Regel genauso behandelt, und manche CDNs blockieren KI-Crawler standardmäßig. Erlauben Sie die verifizierten Crawler, in denen Sie sichtbar sein möchten.",
  },
  {
    q: "Führt der Check JavaScript aus?",
    a: "Nein, bewusst nicht. Er liest das HTML genau so, wie ein Crawler es erhält. Erscheinen Ihre Inhalte erst nach dem Ausführen von JavaScript, sehen die meisten KI-Crawler sie nicht – und der Check auch nicht.",
  },
  {
    q: "Kann ich eine einzelne Seite statt der Startseite prüfen?",
    a: "Ja. Geben Sie die vollständige URL ein. Analysiert wird dann diese Seite, und die robots.txt wird für ihren Pfad ausgewertet; robots.txt, llms.txt und Sitemap werden aus dem Stammverzeichnis der Website gelesen.",
  },
  {
    q: "Was passiert mit den Daten?",
    a: "Es gibt keine Anmeldung und keine E-Mail-Abfrage. Die geprüfte Domain und das Ergebnis werden nicht in einer Datenbank gespeichert: Ergebnisse liegen 10 Minuten im Arbeitsspeicher, damit wiederholte Checks die Website nicht erneut abrufen, und Ihre IP-Adresse wird im Arbeitsspeicher zur Begrenzung der Anfragen verwendet. Der Check ruft nur öffentliche URLs ab und verweigert private oder interne Adressen.",
  },
];

const en: CheckPageContent = {
  path: "/ai-visibility-check",
  crumb: "Free AI visibility check",
  meta: {
    title: "Free AI Visibility Check: Can AI Crawlers Read Your Site?",
    description:
      "Free, instant, no sign-up: check which AI crawlers your robots.txt allows, whether your content is readable without JavaScript, your structured data, llms.txt and sitemap — with prioritized fixes.",
  },
  hero: {
    eyebrow: "Free · Instant · No sign-up",
    title: "Can AI engines read your website?",
    subtitle:
      "Enter a domain and see in seconds what your robots.txt allows GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot and 11 other crawlers, whether your content is readable without JavaScript, and what to fix first. No email, no sales call.",
  },
  app: {
    name: "AutoSEO AI Visibility Check",
    description:
      "Free check of a website's readiness for AI search: robots.txt access for 15 AI and search crawlers, server-rendered content, structured data, metadata, llms.txt, XML sitemap, HTTPS and response time, with a 0–100 score and prioritized fixes.",
    features: [
      "robots.txt evaluation for 15 AI and search crawlers (RFC 9309)",
      "Server-rendered text vs. JavaScript-only detection",
      "JSON-LD types, title, meta description, canonical, language and hreflang",
      "llms.txt and XML sitemap detection",
      "HTTP status, HTTPS, redirects and time to first byte",
      "Weighted 0–100 score with prioritized fixes",
    ],
  },
  sections: [
    {
      kind: "cards",
      id: "what-we-check",
      eyebrow: "What the check covers",
      title: "Six things that decide whether AI engines can use your pages",
      columns: 3,
      cards: [
        { icon: "shield", title: "AI crawler access", body: "robots.txt evaluated per crawler with the deciding rule — search, user-initiated and training crawlers separately. Plus noindex and CDN bot challenges." },
        { icon: "file", title: "Content without JavaScript", body: "Words in the HTML a crawler receives, and signals of an empty app shell. Most AI crawlers don't run JavaScript." },
        { icon: "code", title: "Structured data", body: "Which JSON-LD types the page declares, whether they parse, and whether anything says who is behind the site." },
        { icon: "list", title: "Metadata", body: "Title, meta description, canonical, language, hreflang and the H1 — the basics systems use to understand a page." },
        { icon: "search", title: "Discovery files", body: "An XML sitemap (declared in robots.txt or at /sitemap.xml) and an llms.txt at the site root." },
        { icon: "gauge", title: "HTTP basics", body: "Status code, HTTPS, http→https redirect, redirect chain and time to first byte." },
      ],
    },
    {
      kind: "split",
      id: "readiness",
      eyebrow: "Readiness is not visibility",
      title: "The check tells you whether AI can read you — not what it says about you",
      body: "A perfect score means crawlers can reach, read and understand your pages. Whether ChatGPT, Perplexity or Google's AI Overviews then recommend you depends on what they find about you across the web, and it changes from answer to answer. Measuring that takes tracked prompts, every day, across engines and markets.",
      bullets: [
        "One answer = one prompt × one engine × one day, stored with its text and citations",
        "Visibility, mention rate, share of voice, position, citations and sentiment",
        "Competitors and the sources AI engines cite for your topics",
        "Open source: self-host for free or use AutoSEO Cloud",
      ],
      cta: { label: "How AutoSEO measures AI visibility", href: "/ai-agent-instructions#metrics" },
    },
    {
      kind: "steps",
      id: "next-steps",
      eyebrow: "From check to results",
      title: "What to do after the check",
      steps: [
        { title: "Fix access and rendering", body: "Work through the high-impact fixes: crawler access, server-rendered content, noindex, HTTP errors." },
        { title: "Add structure", body: "Organization and page-level JSON-LD, clear titles and descriptions, a sitemap and optionally llms.txt." },
        { title: "Track real answers", body: "Add the prompts your customers ask to [AutoSEO](/pricing) and see how engines answer them over time." },
        { title: "Close the gaps", body: "Use competitor, source and sentiment data to decide which pages and mentions to work on next." },
      ],
    },
    { kind: "faq", id: "faq", title: "Questions about the check", items: faqEn },
    {
      kind: "cta",
      id: "cta",
      title: "Track what AI engines actually answer",
      body: "Open source AI visibility tracking and SEO suite. Self-host for free, or let us run it for $50/month.",
      primary: { label: "Start AutoSEO", href: "/signup" },
      secondary: { label: "Self-host for free", href: "/self-hosting" },
    },
  ],
};

const de: CheckPageContent = {
  path: "/ai-visibility-check",
  crumb: "Kostenloser KI-Sichtbarkeits-Check",
  meta: {
    title: "Kostenloser KI-Sichtbarkeits-Check: Können KI-Crawler Ihre Website lesen?",
    description:
      "Kostenlos, sofort, ohne Anmeldung: Prüfen Sie, welche KI-Crawler Ihre robots.txt zulässt, ob Inhalte ohne JavaScript lesbar sind, strukturierte Daten, llms.txt und Sitemap – mit priorisierten Maßnahmen.",
  },
  hero: {
    eyebrow: "Kostenlos · Sofort · Ohne Anmeldung",
    title: "Können KI-Suchmaschinen Ihre Website lesen?",
    subtitle:
      "Domain eingeben und in Sekunden sehen, was Ihre robots.txt GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot und 11 weiteren Crawlern erlaubt, ob Ihre Inhalte ohne JavaScript lesbar sind und was Sie zuerst beheben sollten. Ohne E-Mail, ohne Verkaufsgespräch.",
  },
  app: {
    name: "AutoSEO KI-Sichtbarkeits-Check",
    description:
      "Kostenlose Prüfung, wie gut eine Website für die KI-Suche vorbereitet ist: robots.txt-Zugang für 15 KI- und Such-Crawler, serverseitig gerenderte Inhalte, strukturierte Daten, Metadaten, llms.txt, XML-Sitemap, HTTPS und Antwortzeit – mit Score von 0 bis 100 und priorisierten Maßnahmen.",
    features: [
      "robots.txt-Auswertung für 15 KI- und Such-Crawler (RFC 9309)",
      "Erkennung von serverseitig gerendertem Text vs. reinem JavaScript",
      "JSON-LD-Typen, Title, Meta-Description, Canonical, Sprache und hreflang",
      "Erkennung von llms.txt und XML-Sitemap",
      "HTTP-Status, HTTPS, Weiterleitungen und Zeit bis zum ersten Byte",
      "Gewichteter Score von 0 bis 100 mit priorisierten Maßnahmen",
    ],
  },
  sections: [
    {
      kind: "cards",
      id: "what-we-check",
      eyebrow: "Was der Check prüft",
      title: "Sechs Faktoren, die entscheiden, ob KI-Suchmaschinen Ihre Seiten nutzen können",
      columns: 3,
      cards: [
        { icon: "shield", title: "Zugang für KI-Crawler", body: "robots.txt je Crawler ausgewertet, inklusive entscheidender Regel – Such-, Nutzer- und Trainings-Crawler getrennt. Dazu noindex und Bot-Abfragen von CDNs." },
        { icon: "file", title: "Inhalt ohne JavaScript", body: "Wörter im HTML, das ein Crawler erhält, und Signale einer leeren App-Shell. Die meisten KI-Crawler führen kein JavaScript aus." },
        { icon: "code", title: "Strukturierte Daten", body: "Welche JSON-LD-Typen die Seite deklariert, ob sie fehlerfrei lesbar sind und ob erkennbar ist, wer hinter der Website steht." },
        { icon: "list", title: "Metadaten", body: "Title, Meta-Description, Canonical, Sprache, hreflang und die H1 – die Grundlagen, mit denen Systeme eine Seite verstehen." },
        { icon: "search", title: "Discovery-Dateien", body: "Eine XML-Sitemap (in der robots.txt deklariert oder unter /sitemap.xml) und eine llms.txt im Stammverzeichnis." },
        { icon: "gauge", title: "HTTP-Grundlagen", body: "Statuscode, HTTPS, Weiterleitung von http auf https, Weiterleitungsketten und Zeit bis zum ersten Byte." },
      ],
    },
    {
      kind: "split",
      id: "readiness",
      eyebrow: "Voraussetzung ist nicht Sichtbarkeit",
      title: "Der Check zeigt, ob KI Sie lesen kann – nicht, was sie über Sie sagt",
      body: "Ein perfekter Score bedeutet, dass Crawler Ihre Seiten erreichen, lesen und verstehen können. Ob ChatGPT, Perplexity oder Googles AI Overviews Sie dann empfehlen, hängt davon ab, was sie im Netz über Sie finden – und ändert sich von Antwort zu Antwort. Das zu messen erfordert getrackte Prompts, täglich, über Engines und Märkte hinweg.",
      bullets: [
        "Eine Antwort = ein Prompt × eine Engine × ein Tag, gespeichert mit Text und Quellen",
        "Sichtbarkeit, Mention Rate, Share of Voice, Position, Zitierungen und Sentiment",
        "Wettbewerber und die Quellen, die KI-Suchmaschinen zu Ihren Themen zitieren",
        "Open Source: kostenlos selbst hosten oder AutoSEO Cloud nutzen",
      ],
      cta: { label: "So misst AutoSEO KI-Sichtbarkeit", href: "/de/ai-agent-instructions#metrics" },
    },
    {
      kind: "steps",
      id: "next-steps",
      eyebrow: "Vom Check zum Ergebnis",
      title: "Was Sie nach dem Check tun sollten",
      steps: [
        { title: "Zugang und Rendering beheben", body: "Arbeiten Sie die Maßnahmen mit hoher Wirkung ab: Crawler-Zugang, serverseitig gerenderte Inhalte, noindex, HTTP-Fehler." },
        { title: "Struktur ergänzen", body: "JSON-LD für Unternehmen und Seiten, klare Titles und Descriptions, eine Sitemap und optional eine llms.txt." },
        { title: "Echte Antworten tracken", body: "Legen Sie die Fragen Ihrer Kundinnen und Kunden als Prompts in [AutoSEO](/de/pricing) an und sehen Sie, wie Engines sie über die Zeit beantworten." },
        { title: "Lücken schließen", body: "Entscheiden Sie anhand von Wettbewerbs-, Quellen- und Sentiment-Daten, an welchen Seiten und Erwähnungen Sie als Nächstes arbeiten." },
      ],
    },
    { kind: "faq", id: "faq", title: "Fragen zum Check", items: faqDe },
    {
      kind: "cta",
      id: "cta",
      title: "Tracken Sie, was KI-Suchmaschinen wirklich antworten",
      body: "Open-Source-KI-Sichtbarkeits-Tracking und SEO-Suite. Kostenlos selbst hosten oder für 50 $ im Monat von uns betreiben lassen.",
      primary: { label: "AutoSEO starten", href: "/signup" },
      secondary: { label: "Kostenlos selbst hosten", href: "/self-hosting" },
    },
  ],
};

export const checkPage: Record<Locale, CheckPageContent> = { en, de };
