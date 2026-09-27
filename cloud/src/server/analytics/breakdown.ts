/** Aggregation helpers of the growth report (pure, unit tested). */

export type BreakdownRow = { key: string; visitors: number; accounts: number; checkouts: number; paid: number };

/** Share in percent (one decimal), or null when there is nothing to divide by. */
export function conversionRate(part: number, whole: number): number | null {
  if (!whole) return null;
  return Math.round((part / whole) * 1000) / 10;
}

/** "source / campaign / content" of an ad; null when the visit carried no utm values at all. */
export function campaignKey(source: string | null, campaign: string | null, content: string | null): string | null {
  if (!source && !campaign && !content) return null;
  return [source ?? "–", campaign ?? "–", content ?? "–"].join(" / ");
}

function count(keys: (string | null)[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const key of keys) if (key) out.set(key, (out.get(key) ?? 0) + 1);
  return out;
}

/**
 * Joins visitors (per key, from the page views) with accounts, checkouts and new paying customers (one key per
 * account, from its sign-up attribution). Null keys are skipped. Sorted by paid, accounts, then visitors.
 */
export function buildBreakdown(input: {
  visitors: Iterable<[string, number]>;
  accounts: (string | null)[];
  checkouts: (string | null)[];
  paid: (string | null)[];
}): BreakdownRow[] {
  const visitors = new Map(input.visitors);
  const accounts = count(input.accounts);
  const checkouts = count(input.checkouts);
  const paid = count(input.paid);
  const keys = new Set([...visitors.keys(), ...accounts.keys(), ...checkouts.keys(), ...paid.keys()]);
  return [...keys]
    .map((key) => ({
      key,
      visitors: visitors.get(key) ?? 0,
      accounts: accounts.get(key) ?? 0,
      checkouts: checkouts.get(key) ?? 0,
      paid: paid.get(key) ?? 0,
    }))
    .sort((a, b) => b.paid - a.paid || b.accounts - a.accounts || b.visitors - a.visitors || a.key.localeCompare(b.key));
}
