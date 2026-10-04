import type { Settings } from "@/server/settings/registry";

/** Resend's connection settings are fixed; custom SMTP fields cannot redirect its API key. */
export function smtpConnection(settings: Settings<"smtp">) {
  if (settings.preset === "resend") {
    return { host: "smtp.resend.com", port: 587, secure: false, user: "resend", requireTLS: true };
  }
  return {
    host: settings.preset === "ses" ? `email-smtp.${settings.sesRegion}.amazonaws.com` : settings.host,
    port: settings.port,
    secure: settings.secure || settings.port === 465,
    user: settings.user,
    requireTLS: !settings.secure && settings.port === 587,
  };
}
