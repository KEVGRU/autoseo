// Per-workspace third-party provider credentials ("bring your own key"), e.g. a customer's own DataForSEO account on
// a shared AutoSEO Cloud instance. Owned by the enrichment module; see src/server/dataforseo/credentials.ts.
import { pgTable, text, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { id, createdAt, updatedAt, ts } from "./_helpers";
import { users, workspaces } from "./core";

export type WorkspaceProviderConfig = {
  /** DataForSEO API login (email). */
  login?: string;
  /** Use sandbox.dataforseo.com. */
  sandbox?: boolean;
  /** Enrichment mode for this workspace: auto (own DataForSEO when set, else AI) | dataforseo only | ai only. */
  mode?: "auto" | "dataforseo" | "ai";
};

export const workspaceProviderCredentials = pgTable(
  "workspace_provider_credentials",
  {
    id: id("wpc"),
    workspaceId: text()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    provider: text({ enum: ["dataforseo"] }).notNull(),
    config: jsonb().$type<WorkspaceProviderConfig>().notNull().default({}),
    /** encryptJson({ password }) — never sent to the browser. Null = no own credentials (mode only). */
    secret: text(),
    /** Result of the last connection test. */
    status: text({ enum: ["untested", "ok", "error"] })
      .notNull()
      .default("untested"),
    lastTestedAt: ts(),
    lastError: text(),
    updatedBy: text().references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("workspace_provider_credentials_uq").on(t.workspaceId, t.provider)],
);
