import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { OfferSwitch, SpotsLeft } from "@/components/launch-offer/offer-client";
import { formatUsd, isLaunchOfferOpenNow, launchOffer } from "@/lib/launch-offer";
import { site } from "@/lib/site";
import { localizeHref, type Locale } from "../locales";
import { CtaLink } from "../primitives";
import { getOfferCopy, MONTHLY_SIGNUP_HREF, OFFER_SIGNUP_HREF } from "./copy";
import { OfferBannerBar } from "./offer-banner";

export const LAUNCH_PATH = "/launch";

/** Whether the offer was open when this (possibly static) page was rendered; clients re-check after mount. */
export function offerOpenAtRender(): boolean {
  return isLaunchOfferOpenNow();
}

export function OfferBanner({ locale }: { locale: Locale }) {
  const copy = getOfferCopy(locale);
  return (
    <OfferBannerBar
      initialOpen={offerOpenAtRender()}
      href={localizeHref(LAUNCH_PATH, locale)}
      labels={{ ...copy.banner, countdown: copy.countdown }}
    />
  );
}

/** Badge of the Cloud plan card: the offer ribbon while it runs, the regular badge afterwards. */
export function CloudPlanBadge({ locale, fallback }: { locale: Locale; fallback: ReactNode }) {
  const copy = getOfferCopy(locale);
  return (
    <OfferSwitch
      initialOpen={offerOpenAtRender()}
      offer={
        <span className="rounded-full bg-green-600 px-2.5 py-1 text-xs font-semibold text-white dark:bg-green-500 dark:text-[#07210f]">
          {copy.card.ribbon}
        </span>
      }
      fallback={fallback}
    />
  );
}

/** Price, note and CTA of the Cloud plan card while the offer runs; `fallback` (the regular block) afterwards. */
export function CloudPlanPrice({ locale, fallback }: { locale: Locale; fallback: ReactNode }) {
  const copy = getOfferCopy(locale);
  const initialOpen = offerOpenAtRender();
  return (
    <OfferSwitch
      initialOpen={initialOpen}
      fallback={fallback}
      offer={
        <>
          <p className="mt-6 flex flex-wrap items-baseline gap-x-2">
            <span className="text-2xl font-semibold text-muted-foreground line-through decoration-2">${site.priceMonthlyUsd}</span>
            <span className="text-5xl font-semibold tracking-tight">{formatUsd(launchOffer.monthlyEquivalentUsd)}</span>
            <span className="text-sm text-muted-foreground">{copy.card.period}</span>
          </p>
          <p className="mt-1 min-h-5 text-xs text-muted-foreground">
            {copy.card.note}
            <SpotsLeft
              initialOpen={initialOpen}
              template={` · ${copy.spotsTemplate}`}
              className="font-medium text-green-700 dark:text-green-400"
            />
          </p>
          <CtaLink href={OFFER_SIGNUP_HREF} size="lg" arrow className="mt-6 w-full">
            {copy.card.cta}
          </CtaLink>
          <Link
            href={MONTHLY_SIGNUP_HREF}
            prefetch={false}
            className="mt-3 text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {copy.card.monthlyLink}
          </Link>
        </>
      }
    />
  );
}

/**
 * A primary "Start for $50/month" CTA that becomes "Start with 50% off" (yearly checkout) while the offer runs.
 * `fallback` is the regular link, rendered unchanged afterwards.
 */
export function OfferStartCta({
  locale,
  fallback,
  ...props
}: { locale: Locale; fallback: ReactNode } & Omit<ComponentProps<typeof CtaLink>, "href" | "children">) {
  return (
    <OfferSwitch
      initialOpen={offerOpenAtRender()}
      fallback={fallback}
      offer={
        <CtaLink href={OFFER_SIGNUP_HREF} {...props}>
          {getOfferCopy(locale).startCta}
        </CtaLink>
      }
    />
  );
}
