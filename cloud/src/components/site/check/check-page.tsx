import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { Container } from "@/components/marketing/primitives";
import { absoluteUrl, site } from "@/lib/site";
import { breadcrumbNode, coreNodes, faqNode, graph, ids, webPageNode } from "../jsonld";
import { homeCrumb, localizePath, siteMetadata } from "../metadata";
import { Sections } from "../sections";
import type { Faq, Locale } from "../types";
import { CheckTool } from "./check-tool";
import { checkCopy } from "./copy";
import { checkPage } from "./page-content";

export function checkMetadata(locale: Locale) {
  const page = checkPage[locale];
  return siteMetadata({ title: page.meta.title, description: page.meta.description, enPath: page.path, locale });
}

/** /ai-visibility-check: hero, the interactive check, explanations and FAQ. */
export function CheckPage({ locale }: { locale: Locale }) {
  const page = checkPage[locale];
  const path = localizePath(page.path, locale);
  const home = homeCrumb[locale];
  const faqs: Faq[] = page.sections.flatMap((s) => (s.kind === "faq" ? s.items : []));
  return (
    <>
      <JsonLd
        data={graph(
          ...coreNodes(),
          webPageNode({ path, name: page.meta.title, description: page.meta.description, locale }),
          {
            "@type": "WebApplication",
            "@id": absoluteUrl(`${path}#app`),
            name: page.app.name,
            description: page.app.description,
            url: absoluteUrl(path),
            applicationCategory: "BusinessApplication",
            applicationSubCategory: "SEO and AI visibility",
            operatingSystem: "Any (web browser)",
            browserRequirements: "Requires JavaScript",
            inLanguage: locale,
            isAccessibleForFree: true,
            featureList: page.app.features,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            provider: { "@id": ids.organization },
            isRelatedTo: { "@id": ids.software },
          },
          breadcrumbNode([
            { name: home.label, path: home.href },
            { name: page.crumb, path },
          ]),
          faqNode(faqs, path, locale),
        )}
      />
      <PageHero crumb={page.crumb} home={home} eyebrow={page.hero.eyebrow} title={page.hero.title} subtitle={page.hero.subtitle} />
      <section aria-label={page.app.name} className="py-10 sm:py-14">
        <Container className="max-w-4xl">
          <CheckTool
            copy={checkCopy[locale]}
            examples={[site.host, "github.com"]}
            signupHref="/signup"
            selfHostHref="/self-hosting"
          />
        </Container>
      </section>
      <Sections sections={page.sections} />
    </>
  );
}
