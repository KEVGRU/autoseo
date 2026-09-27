/**
 * Converts the admin's SMTP settings into the instance env contract (docs/MANAGED_INSTANCES.md):
 * `AUTOSEO_SMTP_URL=smtp://user:pass@host:587` (STARTTLS) or `smtps://user:pass@host:465` (TLS),
 * user and password URL-encoded. Pure so it can be unit tested.
 */
export type SmtpUrlInput = {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  password?: string;
};

export function buildSmtpUrl(s: SmtpUrlInput): string | null {
  const host = s.host?.trim();
  if (!host) return null;
  const port = Number(s.port) || (s.secure ? 465 : 587);
  // Same rule the cloud uses for its own transport: implicit TLS on 465 (or when "secure" is on).
  const scheme = port === 465 || s.secure ? "smtps" : "smtp";
  const user = s.user?.trim() ?? "";
  const auth = user ? `${encodeURIComponent(user)}${s.password ? `:${encodeURIComponent(s.password)}` : ""}@` : "";
  const hostPart = host.includes(":") && !host.startsWith("[") ? `[${host}]` : host;
  return `${scheme}://${auth}${hostPart}:${port}`;
}

/** `AutoSEO Cloud <noreply@autoseo.codext.de>` (quoted when needed), or just the address without a name. */
export function buildMailFrom(fromName: string | undefined, fromEmail: string | undefined): string | null {
  const email = fromEmail?.trim();
  if (!email) return null;
  const name = fromName?.replace(/["<>\\\r\n]/g, "").trim();
  if (!name) return email;
  // RFC 5322 specials in a display name require quoting.
  return /[()<>\[\]:;@,.]/.test(name) ? `"${name}" <${email}>` : `${name} <${email}>`;
}

export type MailServer = SmtpUrlInput & { fromName?: string; fromEmail?: string };

export function isMailServerConfigured(s: MailServer | null | undefined): s is MailServer {
  return !!(s?.host?.trim() && s.fromEmail?.trim());
}

/**
 * Which SMTP server customer instances get (AUTOSEO_SMTP_URL / AUTOSEO_MAIL_FROM): a dedicated "customer
 * instances" server when one is configured; otherwise the main server if sharing is on; otherwise none.
 */
export function instanceMailServer(
  main: MailServer & { shareWithInstances: boolean },
  dedicated: MailServer | null,
): { source: "dedicated" | "shared" | "none"; smtpUrl: string | null; mailFrom: string | null } {
  const pick = (s: MailServer) => ({ smtpUrl: buildSmtpUrl(s), mailFrom: buildMailFrom(s.fromName, s.fromEmail) });
  if (isMailServerConfigured(dedicated)) return { source: "dedicated", ...pick(dedicated) };
  if (main.shareWithInstances && isMailServerConfigured(main)) return { source: "shared", ...pick(main) };
  return { source: "none", smtpUrl: null, mailFrom: null };
}
