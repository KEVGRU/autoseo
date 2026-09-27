/** Landing-page copy per language (server-only in practice; client islands receive plain strings as props). */
import type { Locale } from "../locales";
import { catalog as de } from "./de";
import { catalog as en } from "./en";
import type { LandingCatalog } from "./types";

const catalogs: Record<Locale, LandingCatalog> = { en, de };

export function getLanding(locale: Locale = "en"): LandingCatalog {
  return catalogs[locale];
}
