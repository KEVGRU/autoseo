/**
 * Pure decision logic of the alerts engine (no DB / server-only imports → unit tested):
 * dedupe via "open" finding keys, cooldown, and threshold comparisons.
 */
import crypto from "node:crypto";

/** Upper bound of remembered open keys per rule. */
export const MAX_OPEN_KEYS = 1000;

export type FiringPlan = {
  /** Finding keys that fire now (new since the last evaluation, outside the cooldown). */
  fire: string[];
  /** Keys to remember as open (still true) for the next evaluation. */
  nextOpen: string[];
  /** True when new findings were held back by the cooldown (they fire after it if still true). */
  deferred: boolean;
};

/**
 * Dedupe + cooldown. A finding fires once when its condition becomes true and stays silent while it
 * remains true; after it clears (key disappears) it can fire again. During the cooldown new findings
 * are not marked open, so they fire on the first evaluation after the cooldown if still true.
 */
export function planFiring(opts: { keys: string[]; open: readonly string[]; lastFiredAt: Date | null; cooldownHours: number; now: Date }): FiringPlan {
  const keys = [...new Set(opts.keys)];
  const open = new Set(opts.open);
  const fresh = keys.filter((k) => !open.has(k));
  const cooling = inCooldown(opts.lastFiredAt, opts.cooldownHours, opts.now);
  if (fresh.length && cooling) {
    return { fire: [], nextOpen: keys.filter((k) => open.has(k)).slice(0, MAX_OPEN_KEYS), deferred: true };
  }
  return { fire: fresh, nextOpen: keys.slice(0, MAX_OPEN_KEYS), deferred: false };
}

export function inCooldown(lastFiredAt: Date | null, cooldownHours: number, now: Date): boolean {
  if (!lastFiredAt || cooldownHours <= 0) return false;
  return now.getTime() - lastFiredAt.getTime() < cooldownHours * 3_600_000;
}

/** Stable short hash of the fired keys (stored as `alert_events.dedupe_key`). */
export function dedupeHash(keys: readonly string[]): string {
  return crypto.createHash("sha1").update([...keys].sort().join("\n")).digest("hex").slice(0, 20);
}

/** Minimum sample (answers per window) before AI-answer metrics are compared. */
export const MIN_ANSWERS = 5;

/**
 * Metric fell by at least `threshold` (absolute units). `lowerIsBetter` flips the direction
 * (average position: 2 → 3 is a drop of 1). Returns the signed change (current − previous) when it fires.
 */
export function dropBy(opts: { current: number | null; previous: number | null; threshold: number; lowerIsBetter?: boolean }): number | null {
  const { current, previous, threshold } = opts;
  if (current == null || previous == null) return null;
  const change = Math.round((current - previous) * 10) / 10;
  const worse = opts.lowerIsBetter ? change : -change;
  return worse >= threshold && worse > 0 ? change : null;
}

/** Relative change in % ((cur − prev) ÷ prev × 100), null without a baseline. */
export function relativeChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

/** Criticism spike: at least `minCount` statements and ≥ `thresholdPct` % more than before (any count when there were none). */
export function isSpike(opts: { current: number; previous: number; thresholdPct: number; minCount?: number }): boolean {
  const min = opts.minCount ?? 3;
  if (opts.current < min) return false;
  if (opts.previous <= 0) return true;
  return ((opts.current - opts.previous) / opts.previous) * 100 >= opts.thresholdPct;
}

/** Bot error spike: rate ≥ threshold %, enough requests, and ≥ `minRise` pp above the previous rate. */
export function isErrorSpike(opts: { errors: number; total: number; prevErrors: number; prevTotal: number; thresholdPct: number; minTotal?: number; minRise?: number }) {
  const minTotal = opts.minTotal ?? 20;
  if (opts.total < minTotal) return { spike: false, rate: null as number | null, prevRate: null as number | null };
  const rate = Math.round((opts.errors / opts.total) * 1000) / 10;
  const prevRate = opts.prevTotal > 0 ? Math.round((opts.prevErrors / opts.prevTotal) * 1000) / 10 : null;
  const rise = prevRate == null ? rate : rate - prevRate;
  return { spike: rate >= opts.thresholdPct && rise >= (opts.minRise ?? 5), rate, prevRate };
}

/** Severity from how far past the threshold a change is (≥ 2× threshold = critical). */
export function magnitudeSeverity(magnitude: number, threshold: number): "warning" | "critical" {
  return threshold > 0 && Math.abs(magnitude) >= threshold * 2 ? "critical" : "warning";
}
