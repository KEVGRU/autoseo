import "server-only";
import { S, type OpenApiOperation } from "../openapi-helpers";
import { portfolioQuery } from "../portfolio";

const { str, strN, num, int, bool, arr, obj } = S;
const period = obj({ from: str, to: str, days: int, previous: obj({ from: str, to: str }) });

/** REST v1 operations: Agency portfolio (cross-project overview). */
export const portfolioOperations: OpenApiOperation[] = [
  {
    method: "get",
    path: "/portfolio",
    operationId: "getPortfolio",
    summary: "Portfolio overview (all projects)",
    description:
      "One row per project the credential can access (API-key project restriction ∩ the owner's project access): AI visibility, share of voice, average position, sentiment and own-domain citations with changes vs the previous period of equal length (same definitions as /projects/{projectId}/metrics — status ok answers of active prompts, tracked brand set), open high-impact tasks (impact ≥ 7), survey-attributed AI search revenue in each project's reporting currency, last tracking run, pitch / paused flags and a daily visibility series. Rows are sorted by visibility (untracked projects last). meta.totals sums the filtered rows; revenue is reported per currency.",
    tag: "Portfolio",
    scope: "read",
    query: portfolioQuery,
    data: arr(
      obj({
        projectId: str,
        name: str,
        domain: str,
        country: str,
        isPitch: bool,
        pitchExpiresAt: strN,
        paused: bool,
        trackingFrequency: { type: "string", enum: ["daily", "weekly", "monthly", "paused"] },
        answers: int,
        prompts: int,
        visibility: num,
        visibilityChange: { ...num, description: "Percentage points vs the previous period." },
        mentionRate: num,
        shareOfVoice: num,
        shareOfVoiceChange: num,
        avgPosition: { ...num, description: "Mean position where the brand is named (1 = first); lower is better." },
        avgPositionChange: num,
        sentiment: num,
        sentimentChange: num,
        citations: { ...int, description: "Answers citing an own-domain page." },
        citationsChange: { type: ["integer", "null"] },
        citationRate: num,
        openTasks: int,
        openHighImpactTasks: int,
        aiRevenue: num,
        aiRevenuePrevious: num,
        aiResponses: int,
        currency: str,
        lastRunAt: { type: ["string", "null"], format: "date-time" },
        lastRunStatus: strN,
        visibilitySeries: arr(obj({ date: { type: "string", format: "date" }, visibility: num })),
        url: { type: "string", format: "uri" },
      }),
    ),
    meta: {
      period,
      totals: obj({
        projects: int,
        tracked: { ...int, description: "Projects with at least one answer in the period." },
        avgVisibility: num,
        avgVisibilityDelta: num,
        answers: int,
        openHighImpactTasks: int,
        revenue: arr(obj({ currency: str, value: num, previous: num })),
      }),
    },
  },
];
