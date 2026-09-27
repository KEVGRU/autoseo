import { FactSheetPage, factSheetMetadata } from "@/components/site/facts/fact-sheet-page";

export const metadata = factSheetMetadata("en");

export default function AiAgentInstructionsPage() {
  return <FactSheetPage locale="en" />;
}
