import "server-only";
import { httpJson, IntegrationHttpError } from "@/server/integrations/http";
import { slackMessagesToDocs, type SlackMessage } from "./convert";
import { capDocs, KnowledgeSourceError, type FetchResult, type SourceDoc } from "./types";

/**
 * Slack connector (bot token, xoxb-…). Reads the history of selected channels (default 90 days),
 * including thread replies, and stores one document per channel and day.
 * Required bot scopes: channels:history, channels:read (+ groups:* for private channels), users:read.
 */

const API = "https://slack.com/api";
const MAX_MESSAGES_PER_CHANNEL = 3000;
const MAX_THREADS_PER_CHANNEL = 60;

type SlackResponse = { ok: boolean; error?: string; needed?: string; response_metadata?: { next_cursor?: string } };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function slack<T extends SlackResponse>(token: string, method: string, params: Record<string, string | number | boolean> = {}): Promise<T> {
  const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
  for (let attempt = 0; ; attempt++) {
    let res: T;
    try {
      res = await httpJson<T>(`${API}/${method}?${qs.toString()}`, { headers: { Authorization: `Bearer ${token}` }, timeoutMs: 30_000 });
    } catch (err) {
      if (err instanceof IntegrationHttpError && err.status === 429 && attempt < 4) {
        await sleep(3000 * (attempt + 1));
        continue;
      }
      throw new KnowledgeSourceError(`Slack API error: ${err instanceof Error ? err.message : String(err)}`);
    }
    if (!res.ok) {
      if (res.error === "ratelimited" && attempt < 4) {
        await sleep(3000 * (attempt + 1));
        continue;
      }
      throw new SlackApiError(res.error ?? "unknown_error", res.needed);
    }
    return res;
  }
}

export class SlackApiError extends KnowledgeSourceError {
  constructor(
    public code: string,
    needed?: string,
  ) {
    super(
      code === "invalid_auth" || code === "not_authed" || code === "token_revoked" || code === "account_inactive"
        ? "Slack rejected the bot token — reinstall the app and paste the new xoxb- token."
        : code === "missing_scope"
          ? `The Slack app is missing a permission${needed ? ` (${needed})` : ""}. Add it under OAuth & Permissions and reinstall the app.`
          : code === "not_in_channel"
            ? "The bot is not a member of this channel — invite it with /invite @your-app."
            : code === "channel_not_found"
              ? "Channel not found (or it is private and the bot was not invited)."
              : `Slack API error: ${code}`,
    );
  }
}

export async function checkSlackToken(token: string): Promise<{ teamName: string | null; teamUrl: string | null }> {
  if (!/^xox[bp]-[A-Za-z0-9-]{20,}$/.test(token.trim())) throw new KnowledgeSourceError("Paste a Slack bot token (starts with xoxb-).");
  const res = await slack<SlackResponse & { team?: string; url?: string }>(token.trim(), "auth.test");
  return { teamName: res.team ?? null, teamUrl: res.url ?? null };
}

export type SlackChannel = { id: string; name: string; isPrivate: boolean; isMember: boolean; members: number | null };

export async function listSlackChannels(token: string): Promise<SlackChannel[]> {
  const out: SlackChannel[] = [];
  let cursor = "";
  let types = "public_channel,private_channel";
  do {
    let res: SlackResponse & { channels?: { id: string; name: string; is_private?: boolean; is_member?: boolean; num_members?: number }[] };
    try {
      res = await slack(token, "conversations.list", { types, exclude_archived: true, limit: 200, ...(cursor ? { cursor } : {}) });
    } catch (err) {
      // Apps without groups:read can still list public channels.
      if (err instanceof SlackApiError && err.code === "missing_scope" && types.includes("private")) {
        types = "public_channel";
        continue;
      }
      throw err;
    }
    for (const c of res.channels ?? []) out.push({ id: c.id, name: c.name, isPrivate: !!c.is_private, isMember: !!c.is_member, members: c.num_members ?? null });
    cursor = res.response_metadata?.next_cursor ?? "";
  } while (cursor && out.length < 2000);
  return out.sort((a, b) => Number(b.isMember) - Number(a.isMember) || a.name.localeCompare(b.name));
}

