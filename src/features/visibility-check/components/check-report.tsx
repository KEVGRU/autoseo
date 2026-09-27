"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { AlertTriangle, Check, Circle, Gauge, Loader2, Plus, RotateCcw, Sparkles, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Panel } from "@/components/app/page";
import { ScoreRing } from "@/components/app/charts";
import { Meter } from "@/components/app/metrics";
import { CopyButton, CountryFlag, StatusBadge, TimeAgo } from "@/components/app/misc";
import { Favicon } from "@/components/app/favicon";
import { getCountry } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { CHECK_STEPS, type VisibilityCheckView } from "../types";
import { ActionsPanel, CompetitorsPanel, EnginesPanel, PromptsPanel, ReadinessPanel, SourcesPanel } from "./report-sections";
import { TrackCtaPanel, type TrackCta } from "./track-cta";

const POLL_MS = 2_000;

/** Polls the status API while the check runs; the report fills in step by step. */
function useLiveCheck(initial: VisibilityCheckView): VisibilityCheckView {
  const [view, setView] = useState(initial);
  const active = view.status === "queued" || view.status === "running";
  const failures = useRef(0);
  useEffect(() => {
    if (!active) return;
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const res = await fetch(`/api/free-tools/ai-visibility-check/${initial.id}`, { cache: "no-store" });
        if (res.ok) {
          failures.current = 0;
          const next = (await res.json()) as VisibilityCheckView;
          if (alive) setView(next);
          if (next.status !== "queued" && next.status !== "running") return;
        } else failures.current += 1;
      } catch {
        failures.current += 1;
      }
      if (alive) timer = setTimeout(tick, failures.current > 3 ? POLL_MS * 3 : POLL_MS);
    };
    timer = setTimeout(tick, POLL_MS);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [active, initial.id]);
  return view;
}

export function scoreTone(score: number | null): {
  label: string;
  color: string;
  text: string;
} {
  if (score === null)
    return {
      label: "Not measured",
      color: "var(--muted-foreground)",
      text: "text-muted-foreground",
    };
  if (score >= 75) return { label: "Strong", color: "var(--brand)", text: "text-brand" };
  if (score >= 50) return { label: "Fair", color: "var(--info)", text: "text-info" };
  if (score >= 25) return { label: "Weak", color: "var(--warning)", text: "text-warning" };
  return {
    label: "Poor",
    color: "var(--destructive)",
    text: "text-destructive",
  };
}

const STEP_WEIGHT: Record<string, number> = {
  readiness: 15,
  brand: 10,
  competitors: 10,
  prompts: 10,
  answers: 45,
  actions: 10,
};

function progressPercent(view: VisibilityCheckView): number {
  if (view.status === "completed") return 100;
  let pct = 0;
  for (const s of CHECK_STEPS) {
    if (s.step === view.step) {
      if (s.step === "answers" && view.progress?.answersTotal) pct += (STEP_WEIGHT.answers! * (view.progress.answersDone ?? 0)) / view.progress.answersTotal;
      break;
    }
    pct += STEP_WEIGHT[s.step] ?? 0;
  }
  return Math.max(3, Math.min(97, Math.round(pct)));
}

