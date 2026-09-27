/**
 * Channel classification for the cookieless statistics (pure, unit tested). A visit's channel is decided on the
 * server from its utm_* values, the ad network whose click id was in the landing URL and the external referrer.
 */

export const CHANNELS = [
  "Paid social",
  "Paid search",
  "Email",
  "AI assistants",
  "Organic search",
  "Social",
  "Community",
  "Referral",
  "Direct",
] as const;
export type Channel = (typeof CHANNELS)[number];

const PAID_SOCIAL_CLICKS = new Set<string>(["x", "meta", "reddit", "linkedin"]);

const PAID_SOCIAL_MEDIUMS = new Set(["paid_social", "paidsocial", "social_paid", "paid-social", "social-paid", "paid social", "social paid", "sponsored"]);
const PAID_MEDIUMS = new Set(["cpc", "ppc", "cpm", "cpv", "paid", "paid_search", "paidsearch", "paid-search", "paid search", "ads", "ad"]);
const EMAIL_MEDIUMS = new Set(["email", "e-mail", "e_mail", "newsletter", "mail"]);
const SOCIAL_MEDIUMS = new Set(["social", "social-network", "social_network", "social-media", "social_media", "sm", "organic_social", "organic-social"]);
const ORGANIC_MEDIUMS = new Set(["organic", "seo"]);
const REFERRAL_MEDIUMS = new Set(["referral", "link", "backlink", "affiliate", "partner"]);

/** utm_source values (besides host names) that name a social network, e.g. utm_source=x. */
const SOCIAL_SOURCE_NAMES = new Set([
  "x",
  "twitter",
  "facebook",
  "fb",
  "instagram",
  "ig",
  "linkedin",
  "reddit",
  "youtube",
  "tiktok",
  "meta",
  "bluesky",
  "bsky",
  "threads",
  "mastodon",
  "pinterest",
]);
const AI_SOURCE_NAMES = new Set(["chatgpt", "openai", "perplexity", "gemini", "claude", "copilot", "deepseek", "phind", "grok", "mistral", "le_chat"]);
const SEARCH_SOURCE_NAMES = new Set(["google", "bing", "duckduckgo", "ecosia", "brave", "yandex", "baidu", "startpage", "qwant", "kagi", "yahoo"]);
const COMMUNITY_SOURCE_NAMES = new Set(["hackernews", "hacker_news", "hn", "github", "producthunt", "product_hunt", "devto", "dev.to", "indiehackers", "lobsters", "hashnode", "selfhst", "selfh.st"]);

const AI_HOSTS = [
  "chatgpt.com",
  "chat.openai.com",
  "openai.com",
  "perplexity.ai",
  "gemini.google.com",
  "bard.google.com",
  "claude.ai",
  "copilot.microsoft.com",
  "copilot.cloud.microsoft",
  "you.com",
  "phind.com",
  "deepseek.com",
  "chat.deepseek.com",
  "poe.com",
  "chat.mistral.ai",
  "meta.ai",
  "grok.com",
  "kimi.com",
  "kimi.moonshot.cn",
  "chat.qwen.ai",
];
/** Webmail and mail apps (Android app referrers look like "com.google.android.gm"). */
const EMAIL_HOSTS = [
  "mail.google.com",
  "com.google.android.gm",
  "outlook.live.com",
  "outlook.office.com",
  "outlook.office365.com",
  "mail.yahoo.com",
  "mail.proton.me",
  "navigator.gmx.net",
  "navigator.web.de",
  "email.t-online.de",
];
const SEARCH_HOSTS = [
  "bing.com",
  "duckduckgo.com",
  "ecosia.org",
  "search.brave.com",
  "baidu.com",
  "startpage.com",
  "qwant.com",
  "kagi.com",
  "search.yahoo.com",
  "yahoo.com",
  "ya.ru",
  "naver.com",
  "seznam.cz",
  "sogou.com",
  "so.com",
  "ask.com",
  "mojeek.com",
  "metager.org",
  "metager.de",
  "search.aol.com",
  "com.google.android.googlequicksearchbox",
];
/** google.com, google.de, google.co.uk, google.com.br … and yandex.ru, yandex.com … (not docs.google.com etc.). */
const SEARCH_HOST_PATTERN = /^(?:www\.)?(?:google|yandex)\.(?:[a-z]{2,3})(?:\.[a-z]{2})?$/;
const SOCIAL_HOSTS = [
  "t.co",
  "x.com",
  "twitter.com",
  "linkedin.com",
  "lnkd.in",
  "facebook.com",
  "fb.com",
  "fb.me",
  "instagram.com",
  "reddit.com",
  "youtube.com",
  "youtu.be",
  "bsky.app",
  "threads.net",
  "threads.com",
  "mastodon.social",
  "tiktok.com",
  "pinterest.com",
  "xing.com",
  "t.me",
  "telegram.org",
  "whatsapp.com",
  "vk.com",
  "weibo.com",
  "com.twitter.android",
  "com.linkedin.android",
  "com.reddit.frontpage",
];
const COMMUNITY_HOSTS = [
  "news.ycombinator.com",
  "github.com",
  "gitlab.com",
  "producthunt.com",
  "dev.to",
  "indiehackers.com",
  "lobste.rs",
  "hashnode.com",
  "hashnode.dev",
  "stackoverflow.com",
  "stackexchange.com",
  "alternativeto.net",
  "betalist.com",
  "slashdot.org",
  "hackernoon.com",
  "medium.com",
  "selfh.st",
  "discord.com",
  "discord.gg",
];

