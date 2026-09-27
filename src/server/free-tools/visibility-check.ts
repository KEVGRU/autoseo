import "server-only";
/**
 * Free AI Visibility Check (lead magnet + in-app tool): instant, honest, no sales-call gate.
 *
 * 1. AI readiness — deterministic, no AI cost (robots.txt per AI crawler, llms.txt, raw-HTML rendering, JSON-LD,
 *    metadata, HTTP) via the SSRF-safe client.
 * 2. AI answers — brand + competitors + 5 buyer prompts (ai/bootstrap), answered on up to 3 configured engines
 *    (answerPrompt), scored with the deterministic brand matcher. Simulated engines are labelled.
 * 3. 3 prioritized actions — runLlm grounded in the measured findings, rule-based fallback.
 *
 * Public requests run the free-tools protection pipeline (enabled switch, JSON/size limits, same-origin, per-IP rate
 * limit, Turnstile, per-visitor + per-day caps, shared daily budget ledger). The work always runs as a job.
 */
import { and, count, desc, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db/client";
import { freeToolCounters, freeVisibilityChecks, projects } from "@/server/db/schema";
import { enqueueJob } from "@/server/jobs/queue";
import { getSetting } from "@/server/settings";
import { env } from "@/server/env";
import { randomToken } from "@/server/crypto";
import { rateLimit } from "@/server/rate-limit";
import { clientIp, isSameOrigin } from "@/server/http/request";
import { isValidEmail, normalizeEmail } from "@/server/auth/domains";
import { appUrl, sendMail } from "@/server/email";
import { simpleEmail } from "@/server/email/templates";
import { assertBudget, BudgetExceededError } from "@/server/usage";
import { AiNotConfiguredError, runLlm } from "@/server/ai/llm";
import { suggestBrandProfile, suggestCompetitors, suggestPrompts } from "@/server/ai/bootstrap";
import { answerPrompt, EngineUnavailableError, getEngineAvailability, type EngineAvailability } from "@/server/ai/engines";
import type { EngineProvider } from "@/lib/engines";
import { createProject } from "@/server/projects";
import { CrawlTargetBlockedError, normalizeStartUrlInput } from "@/server/audit-crawler/url-policy";
import { getCountry } from "@/lib/countries";
import { ENGINES, getEngine } from "@/lib/engines";
import type {
  CheckAction,
  CheckAnswer,
  CheckBrand,
  CheckProgress,
  CheckPrompt,
  CheckResults,
  EngineSummary,
  ReadinessResult,
  VisibilityCheckStep,
  VisibilityCheckView,
} from "@/features/visibility-check/types";
import { jsonResponse, readToolBody } from "./public";
import { verifyTurnstile } from "./turnstile";
import { visitorHash } from "./budget";
import { ipIdentity, normalizeDomain, utcDay } from "./domain";
import { runReadinessCheck } from "./visibility-readiness";
import {
  brandStats,
  buildBrandDefs,
  engineSummary,
  EST_USD_LLM_OVERHEAD,
  estimateCheckCostUsd,
  overallScore,
  ruleActions,
  scoreAnswerText,
  summarizeVisibility,
  topSources,
} from "./visibility-scoring";

export const VISIBILITY_CHECK_JOB = "free_tools.ai_visibility_check";
/** Ledger key of the check on `free_tool_counters` (runs per day; spend goes to the shared `all` row). */
const LEDGER_KEY = "tool:ai-visibility-check";
export const MAX_ENGINES = 3;
export const PROMPT_COUNT = 5;
const COMPETITOR_COUNT = 5;
const TTL_DAYS = 30;
/** A completed public check of the same domain + market is reused for 24 h (no new spend). */
const REUSE_COMPLETED_MS = 24 * 3_600_000;
const REUSE_RUNNING_MS = 20 * 60_000;
const ANSWERS_DEADLINE_MS = 8 * 60_000;
const EXCERPT_CHARS = 3_500;
/** Engines in "auto" order when the admin didn't pick any. */
const DEFAULT_ENGINE_ORDER = [
  "chatgpt",
  "perplexity",
  "google_ai_mode",
  "gemini",
  "claude",
  "copilot",
  "ai_overview",
  "grok",
  "mistral",
  "deepseek",
  "chatgpt_gui",
];

const UNAVAILABLE = "The AI visibility check is temporarily unavailable. Please try again later.";

export type CheckRow = typeof freeVisibilityChecks.$inferSelect;

export class VisibilityCheckError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

/* ───────────────────────────── Input ───────────────────────────── */

const inputSchema = z.object({
  domain: z.string().trim().min(3).max(255),
  country: z.string().trim().min(2).max(2),
  email: z.string().trim().max(254).optional(),
  turnstileToken: z.string().max(2048).optional(),
});

export type CheckInput = {
  domain: string;
  country: string;
  language: string;
  email: string | null;
};

export function parseCheckInput(raw: unknown, opts: { allowEmail: boolean }): CheckInput {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) throw new VisibilityCheckError("Enter a website and a market.");
  const domain = normalizeDomain(parsed.data.domain);
  if (!domain) throw new VisibilityCheckError("Enter a valid website, e.g. example.com.");
  try {
    normalizeStartUrlInput(`https://${domain}/`);
  } catch {
    throw new VisibilityCheckError("This address can't be checked.");
  }
  const country = getCountry(parsed.data.country.toUpperCase());
  if (!country) throw new VisibilityCheckError("Choose a market from the list.");
  let email: string | null = null;
  if (opts.allowEmail && parsed.data.email) {
    const e = normalizeEmail(parsed.data.email);
    if (!isValidEmail(e)) throw new VisibilityCheckError("That email address doesn't look right.");
    email = e;
  }
  return { domain, country: country.iso, language: country.language, email };
}

