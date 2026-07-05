import type { GenerationResult } from "../models/index.js";
import type { GenerationInput, GeneratorPort } from "../types/index.js";

/**
 * Produces content objects and page definitions in memory.
 *
 * Single Responsibility: the generator only assembles generation output. It
 * never writes files, never deploys, and never validates its own result.
 *
 * Real generation depends on both the Vertical Pack's business knowledge and an
 * LLM to author content. Neither is in scope for this foundation, so this class
 * is an honest structural skeleton: it returns a well-formed but empty
 * {@link GenerationResult}. The {@link GeneratorPort} contract it implements is
 * the stable seam an intelligent generator will plug into later, without any
 * downstream stage needing to change.
 */
export class Generator implements GeneratorPort {
  /**
   * Generate output for the given input.
   *
   * The input (plan, analysis, pack) is accepted to lock in the contract, but
   * no content is fabricated: producing content without business knowledge and
   * an LLM would violate the "no hardcoded business logic" rule.
   */
  public generate(_input: GenerationInput): GenerationResult {
    return {
      contentObjects: [],
      pageDefinitions: []
    };
  }
}
