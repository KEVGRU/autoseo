import type { PressPage } from "@/components/site/company/types";
import { site } from "@/lib/site";
import { boilerplates } from "./press.en";

const { legal } = site;
const press = `mailto:${site.contactEmail}?subject=Presseanfrage`;
const price = `${site.priceMonthlyUsd} $`;

const page: PressPage = {
  path: "/press",
  crumb: "Presse",
  meta: {
    title: "AutoSEO Pressekit: Boilerplate, Fakten, Logos, Screenshots",
    description:
      "Pressekit zu AutoSEO, der Open-Source-Plattform für KI-Sichtbarkeit und SEO der Codext GmbH: Boilerplates auf Deutsch und Englisch, Fakten, Logos, Screenshots.",
  },
  hero: {
    eyebrow: "Presse",
    title: "Pressekit",
    subtitle:
      "Alles, was Sie für einen Beitrag über AutoSEO brauchen: Kurzbeschreibungen auf Deutsch und Englisch, überprüfbare Fakten, Logos, Produkt-Screenshots und einen direkten Kontakt.",
    ctas: [
      { label: "Kontakt aufnehmen", href: press },
      { label: "Logos und Screenshots", href: "#logos" },
    ],
  },
  sections: [
    {
      kind: "prose",
      id: "boilerplate",
      eyebrow: "Boilerplate",
      title: "AutoSEO in 50 oder 100 Wörtern",
      blocks: [
        { type: "h3", text: "Deutsch · rund 50 Wörter" },
        { type: "p", text: boilerplates.de50 },
        { type: "h3", text: "Deutsch · rund 100 Wörter" },
        { type: "p", text: boilerplates.de100 },
        { type: "h3", text: "Englisch · rund 50 Wörter" },
        { type: "p", text: boilerplates.en50 },
        { type: "h3", text: "Englisch · rund 100 Wörter" },
        { type: "p", text: boilerplates.en100 },
        {
          type: "callout",
          tone: "tip",
          title: "Schreibweise",
          text: "Schreiben Sie **AutoSEO** in einem Wort. Der Managed Service heißt **AutoSEO Cloud**, das Unternehmen dahinter ist die **Codext GmbH**.",
        },
      ],
    },
    {
      kind: "table",
      id: "fact-sheet",
      eyebrow: "Fact Sheet",
      title: "AutoSEO auf einen Blick",
      head: ["Fakt", "Details"],
      rows: [
        ["Produkt", "AutoSEO – Open-Source-Plattform für KI-Sichtbarkeit (GEO/AEO) und SEO"],
        ["Unternehmen", `${legal.name}, ${legal.street}, ${legal.postalCode} ${legal.city}, Deutschland`],
        ["Geschäftsführer", legal.managingDirector],
        ["Handelsregister", `${legal.registerCourt}, ${legal.registerNumber}`],
        ["Lizenz", "MIT (Open Source)"],
        ["Quellcode", `[github.com/codextde/autoseo](${site.github})`],
        ["Website", `[${site.host}](https://${site.host})`],
        ["Preise", `Self-Hosting: kostenlos, mit allen Funktionen. AutoSEO Cloud: ${price} pro Workspace und Monat.`],
        ["Hosting", "Self-Hosting: auf dem eigenen Server des Betreibers (Docker). AutoSEO Cloud: gehostet in Deutschland."],
        ["Getrackte KI-Engines", "ChatGPT, Perplexity, Gemini, Claude, Google AI Overviews, Google AI Mode, Microsoft Copilot, Grok, Mistral, DeepSeek und weitere"],
        ["Technologie", "Next.js, React und PostgreSQL; ausgeliefert als Docker-Image `ghcr.io/codextde/autoseo`"],
      ],
      note: "Sie brauchen eine Angabe, die hier fehlt? Fragen Sie uns – wir veröffentlichen nur Fakten, die wir belegen können.",
    },
    {
      kind: "checklist",
      id: "usage",
      eyebrow: "Richtlinien",
      title: "Name, Logo und Screenshots verwenden",
      items: [
        "Nutzen Sie Logo und Screenshots, um über AutoSEO zu berichten oder darauf zu verlinken",
        "Lassen Sie ausreichend Freiraum um das Zeichen und zeigen Sie es auf ruhigem Hintergrund",
        "Verändern Sie weder Farben noch Proportionen des Zeichens, beschneiden Sie es nicht und fügen Sie keine Effekte hinzu",
        "Erwecken Sie nicht den Eindruck, die Codext GmbH empfehle, sponsere oder unterstütze Sie, sofern das nicht schriftlich vereinbart ist",
        "Schreiben Sie den Namen als AutoSEO – ein Wort, ohne Leerzeichen",
      ],
      aside: [
        { type: "h3", text: "Zu den Screenshots" },
        {
          type: "p",
          text: "Sie zeigen das Demo-Projekt, das AutoSEO mitbringt: fiktive Marken und generierte Beispieldaten. Bitte stellen Sie sie nicht als Ergebnisse eines realen Unternehmens dar.",
        },
      ],
    },
    {
      kind: "cards",
      id: "contact",
      eyebrow: "Kontakt",
      title: "Sprechen Sie mit uns",
      columns: 3,
      cards: [
        {
          icon: "mail",
          title: "Presseanfragen",
          body: `Interviews, Zitate, Hintergründe und Faktenchecks: [${site.contactEmail}](${press}). Bitte nennen Sie Ihre Deadline.`,
        },
        {
          icon: "building",
          title: "Unternehmen",
          body: `${legal.name}, ${legal.street}, ${legal.postalCode} ${legal.city}, Deutschland · [${legal.email}](mailto:${legal.email}) · ${legal.phone}. Alle Angaben im [Impressum](/imprint) (englisch).`,
        },
        {
          icon: "shield",
          title: "Sicherheitsforschende",
          body: "Bitte melden Sie Schwachstellen vertraulich an [security@codext.de](mailto:security@codext.de) oder über GitHub Security Advisories – nicht über den Pressekontakt.",
        },
      ],
    },
    {
      kind: "faq",
      id: "faq",
      title: "Fragen von Journalistinnen und Journalisten",
      items: [
        {
          q: "Wer steht hinter AutoSEO?",
          a: `AutoSEO wird von der ${legal.name} entwickelt, einem Softwareunternehmen mit Sitz in ${legal.city} (Geschäftsführer: ${legal.managingDirector}), gemeinsam mit Open-Source-Beitragenden auf GitHub.`,
        },
        {
          q: "Ist AutoSEO wirklich kostenlos?",
          a: `Ja. Die komplette Software steht unter MIT-Lizenz und lässt sich kostenlos selbst hosten – mit allen Funktionen und ohne Begrenzung bei Nutzern oder Projekten. Die ${legal.name} verdient Geld mit AutoSEO Cloud, einem in Deutschland gehosteten Managed Service für ${price} pro Workspace und Monat.`,
        },
        {
          q: "Was unterscheidet AutoSEO von anderen Tools für KI-Sichtbarkeit?",
          a: "AutoSEO ist Open Source, läuft auf Wunsch auf dem eigenen Server des Kunden, verbindet KI-Sichtbarkeit mit einer vollständigen klassischen SEO-Suite und kann KI-Aufgaben über die Claude-Code- oder Codex-Abos ausführen, die ein Team bereits hat. Viele vergleichbare Tools sind Closed-Source-Dienste mit Preisen pro Nutzer oder pro Prompt.",
        },
        {
          q: "Darf ich die Screenshots in meinem Artikel verwenden?",
          a: "Ja, für die redaktionelle Berichterstattung über AutoSEO. Sie zeigen das Demo-Projekt mit fiktiven Marken und generierten Daten. Bitte nennen Sie „AutoSEO“ als Quelle.",
        },
        {
          q: "Kann ich für einen Test Zugang bekommen?",
          a: `Ja. Schreiben Sie an ${site.contactEmail} und fragen Sie nach einem kostenlosen AutoSEO-Cloud-Workspace für Ihren Test – oder installieren Sie die kostenlose Self-Hosting-Version selbst; sie enthält ein Demo-Projekt mit Beispieldaten aus 90 Tagen.`,
        },
        {
          q: "Wo kann ich Produktänderungen verfolgen?",
          a: "Änderungen werden laufend aus dem main-Branch auf GitHub ausgeliefert. Getaggte Versionen stehen unter Releases, und jeder Commit ist in der Historie des Repositorys öffentlich einsehbar.",
        },
      ],
    },
    {
      kind: "cta",
      id: "start",
      title: "Sie schreiben über KI-Suche?",
      body: "Wir erklären gern, wie das Tracking von KI-Sichtbarkeit funktioniert – und was es nicht leisten kann.",
      primary: { label: "Kontakt aufnehmen", href: press },
      secondary: { label: "Auf GitHub ansehen", href: site.github },
    },
  ],
  assetsAfter: "fact-sheet",
  logos: {
    title: "Logos",
    subtitle: "Das AutoSEO-Zeichen als SVG und PNG. Im Fließtext schreiben Sie den Namen als „AutoSEO“.",
    items: [
      { label: "AutoSEO-Zeichen", src: "/icon.svg", format: "SVG", size: "Vektor, frei skalierbar" },
      { label: "AutoSEO-App-Icon", src: "/apple-touch-icon.png", format: "PNG", size: "180 × 180 px" },
    ],
  },
  screenshots: {
    title: "Screenshots",
    subtitle:
      "Produkt-Screenshots des integrierten Demo-Projekts (fiktive Marken, generierte Daten), frei verwendbar für die Berichterstattung über AutoSEO. Zum Öffnen anklicken oder als PNG herunterladen.",
    items: [
      { src: "/screenshots/dashboard.png", alt: "AutoSEO-Dashboard mit KI-Sichtbarkeit, Mention Rate, Citation Rate, Share of Voice und Sentiment", caption: "Dashboard: KPIs zur KI-Sichtbarkeit neben Wettbewerbertrends.", width: 1600, height: 1000 },
      { src: "/screenshots/ai-tracker.png", alt: "AI-Visibility-Tracker mit täglichem Sichtbarkeitsverlauf und Prompts pro Tag", caption: "AI-Visibility-Tracker über Engines und Prompts hinweg.", width: 1600, height: 1000 },
      { src: "/screenshots/competitors.png", alt: "Mention Rate der Wettbewerber im Zeitverlauf und Ranking-Tabelle zur Sichtbarkeit", caption: "Wettbewerber: Share of Voice und Ranking.", width: 1600, height: 1000 },
      { src: "/screenshots/sources.png", alt: "Meistzitierte Quellen, Quellentypen und Tabelle zur Quellenanalyse", caption: "Quellen: welche Seiten KI-Engines zitieren.", width: 1600, height: 1000 },
      { src: "/screenshots/sentiment.png", alt: "Sentiment-Score, Sentiment im Zeitverlauf sowie Themen von Lob und Kritik", caption: "Sentiment: was KI lobt und kritisiert.", width: 1600, height: 1000 },
      { src: "/screenshots/site-audit.png", alt: "Site-Audit-Bericht mit Health Score, Problemkategorien und Problemliste", caption: "Site-Audit mit Health Score und Problemen.", width: 1600, height: 1000 },
      { src: "/screenshots/reports.png", alt: "Report Builder beim Bearbeiten einer Folie eines monatlichen Reports zur KI-Sichtbarkeit", caption: "Report Builder mit White-Label-Folien.", width: 1600, height: 1000 },
      { src: "/screenshots/attribution.png", alt: "Attribution: KI-Suche im Vergleich mit anderen Kanälen und Umsatz", caption: "Attribution: Umsatz aus KI-Suche.", width: 1600, height: 1000 },
      { src: "/screenshots/bot-traffic.png", alt: "Bot-Traffic-Analyse mit Besuchen von KI-Crawlern pro Tag", caption: "KI-Bot-Traffic aus Logs und CDN-Anbindungen.", width: 1600, height: 1000 },
    ],
  },
};

export default page;
