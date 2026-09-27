import "server-only";
/**
 * Domain event builders for the webhook bus. Call sites add one line (e.g. after a CMS publish);
 * payloads are only built when an endpoint of the project subscribes to the event.
 * Every function swallows errors — emitting must never break the originating action.
 */
import { and, desc, eq, gte, inArray, isNotNull, lt, ne } from "drizzle-orm";
import { db } from "@/server/db/client";
import { FC_DEVIATIONS, aiRuns, attributionResponses, contentPieces, fcAssets, fcRules, fcStatements, siteAudits } from "@/server/db/schema";
import { env } from "@/server/env";
import { emitEvent } from "./deliver";

const appLink = (path: string) => `${env.appUrl}${path}`;

type AuditRow = typeof siteAudits.$inferSelect;
type ResponseRow = typeof attributionResponses.$inferSelect;

/** `content.published` — after a CMS publish (non-draft) or when a piece is marked as published. */
export async function emitContentPublished(projectId: string, contentId: string, source: { provider: string | null }) {
  await emitEvent(projectId, "content.published", async () => {
    const [c] = await db
      .select()
      .from(contentPieces)
      .where(and(eq(contentPieces.projectId, projectId), eq(contentPieces.id, contentId)))
      .limit(1);
    if (!c) return null;
    return {
      content: {
        id: c.id,
        title: c.title,
        kind: c.kind,
        slug: c.slug,
        publishedUrl: c.publishedUrl,
        provider: source.provider,
        externalId: source.provider ? c.externalId : null,
        targetPrompt: c.targetPrompt,
        targetKeyword: c.targetKeyword,
        aeoScore: c.aeoScore,
        wordCount: c.wordCount,
        publishedAt: (c.publishedAt ?? new Date()).toISOString(),
        appUrl: appLink(`/p/${projectId}/content/${c.id}`),
      },
    };
  });
}

/** `audit.completed` — a site audit finished (any trigger), with the previous completed score. */
export async function emitAuditCompleted(audit: AuditRow) {
  await emitEvent(audit.projectId, "audit.completed", async () => {
    const [prev] = await db
      .select({ score: siteAudits.score })
      .from(siteAudits)
      .where(and(eq(siteAudits.projectId, audit.projectId), eq(siteAudits.status, "completed"), ne(siteAudits.id, audit.id), lt(siteAudits.startedAt, audit.startedAt)))
      .orderBy(desc(siteAudits.startedAt))
      .limit(1);
    return {
      audit: {
        id: audit.id,
        startUrl: audit.startUrl,
        trigger: audit.trigger,
        score: audit.score,
        previousScore: prev?.score ?? null,
        pagesCrawled: audit.pagesCrawled,
        issueCounts: audit.issueCounts ?? null,
        completedAt: (audit.completedAt ?? new Date()).toISOString(),
        url: appLink(`/p/${audit.projectId}/seo/audit/${audit.id}`),
      },
    };
  });
}

/**
 * `fact_check.deviation` — deviations judged during one fact-check run (judged since `since`), incl. statements
 * that break a fact-check rule (verdict `rule_violation`, with the rule's name, kind and severity).
 */
export async function emitFactCheckDeviations(projectId: string, runId: string | null, since: Date) {
  await emitEvent(projectId, "fact_check.deviation", async () => {
    const rows = await db
      .select({ s: fcStatements, assetName: fcAssets.name, rule: { id: fcRules.id, name: fcRules.name, kind: fcRules.kind, severity: fcRules.severity } })
      .from(fcStatements)
      .innerJoin(fcAssets, eq(fcAssets.id, fcStatements.assetId))
      .leftJoin(fcRules, and(eq(fcRules.id, fcStatements.ruleId), eq(fcRules.projectId, fcStatements.projectId)))
      .where(
        and(
          eq(fcStatements.projectId, projectId),
          inArray(fcStatements.verdict, [...FC_DEVIATIONS]),
          eq(fcStatements.status, "open"),
          isNotNull(fcStatements.checkedAt),
          gte(fcStatements.checkedAt, since),
        ),
      )
      .orderBy(desc(fcStatements.checkedAt))
      .limit(100);
    if (!rows.length) return null;
    const counts = { total: rows.length, critical: 0, major: 0, minor: 0, ruleViolations: 0 };
    for (const r of rows) {
      if (r.s.severity) counts[r.s.severity]++;
      if (r.s.verdict === "rule_violation") counts.ruleViolations++;
    }
    return {
      run: { id: runId, finishedAt: new Date().toISOString() },
      counts,
      deviations: rows.map(({ s, assetName, rule }) => ({
        id: s.id,
        assetId: s.assetId,
        assetName,
        claim: s.claim,
        verdict: s.verdict,
        severity: s.severity,
        engine: s.engine,
        market: s.market,
        labelSection: s.labelSection,
        labelQuote: s.labelQuote,
        explanation: s.explanation,
        rule: s.verdict === "rule_violation" ? (rule?.id ? rule : { id: s.ruleId, name: null, kind: null, severity: null }) : null,
        url: appLink(`/p/${projectId}/fact-check/findings`),
      })),
    };
  });
  // The fact_check_deviation alert rule doesn't have to wait for the hourly evaluation.
  try {
    const { enqueueAlertEvaluation } = await import("@/server/alerts/jobs");
    await enqueueAlertEvaluation(projectId);
  } catch (err) {
    console.error("[webhooks] could not queue alert evaluation", err);
  }
}

