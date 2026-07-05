import type { ValidationIssue, ValidationReport } from "../models/index.js";
import type { ValidationInput, ValidatorPort } from "../types/index.js";

/**
 * Verifies the completeness and internal consistency of generated output.
 *
 * Single Responsibility: the validator only inspects a plan and its generation
 * result and reports findings. It generates nothing, loads nothing, and applies
 * no business rules — every check here is structural (references resolve, IDs
 * are unique, required fields are present).
 *
 * The report is authoritative for whether a plan is complete enough to proceed
 * to deployment planning.
 */
export class Validator implements ValidatorPort {
  public validate(input: ValidationInput): ValidationReport {
    const issues: ValidationIssue[] = [];

    if (input.plan.steps.length === 0) {
      issues.push({
        severity: "error",
        code: "PLAN_EMPTY",
        message: "Execution plan contains no steps."
      });
    }

    const contentObjectIds = new Set(input.generation.contentObjects.map((object) => object.id));

    this.checkUniqueContentObjectIds(input, issues);
    this.checkPageReferences(input, contentObjectIds, issues);
    this.checkOrphanContent(input, issues);

    const valid = !issues.some((issue) => issue.severity === "error");

    return { valid, issues };
  }

  /** Every content object must have a unique ID. */
  private checkUniqueContentObjectIds(
    input: ValidationInput,
    issues: ValidationIssue[]
  ): void {
    const seen = new Set<string>();

    for (const object of input.generation.contentObjects) {
      if (seen.has(object.id)) {
        issues.push({
          severity: "error",
          code: "CONTENT_ID_DUPLICATE",
          message: `Duplicate content object id: ${object.id}.`
        });
      } else {
        seen.add(object.id);
      }
    }
  }

  /** Every page must reference content objects that actually exist. */
  private checkPageReferences(
    input: ValidationInput,
    contentObjectIds: ReadonlySet<string>,
    issues: ValidationIssue[]
  ): void {
    for (const page of input.generation.pageDefinitions) {
      for (const referencedId of page.contentObjectIds) {
        if (!contentObjectIds.has(referencedId)) {
          issues.push({
            severity: "error",
            code: "PAGE_REFERENCE_MISSING",
            message: `Page ${page.id} references unknown content object: ${referencedId}.`
          });
        }
      }
    }
  }

  /** Content objects that no page references are surfaced as warnings. */
  private checkOrphanContent(
    input: ValidationInput,
    issues: ValidationIssue[]
  ): void {
    const referenced = new Set<string>();

    for (const page of input.generation.pageDefinitions) {
      for (const referencedId of page.contentObjectIds) {
        referenced.add(referencedId);
      }
    }

    for (const object of input.generation.contentObjects) {
      if (!referenced.has(object.id)) {
        issues.push({
          severity: "warning",
          code: "CONTENT_ORPHAN",
          message: `Content object ${object.id} is not referenced by any page.`
        });
      }
    }
  }
}
