import { getCopy } from "@/components/marketing/i18n";
import { JsonLd } from "@/components/marketing/json-ld";
import { pageMetadata } from "@/components/marketing/metadata";
import { PricingPageContent } from "@/components/marketing/pricing-page";
import { breadcrumbs, faqPage, graph, softwareApplication, webPage } from "@/components/marketing/structured-data";

const { meta, pricingFaq, schema } = getCopy("en");

export const metadata = pageMetadata({ ...meta.pricing, path: "/pricing", translationOf: "/pricing", ownImage: true });

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={graph(
          webPage({ path: "/pricing", name: meta.pricing.title, description: meta.pricing.description, locale: "en" }),
          softwareApplication("en"),
          faqPage(pricingFaq, "/pricing", "en"),
          breadcrumbs([{ name: schema.pricingName, path: "/pricing" }], "en"),
        )}
      />
      <PricingPageContent locale="en" />
    </>
  );
}
