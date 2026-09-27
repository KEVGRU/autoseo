"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db/client";
import { contentPersonas, contentPieces, optimizeTasks, CONTENT_STATUSES } from "@/server/db/schema";
import { actionProject, ActionError, runAction } from "@/server/auth/guards";
import { availableLlmProviders } from "@/server/ai/llm";
import { parsePublicUrl, UnsafeUrlError } from "@/server/optimize/net";
import {
  contentJobState,
  createContent,
  deleteContent,
  getContent,
  listPersonas,
  saveContent,
} from "@/server/optimize/content/service";
import { enqueueContentGeneration, enqueuePersonaGeneration, enqueueUrlOptimization } from "@/server/optimize/content/jobs";
import { insertLibraryPersonas } from "@/server/optimize/content/personas";
import { extractEntities, generateFaqs, generateMeta } from "@/server/optimize/content/assist";
import { addTaskActivity } from "@/server/optimize/tasks/activity";
import { enqueueCitationRewrite, enqueueClaimCheck } from "@/server/optimize/content/claims";
import { generateSchemaMarkup } from "@/server/optimize/content/schema-generator";
import { SCHEMA_TYPES } from "@/server/optimize/content/schema-ld";

const pid = z.string().min(1).max(64);
const cid = z.string().min(1).max(64);

async function hasAi() {
  return (await availableLlmProviders().catch(() => [])).length > 0;
}

async function assertPersonaInProject(projectId: string, personaId: string) {
  const [p] = await db
    .select({ id: contentPersonas.id })
    .from(contentPersonas)
    .where(and(eq(contentPersonas.id, personaId), eq(contentPersonas.projectId, projectId)))
    .limit(1);
  if (!p) throw new ActionError("Persona not found.", "not_found");
}

const NO_AI = "No AI provider is available. Connect a local agent (Local Agents) or add an API key in Admin → AI Providers.";

/** "Ground in" picker: all connected knowledge sources, a selection, or none. */
const groundingSchema = z.object({ mode: z.enum(["all", "selected", "none"]), sourceIds: z.array(z.string().max(64)).max(50).optional() });

const generateSchema = z.object({
  target: z.string().trim().min(3, "Enter a topic or question").max(400),
  keyword: z.string().trim().max(120).optional().default(""),
  contentType: z.enum(["article", "guide", "comparison", "listicle", "how-to", "faq", "product"]).default("article"),
  wordCount: z.number().int().min(400).max(4000).default(1500),
  personaId: z.string().max(64).nullable().default(null),
  language: z.string().min(2).max(8).optional(),
  includeFaq: z.boolean().default(true),
  tone: z.string().max(120).optional().default(""),
  instructions: z.string().max(2000).optional().default(""),
  grounding: groundingSchema.nullable().optional(),
});

export async function generateContentAction(projectId: string, input: z.input<typeof generateSchema>) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), "prompts.manage");
    const data = generateSchema.parse(input);
    if (!(await hasAi())) throw new ActionError(NO_AI, "invalid");
    if (data.personaId) await assertPersonaInProject(ctx.project.id, data.personaId);
    const row = await createContent(
      ctx.project.id,
      {
        title: data.target,
        status: "generating",
        targetPrompt: data.target,
        targetKeyword: data.keyword || null,
        topic: data.keyword || data.target,
        language: data.language ?? ctx.project.language,
        personaId: data.personaId,
        generationStage: "queued",
        brief: { wordCount: data.wordCount },
        grounding: data.grounding ?? null,
      },
      ctx.user.id,
    );
    await enqueueContentGeneration(
      ctx.project.id,
      row.id,
      { contentType: data.contentType, wordCount: data.wordCount, includeFaq: data.includeFaq, tone: data.tone || undefined, instructions: data.instructions || undefined },
      ctx.user.id,
    );
    return { id: row.id };
  });
}

