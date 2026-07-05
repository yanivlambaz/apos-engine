/**
 * APOS Authority Intelligence Engine — public exports.
 *
 * Decides whether a completed Expert Conversation should become a permanent
 * Authority Asset. Never generates content or pages — produces exactly one
 * Authority Recommendation per conversation. See
 * AuthorityIntelligenceEngine.ts for the full architectural rationale.
 */

export { SearchIntentAnalyzer } from "./SearchIntentAnalyzer.js";
export type {
  SearchIntentAnalysis,
  SearchIntentAnalyzerOptions,
  SearchIntentClassification,
  SearchIntentClassifierPort,
  SearchIntentType
} from "./SearchIntentAnalyzer.js";

export { UnknownCoverageAnalyzer } from "./CoverageAnalyzer.js";
export type { CoverageAnalyzerPort, CoverageResult, CoverageStatus } from "./CoverageAnalyzer.js";

export { NoOpDuplicateDetector } from "./DuplicateDetector.js";
export type { DuplicateDetectionResult, DuplicateDetectorPort, DuplicateMatch } from "./DuplicateDetector.js";

export { ZeroAuthorityScorer } from "./AuthorityScorer.js";
export type {
  AuthorityScore,
  AuthorityScoreDimensions,
  AuthorityScorerPort,
  AuthorityScoringInput
} from "./AuthorityScorer.js";

export { clampUnitInterval } from "./AuthorityRecommendation.js";
export type {
  AuthorityDecision,
  AuthorityRecommendation,
  AuthorityRecommendationEvidence
} from "./AuthorityRecommendation.js";

export { InMemoryRecommendationRepository } from "./RecommendationRepository.js";
export type { RecommendationRepositoryPort } from "./RecommendationRepository.js";

export { AuthorityIntelligenceEngine, ConservativeAuthorityDecisionPolicy } from "./AuthorityIntelligenceEngine.js";
export type {
  AuthorityDecisionInput,
  AuthorityDecisionOutput,
  AuthorityDecisionPolicyPort,
  AuthorityIntelligenceEngineOptions
} from "./AuthorityIntelligenceEngine.js";
