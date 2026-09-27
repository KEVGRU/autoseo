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

const { meta, homeFaq } = getCopy("de");

export const metadata = pageMetadata({
  ...meta.home,
  path: "/de",
  locale: "de",
  translationOf: "/",
  absolute: true,
  ownImage: true,
});

export default function GermanHomePage() {
  return (
    <>
      <JsonLd
        data={graph(
          organization(),
          website(),
          webPage({ path: "/de", name: meta.home.title, description: meta.home.description, locale: "de" }),
          softwareApplication("de"),
          sourceCode(),
          faqPage(homeFaq, "/de", "de"),
        )}
      />
      <HomePageContent locale="de" />
    </>
  );
}