function newCheckId(): string {
  return `fvc_${randomToken(16)}`;
}

/** Only same-site paths or http(s) URLs (never `javascript:`) for admin-configured links. */
export function safeLinkUrl(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  if (v.startsWith("/") && !v.startsWith("//") && !v.startsWith("/\\")) return v;
  try {
    const u = new URL(v);
    if (u.protocol === "https:" || u.protocol === "http:") return u.toString();
  } catch {
    // invalid
  }
  return null;
}

/* ───────────────────────────── Public start (route handler) ───────────────────────────── */

type Reservation = { ok: true; id: string; aiAllowed: boolean } | { ok: false; reason: "daily" | "visitor" };

/**
 * Atomically enforces the per-day and per-visitor caps and reserves the estimated spend on the shared free-tools
 * ledger (`all` row, ceiling freeTools.dailyBudgetUsd), then inserts the check row. When the spend budget is used up
 * the check still runs its free readiness part (aiAllowed = false).
 */
async function reservePublicCheck(input: CheckInput, visitor: string, day: string, estimateUsd: number): Promise<Reservation> {
  const settings = await getSetting("freeTools");
  const dayStart = new Date(`${day}T00:00:00Z`);
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext('free_visibility_checks:reserve'))`);
    const [total] = await tx
      .select({ n: count() })
      .from(freeVisibilityChecks)
      .where(and(eq(freeVisibilityChecks.surface, "public"), gte(freeVisibilityChecks.createdAt, dayStart)));
    if (Number(total?.n ?? 0) >= settings.aiCheckMaxPerDay) return { ok: false, reason: "daily" } as const;
    const [mine] = await tx
      .select({ n: count() })
      .from(freeVisibilityChecks)
      .where(and(eq(freeVisibilityChecks.ipHash, visitor), gte(freeVisibilityChecks.createdAt, dayStart)));
    if (Number(mine?.n ?? 0) >= settings.aiCheckPerVisitorPerDay) return { ok: false, reason: "visitor" } as const;

    await tx
      .insert(freeToolCounters)
      .values([
        { day, key: "all" },
        { day, key: LEDGER_KEY },
      ])
      .onConflictDoNothing();
    const rows = await tx
      .select({
        key: freeToolCounters.key,
        microUsd: freeToolCounters.microUsd,
      })
      .from(freeToolCounters)
      .where(and(eq(freeToolCounters.day, day), inArray(freeToolCounters.key, ["all", LEDGER_KEY])))
      .orderBy(freeToolCounters.key)
      .for("update");
    const spent = rows.find((r) => r.key === "all")?.microUsd ?? 0;
    const micro = Math.round(estimateUsd * 1_000_000);
    const aiAllowed = spent + micro <= Math.floor(Math.max(0, settings.dailyBudgetUsd) * 1_000_000);
    await tx
      .update(freeToolCounters)
      .set({
        runs: sql`${freeToolCounters.runs} + 1`,
        updatedAt: new Date(),
        ...(aiAllowed ? { microUsd: sql`${freeToolCounters.microUsd} + ${micro}` } : {}),
      })
      .where(and(eq(freeToolCounters.day, day), inArray(freeToolCounters.key, aiAllowed ? ["all", LEDGER_KEY] : [LEDGER_KEY])));
    if (!aiAllowed) {
      console.warn(
        JSON.stringify({
          event: "free_tool_limit_reached",
          limit: "daily_spend",
          tool: "ai-visibility-check",
          day,
          requestedEstimatedUsd: estimateUsd,
        }),
      );
    }

    const id = newCheckId();
    await tx.insert(freeVisibilityChecks).values({
      id,
      domain: input.domain,
      country: input.country,
      language: input.language,
      email: input.email,
      surface: "public",
      ipHash: visitor,
      aiAllowed,
      reservedUsd: aiAllowed ? estimateUsd : 0,
      expiresAt: new Date(Date.now() + TTL_DAYS * 86_400_000),
    });
    return { ok: true, id, aiAllowed } as const;
  });
}

/** Counts a refused public request on the ledger (best effort, capped per IP). */
async function recordBlocked(day: string, ip: string) {
  if (!rateLimit(`free-tools:blocked:${ip}`, 20, 60_000)) return;
  try {
    await db
      .insert(freeToolCounters)
      .values(["all", LEDGER_KEY].map((key) => ({ day, key, blocked: 1 })))
      .onConflictDoUpdate({
        target: [freeToolCounters.day, freeToolCounters.key],
        set: {
          blocked: sql`${freeToolCounters.blocked} + 1`,
          updatedAt: new Date(),
        },
      });
  } catch (err) {
    console.error("[ai-check] could not record a blocked request", err);
  }
}

function turnstileHostnames(): string[] {
  try {
    return [new URL(env.appUrl).hostname.toLowerCase()];
  } catch {
    return [];
  }
}

export function publicCheckPath(id: string): string {
  return `/free-tools/ai-visibility-check/${id}`;
}

/** A recent public check of the same domain + market that can be shown instead of paying for a new one. */
async function findReusableCheck(input: CheckInput): Promise<CheckRow | null> {
  const [row] = await db
    .select()
    .from(freeVisibilityChecks)
    .where(
      and(
        eq(freeVisibilityChecks.domain, input.domain),
        eq(freeVisibilityChecks.country, input.country),
        eq(freeVisibilityChecks.surface, "public"),
        eq(freeVisibilityChecks.aiAllowed, true),
        inArray(freeVisibilityChecks.status, ["queued", "running", "completed"]),
        gte(freeVisibilityChecks.createdAt, new Date(Date.now() - REUSE_COMPLETED_MS)),
      ),
    )
    .orderBy(desc(freeVisibilityChecks.createdAt))
    .limit(1);
  if (!row) return null;
  if (row.status === "completed") return row.results?.ai.status === "completed" ? row : null;
  return row.createdAt.getTime() > Date.now() - REUSE_RUNNING_MS ? row : null;
}

/**
 * POST /api/free-tools/ai-visibility-check. Pipeline: enabled (404) → JSON ≤16 KiB (415/413/400) → input (400) →
 * same-origin (403) → per-IP rate limit shared with the other free tools (429) → Turnstile (403/503) → 24 h reuse of
 * an identical check → per-day / per-visitor caps + budget reservation (429) → insert + enqueue.
 */
export async function handleStartPublicCheck(req: Request, opts: { day?: string } = {}): Promise<Response> {
  const settings = await getSetting("freeTools");
  if (!settings.publicEnabled || !settings.aiCheckEnabled) return jsonResponse({ error: "Not found" }, 404);

  const body = await readToolBody(req);
  if (body instanceof Response) return body;
  let input: CheckInput;
  try {
    input = parseCheckInput(body, { allowEmail: true });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : "Invalid request" }, 400);
  }

  const day = opts.day ?? utcDay();
  const realIp = await clientIp(req.headers);
  if (!realIp && env.isProduction) {
    console.error("[ai-check] no client IP on a public request; refusing (check the reverse proxy headers)");
    return jsonResponse({ error: UNAVAILABLE }, 503);
  }
  const ip = ipIdentity(realIp ?? "local");
  if (!isSameOrigin(req)) {
    await recordBlocked(day, ip);
    return jsonResponse({ error: "Cross-site submissions are not allowed" }, 403);
  }
  if (!rateLimit(`free-tools:${ip}`, settings.perIpPerMinute, 60_000)) {
    await recordBlocked(day, ip);
    return jsonResponse({ error: "Too many checks. Try again in a minute." }, 429, { "Retry-After": "60" });
  }
  const secret = settings.turnstileSecretKey.trim();
  if (secret) {
    const token = (body as { turnstileToken?: unknown } | null)?.turnstileToken;
    const verdict = await verifyTurnstile({
      secret,
      token: typeof token === "string" ? token : undefined,
      ip: realIp,
      hostnames: turnstileHostnames(),
    });
    if (verdict === "unavailable") return jsonResponse({ error: UNAVAILABLE }, 503);
    if (verdict === "failed") {
      await recordBlocked(day, ip);
      return jsonResponse({ error: "Human verification failed. Refresh the page and try again." }, 403);
    }
  }

  // The report link is always shown on the page; mailing it is capped so the form can't be used to spam addresses.
  if (input.email && !rateLimit(`ai-check:email:${ip}`, 3, 86_400_000)) input = { ...input, email: null };

  try {
    const reusable = await findReusableCheck(input);
    if (reusable) {
      if (input.email) {
        if (reusable.status === "completed") await sendResultEmail(reusable, input.email);
        else if (!reusable.email) await db.update(freeVisibilityChecks).set({ email: input.email }).where(eq(freeVisibilityChecks.id, reusable.id));
      }
      return jsonResponse({
        id: reusable.id,
        url: publicCheckPath(reusable.id),
        reused: true,
      });
    }

    const estimate = estimateCheckCostUsd(MAX_ENGINES, PROMPT_COUNT);
    const reservation = await reservePublicCheck(input, visitorHash(day, ip), day, estimate);
    if (!reservation.ok) {
      await recordBlocked(day, ip);
      return jsonResponse(
        {
          error:
            reservation.reason === "visitor"
              ? "You've used today's free checks. Try again tomorrow, or sign in to track your AI visibility every day."
              : "Today's free checks are used up. Try again tomorrow, or sign in to track your AI visibility every day.",
        },
        429,
      );
    }
    await enqueueJob(VISIBILITY_CHECK_JOB, { checkId: reservation.id }, { maxAttempts: 1, priority: 40, dedupeKey: `ai-check:${reservation.id}` });
    return jsonResponse({
      id: reservation.id,
      url: publicCheckPath(reservation.id),
      reused: false,
    });
  } catch (err) {
    console.error("[ai-check] could not start a public check", err);
    return jsonResponse({ error: UNAVAILABLE }, 503);
  }
}

/* ───────────────────────────── In-app start ───────────────────────────── */

export type AppCheckActor = {
  projectId: string;
  workspaceId: string;
  userId: string;
};

/** Signed-in run from Project → SEO Tools: no public caps; costs go to the workspace and the admin budget applies. */
export async function startAppCheck(actor: AppCheckActor, raw: unknown): Promise<{ id: string }> {
  const input = parseCheckInput(raw, { allowEmail: false });
  if (!rateLimit(`ai-check:user:${actor.userId}`, 10, 3_600_000)) {
    throw new VisibilityCheckError("You've started 10 checks in the last hour. Please wait a bit.", 429);
  }
  try {
    await assertBudget(estimateCheckCostUsd(MAX_ENGINES, PROMPT_COUNT));
  } catch (err) {
    if (err instanceof BudgetExceededError) throw new VisibilityCheckError(`${err.message} Raise it in Admin → Limits.`, 429);
    throw err;
  }
  const id = newCheckId();
  await db.insert(freeVisibilityChecks).values({
    id,
    domain: input.domain,
    country: input.country,
    language: input.language,
    surface: "app",
    userId: actor.userId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    expiresAt: new Date(Date.now() + TTL_DAYS * 86_400_000),
  });
  await enqueueJob(
    VISIBILITY_CHECK_JOB,
    { checkId: id },
    {
      maxAttempts: 1,
      priority: 40,
      dedupeKey: `ai-check:${id}`,
      workspaceId: actor.workspaceId,
      createdBy: actor.userId,
    },
  );
  return { id };
}

/* ───────────────────────────── Read ───────────────────────────── */

export function toCheckView(row: CheckRow): VisibilityCheckView {
  return {
    id: row.id,
    domain: row.domain,
    country: row.country,
    language: row.language,
    status: row.status,
    step: row.step,
    progress: row.progress ?? null,
    brand: row.brand ?? null,
    prompts: row.prompts ?? [],
    readiness: row.readiness ?? null,
    results: row.results ?? null,
    score: row.score,
    readinessScore: row.readinessScore,
    visibilityScore: row.visibilityScore,
    error: row.error,
    emailRequested: Boolean(row.email),
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
    expiresAt: row.expiresAt.toISOString(),
  };
}

const CHECK_ID_RE = /^fvc_[A-Za-z0-9_-]{16,40}$/;

/** A check by its capability id (null when unknown or expired). */
export async function getCheckRow(id: string): Promise<CheckRow | null> {
  if (!CHECK_ID_RE.test(id)) return null;
  const [row] = await db.select().from(freeVisibilityChecks).where(eq(freeVisibilityChecks.id, id)).limit(1);
  if (!row || row.expiresAt.getTime() < Date.now()) return null;
  return row;
}

/** A check started from this project (in-app pages are scoped by project). */
export async function getProjectCheck(projectId: string, id: string): Promise<CheckRow | null> {
  const row = await getCheckRow(id);
  return row && row.projectId === projectId ? row : null;
}

export async function listProjectChecks(projectId: string, limit = 10) {
  return db
    .select({
      id: freeVisibilityChecks.id,
      domain: freeVisibilityChecks.domain,
      country: freeVisibilityChecks.country,
      status: freeVisibilityChecks.status,
      score: freeVisibilityChecks.score,
      readinessScore: freeVisibilityChecks.readinessScore,
      visibilityScore: freeVisibilityChecks.visibilityScore,
      convertedProjectId: freeVisibilityChecks.convertedProjectId,
      createdAt: freeVisibilityChecks.createdAt,
    })
    .from(freeVisibilityChecks)
    .where(and(eq(freeVisibilityChecks.projectId, projectId), gte(freeVisibilityChecks.expiresAt, new Date())))
    .orderBy(desc(freeVisibilityChecks.createdAt))
    .limit(limit);
}

/* ───────────────────────────── Convert to a project ───────────────────────────── */

/**
 * "Track this daily": creates a project prefilled with the check's brand, competitors, prompts and engines (daily
 * tracking). The caller must have checked `projects.manage` in the workspace. Idempotent per check.
 */
export async function createProjectFromCheck(input: {
  checkId: string;
  workspaceId: string;
  user: { id: string; email: string };
}): Promise<{ projectId: string; created: boolean }> {
  const row = await getCheckRow(input.checkId);
  if (!row) throw new VisibilityCheckError("This check doesn't exist or has expired.", 404);
  if (row.status !== "completed") throw new VisibilityCheckError("Wait until the check has finished.", 409);
  if (row.convertedProjectId) {
    // Reuse the earlier conversion only when it lives in the requested workspace.
    const [prev] = await db.select({ workspaceId: projects.workspaceId, archived: projects.archived }).from(projects).where(eq(projects.id, row.convertedProjectId)).limit(1);
    if (prev && prev.workspaceId === input.workspaceId && !prev.archived) return { projectId: row.convertedProjectId, created: false };
  }
  const brand = row.brand;
  const engines = [...new Set((row.results?.ai.engines ?? []).filter((e) => e.answers > 0).map((e) => e.engine))].filter((id) => getEngine(id));
  const project = await createProject({
    workspaceId: input.workspaceId,
    name: brand?.name ?? row.domain,
    domain: row.domain,
    country: row.country,
    language: row.language,
    description: brand?.description || null,
    logoUrl: brand?.logoUrl && /^https:\/\//.test(brand.logoUrl) ? brand.logoUrl : null,
    brand: brand
      ? {
          aliases: brand.aliases,
          domains: [],
          description: brand.description || undefined,
          industry: brand.industry || undefined,
        }
      : undefined,
    engines: engines.length ? engines : undefined,
    trackingFrequency: "daily",
    competitors: (brand?.competitors ?? []).filter((c) => c.domain !== row.domain).map((c) => ({ name: c.name, domain: c.domain })),
    prompts: row.prompts.map((p) => ({
      text: p.text,
      topic: p.topic,
      funnelStage: p.funnelStage,
      branded: brand ? p.text.toLowerCase().includes(brand.name.toLowerCase()) : false,
      tags: p.topic ? [p.topic] : [],
    })),
    createdBy: input.user,
  });
  await db.update(freeVisibilityChecks).set({ convertedProjectId: project.id }).where(eq(freeVisibilityChecks.id, row.id));
  return { projectId: project.id, created: true };
}

/* ───────────────────────────── Job ───────────────────────────── */

async function setProgress(
  id: string,
  step: VisibilityCheckStep,
  label: string,
  extra: Partial<CheckProgress> = {},
  patch: Partial<typeof freeVisibilityChecks.$inferInsert> = {},
) {
  await db
    .update(freeVisibilityChecks)
    .set({ step, progress: { step, label, ...extra }, ...patch })
    .where(eq(freeVisibilityChecks.id, id));
}

type EngineCandidate = {
  id: string;
  name: string;
  provider: EngineProvider | null;
  simulated: boolean;
};

/** Configured engines in the admin's order (or the default order), real answers before simulated ones. */
async function pickEngines(workspaceId: string | null): Promise<EngineCandidate[]> {
  const [settings, avail] = await Promise.all([getSetting("freeTools"), getEngineAvailability({ workspaceId })]);
  const usable = avail.filter((a: EngineAvailability) => a.configured && a.provider);
  const wanted = settings.aiCheckEngines.filter((id) => getEngine(id));
  const order = wanted.length ? wanted : [...DEFAULT_ENGINE_ORDER, ...ENGINES.map((e) => e.id).filter((id) => !DEFAULT_ENGINE_ORDER.includes(id))];
  const list: EngineCandidate[] = [];
  for (const id of order) {
    const a = usable.find((x) => x.id === id);
    if (a)
      list.push({
        id: a.id,
        name: a.name,
        provider: a.provider,
        simulated: a.simulated || a.provider === "ai",
      });
  }
  return [...list.filter((e) => !e.simulated), ...list.filter((e) => e.simulated)];
}

function aiScope(row: CheckRow) {
  return {
    workspaceId: row.workspaceId,
    projectId: row.projectId,
    userId: row.userId,
  };
}

/** Prefers unbranded buyer prompts (branded ones inflate visibility). */
function pickPrompts(
  list: Array<{
    text: string;
    topic: string;
    funnelStage: CheckPrompt["funnelStage"];
    branded: boolean;
  }>,
  brandName: string,
): CheckPrompt[] {
  const name = brandName.toLowerCase();
  const unbranded = list.filter((p) => !p.branded && !p.text.toLowerCase().includes(name));
  const rest = list.filter((p) => !unbranded.includes(p));
  return [...unbranded, ...rest].slice(0, PROMPT_COUNT).map((p) => ({ text: p.text, topic: p.topic, funnelStage: p.funnelStage }));
}

async function collectAnswers(
  row: CheckRow,
  brand: CheckBrand,
  prompts: CheckPrompt[],
  candidates: EngineCandidate[],
): Promise<{
  answers: CheckAnswer[];
  engines: Array<EngineCandidate & { error: string | null }>;
}> {
  const defs = buildBrandDefs(row.domain, brand);
  const deadline = Date.now() + ANSWERS_DEADLINE_MS;
  const queue = [...candidates];
  const answers: CheckAnswer[] = [];
  const used: Array<EngineCandidate & { error: string | null }> = [];
  const total = Math.min(MAX_ENGINES, candidates.length) * prompts.length;
  let done = 0;
  const tick = () =>
    setProgress(row.id, "answers", "Asking AI engines", {
      answersDone: done,
      answersTotal: total,
    }).catch(() => {});

  const runEngine = async (engine: EngineCandidate): Promise<number> => {
    const record = { ...engine, error: null as string | null };
    used.push(record);
    let ok = 0;
    for (let i = 0; i < prompts.length; i++) {
      if (Date.now() > deadline) {
        record.error = record.error ?? "Stopped: the check took too long.";
        break;
      }
      try {
        const res = await answerPrompt({
          engine: engine.id as Parameters<typeof answerPrompt>[0]["engine"],
          prompt: prompts[i]!.text,
          country: row.country,
          language: row.language,
          // Public checks have no project/workspace: usage is recorded without one, agents must be shared.
          project: {
            id: row.projectId ?? "",
            workspaceId: row.workspaceId ?? "",
            name: brand.name,
            domain: row.domain,
          },
          userId: row.userId,
          // Resolved once in pickEngines (same provider for every prompt of this engine).
          provider: engine.provider ?? undefined,
        });
        const scored = scoreAnswerText(res.text, res.citations, defs);
        const simulated = res.provider === "ai" || res.raw?.simulated === true;
        answers.push({
          engine: engine.id,
          promptIndex: i,
          provider: res.provider,
          model: res.model,
          simulated,
          noAnswer: !res.text.trim() || res.raw?.noAiAnswer === true,
          ...scored,
          excerpt: res.text.length > EXCERPT_CHARS ? `${res.text.slice(0, EXCERPT_CHARS).trimEnd()}…` : res.text,
          costUsd: res.costUsd,
        });
        ok += 1;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        record.error = message.slice(0, 300);
        console.warn(`[ai-check] ${engine.id} failed for ${row.id}: ${message}`);
        // Not configured / offline: this engine can't answer at all → hand over to the next candidate.
        // An empty answer ("no_answer") only concerns this prompt.
        if (err instanceof EngineUnavailableError && err.code !== "no_answer") break;
      }
      done += 1;
      await tick();
    }
    return ok;
  };

  await tick();
  await Promise.all(
    Array.from({ length: Math.min(MAX_ENGINES, queue.length) }, async () => {
      while (queue.length && Date.now() < deadline) {
        const engine = queue.shift()!;
        const ok = await runEngine(engine);
        if (ok > 0) return;
      }
    }),
  );
  return { answers, engines: used };
}

const actionsSchema = z.object({
  actions: z
    .array(
      z.object({
        title: z.string().describe("Imperative, max 8 words"),
        detail: z.string().describe("2-3 sentences: what to do and why, citing the measured numbers"),
        impact: z.enum(["high", "medium", "low"]),
        effort: z.enum(["low", "medium", "high"]),
        category: z.enum(["content", "mentions", "technical", "structured-data", "crawlers"]),
      }),
    )
    .min(1)
    .max(5),
});

async function writeActions(
  row: CheckRow,
  brand: CheckBrand | null,
  readiness: ReadinessResult,
  ai: CheckResults["ai"],
  fallback: CheckAction[],
): Promise<CheckAction[] | null> {
  const market = getCountry(row.country)?.name ?? row.country;
  const findings = readiness.findings.filter((f) => f.severity !== "pass").slice(0, 8);
  const v = ai.visibility;
  const prompt = [
    `You are a GEO (generative engine optimization) consultant. Write the 3 highest-impact actions for ${brand?.name ?? row.domain} (${row.domain}, market: ${market}) to get recommended more often by AI assistants.`,
    "",
    `AI readiness score: ${readiness.score}/100. Open findings:`,
    ...(findings.length ? findings.map((f) => `- [${f.severity}] ${f.title}: ${f.detail}`) : ["- none"]),
    "",
    v
      ? `AI answers measured: ${v.answers} answers on ${ai.engines
          .filter((e) => e.answers)
          .map((e) => e.name)
          .join(", ")}. Brand named in ${v.mentionRate}% (avg position ${v.avgPosition ?? "n/a"}), own site cited in ${v.citationRate}%.`
      : "No AI answers could be collected.",
    ...(ai.brands.length
      ? ["Brands named (share of answers): " + ai.brands.map((b) => `${b.name}${b.isOwn ? " (you)" : ""} ${b.mentionRate}%`).join(", ")]
      : []),
    ...(ai.sources.length
      ? [
          "Most cited sources: " +
            ai.sources
              .slice(0, 8)
              .map((s) => `${s.domain} (${s.answers})`)
              .join(", "),
        ]
      : []),
    ...(row.prompts.length ? ["Buyer prompts asked: " + row.prompts.map((p) => `“${p.text}”`).join("; ")] : []),
    "",
    "Candidate actions derived from the checks (you may refine or replace them):",
    ...fallback.map((a) => `- ${a.title}: ${a.detail}`),
    "",
    "Rules: exactly 3 actions, ordered by expected impact. Be specific to this site and the data above; cite the measured numbers or domains. Never invent facts, statistics, URLs or sources that are not in the data. Write in English.",
  ].join("\n");
  try {
    const res = await runLlm({
      purpose: "free_tools.ai_check_actions",
      prompt,
      schema: actionsSchema,
      effort: "low",
      maxTokens: 2000,
      ...aiScope(row),
    });
    return res.data.actions.slice(0, 3).map((a) => ({
      ...a,
      title: a.title.trim().slice(0, 120),
      detail: a.detail.trim().slice(0, 700),
    }));
  } catch (err) {
    if (!(err instanceof AiNotConfiguredError)) console.warn(`[ai-check] actions failed for ${row.id}:`, err instanceof Error ? err.message : err);
    return null;
  }
}

function emptyAi(status: CheckResults["ai"]["status"], reason: string | null): CheckResults["ai"] {
  return {
    status,
    reason,
    engines: [],
    answers: [],
    brands: [],
    sources: [],
    visibility: null,
    simulatedShare: 0,
  };
}

function notConfiguredReason(row: CheckRow): string {
  return row.surface === "app"
    ? "No AI provider is configured. Add an API key in Admin → AI Providers or connect a local agent, and configure engines in Admin → AI Providers → Engines."
    : "AI answers aren't available on this instance right now — the readiness checks below ran without them.";
}

/** Job body. Never retried (billed calls); every step persists its result so the report fills in live. */
export async function runVisibilityCheck(checkId: string): Promise<CheckRow | null> {
  const [initial] = await db.select().from(freeVisibilityChecks).where(eq(freeVisibilityChecks.id, checkId)).limit(1);
  if (!initial || !["queued", "running"].includes(initial.status)) return initial ?? null;
  let row: CheckRow = initial;
  await db
    .update(freeVisibilityChecks)
    .set({
      status: "running",
      startedAt: new Date(),
      error: null,
      step: "readiness",
      progress: { step: "readiness", label: "Checking AI readiness" },
    })
    .where(eq(freeVisibilityChecks.id, checkId));

  try {
    // 1) AI readiness (deterministic, free)
    let readiness: ReadinessResult;
    try {
      readiness = await runReadinessCheck(row.domain);
    } catch (err) {
      if (err instanceof CrawlTargetBlockedError) throw new Error("This address points to a private or internal network and can't be checked.");
      throw err;
    }
    await db.update(freeVisibilityChecks).set({ readiness, readinessScore: readiness.score }).where(eq(freeVisibilityChecks.id, checkId));

    // 2) AI answers
    let ai: CheckResults["ai"];
    let brand: CheckBrand | null = null;
    let aiUsable = row.aiAllowed;
    /** An LLM call succeeded (for the ledger: its cost isn't reported, so the per-check overhead estimate is charged). */
    let llmUsed = false;
    if (!row.aiAllowed) {
      ai = emptyAi("budget", "Today's free AI answer budget is used up, so only the readiness checks ran. Try again tomorrow for the AI answers.");
    } else {
      try {
        await setProgress(checkId, "brand", "Understanding your brand");
        const profile = await suggestBrandProfile({
          domain: row.domain,
          country: row.country,
          language: row.language,
          ...aiScope(row),
        });
        llmUsed = true;
        const country = getCountry(row.country);
        const language = country?.languages.includes(profile.language) ? profile.language : row.language;

        await setProgress(checkId, "competitors", "Finding your competitors");
        let competitors: CheckBrand["competitors"] = [];
        try {
          competitors = (
            await suggestCompetitors({
              domain: row.domain,
              brandName: profile.name,
              description: profile.description,
              country: row.country,
              language,
              count: COMPETITOR_COUNT,
              ...aiScope(row),
            })
          ).map((c) => ({ name: c.name, domain: c.domain }));
        } catch (err) {
          if (err instanceof AiNotConfiguredError) throw err;
          console.warn(`[ai-check] competitor discovery failed for ${checkId}:`, err instanceof Error ? err.message : err);
        }
        brand = {
          name: profile.name,
          description: profile.description,
          industry: profile.industry,
          aliases: profile.aliases,
          logoUrl: profile.logoUrl,
          language,
          competitors,
        };
        await db.update(freeVisibilityChecks).set({ brand, language }).where(eq(freeVisibilityChecks.id, checkId));

        await setProgress(checkId, "prompts", "Writing buyer prompts");
        const suggested = await suggestPrompts({
          brandName: profile.name,
          domain: row.domain,
          description: profile.description,
          competitors: competitors.map((c) => c.name),
          country: row.country,
          language,
          count: PROMPT_COUNT + 3,
          ...aiScope(row),
        });
        const prompts = pickPrompts(suggested, profile.name);
        const [withPrompts] = await db.update(freeVisibilityChecks).set({ prompts, language }).where(eq(freeVisibilityChecks.id, checkId)).returning();
        if (withPrompts) row = withPrompts;

        const candidates = await pickEngines(row.workspaceId);
        if (!candidates.length || !prompts.length) {
          ai = emptyAi(
            "unavailable",
            !prompts.length
              ? "No buyer prompts could be generated for this site."
              : row.surface === "app"
                ? "No AI engine is configured. Connect DataForSEO or engine API keys in Admin → AI Providers."
                : "No AI engines are connected on this instance right now — the readiness checks below ran without them.",
          );
        } else {
          const { answers, engines } = await collectAnswers(row, brand, prompts, candidates);
          const defs = buildBrandDefs(row.domain, brand);
          const domains: Record<string, string | null> = {
            own: row.domain,
            ...Object.fromEntries(brand.competitors.map((c, i) => [`c${i}`, c.domain])),
          };
          const summaries: EngineSummary[] = engines.map((e) => engineSummary(e, answers, defs));
          const planned = Math.min(MAX_ENGINES, candidates.length) * prompts.length;
          ai = {
            status: answers.length === 0 ? "unavailable" : answers.length < planned ? "partial" : "completed",
            reason:
              answers.length === 0
                ? "None of the connected AI engines returned an answer. " + (engines.find((e) => e.error)?.error ?? "")
                : answers.length < planned
                  ? `${answers.length} of ${planned} answers were collected; some engines failed.`
                  : null,
            engines: summaries,
            answers,
            brands: brandStats(answers, defs, domains),
            sources: topSources(answers, defs),
            visibility: summarizeVisibility(answers),
            simulatedShare: answers.length ? Math.round((answers.filter((a) => a.simulated).length / answers.length) * 100) : 0,
          };
        }
      } catch (err) {
        if (err instanceof AiNotConfiguredError) {
          aiUsable = false;
          ai = emptyAi("unavailable", notConfiguredReason(row));
        } else if (err instanceof BudgetExceededError) {
          aiUsable = false;
          ai = emptyAi("budget", "The instance's AI budget is used up, so only the readiness checks ran.");
        } else {
          console.error(`[ai-check] AI part failed for ${checkId}`, err);
          ai = emptyAi("unavailable", "The AI part of the check failed. The readiness checks below are complete.");
        }
      }
    }

    // 3) Actions
    await setProgress(checkId, "actions", "Prioritizing actions");
    const fallback = ruleActions(readiness, ai.visibility ? ai : null);
    const written = aiUsable ? await writeActions(row, brand, readiness, ai, fallback) : null;
    if (written) llmUsed = true;
    // AI-written actions first; fill up to 3 with the rule-based ones when the model returned fewer.
    const actions = written?.length ? [...written, ...fallback.filter((f) => !written.some((w) => w.category === f.category && w.title === f.title))].slice(0, 3) : fallback;

    const visibility = ai.visibility?.score ?? null;
    const results: CheckResults = {
      ai,
      actions,
      actionsSource: written?.length ? "ai" : "rules",
      scores: {
        readiness: readiness.score,
        visibility,
        overall: overallScore(readiness.score, visibility),
      },
    };
    const costUsd = Math.round(ai.answers.reduce((a, x) => a + x.costUsd, 0) * 1e6) / 1e6;
    const [done] = await db
      .update(freeVisibilityChecks)
      .set({
        status: "completed",
        step: "done",
        progress: { step: "done", label: "Done" },
        results,
        score: results.scores.overall,
        visibilityScore: visibility,
        costUsd,
        completedAt: new Date(),
      })
      .where(eq(freeVisibilityChecks.id, checkId))
      .returning();
    row = done ?? row;
    if (row.surface === "public" && row.aiAllowed) await reconcileLedger(row, costUsd + (llmUsed ? EST_USD_LLM_OVERHEAD : 0));
    if (row.email) await sendResultEmail(row, row.email);
    return row;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[ai-check] ${checkId} failed`, err);
    const [failed] = await db
      .update(freeVisibilityChecks)
      .set({
        status: "failed",
        error: message.slice(0, 500),
        completedAt: new Date(),
      })
      .where(eq(freeVisibilityChecks.id, checkId))
      .returning();
    return failed ?? null;
  }
}

