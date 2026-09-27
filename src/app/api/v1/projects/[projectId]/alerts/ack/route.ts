import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseBody } from "@/server/api/handler";
import { ackAlertsForApi, alertAckBody } from "@/server/api/alerts";
import type { ProjectParams } from "@/server/api/rest";
import { corsPreflight } from "@/server/api/urls";

/** POST /api/v1/projects/{projectId}/alerts/ack — acknowledge alert events (`ids` or `all: true`). */
export const POST = apiRoute<ProjectParams>({ scope: "write", permission: "alerts.manage" }, async ({ principal, params, req }) => {
  const project = await getApiProject(principal, params.projectId);
  return { data: await ackAlertsForApi(project.id, await parseBody(req, alertAckBody), principal.user.id) };
});

export const OPTIONS = corsPreflight;
