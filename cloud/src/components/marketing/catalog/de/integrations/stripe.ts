import type { IntegrationPage } from "../../types";

export default {
  slug: "stripe",
  name: "Stripe",
  nav: "Stripe",
  summary: "Stripe-Checkouts, Trials und Abos per signiertem Webhook der KI-Suche zuordnen.",
  meta: {
    title: "Stripe-Umsatz der KI-Suche zuordnen",
    description:
      "Ordnen Sie Stripe-Umsätze ChatGPT, Perplexity und anderen KI-Assistenten zu: Ein signierter Webhook sendet Checkouts, Trials und Verlängerungen an AutoSEO.",
  },
  hero: {
    subtitle:
      "Richten Sie einen Stripe-Webhook auf AutoSEO ein, und jede bezahlte Checkout Session und jede Abo-Rechnung wird zur Conversion – geprüft mit Ihrem Signing Secret und der Antwort des Kunden auf „Wie sind Sie auf uns aufmerksam geworden?“ zugeordnet.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Stripe-Integration",
    items: [
      "Signierter Webhook: Jedes Event wird mit dem Signing Secret Ihres Endpoints geprüft",
      "checkout.session.completed, checkout.session.async_payment_succeeded und invoice.paid",
      "Checkouts mit 0\u00a0$ als Trials, wiederkehrende Rechnungen als Verlängerungen",
      "Betrag, Währung und Kunden-E-Mail jeder Zahlung – auch in Währungen ohne Nachkommastellen",
      "Abos über die Subscription-ID verknüpft, damit Checkout und erste Rechnung einmal zählen",
      "Zahlungen werden Antworten per Bestell-ID oder E-Mail-Hash zugeordnet, bis zu 90 Tage rückwirkend",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Stripe und AutoSEO",
    items: [
      {
        icon: "euro",
        title: "Bezahlten Umsatz aus der KI-Suche messen",
        body: "Sehen Sie, wie viel Umsatz Kunden bringen, die Sie über ChatGPT, Perplexity oder Claude gefunden haben – neben Suche, Social, Werbung, Empfehlungen und Content.",
      },
      {
        icon: "zap",
        title: "Trials getrennt von Käufen",
        body: "Ein Checkout mit 0\u00a0$ zählt als Trial, damit kostenlose Anmeldungen aus der KI-Suche Ihre Umsatzzahlen nicht aufblähen.",
      },
      {
        icon: "refresh",
        title: "Verlängerungen ohne Doppelzählung",
        body: "Wiederkehrende Rechnungen werden als Verlängerungen gespeichert und nie erneut einer Antwort zugeordnet – der ursprüngliche Deal zählt einmal.",
      },
      {
        icon: "users",
        title: "Anmeldungen mit Zahlungen verbinden",
        body: "Das AutoSEO-Snippet fragt nach der Anmeldung und hasht die E-Mail aus Ihrem Formular im Browser. Die Checkout-E-Mail von Stripe wird der Antwort dann per Hash zugeordnet.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Stripe in fünf Schritten verbinden –",
    muted: "per signiertem Webhook.",
    items: [
      {
        title: "Webhook-URL erzeugen",
        body: "Öffnen Sie in Ihrem Projekt Attribution → Integrations → Stripe und klicken Sie auf Connect. Kopieren Sie die Webhook-URL – sie wird nur einmal angezeigt.",
      },
      {
        title: "Endpoint in Stripe anlegen",
        body: "Öffnen Sie im Stripe-Dashboard Developers → Webhooks → Add endpoint und fügen Sie die URL ein.",
      },
      {
        title: "Drei Events auswählen",
        body: "Wählen Sie checkout.session.completed, checkout.session.async_payment_succeeded und invoice.paid.",
      },
      {
        title: "Signing Secret hinterlegen",
        body: "Lassen Sie sich das Signing Secret des Endpoints (whsec_…) in Stripe anzeigen und fügen Sie es in AutoSEO ein. Events ohne gültige Signatur werden abgelehnt.",
      },
      {
        title: "Test-Event senden",
        body: "Senden Sie in Stripe ein Test-Event und prüfen Sie die Zustellung unter Webhook Logs.",
      },
    ],
  },
  faq: [
    {
      q: "Wie tracke ich Stripe-Umsatz aus ChatGPT?",
      a: "Verbinden Sie Stripe per Webhook für Checkout- und Rechnungs-Events und binden Sie das AutoSEO-Snippet auf Ihrer Website ein, damit Kunden „Wie sind Sie auf uns aufmerksam geworden?“ beantworten können. AutoSEO ordnet jede Zahlung per Bestell-ID oder E-Mail-Hash der Antwort zu und weist Umsatz aus ChatGPT und anderen Assistenten als KI-Suche aus.",
    },
    {
      q: "Welche Stripe-Events nutzt AutoSEO?",
      a: "checkout.session.completed, checkout.session.async_payment_succeeded und invoice.paid. Rechnungen zählen nur, wenn sie ein Abo starten oder verlängern; andere Events werden bestätigt und ignoriert.",
    },
    {
      q: "Wie werden Trials und Verlängerungen gezählt?",
      a: "Checkouts mit einem Gesamtbetrag von 0\u00a0$ werden als Trials gespeichert. Rechnungen mit dem Billing Reason subscription_cycle gelten als Verlängerungen und werden nie einer Antwort zugeordnet – der ursprüngliche Deal zählt also nicht jeden Monat erneut.",
    },
    {
      q: "Funktioniert es mit Payment Links und verzögerten Zahlungsarten?",
      a: "Payment Links laufen über Stripe Checkout, ihre Sessions kommen also wie jeder andere Checkout an. Bei verzögerten Zahlungsarten ignoriert AutoSEO die noch unbezahlte Session und zählt die Zahlung, sobald checkout.session.async_payment_succeeded eintrifft.",
    },
    {
      q: "Wie ordne ich Stripe-Zahlungen Antworten exakt zu?",
      a: "Hinterlegen Sie Ihre eigene Bestell-ID in den Metadaten der Checkout Session als order_id oder transaction_id und übergeben Sie dieselbe ID an trackConversion() im Snippet. Ohne Bestell-ID ordnet AutoSEO über den E-Mail-Hash des Kunden zu.",
    },
    {
      q: "Wie ist der Stripe-Webhook abgesichert?",
      a: "Jedes Event braucht einen gültigen Stripe-Signature-Header, signiert mit Ihrem Endpoint-Secret und höchstens fünf Minuten alt. Die Webhook-URL enthält zusätzlich ein geheimes Token, das AutoSEO nur als Hash speichert.",
    },
    {
      q: "Ist die Stripe-Integration im Preis enthalten?",
      a: "Ja. Attribution und alle Integrationen sind Teil der Open-Source-App: kostenlos beim Self-Hosting oder in einem AutoSEO-Cloud-Workspace für 50\u00a0$ im Monat enthalten, inklusive 10\u00a0$ KI- und Datennutzung.",
    },
  ],
  cta: {
    title: "Sehen Sie den Umsatz hinter Ihrer AI Visibility",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