/**
 * Replaces the start-time reservation on the day's ledger with the spend the providers reported (+ the LLM overhead
 * estimate when an LLM answered). Unused reservations — e.g. no AI provider configured — go back to the shared daily
 * budget; overruns are added. Failed checks keep their reservation.
 */
async function reconcileLedger(row: CheckRow, spentUsd: number) {
  const day = utcDay(row.createdAt);
  const micro = Math.round((spentUsd - row.reservedUsd) * 1_000_000);
  if (micro === 0) return;
  try {
    await db
      .update(freeToolCounters)
      .set({ microUsd: sql`greatest(0, ${freeToolCounters.microUsd} + ${micro})`, updatedAt: new Date() })
      .where(and(eq(freeToolCounters.day, day), inArray(freeToolCounters.key, ["all", LEDGER_KEY])));
    await db.update(freeVisibilityChecks).set({ reservedUsd: Math.round(spentUsd * 1e6) / 1e6 }).where(eq(freeVisibilityChecks.id, row.id));
  } catch (err) {
    console.error("[ai-check] could not reconcile the spend ledger", err);
  }
}

function resultUrl(row: CheckRow): string {
  return row.surface === "app" && row.projectId ? appUrl(`/p/${row.projectId}/seo/tools/ai-visibility-check/${row.id}`) : appUrl(publicCheckPath(row.id));
}

