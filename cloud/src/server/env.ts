import path from "node:path";

/**
 * The only environment configuration the cloud app reads. Integration credentials (SMTP, Stripe,
 * Coolify) are entered in /admin and stored encrypted in the database; the shared-app connection
 * (docs/CLOUD.md) comes from the Coolify-generated secrets in docker-compose.yml.
 */
function normalizeDomain(raw: string | undefined): string {
  const value = (raw ?? "").trim();
  if (!value) return "autoseo.codext.de";
  return value.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

const domain = normalizeDomain(process.env.DOMAIN);
const trimUrl = (raw: string | undefined) => (raw ?? "").trim().replace(/\/+$/, "");
const isLocal = /^(localhost|127\.0\.0\.1|\[::1\]|[^.]+\.localhost|.+\.test)(:\d+)?$/.test(domain);

export const env = {
  domain,
  /** Public base URL, e.g. https://autoseo.codext.de (no trailing slash). */
  appUrl: process.env.APP_URL?.trim().replace(/\/+$/, "") || `${isLocal ? "http" : "https"}://${domain}`,
  isLocal,
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: process.env.DATABASE_URL ?? "postgres://autoseo:autoseo@localhost:54329/autoseo_cloud",
  dataDir: process.env.DATA_DIR ?? path.join(process.cwd(), "data"),
  adminEmails: (process.env.ADMIN_EMAILS ?? "")
    .split(/[\s,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  /** The operator's email (also the shared app's owner); receives the weekly growth digest. */
  operatorEmail: process.env.OPERATOR_EMAIL?.trim().toLowerCase() ?? "",
  /** The shared AutoSEO instance every Cloud workspace lives in (docs/CLOUD.md). */
  sharedApp: {
    /** Tenant API base on the Docker network, e.g. http://app:3000. */
    internalUrl: trimUrl(process.env.CLOUD_APP_INTERNAL_URL),
    /** Public URL customers open, e.g. https://app.autoseo.codext.de. */
    publicUrl: trimUrl(process.env.CLOUD_APP_URL) || "https://app.autoseo.codext.de",
    apiSecret: process.env.CLOUD_API_SECRET?.trim() ?? "",
    ssoSecret: process.env.CLOUD_SSO_SECRET?.trim() ?? "",
  },
};

/** New workspaces go to the shared instance when its tenant API is configured (otherwise: dedicated Coolify). */
export function isSharedBackendConfigured(): boolean {
  return !!(env.sharedApp.apiSecret && env.sharedApp.internalUrl);
}

export function isAdminEmail(email: string): boolean {
  return env.adminEmails.includes(email.trim().toLowerCase());
}
