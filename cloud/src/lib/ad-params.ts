/**
 * Campaign parameters of a landing URL (pure). Shared by the cookieless statistics tracker and anything that needs
 * to know whether a visitor came from a paid ad (e.g. a consent prompt for an ad network's conversion tracking).
 */

export const UTM_KEYS = ["source", "medium", "campaign", "content", "term"] as const;
export type UtmKey = (typeof UTM_KEYS)[number];

/** Ad networks whose click-id parameter we recognize. Only the network is ever reported, never the id. */
export const CLICK_SOURCES = ["x", "google", "meta", "microsoft", "reddit", "linkedin"] as const;
export type ClickSource = (typeof CLICK_SOURCES)[number];

/** Click-id query parameter → ad network. */
export const CLICK_ID_PARAMS: readonly (readonly [param: string, network: ClickSource])[] = [
  ["twclid", "x"],
  ["gclid", "google"],
  ["gbraid", "google"],
  ["wbraid", "google"],
  ["fbclid", "meta"],
  ["msclkid", "microsoft"],
  ["rdt_cid", "reddit"],
  ["li_fat_id", "linkedin"],
];

export type AdParams = {
  /** utm_* values present in the URL (raw, at most 200 characters each). */
  utm: Partial<Record<UtmKey, string>>;
  /** Network whose click id is in the URL, if any. */
  clickSource: ClickSource | null;
};

/** Reads utm_* values and the ad network's click id from a query string (`location.search`) or URLSearchParams. */
export function readAdParams(search: string | URLSearchParams): AdParams {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const utm: AdParams["utm"] = {};
  for (const key of UTM_KEYS) {
    const value = params.get(`utm_${key}`)?.trim();
    if (value) utm[key] = value.slice(0, 200);
  }
  return { utm, clickSource: CLICK_ID_PARAMS.find(([param]) => params.has(param))?.[1] ?? null };
}

const PAID_MEDIUMS = new Set(["cpc", "ppc", "cpm", "cpv", "social_paid", "social-paid", "sponsored"]);

/** Arrived from a paid ad: an ad network's click id (e.g. X's twclid) or utm_medium paid_* / cpc / ppc. */
export function isAdVisit(ad: AdParams): boolean {
  if (ad.clickSource) return true;
  const medium = ad.utm.medium?.toLowerCase();
  return !!medium && (medium.startsWith("paid") || PAID_MEDIUMS.has(medium));
}
