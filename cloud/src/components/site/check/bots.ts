/**
 * AI and search crawlers the free check evaluates against robots.txt. Tokens, operators and purposes were verified
 * against each vendor's official crawler documentation on 2026-09-26 (URLs below). Client-safe: plain data only.
 *
 * - search:   indexes pages for an AI search or answer product (being blocked here keeps you out of its answers)
 * - user:     fetches a page when a person asks the assistant about it
 * - training: collects content for model training (blocking it is a business decision, not a visibility bug)
 */
export type BotPurpose = "search" | "user" | "training";

export type AiBot = {
  /** robots.txt product token (matched case-insensitively). */
  token: string;
  operator: string;
  purpose: BotPurpose;
  /** What the bot feeds, in a few words (English; the UI localizes the purpose, not the product names). */
  feeds: string;
  docs: string;
  /** The vendor documents that this agent may not follow robots.txt for user-initiated fetches. */
  mayIgnoreRobots?: boolean;
};

export const AI_BOTS: AiBot[] = [
  { token: "Googlebot", operator: "Google", purpose: "search", feeds: "Google Search, AI Overviews, AI Mode", docs: "https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers" },
  { token: "Bingbot", operator: "Microsoft", purpose: "search", feeds: "Bing, Microsoft Copilot", docs: "https://www.bing.com/webmasters/help/which-crawlers-does-bing-use-8c184ec0" },
  { token: "OAI-SearchBot", operator: "OpenAI", purpose: "search", feeds: "ChatGPT search", docs: "https://developers.openai.com/api/docs/bots" },
  { token: "Claude-SearchBot", operator: "Anthropic", purpose: "search", feeds: "Claude search results", docs: "https://support.claude.com/en/articles/8896518" },
  { token: "PerplexityBot", operator: "Perplexity", purpose: "search", feeds: "Perplexity search results", docs: "https://docs.perplexity.ai/guides/bots" },
  { token: "Amazonbot", operator: "Amazon", purpose: "search", feeds: "Amazon products incl. Alexa; may train Amazon AI models", docs: "https://developer.amazon.com/amazonbot" },
  { token: "ChatGPT-User", operator: "OpenAI", purpose: "user", feeds: "Pages a ChatGPT user asks about", docs: "https://developers.openai.com/api/docs/bots", mayIgnoreRobots: true },
  { token: "Claude-User", operator: "Anthropic", purpose: "user", feeds: "Pages a Claude user asks about", docs: "https://support.claude.com/en/articles/8896518" },
  { token: "Perplexity-User", operator: "Perplexity", purpose: "user", feeds: "Pages a Perplexity user asks about", docs: "https://docs.perplexity.ai/guides/bots", mayIgnoreRobots: true },
  { token: "GPTBot", operator: "OpenAI", purpose: "training", feeds: "OpenAI model training", docs: "https://developers.openai.com/api/docs/bots" },
  { token: "ClaudeBot", operator: "Anthropic", purpose: "training", feeds: "Anthropic model training", docs: "https://support.claude.com/en/articles/8896518" },
  { token: "Google-Extended", operator: "Google", purpose: "training", feeds: "Gemini training and grounding in Gemini Apps (not Google Search)", docs: "https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers" },
  { token: "Applebot-Extended", operator: "Apple", purpose: "training", feeds: "Use of Applebot data for Apple AI training (does not crawl itself)", docs: "https://support.apple.com/en-us/119829" },
  { token: "Meta-ExternalAgent", operator: "Meta", purpose: "training", feeds: "Meta AI model training and indexing", docs: "https://developers.facebook.com/docs/sharing/webmasters/web-crawlers" },
  { token: "CCBot", operator: "Common Crawl", purpose: "training", feeds: "Common Crawl open dataset (widely used for training)", docs: "https://commoncrawl.org/ccbot" },
];

/** How much each purpose counts towards the crawler-access score (sums to 1). */
export const PURPOSE_WEIGHT: Record<BotPurpose, number> = { search: 0.65, user: 0.2, training: 0.15 };
