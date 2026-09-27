import { Check, Clock } from "lucide-react";
import { Countdown, OfferSwitch, SpotsBar, SpotsLeft } from "@/components/launch-offer/offer-client";
import { ComparisonTable } from "../comparison-table";
import { FaqList } from "../faq";
import { BrowserFrame } from "../frames";
import { EngineStrip } from "../home/engines";
import { getCopy } from "../i18n";
import { localizeHref, type Locale } from "../locales";
import { PricingPlans } from "../pricing-plans";
import { accentText, Container, CtaLink, Eyebrow, LogoMark, SectionHeading } from "../primitives";
import { getOfferCopy, MONTHLY_SIGNUP_HREF, OFFER_SIGNUP_HREF, type LaunchOfferCopy } from "./copy";
import { offerOpenAtRender } from "./offer-sections";

/**
 * /launch and /de/launch: the landing page for the launch offer (ads link here). One goal — claim the offer —
 * so every CTA goes to the yearly checkout. Once the offer has ended the page shows the regular plans instead.
 */
export function LaunchPageContent({ locale }: { locale: Locale }) {
  const initialOpen = offerOpenAtRender();
  return (
    <OfferSwitch
      initialOpen={initialOpen}
      offer={<OfferPage locale={locale} initialOpen={initialOpen} />}
      fallback={<EndedPage locale={locale} />}
    />
  );
}

