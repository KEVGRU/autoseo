import { siteMetadata } from "@/components/site/metadata";
import { SitePageView } from "@/components/site/page";
import page from "@/content/company/webinars.de";

export const metadata = siteMetadata({ ...page.meta, enPath: page.path, locale: "de" });

export default function GermanWebinarsPage() {
  return <SitePageView page={page} locale="de" />;
}
