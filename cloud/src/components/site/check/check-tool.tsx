"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check, ChevronDown, Circle, CircleAlert, LoaderCircle, RotateCcw, ShieldCheck, ShieldX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Inline } from "../inline";
import { fill, type CheckCopy } from "./copy";
import type { CheckEvent, CheckResult, Fix, StepId } from "./types";

const STEPS: StepId[] = ["fetch", "robots", "files", "analyze"];
type StepState = "pending" | "running" | "done";
type Phase = "idle" | "running" | "done" | "error";

function grade(score: number): "good" | "fair" | "poor" {
  return score >= 80 ? "good" : score >= 50 ? "fair" : "poor";
}

const gradeColor = {
  good: "text-green-600 dark:text-green-400",
  fair: "text-amber-600 dark:text-amber-400",
  poor: "text-red-600 dark:text-red-400",
};

const barColor = { good: "bg-green-600 dark:bg-green-500", fair: "bg-amber-500", poor: "bg-red-600 dark:bg-red-500" };

const severityStyle = {
  high: "border-red-600/30 bg-red-600/10 text-red-700 dark:text-red-300",
  medium: "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  low: "border-border bg-muted text-muted-foreground",
};

export function CheckTool({ copy, examples, signupHref, selfHostHref }: { copy: CheckCopy; examples: string[]; signupHref: string; selfHostHref: string }) {
  const [value, setValue] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [steps, setSteps] = useState<Record<StepId, StepState>>({ fetch: "pending", robots: "pending", files: "pending", analyze: "pending" });
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => {
    if (phase === "done") resultRef.current?.focus();
  }, [phase]);

  async function run(target: string) {
    const url = target.trim();
    if (!url) {
      inputRef.current?.focus();
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setPhase("running");
    setError(null);
    setResult(null);
    setSteps({ fetch: "pending", robots: "pending", files: "pending", analyze: "pending" });
    try {
      const res = await fetch("/api/ai-visibility-check", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/x-ndjson" },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const body = (await res.json().catch(() => null)) as { error?: string; code?: string } | null;
        setError(res.status === 429 ? copy.errors.rateLimited : (body?.error ?? copy.errors.generic));
        setPhase("error");
        return;
      }
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";
      let finished = false;
      while (!finished) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        buffer += chunk;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as CheckEvent;
          if (event.type === "step") setSteps((s) => ({ ...s, [event.step]: event.status }));
          else if (event.type === "result") {
            setResult(event.result);
            setPhase("done");
            finished = true;
          } else {
            setError(event.error || copy.errors.generic);
            setPhase("error");
            finished = true;
          }
        }
      }
      if (!finished) {
        setError(copy.errors.generic);
        setPhase("error");
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError(copy.errors.network);
      setPhase("error");
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void run(value);
  }

  function reset() {
    abortRef.current?.abort();
    setPhase("idle");
    setResult(null);
    setError(null);
    setValue("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  const running = phase === "running";

  return (
    <div>
      <form onSubmit={onSubmit} className="rounded-3xl border bg-card p-4 shadow-[0_20px_60px_-30px_oklch(0_0_0/0.25)] sm:p-6" noValidate>
        <label htmlFor="ai-check-url" className="text-sm font-medium">
          {copy.form.label}
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            ref={inputRef}
            id="ai-check-url"
            name="url"
            type="text"
            inputMode="url"
            autoComplete="url"
            autoCapitalize="none"
            spellCheck={false}
            required
            maxLength={500}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={copy.form.placeholder}
            aria-describedby="ai-check-privacy"
            aria-invalid={phase === "error" ? true : undefined}
            className="h-12 w-full min-w-0 rounded-full border border-input bg-background px-5 text-base outline-none transition-shadow placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <button
            type="submit"
            disabled={running}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 text-[0.95rem] font-medium text-primary-foreground shadow-sm transition-colors outline-none hover:bg-primary/85 focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-70"
          >
            {running ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <ArrowRight className="size-4" aria-hidden="true" />}
            {running ? copy.form.running : copy.form.submit}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{copy.form.examples}</span>
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              disabled={running}
              onClick={() => {
                setValue(ex);
                void run(ex);
              }}
              className="rounded-full border bg-background px-3 py-1 font-mono text-xs text-foreground transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none disabled:opacity-60"
            >
              {ex}
            </button>
          ))}
        </div>
        <p id="ai-check-privacy" className="mt-3 text-xs leading-5 text-muted-foreground">
          {copy.form.privacy}
        </p>
      </form>

      <div aria-live="polite" className="mt-6">
        {running && (
          <ol className="grid gap-2 rounded-2xl border bg-card p-4 sm:p-5">
            {STEPS.map((id) => {
              const state = steps[id];
              return (
                <li key={id} className="flex items-center gap-3 text-sm">
                  {state === "done" ? (
                    <Check className="size-4 shrink-0 text-green-600 dark:text-green-400" aria-hidden="true" />
                  ) : state === "running" ? (
                    <LoaderCircle className="size-4 shrink-0 animate-spin text-foreground" aria-hidden="true" />
                  ) : (
                    <Circle className="size-4 shrink-0 text-muted-foreground/50" aria-hidden="true" />
                  )}
                  <span className={cn(state === "pending" && "text-muted-foreground")}>{copy.steps[id]}</span>
                  <span className="sr-only">({copy.stepState[state]})</span>
                </li>
              );
            })}
          </ol>
        )}
        {phase === "error" && error && (
          <p role="alert" className="flex items-start gap-2 rounded-2xl border border-red-600/30 bg-red-600/5 p-4 text-sm text-red-800 dark:text-red-300">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>

      {phase === "done" && result && (
        <Results result={result} copy={copy} resultRef={resultRef} onReset={reset} signupHref={signupHref} selfHostHref={selfHostHref} />
      )}
    </div>
  );
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const g = grade(score);
  return (
    <div className="relative size-36 shrink-0" role="img" aria-label={label}>
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-muted" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          className={cn("transition-[stroke-dashoffset] duration-700", gradeColor[g])}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
        <div className="text-center">
          <div className="text-4xl font-semibold tracking-tight tabular-nums">{score}</div>
        </div>
      </div>
    </div>
  );
}

function Results({
  result,
  copy,
  resultRef,
  onReset,
  signupHref,
  selfHostHref,
}: {
  result: CheckResult;
  copy: CheckCopy;
  resultRef: React.RefObject<HTMLHeadingElement | null>;
  onReset: () => void;
  signupHref: string;
  selfHostHref: string;
}) {
  const t = copy.result;
  const g = grade(result.score);
  const checkedAt = new Date(result.checkedAt);
  return (
    <section aria-labelledby="ai-check-result" className="mt-8 space-y-6">
      <div className="rounded-3xl border bg-card p-5 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <ScoreRing score={result.score} label={`${t.scoreLabel}: ${result.score} ${t.outOf}`} />
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{t.scoreLabel}</p>
            <h2 id="ai-check-result" ref={resultRef} tabIndex={-1} className="mt-1 text-2xl font-semibold tracking-tight break-words outline-none sm:text-3xl">
              {result.host}: <span className={gradeColor[g]}>{t.grades[g]}</span>
            </h2>
            <p className="mt-2 text-pretty text-muted-foreground">{t.gradeText[g]}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              {t.checked} <time dateTime={result.checkedAt}>{checkedAt.toLocaleString()}</time> · {fill(t.duration, { s: (result.durationMs / 1000).toFixed(1) })}
            </p>
            <button
              type="button"
              onClick={onReset}
              className="mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              {t.again}
            </button>
          </div>
        </div>

        <h3 className="mt-8 text-sm font-semibold">{t.categoriesTitle}</h3>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {result.categories.map((cat) => {
            const cg = grade(cat.score);
            return (
              <li key={cat.key} className="rounded-xl border p-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium">{t.categories[cat.key].label}</span>
                  <span className={cn("text-sm font-semibold tabular-nums", gradeColor[cg])}>{cat.score}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-muted" aria-hidden="true">
                  <div className={cn("h-full rounded-full", barColor[cg])} style={{ width: `${cat.score}%` }} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t.categories[cat.key].hint} · {cat.weight}%
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-3xl border bg-card p-5 sm:p-8">
        <h3 className="text-xl font-semibold tracking-tight">{t.fixesTitle}</h3>
        {result.fixes.length === 0 ? (
          <p className="mt-3 text-muted-foreground">{t.fixesEmpty}</p>
        ) : (
          <ol className="mt-4 divide-y rounded-2xl border">
            {result.fixes.map((fix, i) => (
              <FixItem key={`${fix.id}-${i}`} fix={fix} copy={copy} open={i < 3} />
            ))}
          </ol>
        )}
      </div>

      {result.robots.bots.length > 0 && (
        <div className="rounded-3xl border bg-card p-5 sm:p-8">
          <h3 className="text-xl font-semibold tracking-tight">{t.botsTitle}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t.botsSubtitle}</p>
          <ul className="mt-4 divide-y rounded-xl border sm:hidden">
            {result.robots.bots.map((bot) => (
              <li key={bot.token} className="p-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-mono text-[0.8rem] font-medium">{bot.token}</span>
                    <span className="block text-xs text-muted-foreground">
                      {bot.operator} · {t.purposes[bot.purpose]}
                    </span>
                  </div>
                  <BotStatus allowed={bot.allowed} copy={copy} />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground [overflow-wrap:anywhere]">
                  {bot.rule ? `${bot.rule.type === "allow" ? "Allow" : "Disallow"}: ${bot.rule.pattern} · L${bot.rule.line} · ` : ""}
                  {t.source[bot.source]}
                </p>
                {bot.mayIgnoreRobots && <p className="mt-1 text-xs text-muted-foreground">{t.mayIgnore}</p>}
              </li>
            ))}
          </ul>
          <div className="mt-4 hidden overflow-x-auto rounded-xl border sm:block" tabIndex={0} role="region" aria-label={t.botsTitle}>
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th scope="col" className="px-3 py-2 font-semibold">{t.botsHead.bot}</th>
                  <th scope="col" className="px-3 py-2 font-semibold">{t.botsHead.purpose}</th>
                  <th scope="col" className="px-3 py-2 font-semibold">{t.botsHead.status}</th>
                  <th scope="col" className="px-3 py-2 font-semibold">{t.botsHead.rule}</th>
                </tr>
              </thead>
              <tbody>
                {result.robots.bots.map((bot) => (
                  <tr key={bot.token} className="border-b align-top last:border-0">
                    <th scope="row" className="px-3 py-2 font-medium">
                      <span className="font-mono text-[0.8rem]">{bot.token}</span>
                      <span className="block text-xs font-normal text-muted-foreground">{bot.operator}</span>
                    </th>
                    <td className="px-3 py-2 text-muted-foreground">{t.purposes[bot.purpose]}</td>
                    <td className="px-3 py-2">
                      <BotStatus allowed={bot.allowed} copy={copy} />
                      {bot.mayIgnoreRobots && <span className="mt-1 block text-xs text-muted-foreground">{t.mayIgnore}</span>}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {bot.rule ? (
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                          {bot.rule.type === "allow" ? "Allow" : "Disallow"}: {bot.rule.pattern}
                        </code>
                      ) : null}
                      <span className="block text-xs whitespace-nowrap">
                        {t.source[bot.source]}
                        {bot.rule ? ` · L${bot.rule.line}` : ""}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Details result={result} copy={copy} />

      <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-4 text-sm leading-6 text-foreground/85">
        <Inline text={t.readinessNote} />
      </div>

      <div className="mk-dark-panel relative overflow-hidden rounded-3xl px-6 py-10 text-center text-white sm:px-10">
        <div className="mk-dots-light absolute inset-0" aria-hidden="true" />
        <div className="relative">
          <h3 className="mx-auto max-w-xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{t.cta.title}</h3>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-white/75">{t.cta.body}</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={signupHref}
              prefetch={false}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-[0.95rem] font-medium text-[#141413] hover:bg-white/85 focus-visible:ring-3 focus-visible:ring-white/60 focus-visible:outline-none sm:w-auto"
            >
              {t.cta.primary}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href={selfHostHref}
              className="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/20 px-6 text-[0.95rem] font-medium text-white hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-white/60 focus-visible:outline-none sm:w-auto"
            >
              {t.cta.secondary}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function BotStatus({ allowed, copy }: { allowed: boolean; copy: CheckCopy }) {
  return allowed ? (
    <span className="inline-flex shrink-0 items-center gap-1.5 font-medium text-green-700 dark:text-green-400">
      <ShieldCheck className="size-4" aria-hidden="true" />
      {copy.result.allowed}
    </span>
  ) : (
    <span className="inline-flex shrink-0 items-center gap-1.5 font-medium text-red-700 dark:text-red-400">
      <ShieldX className="size-4" aria-hidden="true" />
      {copy.result.blocked}
    </span>
  );
}

function FixItem({ fix, copy, open }: { fix: Fix; copy: CheckCopy; open: boolean }) {
  const text = copy.fixes[fix.id];
  const params = { ...fix.params };
  if (fix.id === "unreachable") params.error = copy.unreachable[String(fix.params?.error)] ?? "";
  return (
    <li>
      <details open={open} className="group p-4">
        <summary className="flex cursor-pointer list-none items-start gap-3 rounded-md focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
          <span className={cn("mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold whitespace-nowrap", severityStyle[fix.severity])}>
            {copy.result.severity[fix.severity]}
          </span>
          <span className="min-w-0 flex-1 font-medium break-words">{fill(text.title, params)}</span>
          <ChevronDown className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="mt-3 space-y-2 pl-0 text-sm leading-6 text-muted-foreground sm:pl-[5.5rem]">
          <p className="break-words">
            <Inline text={fill(text.body, params)} />
          </p>
          <p className="break-words">
            <span className="font-medium text-foreground">{copy.result.howLabel}: </span>
            <Inline text={fill(text.how, params)} />
          </p>
        </div>
      </details>
    </li>
  );
}

function Details({ result, copy }: { result: CheckResult; copy: CheckCopy }) {
  const d = copy.result.details;
  const yesNo = (v: boolean | null) => (v === null ? d.notTested : v ? d.yes : d.no);
  const page = result.page;
  const groups: { title: string; rows: [string, string][] }[] = [
    {
      title: d.http,
      rows: [
        [d.status, result.http.status !== null ? String(result.http.status) : (copy.unreachable[result.http.error ?? ""] ?? "—")],
        [d.finalUrl, result.http.finalUrl ?? "—"],
        [d.redirects, result.http.redirects.length ? result.http.redirects.map((r) => `${r.status} ${r.url}`).join(" → ") : d.none],
        [d.https, yesNo(result.http.status === null ? null : result.http.https)],
        [d.httpRedirect, yesNo(result.http.httpRedirectsToHttps)],
        [d.ttfb, result.http.ttfbMs !== null ? `${result.http.ttfbMs} ms` : "—"],
        [d.hsts, yesNo(result.http.status === null ? null : result.http.hsts)],
      ],
    },
    {
      title: d.content,
      rows: [
        [d.rendering, d.renderingValue[page?.rendering ?? "unknown"]],
        [d.words, page ? page.wordCount.toLocaleString() : "—"],
        [d.spa, page?.spaSignals.length ? page.spaSignals.join(", ") : d.none],
      ],
    },
    {
      title: d.metadata,
      rows: [
        [d.title, page?.title ?? "—"],
        [d.description, page?.description ?? "—"],
        [d.canonical, page?.canonical ?? "—"],
        [d.lang, page?.lang ?? "—"],
        [d.hreflang, page ? (page.hreflang.length ? page.hreflang.join(", ") : d.none) : "—"],
        [d.h1, page ? (page.h1[0] ?? d.none) : "—"],
      ],
    },
    {
      title: d.schema,
      rows: [
        [d.jsonLd, page ? `${page.jsonLd.blocks}${page.jsonLd.errors ? ` (${page.jsonLd.errors} ✕)` : ""}` : "—"],
        [d.types, page?.jsonLd.types.length ? page.jsonLd.types.join(", ") : d.none],
      ],
    },
    {
      title: d.files,
      rows: [
        [d.robots, `${d.robotsState[result.robots.state]}${result.robots.status ? ` (HTTP ${result.robots.status})` : ""}`],
        [d.llms, result.llms.present ? `${d.yes}${result.llms.title ? ` — ${result.llms.title}` : ""}` : `${d.no}${result.llms.status ? ` (HTTP ${result.llms.status})` : ""}`],
        [
          d.sitemap,
          result.sitemap.found
            ? `${result.sitemap.url ?? ""}${result.sitemap.urls !== null ? ` · ${fill(d.urls, { n: result.sitemap.urls })}` : ""}`
            : `${d.no}${result.sitemap.status ? ` (HTTP ${result.sitemap.status})` : ""}`,
        ],
      ],
    },
  ];
  return (
    <div className="rounded-3xl border bg-card p-5 sm:p-8">
      <h3 className="text-xl font-semibold tracking-tight">{copy.result.detailsTitle}</h3>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        {groups.map((group) => (
          <div key={group.title}>
            <h4 className="text-sm font-semibold">{group.title}</h4>
            <dl className="mt-2 divide-y rounded-xl border text-sm">
              {group.rows.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[minmax(7rem,40%)_1fr] gap-3 px-3 py-2">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="min-w-0 break-words">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
