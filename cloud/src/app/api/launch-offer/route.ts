import { getLaunchOfferStatus } from "@/server/stripe";

export const dynamic = "force-dynamic";

/** Public launch-offer state for the (static) marketing pages: open, deadline and spots left. */
export async function GET() {
  const status = await getLaunchOfferStatus();
  return Response.json(status, { headers: { "Cache-Control": "public, max-age=30, s-maxage=60" } });
}
