/**
 * APOS Authority Intelligence Engine.
 *
 * Decides whether a completed Expert Conversation should become a permanent
 * Authority Asset, per SEARCH_INTENT_SYSTEM.md. It never generates content
 * and never generates pages — it only produces exactly one Authority
 * Recommendation that a later workflow, and eventually the Generators, may
 * act upon.
 *
 * Business knowledge comes only from the Knowledge System (KNOWLEDGE_SYSTEM.md).
 * The conversation itself is never treated as knowledge here — it is
 * evidence for Search Intent only.
 */
import type { IdFactory } from "../models/index.js";
import type { Conversation } from "../expert/Conversation.js";
import type { ObjectRegistryReader } from "../objects/ObjectRegistry.js";
import { clampUnitInterval } from "./AuthorityRecommendation.js";
import type { AuthorityDecision, AuthorityRecommendation } from "./AuthorityRecommendation.js";
import type { AuthorityScore, AuthorityScorerPort, AuthorityScoringInput } from "./AuthorityScorer.js";
import type { CoverageAnalyzerPort } from "./CoverageAnalyzer.js";
import type { DuplicateDetectorPort } from "./DuplicateDetector.js";
import { SearchIntentAnalyzer } from "./SearchIntentAnalyzer.js";

/** Evidence handed to an {@link AuthorityDecisionPolicyPort}. */
export interface AuthorityDecisionInput extends AuthorityScoringInput {
  readonly score: AuthorityScore;
}

/** A decision produced by an {@link AuthorityDecisionPolicyPort}. */
export interface AuthorityDecisionOutput {
  readonly decision: AuthorityDecision;
  readonly confidence: number;
  readonly reasoning: readonly string[];
  readonly suggestedPattern?: string;
}

/**
 * Chooses one of the four allowed decisions from analyzed evidence.
 *
 * This is the seam a future business/AI-backed policy will implement. No
 * concrete scoring or reasoning algorithm ships in this foundation.
 */
export interface AuthorityDecisionPolicyPort {
  decide(input: AuthorityDecisionInput): Promise<AuthorityDecisionOutput>;
}

/**
 * Default decision policy: always IGNORE.
 *
 * Without a real classifier, coverage analyzer, duplicate detector, or
 * scoring algorithm connected, there is no evidence to justify expanding the
 * Authority Platform. Per SEARCH_INTENT_SYSTEM.md's Core Principle — "the
 * goal is not to create more pages" — the conservative default never
 * recommends action instead of inventing one.
 */
export class ConservativeAuthorityDecisionPolicy implements AuthorityDecisionPolicyPort {
  public async decide(): Promise<AuthorityDecisionOutput> {
    return {
      decision: "IGNORE",
      confidence: 0,
      reasoning: [
        "No AI-backed classifier, coverage analyzer, duplicate detector, or scoring algorithm is connected in this foundation.",
        "Without real evidence, the conservative default is IGNORE rather than inventing authority expansion."
      ]
    };
  }
}

/** Options for constructing an {@link AuthorityIntelligenceEngine}. */
export interface AuthorityIntelligenceEngineOptions {
  readonly idFactory: IdFactory;
  readonly searchIntentAnalyzer: SearchIntentAnalyzer;
  readonly coverageAnalyzer: CoverageAnalyzerPort;
  readonly duplicateDetector: DuplicateDetectorPort;
  readonly authorityScorer: AuthorityScorerPort;

  /** Defaults to {@link ConservativeAuthorityDecisionPolicy}. */
  readonly decisionPolicy?: AuthorityDecisionPolicyPort;

  /** Knowledge Object registry consulted for duplicate detection, if any. */
  readonly objectRegistry?: ObjectRegistryReader;

  /** Clock used to timestamp recommendations; defaults to the current time. */
  readonly clock?: () => string;
}

/**
 * Public interface of the APOS Authority Intelligence Engine.
 *
 * Single Responsibility: coordinate Search Intent analysis, Coverage
 * analysis, Duplicate detection and Authority scoring into exactly one
 * {@link AuthorityRecommendation}. It performs none of those analyses
 * itself — each is delegated to its own module — and it never writes
 * content, pages, or files.
 */
export class AuthorityIntelligenceEngine {
  private readonly idFactory: IdFactory;

  private readonly searchIntentAnalyzer: SearchIntentAnalyzer;

  private readonly coverageAnalyzer: CoverageAnalyzerPort;

  private readonly duplicateDetector: DuplicateDetectorPort;

  private readonly authorityScorer: AuthorityScorerPort;

  private readonly decisionPolicy: AuthorityDecisionPolicyPort;

  private readonly objectRegistry: ObjectRegistryReader | undefined;

  private readonly clock: () => string;

  public constructor(options: AuthorityIntelligenceEngineOptions) {
    this.idFactory = options.idFactory;
    this.searchIntentAnalyzer = options.searchIntentAnalyzer;
    this.coverageAnalyzer = options.coverageAnalyzer;
    this.duplicateDetector = options.duplicateDetector;
    this.authorityScorer = options.authorityScorer;
    this.decisionPolicy = options.decisionPolicy ?? new ConservativeAuthorityDecisionPolicy();
    this.objectRegistry = options.objectRegistry;
    this.clock = options.clock ?? (() => new Date().toISOString());
  }

  /**
   * Evaluate one completed conversation and produce exactly one
   * {@link AuthorityRecommendation}.
   *
   * Throws if the conversation is not `closed`: only completed conversations
   * may be evaluated for Authority impact, never conversations in progress.
   */
  public async evaluate(conversation: Conversation): Promise<AuthorityRecommendation> {
    if (conversation.state !== "closed") {
      throw new Error(
        `AuthorityIntelligenceEngine can only evaluate completed conversations; ${conversation.id} is still "${conversation.state}".`
      );
    }

    const searchIntentAnalysis = await this.searchIntentAnalyzer.analyze(conversation);
    const coverage = await this.coverageAnalyzer.analyzeCoverage(searchIntentAnalysis);
    const duplicate = await this.duplicateDetector.detect(searchIntentAnalysis, this.objectRegistry);
    const score = await this.authorityScorer.score({ searchIntentAnalysis, coverage, duplicate });
    const decisionOutput = await this.decisionPolicy.decide({
      searchIntentAnalysis,
      coverage,
      duplicate,
      score
    });

    const recommendation: AuthorityRecommendation = {
      id: this.idFactory("authority-recommendation"),
      conversationId: conversation.id,
      decision: decisionOutput.decision,
      confidence: clampUnitInterval(decisionOutput.confidence),
      reasoning: decisionOutput.reasoning,
      relatedKnowledgeObjectIds: duplicate.matches.map((match) => match.objectId),
      relatedConversationIds: [conversation.id],
      searchIntent: searchIntentAnalysis,
      metadata: { coverage, duplicate, score },
      createdAt: this.clock()
    };

    return decisionOutput.suggestedPattern === undefined
      ? recommendation
      : { ...recommendation, suggestedPattern: decisionOutput.suggestedPattern };
  }
}
