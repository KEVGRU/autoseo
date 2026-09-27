import { AlertTriangle, ArrowUpRight, Bot, Check, LoaderCircle, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { directory, monogram } from "../catalog/directory";
import { CountUp } from "../count-up";
import type { Locale } from "../locales";
import { LogoMark } from "../primitives";
import { LiveDot, MockRoot, Monogram, Panel, vars, vt } from "./shared";

const referrers = [
  { name: "chatgpt.com", value: 1284, color: "#10a37f" },
  { name: "perplexity.ai", value: 412, color: "#20808d" },
  { name: "gemini.google.com", value: 198, color: "#8e75ff" },
  { name: "copilot.microsoft.com", value: 87, color: "#0078d4" },
];

/** AI referral traffic: area chart that draws in, referrers with counts. */
export function TrafficVisual({ locale, className }: { locale: Locale; className?: string }) {
  const t = vt(locale);
  const line = "M0 70 C 20 66, 30 58, 45 60 S 70 48, 85 44 S 110 40, 125 30 S 150 26, 165 18 S 185 12, 200 8";
  const max = referrers[0].value;
  return (
    <MockRoot className={className}>
      <Panel title={t.trafficTitle} aside={<span className="text-muted-foreground">{t.last30}</span>}>
        <p className="text-2xl font-semibold tracking-tight tabular-nums">
          <CountUp value={1981} lang={locale} />
          <span className="ml-2 inline-flex items-center text-xs font-medium text-green-700 dark:text-green-400">
            <ArrowUpRight className="size-3.5" />
            +18%
          </span>
        </p>
        <svg viewBox="0 0 200 80" preserveAspectRatio="none" className="mt-2 h-20 w-full overflow-visible">
          <defs>
            <linearGradient id="mk-traffic-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgb(34 197 94 / 0.35)" />
              <stop offset="100%" stopColor="rgb(34 197 94 / 0)" />
            </linearGradient>
          </defs>
          <path d={`${line} L200 80 L0 80 Z`} fill="url(#mk-traffic-fill)" className="mk-pop" />
          <path d={line} pathLength={1} fill="none" strokeWidth="2" vectorEffect="non-scaling-stroke" className="mk-draw stroke-green-500" />
        </svg>
        <ul className="mt-3 space-y-1.5">
          {referrers.map((r, i) => (
            <li key={r.name} className="grid grid-cols-[1fr_4rem_2.75rem] items-center gap-2 text-[0.72rem]">
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: r.color }} />
                <span className="truncate">{r.name}</span>
              </span>
              <span className="h-1.5 overflow-hidden rounded-full bg-muted">
                <span
                  className="mk-grow-x block h-full rounded-full"
                  style={{ width: `${(r.value / max) * 100}%`, backgroundColor: r.color, ...vars({ d: i }) }}
                />
              </span>
              <span className="text-right font-semibold tabular-nums">
                <CountUp value={r.value} lang={locale} />
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </MockRoot>
  );
}

const botHits = [
  { bot: "GPTBot", path: "/pricing", color: "#10a37f" },
  { bot: "ClaudeBot", path: "/blog/geo-guide", color: "#d97757" },
  { bot: "PerplexityBot", path: "/docs/setup", color: "#20808d" },
  { bot: "OAI-SearchBot", path: "/", color: "#10a37f" },
  { bot: "Googlebot", path: "/features", color: "#4285f4" },
  { bot: "Claude-SearchBot", path: "/compare", color: "#d97757" },
  { bot: "Bingbot", path: "/blog", color: "#008373" },
  { bot: "ChatGPT-User", path: "/integrations", color: "#10a37f" },
];

/** Live feed of AI crawler requests. */
export function BotsVisual({ locale, className }: { locale: Locale; className?: string }) {
  const t = vt(locale);
  const rows = [...botHits, ...botHits];
  return (
    <MockRoot className={className}>
      <Panel title={t.botsTitle} live={t.live}>
        <div className="flex h-8 items-end gap-[3px]">
          {Array.from({ length: 28 }, (_, i) => (
            <span
              key={i}
              className="mk-eq w-full origin-bottom rounded-sm bg-green-500/70"
              style={{ height: `${30 + ((i * 37) % 70)}%`, ...vars({ i }) }}
            />
          ))}
        </div>
        <div className="mt-3 h-44 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_85%,transparent)]">
          <ul className="mk-feed space-y-1.5" style={vars({ "mk-duration": "16s" })}>
            {rows.map((hit, i) => (
              <li
                key={i}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-lg border bg-background px-2.5 py-1.5 font-mono text-[0.68rem]"
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: hit.color }} />
                  {hit.bot}
                </span>
                <span className="truncate text-muted-foreground">{hit.path}</span>
                <span className="rounded bg-green-500/12 px-1 text-green-700 dark:text-green-300">200</span>
              </li>
            ))}
          </ul>
        </div>
      </Panel>
    </MockRoot>
  );
}

