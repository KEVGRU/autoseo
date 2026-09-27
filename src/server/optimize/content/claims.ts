import "server-only";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db/client";
import { contentPieces, projects, type ContentCitation, type ContentClaimChecks } from "@/server/db/schema";
import { AiNotConfiguredError, availableLlmProviders, runLlm } from "@/server/ai/llm";
import { enqueueJob } from "@/server/jobs/queue";
import { internalDocUrl, retrieveGrounding } from "@/server/ai/knowledge/sources/service";
import { claimCandidates, hashBody, parseClaimResults } from "./claims-parse";
import { rescoreAndSnapshot } from "./service";

/**
 * Claim checks: extract the checkable factual claims of a draft and verify each one with web search
 * (plus the brand's internal knowledge) → supported / unsupported / contradicted with sources.
 * "Rewrite with citations" then links supported claims and fixes or hedges the others.
 */

export const CONTENT_CLAIMS_JOB = "optimize.content.claims";
export const CONTENT_CITE_JOB = "optimize.content.cite";

const NO_AI = "No AI provider is available. Connect a local agent or add an API key in Admin → AI Providers.";

export async function enqueueClaimCheck(projectId: string, contentId: string, userId: string | null) {
  const [row] = await db
    .select({ body: contentPieces.body, claimChecks: contentPieces.claimChecks })
    .from(contentPieces)
    .where(and(eq(contentPieces.projectId, projectId), eq(contentPieces.id, contentId)))
    .limit(1);
  if (!row) throw new Error("Content not found");
  const job = await enqueueJob(CONTENT_CLAIMS_JOB, { contentId }, { projectId, createdBy: userId, dedupeKey: `${CONTENT_CLAIMS_JOB}:${contentId}`, maxAttempts: 1, priority: 60 });
  if (!job) throw new Error("Claim checks are not available for demo projects.");
  const next: ContentClaimChecks = { status: "running", startedAt: new Date().toISOString(), claims: row.claimChecks?.claims ?? [], checkedAt: row.claimChecks?.checkedAt ?? null, bodyHash: row.claimChecks?.bodyHash ?? null };
  await db.update(contentPieces).set({ claimChecks: next }).where(eq(contentPieces.id, contentId));
  return next;
}

export async function enqueueCitationRewrite(projectId: string, contentId: string, userId: string | null) {
  const [row] = await db
    .select({ claimChecks: contentPieces.claimChecks })
    .from(contentPieces)
    .where(and(eq(contentPieces.projectId, projectId), eq(contentPieces.id, contentId)))
    .limit(1);
  if (!row) throw new Error("Content not found");
  if (!row.claimChecks?.claims.length || row.claimChecks.status !== "done") throw new Error("Run a claim check first.");
  const job = await enqueueJob(CONTENT_CITE_JOB, { contentId }, { projectId, createdBy: userId, dedupeKey: `${CONTENT_CITE_JOB}:${contentId}`, maxAttempts: 1, priority: 60 });
  if (!job) throw new Error("Rewrites are not available for demo projects.");
  const next: ContentClaimChecks = { ...row.claimChecks, status: "rewriting", error: null };
  await db.update(contentPieces).set({ claimChecks: next }).where(eq(contentPieces.id, contentId));
  return next;
}

const claimSchema = z.object({
  claims: z.array(
    z.object({
      claim: z.string(),
      verdict: z.string(),
      explanation: z.string(),
      suggestion: z.string().optional().nullable(),
      sources: z.array(z.object({ url: z.string(), title: z.string().optional().nullable() })),
    }),
  ),
});

async function loadPiece(contentId: string) {
  const [row] = await db.select().from(contentPieces).where(eq(contentPieces.id, contentId)).limit(1);
  if (!row) throw new Error("Content not found");
  const [project] = await db.select().from(projects).where(eq(projects.id, row.projectId)).limit(1);
  if (!project) throw new Error("Project not found");
  return { row, project };
}

async function failChecks(contentId: string, prev: ContentClaimChecks | null, message: string) {
  await db
    .update(contentPieces)
    .set({ claimChecks: { claims: prev?.claims ?? [], startedAt: prev?.startedAt ?? new Date().toISOString(), checkedAt: prev?.checkedAt ?? null, bodyHash: prev?.bodyHash ?? null, status: "failed", error: message.slice(0, 600) } })
    .where(eq(contentPieces.id, contentId));
}

