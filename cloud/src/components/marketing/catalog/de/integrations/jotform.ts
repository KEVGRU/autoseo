import type { IntegrationPage } from "../../types";

export default {
  slug: "jotform",
  name: "Jotform",
  nav: "Jotform",
  summary: "Jotform-Einsendungen an AutoSEO senden und Anfragen und Leads der KI-Suche zuordnen.",
  meta: {
    title: "Jotform-Attribution für die KI-Suche",
    description:
      "Jotform per WebHook mit AutoSEO verbinden: Multipart-Einsendungen werden automatisch gelesen, und Leads mit ChatGPT oder Perplexity zählen als KI-Suche.",
  },
  hero: {
    subtitle:
      "Hinterlegen Sie die URL von AutoSEO unter Settings → Integrations → WebHooks. AutoSEO entpackt die Multipart-Einsendungen von Jotform, Sie wählen das Feld „Wie sind Sie auf uns aufmerksam geworden?“ einmal aus – und jeder Lead wird der KI-Suche und Ihren anderen Kanälen zugeordnet.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Jotform-Integration",
    items: [
      "Funktioniert mit der WebHooks-Integration von Jotform – ohne API-Key",
      "Multipart-Einsendungen werden automatisch gelesen, inklusive Raw Request und lesbarer Zusammenfassung",
      "Das Feld für die Herkunftsfrage wählen Sie einmalig unter Field Mapping",
      "Submission-ID, Formular-ID und Formulartitel werden mit jeder Antwort gespeichert",
      "Wiederholte Zustellungen derselben Einsendung aktualisieren die bestehende Antwort",
      "E-Mail-Adressen nur als SHA-256-Hash mit maskierter Vorschau",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Jotform und AutoSEO",
    items: [
      {
        icon: "file-text",
        title: "Angebots- und Kontaktanfragen zuordnen",
        body: "Sehen Sie, welche Anfragen von Menschen stammen, die Sie über ChatGPT, Perplexity oder einen anderen Assistenten gefunden haben.",
      },
      {
        icon: "layers",
        title: "Antworten nach Formular filtern",
        body: "Antworten behalten den Titel des Jotform-Formulars – so filtern Sie die Attributionsübersicht nach Formular.",
      },
      {
        icon: "euro",
        title: "Anfragen mit Umsatz verbinden",
        body: "Senden Sie auch gewonnene Deals aus Ihrem CRM oder Zahlungen aus Stripe – AutoSEO ordnet sie der Jotform-Antwort per E-Mail-Hash zu.",
      },
      {
        icon: "chart",
        title: "KI-Suche neben allen Kanälen sehen",
        body: "Antworten werden KI-Suche, Suche, Social, Werbung, Empfehlung, Content und Sonstiges zugeordnet – deutsche wie englische.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Jotform in vier Schritten verbinden –",
    muted: "per WebHook.",
    items: [
      {
        title: "Webhook-URL erzeugen",
        body: "Öffnen Sie in Ihrem Projekt Attribution → Integrations → Jotform und klicken Sie auf Connect. Kopieren Sie die URL – sie wird nur einmal angezeigt.",
      },
      {
        title: "WebHook in Jotform anlegen",
        body: "Öffnen Sie Ihr Formular → Settings → Integrations → WebHooks und fügen Sie die URL ein.",
      },
      {
        title: "Testeinsendung abschicken",
        body: "Füllen Sie das Formular einmal aus. AutoSEO empfängt die Einsendung und legt eine Zuordnung für diese Formularstruktur an.",
      },
      {
        title: "Antwortfeld wählen",
        body: "Wählen Sie unter Field Mapping Ihr Feld „Wie sind Sie auf uns aufmerksam geworden?“ und speichern Sie. Spätere Einsendungen werden automatisch gelesen, wartende ebenfalls verarbeitet.",
      },
    ],
  },
  faq: [
    {
      q: "Wie ordne ich Jotform-Leads ChatGPT zu?",
      a: "Fügen Sie Ihrem Formular das Feld „Wie sind Sie auf uns aufmerksam geworden?“ hinzu und senden Sie Einsendungen über die WebHooks-Integration von Jotform an AutoSEO. Ist das Feld zugeordnet, zählen Antworten mit ChatGPT oder einem anderen Assistenten als KI-Suche – je Assistent.",
    },
    {
      q: "Jotform sendet Multipart-Formulardaten – ist das ein Problem?",
      a: "Nein. AutoSEO nimmt Multipart- und Form-encoded-Anfragen an, liest das Raw-Request-JSON von Jotform und zerlegt die lesbare Zusammenfassung in Frage-Antwort-Paare. So erscheint jedes Feld unter Field Mapping.",
    },
    {
      q: "Warum wähle ich das Antwortfeld selbst aus?",
      a: "Die Feldschlüssel von Jotform hängen davon ab, wie Sie das Formular gebaut haben. AutoSEO schlägt das Feld vor, wenn seine Beschriftung wie die Herkunftsfrage klingt, und Sie bestätigen es einmal – danach wird jede Einsendung automatisch gelesen.",
    },
    {
      q: "Braucht AutoSEO Zugriff auf mein Jotform-Konto?",
      a: "Nein. Jotform sendet jede Einsendung an die Webhook-URL Ihres Projekts. Die URL enthält ein geheimes Token, das AutoSEO nur als Hash speichert, und Sie können sie jederzeit neu erzeugen.",
    },
    {
      q: "Ist die Jotform-Integration kostenlos?",
      a: "Ja. Die Attribution und alle ihre Integrationen gehören zur Open-Source-App: kostenlos beim Self-Hosting oder enthalten in einem AutoSEO-Cloud-Workspace für 50\u00a0$ pro Monat. Antworten werden mit festen Regeln eingeordnet, nicht mit KI-Guthaben.",
    },
  ],
  cta: {
    title: "Sehen Sie, welche Anfragen die KI-Suche bringt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
