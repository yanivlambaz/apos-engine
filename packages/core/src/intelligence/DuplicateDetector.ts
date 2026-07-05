import type { Id } from "../models/index.js";
import type { ObjectRegistryReader } from "../objects/ObjectRegistry.js";
import type { SearchIntentAnalysis } from "./SearchIntentAnalyzer.js";

/** One Knowledge Object believed to overlap with a Search Intent. */
export interface DuplicateMatch {
  readonly objectId: Id;
  readonly objectType: string;

  /** Structural placeholder for how strongly this object matches, in [0, 1]. */
  readonly matchStrength: number;
}

/** The Duplicate Detector's finding for one Search Intent. */
export interface DuplicateDetectionResult {
  readonly searchIntent: string;
  readonly isDuplicate: boolean;
  readonly matches: readonly DuplicateMatch[];
  readonly confidence: number;
}

/**
 * Determines whether an existing Knowledge Object already satisfies
 * substantially the same Search Intent.
 *
 * Architecture only: matching Knowledge Objects to a Search Intent requires
 * reasoning (semantic similarity, an LLM, or a defined business heuristic)
 * that is out of scope. No AI reasoning is implemented in this foundation.
 */
export interface DuplicateDetectorPort {
  detect(
    analysis: SearchIntentAnalysis,
    registry: ObjectRegistryReader | undefined
  ): Promise<DuplicateDetectionResult>;
}

/**
 * Default duplicate detector.
 *
 * Honestly reports no known duplicates without performing any reasoning over
 * the registry, per "only implement architecture" / "no AI reasoning".
 */
export class NoOpDuplicateDetector implements DuplicateDetectorPort {
  public async detect(analysis: SearchIntentAnalysis): Promise<DuplicateDetectionResult> {
    return {
      searchIntent: analysis.searchIntent,
      isDuplicate: false,
      matches: [],
      confidence: 0
    };
  }
}