async function userNames(token: string, notes: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    let cursor = "";
    do {
      const res = await slack<SlackResponse & { members?: { id: string; name?: string; real_name?: string; profile?: { display_name?: string; real_name?: string } }[] }>(token, "users.list", {
        limit: 200,
        ...(cursor ? { cursor } : {}),
      });
      for (const u of res.members ?? []) map.set(u.id, u.profile?.display_name || u.real_name || u.profile?.real_name || u.name || u.id);
      cursor = res.response_metadata?.next_cursor ?? "";
    } while (cursor && map.size < 5000);
  } catch (err) {
    notes.push(`User names unavailable (${err instanceof Error ? err.message : String(err)}) — messages show user ids.`);
  }
  return map;
}

async function channelHistory(token: string, channel: { id: string; name: string }, oldest: number, notes: string[]): Promise<SlackMessage[]> {
  const messages: SlackMessage[] = [];
  let cursor = "";
  let joined = false;
  do {
    let res: SlackResponse & { messages?: SlackMessage[] };
    try {
      res = await slack(token, "conversations.history", { channel: channel.id, oldest: oldest.toFixed(6), limit: 200, ...(cursor ? { cursor } : {}) });
    } catch (err) {
      // Public channels can be joined automatically when the app has channels:join.
      if (err instanceof SlackApiError && err.code === "not_in_channel" && !joined) {
        joined = true;
        try {
          await slack(token, "conversations.join", { channel: channel.id });
          continue;
        } catch {
          throw err;
        }
      }
      throw err;
    }
    messages.push(...(res.messages ?? []));
    cursor = res.response_metadata?.next_cursor ?? "";
  } while (cursor && messages.length < MAX_MESSAGES_PER_CHANNEL);
  if (messages.length >= MAX_MESSAGES_PER_CHANNEL) notes.push(`#${channel.name}: only the latest ${MAX_MESSAGES_PER_CHANNEL} messages were read.`);

  const threads = messages.filter((m) => (m as { reply_count?: number }).reply_count && m.thread_ts === m.ts).slice(0, MAX_THREADS_PER_CHANNEL);
  for (const parent of threads) {
    try {
      const res = await slack<SlackResponse & { messages?: SlackMessage[] }>(token, "conversations.replies", { channel: channel.id, ts: parent.ts, limit: 200 });
      parent.replies = res.messages ?? [];
    } catch {
      // keep the parent message without replies
    }
  }
  return messages;
}

export async function fetchSlackDocs(
  token: string,
  opts: { channels: { id: string; name: string }[]; days?: number; teamUrl?: string | null; maxDocs?: number },
): Promise<FetchResult> {
  if (!opts.channels.length) throw new KnowledgeSourceError("Pick at least one Slack channel.");
  const notes: string[] = [];
  const days = Math.max(1, Math.min(365, opts.days ?? 90));
  const oldest = Date.now() / 1000 - days * 86_400;
  const users = await userNames(token, notes);
  const docs: SourceDoc[] = [];
  let failures = 0;
  for (const channel of opts.channels) {
    try {
      const messages = await channelHistory(token, channel, oldest, notes);
      docs.push(...slackMessagesToDocs(channel, messages, users, opts.teamUrl ?? null));
    } catch (err) {
      failures++;
      notes.push(`#${channel.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  if (failures === opts.channels.length) throw new KnowledgeSourceError(notes.join(" "));
  const max = capDocs(opts.maxDocs ?? 1000);
  docs.sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0));
  if (docs.length > max) notes.push(`Kept the ${max} most recent channel-days (limit per sync).`);
  return { docs: docs.slice(0, max), notes };
}
