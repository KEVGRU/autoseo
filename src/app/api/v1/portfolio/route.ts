import { apiRoute, parseQuery } from "@/server/api/handler";
import { portfolioForApi, portfolioQuery } from "@/server/api/portfolio";
import { corsPreflight } from "@/server/api/urls";
import { env } from "@/server/env";

/** GET /api/v1/portfolio — AI visibility, tasks and AI revenue across every accessible project. */
export const GET = apiRoute({ scope: "read" }, async ({ principal, url }) => {
  const q = parseQuery(url, portfolioQuery);
  const { rows, totals, period } = await portfolioForApi(principal, q, env.appUrl);
  return { data: rows, meta: { period, totals } };
});

export const OPTIONS = corsPreflight;
