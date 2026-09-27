import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconTile } from "../catalog/icons";
import type { Card, Faq, Heading, Point, Stat } from "../catalog/types";
import { CountUp } from "../count-up";
import { localizeHref, type Locale } from "../locales";
import { CtaLink, Container, LogoMark } from "../primitives";
import { StageBars } from "../visuals";

/** Tiny animated "pixel" mark used in eyebrows (a nod to a status light). */
export function PixelMark({ className }: { className?: string }) {
  const cells = [
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [1, 2],
  ];
  return (
    <svg viewBox="0 0 3 3" aria-hidden="true" data-loop="" className={cn("size-3 shrink-0", className)}>
      {cells.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="0.86" height="0.86" rx="0.12" className="mk-blink fill-green-500" style={{ ["--i" as string]: i }} />
      ))}
    </svg>
  );
}

/** Section eyebrow with the pixel mark and a dotted rule (finseo-style). */
export function SectionEyebrow({ children, className, dark }: { children: ReactNode; className?: string; dark?: boolean }) {
  return (
    <p
      className={cn(
        "mk-eyebrow-rule inline-flex items-center gap-2 pb-2.5 text-sm font-medium",
        dark ? "text-white/70" : "text-muted-foreground",
        className,
      )}
    >
      <PixelMark />
      {children}
    </p>
  );
}

/** Heading in two tones: the point in full contrast, the rest muted. */
export function TwoTone({ title, muted, dark }: { title: string; muted?: string; dark?: boolean }) {
  return (
    <>
      {title}
      {muted && (
        <>
          {" "}
          <span className={dark ? "text-white/45" : "text-muted-foreground/80"}>{muted}</span>
        </>
      )}
    </>
  );
}

export function SectionTitle({
  heading,
  id,
  body,
  align = "left",
  dark,
  as: Tag = "h2",
  className,
}: {
  heading: Heading;
  id?: string;
  body?: string;
  align?: "left" | "center";
  dark?: boolean;
  as?: "h2" | "h3";
  className?: string;
}) {
  return (
    <div data-animate="" className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <SectionEyebrow dark={dark}>{heading.eyebrow}</SectionEyebrow>
      <Tag
        id={id}
        className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-4xl lg:text-[2.9rem] lg:leading-[1.08]"
      >
        <TwoTone title={heading.title} muted={heading.muted} dark={dark} />
      </Tag>
      {body && (
        <p className={cn("mt-5 text-lg leading-8 text-pretty", dark ? "text-white/70" : "text-muted-foreground")}>{body}</p>
      )}
    </div>
  );
}

