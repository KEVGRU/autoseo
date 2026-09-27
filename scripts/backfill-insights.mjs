#!/usr/bin/env node
// Enqueues the idempotent "ai.insights.backfill" job (run by the app's job worker): re-classifies
// source content types, fills statement aspects, follow-up questions, ad click params, fan-out
// intent / word count / coverage and catalog matches for data analyzed before these existed.
// Usage: node scripts/backfill-insights.mjs [projectId] [--no-llm]
import crypto from "node:crypto";
import postgres from "postgres";

const args = process.argv.slice(2);
const projectId = args.find((a) => !a.startsWith("--")) ?? null;
const llm = !args.includes("--no-llm");
const sql = postgres(process.env.DATABASE_URL ?? "postgres://autoseo:autoseo@localhost:54329/autoseo");

if (projectId) {
  const [p] = await sql`select id from projects where id = ${projectId}`;
  if (!p) {
    console.error(`Project ${projectId} not found.`);
    await sql.end();
    process.exit(1);
  }
}
const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
const id = `job_${Array.from(crypto.randomBytes(16), (b) => alphabet[b % alphabet.length]).join("")}`;
const dedupe = `ai.insights.backfill:${projectId ?? "all"}`;
// A finished job with the same key frees it (same rule as enqueueJob).
await sql`update jobs set dedupe_key = null where dedupe_key = ${dedupe} and status in ('succeeded', 'failed', 'cancelled')`;
const [row] = await sql`
  insert into jobs (id, type, payload, max_attempts, dedupe_key, project_id)
  values (${id}, 'ai.insights.backfill', ${sql.json({ ...(projectId ? { projectId } : {}), llm })}, 1, ${dedupe}, ${projectId})
  on conflict (dedupe_key) do nothing
  returning id`;
console.log(row ? `Enqueued ${row.id} (${projectId ?? "all projects"}). Follow it in Admin → Jobs or: select status, result from jobs where id = '${row.id}';` : "A backfill job for this scope is already queued or running.");
await sql.end();
