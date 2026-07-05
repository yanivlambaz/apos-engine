import type { SearchIntentAnalysis } from "./SearchIntentAnalyzer.js";

/** Whether the Authority Platform already covers a Search Intent. */
export type CoverageStatus = "covered" | "partially-covered" | "not-covered" | "unknown";

/** The Coverage Analyzer's finding for one Search Intent. */
export interface CoverageResult {
  readonly searchIntent: string;
  readonly status: CoverageStatus;

  /** Routes on the Authority Platform believed to address this intent, if any. */
  readonly matchingPageRoutes: readonly string[];

  readonly confidence: number;
}

/**
 * Determines whether the Authority Platform already covers a Search Intent.
 *
 * Architecture only: no concrete implementation inspects the website in this
 * foundation. Real coverage analysis needs a website-inspection adapter (a
 * future counterpart to the Core Engine's `AnalyzerPort`/`WebsiteSnapshot`)
 * that is explicitly out of scope for this work package.
 */
export interface CoverageAnalyzerPort {
  analyzeCoverage(analysis: SearchIntentAnalysis): Promise<CoverageResult>;
}

/**
 * Default coverage analyzer.
 *
 * Honestly reports "unknown" coverage without inspecting any website files,
 * per "do not inspect website files yet". It exists so the engine always has
 * a coverage analyzer to depend on, not to make a real determination.
 */
export class UnknownCoverageAnalyzer implements CoverageAnalyzerPort {
  public async analyzeCoverage(analysis: SearchIntentAnalysis): Promise<CoverageResult> {
    return {
      searchIntent: analysis.searchIntent,
      status: "unknown",
      matchingPageRoutes: [],
      confidence: 0
    };
  }
}
