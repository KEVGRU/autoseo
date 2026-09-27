import type { PlatformPage } from "../../types";

export default {
  slug: "gemini",
  name: "Gemini",
  vendor: "Google",
  nav: "Gemini tracking",
  summary: "See when Gemini mentions your brand, and which sources ground its answers.",
  meta: {
    title: "Gemini Visibility Tracker: Mentions & Sources",
    description:
      "Track how Google Gemini mentions, cites and ranks your brand against competitors, with the sources behind each answer. Open-source Gemini visibility tracker.",
  },
  hero: {
    eyebrow: "Gemini visibility tracker",
    title: "See how Gemini presents your brand",
    muted: "— and what it's based on.",
    subtitle:
      "Gemini can ground its answers in Google Search. AutoSEO runs the prompts your customers ask on Gemini, stores every answer and shows whether you're mentioned, how you're described, which competitors appear next to you and which sources Gemini uses.",
  },
  demo: {
    prompt: "Which tools show how AI assistants talk about my brand?",
    answer:
      "Acme tracks how assistants like Gemini and ChatGPT mention your brand, which sources they cite and how you compare with competitors.",
    citations: ["acme.com", "g2.com", "reddit.com"],
  },
  why: {
    eyebrow: "Why Gemini matters",
    title: "Gemini answers with Google Search.",
    muted: "Your search presence carries over.",
    body: "Gemini is Google's AI assistant. When it grounds an answer in Google Search, the pages it finds decide which brands it mentions and how it describes them.",
    points: [
      {
        title: "Grounded in Google Search",
        body: "Gemini can run Google searches before it answers. The results it uses become the sources behind the answer.",
      },
      {
        title: "A different view than other assistants",
        body: "Gemini relies on Google's index, other assistants on their own. Your visibility can be strong in one and missing in another.",
      },
      {
        title: "Answers shift over time",
        body: "Model updates and new search results change answers without notice. Scheduled tracking shows when and where it happened.",
      },
    ],
  },
  method: {
    eyebrow: "How AutoSEO tracks Gemini",
    title: "Two live ways to collect Gemini answers,",
    muted: "plus a simulation.",
    body: "AutoSEO supports two live backends for Gemini, plus an AI simulation as a fallback. On AutoSEO Cloud, engines run through the providers the Codext team has connected; usage counts toward the included allowance. On a self-hosted instance, an admin connects DataForSEO or adds a key in Admin → AI Providers and can pin one backend.",
    items: [
      {
        title: "DataForSEO",
        body: "Gemini answers with web search and their sources. Self-hosters pay DataForSEO directly; on AutoSEO Cloud, usage counts toward the included allowance.",
      },
      {
        title: "Gemini API key",
        body: "On a self-hosted instance, add your own Gemini key in Admin → AI Providers and AutoSEO asks Gemini with Google Search grounding, including the searches it ran.",
      },
      {
        title: "AI simulation as a fallback",
        body: "If no real backend is available, an AI model with web search can answer in place of Gemini. These answers are labeled “Simulated” and meant as a directional estimate: a real backend always takes priority, and admins can switch the fallback off.",
      },
    ],
  },
  tracked: {
    eyebrow: "What gets tracked",
    title: "Everything Gemini says about your brand",
    items: [
      {
        icon: "radar",
        title: "Brand mentions",
        body: "Whether Gemini names your brand for each prompt, and the mention rate over time.",
      },
      {
        icon: "link",
        title: "Grounding sources",
        body: "The pages behind Gemini's answers, stored as real URLs and grouped by domain.",
      },
      {
        icon: "swords",
        title: "Share of voice",
        body: "Which competitors Gemini recommends next to you, and in which position.",
      },
      {
        icon: "heart",
        title: "Sentiment and framing",
        body: "How Gemini describes you: the praise, the criticism and the attributes it repeats.",
      },
      {
        icon: "git-fork",
        title: "Query fan-outs",
        body: "The Google searches Gemini runs to ground an answer, when the backend returns them.",
      },
      {
        icon: "map-pin",
        title: "Markets and languages",
        body: "The same prompt asked for different countries and languages, compared side by side.",
      },
    ],
  },
  crawlers: {
    eyebrow: "Google's crawlers",
    title: "Make sure Gemini can read your site",
    body: "Gemini grounds answers in Google Search, which Googlebot builds. Google-Extended isn't a crawler but a robots.txt token. AutoSEO's crawlability check tests your robots.txt and pages against each of them, and bot analytics shows how often Googlebot and GoogleOther visit.",
    bots: [
      { token: "Googlebot", purpose: "Crawls and indexes pages for Google Search, which Gemini uses for grounding" },
      {
        token: "Google-Extended",
        purpose: "No crawler of its own: a robots.txt token that controls whether your content may be used for Gemini models",
      },
      { token: "GoogleOther", purpose: "Google's general-purpose crawler for research and development, outside of Search" },
    ],
  },
  faq: [
    {
      q: "How do I track my brand's visibility in Gemini?",
      a: "Add the prompts your customers ask, select Gemini as an engine and set a schedule. AutoSEO runs the prompts with search grounding, stores every answer and reports mention rate, citation rate, position and sentiment for your brand and competitors.",
    },
    {
      q: "Does Gemini use Google Search to answer?",
      a: "It can, and AutoSEO always runs Gemini with search turned on. Answers come with the sources Gemini used, which show the pages that shape what it says about you.",
    },
    {
      q: "Is Gemini tracking the same as Google AI Overviews?",
      a: "No. Gemini is Google's assistant, while AI Overviews and AI Mode are part of Google Search. AutoSEO tracks all three as separate engines, so you can compare them for the same prompts.",
    },
    {
      q: "Do I need a Gemini API key?",
      a: "Not on AutoSEO Cloud — you don't manage provider keys there; engines run through the providers the Codext team has connected (ask us which are enabled). When you self-host, you can collect Gemini answers through DataForSEO, billed pay-as-you-go, or add your own Gemini key in Admin → AI Providers. Both return answers grounded in search.",
    },
    {
      q: "How do I improve my visibility in Gemini?",
      a: "Make sure Googlebot can crawl and index your pages, publish content that answers the prompts you track, and get mentioned on the sources Gemini already uses. AutoSEO turns those gaps into prioritized tasks.",
    },
    {
      q: "How often is Gemini data updated?",
      a: "As often as your project schedule says: daily, weekly or monthly. Every run is stored, so you can compare any two periods and see what changed.",
    },
  ],
  cta: {
    title: "Find out what Gemini says about you",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies PlatformPage;
