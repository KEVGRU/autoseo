import type { Metadata } from "next";
import { pageMetadata } from "@/components/marketing/metadata";
import { getOfferCopy } from "@/components/marketing/launch-offer/copy";
import { LaunchPageContent } from "@/components/marketing/launch-offer/launch-page";

const { page } = getOfferCopy("en");

// The offer ends at a fixed time: re-render regularly so the static page switches to the "ended" state by itself.
export const revalidate = 300;

export const metadata: Metadata = {
  ...pageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: "/launch",
    locale: "en",
    translationOf: "/launch",
    ownImage: true,
  }),
  // A time-limited campaign page for ads and social posts, not for search results.
  robots: { index: false, follow: true },
};

export default function LaunchPage() {
  return <LaunchPageContent locale="en" />;
}
