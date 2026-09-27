import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { getSetting } from "@/server/settings";
import { env, isSharedCloud } from "@/server/env";

export type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
  /** Content-ID for inline images referenced as `cid:<cid>` in the HTML. */
  cid?: string;
};

export type MailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: MailAttachment[];
};

const formatBytes = (n: number) => (n >= 1_048_576 ? `${(n / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export type MailResult = { delivered: boolean; transport: "smtp" | "log"; messageId?: string; error?: string };

type Transport = { from: string; replyTo?: string; transporter: Transporter };

async function buildTransport(): Promise<Transport | null> {
  const smtp = await getSetting("smtp");
  const host = smtp.preset === "ses" ? `email-smtp.${smtp.sesRegion}.amazonaws.com` : smtp.host;
  if (smtp.enabled && host && smtp.fromEmail) {
    return {
      from: smtp.fromName ? `"${smtp.fromName.replace(/"/g, "")}" <${smtp.fromEmail}>` : smtp.fromEmail,
      replyTo: smtp.replyTo || undefined,
      transporter: nodemailer.createTransport({
        host,
        port: smtp.port,
        secure: smtp.secure || smtp.port === 465,
        auth: smtp.user ? { user: smtp.user, pass: smtp.password } : undefined,
        requireTLS: !smtp.secure && smtp.port === 587,
      }),
    };
  }
  return defaultTransport();
}

/**
 * Platform default used until Admin → Email is configured: the mail server AutoSEO Cloud pushed to a shared
 * instance (`PUT /api/cloud/config`), else AUTOSEO_SMTP_URL / AUTOSEO_MAIL_FROM.
 */
async function defaultTransport(): Promise<Transport | null> {
  if (isSharedCloud()) {
    const platform = await getSetting("platformMail");
    if (platform.smtpUrl && platform.from) return { from: platform.from, transporter: nodemailer.createTransport(platform.smtpUrl) };
  }
  const { smtpUrl, mailFrom } = env.bootstrap;
  if (!smtpUrl || !mailFrom) return null;
  return { from: mailFrom, transporter: nodemailer.createTransport(smtpUrl) };
}

/** True when mail goes out through the platform default instead of the admin panel settings. */
export async function usesDefaultMailServer(): Promise<boolean> {
  const smtp = await getSetting("smtp");
  return !smtp.enabled && (await defaultTransport()) !== null;
}

/**
 * Sends an email via the configured SMTP server (Amazon SES SMTP supported out of the box).
 * Without SMTP configured the message is written to the server log so the instance still works.
 */
export async function sendMail(input: MailInput): Promise<MailResult> {
  const t = await buildTransport();
  if (!t) {
    const files = input.attachments?.length
      ? `Attachments: ${input.attachments.map((a) => `${a.filename} (${a.contentType}, ${formatBytes(a.content.length)}${a.cid ? `, inline cid:${a.cid}` : ""})`).join("; ")}\n`
      : "";
    console.info(
      `\n──── [email:log] SMTP not configured — message for ${input.to} ────\nSubject: ${input.subject}\n${files}${input.text}\n────────────────────────────────────────\n`,
    );
    return { delivered: false, transport: "log" };
  }
  try {
    const info = await t.transporter.sendMail({
      from: t.from,
      to: input.to,
      replyTo: t.replyTo,
      subject: input.subject,
      html: input.html,
      text: input.text,
      ...(input.attachments?.length
        ? { attachments: input.attachments.map((a) => ({ filename: a.filename, content: a.content, contentType: a.contentType, ...(a.cid ? { cid: a.cid } : {}) })) }
        : {}),
    });
    return { delivered: true, transport: "smtp", messageId: info.messageId };
  } catch (err) {
    console.error("[email] send failed", err);
    return { delivered: false, transport: "smtp", error: err instanceof Error ? err.message : String(err) };
  }
}

export async function verifySmtp(): Promise<{ ok: boolean; error?: string }> {
  const t = await buildTransport();
  if (!t) return { ok: false, error: "SMTP is disabled or incomplete (host and from address are required)." };
  try {
    await t.transporter.verify();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function appUrl(path = "/"): string {
  return `${env.appUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
