import { CheckPage, checkMetadata } from "@/components/site/check/check-page";

export const metadata = checkMetadata("de");

export default function GermanAiVisibilityCheckPage() {
  return <CheckPage locale="de" />;
}
