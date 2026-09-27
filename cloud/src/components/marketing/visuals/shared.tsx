import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Locale } from "../locales";

/**
 * Sample data and labels for the decorative product mocks. Brands are fictional (Acme is "you"), numbers are
 * illustrative UI states — never product claims. Every mock is aria-hidden; the page text carries the content.
 */
export const visualText = {
  en: {
    live: "Live",
    trackedPrompt: "Tracked prompt",
    answerFrom: "Answer from",
    mentioned: "Mentioned",
    cited: "Cited",
    position: "Position",
    yes: "Yes",
    sources3: "3 sources",
    you: "You",
    shareOfVoice: "Share of voice",
    visibility: "Visibility",
    sentimentScore: "Sentiment score",
    positive: "Positive",
    praise: ["Easy to set up", "Open source", "Great reports"],
    criticism: ["Steep learning curve", "Few templates"],
    topSources: "Top cited sources",
    gap: "Gap",
    fanoutTitle: "Query fan-out",
    fanoutPrompt: "Best AI visibility tool for agencies?",
    fanouts: ["ai visibility tracker for agencies", "best geo tools 2026", "white label ai seo reports", "chatgpt brand monitoring tool"],
    topic: "Topic",
    topicValue: "project management software",
    promptsTitle: "Suggested prompts",
    prompts: [
      { text: "What is the best project management tool for small teams?", stage: "Consideration" },
      { text: "Acme vs. Globex for agencies", stage: "Decision" },
      { text: "How do I plan projects without spreadsheets?", stage: "Awareness" },
      { text: "Which PM tools integrate with Slack?", stage: "Consideration" },
      { text: "Is Acme worth it for 10 people?", stage: "Decision" },
    ],
    productsTitle: "Products in the answer",
    sponsored: "Sponsored",
    products: [
      { name: "Acme Trail 3", price: "$129", merchant: "acme.com", rating: 4.8 },
      { name: "Globex Runner", price: "$114", merchant: "shop.example", rating: 4.5 },
      { name: "Initech Pace", price: "$99", merchant: "store.example", rating: 4.3 },
    ],
    trafficTitle: "Sessions from AI platforms",
    last30: "Last 30 days",
    botsTitle: "AI crawler visits",
    auditTitle: "Health score",
    checks: [
      { label: "AI crawlers allowed in robots.txt", ok: true },
      { label: "llms.txt found", ok: true },
      { label: "Structured data on key pages", ok: true },
      { label: "12 pages without meta description", ok: false },
      { label: "Lighthouse performance 94", ok: true },
    ],
    tasksTitle: "Prioritized tasks",
    tasks: [
      { title: "Get listed on the top 3 cited review sites", priority: "High" },
      { title: "Add FAQ schema to the pricing page", priority: "High" },
      { title: "Answer “Acme vs. Globex” on the blog", priority: "Medium" },
      { title: "Allow OAI-SearchBot in robots.txt", priority: "Medium" },
    ],
    syncedTo: "Synced to Jira",
    contentTitle: "Content draft",
    docTitle: "How to choose a project management tool in 2026",
    promptsCovered: "Prompts covered",
    citeThese: "Sources to earn",
    publishTo: "Publish to WordPress",
    factTitle: "Fact check · ChatGPT",
    claims: [
      { claim: "Acme offers a free plan", status: "ok", note: "Accurate" },
      { claim: "Acme was founded in 2014", status: "bad", note: "Incorrect · 2016" },
      { claim: "Acme supports single sign-on", status: "ok", note: "Accurate" },
      { claim: "Acme Pro costs $99 per month", status: "warn", note: "Outdated · $79" },
    ],
    keywordsTitle: "Keyword research",
    keywordHead: ["Keyword", "Volume", "KD", "Intent"],
    keywords: [
      { kw: "ai visibility tool", volume: 2400, kd: 38, intent: "Commercial" },
      { kw: "generative engine optimization", volume: 5400, kd: 52, intent: "Informational" },
      { kw: "chatgpt brand monitoring", volume: 880, kd: 24, intent: "Commercial" },
      { kw: "ai seo platform", volume: 1900, kd: 61, intent: "Commercial" },
      { kw: "llms.txt generator", volume: 1300, kd: 19, intent: "Transactional" },
    ],
    rankTitle: "Average position",
    desktop: "Desktop",
    mobile: "Mobile",
    reportTitle: "AI visibility report",
    reportPeriod: "March",
    citations: "Citations",
    exportChips: ["PPTX", "PDF", "Share link"],
    agentQuestion: "Why did our visibility drop on Perplexity last week?",
    agentSteps: ["Reading visibility trend", "Comparing cited sources", "Checking competitor mentions"],
    agentAnswer: "Two review sites that Perplexity cites dropped your listing. Globex replaced you on both.",
    askAgent: "Ask the agent…",
    integrationsTitle: "Connected",
    engineNames: ["ChatGPT", "Perplexity", "Gemini", "Claude", "AI Overviews"],
    brands: ["Acme", "Globex", "Initech", "Umbrella", "Hooli"],
  },
  de: {
    live: "Live",
    trackedPrompt: "Getrackter Prompt",
    answerFrom: "Antwort von",
    mentioned: "Erwähnt",
    cited: "Zitiert",
    position: "Position",
    yes: "Ja",
    sources3: "3 Quellen",
    you: "Sie",
    shareOfVoice: "Share of Voice",
    visibility: "Sichtbarkeit",
    sentimentScore: "Sentiment-Score",
    positive: "Positiv",
    praise: ["Schnell eingerichtet", "Open Source", "Starke Reports"],
    criticism: ["Lernkurve", "Wenige Vorlagen"],
    topSources: "Meistzitierte Quellen",
    gap: "Lücke",
    fanoutTitle: "Query Fan-out",
    fanoutPrompt: "Bestes AI-Visibility-Tool für Agenturen?",
    fanouts: ["ai visibility tracker agentur", "beste geo tools 2026", "white label ki seo reports", "chatgpt markenmonitoring tool"],
    topic: "Thema",
    topicValue: "Projektmanagement-Software",
    promptsTitle: "Vorgeschlagene Prompts",
    prompts: [
      { text: "Welches Projektmanagement-Tool ist am besten für kleine Teams?", stage: "Consideration" },
      { text: "Acme oder Globex für Agenturen?", stage: "Decision" },
      { text: "Wie plane ich Projekte ohne Excel?", stage: "Awareness" },
      { text: "Welche PM-Tools lassen sich mit Slack verbinden?", stage: "Consideration" },
      { text: "Lohnt sich Acme für 10 Personen?", stage: "Decision" },
    ],
    productsTitle: "Produkte in der Antwort",
    sponsored: "Gesponsert",
    products: [
      { name: "Acme Trail 3", price: "129 €", merchant: "acme.com", rating: 4.8 },
      { name: "Globex Runner", price: "114 €", merchant: "shop.example", rating: 4.5 },
      { name: "Initech Pace", price: "99 €", merchant: "store.example", rating: 4.3 },
    ],
    trafficTitle: "Sitzungen von KI-Plattformen",
    last30: "Letzte 30 Tage",
    botsTitle: "Besuche von KI-Crawlern",
    auditTitle: "Health Score",
    checks: [
      { label: "KI-Crawler in robots.txt erlaubt", ok: true },
      { label: "llms.txt gefunden", ok: true },
      { label: "Strukturierte Daten auf Kernseiten", ok: true },
      { label: "12 Seiten ohne Meta-Description", ok: false },
      { label: "Lighthouse Performance 94", ok: true },
    ],
    tasksTitle: "Priorisierte Aufgaben",
    tasks: [
      { title: "Auf den 3 meistzitierten Vergleichsportalen listen", priority: "Hoch" },
      { title: "FAQ-Schema auf der Preisseite ergänzen", priority: "Hoch" },
      { title: "„Acme vs. Globex“ im Blog beantworten", priority: "Mittel" },
      { title: "OAI-SearchBot in robots.txt erlauben", priority: "Mittel" },
    ],
    syncedTo: "Mit Jira synchronisiert",
    contentTitle: "Content-Entwurf",
    docTitle: "So wählen Sie 2026 das richtige Projektmanagement-Tool",
    promptsCovered: "Abgedeckte Prompts",
    citeThese: "Quellen für Erwähnungen",
    publishTo: "In WordPress veröffentlichen",
    factTitle: "Faktencheck · ChatGPT",
    claims: [
      { claim: "Acme bietet einen kostenlosen Tarif", status: "ok", note: "Korrekt" },
      { claim: "Acme wurde 2014 gegründet", status: "bad", note: "Falsch · 2016" },
      { claim: "Acme unterstützt Single Sign-on", status: "ok", note: "Korrekt" },
      { claim: "Acme Pro kostet 99 € im Monat", status: "warn", note: "Veraltet · 79 €" },
    ],
    keywordsTitle: "Keyword-Recherche",
    keywordHead: ["Keyword", "Volumen", "KD", "Intent"],
    keywords: [
      { kw: "ki sichtbarkeit tool", volume: 1600, kd: 34, intent: "Kommerziell" },
      { kw: "generative engine optimization", volume: 2900, kd: 47, intent: "Informativ" },
      { kw: "chatgpt markenmonitoring", volume: 590, kd: 22, intent: "Kommerziell" },
      { kw: "ki seo plattform", volume: 1300, kd: 55, intent: "Kommerziell" },
      { kw: "llms.txt generator", volume: 880, kd: 17, intent: "Transaktional" },
    ],
    rankTitle: "Durchschnittliche Position",
    desktop: "Desktop",
    mobile: "Mobil",
    reportTitle: "AI-Visibility-Report",
    reportPeriod: "März",
    citations: "Zitate",
    exportChips: ["PPTX", "PDF", "Freigabelink"],
    agentQuestion: "Warum ist unsere Sichtbarkeit in Perplexity letzte Woche gesunken?",
    agentSteps: ["Sichtbarkeitsverlauf lesen", "Zitierte Quellen vergleichen", "Erwähnungen der Wettbewerber prüfen"],
    agentAnswer: "Zwei Vergleichsportale, die Perplexity zitiert, haben Ihren Eintrag entfernt. Globex hat Sie dort ersetzt.",
    askAgent: "Agent fragen …",
    integrationsTitle: "Verbunden",
    engineNames: ["ChatGPT", "Perplexity", "Gemini", "Claude", "AI Overviews"],
    brands: ["Acme", "Globex", "Initech", "Umbrella", "Hooli"],
  },
} satisfies Record<Locale, unknown>;