function ProgressPanel({ view }: { view: VisibilityCheckView }) {
  const currentIdx = CHECK_STEPS.findIndex((s) => s.step === view.step);
  return (
    <Panel>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Loader2 className="size-4 animate-spin text-brand" />
            {view.status === "queued" ? "Waiting for a free slot…" : (view.progress?.label ?? "Running the check…")}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Usually 2–4 minutes. You can leave this page open — results appear as they come in.</p>
        </div>
        <span className="shrink-0 text-sm font-semibold tabular">{progressPercent(view)}%</span>
      </div>
      <Progress value={progressPercent(view)} className="mt-3 h-1.5" />
      <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {CHECK_STEPS.map((s, i) => {
          const done = view.status !== "queued" && (currentIdx > i || currentIdx === -1);
          const current = view.status === "running" && i === currentIdx;
          return (
            <li key={s.step} className={cn("flex items-start gap-2 text-xs", done || current ? "text-foreground" : "text-muted-foreground")}>
              {done ? (
                <Check className="mt-0.5 size-3.5 shrink-0 text-brand" />
              ) : current ? (
                <Loader2 className="mt-0.5 size-3.5 shrink-0 animate-spin text-brand" />
              ) : (
                <Circle className="mt-0.5 size-3.5 shrink-0" />
              )}
              <span>
                {s.label}
                {current && s.step === "answers" && view.progress?.answersTotal ? (
                  <span className="ml-1 text-muted-foreground tabular">
                    ({view.progress.answersDone ?? 0}/{view.progress.answersTotal})
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}

function ScoreCard({ title, score, pending, children }: { title: string; score: number | null; pending: boolean; children: React.ReactNode }) {
  const tone = scoreTone(score);
  return (
    <section className="flex min-w-0 flex-col gap-4 rounded-2xl border bg-card p-4 shadow-soft sm:flex-row sm:items-center sm:p-5">
      <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:gap-1">
        {pending ? (
          <Skeleton className="size-[112px] rounded-full" />
        ) : score === null ? (
          <div className="flex size-[112px] items-center justify-center rounded-full border-[10px] border-dashed border-muted text-2xl font-semibold text-muted-foreground">
            —
          </div>
        ) : (
          <ScoreRing value={score} size={112} color={tone.color} label="/ 100" />
        )}
        <div className="sm:text-center">
          <h2 className="text-sm font-semibold">{title}</h2>
          {!pending && <p className={cn("text-xs font-medium", tone.text)}>{tone.label}</p>}
        </div>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </section>
  );
}

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-muted/60 px-3 py-2" title={hint}>
      <div className="truncate text-[11px] text-muted-foreground">{label}</div>
      <div className="text-base font-semibold tracking-tight tabular">{value}</div>
    </div>
  );
}

export function CheckReport({
  initial,
  shareUrl,
  cta,
  bookingUrl,
  newCheckHref,
}: {
  initial: VisibilityCheckView;
  /** Absolute link to this report (copy button). */
  shareUrl: string;
  cta: TrackCta;
  bookingUrl: string | null;
  newCheckHref: string;
}) {
  const view = useLiveCheck(initial);
  const running = view.status === "queued" || view.status === "running";
  const readiness = view.readiness;
  const results = view.results;
  const ai = results?.ai ?? null;
  const vis = ai?.visibility ?? null;
  const leader = ai?.brands.find((b) => !b.isOwn && b.mentions > 0) ?? null;
  const market = getCountry(view.country)?.name ?? view.country;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-card shadow-soft">
            <Favicon domain={view.domain} src={view.brand?.logoUrl ?? undefined} className="size-6 rounded" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{view.brand?.name ?? view.domain}</h1>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
              <span>{view.domain}</span>
              <span aria-hidden>·</span>
              <CountryFlag iso={view.country} />
              <span>{market}</span>
              <span aria-hidden>·</span>
              <TimeAgo date={view.createdAt} />
              {view.brand?.industry && (
                <>
                  <span aria-hidden>·</span>
                  <span>{view.brand.industry}</span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <StatusBadge status={view.status} label={view.status === "completed" ? "Ready" : undefined} />
          <CopyButton value={shareUrl} label="Copy link" />
          <Button asChild variant="outline" size="sm">
            <Link href={newCheckHref}>
              <Plus />
              New check
            </Link>
          </Button>
        </div>
      </div>

      {running && <ProgressPanel view={view} />}

      {view.status === "failed" && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="flex items-start gap-2 text-sm">
            <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <span>
              <span className="font-medium">The check could not finish.</span>{" "}
              <span className="text-muted-foreground">{view.error ?? "Please try again."}</span>
            </span>
          </p>
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <Link href={newCheckHref}>
              <RotateCcw />
              Try again
            </Link>
          </Button>
        </div>
      )}

      {/* Scores */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ScoreCard title="AI readiness" score={view.readinessScore} pending={!readiness && view.status !== "failed"}>
          {readiness ? (
            <ul className="space-y-2">
              {readiness.categories.map((c) => (
                <li key={c.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
                  <span className="truncate text-xs text-muted-foreground">{c.label}</span>
                  <span className="text-xs font-medium tabular">
                    {c.score}/{c.max}
                  </span>
                  <Meter
                    value={c.score}
                    max={c.max}
                    className="col-span-2"
                    tone={c.score / c.max >= 0.7 ? "brand" : c.score / c.max >= 0.4 ? "warning" : "destructive"}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{view.status === "failed" ? "Not available." : "Checking robots.txt, rendering, structured data…"}</p>
          )}
        </ScoreCard>

        <ScoreCard title="AI visibility" score={view.visibilityScore} pending={running && !vis}>
          {vis ? (
            <div className="space-y-3">
              <p className="text-sm leading-6">
                AI engines named <span className="font-semibold">{view.brand?.name ?? view.domain}</span> in{" "}
                <span className="font-semibold tabular">
                  {vis.mentions} of {vis.answers}
                </span>{" "}
                answers
                {leader && leader.mentions > vis.mentions ? (
                  <>
                    {" "}
                    — <span className="font-semibold">{leader.name}</span> in {leader.mentions}.
                  </>
                ) : (
                  "."
                )}
              </p>
              <div className="grid grid-cols-3 gap-2">
                <Stat label="Visibility" value={`${Math.round(vis.mentionRate)}%`} hint="Share of answers naming you" />
                <Stat label="Avg. position" value={vis.avgPosition ?? "—"} hint="Among the tracked brands named" />
                <Stat label="Cited" value={`${Math.round(vis.citationRate)}%`} hint="Share of answers citing your site" />
              </div>
              {ai && ai.simulatedShare > 0 && (
                <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <AlertTriangle className="mt-0.5 size-3 shrink-0 text-warning" />
                  {ai.simulatedShare}% of the answers were simulated by an AI model imitating the engine — treat them as directional.
                </p>
              )}
            </div>
          ) : running ? (
            <p className="text-sm text-muted-foreground">Asking AI engines your buyers&apos; questions…</p>
          ) : (
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Not measured</p>
              <p className="text-sm leading-6 text-muted-foreground">
                {ai?.reason ?? (view.status === "failed" ? "The check did not finish." : "No AI answers were collected.")}
              </p>
            </div>
          )}
        </ScoreCard>
      </div>

      {ai?.status === "partial" && ai.reason && (
        <p className="flex items-start gap-2 rounded-xl bg-warning/10 px-3.5 py-2.5 text-xs text-foreground">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" />
          {ai.reason}
        </p>
      )}

      {results && <ActionsPanel actions={results.actions} source={results.actionsSource} />}

      {ai && ai.answers.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <CompetitorsPanel ai={ai} />
          <EnginesPanel ai={ai} />
        </div>
      )}

      {ai && ai.answers.length > 0 && <PromptsPanel domain={view.domain} brand={view.brand} prompts={view.prompts} ai={ai} />}
      {ai && ai.answers.length > 0 && <SourcesPanel ai={ai} />}

      {readiness ? (
        <ReadinessPanel readiness={readiness} />
      ) : running ? (
        <Panel title="AI readiness details">
          <div className="space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </Panel>
      ) : null}

      <TrackCtaPanel checkId={view.id} cta={cta} ready={view.status === "completed"} bookingUrl={bookingUrl} />

      <Panel>
        <div className="flex items-start gap-3 text-xs leading-5 text-muted-foreground">
          <Gauge className="mt-0.5 size-4 shrink-0" />
          <p>
            <span className="font-medium text-foreground">How this was measured.</span> AI readiness comes from deterministic checks of your homepage,
            robots.txt and llms.txt — no AI involved. AI visibility: {view.prompts.length || 5} unbranded buyer prompts for {market}, each asked on up to 3 AI
            engines; your brand and competitors are matched in the answers without AI. Visibility score = 70 % mention rate + 20 % position + 10 % own
            citations. AI answers vary between runs, so a single check is directional.{" "}
            {view.status === "completed" && (
              <>
                The report link stays valid until <span suppressHydrationWarning>{new Date(view.expiresAt).toLocaleDateString()}</span>.
              </>
            )}
          </p>
        </div>
      </Panel>

      {view.status === "completed" && results?.actionsSource === "ai" && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <Sparkles className="size-3" /> Actions written by AI from the measured data. Numbers above are measured, not generated.
        </motion.p>
      )}
    </div>
  );
}
