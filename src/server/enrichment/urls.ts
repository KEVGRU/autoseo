/**
 * URL verification helpers for AI enrichment (pure). An AI answer may only contribute a URL that the model's
 * web search actually returned (exact URL or at least the same host) — or, when the provider's citations are not
 * trustworthy, a URL that a live request proves to exist (see `ai.ts`).
 */

export type Citation = { url: string; title?: string };
export type UrlVerification = "cited" | "host" | "reachable";

/** Canonical form for comparisons: lowercase host without www., no hash, no trailing slash, sorted query. */
export function normalizeUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const params = [...url.searchParams.entries()].filter(([k]) => !/^utm_|^srsltid$|^gclid$|^fbclid$/i.test(k)).sort(([a], [b]) => (a < b ? -1 : 1));
  const query = params.length ? `?${new URLSearchParams(params).toString()}` : "";
  const path = url.pathname.replace(/\/+$/, "") || "";
  return `${host}${path}${query}`;
}

/** Registrable-ish host (lowercase, no www.) of a URL or bare domain. */
export function hostOf(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    const host = url.hostname
      .toLowerCase()
      .replace(/^www\./, "")
      .replace(/\.$/, "");
    return host.includes(".") ? host : null;
  } catch {
    return null;
  }
}

/** Whether `host` is `domain` or one of its subdomains. */
export function hostMatchesDomain(host: string, domain: string): boolean {
  const h = host.toLowerCase().replace(/^www\./, "");
  const d = domain.toLowerCase().replace(/^www\./, "");
  return h === d || h.endsWith(`.${d}`);
}

/** Absolute http(s) URL or null (adds https:// to bare hosts like "example.com/page"). */
export function toAbsoluteUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value || /\s/.test(value)) return null;
  const candidate = /^https?:\/\//i.test(value) ? value : /^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(value) ? `https://${value}` : null;
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** URLs mentioned in free text (markdown links + bare URLs) — mirrors the local agent's citation extraction. */
export function linksFromText(text: string): string[] {
  const out: string[] = [];
  if (!text) return out;
  for (const m of text.matchAll(/\[([^\]]{1,300})\]\((https?:\/\/[^\s)]+)\)/g)) out.push(m[2]!);
  for (const m of text.matchAll(/(?<![(\w])(https?:\/\/[^\s)\]>"'\\]+)/g)) out.push(m[1]!.replace(/[.,;:]+$/, ""));
  return out;
}

/**
 * Citations that come from the web-search tool itself. Local agents merge links found in their own answer text into
 * `citations`, so for them every URL that also appears in the answer text is not independent evidence.
 */
export function trustedCitations(provider: string, citations: Citation[], answerText: string): Citation[] {
  if (provider !== "agent") return citations;
  const inText = new Set(
    linksFromText(answerText)
      .map((u) => normalizeUrl(u))
      .filter((u): u is string => Boolean(u)),
  );
  return citations.filter((c) => {
    const n = normalizeUrl(c.url);
    return n != null && !inText.has(n);
  });
}

/**
 * Classifies each URL against the web-search citations: "cited" (same URL), "host" (same host as a cited URL) or
 * null (unverified — must be dropped or checked live).
 */
export function matchCitations(urls: string[], citations: Citation[]): Map<string, "cited" | "host" | null> {
  const exact = new Set<string>();
  const hosts = new Set<string>();
  for (const c of citations) {
    const n = normalizeUrl(c.url);
    if (n) exact.add(n);
    const h = hostOf(c.url);
    if (h) hosts.add(h);
  }
  const out = new Map<string, "cited" | "host" | null>();
  for (const url of urls) {
    const n = normalizeUrl(url);
    if (!n) {
      out.set(url, null);
      continue;
    }
    if (exact.has(n)) out.set(url, "cited");
    else {
      const h = hostOf(url);
      out.set(url, h && hosts.has(h) ? "host" : null);
    }
  }
  return out;
}

/** Whether an HTTP status proves the page exists (bot walls — 401/403/429 — still prove the host serves it). */
export function statusProvesExistence(status: number): boolean {
  return (status >= 200 && status < 400) || status === 401 || status === 403 || status === 429;
}
