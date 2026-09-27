import type { PublicKnowledgeSource, KnowledgeHit } from "@/server/ai/knowledge/sources/service";
import type { DriveAccount } from "@/server/ai/knowledge/sources/gdrive";
import type { SlackChannel } from "@/server/ai/knowledge/sources/slack";

/** Client-side views of knowledge sources (type-only re-exports of the server shapes). */
export type KnowledgeSourceLite = PublicKnowledgeSource;
export type KnowledgeHitLite = KnowledgeHit;
export type DriveAccountLite = DriveAccount;
export type SlackChannelLite = SlackChannel;
