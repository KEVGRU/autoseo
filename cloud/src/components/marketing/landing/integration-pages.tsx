import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLanding } from "../catalog";
import { directory, monogram } from "../catalog/directory";
import {
  featurePath,
  integrationCategorySlugs,
  integrationPath,
  integrationsPath,
  type IntegrationCategorySlug,
  type IntegrationSlug,
} from "../catalog/routes";
import type { DirectoryEntry, LandingUi, VisualKind } from "../catalog/types";
import { localizeHref, type Locale } from "../locales";
import { accentText, Container, LogoMark } from "../primitives";
import { Stage, Visual } from "../visuals";
import {
  CardGrid,
  ctaTargets,
  FaqSection,
  LandingCta,
  LandingHero,
  LinkCards,
  SectionTitle,
  Steps,
} from "./blocks";
import { LandingJsonLd } from "./seo";

/** Mock shown in the hero of each integration category. */
const categoryVisual: Record<IntegrationCategorySlug, VisualKind> = {
  cms: "content",
  analytics: "traffic",
  "search-console": "keywords",
  "bot-traffic": "bots",
  attribution: "traffic",
  "project-management": "tasks",
  "data-reporting": "report",
};

/** Category of an integration page (the live entry wins over a "coming soon" one, e.g. Shopify). */
export function integrationCategory(slug: IntegrationSlug): IntegrationCategorySlug {
  const entries = directory.filter((d) => d.page === slug);
  const entry = entries.find((d) => d.status !== "coming-soon") ?? entries[0];
  if (!entry) throw new Error(`Integration page "${slug}" has no entry with page: "${slug}" in catalog/directory.ts`);
  return entry.category;
}

function StatusBadge({ status, ui }: { status: DirectoryEntry["status"]; ui: LandingUi }) {
  if (!status) return null;
  return (
    <span
      className={cn(
        "rounded-md px-1.5 py-0.5 text-[0.65rem] font-semibold tracking-wide uppercase",
        status === "beta" ? "bg-amber-500/15 text-amber-700 dark:text-amber-300" : "bg-muted text-muted-foreground",
      )}
    >
      {ui.status[status]}
    </span>
  );
}

function Tile({ entry, name, className }: { entry: Pick<DirectoryEntry, "color">; name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("grid size-11 shrink-0 place-items-center rounded-xl text-sm font-bold text-white shadow-sm", className)}
      style={{ backgroundColor: entry.color }}
    >
      {monogram(name)}
    </span>
  );
}

