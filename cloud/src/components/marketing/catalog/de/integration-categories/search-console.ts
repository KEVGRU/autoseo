import type { IntegrationCategoryPage } from "../../types";

export default {
  slug: "search-console",
  nav: "Search-Console-Integrationen",
  summary: "Suchanfragen aus Google Search Console und Bing in KI-Prompts und Aufgaben verwandeln.",
  meta: {
    title: "Search Console anbinden: Google & Bing",
    description:
      "Search Console anbinden – für Google und Bing: Finden Sie KI-Prompts in Ihren Suchanfragen und Seiten kurz vor den Top-Positionen, direkt in AutoSEO.",
  },
  hero: {
    eyebrow: "Search-Console-Integrationen",
    title: "Search-Console-Daten, gelesen für die KI-Suche.",
    muted: "Von Google und Bing.",
    subtitle:
      "Verbinden Sie Google Search Console und Bing Webmaster Tools, und AutoSEO importiert täglich Ihre Suchanfragen, Seiten und Länder – und markiert die langen, dialogartigen Anfragen, die wie KI-Prompts aussehen. So wissen Sie, was Sie als Nächstes tracken sollten.",
  },
  benefits: {
    eyebrow: "Was Sie bekommen",
    title: "Mehr als eine Kopie",
    muted: "Ihrer Search Console.",
    items: [
      {
        icon: "message-square",
        title: "KI-Prompts in Ihren Suchanfragen",
        body: "Lange, fragenartige Anfragen werden als Prompts markiert und nach Intention sortiert – Empfehlung, Information, Vergleich oder Aktion. Mit einem Klick übernehmen Sie sie ins AI Visibility Tracking.",
      },
      {
        icon: "target",
        title: "Seiten in Schlagdistanz",
        body: "Seiten auf den Positionen 4–20 werden nach Impressionen, Geschäftswert aus GA4 und Abstand zur Spitze bewertet – so arbeiten Sie zuerst an denen, die sich am schnellsten lohnen.",
      },
      {
        icon: "list-checks",
        title: "Aufgaben aus Ihren Suchdaten",
        body: "Dialogartige Anfragen, die Sie noch nicht tracken, und Seiten mit Impressionen, aber schwachen Snippets werden zu priorisierten, belegbaren Aufgaben.",
      },
      {
        icon: "search",
        title: "URL-Prüfung",
        body: "Prüfen Sie den Indexierungsstatus einer Seite über die URL Inspection API von Google, ohne AutoSEO zu verlassen. Frühere Ergebnisse bleiben als Verlauf erhalten.",
      },
    ],
  },
  faq: [
    {
      q: "Wie verbinde ich die Google Search Console mit AutoSEO?",
      a: "Öffnen Sie in Ihrem Projekt die Seite Integrations, verbinden Sie die Google Search Console mit Ihrem Google-Konto und wählen Sie die Property. Bei AutoSEO Cloud verwaltet das Codext-Team den Google-OAuth-Client zentral für die gemeinsame App; beim Self-Hosting richtet ein Admin ihn einmalig unter Admin → Data Providers ein. Der erste Import startet sofort, danach wird täglich synchronisiert.",
    },
    {
      q: "Kann ich Bing Webmaster Tools verbinden?",
      a: "Ja. Geben Sie die Website-URL genau so ein, wie sie in Bing Webmaster Tools registriert ist, dazu einen API-Key aus Settings → API access. Beim Self-Hosting kann ein Admin zusätzlich einen Key für die gesamte Installation hinterlegen. Die Bing-Daten erscheinen in derselben Search-Console-Ansicht neben den Google-Daten.",
    },
    {
      q: "Wie findet AutoSEO KI-Prompts in Search-Console-Daten?",
      a: "Anfragen mit vielen Wörtern oder in Frageform – etwa mit „wie“, „was“, „welche“ oder „lohnt sich“ am Anfang – werden als dialogartig markiert. Ist ein KI-Anbieter eingerichtet, klassifiziert AutoSEO zusätzlich die Intention jeder Anfrage. Filtern Sie die Liste auf KI-Prompts und übernehmen Sie die gewünschten in Ihre getrackten Prompts.",
    },
    {
      q: "Was sind Striking-Distance-Keywords?",
      a: "Suchanfragen und Seiten, die knapp unter den Top-Positionen ranken – dort bringt eine kleine Verbesserung spürbar mehr Klicks. AutoSEO listet Seiten auf den Positionen 4–20 und bewertet sie bei verbundenem GA4 nach Impressionen, Conversion-Rate und Abstand zur Spitze.",
    },
    {
      q: "Wie viel Search-Console-Historie speichert AutoSEO?",
      a: "Bis zu 16 Monate an täglichen Suchdaten pro Property. Die erste Synchronisierung lädt diese Historie nach, spätere Läufe ergänzen die neuesten Tage.",
    },
    {
      q: "Ist die Search-Console-Integration kostenlos?",
      a: "Ja. Die Integrationen für Google Search Console und Bing Webmaster Tools sind Teil der Open-Source-App und kostenlos selbst hostbar. AutoSEO Cloud enthält beide in einem verwalteten Workspace für 50\u00a0$ im Monat, inklusive 10\u00a0$ für KI- und Datennutzung.",
    },
  ],
  cta: {
    title: "Finden Sie die Prompts in Ihren Suchdaten",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies IntegrationCategoryPage;
