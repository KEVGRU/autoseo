import { Check } from "lucide-react";
import { ComparisonTable } from "./comparison-table";
import { FaqList } from "./faq";
import { FinalCta } from "./final-cta";
import { getCopy } from "./i18n";
import type { Locale } from "./locales";
import { PageHero } from "./page-hero";
import { PricingPlans } from "./pricing-plans";
import { Container, SectionHeading } from "./primitives";

/** The pricing page body, shared by /pricing and /de/pricing. */
export function PricingPageContent({ locale }: { locale: Locale }) {
  const { pricingPage, overview, comparison, pricingFaq, sectionLabels, ui } = getCopy(locale);
  return (
    <>
      <PageHero
        crumb={pricingPage.crumb}
        home={{ label: ui.homeLabel, href: ui.homeHref }}
        eyebrow={pricingPage.eyebrow}
        title={pricingPage.title}
        subtitle={pricingPage.subtitle}
      />

      <section aria-label={sectionLabels.plans} className="py-16 sm:py-20">
        <Container>
          <PricingPlans locale={locale} headingLevel="h2" />
        </Container>
      </section>

      <section aria-labelledby="included-title" className="border-y bg-card/60 py-20 sm:py-24">
        <Container>
          <SectionHeading
            id="included-title"
            eyebrow={pricingPage.included.eyebrow}
            title={pricingPage.included.title}
            subtitle={pricingPage.included.subtitle}
          />
          <ul className="mx-auto mt-12 grid max-w-5xl gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {overview.items.map((item) => (
              <li key={item.title}>
                <h3 className="flex items-center gap-2 font-semibold">
                  <Check className="size-4 text-green-700 dark:text-green-400" strokeWidth={2.5} aria-hidden="true" />
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="compare-title" className="py-20 sm:py-24">
        <Container>
          <SectionHeading id="compare-title" eyebrow={comparison.eyebrow} title={comparison.title} subtitle={comparison.subtitle} />
          <div className="mx-auto mt-12 max-w-4xl">
            <ComparisonTable locale={locale} />
          </div>
        </Container>
      </section>

      <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 border-t py-20 sm:py-24">
        <Container className="max-w-3xl">
          <SectionHeading id="faq-title" eyebrow={pricingPage.faq.eyebrow} title={pricingPage.faq.title} />
          <div className="mt-10">
            <FaqList items={pricingFaq} />
          </div>
        </Container>
      </section>

      <FinalCta locale={locale} />
    </>
  );
}
