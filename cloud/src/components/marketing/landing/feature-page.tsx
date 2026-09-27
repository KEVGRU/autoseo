import { getLanding } from "../catalog";
import { featurePath, platformPath, platformSlugs, type FeatureSlug } from "../catalog/routes";
import type { VisualKind } from "../catalog/types";
import { BrowserFrame } from "../frames";
import { localizeHref, type Locale } from "../locales";
import { Container } from "../primitives";
import { Stage, Visual } from "../visuals";
import {
  CardGrid,
  ChipLinks,
  ctaTargets,
  FaqSection,
  LandingCta,
  LandingHero,
  LinkCards,
  SectionTitle,
  Steps,
  WhySection,
} from "./blocks";
import { LandingJsonLd } from "./seo";

/** Second, smaller mock shown behind the main one on pages without a screenshot. */
const companion: Partial<Record<VisualKind, VisualKind>> = {
  prompts: "answer",
  fanout: "sources",
  products: "answer",
  traffic: "bots",
  bots: "traffic",
  audit: "bots",
  content: "tasks",
  factcheck: "sources",
  terminal: "agent",
  answer: "ranking",
};

export function FeaturePageView({ slug, locale }: { slug: FeatureSlug; locale: Locale }) {
  const { features, platforms, ui } = getLanding(locale);
  const page = features[slug];
  const enPath = featurePath(slug);
  const href = (path: string) => localizeHref(path, locale);
  const cta = ctaTargets(locale, ui);
  const second = companion[page.visual];

  return (
    <>
      <LandingJsonLd enPath={enPath} locale={locale} meta={page.meta} trail={[{ name: page.nav }]} faq={page.faq} />

      <LandingHero
        crumbsLabel={ui.breadcrumb}
        crumbs={[{ label: ui.home, href: href("/") }, { label: ui.product, href: href("/#features") }, { label: page.nav }]}
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        muted={page.hero.muted}
        subtitle={page.hero.subtitle}
        {...cta}
      >
        <Stage className="px-4 pt-6 pb-8 sm:px-8 sm:pt-10 sm:pb-12 lg:px-12">
          {page.screenshot ? (
            <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-8">
              <div className="mk-float-slow text-foreground lg:col-span-5">
                <Visual kind={page.visual} locale={locale} slug={slug} />
              </div>
              <div className="min-w-0 lg:col-span-7">
                <BrowserFrame
                  src={page.screenshot.src}
                  darkSrc={page.screenshot.darkSrc}
                  alt={page.screenshot.alt}
                  url={page.screenshot.url}
                  sizes="(min-width: 1024px) 640px, calc(100vw - 4rem)"
                  reveal={false}
                  eager
                  className="text-foreground"
                />
              </div>
            </div>
          ) : (
            <div className="relative mx-auto grid max-w-4xl items-center gap-6 text-foreground lg:grid-cols-12">
              <div className="relative z-10 lg:col-span-7">
                <Visual kind={page.visual} locale={locale} slug={slug} />
              </div>
              {second && (
                <div className="mk-float-slow hidden opacity-90 lg:col-span-5 lg:block">
                  <Visual kind={second} locale={locale} slug={slug} />
                </div>
              )}
            </div>
          )}
        </Stage>
      </LandingHero>

      <WhySection why={page.why} stats={page.stats} locale={locale} statsLabel={ui.factsLabel} />

      <section aria-labelledby="capabilities-title" className="py-20 sm:py-28">
        <Container>
          <SectionTitle heading={page.capabilities} id="capabilities-title" />
          <div className="mt-12">
            <CardGrid items={page.capabilities.items} />
          </div>
        </Container>
      </section>

      <section aria-labelledby="steps-title" className="border-y bg-card/60 py-20 sm:py-28">
        <Container>
          <SectionTitle heading={page.steps} id="steps-title" />
          <div className="mt-14">
            <Steps items={page.steps.items} stepLabel={ui.step} />
          </div>
        </Container>
      </section>

      <FaqSection faq={page.faq} eyebrow={ui.faqEyebrow} title={ui.faqTitle} />

      <section aria-labelledby="related-title" className="pb-20 sm:pb-28">
        <Container>
          <SectionTitle heading={{ eyebrow: ui.relatedFeatures, title: ui.relatedTitle, muted: ui.relatedMuted }} id="related-title" />
          <div className="mt-10">
            <LinkCards
              columns={page.related.length === 3 ? 3 : 4}
              items={page.related.map((s) => ({
                title: features[s].nav,
                body: features[s].summary,
                href: href(featurePath(s)),
              }))}
            />
          </div>
          <div className="mt-8">
            <ChipLinks
              label={ui.trackedIn}
              items={platformSlugs.map((s) => ({ label: platforms[s].name, href: href(platformPath(s)) }))}
            />
          </div>
        </Container>
      </section>

      <LandingCta title={page.cta.title} subtitle={page.cta.subtitle} {...cta} />
    </>
  );
}
