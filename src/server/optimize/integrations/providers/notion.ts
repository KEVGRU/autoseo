import "server-only";
import { fetchJson } from "../../net";
import { markdownToNotionBlocks } from "../format";
import type { PmClient } from "../types";
import { assigneeEmails, markdownWithAssignee, requireField, requireTarget, statusFromName, truncate, tryLookup, type Creds, type Target } from "./common";

const BASE = "https://api.notion.com/v1";

type NotionProp = { id: string; type: string; name?: string; status?: { name: string } | null; select?: { name: string } | null; checkbox?: boolean };

export function createNotionClient(creds: Creds, target: Target): PmClient {
  const token = requireField(creds, "token", "Integration secret");
  const api = <T>(path: string, init: { method?: string; json?: unknown } = {}) =>
    fetchJson<T>(`${BASE}${path}`, { ...init, headers: { authorization: `Bearer ${token}`, "Notion-Version": "2022-06-28" } });
  return {
    async test() {
      const me = await api<{ name?: string; bot?: { workspace_name?: string } }>("/users/me");
      return { account: me.bot?.workspace_name ? `${me.bot.workspace_name} · ${me.name ?? "integration"}` : (me.name ?? "Notion integration") };
    },
    async listTargets() {
      const res = await api<{ results: { id: string; title?: { plain_text: string }[] }[] }>("/search", {
        method: "POST",
        json: { filter: { property: "object", value: "database" }, page_size: 100 },
      });
      return res.results.map((d) => ({ id: d.id, name: d.title?.map((t) => t.plain_text).join("") || "Untitled database" }));
    },
    async createIssue(task) {
      const database = requireTarget(target, "Database");
      const db = await api<{ properties: Record<string, { type: string }> }>(`/databases/${encodeURIComponent(database.id)}`);
      const titleProp = Object.entries(db.properties).find(([, p]) => p.type === "title")?.[0];
      if (!titleProp) throw new Error("The Notion database has no title property.");
      // "People" property + workspace user matched by email (needs the "read user information incl. email" capability).
      const people = await tryLookup(async () => {
        const emails = assigneeEmails(task.assignee);
        const props = Object.entries(db.properties).filter(([, p]) => p.type === "people");
        const prop = (props.find(([name]) => /assign|owner|person|verantwort|zuständig/i.test(name)) ?? props[0])?.[0];
        if (!emails.length || !prop) return null;
        let cursor: string | undefined;
        for (let page = 0; page < 5; page++) {
          const res = await api<{ results: { id: string; type: string; person?: { email?: string } }[]; next_cursor: string | null }>(
            `/users?page_size=100${cursor ? `&start_cursor=${encodeURIComponent(cursor)}` : ""}`,
          );
          const u = res.results.find((x) => x.type === "person" && x.person?.email && emails.includes(x.person.email.toLowerCase()));
          if (u) return { prop, userId: u.id };
          if (!res.next_cursor) break;
          cursor = res.next_cursor;
        }
        return null;
      });
      const blocks = markdownToNotionBlocks(people ? task.markdown : markdownWithAssignee(task));
      const page = await api<{ id: string; url: string }>("/pages", {
        method: "POST",
        json: {
          parent: { database_id: database.id },
          properties: {
            [titleProp]: { title: [{ type: "text", text: { content: truncate(task.title, 1900) } }] },
            ...(people ? { [people.prop]: { people: [{ id: people.userId }] } } : {}),
          },
          children: blocks.slice(0, 100),
        },
      });
      // Notion accepts at most 100 children per request.
      for (let i = 100; i < blocks.length; i += 100) {
        await api(`/blocks/${page.id}/children`, { method: "PATCH", json: { children: blocks.slice(i, i + 100) } });
      }
      return { externalId: page.id, url: page.url, status: null };
    },
    async getStatus(externalId) {
      const page = await api<{ archived?: boolean; in_trash?: boolean; properties: Record<string, NotionProp> }>(`/pages/${encodeURIComponent(externalId)}`);
      if (page.archived || page.in_trash) return "done";
      const entries = Object.entries(page.properties);
      const status =
        entries.find(([name, p]) => p.type === "status" && /status/i.test(name)) ??
        entries.find(([, p]) => p.type === "status") ??
        entries.find(([name, p]) => p.type === "select" && /status|state/i.test(name));
      if (status) {
        const p = status[1];
        return statusFromName(p.status?.name ?? p.select?.name ?? null) ?? "open";
      }
      const done = entries.find(([name, p]) => p.type === "checkbox" && /done|complete|erledigt/i.test(name));
      if (done) return done[1].checkbox ? "done" : "open";
      return null;
    },
  };
}