/** h1 whose words rise and un-blur one after another on load (pure CSS). */
export function AnimatedTitle({ title, muted, className }: { title: string; muted?: string; className?: string }) {
  const lead = title.split(" ");
  const rest = muted ? muted.split(" ") : [];
  return (
    <h1 className={cn("mk-words text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl", className)}>
      {lead.map((word, i) => (
        <Fragment key={`a${i}`}>
          <span style={{ ["--w" as string]: i }}>{word}</span>{" "}
        </Fragment>
      ))}
      {rest.map((word, i) => (
        <Fragment key={`b${i}`}>
          <span className="text-muted-foreground/75" style={{ ["--w" as string]: lead.length + i }}>
            {word}
          </span>
          {i < rest.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </h1>
  );
}

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, label, className }: { items: Crumb[]; label: string; className?: string }) {
  return (
    <nav aria-label={label} className={className}>
      <ol className="flex flex-wrap items-center justify-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="size-3.5" aria-hidden="true" />}
            {item.href && i < items.length - 1 ? (
              <Link
                href={item.href}
                className="rounded-sm hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current={i === items.length - 1 ? "page" : undefined} className={cn(i === items.length - 1 && "font-medium text-foreground")}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Centered page hero: breadcrumb, pill eyebrow, animated h1, subtitle and CTAs. */
export function LandingHero({
  crumbs,
  crumbsLabel,
  eyebrow,
  title,
  muted,
  subtitle,
  primary,
  secondary,
  children,
}: {
  crumbs: Crumb[];
  /** Localized accessible name of the breadcrumb nav. */
  crumbsLabel: string;
  eyebrow: string;
  title: string;
  muted?: string;
  subtitle: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  children?: ReactNode;
}) {
  return (
    // overflow-clip, not -hidden: a scroll container would capture the stage's view() timeline (mk-tilt).
    <section className="relative overflow-clip">
      <div className="mk-hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="mk-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <Container className="relative pt-10 pb-14 sm:pt-14 sm:pb-20">
        <div className="mx-auto max-w-4xl text-center">
          <Breadcrumbs items={crumbs} label={crumbsLabel} className="mk-rise" />
          <p
            className="mk-rise mt-7 inline-flex items-center gap-2 rounded-full border bg-card/80 px-3.5 py-1.5 text-sm font-medium shadow-xs backdrop-blur"
            style={{ ["--i" as string]: 1 }}
          >
            <PixelMark />
            {eyebrow}
          </p>
          <AnimatedTitle title={title} muted={muted} className="mt-6" />
          <p
            className="mk-rise mx-auto mt-6 max-w-2xl text-lg leading-8 text-pretty text-muted-foreground sm:text-xl sm:leading-8"
            style={{ ["--i" as string]: 3 }}
          >
            {subtitle}
          </p>
          <div className="mk-rise mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center" style={{ ["--i" as string]: 4 }}>
            <CtaLink href={primary.href} size="lg" arrow>
              {primary.label}
            </CtaLink>
            <CtaLink href={secondary.href} variant="secondary" size="lg">
              {secondary.label}
            </CtaLink>
          </div>
        </div>
        {children && <div className="relative mt-14 sm:mt-16">{children}</div>}
      </Container>
    </section>
  );
}

/** Dark band with count-up product facts. */
export function StatsBand({ stats, locale, label }: { stats: Stat[]; locale: Locale; label: string }) {
  return (
    <dl aria-label={label} className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <div key={stat.label} data-animate="" style={{ ["--i" as string]: i }} className="flex flex-col bg-[#161615] p-6 sm:p-7">
          <dt className="order-2 mt-2 text-sm font-medium text-white/85">{stat.label}</dt>
          <dd className="order-1 text-4xl font-semibold tracking-[-0.04em] tabular-nums sm:text-5xl">
            <CountUp value={stat.value} decimals={stat.decimals} prefix={stat.prefix} suffix={stat.suffix} lang={locale} />
          </dd>
          {stat.note && <dd className="order-3 mt-4 border-t border-white/10 pt-3 text-xs text-white/50">{stat.note}</dd>}
        </div>
      ))}
    </dl>
  );
}

/** "Why it matters" on a dark panel: heading and body left, numbered points right, facts below. */
export function WhySection({
  why,
  stats,
  locale,
  statsLabel,
}: {
  why: Heading & { body?: string; points: Point[] };
  stats?: Stat[];
  locale: Locale;
  statsLabel: string;
}) {
  return (
    <section aria-labelledby="why-title" className="relative overflow-hidden bg-[#111110] py-20 text-white sm:py-28">
      <div className="mk-dots-light pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_60%_at_80%_20%,black,transparent)]" aria-hidden="true" />
      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <SectionTitle heading={why} id="why-title" body={why.body} dark className="lg:col-span-6" />
          <ol className="space-y-4 lg:col-span-6 lg:pt-12">
            {why.points.map((point, i) => (
              <li
                key={point.title}
                data-animate=""
                style={{ ["--i" as string]: i }}
                className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.06]"
              >
                <span className="font-mono text-sm text-green-400">0{i + 1}</span>
                <div>
                  <h3 className="font-semibold tracking-tight">{point.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-white/65">{point.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        {stats && stats.length > 0 && (
          <div className="mt-14">
            <StatsBand stats={stats} locale={locale} label={statsLabel} />
          </div>
        )}
      </Container>
    </section>
  );
}

/** Icon cards with a spotlight hover. */
export function CardGrid({ items, columns = 3 }: { items: Card[]; columns?: 2 | 3 | 4 }) {
  return (
    <ul
      className={cn(
        "grid gap-4 sm:grid-cols-2",
        columns === 3 && "lg:grid-cols-3",
        columns === 4 && "lg:grid-cols-4",
      )}
    >
      {items.map((item, i) => (
        <li
          key={item.title}
          data-animate=""
          style={{ ["--i" as string]: i % 3 }}
          className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-[box-shadow,translate] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-22px_oklch(0_0_0/0.35)]"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-green-500/0 blur-2xl transition-colors duration-500 group-hover:bg-green-500/15"
          />
          <IconTile name={item.icon} />
          <h3 className="mt-5 font-semibold tracking-tight">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
        </li>
      ))}
    </ul>
  );
}

/** Numbered steps connected by a line that draws in. */
export function Steps({ items, stepLabel }: { items: Point[]; stepLabel: string }) {
  return (
    <ol data-animate="" className={cn("relative grid gap-4", items.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3")}>
      <span aria-hidden="true" className="mk-grow-x absolute top-5 right-8 left-8 hidden h-px bg-gradient-to-r from-green-500/60 via-green-500/30 to-transparent md:block" />
      {items.map((step, i) => (
        <li key={step.title} className="mk-pop relative" style={{ ["--d" as string]: i * 2 }}>
          <span className="relative grid size-10 place-items-center rounded-full border bg-card font-mono text-sm font-semibold shadow-xs">
            {i + 1}
            <span className="sr-only">
              {" "}
              {stepLabel} {i + 1}
            </span>
          </span>
          <h3 className="mt-5 text-lg font-semibold tracking-tight">{step.title}</h3>
          <p className="mt-2 text-[0.95rem] leading-7 text-muted-foreground">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}

/** FAQ on native <details> (no JS; every answer stays in the HTML for crawlers). */
export function FaqSection({ faq, eyebrow, title, id = "faq" }: { faq: Faq[]; eyebrow: string; title: string; id?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 py-20 sm:py-28">
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-4">
          <SectionTitle heading={{ eyebrow, title }} id={`${id}-title`} />
        </div>
        <div data-animate="" className="mk-faq-root divide-y rounded-2xl border bg-card lg:col-span-8">
          {faq.map((item) => (
            <details key={item.q} className="mk-faq group px-5 sm:px-6">
              <summary className="flex cursor-pointer items-start justify-between gap-6 rounded-md py-5 text-left font-medium focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none">
                <h3 className="text-[0.975rem] leading-6">{item.q}</h3>
                <Plus className="mk-faq-icon mt-0.5 size-5 shrink-0 text-muted-foreground transition-transform duration-200" aria-hidden="true" />
              </summary>
              <p className="-mt-1 pb-5 text-[0.95rem] leading-7 text-pretty text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

export type LinkCard = { title: string; body: string; href: string };

/** Cards linking to related landing pages (internal links for readers and crawlers). */
export function LinkCards({ items, columns = 4 }: { items: LinkCard[]; columns?: 3 | 4 }) {
  return (
    <ul className={cn("grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2", columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
      {items.map((item, i) => (
        <li key={item.href} data-animate="fade" style={{ ["--i" as string]: i }} className="bg-card">
          <Link
            href={item.href}
            className="group flex h-full flex-col p-6 transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none focus-visible:ring-inset"
          >
            <span className="flex items-start justify-between gap-3 font-semibold tracking-tight">
              {item.title}
              <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden="true" />
            </span>
            <span className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Row of chips linking to AI platform pages. */
export function ChipLinks({ label, items }: { label: string; items: { label: string; href: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm text-muted-foreground">{label}:</span>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-lg border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

/** Closing call to action on a dark stage with animated bars. */
export function LandingCta({
  title,
  subtitle,
  primary,
  secondary,
}: {
  title: string;
  subtitle: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
}) {
  return (
    <section aria-labelledby="landing-cta" className="pb-20 sm:pb-28">
      <Container>
        <div data-animate="scale" className="mk-stage relative overflow-hidden rounded-3xl px-6 py-16 text-center text-white sm:px-12 sm:py-20">
          <div className="mk-dots-light absolute inset-0" aria-hidden="true" />
          <StageBars className="absolute inset-x-8 bottom-0 h-2/5 opacity-50" />
          <div className="relative">
            <LogoMark className="mx-auto size-12 rounded-xl ring-1 ring-white/15" />
            <h2 id="landing-cta" className="mx-auto mt-6 max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl">
              {title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-pretty text-white/75">{subtitle}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <CtaLink href={primary.href} variant="inverted" size="lg" arrow className="w-full sm:w-auto">
                {primary.label}
              </CtaLink>
              <CtaLink href={secondary.href} variant="inverted-outline" size="lg" className="w-full sm:w-auto">
                {secondary.label}
              </CtaLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Standard CTA targets for a language. */
export function ctaTargets(locale: Locale, ui: { primaryCta: string; secondaryCta: string }) {
  return {
    primary: { label: ui.primaryCta, href: "/signup" },
    secondary: { label: ui.secondaryCta, href: localizeHref("/self-hosting", locale) },
  };
}

/** External link with an arrow icon. */
export function ExternalArrow() {
  return <ArrowUpRight className="size-3.5" aria-hidden="true" />;
}
