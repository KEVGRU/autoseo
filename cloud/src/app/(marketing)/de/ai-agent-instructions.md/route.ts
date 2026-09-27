import { aiAgentInstructions } from "@/content/facts";
import { factSheetMarkdown } from "@/content/facts/markdown";

export const dynamic = "force-static";

/** Maschinenlesbare Fassung von /de/ai-agent-instructions (dieselben Daten wie die HTML-Seite). */
export function GET() {
  return new Response(factSheetMarkdown(aiAgentInstructions.de, "de"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=3600", "Content-Language": "de" },
  });
}