function OfferPage({ locale, initialOpen }: { locale: Locale; initialOpen: boolean }) {
  const offer = getOfferCopy(locale);
  const { page } = offer;
  const { plans } = getCopy(locale);
  const cloud = plans.find((p) => p.id === "cloud");
  return (
    <>
      <section className="relative overflow-clip border-b">
        <div className="mk-hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="mk-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        {/* Mobile: headline, price card, details. Desktop: headline and details left, card right. */}
        <Container className="relative grid gap-x-14 gap-y-8 pt-12 pb-16 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_26rem] lg:pb-20">
          <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
            <Eyebrow>{page.eyebrow}</Eyebrow>
            <h1 className="mt-4 text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.035em] text-balance sm:text-6xl">
              {page.title}
            </h1>
          </div>
          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
            <OfferCard copy={offer} initialOpen={initialOpen} />
          </div>
          <div className="lg:col-start-1 lg:row-start-2">
            <p className="max-w-2xl text-lg leading-8 text-pretty text-muted-foreground">{page.subtitle}</p>
            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {page.trust.map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <Check className="size-4 text-green-700 dark:text-green-400" strokeWidth={2.5} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section aria-label={page.screenshotAlt} className="pt-14 sm:pt-20">
        <Container className="max-w-6xl">
          <div className="mk-stage relative overflow-hidden rounded-3xl border border-white/10 p-3 sm:p-6 lg:p-10">
            <div className="mk-dots-light absolute inset-0 opacity-60" aria-hidden="true" />
            <BrowserFrame
              src="/screenshots/dashboard.png"
              darkSrc="/screenshots/dashboard-dark.png"
              alt={page.screenshotAlt}
              sizes="(min-width: 1152px) 1024px, calc(100vw - 3rem)"
              reveal={false}
              className="relative"
            />
          </div>
        </Container>
      </section>

      <EngineStrip locale={locale} />

      {cloud && (
        <section aria-labelledby="offer-included" className="border-y bg-card/60 py-20 sm:py-24">
          <Container>
            <SectionHeading
              id="offer-included"
              eyebrow={page.included.eyebrow}
              title={page.included.title}
              subtitle={page.included.subtitle}
            />
            <ul className="mx-auto mt-12 grid max-w-4xl gap-x-10 gap-y-4 sm:grid-cols-2">
              {cloud.features.map((feature) => (
                <li key={feature} className="flex gap-3 text-base leading-7">
                  <Check className="mt-1.5 size-4 shrink-0 text-green-700 dark:text-green-400" strokeWidth={2.5} aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-12 flex justify-center">
              <CtaLink href={OFFER_SIGNUP_HREF} size="lg" arrow>
                {page.cta}
              </CtaLink>
            </div>
          </Container>
        </section>
      )}

      <section aria-labelledby="offer-compare" className="py-20 sm:py-24">
        <Container>
          <SectionHeading id="offer-compare" eyebrow={page.compare.eyebrow} title={page.compare.title} />
          <div className="mx-auto mt-12 max-w-4xl">
            <ComparisonTable locale={locale} />
          </div>
        </Container>
      </section>

      <section aria-labelledby="offer-faq" className="border-t py-20 sm:py-24">
        <Container className="max-w-3xl">
          <SectionHeading id="offer-faq" title={page.faqTitle} />
          <div className="mt-10">
            <FaqList items={page.faq} />
          </div>
        </Container>
      </section>

      <section id="landing-cta" aria-labelledby="offer-final" className="pb-20 sm:pb-28">
        <Container>
          <div className="mk-dark-panel relative overflow-hidden rounded-3xl px-6 py-16 text-center text-white sm:px-12 sm:py-20">
            <div className="mk-dots-light absolute inset-0" aria-hidden="true" />
            <div className="relative">
              <LogoMark className="mx-auto size-12 rounded-xl ring-1 ring-white/15" />
              <h2 id="offer-final" className="mx-auto mt-6 max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
                {page.finalTitle}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-pretty text-white/75">{page.finalSubtitle}</p>
              <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80">
                <Clock className="size-4" aria-hidden="true" />
                {page.endsIn}
                <Countdown labels={offer.countdown} className="font-semibold text-white" />
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <CtaLink href={OFFER_SIGNUP_HREF} variant="inverted" size="lg" arrow className="w-full sm:w-auto">
                  {page.cta}
                </CtaLink>
                <CtaLink href={MONTHLY_SIGNUP_HREF} variant="inverted-outline" size="lg" className="w-full sm:w-auto">
                  {page.finalSecondary}
                </CtaLink>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

/** The price card next to the hero: anchor price, countdown, spots left and the one CTA. */
function OfferCard({ copy, initialOpen }: { copy: LaunchOfferCopy; initialOpen: boolean }) {
  const { page } = copy;
  return (
    <div className="relative rounded-3xl border bg-card p-6 shadow-[0_24px_64px_-28px_oklch(0.4_0.12_152/0.45)] ring-2 ring-green-600/70 sm:p-8 dark:ring-green-400/60">
      <span className="absolute -top-3 left-6 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white dark:bg-green-500 dark:text-[#07210f]">
        {copy.card.ribbon}
      </span>
      <p className="flex items-baseline gap-3">
        <span className="text-2xl font-semibold text-muted-foreground line-through decoration-2">{page.priceWas}</span>
        <span className={`text-6xl font-semibold tracking-tight ${accentText}`}>{page.price}</span>
      </p>
      <p className="mt-1 text-sm font-medium">{page.priceLabel}</p>
      <p className="mt-2 text-sm text-muted-foreground">{page.perMonth}</p>

      <div className="mt-6 rounded-2xl bg-muted/70 p-4">
        <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          <Clock className="size-3.5" aria-hidden="true" />
          {page.endsIn}
        </p>
        <Countdown
          labels={copy.countdown}
          className="mt-2 flex gap-1.5 text-2xl font-semibold tracking-tight"
          segmentClassName="flex-1 rounded-lg bg-background px-2 py-1.5 text-center shadow-xs"
        />
        <div className="mt-3 text-green-700 dark:text-green-400">
          <SpotsBar initialOpen={initialOpen} />
          <SpotsLeft initialOpen={initialOpen} template={page.spotsTemplate} className="mt-1.5 block text-xs font-medium" />
        </div>
      </div>

      <CtaLink href={OFFER_SIGNUP_HREF} size="lg" arrow className="mt-6 w-full">
        {page.cta}
      </CtaLink>
      <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">{page.ctaNote}</p>
    </div>
  );
}

function EndedPage({ locale }: { locale: Locale }) {
  const { ended } = getOfferCopy(locale).page;
  return (
    <>
      <section className="relative overflow-hidden border-b">
        <div className="mk-hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
        <Container className="relative py-16 text-center sm:py-24">
          <Eyebrow>{ended.eyebrow}</Eyebrow>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">{ended.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-pretty text-muted-foreground">{ended.subtitle}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CtaLink href="/signup" size="lg" arrow>
              {ended.cta}
            </CtaLink>
            <CtaLink href={localizeHref("/pricing", locale)} variant="secondary" size="lg">
              {ended.secondary}
            </CtaLink>
          </div>
        </Container>
      </section>
      <section className="py-16 sm:py-20">
        <Container>
          <PricingPlans locale={locale} />
        </Container>
      </section>
    </>
  );
}
