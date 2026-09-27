/**
 * Domain Overview from an AI domain profile (no DataForSEO): maps the estimated profile to the same row shapes the
 * Labs endpoints produce and applies filters / sorting / pagination in memory. Pure.
 */
import type { DomainKeywordRow, DomainKeywordsFilters, DomainPageRow, DomainPagesFilters, DomainSortMode, SortOrder } from "./domain";
import { parseFilterTerms } from "./filters";
import { toRelativePath, type ResearchTarget } from "./research-scope";

export type AiDomainProfileLike = {
  organicTrafficEst: number | null;
  topKeywords: {
    keyword: string;
    positionEst: number | null;
    volumeEst: number | null;
    url: string | null;
  }[];
  topPages: { url: string; share: number | null; keywordsEst: number | null }[];
};

/** Typical organic click-through rate by position (industry average curve; 0 beyond page 2). */
export function estimateCtr(position: number | null): number {
  if (position == null || position < 1) return 0;
  const curve = [0.28, 0.157, 0.11, 0.08, 0.072, 0.051, 0.04, 0.032, 0.028, 0.025];
  if (position <= 10) return curve[Math.round(position) - 1] ?? 0.025;
  if (position <= 20) return 0.01;
  return 0;
}

/** Whether a URL is inside an exact_url / subfolder research target (domain scopes match everything). */
export function urlInTarget(url: string | null, target: Pick<ResearchTarget, "scope" | "path">): boolean {
  if (target.scope === "domain" || target.scope === "subdomains") return true;
  if (!url) return false;
  const path = (toRelativePath(url) ?? "").replace(/[?#].*$/, "").replace(/\/+$/, "");
  if (target.scope === "exact_url") return path === target.path;
  return path === target.path || path.startsWith(`${target.path}/`);
}

export function aiProfileToKeywordRows(profile: AiDomainProfileLike, target: Pick<ResearchTarget, "scope" | "path">): DomainKeywordRow[] {
  return profile.topKeywords
    .filter((k) => urlInTarget(k.url, target))
    .map((k) => ({
      keyword: k.keyword,
      position: k.positionEst,
      searchVolume: k.volumeEst,
      traffic: k.volumeEst != null && k.positionEst != null ? Math.round(k.volumeEst * estimateCtr(k.positionEst)) : null,
      cpc: null,
      url: k.url,
      relativeUrl: k.url ? toRelativePath(k.url) : null,
      keywordDifficulty: null,
    }));
}

export function aiProfileToPageRows(profile: AiDomainProfileLike, target: Pick<ResearchTarget, "scope" | "path">): DomainPageRow[] {
  return profile.topPages
    .filter((p) => urlInTarget(p.url, target))
    .map((p) => ({
      page: p.url,
      relativePath: toRelativePath(p.url),
      organicTraffic: p.share != null && profile.organicTrafficEst != null ? Math.round(p.share * profile.organicTrafficEst) : null,
      keywords: p.keywordsEst,
    }));
}

function inRange(v: number | null, min?: number, max?: number): boolean {
  if (min == null && max == null) return true;
  if (v == null) return false;
  return (min == null || v >= min) && (max == null || v <= max);
}

function matchesTerms(text: string, include?: string, exclude?: string): boolean {
  const t = text.toLowerCase();
  const inc = parseFilterTerms(include);
  const exc = parseFilterTerms(exclude);
  return inc.every((term) => t.includes(term)) && !exc.some((term) => t.includes(term));
}

function compare(a: number | string | null, b: number | string | null, order: SortOrder): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1; // nulls last
  if (b == null) return -1;
  const d = typeof a === "string" || typeof b === "string" ? String(a).localeCompare(String(b)) : a - b;
  return order === "asc" ? d : -d;
}

export type PageSlice<T> = { rows: T[]; totalCount: number; hasMore: boolean };

function slice<T>(rows: T[], page: number, pageSize: number): PageSlice<T> {
  const offset = (page - 1) * pageSize;
  return {
    rows: rows.slice(offset, offset + pageSize),
    totalCount: rows.length,
    hasMore: offset + pageSize < rows.length,
  };
}

const KEYWORD_SORT: Record<DomainSortMode, (r: DomainKeywordRow) => number | null> = {
  rank: (r) => r.position,
  traffic: (r) => r.traffic,
  volume: (r) => r.searchVolume,
  score: (r) => r.keywordDifficulty,
  cpc: (r) => r.cpc,
};

export function queryKeywordRows(
  rows: DomainKeywordRow[],
  q: {
    filters: DomainKeywordsFilters;
    search?: string;
    sortMode: DomainSortMode;
    sortOrder: SortOrder;
    page: number;
    pageSize: number;
  },
): PageSlice<DomainKeywordRow> {
  const f = q.filters;
  const search = q.search?.trim().toLowerCase();
  const filtered = rows.filter(
    (r) =>
      matchesTerms(r.keyword, f.include, f.exclude) &&
      inRange(r.searchVolume, f.minVol, f.maxVol) &&
      inRange(r.traffic, f.minTraffic, f.maxTraffic) &&
      inRange(r.cpc, f.minCpc, f.maxCpc) &&
      inRange(r.keywordDifficulty, f.minKd, f.maxKd) &&
      inRange(r.position, f.minRank, f.maxRank) &&
      (!search || r.keyword.includes(search) || (r.url ?? "").toLowerCase().includes(search)),
  );
  const key = KEYWORD_SORT[q.sortMode];
  filtered.sort((a, b) => compare(key(a), key(b), q.sortOrder));
  return slice(filtered, q.page, q.pageSize);
}

export function queryPageRows(
  rows: DomainPageRow[],
  q: {
    filters: DomainPagesFilters;
    search?: string;
    sortMode: "traffic" | "keywords";
    sortOrder: SortOrder;
    page: number;
    pageSize: number;
  },
): PageSlice<DomainPageRow> {
  const f = q.filters;
  const search = q.search?.trim().toLowerCase();
  const filtered = rows.filter(
    (r) =>
      matchesTerms(r.page, f.include, f.exclude) &&
      inRange(r.organicTraffic, f.minTraffic, f.maxTraffic) &&
      inRange(r.keywords, f.minVol, f.maxVol) &&
      (!search || r.page.toLowerCase().includes(search)),
  );
  filtered.sort((a, b) =>
    compare(q.sortMode === "traffic" ? a.organicTraffic : a.keywords, q.sortMode === "traffic" ? b.organicTraffic : b.keywords, q.sortOrder),
  );
  return slice(filtered, q.page, q.pageSize);
}

export type SerpCompetitorAggregate = {
  domain: string;
  avgPosition: number | null;
  medianPosition: number | null;
  visibility: number | null;
  etv: number | null;
  keywordsCount: number | null;
};

/**
 * SERP competitors from observed SERPs: per domain the average/median position over the keywords it appears for,
 * visibility = Σ CTR(position) / keyword count (share of clicks it would win across the set).
 */
export function aggregateSerpCompetitors(serps: { keyword: string; items: { position: number; domain: string }[] }[]): SerpCompetitorAggregate[] {
  const byDomain = new Map<string, number[]>();
  for (const serp of serps) {
    const best = new Map<string, number>();
    for (const item of serp.items) {
      const d = item.domain.toLowerCase().replace(/^www\./, "");
      if (!d) continue;
      if (!best.has(d) || item.position < best.get(d)!) best.set(d, item.position);
    }
    for (const [d, pos] of best) byDomain.set(d, [...(byDomain.get(d) ?? []), pos]);
  }
  const n = Math.max(1, serps.length);
  return [...byDomain.entries()]
    .map(([domain, positions]) => {
      const sorted = [...positions].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
      return {
        domain,
        avgPosition: Math.round((positions.reduce((s, p) => s + p, 0) / positions.length) * 10) / 10,
        medianPosition: median,
        visibility: Math.round((positions.reduce((s, p) => s + estimateCtr(p), 0) / n) * 1000) / 1000,
        etv: null,
        keywordsCount: positions.length,
      };
    })
    .sort((a, b) => (b.visibility ?? 0) - (a.visibility ?? 0) || (b.keywordsCount ?? 0) - (a.keywordsCount ?? 0));
}
