import "server-only";
import { HttpError, fetchJson } from "../../net";
import { markdownToPlain } from "../format";
import type { PmClient } from "../types";
import { assigneeEmails, assigneeHandle, markdownWithAssignee, requireField, requireTarget, type Creds, type Target } from "./common";

const BASE = "https://app.asana.com/api/1.0";

export function createAsanaClient(creds: Creds, target: Target): PmClient {
  const token = requireField(creds, "token", "Personal access token");
  const api = <T>(path: string, init: { method?: string; json?: unknown } = {}) =>
    fetchJson<{ data: T }>(`${BASE}${path}`, { ...init, headers: { authorization: `Bearer ${token}` } }).then((r) => r.data);
  return {
    async test() {
      const me = await api<{ name: string; email: string; workspaces: { gid: string; name: string }[] }>("/users/me");
      return { account: `${me.workspaces[0]?.name ?? "Asana"} · ${me.email || me.name}` };
    },
    async listTargets() {
      const me = await api<{ workspaces: { gid: string; name: string }[] }>("/users/me");
      const out: { id: string; name: string }[] = [];
      for (const ws of me.workspaces.slice(0, 10)) {
        const projects = await api<{ gid: string; name: string }[]>(
          `/projects?workspace=${ws.gid}&archived=false&limit=100&opt_fields=name`,
        );
        for (const p of projects) out.push({ id: p.gid, name: me.workspaces.length > 1 ? `${ws.name} / ${p.name}` : p.name });
      }
      return out;
    },
    async createIssue(task) {
      const project = requireTarget(target, "Project");
      // Asana accepts a user gid or an email address as assignee.
      const handle = assigneeHandle(task.assignee);
      const assignee = assigneeEmails(task.assignee)[0] ?? (handle && /^\d+$/.test(handle) ? handle : null);
      const create = (assign: boolean) =>
        api<{ gid: string; permalink_url: string }>("/tasks?opt_fields=permalink_url", {
          method: "POST",
          json: {
            data: {
              name: task.title,
              notes: markdownToPlain(assign ? task.markdown : markdownWithAssignee(task)),
              projects: [project.id],
              ...(task.dueDate ? { due_on: task.dueDate } : {}),
              ...(assign && assignee ? { assignee } : {}),
            },
          },
        });
      let created: { gid: string; permalink_url: string };
      try {
        created = await create(!!assignee);
      } catch (err) {
        // Unknown / non-member assignee → create unassigned with the assignee named in the notes.
        if (!assignee || !(err instanceof HttpError) || (err.status !== 400 && err.status !== 403)) throw err;
        created = await create(false);
      }
      return { externalId: created.gid, url: created.permalink_url ?? `https://app.asana.com/0/${project.id}/${created.gid}`, status: "open" };
    },
    async getStatus(externalId) {
      const t = await api<{ completed: boolean }>(`/tasks/${encodeURIComponent(externalId)}?opt_fields=completed`);
      return t.completed ? "done" : "open";
    },
  };
}