async function sendResultEmail(row: CheckRow, to: string) {
  const general = await getSetting("general");
  const r = row.readinessScore;
  const v = row.visibilityScore;
  const mail = await simpleEmail({
    subject: `Your AI visibility check for ${row.domain}`,
    heading: `AI visibility check: ${row.domain}`,
    body: [
      `Your report is ready.`,
      r !== null ? `AI readiness: ${r}/100` : null,
      v !== null ? `AI visibility: ${v}/100` : "AI visibility: not measured (see the report for details)",
      "",
      `The report lists how AI assistants answer buyer questions in your market, which competitors they name, the sources they cite and the three actions with the highest impact.`,
      `The link stays valid for ${TTL_DAYS} days. You received this email because someone entered this address in the free check on ${general.appName}; we don't use it for anything else.`,
    ]
      .filter((l): l is string => l !== null)
      .join("\n"),
    cta: { label: "View your report", url: resultUrl(row) },
  });
  const res = await sendMail({ to, ...mail });
  if (res.delivered || res.transport === "log") {
    await db.update(freeVisibilityChecks).set({ emailSentAt: new Date() }).where(eq(freeVisibilityChecks.id, row.id));
  } else {
    console.warn(`[ai-check] result email for ${row.id} not delivered: ${res.error ?? "unknown error"}`);
  }
}

