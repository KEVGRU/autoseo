import type { IntegrationPage } from "../../types";

export default {
  slug: "pipedrive",
  name: "Pipedrive",
  nav: "Pipedrive",
  summary: "Pipedrive-Deals samt Wert per Deal-Webhook der KI-Suche zuordnen.",
  meta: {
    title: "Pipedrive-Deals der KI-Suche zuordnen",
    description:
      "Ordnen Sie Pipedrive-Deals ChatGPT, Perplexity und anderen KI-Assistenten zu: Ein Deal-Webhook sendet Wert, Währung und Ihr Lead-Quellen-Feld an AutoSEO.",
  },
  hero: {
    subtitle:
      "Legen Sie in Pipedrive einen Webhook für Deals an, und AutoSEO erfasst Wert und Währung jedes Deals zusammen mit der Antwort aus Ihrem Feld „Wie sind Sie auf uns aufmerksam geworden?“ – so sehen Sie, wie viel Pipeline die KI-Suche bringt.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Pipedrive-Integration",
    items: [
      "Ein Pipedrive-Webhook für Deal-Events – added, updated oder beide",
      "Deal-Wert und Währung im Field Mapping vorgeschlagen",
      "Ihr eigenes Lead-Quellen-Feld einmalig unter Field Mapping zugeordnet",
      "Ein Datensatz pro Deal: Updates ersetzen den Wert, statt ihn zu addieren",
      "Antworten wie „ChatGPT“ oder „über Perplexity gefunden“ zählen als KI-Suche – je Assistent",
      "Jede Zustellung unter Webhook Logs",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Pipedrive und AutoSEO",
    items: [
      {
        icon: "euro",
        title: "Pipeline aus der KI-Suche messen",
        body: "Sehen Sie, welchen Deal-Wert die KI-Suche bringt – neben Suche, Social, Werbung, Empfehlungen und Content.",
      },
      {
        icon: "refresh",
        title: "Deal-Werte aktuell halten",
        body: "Abonnieren Sie auch aktualisierte Deals, dann ersetzt ein geänderter Deal-Wert den alten, statt sich aufzusummieren.",
      },
      {
        icon: "sparkles",
        title: "Sehen, welcher Assistent den Lead gebracht hat",
        body: "Nennt Ihre Lead-Quelle ChatGPT, Perplexity, Claude, Gemini oder Copilot, werden Deals je Assistent gezählt.",
      },
      {
        icon: "presentation",
        title: "Pipeline neben Sichtbarkeit berichten",
        body: "Stellen Sie zugeordneten Deal-Wert neben Ihre AI-Visibility-Kennzahlen, wenn Sie an Vertrieb und Geschäftsführung berichten.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Pipedrive in vier Schritten verbinden –",
    muted: "per Deal-Webhook.",
    items: [
      {
        title: "Webhook-URL erzeugen",
        body: "Öffnen Sie in Ihrem Projekt Attribution → Integrations → Pipedrive und klicken Sie auf Connect. Kopieren Sie die Webhook-URL – sie wird nur einmal angezeigt.",
      },
      {
        title: "Webhook in Pipedrive anlegen",
        body: "Öffnen Sie Tools & apps → Webhooks → Create new webhook, wählen Sie das Event-Objekt „deal“ und die Aktion „added“ (oder „updated“) und tragen Sie die URL als Endpoint ein.",
      },
      {
        title: "Test-Deal anlegen",
        body: "Legen Sie einen Deal mit ausgefülltem Lead-Quellen-Feld an. Die Zustellung erscheint unter Webhook Logs.",
      },
      {
        title: "Lead-Quellen-Feld zuordnen",
        body: "Öffnen Sie Field Mapping und wählen Sie Ihr eigenes Lead-Quellen-Feld als Antwort. Zuvor eingegangene Zustellungen werden verarbeitet, sobald Sie speichern.",
      },
    ],
  },
  faq: [
    {
      q: "Wie ordne ich Pipedrive-Deals der KI-Suche zu?",
      a: "Senden Sie Deal-Events aus Pipedrive an Ihre AutoSEO-Webhook-URL und ordnen Sie Ihr Lead-Quellen-Feld einmalig zu. AutoSEO zählt Antworten wie „ChatGPT“ oder „KI-Suche“ als KI-Suche und summiert den Deal-Wert je Kanal.",
    },
    {
      q: "Woher kommt die Antwort auf „Wie sind Sie auf uns aufmerksam geworden?“?",
      a: "Aus einem eigenen Feld am Deal, etwa einem Dropdown für die Lead-Quelle. Pipedrive sendet eigene Felder unter ihren Feld-Keys, deshalb wählen Sie Ihres einmalig unter Field Mapping; jeder spätere Deal mit derselben Struktur wird automatisch gelesen.",
    },
    {
      q: "Soll ich hinzugefügte oder aktualisierte Deals senden?",
      a: "Hinzugefügte Deals erfassen neue Pipeline, aktualisierte halten die Werte aktuell, wenn sich ein Deal ändert. Jeder Deal wird über seine Deal-ID nur einmal gespeichert, daher zählt auch ein Abo auf beide Events nichts doppelt.",
    },
    {
      q: "Kann ich stattdessen Pipedrive Automations nutzen?",
      a: "Ja. Ein Automations-Webhook funktioniert ebenfalls, und da Sie den Body selbst festlegen, können Sie E-Mail und Lead-Quelle der Person mitsenden und einmalig unter Field Mapping zuordnen. Mit E-Mail verknüpft AutoSEO auch Antworten aus Ihrer Website-Umfrage per Hash.",
    },
    {
      q: "Braucht AutoSEO Zugriff auf mein Pipedrive-Konto?",
      a: "Nein. Pipedrive sendet Events an Ihre Webhook-URL, und AutoSEO ruft die Pipedrive-API nie auf. Die URL enthält ein geheimes Token, das AutoSEO nur als Hash speichert; erzeugen Sie sie neu, funktioniert die alte sofort nicht mehr.",
    },
    {
      q: "Ist die Pipedrive-Integration im Preis enthalten?",
      a: "Ja. Attribution und alle Integrationen sind Teil der Open-Source-App: kostenlos beim Self-Hosting oder in einem AutoSEO-Cloud-Workspace für 50\u00a0$ im Monat enthalten, inklusive 10\u00a0$ KI- und Datennutzung.",
    },
  ],
  cta: {
    title: "Sehen Sie, wie viel Pipeline die KI-Suche erzeugt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
