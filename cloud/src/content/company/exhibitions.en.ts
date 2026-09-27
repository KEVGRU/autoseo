import type { SitePage } from "@/components/site/types";
import { site } from "@/lib/site";

const walkthrough = `mailto:${site.contactEmail}?subject=Live%20walkthrough`;
const speaking = `mailto:${site.contactEmail}?subject=Speaking%20request`;

const page: SitePage = {
  path: "/exhibitions",
  crumb: "Events",
  meta: {
    title: "AutoSEO at Events, Trade Shows and Conferences",
    description:
      "AutoSEO has no trade show or event appearances scheduled right now. Meet us online instead, invite us to speak, or request a live walkthrough for your team.",
  },
  hero: {
    eyebrow: "Events",
    title: "Meet the people behind AutoSEO",
    subtitle:
      "We have no trade shows or conferences scheduled at the moment. You can still meet us — in a video walkthrough for your team, in the open-source community, or on your stage.",
    ctas: [
      { label: "Request a walkthrough", href: walkthrough },
      { label: "Invite us to speak", href: "#speaking" },
    ],
  },
  sections: [
    {
      kind: "prose",
      id: "calendar",
      eyebrow: "Calendar",
      title: "Event calendar",
      blocks: [
        {
          type: "callout",
          tone: "info",
          title: "No events scheduled",
          text: "We only list appearances that are confirmed. When we exhibit or speak somewhere, you'll find the date, venue and how to meet us on this page.",
        },
        {
          type: "p",
          text: "Most conversations about AutoSEO happen online anyway: in walkthroughs with teams, in GitHub Discussions and in pull requests. The options below work today.",
        },
      ],
    },
    {
      kind: "cards",
      id: "meet",
      eyebrow: "Meet us now",
      title: "Three ways to meet us without a trade show",
      columns: 3,
      cards: [
        {
          icon: "video",
          title: "Live walkthrough",
          href: walkthrough,
          body: "A video call for your team: we show AutoSEO based on your questions and, if you like, on your own domain.",
        },
        {
          icon: "message",
          title: "GitHub Discussions",
          href: `${site.github}/discussions`,
          body: "Ask the people who build AutoSEO directly, in public, and see what others are working on.",
        },
        {
          icon: "git",
          title: "Contribute",
          href: `${site.github}/issues?q=is%3Aopen+label%3A%22good+first+issue%22`,
          body: "The most direct way to work with the team: pick an issue and open a pull request.",
        },
      ],
    },
    {
      kind: "split",
      id: "speaking",
      eyebrow: "Speaking",
      title: "Invite us to your event or podcast",
      body: "Organizing a meetup, conference, webinar or podcast about SEO, AI search or open source? We are happy to talk about how AI visibility can be measured honestly — including what today's tracking can and cannot tell you.",
      bullets: [
        "Topics: measuring AI visibility, variance in AI answers, AI crawler access, attributing AI search, open-source marketing software",
        "Formats: talks, panels, workshops and podcasts, in English or German",
        "Please send the date, audience, format and expected audience size",
      ],
      cta: { label: "Send a speaking request", href: speaking },
    },
    {
      kind: "links",
      id: "prepare",
      eyebrow: "Before we meet",
      title: "Get the most out of a meeting",
      subtitle: "Ten minutes with these pages make any conversation with us more useful.",
      links: [
        { label: "Playbooks", href: "/case-studies", description: "Reproducible methods with prompt sets, baseline and measurement." },
        { label: "AutoSEO for organizations", href: "/enterprise", description: "Self-hosting, AutoSEO Cloud and the security controls." },
        { label: "Pricing", href: "/pricing", description: "Free self-hosted edition or AutoSEO Cloud for a flat monthly price." },
        { label: "Security", href: "/security", description: "How AutoSEO protects secrets, tokens and access." },
        { label: "Blog", href: "/blog", description: "Articles on GEO research, AI crawlers, attribution and connecting AI assistants." },
        { label: "Blog: Which GEO techniques work?", href: "/blog/geo-techniques", description: "What the research shows about raising AI visibility, why studies disagree and how to test a technique yourself." },
      ],
    },
    {
      kind: "faq",
      id: "faq",
      title: "Questions about events",
      items: [
        {
          q: "Will AutoSEO exhibit at trade shows?",
          a: "Nothing is scheduled at the moment. Confirmed appearances will be listed on this page with date and venue.",
        },
        {
          q: "Can we meet online instead?",
          a: `Yes. Email ${site.contactEmail} with your topic and a few possible dates, and we will set up a video call for you and your team.`,
        },
        {
          q: "Can you speak at our event?",
          a: `Send the date, audience, format and topic to ${site.contactEmail} and we'll get back to you. We speak in English and German.`,
        },
        {
          q: "Do you sponsor events?",
          a: "We don't have a sponsorship program. If you organize a community event around open source or SEO, you are welcome to ask, and we decide case by case.",
        },
        {
          q: "How can I see AutoSEO in action without an event?",
          a: "Install the free self-hosted edition and open the built-in demo project, or ask for a live walkthrough for your team.",
        },
      ],
    },
    {
      kind: "cta",
      id: "start",
      title: "Don't wait for the next trade show",
      body: "See AutoSEO with your own data today — in the cloud or on your own server.",
      primary: { label: "Request a walkthrough", href: walkthrough },
      secondary: { label: "Self-host for free", href: "/self-hosting" },
    },
  ],
};

export default page;
