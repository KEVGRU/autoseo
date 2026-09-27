import type { SitePage } from "@/components/site/types";
import { site } from "@/lib/site";

const walkthrough = `mailto:${site.contactEmail}?subject=Live-Walkthrough`;

const page: SitePage = {
  path: "/webinars",
  crumb: "Webinare",
  meta: {
    title: "AutoSEO Webinare und Lernpfade on demand",
    description:
      "Derzeit sind keine Live-Webinare geplant. Lernen Sie KI-Sichtbarkeit und AutoSEO mit kuratierten Lernpfaden oder fordern Sie einen Team-Walkthrough an.",
  },
  hero: {
    eyebrow: "Webinare",
    title: "KI-Sichtbarkeit lernen, wann es Ihnen passt",
    subtitle:
      "Aktuell sind keine Webinare geplant. Statt einer Warteliste finden Sie hier kuratierte Lernpfade durch unsere Leitfäden und Playbooks – und auf Anfrage einen Live-Walkthrough für Ihr Team.",
    ctas: [
      { label: "Lernpfad starten", href: "#path-basics" },
      { label: "Walkthrough anfragen", href: walkthrough },
    ],
  },
  sections: [
    {
      kind: "prose",
      id: "schedule",
      eyebrow: "Termine",
      title: "Kommende Webinare",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Derzeit nichts geplant",
          text: "Wir kündigen nur Sessions an, die tatsächlich geplant sind. Sobald ein Termin feststeht, finden Sie ihn hier mit Datum, Zeitzone, Agenda und Referenten.",
        },
        {
          type: "p",
          text: "Die Lernpfade unten decken ab, was ein erstes Webinar behandeln würde: was KI-Sichtbarkeit ist und wie man sie misst, die technischen Grundlagen, Workflows für Agenturen und die Verbindung von KI-Suche und Umsatz sowie die Arbeit mit AutoSEO aus KI-Assistenten heraus. Jeder Pfad führt Sie vom Konzept bis zu einem praktischen Playbook. Hintergründe finden Sie im [AutoSEO-Blog](/de/blog).",
        },
      ],
    },
    {
      kind: "links",
      id: "path-basics",
      eyebrow: "Lernpfad 1 · Grundlagen",
      title: "KI-Sichtbarkeit verstehen und messen",
      subtitle: "Für Marketer und SEOs, die neu im Thema GEO sind.",
      links: [
        { label: "AI Visibility Tracking", href: "/de/ai-visibility-tracking", description: "Was gemessen wird: Sichtbarkeit, Erwähnungen, Zitate und Position je Prompt und Engine." },
        { label: "Prompt-Recherche", href: "/de/prompt-research", description: "So finden Sie die Fragen, die Ihre Käufer der KI tatsächlich stellen." },
        { label: "Blog: Query Fan-out erklärt", href: "/de/blog/query-fan-out", description: "Wie KI-Suchen eine Frage in viele Suchanfragen zerlegen und was das für Ihre Inhalte bedeutet." },
        { label: "Blog: Welche GEO-Techniken wirken?", href: "/de/blog/geo-techniques", description: "Was die Forschung über mehr KI-Sichtbarkeit zeigt, warum Studien sich widersprechen und wie Sie selbst testen." },
        { label: "Playbook: Vergleichs-Prompts gewinnen", href: "/de/case-studies/win-comparison-prompts", description: "Eine vollständige Methode mit Prompt-Set zum Import." },
        { label: "Demo-Projekt ausprobieren", href: "/self-hosting", description: "Öffnen Sie nach der Installation das integrierte Demo-Projekt mit Beispieldaten aus 90 Tagen und die zweiminütige Produkttour (Anleitung englisch)." },
      ],
    },
    {
      kind: "links",
      id: "path-technical",
      eyebrow: "Lernpfad 2 · Technik",
      title: "Ihre Website für KI lesbar machen",
      subtitle: "Für SEO-, Web- und Plattform-Teams.",
      links: [
        { label: "Blog: Können KI-Crawler Ihre Website lesen?", href: "/de/blog/ai-crawler-readability", description: "Welche KI-Crawler kommen, welche die robots.txt befolgen und wie JavaScript, CDN-Bot-Schutz und llms.txt wirken." },
        { label: "KI-Crawlability", href: "/de/ai-crawlability", description: "robots.txt, Rendering, Meta-Direktiven und llms.txt, geprüft je KI-Crawler." },
        { label: "KI-Bot-Traffic", href: "/de/ai-bot-traffic", description: "Welche KI-Crawler wirklich vorbeikommen, verifiziert anhand veröffentlichter IP-Bereiche." },
        { label: "Playbook: KI-Crawler-Zugriff reparieren", href: "/de/case-studies/fix-ai-crawler-access", description: "Prüfungen, Korrekturen und Verifikation in einer Methode." },
        { label: "Self-Hosting-Anleitung", href: "/self-hosting", description: "AutoSEO in wenigen Minuten per Docker auf dem eigenen Server installieren (englisch)." },
      ],
    },
    {
      kind: "links",
      id: "path-agencies",
      eyebrow: "Lernpfad 3 · Agenturen",
      title: "GEO als Dienstleistung anbieten",
      subtitle: "Für Agenturen und Freelancer, die KI-Sichtbarkeit in ihr Angebot aufnehmen.",
      links: [
        { label: "AutoSEO für Agenturen", href: "/de/solutions/agencies", description: "Kundenprojekte, Kundenzugänge und White-Label-Reporting." },
        { label: "Report Builder", href: "/de/report-builder", description: "Vorlagen wie Pitch, Monthly Report und Competitor Benchmark mit Ihrem Brand Kit." },
        { label: "Playbook: Agentur-Pitch in 14 Tagen", href: "/de/case-studies/agency-pitch-in-14-days", description: "Von der Domain eines Interessenten zum datenbasierten Deck." },
        { label: "Partnerprogramm", href: "/de/partner-program", description: "So arbeiten wir mit Agenturen zusammen, die AutoSEO einsetzen." },
      ],
    },
    {
      kind: "links",
      id: "path-impact",
      eyebrow: "Lernpfad 4 · Geschäftswirkung",
      title: "KI-Suche mit Umsatz verbinden",
      subtitle: "Für Marketing-Verantwortliche, die ein GEO-Budget begründen müssen.",
      links: [
        { label: "Blog: Leads und Umsatz der KI-Suche zuordnen", href: "/de/blog/ai-search-attribution", description: "Referrer, UTM-Parameter, der GA4-Kanal „AI Assistant“ und die Frage „Wie sind Sie auf uns aufmerksam geworden?“." },
        { label: "Attribution der KI-Suche", href: "/de/ai-search-attribution", description: "Selbstauskunft der Kunden, verknüpft mit Bestellungen und Deals." },
        { label: "Playbook: Umsatz aus KI-Suche zuordnen", href: "/de/case-studies/attribute-ai-search-revenue", description: "Umfrage, Conversions und Referral-Traffic Schritt für Schritt." },
        { label: "Blog: Google AI Mode vs. AI Overviews", href: "/de/blog/ai-mode-vs-ai-overviews", description: "Wie sich Googles zwei KI-Antwortformate unterscheiden und wie Sie beide messen." },
        { label: "AI Citation Tracking", href: "/de/ai-citation-tracking", description: "Welche Quellen die KI zu Ihren Themen zitiert." },
        { label: "Playbook: Von vertrauenswürdigen Quellen zitiert werden", href: "/de/case-studies/get-cited-by-trusted-sources", description: "Schließen Sie die Zitierlücken, die Wettbewerber füllen." },
      ],
    },
    {
      kind: "links",
      id: "path-assistants",
      eyebrow: "Lernpfad 5 · KI-Assistenten",
      title: "AutoSEO aus Ihrem KI-Assistenten nutzen",
      subtitle: "Für Teams, die ihre SEO-Daten in Claude, ChatGPT oder im Code-Editor nutzen möchten.",
      links: [
        { label: "MCP-Server", href: "/de/mcp-server", description: "Mit AutoSEO-Daten in KI-Assistenten wie Claude, ChatGPT oder Cursor arbeiten." },
        { label: "Blog: AutoSEO per MCP mit Claude verbinden", href: "/de/blog/claude-connector", description: "Einrichtung für Claude, Claude Desktop und Claude Code mit OAuth und sicheren Berechtigungen." },
        { label: "Blog: AutoSEO per MCP mit ChatGPT verbinden", href: "/de/blog/chatgpt-plugin", description: "AutoSEO in ChatGPT, Codex, Cursor und VS Code nutzen – mit sicheren Scopes und Beispiel-Prompts." },
        { label: "REST API", href: "/de/rest-api", description: "AutoSEO-Daten in Ihre eigenen Tools holen." },
      ],
    },
    {
      kind: "split",
      id: "walkthrough",
      eyebrow: "Für Teams",
      title: "Ein Live-Walkthrough für Ihr Team",
      body: "Sie evaluieren AutoSEO mit mehreren Personen? Wir führen Ihr Team per Videocall durch das Produkt – entlang Ihrer Fragen und auf Wunsch an einem Projekt mit Ihrer eigenen Domain.",
      bullets: [
        "Für Teams, die AutoSEO Cloud oder einen Self-Hosting-Rollout evaluieren",
        "Per Videocall, auf Deutsch oder Englisch",
        "Nennen Sie uns Ihre Ziele, die Teamgröße und einige mögliche Termine",
      ],
      cta: { label: "Walkthrough anfragen", href: walkthrough },
    },
    {
      kind: "cards",
      id: "community",
      eyebrow: "Zwischen den Sessions",
      title: "Wo Sie Fragen stellen können",
      columns: 3,
      cards: [
        { icon: "message", title: "GitHub Discussions", href: `${site.github}/discussions`, body: "Stellen Sie Fragen, teilen Sie Setups und diskutieren Sie Ideen mit anderen AutoSEO-Nutzern und den Menschen, die es entwickeln." },
        { icon: "book", title: "Dokumentation", href: `${site.github}/tree/main/docs`, body: "Die Dokumentation zu Self-Hosting, Architektur und Managed Hosting liegt im Repository (englisch)." },
        { icon: "heart", title: "Support", href: "/de/support", body: "So bekommen Sie Hilfe zu AutoSEO Cloud und zur Self-Hosting-Version." },
      ],
    },
    {
      kind: "faq",
      id: "faq",
      title: "Fragen zu Webinaren und Lernangeboten",
      items: [
        {
          q: "Gibt es anstehende Webinare?",
          a: "Im Moment nicht. Wir listen nur Sessions, die tatsächlich terminiert sind – mit Datum, Uhrzeit und Agenda. Bis dahin decken die Lernpfade auf dieser Seite dieselben Themen on demand ab.",
        },
        {
          q: "Kann mein Team eine Live-Demo bekommen?",
          a: `Ja. Schreiben Sie an ${site.contactEmail} mit Ihren Zielen, der Teamgröße und einigen möglichen Terminen, und wir führen Ihr Team per Videocall durch AutoSEO.`,
        },
        {
          q: "Kann ich AutoSEO kostenlos ausprobieren?",
          a: "Ja. Installieren Sie die kostenlose Self-Hosting-Version und öffnen Sie das integrierte Demo-Projekt: generierte Beispieldaten aus 90 Tagen für fiktive Marken, ohne dass Provider-Guthaben verbraucht wird. Die Produkttour in der App dauert etwa zwei Minuten.",
        },
        {
          q: "Wo bekomme ich Hilfe bei einem konkreten Problem?",
          a: "Fragen zur Nutzung von AutoSEO stellen Sie am besten in den GitHub Discussions, Bugs gehören in die GitHub Issues. Kunden von AutoSEO Cloud können uns zusätzlich per E-Mail erreichen.",
        },
        {
          q: "Sind die Lernmaterialien kostenlos?",
          a: "Ja. Alle Leitfäden, Playbooks und Dokumentationen sind kostenlos und ohne Konto zugänglich.",
        },
      ],
    },
    {
      kind: "cta",
      id: "start",
      title: "Lernen durch Ausprobieren",
      body: "Am schnellsten verstehen Sie KI-Sichtbarkeit, wenn Sie Ihre eigenen Prompts tracken.",
      primary: { label: `Für ${site.priceMonthlyUsd} $/Monat starten`, href: "/signup" },
      secondary: { label: "Kostenlos selbst hosten", href: "/self-hosting" },
    },
  ],
};

export default page;
