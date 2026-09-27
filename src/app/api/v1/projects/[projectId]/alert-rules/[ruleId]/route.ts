import { getApiProject } from "@/server/api/auth";
import { apiRoute, parseBody } from "@/server/api/handler";
import { alertRulePatch, deleteAlertRuleForApi, getAlertRuleForApi, updateAlertRuleForApi } from "@/server/api/alerts";
import { corsPreflight } from "@/server/api/urls";

type Params = { projectId: string; ruleId: string };

/** GET /api/v1/projects/{projectId}/alert-rules/{ruleId} */
export const GET = apiRoute<Params>({ scope: "read" }, async ({ principal, params }) => {
  const project = await getApiProject(principal, params.projectId);
  return { data: await getAlertRuleForApi(project.id, params.ruleId, principal.permissions.has("alerts.manage")) };
});

/** PUT /api/v1/projects/{projectId}/alert-rules/{ruleId} — partial update (name, params, channels, cooldown, active…). */
export const PUT = apiRoute<Params>({ scope: "write", permission: "alerts.manage" }, async ({ principal, params, req }) => {
  const project = await getApiProject(principal, params.projectId);
  const body = await parseBody(req, alertRulePatch);
  return { data: await updateAlertRuleForApi(project.id, params.ruleId, body) };
});

/** DELETE /api/v1/projects/{projectId}/alert-rules/{ruleId} — fired events are kept. */
export const DELETE = apiRoute<Params>({ scope: "write", permission: "alerts.manage" }, async ({ principal, params }) => {
  const project = await getApiProject(principal, params.projectId);
  return { data: await deleteAlertRuleForApi(project.id, params.ruleId) };
});

export const OPTIONS = corsPreflight;
