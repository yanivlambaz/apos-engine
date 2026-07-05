/**
 * APOS Knowledge Source Priority Model.
 *
 * Defines the fixed ranking every knowledge consumer must respect, exactly as
 * specified by KNOWLEDGE_SYSTEM.md:
 *
 *   1. Project Knowledge Base
 *   2. Vertical Pack
 *   3. Approved External Knowledge Sources
 *   4. General Web Search
 *
 * A lower numeric value means higher priority; knowledge from a higher
 * priority always overrides lower priorities. This module defines the scale
 * and comparison helpers only. It does not decide when knowledge from a given
 * tier should be used — that decision belongs to whatever consumes the
 * Knowledge Index once extraction exists.
 */

/**
 * Named constants for the priority tiers, in the exact order KNOWLEDGE_SYSTEM.md
 * defines them.
 */
export const SOURCE_PRIORITY = {
  PROJECT_KNOWLEDGE: 1,
  VERTICAL_PACK: 2,
  APPROVED_EXTERNAL_KNOWLEDGE: 3,
  GENERAL_WEB: 4
} as const;

/** The four priority tiers defined by the Knowledge System. */
export type SourcePriority = (typeof SOURCE_PRIORITY)[keyof typeof SOURCE_PRIORITY];

/**
 * Human-readable label for a priority tier, useful for diagnostics and reports.
 */
export function describeSourcePriority(priority: SourcePriority): string {
  switch (priority) {
    case SOURCE_PRIORITY.PROJECT_KNOWLEDGE:
      return "Project Knowledge Base";
    case SOURCE_PRIORITY.VERTICAL_PACK:
      return "Vertical Pack";
    case SOURCE_PRIORITY.APPROVED_EXTERNAL_KNOWLEDGE:
      return "Approved External Knowledge";
    case SOURCE_PRIORITY.GENERAL_WEB:
      return "General Web";
    default: {
      const exhaustiveCheck: never = priority;
      throw new Error(`Unknown source priority: ${String(exhaustiveCheck)}`);
    }
  }
}

/**
 * Compare two priorities for sorting, highest priority first.
 *
 * Because lower numeric values outrank higher ones, this is a plain ascending
 * numeric comparison.
 */
export function compareSourcePriority(a: SourcePriority, b: SourcePriority): number {
  return a - b;
}

/** Whether `a` outranks `b` under the Knowledge System's priority model. */
export function isHigherPriority(a: SourcePriority, b: SourcePriority): boolean {
  return a < b;
}
