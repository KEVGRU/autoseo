/**
 * Lints the landing-page copy in src/components/marketing/catalog/{en,de}: SEO lengths, section sizes, valid
 * cross-links, EN/DE parity and the German Sie-form. Run with `node scripts/check-landing-copy.mts [filter]`
 * (Node ≥ 23 strips the types). Exits with 1 when an error is found; missing pages are listed as warnings.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  featureSlugs,
  integrationCategorySlugs,
  integrationSlugs,
  platformSlugs,
  solutionSlugs,
} from "../src/components/marketing/catalog/routes.ts";
import { directory } from "../src/components/marketing/catalog/directory.ts";

const root = join(import.meta.dirname, "../src/components/marketing/catalog");
const filter = process.argv[2] ?? "";
const errors: string[] = [];
const warnings: string[] = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- loose view of the typed copy files
type Page = Record<string, any>;

const groups: { dir: string; slugs: readonly string[] }[] = [
  { dir: "features", slugs: featureSlugs },
  { dir: "platforms", slugs: platformSlugs },
  { dir: "solutions", slugs: solutionSlugs },
  { dir: "integration-categories", slugs: integrationCategorySlugs },
  { dir: "integrations", slugs: integrationSlugs },
];

async function load(file: string): Promise<Page | null> {
  if (!existsSync(file)) return null;
  // Invisible no-break spaces are easy to miss in review; the source must spell them as the \u00a0 escape.
  if (readFileSync(file, "utf8").includes("\u00a0"))
    errors.push(`${file.slice(root.length + 1)}: raw no-break space — write it as the \\u00a0 escape`);
  const mod = await import(pathToFileURL(file).href);
  return mod.default as Page;
}

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => strings(v, out));
  return out;
}

function count(label: string, list: unknown, min: number, max: number, where: string) {
  const n = Array.isArray(list) ? list.length : 0;
  if (n < min || n > max) errors.push(`${where}: ${label} has ${n} items (expected ${min}–${max})`);
}

function checkMeta(page: Page, where: string) {
  const { title, description } = page.meta ?? {};
  if (!title || title.length > 50) errors.push(`${where}: meta.title is ${title?.length ?? 0} chars (max 50): "${title}"`);
  if (!description || description.length < 120 || description.length > 165)
    errors.push(`${where}: meta.description is ${description?.length ?? 0} chars (120–165)`);
}

function checkText(page: Page, where: string, lang: string) {
  for (const s of strings(page)) {
    if (/\b(TODO|TBD|lorem|ipsum|FIXME)\b/i.test(s)) errors.push(`${where}: placeholder text: "${s.slice(0, 60)}"`);
    if (lang === "de" && /\b(du|dich|dir|dein|deine|deinen|deiner|deinem|deines)\b/.test(s))
      errors.push(`${where}: German copy must use the Sie-form: "${s.slice(0, 80)}"`);
    if (/finseo/i.test(s)) errors.push(`${where}: mentions a competitor by name: "${s.slice(0, 60)}"`);
    // AutoSEO Cloud sells workspaces in a shared instance (docs/CLOUD.md), not private instances.
    if (/private (cloud )?instance|per instance|own instance|isolated database|yourname\.|ihrname\.|eigene[nrs]? (Cloud-)?Instanz|private[nrs]? (Cloud-)?Instanz|pro Instanz/i.test(s))
      errors.push(`${where}: outdated Cloud model (instances instead of workspaces): "${s.slice(0, 90)}"`);
    // No AI/data provider is guaranteed to be configured on the shared Cloud instance (docs/CLOUD.md) — say
    // "runs through the providers the Codext team has connected" instead.
    if (/already (set up|configured)|pre-?configured(?! bundle)|bereits eingerichtet|vorkonfiguriert(?!es Bundle)|übernehmen wir die Einrichtung|we (set (it|them) up|handle the setup)/i.test(s))
      errors.push(`${where}: unverified Cloud setup claim: "${s.slice(0, 90)}"`);
  }
}

function checkFaq(page: Page, where: string, min = 5, max = 12) {
  count("faq", page.faq, min, max, where);
  for (const f of page.faq ?? []) if (!f.q?.trim() || !f.a?.trim()) errors.push(`${where}: empty FAQ entry`);
}

function checkPage(dir: string, slug: string, page: Page, where: string, lang: string) {
  if (page.slug !== undefined && page.slug !== slug) errors.push(`${where}: slug is "${page.slug}"`);
  checkMeta(page, where);
  checkText(page, where, lang);
  if (dir === "features") {
    count("stats", page.stats, 3, 4, where);
    count("why.points", page.why?.points, 3, 3, where);
    count("capabilities.items", page.capabilities?.items, 6, 6, where);
    count("steps.items", page.steps?.items, 3, 4, where);
    checkFaq(page, where, 6, 10);
    count("related", page.related, 3, 4, where);
    for (const r of page.related ?? [])
      if (!featureSlugs.includes(r) || r === slug) errors.push(`${where}: invalid related feature "${r}"`);
    if (page.screenshot && !existsSync(join(import.meta.dirname, "../public", page.screenshot.src)))
      errors.push(`${where}: screenshot ${page.screenshot.src} does not exist`);
  }
  if (dir === "platforms") {
    count("why.points", page.why?.points, 3, 3, where);
    count("method.items", page.method?.items, 1, 4, where);
    count("tracked.items", page.tracked?.items, 6, 6, where);
    checkFaq(page, where, 5, 10);
    if (page.demo && !/Acme/.test(page.demo.answer)) errors.push(`${where}: demo answer should mention the example brand Acme`);
  }
  if (dir === "solutions") {
    count("challenges.items", page.challenges?.items, 3, 3, where);
    count("workflow.items", page.workflow?.items, 4, 6, where);
    for (const w of page.workflow?.items ?? [])
      if (!featureSlugs.includes(w.feature)) errors.push(`${where}: invalid workflow feature "${w.feature}"`);
    count("prompts.items", page.prompts?.items, 5, 8, where);
    count("outcomes.items", page.outcomes?.items, 3, 3, where);
    checkFaq(page, where, 5, 10);
    count("related", page.related, 3, 3, where);
    for (const r of page.related ?? [])
      if (!solutionSlugs.includes(r) || r === slug) errors.push(`${where}: invalid related solution "${r}"`);
  }
  if (dir === "integration-categories") {
    count("benefits.items", page.benefits?.items, 3, 4, where);
    checkFaq(page, where, 4, 8);
  }
  if (dir === "integrations") {
    count("overview.items", page.overview?.items, 4, 6, where);
    count("useCases.items", page.useCases?.items, 3, 5, where);
    count("setup.items", page.setup?.items, 3, 5, where);
    checkFaq(page, where, 4, 8);
  }
}

/** Structural parity: the German page must have the same list sizes and cross-links as the English one. */
function parity(en: Page, de: Page, where: string) {
  const shape = (v: unknown): unknown =>
    Array.isArray(v) ? v.map(shape) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shape(x)])) : typeof v;
  const keysEn = JSON.stringify(shape({ ...en, meta: 0, faq: 0, demo: 0 }));
  const keysDe = JSON.stringify(shape({ ...de, meta: 0, faq: 0, demo: 0 }));
  if (keysEn !== keysDe) errors.push(`${where}: German structure differs from English (list sizes or fields)`);
  for (const key of ["related", "visual", "slug"] as const)
    if (JSON.stringify(en[key]) !== JSON.stringify(de[key])) errors.push(`${where}: "${key}" differs between en and de`);
  const icons = (p: Page) => JSON.stringify(strings(p).length ? JSON.stringify(p).match(/"icon":"[^"]+"/g) : []);
  if (icons(en) !== icons(de)) errors.push(`${where}: icons differ between en and de`);
}

