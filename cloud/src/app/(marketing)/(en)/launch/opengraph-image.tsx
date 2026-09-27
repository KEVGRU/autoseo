import { getOfferCopy } from "@/components/marketing/launch-offer/copy";
import { renderOgImage } from "@/components/marketing/og/render";

const { page } = getOfferCopy("en");

export const alt = page.ogAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOgImage({ eyebrow: page.ogEyebrow, title: page.ogTitle, chips: page.ogChips });
}
