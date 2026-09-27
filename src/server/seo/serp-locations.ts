import "server-only";
import { z } from "zod";
import { getCountry } from "@/lib/countries";
import { isDataForSeoConfigured } from "@/server/dataforseo/client";
import { SeoError } from "./context";
import { prewarmSerpLocations, searchSerpLocations, type SerpLocationsCtx } from "./rank-tracking";
import type { SerpLocation } from "./lib/serp-locations";

/**
 * City / region search for local rank tracking. With DataForSEO: its free location registry. Without it the typed
 * place is offered as a free-text location ("Munich,Germany") — AI rank checks pass it to the web search as text.
 */
export async function searchSerpLocationsEnriched(ctx: SerpLocationsCtx, input: { query: string; countryCode: string }): Promise<SerpLocation[]> {
  if (await isDataForSeoConfigured(ctx)) return searchSerpLocations(ctx, input);
  return freeTextSerpLocations(input);
}

export function freeTextSerpLocations(input: { query: string; countryCode: string }): SerpLocation[] {
  const q = z
    .string()
    .trim()
    .min(1)
    .max(100)
    .parse(input.query)
    .replace(/\s*,\s*/g, ",")
    .replace(/[^\p{L}\p{N} ,.'-]/gu, "");
  const country = getCountry(input.countryCode);
  if (!country) throw new SeoError("VALIDATION_ERROR", "Invalid country code");
  const place = q
    .split(",")
    .filter(Boolean)
    .map((p) => p.trim().replace(/\b\p{L}/gu, (c) => c.toUpperCase()))
    .join(",");
  if (!place) return [];
  const locationName = place.toLowerCase().endsWith(country.name.toLowerCase()) ? place : `${place},${country.name}`;
  return [
    {
      locationCode: country.locationCode,
      locationName,
      locationType: "City",
      displayLabel: `${locationName.split(",").join(", ")} (AI web search)`,
    },
  ];
}

export async function prewarmSerpLocationsEnriched(ctx: SerpLocationsCtx, countryCode: string) {
  if (!(await isDataForSeoConfigured(ctx))) return { ok: true };
  return prewarmSerpLocations(ctx, countryCode);
}
