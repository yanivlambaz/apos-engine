import type { Id, IdFactory } from "../models/index.js";
import type { Conversation, ConversationState } from "./Conversation.js";
import type { ConversationMessage, ConversationRole } from "./ConversationMessage.js";

/** Options for constructing a {@link ConversationSession}. */
export interface ConversationSessionOptions {
  readonly id: Id;
  readonly verticalId: Id;
  readonly idFactory: IdFactory;
  readonly metadata?: Readonly<Record<string, unknown>>;

  /** Clock used to timestamp session activity; defaults to the current time. */
  readonly clock?: () => string;
}

/** Optional extras attached when appending a message. */
export interface AddMessageOptions {
  readonly responseId?: Id;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Manages one in-progress conversation.
 *
 * Single Responsibility: the session only tracks messages, timestamps,
 * metadata and lifecycle state for one conversation. It performs no analysis
 * of message content and never treats messages as knowledge — per
 * KNOWLEDGE_SYSTEM.md's Conversation Rule, conversations are recorded for
 * future review only, never learned from directly.
 *
 * A session is mutable while active; calling {@link toConversation} produces
 * an immutable snapshot suitable for storage once the session is closed.
 */
export class ConversationSession {
  public readonly id: Id;

  public readonly verticalId: Id;

  private readonly idFactory: IdFactory;

  private readonly clock: () => string;

  private readonly startedAt: string;

  private updatedAt: string;

  private state: ConversationState = "active";

  private readonly messages: ConversationMessage[] = [];

  private metadata: Readonly<Record<string, unknown>>;

  public constructor(options: ConversationSessionOptions) {
    this.id = options.id;
    this.verticalId = options.verticalId;
    this.idFactory = options.idFactory;
    this.clock = options.clock ?? (() => new Date().toISOString());
    this.startedAt = this.clock();
    this.updatedAt = this.startedAt;
    this.metadata = options.metadata ?? {};
  }

  /** Append a message to the conversation. Throws once the session is closed. */
  public addMessage(
    role: ConversationRole,
    text: string,
    options: AddMessageOptions = {}
  ): ConversationMessage {
    if (this.state === "closed") {
      throw new Error(`ConversationSession ${this.id} is closed and cannot accept new messages.`);
    }

    const base: ConversationMessage = {
      id: this.idFactory("conversation-message"),
      role,
      text,
      createdAt: this.clock()
    };

    const message: ConversationMessage = {
      ...base,
      ...(options.responseId === undefined ? {} : { responseId: options.responseId }),
      ...(options.metadata === undefined ? {} : { metadata: options.metadata })
    };

    this.messages.push(message);
    this.updatedAt = message.createdAt;
    return message;
  }

  /** Merge additional metadata into the session. */
  public updateMetadata(metadata: Readonly<Record<string, unknown>>): void {
    this.metadata = { ...this.metadata, ...metadata };
    this.updatedAt = this.clock();
  }

  /** Close the session. No further messages may be added afterward. */
  public close(): void {
    this.state = "closed";
    this.updatedAt = this.clock();
  }

  /** Read the current lifecycle state without exposing internal mutability. */
  public getState(): ConversationState {
    return this.state;
  }

  /** Produce an immutable snapshot suitable for storage. */
  public toConversation(): Conversation {
    return {
      id: this.id,
      verticalId: this.verticalId,
      state: this.state,
      messages: [...this.messages],
      metadata: this.metadata,
      startedAt: this.startedAt,
      updatedAt: this.updatedAt
    };
  }
}
