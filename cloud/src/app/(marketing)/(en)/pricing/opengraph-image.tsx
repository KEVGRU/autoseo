import { getCopy } from "@/components/marketing/i18n";
import { renderOgImage } from "@/components/marketing/og/render";

const { meta } = getCopy("en");

export const alt = meta.pricingOgAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOgImage({ eyebrow: meta.pricingOgEyebrow, title: meta.pricingOgTitle, chips: meta.ogChips });
}
