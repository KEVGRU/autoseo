import { playbookPath } from "@/components/site/company/paths";
import type { SitePage } from "@/components/site/types";
import { site } from "@/lib/site";
import playbooks from "./playbooks.en";

const page: SitePage = {
  path: "/case-studies",
  crumb: "Case studies",
  meta: {
    title: "GEO Case Studies as Reproducible Playbooks",
    description:
      "Six reproducible AI visibility playbooks: prompt sets to import, baseline, actions and honest measurement. Methodology you can verify, not customer claims.",
  },
  hero: {
    eyebrow: "Case studies",
    title: "Playbooks you can reproduce, not stories you have to believe",
    subtitle:
      "We don't publish customer growth curves. Each playbook below is a complete method: the prompt set to import, the engines to track, how to take a baseline in AutoSEO, what to do and how to measure the change — including how much AI answers vary on their own.",
    ctas: [
      { label: "Browse the playbooks", href: "#playbooks" },
      { label: "Start with AutoSEO", href: "/signup" },
    ],
  },
  sections: [
    {
      kind: "cards",
      id: "playbooks",
      eyebrow: "Six playbooks",
      title: "Pick the problem you want to solve",
      subtitle: "Every playbook works in the free self-hosted edition and in AutoSEO Cloud.",
      columns: 3,
      cards: playbooks.map((p) => ({ icon: p.icon, title: p.crumb, body: p.teaser, href: playbookPath(p.slug) })),
    },
    {
      kind: "steps",
      id: "structure",
      eyebrow: "How every playbook is built",
      title: "The same structure, so results stay comparable",
      steps: [
        { title: "Goal and audience", body: "Which metric should move, and for whom the playbook is worth the effort." },
        { title: "Prompt set", body: "Templates with placeholders, ready to import as CSV into the AutoSEO tracker." },
        { title: "Baseline", body: "Engines, frequency and the exact numbers to record before you change anything." },
        { title: "Actions and measurement", body: "Concrete steps, how to measure the change and when to call it real." },
      ],
    },
    {
      kind: "checklist",
      id: "honesty",
      eyebrow: "Reading results honestly",
      title: "Why we show methods instead of growth curves",
      subtitle: "AI answers are probabilistic. A before-and-after chart without context proves very little.",
      items: [
        "The same prompt can get a different answer tomorrow, so single answers and single days prove nothing",
        "Small prompt sets swing more than large ones; 30–50 prompts per topic give steadier numbers",
        "Model updates move everyone at once — compare yourself with competitors, not with last month alone",
        "Changing engines, country, language or the prompt set breaks the comparison",
        "Correlation with revenue is not causation: seasonality and campaigns move numbers too",
      ],
      aside: [
        { type: "h3", text: "Methodology, not a customer result" },
        {
          type: "p",
          text: "None of the playbooks contain customer data or promise an outcome. They describe how to do the work and how to measure it, so you can judge the result yourself.",
        },
        { type: "h3", text: "Share what you find" },
        {
          type: "p",
          text: `Ran a playbook? Post your setup and results in [GitHub Discussions](${site.github}/discussions) so others can reproduce them — including what didn't work.`,
        },
        { type: "h3", text: "What the research says" },
        {
          type: "p",
          text: "Studies on GEO techniques don't all point the same way. [Which GEO techniques work?](/blog/geo-techniques) sums up the evidence and shows how to test a technique yourself.",
        },
      ],
    },
    {
      kind: "faq",
      id: "faq",
      title: "Questions about the playbooks",
      items: [
        {
          q: "Why don't you publish customer case studies?",
          a: "Because a customer's growth curve tells you little about what will happen for you, and AI answers vary so much that a single before-and-after chart can be misleading. A reproducible method lets you test the approach on your own brand and judge the evidence yourself.",
        },
        {
          q: "Do the playbooks work in the self-hosted edition?",
          a: "Yes. Every feature the playbooks use — tracker, sources, competitors, crawlability, bot traffic, Fact Check, attribution and the report builder — is included in the free self-hosted edition and in AutoSEO Cloud.",
        },
        {
          q: "How do I import a prompt set?",
          a: "Copy the CSV from the playbook or download it, replace the placeholders in square brackets, then open AI Visibility → Tracker → Import CSV in AutoSEO and paste the text or upload the file. The columns are prompt and tags; the tags are imported with the prompts.",
        },
        {
          q: "How long does a playbook take?",
          a: "The baseline takes one to two weeks of daily tracking, depending on the playbook. The actions take as long as the work itself. Plan to re-measure after six to eight weeks and then monthly, because engines pick up changes on their own schedule.",
        },
        {
          q: "Can agencies use these playbooks for clients?",
          a: "Yes. The playbooks are free to use for your own brands and for client work. The agency pitch playbook is written specifically for winning new clients with their own data.",
        },
        {
          q: "Can I suggest a playbook?",
          a: "Yes. Open a thread in GitHub Discussions with the problem you want to solve and how you would measure success. Useful suggestions become new playbooks.",
        },
      ],
    },
    {
      kind: "cta",
      id: "start",
      title: "Run your first playbook this week",
      body: "Import a prompt set, take a baseline and start measuring — in AutoSEO Cloud or on your own server.",
      primary: { label: `Start for $${site.priceMonthlyUsd}/month`, href: "/signup" },
      secondary: { label: "Self-host for free", href: "/self-hosting" },
    },
  ],
};

export default page;
