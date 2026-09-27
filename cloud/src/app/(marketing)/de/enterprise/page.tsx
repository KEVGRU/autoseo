import { siteMetadata } from "@/components/site/metadata";
import { SitePageView } from "@/components/site/page";
import page from "@/content/company/enterprise.de";

export const metadata = siteMetadata({ ...page.meta, enPath: page.path, locale: "de" });

export default function GermanEnterprisePage() {
  return <SitePageView page={page} locale="de" />;
}
