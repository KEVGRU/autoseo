import type { IntegrationPage } from "../../types";

export default {
  slug: "wordpress",
  name: "WordPress",
  nav: "WordPress",
  summary: "Publish AI-optimized content briefs and drafts straight to WordPress.",
  meta: {
    title: "WordPress Integration for AI SEO Content",
    description:
      "Connect WordPress to AutoSEO and publish optimized articles with JSON-LD and Yoast or Rank Math meta fields as drafts — via the REST API and an application password.",
  },
  hero: {
    subtitle:
      "Connect your WordPress site and publish the content AutoSEO drafts for AI search — with title, excerpt, JSON-LD and SEO meta fields — as a draft for review or straight to live.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the WordPress integration",
    items: [
      "Publish content drafts from AutoSEO to WordPress posts in one click",
      "Title, slug, excerpt and HTML body transferred as written",
      "JSON-LD structured data embedded in the post",
      "Yoast SEO and Rank Math title and meta description filled in when the plugin exposes them to the REST API",
      "Update the same post again after you revise the draft",
      "Works with pretty and plain permalinks",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with WordPress and AutoSEO",
    items: [
      {
        icon: "file-text",
        title: "Close AI visibility gaps with new content",
        body: "Turn prompts where competitors are mentioned and you aren't into briefs and drafts, then publish them to WordPress.",
      },
      {
        icon: "code",
        title: "Ship structured data with every article",
        body: "Drafts can carry JSON-LD, so FAQ, article or product markup goes live together with the content.",
      },
      {
        icon: "pen",
        title: "Keep editors in control",
        body: "Publish as a draft and let your team review, edit and schedule the post in WordPress as usual.",
      },
      {
        icon: "refresh",
        title: "Iterate on published posts",
        body: "Revise a draft in AutoSEO after the next tracking run and push the update to the existing post.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect WordPress in four steps,",
    muted: "no plugin required.",
    items: [
      {
        title: "Create an application password",
        body: "In WordPress, open Users → Profile and create an application password for a user with the Author, Editor or Administrator role.",
      },
      {
        title: "Connect from AutoSEO",
        body: "Open Optimizations → Content in your project, choose WordPress and enter your site URL, username and the application password.",
      },
      {
        title: "Test the connection",
        body: "AutoSEO checks that the user can publish posts and shows the connected site and account.",
      },
      {
        title: "Publish a draft",
        body: "Open a content draft and publish it to WordPress — as a draft for review or directly as a live post.",
      },
    ],
  },
  faq: [
    {
      q: "Do I need a WordPress plugin?",
      a: "No. AutoSEO uses the WordPress REST API, which is built into WordPress, together with an application password. Yoast SEO or Rank Math fields are filled in only when those plugins expose them to the REST API.",
    },
    {
      q: "Which WordPress permissions does AutoSEO need?",
      a: "The user behind the application password must be able to publish posts — the Author, Editor or Administrator role. The connection test tells you if the user lacks that permission.",
    },
    {
      q: "Can AutoSEO publish posts live without review?",
      a: "You decide per publish: send the article as a draft to review it in WordPress, or publish it immediately.",
    },
    {
      q: "Where are my WordPress credentials stored?",
      a: "They're stored encrypted with AES-256-GCM in AutoSEO's database and only used to call your site's REST API.",
    },
    {
      q: "Does it work with WordPress.com?",
      a: "It works with any WordPress site whose REST API and application passwords are available, which is the default for self-hosted WordPress.",
    },
  ],
  cta: {
    title: "Publish content that AI engines want to cite",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
