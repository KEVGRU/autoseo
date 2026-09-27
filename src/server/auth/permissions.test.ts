import { describe, expect, it } from "vitest";
import {
  ALL_PERMISSIONS,
  BACKFILLED_PERMISSIONS,
  BUILTIN_ROLES,
  CUSTOM_ROLE_BACKFILL,
  PROJECT_SCOPED_PERMISSIONS,
  isProjectScopedPermission,
} from "./permissions";

const role = (key: string) => BUILTIN_ROLES.find((r) => r.key === key)!;

describe("export / share permissions", () => {
  it("owner, admin and member keep exporting and sharing; client only views", () => {
    for (const key of ["owner", "admin", "member"]) {
      expect(role(key).permissions).toContain("data.export");
      expect(role(key).permissions).toContain("reports.share");
    }
    expect(role("client").permissions).toEqual(["project.view"]);
  });

  it("backfills the new permissions into existing built-in roles once", () => {
    expect(BACKFILLED_PERMISSIONS).toEqual(expect.arrayContaining(["data.export", "reports.share"]));
  });

  it("keeps today's behaviour for custom roles", () => {
    const share = CUSTOM_ROLE_BACKFILL["reports.share"]!;
    const exp = CUSTOM_ROLE_BACKFILL["data.export"]!;
    expect(share(["project.view", "reports.manage"])).toBe(true);
    expect(share(["project.view"])).toBe(false);
    // Roles that could change something in a project could export before (CSV buttons were ungated) …
    expect(exp(["project.view", "prompts.manage"])).toBe(true);
    expect(exp(["project.view", "seo.run"])).toBe(true);
    // … read-only roles are treated like "Client": no export unless granted.
    expect(exp(["project.view"])).toBe(false);
    expect(exp(["prompts.manage"])).toBe(false);
  });
});

describe("permission scopes", () => {
  it("classifies project and workspace permissions", () => {
    for (const p of ["project.view", "prompts.manage", "seo.run", "reports.manage", "reports.share", "data.export", "alerts.manage", "projects.manage"]) {
      expect(isProjectScopedPermission(p)).toBe(true);
    }
    for (const p of ["members.manage", "settings.manage", "workspace.manage", "admin.access", "projects.all", "usage.view", "agents.manage", "team.view"]) {
      expect(isProjectScopedPermission(p)).toBe(false);
    }
    expect(isProjectScopedPermission("nope")).toBe(false);
  });

  it("only lists known permissions", () => {
    for (const p of PROJECT_SCOPED_PERMISSIONS) expect(ALL_PERMISSIONS).toContain(p);
  });
});
