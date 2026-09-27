"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Code2,
  ExternalLink,
  FileText,
  Info,
  Link2,
  Megaphone,
  PenLine,
  ShieldCheck,
  Sparkles,
  Wrench,
  XCircle,
} from "lucide-react";
import { Panel } from "@/components/app/page";
import { Meter } from "@/components/app/metrics";
import { CopyButton } from "@/components/app/misc";
import { EngineIcon } from "@/components/app/engine-icon";
import { Favicon } from "@/components/app/favicon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MarkdownAnswer, type Highlight } from "@/features/ai-tracking/components/markdown-answer";
import { cn } from "@/lib/utils";
import type {
  BotAccessStatus,
  CheckAction,
  CheckActionCategory,
  CheckAnswer,
  CheckBrand,
  CheckPrompt,
  CheckResults,
  FindingSeverity,
  ReadinessResult,
} from "../types";

/* ───────────────────────────── Small bits ───────────────────────────── */

export function SimulatedBadge({ engine }: { engine: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex h-5 items-center rounded-full bg-warning/15 px-1.5 text-[10px] font-medium text-warning ring-1 ring-warning/30 ring-inset">
          Simulated
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-64">Answered by an AI model with web search imitating {engine} — directional, not the live product.</TooltipContent>
    </Tooltip>
  );
}

const IMPACT_TONE = {
  high: "bg-brand/12 text-brand ring-brand/25",
  medium: "bg-info/12 text-info ring-info/25",
  low: "bg-muted text-muted-foreground ring-border",
} as const;

function Pill({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn("inline-flex h-5 items-center rounded-full px-2 text-[11px] font-medium ring-1 ring-inset", className)}>{children}</span>;
}

const CATEGORY_ICON: Record<CheckActionCategory, typeof Wrench> = {
  content: PenLine,
  mentions: Megaphone,
  technical: Wrench,
  "structured-data": Code2,
  crawlers: Bot,
};

/* ───────────────────────────── Actions ───────────────────────────── */

