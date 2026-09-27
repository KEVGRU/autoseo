import { AlertTriangle, Check, CornerDownRight, Search, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CountUp } from "../count-up";
import type { Locale } from "../locales";
import { HighlightBrand, LiveDot, MockRoot, Monogram, Panel, vars, vt } from "./shared";

export type AnswerDemo = { prompt: string; answer: string; citations: string[]; engines?: string[] };

/** A tracked prompt with a live answer: engine ticker, highlighted brand mention, citations and stats. */
export function AnswerVisual({ locale, demo, className }: { locale: Locale; demo?: AnswerDemo; className?: string }) {
  const t = vt(locale);
  const prompt = demo?.prompt ?? t.fanoutPrompt;
  const answer =
    demo?.answer ??
    (locale === "de"
      ? "Für Agenturen ist Acme eine starke Wahl: Es trackt Erwähnungen und Zitate in ChatGPT, Perplexity und Gemini und lässt sich selbst hosten."
      : "For agencies, Acme is a strong pick: it tracks mentions and citations across ChatGPT, Perplexity and Gemini and can be self-hosted.");
  const citations = demo?.citations ?? ["acme.com", "g2.com", "reddit.com"];
  // The ticker keyframes (mk-ticker) cycle exactly five names; a single engine is shown without the ticker.
  const engines = (demo?.engines ?? t.engineNames).slice(0, 5);
  const ticker = [...engines, engines[0]];
  return (
    <MockRoot className={className}>
      <Panel title={t.trackedPrompt} live={t.live}>
        <div className="flex justify-end">
          <p className="max-w-[92%] rounded-2xl rounded-br-md bg-foreground px-3.5 py-2.5 text-[0.82rem] leading-5 font-medium text-background">
            {prompt}
          </p>
        </div>
        <div className="mt-3.5 flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">{t.answerFrom}</span>
          {engines.length > 1 ? (
            <span className="h-5 overflow-hidden font-semibold">
              <span className="mk-ticker block">
                {ticker.map((engine, i) => (
                  <span key={`${engine}-${i}`} className="block h-5 leading-5">
                    {engine}
                  </span>
                ))}
              </span>
            </span>
          ) : (
            <span className="font-semibold">{engines[0]}</span>
          )}
        </div>
        <p className="mk-pop mt-2 text-[0.82rem] leading-6 text-muted-foreground" style={vars({ d: 1 })}>
          <HighlightBrand text={answer} />
        </p>
        {citations.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {citations.map((c, i) => (
            <span
              key={c}
              className="mk-pop inline-flex items-center gap-1.5 rounded-full border bg-background px-2 py-0.5 text-[0.7rem] font-medium"
              style={vars({ d: i + 3 })}
            >
              <span className="size-1.5 rounded-full bg-green-500" />
              {c}
            </span>
          ))}
        </div>
        )}
        <dl className="mt-3.5 grid grid-cols-3 gap-2">
          {[
            [t.mentioned, t.yes],
            [t.cited, citations.length > 0 ? t.sources3 : "–"],
            [t.position, "#1"],
          ].map(([label, value], i) => (
            <div key={label} className="mk-pop rounded-lg border px-2.5 py-2" style={vars({ d: i + 5 })}>
              <dt className="text-[0.65rem] text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 text-sm font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </Panel>
    </MockRoot>
  );
}

const rankRows = [64, 52, 41, 29, 17];

/** Share-of-voice ranking with growing bars; "you" highlighted. */
export function RankingVisual({ locale, className }: { locale: Locale; className?: string }) {
  const t = vt(locale);
  return (
    <MockRoot className={className}>
      <Panel title={t.shareOfVoice} live={t.live}>
        <ol className="space-y-1" style={vars({ n: rankRows.length })}>
          {rankRows.map((value, i) => {
            const you = i === 0;
            return (
              <li
                key={t.brands[i]}
                className="mk-cycle grid grid-cols-[1.25rem_5.5rem_1fr_2.5rem] items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-xs"
                style={vars({ i })}
              >
                <span className="font-mono text-muted-foreground">{i + 1}</span>
                <span className="flex min-w-0 items-center gap-1.5 font-medium">
                  <span className="truncate">{t.brands[i]}</span>
                  {you && (
                    <span className="rounded bg-brand-soft px-1 text-[0.6rem] font-semibold text-green-700 dark:text-green-300">
                      {t.you}
                    </span>
                  )}
                </span>
                <span className="h-2 overflow-hidden rounded-full bg-muted">
                  <span
                    className={cn("mk-grow-x block h-full rounded-full", you ? "bg-green-500" : "bg-foreground/25")}
                    style={{ width: `${value}%`, ...vars({ d: i }) }}
                  />
                </span>
                <span className="text-right font-semibold tabular-nums">{value}%</span>
              </li>
            );
          })}
        </ol>
      </Panel>
    </MockRoot>
  );
}

/** Sentiment gauge with praise and criticism chips. */
export function SentimentVisual({ locale, className }: { locale: Locale; className?: string }) {
  const t = vt(locale);
  return (
    <MockRoot className={className}>
      <Panel title={t.sentimentScore} live={t.live}>
        <div className="relative mx-auto w-full max-w-[15rem]">
          <svg viewBox="0 0 120 68" className="w-full">
            <path d="M10 60 A50 50 0 0 1 110 60" fill="none" strokeWidth="9" strokeLinecap="round" className="stroke-muted" />
            <path
              d="M10 60 A50 50 0 0 1 98.53 28.13"
              pathLength={1}
              fill="none"
              strokeWidth="9"
              strokeLinecap="round"
              className="mk-draw stroke-green-500"
            />
          </svg>
          <div className="absolute inset-x-0 bottom-0 text-center">
            <p className="text-3xl font-semibold tracking-tight tabular-nums">
              <CountUp value={78} lang={locale} />
            </p>
            <p className="text-[0.7rem] text-muted-foreground">{t.positive}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {t.praise.map((p, i) => (
            <span
              key={p}
              className="mk-pop rounded-full bg-green-500/12 px-2.5 py-1 text-[0.7rem] font-medium text-green-700 dark:text-green-300"
              style={vars({ d: i + 2 })}
            >
              + {p}
            </span>
          ))}
          {t.criticism.map((c, i) => (
            <span
              key={c}
              className="mk-pop rounded-full bg-red-500/10 px-2.5 py-1 text-[0.7rem] font-medium text-red-700 dark:text-red-300"
              style={vars({ d: i + 5 })}
            >
              − {c}
            </span>
          ))}
        </div>
      </Panel>
    </MockRoot>
  );
}

const sourceRows = [
  { domain: "reddit.com", type: "UGC", count: 42, color: "#ff4500" },
  { domain: "g2.com", type: "Review", count: 31, color: "#ff492c", gap: true },
  { domain: "acme.com", type: "Docs", count: 27, color: "#16a34a", you: true },
  { domain: "top10tools.io", type: "Listicle", count: 18, color: "#6366f1", gap: true },
  { domain: "wikipedia.org", type: "Reference", count: 12, color: "#525252" },
];

/** Most cited sources with content types and gaps. */
export function SourcesVisual({ locale, className }: { locale: Locale; className?: string }) {
  const t = vt(locale);
  return (
    <MockRoot className={className}>
      <Panel title={t.topSources} live={t.live}>
        <ul className="space-y-1" style={vars({ n: sourceRows.length })}>
          {sourceRows.map((row, i) => (
            <li
              key={row.domain}
              className="mk-cycle grid grid-cols-[1.5rem_1fr_auto_2rem] items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-xs"
              style={vars({ i })}
            >
              <Monogram text={row.domain.slice(0, 2).toUpperCase()} color={row.color} />
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="truncate font-medium">{row.domain}</span>
                {row.you && (
                  <span className="rounded bg-brand-soft px-1 text-[0.6rem] font-semibold text-green-700 dark:text-green-300">
                    {t.you}
                  </span>
                )}
                {row.gap && (
                  <span className="rounded bg-amber-500/15 px-1 text-[0.6rem] font-semibold text-amber-700 dark:text-amber-300">
                    {t.gap}
                  </span>
                )}
              </span>
              <span className="rounded-md border px-1.5 py-0.5 text-[0.65rem] text-muted-foreground">{row.type}</span>
              <span className="text-right font-semibold tabular-nums">{row.count}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </MockRoot>
  );
}

/** One prompt fanning out into the searches the engine runs. */
export function FanoutVisual({ locale, className }: { locale: Locale; className?: string }) {
  const t = vt(locale);
  return (
    <MockRoot className={className}>
      <Panel title={t.fanoutTitle} live={t.live}>
        <p className="rounded-xl bg-foreground px-3.5 py-2.5 text-[0.82rem] font-medium text-background">{t.fanoutPrompt}</p>
        <ul className="relative mt-3 ml-4 space-y-2 border-l border-dashed border-foreground/25 pl-4" style={vars({ n: t.fanouts.length + 1 })}>
          {t.fanouts.map((q, i) => (
            <li key={q} className="mk-appear relative" style={vars({ i })}>
              <CornerDownRight className="absolute top-2 -left-[1.4rem] size-3.5 text-muted-foreground" />
              <span className="flex items-center gap-2 rounded-lg border bg-background px-2.5 py-1.5 font-mono text-[0.72rem]">
                <Search className="size-3 shrink-0 text-green-600 dark:text-green-400" />
                <span className="truncate">{q}</span>
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </MockRoot>
  );
}

/** Prompt research: a topic turns into prompts tagged by funnel stage. */
export function PromptsVisual({ locale, className }: { locale: Locale; className?: string }) {
  const t = vt(locale);
  const stageColor: Record<string, string> = {
    Awareness: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
    Consideration: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
    Decision: "bg-green-500/12 text-green-700 dark:text-green-300",
  };
  return (
    <MockRoot className={className}>
      <Panel title={t.promptsTitle} live={t.live}>
        <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2 text-[0.8rem]">
          <span className="text-muted-foreground">{t.topic}:</span>
          <span className="mk-type font-medium" style={vars({ steps: t.topicValue.length })}>
            {t.topicValue}
          </span>
          <span className="mk-caret -ml-1 h-4 w-px bg-foreground" />
        </div>
        <ul className="mt-3 space-y-1.5" style={vars({ n: t.prompts.length + 1 })}>
          {t.prompts.map((p, i) => (
            <li
              key={p.text}
              className="mk-appear flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-[0.72rem]"
              style={vars({ i })}
            >
              <span className="truncate">{p.text}</span>
              <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[0.6rem] font-semibold", stageColor[p.stage])}>
                {p.stage}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </MockRoot>
  );
}

const productGradients = [
  "from-green-400/70 via-emerald-500/60 to-teal-700/80",
  "from-sky-400/60 via-indigo-400/60 to-violet-600/70",
  "from-amber-300/70 via-orange-400/60 to-rose-500/70",
];

/** Shopping cards inside an AI answer; `ads` marks one card as sponsored. */
export function ProductsVisual({ locale, ads, className }: { locale: Locale; ads?: boolean; className?: string }) {
  const t = vt(locale);
  return (
    <MockRoot className={className}>
      <Panel title={t.productsTitle} live={t.live}>
        <ul className="grid grid-cols-3 gap-2" style={vars({ n: 3 })}>
          {t.products.map((p, i) => (
            <li key={p.name} className="mk-pop overflow-hidden rounded-xl border bg-background" style={vars({ d: i })}>
              <div className={cn("relative aspect-[4/3] bg-gradient-to-br", productGradients[i])}>
                <span className="mk-sheen absolute inset-0 bg-[linear-gradient(110deg,transparent_35%,oklch(1_0_0/0.35)_50%,transparent_65%)]" />
                {ads && i === 1 && (
                  <span className="absolute top-1.5 left-1.5 rounded bg-black/70 px-1 text-[0.55rem] font-semibold text-white">
                    {t.sponsored}
                  </span>
                )}
                {i === 0 && (
                  <span className="absolute top-1.5 left-1.5 rounded bg-white/90 px-1 text-[0.55rem] font-semibold text-green-700">
                    #1
                  </span>
                )}
              </div>
              <div className="p-2">
                <p className="truncate text-[0.7rem] font-semibold">{p.name}</p>
                <p className="mt-0.5 flex items-center gap-0.5 text-[0.62rem] text-muted-foreground">
                  <Star className="size-2.5 fill-amber-400 text-amber-400" />
                  {p.rating.toLocaleString(locale)}
                </p>
                <p className="mt-1 text-xs font-semibold">{p.price}</p>
                <p className="truncate text-[0.6rem] text-muted-foreground">{p.merchant}</p>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </MockRoot>
  );
}

/** Claims from an AI answer checked against reference material. */
export function FactcheckVisual({ locale, className }: { locale: Locale; className?: string }) {
  const t = vt(locale);
  const icon = {
    ok: <Check className="size-3.5" strokeWidth={3} />,
    bad: <X className="size-3.5" strokeWidth={3} />,
    warn: <AlertTriangle className="size-3.5" strokeWidth={2.5} />,
  };
  const tone = {
    ok: "bg-green-500/12 text-green-700 dark:text-green-300",
    bad: "bg-red-500/12 text-red-700 dark:text-red-300",
    warn: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  };
  return (
    <MockRoot className={className}>
      <Panel title={t.factTitle} live={t.live}>
        <ul className="space-y-1.5" style={vars({ n: t.claims.length + 1 })}>
          {t.claims.map((c, i) => {
            const status = c.status as keyof typeof tone;
            return (
              <li key={c.claim} className="flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-[0.75rem]">
                <span className={cn("mk-appear grid size-5 shrink-0 place-items-center rounded-full", tone[status])} style={vars({ i })}>
                  {icon[status]}
                </span>
                <span className="min-w-0 flex-1 truncate">{c.claim}</span>
                <span className={cn("mk-appear shrink-0 rounded px-1.5 py-0.5 text-[0.6rem] font-semibold", tone[status])} style={vars({ i })}>
                  {c.note}
                </span>
              </li>
            );
          })}
        </ul>
      </Panel>
    </MockRoot>
  );
}

export { LiveDot };
