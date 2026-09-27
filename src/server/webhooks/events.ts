/**
 * Outbound webhook event catalogue (isomorphic — used by the Integrations UI, REST docs and the bus).
 * Every delivery body is an envelope `{ id, event, createdAt, test, project, data }`; `data` is event specific.
 */
export const WEBHOOK_EVENTS = [
  "tracking.run_completed",
  "alert.triggered",
  "report.sent",
  "content.published",
  "fact_check.deviation",
  "attribution.response_created",
  "audit.completed",
  "task.created",
  "task.updated",
  "task.resolved",
  "task.pushed",
] as const;
export type WebhookEventName = (typeof WEBHOOK_EVENTS)[number];

/** Subscribe to every current and future event. */
export const ALL_EVENTS = "*";

export type WebhookEventGroup = "AI visibility" | "Alerts & reports" | "Content & fact check" | "Attribution & audits" | "Tasks";

export const WEBHOOK_EVENT_META: Record<WebhookEventName, { label: string; description: string; group: WebhookEventGroup }> = {
  "tracking.run_completed": {
    label: "Tracking run finished",
    description: "An AI visibility tracking run finished (completed, partial or failed) — with run stats and 7-day KPIs.",
    group: "AI visibility",
  },
  "alert.triggered": { label: "Alert triggered", description: "An alert rule fired (visibility drop, new competitor, failed run …).", group: "Alerts & reports" },
  "report.sent": { label: "Report sent", description: "A scheduled report was delivered to its recipients.", group: "Alerts & reports" },
  "content.published": { label: "Content published", description: "An article or rewrite was published (CMS or marked as published).", group: "Content & fact check" },
  "fact_check.deviation": {
    label: "Fact-check deviation",
    description: "A fact-check run found AI statements that contradict the label, are off-label, unsupported, outdated or break a fact-check rule.",
    group: "Content & fact check",
  },
  "attribution.response_created": {
    label: "Attribution response",
    description: "A new “How did you hear about us?” answer was recorded (form, webhook or integration).",
    group: "Attribution & audits",
  },
  "audit.completed": { label: "Site audit completed", description: "A site audit finished — with score, previous score and issue counts.", group: "Attribution & audits" },
  "task.created": { label: "Task created", description: "Optimization tasks were created (generated or manual).", group: "Tasks" },
  "task.updated": { label: "Task updated", description: "Optimization tasks changed (status, assignee, steps, due date …).", group: "Tasks" },
  "task.resolved": { label: "Task resolved", description: "Optimization tasks were completed, dismissed or auto-resolved.", group: "Tasks" },
  "task.pushed": { label: "Task pushed", description: "Tasks were pushed to a project-management tool (Jira, Linear, Asana …).", group: "Tasks" },
};

export const WEBHOOK_EVENT_GROUPS: WebhookEventGroup[] = ["AI visibility", "Alerts & reports", "Content & fact check", "Attribution & audits", "Tasks"];

export function isWebhookEvent(v: unknown): v is WebhookEventName {
  return typeof v === "string" && (WEBHOOK_EVENTS as readonly string[]).includes(v);
}

/** True when an endpoint with these subscriptions should receive `event`. */
export function endpointWantsEvent(events: readonly string[], event: string): boolean {
  return events.includes(ALL_EVENTS) || events.includes(event);
}

/** Normalizes a subscription list: known events only, deduped, "*" collapses everything. */
export function normalizeEventList(events: readonly string[]): string[] {
  if (events.includes(ALL_EVENTS)) return [ALL_EVENTS];
  return WEBHOOK_EVENTS.filter((e) => events.includes(e));
}

const SAMPLE_TASK = {
  id: "tsk_sample000000000",
  title: "Add an FAQ section answering “best balcony power plant”",
  summary: "Competitors are cited for this prompt; your page has no direct answer.",
  category: "content",
  status: "open",
  resolution: null,
  impact: 8,
  effort: 3,
  priority: 74,
  steps: [{ text: "Write 5 concise answers", done: false }],
  acceptanceCriteria: ["FAQ with FAQPage JSON-LD is live"],
  targetUrls: ["https://example.com/products"],
  targetPrompts: ["best balcony power plant"],
  assigneeId: null,
  dueDate: null,
  external: [],
  createdAt: "2026-01-01T09:00:00.000Z",
  updatedAt: "2026-01-01T09:00:00.000Z",
  resolvedAt: null,
  url: "https://autoseo.example/p/prj_sample/tasks/tsk_sample000000000",
};

