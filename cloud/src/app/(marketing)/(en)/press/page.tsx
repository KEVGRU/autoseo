import { siteMetadata } from "@/components/site/metadata";
import { PressView } from "@/components/site/company/press-view";
import page from "@/content/company/press.en";

export const metadata = siteMetadata({ ...page.meta, enPath: page.path, locale: "en" });

export default function PressPage() {
  return <PressView page={page} locale="en" />;
}
