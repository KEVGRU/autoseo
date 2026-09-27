import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseBody } from "@/server/api/handler";
import { alertEvaluateBody, evaluateAlertsForApi } from "@/server/api/alerts";
import type { ProjectParams } from "@/server/api/rest";
import { corsPreflight } from "@/server/api/urls";

/** POST /api/v1/projects/{projectId}/alerts/evaluate — evaluate the active alert rules now (normally hourly). */
export const POST = apiRoute<ProjectParams>({ scope: "write", permission: "alerts.manage" }, async ({ principal, params, req }) => {
  const project = await getApiProject(principal, params.projectId);
  const { ruleIds } = await parseBody(req, alertEvaluateBody);
  return { data: await evaluateAlertsForApi(project.id, ruleIds) };
});

export const OPTIONS = corsPreflight;
