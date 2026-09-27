"use client";

import Link from "next/link";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

type TaskLite = {
  id: string;
  title: string;
  summary: string;
  targetUrls: string[];
  targetPrompts: string[];
  steps: { text: string; done: boolean }[];
};

/** Kick-off message for the project agent: task context + how to propose CMS edits (never applied without review). */
export function taskAgentPrompt(task: TaskLite): string {
  const lines = [
    `Let's work on this optimization task together: “${task.title}” (task ${task.id}).`,
    task.summary ? `Summary: ${task.summary}` : "",
    task.targetUrls.length ? `Target URLs:\n${task.targetUrls.slice(0, 10).map((u) => `- ${u}`).join("\n")}` : "",
    task.targetPrompts.length ? `Target prompts:\n${task.targetPrompts.slice(0, 5).map((p) => `- ${p}`).join("\n")}` : "",
    task.steps.some((s) => !s.done) ? `Open steps:\n${task.steps.filter((s) => !s.done).slice(0, 8).map((s) => `- ${s.text}`).join("\n")}` : "",
    `Look at the affected pages in our connected CMS (list_cms_items / get_cms_item) and propose concrete edits — titles, meta descriptions, image alt texts or JSON-LD — with propose_cms_change and taskId ${task.id}. Explain each change briefly. Don't apply anything: I'll review the proposals under Content → Site edits.`,
  ];
  const text = lines.filter(Boolean).join("\n\n");
  return text.length > 3500 ? `${text.slice(0, 3499)}…` : text;
}

export function WorkWithAgentButton({ projectId, task }: { projectId: string; task: TaskLite }) {
  return (
    <Button size="sm" variant="outline" asChild>
      <Link href={`/p/${projectId}/agent?prompt=${encodeURIComponent(taskAgentPrompt(task))}`}>
        <Bot className="size-3.5" /> Work on this with the Agent
      </Link>
    </Button>
  );
}
