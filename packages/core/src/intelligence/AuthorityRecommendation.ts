import type { Id } from "../models/index.js";
import type { AuthorityScore } from "./AuthorityScorer.js";
import type { CoverageResult } from "./CoverageAnalyzer.js";
import type { DuplicateDetectionResult } from "./DuplicateDetector.js";
import type { SearchIntentAnalysis } from "./SearchIntentAnalyzer.js";

/**
 * The only four outcomes SEARCH_INTENT_SYSTEM.md permits for evaluating a
 * completed conversation. No other decision is allowed.
 */
export type AuthorityDecision =
  | "IGNORE"
  | "UPDATE_EXISTING_PAGE"
  | "MERGE_WITH_EXISTING_PAGE"
  | "CREATE_NEW_QA_PAGE";

/**
 * Full evidence trail behind a recommendation, kept for audit without
 * inventing dedicated top-level fields beyond what is required.
 */
export interface AuthorityRecommendationEvidence {
  readonly coverage: CoverageResult;
  readonly duplicate: DuplicateDetectionResult;
  readonly score: AuthorityScore;
}

/**
 * The Authority Intelligence Engine's sole output: a recommendation about
 * whether a completed conversation should become a permanent Authority
 * Asset.
 *
 * This is a decision record only. It never contains generated content or
 * generated pages — that remains the Generators' responsibility, applied
 * later, only after a human or workflow acts on this recommendation.
 */
export interface AuthorityRecommendation {
  readonly id: Id;
  readonly conversationId: Id;
  readonly decision: AuthorityDecision;

  /** Confidence in the decision, clamped to the inclusive range [0, 1]. */
  readonly confidence: number;

  /** Human-readable, structural notes explaining why this decision was reached. */
  readonly reasoning: readonly string[];

  /** Existing Knowledge Objects this recommendation relates to (e.g. duplicate matches). */
  readonly relatedKnowledgeObjectIds: readonly Id[];

  /** Conversations providing evidence for the same Search Intent. */
  readonly relatedConversationIds: readonly Id[];

  readonly searchIntent: SearchIntentAnalysis;

  /**
   * A structural pattern identifier the Pattern System could use if a new or
   * updated page is produced later (e.g. "qa"). This engine never resolves,
   * renders, or generates that pattern — see PATTERNS.md.
   */
  readonly suggestedPattern?: string;

  /** Full evidence trail (coverage, duplicate detection, score) for audit. */
  readonly metadata: Readonly<Record<string, unknown>>;

  readonly createdAt: string;
}

/** Clamp a raw value into the valid [0, 1] range. */
export function clampUnitInterval(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}
