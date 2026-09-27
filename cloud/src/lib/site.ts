/** Public facts about the product used across the marketing site, metadata and emails. */
export const site = {
  name: "AutoSEO",
  tagline: "Open-source AI SEO & GEO platform",
  description:
    "AutoSEO is the open-source AI visibility and SEO platform. Track how ChatGPT, Perplexity, Gemini, Claude and Google AI Overviews mention your brand, research keywords, track rankings, audit your site and automate content — self-host for free or get your own managed instance for $50/month.",
  url: (process.env.APP_URL ?? `https://${process.env.DOMAIN ?? "autoseo.codext.de"}`).replace(/\/+$/, ""),
  github: "https://github.com/codextde/autoseo",
  image: "ghcr.io/codextde/autoseo",
  priceMonthlyUsd: 50,
  /** Regular price of the yearly plan (12 × monthly). New customers only get it with the launch offer below. */
  priceYearlyUsd: 600,
  /**
   * Launch offer: the first year of the yearly plan at `percentOff` (then it renews at `priceYearlyUsd`), for the
   * first `maxRedemptions` customers until `endsAt` (end of Sep 30 in US Pacific time). Stripe enforces both limits
   * through the coupon `couponId` (src/server/stripe.ts); the site hides the offer once either is reached.
   */
  launchOffer: {
    couponId: "autoseo_launch50",
    percentOff: 50,
    maxRedemptions: 100,
    endsAt: "2026-10-01T06:59:59Z",
  },
  company: "Codext GmbH",
  contactEmail: "info@codext.de",
  /** Canonical public host of the marketing site (used in copy, e.g. install one-liner and instance hosts). */
  host: "autoseo.codext.de",
  /** AutoSEO Cloud plan limits per workspace (see docs/CLOUD.md). */
  cloudPlan: { projects: 10, includedUsageUsd: 10 },
  /** Raw installer served via the `/install` redirect. */
  installScript: "https://raw.githubusercontent.com/codextde/autoseo/main/deploy/install.sh",
  composeFile: "https://raw.githubusercontent.com/codextde/autoseo/main/deploy/docker-compose.yml",
  /** Date the legal pages were last reviewed (ISO). */
  legalUpdated: "2026-09-27",
  /** Legal entity as published at https://www.codext.de/impressum. */
  legal: {
    name: "Codext GmbH",
    street: "Frankenstraße 10",
    postalCode: "74549",
    city: "Wolpertshausen",
    country: "Deutschland",
    countryCode: "DE",
    managingDirector: "Daniel Ehrhardt",
    registerCourt: "Amtsgericht Stuttgart",
    registerNumber: "HRB 772091",
    vatId: "DE327501500",
    phone: "+49 7904 5203106",
    email: "kontakt@codext.de",
    website: "https://www.codext.de",
  },
  /** Third-party conversion tracking — loaded only with the visitor's consent (components/analytics/consent.tsx). */
  tracking: {
    xPixel: {
      id: "r1my5",
      events: {
        pageView: "tw-r1my5-r1n3u",
        addToCart: "tw-r1my5-r1my9",
        download: "tw-r1my5-r1my8",
        lead: "tw-r1my5-r1my7",
        purchase: "tw-r1my5-r1my6",
      },
    },
  },
} as const;

/** Absolute URL for a site path. */
export function absoluteUrl(path = "/") {
  return path === "/" ? site.url : `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
