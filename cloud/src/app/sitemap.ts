import type { MetadataRoute } from "next";
import {
  featurePath,
  featureSlugs,
  integrationCategorySlugs,
  integrationPath,
  integrationSlugs,
  integrationsPath,
  platformPath,
  platformSlugs,
  sitePages,
  solutionPath,
  solutionSlugs,
  solutionsPath,
} from "@/components/marketing/catalog/routes";
import { languageAlternates, localizeHref, type TranslatedPath } from "@/components/marketing/locales";
import { blogPath, blogPaths } from "@/components/site/blog/paths";
import { allCompanyPaths } from "@/content/company";
import { absoluteUrl, site } from "@/lib/site";

type Page = {
  path: string;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
  /** English path of a translated page: adds hreflang alternates to both language versions. */
  translationOf?: TranslatedPath;
};

/** A page that exists in English and German: both URLs, each with hreflang alternates. */
function translated(enPath: string, priority: number, changeFrequency: Page["changeFrequency"] = "monthly"): Page[] {
  return [
    { path: enPath, priority, changeFrequency, translationOf: enPath },
    { path: localizeHref(enPath, "de"), priority: Math.round(priority * 90) / 100, changeFrequency, translationOf: enPath },
  ];
}

const pages: Page[] = [
  ...translated("/", 1, "weekly"),
  ...translated("/pricing", 0.9),
  { path: "/self-hosting", priority: 0.8, changeFrequency: "monthly" },
  ...featureSlugs.flatMap((slug) => translated(featurePath(slug), 0.8)),
  ...platformSlugs.flatMap((slug) => translated(platformPath(slug), 0.7)),
  ...translated(solutionsPath, 0.7),
  ...solutionSlugs.flatMap((slug) => translated(solutionPath(slug), 0.7)),
  ...translated(integrationsPath, 0.7),
  ...integrationCategorySlugs.flatMap((slug) => translated(integrationPath(slug), 0.6)),
  ...integrationSlugs.flatMap((slug) => translated(integrationPath(slug), 0.6)),
  ...translated("/security", 0.5),
  ...translated("/support", 0.5),
  ...translated(sitePages.aiVisibilityCheck, 0.8),
  ...blogPaths.flatMap((path) => translated(path, path === blogPath ? 0.7 : 0.6, "weekly")),
  ...allCompanyPaths.flatMap((path) => translated(path, 0.5)),
  ...translated(sitePages.aiAgentInstructions, 0.4),
  ...translated(sitePages.entityConnections, 0.4),
  ...translated("/imprint", 0.2, "yearly"),
  ...translated("/privacy", 0.2, "yearly"),
  ...translated("/terms", 0.2, "yearly"),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(site.legalUpdated);
  return pages.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
    ...(page.translationOf
      ? {
          alternates: {
            languages: Object.fromEntries(
              Object.entries(languageAlternates(page.translationOf)).map(([lang, path]) => [lang, absoluteUrl(path)]),
            ),
          },
        }
      : {}),
  }));
}
