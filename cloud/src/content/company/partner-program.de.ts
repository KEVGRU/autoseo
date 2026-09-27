import type { SitePage } from "@/components/site/types";
import { site } from "@/lib/site";

const apply = `mailto:${site.contactEmail}?subject=Partnerprogramm`;
const { projects } = site.cloudPlan;
const price = `${site.priceMonthlyUsd} $`;

const page: SitePage = {
  path: "/partner-program",
  crumb: "Partnerprogramm",
  meta: {
    title: "AutoSEO-Partnerprogramm für Agenturen und Freelancer",
    description:
      "GEO-Leistungen mit Open-Source-AutoSEO anbieten: für Kunden hosten dank MIT-Lizenz, Kunden als Projekte verwalten, White-Label-Reports versenden.",
  },
  hero: {
    eyebrow: "Partnerprogramm",
    title: "Ihr GEO-Angebot auf Basis von Open-Source-AutoSEO",
    subtitle:
      "Die MIT-Lizenz erlaubt Ihnen, AutoSEO ohne Lizenzgebühren für Ihre Kunden zu hosten. Das Partnerprogramm ergänzt, was Open Source allein nicht bietet: einen direkten Draht zu den Entwicklern, frühen Zugang zu neuen Funktionen und auf Wunsch einen Eintrag als Partner.",
    ctas: [
      { label: "Partner werden", href: apply },
      { label: "Zum Agentur-Pitch-Playbook", href: "/de/case-studies/agency-pitch-in-14-days" },
    ],
  },
  sections: [
    {
      kind: "cards",
      id: "delivery",
      eyebrow: "Betriebsmodelle",
      title: "Drei Wege, AutoSEO für Kunden bereitzustellen",
      subtitle: "In jedem Modell dieselbe Software. Entscheiden Sie danach, wer die Server betreibt und wo Kundendaten liegen müssen.",
      columns: 3,
      cards: [
        {
          icon: "server",
          title: "Ihre eigene Instanz",
          badge: "Kostenlos · MIT",
          body: "Hosten Sie ein AutoSEO für alle Ihre Kunden selbst. Unter Admin → Branding vergeben Sie Namen, Logo und Farben und betreiben die Instanz unter Ihrer eigenen Domain.",
        },
        {
          icon: "globe",
          title: "AutoSEO Cloud",
          badge: `${price}/Monat`,
          body: `Ein verwalteter Workspace, gehostet in Deutschland, mit bis zu ${projects} Kundenprojekten, unbegrenzt vielen Nutzern und inklusiver Nutzung. Keine Server, um die Sie sich kümmern müssen.`,
        },
        {
          icon: "building",
          title: "Die Infrastruktur Ihres Kunden",
          body: "Installieren Sie AutoSEO auf den Servern Ihres Kunden und betreiben Sie es dort für ihn – wenn die Daten beim Kunden bleiben müssen.",
        },
      ],
    },
    {
      kind: "cards",
      id: "client-work",
      eyebrow: "Gebaut für Kundenarbeit",
      title: "Was Agenturen täglich nutzen",
      columns: 3,
      cards: [
        {
          icon: "layers",
          title: "Ein Projekt pro Kunde",
          body: "Jeder Kunde ist ein Projekt mit eigenen Prompts, Wettbewerbern, Markt und Integrationen. Die Portfolio-Übersicht zeigt Sichtbarkeit, Share of Voice, durchschnittliche Position, Sentiment, Zitate, offene Aufgaben mit hohem Impact und KI-Umsatz aller Projekte in einer Tabelle.",
        },
        {
          icon: "users",
          title: "Zugang für Kunden",
          body: "Laden Sie Kunden mit der Rolle „Client“ ein, die nur Lesezugriff hat: Sie sehen ihr eigenes Projekt und sonst nichts.",
        },
        {
          icon: "target",
          title: "Pitch-Projekte",
          body: "Tracken Sie Interessenten in einem Pitch-Projekt, das sich nach 7 bis 90 Tagen selbst archiviert, wenn Sie den Auftrag nicht gewinnen.",
        },
        {
          icon: "presentation",
          title: "White-Label-Reports",
          body: "Vorlagen wie Pitch, Monthly Report und Competitor Benchmark, Ihr Brand Kit, Export als PPTX und PDF sowie passwortgeschützte Freigabelinks.",
        },
        {
          icon: "code",
          title: "API und MCP",
          body: "Automatisieren Sie Reportings über die REST API und lassen Sie die KI-Assistenten Ihres Teams über den MCP-Server mit Kundendaten arbeiten – siehe die Anleitungen für [Claude](/de/blog/claude-connector) und [ChatGPT](/de/blog/chatgpt-plugin).",
        },
        {
          icon: "gauge",
          title: "Kostenkontrolle",
          body: "Tages- und Monatslimits für Ausgaben sowie ein Kostenrechner mit optionalem Agenturaufschlag, um Kundenarbeit zu kalkulieren (Self-Hosting).",
        },
      ],
    },
    {
      kind: "cards",
      id: "benefits",
      eyebrow: "Was Partner erhalten",
      title: "Konkret – und ohne Provisionen",
      subtitle: "Das Partnerprogramm zahlt keine Provisionen. Wenn Sie mit Empfehlungen verdienen möchten, sehen Sie sich das [Empfehlungsprogramm](/de/affiliate-program) an.",
      columns: 3,
      cards: [
        {
          icon: "star",
          title: "Eintrag auf Wunsch",
          body: "Auf Wunsch führen wir Ihre Agentur auf dieser Seite als AutoSEO-Partner mit Link auf. Nur mit Ihrer Zustimmung – und jederzeit auf Ihre Bitte hin wieder entfernt.",
        },
        {
          icon: "rocket",
          title: "Früher Zugang",
          body: "Zugang zu neuen Funktionen schon in der Beta-Phase, bevor wir sie ankündigen – und Mitsprache dabei, was wir als Nächstes bauen.",
        },
        {
          icon: "message",
          title: "Direkter Draht",
          body: "Eine direkte E-Mail-Verbindung zu den Entwicklern von AutoSEO für Fehler und Fragen, die Ihre Kundenarbeit blockieren – zusätzlich zu den öffentlichen GitHub-Issues.",
        },
      ],
    },
    {
      kind: "steps",
      id: "join",
      eyebrow: "So werden Sie Partner",
      title: "In vier Schritten zur Partnerschaft",
      steps: [
        { title: "AutoSEO ausprobieren", body: "Hosten Sie es selbst oder starten Sie einen AutoSEO-Cloud-Workspace und setzen Sie es für ein oder zwei Kunden ein." },
        {
          title: "Schreiben Sie uns",
          body: `Senden Sie eine E-Mail an [${site.contactEmail}](${apply}) mit dem Betreff „Partnerprogramm“: Ihre Agentur, die Branchen Ihrer Kunden und wie Sie AutoSEO bereitstellen möchten.`,
        },
        { title: "Kurzes Gespräch", body: "Wir sprechen über Ihr Setup, darüber, was Sie von uns brauchen, und was wir Ihnen bieten können." },
        { title: "Loslegen", body: "Sie erhalten den direkten Draht und frühen Zugang; der Eintrag als Partner folgt, wenn Sie ihn wünschen." },
      ],
    },
    {
      kind: "checklist",
      id: "expectations",
      eyebrow: "Fair Play",
      title: "Was wir von Partnern erwarten",
      items: [
        "AutoSEO zutreffend beschreiben – keine versprochenen Rankings oder garantierten Erwähnungen in KI-Antworten",
        "Den Hinweis auf die MIT-Lizenz in jeder Kopie von AutoSEO beibehalten, die Sie weitergeben",
        "Nicht als Codext GmbH auftreten und keine exklusive Partnerschaft suggerieren",
        "Sicherheitslücken vertraulich melden, niemals öffentlich",
      ],
      aside: [
        { type: "h3", text: "Eigenes Branding und die Lizenz" },
        {
          type: "p",
          text: "Die MIT-Lizenz erlaubt Ihnen, AutoSEO zu nutzen, zu verändern und für Kunden zu hosten – auch unter eigenem Namen über Admin → Branding. Rechte am Namen oder Logo von AutoSEO gewährt sie nicht: Verwenden Sie beides nur, um die Software zutreffend zu beschreiben.",
        },
      ],
    },
    {
      kind: "faq",
      id: "faq",
      title: "Fragen von Agenturen",
      items: [
        {
          q: "Brauche ich eine Erlaubnis, um AutoSEO für Kunden zu hosten?",
          a: "Nein. Die MIT-Lizenz erlaubt kommerzielle Nutzung, Änderungen und den Betrieb für Dritte. Das Partnerprogramm ist freiwillig und ergänzt eine direkte Beziehung zu uns.",
        },
        {
          q: "Zahlt das Partnerprogramm Provisionen?",
          a: "Nein. Beim Partnerprogramm geht es um Unterstützung, frühen Zugang und Sichtbarkeit. Wenn Sie Kunden gegen Provision an AutoSEO Cloud vermitteln möchten, bewerben Sie sich für das Empfehlungsprogramm, dessen Konditionen individuell schriftlich vereinbart werden.",
        },
        {
          q: "Kann ich AutoSEO als White-Label anbieten?",
          a: "Ja, auf einer selbst gehosteten Instanz: Legen Sie unter Admin → Branding eigenen App-Namen, Logo und Farben fest, nutzen Sie Ihre eigene Domain und erstellen Sie Reports mit Ihrem Brand Kit. In AutoSEO Cloud tragen die Reports Ihr Brand Kit, die App selbst bleibt AutoSEO.",
        },
        {
          q: "Darf ich meinen Kunden AutoSEO in Rechnung stellen?",
          a: "Ja. Wie Sie Ihre Leistungen bepreisen, entscheiden Sie selbst. Auf einer selbst gehosteten Instanz kann der Kostenrechner einen Agenturaufschlag auf die Anbieterkosten berücksichtigen, damit Sie Kundenarbeit kalkulieren können.",
        },
        {
          q: "Wie viele Kunden kann ich verwalten?",
          a: `Selbst gehostetes AutoSEO hat keine Begrenzung bei Projekten oder Nutzern. Ein AutoSEO-Cloud-Workspace umfasst bis zu ${projects} Projekte; für mehr nutzen Sie weitere Workspaces oder hosten selbst.`,
        },
        {
          q: "Können sich meine Kunden selbst anmelden?",
          a: "Ja, mit der Rolle „Client“: Lesezugriff auf die Projekte, die Sie zuweisen – ohne andere Kunden oder Einstellungen zu sehen.",
        },
        {
          q: "Gibt es eine Partnerzertifizierung oder ein Partnersiegel?",
          a: "Nein. Wir betreiben kein Zertifizierungsprogramm, und Partner dürfen sich nicht als von der Codext GmbH zertifiziert bezeichnen.",
        },
      ],
    },
    {
      kind: "cta",
      id: "start",
      title: "Lassen Sie uns zusammenarbeiten",
      body: "Erzählen Sie uns von Ihrer Agentur und Ihren Kunden – den Rest besprechen wir gemeinsam.",
      primary: { label: "Partner werden", href: apply },
      secondary: { label: "Empfehlungsprogramm", href: "/de/affiliate-program" },
    },
  ],
};

export default page;
