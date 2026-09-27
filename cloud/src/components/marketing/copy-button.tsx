"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export type CopyLabels = { copy: string; copied: string; announcement: string };

export const defaultCopyLabels: CopyLabels = { copy: "Copy to clipboard", copied: "Copied", announcement: "Copied to clipboard" };

export function CopyButton({
  value,
  labels = defaultCopyLabels,
  track,
  className,
}: {
  value: string;
  labels?: CopyLabels;
  /** Statistics event name for clicks (see components/analytics/tracker.tsx). */
  track?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  const label = copied ? labels.copied : labels.copy;
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      title={label}
      data-track={track}
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-md text-current opacity-70 transition hover:bg-white/10 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:outline-none",
        className,
      )}
    >
      {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
      <span className="sr-only" aria-live="polite">
        {copied ? labels.announcement : ""}
      </span>
    </button>
  );
}
