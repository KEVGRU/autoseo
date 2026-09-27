import type { FeaturePage } from "../../types";

export default {
  slug: "ai-fact-check",
  nav: "KI-Faktencheck",
  summary: "Prüfen Sie KI-Aussagen über Ihre Produkte gegen Ihre eigenen Referenzdokumente.",
  meta: {
    title: "KI-Faktencheck: Was KI über Ihre Produkte sagt",
    description:
      "KI-Faktencheck für Marken: Vergleichen Sie, was ChatGPT, Gemini und Perplexity über Ihre Produkte sagen, mit Fachinfo und Datenblatt – jede Abweichung im Blick.",
  },
  hero: {
    eyebrow: "KI-Faktencheck",
    title: "Prüfen Sie, was KI über Ihre Produkte sagt.",
    muted: "Gegen Ihre eigenen Dokumente.",
    subtitle:
      "AutoSEO sammelt die Aussagen, die KI-Engines in getrackten Antworten über Ihre Produkte machen, vergleicht jede mit Ihren Referenzdokumenten – Fachinformation, Datenblatt, AGB – und markiert Behauptungen, die widersprochen, unbelegt, veraltet oder Off-Label sind, mit der genauen Textstelle als Beleg.",
  },
  visual: "factcheck",
  stats: [
    { value: 16, label: "Geprüfte KI-Engines", note: "Jede getrackte Antwort" },
    { value: 6, label: "Bewertungen", note: "Von Treffer bis Off-Label" },
    { value: 3, label: "Schweregrade", note: "Kritisch, erheblich, gering" },
    { value: 0, prefix: "$", label: "Self-Hosting", note: "MIT-Lizenz, alle Funktionen" },
  ],
  why: {
    eyebrow: "Warum das wichtig ist",
    title: "KI irrt sich bei Produktfakten –",
    muted: "und klingt dabei sehr sicher.",
    body: "Assistenten verwechseln Versionen, erfinden Funktionen, wiederholen veraltete Angaben oder empfehlen ein Produkt für eine Anwendung, für die es nicht zugelassen ist. Käufer nehmen diese Antworten für bare Münze. Korrigieren können Sie nur, was Sie gefunden haben.",
    points: [
      {
        title: "Falsche Aussagen verbreiten sich leise",
        body: "Ein Fehler in einer Antwort wiederholt sich über Prompts, Märkte und Engines hinweg. Ohne systematische Prüfung fällt er erst auf, wenn ein Kunde ihn bemerkt.",
      },
      {
        title: "Regulierte Aussagen bergen Risiken",
        body: "Bei Arzneimitteln, Medizinprodukten oder Finanzprodukten ist eine Off-Label- oder widersprüchliche Aussage mehr als ein Marketingproblem.",
      },
      {
        title: "Belege machen Korrekturen möglich",
        body: "Eine Abweichung, die mit der genauen Antwort und der genauen Stelle in Ihrer Dokumentation verknüpft ist, kann Ihr Team gezielt angehen.",
      },
    ],
  },
  capabilities: {
    eyebrow: "Was Sie bekommen",
    title: "Jede KI-Aussage gegen die Quelle geprüft –",
    muted: "mit Beleg.",
    items: [
      {
        icon: "layers",
        title: "Assets mit Alias-Namen",
        body: "Legen Sie Produkte einzeln an, fügen Sie eine Liste ein oder lassen Sie sie von einer URL erkennen. Alias-Namen und Wirkstoffe erfassen jede Schreibweise, die KI verwendet.",
      },
      {
        icon: "file-text",
        title: "Referenzdokumente",
        body: "PDF hochladen, Text einfügen oder URL verlinken. Abschnitte wie „4.1 Anwendungsgebiete“ werden automatisch erkannt, Dokumentversionen bleiben erhalten.",
      },
      {
        icon: "shield-check",
        title: "Sechs Bewertungen mit Beleg",
        body: "Stimmt überein, widersprochen, unbelegt, veraltet, Off-Label oder zu prüfen – jeweils mit Zitat aus der Antwort, passender Stelle im Dokument und Begründung.",
      },
      {
        icon: "flag",
        title: "Workflow für Befunde",
        body: "Filtern Sie nach Engine, Markt, Typ, Schweregrad und Asset, markieren Sie Befunde als gelöst oder ignoriert und exportieren Sie sie als CSV.",
      },
      {
        icon: "chart",
        title: "Genauigkeit im Zeitverlauf",
        body: "Trefferquote pro Woche, je Engine, je Markt und je Asset – und welche Art von Fehlern jede Engine macht.",
      },
      {
        icon: "list-checks",
        title: "Korrekturen werden Aufgaben",
        body: "Falsche Aussagen werden zu Reputationsaufgaben in Ihrem Maßnahmenplan – bereit zum Zuweisen oder zur Übergabe an Ihr PM-Tool.",
      },
    ],
  },
  steps: {
    eyebrow: "So funktioniert es",
    title: "Von der Fachinformation zum Genauigkeitsreport",
    muted: "in drei Schritten.",
    items: [
      {
        title: "Assets und Dokumente anlegen",
        body: "Legen Sie die Produkte an, die Sie beobachten möchten, und hinterlegen Sie deren Referenzdokumente – etwa Fachinformation, Packungsbeilage, Datenblatt oder AGB.",
      },
      {
        title: "AutoSEO extrahiert und bewertet Aussagen",
        body: "Einmal täglich und nach jedem Tracking-Lauf werden Aussagen zu jedem Asset aus den KI-Antworten gezogen und mit den passenden Abschnitten Ihrer Dokumente verglichen.",
      },
      {
        title: "Abweichungen prüfen",
        body: "Arbeiten Sie die Befunde nach Schweregrad ab, korrigieren Sie bei Bedarf eine Bewertung und verfolgen Sie die Trefferquote je Engine und Markt.",
      },
    ],
  },
  faq: [
    {
      q: "Was ist ein KI-Faktencheck?",
      a: "Ein KI-Faktencheck vergleicht, was KI-Assistenten über Ihre Produkte sagen, mit einer verbindlichen Quelle wie Fachinformation, Datenblatt oder AGB. AutoSEO macht das laufend für jede getrackte Antwort und weist jede Aussage als übereinstimmend oder abweichend aus.",
    },
    {
      q: "Wie finde ich heraus, was ChatGPT über mein Produkt sagt?",
      a: "Tracken Sie in AutoSEO die Prompts, die Ihre Kunden stellen, legen Sie ein Asset für Ihr Produkt an und laden Sie dessen Referenzdokument hoch. AutoSEO zieht jede Aussage über das Produkt aus den Antworten von ChatGPT – und denen der anderen getrackten Engines – und prüft sie gegen das Dokument.",
    },
    {
      q: "Welche Referenzdokumente kann ich nutzen?",
      a: "Jeden Text, der die Fakten zu einem Produkt festlegt: Fachinformation oder Packungsbeilage, Datenblatt oder AGB. Laden Sie ein PDF mit bis zu 20 MB hoch, fügen Sie den Text ein oder verlinken Sie eine URL zu einer HTML-Seite oder einem PDF.",
    },
    {
      q: "Wie entscheidet AutoSEO, ob eine Aussage falsch ist?",
      a: "Ist ein KI-Anbieter verbunden, bewertet ein Modell jede Aussage gegen die passenden Dokumentabschnitte und muss die belegende Stelle wörtlich zitieren. Lässt sich diese Stelle nicht in Ihrem Dokument finden, wird die Bewertung auf „zu prüfen“ herabgestuft. Ohne KI kommt ein Wort-für-Wort-Abgleich zum Einsatz.",
    },
    {
      q: "Ist der KI-Faktencheck nur etwas für Pharma?",
      a: "Nein. Die Bewertungen stammen aus der Label-Compliance – „Off-Label“ ist ein Pharma-Begriff –, aber jedes Produkt mit Datenblatt oder AGB funktioniert. Am meisten profitieren regulierte Branchen wie Pharma, Medizintechnik und Finanzen.",
    },
    {
      q: "Woher kommen die KI-Antworten?",
      a: "Aus dem AI Visibility Tracking: den Prompts, die Sie in bis zu 16 Engines und 143 Märkten tracken. Der Faktencheck arbeitet mit diesen gespeicherten Antworten und fragt die Engines nicht erneut ab.",
    },
    {
      q: "Ist der KI-Faktencheck kostenlos?",
      a: "Der Faktencheck ist Teil der Open-Source-App AutoSEO und beim Self-Hosting mit allen Funktionen kostenlos. AutoSEO Cloud bietet Ihnen einen verwalteten Workspace für 50\u00a0$ pro Monat, KI- und Datennutzung im Wert von 10\u00a0$ inklusive. Die KI-Bewertung kann auch über Ihr eigenes Claude Code oder Codex per lokalem Agenten laufen.",
    },
  ],
  related: ["ai-brand-sentiment", "ai-visibility-tracking", "ai-seo-tasks", "ai-content-optimization"],
  cta: {
    title: "Finden Sie heraus, was KI über Ihre Produkte falsch sagt",
    subtitle: "Starten Sie mit einem AutoSEO-Cloud-Workspace für 50\u00a0$/Monat – oder hosten Sie die Open-Source-Edition kostenlos selbst.",
  },
} satisfies FeaturePage;
