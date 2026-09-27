import type { ReactNode } from "react";
import { getLanding } from "./catalog";
import { SiteFooter } from "./footer";
import { SiteHeader } from "./header";
import { getCopy } from "./i18n";
import { localizeHref, type Locale } from "./locales";
import { MotionObserver } from "./motion-observer";
import { StickyCta } from "./sticky-cta";
import { getOfferCopy, OFFER_SIGNUP_HREF } from "./launch-offer/copy";
import { OfferBanner, offerOpenAtRender } from "./launch-offer/offer-sections";

/** Skip link, header, main landmark, footer and the floating CTA for one language of the marketing site. */
export function MarketingShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const { ui } = getCopy(locale);
  const landing = getLanding(locale).ui;
  const offer = getOfferCopy(locale).sticky;
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {ui.skipToContent}
      </a>
      <OfferBanner locale={locale} />
      <SiteHeader locale={locale} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter locale={locale} />
      <StickyCta
        title={landing.stickyTitle}
        primary={{ label: landing.primaryCta, href: "/signup" }}
        secondary={{ label: landing.secondaryCta, href: localizeHref("/self-hosting", locale) }}
        offer={{ initialOpen: offerOpenAtRender(), title: offer.title, label: offer.cta, href: OFFER_SIGNUP_HREF }}
      />
      <MotionObserver />
    </>
  );
}