/** Hosts that are never a traffic source (Stripe Checkout / portal returns, local development). */
const ALWAYS_INTERNAL = ["checkout.stripe.com", "billing.stripe.com", "localhost", "127.0.0.1"];

function hostIn(host: string, list: readonly string[]): boolean {
  return list.some((d) => host === d || host.endsWith(`.${d}`));
}

/**
 * Host of an external referrer: lowercased, without "www.", port or trailing dot. Accepts a full URL or a bare
 * host (the tracker only sends the host). Null for anything that isn't a plausible host name.
 */
export function normalizeReferrerHost(raw: string | null | undefined): string | null {
  let value = (raw ?? "").trim().toLowerCase();
  if (!value) return null;
  if (value.includes("://")) {
    try {
      value = new URL(value).hostname;
    } catch {
      return null;
    }
  }
  value = value.replace(/:\d+$/, "").replace(/\.$/, "").replace(/^www\./, "");
  if (!value || value.length > 100 || !/^[a-z0-9-]+(\.[a-z0-9-]+)*$/.test(value)) return null;
  return value;
}

/** Our own hosts (the site, the shared app, customer subdomains) and Stripe returns are not traffic sources. */
export function isInternalHost(host: string, ownHosts: readonly string[]): boolean {
  const own = ownHosts.map((h) => h.toLowerCase().replace(/:\d+$/, "").replace(/^www\./, "")).filter(Boolean);
  return hostIn(host, own) || hostIn(host, ALWAYS_INTERNAL);
}

/** Channel implied by a referrer host (or a utm_source that is a host name). */
export function channelForHost(host: string): Channel {
  if (hostIn(host, AI_HOSTS)) return "AI assistants";
  if (hostIn(host, EMAIL_HOSTS)) return "Email";
  if (SEARCH_HOST_PATTERN.test(host) || hostIn(host, SEARCH_HOSTS)) return "Organic search";
  if (hostIn(host, SOCIAL_HOSTS)) return "Social";
  if (hostIn(host, COMMUNITY_HOSTS)) return "Community";
  return "Referral";
}

function isSocialSource(source: string): boolean {
  return SOCIAL_SOURCE_NAMES.has(source) || channelForHost(source) === "Social";
}

/** Channel implied by utm_source alone (no or unknown utm_medium), e.g. ChatGPT's "utm_source=chatgpt.com". */
function channelForSource(source: string): Channel {
  const name = source.replace(/\.(com|ai|org|io|net)$/, "");
  if (AI_SOURCE_NAMES.has(name)) return "AI assistants";
  if (SOCIAL_SOURCE_NAMES.has(source)) return "Social";
  if (SEARCH_SOURCE_NAMES.has(source)) return "Organic search";
  if (COMMUNITY_SOURCE_NAMES.has(source)) return "Community";
  const host = normalizeReferrerHost(source);
  return host && host.includes(".") ? channelForHost(host) : "Referral";
}

export type ChannelInput = {
  utmSource?: string | null;
  utmMedium?: string | null;
  clickSource?: string | null;
  /** External referrer host (internal referrers must already be dropped). */
  referrerHost?: string | null;
};

/** UTM beats click ids, click ids beat the referrer; nothing at all is "Direct". */
export function classifyChannel(input: ChannelInput): Channel {
  const source = input.utmSource?.trim().toLowerCase() || null;
  const medium = input.utmMedium?.trim().toLowerCase() || null;
  if (medium) {
    if (PAID_SOCIAL_MEDIUMS.has(medium)) return "Paid social";
    if (PAID_MEDIUMS.has(medium)) {
      if (source && isSocialSource(source)) return "Paid social";
      if (input.clickSource && PAID_SOCIAL_CLICKS.has(input.clickSource)) return "Paid social";
      return "Paid search";
    }
    if (EMAIL_MEDIUMS.has(medium)) return "Email";
    if (SOCIAL_MEDIUMS.has(medium)) return "Social";
    if (ORGANIC_MEDIUMS.has(medium)) return "Organic search";
    if (REFERRAL_MEDIUMS.has(medium)) return source ? channelForSource(source) : "Referral";
  }
  if (input.clickSource) return PAID_SOCIAL_CLICKS.has(input.clickSource) ? "Paid social" : "Paid search";
  if (source) return channelForSource(source);
  if (medium) return "Referral";
  if (input.referrerHost) return channelForHost(input.referrerHost);
  return "Direct";
}
