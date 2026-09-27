import { siteMetadata } from "@/components/site/metadata";
import { SitePageView } from "@/components/site/page";
import page from "@/content/company/customers.en";

export const metadata = siteMetadata({ ...page.meta, enPath: page.path, locale: "en" });

export default function CustomersPage() {
  return <SitePageView page={page} locale="en" pageType="CollectionPage" />;
}