export async function createBlankContentAction(projectId: string, input: { title: string; targetPrompt?: string; keyword?: string }) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), "prompts.manage");
    const data = z
      .object({ title: z.string().trim().min(3).max(300), targetPrompt: z.string().trim().max(400).optional(), keyword: z.string().trim().max(120).optional() })
      .parse(input);
    const row = await createContent(
      ctx.project.id,
      { title: data.title, targetPrompt: data.targetPrompt || null, targetKeyword: data.keyword || null, language: ctx.project.language },
      ctx.user.id,
    );
    return { id: row.id };
  });
}

const optimizeSchema = z.object({
  url: z.string().trim().min(4).max(2000),
  keyword: z.string().trim().max(120).optional().default(""),
  targetPrompt: z.string().trim().max(400).optional().default(""),
  rewrite: z.boolean().default(true),
});

export async function optimizeUrlAction(projectId: string, input: z.input<typeof optimizeSchema>) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), "prompts.manage");
    const data = optimizeSchema.parse(input);
    let url: URL;
    try {
      url = parsePublicUrl(/^https?:\/\//i.test(data.url) ? data.url : `https://${data.url}`);
    } catch (err) {
      throw new ActionError(err instanceof UnsafeUrlError ? err.message : "Enter a valid public URL.", "invalid");
    }
    const row = await createContent(
      ctx.project.id,
      {
        title: url.hostname + url.pathname,
        kind: "rewrite",
        status: "generating",
        sourceUrl: url.toString(),
        targetKeyword: data.keyword || null,
        targetPrompt: data.targetPrompt || null,
        language: ctx.project.language,
        generationStage: "queued",
      },
      ctx.user.id,
    );
    await enqueueUrlOptimization(ctx.project.id, row.id, data.rewrite, ctx.user.id);
    return { id: row.id, rewrite: data.rewrite && (await hasAi()) };
  });
}

export async function createContentFromTaskAction(projectId: string, taskId: string) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), "prompts.manage");
    const [task] = await db
      .select()
      .from(optimizeTasks)
      .where(and(eq(optimizeTasks.projectId, ctx.project.id), eq(optimizeTasks.id, z.string().max(64).parse(taskId))))
      .limit(1);
    if (!task) throw new ActionError("Task not found.", "not_found");
    const plan = task.contentPlan ?? {};
    const target = plan.targetPrompt ?? task.targetPrompts[0] ?? plan.workingTitle ?? task.title;
    const ai = await hasAi();
    const outline = plan.outline ?? [];
    const row = await createContent(
      ctx.project.id,
      {
        title: plan.workingTitle ?? target,
        status: ai ? "generating" : "draft",
        targetPrompt: target,
        targetKeyword: plan.targetKeyword ?? null,
        topic: plan.targetKeyword ?? target,
        language: ctx.project.language,
        taskId: task.id,
        generationStage: ai ? "queued" : null,
        brief: {
          outline,
          questions: plan.questions ?? [],
          entities: plan.entities ?? [],
          wordCount: plan.wordCount ?? 1500,
          notes: plan.notes,
          angle: plan.format,
        },
        body: ai ? "" : outline.map((h) => `## ${h}\n\n`).join(""),
      },
      ctx.user.id,
    );
    if (ai) await enqueueContentGeneration(ctx.project.id, row.id, { contentType: plan.format ?? "article", wordCount: plan.wordCount ?? 1500, includeFaq: true }, ctx.user.id);
    await addTaskActivity({ taskId: task.id, projectId: ctx.project.id, kind: "edited", userId: ctx.user.id, body: `Content draft created: ${row.title}`, meta: { contentId: row.id } });
    return { id: row.id, generating: ai };
  });
}

const faqSchema = z.object({ question: z.string().max(500), answer: z.string().max(3000) });
const entitySchema = z.object({ name: z.string().max(200), type: z.string().max(80).optional(), sameAs: z.string().max(500).nullable().optional(), mentions: z.number().optional() });
const citationSchema = z.object({
  url: z.string().max(2000),
  title: z.string().max(500).nullable().optional(),
  note: z.string().max(1000).nullable().optional(),
  type: z.enum(["web", "internal"]).optional(),
  sourceId: z.string().max(64).nullable().optional(),
  sourceKind: z.string().max(20).nullable().optional(),
});

