import "server-only";
import { z } from "zod";
import { ALERT_KINDS } from "@/server/db/schema/alerts";
import { listAlertEventsForApi, listAlertRulesForApi } from "@/server/api/alerts";
import { defineTool } from "../types";
import { mdTable, projectIdInput, toolProject } from "../helpers";

/** Alerts engine — fired alerts and alert rules (read-only). */
export const alertTools = [
  defineTool({
    name: "list_alerts",
    title: "List alerts",
    description:
      "Alerts fired for the project (visibility / share-of-voice / position / sentiment drops, competitor overtakes, new competitors and ads, criticism spikes, lost citations, fact-check deviations, missing AI crawlers, bot error spikes, AI traffic drops, failed tracking runs) with what changed. Filter by open (unacknowledged) status or kind.",
    input: z.object({
      projectId: projectIdInput,
      status: z.enum(["open", "acknowledged", "all"]).optional().describe("Default all."),
      kind: z.enum(ALERT_KINDS).optional(),
      limit: z.number().int().min(1).max(200).optional().describe("Default 50."),
      page: z.number().int().min(1).max(1000).optional(),
    }),
    scope: "read",
    annotations: { readOnlyHint: true, openWorldHint: false },
    async handler(args, ctx) {
      const p = await toolProject(ctx, args.projectId);
      const r = await listAlertEventsForApi(p.id, { status: args.status ?? "all", kind: args.kind, page: args.page ?? 1, limit: args.limit ?? 50 });
      return {
        text: `${r.pagination.total} alert(s) — ${r.counts.open} open (${r.counts.critical} critical), ${r.counts.last7d} in the last 7 days\n\n${mdTable(r.items, [
          ["fired", (e) => e.firedAt.slice(0, 16).replace("T", " ")],
          ["severity", (e) => e.severity],
          ["kind", (e) => e.kindLabel],
          ["title", (e) => e.title],
          ["acknowledged", (e) => Boolean(e.ackAt)],
          ["id", (e) => e.id],
        ])}`,
        data: { projectId: p.id, ...r, url: `${ctx.baseUrl}/p/${p.id}/alerts` },
      };
    },
  }),
  defineTool({
    name: "list_alert_rules",
    title: "List alert rules",
    description: "Alert rules of the project: kind, thresholds and window, channels (in-app, email, Slack, webhook), cooldown, active flag and when each rule last fired.",
    input: z.object({ projectId: projectIdInput }),
    scope: "read",
    annotations: { readOnlyHint: true, openWorldHint: false },
    async handler(args, ctx) {
      const p = await toolProject(ctx, args.projectId);
      const rules = await listAlertRulesForApi(p.id, ctx.principal.permissions.has("alerts.manage"));
      return {
        text: `${rules.length} alert rule(s), ${rules.filter((r) => r.active).length} active\n\n${mdTable(rules, [
          ["name", (r) => r.name],
          ["kind", (r) => r.kindLabel],
          ["condition", (r) => r.summary],
          ["channels", (r) => [r.channels.inApp && "in-app", r.channels.emails.length && `${r.channels.emails.length} email`, r.channels.slack && "Slack", r.channels.webhook && "webhook"].filter(Boolean).join(", ")],
          ["active", (r) => r.active],
          ["last fired", (r) => r.lastFiredAt?.slice(0, 16).replace("T", " ") ?? null],
          ["id", (r) => r.id],
        ])}`,
        data: { projectId: p.id, rules, url: `${ctx.baseUrl}/p/${p.id}/alerts?tab=rules` },
      };
    },
  }),
];