/** `attribution.response_created` — a new attribution answer (bulk CSV imports are not emitted row by row). */
export async function emitAttributionResponseCreated(projectId: string, r: ResponseRow) {
  await emitEvent(projectId, "attribution.response_created", {
    response: {
      id: r.id,
      provider: r.provider,
      sourceType: r.sourceType,
      formId: r.formId,
      formName: r.formName,
      channel: r.channel,
      channelDetail: r.channelDetail,
      rawAnswer: r.rawAnswer,
      freetext: r.freetext,
      emailMask: r.emailMask,
      dealValue: r.dealValue,
      dealCurrency: r.dealCurrency,
      transactionId: r.transactionId,
      pageUrl: r.pageUrl,
      respondedAt: r.respondedAt.toISOString(),
      url: appLink(`/p/${projectId}/attribution`),
    },
  });
}

/** `report.sent` — for the scheduled report delivery (called by the report sender). */
export async function emitReportSent(
  projectId: string,
  report: { id: string; title: string; shareUrl?: string | null; recipients: string[]; format: string; sentAt?: Date },
) {
  await emitEvent(projectId, "report.sent", {
    report: { id: report.id, title: report.title, url: appLink(`/p/${projectId}/reports/${report.id}`), shareUrl: report.shareUrl ?? null },
    recipients: report.recipients,
    format: report.format,
    sentAt: (report.sentAt ?? new Date()).toISOString(),
  });
}

/**
 * Hook for the tracking run lifecycle: call when a run reaches completed / partial / failed. Emits
 * `tracking.run_completed` (event id `evt_run_{runId}` → idempotent) and queues an alert evaluation.
 * The `webhooks.tracking_runs` schedule calls it for recently finished runs, so a direct call from
 * src/server/ai/tracking/runs.ts only lowers the latency.
 */
export async function afterTrackingRunFinished(runId: string, opts: { evaluateAlerts?: boolean } = {}) {
  try {
    const [run] = await db.select().from(aiRuns).where(eq(aiRuns.id, runId)).limit(1);
    if (!run || run.status === "queued" || run.status === "running") return;
    await emitEvent(run.projectId, "tracking.run_completed", async () => {
      const { getTrackerKpis } = await import("@/server/ai/metrics");
      const { resolveRange } = await import("@/features/ai-tracking/period");
      const period = resolveRange("7d");
      const k = (await getTrackerKpis({ projectId: run.projectId }, period)).current;
      return {
        run: {
          id: run.id,
          trigger: run.trigger,
          status: run.status,
          fullRun: run.fullRun,
          totalTasks: run.totalTasks,
          doneTasks: run.doneTasks,
          failedTasks: run.failedTasks,
          costUsd: Math.round(run.costUsd * 10_000) / 10_000,
          startedAt: run.startedAt?.toISOString() ?? null,
          finishedAt: run.finishedAt?.toISOString() ?? null,
          error: run.error,
        },
        kpis: {
          from: period.from,
          to: period.to,
          answers: k.answers,
          visibility: k.visibility,
          mentionRate: k.mentionRate,
          citationRate: k.citationRate,
          shareOfVoice: k.shareOfVoice,
          position: k.position,
          sentiment: k.sentiment,
        },
        url: appLink(`/p/${run.projectId}/ai/tracker`),
      };
    }, { eventId: `evt_run_${run.id}` });
    if (opts.evaluateAlerts === false) return;
    const { enqueueAlertEvaluation } = await import("@/server/alerts/jobs");
    await enqueueAlertEvaluation(run.projectId);
  } catch (err) {
    console.error(`[webhooks] afterTrackingRunFinished(${runId}) failed`, err);
  }
}
