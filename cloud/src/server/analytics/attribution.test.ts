import { describe, expect, it } from "vitest";
import { attributionSummary, pickAttribution, stripeAttributionMetadata, type Touch } from "./attribution";

function touch(minutes: number, over: Partial<Touch> = {}): Touch {
  return {
    createdAt: new Date(Date.UTC(2026, 8, 27, 10, minutes)),
    channel: "Direct",
    path: "/",
    referrerHost: null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmContent: null,
    utmTerm: null,
    clickSource: null,
    country: null,
    ...over,
  };
}

describe("pickAttribution", () => {
  it("returns null without page views", () => {
    expect(pickAttribution([])).toBeNull();
  });

  it("credits the ad that brought the visitor, not the internal pages after it", () => {
    const attribution = pickAttribution([
      touch(3, { path: "/signup" }),
      touch(1, {
        path: "/pricing",
        channel: "Paid social",
        utmSource: "x",
        utmMedium: "paid_social",
        utmCampaign: "launch_sep26",
        utmContent: "ad4_video",
        clickSource: "x",
        country: "DE",
      }),
      touch(2, { path: "/self-hosting" }),
    ]);
    expect(attribution).toEqual({
      channel: "Paid social",
      source: "x",
      medium: "paid_social",
      campaign: "launch_sep26",
      content: "ad4_video",
      term: null,
      referrerHost: null,
      clickSource: "x",
      landingPath: "/pricing",
      country: "DE",
      firstSeenDay: "2026-09-27",
    });
    // No exact timestamp: it would link the account back to the anonymous page views.
    expect(JSON.stringify(attribution)).not.toMatch(/\d{2}:\d{2}/);
  });

  it("uses the most recent non-direct touch", () => {
    const attribution = pickAttribution([
      touch(1, { channel: "Organic search", referrerHost: "google.com", path: "/" }),
      touch(5, { channel: "AI assistants", referrerHost: "chatgpt.com", path: "/ai-visibility-check" }),
      touch(6, { path: "/signup" }),
    ]);
    expect(attribution?.channel).toBe("AI assistants");
    expect(attribution?.landingPath).toBe("/ai-visibility-check");
    expect(attribution?.firstSeenDay).toBe("2026-09-27");
  });

  it("falls back to direct with the earliest landing page", () => {
    const attribution = pickAttribution([touch(4, { path: "/signup", country: "AT" }), touch(2, { path: "/pricing" })]);
    expect(attribution?.channel).toBe("Direct");
    expect(attribution?.landingPath).toBe("/pricing");
    expect(attribution?.country).toBe("AT");
  });
});

describe("stripeAttributionMetadata", () => {
  it("prefixes keys with attr_ and leaves out empty values", () => {
    const attribution = pickAttribution([
      touch(1, { channel: "Paid social", utmSource: "x", utmMedium: "paid_social", utmCampaign: "launch_sep26", path: "/pricing" }),
    ]);
    const metadata = stripeAttributionMetadata(attribution);
    expect(metadata).toEqual({
      attr_channel: "Paid social",
      attr_source: "x",
      attr_medium: "paid_social",
      attr_campaign: "launch_sep26",
      attr_landing_path: "/pricing",
    });
    for (const [key, value] of Object.entries(metadata)) {
      expect(key.length).toBeLessThanOrEqual(40);
      expect(value.length).toBeLessThanOrEqual(500);
    }
  });

  it("is empty without attribution", () => {
    expect(stripeAttributionMetadata(null)).toEqual({});
    expect(attributionSummary(null)).toEqual({});
  });
});