/** Grid of directory entries; entries with their own page link to it. */
function DirectoryGrid({
  entries,
  descriptions,
  ui,
  locale,
}: {
  entries: DirectoryEntry[];
  descriptions: Record<string, string>;
  ui: LandingUi;
  locale: Locale;
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry, i) => {
        const inner = (
          <>
            <Tile entry={entry} name={entry.name} />
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2 font-semibold tracking-tight">
                {entry.name}
                <StatusBadge status={entry.status} ui={ui} />
              </span>
              <span className="mt-1 block text-sm leading-6 text-muted-foreground">{descriptions[entry.key]}</span>
            </span>
            {(entry.page || entry.feature) && (
              <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden="true" />
            )}
          </>
        );
        const base = "flex h-full items-start gap-4 rounded-2xl border bg-card p-5";
        const target = entry.page ? integrationPath(entry.page) : entry.feature ? featurePath(entry.feature) : null;
        return (
          <li key={entry.key} data-animate="" style={{ ["--i" as string]: i % 3 }}>
            {target ? (
              <Link
                href={localizeHref(target, locale)}
                className={cn(base, "group transition-[box-shadow,translate] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-22px_oklch(0_0_0/0.35)] focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none")}
              >
                {inner}
              </Link>
            ) : (
              <div className={base}>{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** /integrations */
export function IntegrationsHubView({ locale }: { locale: Locale }) {
  const { integrationsHub: hub, integrationCategories, ui } = getLanding(locale);
  const href = (path: string) => localizeHref(path, locale);
  const cta = ctaTargets(locale, ui);
  return (
    <>
      <LandingJsonLd enPath={integrationsPath} locale={locale} meta={hub.meta} trail={[{ name: ui.integrations }]} faq={hub.faq} />
      <LandingHero
        crumbsLabel={ui.breadcrumb}
        crumbs={[{ label: ui.home, href: href("/") }, { label: ui.integrations }]}
        eyebrow={hub.hero.eyebrow}
        title={hub.hero.title}
        muted={hub.hero.muted}
        subtitle={hub.hero.subtitle}
        {...cta}
      >
        <Stage className="px-4 pt-6 pb-8 sm:px-8 sm:pt-10 sm:pb-12">
          <div className="mx-auto grid max-w-4xl items-center gap-6 text-foreground lg:grid-cols-2">
            <Visual kind="integrations" locale={locale} />
            <div className="mk-float-slow hidden lg:block">
              <Visual kind="tasks" locale={locale} />
            </div>
          </div>
        </Stage>
      </LandingHero>

      <section aria-labelledby="categories-title" className="py-20 sm:py-24">
        <Container>
          <SectionTitle heading={hub.categories} id="categories-title" />
          <nav aria-label={ui.integrations} className="mt-8 flex flex-wrap gap-2">
            {integrationCategorySlugs.map((c) => (
              <a
                key={c}
                href={`#${c}`}
                className="rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
              >
                {integrationCategories[c].nav}
                <span className="ml-1.5 text-muted-foreground">{directory.filter((d) => d.category === c).length}</span>
              </a>
            ))}
          </nav>
          <div className="mt-14 space-y-16">
            {integrationCategorySlugs.map((c) => {
              const category = integrationCategories[c];
              return (
                <section key={c} id={c} aria-labelledby={`${c}-title`} className="scroll-mt-24">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <h3 id={`${c}-title`} className="text-2xl font-semibold tracking-tight">
                        {category.nav}
                      </h3>
                      <p className="mt-1.5 text-muted-foreground">{category.summary}</p>
                    </div>
                    <Link href={href(integrationPath(c))} className={`inline-flex items-center gap-1.5 text-sm font-medium hover:underline ${accentText}`}>
                      {ui.viewAll}
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </div>
                  <div className="mt-6">
                    <DirectoryGrid entries={directory.filter((d) => d.category === c)} descriptions={hub.descriptions} ui={ui} locale={locale} />
                  </div>
                </section>
              );
            })}
          </div>
        </Container>
      </section>

      <FaqSection faq={hub.faq} eyebrow={ui.faqEyebrow} title={ui.faqTitle} />
      <LandingCta title={hub.cta.title} subtitle={hub.cta.subtitle} {...cta} />
    </>
  );
}

/** /integrations/<category> */
export function IntegrationCategoryView({ slug, locale }: { slug: IntegrationCategorySlug; locale: Locale }) {
  const { integrationCategories, integrationsHub: hub, ui } = getLanding(locale);
  const page = integrationCategories[slug];
  const enPath = integrationPath(slug);
  const href = (path: string) => localizeHref(path, locale);
  const cta = ctaTargets(locale, ui);
  const entries = directory.filter((d) => d.category === slug);

  return (
    <>
      <LandingJsonLd
        enPath={enPath}
        locale={locale}
        meta={page.meta}
        trail={[{ name: ui.integrations, enPath: integrationsPath }, { name: page.nav }]}
        faq={page.faq}
      />
      <LandingHero
        crumbsLabel={ui.breadcrumb}
        crumbs={[
          { label: ui.home, href: href("/") },
          { label: ui.integrations, href: href(integrationsPath) },
          { label: page.nav },
        ]}
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        muted={page.hero.muted}
        subtitle={page.hero.subtitle}
        {...cta}
      >
        <Stage className="px-4 pt-6 pb-8 sm:px-8 sm:pt-10 sm:pb-12">
          <div className="mx-auto grid max-w-4xl items-center gap-6 text-foreground lg:grid-cols-2">
            <Visual kind={categoryVisual[slug]} locale={locale} />
            <div className="mk-float-slow hidden lg:block">
              <Visual kind="integrations" locale={locale} />
            </div>
          </div>
        </Stage>
      </LandingHero>

      <section aria-labelledby="entries-title" className="py-20 sm:py-24">
        <Container>
          <SectionTitle heading={{ eyebrow: page.nav, title: ui.integrationCount.replace("{n}", String(entries.length)) }} id="entries-title" />
          <div className="mt-10">
            <DirectoryGrid entries={entries} descriptions={hub.descriptions} ui={ui} locale={locale} />
          </div>
        </Container>
      </section>

      <section aria-labelledby="benefits-title" className="border-y bg-card/60 py-20 sm:py-28">
        <Container>
          <SectionTitle heading={page.benefits} id="benefits-title" />
          <div className="mt-12">
            <CardGrid items={page.benefits.items} columns={page.benefits.items.length === 4 ? 4 : 3} />
          </div>
        </Container>
      </section>

      <FaqSection faq={page.faq} eyebrow={ui.faqEyebrow} title={ui.faqTitle} />

      <section aria-labelledby="categories-title" className="pb-20 sm:pb-28">
        <Container>
          <SectionTitle heading={{ eyebrow: ui.allIntegrations, title: ui.integrationsTitle }} id="categories-title" />
          <div className="mt-10">
            <LinkCards
              columns={3}
              items={integrationCategorySlugs
                .filter((c) => c !== slug)
                .map((c) => ({ title: integrationCategories[c].nav, body: integrationCategories[c].summary, href: href(integrationPath(c)) }))}
            />
          </div>
        </Container>
      </section>

      <LandingCta title={page.cta.title} subtitle={page.cta.subtitle} {...cta} />
    </>
  );
}

/** /integrations/<integration> */
export function IntegrationPageView({ slug, locale }: { slug: IntegrationSlug; locale: Locale }) {
  const { integrations, integrationCategories, integrationsHub: hub, ui } = getLanding(locale);
  const page = integrations[slug];
  const categorySlug = integrationCategory(slug);
  const category = integrationCategories[categorySlug];
  const entry = directory.find((d) => d.page === slug && d.category === categorySlug) ?? directory.find((d) => d.page === slug)!;
  const enPath = integrationPath(slug);
  const href = (path: string) => localizeHref(path, locale);
  const cta = ctaTargets(locale, ui);
  const siblings = directory.filter((d) => d.category === categorySlug && d.page !== slug);

  return (
    <>
      <LandingJsonLd
        enPath={enPath}
        locale={locale}
        meta={page.meta}
        trail={[
          { name: ui.integrations, enPath: integrationsPath },
          { name: category.nav, enPath: integrationPath(categorySlug) },
          { name: page.name },
        ]}
        faq={page.faq}
      />

      <LandingHero
        crumbsLabel={ui.breadcrumb}
        crumbs={[
          { label: ui.home, href: href("/") },
          { label: ui.integrations, href: href(integrationsPath) },
          { label: category.nav, href: href(integrationPath(categorySlug)) },
          { label: page.name },
        ]}
        eyebrow={category.nav}
        title={ui.integrationTitle.replace("{name}", page.name)}
        subtitle={page.hero.subtitle}
        {...cta}
      >
        <Stage className="px-4 pt-6 pb-8 sm:px-8 sm:pt-10 sm:pb-12">
          <div className="mx-auto grid max-w-4xl items-center gap-8 text-foreground lg:grid-cols-12">
            <div className="flex flex-col items-center gap-4 text-white lg:col-span-4">
              <div className="flex items-center gap-4">
                <Tile entry={entry} name={page.name} className="size-16 rounded-2xl text-lg ring-4 ring-white/10" />
                <span className="flex gap-1" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="mk-blink size-1.5 rounded-full bg-green-400" style={{ ["--i" as string]: i }} />
                  ))}
                </span>
                <LogoMark className="size-16 rounded-2xl ring-4 ring-white/10" />
              </div>
              {entry.status && <StatusBadge status={entry.status} ui={ui} />}
            </div>
            <div className="relative z-10 lg:col-span-8">
              <Visual kind={categoryVisual[categorySlug]} locale={locale} />
            </div>
          </div>
        </Stage>
      </LandingHero>

      <section aria-labelledby="overview-title" className="py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <SectionTitle heading={page.overview} id="overview-title" className="lg:col-span-5" />
          <ul className="grid gap-3 lg:col-span-7">
            {page.overview.items.map((item, i) => (
              <li key={item} data-animate="left" style={{ ["--i" as string]: i }} className="flex gap-3 rounded-xl border bg-card px-4 py-3.5 text-[0.95rem] leading-6">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-soft text-green-700 dark:text-green-300">
                  <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="usecases-title" className="border-y bg-card/60 py-20 sm:py-28">
        <Container>
          <SectionTitle heading={page.useCases} id="usecases-title" />
          <div className="mt-12">
            <CardGrid items={page.useCases.items} columns={page.useCases.items.length === 4 ? 4 : 3} />
          </div>
        </Container>
      </section>

      <section aria-labelledby="setup-title" className="py-20 sm:py-28">
        <Container>
          <SectionTitle heading={page.setup} id="setup-title" />
          <div className="mt-14">
            <Steps items={page.setup.items} stepLabel={ui.step} />
          </div>
        </Container>
      </section>

      <FaqSection faq={page.faq} eyebrow={ui.faqEyebrow} title={ui.faqTitle} />

      {siblings.length > 0 && (
        <section aria-labelledby="siblings-title" className="pb-20 sm:pb-28">
          <Container>
            <SectionTitle heading={{ eyebrow: category.nav, title: ui.moreIntegrations }} id="siblings-title" />
            <div className="mt-10">
              <DirectoryGrid entries={siblings} descriptions={hub.descriptions} ui={ui} locale={locale} />
            </div>
          </Container>
        </section>
      )}

      <LandingCta title={page.cta.title} subtitle={page.cta.subtitle} {...cta} />
    </>
  );
}
