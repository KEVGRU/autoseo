import { siteMetadata } from "@/components/site/metadata";
import { SitePageView } from "@/components/site/page";
import page from "@/content/company/exhibitions.de";

export const metadata = siteMetadata({ ...page.meta, enPath: page.path, locale: "de" });

export default function GermanExhibitionsPage() {
  return <SitePageView page={page} locale="de" />;
}