/** Health score ring with a checklist. */
export function AuditVisual({ locale, className }: { locale: Locale; className?: string }) {
  const t = vt(locale);
  return (
    <MockRoot className={className}>
      <Panel title={t.auditTitle} live={t.live}>
        <div className="flex items-center gap-5">
          <div className="relative size-24 shrink-0">
            <svg viewBox="0 0 100 100" className="size-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" strokeWidth="9" className="stroke-muted" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                strokeWidth="9"
                strokeLinecap="round"
                pathLength={1}
                style={vars({ "mk-len": 0.92 })}
                className="mk-draw stroke-green-500"
              />
            </svg>
            <span className="absolute inset-0 grid place-items-center text-2xl font-semibold tabular-nums">
              <CountUp value={92} lang={locale} />
            </span>
          </div>
          <ul className="min-w-0 flex-1 space-y-1.5">
            {t.checks.map((c, i) => (
              <li key={c.label} className="mk-appear flex items-center gap-2 text-[0.72rem]" style={vars({ i })}>
                <span
                  className={cn(
                    "grid size-4 shrink-0 place-items-center rounded-full",
                    c.ok ? "bg-green-500/15 text-green-700 dark:text-green-300" : "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                  )}
                >
                  {c.ok ? <Check className="size-2.5" strokeWidth={3.5} /> : <AlertTriangle className="size-2.5" strokeWidth={3} />}
                </span>
                <span className="truncate">{c.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </Panel>
    </MockRoot>
  );
}

/** Keyword table with volume bars and difficulty. */
export function KeywordsVisual({ locale, className }: { locale: Locale; className?: string }) {
  const t = vt(locale);
  const max = Math.max(...t.keywords.map((k) => k.volume));
  return (
    <MockRoot className={className}>
      <Panel title={t.keywordsTitle} live={t.live}>
        <div className="grid grid-cols-[1fr_4.5rem_2rem_5rem] gap-2 border-b pb-1.5 text-[0.62rem] font-medium tracking-wide text-muted-foreground uppercase">
          {t.keywordHead.map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>
        <ul style={vars({ n: t.keywords.length })}>
          {t.keywords.map((k, i) => (
            <li
              key={k.kw}
              className="mk-cycle grid grid-cols-[1fr_4.5rem_2rem_5rem] items-center gap-2 rounded-md py-1.5 text-[0.72rem]"
              style={vars({ i })}
            >
              <span className="truncate font-medium">{k.kw}</span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <span className="mk-grow-x block h-full rounded-full bg-sky-500" style={{ width: `${(k.volume / max) * 100}%`, ...vars({ d: i }) }} />
                </span>
                <span className="w-8 text-right tabular-nums">{k.volume.toLocaleString(locale)}</span>
              </span>
              <span
                className={cn(
                  "rounded px-1 text-center font-semibold tabular-nums",
                  k.kd < 30 ? "bg-green-500/15 text-green-700 dark:text-green-300" : k.kd < 50 ? "bg-amber-500/15 text-amber-700 dark:text-amber-300" : "bg-red-500/12 text-red-700 dark:text-red-300",
                )}
              >
                {k.kd}
              </span>
              <span className="truncate text-muted-foreground">{k.intent}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </MockRoot>
  );
}

/** Rank history: two lines draw in, the position improves. */
export function RankchartVisual({ locale, className }: { locale: Locale; className?: string }) {
  const t = vt(locale);
  const desktop = "M0 62 L25 58 L50 60 L75 46 L100 42 L125 30 L150 26 L175 14 L200 10";
  const mobile = "M0 70 L25 68 L50 64 L75 60 L100 52 L125 48 L150 38 L175 30 L200 24";
  return (
    <MockRoot className={className}>
      <Panel
        title={t.rankTitle}
        aside={
          <span className="rounded-full bg-green-500/12 px-2 py-0.5 font-semibold text-green-700 dark:text-green-300">#7 → #2</span>
        }
      >
        <svg viewBox="0 0 200 80" preserveAspectRatio="none" className="h-32 w-full overflow-visible">
          {[16, 40, 64].map((y) => (
            <line key={y} x1="0" x2="200" y1={y} y2={y} strokeWidth="1" vectorEffect="non-scaling-stroke" className="stroke-border" strokeDasharray="3 4" />
          ))}
          <path d={mobile} pathLength={1} fill="none" strokeWidth="2" vectorEffect="non-scaling-stroke" className="mk-draw stroke-sky-500/70" />
          <path d={desktop} pathLength={1} fill="none" strokeWidth="2.5" vectorEffect="non-scaling-stroke" className="mk-draw stroke-green-500" />
        </svg>
        <div className="mt-2 flex gap-4 text-[0.7rem] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-3 rounded bg-green-500" />
            {t.desktop}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-3 rounded bg-sky-500/70" />
            {t.mobile}
          </span>
        </div>
      </Panel>
    </MockRoot>
  );
}

/** Task list whose items tick off one by one. */
export function TasksVisual({ locale, className }: { locale: Locale; className?: string }) {
  const t = vt(locale);
  return (
    <MockRoot className={className}>
      <Panel title={t.tasksTitle} live={t.live}>
        <ul className="space-y-1.5">
          {t.tasks.map((task, i) => (
            <li key={task.title} className="flex items-center gap-2.5 rounded-lg border bg-background px-2.5 py-2 text-[0.74rem]">
              <span className="relative grid size-4 shrink-0 place-items-center rounded border">
                <span className="mk-appear absolute inset-0 grid place-items-center rounded bg-green-500 text-white" style={vars({ i })}>
                  <Check className="size-3" strokeWidth={3.5} />
                </span>
              </span>
              <span className="min-w-0 flex-1 truncate">{task.title}</span>
              <span
                className={cn(
                  "shrink-0 rounded px-1.5 py-0.5 text-[0.6rem] font-semibold",
                  i < 2 ? "bg-red-500/12 text-red-700 dark:text-red-300" : "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                )}
              >
                {task.priority}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-medium">
          <Monogram text="JI" color="#0052cc" className="size-4 text-[0.5rem]" />
          {t.syncedTo}
        </p>
      </Panel>
    </MockRoot>
  );
}

/** Content draft being written, with coverage and sources. */
export function ContentVisual({ locale, className }: { locale: Locale; className?: string }) {
  const t = vt(locale);
  const lines = [100, 94, 97, 70, 0, 100, 88, 92, 60];
  return (
    <MockRoot className={className}>
      <Panel title={t.contentTitle} live={t.live}>
        <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
          <div className="min-w-0 rounded-xl border bg-background p-3">
            <p className="text-[0.8rem] leading-5 font-semibold">{t.docTitle}</p>
            <div className="mt-2.5 space-y-1.5">
              {lines.map((w, i) =>
                w === 0 ? (
                  <div key={i} className="h-1.5" />
                ) : (
                  <div
                    key={i}
                    className="mk-sheen h-1.5 rounded-full bg-[linear-gradient(90deg,var(--muted)_30%,color-mix(in_oklch,var(--brand)_35%,var(--muted))_50%,var(--muted)_70%)]"
                    style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }}
                  />
                ),
              )}
            </div>
          </div>
          <div className="space-y-3 text-[0.68rem]">
            <div>
              <p className="flex justify-between text-muted-foreground">
                {t.promptsCovered}
                <span className="font-semibold text-foreground">8/10</span>
              </p>
              <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-muted">
                <span className="mk-grow-x block h-full w-4/5 rounded-full bg-green-500" />
              </span>
            </div>
            <div>
              <p className="text-muted-foreground">{t.citeThese}</p>
              <ul className="mt-1 space-y-1">
                {["g2.com", "reddit.com", "top10tools.io"].map((d, i) => (
                  <li key={d} className="mk-pop truncate font-medium" style={vars({ d: i + 2 })}>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <span className="mk-pulse inline-flex w-full items-center justify-center gap-1 rounded-lg bg-foreground px-2 py-1.5 font-semibold text-background">
              <Send className="size-3" />
              <span className="truncate">{t.publishTo}</span>
            </span>
          </div>
        </div>
      </Panel>
    </MockRoot>
  );
}

const reportBars = [42, 55, 48, 63, 58, 71];

/** A branded report slide with KPIs and a chart. */
export function ReportVisual({ locale, className }: { locale: Locale; className?: string }) {
  const t = vt(locale);
  return (
    <MockRoot className={className}>
      <Panel className="p-0 sm:p-0">
        <div className="flex items-center justify-between border-b px-4 py-3 text-xs">
          <span className="flex items-center gap-2 font-semibold">
            <Monogram text="AC" color="#16a34a" />
            Acme
          </span>
          <span className="text-muted-foreground">
            {t.reportTitle} · {t.reportPeriod}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 p-4">
          <div className="mk-pop rounded-xl border p-3" style={vars({ d: 0 })}>
            <p className="text-[0.65rem] text-muted-foreground">{t.visibility}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
              <CountUp value={71} suffix="%" lang={locale} />
            </p>
          </div>
          <div className="mk-pop rounded-xl border p-3" style={vars({ d: 1 })}>
            <p className="text-[0.65rem] text-muted-foreground">{t.citations}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
              <CountUp value={1284} lang={locale} />
            </p>
          </div>
          <div className="col-span-2 flex h-24 items-end gap-2 rounded-xl border p-3">
            {reportBars.map((h, i) => (
              <span
                key={i}
                className={cn("mk-grow-y w-full rounded-t-md", i === reportBars.length - 1 ? "bg-green-500" : "bg-foreground/15")}
                style={{ height: `${h}%`, ...vars({ d: i }) }}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-1.5 border-t px-4 py-2.5">
          {t.exportChips.map((c) => (
            <span key={c} className="rounded-md border px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground">
              {c}
            </span>
          ))}
        </div>
      </Panel>
    </MockRoot>
  );
}

/** Agent chat: question, tool steps, answer. */
export function AgentVisual({ locale, className }: { locale: Locale; className?: string }) {
  const t = vt(locale);
  return (
    <MockRoot className={className}>
      <Panel title="Agent" live={t.live}>
        <div className="flex justify-end">
          <p className="max-w-[88%] rounded-2xl rounded-br-md bg-foreground px-3.5 py-2 text-[0.78rem] text-background">
            {t.agentQuestion}
          </p>
        </div>
        <ul className="mt-3 space-y-1.5">
          {t.agentSteps.map((step, i) => (
            <li key={step} className="mk-appear flex items-center gap-2 text-[0.7rem] text-muted-foreground" style={vars({ i })}>
              <LoaderCircle className="size-3 text-green-600 motion-safe:animate-spin dark:text-green-400" />
              {step}
            </li>
          ))}
        </ul>
        <div className="mk-appear mt-3 flex gap-2" style={vars({ i: t.agentSteps.length })}>
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-green-500 text-white">
            <Sparkles className="size-3.5" />
          </span>
          <p className="rounded-2xl rounded-tl-md bg-muted px-3 py-2 text-[0.76rem] leading-5">{t.agentAnswer}</p>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-[0.72rem] text-muted-foreground">
          <Bot className="size-3.5" />
          {t.askAgent}
          <span className="mk-caret h-3.5 w-px bg-foreground" />
        </div>
      </Panel>
    </MockRoot>
  );
}

/** Terminal with a typed command and its output (REST API or MCP). */
export function TerminalVisual({ variant, className }: { variant: "api" | "mcp"; className?: string }) {
  const host = "https://app.autoseo.codext.de";
  const command =
    variant === "api"
      ? `curl ${host}/api/v1/projects/acme/metrics -H "Authorization: Bearer $AUTOSEO_API_KEY"`
      : `claude mcp add --transport http autoseo ${host}/api/mcp`;
  const output =
    variant === "api"
      ? ['{', '  "visibility": 0.71,', '  "mentionRate": 0.64,', '  "citationRate": 0.38,', '  "avgPosition": 1.8', '}']
      : ["✓ Connected to autoseo", "  get_visibility_metrics", "  get_competitor_ranking", "  get_top_sources", "  get_query_fanouts", "  … 100+ tools"];
  return (
    <div aria-hidden="true" data-animate="scale" data-loop="" className={cn("select-none", className)}>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e0d] text-left text-[#ecebe6] shadow-[0_24px_60px_-28px_oklch(0_0_0/0.6)]">
        <div className="flex h-9 items-center gap-1.5 border-b border-white/10 px-3.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-[0.68rem] text-white/45">{variant === "api" ? "REST API v1" : "MCP"}</span>
        </div>
        <div className="space-y-1 p-4 font-mono text-[0.72rem] leading-5">
          <p className="break-all">
            <span className="text-green-400">$ </span>
            {command}
          </p>
          {output.map((line, i) => (
            <p key={i} className={cn("mk-appear whitespace-pre", i === 0 && variant === "mcp" ? "text-green-400" : "text-white/70")} style={vars({ i: i + 1 })}>
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Integration tiles around the AutoSEO mark, pulsing one after another. */
export function IntegrationsVisual({ locale, className }: { locale: Locale; className?: string }) {
  const t = vt(locale);
  const tiles = directory.filter((d) => d.status !== "coming-soon").slice(0, 24);
  const cells = [...tiles.slice(0, 12), null, ...tiles.slice(12, 24)];
  return (
    <MockRoot className={className}>
      <Panel title={t.integrationsTitle} live={t.live}>
        <div className="grid grid-cols-5 gap-2">
          {cells.map((tile, i) =>
            tile ? (
              <span
                key={tile.key}
                className="mk-pulse grid aspect-square place-items-center rounded-xl border bg-background"
                style={vars({ i: (i * 7) % 11 })}
                title={tile.name}
              >
                <Monogram text={monogram(tile.name)} color={tile.color} className="size-7 rounded-lg text-[0.62rem]" />
              </span>
            ) : (
              <span key="center" className="relative grid aspect-square place-items-center rounded-xl border bg-background">
                <span className="mk-ping absolute inset-1 rounded-xl bg-green-500/30" />
                <LogoMark className="relative size-9 rounded-lg" />
              </span>
            ),
          )}
        </div>
      </Panel>
    </MockRoot>
  );
}

const pins = [
  { label: "US", value: "64%", top: "38%", left: "22%" },
  { label: "DE", value: "48%", top: "30%", left: "52%" },
  { label: "UK", value: "57%", top: "26%", left: "46%" },
  { label: "BR", value: "22%", top: "66%", left: "34%" },
  { label: "IN", value: "31%", top: "48%", left: "70%" },
];

/** Dotted globe with market pins. */
export function GlobeVisual({ locale, className }: { locale: Locale; className?: string }) {
  const t = vt(locale);
  return (
    <MockRoot className={className}>
      <Panel title={t.visibility} live={t.live}>
        <div className="relative mx-auto aspect-square w-full max-w-[17rem]">
          <div className="absolute inset-0 overflow-hidden rounded-full border bg-background shadow-[inset_-18px_-22px_40px_oklch(0_0_0/0.12),inset_10px_10px_30px_oklch(1_0_0/0.4)] dark:shadow-[inset_-18px_-22px_40px_oklch(0_0_0/0.6)]">
            <div className="mk-globe-dots mk-dots absolute inset-y-0 left-0 w-[200%] opacity-80" />
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,transparent_40%,var(--background)_85%)]" />
          </div>
          {pins.map((pin, i) => (
            <span key={pin.label} className="absolute" style={{ top: pin.top, left: pin.left }}>
              <span className="relative flex size-2.5">
                <span className="mk-ping absolute inline-flex size-full rounded-full bg-green-500" style={vars({ i })} />
                <span className="relative inline-flex size-2.5 rounded-full bg-green-500 ring-2 ring-background" />
              </span>
              <span className="mk-pop absolute top-3 left-1 rounded-md border bg-card px-1.5 py-0.5 text-[0.62rem] font-semibold whitespace-nowrap shadow-sm" style={vars({ d: i + 2 })}>
                {pin.label} <span className="text-green-700 dark:text-green-400">{pin.value}</span>
              </span>
            </span>
          ))}
        </div>
      </Panel>
    </MockRoot>
  );
}

export { LiveDot };
