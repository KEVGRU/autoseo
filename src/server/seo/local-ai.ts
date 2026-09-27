import "server-only";
import { aiBusinessProfile, aiLocalListings, type AiEnrichmentMeta, type AiLocalListing } from "@/server/enrichment/ai";
import { hostOf } from "@/server/enrichment/urls";
import { getCountryByLocationCode } from "@/lib/countries";
import { rateLimit } from "@/server/rate-limit";
import { SeoError, type SeoContext } from "./context";
import { buildCacheKey, cacheGet, cacheSet, CACHE_TTL } from "./cache";
import { aiCtx, aiMarket } from "./enrichment";
import { matchGridItem, readPath, summarizeGrid, type GridPoint, type GridPointResult } from "./lib/local";

/**
 * Local SEO without DataForSEO: listings, local SERPs and rank grids come from AI web-search estimates of what Google
 * Maps shows for a place (coordinates are reverse-geocoded to a place name first); business profiles come with
 * summaries of reviews / Q&A / posts instead of the individual items (those need DataForSEO Business Data).
 * Result objects keep the DataForSEO row shapes so the UI, REST and MCP render them unchanged, plus `enrichment`.
 */

export type AiLocalResult = Record<string, unknown> & {
  enrichment: { source: "ai"; meta: AiEnrichmentMeta };
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Coordinates → "Suburb, City, Country" via OpenStreetMap Nominatim (1 req/s policy, cached 30 days). */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  const lat = Math.round(latitude * 1000) / 1000;
  const lng = Math.round(longitude * 1000) / 1000;
  const key = buildCacheKey("geocode:reverse", { lat, lng });
  const cached = await cacheGet<{ label: string | null }>(key);
  if (cached) return cached.value.label;
  for (let attempt = 0; !rateLimit("seo:nominatim", 1, 1100); attempt++) {
    if (attempt > 30) throw new SeoError("UPSTREAM", "Place lookup is busy — try again in a minute.");
    await sleep(1100);
  }
  let label: string | null = null;
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=14&lat=${lat}&lon=${lng}`, {
      headers: {
        "User-Agent": "AutoSEO (self-hosted SEO platform)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (res.ok) {
      const json = (await res.json()) as {
        display_name?: string;
        address?: Record<string, string>;
      };
      const a = json.address ?? {};
      const parts = [a.suburb ?? a.neighbourhood ?? a.quarter ?? a.city_district, a.city ?? a.town ?? a.village ?? a.municipality ?? a.county, a.country];
      label = [...new Set(parts.filter(Boolean))].join(", ") || json.display_name || null;
    }
  } catch (err) {
    throw new SeoError("UPSTREAM", `Place lookup failed: ${err instanceof Error ? err.message : String(err)}`);
  }
  await cacheSet(key, "geocode", null, { label }, CACHE_TTL.serpLocations);
  return label;
}

function countryName(ctx: SeoContext): string {
  return getCountryByLocationCode(ctx.market.locationCode)?.name ?? ctx.project.country;
}

async function placeFor(ctx: SeoContext, near?: { latitude: number; longitude: number } | null): Promise<string> {
  if (!near) return countryName(ctx);
  return (await reverseGeocode(near.latitude, near.longitude)) ?? `${near.latitude.toFixed(4)}, ${near.longitude.toFixed(4)}`;
}

function market(ctx: SeoContext, languageCode?: string, locationName?: string | null) {
  return aiMarket(
    {
      locationCode: ctx.market.locationCode,
      languageCode: languageCode ?? ctx.market.languageCode,
    },
    locationName ?? null,
  );
}

/** AI listing → DataForSEO-shaped business listing row. */
export function listingToBusinessRow(l: AiLocalListing): Record<string, unknown> {
  return {
    title: l.name,
    category: l.category,
    address: l.address,
    phone: l.phone,
    url: l.url,
    domain: l.url ? hostOf(l.url) : null,
    rating: l.rating != null ? { value: l.rating, votes_count: l.reviews } : null,
  };
}

/** AI listing → DataForSEO-shaped Maps SERP row. */
export function listingToRow(l: AiLocalListing): Record<string, unknown> {
  return {
    rank_group: l.position,
    rank_absolute: l.position,
    title: l.name,
    category: l.category,
    address: l.address,
    phone: l.phone,
    url: l.url,
    domain: l.url ? hostOf(l.url) : null,
    rating: l.rating != null ? { value: l.rating, votes_count: l.reviews } : null,
  };
}

export async function aiBusinessSearch(
  ctx: SeoContext,
  i: {
    query?: string;
    near: { latitude: number; longitude: number };
    categories?: string[];
    minRating?: number;
    minReviews?: number;
    sortBy: "relevance" | "rating" | "reviews";
    limit: number;
    offset: number;
  },
): Promise<AiLocalResult> {
  const place = await placeFor(ctx, i.near);
  const query = i.query ?? (i.categories?.map((c) => c.replace(/_/g, " ")).join(", ") || "local businesses");
  const res = await aiLocalListings(aiCtx(ctx), {
    query,
    place,
    market: market(ctx, undefined, place),
    limit: 20,
  });
  let items = res.items.filter((l) => (i.minRating == null || (l.rating ?? 0) >= i.minRating) && (i.minReviews == null || (l.reviews ?? 0) >= i.minReviews));
  if (i.sortBy === "rating") items = [...items].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  if (i.sortBy === "reviews") items = [...items].sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0));
  const rows = items.slice(i.offset, i.offset + i.limit).map(listingToBusinessRow);
  return {
    businesses: rows,
    totalCount: items.length,
    place,
    enrichment: { source: "ai", meta: res.meta },
  };
}

export async function aiLocalSerp(
  ctx: SeoContext,
  i: {
    keyword: string;
    near: { latitude: number; longitude: number };
    searchType: "maps" | "local_finder";
    depth: number;
    languageCode?: string;
  },
): Promise<AiLocalResult> {
  const place = await placeFor(ctx, i.near);
  const res = await aiLocalListings(aiCtx(ctx), {
    query: i.keyword,
    place,
    market: market(ctx, i.languageCode, place),
    limit: Math.min(20, i.depth),
  });
  return {
    items: res.items.map(listingToRow),
    searchType: i.searchType,
    place,
    enrichment: { source: "ai", meta: res.meta },
  };
}

/**
 * One AI Maps estimate per distinct place of the grid (points are reverse-geocoded; points in the same suburb share
 * one estimate). The target is matched by name — CID / place ID only exist in DataForSEO data.
 */
export async function aiRankGrid(
  ctx: SeoContext,
  i: {
    keyword: string;
    target: { cid?: string; placeId?: string; name?: string };
    gridSize: number;
    spacingKm: number;
    device: "desktop" | "mobile";
    center: { latitude: number; longitude: number };
    languageCode?: string;
  },
  points: GridPoint[],
  zoom: number,
): Promise<AiLocalResult> {
  if (!i.target.name) {
    throw new SeoError("VALIDATION_ERROR", "AI rank grids match the business by name — enter the business name (CID / place ID matching needs DataForSEO).");
  }
  const byPlace = new Map<string, Awaited<ReturnType<typeof aiLocalListings>>>();
  let meta: AiEnrichmentMeta | null = null;
  let matchedBusiness: {
    title: string | null;
    cid: string | null;
    placeId: string | null;
  } | null = null;
  const grid: GridPointResult[] = [];
  let lastError: unknown = null;
  for (const p of points) {
    try {
      const place = await placeFor(ctx, p);
      let res = byPlace.get(place);
      if (!res) {
        res = await aiLocalListings(aiCtx(ctx), {
          query: i.keyword,
          place,
          market: market(ctx, i.languageCode, place),
          limit: 20,
        });
        byPlace.set(place, res);
      }
      meta ??= res.meta;
      const rows = res.items.map(listingToRow);
      const match = matchGridItem(rows, { name: i.target.name });
      const title = readPath(match, "title");
      if (match && !matchedBusiness)
        matchedBusiness = {
          title: typeof title === "string" ? title : null,
          cid: null,
          placeId: null,
        };
      const rank = readPath(match, "rank_absolute");
      const first = rows[0];
      grid.push({
        ...p,
        rank: typeof rank === "number" ? rank : null,
        resultsCount: rows.length,
        topResult: first
          ? {
              title: typeof first.title === "string" ? first.title : null,
              cid: null,
            }
          : null,
      });
    } catch (err) {
      if (err instanceof SeoError && err.code !== "UPSTREAM") throw err;
      lastError = err;
      grid.push({ ...p, rank: null, error: true });
    }
  }
  if (!meta || grid.every((p) => p.error)) throw lastError ?? new SeoError("UPSTREAM", "Every grid point failed");
  return {
    grid,
    summary: summarizeGrid(grid),
    matchedBusiness,
    gridSize: i.gridSize,
    spacingKm: i.spacingKm,
    zoom,
    center: i.center,
    keyword: i.keyword,
    device: i.device,
    places: byPlace.size,
    enrichment: { source: "ai", meta },
  };
}

/** Business profile / reviews / questions / posts from one cached AI profile lookup (summaries, no item lists). */
export async function aiBusinessData(
  ctx: SeoContext,
  tool: "business_profile" | "reviews" | "questions" | "posts",
  i: {
    businessName?: string;
    cid?: string;
    placeId?: string;
    near?: { latitude: number; longitude: number } | null;
    languageCode?: string;
  },
): Promise<AiLocalResult> {
  if (!i.businessName) {
    throw new SeoError("VALIDATION_ERROR", "AI estimates look businesses up by name — enter the business name (CID / place ID lookups need DataForSEO).");
  }
  const place = i.near ? await placeFor(ctx, i.near) : null;
  const res = await aiBusinessProfile(aiCtx(ctx), {
    name: i.businessName,
    place,
    market: market(ctx, i.languageCode, place),
  });
  const p = res.profile;
  const enrichment = { source: "ai" as const, meta: res.meta };
  const rating = p.rating != null ? { value: p.rating, votes_count: p.reviews } : null;
  const summary = {
    reviews: p.reviewsSummary,
    questions: p.qaSummary,
    posts: p.postsSummary,
  };
  if (!p.found) {
    if (tool === "business_profile") return { profile: null, enrichment };
    return { [tool]: [], totals: null, aiSummary: null, enrichment };
  }
  switch (tool) {
    case "business_profile":
      return {
        profile: {
          title: p.name ?? i.businessName,
          category: p.category,
          address: p.address,
          phone: p.phone,
          url: p.website,
          domain: p.website ? hostOf(p.website) : null,
          rating,
          description: p.description,
          ai_hours: p.hours,
        },
        aiSummary: summary,
        enrichment,
      };
    case "reviews":
      return {
        reviews: [],
        totals: { title: p.name, rating, reviews_count: p.reviews },
        source: "ai",
        aiSummary: summary,
        enrichment,
      };
    case "questions":
      return { questions: [], aiSummary: summary, enrichment };
    case "posts":
      return {
        posts: [],
        totals: { title: p.name },
        aiSummary: summary,
        enrichment,
      };
  }
}
