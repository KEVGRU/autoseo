/**
 * Tracking / click parameters of ad landing URLs (utm_*, click ids, Google Ads ValueTrack…).
 * Ad-network redirect URLs (googleadservices, doubleclick, bing aclk) are unwrapped first.
 * Pure module — used when ads are stored and by the Ads UI.
 */

const PREFIXES = ["utm_", "hsa_", "pk_", "mtm_", "matomo_", "piwik_", "mc_", "sc_", "gad_", "itm_"];
const KEYS = new Set([
  "gclid",
  "gclsrc",
  "gbraid",
  "wbraid",
  "dclid",
  "msclkid",
  "fbclid",
  "ttclid",
  "twclid",
  "li_fat_id",
  "yclid",
  "epik",
  "srsltid",
  "irclickid",
  "clickid",
  "click_id",
  "campaignid",
  "campaign_id",
  "campaign",
  "adgroupid",
  "adgroup_id",
  "adid",
  "ad_id",
  "creative",
  "keyword",
  "matchtype",
  "network",
  "device",
  "placement",
  "targetid",
  "feeditemid",
  "loc_physical_ms",
  "loc_interest_ms",
  "s_kwcid",
  "ef_id",
  "cid",
  "ref",
  "ref_src",
  "referrer",
  "source",
  "affiliate",
  "aff_id",
  "affid",
  "partner",
  "tag",
  "ranmid",
  "raneaid",
  "ransiteid",
]);
const REDIRECT_HOSTS = [/(^|\.)googleadservices\.com$/, /(^|\.)doubleclick\.net$/, /(^|\.)google\.[a-z.]+$/, /(^|\.)bing\.com$/, /(^|\.)awin1\.com$/];
const REDIRECT_KEYS = ["adurl", "url", "u", "q", "ued", "dest", "destination", "ds_dest_url", "p"];

const MAX_KEYS = 40;
const MAX_VALUE = 300;

function tryUrl(input: string): URL | null {
  try {
    const u = new URL(input.trim());
    return u.protocol === "http:" || u.protocol === "https:" ? u : null;
  } catch {
    return null;
  }
}

function isTrackingKey(k: string): boolean {
  const key = k.toLowerCase();
  return KEYS.has(key) || PREFIXES.some((p) => key.startsWith(p));
}

/** The final landing URL of an ad (unwraps ad-network redirect URLs), or null. */
export function unwrapLandingUrl(input: string | null | undefined): URL | null {
  if (!input) return null;
  let url = tryUrl(input);
  for (let i = 0; url && i < 3; i++) {
    const host = url.hostname.toLowerCase();
    if (!REDIRECT_HOSTS.some((re) => re.test(host))) break;
    const nextRaw = REDIRECT_KEYS.map((k) => url!.searchParams.get(k)).find((v) => v && /^https?:\/\//i.test(v));
    if (!nextRaw) break;
    const next = tryUrl(nextRaw);
    if (!next) break;
    // Keep the redirect's own click ids (gclid etc. are often on the outer URL).
    for (const [k, v] of url.searchParams) if (isTrackingKey(k) && !next.searchParams.has(k)) next.searchParams.set(k, v);
    url = next;
  }
  return url;
}

/** Tracking parameters of an ad landing URL (keys lower-cased), or null when there are none. */
export function parseClickParams(input: string | null | undefined): Record<string, string> | null {
  const url = unwrapLandingUrl(input);
  if (!url) return null;
  const out: Record<string, string> = {};
  let n = 0;
  for (const [k, v] of url.searchParams) {
    if (!isTrackingKey(k) || !v) continue;
    const key = k.toLowerCase().slice(0, 60);
    if (key in out) continue;
    out[key] = v.slice(0, MAX_VALUE);
    if (++n >= MAX_KEYS) break;
  }
  return n ? out : null;
}

export type ClickSummary = {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  term: string | null;
  content: string | null;
  /** Ad network inferred from the click id (gclid → Google Ads, …). */
  network: string | null;
};

const NETWORKS: [string, string][] = [
  ["gclid", "Google Ads"],
  ["gbraid", "Google Ads"],
  ["wbraid", "Google Ads"],
  ["gad_source", "Google Ads"],
  ["dclid", "Google Display"],
  ["msclkid", "Microsoft Ads"],
  ["fbclid", "Meta"],
  ["ttclid", "TikTok"],
  ["twclid", "X"],
  ["li_fat_id", "LinkedIn"],
  ["yclid", "Yandex"],
  ["epik", "Pinterest"],
  ["srsltid", "Google Merchant"],
  ["irclickid", "Impact"],
  ["ranmid", "Rakuten"],
];

export function summarizeClickParams(p: Record<string, string> | null | undefined): ClickSummary {
  const get = (k: string) => p?.[k] ?? null;
  return {
    source: get("utm_source") ?? get("mtm_source") ?? get("pk_source"),
    medium: get("utm_medium") ?? get("mtm_medium") ?? get("pk_medium"),
    campaign: get("utm_campaign") ?? get("mtm_campaign") ?? get("pk_campaign") ?? get("campaign") ?? get("campaignid") ?? get("campaign_id"),
    term: get("utm_term") ?? get("keyword") ?? get("mtm_keyword"),
    content: get("utm_content") ?? get("creative"),
    network: NETWORKS.find(([k]) => p?.[k])?.[1] ?? null,
  };
}
