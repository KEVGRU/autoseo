/**
 * AI crawler coverage (pure): which known AI crawlers never visit, and which crawled pages are
 * never cited in AI answers.
 */

export type CrawlerPurpose = "training" | "search" | "user" | "seo";

export type KnownCrawler = { token: string; name: string; company: string; purpose: CrawlerPurpose };

export type RobotsVerdict = "allowed" | "partial" | "blocked" | "unknown";

export type MissingCrawler = KnownCrawler & {
  /** Last visit ever (outside the period), null = never seen. */
  lastSeen: string | null;
  /** robots.txt / meta verdict from the latest crawlability check (null = no check yet). */
  robots: RobotsVerdict | null;
  /** Rule that blocks the bot, e.g. "Disallow: /" (when known). */
  robotsRule: string | null;
};

const PURPOSE_ORDER: Record<CrawlerPurpose, number> = { search: 0, user: 1, training: 2, seo: 3 };

/**
 * Known AI crawlers (SEO tools excluded) with zero visits in the period, most important first
 * (search → user-triggered → training), never-seen before seen-long-ago.
 */
export function findMissingCrawlers(
  known: readonly KnownCrawler[],
  visitsInPeriod: ReadonlyMap<string, number>,
  lastSeenEver: ReadonlyMap<string, string>,
  robots: ReadonlyMap<string, { verdict: RobotsVerdict; rule: string | null }> | null,
): MissingCrawler[] {
  return known
    .filter((b) => b.purpose !== "seo" && !(visitsInPeriod.get(b.token) ?? 0))
    .map((b) => {
      const r = robots?.get(b.token.toLowerCase()) ?? null;
      return { ...b, lastSeen: lastSeenEver.get(b.token) ?? null, robots: r?.verdict ?? null, robotsRule: r?.rule ?? null };
    })
    .sort((a, b) => PURPOSE_ORDER[a.purpose] - PURPOSE_ORDER[b.purpose] || Number(!!a.lastSeen) - Number(!!b.lastSeen) || a.name.localeCompare(b.name));
}

/**
 * Normalizes a URL or path for matching crawled paths with cited URLs: host, query and fragment
 * dropped, lower-cased, trailing slashes removed ("/" stays "/").
 */
export function normalizeCrawlPath(pathOrUrl: string): string {
  let p = pathOrUrl.trim();
  const m = /^[a-z][a-z0-9+.-]*:\/\/[^/?#]*/i.exec(p);
  if (m) p = p.slice(m[0].length);
  p = p.replace(/[?#].*$/, "");
  try {
    p = decodeURI(p);
  } catch {
    // keep the raw path when it isn't valid percent-encoding
  }
  p = p.toLowerCase().replace(/\/{2,}/g, "/").replace(/\/+$/, "");
  if (!p.startsWith("/")) p = `/${p}`;
  return p;
}

const ASSET_RE = /\.(?:css|js|mjs|map|json|xml|txt|ico|png|jpe?g|gif|webp|avif|svg|woff2?|ttf|otf|eot|mp4|webm|mp3|pdf|zip|gz)$/i;
const TECHNICAL = new Set(["/robots.txt", "/sitemap.xml", "/llms.txt", "/llms-full.txt", "/favicon.ico", "/ads.txt"]);

/** Static assets and technical files are crawled but never "cited" — leave them out of the list. */
export function isContentPath(path: string): boolean {
  const p = normalizeCrawlPath(path);
  if (TECHNICAL.has(p) || p.startsWith("/.well-known/") || p.startsWith("/wp-json/") || p.startsWith("/_next/") || p.startsWith("/cdn-cgi/")) return false;
  return !ASSET_RE.test(p);
}

export type CrawledPath = { path: string; host: string | null; bots: string[]; visits: number; lastVisited: string };

/** Crawled content pages whose normalized path never appears among the project's cited own URLs. */
export function findCrawledNotCited<T extends CrawledPath>(crawled: T[], citedOwnUrls: string[]): T[] {
  const cited = new Set(citedOwnUrls.map(normalizeCrawlPath));
  const seen = new Set<string>();
  const out: T[] = [];
  for (const c of crawled) {
    if (!isContentPath(c.path)) continue;
    const key = normalizeCrawlPath(c.path);
    if (cited.has(key) || seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}
