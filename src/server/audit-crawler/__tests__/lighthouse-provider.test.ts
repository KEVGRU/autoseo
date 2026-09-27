import { describe, expect, it } from "vitest";
import { auditLighthouseProviders, lighthouseProvidersLabel, providerOfSource } from "../lighthouse/provider-label";

describe("Lighthouse provider labels", () => {
  it("maps a report source to the provider that produced it", () => {
    expect(providerOfSource("pagespeed-insights")).toBe("psi");
    expect(providerOfSource("dataforseo-lighthouse")).toBe("dataforseo");
  });

  it("uses the providers of finished checks, else the configured provider", () => {
    // Started with DataForSEO, every check answered by PSI (account missing / 401 / 402).
    expect(auditLighthouseProviders(["psi", "psi"], "dataforseo")).toEqual(["psi"]);
    expect(auditLighthouseProviders(["dataforseo", "psi"], "dataforseo")).toEqual(["psi", "dataforseo"]);
    expect(auditLighthouseProviders([], "dataforseo")).toEqual(["dataforseo"]);
    expect(auditLighthouseProviders(["unknown"], "psi")).toEqual(["psi"]);
  });

  it("labels one or several providers", () => {
    expect(lighthouseProvidersLabel(["psi"])).toBe("PageSpeed Insights");
    expect(lighthouseProvidersLabel(["psi", "dataforseo"])).toBe("PageSpeed Insights + DataForSEO Lighthouse");
  });
});
