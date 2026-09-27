"use client";

import { format } from "date-fns";
import { TrendingUp } from "lucide-react";
import { Delta } from "@/components/app/metrics";
import { Panel } from "@/components/app/page";
import type { TaskOutcome, TaskOutcomeWindow } from "@/server/db/schema/optimize";
import { outcomeDelta } from "@/server/optimize/tasks/outcome-window";

const METRICS = [
  { key: "visibility", label: "Visibility" },
  { key: "mentionRate", label: "Mention rate" },
  { key: "citationRate", label: "Citation rate" },
  { key: "shareOfVoice", label: "Share of voice" },
] as const;

const pct = (v: number | null | undefined) => (v == null ? "—" : `${v.toFixed(1)}%`);
const range = (w: TaskOutcomeWindow) => `${format(new Date(`${w.from}T00:00:00Z`), "MMM d")} – ${format(new Date(`${w.to}T00:00:00Z`), "MMM d")}`;

/** Visibility before vs. after a task was resolved (14-day windows around the resolution day). */
export function OutcomePanel({ outcome, targetPrompts }: { outcome: TaskOutcome; targetPrompts: number }) {
  const { before, after } = outcome;
  const delta = outcomeDelta(before, after);
  const scope = outcome.promptIds.length
    ? `${outcome.promptIds.length} target prompt${outcome.promptIds.length === 1 ? "" : "s"}`
    : targetPrompts
      ? "whole project (target prompts are not tracked)"
      : "whole project";
  return (
    <Panel
      title="Outcome"
      icon={<TrendingUp className="size-4 text-muted-foreground" />}
      description={`AI visibility 14 days before vs. after resolution · ${scope}`}
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {METRICS.map((m) => (
          <div key={m.key} className="rounded-xl border bg-muted/20 p-3">
            <div className="text-xs text-muted-foreground">{m.label}</div>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5 text-sm tabular">
              <span className="text-muted-foreground">{pct(before[m.key])}</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-lg font-semibold">{after ? pct(after[m.key]) : "…"}</span>
            </div>
            {after && <Delta value={delta[m.key]} suffix=" pp" className="mt-0.5 text-xs" />}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Before: {range(before)} · {before.answers} answers.{" "}
        {after
          ? `After: ${range(after)} · ${after.answers} answers.`
          : `After-window is measured on ${format(new Date(outcome.afterDueAt), "MMM d, yyyy")}.`}
        {!before.answers && " No tracked answers before the resolution — the comparison needs tracking data."}
      </p>
    </Panel>
  );
}