const patchSchema = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  body: z.string().max(400_000).optional(),
  status: z.enum(CONTENT_STATUSES).exclude(["generating"]).optional(),
  targetPrompt: z.string().trim().max(400).nullable().optional(),
  targetKeyword: z.string().trim().max(120).nullable().optional(),
  metaTitle: z.string().max(300).nullable().optional(),
  metaDescription: z.string().max(600).nullable().optional(),
  slug: z.string().max(200).nullable().optional(),
  schemaJsonLd: z.string().max(100_000).nullable().optional(),
  faqs: z.array(faqSchema).max(30).optional(),
  entities: z.array(entitySchema).max(60).optional(),
  citations: z.array(citationSchema).max(60).optional(),
  personaId: z.string().max(64).nullable().optional(),
  grounding: groundingSchema.nullable().optional(),
});

export async function saveContentAction(projectId: string, contentId: string, patch: z.input<typeof patchSchema>) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), "prompts.manage");
    const data = patchSchema.parse(patch);
    if (data.personaId) await assertPersonaInProject(ctx.project.id, data.personaId);
    return saveContent(ctx.project.id, cid.parse(contentId), data, ctx.user.id);
  });
}

export async function deleteContentAction(projectId: string, ids: string[]) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), "prompts.manage");
    await deleteContent(ctx.project.id, z.array(cid).min(1).max(200).parse(ids));
    return true;
  });
}

export async function retryContentAction(projectId: string, contentId: string) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), "prompts.manage");
    const row = await getContent(ctx.project.id, cid.parse(contentId));
    if (!row) throw new ActionError("Content not found.", "not_found");
    if (row.status === "generating") return true;
    if (row.kind === "rewrite" && row.sourceUrl) {
      await db.update(contentPieces).set({ status: "generating", generationStage: "queued", error: null }).where(eq(contentPieces.id, row.id));
      await enqueueUrlOptimization(ctx.project.id, row.id, true, ctx.user.id);
    } else {
      if (!(await hasAi())) throw new ActionError(NO_AI, "invalid");
      await db.update(contentPieces).set({ status: "generating", generationStage: "queued", error: null }).where(eq(contentPieces.id, row.id));
      await enqueueContentGeneration(ctx.project.id, row.id, { wordCount: row.brief?.wordCount ?? 1500 }, ctx.user.id);
    }
    return true;
  });
}

export async function contentStateAction(projectId: string, contentId: string) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId));
    return contentJobState(ctx.project.id, cid.parse(contentId));
  });
}

const assistInput = z.object({
  title: z.string().max(300),
  body: z.string().min(20, "Write some content first").max(400_000),
  targetPrompt: z.string().max(400).nullable().optional(),
  targetKeyword: z.string().max(120).nullable().optional(),
});

export async function assistContentAction(projectId: string, kind: "faqs" | "entities" | "meta", input: z.input<typeof assistInput>) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), "prompts.manage");
    const data = assistInput.parse(input);
    const c = { projectId: ctx.project.id, workspaceId: ctx.project.workspaceId, language: ctx.project.language };
    const k = z.enum(["faqs", "entities", "meta"]).parse(kind);
    if (k === "faqs") return { kind: k, ...(await generateFaqs({ title: data.title, body: data.body, targetPrompt: data.targetPrompt ?? null }, c)) };
    if (k === "entities") return { kind: k, ...(await extractEntities({ title: data.title, body: data.body }, c)) };
    return { kind: k, ...(await generateMeta({ title: data.title, body: data.body, targetKeyword: data.targetKeyword ?? null, targetPrompt: data.targetPrompt ?? null }, c)) };
  });
}

/* ─────────────── Personas ─────────────── */

export async function listPersonasAction(projectId: string) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId));
    return listPersonas(ctx.project.id);
  });
}

export async function generatePersonasAction(projectId: string, topic: string) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), "prompts.manage");
    const t = z.string().trim().min(2, "Enter a topic").max(120).parse(topic);
    if (await hasAi()) {
      await enqueuePersonaGeneration(ctx.project.id, t, ctx.user.id);
      return { mode: "queued" as const, created: 0 };
    }
    const created = await insertLibraryPersonas(ctx.project.id, t);
    return { mode: "library" as const, created };
  });
}

