import type { FeaturePage } from "../../types";

export default {
  slug: "rank-tracking",
  nav: "Rank tracking",
  summary: "Track Google positions on desktop and mobile, by country or city, on your schedule.",
  meta: {
    title: "Rank Tracker for Desktop, Mobile & Local SEO",
    description:
      "Track Google rankings on desktop and mobile by country or city. Open-source rank tracker with daily, weekly or monthly checks, SERP features and movers.",
  },
  hero: {
    eyebrow: "Rank tracker",
    title: "Rank tracking for the keywords that matter.",
    muted: "Desktop, mobile and local.",
    subtitle:
      "Track up to 1,000 keywords per domain in any of 143 markets, down to the city. AutoSEO checks Google daily, weekly or monthly and shows positions, movers, SERP features and an estimated visibility score — for your site and your competitors.",
  },
  visual: "rankchart",
  screenshot: {
    src: "/screenshots/rank-tracking.png",
    alt: "AutoSEO rank tracking with a position distribution chart and keyword positions over time",
    url: "seo/rank-tracking",
  },
  stats: [
    { value: 1000, label: "Keywords per domain", note: "Up to 500 tracked domains per project" },
    { value: 143, label: "Markets", note: "Country, language and city" },
    { value: 100, label: "Results deep", note: "SERP depth from 10 to 100" },
    { value: 0, prefix: "$", label: "Self-hosted", note: "MIT licensed, every feature" },
  ],
  why: {
    eyebrow: "Why it matters",
    title: "Rankings still drive the clicks.",
    muted: "And they move every week.",
    body: "Organic results remain a main source of search traffic, and Google now places AI Overviews, People Also Ask and local packs above them. A rank tracker tells you when a page slips, which competitor took its place and what now sits above you.",
    points: [
      {
        title: "Averages hide the details",
        body: "Search Console averages positions across queries, devices and locations. A rank tracker checks the exact keyword, device and place you care about.",
      },
      {
        title: "Mobile and local results differ",
        body: "The same keyword can rank on page one on desktop and page two on mobile, or change from one city to the next.",
      },
      {
        title: "Competitors move too",
        body: "Tracking competitor domains for the same keywords shows who gains when you lose — and where to respond first.",
      },
    ],
  },
  capabilities: {
    eyebrow: "What you can track",
    title: "Every position that matters,",
    muted: "keyword by keyword.",
    items: [
      {
        icon: "trending-up",
        title: "Desktop and mobile positions",
        body: "Check each keyword on desktop, mobile or both, with the ranking URL and the change since the previous check.",
      },
      {
        icon: "map-pin",
        title: "Country and city targeting",
        body: "Track nationally in 143 markets or pick a city, county or region for local results, with local search volume.",
      },
      {
        icon: "gauge",
        title: "Visibility and movers",
        body: "An estimated share of available clicks, keywords in the top 3 and top 10, and what improved or declined over 1, 7, 30 or 90 days.",
      },
      {
        icon: "calendar",
        title: "History and trends",
        body: "A position distribution chart, a by-date matrix of every check with up and down arrows, and a trend chart per keyword.",
      },
      {
        icon: "eye",
        title: "SERP features",
        body: "See which features appear for each keyword — AI Overviews, featured snippets, People Also Ask, local packs, videos, shopping and more.",
      },
      {
        icon: "swords",
        title: "Competitor domains",
        body: "Track any domain, not only your own, and start from keyword suggestions based on what the domain already ranks for.",
      },
    ],
  },
  steps: {
    eyebrow: "How it works",
    title: "From keyword list to ranking report",
    muted: "in three steps.",
    items: [
      {
        title: "Add a domain and a market",
        body: "Enter your domain or a competitor's, choose country and language, optionally a city, and pick desktop, mobile or both.",
      },
      {
        title: "Add keywords and a schedule",
        body: "Paste your keywords or pick suggestions, then choose daily, weekly, monthly or manual checks. AutoSEO shows the estimated cost per check and per month.",
      },
      {
        title: "Follow positions and movers",
        body: "Every check is stored. Compare periods, filter by position, volume or difficulty, and export the table to CSV or Google Sheets.",
      },
    ],
  },
  faq: [
    {
      q: "What is a rank tracker?",
      a: "A rank tracker checks where your pages appear in Google for a fixed list of keywords and records the positions over time. AutoSEO's rank tracker checks desktop and mobile results by country or city and adds search volume, difficulty, SERP features and the ranking URL.",
    },
    {
      q: "How often are rankings checked?",
      a: "You choose per tracked domain: daily, weekly, monthly or only when you click Check rankings. Scheduled checks use DataForSEO's standard task queue, which costs about 30% of a live check.",
    },
    {
      q: "Can I track local rankings by city?",
      a: "Yes. Besides the country, you can pick a city, county or region, and AutoSEO checks the results for that location. The keyword table then shows local search volume.",
    },
    {
      q: "Can I track my competitors' rankings?",
      a: "Yes. Any domain can be a tracked domain, so you can follow competitors with the same keywords, market and devices as your own site. A project can track up to 500 domains.",
    },
    {
      q: "How many keywords can I track?",
      a: "Up to 1,000 keywords per tracked domain and up to 500 tracked domains per project. Daily and monthly spend limits keep data costs under control.",
    },
    {
      q: "Does the rank tracker show AI Overviews?",
      a: "Yes. AutoSEO flags the SERP features on each result page, including AI Overviews, featured snippets and People Also Ask. To see what AI Overviews actually say about your brand, use AI visibility tracking.",
    },
    {
      q: "What does rank tracking cost?",
      a: "Rank tracking is part of the free, open-source AutoSEO app. Each SERP check is a paid DataForSEO request whose price depends on the number of keywords, devices and the tracked depth, and AutoSEO shows an estimate before you save a schedule. When you self-host, DataForSEO bills you directly; AutoSEO Cloud gives you a managed workspace for $50 per month with $10 of AI and data usage included.",
    },
  ],
  related: ["keyword-research", "site-audit", "ai-visibility-tracking", "report-builder"],
  cta: {
    title: "Know where you rank — every week",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies FeaturePage;
