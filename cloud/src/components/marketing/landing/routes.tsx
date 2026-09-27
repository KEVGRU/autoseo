import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLanding } from "../catalog";
import {
  featurePath,
  featureSlugs,
  integrationCategorySlugs,
  integrationPath,
  integrationSlugs,
  integrationsPath,
  isFeatureSlug,
  isIntegrationCategorySlug,
  isIntegrationSlug,
  isPlatformSlug,
  isSolutionSlug,
  platformPath,
  platformSlugs,
  solutionPath,
  solutionSlugs,
  solutionsPath,
} from "../catalog/routes";
import type { Locale } from "../locales";
import { SecurityPageView, SupportPageView } from "./company-pages";
import { FeaturePageView } from "./feature-page";
import { IntegrationCategoryView, IntegrationPageView, IntegrationsHubView } from "./integration-pages";
import { PlatformPageView } from "./platform-page";
import { landingMetadata } from "./seo";
import { SolutionPageView, SolutionsHubView } from "./solution-page";

/**
 * Route handlers shared by the English and German route files, which only re-export them (plus
 * `dynamicParams = false`, so unknown slugs 404). Every page is prerendered at build time.
 */
type Params<K extends string> = { params: Promise<Record<K, string>> };

export function featureRoute(locale: Locale) {
  return {
    generateStaticParams: () => featureSlugs.map((feature) => ({ feature })),
    async generateMetadata({ params }: Params<"feature">): Promise<Metadata> {
      const { feature } = await params;
      if (!isFeatureSlug(feature)) return {};
      return landingMetadata(getLanding(locale).features[feature].meta, featurePath(feature), locale);
    },
    async Page({ params }: Params<"feature">) {
      const { feature } = await params;
      if (!isFeatureSlug(feature)) notFound();
      return <FeaturePageView slug={feature} locale={locale} />;
    },
  };
}

/**
 * AI platform pages live below the AI visibility tracker: /ai-visibility-tracking/<engine>. The parent `[feature]`
 * params come from its page, not a layout, so they aren't passed down — this generates both segments itself.
 */
export function platformRoute(locale: Locale) {
  return {
    generateStaticParams: () => platformSlugs.map((engine) => ({ feature: "ai-visibility-tracking", engine })),
    async generateMetadata({ params }: Params<"feature" | "engine">): Promise<Metadata> {
      const { feature, engine } = await params;
      if (feature !== "ai-visibility-tracking" || !isPlatformSlug(engine)) return {};
      return landingMetadata(getLanding(locale).platforms[engine].meta, platformPath(engine), locale);
    },
    async Page({ params }: Params<"feature" | "engine">) {
      const { feature, engine } = await params;
      if (feature !== "ai-visibility-tracking" || !isPlatformSlug(engine)) notFound();
      return <PlatformPageView slug={engine} locale={locale} />;
    },
  };
}

export function solutionsHubRoute(locale: Locale) {
  return {
    metadata: landingMetadata(getLanding(locale).ui.solutionsHub.meta, solutionsPath, locale),
    Page: () => <SolutionsHubView locale={locale} />,
  };
}

export function solutionRoute(locale: Locale) {
  return {
    generateStaticParams: () => solutionSlugs.map((solution) => ({ solution })),
    async generateMetadata({ params }: Params<"solution">): Promise<Metadata> {
      const { solution } = await params;
      if (!isSolutionSlug(solution)) return {};
      return landingMetadata(getLanding(locale).solutions[solution].meta, solutionPath(solution), locale);
    },
    async Page({ params }: Params<"solution">) {
      const { solution } = await params;
      if (!isSolutionSlug(solution)) notFound();
      return <SolutionPageView slug={solution} locale={locale} />;
    },
  };
}

export function integrationsHubRoute(locale: Locale) {
  return {
    metadata: landingMetadata(getLanding(locale).integrationsHub.meta, integrationsPath, locale),
    Page: () => <IntegrationsHubView locale={locale} />,
  };
}

/** One segment serves both categories (/integrations/cms) and single integrations (/integrations/wordpress). */
export function integrationRoute(locale: Locale) {
  return {
    generateStaticParams: () => [...integrationCategorySlugs, ...integrationSlugs].map((integration) => ({ integration })),
    async generateMetadata({ params }: Params<"integration">): Promise<Metadata> {
      const { integration } = await params;
      const landing = getLanding(locale);
      if (isIntegrationCategorySlug(integration))
        return landingMetadata(landing.integrationCategories[integration].meta, integrationPath(integration), locale);
      if (isIntegrationSlug(integration))
        return landingMetadata(landing.integrations[integration].meta, integrationPath(integration), locale);
      return {};
    },
    async Page({ params }: Params<"integration">) {
      const { integration } = await params;
      if (isIntegrationCategorySlug(integration)) return <IntegrationCategoryView slug={integration} locale={locale} />;
      if (isIntegrationSlug(integration)) return <IntegrationPageView slug={integration} locale={locale} />;
      notFound();
    },
  };
}

export function securityRoute(locale: Locale) {
  return {
    metadata: landingMetadata(getLanding(locale).security.meta, "/security", locale),
    Page: () => <SecurityPageView locale={locale} />,
  };
}

export function supportRoute(locale: Locale) {
  return {
    metadata: landingMetadata(getLanding(locale).support.meta, "/support", locale),
    Page: () => <SupportPageView locale={locale} />,
  };
}
