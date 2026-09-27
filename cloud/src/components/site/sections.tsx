import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CodeBlock } from "@/components/marketing/code-block";
import { FaqList } from "@/components/marketing/faq";
import { CheckList, Container, CtaLink, SectionHeading } from "@/components/marketing/primitives";
import { cn } from "@/lib/utils";
import { Blocks } from "./blocks";
import { SiteIcon } from "./icons";
import { Inline, plainText } from "./inline";
import type { Card, Section } from "./types";
import Image from "next/image";

const columnsClass = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" };

function CardItem({ card, index, numbered }: { card: Card; index: number; numbered?: boolean }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        {card.icon ? (
          <SiteIcon name={card.icon} />
        ) : numbered ? (
          <span className="font-mono text-sm font-semibold text-green-700 dark:text-green-400">{String(index + 1).padStart(2, "0")}</span>
        ) : null}
        {card.badge && (
          <span className="rounded-full border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{card.badge}</span>
        )}
      </div>
      <h3 className={cn("font-semibold tracking-tight", (card.icon || numbered) && "mt-5")}>
        <Inline text={card.title} />
        {card.href && <ArrowUpRight className="ml-1 inline size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />}
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        <Inline text={card.body} />
      </p>
    </>
  );
  const cls = "group h-full rounded-2xl border bg-card p-6 transition-shadow hover:shadow-[0_12px_32px_-16px_oklch(0_0_0/0.2)]";
  if (card.href) {
    const external = /^https?:\/\//.test(card.href);
    return external ? (
      <a href={card.href} target="_blank" rel="noopener" className={cn(cls, "block focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none")}>
        {body}
      </a>
    ) : (
      <Link href={card.href} className={cn(cls, "block focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none")}>
        {body}
      </Link>
    );
  }
  return <div className={cls}>{body}</div>;
}

function Heading({ id, eyebrow, title, subtitle }: { id: string; eyebrow?: string; title?: string; subtitle?: string }) {
  if (!title) return null;
  return <SectionHeading id={id} align="left" eyebrow={eyebrow} title={<Inline text={title} />} subtitle={subtitle ? <Inline text={subtitle} /> : undefined} />;
}

