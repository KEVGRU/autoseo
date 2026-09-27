import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, ShieldAlert } from "lucide-react";
import { site } from "@/lib/site";
import { getLanding } from "../catalog";
import { IconTile } from "../catalog/icons";
import { localizeHref, type Locale } from "../locales";
import { CtaLink, Container, SmartLink } from "../primitives";
import { Stage, Visual } from "../visuals";
import { CardGrid, ctaTargets, FaqSection, LandingCta, LandingHero, SectionTitle } from "./blocks";
import { LandingJsonLd } from "./seo";

const advisoryUrl = `${site.github}/security/advisories/new`;
const securityEmail = "security@codext.de";

/** /security */
export function SecurityPageView({ locale }: { locale: Locale }) {
  const { security: page, ui } = getLanding(locale);
  const href = (path: string) => localizeHref(path, locale);
  const cta = ctaTargets(locale, ui);
  return (
    <>
      <LandingJsonLd enPath="/security" locale={locale} meta={page.meta} trail={[{ name: page.hero.eyebrow }]} faq={page.faq} />
      <LandingHero
        crumbsLabel={ui.breadcrumb}
        crumbs={[{ label: ui.home, href: href("/") }, { label: page.hero.eyebrow }]}
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        muted={page.hero.muted}
        subtitle={page.hero.subtitle}
        {...cta}
      >
        <Stage className="px-4 pt-6 pb-8 sm:px-8 sm:pt-10 sm:pb-12">
          <div className="mx-auto grid max-w-4xl items-center gap-6 text-foreground lg:grid-cols-2">
            <Visual kind="audit" locale={locale} />
            <div className="mk-float-slow hidden lg:block">
              <Visual kind="terminal" locale={locale} slug="rest-api" />
            </div>
          </div>
        </Stage>
      </LandingHero>

      <section aria-labelledby="pillars-title" className="py-20 sm:py-28">
        <Container>
          <SectionTitle heading={page.pillars} id="pillars-title" />
          <div className="mt-12">
            <CardGrid items={page.pillars.items} />
          </div>
        </Container>
      </section>

      <section aria-labelledby="data-title" className="bg-[#111110] py-20 text-white sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <SectionTitle heading={page.data} id="data-title" body={page.data.body} dark className="lg:col-span-5" />
          <ul className="grid gap-4 lg:col-span-7">
            {page.data.items.map((item, i) => (
              <li key={item.title} data-animate="" style={{ ["--i" as string]: i }} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">{item.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="controls-title" className="py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <SectionTitle heading={page.controls} id="controls-title" className="lg:col-span-5" />
          <ul className="grid gap-2.5 sm:grid-cols-2 lg:col-span-7">
            {page.controls.items.map((item, i) => (
              <li key={item} data-animate="fade" style={{ ["--i" as string]: i % 4 }} className="flex gap-3 rounded-xl border bg-card px-4 py-3.5 text-sm leading-6">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-soft text-green-700 dark:text-green-300">
                  <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="disclosure-title" className="pb-20 sm:pb-28">
        <Container>
          <div data-animate="" className="flex flex-col gap-6 rounded-3xl border bg-card p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
                <ShieldAlert className="size-5" aria-hidden="true" />
              </span>
              <div className="max-w-2xl">
                <h2 id="disclosure-title" className="text-xl font-semibold tracking-tight">
                  {page.disclosure.title}
                </h2>
                <p className="mt-2 text-[0.95rem] leading-7 text-muted-foreground">{page.disclosure.body}</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <CtaLink href={advisoryUrl} size="md">
                {page.disclosure.advisoryLabel}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </CtaLink>
              <a
                href={`mailto:${securityEmail}`}
                className="inline-flex h-10 items-center justify-center rounded-full border bg-card px-5 text-sm font-medium shadow-xs hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
              >
                {page.disclosure.emailLabel}
              </a>
            </div>
          </div>
        </Container>
      </section>

      <FaqSection faq={page.faq} eyebrow={ui.faqEyebrow} title={ui.faqTitle} />
      <LandingCta title={page.cta.title} subtitle={page.cta.subtitle} {...cta} />
    </>
  );
}

/** /support */
export function SupportPageView({ locale }: { locale: Locale }) {
  const { support: page, ui } = getLanding(locale);
  const href = (path: string) => localizeHref(path, locale);
  const cta = ctaTargets(locale, ui);
  return (
    <>
      <LandingJsonLd enPath="/support" locale={locale} meta={page.meta} trail={[{ name: page.hero.eyebrow }]} faq={page.faq} />
      <LandingHero
        crumbsLabel={ui.breadcrumb}
        crumbs={[{ label: ui.home, href: href("/") }, { label: page.hero.eyebrow }]}
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        muted={page.hero.muted}
        subtitle={page.hero.subtitle}
        {...cta}
      />

      <section aria-labelledby="channels-title" className="pb-20 sm:pb-28">
        <Container>
          <SectionTitle heading={page.channels} id="channels-title" />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {page.channels.items.map((item, i) => (
              <li key={item.title} data-animate="" style={{ ["--i" as string]: i % 2 }}>
                <SmartLink
                  href={item.href.startsWith("/") ? href(item.href) : item.href}
                  className="group flex h-full gap-5 rounded-2xl border bg-card p-6 transition-[box-shadow,translate] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-22px_oklch(0_0_0/0.35)] focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
                >
                  <IconTile name={item.icon} />
                  <span className="min-w-0">
                    <span className="block font-semibold tracking-tight">{item.title}</span>
                    <span className="mt-1.5 block text-sm leading-6 text-muted-foreground">{item.body}</span>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-green-700 dark:text-green-400">
                      {item.action}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </span>
                </SmartLink>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="resources-title" className="border-y bg-card/60 py-20 sm:py-28">
        <Container>
          <SectionTitle heading={page.resources} id="resources-title" />
          <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {page.resources.items.map((item, i) => {
              const external = /^https?:\/\//.test(item.href);
              const content = (
                <>
                  <span className="flex items-start justify-between gap-3 font-semibold tracking-tight">
                    {item.title}
                    {external ? (
                      <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    ) : (
                      <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    )}
                  </span>
                  <span className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</span>
                </>
              );
              const cls =
                "group flex h-full flex-col bg-card p-6 transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none focus-visible:ring-inset";
              return (
                <li key={item.href} data-animate="fade" style={{ ["--i" as string]: i % 3 }}>
                  {external ? (
                    <a href={item.href} target="_blank" rel="noopener" className={cls}>
                      {content}
                    </a>
                  ) : (
                    <Link href={item.href.startsWith("/") ? href(item.href) : item.href} className={cls}>
                      {content}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      <FaqSection faq={page.faq} eyebrow={ui.faqEyebrow} title={ui.faqTitle} />
      <LandingCta title={page.cta.title} subtitle={page.cta.subtitle} {...cta} />
    </>
  );
}
