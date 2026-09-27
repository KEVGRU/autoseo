import type { IntegrationPage } from "../../types";

export default {
  slug: "linear",
  name: "Linear",
  nav: "Linear",
  summary: "Push AI visibility and SEO tasks to Linear and close them when issues are done.",
  meta: {
    title: "Linear Integration for SEO and GEO Tasks",
    description:
      "Push prioritized SEO and AI visibility tasks from AutoSEO to Linear as issues with priority, due date and full context — and sync their status back hourly.",
  },
  hero: {
    subtitle:
      "Connect Linear with a personal API key and turn AutoSEO's evidence-backed tasks into issues for your team — prioritized by impact, with steps and a link back.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the Linear integration",
    items: [
      "Linear issues in the team you choose",
      "Priority set from the task's impact score — Urgent, High, Medium or Low",
      "Markdown descriptions with steps, acceptance criteria, evidence and target prompts",
      "Due dates carried over when a task has one",
      "Hourly status sync: completed or canceled issues close the task in AutoSEO",
      "Push single tasks, a selection or new tasks automatically per category",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with Linear and AutoSEO",
    items: [
      {
        icon: "zap",
        title: "Ship GEO fixes with your product work",
        body: "Put AI visibility work — content gaps, missing citations, technical fixes — into the same backlog as everything else your team builds.",
      },
      {
        icon: "trending-up",
        title: "Start with the biggest wins",
        body: "Issues arrive with a priority derived from the task's impact score, so the most valuable work sits at the top.",
      },
      {
        icon: "workflow",
        title: "Route tasks by category",
        body: "Push new tasks of selected categories to Linear automatically and keep the rest in AutoSEO or another tool.",
      },
      {
        icon: "refresh",
        title: "Close the loop",
        body: "When an issue is completed or canceled in Linear, the task is marked done in AutoSEO within the hour.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect Linear in four steps,",
    muted: "with a personal API key.",
    items: [
      {
        title: "Create a personal API key",
        body: "In Linear, open Settings → Account → Security & access → Personal API keys and create a key labeled “AutoSEO” with read and write access.",
      },
      {
        title: "Connect from AutoSEO",
        body: "Open Optimizations → Tasks in your project, choose Connect PM Tool → Linear and paste the key.",
      },
      {
        title: "Pick a team",
        body: "Choose the Linear team new issues are created in.",
      },
      {
        title: "Push tasks",
        body: "Push a task from its detail view, select several at once, or turn on automatic pushing per category under Routing.",
      },
    ],
  },
  faq: [
    {
      q: "How do I send SEO tasks to Linear?",
      a: "Connect Linear under Optimizations → Tasks with a personal API key and pick a team. Then push any task — or let Routing push new tasks of a category automatically. Each task becomes a Linear issue with priority, steps, evidence and a link back to AutoSEO.",
    },
    {
      q: "How does AutoSEO set the Linear priority?",
      a: "From the task's impact score on a scale of 1 to 10: 9–10 becomes Urgent, 7–8 High, 4–6 Medium and 1–3 Low.",
    },
    {
      q: "Does the status sync go both ways?",
      a: "Status flows from Linear to AutoSEO. Every hour, AutoSEO checks linked issues: started issues move the task to In Progress, completed or canceled issues mark it done. Changes in AutoSEO aren't written back to Linear.",
    },
    {
      q: "Will pushing a task twice create duplicate issues?",
      a: "No. A task that is already linked to a Linear issue is skipped, and retries of a failed push don't create duplicates.",
    },
    {
      q: "Where is my Linear API key stored?",
      a: "It's stored encrypted with AES-256-GCM in AutoSEO's database and never sent back to the browser. It's only used to call the Linear API.",
    },
  ],
  cta: {
    title: "Turn AI visibility insights into Linear issues",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