/** Renders one structured section. Section ids become anchors (defaults to a stable index-based id). */
export function SectionView({ section, index }: { section: Section; index: number }) {
  const id = section.id ?? `section-${index + 1}`;
  const titleId = `${id}-title`;
  const wrap = (children: React.ReactNode, className?: string) => (
    <section id={id} aria-labelledby={"title" in section && section.title ? titleId : undefined} className={cn("scroll-mt-20 py-14 sm:py-20", className)}>
      <Container>{children}</Container>
    </section>
  );

  switch (section.kind) {
    case "cards":
      return wrap(
        <>
          <Heading id={titleId} eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} />
          <ul className={cn("mt-10 grid gap-4", columnsClass[section.columns ?? 3])}>
            {section.cards.map((card, i) => (
              <li key={i}>
                <CardItem card={card} index={i} numbered={!card.icon} />
              </li>
            ))}
          </ul>
        </>,
      );
    case "steps":
      return wrap(
        <>
          <Heading id={titleId} eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} />
          <ol className={cn("mt-10 grid gap-4", section.steps.length >= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3")}>
            {section.steps.map((step, i) => (
              <li key={i} className="relative rounded-2xl border bg-card p-6">
                <span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{i + 1}</span>
                <h3 className="mt-4 font-semibold tracking-tight">
                  <Inline text={step.title} />
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  <Inline text={step.body} />
                </p>
              </li>
            ))}
          </ol>
        </>,
      );
    case "stats":
      return wrap(
        <>
          <Heading id={titleId} title={section.title} subtitle={section.subtitle} />
          <dl className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", section.title && "mt-10")}>
            {section.stats.map((stat, i) => (
              <div key={i} className="rounded-2xl border bg-card p-6">
                <dt className="text-sm text-muted-foreground">
                  <Inline text={stat.label} />
                </dt>
                <dd className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{stat.value}</dd>
                {stat.source && (
                  <dd className="mt-3 text-xs text-muted-foreground">
                    <a href={stat.source.href} target="_blank" rel="noopener" className="underline underline-offset-4 hover:text-foreground">
                      {stat.source.label}
                    </a>
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </>,
      );
    case "prose":
      return wrap(
        <div className="max-w-3xl">
          <Heading id={titleId} eyebrow={section.eyebrow} title={section.title} />
          <Blocks blocks={section.blocks} className={section.title ? "mt-8" : undefined} />
        </div>,
      );
    case "checklist":
      return wrap(
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div>
            <Heading id={titleId} eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} />
            <CheckList items={section.items.map(plainText)} className="mt-8" />
          </div>
          {section.aside && (
            <div className="rounded-2xl border bg-card p-6 sm:p-8">
              <Blocks blocks={section.aside} />
            </div>
          )}
        </div>,
      );
    case "table":
      return wrap(
        <>
          <Heading id={titleId} eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} />
          <div className="mt-10">
            <Blocks blocks={[{ type: "table", head: section.head, rows: section.rows }]} className="[&>*:first-child]:mt-0" />
          </div>
          {section.note && (
            <p className="mt-4 text-sm text-muted-foreground">
              <Inline text={section.note} />
            </p>
          )}
        </>,
      );
    case "faq":
      return wrap(
        <div className="mx-auto max-w-3xl">
          {section.title && <SectionHeading id={titleId} title={section.title} subtitle={section.subtitle} />}
          <div className={section.title ? "mt-10" : undefined}>
            <FaqList items={section.items.map((f) => ({ q: plainText(f.q), a: plainText(f.a) }))} />
          </div>
        </div>,
      );
    case "code":
      return wrap(
        <>
          <Heading id={titleId} eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} />
          <div className={cn("mt-10 grid gap-4", section.tabs.length > 1 && "lg:grid-cols-2")}>
            {section.tabs.map((tab, i) => (
              <CodeBlock key={i} code={tab.code} title={tab.label} />
            ))}
          </div>
        </>,
      );
    case "links":
      return wrap(
        <>
          <Heading id={titleId} eyebrow={section.eyebrow} title={section.title} subtitle={section.subtitle} />
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {section.links.map((link, i) => (
              <li key={i}>
                <CardItem card={{ title: link.label, body: link.description ?? "", href: link.href }} index={i} />
              </li>
            ))}
          </ul>
        </>,
      );
    case "split":
      return wrap(
        <div className={cn("grid gap-10", section.image && "lg:grid-cols-2 lg:items-center")}>
          <div>
            <Heading id={titleId} eyebrow={section.eyebrow} title={section.title} />
            <p className="mt-5 text-lg leading-8 text-pretty text-muted-foreground">
              <Inline text={section.body} />
            </p>
            {section.bullets && <CheckList items={section.bullets.map(plainText)} className="mt-6" />}
            {section.cta && (
              <CtaLink href={section.cta.href} variant="secondary" arrow className="mt-8">
                {section.cta.label}
              </CtaLink>
            )}
          </div>
          {section.image && (
            <Image
              src={section.image.src}
              alt={section.image.alt}
              width={section.image.width}
              height={section.image.height}
              className="h-auto w-full rounded-2xl border bg-card shadow-sm"
              sizes="(min-width: 1024px) 560px, 100vw"
            />
          )}
        </div>,
      );
    case "cta":
      return wrap(
        <div className="mk-dark-panel relative overflow-hidden rounded-3xl px-6 py-14 text-center text-white sm:px-12">
          <div className="mk-dots-light absolute inset-0" aria-hidden="true" />
          <div className="relative">
            <h2 id={titleId} className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {section.title}
            </h2>
            {section.body && <p className="mx-auto mt-4 max-w-xl text-lg text-pretty text-white/75">{plainText(section.body)}</p>}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <CtaLink href={section.primary.href} variant="inverted" size="lg" arrow className="w-full sm:w-auto">
                {section.primary.label}
              </CtaLink>
              {section.secondary && (
                <CtaLink href={section.secondary.href} variant="inverted-outline" size="lg" className="w-full sm:w-auto">
                  {section.secondary.label}
                </CtaLink>
              )}
            </div>
          </div>
        </div>,
        "py-10 sm:py-14",
      );
  }
}

export function Sections({ sections }: { sections: Section[] }) {
  return (
    <div className="[&>section:nth-child(even):not(:last-child)]:bg-card/40">
      {sections.map((section, i) => (
        <SectionView key={i} section={section} index={i} />
      ))}
    </div>
  );
}
