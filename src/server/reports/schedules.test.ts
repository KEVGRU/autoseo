import { describe, expect, it } from "vitest";
import { formatAllowed } from "@/features/reports/lib/schedule";
import { schedulePatchPermissions, schedulePermissions } from "./schedules";

describe("schedule permissions", () => {
  it("public link formats need reports.share, attached PPTX needs data.export", () => {
    expect(schedulePermissions("link")).toEqual(["reports.manage", "reports.share"]);
    expect(schedulePermissions("pptx")).toEqual(["reports.manage", "data.export"]);
    expect(schedulePermissions("both")).toEqual(["reports.manage", "reports.share", "data.export"]);
  });
  it("edits are checked against the resulting format; pausing alone only needs reports.manage", () => {
    expect(schedulePatchPermissions("both", { enabled: false })).toEqual(["reports.manage"]);
    expect(schedulePatchPermissions("both", { enabled: true })).toEqual(["reports.manage", "reports.share", "data.export"]);
    expect(schedulePatchPermissions("both", { format: "link", enabled: false })).toEqual(["reports.manage", "reports.share"]);
    expect(schedulePatchPermissions("pptx", { hour: 9, recipients: undefined })).toEqual(["reports.manage", "data.export"]);
  });
  it("the UI mirror agrees", () => {
    const none = { share: false, export: false };
    expect(formatAllowed("link", { share: true, export: false })).toBe(true);
    expect(formatAllowed("both", { share: true, export: false })).toBe(false);
    expect(formatAllowed("pptx", { share: false, export: true })).toBe(true);
    expect(formatAllowed("both", { share: true, export: true })).toBe(true);
    expect((["link", "pptx", "both"] as const).some((f) => formatAllowed(f, none))).toBe(false);
  });
});
