/**
 * Backlinks from an AI link-mention SAMPLE (no DataForSEO backlink index): pages found via web search that mention
 * or link the target, with link data (target URL, anchor, nofollow) read from the live pages. Maps the sample to the
 * backlinks / referring-domains / top-pages row shapes; totals, history, ranks and spam scores stay null. Pure.
 */
import type { BacklinkRow, NormalizedBacklinksTarget, ReferringDomainRow, TopPageRow } from "./backlinks";

export type LinkMentionLike = {
  url: string;
  domain: string;
  title: string | null;
  linksToDomain: boolean | null;
  links: { url: string; anchor: string | null; nofollow: boolean }[];
};

export type AiBacklinksSample = {
  /** Pages in the sample (after scope filtering). */
  pages: number;
  referringDomains: number;
  /** Pages whose live HTML contains a link to the target. */
  linkingPages: number;
  /** Pages that mention the target without a (detectable) link. */
  mentionOnlyPages: number;
};

function stripWww(host: string) {
  return host.toLowerCase().replace(/^www\./, "");
}

function pathOf(url: string): string {
  try {
    return new URL(url).pathname.replace(/\/+$/, "");
  } catch {
    return "";
  }
}

/** Links of a mention that point into the research target (scope-aware). */
export function linksInTarget(m: LinkMentionLike, t: Pick<NormalizedBacklinksTarget, "apiTarget" | "scope" | "path">): LinkMentionLike["links"] {
  return m.links.filter((l) => {
    let u: URL;
    try {
      u = new URL(l.url);
    } catch {
      return false;
    }
    const host = stripWww(u.hostname);
    if (t.scope === "exact_url") {
      try {
        const target = new URL(t.apiTarget);
        return host === stripWww(target.hostname) && pathOf(l.url) === pathOf(t.apiTarget);
      } catch {
        return false;
      }
    }
    const base = stripWww(t.apiTarget);
    if (t.scope === "domain") return host === base;
    if (t.scope === "subfolder") return host === base && (pathOf(l.url) === t.path || pathOf(l.url).startsWith(`${t.path}/`));
    return host === base || host.endsWith(`.${base}`);
  });
}

/** Mentions relevant for the scope: domain-wide scopes keep mention-only pages; URL scopes need a matching link. */
export function mentionsInScope(items: LinkMentionLike[], t: Pick<NormalizedBacklinksTarget, "apiTarget" | "scope" | "path">): LinkMentionLike[] {
  return items.filter((m) => {
    const links = linksInTarget(m, t);
    if (links.length) return true;
    return (t.scope === "domain" || t.scope === "subdomains") && m.links.length === 0;
  });
}

export function summarizeSample(items: LinkMentionLike[], t: Pick<NormalizedBacklinksTarget, "apiTarget" | "scope" | "path">): AiBacklinksSample {
  const linking = items.filter((m) => linksInTarget(m, t).length > 0).length;
  return {
    pages: items.length,
    referringDomains: new Set(items.map((m) => stripWww(m.domain))).size,
    linkingPages: linking,
    mentionOnlyPages: items.length - linking,
  };
}

function emptyRow(): Omit<BacklinkRow, "domainFrom" | "urlFrom" | "urlTo" | "anchor" | "itemType" | "isDofollow"> {
  return {
    relAttributes: [],
    rank: null,
    domainFromRank: null,
    pageFromRank: null,
    spamScore: null,
    firstSeen: null,
    lastSeen: null,
    isLost: false,
    isBroken: false,
    linksCount: null,
  };
}

/** One row per (page, linked URL); mention-only pages become `itemType: "mention"` rows without a target URL. */
export function sampleToBacklinkRows(items: LinkMentionLike[], t: Pick<NormalizedBacklinksTarget, "apiTarget" | "scope" | "path">): BacklinkRow[] {
  const rows: BacklinkRow[] = [];
  for (const m of items) {
    const links = linksInTarget(m, t);
    if (links.length === 0) {
      rows.push({
        ...emptyRow(),
        domainFrom: stripWww(m.domain),
        urlFrom: m.url,
        urlTo: null,
        anchor: null,
        itemType: "mention",
        isDofollow: null,
      });
      continue;
    }
    for (const l of links) {
      rows.push({
        ...emptyRow(),
        domainFrom: stripWww(m.domain),
        urlFrom: m.url,
        urlTo: l.url,
        anchor: l.anchor,
        itemType: "anchor",
        isDofollow: !l.nofollow,
        relAttributes: l.nofollow ? ["nofollow"] : [],
        linksCount: links.length,
      });
    }
  }
  return rows;
}

export function sampleToReferringDomains(items: LinkMentionLike[], t: Pick<NormalizedBacklinksTarget, "apiTarget" | "scope" | "path">): ReferringDomainRow[] {
  const byDomain = new Map<string, { pages: number; links: number }>();
  for (const m of items) {
    const d = stripWww(m.domain);
    const cur = byDomain.get(d) ?? { pages: 0, links: 0 };
    cur.pages += 1;
    cur.links += linksInTarget(m, t).length;
    byDomain.set(d, cur);
  }
  return [...byDomain.entries()].map(([domain, v]) => ({
    domain,
    backlinks: v.links,
    referringPages: v.pages,
    rank: null,
    spamScore: null,
    firstSeen: null,
    brokenBacklinks: null,
    brokenPages: null,
  }));
}

export function sampleToTopPages(items: LinkMentionLike[], t: Pick<NormalizedBacklinksTarget, "apiTarget" | "scope" | "path">): TopPageRow[] {
  const byPage = new Map<string, { links: number; domains: Set<string> }>();
  for (const m of items) {
    for (const l of linksInTarget(m, t)) {
      const key = l.url.replace(/[?#].*$/, "");
      const cur = byPage.get(key) ?? { links: 0, domains: new Set<string>() };
      cur.links += 1;
      cur.domains.add(stripWww(m.domain));
      byPage.set(key, cur);
    }
  }
  return [...byPage.entries()].map(([page, v]) => ({
    page,
    backlinks: v.links,
    referringDomains: v.domains.size,
    rank: null,
    brokenBacklinks: null,
  }));
}

function terms(v: string | undefined): string[] {
  return (v ?? "")
    .toLowerCase()
    .split(/[,+]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** include/exclude term filter over a row's text fields (other numeric filters don't apply to a sample). */
export function matchesTextFilter(texts: (string | null)[], include?: string, exclude?: string): boolean {
  const hay = texts.filter(Boolean).join(" ").toLowerCase();
  return terms(include).every((t) => hay.includes(t)) && !terms(exclude).some((t) => hay.includes(t));
}

export function paginate<T>(rows: T[], page: number, pageSize: number) {
  const offset = (page - 1) * pageSize;
  return {
    rows: rows.slice(offset, offset + pageSize),
    totalCount: rows.length,
    hasMore: offset + pageSize < rows.length,
  };
}
