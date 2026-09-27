import type { SitePage } from "@/components/site/types";
import { site } from "@/lib/site";

const price = `${site.priceMonthlyUsd} $`;

const page: SitePage = {
  path: "/customers",
  crumb: "Kunden",
  meta: {
    title: "Wer AutoSEO nutzt: Teams, Agenturen, Branchen",
    description:
      "Wie SEO-, GEO-, Content- und PR-Teams, Agenturen, E-Commerce, SaaS und regulierte Branchen AutoSEO nutzen – offen entwickelt, Listung nur per Opt-in.",
  },
  hero: {
    eyebrow: "Kunden",
    title: "Wer AutoSEO nutzt",
    subtitle:
      "AutoSEO ist Open Source: Jeder kann es betreiben, ohne uns Bescheid zu geben, und selbst gehostete Instanzen senden uns keinerlei Daten. Statt Logos und Zitaten, die wir nicht belegen können, zeigen wir Ihnen deshalb, für wen AutoSEO gebaut ist, wie die einzelnen Teams es einsetzen und wie Sie sich listen lassen können.",
    ctas: [
      { label: "Jetzt starten", href: "/signup" },
      { label: "Auf GitHub ansehen", href: site.github },
    ],
  },
  sections: [
    {
      kind: "cards",
      id: "teams",
      eyebrow: "Anwendungsfälle",
      title: "So setzen Teams AutoSEO ein",
      subtitle: "Eine Plattform für AI Visibility und klassisches SEO. Alle Teams arbeiten mit denselben Daten und nutzen die Teile, die sie brauchen.",
      columns: 3,
      cards: [
        {
          icon: "target",
          title: "SEO- und GEO-Teams",
          href: "/de/solutions/geo-teams",
          body: "Sichtbarkeit, Erwähnungsrate, Zitierrate und Position pro Prompt über alle KI-Engines verfolgen – direkt neben Rankings, Backlinks, Site-Audits und der Search Console. Ein Tool für klassische und KI-Suche.",
        },
        {
          icon: "file",
          title: "Content-Teams",
          href: "/de/solutions/content-teams",
          body: "Prompts und Quellen finden, bei denen Sie fehlen, die Belege in priorisierte Aufgaben übersetzen und Briefings sowie Artikel entwerfen, die Sie in WordPress oder Webflow veröffentlichen.",
        },
        {
          icon: "megaphone",
          title: "PR- und Markenteams",
          href: "/de/solutions/pr-brand-teams",
          body: "Sehen, wie KI Ihre Marke beschreibt, was sie lobt und kritisiert, welche Wettbewerber sie stattdessen empfiehlt und welche Medien sie zitiert.",
        },
        {
          icon: "briefcase",
          title: "Agenturen",
          href: "/de/solutions/agencies",
          body: "Jeden Kunden als Projekt führen, alle in der Portfolio-Übersicht vergleichen, Kunden Lesezugriff geben, Pitch-Projekte anlegen, die automatisch auslaufen, und White-Label-Reports versenden.",
        },
        {
          icon: "layers",
          title: "E-Commerce",
          href: "/de/solutions/e-commerce",
          body: "Sehen, welche Produkte KI-Engines empfehlen – auch Antworten der ChatGPT-App mit Shopping-Karten – und Bestellungen aus Shopify, WooCommerce oder Shopware der KI-Suche zuordnen.",
        },
        {
          icon: "rocket",
          title: "SaaS und Tech",
          href: "/de/solutions/saas-tech",
          body: "Prompts wie „bestes Tool für …“ und „X vs. Y“ gewinnen, sehen, welche Bewertungsportale und Vergleiche KI zitiert, und Deals aus HubSpot, Salesforce oder Stripe der KI-Suche zuordnen.",
        },
      ],
    },
    {
      kind: "split",
      id: "regulated",
      eyebrow: "Finanzen, Gesundheit, Pharma",
      title: "Regulierte Branchen: Genauigkeit und Kontrolle zuerst",
      body: "Nennt eine KI eine falsche Dosierung, Gebühr oder Vertragsbedingung, ist das ein Compliance-Problem – nicht nur ein Marketingproblem. AutoSEO prüft KI-Antworten gegen die Dokumente, die Sie freigegeben haben, und lässt sich vollständig in Ihrer eigenen Infrastruktur betreiben. Mehr zu [Finanzen](/de/solutions/finance), [Gesundheit](/de/solutions/healthcare) und [Pharma](/de/solutions/pharma).",
      bullets: [
        "Fact Check vergleicht KI-Aussagen mit Ihren Referenzdokumenten (Fachinformation, Datenblatt, Bedingungen) und markiert widersprüchliche, nicht belegte, veraltete und Off-Label-Aussagen",
        "Jedes geprüfte Produkt oder Asset trägt seine Märkte samt Behörde, zum Beispiel DE · EMA oder US · FDA",
        "Mit Self-Hosting bleiben Prompts, Antworten und Befunde in Ihrer eigenen Datenbank",
        "Audit-Log, Rollen und Zugriff pro Projekt unterstützen Prüf- und Freigabeprozesse",
      ],
      cta: { label: "So funktioniert Fact Check", href: "/de/ai-fact-check" },
    },
    {
      kind: "cards",
      id: "open-source",
      eyebrow: "Offen entwickelt",
      title: "Alles passiert auf GitHub",
      subtitle: "Der Code, die Diskussionen zur Roadmap und jede Änderung sind öffentlich. Beurteilen Sie das Projekt nach seiner Arbeit, nicht nach unserem Marketing.",
      columns: 4,
      cards: [
        {
          icon: "git",
          title: "Repository",
          href: site.github,
          body: "Der vollständige Quellcode unter MIT-Lizenz: App, lokaler Agent, Plugins und Deployment-Dateien.",
        },
        {
          icon: "users",
          title: "Mitwirkende",
          href: `${site.github}/graphs/contributors`,
          body: "Alle, die AutoSEO mitgestaltet haben – von GitHub direkt aus der Commit-Historie aufgelistet.",
        },
        {
          icon: "rocket",
          title: "Releases",
          href: `${site.github}/releases`,
          body: "Getaggte Versionen und das Docker-Image ghcr.io/codextde/autoseo. Der main-Branch wird laufend ausgeliefert.",
        },
        {
          icon: "message",
          title: "Discussions",
          href: `${site.github}/discussions`,
          body: "Fragen, Ideen und Erfahrungsberichte von Menschen, die AutoSEO betreiben.",
        },
      ],
    },
    {
      kind: "steps",
      id: "get-listed",
      eyebrow: "Nur per Opt-in",
      title: "Als AutoSEO-Nutzer gelistet werden",
      subtitle:
        "Wir nehmen niemals eine Organisation auf, weil wir sie in einer Registrierung, einer Rechnung oder einem Log gesehen haben. Nur Sie selbst können sich eintragen – und wieder austragen.",
      steps: [
        { title: "Repository forken", body: `Forken Sie [codextde/autoseo](${site.github}) auf GitHub.` },
        {
          title: "Eine Zeile in USERS.md ergänzen",
          body: "Name der Organisation, Website und auf Wunsch, wie Sie AutoSEO einsetzen (zum Beispiel „selbst gehostet, 12 Marken in 4 Märkten“). Legen Sie die Datei an, falls es sie noch nicht gibt.",
        },
        {
          title: "Pull Request öffnen",
          body: "Reichen Sie ihn über ein Konto ein, das für Ihre Organisation sprechen darf, oder schreiben Sie im Pull Request, wie wir den Eintrag prüfen können.",
        },
        {
          title: "Jederzeit wieder entfernen",
          body: `Ein weiterer Pull Request oder eine E-Mail an [${site.contactEmail}](mailto:${site.contactEmail}) – und der Eintrag ist weg.`,
        },
      ],
    },
    {
      kind: "checklist",
      id: "rules",
      eyebrow: "Unsere Regeln für Social Proof",
      title: "Was Sie auf dieser Website nicht finden",
      items: [
        "Logos von Unternehmen, die uns keine schriftliche Erlaubnis gegeben haben",
        "Testimonials, die wir keiner realen Person zuordnen können, die den Wortlaut freigegeben hat",
        "Wachstumszahlen oder Ergebnisse, die wir nicht aus Daten reproduzieren können",
        "Listungen auf Basis von Registrierungen, Zahlungen oder Server-Logs",
      ],
      aside: [
        { type: "h3", text: "Case Studies, anders gedacht" },
        {
          type: "p",
          text: "Statt Kundengeschichten veröffentlichen wir reproduzierbare Playbooks: das Prompt-Set, die Engines, die Ausgangsmessung und wie Sie Veränderungen messen. Die Methode können Sie selbst überprüfen.",
        },
        { type: "p", text: "[Zu den Playbooks →](/de/case-studies)" },
      ],
    },
    {
      kind: "faq",
      id: "faq",
      title: "Fragen zu unseren Nutzern",
      items: [
        {
          q: "Warum zeigen Sie keine Kundenlogos?",
          a: "Weil wir nur veröffentlichen, was wir belegen können. AutoSEO ist Open Source, und selbst gehostete Instanzen senden uns keine Daten – die meisten, die es betreiben, kennen wir also gar nicht. Logos ohne Erlaubnis zu zeigen oder Empfehlungen anzudeuten, wäre irreführend. Organisationen, die sich per USERS.md auf GitHub eintragen, werden gelistet.",
        },
        {
          q: "Eignet sich AutoSEO für ein kleines Team?",
          a: `Ja. Eine Person kann es einrichten: Hosten Sie es kostenlos selbst auf einem kleinen Server (2 vCPU, 2–4 GB RAM) oder nutzen Sie AutoSEO Cloud für ${price} pro Monat, mit bereits eingerichteten KI-Anbietern und SEO-Daten. Keine der beiden Varianten rechnet pro Nutzer ab.`,
        },
        {
          q: "Welche KI-Engines trackt AutoSEO?",
          a: "Unter anderem ChatGPT (API und App), Perplexity, Google AI Overviews, Google AI Mode, Gemini, Claude, Microsoft Copilot, Grok, Mistral und DeepSeek. Welche Engines verfügbar sind, hängt von den auf der Instanz eingerichteten Anbietern ab: API-Keys, ein lokaler Claude-Code- oder Codex-Agent oder DataForSEO.",
        },
        {
          q: "Können Agenturen AutoSEO für Kundenprojekte nutzen?",
          a: "Ja. Die MIT-Lizenz erlaubt es Ihnen, AutoSEO für Kunden zu hosten. Legen Sie pro Kunde ein Projekt an, geben Sie Kunden mit der Rolle Client Lesezugriff, nutzen Sie Pitch-Projekte, die automatisch auslaufen, und versenden Sie White-Label-Reports mit Ihrem eigenen Brand Kit. Wie wir mit Agenturen zusammenarbeiten, beschreibt die Seite zum Partnerprogramm.",
        },
        {
          q: "Veröffentlichen Sie Case Studies?",
          a: "Statt Kundengeschichten veröffentlichen wir reproduzierbare Playbooks. Jedes nennt das Prompt-Set, die zu trackenden Engines, die Ausgangsmessung in AutoSEO, die Maßnahmen und wie Sie die Veränderung messen – einschließlich der natürlichen Schwankung von KI-Antworten.",
        },
        {
          q: "Wie wird meine Organisation gelistet?",
          a: `Öffnen Sie auf GitHub einen Pull Request, der Ihre Organisation in USERS.md im AutoSEO-Repository einträgt. Gelistet wird nur per Opt-in, und Sie können den Eintrag jederzeit per weiterem Pull Request oder per E-Mail an ${site.contactEmail} entfernen lassen.`,
        },
        {
          q: "Wo kann ich eigene Ergebnisse teilen?",
          a: "In den GitHub Discussions. Nennen Sie Ihr Prompt-Set, die Engines, den Zeitraum und Ihre Messmethode, damit andere nachvollziehen können, was Sie getan haben, und daraus lernen.",
        },
      ],
    },
    {
      kind: "cta",
      id: "start",
      title: "Sehen Sie, wo Ihre Marke in KI-Antworten steht",
      body: "Starten Sie mit AutoSEO Cloud oder hosten Sie die Open-Source-Version kostenlos selbst. Alle Funktionen sind in beiden Varianten enthalten.",
      primary: { label: `Für ${price}/Monat starten`, href: "/signup" },
      secondary: { label: "Kostenlos selbst hosten", href: "/self-hosting" },
    },
  ],
};

export default page;
