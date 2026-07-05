import type { Id } from "../models/index.js";

/** Who authored a conversation message. */
export type ConversationRole = "user" | "expert";

/**
 * A single message within a conversation.
 *
 * Messages are plain records only. Nothing in this module inspects, analyzes,
 * or derives knowledge from message text — per KNOWLEDGE_SYSTEM.md's
 * Conversation Rule, conversations are never a knowledge source.
 */
export interface ConversationMessage {
  readonly id: Id;
  readonly role: ConversationRole;
  readonly text: string;
  readonly createdAt: string;

  /**
   * Present only on `expert` messages: the id of the {@link ExpertResponse}
   * this message reports, so the full response (citations, confidence, etc.)
   * can be looked up without duplicating it onto the message itself.
   */
  readonly responseId?: Id;

  readonly metadata?: Readonly<Record<string, unknown>>;
}
