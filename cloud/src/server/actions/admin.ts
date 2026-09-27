"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { assertAdmin, AuthError } from "@/server/auth/guards";
import { getSetting, isCoolifyConfigured, updateSetting } from "@/server/settings";
import { sendMail, verifySmtp, verifySmtpServer } from "@/server/email";
import { resolveCoolifyToken } from "@/server/coolify-rules";
import { testEmail } from "@/server/email/templates";
import { connectStripe, cancelSubscriptionNow, settleCheckoutSession, stripeModeFromKey } from "@/server/stripe";
import { db } from "@/server/db/client";
import { instances, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { isAdminEmail, isSharedBackendConfigured } from "@/server/env";
import { isValidEmail, normalizeEmail } from "@/server/auth/login";
import { rateLimit } from "@/server/rate-limit";
import { validateWorkspaceName } from "@/server/workspace-name";
import { createComplimentaryInstance } from "@/server/complimentary";
import { pushPlanLimitsToTenants, sharedAppHealth, syncSharedMailConfig } from "@/server/shared-app";
import { parsePlanInput } from "@/server/tenant-rules";
import { connectionFromSettings, coolify } from "@/server/coolify";
import { IMAGE_PATTERN, MEMORY_PATTERN } from "@/server/compose";
import { checkSlugAvailability, getInstance, getUserInstance } from "@/server/instances";
import { deleteInstance, ensureCoolifyProject, provisionInstance, restartInstance, retryProvisioning, stopInstance } from "@/server/provisioning";
import { logEvent } from "@/server/events";

export type AdminActionState = { ok?: boolean; error?: string; message?: string };

function fail(err: unknown): AdminActionState {
  if (err instanceof AuthError) return { error: err.message };
  if (err instanceof z.ZodError) return { error: err.issues.map((i) => i.message).join(" ") };
  return { error: err instanceof Error ? err.message : String(err) };
}

const checkbox = (v: FormDataEntryValue | null) => v === "on" || v === "true";
const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

/* ─────────────────────────────── Email ─────────────────────────────── */

const smtpSchema = z.object({
  host: z.union([
    z.literal(""),
    z
      .string()
      .max(253)
      .regex(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$|^\[?[0-9a-f:.]+\]?$/i, "SMTP host must be a hostname or IP address."),
  ]),
  port: z.coerce.number().int().min(1, "Port must be 1–65535.").max(65535, "Port must be 1–65535."),
  user: z.string().max(320),
  fromName: z.string().max(80),
  fromEmail: z.union([z.literal(""), z.email("From email is not a valid address.")]),
  replyTo: z.union([z.literal(""), z.email("Reply-to is not a valid address.")]),
});

export async function saveSmtpAction(_prev: AdminActionState, fd: FormData): Promise<AdminActionState> {
  try {
    const { user } = await assertAdmin();
    const data = smtpSchema.parse({
      host: text(fd, "host"),
      port: text(fd, "port") || "587",
      user: text(fd, "user"),
      fromName: text(fd, "fromName"),
      fromEmail: text(fd, "fromEmail"),
      replyTo: text(fd, "replyTo"),
    });
    if (data.host && !data.fromEmail) return { error: "A from email is required when a host is set." };
    const password = String(fd.get("password") ?? "");
    await updateSetting("smtp", {
      ...data,
      secure: checkbox(fd.get("secure")),
      shareWithInstances: checkbox(fd.get("shareWithInstances")),
      ...(password ? { password } : checkbox(fd.get("clearPassword")) ? { password: "" } : {}),
    });
    await logEvent("settings.smtp_saved", { userId: user.id, data: { host: data.host, port: data.port } });
    const verify = data.host ? await verifySmtp() : null;
    const pushed = await syncSharedMailConfig({ force: true });
    refresh();
    const pushNote = pushed.ok ? "" : ` Pushing it to the shared app failed: ${pushed.error}`;
    if (verify && !verify.ok) return { ok: true, message: `Saved, but the connection test failed: ${verify.error}.${pushNote}` };
    return { ok: true, message: `${data.host ? "Saved — the SMTP connection works." : "Saved."}${pushNote}` };
  } catch (err) {
    return fail(err);
  }
}

/** Optional separate SMTP server for customer instances (its credential ends up in every customer container). */
export async function saveInstanceSmtpAction(_prev: AdminActionState, fd: FormData): Promise<AdminActionState> {
  try {
    const { user } = await assertAdmin();
    const data = smtpSchema.omit({ replyTo: true }).parse({
      host: text(fd, "host"),
      port: text(fd, "port") || "587",
      user: text(fd, "user"),
      fromName: text(fd, "fromName"),
      fromEmail: text(fd, "fromEmail"),
    });
    if (data.host && !data.fromEmail) return { error: "A from email is required when a host is set." };
    const password = String(fd.get("password") ?? "");
    const saved = await updateSetting("instanceSmtp", {
      ...data,
      secure: checkbox(fd.get("secure")),
      // Removing the server also removes its credential.
      ...(!data.host ? { password: "" } : password ? { password } : checkbox(fd.get("clearPassword")) ? { password: "" } : {}),
    });
    await logEvent("settings.instance_smtp_saved", { userId: user.id, data: { host: data.host, port: data.port, fromEmail: data.fromEmail } });
    // The shared app gets it right away; dedicated instances on their next provision / restart.
    const pushed = await syncSharedMailConfig({ force: true });
    refresh();
    const pushNote = pushed.ok ? "" : ` Pushing it to the shared app failed: ${pushed.error}`;
    if (!data.host) return { ok: true, message: `Removed. Customers fall back to the main SMTP server if sharing is on.${pushNote}` };
    const verify = await verifySmtpServer(saved);
    const note = "Shared workspaces use it right away, dedicated instances after their next restart.";
    return verify.ok
      ? { ok: true, message: `Saved — the connection works. ${note}${pushNote}` }
      : { ok: true, message: `Saved, but the connection test failed: ${verify.error}.${pushNote}` };
  } catch (err) {
    return fail(err);
  }
}

export async function sendTestEmailAction(_prev: AdminActionState, fd: FormData): Promise<AdminActionState> {
  try {
    const { user } = await assertAdmin();
    const to = text(fd, "to") || user.email;
    if (!z.email().safeParse(to).success) return { error: "Enter a valid recipient." };
    const res = await sendMail({ to, ...testEmail() });
    await logEvent("settings.smtp_test", { userId: user.id, data: { to, transport: res.transport, delivered: res.delivered, error: res.error } });
    if (res.transport === "log") return { error: "SMTP is not configured — the test email was written to the server log." };
    if (!res.delivered) return { error: `Sending failed: ${res.error}` };
    return { ok: true, message: `Test email sent to ${to}.` };
  } catch (err) {
    return fail(err);
  }
}

/* ─────────────────────────────── Shared app & plan ─────────────────────────────── */

/** Admin → Hosting → Plan: what every shared workspace includes; pushed to all existing tenants on save. */
export async function savePlanAction(_prev: AdminActionState, fd: FormData): Promise<AdminActionState> {
  try {
    const { user } = await assertAdmin();
    const parsed = parsePlanInput({ monthlyBudgetUsd: text(fd, "monthlyBudgetUsd"), maxProjects: text(fd, "maxProjects") });
    if (!parsed.ok) return { error: parsed.error };
    const plan = parsed.plan;
    await updateSetting("plan", plan);
    await logEvent("settings.plan_saved", { userId: user.id, data: plan });
    refresh();
    const zeroNote = plan.monthlyBudgetUsd === 0 ? " Note: $0 means nothing is included — workspaces can't use paid AI / data." : "";
    if (!isSharedBackendConfigured()) return { ok: true, message: `Saved. It applies once the shared app is configured.${zeroNote}` };
    const res = await pushPlanLimitsToTenants(`admin:${user.email}`);
    return res.failed
      ? { ok: true, message: `Saved. Updated ${res.updated} workspaces; ${res.failed} failed (see Events) and will be retried on their next sync.${zeroNote}` }
      : { ok: true, message: `Saved and applied to ${res.updated} workspace${res.updated === 1 ? "" : "s"}.${zeroNote}` };
  } catch (err) {
    return fail(err);
  }
}

export async function testSharedAppAction(): Promise<AdminActionState> {
  try {
    await assertAdmin();
    const health = await sharedAppHealth();
    if (!health.configured) return { error: "The shared app is not configured (CLOUD_APP_INTERNAL_URL / CLOUD_API_SECRET)." };
    if (!health.ok) return { error: `The shared app is not reachable: ${health.error ?? "unhealthy"}` };
    const mail = await syncSharedMailConfig({ force: true });
    refresh();
    return mail.ok
      ? { ok: true, message: `Connected to the shared app${health.commit ? ` (${health.commit.slice(0, 7)})` : ""}. Mail settings pushed.` }
      : { ok: true, message: `Connected, but pushing the mail settings failed: ${mail.error}` };
  } catch (err) {
    return fail(err);
  }
}

/* ─────────────────────────────── Stripe ─────────────────────────────── */

export async function saveStripeAction(_prev: AdminActionState, fd: FormData): Promise<AdminActionState> {
  try {
    const { user } = await assertAdmin();
    const secretKey = text(fd, "secretKey");
    if (secretKey && !stripeModeFromKey(secretKey)) {
      return { error: "That doesn't look like a Stripe secret key (sk_live_…, sk_test_…, rk_live_… or rk_test_…)." };
    }
    const trialDays = z.coerce.number().int().min(0).max(730).safeParse(text(fd, "trialDays") || "0");
    if (!trialDays.success) return { error: "Trial days must be a number between 0 and 730." };
    const current = await getSetting("stripe");
    if (!secretKey && !current.secretKey) return { error: "Enter your Stripe secret key." };
    await updateSetting("stripe", {
      ...(secretKey ? { secretKey, mode: stripeModeFromKey(secretKey) } : {}),
      trialDays: trialDays.data,
      automaticTax: checkbox(fd.get("automaticTax")),
      allowPromotionCodes: checkbox(fd.get("allowPromotionCodes")),
    });
    await logEvent("settings.stripe_saved", { userId: user.id, data: { keyChanged: !!secretKey } });
    // Saving (re)runs the idempotent account setup.
    const res = await connectStripe();
    refresh();
    if (!res.ok) return { error: `Saved, but connecting to Stripe failed: ${res.error}` };
    return { ok: true, message: `Connected to Stripe (${res.settings.mode ?? "unknown"} mode).` };
  } catch (err) {
    return fail(err);
  }
}

export async function connectStripeAction(): Promise<AdminActionState> {
  try {
    await assertAdmin();
    const res = await connectStripe();
    refresh();
    return res.ok ? { ok: true, message: "Stripe setup is complete." } : { error: res.error };
  } catch (err) {
    return fail(err);
  }
}

/* ─────────────────────────────── Coolify ─────────────────────────────── */

const coolifySchema = z.object({
  // The API token travels with every request: HTTPS only (plain HTTP just for a Coolify on this machine).
  baseUrl: z
    .url("Base URL must be a valid URL.")
    .refine((u) => /^https:\/\//.test(u) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(u), "Base URL must start with https://"),
  projectName: z.string().min(1, "Project name is required.").max(100),
  baseDomain: z
    .string()
    .toLowerCase()
    .regex(/^(?=.{3,200}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/, "Instance base domain must be a domain like autoseo.codext.de."),
  image: z.string().regex(IMAGE_PATTERN, "Image must look like ghcr.io/codextde/autoseo:latest."),
  memoryLimit: z.string().regex(MEMORY_PATTERN, "Memory limit must look like 1536m or 2g."),
});

export async function saveCoolifyAction(_prev: AdminActionState, fd: FormData): Promise<AdminActionState> {
  try {
    const { user } = await assertAdmin();
    const data = coolifySchema.parse({
      baseUrl: text(fd, "baseUrl").replace(/\/+$/, ""),
      projectName: text(fd, "projectName"),
      baseDomain: text(fd, "baseDomain"),
      image: text(fd, "image"),
      memoryLimit: text(fd, "memoryLimit"),
    });
    const apiToken = text(fd, "apiToken");
    const current = await getSetting("coolify");
    const connectionChanged = data.baseUrl !== current.baseUrl || (!!apiToken && apiToken !== current.apiToken);
    // A saved token is never sent to a different host: pointing the URL elsewhere requires entering it again.
    const token = resolveCoolifyToken({ previousUrl: current.baseUrl, nextUrl: data.baseUrl, savedToken: current.apiToken, enteredToken: apiToken });
    await updateSetting("coolify", {
      ...data,
      apiToken: token.token,
      ...(connectionChanged || data.projectName !== current.projectName ? { projectUuid: "" } : {}),
      ...(connectionChanged ? { serverUuid: "", serverName: "" } : {}),
    });
    await logEvent("settings.coolify_saved", {
      userId: user.id,
      data: { baseUrl: data.baseUrl, tokenChanged: !!apiToken, tokenCleared: token.cleared },
    });
    refresh();
    if (token.cleared) {
      return { ok: true, message: "Saved. The Coolify host changed, so the saved API token was removed — enter the token for the new host." };
    }
    return { ok: true, message: connectionChanged ? "Saved. Now load the servers and pick one." : "Saved." };
  } catch (err) {
    return fail(err);
  }
}

export type CoolifyServersState = AdminActionState & { servers?: { uuid: string; name: string; ip?: string }[] };

export async function loadCoolifyServersAction(): Promise<CoolifyServersState> {
  try {
    await assertAdmin();
    const settings = await getSetting("coolify");
    const servers = (await coolify.listServers(connectionFromSettings(settings))).map((s) => ({ uuid: s.uuid, name: s.name, ip: s.ip }));
    if (servers.length === 1 && settings.serverUuid !== servers[0]!.uuid) {
      await updateSetting("coolify", { serverUuid: servers[0]!.uuid, serverName: servers[0]!.name });
      refresh();
      return { ok: true, servers, message: `Selected the only server, “${servers[0]!.name}”.` };
    }
    return { ok: true, servers, message: servers.length ? `Found ${servers.length} servers.` : "No servers found in Coolify." };
  } catch (err) {
    return fail(err);
  }
}

export async function selectCoolifyServerAction(_prev: AdminActionState, fd: FormData): Promise<AdminActionState> {
  try {
    await assertAdmin();
    const uuid = text(fd, "serverUuid");
    const settings = await getSetting("coolify");
    const server = (await coolify.listServers(connectionFromSettings(settings))).find((s) => s.uuid === uuid);
    if (!server) return { error: "Server not found." };
    await updateSetting("coolify", { serverUuid: server.uuid, serverName: server.name });
    refresh();
    return { ok: true, message: `Instances will be deployed to “${server.name}”.` };
  } catch (err) {
    return fail(err);
  }
}

export async function testCoolifyAction(): Promise<AdminActionState> {
  try {
    await assertAdmin();
    const settings = await getSetting("coolify");
    const conn = connectionFromSettings(settings);
    const version = await coolify.version(conn);
    if (!isCoolifyConfigured(settings)) return { ok: true, message: `Connected to Coolify ${version}. Pick a server to finish setup.` };
    const projectUuid = await ensureCoolifyProject(conn, await getSetting("coolify"));
    refresh();
    return { ok: true, message: `Connected to Coolify ${version}. Project “${settings.projectName}” is ready (${projectUuid}).` };
  } catch (err) {
    return fail(err);
  }
}

/* ─────────────────────────────── Customers ─────────────────────────────── */

export type InstanceOp = "provision" | "start" | "stop" | "restart" | "redeploy";

export async function adminInstanceAction(instanceId: string, op: InstanceOp): Promise<AdminActionState> {
  try {
    const { user } = await assertAdmin();
    const instance = await getInstance(instanceId);
    if (!instance || instance.status === "deleted") return { error: "Instance not found." };
    const actor = `admin:${user.email}`;
    // Starting again lifts an admin stop, so billing events manage the instance again.
    if (op !== "stop") await db.update(instances).set({ stoppedByAdmin: false }).where(eq(instances.id, instance.id));
    let res;
    switch (op) {
      case "provision":
        res = await retryProvisioning(instance.id, actor);
        break;
      case "start":
        res = await provisionInstance(instance.id, actor);
        break;
      case "stop":
        res = await stopInstance(instance, actor, "admin", { byAdmin: true });
        break;
      case "restart":
        res = await restartInstance(instance, actor);
        break;
      case "redeploy":
        res = await restartInstance(instance, actor, { latest: true });
        break;
      default:
        return { error: "Unknown action." };
    }
    refresh();
    const label = instance.backend === "shared" ? `the workspace “${instance.workspaceName}”` : instance.slug;
    const verb =
      instance.backend === "shared"
        ? { provision: "Synced", start: "Resumed", stop: "Suspended", restart: "Synced", redeploy: "Synced" }[op]
        : `${op[0]!.toUpperCase()}${op.slice(1)} requested for`;
    return res.ok ? { ok: true, message: `${verb} ${label}.` } : { error: res.error };
  } catch (err) {
    return fail(err);
  }
}

export async function adminDeleteInstanceAction(_prev: AdminActionState, fd: FormData): Promise<AdminActionState> {
  try {
    const { user } = await assertAdmin();
    const instance = await getInstance(text(fd, "instanceId"));
    if (!instance || instance.status === "deleted") return { error: "Instance not found." };
    if (text(fd, "confirmSlug") !== instance.slug) return { error: `Type “${instance.slug}” to confirm.` };
    const actor = `admin:${user.email}`;
    if ((await settleCheckoutSession(instance)) === "paid") {
      return { error: "This order was just paid and is being provisioned — reload and delete it again if needed." };
    }
    const canceled = await cancelSubscriptionNow(instance, actor);
    if (!canceled.ok) return { error: `The subscription couldn't be canceled, so nothing was deleted: ${canceled.error}` };
    const res = await deleteInstance(instance, actor);
    refresh();
    const label = instance.backend === "shared" ? `The workspace “${instance.workspaceName}”` : instance.slug;
    return res.ok ? { ok: true, message: `${label} was deleted.` } : { error: res.error };
  } catch (err) {
    return fail(err);
  }
}

/* ─────────────────────────────── Complimentary instances ─────────────────────────────── */

const HOUR = 60 * 60 * 1000;

/** Dashboard: an admin creates their own instance without payment (or converts their unpaid reservation). */
export async function adminCreateOwnInstanceAction(_prev: AdminActionState, fd: FormData): Promise<AdminActionState> {
  try {
    const { user } = await assertAdmin();
    if (!rateLimit(`grant:${user.id}`, 20, HOUR)) return { error: "Too many attempts. Please wait a moment." };
    const res = await createComplimentaryInstance({
      owner: user,
      slug: text(fd, "slug") || undefined,
      workspaceName: String(fd.get("workspaceName") ?? ""),
      grantedBy: user.email,
    });
    if (!res.ok) return { error: res.error };
    refresh();
    const what = res.instance.backend === "shared" ? `your workspace “${res.instance.workspaceName}”` : res.instance.host;
    return { ok: true, message: `Setting up ${what} — no payment needed.` };
  } catch (err) {
    return fail(err);
  }
}

export type GrantState = AdminActionState & { resetKey?: number };

/**
 * Admin → Customers: create (or find) the account by email and give it a complimentary workspace in the shared app,
 * or — with "dedicated" (or when the shared app isn't configured) — a dedicated Coolify instance at an address.
 */
export async function grantFreeInstanceAction(_prev: GrantState, fd: FormData): Promise<GrantState> {
  try {
    const { user: admin } = await assertAdmin();
    if (!rateLimit(`grant:${admin.id}`, 20, HOUR)) return { error: "Too many attempts. Please wait a moment." };
    const email = normalizeEmail(text(fd, "email"));
    if (!isValidEmail(email)) return { error: "Enter a valid email address." };
    // Validate everything before an account is created for the email.
    const name = validateWorkspaceName(fd.get("workspaceName"));
    if (!name.ok) return { error: name.error };
    const dedicated = checkbox(fd.get("dedicated")) || !isSharedBackendConfigured();
    let slug: string | undefined;
    if (dedicated) {
      const availability = await checkSlugAvailability(text(fd, "slug"));
      if (!availability.available) return { error: availability.error };
      slug = availability.slug;
    }

    const [created] = await db
      .insert(users)
      .values({ email, isAdmin: isAdminEmail(email) })
      .onConflictDoNothing({ target: users.email })
      .returning();
    const owner = created ?? (await db.select().from(users).where(eq(users.email, email)).limit(1))[0];
    if (!owner) return { error: "The account couldn't be created. Please try again." };
    if (created) await logEvent("auth.user_created_by_admin", { userId: owner.id, data: { email, by: admin.email } });

    const current = await getUserInstance(owner.id);
    if (current) {
      const what = current.backend === "shared" ? `a workspace (“${current.workspaceName}”` : `an instance (${current.host}`;
      return { error: `${email} already has ${what}, ${current.status.replace("_", " ")}).` };
    }

    const res = await createComplimentaryInstance({ owner, slug, workspaceName: name.value, grantedBy: admin.email, dedicated });
    if (!res.ok) return { error: res.error };
    refresh();
    const what = res.instance.backend === "shared" ? `the workspace “${res.instance.workspaceName}”` : res.instance.host;
    return {
      ok: true,
      message: `Granted ${what} to ${email}. They get an email with a sign-in button once it's ready.`,
      resetKey: Date.now(),
    };
  } catch (err) {
    return fail(err);
  }
}
