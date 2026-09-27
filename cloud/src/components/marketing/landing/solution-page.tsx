import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";
import { getLanding } from "../catalog";
import { IconTile } from "../catalog/icons";
import {
  featurePath,
  industrySolutions,
  solutionPath,
  solutionsPath,
  teamSolutions,
  type SolutionSlug,
} from "../catalog/routes";
import type { VisualKind } from "../catalog/types";
import { localizeHref, type Locale } from "../locales";
import { accentText, Container } from "../primitives";
import { Stage, Visual } from "../visuals";
import {
  ctaTargets,
  FaqSection,
  LandingCta,
  LandingHero,
  LinkCards,
  SectionTitle,
  WhySection,
} from "./blocks";
import { LandingJsonLd } from "./seo";

const companion: Partial<Record<VisualKind, VisualKind>> = {
  report: "ranking",
  ranking: "answer",
  sentiment: "sources",
  content: "tasks",
  products: "answer",
  answer: "ranking",
  factcheck: "sentiment",
  globe: "answer",
  sources: "answer",
  traffic: "bots",
};

export function SolutionPageView({ slug, locale }: { slug: SolutionSlug; locale: Locale }) {
  const { solutions, features, ui } = getLanding(locale);
  const page = solutions[slug];
  const enPath = solutionPath(slug);
  const href = (path: string) => localizeHref(path, locale);
  const cta = ctaTargets(locale, ui);
  const second = companion[page.visual] ?? "ranking";

  return (
    <>
      <LandingJsonLd
        enPath={enPath}
        locale={locale}
        meta={page.meta}
        trail={[{ name: ui.solutions, enPath: solutionsPath }, { name: page.nav }]}
        faq={page.faq}
      />

      <LandingHero
        crumbsLabel={ui.breadcrumb}
        crumbs={[{ label: ui.home, href: href("/") }, { label: ui.solutions, href: href(solutionsPath) }, { label: page.nav }]}
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        muted={page.hero.muted}
        subtitle={page.hero.subtitle}
        {...cta}
      >
        <Stage className="px-4 pt-6 pb-8 sm:px-8 sm:pt-10 sm:pb-12 lg:px-12">
          <div className="relative mx-auto grid max-w-4xl items-center gap-6 text-foreground lg:grid-cols-12">
            <div className="relative z-10 lg:col-span-7">
              <Visual kind={page.visual} locale={locale} slug={slug} />
            </div>
            <div className="mk-float-slow hidden lg:col-span-5 lg:block">
              <Visual kind={second} locale={locale} slug={slug} />
            </div>
          </div>
        </Stage>
      </LandingHero>

      <WhySection why={{ ...page.challenges, points: page.challenges.items }} locale={locale} statsLabel={ui.factsLabel} />

      <section aria-labelledby="workflow-title" className="py-20 sm:py-28">
        <Container>
          <SectionTitle heading={page.workflow} id="workflow-title" />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {page.workflow.items.map((item, i) => (
              <li key={item.title} data-animate="" style={{ ["--i" as string]: i % 3 }}>
                <Link
                  href={href(featurePath(item.feature))}
                  className="group flex h-full flex-col rounded-2xl border bg-card p-6 transition-[box-shadow,translate] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-22px_oklch(0_0_0/0.35)] focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
                >
                  <IconTile name={item.icon} />
                  <h3 className="mt-5 font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{item.body}</p>
                  <span className={`mt-5 inline-flex items-center gap-1.5 text-sm font-medium ${accentText}`}>
                    {features[item.feature].nav}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="prompts-title" className="border-y bg-card/60 py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionTitle heading={page.prompts} id="prompts-title" body={ui.promptsHint} />
            <p className="mt-6">
              <Link href={href(featurePath("prompt-research"))} className={`inline-flex items-center gap-1.5 text-sm font-medium hover:underline ${accentText}`}>
                {features["prompt-research"].nav}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </p>
          </div>
          <ul className="space-y-3 lg:col-span-7">
            {page.prompts.items.map((prompt, i) => (
              <li
                key={prompt}
                data-animate="left"
                style={{ ["--i" as string]: i }}
                className="flex items-start gap-3 rounded-2xl rounded-tl-md border bg-card px-4 py-3.5 text-[0.95rem] shadow-xs"
              >
                <MessageSquare className="mt-1 size-4 shrink-0 text-green-600 dark:text-green-400" aria-hidden="true" />
                {prompt}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="outcomes-title" className="py-20 sm:py-28">
        <Container>
          <SectionTitle heading={page.outcomes} id="outcomes-title" />
          <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-3">
            {page.outcomes.items.map((item, i) => (
              <li key={item.title} data-animate="fade" style={{ ["--i" as string]: i }} className="bg-card p-7">
                <span className="font-mono text-sm text-green-700 dark:text-green-400">0{i + 1}</span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-7 text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <FaqSection faq={page.faq} eyebrow={ui.faqEyebrow} title={ui.faqTitle} />

      <section aria-labelledby="solutions-title" className="pb-20 sm:pb-28">
        <Container>
          <SectionTitle heading={{ eyebrow: ui.relatedSolutions, title: ui.solutionsTitle, muted: ui.solutionsMuted }} id="solutions-title" />
          <div className="mt-10">
            <LinkCards
              columns={3}
              items={page.related.map((s) => ({ title: solutions[s].nav, body: solutions[s].summary, href: href(solutionPath(s)) }))}
            />
          </div>
        </Container>
      </section>

      <LandingCta title={page.cta.title} subtitle={page.cta.subtitle} {...cta} />
    </>
  );
}

/** /solutions: every team and industry page. */
export function SolutionsHubView({ locale }: { locale: Locale }) {
  const { solutions, ui } = getLanding(locale);
  const hub = ui.solutionsHub;
  const href = (path: string) => localizeHref(path, locale);
  const cta = ctaTargets(locale, ui);
  const cards = (slugs: SolutionSlug[]) =>
    slugs.map((s) => ({ title: solutions[s].nav, body: solutions[s].summary, href: href(solutionPath(s)) }));

  return (
    <>
      <LandingJsonLd enPath={solutionsPath} locale={locale} meta={hub.meta} trail={[{ name: ui.solutions }]} faq={[]} />
      <LandingHero
        crumbsLabel={ui.breadcrumb}
        crumbs={[{ label: ui.home, href: href("/") }, { label: ui.solutions }]}
        eyebrow={hub.hero.eyebrow}
        title={hub.hero.title}
        muted={hub.hero.muted}
        subtitle={hub.hero.subtitle}
        {...cta}
      />
      <section aria-labelledby="teams-title" className="pb-16">
        <Container>
          <SectionTitle heading={hub.teams} id="teams-title" />
          <div className="mt-10">
            <LinkCards columns={3} items={cards(teamSolutions)} />
          </div>
        </Container>
      </section>
      <section aria-labelledby="industries-title" className="pb-20 sm:pb-28">
        <Container>
          <SectionTitle heading={hub.industries} id="industries-title" />
          <div className="mt-10">
            <LinkCards columns={4} items={cards(industrySolutions)} />
          </div>
        </Container>
      </section>
      <LandingCta title={hub.hero.title} subtitle={hub.hero.subtitle} {...cta} />
    </>
  );
}
