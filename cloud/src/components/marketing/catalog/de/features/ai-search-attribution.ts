import type { FeaturePage } from "../../types";

export default {
  slug: "ai-search-attribution",
  nav: "Attribution für KI-Suche",
  summary: "Ordnen Sie Leads, Bestellungen und Umsatz der KI-Suche zu – mit einer kurzen Umfrage.",
  meta: {
    title: "Attribution für KI-Suche: Umsatz aus ChatGPT",
    description:
      "Attribution für KI-Suche: Fragen Sie „Wie sind Sie auf uns aufmerksam geworden?“, verknüpfen Sie Antworten mit Deals und sehen Sie den Umsatz aus ChatGPT & Co.",
  },
  hero: {
    eyebrow: "Attribution für KI-Suche",
    title: "Belegen Sie den Umsatz aus der KI-Suche.",
    muted: "Antwort für Antwort, Deal für Deal.",
    subtitle:
      "Der meiste KI-Einfluss hinterlässt keinen Klick. AutoSEO fragt Käufer bei Anmeldung oder Kauf „Wie sind Sie auf uns aufmerksam geworden?“, verknüpft jede Antwort mit der zugehörigen Bestellung oder dem Deal und zeigt die KI-Suche neben allen anderen Kanälen – in Umsatz.",
  },
  visual: "traffic",
  screenshot: {
    src: "/screenshots/attribution.png",
    alt: "AutoSEO-Attributionsübersicht: KI-Suche im Vergleich zu anderen Kanälen mit Deal-Wert, Umsatz aus KI-Traffic und Leads aus der KI-Suche je Engine",
    url: "attribution",
  },
  stats: [
    { value: 7, label: "Setup-Schritte", note: "Geführt, mit Live-Prüfung" },
    { value: 23, label: "Integrationen", note: "Shops, Formulare, CRMs, Umfragen" },
    { value: 90, suffix: " Tage", label: "Zuordnungsfenster", note: "Zwischen Antwort und Conversion" },
    { value: 0, prefix: "$", label: "Self-Hosting", note: "MIT-Lizenz, alle Funktionen" },
  ],
  why: {
    eyebrow: "Warum das wichtig ist",
    title: "Die KI-Suche prägt Kaufentscheidungen,",
    muted: "lange bevor Analytics etwas merkt.",
    body: "Jemand bittet ChatGPT um eine Empfehlung, merkt sich Ihren Namen und kommt Tage später über Google oder die direkte Eingabe Ihrer URL zurück. Klickbasierte Analytics schreibt das der Suche oder dem Direktzugriff zu. Die richtige Antwort kennt nur, wer kauft – also fragt AutoSEO direkt nach.",
    points: [
      {
        title: "Klicks erfassen den Einfluss kaum",
        body: "Antworten nennen Marken oft ohne Link, oder der Besuch folgt später auf einem anderen Gerät. Selbstauskünfte erfassen, was Analytics nicht sieht.",
      },
      {
        title: "Budgets folgen dem Umsatz",
        body: "Eine Umsatzzahl je Kanal lässt sich im Budgetgespräch leichter vertreten als ein Visibility-Score. Attribution verbindet beides.",
      },
      {
        title: "Wissen, welcher Assistent zählt",
        body: "Eine Folgefrage erfasst das genutzte KI-Tool. So sehen Sie, ob ChatGPT, Perplexity, Claude oder Gemini hinter Ihren Deals steht.",
      },
    ],
  },
  capabilities: {
    eyebrow: "Was Sie bekommen",
    title: "Von der Umfrageantwort zum zugeordneten Umsatz –",
    muted: "ohne Datenteam.",
    items: [
      {
        icon: "message-square",
        title: "Eine Umfrage, die zu Ihrer Website passt",
        body: "Ein kurzes Pop-up nach dem Absenden eines Formulars oder nach dem Kauf, auf Deutsch oder Englisch und in Ihren Farben. Fragen Ihre Formulare schon danach, wird die Antwort ohne Pop-up erfasst.",
      },
      {
        icon: "sparkles",
        title: "KI-Suche als eigener Kanal",
        body: "Antworten landen in KI-Suche, Google/Bing, Social Media, Online-Werbung, Empfehlung, Content oder Sonstiges – mit Folgefrage nach ChatGPT, Perplexity, Claude, Gemini, Copilot und mehr.",
      },
      {
        icon: "euro",
        title: "Bestellungen und Deals verknüpft",
        body: "Conversions aus dem Snippet, Stripe, Shopify, WooCommerce, Shopware oder Ihrem CRM werden über Bestell-ID, E-Mail-Hash oder Browser den Antworten zugeordnet.",
      },
      {
        icon: "plug",
        title: "23 Integrationen",
        body: "Typeform, Tally, Jotform, HubSpot, Salesforce, Pipedrive, Calendly, Fairing, SurveyMonkey, Zapier, n8n und ein eigener Webhook mit Feld-Mapping.",
      },
      {
        icon: "chart",
        title: "Umsatz nach Kanal",
        body: "Antworten pro Tag, der KI-Suche zugeordneter Deal-Wert, Leads aus der KI-Suche je Engine und – mit verbundenem GA4 – Umsatz aus KI-vermittelten Sitzungen.",
      },
      {
        icon: "lock",
        title: "Datenschutz eingebaut",
        body: "E-Mail-Adressen werden nur als Hash mit maskierter Vorschau gespeichert, die Umfrage fragt jeden Besucher einmal und ohne Cookies, und Sie können sie auf Ihre eigenen Domains beschränken.",
      },
    ],
  },
  steps: {
    eyebrow: "So funktioniert es",
    title: "Attribution in sieben geführten Schritten,",
    muted: "live geprüft.",
    items: [
      {
        title: "Im Setup festlegen, was Sie messen",
        body: "Wählen Sie Leads, Käufe oder beides, Ihre Plattform – Shopify, WooCommerce, WordPress, Webflow, Framer, Wix und weitere – und ob Ihre Formulare die Frage schon stellen.",
      },
      {
        title: "Snippet einbauen oder Tool verbinden",
        body: "Fügen Sie ein Script-Tag mit Anleitung für Ihre Plattform ein – oder senden Sie Antworten aus Ihrem Formular-, Umfrage- oder CRM-Tool per Webhook, API-Import oder CSV.",
      },
      {
        title: "Conversion-Quelle hinzufügen",
        body: "Stripe, Shopify, WooCommerce, Shopware, ein CRM-Webhook oder das Snippet selbst, das Kauf- und Lead-Events von Google Analytics, Google Ads und Meta Pixel erfasst.",
      },
      {
        title: "Prüfen und auswerten",
        body: "Der letzte Schritt bestätigt Snippet, erste Antwort und erste Conversion live. Ab dann erscheint die KI-Suche als Umsatzlinie neben allen anderen Kanälen.",
      },
    ],
  },
  faq: [
    {
      q: "Was ist Attribution für die KI-Suche?",
      a: "Attribution für die KI-Suche misst, wie viele Leads, Bestellungen und wie viel Umsatz von Menschen stammen, die Sie über KI-Assistenten wie ChatGPT oder Perplexity entdeckt haben. Weil dieser Einfluss meist keinen messbaren Klick hinterlässt, kombiniert AutoSEO die Selbstauskunft „Wie sind Sie auf uns aufmerksam geworden?“ mit der zugehörigen Conversion.",
    },
    {
      q: "Wie messe ich Leads aus ChatGPT?",
      a: "Fragen Sie neue Leads, wie sie auf Sie gekommen sind, und bieten Sie KI-Suche als Antwort an – mit einer Folgefrage nach dem genutzten Tool. Das Snippet von AutoSEO stellt die Frage nach dem Absenden eines Formulars oder liest die Antwort aus einem vorhandenen Formularfeld und verknüpft sie mit dem Lead oder Deal in Ihrem CRM.",
    },
    {
      q: "Reicht dafür nicht Google Analytics?",
      a: "Analytics sieht nur Besuche, die aus einem Klick in einer KI-Antwort entstehen. Wer eine Empfehlung liest und später nach Ihrem Markennamen sucht oder die URL eintippt, erscheint als Suche oder Direktzugriff. Nutzen Sie beides: die KI-Traffic-Analyse für die Klicks, die Attribution für den Rest.",
    },
    {
      q: "Wie werden Umfrageantworten Bestellungen zugeordnet?",
      a: "AutoSEO ordnet zuerst über die Bestell- oder Transaktions-ID zu, dann über einen Hash der E-Mail-Adresse, dann über denselben Browser. Eine neue Conversion sucht 90 Tage rückwirkend nach einer offenen Antwort und akzeptiert Antworten aus Post-Purchase-Umfragen bis zu 48 Stunden danach. Verlängerungen werden nie zugeordnet, damit kein Deal doppelt zählt.",
    },
    {
      q: "Welche Tools kann ich verbinden?",
      a: "Shops und Zahlungen: Shopify, WooCommerce, Shopware, Stripe. Formulare: Typeform, Tally, Jotform, Gravity Forms, Formstack. CRMs und mehr: HubSpot, Salesforce, Pipedrive, Attio, Close, Calendly, Intercom. Umfrage-Tools wie Fairing, KnoCommerce, Zigpoll und SurveyMonkey werden per API importiert, alles Weitere läuft über Zapier, Make, n8n oder einen eigenen Webhook.",
    },
    {
      q: "Setzt das Attributions-Snippet Cookies?",
      a: "Nein. Das Snippet merkt sich im Local Storage des Browsers, dass ein Besucher bereits geantwortet hat. E-Mail-Adressen werden mit SHA-256 gehasht – wenn möglich schon im Browser –, bevor sie AutoSEO erreichen. Gespeichert werden nur der Hash und eine maskierte Vorschau.",
    },
    {
      q: "Ist die Attribution für KI-Suche kostenlos?",
      a: "Die Attribution ist Teil der Open-Source-App AutoSEO und beim Self-Hosting mit allen Funktionen kostenlos. AutoSEO Cloud bietet Ihnen einen verwalteten Workspace, gehostet in Deutschland, für 50\u00a0$ pro Monat, KI- und Datennutzung im Wert von 10\u00a0$ inklusive. Gebühren pro Antwort oder Integration gibt es nicht.",
    },
  ],
  related: ["ai-traffic-analytics", "ai-visibility-tracking", "report-builder", "ai-bot-traffic"],
  cta: {
    title: "Finden Sie heraus, wie viel Umsatz die KI-Suche wirklich bringt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies FeaturePage;
