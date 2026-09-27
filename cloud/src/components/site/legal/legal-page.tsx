import type { ReactNode } from "react";
import { Languages } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { Container } from "@/components/marketing/primitives";
import { Prose } from "@/components/marketing/prose";
import { site } from "@/lib/site";
import { homeCrumb } from "../metadata";
import type { Locale } from "../types";

const updatedLabel: Record<Locale, string> = { en: "Last updated", de: "Zuletzt aktualisiert" };

/** Date of the last legal review in the page's language (ISO in `dateTime`). */
function formatUpdated(locale: Locale): string {
  if (locale === "en") return site.legalUpdated;
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(site.legalUpdated));
}

/** Language notice at the top of a legal page (which version prevails, link to the other language). */
export function LegalNotice({ children }: { children: ReactNode }) {
  return (
    <aside className="not-prose mb-10 flex gap-3 rounded-xl border border-sky-500/30 bg-sky-500/5 p-4 text-[0.95rem] leading-7">
      <Languages className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <p className="text-foreground/85 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4">{children}</p>
    </aside>
  );
}

/**
 * Legal page (imprint, privacy policy, terms) in either language: hero with localized breadcrumb, optional language
 * notice, prose body and the localized "last updated" date from `site.legalUpdated`.
 */
export function SiteLegalPage({
  locale,
  crumb,
  title,
  subtitle,
  notice,
  children,
}: {
  locale: Locale;
  crumb: string;
  title: ReactNode;
  subtitle?: ReactNode;
  notice?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      {/* Long German compounds ("Geschäftsbedingungen") would overflow the 375px viewport without hyphenation. */}
      <PageHero crumb={crumb} home={homeCrumb[locale]} title={<span className="break-words hyphens-auto">{title}</span>} subtitle={subtitle} />
      <Container className="max-w-3xl py-14 sm:py-20">
        {notice && <LegalNotice>{notice}</LegalNotice>}
        <Prose>{children}</Prose>
        <p className="mt-16 border-t pt-6 text-sm text-muted-foreground">
          {updatedLabel[locale]}: <time dateTime={site.legalUpdated}>{formatUpdated(locale)}</time>
        </p>
      </Container>
    </>
  );
}