export async function runClaimCheck(contentId: string) {
  const { row, project } = await loadPiece(contentId);
  try {
    if (!(await availableLlmProviders()).length) throw new AiNotConfiguredError(NO_AI);
    if (row.body.trim().split(/\s+/).length < 40) throw new Error("Write some content before checking claims.");
    const hints = claimCandidates(row.body, 25);
    const knowledge = await retrieveGrounding(row.projectId, row.grounding, [row.targetPrompt, row.targetKeyword, row.title].filter(Boolean).join(" "), 5).catch(() => ({ hits: [], prompt: "" }));
    const res = await runLlm({
      purpose: "content.claims",
      system:
        "You are a rigorous fact-checker. Verify claims against current, authoritative sources found with web search. Never mark a claim supported without a source that states it. Report sources exactly as found.",
      prompt: `Article (${row.language}) by ${project.name} (${project.domain}):

${row.body.slice(0, 30000)}

1) Extract the 6–12 most important checkable factual claims (numbers, prices, dates, specifications, rankings, regulations, study results, "first/only/largest" statements). Use the exact wording from the article. Candidate sentences: ${hints.slice(0, 20).map((h) => `“${h}”`).join(" ")}
2) Verify each claim with web search. Verdicts: "supported" (a reliable source states it), "contradicted" (reliable sources state something different — say what is correct), "unsupported" (no reliable confirmation found).
3) For contradicted or unsupported claims give a "suggestion": corrected or appropriately hedged wording.
4) List the source URLs (and titles) you actually used for each claim.
${knowledge.prompt ? `\nThe brand's internal knowledge (first-party facts; a claim about ${project.name} itself that matches one of these counts as supported — cite it with the given URL, or as knowledge://<source>/<doc> when listed without a web URL):\n${knowledge.prompt}\n${knowledge.hits.map((h, i) => `[K${i + 1}] → ${internalDocUrl(h)}`).join("\n")}\n` : ""}`,
      schema: claimSchema,
      webSearch: true,
      maxTokens: 8000,
      timeoutMs: 12 * 60_000,
      projectId: row.projectId,
      workspaceId: project.workspaceId,
    });
    const claims = parseClaimResults(res.data.claims);
    if (!claims.length) throw new Error("No checkable claims were found in this draft.");
    const checks: ContentClaimChecks = { status: "done", startedAt: row.claimChecks?.startedAt ?? new Date().toISOString(), checkedAt: new Date().toISOString(), bodyHash: hashBody(row.body), claims, error: null };
    await db.update(contentPieces).set({ claimChecks: checks }).where(eq(contentPieces.id, contentId));
    return { claims: claims.length };
  } catch (err) {
    await failChecks(contentId, row.claimChecks, err instanceof Error ? err.message : String(err));
    throw err;
  }
}

const citeSchema = z.object({ body: z.string(), changes: z.array(z.string()) });

function stripFences(md: string): string {
  const m = md.trim().match(/^```(?:markdown|md)?\s*([\s\S]*?)```\s*$/i);
  return (m ? m[1]! : md).trim();
}

/** Rewrites the body so every verified claim links its source and wrong / unverified claims are corrected or hedged. */
export async function runCitationRewrite(contentId: string) {
  const { row, project } = await loadPiece(contentId);
  const checks = row.claimChecks;
  try {
    if (!checks?.claims.length) throw new Error("Run a claim check first.");
    if (!(await availableLlmProviders()).length) throw new AiNotConfiguredError(NO_AI);
    const list = checks.claims
      .map(
        (c, i) =>
          `${i + 1}. [${c.verdict}] “${c.claim}”${c.explanation ? ` — ${c.explanation}` : ""}${c.suggestion ? `\n   Suggested wording: ${c.suggestion}` : ""}${c.sources.length ? `\n   Sources: ${c.sources.map((s) => `${s.title ? `${s.title} ` : ""}<${s.url}>`).join(", ")}` : ""}`,
      )
      .join("\n");
    const res = await runLlm({
      purpose: "content.cite",
      system: "You edit articles for factual accuracy and citations. Change only what the fact-check requires; keep structure, headings, tone, tables and all other text identical.",
      prompt: `Fact-check results for the article below:
${list}

Rewrite the article in ${row.language} as Markdown:
- Supported claims: add an inline markdown link to the best source (https URLs only) right after the claim, unless already linked. Never link knowledge:// sources — keep those facts without a link.
- Contradicted claims: correct them using the suggested wording / sources and link the source.
- Unsupported claims: hedge them (e.g. "according to …", "about") using the suggested wording, or remove them if they can't be stated responsibly.
- Keep everything else unchanged. Return the full article body and a short list of the changes you made.

Article:
${row.body.slice(0, 40000)}`,
      schema: citeSchema,
      maxTokens: 16000,
      timeoutMs: 15 * 60_000,
      projectId: row.projectId,
      workspaceId: project.workspaceId,
    });
    const body = stripFences(res.data.body);
    if (body.split(/\s+/).length < Math.min(60, row.body.split(/\s+/).length / 2)) throw new Error("The model returned an unusably short rewrite — the draft was not changed.");
    const existing = new Set(row.citations.map((c) => c.url));
    const added: ContentCitation[] = [];
    for (const c of checks.claims) {
      if (c.verdict === "unsupported") continue;
      for (const s of c.sources) {
        if (!/^https?:\/\//i.test(s.url) || existing.has(s.url) || !body.includes(s.url)) continue;
        existing.add(s.url);
        added.push({ url: s.url, title: s.title ?? null, note: `Verifies: ${c.claim.slice(0, 160)}`, type: "web" });
      }
    }
    const citations = [...row.citations, ...added].slice(0, 60);
    const next: ContentClaimChecks = { ...checks, status: "done", error: null, rewrittenAt: new Date().toISOString() };
    await db.update(contentPieces).set({ body, citations, claimChecks: next }).where(eq(contentPieces.id, contentId));
    await rescoreAndSnapshot({ ...row, body, citations });
    return { added: added.length, changes: res.data.changes.slice(0, 20) };
  } catch (err) {
    await db
      .update(contentPieces)
      .set({ claimChecks: checks ? { ...checks, status: "done", error: `Rewrite failed: ${(err instanceof Error ? err.message : String(err)).slice(0, 500)}` } : null })
      .where(eq(contentPieces.id, contentId));
    throw err;
  }
}
