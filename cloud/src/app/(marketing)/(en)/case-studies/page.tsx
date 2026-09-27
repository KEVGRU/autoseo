import { siteMetadata } from "@/components/site/metadata";
import { SitePageView } from "@/components/site/page";
import page from "@/content/company/case-studies.en";

export const metadata = siteMetadata({ ...page.meta, enPath: page.path, locale: "en" });

export default function CaseStudiesPage() {
  return <SitePageView page={page} locale="en" pageType="CollectionPage" />;
}
