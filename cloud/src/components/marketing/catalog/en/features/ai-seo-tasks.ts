import type { FeaturePage } from "../../types";

export default {
  slug: "ai-seo-tasks",
  nav: "AI SEO tasks",
  summary: "Evidence-backed GEO and SEO tasks, prioritized and pushed to Jira, Linear or Asana.",
  meta: {
    title: "AI SEO Tasks: Prioritized GEO Action Plan",
    description:
      "AI SEO tasks generated from visibility, citation, competitor, crawl and Search Console data — ranked by impact and effort and pushed to Jira, Linear or Asana.",
  },
  hero: {
    eyebrow: "AI SEO tasks",
    title: "Turn AI SEO data into tasks",
    muted: "your team can finish.",
    subtitle:
      "Every day, AutoSEO analyzes your prompt visibility, citations, competitors, sentiment, crawl access and Search Console data and turns what it finds into prioritized tasks — with evidence, steps and acceptance criteria attached. Push them to Jira, Linear, Asana and five more tools. When the signal disappears, the task resolves itself.",
  },
  visual: "tasks",
  screenshot: {
    src: "/screenshots/tasks.png",
    alt: "AutoSEO task list with priority, impact and effort, category, assignee and status for AI visibility and SEO tasks",
    url: "tasks",
  },
  stats: [
    { value: 8, label: "Signal sources", note: "Visibility to Search Console" },
    { value: 7, label: "Task categories", note: "Technical to reputation" },
    { value: 9, label: "Task destinations", note: "8 PM tools plus webhooks" },
    { value: 0, prefix: "$", label: "Self-hosted", note: "MIT licensed, every feature" },
  ],
  why: {
    eyebrow: "Why it matters",
    title: "Dashboards don't fix anything.",
    muted: "Assigned tasks do.",
    body: "AI visibility data raises more questions than it answers: which prompt to work on, which page to write, which forum to show up in. Without a clear list of next steps, insights stay in reports while competitors act.",
    points: [
      {
        title: "Too many signals, too little time",
        body: "Visibility gaps, citation gaps, crawl errors and criticism all compete for attention. One priority score based on impact and effort puts them in order.",
      },
      {
        title: "Every task needs a reason",
        body: "A task backed by the prompts, answers and URLs that triggered it is easier to approve — and easier to check once it's done.",
      },
      {
        title: "Work happens in your PM tool",
        body: "Developers live in Jira, content teams in Asana or Notion. Tasks should arrive where their owners already work.",
      },
    ],
  },
  capabilities: {
    eyebrow: "What you get",
    title: "An action plan that updates itself,",
    muted: "every day.",
    items: [
      {
        icon: "list-checks",
        title: "Seven task categories",
        body: "Technical, content, visibility, competitor, offsite, reputation and setup — each with a suggested owner, from the web team to PR.",
      },
      {
        icon: "target",
        title: "Priority from impact and effort",
        body: "Each task gets impact and effort scores from 1 to 10, a priority from 10 to 100 and a band from P1 to P4, so quick wins rise to the top.",
      },
      {
        icon: "database",
        title: "Evidence attached",
        body: "The prompts, answers, cited URLs, audit results or Search Console rows behind each task, plus steps and acceptance criteria.",
      },
      {
        icon: "refresh",
        title: "A list that maintains itself",
        body: "Re-analyzed daily and after every tracking run. Tasks resolve themselves when their signal disappears and reopen if it comes back.",
      },
      {
        icon: "plug",
        title: "Push to your PM tool",
        body: "Linear, Jira Cloud, Asana, ClickUp, Trello, monday.com, Notion and awork with status synced back — or signed webhooks for Zapier, n8n and Make.",
      },
      {
        icon: "users",
        title: "Routing by category",
        body: "Give each category a default assignee and a target tool, and new tasks are assigned and pushed automatically.",
      },
    ],
  },
  steps: {
    eyebrow: "How it works",
    title: "From data to done",
    muted: "in three steps.",
    items: [
      {
        title: "AutoSEO analyzes your data",
        body: "Eight signal sources check visibility, citations, competitors, reputation, content coverage, technical health, Search Console and your tracking setup.",
      },
      {
        title: "Tasks are written and ranked",
        body: "When an AI provider is available, AI writes each task from its evidence; otherwise clear templates are used. Duplicates are merged automatically.",
      },
      {
        title: "Your team works through them",
        body: "Assign tasks, push them to Jira or Linear, draft content straight from a task's content plan, or export the list as CSV.",
      },
    ],
  },
  faq: [
    {
      q: "How does AutoSEO generate SEO tasks?",
      a: "AutoSEO runs eight signal sources over your project data: AI visibility, citations, competitors, reputation, content coverage, technical health, Search Console and tracking setup. Each finding becomes a task with evidence, steps and acceptance criteria. The analysis runs daily and again after every tracking run.",
    },
    {
      q: "What kinds of tasks does it create?",
      a: "Examples include getting mentioned for a prompt where competitors appear, publishing a page that answers an uncovered question, winning head-to-head comparisons, getting listed on a site AI cites for competitors, addressing recurring criticism, correcting inaccurate AI claims and unblocking pages that refuse crawlers.",
    },
    {
      q: "How are tasks prioritized?",
      a: "Every task has an impact and an effort score from 1 to 10. The priority is 10 × (0.65 × impact + 0.35 × (11 − effort)), so high impact dominates and cheaper tasks win ties. Priorities of 75 and above are P1, 60 and above P2, 45 and above P3, the rest P4.",
    },
    {
      q: "Can I push tasks to Jira or Linear?",
      a: "Yes. Connect Jira Cloud, Linear, Asana, ClickUp, Trello, monday.com, Notion or awork with an API token and pick the project, team or list. Status syncs back, so a task closed in your PM tool is closed in AutoSEO. A signed webhook sends events to Zapier, n8n, Make or your own endpoint.",
    },
    {
      q: "Do tasks update automatically?",
      a: "Yes. Tasks are deduplicated by fingerprint, their evidence is refreshed on every analysis, and a task whose signal has disappeared resolves itself. If the problem comes back, the task reopens. You can switch auto-resolve off per project.",
    },
    {
      q: "Do I need an AI provider for tasks?",
      a: "No. Tasks are found in your data without AI and written from templates. When AI is available — through the providers the Codext team has connected on AutoSEO Cloud, your own Claude Code or Codex through a local agent, or your own API keys when self-hosting — it writes the title, summary and steps from the evidence.",
    },
    {
      q: "Are AI SEO tasks free?",
      a: "Tasks are part of the open-source AutoSEO app and free to self-host with every feature. AutoSEO Cloud gives you a managed workspace for $50 per month with up to 10 projects and $10 of AI and data usage included. There are no per-task or per-seat fees.",
    },
  ],
  related: ["ai-content-optimization", "ai-crawlability", "ai-citation-tracking", "ai-competitor-analysis"],
  cta: {
    title: "Get a prioritized action plan for AI search",
    subtitle: "Start with an AutoSEO Cloud workspace for $50/month, or self-host the open-source edition for free.",
  },
} satisfies FeaturePage;
