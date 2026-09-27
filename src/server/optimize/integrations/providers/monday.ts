import "server-only";
import { fetchJson } from "../../net";
import { markdownToHtml } from "../../markdown";
import type { PmClient } from "../types";
import { assigneeEmails, markdownWithAssignee, requireField, requireTarget, statusFromName, truncate, tryLookup, type Creds, type Target } from "./common";

type GqlResponse<T> = { data?: T; errors?: { message: string }[]; error_message?: string };

export function createMondayClient(creds: Creds, target: Target): PmClient {
  const token = requireField(creds, "token", "API token");
  const gql = async <T>(query: string, variables: Record<string, unknown> = {}): Promise<T> => {
    const res = await fetchJson<GqlResponse<T>>("https://api.monday.com/v2", {
      method: "POST",
      headers: { authorization: token, "API-Version": "2025-04" },
      json: { query, variables },
    });
    if (res.errors?.length) throw new Error(`monday.com: ${res.errors.map((e) => e.message).join("; ")}`);
    if (res.error_message) throw new Error(`monday.com: ${res.error_message}`);
    if (!res.data) throw new Error("monday.com returned no data.");
    return res.data;
  };
  let slug: string | null = null;
  const accountSlug = async () => {
    if (slug) return slug;
    const d = await gql<{ me: { account: { slug: string } } }>(`query { me { account { slug } } }`);
    slug = d.me.account.slug;
    return slug;
  };
  return {
    async test() {
      const d = await gql<{ me: { name: string; email: string; account: { name: string; slug: string } } }>(
        `query { me { name email account { name slug } } }`,
      );
      slug = d.me.account.slug;
      return { account: `${d.me.account.name} · ${d.me.email || d.me.name}` };
    },
    async listTargets() {
      const d = await gql<{ boards: { id: string; name: string; type?: string }[] }>(
        `query { boards(limit: 200, state: active) { id name type } }`,
      );
      return d.boards.filter((b) => !b.type || b.type === "board").map((b) => ({ id: String(b.id), name: b.name }));
    },
    async createIssue(task) {
      const board = requireTarget(target, "Board");
      // People column + user id (looked up by email) → the item is assigned on creation.
      const people = await tryLookup(async () => {
        const emails = assigneeEmails(task.assignee);
        if (!emails.length) return null;
        const r = await gql<{ users: { id: string }[]; boards: { columns: { id: string; type: string; title: string }[] }[] }>(
          `query($emails: [String], $board: [ID!]) { users(emails: $emails) { id } boards(ids: $board) { columns { id type title } } }`,
          { emails, board: [board.id] },
        );
        const cols = (r.boards[0]?.columns ?? []).filter((c) => c.type === "people");
        const col = cols.find((c) => /owner|assign|person|verantwort|zuständig/i.test(c.title)) ?? cols[0];
        const user = r.users[0];
        return col && user ? { column: col.id, userId: Number(user.id) } : null;
      });
      const d = await gql<{ create_item: { id: string } }>(
        `mutation($board: ID!, $name: String!, $values: JSON) { create_item(board_id: $board, item_name: $name, column_values: $values) { id } }`,
        {
          board: board.id,
          name: truncate(task.title, 255),
          values: people ? JSON.stringify({ [people.column]: { personsAndTeams: [{ id: people.userId, kind: "person" }] } }) : null,
        },
      );
      const itemId = String(d.create_item.id);
      await gql(`mutation($item: ID!, $body: String!) { create_update(item_id: $item, body: $body) { id } }`, {
        item: itemId,
        body: markdownToHtml(people ? task.markdown : markdownWithAssignee(task)),
      });
      const account = await accountSlug().catch(() => null);
      const url = account ? `https://${account}.monday.com/boards/${board.id}/pulses/${itemId}` : null;
      return { externalId: itemId, url, status: null };
    },
    async getStatus(externalId) {
      const d = await gql<{ items: { state: string; column_values: { type: string; text: string | null }[] }[] }>(
        `query($ids: [ID!]) { items(ids: $ids) { state column_values { type text } } }`,
        { ids: [externalId] },
      );
      const item = d.items[0];
      if (!item) return null;
      if (item.state === "archived" || item.state === "deleted") return "done";
      const status = item.column_values.find((c) => c.type === "status" && c.text);
      return statusFromName(status?.text) ?? "open";
    },
  };
}
