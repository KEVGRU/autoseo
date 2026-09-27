import type { IntegrationPage } from "../../types";

export default {
  slug: "monday",
  name: "monday.com",
  nav: "monday.com",
  summary: "AI-Visibility- und SEO-Aufgaben als Items mit Zuständigen an monday.com-Boards übergeben.",
  meta: {
    title: "monday.com-Integration für SEO- und GEO-Aufgaben",
    description:
      "Übergeben Sie priorisierte SEO- und AI-Visibility-Aufgaben als Items an monday.com-Boards – mit allen Details und Zuständigen, Status stündlich synchronisiert.",
  },
  hero: {
    subtitle:
      "Verbinden Sie monday.com per API-Token und machen Sie aus den belegbaren Aufgaben von AutoSEO Board-Items – mit den Details in einem Update, der zuständigen Person in Ihrer People-Spalte und Status-Sync aus Ihrer Status-Spalte.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der monday.com-Integration",
    items: [
      "Items auf dem monday.com-Board Ihrer Wahl, benannt nach der Aufgabe",
      "Schritte, Akzeptanzkriterien, Belege und Rücklink als Update am Item",
      "Zuständige Person in Ihrer People-Spalte, zugeordnet per E-Mail",
      "Status-Sync aus der Status-Spalte: „Erledigt“ schließt die Aufgabe, „In Arbeit“ setzt sie auf in Arbeit",
      "Archivierte oder gelöschte Items schließen die Aufgabe in AutoSEO ebenfalls",
      "Einzelne Aufgaben, eine Auswahl oder neue Aufgaben je Kategorie automatisch übergeben",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit monday.com und AutoSEO",
    items: [
      {
        icon: "layers",
        title: "GEO-Arbeit auf Ihren Boards planen",
        body: "AI-Visibility- und SEO-Aufgaben landen auf dem Board, das Ihr Team schon für Kampagnen und Content nutzt.",
      },
      {
        icon: "users",
        title: "Zuständige automatisch setzen",
        body: "Wählen Sie unter Routing je Kategorie eine Person in monday.com, und AutoSEO füllt beim Anlegen die People-Spalte des Boards.",
      },
      {
        icon: "check-circle",
        title: "Status-Labels erledigen den Rest",
        body: "Setzen Sie die Status-Spalte auf „Erledigt“, und die Aufgabe wird in AutoSEO innerhalb einer Stunde geschlossen.",
      },
      {
        icon: "workflow",
        title: "Nach Kategorie routen",
        body: "Übergeben Sie neue Aufgaben ausgewählter Kategorien automatisch an monday.com und behalten Sie den Rest in AutoSEO.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "monday.com in drei Schritten verbinden –",
    muted: "mit Ihrem API-Token.",
    items: [
      {
        title: "API-Token kopieren",
        body: "Klicken Sie in monday.com auf Ihren Avatar → Developers → My access tokens (oder Administration → Connections → API) und kopieren Sie Ihr persönliches API-Token.",
      },
      {
        title: "In AutoSEO verbinden",
        body: "Öffnen Sie in Ihrem Projekt Optimizations → Tasks, wählen Sie Connect PM Tool → monday.com, fügen Sie das Token ein und wählen Sie das Board für neue Items.",
      },
      {
        title: "Aufgaben übergeben",
        body: "Übergeben Sie eine Aufgabe aus ihrer Detailansicht, wählen Sie mehrere auf einmal aus oder aktivieren Sie unter Routing die automatische Übergabe je Kategorie.",
      },
    ],
  },
  faq: [
    {
      q: "Wie übergebe ich SEO-Aufgaben an monday.com?",
      a: "Verbinden Sie monday.com unter Optimizations → Tasks mit Ihrem API-Token und wählen Sie ein Board. Übergeben Sie dann einzelne Aufgaben – oder lassen Sie Routing neue Aufgaben einer Kategorie automatisch übergeben. Jede Aufgabe wird zu einem Item mit den Details in einem Update und einem Rücklink zu AutoSEO.",
    },
    {
      q: "Wo landen die Aufgabendetails in monday.com?",
      a: "Der Item-Name ist der Titel der Aufgabe, die Details – Schritte, Akzeptanzkriterien, Belege und Ziel-URLs – erscheinen als formatiertes Update am Item.",
    },
    {
      q: "Wie liest der Status-Sync mein Board?",
      a: "AutoSEO liest die Status-Spalte des Items: Labels wie „Erledigt“ oder „Done“ schließen die Aufgabe, Labels wie „In Arbeit“ oder „Working on it“ setzen sie auf in Arbeit. Archivierte oder gelöschte Items zählen als erledigt. Geprüft wird stündlich, ohne Rückschreiben.",
    },
    {
      q: "Kann AutoSEO die zuständige Person setzen?",
      a: "Ja. AutoSEO sucht die Person in monday.com per E-Mail und füllt die People-Spalte – bevorzugt eine Spalte namens Owner, Assignee oder Person. Passt niemand, wird der Name stattdessen im Update ergänzt.",
    },
    {
      q: "Wo wird mein monday.com-Token gespeichert?",
      a: "Es wird mit AES-256-GCM verschlüsselt in der Datenbank von AutoSEO gespeichert und nie an den Browser zurückgegeben. Es dient ausschließlich für Aufrufe der monday.com API.",
    },
  ],
  cta: {
    title: "Machen Sie aus AI-Visibility-Erkenntnissen Board-Items",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
