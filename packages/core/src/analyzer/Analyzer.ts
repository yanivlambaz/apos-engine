import type { AnalysisResult, WebsiteSnapshot } from "../models/index.js";
import type { AnalyzerPort } from "../types/index.js";

/**
 * Inspects the current website structure and reports what already exists.
 *
 * Single Responsibility: the analyzer only observes a snapshot and summarizes
 * it. It does not decide what *should* exist (that is planning/generation), it
 * loads no knowledge, and it makes no business judgements about page content.
 *
 * The summary it produces is what lets later stages avoid duplicating pages
 * that are already present, which is central to APOS managing *existing* sites.
 */
export class Analyzer implements AnalyzerPort {
  /**
   * Summarize the existing site.
   *
   * Duplicate routes are collapsed and recorded as a structural note so the
   * observation is surfaced without the analyzer having to interpret it.
   */
  public analyze(snapshot: WebsiteSnapshot): AnalysisResult {
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    for (const page of snapshot.pages) {
      if (seen.has(page.route)) {
        duplicates.add(page.route);
      } else {
        seen.add(page.route);
      }
    }

    const notes: string[] = [
      `Observed ${snapshot.pages.length.toString()} page(s) across ${seen.size.toString()} unique route(s).`
    ];

    if (duplicates.size > 0) {
      notes.push(`Detected duplicate route(s): ${[...duplicates].join(", ")}.`);
    }

    return {
      siteId: snapshot.siteId,
      existingRoutes: [...seen],
      pageCount: snapshot.pages.length,
      notes
    };
  }
}
