import type { Id } from "../models/index.js";
import type { ConversationMessage } from "./ConversationMessage.js";

/** Lifecycle state of a conversation. */
export type ConversationState = "active" | "closed";

/**
 * A complete, immutable conversation record.
 *
 * This is the durable shape a {@link ConversationSession} produces once
 * snapshotted (via `toConversation()`), and the shape a
 * {@link ConversationRepositoryPort} stores. It carries every message plus
 * timestamps and metadata, but never analysis, derived knowledge, or
 * generated content — per KNOWLEDGE_SYSTEM.md's Conversation Rule,
 * conversations are recorded only for future review, never as expert
 * knowledge.
 */
export interface Conversation {
  readonly id: Id;
  readonly verticalId: Id;
  readonly state: ConversationState;
  readonly messages: readonly ConversationMessage[];
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly startedAt: string;
  readonly updatedAt: string;
}
