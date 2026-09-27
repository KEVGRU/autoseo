import { CheckPage, checkMetadata } from "@/components/site/check/check-page";

export const metadata = checkMetadata("en");

export default function AiVisibilityCheckPage() {
  return <CheckPage locale="en" />;
}
