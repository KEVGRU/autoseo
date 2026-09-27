import type { IntegrationPage } from "../../types";

export default {
  slug: "trello",
  name: "Trello",
  nav: "Trello",
  summary: "AI-Visibility- und SEO-Aufgaben als Trello-Karten übergeben und bei Erledigung schließen.",
  meta: {
    title: "Trello-Integration für SEO- und GEO-Aufgaben",
    description:
      "Übergeben Sie priorisierte SEO- und AI-Visibility-Aufgaben als Karten an Trello – mit Schritten, Belegen und Fälligkeit; erledigte Karten schließen die Aufgabe.",
  },
  hero: {
    subtitle:
      "Verbinden Sie Trello per API-Key und Token und machen Sie aus den belegbaren Aufgaben von AutoSEO Karten auf Ihrem Board. Schieben Sie eine Karte auf „Erledigt“, und die Aufgabe wird in AutoSEO geschlossen.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Trello-Integration",
    items: [
      "Karten ganz oben in der Board-Liste Ihrer Wahl",
      "Kartenbeschreibungen mit Schritten, Akzeptanzkriterien, Belegen und Rücklink",
      "Fälligkeitsdaten werden übernommen, Mitglieder per Trello-Benutzername oder vollem Namen zugewiesen",
      "Eine Karte in einer Erledigt-Liste, mit abgehakter Fälligkeit oder archiviert schließt die Aufgabe",
      "Listen namens „In Arbeit“, „Doing“ oder „Review“ setzen die Aufgabe auf in Arbeit",
      "Stündlicher Status-Sync und keine doppelten Karten bei wiederholter Übergabe",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Trello und AutoSEO",
    items: [
      {
        icon: "layers",
        title: "GEO-Arbeit auf Ihr Board bringen",
        body: "AI-Visibility- und SEO-Aufgaben erscheinen als Karten neben der übrigen Arbeit Ihres Teams.",
      },
      {
        icon: "check-circle",
        title: "Aufgaben per Karte schließen",
        body: "Ziehen Sie eine Karte in Ihre Erledigt-Liste, und AutoSEO schließt die Aufgabe innerhalb einer Stunde – ohne zweites Tool.",
      },
      {
        icon: "users",
        title: "Board-Mitglieder zuweisen",
        body: "Legen Sie unter Routing je Kategorie einen Trello-Benutzernamen fest, und AutoSEO fügt dieses Mitglied neuen Karten hinzu.",
      },
      {
        icon: "workflow",
        title: "Nach Kategorie routen",
        body: "Übergeben Sie neue Aufgaben ausgewählter Kategorien automatisch an Trello und behalten Sie den Rest in AutoSEO.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Trello in vier Schritten verbinden –",
    muted: "mit API-Key und Token.",
    items: [
      {
        title: "API-Key holen",
        body: "Öffnen Sie trello.com/power-ups/admin, legen Sie ein Power-Up mit beliebigem Namen an und kopieren Sie dessen API-Key.",
      },
      {
        title: "Token autorisieren",
        body: "Klicken Sie neben dem API-Key auf Token, erlauben Sie den Zugriff auf Ihre Boards und kopieren Sie das Token.",
      },
      {
        title: "In AutoSEO verbinden",
        body: "Öffnen Sie in Ihrem Projekt Optimizations → Tasks, wählen Sie Connect PM Tool → Trello, fügen Sie Key und Token ein und wählen Sie die Liste für neue Karten.",
      },
      {
        title: "Aufgaben übergeben",
        body: "Übergeben Sie eine Aufgabe aus ihrer Detailansicht, wählen Sie mehrere auf einmal aus oder aktivieren Sie unter Routing die automatische Übergabe je Kategorie.",
      },
    ],
  },
  faq: [
    {
      q: "Wie übergebe ich SEO-Aufgaben an Trello?",
      a: "Verbinden Sie Trello unter Optimizations → Tasks mit API-Key und Token und wählen Sie eine Liste. Übergeben Sie dann einzelne Aufgaben – oder lassen Sie Routing neue Aufgaben einer Kategorie automatisch übergeben. Jede Aufgabe wird zu einer Karte mit Schritten, Belegen, Fälligkeit und Rücklink zu AutoSEO.",
    },
    {
      q: "Warum braucht Trello einen API-Key und ein Token?",
      a: "Die REST API von Trello nutzt beides: Der Key gehört zu dem Power-Up, das Sie anlegen, das Token erlaubt den Zugriff auf Ihre Boards. AutoSEO speichert beide mit AES-256-GCM verschlüsselt in seiner Datenbank.",
    },
    {
      q: "Woran erkennt AutoSEO, dass eine Trello-Karte erledigt ist?",
      a: "Eine Karte gilt als erledigt, wenn sie archiviert ist, ihre Fälligkeit abgehakt wurde oder sie in einer Liste namens „Erledigt“, „Fertig“, „Done“ oder ähnlich liegt. Listen wie „In Arbeit“, „Doing“ oder „Review“ setzen die Aufgabe auf in Arbeit. AutoSEO prüft stündlich und schreibt nichts nach Trello zurück.",
    },
    {
      q: "Kann AutoSEO Trello-Karten zuweisen?",
      a: "Ja, per Trello-Benutzername oder vollem Namen, denn Trello gibt keine E-Mails von Mitgliedern heraus. Legen Sie ihn unter Routing je Kategorie fest; passt kein Board-Mitglied, wird der Name in der Kartenbeschreibung ergänzt.",
    },
    {
      q: "Entstehen doppelte Karten, wenn ich eine Aufgabe zweimal übergebe?",
      a: "Nein. Eine Aufgabe, die bereits mit einer Trello-Karte verknüpft ist, wird übersprungen, und Wiederholungen einer fehlgeschlagenen Übergabe erzeugen keine Duplikate.",
    },
  ],
  cta: {
    title: "Machen Sie aus AI-Visibility-Erkenntnissen Trello-Karten",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
