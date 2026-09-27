import { FactSheetPage, factSheetMetadata } from "@/components/site/facts/fact-sheet-page";

export const metadata = factSheetMetadata("de");

export default function GermanAiAgentInstructionsPage() {
  return <FactSheetPage locale="de" />;
}
