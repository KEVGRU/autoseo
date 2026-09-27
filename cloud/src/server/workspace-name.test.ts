import { describe, expect, it } from "vitest";
import { validateWorkspaceName } from "./workspace-name";

describe("validateWorkspaceName", () => {
  it("accepts ordinary names and trims them", () => {
    expect(validateWorkspaceName("  Acme & Co. (EU) – SEO ")).toEqual({ ok: true, value: "Acme & Co. (EU) – SEO" });
  });
  it("rejects empty and overly long names", () => {
    expect(validateWorkspaceName("   ").ok).toBe(false);
    expect(validateWorkspaceName(null).ok).toBe(false);
    expect(validateWorkspaceName("a".repeat(81)).ok).toBe(false);
  });
  it.each(["{{team.SECRET}}", "${DATABASE_URL}", "back`tick", "line\nbreak", "cost $5"])("rejects template syntax / control characters: %s", (name) => {
    expect(validateWorkspaceName(name)).toEqual({ ok: false, error: "The workspace name contains invalid characters." });
  });
});
