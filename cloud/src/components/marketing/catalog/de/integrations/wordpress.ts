import type { IntegrationPage } from "../../types";

export default {
  slug: "wordpress",
  name: "WordPress",
  nav: "WordPress",
  summary: "Content-Briefings und Entwürfe für die KI-Suche direkt in WordPress veröffentlichen.",
  meta: {
    title: "WordPress-Integration für KI-SEO-Content",
    description:
      "Verbinden Sie WordPress mit AutoSEO und veröffentlichen Sie optimierte Artikel mit JSON-LD und Yoast- oder Rank-Math-Feldern als Entwurf – per REST API.",
  },
  hero: {
    subtitle:
      "Verbinden Sie Ihre WordPress-Website und veröffentlichen Sie die Inhalte, die AutoSEO für die KI-Suche entwirft – mit Titel, Auszug, JSON-LD und SEO-Metafeldern – als Entwurf zur Prüfung oder direkt live.",
  },
  overview: {
    eyebrow: "Überblick",
    title: "Das bekommen Sie",
    muted: "mit der WordPress-Integration",
    items: [
      "Content-Entwürfe mit einem Klick als WordPress-Beiträge veröffentlichen",
      "Titel, Slug, Auszug und HTML-Inhalt werden unverändert übertragen",
      "Strukturierte Daten als JSON-LD direkt im Beitrag",
      "Titel und Meta-Description für Yoast SEO und Rank Math, sofern das Plugin sie über die REST API bereitstellt",
      "Denselben Beitrag nach Überarbeitung des Entwurfs erneut aktualisieren",
      "Funktioniert mit sprechenden und einfachen Permalinks",
    ],
  },
  useCases: {
    eyebrow: "Anwendungsfälle",
    title: "Das können Sie tun",
    muted: "mit WordPress und AutoSEO",
    items: [
      {
        icon: "file-text",
        title: "Lücken in der AI Visibility mit neuen Inhalten schließen",
        body: "Machen Sie aus Prompts, bei denen Wettbewerber genannt werden und Sie nicht, Briefings und Entwürfe – und veröffentlichen Sie diese in WordPress.",
      },
      {
        icon: "code",
        title: "Strukturierte Daten mit jedem Artikel ausliefern",
        body: "Entwürfe können JSON-LD enthalten, sodass FAQ-, Artikel- oder Produkt-Markup zusammen mit dem Inhalt live geht.",
      },
      {
        icon: "pen",
        title: "Die Redaktion behält die Kontrolle",
        body: "Veröffentlichen Sie als Entwurf und lassen Sie Ihr Team den Beitrag wie gewohnt in WordPress prüfen, bearbeiten und einplanen.",
      },
      {
        icon: "refresh",
        title: "Veröffentlichte Beiträge weiterentwickeln",
        body: "Überarbeiten Sie einen Entwurf in AutoSEO nach dem nächsten Tracking-Lauf und übertragen Sie das Update in den bestehenden Beitrag.",
      },
    ],
  },
  setup: {
    eyebrow: "Einrichtung",
    title: "WordPress in vier Schritten verbinden –",
    muted: "ganz ohne Plugin.",
    items: [
      {
        title: "Anwendungspasswort erstellen",
        body: "Öffnen Sie in WordPress Benutzer → Profil und erstellen Sie ein Anwendungspasswort für einen Benutzer mit der Rolle Autor, Redakteur oder Administrator.",
      },
      {
        title: "In AutoSEO verbinden",
        body: "Öffnen Sie in Ihrem Projekt Optimizations → Content, wählen Sie WordPress und geben Sie Website-URL, Benutzernamen und das Anwendungspasswort ein.",
      },
      {
        title: "Verbindung testen",
        body: "AutoSEO prüft, ob der Benutzer Beiträge veröffentlichen darf, und zeigt die verbundene Website und das Konto an.",
      },
      {
        title: "Entwurf veröffentlichen",
        body: "Öffnen Sie einen Content-Entwurf und veröffentlichen Sie ihn in WordPress – als Entwurf zur Prüfung oder direkt als Live-Beitrag.",
      },
    ],
  },
  faq: [
    {
      q: "Brauche ich ein WordPress-Plugin?",
      a: "Nein. AutoSEO nutzt die in WordPress integrierte REST API zusammen mit einem Anwendungspasswort. Felder von Yoast SEO oder Rank Math werden nur befüllt, wenn diese Plugins sie über die REST API bereitstellen.",
    },
    {
      q: "Welche WordPress-Berechtigungen benötigt AutoSEO?",
      a: "Der Benutzer hinter dem Anwendungspasswort muss Beiträge veröffentlichen dürfen – also die Rolle Autor, Redakteur oder Administrator haben. Der Verbindungstest zeigt Ihnen, wenn diese Berechtigung fehlt.",
    },
    {
      q: "Kann AutoSEO Beiträge ohne Prüfung live schalten?",
      a: "Sie entscheiden bei jeder Veröffentlichung: Senden Sie den Artikel als Entwurf, um ihn in WordPress zu prüfen, oder veröffentlichen Sie ihn sofort.",
    },
    {
      q: "Wo werden meine WordPress-Zugangsdaten gespeichert?",
      a: "Sie werden mit AES-256-GCM verschlüsselt in der Datenbank von AutoSEO gespeichert und ausschließlich für Aufrufe der REST API Ihrer Website verwendet.",
    },
    {
      q: "Funktioniert das auch mit WordPress.com?",
      a: "Es funktioniert mit jeder WordPress-Website, deren REST API und Anwendungspasswörter verfügbar sind – bei selbst gehostetem WordPress ist das der Standard.",
    },
  ],
  cta: {
    title: "Veröffentlichen Sie Inhalte, die KI-Engines zitieren wollen",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationPage;
