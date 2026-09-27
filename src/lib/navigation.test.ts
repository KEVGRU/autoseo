import { describe, expect, it } from "vitest";
import { settingsNav, showWorkspaceNav, workspaceNav } from "./navigation";

describe("workspace nav", () => {
  it("shows cross-project pages only for agency-style access", () => {
    expect(showWorkspaceNav([])).toBe(false);
    expect(showWorkspaceNav([{ isPitch: false }])).toBe(false);
    expect(showWorkspaceNav([{ isPitch: true }])).toBe(true);
    expect(showWorkspaceNav([{}, {}])).toBe(true);
  });
  it("keeps Portfolio out of the settings menu", () => {
    expect(workspaceNav.map((i) => i.href)).toContain("/portfolio");
    expect(settingsNav.map((i) => i.href)).not.toContain("/portfolio");
  });
});