/* ───────────────────────────── Maintenance + admin ───────────────────────────── */

/** Deletes expired checks (incl. their emails). */
export async function purgeExpiredChecks(): Promise<number> {
  const rows = await db.delete(freeVisibilityChecks).where(lt(freeVisibilityChecks.expiresAt, new Date())).returning({ id: freeVisibilityChecks.id });
  return rows.length;
}

/** Fails checks whose job died (process restart) so the report stops polling. */
export async function failStaleChecks(): Promise<number> {
  const rows = await db
    .update(freeVisibilityChecks)
    .set({
      status: "failed",
      error: "The check was interrupted. Please start it again.",
      completedAt: new Date(),
    })
    .where(and(inArray(freeVisibilityChecks.status, ["queued", "running"]), lt(freeVisibilityChecks.updatedAt, new Date(Date.now() - 20 * 60_000))))
    .returning({ id: freeVisibilityChecks.id });
  return rows.length;
}

export type VisibilityCheckStats = {
  day: string;
  publicChecks: number;
  appChecks: number;
  completed: number;
  failed: number;
  running: number;
  converted: number;
  costUsd: number;
  reservedUsd: number;
  estimatePerCheckUsd: number;
  limits: {
    enabled: boolean;
    publicEnabled: boolean;
    maxPerDay: number;
    perVisitorPerDay: number;
    dailyBudgetUsd: number;
  };
};

