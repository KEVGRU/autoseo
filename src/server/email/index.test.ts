import { beforeEach, describe, expect, it, vi } from "vitest";
import { settingsRegistry, type Settings } from "@/server/settings/registry";

const mocks = vi.hoisted(() => ({ getSetting: vi.fn(), createTransport: vi.fn(), sendMail: vi.fn(), verify: vi.fn() }));
vi.mock("@/server/settings", () => ({ getSetting: mocks.getSetting }));
vi.mock("@/server/env", () => ({ env: { appUrl: "https://autoseo.example", bootstrap: { smtpUrl: null, mailFrom: null } }, isSharedCloud: () => false }));
vi.mock("nodemailer", () => ({ default: { createTransport: mocks.createTransport } }));
import { sendMail, verifySmtp } from "./index";

let settings: Settings<"smtp">;
const message = { to: "recipient@example.com", subject: "Report", text: "Your report", html: "<p>Your report</p>" };

beforeEach(() => {
  vi.clearAllMocks();
  settings = settingsRegistry.smtp.schema.parse({ enabled: true, preset: "resend", password: "re_test_key", fromEmail: "seo@example.com", replyTo: "support@example.com" });
  mocks.getSetting.mockImplementation(async () => settings);
  mocks.createTransport.mockReturnValue({ sendMail: mocks.sendMail, verify: mocks.verify });
  mocks.sendMail.mockResolvedValue({ messageId: "resend-message-id" });
  mocks.verify.mockResolvedValue(true);
});

describe("Resend mail provider", () => {
  it("uses Resend STARTTLS and ignores stale custom SMTP destinations", async () => {
    Object.assign(settings, { host: "other.example", port: 465, secure: true, user: "old-user" });
    expect(await sendMail(message)).toEqual({ delivered: true, transport: "smtp", messageId: "resend-message-id" });
    expect(mocks.createTransport).toHaveBeenCalledWith({ host: "smtp.resend.com", port: 587, secure: false, requireTLS: true, auth: { user: "resend", pass: "re_test_key" } });
    expect(mocks.sendMail).toHaveBeenCalledWith(expect.objectContaining({ ...message, from: '"AutoSEO" <seo@example.com>', replyTo: "support@example.com" }));
  });

  it("preserves report attachments and inline image IDs", async () => {
    const file = { filename: "logo.png", content: Buffer.from("image"), contentType: "image/png", cid: "logo" };
    await sendMail({ ...message, attachments: [file] });
    expect(mocks.sendMail).toHaveBeenCalledWith(expect.objectContaining({ attachments: [file] }));
  });

  it("verifies credentials without sending email", async () => {
    expect(await verifySmtp()).toEqual({ ok: true });
    expect(mocks.verify).toHaveBeenCalledOnce();
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });

  it("reports rejected credentials without claiming success", async () => {
    mocks.verify.mockRejectedValueOnce(new Error("Authentication rejected"));
    expect(await verifySmtp()).toEqual({ ok: false, error: "Authentication rejected" });
  });

  it("keeps Amazon SES delivery settings", async () => {
    Object.assign(settings, { preset: "ses", sesRegion: "eu-central-1", user: "ses-user", password: "ses-secret" });
    await sendMail(message);
    expect(mocks.createTransport).toHaveBeenCalledWith(expect.objectContaining({ host: "email-smtp.eu-central-1.amazonaws.com", port: 587, requireTLS: true, auth: { user: "ses-user", pass: "ses-secret" } }));
  });

  it("keeps custom SMTP delivery settings", async () => {
    Object.assign(settings, { preset: "custom", host: "smtp.example.com", port: 465, user: "custom-user" });
    await sendMail(message);
    expect(mocks.createTransport).toHaveBeenCalledWith(expect.objectContaining({ host: "smtp.example.com", port: 465, secure: true, requireTLS: false }));
  });
});
