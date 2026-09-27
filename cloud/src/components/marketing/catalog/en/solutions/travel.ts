import type { SolutionPage } from "../../types";

export default {
  slug: "travel",
  nav: "For travel & hospitality",
  summary: "Track which hotels, airlines and tours AI recommends in every source market.",
  meta: {
    title: "AI Visibility for Travel & Hospitality Brands",
    description:
      "Track whether ChatGPT, Gemini and Google AI Overviews recommend your hotel, airline or tours in 143 markets, and which travel sources they cite. Self-host free.",
  },
  hero: {
    eyebrow: "AutoSEO for travel",
    title: "AI visibility for travel and hospitality.",
    muted: "In every market your guests book from.",
    subtitle:
      "Travelers plan trips with AI assistants: where to stay, which airline to fly, which tour to book. AutoSEO tracks those answers across 16 AI engines and 143 markets, shows the sources behind them and measures the traffic and revenue AI platforms send you.",
  },
  visual: "globe",
  challenges: {
    eyebrow: "The challenge",
    title: "Trips are planned in the chat.",
    muted: "Guests arrive with a shortlist.",
    items: [
      {
        title: "Recommendations replace searches",
        body: "“Best family hotel in Lisbon” returns three names, not a page of results. If yours isn't one of them, you aren't considered.",
      },
      {
        title: "Every market asks differently",
        body: "Guests from Germany, the US and Japan ask in their own language and get different answers. Data from one market says little about the next.",
      },
      {
        title: "Policies and prices change often",
        body: "Baggage rules, cancellation terms and amenities change by season. AI answers can repeat old information long after you updated it.",
      },
    ],
  },
  workflow: {
    eyebrow: "How travel brands use AutoSEO",
    title: "From inspiration to booking,",
    muted: "one workflow.",
    items: [
      {
        icon: "globe",
        title: "Track every source market",
        body: "Run prompts in the countries and languages your guests book from — 143 markets, 16 engines, on a schedule.",
        feature: "ai-visibility-tracking",
      },
      {
        icon: "link",
        title: "Get listed where AI looks",
        body: "Travel guides, listicles, reviews, forums and videos: see which pages engines cite and where competitors appear instead of you.",
        feature: "ai-citation-tracking",
      },
      {
        icon: "git-fork",
        title: "See how engines research trips",
        body: "Query fan-outs show the searches engines run behind a recommendation, from “pet-friendly” to “near the beach”.",
        feature: "query-fanout-analysis",
      },
      {
        icon: "shield-check",
        title: "Correct outdated policies",
        body: "Upload terms, baggage rules or amenity lists. AutoSEO flags AI statements that contradict them or only match an older version.",
        feature: "ai-fact-check",
      },
      {
        icon: "chart",
        title: "Measure bookings from AI",
        body: "Sessions, conversions and revenue from ChatGPT, Perplexity and other AI platforms, straight from Google Analytics 4.",
        feature: "ai-traffic-analytics",
      },
      {
        icon: "file-text",
        title: "Create content for trip planning",
        body: "Briefs and drafts for destination and property pages, built from tracked prompts and cited sources, published to your CMS.",
        feature: "ai-content-optimization",
      },
    ],
  },
  prompts: {
    eyebrow: "Example prompts",
    title: "Prompts travel brands track",
    items: [
      "Best family-friendly hotels in Lisbon with a pool",
      "Boutique hotels near the old town in Prague",
      "Which airline has the best economy seats for long-haul flights?",
      "Is Acme Travel reliable for package holidays?",
      "What is Acme Air's cabin baggage allowance?",
      "Where to go hiking in the Alps in early summer",
      "Acme Resorts vs. other all-inclusive resorts in Mallorca",
    ],
  },
  outcomes: {
    eyebrow: "Why travel brands choose AutoSEO",
    title: "Show up when trips are planned,",
    muted: "in every language.",
    items: [
      {
        title: "Visibility by source market",
        body: "Compare how you appear in each country and language, and focus on the markets that matter most to you.",
      },
      {
        title: "Wrong answers found early",
        body: "Fact checks run daily and flag AI statements that differ from your current terms and policies.",
      },
      {
        title: "Revenue in view",
        body: "AI traffic analytics and attribution show which assistants send guests who actually book.",
      },
    ],
  },
  faq: [
    {
      q: "How do hotels track their visibility in ChatGPT?",
      a: "Add the prompts guests ask — by destination, trip type and amenities — and AutoSEO runs them on ChatGPT, Perplexity, Gemini, Google AI Overviews and more. You see whether your property is mentioned, where it's ranked and which sources the answer cites.",
    },
    {
      q: "Can AutoSEO track AI answers in different countries and languages?",
      a: "Yes. Every prompt runs in the market and language you choose, with 143 markets available, so you can compare the answers guests from Germany, the UK, the US or any other source market get.",
    },
    {
      q: "How do I see bookings that come from AI assistants?",
      a: "Connect Google Analytics 4 to see sessions, conversions and revenue per AI platform. Attribution adds a “How did you hear about us?” question and merges the answers with your orders, so AI search also shows up where analytics can't see it.",
    },
    {
      q: "What if AI gives wrong information about our policies?",
      a: "Add your current terms, baggage rules or amenity lists as reference documents. The fact check compares what AI engines say about your offers with them and lists every deviation with the AI quote, the matching passage and a severity.",
    },
    {
      q: "Can we manage many properties or destinations?",
      a: "Yes. Use one project per property, brand or destination and give each team access to its own projects only. AutoSEO Cloud includes up to 10 projects per workspace; self-hosted AutoSEO has no project limit.",
    },
    {
      q: "How much does AutoSEO cost?",
      a: "Self-hosting is free with every feature and no limits. AutoSEO Cloud costs $50 per workspace per month plus VAT, for business customers, with unlimited users, up to 10 projects and $10 of AI and data usage included each month. When you self-host, third-party usage such as DataForSEO or AI API keys is billed by those providers.",
    },
  ],
  related: ["e-commerce", "automotive", "content-teams"],
  cta: {
    title: "Find out which trips AI plans with you",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies SolutionPage;
