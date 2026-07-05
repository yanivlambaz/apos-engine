import type { Id } from "../models/index.js";
import type { Conversation } from "./Conversation.js";

/**
 * Stores completed conversations.
 *
 * Single Responsibility: this module only persists and retrieves conversation
 * records. It performs no analysis, no learning, and no content generation —
 * per KNOWLEDGE_SYSTEM.md's Conversation Rule, conversations may become future
 * content opportunities for a separate process to review, but are never
 * expert knowledge on their own.
 */
export interface ConversationRepositoryPort {
  save(conversation: Conversation): void;
  getById(conversationId: Id): Conversation | undefined;
  all(): readonly Conversation[];
}

/**
 * In-memory store for completed conversations.
 *
 * Only conversations in the `closed` state may be saved, since this
 * repository's job is to store *completed* conversations; an active
 * conversation belongs to a live {@link ConversationSession}.
 */
export class InMemoryConversationRepository implements ConversationRepositoryPort {
  private readonly conversationsById = new Map<Id, Conversation>();

  public save(conversation: Conversation): void {
    if (conversation.state !== "closed") {
      throw new Error(
        `ConversationRepository only stores completed conversations; ${conversation.id} is still "${conversation.state}".`
      );
    }

    this.conversationsById.set(conversation.id, conversation);
  }

  public getById(conversationId: Id): Conversation | undefined {
    return this.conversationsById.get(conversationId);
  }

  public all(): readonly Conversation[] {
    return [...this.conversationsById.values()];
  }
}
