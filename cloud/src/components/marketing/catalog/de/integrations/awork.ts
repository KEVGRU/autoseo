import type { IntegrationPage } from "../../types";

export default {
  slug: "awork",
  name: "awork",
  nav: "awork",
  summary: "AI-Visibility- und SEO-Aufgaben in awork-Projekte übergeben und den Status zurückholen.",
  meta: {
    title: "awork-Integration für SEO- und GEO-Aufgaben",
    description:
      "Übergeben Sie priorisierte SEO- und AI-Visibility-Aufgaben in awork-Projekte – mit Kontext, Prio-Markierung und Fälligkeit, Status stündlich synchronisiert.",
  },
  hero: {
    subtitle:
      "Verbinden Sie awork per API-Key und übergeben Sie die belegbaren Aufgaben von AutoSEO in das Projekt, in dem Sie planen – Aufgaben mit großer Wirkung als Priorität markiert, Status stündlich zurückgemeldet.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der awork-Integration",
    items: [
      "Projektaufgaben im awork-Projekt Ihrer Wahl",
      "Beschreibungen mit Schritten, Akzeptanzkriterien, Belegen und Rücklink",
      "Aufgaben mit einem Impact-Score ab 8 werden als Priorität markiert",
      "Fälligkeitsdaten werden übernommen, die vorgesehene Person steht in der Beschreibung",
      "Stündlicher Status-Sync: Erledigt schließt die Aufgabe; In Arbeit, Review oder Blockiert setzen sie auf in Arbeit",
      "Einzelne Aufgaben, eine Auswahl oder neue Aufgaben je Kategorie automatisch übergeben",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit awork und AutoSEO",
    items: [
      {
        icon: "building",
        title: "SEO-Arbeit in Kundenprojekten planen",
        body: "Agenturen und Inhouse-Teams, die ihre Projekte in awork steuern, bekommen AutoSEO-Aufgaben in denselben Projektplan – neben Budgets und Zeitplänen.",
      },
      {
        icon: "flag",
        title: "Wirkungsvolle Arbeit zuerst sehen",
        body: "Aufgaben mit einem Impact-Score ab 8 kommen mit gesetzter Prio-Markierung in awork an.",
      },
      {
        icon: "refresh",
        title: "Status synchron halten",
        body: "Erledigen Sie eine Aufgabe in awork, und AutoSEO schließt sie innerhalb einer Stunde; laufende Arbeit erscheint als in Arbeit.",
      },
      {
        icon: "workflow",
        title: "Nach Kategorie routen",
        body: "Übergeben Sie neue Aufgaben ausgewählter Kategorien automatisch an awork und behalten Sie den Rest in AutoSEO.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "awork in drei Schritten verbinden –",
    muted: "mit einem API-Key.",
    items: [
      {
        title: "API-Key erstellen",
        body: "Öffnen Sie in awork Einstellungen → Integrationen → API und legen Sie eine Client-Applikation mit API-Key an.",
      },
      {
        title: "In AutoSEO verbinden",
        body: "Öffnen Sie in Ihrem Projekt Optimizations → Tasks, wählen Sie Connect PM Tool → awork, fügen Sie den Key ein und wählen Sie das Projekt für neue Aufgaben.",
      },
      {
        title: "Aufgaben übergeben",
        body: "Übergeben Sie eine Aufgabe aus ihrer Detailansicht, wählen Sie mehrere auf einmal aus oder aktivieren Sie unter Routing die automatische Übergabe je Kategorie.",
      },
    ],
  },
  faq: [
    {
      q: "Wie übergebe ich SEO-Aufgaben an awork?",
      a: "Verbinden Sie awork unter Optimizations → Tasks mit einem API-Key und wählen Sie ein Projekt. Übergeben Sie dann einzelne Aufgaben – oder lassen Sie Routing neue Aufgaben einer Kategorie automatisch übergeben. Jede Aufgabe wird zu einer awork-Projektaufgabe mit Schritten, Belegen, Fälligkeit und Rücklink zu AutoSEO.",
    },
    {
      q: "Welche Aufgaben werden in awork als Priorität markiert?",
      a: "Aufgaben mit einem Impact-Score ab 8 von 10 erhalten die Prio-Markierung von awork. Alle anderen Aufgaben werden ohne sie angelegt.",
    },
    {
      q: "Kann AutoSEO awork-Aufgaben Personen zuweisen?",
      a: "Nicht direkt. Die zuständige Person aus Routing oder AutoSEO steht oben in der Aufgabenbeschreibung, sodass die Projektleitung die Aufgabe in awork zuweisen kann.",
    },
    {
      q: "Wie funktioniert der Status-Sync mit awork?",
      a: "Jede Stunde prüft AutoSEO den Statustyp der verknüpften Aufgaben: Erledigt schließt die Aufgabe, In Arbeit, Review und Blockiert setzen sie auf in Arbeit. Änderungen in AutoSEO werden nicht nach awork zurückgeschrieben.",
    },
    {
      q: "Wo wird mein awork-API-Key gespeichert?",
      a: "Er wird mit AES-256-GCM verschlüsselt in der Datenbank von AutoSEO gespeichert und nie an den Browser zurückgegeben. Er dient ausschließlich für Aufrufe der awork API.",
    },
  ],
  cta: {
    title: "Machen Sie aus AI-Visibility-Erkenntnissen awork-Aufgaben",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
