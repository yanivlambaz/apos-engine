/**
 * APOS Expert Engine.
 *
 * Answers user questions using only the project's approved knowledge sources.
 * It never invents knowledge, never answers from assumptions, and never
 * treats the conversation itself as a knowledge source — per
 * KNOWLEDGE_SYSTEM.md, conversations are recorded elsewhere purely for future
 * analysis (see `ConversationSession` / `ConversationRepository`).
 *
 * Real question-answering requires two capabilities that are out of scope for
 * this foundation: understanding documents well enough to retrieve the right
 * ones (requires parsing and/or an LLM) and turning retrieved knowledge into
 * prose (requires an LLM). Both are expressed here as ports only — the stable
 * seams a future AI provider will implement. Without them, the engine gives
 * an honest "insufficient knowledge" response instead of fabricating one.
 */
import type { IdFactory } from "../models/index.js";
import type { KnowledgeIndexEntry, KnowledgeManager } from "../knowledge/index.js";
import type { Citation } from "./Citation.js";
import type { ConversationContext } from "./ConversationContext.js";
import type { ExpertResponse } from "./ExpertResponse.js";
import { clampConfidence } from "./ExpertResponse.js";

/**
 * Retrieves knowledge candidates relevant to a question.
 *
 * This is the seam where future semantic search or an LLM-backed retriever
 * will be connected. No concrete implementation ships in this foundation:
 * real retrieval requires document parsing and/or an LLM, both out of scope.
 */
export interface KnowledgeRetrievalPort {
  retrieve(
    question: string,
    context: ConversationContext,
    knowledgeManager: KnowledgeManager
  ): Promise<readonly KnowledgeIndexEntry[]>;
}

/** Input handed to an {@link AnswerProviderPort}. */
export interface AnswerProviderInput {
  readonly question: string;
  readonly context: ConversationContext;
  readonly candidates: readonly KnowledgeIndexEntry[];
}

/** Result produced by an {@link AnswerProviderPort}. */
export interface AnswerProviderResult {
  readonly answer: string;
  readonly citations: readonly Citation[];
  readonly confidence: number;
  readonly followUpQuestions?: readonly string[];
}

/**
 * Produces an answer from a question and retrieved knowledge candidates.
 *
 * This is the seam where a future LLM-backed provider will be connected. No
 * concrete implementation ships in this foundation ("no LLM implementation").
 */
export interface AnswerProviderPort {
  answer(input: AnswerProviderInput): Promise<AnswerProviderResult>;
}

/** Options for constructing an {@link ExpertEngine}. */
export interface ExpertEngineOptions {
  readonly idFactory: IdFactory;

  /** Retrieves knowledge candidates for a question. Optional until a real retriever exists. */
  readonly retriever?: KnowledgeRetrievalPort;

  /** Produces answers from retrieved candidates. Optional until an LLM provider exists. */
  readonly answerProvider?: AnswerProviderPort;

  /** Clock used to timestamp responses; defaults to the current time. */
  readonly clock?: () => string;
}

/**
 * Public interface of the APOS Expert Engine.
 *
 * Single Responsibility: the engine only turns a question into an
 * {@link ExpertResponse}. It holds no conversation state itself (that is
 * `ConversationSession`'s job) and performs no knowledge acquisition (that is
 * `KnowledgeManager`'s job) — it purely coordinates the two to produce an
 * answer, and only when it can do so honestly.
 */
export class ExpertEngine {
  private readonly idFactory: IdFactory;

  private readonly retriever: KnowledgeRetrievalPort | undefined;

  private readonly answerProvider: AnswerProviderPort | undefined;

  private readonly clock: () => string;

  public constructor(options: ExpertEngineOptions) {
    this.idFactory = options.idFactory;
    this.retriever = options.retriever;
    this.answerProvider = options.answerProvider;
    this.clock = options.clock ?? (() => new Date().toISOString());
  }

  /**
   * Answer a user question using only approved knowledge sources.
   *
   * When no retriever or answer provider is configured, or the retriever
   * finds no candidates, the engine returns a response that honestly states
   * knowledge is insufficient, with zero citations and zero confidence — it
   * never guesses.
   */
  public async answer(
    question: string,
    context: ConversationContext,
    knowledgeManager: KnowledgeManager
  ): Promise<ExpertResponse> {
    if (this.retriever === undefined || this.answerProvider === undefined) {
      return this.buildInsufficientKnowledgeResponse(knowledgeManager, "no-ai-provider-configured");
    }

    const candidates = await this.retriever.retrieve(question, context, knowledgeManager);

    if (candidates.length === 0) {
      return this.buildInsufficientKnowledgeResponse(knowledgeManager, "no-knowledge-candidates-found");
    }

    const result = await this.answerProvider.answer({ question, context, candidates });

    const response: ExpertResponse = {
      id: this.idFactory("expert-response"),
      answer: result.answer,
      citations: result.citations,
      confidence: clampConfidence(result.confidence),
      metadata: { registeredSourceCount: knowledgeManager.getRegistry().all().length },
      createdAt: this.clock()
    };

    return result.followUpQuestions === undefined
      ? response
      : { ...response, followUpQuestions: result.followUpQuestions };
  }

  /**
   * Build the honest fallback response used whenever the engine cannot back
   * an answer with approved knowledge. This is the concrete behavior that
   * satisfies "never invents knowledge, never answers from assumptions" for
   * this foundation, since no AI provider ships with it.
   */
  private buildInsufficientKnowledgeResponse(
    knowledgeManager: KnowledgeManager,
    reason: string
  ): ExpertResponse {
    return {
      id: this.idFactory("expert-response"),
      answer: "I do not have enough approved knowledge to answer this question yet.",
      citations: [],
      confidence: 0,
      metadata: {
        reason,
        registeredSourceCount: knowledgeManager.getRegistry().all().length
      },
      createdAt: this.clock()
    };
  }
}
