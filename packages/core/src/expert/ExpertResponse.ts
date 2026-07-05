import type { Id } from "../models/index.js";
import type { Citation } from "./Citation.js";

/**
 * A complete answer produced by the Expert Engine for a single question.
 *
 * Every field here is structural data; nothing in this module decides *what*
 * the answer says. `confidence` reflects how well the answer is backed by
 * approved knowledge, never a guess about correctness the engine invented.
 */
export interface ExpertResponse {
  readonly id: Id;
  readonly answer: string;

  /** Every knowledge source that backs this answer. May be empty. */
  readonly citations: readonly Citation[];

  /** Confidence in the answer, clamped to the inclusive range [0, 1]. */
  readonly confidence: number;

  /** Optional suggested follow-up questions. Never fabricated content. */
  readonly followUpQuestions?: readonly string[];

  readonly metadata: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
}

/** Clamp a raw confidence value into the valid [0, 1] range. */
export function clampConfidence(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}
