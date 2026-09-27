import type { IntegrationCategoryPage } from "../../types";

export default {
  slug: "attribution",
  nav: "Attribution-Integrationen",
  summary: "Bestellungen, Leads und Deals der KI-Suche zuordnen – aus Shop, CRM und Formularen.",
  meta: {
    title: "Attribution: Umsatz aus ChatGPT & Co. messen",
    description:
      "Messen Sie den Umsatz aus ChatGPT & Co.: Verbinden Sie Shopify, Stripe, HubSpot, Salesforce, Typeform und weitere Tools und ordnen Sie Verkäufe der KI-Suche zu.",
  },
  hero: {
    eyebrow: "Attribution-Integrationen",
    title: "Umsatz aus ChatGPT & Co. messen.",
    muted: "Für Bestellungen, Leads und Deals.",
    subtitle:
      "Fragen Sie „Wie sind Sie auf uns aufmerksam geworden?“ dort, wo Kunden ohnehin antworten – im Checkout, in Formularen, Umfragen oder im CRM –, und AutoSEO ordnet jede Antwort der Bestellung oder dem Deal dahinter zu. So sehen Sie, welcher Anteil an Kunden und Umsatz von ChatGPT, Perplexity und anderen KI-Assistenten kommt.",
  },
  benefits: {
    eyebrow: "Warum Sie anbinden",
    title: "Antworten treffen auf Umsatz,",
    muted: "automatisch.",
    items: [
      {
        icon: "message-square",
        title: "Fragen, wo Kunden ohnehin antworten",
        body: "Das Snippet nutzt ein vorhandenes Feld „Wie sind Sie auf uns aufmerksam geworden?“ in Ihren Formularen oder zeigt eine kleine Umfrage – optional mit der Folgefrage: welcher KI-Assistent?",
      },
      {
        icon: "euro",
        title: "Bestellungen und Deals zugeordnet",
        body: "Antworten werden über Bestellnummer, gehashte E-Mail oder denselben Browser mit Conversions zusammengeführt, bis zu 90 Tage rückwirkend. Jeder Deal-Wert zählt nur einmal.",
      },
      {
        icon: "plug",
        title: "Pixel, Webhook oder API-Import",
        body: "Shopify nutzt ein Custom Pixel, Stripe und WooCommerce signierte Webhooks, Post-Purchase-Umfragen einen stündlichen API-Import. Alles andere sendet JSON, das Sie einmal zuordnen.",
      },
      {
        icon: "lock",
        title: "Keine E-Mails im Klartext",
        body: "E-Mail-Adressen werden mit SHA-256 gehasht, wenn möglich schon im Browser, und nur als maskierte Vorschau angezeigt. Das Snippet setzt keine Cookies.",
      },
    ],
  },
  faq: [
    {
      q: "Was ist Attribution für die KI-Suche?",
      a: "Attribution für die KI-Suche misst, wie viele Kunden Sie über KI-Assistenten wie ChatGPT oder Perplexity gefunden haben und wie viel Umsatz sie gebracht haben. AutoSEO verbindet Antworten auf „Wie sind Sie auf uns aufmerksam geworden?“ mit den Bestellungen und Deals dahinter. Selbstauskünfte erfassen auch Empfehlungen, die eine klickbasierte Webanalyse übersieht – etwa wenn jemand ChatGPT fragt und später Ihre URL direkt eingibt.",
    },
    {
      q: "Welche Tools kann ich für die Attribution verbinden?",
      a: "Shops und Zahlungen: Shopify, WooCommerce, Shopware und Stripe. Formulare und Umfragen: Typeform, Tally, Jotform, Gravity Forms, Formstack, SurveyMonkey, Fairing, KnoCommerce und Zigpoll. CRM und Vertrieb: HubSpot, Salesforce, Pipedrive, Attio, Close, Intercom und Calendly. Alles andere verbinden Sie über Zapier, Make, n8n oder einen eigenen Webhook.",
    },
    {
      q: "Wie funktioniert die Attribution mit Shopify?",
      a: "Sie legen in Shopify ein Custom Pixel an, das Bestellnummer, Wert, Währung und eine gehashte E-Mail jedes Checkouts an AutoSEO sendet – ohne App-Installation. Das Website-Snippet fragt Besucher, wie sie auf Sie aufmerksam geworden sind, und AutoSEO ordnet die Antwort der Bestellung zu.",
    },
    {
      q: "Muss ich meine Formulare ändern?",
      a: "Nein. Fragt ein Formular bereits auf Deutsch oder Englisch, wie Kunden auf Sie aufmerksam geworden sind, erfasst das Snippet die Antwort beim Absenden. Andernfalls kann es eine kleine Umfrage nach dem Absenden eines Formulars, nach einem Kauf oder beim Laden der Seite zeigen.",
    },
    {
      q: "Wie senden HubSpot und Salesforce Daten an AutoSEO?",
      a: "Über ihre eigene Automatisierung: einen HubSpot-Workflow mit der Aktion „Send a webhook“ für Kontakte oder Deals und einen HTTP-Callout aus einem Salesforce Flow bei Änderungen an Leads oder Opportunities. AutoSEO zeigt die Einrichtungsschritte und eine vorbereitete Feldzuordnung, die Sie anpassen können.",
    },
    {
      q: "Kann ich vorhandene Umfrageantworten importieren?",
      a: "Ja. Antworten aus Fairing, KnoCommerce, Zigpoll und SurveyMonkey werden stündlich über deren APIs importiert, und Sie können deren CSV-Exporte hochladen – die Spalten werden automatisch erkannt.",
    },
    {
      q: "Kann ich Selbstauskünfte mit Google Analytics vergleichen?",
      a: "Ja. Bei verbundenem GA4 zeigt die Attribution-Übersicht zusätzlich den Umsatz aus Sitzungen, die ChatGPT, Perplexity, Claude und andere Assistenten vermittelt haben – neben dem Umsatz, den Kunden selbst der KI-Suche zuschreiben.",
    },
    {
      q: "Ist die Attribution in AutoSEO enthalten?",
      a: "Ja. Snippet, alle Connectoren und die Attribution-Reports sind Teil der Open-Source-App und kostenlos selbst hostbar. AutoSEO Cloud enthält sie in einem verwalteten Workspace für 50\u00a0$ im Monat, inklusive 10\u00a0$ für KI- und Datennutzung.",
    },
  ],
  cta: {
    title: "Finden Sie heraus, was die KI-Suche Ihnen bringt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationCategoryPage;
