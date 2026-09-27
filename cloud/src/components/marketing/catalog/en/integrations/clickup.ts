import type { IntegrationPage } from "../../types";

export default {
  slug: "clickup",
  name: "ClickUp",
  nav: "ClickUp",
  summary: "Push AI visibility and SEO tasks to ClickUp lists with priority, tags and status sync.",
  meta: {
    title: "ClickUp Integration for SEO and GEO Tasks",
    description:
      "Push prioritized SEO and AI visibility tasks from AutoSEO to ClickUp lists with Markdown, priority, tags and due dates — and sync their status back hourly.",
  },
  hero: {
    subtitle:
      "Connect ClickUp with a personal API token and send AutoSEO's evidence-backed tasks to any list — prioritized by impact, tagged by category and closed in AutoSEO when you close them in ClickUp.",
  },
  overview: {
    eyebrow: "Overview",
    title: "What you get",
    muted: "with the ClickUp integration",
    items: [
      "ClickUp tasks in any list, folder or space your token can reach",
      "Markdown descriptions with steps, acceptance criteria, evidence and target prompts",
      "Priority from the impact score — Urgent, High, Normal or Low",
      "Tags for autoseo and the task category, plus due dates",
      "Assignees matched to workspace members by email, username or user ID",
      "Hourly status sync: closed tasks are marked done, custom statuses count as in progress",
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "What you can do",
    muted: "with ClickUp and AutoSEO",
    items: [
      {
        icon: "trending-up",
        title: "Sort GEO work by impact",
        body: "Tasks arrive with a ClickUp priority derived from their impact score, so the biggest wins sit at the top of your list.",
      },
      {
        icon: "layers",
        title: "Find AutoSEO work in any view",
        body: "Every task is tagged autoseo plus its category, so ClickUp views and filters can pick them up across lists.",
      },
      {
        icon: "workflow",
        title: "Route and assign by category",
        body: "Push new tasks of selected categories automatically and set the ClickUp assignee per category under Routing.",
      },
      {
        icon: "refresh",
        title: "Close the loop",
        body: "Move a task to a closed or done status in ClickUp, and AutoSEO resolves it within the hour.",
      },
    ],
  },
  setup: {
    eyebrow: "Setup",
    title: "Connect ClickUp in three steps,",
    muted: "with a personal API token.",
    items: [
      {
        title: "Generate a personal API token",
        body: "In ClickUp, click your avatar → Settings → Apps and generate a personal API token. It starts with pk_.",
      },
      {
        title: "Connect from AutoSEO",
        body: "Open Optimizations → Tasks in your project, choose Connect PM Tool → ClickUp, paste the token and pick the list tasks are created in.",
      },
      {
        title: "Push tasks",
        body: "Push a task from its detail view, select several at once, or turn on automatic pushing per category under Routing.",
      },
    ],
  },
  faq: [
    {
      q: "How do I send SEO tasks to ClickUp?",
      a: "Connect ClickUp under Optimizations → Tasks with a personal API token and pick a list. Then push any task — or let Routing push new tasks of a category automatically. Each task becomes a ClickUp task with Markdown description, priority, tags and a link back to AutoSEO.",
    },
    {
      q: "How does AutoSEO set the ClickUp priority?",
      a: "From the task's impact score on a scale of 1 to 10: 9–10 becomes Urgent, 7–8 High, 4–6 Normal and 1–3 Low.",
    },
    {
      q: "How does the status sync handle custom ClickUp statuses?",
      a: "AutoSEO reads the status type. Closed and done statuses mark the task done, custom statuses count as in progress, and open statuses keep it open. It checks every hour and doesn't write changes back to ClickUp.",
    },
    {
      q: "Can AutoSEO assign ClickUp tasks?",
      a: "Yes. AutoSEO matches the assignee from Routing — or the email of the AutoSEO assignee — to your ClickUp workspace members by email, username or user ID. If nobody matches, the name is added to the description instead.",
    },
    {
      q: "Where is my ClickUp token stored?",
      a: "It's stored encrypted with AES-256-GCM in AutoSEO's database and never sent back to the browser. It's only used to call the ClickUp API.",
    },
  ],
  cta: {
    title: "Turn AI visibility insights into ClickUp tasks",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies IntegrationPage;
