import { describe, expect, it } from "vitest";
import { isAdVisit, readAdParams } from "./ad-params";

describe("readAdParams", () => {
  it("reads utm values and the X click id network, not its value", () => {
    const ad = readAdParams("?utm_source=x&utm_medium=paid_social&utm_campaign=launch_sep26&utm_content=ad4_video&twclid=SECRET");
    expect(ad).toEqual({
      utm: { source: "x", medium: "paid_social", campaign: "launch_sep26", content: "ad4_video" },
      clickSource: "x",
    });
    expect(JSON.stringify(ad)).not.toContain("SECRET");
  });

  it("accepts URLSearchParams and ignores empty values", () => {
    expect(readAdParams(new URLSearchParams("utm_source=&gclid=abc&token=secret"))).toEqual({ utm: {}, clickSource: "google" });
    expect(readAdParams("")).toEqual({ utm: {}, clickSource: null });
  });

  it("caps long values", () => {
    expect(readAdParams(`?utm_campaign=${"a".repeat(300)}`).utm.campaign).toHaveLength(200);
  });
});

describe("isAdVisit", () => {
  it("is true for ad clicks and paid mediums", () => {
    expect(isAdVisit(readAdParams("?twclid=1"))).toBe(true);
    expect(isAdVisit(readAdParams("?utm_medium=paid_social"))).toBe(true);
    expect(isAdVisit(readAdParams("?utm_medium=Paid"))).toBe(true);
    expect(isAdVisit(readAdParams("?utm_medium=cpc&utm_source=google"))).toBe(true);
  });

  it("is false for organic links and newsletters", () => {
    expect(isAdVisit(readAdParams("?utm_source=chatgpt.com"))).toBe(false);
    expect(isAdVisit(readAdParams("?utm_medium=email"))).toBe(false);
    expect(isAdVisit(readAdParams(""))).toBe(false);
  });
});
