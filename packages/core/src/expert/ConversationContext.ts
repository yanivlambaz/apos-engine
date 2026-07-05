import type { Id } from "../models/index.js";
import type { Conversation } from "./Conversation.js";
import type { ConversationMessage } from "./ConversationMessage.js";

/**
 * A bounded, read-only view of a conversation, passed to the Expert Engine
 * when answering a question.
 *
 * The context exists so the engine (or a future AI provider) can see recent
 * conversational turns. It is never treated as a knowledge source: per
 * KNOWLEDGE_SYSTEM.md, only approved knowledge sources may back an answer.
 */
export interface ConversationContext {
  readonly sessionId: Id;
  readonly verticalId: Id;
  readonly recentMessages: readonly ConversationMessage[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/** Options for deriving a {@link ConversationContext} from a conversation. */
export interface CreateConversationContextOptions {
  /** Maximum number of trailing messages to include. Defaults to 10. */
  readonly maxMessages?: number;
}

/**
 * Derive a bounded context view from a conversation.
 *
 * Only the most recent messages are included, keeping the context small and
 * making explicit that it is a window, not the full conversational history.
 */
export function createConversationContext(
  conversation: Conversation,
  options: CreateConversationContextOptions = {}
): ConversationContext {
  const maxMessages = options.maxMessages ?? 10;

  return {
    sessionId: conversation.id,
    verticalId: conversation.verticalId,
    recentMessages: conversation.messages.slice(-maxMessages)
  };
}
