import type { IntegrationCategoryPage } from "../../types";

export default {
  slug: "project-management",
  nav: "Projektmanagement-Integrationen",
  summary: "Belegbare SEO- und GEO-Aufgaben an Jira, Linear, Asana, ClickUp und weitere Tools senden.",
  meta: {
    title: "SEO-Aufgaben an Jira, Linear & Asana senden",
    description:
      "Priorisierte SEO-Aufgaben mit Belegen an Jira, Linear, Asana, ClickUp, Trello, monday.com, Notion oder awork senden – der Status kommt stündlich zurück.",
  },
  hero: {
    eyebrow: "Projektmanagement-Integrationen",
    title: "SEO-Aufgaben direkt in die Tools Ihres Teams.",
    muted: "Der Status kommt zurück.",
    subtitle:
      "AutoSEO macht aus Sichtbarkeitslücken, fehlenden Zitaten, Crawl-Fehlern und Search-Console-Daten priorisierte Aufgaben. Senden Sie sie mit Schritten, Akzeptanzkriterien und Belegen an Jira, Linear, Asana, ClickUp, Trello, monday.com, Notion oder awork – und sehen Sie in AutoSEO, wenn Ihr Team sie erledigt hat.",
  },
  benefits: {
    eyebrow: "Warum Sie anbinden",
    title: "Erkenntnisse, mit denen Ihr Team arbeiten kann,",
    muted: "im gewohnten Tool.",
    items: [
      {
        icon: "list-checks",
        title: "Aufgaben, die sich selbst erklären",
        body: "Jedes Ticket enthält Zusammenfassung, Schritte, Akzeptanzkriterien, Belege, Ziel-URLs und Prompts, dazu Impact, Aufwand und Priorität – und einen Link zurück zu AutoSEO.",
      },
      {
        icon: "refresh",
        title: "Status-Sync jede Stunde",
        body: "Wechselt ein Ticket in Ihrem Tool auf „in Arbeit“ oder „erledigt“, zieht die Aufgabe in AutoSEO nach. Keine doppelte Pflege.",
      },
      {
        icon: "workflow",
        title: "Nach Kategorie routen, automatisch senden",
        body: "Senden Sie zum Beispiel technische Aufgaben an Jira und Content-Aufgaben an Asana und aktivieren Sie Auto-Push, damit neue Aufgaben ohne Klick ankommen.",
      },
      {
        icon: "key",
        title: "Per Token verbunden",
        body: "Jedes Tool verbinden Sie mit seinem eigenen API-Token oder Key, verschlüsselt gespeichert mit AES-256-GCM. Wählen Sie Team, Projekt, Liste, Board oder Datenbank für neue Aufgaben.",
      },
    ],
  },
  faq: [
    {
      q: "Wie sende ich SEO-Aufgaben an Jira?",
      a: "Erstellen Sie unter id.atlassian.com ein API-Token und verbinden Sie Jira Cloud in AutoSEO mit Ihrer Site-URL, der E-Mail Ihres Kontos und dem Token. Wählen Sie dann ein Projekt. Aufgaben werden zu Jira-Issues vom Typ Task mit formatierter Beschreibung, und ihr Status fließt zurück zu AutoSEO.",
    },
    {
      q: "Welche Projektmanagement-Tools unterstützt AutoSEO?",
      a: "Jira Cloud, Linear, Asana, ClickUp, Trello, monday.com, Notion und awork. Für jedes andere Tool sendet ein signierter Webhook Aufgaben-Events an Zapier, n8n, Make oder Ihren eigenen Endpunkt.",
    },
    {
      q: "Was sendet AutoSEO an mein Projektmanagement-Tool?",
      a: "Den Titel der Aufgabe und eine Markdown-Beschreibung mit Zusammenfassung, Schritten, Akzeptanzkriterien, Belegen, Ziel-URLs und Ziel-Prompts, dazu Impact, Aufwand und Priorität. Content-Aufgaben enthalten zusätzlich den Content-Plan. Jedes Ticket verlinkt zurück auf die Aufgabe in AutoSEO.",
    },
    {
      q: "Wird der Aufgabenstatus in beide Richtungen synchronisiert?",
      a: "Der Status fließt aus Ihrem Tool zurück zu AutoSEO: Einmal pro Stunde prüft AutoSEO verknüpfte Tickets und setzt Aufgaben auf „in Arbeit“ oder „erledigt“. AutoSEO bearbeitet Tickets nach dem Anlegen nicht mehr, und ein erneutes Senden erzeugt nie ein Duplikat.",
    },
    {
      q: "Woher kommen die Aufgaben?",
      a: "AutoSEO erzeugt sie aus allen Datensätzen: Lücken bei Visibility und Wettbewerbern, fehlende Zitate, Content-Lücken, Probleme bei Sentiment und Faktencheck, technische und Crawl-Probleme, Search Console und Bot-Traffic. Jede Aufgabe wird nach Impact und Aufwand bewertet und mit den auslösenden Daten belegt.",
    },
    {
      q: "Sind die Projektmanagement-Integrationen kostenlos?",
      a: "Ja. Alle Aufgaben-Integrationen sind Teil der Open-Source-App und kostenlos selbst hostbar. AutoSEO Cloud enthält sie in einem verwalteten Workspace für 50\u00a0$ im Monat, inklusive 10\u00a0$ für KI- und Datennutzung.",
    },
  ],
  cta: {
    title: "Aus AI-Visibility-Daten wird erledigte Arbeit",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationCategoryPage;
