import { getLanding } from "../catalog";
import { featurePath, platformPath, platformSlugs, type FeatureSlug } from "../catalog/routes";
import { ChipLinks, LinkCards, SectionTitle } from "../landing/blocks";
import { localizeHref, type Locale } from "../locales";
import { Container } from "../primitives";

const highlights: FeatureSlug[] = [
  "ai-visibility-tracking",
  "prompt-research",
  "ai-citation-tracking",
  "query-fanout-analysis",
  "ai-bot-traffic",
  "ai-search-attribution",
  "report-builder",
  "mcp-server",
];

/** Internal links to the main product pages and every AI platform page. */
export function PlatformOverview({ locale = "en" }: { locale?: Locale }) {
  const { features, platforms, ui } = getLanding(locale);
  const href = (path: string) => localizeHref(path, locale);
  return (
    <section aria-labelledby="platform-title" className="py-20 sm:py-28">
      <Container>
        <SectionTitle heading={ui.homepage.platform} body={ui.homepage.platform.body} id="platform-title" />
        <div className="mt-10">
          <LinkCards
            items={highlights.map((slug) => ({ title: features[slug].nav, body: features[slug].summary, href: href(featurePath(slug)) }))}
          />
        </div>
        <div className="mt-8">
          <ChipLinks label={ui.trackedIn} items={platformSlugs.map((s) => ({ label: platforms[s].name, href: href(platformPath(s)) }))} />
        </div>
      </Container>
    </section>
  );
}
