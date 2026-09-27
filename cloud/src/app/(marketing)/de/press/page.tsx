import { siteMetadata } from "@/components/site/metadata";
import { PressView } from "@/components/site/company/press-view";
import page from "@/content/company/press.de";

export const metadata = siteMetadata({ ...page.meta, enPath: page.path, locale: "de" });

export default function GermanPressPage() {
  return <PressView page={page} locale="de" />;
}
