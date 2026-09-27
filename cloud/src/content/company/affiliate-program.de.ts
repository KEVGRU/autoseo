import type { SitePage } from "@/components/site/types";
import { site } from "@/lib/site";

const apply = `mailto:${site.contactEmail}?subject=Bewerbung%20Empfehlungsprogramm`;

const page: SitePage = {
  path: "/affiliate-program",
  crumb: "Empfehlungsprogramm",
  meta: {
    title: "AutoSEO-Empfehlungsprogramm: AutoSEO Cloud empfehlen",
    description:
      "AutoSEO Cloud empfehlen und Provision erhalten. Nur auf Bewerbung; Provision und Auszahlung werden individuell schriftlich vereinbart. Ablauf und Regeln.",
  },
  hero: {
    eyebrow: "Empfehlungsprogramm",
    title: "Empfehlen Sie AutoSEO Cloud den Menschen, die es brauchen",
    subtitle:
      "Wenn sich Ihr Publikum für SEO und KI-Suche interessiert, können Sie es an AutoSEO Cloud vermitteln. Die Teilnahme ist nur auf Bewerbung möglich; Provision und Auszahlung vereinbaren wir mit jedem Partner individuell und schriftlich.",
    ctas: [
      { label: "Per E-Mail bewerben", href: apply },
      { label: "Programmbedingungen lesen", href: "/de/affiliate-terms" },
    ],
  },
  sections: [
    {
      kind: "prose",
      id: "overview",
      eyebrow: "Überblick",
      title: "Das Programm auf einen Blick",
      blocks: [
        {
          type: "ul",
          items: [
            "**Nur auf Bewerbung.** Wir prüfen jede Bewerbung und nehmen Partner auf, deren Publikum und Vorgehen zu AutoSEO passen.",
            "**Individuelle Konditionen.** Provisionssatz, Laufzeit, Zuordnungsmethode und Auszahlung vereinbaren wir vor dem Start individuell und schriftlich mit Ihnen. Standardsätze veröffentlichen wir nicht.",
            "**Nur AutoSEO Cloud.** Empfehlungen zählen für kostenpflichtige Abonnements von AutoSEO Cloud. Die Self-Hosting-Version ist kostenlos – empfehlen Sie sie gern, verdienen lässt sich daran aber nichts.",
            "**Ehrliche Empfehlungen.** Klar gekennzeichnet, zutreffend, ohne Brand Bidding und ohne Spam. Die Regeln stehen in den [Programmbedingungen](/de/affiliate-terms).",
          ],
        },
        {
          type: "callout",
          tone: "info",
          title: "Warum keine öffentlichen Provisionssätze?",
          text: "Die Konditionen hängen vom Publikum, vom Kanal und vom Aufwand ab, deshalb vereinbaren wir sie individuell. Was wir vereinbaren, wird schriftlich festgehalten, bevor Sie irgendetwas bewerben.",
        },
      ],
    },
    {
      kind: "cards",
      id: "fit",
      eyebrow: "Für wen",
      title: "Passend für alle, die lehren und beraten",
      subtitle: "Agenturen, die AutoSEO für ihre eigenen Kunden bereitstellen, sind im [Partnerprogramm](/de/partner-program) besser aufgehoben.",
      columns: 3,
      cards: [
        {
          icon: "video",
          title: "Creator und Wissensvermittler",
          body: "YouTube-Kanäle, Newsletter, Kurse und Blogs rund um SEO, GEO und Marketing-Technologie.",
        },
        {
          icon: "briefcase",
          title: "Beraterinnen und Berater",
          body: "Freelancer und Berater, die ihren Kunden Tools empfehlen, sie aber nicht selbst betreiben möchten.",
        },
        {
          icon: "users",
          title: "Communities",
          body: "Betreiber von Communities, Verzeichnissen und Veranstaltungen für Marketer, SEOs und Gründer.",
        },
      ],
    },
    {
      kind: "steps",
      id: "how",
      eyebrow: "So funktioniert es",
      title: "Von der Bewerbung zur ersten Empfehlung",
      steps: [
        {
          title: "Bewerben",
          body: `Senden Sie eine E-Mail an [${site.contactEmail}](${apply}) mit dem Betreff „Empfehlungsprogramm“: wer Sie sind, Ihre Kanäle, Ihr Publikum und wie Sie AutoSEO empfehlen möchten.`,
        },
        { title: "Prüfung", body: "Wir prüfen Ihre Bewerbung. Eine Aufnahme ist nicht garantiert, und für keine Seite entsteht eine Verpflichtung." },
        { title: "Schriftliche Vereinbarung", body: "Passt es, vereinbaren wir Provision, Laufzeit, Zuordnung und Auszahlung schriftlich." },
        { title: "Empfehlen", body: "Sie bewerben AutoSEO Cloud mit der vereinbarten Zuordnungsmethode und halten sich an die Programmbedingungen." },
      ],
    },
    {
      kind: "checklist",
      id: "rules",
      eyebrow: "Regeln",
      title: "Die Regeln in Kürze",
      items: [
        "Die Empfehlungsbeziehung überall dort klar offenlegen, wo Sie AutoSEO empfehlen",
        "Nur zutreffende Aussagen – keine versprochenen Rankings, KI-Erwähnungen oder Ergebnisse",
        "Kein Bieten auf AutoSEO-Markenbegriffe und keine AutoSEO-Marken in Anzeigen",
        "Kein Cookie Stuffing, kein Spam, keine erfundenen Gutscheine und keine Eigenempfehlungen",
        "Namen und Logo von AutoSEO nur so verwenden, wie im Pressebereich beschrieben",
      ],
      aside: [
        { type: "h3", text: "Verbindliche Bedingungen" },
        {
          type: "p",
          text: "Die [Bedingungen des Empfehlungsprogramms](/de/affiliate-terms) gelten für alle Partner. Weicht Ihre individuelle schriftliche Vereinbarung davon ab, hat die individuelle Vereinbarung Vorrang.",
        },
      ],
    },
    {
      kind: "faq",
      id: "faq",
      title: "Fragen zum Empfehlungsprogramm",
      items: [
        {
          q: "Wie hoch ist meine Provision?",
          a: "Provisionssätze und Auszahlungsbedingungen veröffentlichen wir nicht. Sie werden mit jedem aufgenommenen Partner individuell vereinbart und in einer schriftlichen Vereinbarung festgehalten, bevor Sie AutoSEO Cloud bewerben.",
        },
        {
          q: "Wer kann sich bewerben?",
          a: "Alle mit einem passenden Publikum in SEO, KI-Suche oder Marketing: Creator, Beraterinnen und Berater sowie Betreiber von Communities. Wir nehmen Partner auf, deren Publikum und Vorgehen zu AutoSEO passen; eine Bewerbung garantiert keine Aufnahme.",
        },
        {
          q: "Kann ich die kostenlose Self-Hosting-Version empfehlen?",
          a: "Sehr gern, verdienen lässt sich daran aber nichts. Die Self-Hosting-Version ist unter der MIT-Lizenz kostenlos, daher umfasst das Empfehlungsprogramm nur kostenpflichtige Abonnements von AutoSEO Cloud.",
        },
        {
          q: "Worin unterscheidet es sich vom Partnerprogramm?",
          a: "Das Empfehlungsprogramm richtet sich an alle, die AutoSEO Cloud ihrem Publikum empfehlen. Das Partnerprogramm richtet sich an Agenturen und Freelancer, die AutoSEO für ihre eigenen Kunden bereitstellen; es bietet Unterstützung und frühen Zugang, aber keine Provisionen.",
        },
        {
          q: "Muss ich offenlegen, dass ich eine Provision erhalte?",
          a: "Ja. Kennzeichnen Sie jede Empfehlung, mit der Sie Geld verdienen können, deutlich als Werbung, wie es Werbe- und Verbraucherschutzrecht verlangt – etwa das Gesetz gegen den unlauteren Wettbewerb (UWG) in Deutschland und die Endorsement Guides der FTC in den USA. Die Programmbedingungen erläutern die Einzelheiten.",
        },
        {
          q: "Darf ich bei Google Ads auf die Marke AutoSEO bieten?",
          a: "Nein. Das Bieten auf AutoSEO-Markenbegriffe und die Verwendung von AutoSEO-Marken in Anzeigen sind nicht erlaubt, es sei denn, Ihre individuelle schriftliche Vereinbarung gestattet es ausdrücklich.",
        },
        {
          q: "Darf ich meinem Publikum einen Rabattcode anbieten?",
          a: "Nur einen Code, den wir Ihnen ausgestellt haben. Codes zu veröffentlichen, die Sie nicht erhalten haben, oder Seiten, die Rabatte nur vortäuschen, ist untersagt.",
        },
      ],
    },
    {
      kind: "cta",
      id: "start",
      title: "Bewerben Sie sich für das Empfehlungsprogramm",
      body: "Erzählen Sie uns von Ihrem Publikum und Ihren Kanälen – wir melden uns bei Ihnen.",
      primary: { label: "Per E-Mail bewerben", href: apply },
      secondary: { label: "Bedingungen lesen", href: "/de/affiliate-terms" },
    },
  ],
};

export default page;