/** Today's check usage for Admin → Free tools. */
export async function getVisibilityCheckStats(day = utcDay()): Promise<VisibilityCheckStats> {
  const settings = await getSetting("freeTools");
  const since = new Date(`${day}T00:00:00Z`);
  const [agg] = await db
    .select({
      publicChecks: sql<number>`count(*) filter (where ${freeVisibilityChecks.surface} = 'public')::int`,
      appChecks: sql<number>`count(*) filter (where ${freeVisibilityChecks.surface} = 'app')::int`,
      completed: sql<number>`count(*) filter (where ${freeVisibilityChecks.status} = 'completed')::int`,
      failed: sql<number>`count(*) filter (where ${freeVisibilityChecks.status} = 'failed')::int`,
      running: sql<number>`count(*) filter (where ${freeVisibilityChecks.status} in ('queued', 'running'))::int`,
      converted: sql<number>`count(*) filter (where ${freeVisibilityChecks.convertedProjectId} is not null)::int`,
      costUsd: sql<number>`coalesce(sum(${freeVisibilityChecks.costUsd}), 0)::float8`,
      reservedUsd: sql<number>`coalesce(sum(${freeVisibilityChecks.reservedUsd}), 0)::float8`,
    })
    .from(freeVisibilityChecks)
    .where(gte(freeVisibilityChecks.createdAt, since));
  return {
    day,
    publicChecks: agg?.publicChecks ?? 0,
    appChecks: agg?.appChecks ?? 0,
    completed: agg?.completed ?? 0,
    failed: agg?.failed ?? 0,
    running: agg?.running ?? 0,
    converted: agg?.converted ?? 0,
    costUsd: Number(agg?.costUsd ?? 0),
    reservedUsd: Number(agg?.reservedUsd ?? 0),
    estimatePerCheckUsd: estimateCheckCostUsd(MAX_ENGINES, PROMPT_COUNT),
    limits: {
      enabled: settings.aiCheckEnabled,
      publicEnabled: settings.publicEnabled,
      maxPerDay: settings.aiCheckMaxPerDay,
      perVisitorPerDay: settings.aiCheckPerVisitorPerDay,
      dailyBudgetUsd: settings.dailyBudgetUsd,
    },
  };
}
