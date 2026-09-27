import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseBody } from "@/server/api/handler";
import { alertRuleInput, createAlertRuleForApi, listAlertRulesForApi } from "@/server/api/alerts";
import type { ProjectParams } from "@/server/api/rest";
import { corsPreflight } from "@/server/api/urls";

/** GET /api/v1/projects/{projectId}/alert-rules — alert rules (the default set is created on first read). */
export const GET = apiRoute<ProjectParams>({ scope: "read" }, async ({ principal, params }) => {
  const project = await getApiProject(principal, params.projectId);
  return { data: await listAlertRulesForApi(project.id, principal.permissions.has("alerts.manage")) };
});

/** POST /api/v1/projects/{projectId}/alert-rules — create an alert rule. */
export const POST = apiRoute<ProjectParams>({ scope: "write", permission: "alerts.manage" }, async ({ principal, params, req }) => {
  const project = await getApiProject(principal, params.projectId);
  const body = await parseBody(req, alertRuleInput);
  return { data: await createAlertRuleForApi(project.id, body, principal.user.id), status: 201 };
});

export const OPTIONS = corsPreflight;
