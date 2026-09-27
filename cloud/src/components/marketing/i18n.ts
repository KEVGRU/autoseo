import { copy as en, type MarketingCopy } from "./content";
import { copy as de } from "./content.de";
import type { Locale } from "./locales";

const copies: Record<Locale, MarketingCopy> = { en, de };

/** Marketing copy for a language. Server-only in practice: client islands receive plain strings as props. */
export function getCopy(locale: Locale = "en"): MarketingCopy {
  return copies[locale];
}

/** Labels for copy buttons in the given language. */
export function copyLabels(copy: MarketingCopy, action: string = copy.ui.copy) {
  return { copy: action, copied: copy.ui.copied, announcement: copy.ui.copiedAnnouncement };
}
