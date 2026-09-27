import { handleStartPublicCheck } from "@/server/free-tools/visibility-check";

export const dynamic = "force-dynamic";

/**
 * Starts a public Free AI Visibility Check (no login). Only answers when Admin → Free tools → "Public" and the AI
 * check are enabled; runs the free-tools protection pipeline (see `handleStartPublicCheck`) and queues the check.
 */
export async function POST(req: Request) {
  return handleStartPublicCheck(req);
}
