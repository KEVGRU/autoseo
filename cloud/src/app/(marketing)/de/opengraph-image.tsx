import { getCopy } from "@/components/marketing/i18n";
import { renderOgImage } from "@/components/marketing/og/render";

const { meta } = getCopy("de");

export const alt = meta.ogAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOgImage({ title: meta.ogTitle, chips: meta.ogChips });
}
