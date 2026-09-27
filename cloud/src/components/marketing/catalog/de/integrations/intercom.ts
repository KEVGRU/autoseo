import type { IntegrationPage } from "../../types";

export default {
  slug: "intercom",
  name: "Intercom",
  nav: "Intercom",
  summary: "Antworten Ihrer Intercom-Kontakte auf „Wie sind Sie auf uns aufmerksam geworden?“ senden.",
  meta: {
    title: "Intercom-Leads der KI-Suche zuordnen",
    description:
      "Ordnen Sie Intercom-Leads und -Nutzer ChatGPT, Perplexity und anderen KI-Assistenten zu: Kontakt-Webhooks senden Ihr Attribut zur Lead-Herkunft an AutoSEO.",
  },
  hero: {
    subtitle:
      "Speichern Sie die Antwort auf „Wie sind Sie auf uns aufmerksam geworden?“ in einem Intercom-Kontaktattribut – gefragt von einer Series oder einem Bot –, und AutoSEO erhält sie mit jedem neuen Lead und jedem geänderten Nutzer und ordnet sie der KI-Suche zu.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Intercom-Integration",
    items: [
      "Intercom-Webhooks für contact.lead.created und contact.user.updated",
      "Ein eigenes Kontaktattribut enthält die Antwort – gefüllt von einer Series, einem Bot oder Ihrem Team",
      "E-Mail, Name und Kontakt-ID vorausgefüllt; das Attribut wählen Sie einmalig unter Field Mapping",
      "Ein Eintrag pro Kontakt: Eine geänderte Antwort ersetzt die alte",
      "Kontakte werden Bestellungen und Deals aus Ihren anderen Quellen per E-Mail-Hash zugeordnet",
      "Jede Benachrichtigung unter Webhook Logs",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Intercom und AutoSEO",
    items: [
      {
        icon: "headset",
        title: "Im Gespräch fragen",
        body: "Lassen Sie einen Bot oder eine Series neue Leads fragen, wie sie Sie gefunden haben, und speichern Sie die Antwort am Kontakt.",
      },
      {
        icon: "users",
        title: "Leads aus der KI-Suche zählen",
        body: "Sehen Sie, wie viele Intercom-Leads über ChatGPT, Perplexity oder einen anderen Assistenten kamen – neben Ihren anderen Kanälen.",
      },
      {
        icon: "euro",
        title: "Antworten mit Umsatz verbinden",
        body: "Senden Sie auch Zahlungen aus Stripe oder Deals aus Ihrem CRM, und AutoSEO verknüpft sie per E-Mail-Hash mit der Intercom-Antwort.",
      },
      {
        icon: "lock",
        title: "Keine E-Mails im Klartext",
        body: "Kontakt-E-Mails werden beim Eingang gehasht und in AutoSEO nur als maskierte Vorschau angezeigt.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Intercom in vier Schritten verbinden –",
    muted: "per Kontakt-Webhooks.",
    items: [
      {
        title: "Attribut anlegen",
        body: "Legen Sie in Intercom ein eigenes Kontaktattribut wie „Wie sind Sie auf uns aufmerksam geworden?“ an und füllen Sie es per Series, Bot oder von Hand.",
      },
      {
        title: "Webhook-URL erzeugen",
        body: "Öffnen Sie in Ihrem Projekt Attribution → Integrations → Intercom und klicken Sie auf Connect. Kopieren Sie die Webhook-URL – sie wird nur einmal angezeigt.",
      },
      {
        title: "Kontakt-Events abonnieren",
        body: "Öffnen Sie im Intercom Developer Hub Ihre App → Webhooks und abonnieren Sie contact.lead.created und contact.user.updated mit Ihrer URL.",
      },
      {
        title: "Testen und Attribut zuordnen",
        body: "Senden Sie eine Testbenachrichtigung, wählen Sie Ihr Attribut aus data.item.custom_attributes unter Field Mapping und speichern Sie.",
      },
    ],
  },
  faq: [
    {
      q: "Wie sehe ich, welche Intercom-Leads aus der KI-Suche kommen?",
      a: "Speichern Sie die Antwort auf „Wie sind Sie auf uns aufmerksam geworden?“ in einem eigenen Kontaktattribut und abonnieren Sie für AutoSEO die Kontakt-Webhooks von Intercom. AutoSEO zählt Antworten, die ChatGPT, Perplexity oder andere Assistenten nennen, als KI-Suche.",
    },
    {
      q: "Sendet Intercom Deal-Werte an AutoSEO?",
      a: "Nein. Die Intercom-Integration erfasst Antworten, keinen Umsatz. Verbinden Sie zusätzlich Stripe, Ihren Shop oder Ihr CRM, und AutoSEO verknüpft deren Bestellungen und Deals per E-Mail-Hash mit der Intercom-Antwort.",
    },
    {
      q: "Brauche ich eine Intercom-App?",
      a: "Ja, eine Entwickler-App im Intercom Developer Hub, weil Intercom Webhooks pro App verwaltet. AutoSEO selbst erhält keinen API-Zugriff auf Ihren Intercom-Workspace.",
    },
    {
      q: "Was passiert, wenn sich die Antwort eines Kontakts ändert?",
      a: "Jeder Kontakt wird über seine Intercom-ID nur einmal gespeichert. Ein späteres Event contact.user.updated ersetzt die Antwort, der Kontakt zählt also nicht doppelt.",
    },
    {
      q: "Wie ist der Intercom-Webhook abgesichert?",
      a: "Die Webhook-URL enthält ein geheimes Token, das AutoSEO nur als Hash speichert. Sie können die URL jederzeit neu erzeugen; die alte funktioniert dann sofort nicht mehr.",
    },
    {
      q: "Ist die Intercom-Integration im Preis enthalten?",
      a: "Ja. Attribution und alle Integrationen sind Teil der Open-Source-App: kostenlos beim Self-Hosting oder in einem AutoSEO-Cloud-Workspace für 50\u00a0$ im Monat enthalten, inklusive 10\u00a0$ KI- und Datennutzung.",
    },
  ],
  cta: {
    title: "Erfahren Sie, wo Ihre Gespräche beginnen",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
