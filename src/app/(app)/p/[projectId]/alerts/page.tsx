import type { Metadata } from "next";
import { and, arrayOverlaps, count, eq } from "drizzle-orm";
import { PageContainer, PageHeader } from "@/components/app/page";
import { requireProject } from "@/server/auth/guards";
import { db } from "@/server/db/client";
import { ALERT_KINDS, promptTags, webhookEndpoints, type AlertKind } from "@/server/db/schema";
import { ensureDefaultRules, eventCounts, listEvents, listRules, toPublicRule } from "@/server/alerts/rules";
import { ENGINES } from "@/lib/engines";
import { AlertsView, EvaluateButton } from "@/features/alerts/components/alerts-view";

export const metadata: Metadata = { title: "Alerts" };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AlertsPage({ params, searchParams }: PageProps<"/p/[projectId]/alerts">) {
  const { projectId } = await params;
  const sp = await searchParams;
  const ctx = await requireProject(projectId);
  const canManage = ctx.permissions.has("alerts.manage");
  await ensureDefaultRules(ctx.project.id);

  const tab = one(sp.tab) === "rules" ? "rules" : "alerts";
  const statusRaw = one(sp.status);
  const status = statusRaw === "open" || statusRaw === "acknowledged" ? statusRaw : "all";
  const kindRaw = one(sp.kind);
  const kind = kindRaw && (ALERT_KINDS as readonly string[]).includes(kindRaw) ? (kindRaw as AlertKind) : null;
  const page = Math.max(1, Math.min(10_000, Number(one(sp.page)) || 1));
  const focusEventId = one(sp.event) ?? null;

  const [rules, feed, counts, tags, [endpoints]] = await Promise.all([
    listRules(ctx.project.id),
    listEvents(ctx.project.id, { status, kind: kind ?? undefined, page, limit: 25 }),
    eventCounts(ctx.project.id),
    db.select({ id: promptTags.id, name: promptTags.name }).from(promptTags).where(eq(promptTags.projectId, ctx.project.id)).orderBy(promptTags.name),
    db
      .select({ n: count() })
      .from(webhookEndpoints)
      .where(and(eq(webhookEndpoints.projectId, ctx.project.id), eq(webhookEndpoints.active, true), arrayOverlaps(webhookEndpoints.events, ["alert.triggered", "*"]))),
  ]);
  const projectEngines = new Set(ctx.project.engines);
  const engines = ENGINES.filter((e) => projectEngines.has(e.id) || rules.some((r) => r.params.engines?.includes(e.id))).map((e) => ({ value: e.id, label: e.name }));

  return (
    <PageContainer>
      <PageHeader
        title="Alerts"
        description="Get notified when AI visibility, competitors, sentiment, citations, AI crawlers or AI traffic change — in-app, by email, in Slack or via webhooks."
        actions={canManage ? <EvaluateButton projectId={ctx.project.id} /> : null}
      />
      <AlertsView
        projectId={ctx.project.id}
        canManage={canManage}
        tab={tab}
        status={status}
        kind={kind}
        events={feed.items}
        pagination={feed.pagination}
        counts={counts}
        rules={rules.map((r) => toPublicRule(r, { revealRecipients: canManage }))}
        engines={engines}
        tags={tags.map((t) => ({ value: t.id, label: t.name }))}
        webhookEndpoints={Number(endpoints?.n ?? 0)}
        focusEventId={focusEventId}
      />
    </PageContainer>
  );
}
