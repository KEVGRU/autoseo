import "server-only";
import { fetchJson } from "../../net";
import type { ExternalStatus, PmClient } from "../types";
import {
  assigneeEmails,
  assigneeHandle,
  markdownWithAssignee,
  requireField,
  requireTarget,
  tryLookup,
  urgencyFromImpact,
  type Creds,
  type Target,
} from "./common";

const BASE = "https://api.clickup.com/api/v2";

export function createClickUpClient(creds: Creds, target: Target): PmClient {
  const token = requireField(creds, "token", "API token");
  const api = <T>(path: string, init: { method?: string; json?: unknown } = {}) =>
    fetchJson<T>(`${BASE}${path}`, { ...init, headers: { authorization: token } });
  return {
    async test() {
      const me = await api<{ user: { username: string; email: string } }>("/user");
      return { account: me.user.email || me.user.username };
    },
    async listTargets() {
      const { teams } = await api<{ teams: { id: string; name: string }[] }>("/team");
      const out: { id: string; name: string }[] = [];
      for (const team of teams.slice(0, 5)) {
        const { spaces } = await api<{ spaces: { id: string; name: string }[] }>(`/team/${team.id}/space?archived=false`);
        for (const space of spaces.slice(0, 15)) {
          const [{ lists }, { folders }] = await Promise.all([
            api<{ lists: { id: string; name: string }[] }>(`/space/${space.id}/list?archived=false`),
            api<{ folders: { id: string; name: string; lists: { id: string; name: string }[] }[] }>(`/space/${space.id}/folder?archived=false`),
          ]);
          for (const l of lists) out.push({ id: l.id, name: `${space.name} / ${l.name}` });
          for (const f of folders) for (const l of f.lists ?? []) out.push({ id: l.id, name: `${space.name} / ${f.name} / ${l.name}` });
          if (out.length > 300) return out;
        }
      }
      return out;
    },
    async createIssue(task) {
      const list = requireTarget(target, "List");
      // ClickUp assigns by numeric user id — resolve it from the workspace members.
      const userId = await tryLookup(async () => {
        const emails = assigneeEmails(task.assignee);
        const handle = assigneeHandle(task.assignee)?.toLowerCase() ?? null;
        if (!emails.length && !handle) return null;
        const { teams } = await api<{ teams: { members?: { user: { id: number; username?: string | null; email?: string | null } }[] }[] }>("/team");
        for (const team of teams) {
          const m = (team.members ?? []).find(
            (x) =>
              (x.user.email && emails.includes(x.user.email.toLowerCase())) ||
              (handle && (x.user.username?.toLowerCase() === handle || String(x.user.id) === handle)),
          );
          if (m) return m.user.id;
        }
        return null;
      });
      const created = await api<{ id: string; url: string; status?: { status: string } }>(`/list/${encodeURIComponent(list.id)}/task`, {
        method: "POST",
        json: {
          name: task.title,
          markdown_content: userId ? task.markdown : markdownWithAssignee(task),
          ...(userId ? { assignees: [userId] } : {}),
          priority: urgencyFromImpact(task.impact),
          tags: task.labels.map((l) => l.toLowerCase()),
          ...(task.dueDate ? { due_date: new Date(`${task.dueDate}T12:00:00Z`).getTime() } : {}),
        },
      });
      return { externalId: created.id, url: created.url ?? `https://app.clickup.com/t/${created.id}`, status: created.status?.status ?? null };
    },
    async getStatus(externalId) {
      const t = await api<{ status: { status: string; type: string } }>(`/task/${encodeURIComponent(externalId)}`);
      const type = t.status?.type;
      if (type === "closed" || type === "done") return "done";
      const map: Record<string, ExternalStatus> = { open: "open", custom: "in_progress" };
      return map[type ?? ""] ?? "open";
    },
  };
}