export function ActionsPanel({ actions, source }: { actions: CheckAction[]; source: CheckResults["actionsSource"] }) {
  if (!actions.length) {
    return (
      <Panel title="Your highest-impact actions" icon={<Sparkles className="size-4 text-brand" />}>
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
          Nothing urgent: the checks found no blocking issues. Keep your content current and track how AI answers change over time.
        </p>
      </Panel>
    );
  }
  return (
    <Panel
      title="Your 3 highest-impact actions"
      icon={<Sparkles className="size-4 text-brand" />}
      description={source === "ai" ? "Written by AI from the measured results below." : "Derived from the readiness checks and measured answers."}
    >
      <ol className="grid gap-3 lg:grid-cols-3">
        {actions.map((a, i) => {
          const Icon = CATEGORY_ICON[a.category] ?? Wrench;
          return (
            <motion.li
              key={a.title}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex min-w-0 flex-col rounded-xl border bg-background/60 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-foreground text-sm font-semibold text-background tabular">{i + 1}</span>
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <h3 className="mt-3 text-[15px] leading-snug font-semibold tracking-tight">{a.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{a.detail}</p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                <Pill className={IMPACT_TONE[a.impact]}>{a.impact} impact</Pill>
                <Pill className="bg-muted text-muted-foreground ring-border">{a.effort} effort</Pill>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </Panel>
  );
}

/* ───────────────────────────── Engines ───────────────────────────── */

export function EnginesPanel({ ai }: { ai: CheckResults["ai"] }) {
  const engines = ai.engines;
  if (!engines.length) return null;
  return (
    <Panel title="Per AI engine" description="How often each engine named you across the buyer prompts.">
      <ul className="divide-y">
        {engines.map((e) => (
          <li key={e.engine} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2">
                <EngineIcon id={e.engine} size="sm" />
                <span className="truncate text-sm font-medium">{e.name}</span>
                {e.simulated && <SimulatedBadge engine={e.name} />}
              </span>
              <span className="shrink-0 text-sm font-semibold tabular">{e.answers ? `${Math.round(e.mentionRate)}%` : "—"}</span>
            </div>
            {e.answers > 0 ? (
              <>
                <Meter value={e.mentionRate} />
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    Named in <span className="font-medium text-foreground tabular">{e.mentions}</span> of <span className="tabular">{e.answers}</span>
                  </span>
                  <span>
                    Avg. position <span className="font-medium text-foreground tabular">{e.avgPosition ?? "—"}</span>
                  </span>
                  <span>
                    Cited <span className="font-medium text-foreground tabular">{e.ownCitations}×</span>
                  </span>
                  {e.topCompetitor && (
                    <span className="min-w-0 truncate">
                      Most named rival <span className="font-medium text-foreground">{e.topCompetitor}</span>
                    </span>
                  )}
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">No answer: {e.error ?? "the engine didn't respond."}</p>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ───────────────────────────── Competitors ───────────────────────────── */

export function CompetitorsPanel({ ai }: { ai: CheckResults["ai"] }) {
  const brands = ai.brands.filter((b) => b.isOwn || b.mentions > 0);
  if (!ai.answers.length || brands.length === 0) return null;
  const unnamed = ai.brands.filter((b) => !b.isOwn && b.mentions === 0);
  return (
    <Panel title="You vs. competitors" description="Share of AI answers that name each brand.">
      <ol className="space-y-2.5">
        {brands.map((b, i) => (
          <li key={b.key} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span className="w-4 shrink-0 text-xs text-muted-foreground tabular">{i + 1}</span>
                <Favicon domain={b.domain} fallback={b.name} className="size-4 rounded" />
                <span className={cn("truncate", b.isOwn ? "font-semibold" : "font-medium")}>{b.name}</span>
                {b.isOwn && <Pill className="bg-brand/12 text-brand ring-brand/25">You</Pill>}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground tabular">
                {b.firstPlace > 0 && <span className="mr-2 hidden sm:inline">#1 in {b.firstPlace}×</span>}
                <span className="font-semibold text-foreground">{Math.round(b.mentionRate)}%</span>
              </span>
            </div>
            <div className="ml-6 h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                className={cn("h-full rounded-full", b.isOwn ? "bg-brand" : "bg-foreground/35")}
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.max(b.mentionRate, b.mentions ? 2 : 0)}%`,
                }}
                transition={{ duration: 0.6, delay: i * 0.04 }}
              />
            </div>
          </li>
        ))}
      </ol>
      {unnamed.length > 0 && <p className="mt-4 text-xs text-muted-foreground">Not named in any answer: {unnamed.map((b) => b.name).join(", ")}.</p>}
    </Panel>
  );
}

/* ───────────────────────────── Sources ───────────────────────────── */

const OWNER_LABEL = {
  own: "Your site",
  competitor: "Competitor",
  other: "Third party",
} as const;

export function SourcesPanel({ ai }: { ai: CheckResults["ai"] }) {
  if (!ai.answers.length) return null;
  return (
    <Panel title="Sources AI cites" description="Websites the answers linked to — the places to be mentioned.">
      {ai.sources.length === 0 ? (
        <p className="text-sm text-muted-foreground">The engines didn&apos;t cite any sources for these prompts.</p>
      ) : (
        <ul className="divide-y">
          {ai.sources.map((s) => (
            <li key={s.domain} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              <Favicon domain={s.domain} className="size-5 rounded" />
              <div className="min-w-0 flex-1">
                <a
                  href={s.sampleUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="flex min-w-0 items-center gap-1 text-sm font-medium hover:underline"
                >
                  <span className="truncate">{s.domain}</span>
                  <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                </a>
                {s.sampleTitle && <p className="truncate text-xs text-muted-foreground">{s.sampleTitle}</p>}
              </div>
              <Pill
                className={cn(
                  "hidden sm:inline-flex",
                  s.owner === "own"
                    ? "bg-brand/12 text-brand ring-brand/25"
                    : s.owner === "competitor"
                      ? "bg-warning/15 text-warning ring-warning/30"
                      : "bg-muted text-muted-foreground ring-border",
                )}
              >
                {s.competitor ?? OWNER_LABEL[s.owner]}
              </Pill>
              <span className="w-16 shrink-0 text-right text-xs text-muted-foreground tabular">
                {s.answers} {s.answers === 1 ? "answer" : "answers"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/* ───────────────────────────── Prompts × engines ───────────────────────────── */

const FUNNEL_LABEL = {
  tofu: "Awareness",
  mofu: "Consideration",
  bofu: "Decision",
} as const;

function highlightsFor(domain: string, brand: CheckBrand | null): Highlight[] {
  if (!brand) return [];
  return [
    {
      name: brand.name,
      terms: [brand.name, ...brand.aliases, domain],
      kind: "own",
    },
    ...brand.competitors.map((c) => ({
      name: c.name,
      terms: [c.name, ...(c.domain ? [c.domain] : [])],
      kind: "competitor" as const,
    })),
  ];
}

export function PromptsPanel({ domain, brand, prompts, ai }: { domain: string; brand: CheckBrand | null; prompts: CheckPrompt[]; ai: CheckResults["ai"] }) {
  const [open, setOpen] = useState<string | null>(null);
  const highlights = useMemo(() => highlightsFor(domain, brand), [domain, brand]);
  const engines = ai.engines.filter((e) => e.answers > 0);
  if (!ai.answers.length || !prompts.length) return null;
  const answerOf = (i: number, engine: string) => ai.answers.find((a) => a.promptIndex === i && a.engine === engine);
  const nameOf = (key: string) => (key === "own" ? (brand?.name ?? domain) : (brand?.competitors[Number(key.slice(1))]?.name ?? key));

  return (
    <Panel title="Buyer prompts & answers" description="The questions we asked. Open a result to read the full answer.">
      <ul className="space-y-3">
        {prompts.map((p, i) => (
          <li key={p.text} className="rounded-xl border bg-background/60">
            <div className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm leading-6 font-medium">“{p.text}”</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {p.topic} · {FUNNEL_LABEL[p.funnelStage]}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-1.5">
                {engines.map((e) => {
                  const a = answerOf(i, e.engine);
                  const key = `${i}:${e.engine}`;
                  const active = open === key;
                  return (
                    <button
                      key={e.engine}
                      type="button"
                      disabled={!a}
                      onClick={() => setOpen(active ? null : key)}
                      aria-expanded={active}
                      className={cn(
                        "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2 text-xs font-medium transition-colors disabled:opacity-50",
                        a?.mentioned ? "border-brand/30 bg-brand/10 text-brand" : "bg-background text-muted-foreground",
                        active && "ring-2 ring-ring/40",
                      )}
                    >
                      <EngineIcon id={e.engine} size="xs" withTooltip={false} />
                      {!a ? "—" : a.mentioned ? `#${a.position}` : a.noAnswer ? "No AI answer" : "Not named"}
                      <ChevronDown className={cn("size-3 transition-transform", active && "rotate-180")} />
                    </button>
                  );
                })}
              </div>
            </div>
            {engines.map((e) => {
              const a = answerOf(i, e.engine);
              if (!a || open !== `${i}:${e.engine}`) return null;
              return <AnswerDetail key={e.engine} answer={a} engineName={e.name} highlights={highlights} nameOf={nameOf} />;
            })}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function AnswerDetail({
  answer,
  engineName,
  highlights,
  nameOf,
}: {
  answer: CheckAnswer;
  engineName: string;
  highlights: Highlight[];
  nameOf: (key: string) => string;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 border-t px-3.5 py-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <EngineIcon id={answer.engine} size="xs" withTooltip={false} />
        <span className="font-medium text-foreground">{engineName}</span>
        <span>· {answer.model}</span>
        {answer.simulated && <SimulatedBadge engine={engineName} />}
        {answer.brands.length > 0 && <span>· Named: {answer.brands.map(nameOf).join(" → ")}</span>}
      </div>
      {answer.noAnswer ? (
        <p className="rounded-lg border bg-card px-3 py-2.5 text-sm text-muted-foreground">
          {engineName} showed no AI answer for this question — buyers see regular results instead, so no brand is recommended here.
        </p>
      ) : (
        <div className="max-h-[28rem] overflow-y-auto rounded-lg border bg-card px-3 py-1">
          <MarkdownAnswer text={answer.excerpt} highlights={highlights} />
        </div>
      )}
      {answer.citations.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {answer.citations.map((c) => (
            <a
              key={c.url}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <Favicon domain={c.domain} className="size-3.5 rounded-sm" />
              <span className="truncate">{c.domain}</span>
            </a>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ───────────────────────────── Readiness ───────────────────────────── */

const BOT_TONE: Record<BotAccessStatus, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
  allowed: { label: "Allowed", cls: "text-success", Icon: CheckCircle2 },
  partial: { label: "Partly blocked", cls: "text-warning", Icon: CircleAlert },
  blocked: { label: "Blocked", cls: "text-destructive", Icon: XCircle },
};

const PURPOSE_LABEL = {
  search: "AI search",
  user: "User fetch",
  training: "Training",
} as const;

const SEVERITY: Record<FindingSeverity, { Icon: typeof Info; cls: string }> = {
  critical: { Icon: XCircle, cls: "text-destructive" },
  warning: { Icon: AlertTriangle, cls: "text-warning" },
  info: { Icon: Info, cls: "text-info" },
  pass: { Icon: CheckCircle2, cls: "text-success" },
};

function Signal({ label, value, ok }: { label: string; value: React.ReactNode; ok: boolean | null }) {
  return (
    <div className="min-w-0 rounded-lg bg-muted/50 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {ok === null ? <Info className="size-3" /> : ok ? <CheckCircle2 className="size-3 text-success" /> : <AlertTriangle className="size-3 text-warning" />}
        {label}
      </div>
      <div className="mt-0.5 truncate text-sm font-medium">{value}</div>
    </div>
  );
}

export function ReadinessPanel({ readiness }: { readiness: ReadinessResult }) {
  const [showPasses, setShowPasses] = useState(false);
  const page = readiness.page;
  const open = readiness.findings.filter((f) => f.severity !== "pass");
  const passes = readiness.findings.filter((f) => f.severity === "pass");
  return (
    <div className="space-y-4">
      <Panel
        title="AI crawler access"
        icon={<Bot className="size-4" />}
        description={`robots.txt rules per crawler${readiness.robots.found ? "" : " (no robots.txt found — everything allowed)"}.`}
      >
        <div className="-mx-4 overflow-x-auto sm:-mx-5">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="px-4 pb-2 font-medium sm:px-5">Crawler</th>
                <th className="pb-2 font-medium">Used for</th>
                <th className="pb-2 font-medium">Access</th>
                <th className="px-4 pb-2 font-medium sm:px-5">Rule</th>
              </tr>
            </thead>
            <tbody>
              {readiness.bots.map((b) => {
                const tone = BOT_TONE[b.status];
                return (
                  <tr key={b.token} className="border-b last:border-0">
                    <td className="px-4 py-2 sm:px-5">
                      <div className="font-medium">{b.name}</div>
                      <div className="text-[11px] text-muted-foreground">{b.company}</div>
                    </td>
                    <td className="py-2 text-xs text-muted-foreground">{PURPOSE_LABEL[b.purpose]}</td>
                    <td className="py-2">
                      <span className={cn("inline-flex items-center gap-1 text-xs font-medium", tone.cls)}>
                        <tone.Icon className="size-3.5" />
                        {tone.label}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono text-[11px] text-muted-foreground sm:px-5">
                      {b.rule ? `${b.rule}${b.line ? ` (line ${b.line})` : ""}` : b.source === "none" ? "no rules" : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {readiness.firewall && (
          <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
            Firewall probe as {readiness.firewall.userAgent}:{" "}
            {readiness.firewall.verdict === "ok"
              ? "same page as a browser."
              : readiness.firewall.verdict === "blocked"
                ? `blocked (${readiness.firewall.reason}).`
                : readiness.firewall.verdict === "different"
                  ? `different content (${readiness.firewall.reason}).`
                  : `inconclusive${readiness.firewall.reason ? ` (${readiness.firewall.reason})` : ""}.`}
          </p>
        )}
      </Panel>

      <Panel
        title="What AI crawlers see"
        icon={<FileText className="size-4" />}
        description="Raw HTML of the homepage — most AI crawlers don't run JavaScript."
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Signal
            label="HTTP"
            ok={readiness.http.status !== null && readiness.http.status < 400 && readiness.http.https}
            value={
              readiness.http.status === null
                ? "Unreachable"
                : `${readiness.http.status}${readiness.http.https ? " · HTTPS" : " · no HTTPS"}${readiness.http.redirects.length ? ` · ${readiness.http.redirects.length} redirect${readiness.http.redirects.length === 1 ? "" : "s"}` : ""}`
            }
          />
          <Signal
            label="Text without JavaScript"
            ok={page ? page.rendering === "ssr" : false}
            value={page ? `${page.wordCount.toLocaleString("en-US")} words` : "—"}
          />
          <Signal
            label="Structured data"
            ok={page ? page.jsonLdCount > 0 : false}
            value={page?.jsonLdTypes.length ? page.jsonLdTypes.slice(0, 4).join(", ") : "None"}
          />
          <Signal label="Title" ok={Boolean(page?.title)} value={page?.title || "Missing"} />
          <Signal label="Meta description" ok={Boolean(page?.metaDescription)} value={page?.metaDescription || "Missing"} />
          <Signal
            label="Canonical · language"
            ok={Boolean(page?.canonical && page?.lang)}
            value={`${page?.canonical ? "Canonical set" : "No canonical"} · ${page?.lang ?? "no lang"}`}
          />
          <Signal
            label="llms.txt"
            ok={readiness.llmsTxt.present ? true : null}
            value={readiness.llmsTxt.present ? `Found · ${readiness.llmsTxt.links} links` : "Not found (optional)"}
          />
          <Signal
            label="robots.txt"
            ok={!readiness.robots.unreachable}
            value={
              readiness.robots.found
                ? `Found · ${readiness.robots.sitemaps} sitemap${readiness.robots.sitemaps === 1 ? "" : "s"}`
                : readiness.robots.unreachable
                  ? `HTTP ${readiness.robots.status}`
                  : "Not found"
            }
          />
          <Signal
            label="Indexing"
            ok={page ? !page.noindex && page.aiDirectives.length === 0 : null}
            value={page?.noindex ? "noindex" : page?.aiDirectives.length ? page.aiDirectives.join(", ") : "Indexable"}
          />
        </div>
      </Panel>

      <Panel title="Findings" icon={<Link2 className="size-4" />} description={`${open.length} to fix · ${passes.length} passed`}>
        <ul className="space-y-2.5">
          {(showPasses ? readiness.findings : open).map((f) => {
            const s = SEVERITY[f.severity];
            return (
              <li key={f.id} className="rounded-xl border bg-background/60 p-3.5">
                <div className="flex items-start gap-2.5">
                  <s.Icon className={cn("mt-0.5 size-4 shrink-0", s.cls)} />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-medium">{f.title}</p>
                    <p className="text-sm leading-6 break-words text-muted-foreground">{f.detail}</p>
                    {f.fix && <p className="text-sm leading-6">{f.fix}</p>}
                    {f.snippet && (
                      <div className="relative mt-2">
                        <pre className="overflow-x-auto rounded-lg bg-muted p-3 pr-12 font-mono text-[12px] leading-5">{f.snippet}</pre>
                        <CopyButton value={f.snippet} size="icon" className="absolute top-1.5 right-1.5" />
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
          {open.length === 0 && !showPasses && <li className="text-sm text-muted-foreground">Nothing to fix — nice.</li>}
        </ul>
        {passes.length > 0 && (
          <button
            type="button"
            onClick={() => setShowPasses((v) => !v)}
            className="mt-3 text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {showPasses ? "Hide passed checks" : `Show ${passes.length} passed check${passes.length === 1 ? "" : "s"}`}
          </button>
        )}
      </Panel>
    </div>
  );
}
