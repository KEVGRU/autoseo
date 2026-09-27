import Link from "next/link";
import { ArrowRight, BookOpenText, ExternalLink } from "lucide-react";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { Container } from "@/components/marketing/primitives";
import { entityConnections } from "@/content/facts";
import type { Entity, EntityMap } from "@/content/facts/types";
import { Inline } from "../inline";
import { breadcrumbNode, graph, webPageNode } from "../jsonld";
import { homeCrumb, localizePath, siteMetadata } from "../metadata";
import type { Locale } from "../types";
import { coreFactNodes, entityGraphNodes, factIds } from "./jsonld";
import { Toc } from "./toc";

export function entityMapMetadata(locale: Locale) {
  const map = entityConnections[locale];
  return siteMetadata({ title: map.meta.title, description: map.meta.description, enPath: map.path, locale, type: "article", modifiedTime: map.updated });
}

function ExternalOrInternal({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  if (href.startsWith("#") || href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener" className={className}>
      {children}
      <ExternalLink className="ml-1 inline size-3 align-baseline text-muted-foreground" aria-hidden="true" />
    </a>
  );
}

const linkClass = "font-medium underline decoration-border underline-offset-4 hover:decoration-foreground";

function EntityCard({ entity, labels, updated, locale }: { entity: Entity; labels: EntityMap["labels"]; updated: string; locale: Locale }) {
  const [open, close] = locale === "de" ? ["„", "“"] : ["“", "”"];
  return (
    <article id={entity.id} aria-labelledby={`${entity.id}-name`} className="min-w-0 scroll-mt-24 rounded-2xl border bg-card p-5 [overflow-wrap:anywhere] sm:p-6">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 id={`${entity.id}-name`} className="text-lg font-semibold tracking-tight [overflow-wrap:anywhere]">
          {entity.name}
        </h3>
        <span className="rounded-full border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{entity.kind}</span>
      </header>
      <p className="mt-3 text-[0.95rem] leading-7 text-foreground/85">{entity.description}</p>
      {entity.url && (
        <p className="mt-2 text-sm break-all">
          <ExternalOrInternal href={entity.url} className={linkClass}>
            {entity.url.replace(/^https?:\/\//, "")}
          </ExternalOrInternal>
        </p>
      )}
      <dl className="mt-5 grid grid-cols-1 gap-5 text-sm [&>div]:min-w-0">
        <div>
          <dt className="font-semibold">{labels.identifiers}</dt>
          <dd className="mt-2">
            {entity.identifiers.length ? (
              <ul className="space-y-1.5">
                {entity.identifiers.map((id) => (
                  <li key={id.href} className="[overflow-wrap:anywhere]">
                    <ExternalOrInternal href={id.href} className={linkClass}>
                      {id.label}
                    </ExternalOrInternal>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">{labels.noIdentifiers}</p>
            )}
          </dd>
        </div>
        <div>
          <dt className="font-semibold">{labels.relations}</dt>
          <dd className="mt-2">
            <ul className="space-y-1.5">
              {entity.relations.map((r, i) => (
                <li key={i} className="flex flex-wrap items-baseline gap-x-2 [overflow-wrap:anywhere]">
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{r.predicate}</code>
                  <ArrowRight className="size-3.5 shrink-0 self-center text-muted-foreground" aria-hidden="true" />
                  {r.href ? (
                    <ExternalOrInternal href={r.href} className={linkClass}>
                      {r.target}
                    </ExternalOrInternal>
                  ) : (
                    <span>{r.target}</span>
                  )}
                </li>
              ))}
            </ul>
          </dd>
        </div>
        {entity.members && entity.members.length > 0 && (
          <div>
            <dt className="font-semibold">{labels.members}</dt>
            <dd className="mt-2">
              <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {entity.members.map((m) => (
                  <li key={m.name} className="[overflow-wrap:anywhere]">
                    {m.href ? (
                      <ExternalOrInternal href={m.href} className={linkClass}>
                        {m.name}
                      </ExternalOrInternal>
                    ) : (
                      m.name
                    )}
                    {m.detail && <span className="text-muted-foreground"> · {m.detail}</span>}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
        <div>
          <dt className="font-semibold">{labels.evidence}</dt>
          <dd className="mt-2 space-y-3">
            {entity.evidence.map((ev, i) => (
              <figure key={i} className="border-l-2 border-green-600 pl-4">
                <blockquote className="text-foreground/90 [overflow-wrap:anywhere]">
                  {open}
                  {ev.quote}
                  {close}
                </blockquote>
                <figcaption className="mt-1 text-xs text-muted-foreground [overflow-wrap:anywhere]">
                  <ExternalOrInternal href={ev.href} className="underline underline-offset-4 hover:text-foreground">
                    {ev.source}
                  </ExternalOrInternal>{" "}
                  — {labels.retrieved} <time dateTime={updated}>{updated}</time>
                </figcaption>
              </figure>
            ))}
          </dd>
        </div>
      </dl>
    </article>
  );
}

/** /entity-connections: entity map with identifiers, relationships and evidence, plus the JSON-LD @graph. */
export function EntityMapPage({ locale }: { locale: Locale }) {
  const map = entityConnections[locale];
  const path = localizePath(map.path, locale);
  const factSheetPath = localizePath("/ai-agent-instructions", locale);
  const home = homeCrumb[locale];
  const toc = map.groups.map((g) => ({ id: g.id, text: g.title }));
  return (
    <>
      <JsonLd
        data={graph(
          ...coreFactNodes(locale),
          ...entityGraphNodes(locale),
          {
            ...webPageNode({ path, name: map.meta.title, description: map.meta.description, locale }),
            dateModified: map.updated,
            mentions: [factIds.organization, factIds.software, factIds.sourceCode, factIds.dockerImage, factIds.cloud, factIds.engines, factIds.integrations, factIds.geo].map((id) => ({ "@id": id })),
          },
          breadcrumbNode([
            { name: home.label, path: home.href },
            { name: map.crumb, path },
          ]),
        )}
      />
      <PageHero crumb={map.crumb} home={home} eyebrow={map.hero.eyebrow} title={map.hero.title} subtitle={map.hero.subtitle}>
        <div className="mt-8">
          <Link
            href={factSheetPath}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border bg-card px-5 text-sm font-medium shadow-xs transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
          >
            <BookOpenText className="size-4" aria-hidden="true" />
            {map.labels.factSheet}
          </Link>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          {map.labels.updated}: <time dateTime={map.updated}>{map.updated}</time>
        </p>
      </PageHero>

      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
          <Toc title={map.labels.toc} entries={toc} />
          <div className="min-w-0 max-w-3xl">
            <div className="space-y-4 text-[1.05rem] leading-8 text-foreground/90">
              {map.intro.map((p, i) => (
                <p key={i}>
                  <Inline text={p} />
                </p>
              ))}
            </div>
            {map.groups.map((group) => (
              <section key={group.id} id={group.id} aria-labelledby={`${group.id}-title`} className="mt-14 scroll-mt-24">
                <h2 id={`${group.id}-title`} className="text-2xl font-semibold tracking-tight">
                  {group.title}
                </h2>
                {group.intro && (
                  <p className="mt-3 text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4">
                    <Inline text={group.intro} />
                  </p>
                )}
                <div className="mt-6 grid gap-4">
                  {group.entities.map((entity) => (
                    <EntityCard key={entity.id} entity={entity} labels={map.labels} updated={map.updated} locale={locale} />
                  ))}
                </div>
              </section>
            ))}
            <p className="mt-12 border-t pt-6 text-sm text-muted-foreground">
              {map.labels.jsonLd}{" "}
              <a href={localizePath("/ai-agent-instructions.md", locale)} className="underline underline-offset-4 hover:text-foreground">
                ai-agent-instructions.md
              </a>
            </p>
          </div>
        </div>
      </Container>
    </>
  );
}
