import Link from "next/link";
import { FileCode2, Network } from "lucide-react";
import { FaqList } from "@/components/marketing/faq";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { Container } from "@/components/marketing/primitives";
import { aiAgentInstructions } from "@/content/facts";
import { absoluteUrl } from "@/lib/site";
import { Blocks } from "../blocks";
import { Inline, plainText } from "../inline";
import { breadcrumbNode, faqNode, graph, webPageNode } from "../jsonld";
import { homeCrumb, localizePath, siteMetadata } from "../metadata";
import type { Locale } from "../types";
import { coreFactNodes } from "./jsonld";
import { Toc } from "./toc";

export function factSheetMetadata(locale: Locale) {
  const sheet = aiAgentInstructions[locale];
  const meta = siteMetadata({ title: sheet.meta.title, description: sheet.meta.description, enPath: sheet.path, locale, type: "article", modifiedTime: sheet.updated });
  return {
    ...meta,
    alternates: {
      ...meta.alternates,
      types: { "text/markdown": localizePath(sheet.mdPath, locale) },
    },
  };
}

/** /ai-agent-instructions: the canonical fact sheet for AI assistants (same data as the .md export). */
export function FactSheetPage({ locale }: { locale: Locale }) {
  const sheet = aiAgentInstructions[locale];
  const path = localizePath(sheet.path, locale);
  const mdPath = localizePath(sheet.mdPath, locale);
  const entityPath = localizePath("/entity-connections", locale);
  const home = homeCrumb[locale];
  const toc = [...sheet.sections.map((s) => ({ id: s.id, text: s.title })), { id: "faq", text: sheet.faqTitle }];
  return (
    <>
      <JsonLd
        data={graph(
          ...coreFactNodes(locale),
          {
            ...webPageNode({ path, name: sheet.meta.title, description: sheet.meta.description, locale }),
            dateModified: sheet.updated,
            mainEntity: { "@id": absoluteUrl("/#software") },
            encoding: { "@type": "MediaObject", contentUrl: absoluteUrl(mdPath), encodingFormat: "text/markdown" },
          },
          breadcrumbNode([
            { name: home.label, path: home.href },
            { name: sheet.crumb, path },
          ]),
          faqNode(sheet.faq, path, locale),
        )}
      />
      <PageHero crumb={sheet.crumb} home={home} eyebrow={sheet.hero.eyebrow} title={sheet.hero.title} subtitle={sheet.hero.subtitle}>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <a
            href={mdPath}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border bg-card px-5 text-sm font-medium shadow-xs transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
          >
            <FileCode2 className="size-4" aria-hidden="true" />
            {sheet.labels.machineReadable} (.md)
          </a>
          <Link
            href={entityPath}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border bg-card px-5 text-sm font-medium shadow-xs transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
          >
            <Network className="size-4" aria-hidden="true" />
            {sheet.labels.entityMap}
          </Link>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          {sheet.labels.updated}: <time dateTime={sheet.updated}>{sheet.updated}</time>
        </p>
      </PageHero>

      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
          <Toc title={sheet.labels.toc} entries={toc} />
          <article className="min-w-0 max-w-3xl">
            <div className="space-y-4 text-[1.05rem] leading-8 text-foreground/90">
              {sheet.intro.map((p, i) => (
                <p key={i}>
                  <Inline text={p} />
                </p>
              ))}
            </div>
            {sheet.sections.map((section) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="mt-14 scroll-mt-24 border-t pt-10">
                <h2 id={`${section.id}-title`} className="text-2xl font-semibold tracking-tight text-balance">
                  {section.title}
                </h2>
                <Blocks blocks={section.blocks} className="mt-2 [&>*:first-child]:mt-4" />
              </section>
            ))}
            <section id="faq" aria-labelledby="faq-title" className="mt-14 scroll-mt-24 border-t pt-10">
              <h2 id="faq-title" className="text-2xl font-semibold tracking-tight">
                {sheet.faqTitle}
              </h2>
              <div className="mt-6">
                <FaqList items={sheet.faq.map((f) => ({ q: plainText(f.q), a: plainText(f.a) }))} />
              </div>
            </section>
            <p className="mt-12 border-t pt-6 text-sm text-muted-foreground italic">{sheet.footer}</p>
          </article>
        </div>
      </Container>
    </>
  );
}
