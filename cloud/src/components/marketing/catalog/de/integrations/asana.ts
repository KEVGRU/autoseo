import type { IntegrationPage } from "../../types";

export default {
  slug: "asana",
  name: "Asana",
  nav: "Asana",
  summary: "AI-Visibility- und SEO-Aufgaben an Asana-Projekte übergeben und nach Abschluss schließen.",
  meta: {
    title: "Asana-Integration für SEO- und GEO-Aufgaben",
    description:
      "Übergeben Sie priorisierte SEO- und AI-Visibility-Aufgaben an Asana-Projekte – mit Schritten, Belegen, Fälligkeit und Zuständigen, Abschluss stündlich synchron.",
  },
  hero: {
    subtitle:
      "Verbinden Sie Asana per persönlichem Zugriffstoken und machen Sie aus den belegbaren Aufgaben von AutoSEO Asana-Aufgaben im Projekt, in dem Ihr Team ohnehin plant – in Asana erledigt, in AutoSEO abgeschlossen.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der Asana-Integration",
    items: [
      "Asana-Aufgaben im Projekt Ihrer Wahl, über bis zu 10 Workspaces hinweg",
      "Notizen mit Schritten, Akzeptanzkriterien, Belegen, Ziel-URLs und Rücklink",
      "Fälligkeitsdaten werden übernommen, Zuständige per E-Mail oder Asana-User-ID gesetzt",
      "Unbekannte Zuständige blockieren nie die Übergabe – der Name landet stattdessen in den Notizen",
      "Stündlicher Sync: Eine in Asana erledigte Aufgabe wird in AutoSEO abgeschlossen",
      "Einzelne Aufgaben, eine Auswahl oder neue Aufgaben je Kategorie automatisch übergeben",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit Asana und AutoSEO",
    items: [
      {
        icon: "users",
        title: "GEO-Arbeit mit dem Marketing planen",
        body: "Bringen Sie AI-Visibility- und SEO-Aufgaben in die Asana-Projekte, mit denen Ihr Marketing- und Content-Team bereits arbeitet.",
      },
      {
        icon: "workflow",
        title: "Nach Kategorie routen und zuweisen",
        body: "Übergeben Sie neue Content-Aufgaben automatisch an Asana und legen Sie unter Routing je Kategorie fest, wer sie bekommt.",
      },
      {
        icon: "check-circle",
        title: "Aufgaben an einem Ort schließen",
        body: "Haken Sie eine Aufgabe in Asana ab, und AutoSEO schließt sie innerhalb einer Stunde.",
      },
      {
        icon: "link",
        title: "Die Belege bleiben dabei",
        body: "Jede Aufgabe enthält die Daten dahinter – Impact, Aufwand, Priorität und Belege – und verlinkt zurück zu AutoSEO.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "Asana in drei Schritten verbinden –",
    muted: "mit einem persönlichen Zugriffstoken.",
    items: [
      {
        title: "Persönliches Zugriffstoken erstellen",
        body: "Öffnen Sie in Asana die Entwickler-Konsole unter app.asana.com/0/my-apps und erstellen Sie ein persönliches Zugriffstoken.",
      },
      {
        title: "In AutoSEO verbinden",
        body: "Öffnen Sie in Ihrem Projekt Optimizations → Tasks, wählen Sie Connect PM Tool → Asana, fügen Sie das Token ein und wählen Sie das Projekt für neue Aufgaben.",
      },
      {
        title: "Aufgaben übergeben",
        body: "Übergeben Sie eine Aufgabe aus ihrer Detailansicht, wählen Sie mehrere auf einmal aus oder aktivieren Sie unter Routing die automatische Übergabe je Kategorie.",
      },
    ],
  },
  faq: [
    {
      q: "Wie übergebe ich SEO-Aufgaben an Asana?",
      a: "Verbinden Sie Asana unter Optimizations → Tasks mit einem persönlichen Zugriffstoken und wählen Sie ein Projekt. Übergeben Sie dann einzelne Aufgaben – oder lassen Sie Routing neue Aufgaben einer Kategorie automatisch übergeben. Jede Aufgabe wird zu einer Asana-Aufgabe mit Schritten, Belegen, Fälligkeit und Rücklink zu AutoSEO.",
    },
    {
      q: "Kann AutoSEO Asana-Aufgaben Personen zuweisen?",
      a: "Ja. Legen Sie unter Routing je Kategorie eine zuständige Person fest – per E-Mail-Adresse oder Asana-User-ID – oder weisen Sie die Aufgabe in AutoSEO einer Person zu, die in Asana dieselbe E-Mail nutzt. Lehnt Asana die Zuweisung ab, wird die Aufgabe ohne Zuständigen angelegt und der Name in den Notizen ergänzt.",
    },
    {
      q: "Funktioniert der Status-Sync in beide Richtungen?",
      a: "Der Abschluss fließt von Asana zu AutoSEO. Jede Stunde prüft AutoSEO die verknüpften Aufgaben und schließt die, die in Asana erledigt sind. Änderungen in AutoSEO werden nicht nach Asana zurückgeschrieben.",
    },
    {
      q: "Entstehen Duplikate, wenn ich eine Aufgabe zweimal übergebe?",
      a: "Nein. Eine Aufgabe, die bereits mit einer Asana-Aufgabe verknüpft ist, wird übersprungen, und Wiederholungen einer fehlgeschlagenen Übergabe erzeugen keine Duplikate.",
    },
    {
      q: "Wo wird mein Asana-Token gespeichert?",
      a: "Es wird mit AES-256-GCM verschlüsselt in der Datenbank von AutoSEO gespeichert und nie an den Browser zurückgegeben. Es dient ausschließlich für Aufrufe der Asana API.",
    },
  ],
  cta: {
    title: "Machen Sie aus AI-Visibility-Erkenntnissen Asana-Aufgaben",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
