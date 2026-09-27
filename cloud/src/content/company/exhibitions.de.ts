import type { SitePage } from "@/components/site/types";
import { site } from "@/lib/site";

const walkthrough = `mailto:${site.contactEmail}?subject=Live-Walkthrough`;
const speaking = `mailto:${site.contactEmail}?subject=Speaker-Anfrage`;

const page: SitePage = {
  path: "/exhibitions",
  crumb: "Events",
  meta: {
    title: "AutoSEO auf Messen, Events und Konferenzen",
    description:
      "Derzeit sind keine Messe- oder Event-Auftritte von AutoSEO geplant. Treffen Sie uns online, laden Sie uns als Speaker ein oder fordern Sie einen Walkthrough an.",
  },
  hero: {
    eyebrow: "Events",
    title: "Lernen Sie das Team hinter AutoSEO kennen",
    subtitle:
      "Aktuell sind keine Messen oder Konferenzen geplant. Treffen können Sie uns trotzdem – im Video-Walkthrough für Ihr Team, in der Open-Source-Community oder auf Ihrer Bühne.",
    ctas: [
      { label: "Walkthrough anfragen", href: walkthrough },
      { label: "Als Speaker einladen", href: "#speaking" },
    ],
  },
  sections: [
    {
      kind: "prose",
      id: "calendar",
      eyebrow: "Kalender",
      title: "Veranstaltungskalender",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "Keine Events geplant",
          text: "Wir listen nur bestätigte Auftritte. Sobald wir irgendwo ausstellen oder sprechen, finden Sie Datum, Ort und Treffpunkt auf dieser Seite.",
        },
        {
          type: "p",
          text: "Die meisten Gespräche über AutoSEO finden ohnehin online statt: in Walkthroughs mit Teams, in den GitHub Discussions und in Pull Requests. Die folgenden Wege funktionieren schon heute.",
        },
      ],
    },
    {
      kind: "cards",
      id: "meet",
      eyebrow: "Jetzt treffen",
      title: "Drei Wege, uns ohne Messe zu treffen",
      columns: 3,
      cards: [
        {
          icon: "video",
          title: "Live-Walkthrough",
          href: walkthrough,
          body: "Ein Videocall für Ihr Team: Wir zeigen AutoSEO entlang Ihrer Fragen und auf Wunsch an Ihrer eigenen Domain.",
        },
        {
          icon: "message",
          title: "GitHub Discussions",
          href: `${site.github}/discussions`,
          body: "Fragen Sie die Menschen, die AutoSEO entwickeln, direkt und öffentlich – und sehen Sie, woran andere arbeiten.",
        },
        {
          icon: "git",
          title: "Mitentwickeln",
          href: `${site.github}/issues?q=is%3Aopen+label%3A%22good+first+issue%22`,
          body: "Der direkteste Weg zur Zusammenarbeit mit dem Team: ein Issue auswählen und einen Pull Request öffnen.",
        },
      ],
    },
    {
      kind: "split",
      id: "speaking",
      eyebrow: "Vorträge",
      title: "Laden Sie uns zu Ihrem Event oder Podcast ein",
      body: "Sie organisieren ein Meetup, eine Konferenz, ein Webinar oder einen Podcast zu SEO, KI-Suche oder Open Source? Wir sprechen gern darüber, wie sich KI-Sichtbarkeit ehrlich messen lässt – einschließlich dessen, was heutiges Tracking leisten kann und was nicht.",
      bullets: [
        "Themen: KI-Sichtbarkeit messen, Schwankungen in KI-Antworten, Zugriff von KI-Crawlern, Attribution der KI-Suche, Open-Source-Software im Marketing",
        "Formate: Vorträge, Panels, Workshops und Podcasts, auf Deutsch oder Englisch",
        "Bitte nennen Sie Datum, Zielgruppe, Format und die erwartete Teilnehmerzahl",
      ],
      cta: { label: "Speaker-Anfrage senden", href: speaking },
    },
    {
      kind: "links",
      id: "prepare",
      eyebrow: "Vor dem Treffen",
      title: "Holen Sie das Beste aus einem Gespräch heraus",
      subtitle: "Zehn Minuten mit diesen Seiten machen jedes Gespräch mit uns ergiebiger.",
      links: [
        { label: "Playbooks", href: "/de/case-studies", description: "Reproduzierbare Methoden mit Prompt-Sets, Ausgangsmessung und Erfolgsmessung." },
        { label: "AutoSEO für Unternehmen", href: "/de/enterprise", description: "Self-Hosting, AutoSEO Cloud und die Sicherheitsfunktionen." },
        { label: "Preise", href: "/de/pricing", description: "Kostenlose Self-Hosting-Version oder AutoSEO Cloud zum monatlichen Festpreis." },
        { label: "Sicherheit", href: "/de/security", description: "Wie AutoSEO Secrets, Tokens und Zugänge schützt." },
        { label: "Blog", href: "/de/blog", description: "Artikel zu GEO-Forschung, KI-Crawlern, Attribution und der Anbindung von KI-Assistenten." },
        { label: "Blog: Welche GEO-Techniken wirken?", href: "/de/blog/geo-techniques", description: "Was die Forschung über mehr KI-Sichtbarkeit zeigt, warum Studien sich widersprechen und wie Sie selbst testen." },
      ],
    },
    {
      kind: "faq",
      id: "faq",
      title: "Fragen zu Events",
      items: [
        {
          q: "Stellt AutoSEO auf Messen aus?",
          a: "Derzeit ist nichts geplant. Bestätigte Auftritte finden Sie mit Datum und Ort auf dieser Seite.",
        },
        {
          q: "Können wir uns stattdessen online treffen?",
          a: `Ja. Schreiben Sie an ${site.contactEmail} mit Ihrem Thema und einigen möglichen Terminen, und wir richten einen Videocall für Sie und Ihr Team ein.`,
        },
        {
          q: "Können Sie auf unserem Event sprechen?",
          a: `Schicken Sie Datum, Zielgruppe, Format und Thema an ${site.contactEmail}, und wir melden uns bei Ihnen. Wir sprechen auf Deutsch und Englisch.`,
        },
        {
          q: "Sponsern Sie Events?",
          a: "Ein Sponsoring-Programm haben wir nicht. Wenn Sie ein Community-Event rund um Open Source oder SEO organisieren, fragen Sie gern an – wir entscheiden im Einzelfall.",
        },
        {
          q: "Wie sehe ich AutoSEO in Aktion, ohne auf ein Event zu warten?",
          a: "Installieren Sie die kostenlose Self-Hosting-Version und öffnen Sie das integrierte Demo-Projekt – oder fragen Sie einen Live-Walkthrough für Ihr Team an.",
        },
      ],
    },
    {
      kind: "cta",
      id: "start",
      title: "Warten Sie nicht auf die nächste Messe",
      body: "Sehen Sie AutoSEO schon heute mit Ihren eigenen Daten – in der Cloud oder auf Ihrem eigenen Server.",
      primary: { label: "Walkthrough anfragen", href: walkthrough },
      secondary: { label: "Kostenlos selbst hosten", href: "/self-hosting" },
    },
  ],
};

export default page;
