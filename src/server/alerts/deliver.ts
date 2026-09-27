import "server-only";
/**
 * Alert delivery: in-app notifications (inline), outbound webhook event `alert.triggered` (bus),
 * email + Slack via the `alerts.deliver` job (retried; each channel is sent at most once).
 */
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { alertEvents, alertRules, notifications, projects, type AlertChannels, type AlertDelivery } from "@/server/db/schema";
import { decryptJson } from "@/server/crypto";
import { env } from "@/server/env";
import { appUrl, sendMail } from "@/server/email";
import { simpleEmail } from "@/server/email/templates";
import { enqueueJob } from "@/server/jobs/queue";
import { safeFetch } from "@/server/optimize/net";
import { emitEvent } from "@/server/webhooks/deliver";
import { DEFAULT_CHANNELS, SEVERITY_LABEL } from "@/features/alerts/kinds";
import type { AlertEventRow, AlertRuleRow } from "./rules";

export const ALERT_DELIVER_JOB = "alerts.deliver";

function channelsOf(rule: Pick<AlertRuleRow, "channels">): AlertChannels {
  return { ...DEFAULT_CHANNELS, ...rule.channels };
}

/** Active users who can open the project (all-project roles of the workspace + explicit project members). */
async function projectRecipients(projectId: string): Promise<string[]> {
  const rows = (await db.execute(sql`
    select distinct u.id
    from projects p
    join workspace_members wm on wm.workspace_id = p.workspace_id
    join users u on u.id = wm.user_id and u.status = 'active'
    left join roles r on r.key = wm.role_key
    where p.id = ${projectId}
      and (coalesce(r.all_projects, false) or coalesce(r.permissions, '[]'::jsonb) @> '["projects.all"]'::jsonb
        or exists (select 1 from project_members pm where pm.project_id = p.id and pm.user_id = u.id))`)) as unknown as { id: string }[];
  return rows.map((r) => r.id);
}

function itemLines(event: AlertEventRow, max = 10): string[] {
  const items = event.payload.items ?? [];
  const lines = items.slice(0, max).map((i) => `• ${i.label}${i.detail ? ` — ${i.detail}` : ""}`);
  if (items.length > max) lines.push(`…and ${items.length - max} more`);
  return lines;
}

export function alertWebhookData(event: AlertEventRow, rule: Pick<AlertRuleRow, "id" | "name"> | null) {
  return {
    alert: {
      id: event.id,
      ruleId: event.ruleId,
      ruleName: rule?.name ?? null,
      kind: event.kind,
      severity: event.severity,
      title: event.title,
      body: event.body,
      items: event.payload.items ?? [],
      metric: event.payload.metric ?? null,
      current: event.payload.current ?? null,
      previous: event.payload.previous ?? null,
      change: event.payload.change ?? null,
      unit: event.payload.unit ?? null,
      window: event.payload.window ?? null,
      firedAt: event.firedAt.toISOString(),
      url: `${env.appUrl}/p/${event.projectId}/alerts`,
      investigateUrl: event.href ? `${env.appUrl}${event.href}` : null,
    },
  };
}

async function saveDelivery(eventId: string, delivery: AlertDelivery) {
  await db.update(alertEvents).set({ delivery }).where(eq(alertEvents.id, eventId));
}

/** Called right after an event was stored (from the evaluator). */
export async function deliverAlertEvent(event: AlertEventRow, rule: AlertRuleRow, projectName: string) {
  const channels = channelsOf(rule);
  const delivery: AlertDelivery = { ...event.delivery };
  if (channels.inApp) {
    const users = await projectRecipients(event.projectId);
    if (users.length) {
      await db.insert(notifications).values(
        users.map((userId) => ({
          userId,
          projectId: event.projectId,
          kind: `alert.${event.kind}`,
          title: `${event.title}${projectName ? ` · ${projectName}` : ""}`.slice(0, 300),
          body: event.body.slice(0, 1000),
          href: `/p/${event.projectId}/alerts?event=${event.id}`,
        })),
      );
    }
    delivery.inApp = users.length;
  }
  if (channels.webhook) delivery.webhook = (await emitEvent(event.projectId, "alert.triggered", alertWebhookData(event, rule))) > 0;
  await saveDelivery(event.id, delivery);
  if (channels.emails.length || (channels.slack && rule.slackWebhook)) {
    // Channels are chosen by the user, so demo projects deliver too (no data provider is called).
    await enqueueJob(ALERT_DELIVER_JOB, { eventId: event.id }, { projectId: event.projectId, maxAttempts: 3, priority: 50, allowDemo: true });
  }
  return delivery;
}

