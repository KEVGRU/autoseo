import { getCopy } from "@/components/marketing/i18n";
import { HomePageContent } from "@/components/marketing/home/home-page";
import { JsonLd } from "@/components/marketing/json-ld";
import { pageMetadata } from "@/components/marketing/metadata";
import {
  faqPage,
  graph,
  organization,
  softwareApplication,
  sourceCode,
  webPage,
  website,
} from "@/components/marketing/structured-data";

const { meta, homeFaq } = getCopy("en");

export const metadata = pageMetadata({ ...meta.home, path: "/", translationOf: "/", absolute: true });

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={graph(
          organization(),
          website(),
          webPage({ path: "/", name: meta.home.title, description: meta.home.description, locale: "en" }),
          softwareApplication("en"),
          sourceCode(),
          faqPage(homeFaq, "/", "en"),
        )}
      />
      <HomePageContent locale="en" />
    </>
  );
}
