/**
 * Multi-market prompts: one prompt set asked market by market (finseo: "the same prompt set can be
 * run market by market across 40+ countries"). `prompts.country` stays the primary market;
 * `prompts.markets` lists every market (incl. the primary one) or is null for a single market.
 *
 * Pure module (no server imports) so it can be unit tested and used by the run loop.
 */

export const MAX_PROMPT_MARKETS = 20;

const ISO = /^[A-Z]{2}$/;

/** Upper-cased, de-duplicated, valid ISO codes in input order (max MAX_PROMPT_MARKETS). */
export function normalizeMarkets(markets: readonly (string | null | undefined)[] | null | undefined): string[] {
  const out: string[] = [];
  for (const m of markets ?? []) {
    const v = m?.trim().toUpperCase();
    if (v && ISO.test(v) && !out.includes(v)) out.push(v);
    if (out.length >= MAX_PROMPT_MARKETS) break;
  }
  return out;
}

/**
 * Every market a prompt is asked in, primary market first. A prompt without `markets` runs in
 * its `country` only.
 */
export function expandPromptMarkets(prompt: { country: string; markets?: readonly string[] | null }): string[] {
  const primary = prompt.country.trim().toUpperCase();
  return normalizeMarkets([primary, ...(prompt.markets ?? [])]);
}

/**
 * Column values for storing a market selection: `country` = first market, `markets` = the full
 * list when there is more than one market, otherwise null.
 */
export function marketColumns(markets: readonly string[], fallback: string): { country: string; markets: string[] | null } {
  const list = normalizeMarkets(markets);
  if (!list.length) return { country: fallback.toUpperCase(), markets: null };
  return { country: list[0]!, markets: list.length > 1 ? list : null };
}

/** Key of one tracking task: prompt × market × engine × day (dedupe key / "answered today" set). */
export function marketTaskKey(promptId: string, country: string, engine: string): string {
  return `${promptId}:${country.toUpperCase()}:${engine}`;
}
