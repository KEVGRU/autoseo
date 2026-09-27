"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { wordDiff, type DiffPart } from "@/server/optimize/cms-edits/fields";

function Parts({ parts, side }: { parts: DiffPart[]; side: "before" | "after" }) {
  return (
    <>
      {parts.map((p, i) => {
        if (p.kind === "same") return <span key={i}>{p.text}</span>;
        if (side === "before" && p.kind === "del")
          return (
            <del key={i} className="rounded-sm bg-destructive/15 text-destructive decoration-destructive/60">
              {p.text}
            </del>
          );
        if (side === "after" && p.kind === "add")
          return (
            <ins key={i} className="rounded-sm bg-success/15 text-success no-underline">
              {p.text}
            </ins>
          );
        return null;
      })}
    </>
  );
}

/** Before / after of one field with word-level highlighting (stacked on mobile, side by side from md). */
export function DiffView({ before, after, mono, className }: { before: string | null; after: string; mono?: boolean; className?: string }) {
  const parts = useMemo(() => wordDiff(before ?? "", after), [before, after]);
  const box = cn(
    "max-h-72 min-h-10 overflow-auto rounded-lg border px-3 py-2 text-sm leading-relaxed break-words whitespace-pre-wrap",
    mono && "font-mono text-xs",
  );
  return (
    <div className={cn("grid gap-2 md:grid-cols-2", className)}>
      <div className="min-w-0 space-y-1">
        <div className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Before (live)</div>
        <div className={cn(box, "bg-muted/40")}>
          {before ? <Parts parts={parts} side="before" /> : <span className="text-muted-foreground italic">empty</span>}
        </div>
      </div>
      <div className="min-w-0 space-y-1">
        <div className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">After</div>
        <div className={cn(box, "bg-card")}>{after ? <Parts parts={parts} side="after" /> : <span className="text-muted-foreground italic">empty</span>}</div>
      </div>
    </div>
  );
}
