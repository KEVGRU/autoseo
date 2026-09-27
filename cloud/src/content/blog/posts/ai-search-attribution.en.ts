import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "ai-search-attribution",
  title: "How do you attribute leads and revenue to AI search?",
  description:
    "Referrers, UTMs, GA4's AI Assistant channel and “How did you hear about us?” surveys: how to tie leads and revenue to ChatGPT, Perplexity and Google AI.",
  date: "2026-09-26",
  authorSlug: "autoseo-team",
  tags: ["attribution", "measurement", "ai-search"],
  readingMinutes: 12,
  lead:
    "Combine three signals: AI referrals in your analytics, a “How did you hear about us?” answer attached to every lead and order, and branded search in Search Console. Referrals are precise but incomplete: Google reports clicks from AI Overviews and AI Mode as organic search, and people who read an AI answer and later type your URL arrive as direct. Self-reported answers matched to deals and orders give you the revenue figure; referrals and branded search tell you whether that figure is plausible.",
  blocks: [
    { type: "h2", text: "Why doesn't AI search show up cleanly in analytics?" },
    {
      type: "p",
      text: "An AI answer can influence a purchase in three ways, and click-based analytics only sees the first one reliably.",
    },
    {
      type: "ul",
      items: [
        "**Click with a referrer.** The visitor clicks a cited link in ChatGPT, Perplexity, Claude, Gemini or Copilot in the browser, which sends the origin, for example `chatgpt.com`. Measurable.",
        "**Click without a usable source.** The link opens from an app, is copied to another device, or comes from Google's AI Overviews or AI Mode, which Google reports as organic search. The visit is credited to direct or organic.",
        "**No click at all.** The person remembers the name and later types your URL or searches for your brand. Google Analytics files typed URLs under `(direct) / (none)` ([Google Analytics Help](https://support.google.com/analytics/answer/15258820)); a later brand search counts as Organic Search.",
      ],
    },
    {
      type: "p",
      text: "Microsoft's Bing team describes the same shift: the conversion can happen “later or on another device”, and many of these signals “are not captured in traditional analytics as it exists today” ([Bing Webmaster Blog, 2025](https://blogs.bing.com/webmaster/November-2025/How-AI-Search-Is-Changing%E2%80%AFthe%E2%80%AFWay%E2%80%AFConversions%E2%80%AFare-Measured)). In this post, **dark AI traffic** means influence from AI answers that reaches you without an AI source attached.",
    },

    { type: "h2", text: "Which AI platforms pass a referrer, and which don't?" },
    {
      type: "p",
      text: "No AI vendor publishes a complete referrer specification for every app and surface. The table lists what public documentation confirms as of September 2026; everything else you should verify in your own analytics.",
    },
    {
      type: "table",
      caption: "What public documentation says about AI traffic sources (as of September 2026)",
      head: ["Signal", "What the source says", "Source (year)"],
      rows: [
        [
          "ChatGPT links",
          "Adds `utm_source=chatgpt.com` to referral URLs from ChatGPT search.",
          "[OpenAI Help Center (2026)](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq)",
        ],
        [
          "GA4 AI Assistant channel",
          "Since May 13, 2026, set by referrer match; names ChatGPT, Gemini and Claude.",
          "[Google Analytics release notes (2026)](https://support.google.com/analytics/answer/9164320)",
        ],
        [
          "GA4 channel definitions",
          "AI Assistant covers “sources like ChatGPT, Gemini, Deepseek, Copilot, or Grok” and excludes AI Overviews and AI Mode; Organic Search includes them.",
          "[Google Analytics Help (2026)](https://support.google.com/analytics/answer/9756891)",
        ],
        [
          "Google AI features",
          "AI Overviews and AI Mode count in the Web search type of Search Console.",
          "[Google Search Central (2025)](https://developers.google.com/search/docs/appearance/ai-features)",
        ],
        [
          "Generative AI report",
          "Impressions by page, country, device and date; no click metric listed. All sites since August 31, 2026.",
          "[Google Search Central Blog (2026)](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports)",
        ],
        [
          "Referrer detail",
          "Browsers send only the origin cross-site by default, not path or query.",
          "[Chrome for Developers (2020)](https://developer.chrome.com/blog/referrer-policy-new-chrome-default)",
        ],
        [
          "AI referral share",
          "Under 1% of traffic on 1,200+ publisher sites; Copilot, Perplexity and Gemini referrals measured.",
          "[Microsoft Clarity (2025)](https://clarity.microsoft.com/blog/ai-traffic-converts-at-3x-the-rate-of-other-channels-study/)",
        ],
        [
          "Copilot citations",
          "Citations and grounding queries in Copilot and Bing AI summaries, not visits.",
          "[Bing Webmaster Blog (2026)](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview)",
        ],
      ],
    },
    {
      type: "p",
      text: "Two consequences follow. Even a clean referral tells you little: you learn that a visit came from `perplexity.ai`, never which prompt produced it. And Google's AI features are invisible as a traffic source: you can see how often they show your pages, but their clicks arrive as `google / organic`. Links opened from apps, copied between devices or retyped usually land in direct; no vendor documents this per app, so check your own reports.",
    },
    { type: "h3", text: "Where do UTM parameters help?" },
    {
      type: "p",
      text: "Only on links you control. Nobody can tag the links an AI model decides to cite; ChatGPT's own parameter is the documented exception.",
    },
    {
      type: "ul",
      items: [
        "**Tag the links you place yourself**, such as links returned by your ChatGPT app or [Claude connector](/blog/claude-connector), with one `utm_source` per platform.",
        "**Know the precedence.** In GA4 the referrer only sets the source “when no other campaign or traffic source fields have been set” ([Google Analytics Help](https://support.google.com/analytics/answer/11242841)).",
        "**Returns stay credited, within limits.** Because “a direct-traffic visit that follows a referred visit will never override an existing referrer”, a same-browser return keeps its AI source. A return via a Google brand search, or on another device, does not.",
      ],
    },

    { type: "h2", text: "How do you set up GA4 to report AI referrals?" },
    {
      type: "p",
      text: "Start with the default **AI Assistant** channel. Since May 13, 2026, GA4 assigns medium `ai-assistant`, campaign `(ai-assistant)` and channel AI Assistant when the referrer matches a recognized assistant. Google does not publish the full list, or say whether older data was reclassified.",
    },
    {
      type: "p",
      text: "A custom channel group gives you control over the list and history before May 2026. Steps, with English UI labels as of September 2026 ([Google Analytics Help](https://support.google.com/analytics/answer/13051316)):",
    },
    {
      type: "ol",
      items: [
        "In **Admin**, under **Data display**, click **Channel groups**, then **Create new channel group**, which starts as a copy of the default group.",
        "Click **Add new channel**, name it (for example “AI assistants”) and use **+ Add condition group** to set **Source** with **matches regex**.",
        "Click **Reorder** and move the channel above Referral, because GA4 puts traffic “in the first channel whose definition it matches”. Then **Save group**.",
        "Open **Acquisition → Traffic acquisition** and select the new group as the primary dimension.",
      ],
    },
    {
      type: "p",
      text: "Standard properties allow two custom groups (five on 360) with up to 50 channels each, and custom groups apply to reports retroactively. GA4 regex is a full match by default ([Google Analytics Help](https://support.google.com/analytics/answer/1034324)). Google's example pattern is broad and also matches unrelated sources that merely contain “gpt” or “gemini”. A narrower starting point, to test against your real sources:",
    },
    {
      type: "code",
      lang: "regex",
      title: "GA4 custom channel: Source matches regex (example)",
      code: "^(.+\\.)?(chatgpt\\.com|chat\\.openai\\.com|perplexity\\.ai|claude\\.ai|gemini\\.google\\.com|copilot\\.microsoft\\.com|chat\\.deepseek\\.com|grok\\.com|chat\\.mistral\\.ai|meta\\.ai)$",
    },
    {
      type: "p",
      text: "Google's AI features stay out of any such rule: their clicks carry Google's referrer, so GA4 can't split them from classic organic results. On the two surfaces, see [AI Mode vs. AI Overviews](/blog/ai-mode-vs-ai-overviews).",
    },

    { type: "h2", text: "Why does “How did you hear about us?” catch dark AI traffic?" },
    {
      type: "p",
      text: "A self-reported answer doesn't depend on referrers, cookies or devices. Someone who read a ChatGPT recommendation three weeks ago and then typed your URL on a work laptop appears as direct in GA4, but can still pick “ChatGPT” in your demo form.",
    },
    {
      type: "p",
      text: "The measured share is small: Microsoft Clarity found AI referrals at under 1% of traffic on the publisher sites it studied (2025). Referral counts can't show how much influence sits behind that number; asking the buyer can.",
    },
    { type: "h3", text: "How should you ask the question?" },
    {
      type: "ul",
      items: [
        "**Ask at the conversion moment**: in the signup or demo form, at checkout or on the thank-you page, so the answer sits on a record you can match.",
        "**Make AI search a named option**, with a follow-up “Which AI assistant?”. Without it, AI answers disappear into “Google” or “Other”.",
        "**Keep a free-text “Other”** and normalize it: “found you on Perplexity” is AI search.",
        "**Mind the option order.** Survey research has documented primacy effects in visually presented lists, where earlier options are picked more often ([Krosnick & Alwin, 1987](https://doi.org/10.1086/269029)). Rotate the order, or at least don't put AI search first by default.",
      ],
    },
    { type: "h3", text: "What do self-reports get wrong?" },
    {
      type: "p",
      text: "Answers are memories, not logs. People can name the most memorable touchpoint, merge several into one, or say “Google” when they searched after an AI conversation. Treat the answer as the buyer's view, report the response rate next to it, and check it against referral data.",
    },

    { type: "h2", text: "How do you match survey answers to deals and orders?" },
    {
      type: "p",
      text: "An answer only becomes attribution once it is attached to money. Match each answer to a conversion with the strongest key available:",
    },
    {
      type: "ol",
      items: [
        "**Order or transaction ID**, when the question sits in checkout or on the thank-you page.",
        "**Email address**, ideally hashed, when the answer comes from a form and the purchase or deal follows later.",
        "**A first-party browser ID**, when the same browser answers and converts.",
      ],
    },
    {
      type: "p",
      text: "Then fix the rules: a lookback window for how old an answer may be, strict 1:1 matching so one answer can't claim two orders, and no matching on renewals, which would count the original deal twice.",
    },
    {
      type: "p",
      text: "In B2B, store the answer as a field on the contact, carry it to the deal, and report closed-won amount by answer.",
    },

    { type: "h2", text: "How do you triangulate referrals, surveys and branded search?" },
    {
      type: "p",
      text: "No single signal is right on its own. Use each one for what it can actually measure:",
    },
    {
      type: "table",
      caption: "Four signals for AI search attribution and their blind spots",
      head: ["Signal", "What it tells you", "Blind spot"],
      rows: [
        [
          "AI referrals (GA4 AI Assistant or custom channel)",
          "Clicks from AI answers, landing pages, key events and revenue",
          "Google AI features, apps, no-click influence",
        ],
        [
          "Survey answers matched to conversions",
          "Revenue buyers attribute to AI search, per assistant",
          "Recall errors, non-respondents",
        ],
        [
          "Branded search (Search Console)",
          "Whether more people look for you by name",
          "Doesn't say what prompted the search",
        ],
        [
          "AI visibility and citations",
          "How often AI answers show or cite you",
          "No visits, no revenue",
        ],
      ],
    },
    {
      type: "p",
      text: "For branded search, use the branded queries filter in the Search Console Performance report, introduced in November 2025 and available to all eligible sites since March 11, 2026. Google classifies brand queries with “an internal, AI-assisted system”, including typos and unique products, warns that “some queries may occasionally be misidentified”, and offers the filter only for top-level properties with enough volume ([Google Search Central Blog](https://developers.google.com/search/blog/2025/11/search-console-branded-filter)).",
    },
    {
      type: "p",
      text: "For visibility, Search Console's Generative AI report shows AI Overviews and AI Mode impressions, and Bing's AI Performance report shows Copilot citations. Neither reports visits: use them to explain trends, not to count revenue.",
    },
    {
      type: "p",
      text: "To size dark AI traffic, apply the survey's AI share to all orders and the average order value, then subtract the AI revenue analytics already attributes. This assumes respondents represent all buyers, so report it as an estimate, never as booked revenue.",
    },

    { type: "h2", text: "What does this look like in practice?" },
    {
      type: "p",
      text: "**Example (hypothetical; all numbers are illustrative):** a B2B software company wants to know what AI search contributed last quarter.",
    },
    {
      type: "ol",
      items: [
        "**Referral baseline.** GA4 shows 14 demo requests from the AI Assistant channel, out of 200 in total.",
        "**Survey.** The demo form asks “How did you hear about us?”. 150 of 200 people answer (75%); 33 choose AI search (22%): 20 ChatGPT, 8 Perplexity, 5 Gemini.",
        "**Match to deals.** The answer is stored on the contact and copied to the deal. Of 40 closed-won deals worth €240,000, 9 carry an AI search answer, worth €54,000.",
        "**Size the gap.** If non-respondents resemble respondents (an assumption), about 44 of 200 requests were AI-influenced (22% × 200), against 14 that analytics saw. Roughly 30 arrived as direct, organic or referral.",
        "**Sanity-check.** Branded clicks in Search Console rose while non-branded stayed flat, and tracked prompts show the brand cited more often in ChatGPT. Both fit the survey; neither proves it.",
        "**Decide.** The team reports 14 requests as the analytics floor, €54,000 as self-reported AI revenue and about 44 requests as an estimate.",
      ],
    },

    { type: "h2", text: "What does this mean for you?" },
    {
      type: "ul",
      items: [
        "In GA4's Traffic acquisition report, check the AI Assistant channel and look for `chatgpt.com` or `perplexity.ai` rows still in Referral or Unassigned.",
        "Add AI search as an answer option to your existing form or checkout, with a follow-up for the assistant.",
        "Attach the answer to the deal or order and report revenue by answer, not just leads.",
        "Track branded clicks in Search Console next to the survey's AI share.",
        "Report three numbers side by side: analytics floor, self-reported AI revenue, estimated gap.",
        "Re-check the setup quarterly; GA4 and Search Console changed several times in the past twelve months.",
      ],
    },

    { type: "h2", text: "How do you measure this with AutoSEO?" },
    {
      type: "p",
      text: "[AutoSEO's AI search attribution](/ai-search-attribution) implements the survey-and-match method described above:",
    },
    {
      type: "ul",
      items: [
        "**Survey snippet.** It detects an existing “How did you hear about us?” field in your forms (English or German) and records the answer on submit, or shows a short popup after form submits and purchases. Each visitor is asked once (localStorage, no cookies); emails are SHA-256 hashed in the browser where possible.",
        "**AI search as a channel.** Answers land in AI Search, Google / Bing, Social Media, Online Ads, Referral, Content or Other, with an optional “Which AI assistant?” step. Free text is normalized (“Google Gemini” is AI, “Google Ads” is ads), and you can reorder, relabel and hide options.",
        "**Conversions and deals.** Stripe (signed webhook; renewals are never matched), a Shopify Custom Pixel, WooCommerce and Shopware webhooks, and GA or Meta pixel events the snippet captures passively. HubSpot, Salesforce, Pipedrive, Attio and Close send lead source and deal value via workflow webhooks with field mapping; see [attribution integrations](/integrations/attribution) and [HubSpot](/integrations/hubspot).",
        "**Matching.** By order ID, then hashed email, then same-browser visitor ID, strictly 1:1, with a 90-day lookback and answers accepted up to 48 hours after the order.",
        "**Reports.** Deal value from AI search per channel and assistant, plus **Hidden AI revenue** (survey AI share × orders × average order value, minus AI revenue already in analytics), **Survey response rate** and **Visibility ↔ AI leads**, a correlation with your [AI visibility tracking](/ai-visibility-tracking).",
        "**Referral side.** [AI traffic analytics](/ai-traffic-analytics) syncs AI-referred sessions from [Google Analytics](/integrations/google-analytics), Matomo or Piwik PRO by platform and landing page. Like any referral tool, it cannot separate AI Overviews or AI Mode clicks from organic search.",
        "**For agents.** The [MCP server](/mcp-server) exposes `get_attribution_summary` and `list_attributions`; the [REST API](/rest-api) serves the same data.",
      ],
    },
    {
      type: "p",
      text: "AutoSEO is open source: [self-host it](/self-hosting) for free or use the managed [AutoSEO Cloud](/pricing).",
    },
    {
      type: "callout",
      tone: "info",
      title: "Method and limitations",
      text: "This post summarizes public documentation from OpenAI, Google and Microsoft plus survey research, as of September 2026. AutoSEO has no proprietary traffic dataset; the worked example is hypothetical. Not documented anywhere we found: how each AI app passes referrers, the full list of assistants GA4 recognizes, and whether GA4 reclassified data from before May 2026. Self-reports and the hidden-revenue estimate rest on assumptions (honest recall, representative respondents), and a correlation between visibility and AI answers does not prove causation.",
    },
  ],
  faq: [
    {
      q: "Does ChatGPT traffic show up in Google Analytics?",
      a: "Yes, when someone clicks a link and the browser sends a referrer, or the link carries `utm_source=chatgpt.com`. Since May 2026, GA4 groups recognized AI referrers into the default AI Assistant channel. People who copy a link, switch devices or type your URL later arrive as direct.",
    },
    {
      q: "Can I see clicks from Google AI Overviews and AI Mode separately?",
      a: "Not as of September 2026. Google counts those clicks in Search Console's Web search type and in GA4's Organic Search. The Generative AI report in Search Console shows impressions, so you see visibility but not the visits it sends.",
    },
    {
      q: "How reliable is “How did you hear about us?” data?",
      a: "It is subjective: people misremember, merge touchpoints and are nudged by the order of options. It is still the only signal that captures influence without a click. Use it for direction and revenue shares, and check it against referrals and branded search.",
    },
    {
      q: "Should the question be multiple choice or open text?",
      a: "Both: a short list with AI search as a named option, plus an “Other” free-text field. The list makes answers comparable; free text catches sources you didn't anticipate.",
    },
    {
      q: "Where should I ask: signup form, checkout or sales call?",
      a: "As close to the conversion as possible, and once per journey. Forms and checkout pages produce answers you can match by email or order ID. Answers collected later by sales help too, if they end up in the same CRM field.",
    },
  ],
  sources: [
    { label: "OpenAI Help Center: Publishers and Developers FAQ (2026)", href: "https://help.openai.com/en/articles/12627856-publishers-and-developers-faq" },
    { label: "Google Analytics Help: What's new in Google Analytics, “New AI Assistant traffic measurement” (2026)", href: "https://support.google.com/analytics/answer/9164320" },
    { label: "Google Analytics Help: Default channel group (2026)", href: "https://support.google.com/analytics/answer/9756891" },
    { label: "Google Analytics Help: Custom channel groups (2026)", href: "https://support.google.com/analytics/answer/13051316" },
    { label: "Google Analytics Help: Campaigns and traffic sources (2026)", href: "https://support.google.com/analytics/answer/11242841" },
    { label: "Google Analytics Help: Understand (direct) / (none) traffic (2026)", href: "https://support.google.com/analytics/answer/15258820" },
    { label: "Google Analytics Help: About regular expressions (2026)", href: "https://support.google.com/analytics/answer/1034324" },
    { label: "Google Search Central: AI features and your website (2025)", href: "https://developers.google.com/search/docs/appearance/ai-features" },
    { label: "Google Search Central Blog: Introducing Search Generative AI performance reports in Search Console (2026)", href: "https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports" },
    { label: "Google Search Central Blog: Introducing the branded queries filter in Search Console (2025, updated 2026)", href: "https://developers.google.com/search/blog/2025/11/search-console-branded-filter" },
    { label: "Chrome for Developers: A new default Referrer-Policy for Chrome (2020)", href: "https://developer.chrome.com/blog/referrer-policy-new-chrome-default" },
    { label: "Microsoft Clarity: AI Traffic Converts at 3x the Rate of Other Channels (2025)", href: "https://clarity.microsoft.com/blog/ai-traffic-converts-at-3x-the-rate-of-other-channels-study/" },
    { label: "Bing Webmaster Blog: Introducing AI Performance in Bing Webmaster Tools (2026)", href: "https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview" },
    { label: "Bing Webmaster Blog: How AI Search Is Changing the Way Conversions are Measured (2025)", href: "https://blogs.bing.com/webmaster/November-2025/How-AI-Search-Is-Changing%E2%80%AFthe%E2%80%AFWay%E2%80%AFConversions%E2%80%AFare-Measured" },
    { label: "Krosnick & Alwin: An Evaluation of a Cognitive Theory of Response-Order Effects in Survey Measurement, Public Opinion Quarterly (1987)", href: "https://doi.org/10.1086/269029" },
  ],
};
