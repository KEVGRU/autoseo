import { sql } from "drizzle-orm";
import { pgTable, text, boolean, integer, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { id, createdAt, updatedAt, ts } from "./_helpers";
import { users, workspaces } from "./core";

/* ─────────────────────────── Single sign-on (OIDC) ─────────────────────────── */

/**
 * Email domains a workspace claims for SSO. A claim only counts once it is verified (DNS TXT record
 * `autoseo-verification=<token>` on the domain, or confirmed by an instance admin); a verified domain belongs to
 * exactly one workspace (partial unique index), unverified claims can't block the real owner.
 */
export const workspaceDomains = pgTable(
  "workspace_domains",
  {
    id: id("wdm"),
    workspaceId: text()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    domain: text().notNull(),
    verificationToken: text().notNull(),
    verifiedAt: ts(),
    /** "dns" = TXT record found, "admin" = confirmed by an instance admin. */
    verifiedVia: text({ enum: ["dns", "admin"] }),
    /** Last successful DNS confirmation — DNS-verified domains only count for SSO while this is recent. */
    confirmedAt: ts(),
    /** Consecutive failed daily re-checks; the verification is dropped after 3. */
    failedChecks: integer().notNull().default(0),
    lastCheckedAt: ts(),
    lastError: text(),
    createdBy: text().references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("workspace_domains_ws_domain_uq").on(t.workspaceId, t.domain),
    uniqueIndex("workspace_domains_verified_uq").on(t.domain).where(sql`${t.verifiedAt} IS NOT NULL`),
  ],
);

/** A workspace's own OpenID Connect provider (Entra ID, Okta, Google Workspace, Keycloak …). One per workspace. */
export const workspaceSsoProviders = pgTable("workspace_sso_providers", {
  id: id("wsso"),
  workspaceId: text()
    .notNull()
    .unique()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: text().notNull().default("Single sign-on"),
  enabled: boolean().notNull().default(false),
  issuerUrl: text().notNull(),
  clientId: text().notNull(),
  /** AES-GCM encrypted client secret (server/crypto `encryptJson`). */
  clientSecret: text(),
  scopes: text().notNull().default("openid email profile"),
  /** Create accounts for people from the verified domains on their first SSO sign-in. */
  jitProvisioning: boolean().notNull().default(true),
  defaultRoleKey: text().notNull().default("member"),
  /** ID token claim holding the user's IdP groups (e.g. "groups", "roles"). */
  groupClaim: text().notNull().default("groups"),
  /** IdP group value → role key, applied when a person joins the workspace via SSO. */
  groupRoleMap: jsonb().$type<Record<string, string>>().notNull().default({}),
  /** Disable magic links for the verified domains — members must sign in through this provider. */
  enforceSso: boolean().notNull().default(false),
  createdBy: text().references(() => users.id, { onDelete: "set null" }),
  updatedBy: text().references(() => users.id, { onDelete: "set null" }),
  lastLoginAt: ts(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/** Links an IdP subject (`iss` + `sub`) to a user — a subject can never sign in as a different user later. */
export const ssoIdentities = pgTable(
  "sso_identities",
  {
    id: id("sid"),
    /** "instance" or the workspace_sso_providers id the identity signed in through last. */
    providerKey: text().notNull(),
    issuer: text().notNull(),
    subject: text().notNull(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    email: text().notNull(),
    lastLoginAt: ts(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("sso_identities_subject_uq").on(t.issuer, t.subject), index("sso_identities_user_idx").on(t.userId)],
);
