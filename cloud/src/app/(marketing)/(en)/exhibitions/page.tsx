import { siteMetadata } from "@/components/site/metadata";
import { SitePageView } from "@/components/site/page";
import page from "@/content/company/exhibitions.en";

export const metadata = siteMetadata({ ...page.meta, enPath: page.path, locale: "en" });

export default function ExhibitionsPage() {
  return <SitePageView page={page} locale="en" />;
}
