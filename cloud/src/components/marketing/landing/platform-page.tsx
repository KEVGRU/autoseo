import Link from "next/link";
import { ArrowRight, Bot } from "lucide-react";
import { getLanding } from "../catalog";
import { featurePath, platformPath, platformSlugs, type PlatformSlug } from "../catalog/routes";
import { localizeHref, type Locale } from "../locales";
import { accentText, Container } from "../primitives";
import { Stage, Visual } from "../visuals";
import {
  CardGrid,
  ctaTargets,
  FaqSection,
  LandingCta,
  LandingHero,
  LinkCards,
  SectionTitle,
  WhySection,
} from "./blocks";
import { LandingJsonLd } from "./seo";

export function PlatformPageView({ slug, locale }: { slug: PlatformSlug; locale: Locale }) {
  const { platforms, features, ui } = getLanding(locale);
  const page = platforms[slug];
  const tracker = features["ai-visibility-tracking"];
  const enPath = platformPath(slug);
  const href = (path: string) => localizeHref(path, locale);
  const cta = ctaTargets(locale, ui);

  return (
    <>
      <LandingJsonLd
        enPath={enPath}
        locale={locale}
        meta={page.meta}
        trail={[{ name: tracker.nav, enPath: featurePath("ai-visibility-tracking") }, { name: page.name }]}
        faq={page.faq}
      />

      <LandingHero
        crumbsLabel={ui.breadcrumb}
        crumbs={[
          { label: ui.home, href: href("/") },
          { label: tracker.nav, href: href(featurePath("ai-visibility-tracking")) },
          { label: page.name },
        ]}
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        muted={page.hero.muted}
        subtitle={page.hero.subtitle}
        {...cta}
      >
        <Stage className="px-4 pt-6 pb-8 sm:px-8 sm:pt-10 sm:pb-12 lg:px-12">
          <div className="relative mx-auto grid max-w-4xl items-center gap-6 text-foreground lg:grid-cols-12">
            <div className="relative z-10 lg:col-span-7">
              <Visual kind="answer" locale={locale} demo={{ ...page.demo, engines: [page.name] }} />
            </div>
            <div className="mk-float-slow hidden lg:col-span-5 lg:block">
              <Visual kind="ranking" locale={locale} />
            </div>
          </div>
        </Stage>
      </LandingHero>

      <WhySection why={page.why} locale={locale} statsLabel={ui.factsLabel} />

      <section aria-labelledby="method-title" className="py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <SectionTitle heading={page.method} id="method-title" body={page.method.body} className="lg:col-span-5" />
          <ol className="grid gap-4 lg:col-span-7">
            {page.method.items.map((item, i) => (
              <li
                key={item.title}
                data-animate=""
                style={{ ["--i" as string]: i }}
                className="flex gap-4 rounded-2xl border bg-card p-6"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft font-mono text-sm font-semibold text-green-700 dark:text-green-300">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section aria-labelledby="tracked-title" className="border-y bg-card/60 py-20 sm:py-28">
        <Container>
          <SectionTitle heading={page.tracked} id="tracked-title" />
          <div className="mt-12">
            <CardGrid items={page.tracked.items} />
          </div>
        </Container>
      </section>

      {page.crawlers && (
        <section aria-labelledby="crawlers-title" className="py-20 sm:py-28">
          <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionTitle heading={page.crawlers} id="crawlers-title" body={page.crawlers.body} />
              <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
                {(["ai-crawlability", "ai-bot-traffic"] as const).map((s) => (
                  <Link key={s} href={href(featurePath(s))} className={`inline-flex items-center gap-1.5 hover:underline ${accentText}`}>
                    {features[s].nav}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                ))}
              </p>
            </div>
            <ul data-animate="" className="divide-y self-center rounded-2xl border bg-card lg:col-span-7">
              {page.crawlers.bots.map((bot, i) => (
                <li key={bot.token} className="mk-pop flex items-start gap-4 p-5" style={{ ["--d" as string]: i }}>
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted">
                    <Bot className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold">{bot.token}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{bot.purpose}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <FaqSection faq={page.faq} eyebrow={ui.faqEyebrow} title={ui.faqTitle} />

      <section aria-labelledby="platforms-title" className="pb-20 sm:pb-28">
        <Container>
          <SectionTitle heading={{ eyebrow: ui.platforms, title: ui.otherPlatforms, muted: ui.otherPlatformsMuted }} id="platforms-title" />
          <div className="mt-10">
            <LinkCards
              columns={3}
              items={platformSlugs
                .filter((s) => s !== slug)
                .map((s) => ({ title: platforms[s].nav, body: platforms[s].summary, href: href(platformPath(s)) }))}
            />
          </div>
        </Container>
      </section>

      <LandingCta title={page.cta.title} subtitle={page.cta.subtitle} {...cta} />
    </>
  );
}