export type VisualText = (typeof visualText)["en"];

export function vt(locale: Locale): VisualText {
  return visualText[locale] as VisualText;
}

/** CSS custom properties for stagger indices (`--i`, `--d`, `--n`). */
export function vars(values: Record<string, number | string>): CSSProperties {
  return Object.fromEntries(Object.entries(values).map(([k, v]) => [`--${k}`, v])) as CSSProperties;
}

/** Card chrome shared by all mocks: title row with an optional live dot. */
export function Panel({
  title,
  live,
  aside,
  children,
  className,
}: {
  title?: string;
  live?: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-4 text-left text-card-foreground shadow-[0_1px_2px_oklch(0_0_0/0.05),0_24px_60px_-28px_oklch(0_0_0/0.45)] sm:p-5",
        className,
      )}
    >
      {(title || live || aside) && (
        <div className="mb-3.5 flex items-center justify-between gap-3 text-xs">
          {title && <span className="truncate font-medium text-muted-foreground">{title}</span>}
          {live && <LiveDot label={live} />}
          {aside}
        </div>
      )}
      {children}
    </div>
  );
}

export function LiveDot({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 font-medium text-green-700 dark:text-green-400">
      <span className="relative flex size-1.5">
        <span className="mk-ping absolute inline-flex size-full rounded-full bg-green-500" />
        <span className="relative inline-flex size-1.5 rounded-full bg-green-500" />
      </span>
      {label}
    </span>
  );
}

/** Neutral two-letter glyph (no vendor logos). */
export function Monogram({ text, color, className }: { text: string; color?: string; className?: string }) {
  return (
    <span
      className={cn(
        "grid size-6 shrink-0 place-items-center rounded-md text-[0.6rem] font-bold text-white",
        !color && "bg-foreground text-background",
        className,
      )}
      style={color ? { backgroundColor: color } : undefined}
    >
      {text}
    </span>
  );
}

/** Wraps "Acme" in a highlight inside a sentence. */
export function HighlightBrand({ text, brand = "Acme" }: { text: string; brand?: string }) {
  const parts = text.split(brand);
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <mark className="rounded bg-brand-soft px-1 font-semibold text-foreground">{brand}</mark>
          )}
        </span>
      ))}
    </>
  );
}

/** Root wrapper of a mock: hidden from assistive tech, revealed on scroll, loops paused off screen. */
export function MockRoot({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div aria-hidden="true" data-animate="scale" data-loop="" className={cn("select-none", className)}>
      {children}
    </div>
  );
}