let checked = 0;
for (const { dir, slugs } of groups) {
  for (const slug of slugs) {
    const pages: Record<string, Page | null> = {};
    for (const lang of ["en", "de"]) {
      const where = `${lang}/${dir}/${slug}`;
      if (filter && !where.includes(filter)) continue;
      const page = await load(join(root, lang, dir, `${slug}.ts`));
      pages[lang] = page;
      if (!page) {
        warnings.push(`${where}: missing`);
        continue;
      }
      checked++;
      checkPage(dir, slug, page, where, lang);
    }
    if (pages.en && pages.de) parity(pages.en, pages.de, `${dir}/${slug}`);
  }
}

for (const lang of ["en", "de"]) {
  for (const name of ["integrations-hub", "security", "support"]) {
    const where = `${lang}/${name}`;
    if (filter && !where.includes(filter)) continue;
    const page = await load(join(root, lang, `${name}.ts`));
    if (!page) {
      warnings.push(`${where}: missing`);
      continue;
    }
    checked++;
    checkMeta(page, where);
    checkText(page, where, lang);
    checkFaq(page, where, 4, 10);
  }
}

// Pages written but not registered in routes.ts yet: checked like the others, reported as pending.
for (const { dir, slugs } of groups) {
  const pending = new Set(
    ["en", "de"].flatMap((lang) => {
      const folder = join(root, lang, dir);
      if (!existsSync(folder)) return [];
      return readdirSync(folder)
        .filter((f) => f.endsWith(".ts") && f !== "index.ts" && !slugs.includes(f.replace(/\.ts$/, "")))
        .map((f) => f.replace(/\.ts$/, ""));
    }),
  );
  for (const slug of pending) {
    const pages: Record<string, Page | null> = {};
    for (const lang of ["en", "de"]) {
      const where = `${lang}/${dir}/${slug}`;
      if (filter && !where.includes(filter)) continue;
      pages[lang] = await load(join(root, lang, dir, `${slug}.ts`));
      if (!pages[lang]) {
        warnings.push(`${where}: missing (pending page)`);
        continue;
      }
      warnings.push(`${where}: not registered in routes.ts yet`);
      checked++;
      checkPage(dir, slug, pages[lang]!, where, lang);
    }
    if (pages.en && pages.de) parity(pages.en, pages.de, `${dir}/${slug}`);
  }
}

// Every registered integration page needs a directory entry pointing at it (the template derives its category).
for (const slug of integrationSlugs)
  if (!directory.some((entry) => entry.page === slug))
    errors.push(`integrations/${slug}: registered in routes.ts but no entry in directory.ts has page: "${slug}"`);

if (warnings.length) console.log(`Warnings (${warnings.length}):\n  ${warnings.join("\n  ")}`);
if (errors.length) {
  console.error(`\nErrors (${errors.length}):\n  ${errors.join("\n  ")}`);
  process.exit(1);
}
console.log(`\nOK — ${checked} page(s) checked.`);