const personaSchema = z.object({
  topic: z.string().trim().min(2).max(120),
  name: z.string().trim().min(2).max(80),
  role: z.string().trim().min(2).max(120),
  expertise: z.array(z.string().trim().min(1).max(80)).max(8).default([]),
  bio: z.string().trim().max(600).default(""),
  voice: z.string().trim().max(400).default(""),
  credentials: z.string().trim().max(300).optional(),
});

export async function createPersonaAction(projectId: string, input: z.input<typeof personaSchema>) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), "prompts.manage");
    const data = personaSchema.parse(input);
    const [row] = await db
      .insert(contentPersonas)
      .values({ ...data, credentials: data.credentials || null, projectId: ctx.project.id, source: "manual" })
      .returning();
    return row!;
  });
}

export async function deletePersonaAction(projectId: string, personaId: string) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), "prompts.manage");
    await db.delete(contentPersonas).where(and(eq(contentPersonas.projectId, ctx.project.id), eq(contentPersonas.id, z.string().max(64).parse(personaId))));
    return true;
  });
}

/* ─────────────── Claim checks ─────────────── */

export async function checkClaimsAction(projectId: string, contentId: string) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), "prompts.manage");
    if (!(await hasAi())) throw new ActionError(NO_AI, "invalid");
    return enqueueClaimCheck(ctx.project.id, cid.parse(contentId), ctx.user.id);
  });
}

export async function rewriteWithCitationsAction(projectId: string, contentId: string) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), "prompts.manage");
    if (!(await hasAi())) throw new ActionError(NO_AI, "invalid");
    return enqueueCitationRewrite(ctx.project.id, cid.parse(contentId), ctx.user.id);
  });
}

/** Poll target for the Claims panel; returns the body + citations once a citation rewrite finished. */
export async function claimStateAction(projectId: string, contentId: string) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId));
    const row = await getContent(ctx.project.id, cid.parse(contentId));
    if (!row) throw new ActionError("Content not found.", "not_found");
    return { claimChecks: row.claimChecks, body: row.body, citations: row.citations, updatedAt: row.updatedAt.toISOString() };
  });
}

/* ─────────────── Schema generator ─────────────── */

const addressSchema = z.object({
  streetAddress: z.string().trim().max(200).nullable().optional(),
  postalCode: z.string().trim().max(20).nullable().optional(),
  addressLocality: z.string().trim().max(120).nullable().optional(),
  addressRegion: z.string().trim().max(120).nullable().optional(),
  addressCountry: z.string().trim().max(60).nullable().optional(),
});

const schemaInput = z.object({
  url: z.string().trim().max(2000).optional().default(""),
  types: z.array(z.enum(SCHEMA_TYPES)).max(8).optional(),
  productId: z.string().max(64).nullable().optional(),
  overrides: z
    .object({
      sameAs: z.array(z.string().trim().url().max(500)).max(20).optional(),
      telephone: z.string().trim().max(40).nullable().optional(),
      email: z.string().trim().email().max(200).nullable().optional().or(z.literal("")),
      address: addressSchema.nullable().optional(),
      businessType: z.string().trim().regex(/^[A-Za-z]{3,40}$/).nullable().optional().or(z.literal("")),
      openingHours: z.array(z.string().trim().max(60)).max(14).optional(),
      priceRange: z.string().trim().max(20).nullable().optional(),
    })
    .optional(),
});

export async function generateSchemaAction(projectId: string, input: z.input<typeof schemaInput>) {
  return runAction(async () => {
    const ctx = await actionProject(pid.parse(projectId), "prompts.manage");
    const data = schemaInput.parse(input);
    const o = data.overrides;
    const address = o?.address && Object.values(o.address).some((v) => v) ? o.address : null;
    return generateSchemaMarkup(ctx.project.id, {
      url: data.url || null,
      types: data.types,
      productId: data.productId || null,
      overrides: o
        ? { ...o, email: o.email || null, businessType: o.businessType || null, address, telephone: o.telephone || null, priceRange: o.priceRange || null }
        : undefined,
    });
  });
}
