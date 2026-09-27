import { PageHero } from "@/components/marketing/page-hero";
import { CtaLink } from "@/components/marketing/primitives";
import { JsonLd } from "@/components/marketing/json-ld";
import { Inline, plainText } from "./inline";
import { breadcrumbNode, coreNodes, faqNode, graph, webPageNode } from "./jsonld";
import { homeCrumb, localizePath } from "./metadata";
import { Sections } from "./sections";
import type { Faq, Locale, SitePage } from "./types";

const updatedLabel: Record<Locale, string> = { en: "Last updated", de: "Zuletzt aktualisiert" };

/** Full structured page: JSON-LD (WebPage, breadcrumbs, FAQ), hero with breadcrumb and all sections. */
export function SitePageView({ page, locale, pageType }: { page: SitePage; locale: Locale; pageType?: string }) {
  const path = localizePath(page.path, locale);
  const faqs: Faq[] = page.sections.flatMap((s) => (s.kind === "faq" ? s.items : []));
  const home = homeCrumb[locale];
  return (
    <>
      <JsonLd
        data={graph(
          ...coreNodes(),
          webPageNode({ path, name: page.meta.title, description: page.meta.description, locale, type: pageType }),
          breadcrumbNode([
            { name: home.label, path: home.href },
            { name: page.crumb, path },
          ]),
          faqNode(faqs, path, locale),
        )}
      />
      <PageHero
        crumb={page.crumb}
        home={home}
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        subtitle={page.hero.subtitle ? <Inline text={page.hero.subtitle} /> : undefined}
      >
        {page.hero.ctas && page.hero.ctas.length > 0 && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {page.hero.ctas.map((cta, i) => (
              <CtaLink key={cta.href} href={cta.href} variant={i === 0 ? "primary" : "secondary"} size="lg" arrow={i === 0}>
                {cta.label}
              </CtaLink>
            ))}
          </div>
        )}
        {page.hero.updated && (
          <p className="mt-6 text-sm text-muted-foreground">
            {updatedLabel[locale]}: <time dateTime={page.hero.updated}>{page.hero.updated}</time>
          </p>
        )}
      </PageHero>
      <Sections sections={page.sections} />
    </>
  );
}

export { plainText };
