import type { SitePage } from "@/components/site/types";
import { site } from "@/lib/site";

const apply = `mailto:${site.contactEmail}?subject=Referral%20program%20application`;

const page: SitePage = {
  path: "/affiliate-program",
  crumb: "Referral program",
  meta: {
    title: "AutoSEO Referral Program: Recommend AutoSEO Cloud",
    description:
      "Recommend AutoSEO Cloud and earn a commission. By application only; commission and payout terms are agreed individually in writing. How it works and the rules.",
  },
  hero: {
    eyebrow: "Referral program",
    title: "Recommend AutoSEO Cloud to people who need it",
    subtitle:
      "If your audience cares about SEO and AI search, you can refer them to AutoSEO Cloud. The program is by application only, and commission and payout terms are agreed with each partner individually, in writing.",
    ctas: [
      { label: "Apply by email", href: apply },
      { label: "Read the program terms", href: "/affiliate-terms" },
    ],
  },
  sections: [
    {
      kind: "prose",
      id: "overview",
      eyebrow: "Overview",
      title: "The program at a glance",
      blocks: [
        {
          type: "ul",
          items: [
            "**By application only.** We review every application and accept partners whose audience and approach fit AutoSEO.",
            "**Individual terms.** Commission rate, duration, attribution method and payout are agreed with you individually in writing before you start. We don't publish standard rates.",
            "**AutoSEO Cloud only.** Referrals count for paid AutoSEO Cloud subscriptions. The self-hosted edition is free — recommend it as much as you like, but there is nothing to earn.",
            "**Honest promotion.** Clearly disclosed, accurate, no brand bidding and no spam. The [program terms](/affiliate-terms) list the rules.",
          ],
        },
        {
          type: "callout",
          tone: "info",
          title: "Why no public rates?",
          text: "Rates depend on the audience, the channel and the effort involved, so we agree them individually. Whatever we agree is put in writing before you promote anything.",
        },
      ],
    },
    {
      kind: "cards",
      id: "fit",
      eyebrow: "Who it's for",
      title: "A good fit for people who teach and advise",
      subtitle: "Agencies that deliver AutoSEO to their own clients are better served by the [partner program](/partner-program).",
      columns: 3,
      cards: [
        {
          icon: "video",
          title: "Creators and educators",
          body: "YouTube channels, newsletters, courses and blogs about SEO, GEO and marketing technology.",
        },
        {
          icon: "briefcase",
          title: "Consultants",
          body: "Freelancers and consultants who recommend tools to clients but don't want to operate them.",
        },
        {
          icon: "users",
          title: "Communities",
          body: "Operators of communities, directories and events for marketers, SEOs and founders.",
        },
      ],
    },
    {
      kind: "steps",
      id: "how",
      eyebrow: "How it works",
      title: "From application to first referral",
      steps: [
        {
          title: "Apply",
          body: `Email [${site.contactEmail}](${apply}) with the subject “Referral program”: who you are, your channels, your audience and how you plan to recommend AutoSEO.`,
        },
        { title: "Review", body: "We review your application. Joining is not guaranteed, and there is no obligation on either side." },
        { title: "Written agreement", body: "If it's a fit, we agree commission, duration, attribution and payout in writing." },
        { title: "Recommend", body: "You promote AutoSEO Cloud with the attribution method we agreed, following the program terms." },
      ],
    },
    {
      kind: "checklist",
      id: "rules",
      eyebrow: "Rules",
      title: "The rules in short",
      items: [
        "Disclose the referral relationship clearly wherever you recommend AutoSEO",
        "Make only accurate claims — no promised rankings, AI mentions or results",
        "No bidding on AutoSEO brand terms and no AutoSEO trademarks in ads",
        "No cookie stuffing, spam, fake coupons or self-referrals",
        "Use the AutoSEO name and logo only as described in the press kit",
      ],
      aside: [
        { type: "h3", text: "Binding terms" },
        {
          type: "p",
          text: "The [referral program terms](/affiliate-terms) apply to every partner. Where your individual written agreement differs, the individual agreement prevails.",
        },
      ],
    },
    {
      kind: "faq",
      id: "faq",
      title: "Questions about the referral program",
      items: [
        {
          q: "How much commission do I earn?",
          a: "Commission rates and payout terms are not published. They are agreed individually with each accepted partner and set out in a written agreement before you start promoting AutoSEO Cloud.",
        },
        {
          q: "Who can apply?",
          a: "Anyone with a relevant audience in SEO, AI search or marketing: creators, consultants and community operators. We accept partners whose audience and approach fit AutoSEO; applying doesn't guarantee acceptance.",
        },
        {
          q: "Can I refer people to the free self-hosted edition?",
          a: "Please do, but there is nothing to earn. The self-hosted edition is free under the MIT license, so the referral program only covers paid AutoSEO Cloud subscriptions.",
        },
        {
          q: "How is this different from the partner program?",
          a: "The referral program is for people who recommend AutoSEO Cloud to their audience. The partner program is for agencies and freelancers who deliver AutoSEO to their own clients; it offers support and early access, not commissions.",
        },
        {
          q: "Do I have to disclose that I earn a commission?",
          a: "Yes. Clearly label every recommendation that can earn you money, as advertising and consumer protection laws require — for example the FTC Endorsement Guides in the US and the German Act Against Unfair Competition (UWG). The program terms explain the details.",
        },
        {
          q: "Can I bid on the AutoSEO brand in Google Ads?",
          a: "No. Bidding on AutoSEO brand terms and using AutoSEO trademarks in ads are not allowed, unless your individual written agreement explicitly permits it.",
        },
        {
          q: "Can I offer my audience a discount code?",
          a: "Only a code we have issued to you. Publishing codes you weren't given, or pages that pretend to offer discounts, is prohibited.",
        },
      ],
    },
    {
      kind: "cta",
      id: "start",
      title: "Apply for the referral program",
      body: "Tell us about your audience and channels, and we'll get back to you.",
      primary: { label: "Apply by email", href: apply },
      secondary: { label: "Read the terms", href: "/affiliate-terms" },
    },
  ],
};

export default page;