/** Example `data` for "Send test event" (so Zapier / Make / n8n can map fields before real events exist). */
export function sampleEventData(event: WebhookEventName): Record<string, unknown> {
  switch (event) {
    case "tracking.run_completed":
      return {
        run: {
          id: "run_sample000000000",
          trigger: "schedule",
          status: "completed",
          fullRun: true,
          totalTasks: 120,
          doneTasks: 120,
          failedTasks: 0,
          costUsd: 0.42,
          startedAt: "2026-01-01T06:00:00.000Z",
          finishedAt: "2026-01-01T06:12:00.000Z",
          error: null,
        },
        kpis: { from: "2025-12-26", to: "2026-01-01", answers: 840, visibility: 41.2, mentionRate: 38.5, citationRate: 12.1, shareOfVoice: 18.4, position: 2.3, sentiment: 71.5 },
        url: "https://autoseo.example/p/prj_sample/ai/tracker",
      };
    case "alert.triggered":
      return {
        alert: {
          id: "ale_sample000000000",
          ruleId: "alr_sample000000000",
          ruleName: "Visibility drop",
          kind: "visibility_drop",
          severity: "warning",
          title: "Visibility dropped 12.4 pp to 28.8%",
          body: "AI visibility over the last 7 days is 28.8% (previous 7 days: 41.2%).",
          metric: "visibility",
          current: 28.8,
          previous: 41.2,
          change: -12.4,
          unit: "pp",
          items: [{ key: "visibility_drop", label: "Visibility 41.2% → 28.8%" }],
          firedAt: "2026-01-01T07:00:00.000Z",
          url: "https://autoseo.example/p/prj_sample/alerts",
        },
      };
    case "report.sent":
      return {
        report: { id: "rpt_sample000000000", title: "Monthly AI visibility", url: "https://autoseo.example/p/prj_sample/reports/rpt_sample000000000", shareUrl: null },
        recipients: ["team@example.com"],
        format: "pptx",
        sentAt: "2026-01-01T08:00:00.000Z",
      };
    case "content.published":
      return {
        content: {
          id: "cnt_sample000000000",
          title: "The best balcony power plants in 2026",
          kind: "article",
          slug: "best-balcony-power-plants",
          publishedUrl: "https://example.com/blog/best-balcony-power-plants",
          provider: "wordpress",
          externalId: "1234",
          targetPrompt: "best balcony power plant",
          targetKeyword: "balcony power plant",
          aeoScore: 88,
          wordCount: 1840,
          publishedAt: "2026-01-01T10:00:00.000Z",
          appUrl: "https://autoseo.example/p/prj_sample/content/cnt_sample000000000",
        },
      };
    case "fact_check.deviation":
      return {
        run: { id: "opr_sample000000000", finishedAt: "2026-01-01T05:00:00.000Z" },
        counts: { total: 2, critical: 1, major: 1, minor: 0, ruleViolations: 1 },
        deviations: [
          {
            id: "fcs_sample000000000",
            assetId: "fca_sample000000000",
            assetName: "Product X",
            claim: "Product X can be taken twice daily by children under 6.",
            verdict: "off_label",
            severity: "critical",
            engine: "chatgpt",
            market: "US",
            labelSection: "Dosage",
            labelQuote: "Not for use in children under 12 years.",
            explanation: "The label does not approve use in children under 12.",
            rule: null,
            url: "https://autoseo.example/p/prj_sample/fact-check/findings",
          },
          {
            id: "fcs_sample000000001",
            assetId: "fca_sample000000000",
            assetName: "Product X",
            claim: "Product X financing starts at 1.9 % APR.",
            verdict: "rule_violation",
            severity: "major",
            engine: "perplexity",
            market: "US",
            labelSection: "Rule · APR range",
            labelQuote: "Expected: 3.9–12.9 %",
            explanation: "Found 1.9 %, outside the allowed range 3.9–12.9 %.",
            rule: { id: "fcr_sample000000000", name: "APR range", kind: "numeric_range", severity: "major" },
            url: "https://autoseo.example/p/prj_sample/fact-check/findings",
          },
        ],
      };
    case "attribution.response_created":
      return {
        response: {
          id: "atr_sample000000000",
          provider: "typeform",
          sourceType: "integration",
          formName: "Signup survey",
          channel: "ai_search",
          channelDetail: "chatgpt",
          rawAnswer: "ChatGPT recommended you",
          dealValue: 499,
          dealCurrency: "EUR",
          emailMask: "j***@example.com",
          respondedAt: "2026-01-01T11:00:00.000Z",
        },
      };
    case "audit.completed":
      return {
        audit: {
          id: "aud_sample000000000",
          startUrl: "https://example.com/",
          trigger: "scheduled",
          score: 82,
          previousScore: 86,
          pagesCrawled: 412,
          issueCounts: { critical: 3, warning: 18, info: 40, total: 61, types: 14 },
          completedAt: "2026-01-01T04:00:00.000Z",
          url: "https://autoseo.example/p/prj_sample/seo/audit/aud_sample000000000",
        },
      };
    case "task.created":
    case "task.updated":
    case "task.resolved":
      return { tasks: [event === "task.resolved" ? { ...SAMPLE_TASK, status: "done", resolution: "manual", resolvedAt: "2026-01-02T09:00:00.000Z" } : SAMPLE_TASK] };
    case "task.pushed":
      return { provider: "linear", tasks: [{ ...SAMPLE_TASK, external: [{ provider: "linear", url: "https://linear.app/acme/issue/SEO-42" }] }] };
  }
}
