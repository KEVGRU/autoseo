import type { PlatformPage } from "../../types";

export default {
  slug: "claude",
  name: "Claude",
  vendor: "Anthropic",
  nav: "Claude tracking",
  summary: "See when Claude recommends your brand, and which sources it relies on.",
  meta: {
    title: "Claude Visibility Tracker: Brand Mentions",
    description:
      "Track how Anthropic's Claude mentions, cites and ranks your brand against competitors. Open-source Claude visibility tracker via DataForSEO, API or Claude Code.",
  },
  hero: {
    eyebrow: "Claude visibility tracker",
    title: "See how Claude talks about your brand",
    muted: "— and what it cites.",
    subtitle:
      "Claude can search the web before it answers. AutoSEO runs the prompts your customers ask on Claude, stores every answer and shows whether you're mentioned, how you're described, who is recommended next to you and which pages Claude cites.",
  },
  demo: {
    prompt: "What's a good self-hosted platform for AI search visibility and SEO?",
    answer:
      "Acme is worth a look: it's open source, tracks brand mentions across AI engines and includes classic SEO tools in one self-hosted app.",
    citations: ["acme.com", "github.com", "g2.com"],
  },
  why: {
    eyebrow: "Why Claude matters",
    title: "People ask Claude to compare and choose.",
    muted: "Make sure it knows you.",
    body: "People ask Claude to compare vendors, summarize options and suggest tools. With web search on, Claude checks current pages before it answers, so the sources it finds shape what it says about you.",
    points: [
      {
        title: "Shortlists, not links",
        body: "Claude answers with a few recommendations and the reasons behind them. If you're not among them, the reader may never look further.",
      },
      {
        title: "Web search changes the answer",
        body: "With web search, Claude pulls in current pages. Its citations show which sources shape its view of your brand.",
      },
      {
        title: "Different engine, different answer",
        body: "Claude doesn't always agree with ChatGPT or Gemini. Tracking it separately shows gaps you'd miss by watching one engine.",
      },
    ],
  },
  method: {
    eyebrow: "How AutoSEO tracks Claude",
    title: "Four ways to collect Claude answers,",
    muted: "pick what fits.",
    body: "AutoSEO supports three live backends for Claude, all with web search, plus an AI simulation. On AutoSEO Cloud, engines run through the providers the Codext team has connected, usage counts toward the included allowance, and you can also connect your own Claude Code. On a self-hosted instance, an admin connects DataForSEO or adds a key in Admin → AI Providers and can pin one backend.",
    items: [
      {
        title: "DataForSEO",
        body: "Claude answers with web search and citations. Self-hosters pay DataForSEO directly; on AutoSEO Cloud, usage counts toward the included allowance.",
      },
      {
        title: "Anthropic API key",
        body: "On a self-hosted instance, add your own Anthropic key in Admin → AI Providers and AutoSEO asks Claude directly with web search, including the searches it runs.",
      },
      {
        title: "Your Claude Code subscription",
        body: "Run prompts through your own Claude Code CLI via a lightweight local agent, so the work uses the subscription you already pay for.",
      },
      {
        title: "AI simulation as a fallback",
        body: "If no real backend is available, an AI model with web search can answer in place of Claude. These answers are labeled “Simulated” and meant as a directional estimate: a real backend always takes priority, and admins can switch the fallback off.",
      },
    ],
  },
  tracked: {
    eyebrow: "What gets tracked",
    title: "Everything Claude says about your brand",
    items: [
      {
        icon: "radar",
        title: "Brand mentions",
        body: "Whether Claude names your brand for each prompt, and the mention rate over time.",
      },
      {
        icon: "link",
        title: "Citations",
        body: "The pages Claude cites when it searches the web — yours and everyone else's.",
      },
      {
        icon: "swords",
        title: "Share of voice",
        body: "Which competitors Claude recommends next to you, and in which position.",
      },
      {
        icon: "heart",
        title: "Sentiment and framing",
        body: "The praise, the criticism and the attributes Claude attaches to your brand.",
      },
      {
        icon: "target",
        title: "Best-for picks",
        body: "Where Claude names a brand as the top pick for a use case, and whether it's you.",
      },
      {
        icon: "git-fork",
        title: "Query fan-outs",
        body: "The searches Claude runs behind an answer, when the backend returns them.",
      },
    ],
  },
  crawlers: {
    eyebrow: "Anthropic's crawlers",
    title: "Make sure Claude can read your site",
    body: "Anthropic uses separate crawlers for search, user requests and training. AutoSEO's crawlability check tests your robots.txt and pages against each of them, and bot analytics shows how often they visit.",
    bots: [
      { token: "Claude-SearchBot", purpose: "Crawls pages to improve the search results Claude draws on" },
      { token: "Claude-User", purpose: "Fetches pages when a user's question to Claude needs them" },
      { token: "ClaudeBot", purpose: "Collects content that may be used to train Anthropic's models" },
    ],
  },
  faq: [
    {
      q: "How do I track my brand's visibility in Claude?",
      a: "Add the prompts your customers ask, select Claude as an engine and set a schedule. AutoSEO runs the prompts with web search, stores every answer and reports mention rate, citation rate, position and sentiment for your brand and competitors.",
    },
    {
      q: "Can I track Claude with my own Claude Code subscription?",
      a: "Yes, on AutoSEO Cloud and when you self-host. Run AutoSEO's local agent on a machine with Claude Code installed, and prompts go through your own Claude Code CLI with web search. Self-hosted instances can also use an Anthropic API key or DataForSEO instead.",
    },
    {
      q: "Does Claude cite its sources?",
      a: "When Claude searches the web, its answers include citations. AutoSEO stores every cited URL, groups them by domain and content type, and shows which prompts cite which pages.",
    },
    {
      q: "Which Claude model does AutoSEO use?",
      a: "Each backend uses a current Claude model by default. On a self-hosted instance, an admin can pin a specific model for DataForSEO or the Anthropic API, so results stay comparable over time.",
    },
    {
      q: "How do I improve my visibility in Claude?",
      a: "Allow Claude-SearchBot and Claude-User in your robots.txt, publish pages that answer the prompts you track, and get mentioned on the sources Claude already cites. AutoSEO turns those gaps into prioritized tasks.",
    },
    {
      q: "Can I compare Claude with ChatGPT and other engines?",
      a: "Yes. Track the same prompts on ChatGPT, Perplexity, Gemini, Google AI Overviews and more, and compare visibility per engine in one dashboard.",
    },
  ],
  cta: {
    title: "Find out what Claude says about you",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies PlatformPage;
