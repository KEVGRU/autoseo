/**
 * Pure helpers for task outcome snapshots (no server-only imports so they are unit-testable).
 * For a task resolved on UTC day D: "before" = D-14 … D-1, "after" = D+1 … D+14 (the resolution day
 * itself is excluded — the fix may have gone live during it). "after" is measured once D+14 is over.
 */

export const OUTCOME_WINDOW_DAYS = 14;
const DAY = 86_400_000;

function day(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function outcomeWindows(resolvedAt: Date, days = OUTCOME_WINDOW_DAYS) {
  const d0 = Date.UTC(resolvedAt.getUTCFullYear(), resolvedAt.getUTCMonth(), resolvedAt.getUTCDate());
  return {
    before: { from: day(d0 - days * DAY), to: day(d0 - DAY), days },
    after: { from: day(d0 + DAY), to: day(d0 + days * DAY), days },
    afterDueAt: new Date(d0 + (days + 1) * DAY),
  };
}

type Window = { visibility: number | null; mentionRate: number | null; citationRate: number | null; shareOfVoice: number | null; answers: number };

export type OutcomeDelta = {
  visibility: number | null;
  mentionRate: number | null;
  citationRate: number | null;
  shareOfVoice: number | null;
};

/** Percentage-point changes after − before (null when either side has no data). */
export function outcomeDelta(before: Window, after: Window | null): OutcomeDelta {
  const d = (a: number | null | undefined, b: number | null | undefined) =>
    a == null || b == null || !before.answers || !after?.answers ? null : Math.round((b - a) * 10) / 10;
  return {
    visibility: d(before.visibility, after?.visibility),
    mentionRate: d(before.mentionRate, after?.mentionRate),
    citationRate: d(before.citationRate, after?.citationRate),
    shareOfVoice: d(before.shareOfVoice, after?.shareOfVoice),
  };
}

/** Case/whitespace-insensitive key for matching task target prompts to tracked prompt texts. */
export function promptKey(text: string): string {
  return text.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").replace(/[?!.\s]+$/, "").trim();
}
