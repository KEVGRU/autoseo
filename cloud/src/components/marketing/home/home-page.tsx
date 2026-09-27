import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { site } from "@/lib/site";
import { ComparisonTable } from "../comparison-table";
import { FaqList } from "../faq";
import { FinalCta } from "../final-cta";
import { getCopy } from "../i18n";
import type { Locale } from "../locales";
import { PricingPlans } from "../pricing-plans";
import { accentText, Container, SectionHeading } from "../primitives";
import { CloudSteps } from "./cloud-steps";
import { EngineStrip } from "./engines";
import { Bento } from "./bento";
import { Actions, Developers, FeatureRows, Security, SeoSuite } from "./features";
import { Hero } from "./hero";
import { OpenSource } from "./open-source";
import { PlatformOverview } from "./platform-overview";
import { Problem } from "./problem";
import { Sphere } from "./sphere";

/** The landing page body, shared by / and /de. */
export function HomePageContent({ locale }: { locale: Locale }) {
  const { comparison, homeFaq, pricingTeaser, faqSection, sectionLabels } = getCopy(locale);
  return (
    <>
      <Hero locale={locale} />
      <EngineStrip locale={locale} />
      <Problem locale={locale} />
      <Bento locale={locale} />

      <section aria-label={sectionLabels.featureDetails} className="pb-20 sm:pb-28">
        <Container className="space-y-24 sm:space-y-32">
          <FeatureRows locale={locale} from={0} to={3} />
          <SeoSuite locale={locale} flip />
          <FeatureRows locale={locale} from={3} to={4} offset={1} />
        </Container>
      </section>

      <Actions locale={locale} />

      <section aria-label={sectionLabels.moreFeatures} className="pb-20 sm:pb-28">
        <Container className="space-y-24 sm:space-y-32">
          <FeatureRows locale={locale} from={4} offset={1} />
        </Container>
      </section>

      <Developers locale={locale} />

      <section aria-label={sectionLabels.security} className="py-20 sm:py-28">
        <Container>
          <Security locale={locale} />
        </Container>
      </section>

      <Sphere locale={locale} />
      <PlatformOverview locale={locale} />

      <CloudSteps locale={locale} />
      <OpenSource locale={locale} />

      <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-20 pb-20 sm:pb-28">
        <Container>
          <SectionHeading
            id="pricing-title"
            eyebrow={pricingTeaser.eyebrow}
            title={pricingTeaser.title}
            subtitle={pricingTeaser.subtitle}
          />
          <div className="mt-12">
            <PricingPlans locale={locale} />
          </div>
          <p className="mt-6 text-center">
            <Link
              href={pricingTeaser.link.href}
              className={`inline-flex items-center gap-1.5 rounded-sm text-sm font-medium ${accentText} hover:underline focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none`}
            >
              {pricingTeaser.link.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </p>
        </Container>
      </section>

      <section aria-labelledby="compare-title" className="border-t bg-card/60 py-20 sm:py-28">
        <Container>
          <SectionHeading
            id="compare-title"
            eyebrow={comparison.eyebrow}
            title={comparison.title}
            subtitle={comparison.subtitle}
          />
          <div className="mx-auto mt-12 max-w-4xl">
            <ComparisonTable locale={locale} />
          </div>
        </Container>
      </section>

      <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 py-20 sm:py-28">
        <Container className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <SectionHeading id="faq-title" eyebrow={faqSection.eyebrow} title={faqSection.title} align="left" />
            <p className="mt-4 text-muted-foreground">
              {faqSection.contactBefore}{" "}
              <a
                href={`mailto:${site.legal.email}`}
                className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
              >
                {faqSection.emailUs}
              </a>{" "}
              {faqSection.contactMiddle}{" "}
              <a
                href={site.github}
                target="_blank"
                rel="noopener"
                className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
              >
                GitHub
              </a>
              {faqSection.contactAfter}
            </p>
          </div>
          <div className="lg:col-span-8">
            <FaqList items={homeFaq} />
          </div>
        </Container>
      </section>

      <FinalCta locale={locale} />
    </>
  );
}
