import { playbookPath } from "@/components/site/company/paths";
import type { SitePage } from "@/components/site/types";
import { site } from "@/lib/site";
import playbooks from "./playbooks.de";

const price = `${site.priceMonthlyUsd} $`;

const page: SitePage = {
  path: "/case-studies",
  crumb: "Case Studies",
  meta: {
    title: "GEO-Case-Studies als reproduzierbare Playbooks",
    description:
      "Sechs reproduzierbare Playbooks zur KI-Sichtbarkeit: Prompt-Sets zum Import, Ausgangsmessung, Maßnahmen und ehrliche Messung – Methodik statt Kundenversprechen.",
  },
  hero: {
    eyebrow: "Case Studies",
    title: "Playbooks zum Nachmachen statt Geschichten zum Glauben",
    subtitle:
      "Wir veröffentlichen keine Wachstumskurven von Kunden. Jedes Playbook unten ist eine vollständige Methode: das Prompt-Set zum Import, die zu trackenden Engines, die Ausgangsmessung in AutoSEO, die Maßnahmen und die Messung der Veränderung – einschließlich der Frage, wie stark KI-Antworten von selbst schwanken.",
    ctas: [
      { label: "Zu den Playbooks", href: "#playbooks" },
      { label: "Mit AutoSEO starten", href: "/signup" },
    ],
  },
  sections: [
    {
      kind: "cards",
      id: "playbooks",
      eyebrow: "Sechs Playbooks",
      title: "Wählen Sie das Problem, das Sie lösen wollen",
      subtitle: "Jedes Playbook funktioniert in der kostenlosen Self-Hosting-Version und in AutoSEO Cloud.",
      columns: 3,
      cards: playbooks.map((p) => ({ icon: p.icon, title: p.crumb, body: p.teaser, href: `/de${playbookPath(p.slug)}` })),
    },
    {
      kind: "steps",
      id: "structure",
      eyebrow: "So ist jedes Playbook aufgebaut",
      title: "Immer dieselbe Struktur, damit Ergebnisse vergleichbar bleiben",
      steps: [
        { title: "Ziel und Zielgruppe", body: "Welche Kennzahl sich bewegen soll und für wen sich der Aufwand lohnt." },
        { title: "Prompt-Set", body: "Vorlagen mit Platzhaltern, bereit für den CSV-Import in den AutoSEO-Tracker." },
        { title: "Ausgangsmessung", body: "Engines, Frequenz und die genauen Zahlen, die Sie festhalten, bevor Sie etwas ändern." },
        { title: "Maßnahmen und Messung", body: "Konkrete Schritte, wie Sie die Veränderung messen und wann sie als echt gilt." },
      ],
    },
    {
      kind: "checklist",
      id: "honesty",
      eyebrow: "Ergebnisse ehrlich lesen",
      title: "Warum wir Methoden statt Wachstumskurven zeigen",
      subtitle: "KI-Antworten sind probabilistisch. Ein Vorher-Nachher-Diagramm ohne Kontext beweist sehr wenig.",
      items: [
        "Derselbe Prompt kann morgen eine andere Antwort erhalten – einzelne Antworten und einzelne Tage beweisen nichts",
        "Kleine Prompt-Sets schwanken stärker als große; 30–50 Prompts pro Thema liefern stabilere Zahlen",
        "Modell-Updates bewegen alle gleichzeitig – vergleichen Sie sich mit Wettbewerbern, nicht nur mit dem Vormonat",
        "Wer Engines, Land, Sprache oder das Prompt-Set ändert, zerstört die Vergleichbarkeit",
        "Korrelation mit Umsatz ist keine Kausalität: Auch Saisonalität und Kampagnen bewegen Zahlen",
      ],
      aside: [
        { type: "h3", text: "Methodik, kein Kundenergebnis" },
        {
          type: "p",
          text: "Keines der Playbooks enthält Kundendaten oder verspricht ein Ergebnis. Sie beschreiben, wie Sie die Arbeit umsetzen und messen – damit Sie das Ergebnis selbst beurteilen können.",
        },
        { type: "h3", text: "Teilen Sie, was Sie herausfinden" },
        {
          type: "p",
          text: `Ein Playbook umgesetzt? Posten Sie Ihr Setup und Ihre Ergebnisse in den [GitHub Discussions](${site.github}/discussions), damit andere sie nachvollziehen können – auch das, was nicht funktioniert hat.`,
        },
        { type: "h3", text: "Was die Forschung sagt" },
        {
          type: "p",
          text: "Studien zu GEO-Techniken kommen nicht immer zum selben Ergebnis. [Welche GEO-Techniken wirken?](/de/blog/geo-techniques) fasst die Belege zusammen und zeigt, wie Sie eine Technik selbst testen.",
        },
      ],
    },
    {
      kind: "faq",
      id: "faq",
      title: "Fragen zu den Playbooks",
      items: [
        {
          q: "Warum veröffentlichen Sie keine Kunden-Case-Studies?",
          a: "Weil die Wachstumskurve eines Kunden wenig darüber verrät, was bei Ihnen passieren wird, und weil KI-Antworten so stark schwanken, dass ein einzelnes Vorher-Nachher-Diagramm in die Irre führen kann. Mit einer reproduzierbaren Methode testen Sie den Ansatz an Ihrer eigenen Marke und beurteilen die Belege selbst.",
        },
        {
          q: "Funktionieren die Playbooks in der Self-Hosting-Version?",
          a: "Ja. Alle Funktionen, die die Playbooks nutzen – Tracker, Sources, Competitors, Crawlability, Bot Traffic, Fact Check, Attribution und der Report Builder –, sind in der kostenlosen Self-Hosting-Version und in AutoSEO Cloud enthalten.",
        },
        {
          q: "Wie importiere ich ein Prompt-Set?",
          a: "Kopieren Sie die CSV aus dem Playbook oder laden Sie sie herunter, ersetzen Sie die Platzhalter in eckigen Klammern und öffnen Sie in AutoSEO AI Visibility → Tracker → Import CSV. Fügen Sie dort den Text ein oder laden Sie die Datei hoch. Die Spalten heißen prompt und tags; die Tags werden mit den Prompts übernommen.",
        },
        {
          q: "Wie lange dauert ein Playbook?",
          a: "Die Ausgangsmessung dauert je nach Playbook ein bis zwei Wochen tägliches Tracking. Die Maßnahmen dauern so lange wie die Arbeit selbst. Planen Sie eine erneute Messung nach sechs bis acht Wochen und danach monatlich, denn Engines greifen Änderungen nach ihrem eigenen Zeitplan auf.",
        },
        {
          q: "Dürfen Agenturen die Playbooks für Kunden nutzen?",
          a: "Ja. Die Playbooks dürfen Sie kostenlos für Ihre eigenen Marken und für Kundenprojekte nutzen. Das Playbook zum Agentur-Pitch ist eigens dafür geschrieben, neue Kunden mit ihren eigenen Daten zu gewinnen.",
        },
        {
          q: "Kann ich ein Playbook vorschlagen?",
          a: "Ja. Eröffnen Sie in den GitHub Discussions einen Thread mit dem Problem, das Sie lösen wollen, und wie Sie Erfolg messen würden. Aus nützlichen Vorschlägen werden neue Playbooks.",
        },
      ],
    },
    {
      kind: "cta",
      id: "start",
      title: "Setzen Sie Ihr erstes Playbook noch diese Woche um",
      body: "Prompt-Set importieren, Ausgangswert messen und loslegen – in AutoSEO Cloud oder auf Ihrem eigenen Server.",
      primary: { label: `Für ${price}/Monat starten`, href: "/signup" },
      secondary: { label: "Kostenlos selbst hosten", href: "/self-hosting" },
    },
  ],
};

export default page;
