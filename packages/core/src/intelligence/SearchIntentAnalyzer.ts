import type { Id } from "../models/index.js";
import type { Conversation } from "../expert/Conversation.js";

/**
 * The Search Intent categories defined by SEARCH_INTENT_SYSTEM.md.
 */
export type SearchIntentType =
  | "commercial"
  | "informational"
  | "navigational"
  | "transactional"
  | "unknown";

/**
 * The Search Intent evidence extracted from a completed conversation.
 *
 * This is evidence *about* the conversation, never knowledge derived *from*
 * it — per KNOWLEDGE_SYSTEM.md, business knowledge comes only from the
 * Knowledge System, and per SEARCH_INTENT_SYSTEM.md, conversations are
 * evidence for Search Intent only.
 */
export interface SearchIntentAnalysis {
  readonly conversationId: Id;

  /** The representative search intent, expressed in the user's own words. */
  readonly searchIntent: string;

  readonly searchIntentType: SearchIntentType;

  /** Vertical Pack-defined domain this intent belongs to (e.g. "Home Care"). Unset until classified. */
  readonly searchDomain?: string;

  /** A specific entity referenced by the intent (e.g. an organization name). Unset until classified. */
  readonly searchEntity?: string;

  /** The deeper "why" behind the search, distinct from its literal wording. Unset until classified. */
  readonly userIntent?: string;

  /** Confidence in this classification, in the inclusive range [0, 1]. */
  readonly confidence: number;
}

/** The part of {@link SearchIntentAnalysis} a classifier is responsible for producing. */
export type SearchIntentClassification = Omit<SearchIntentAnalysis, "conversationId">;

/**
 * Classifies a completed conversation's Search Intent, Domain, Entity and
 * User Intent.
 *
 * This is the seam a future NLP/LLM-backed classifier will implement. No
 * concrete implementation ships in this foundation ("no LLM implementation").
 */
export interface SearchIntentClassifierPort {
  classify(conversation: Conversation): Promise<SearchIntentClassification>;
}

/** Options for constructing a {@link SearchIntentAnalyzer}. */
export interface SearchIntentAnalyzerOptions {
  /** Optional classifier. Without one, the analyzer never invents a classification. */
  readonly classifier?: SearchIntentClassifierPort;
}

/**
 * Analyzes a completed conversation to identify its Search Intent.
 *
 * Single Responsibility: this module only identifies what a conversation is
 * evidence *of*. It never answers questions, never generates content, and
 * never invents a domain, entity, or intent type it cannot classify — the
 * unclassified fields are simply left unset.
 */
export class SearchIntentAnalyzer {
  private readonly classifier: SearchIntentClassifierPort | undefined;

  public constructor(options: SearchIntentAnalyzerOptions = {}) {
    this.classifier = options.classifier;
  }

  /**
   * Analyze a completed conversation.
   *
   * Without a classifier, the honest result is the user's own first message,
   * verbatim, with every other dimension left unclassified and confidence 0.
   */
  public async analyze(conversation: Conversation): Promise<SearchIntentAnalysis> {
    if (this.classifier === undefined) {
      return {
        conversationId: conversation.id,
        searchIntent: firstUserMessageText(conversation),
        searchIntentType: "unknown",
        confidence: 0
      };
    }

    const classification = await this.classifier.classify(conversation);
    return { conversationId: conversation.id, ...classification };
  }
}

function firstUserMessageText(conversation: Conversation): string {
  const firstUserMessage = conversation.messages.find((message) => message.role === "user");
  return firstUserMessage?.text ?? "";
}
