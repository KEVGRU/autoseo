import { siteMetadata } from "@/components/site/metadata";
import { SitePageView } from "@/components/site/page";
import page from "@/content/company/affiliate-program.de";

export const metadata = siteMetadata({ ...page.meta, enPath: page.path, locale: "de" });

export default function GermanAffiliateProgramPage() {
  return <SitePageView page={page} locale="de" />;
}
