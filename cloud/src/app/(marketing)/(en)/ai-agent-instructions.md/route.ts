import { aiAgentInstructions } from "@/content/facts";
import { factSheetMarkdown } from "@/content/facts/markdown";

export const dynamic = "force-static";

/** Machine-readable copy of /ai-agent-instructions (same data as the HTML page). */
export function GET() {
  return new Response(factSheetMarkdown(aiAgentInstructions.en, "en"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=3600", "Content-Language": "en" },
  });
}
