import { getCopy } from "@/components/marketing/i18n";
import { JsonLd } from "@/components/marketing/json-ld";
import { pageMetadata } from "@/components/marketing/metadata";
import { PricingPageContent } from "@/components/marketing/pricing-page";
import { breadcrumbs, faqPage, graph, softwareApplication, webPage } from "@/components/marketing/structured-data";

const { meta, pricingFaq, schema } = getCopy("de");

export const metadata = pageMetadata({
  ...meta.pricing,
  path: "/de/pricing",
  locale: "de",
  translationOf: "/pricing",
  ownImage: true,
});

export default function GermanPricingPage() {
  return (
    <>
      <JsonLd
        data={graph(
          webPage({ path: "/de/pricing", name: meta.pricing.title, description: meta.pricing.description, locale: "de" }),
          softwareApplication("de"),
          faqPage(pricingFaq, "/de/pricing", "de"),
          breadcrumbs([{ name: schema.pricingName, path: "/de/pricing" }], "de"),
        )}
      />
      <PricingPageContent locale="de" />
    </>
  );
}
