import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseQuery } from "@/server/api/handler";
import type { ProjectParams } from "@/server/api/rest";
import { botTrafficForApi, botTrafficInput, TRAFFIC_ARRAY_KEYS } from "@/server/api/traffic";
import { corsPreflight } from "@/server/api/urls";

/** GET /api/v1/projects/{projectId}/bot-traffic — AI crawler hits (CDN / server logs), coverage gaps. */
export const GET = apiRoute<ProjectParams>({ scope: "read" }, async ({ principal, params, url }) => {
  const project = await getApiProject(principal, params.projectId);
  const q = parseQuery(url, botTrafficInput, TRAFFIC_ARRAY_KEYS);
  const { rows, ...meta } = await botTrafficForApi(project.id, q);
  return { data: rows, meta };
});

export const OPTIONS = corsPreflight;
