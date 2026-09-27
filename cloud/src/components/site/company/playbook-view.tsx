import { Download, FlaskConical } from "lucide-react";
import { CodeBlock } from "@/components/marketing/code-block";
import { copyLabels, getCopy } from "@/components/marketing/i18n";
import { JsonLd } from "@/components/marketing/json-ld";
import { Container, CtaLink, SectionHeading } from "@/components/marketing/primitives";
import { absoluteUrl } from "@/lib/site";
import { Inline, plainText } from "../inline";
import { breadcrumbNode, coreNodes, faqNode, graph, webPageNode } from "../jsonld";
import { homeCrumb, localizePath } from "../metadata";
import { SectionView } from "../sections";
import type { Locale, Section } from "../types";
import { companyLabels } from "./labels";
import { playbookPath } from "./paths";
import { TrailHero } from "./trail-hero";
import type { Playbook } from "./types";

/** The prompt set as CSV in the tracker's import format (`prompt,tags`, tags separated by `|`). */
export function playbookCsv(playbook: Playbook): string {
  const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = playbook.prompts.rows.map((row) => `${quote(row.prompt)},${quote(row.tags.join("|"))}`);
  return ["prompt,tags", ...rows].join("\n");
}

function howToNode(playbook: Playbook, path: string, locale: Locale) {
  const steps = [...playbook.baseline, ...playbook.actions];
  return {
    "@type": "HowTo",
    "@id": absoluteUrl(`${path}#howto`),
    name: plainText(playbook.hero.title),
    description: playbook.meta.description,
    inLanguage: locale,
    step: steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: plainText(step.title),
      text: plainText(step.body),
    })),
  };
}

function PromptSet({ playbook, locale }: { playbook: Playbook; locale: Locale }) {
  const t = companyLabels[locale];
  const copy = getCopy(locale);
  const csv = playbookCsv(playbook);
  const count = t.promptCount.replace("{n}", String(playbook.prompts.rows.length));
  return (
    <section id="prompts" aria-labelledby="prompts-title" className="scroll-mt-20 py-14 sm:py-20">
      <Container>
        <SectionHeading id="prompts-title" align="left" title={t.prompts} subtitle={<Inline text={playbook.prompts.intro} />} />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div className="text-[0.95rem] leading-7">
            <p className="text-muted-foreground">{t.promptsSubtitle}</p>
            <p className="mt-5 font-medium">{t.placeholders}</p>
            <ul className="mt-3 space-y-2">
              {playbook.prompts.placeholders.map((item, i) => (
                <li key={i} className="rounded-lg border bg-card px-3 py-2 text-sm">
                  <Inline text={item} />
                </li>
              ))}
            </ul>
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(`﻿${csv}`)}`}
              download={`autoseo-playbook-${playbook.slug}-${locale}.csv`}
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-full border bg-card px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
            >
              <Download className="size-4" aria-hidden="true" />
              {t.download}
              <span className="text-muted-foreground">· {count}</span>
            </a>
          </div>
          <CodeBlock code={csv} title={`prompts.csv · ${count}`} wrap labels={copyLabels(copy)} copyItem={copy.ui.copyItem} />
        </div>
      </Container>
    </section>
  );
}

function Facts({ playbook, locale }: { playbook: Playbook; locale: Locale }) {
  const t = companyLabels[locale];
  return (
    <section aria-label={t.disclaimerTitle} className="py-10 sm:py-12">
      <Container>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {playbook.facts.map((fact) => (
            <div key={fact.label} className="rounded-2xl border bg-card p-5">
              <dt className="text-sm text-muted-foreground">{fact.label}</dt>
              <dd className="mt-1.5 font-medium">
                <Inline text={fact.value} />
              </dd>
            </div>
          ))}
        </dl>
        <aside className="mt-6 flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 text-[0.95rem] leading-7">
          <FlaskConical className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="font-semibold">{t.disclaimerTitle}</p>
            <p className="text-foreground/85">{t.disclaimer}</p>
          </div>
        </aside>
      </Container>
    </section>
  );
}

/** Detail page of a playbook: JSON-LD (WebPage, breadcrumbs, HowTo, FAQ), hero, facts, prompt set and method. */
export function PlaybookView({ playbook, others, locale }: { playbook: Playbook; others: Playbook[]; locale: Locale }) {
  const t = companyLabels[locale];
  const path = localizePath(playbookPath(playbook.slug), locale);
  const home = homeCrumb[locale];
  const related = playbook.related
    .map((slug) => others.find((p) => p.slug === slug))
    .filter((p): p is Playbook => Boolean(p));

  const before: Section[] = [{ kind: "prose", id: "goal", title: t.goal, blocks: [...playbook.goal, { type: "h3", text: t.audience }, { type: "ul", items: playbook.audience }] }];
  const after: Section[] = [
    { kind: "table", id: "engines", title: t.engines, subtitle: playbook.engines.intro, head: playbook.engines.head, rows: playbook.engines.rows },
    { kind: "steps", id: "baseline", title: t.baseline, steps: playbook.baseline },
    { kind: "cards", id: "actions", title: t.actions, cards: playbook.actions, columns: playbook.actions.length % 3 === 0 ? 3 : 2 },
    { kind: "checklist", id: "measure", title: t.measure, items: playbook.measure.items, aside: playbook.measure.aside },
    { kind: "prose", id: "variance", title: t.variance, blocks: playbook.variance },
    { kind: "prose", id: "limitations", title: t.limitations, blocks: [{ type: "ul", items: playbook.limitations }] },
    { kind: "faq", id: "faq", title: t.faq, items: playbook.faq },
    ...(playbook.reading?.length ? [{ kind: "links" as const, id: "reading", title: t.reading, links: playbook.reading }] : []),
    ...(related.length
      ? [
          {
            kind: "links" as const,
            id: "related",
            title: t.related,
            links: related.map((p) => ({ label: p.crumb, href: localizePath(playbookPath(p.slug), locale), description: p.teaser })),
          },
        ]
      : []),
    { kind: "cta", id: "start", title: t.ctaTitle, body: t.ctaBody, primary: t.ctaPrimary, secondary: t.ctaSecondary },
  ];

  return (
    <>
      <JsonLd
        data={graph(
          ...coreNodes(),
          webPageNode({ path, name: playbook.meta.title, description: playbook.meta.description, locale }),
          breadcrumbNode([
            { name: home.label, path: home.href },
            { name: t.caseStudies.label, path: t.caseStudies.href },
            { name: playbook.crumb, path },
          ]),
          howToNode(playbook, path, locale),
          faqNode(playbook.faq, path, locale),
        )}
      />
      <TrailHero
        trail={[home, t.caseStudies]}
        current={playbook.crumb}
        eyebrow={t.playbookEyebrow}
        title={playbook.hero.title}
        subtitle={<Inline text={playbook.hero.subtitle} />}
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <CtaLink href={t.heroPrimary.href} variant="primary" size="lg" arrow>
            {t.heroPrimary.label}
          </CtaLink>
          <CtaLink href={t.heroSecondary.href} variant="secondary" size="lg">
            {t.heroSecondary.label}
          </CtaLink>
        </div>
      </TrailHero>
      <Facts playbook={playbook} locale={locale} />
      <div className="[&>section:nth-child(even):not(:last-child)]:bg-card/40">
        {before.map((section, i) => (
          <SectionView key={section.id} section={section} index={i} />
        ))}
        <PromptSet playbook={playbook} locale={locale} />
        {after.map((section, i) => (
          <SectionView key={section.id} section={section} index={i + before.length + 1} />
        ))}
      </div>
    </>
  );
}
