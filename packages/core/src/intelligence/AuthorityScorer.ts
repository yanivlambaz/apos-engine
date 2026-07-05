import type { CoverageResult } from "./CoverageAnalyzer.js";
import type { DuplicateDetectionResult } from "./DuplicateDetector.js";
import type { SearchIntentAnalysis } from "./SearchIntentAnalyzer.js";

/**
 * The Authority Score dimensions from SEARCH_INTENT_SYSTEM.md's Evaluation
 * Criteria. Every dimension is a plain value in [0, 1]; nothing combines
 * them into an overall score here, since that requires a scoring algorithm
 * that is out of scope for this foundation.
 */
export interface AuthorityScoreDimensions {
  readonly searchIntentMatch: number;
  readonly authorityExpansion: number;
  readonly existingCoverage: number;
  readonly commercialOpportunity: number;
  readonly conversationQuality: number;
  readonly confidence: number;
}

/** The Authority Scorer's output for one Search Intent. */
export interface AuthorityScore {
  readonly dimensions: AuthorityScoreDimensions;
}

/** Evidence available to an {@link AuthorityScorerPort}. */
export interface AuthorityScoringInput {
  readonly searchIntentAnalysis: SearchIntentAnalysis;
  readonly coverage: CoverageResult;
  readonly duplicate: DuplicateDetectionResult;
}

/**
 * Computes an Authority Score from analyzed evidence.
 *
 * Architecture only: no scoring algorithm is implemented. Deciding how
 * Search Intent Match, Authority Expansion, Existing Coverage, Commercial
 * Opportunity, Conversation Quality and Confidence combine requires
 * business or AI judgment that is out of scope here.
 */
export interface AuthorityScorerPort {
  score(input: AuthorityScoringInput): Promise<AuthorityScore>;
}

/**
 * Default scorer.
 *
 * Every dimension is zero, since no scoring algorithm is implemented in this
 * foundation, per "do not implement scoring algorithms".
 */
export class ZeroAuthorityScorer implements AuthorityScorerPort {
  public async score(): Promise<AuthorityScore> {
    return {
      dimensions: {
        searchIntentMatch: 0,
        authorityExpansion: 0,
        existingCoverage: 0,
        commercialOpportunity: 0,
        conversationQuality: 0,
        confidence: 0
      }
    };
  }
}