function slackEscape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function slackMessage(event: AlertEventRow, projectName: string) {
  const url = appUrl(`/p/${event.projectId}/alerts?event=${event.id}`);
  const icon = event.severity === "critical" ? ":rotating_light:" : event.severity === "warning" ? ":warning:" : ":information_source:";
  const lines = itemLines(event, 8).map(slackEscape);
  return {
    text: `${icon} ${slackEscape(event.title)} — ${slackEscape(projectName)}`,
    blocks: [
      { type: "header", text: { type: "plain_text", text: event.title.slice(0, 150), emoji: true } },
      { type: "section", text: { type: "mrkdwn", text: `${slackEscape(event.body).slice(0, 2500)}${lines.length ? `\n\n${lines.join("\n").slice(0, 2400)}` : ""}` } },
      {
        type: "context",
        elements: [{ type: "mrkdwn", text: `${icon} *${SEVERITY_LABEL[event.severity]}* · ${slackEscape(projectName)} · <${url}|Open in AutoSEO>` }],
      },
    ],
  };
}

/** Job body for `alerts.deliver`: emails (once) and Slack (retried until sent). */
export async function runAlertDelivery(eventId: string) {
  const [row] = await db
    .select({ event: alertEvents, rule: alertRules, projectName: projects.name })
    .from(alertEvents)
    .innerJoin(projects, eq(projects.id, alertEvents.projectId))
    .leftJoin(alertRules, and(eq(alertRules.id, alertEvents.ruleId), eq(alertRules.projectId, alertEvents.projectId)))
    .where(eq(alertEvents.id, eventId))
    .limit(1);
  if (!row?.rule) return { skipped: "event or rule deleted" };
  const { event, rule, projectName } = row;
  const channels = channelsOf(rule);
  const delivery: AlertDelivery = { ...event.delivery };

  if (channels.emails.length && !delivery.emails) {
    const mail = await simpleEmail({
      subject: `[${SEVERITY_LABEL[event.severity]}] ${event.title} · ${projectName}`.slice(0, 200),
      heading: event.title,
      body: [event.body, ...itemLines(event)].join("\n"),
      cta: { label: "Open alerts", url: appUrl(`/p/${event.projectId}/alerts?event=${event.id}`) },
    });
    let sent = 0;
    let failed = 0;
    for (const to of channels.emails) {
      const res = await sendMail({ to, ...mail }).catch((err: unknown) => ({ delivered: false, transport: "smtp" as const, error: String(err) }));
      if (res.delivered) sent++;
      else failed++;
      if (res.transport === "log") delivery.error = "SMTP is not configured — alert emails were written to the server log (Admin → Email).";
    }
    delivery.emails = { sent, failed };
    await saveDelivery(event.id, delivery);
  }

  let slackError: string | null = null;
  if (channels.slack && rule.slackWebhook && delivery.slack !== "sent") {
    try {
      const url = decryptJson<string>(rule.slackWebhook);
      const res = await safeFetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(slackMessage(event, projectName)),
        timeoutMs: 15_000,
        maxBytes: 64 * 1024,
        maxRedirects: 0,
      });
      if (!res.ok) throw new Error(`Slack responded with HTTP ${res.status}: ${res.text().slice(0, 200)}`);
      delivery.slack = "sent";
    } catch (err) {
      slackError = (err instanceof Error ? err.message : String(err)).slice(0, 300);
      delivery.slack = "failed";
      delivery.error = [delivery.error?.startsWith("SMTP") ? delivery.error : null, slackError].filter(Boolean).join(" · ");
    }
    await saveDelivery(event.id, delivery);
  }
  if (slackError) throw new Error(slackError);
  return { emails: delivery.emails ?? null, slack: delivery.slack ?? null };
}
