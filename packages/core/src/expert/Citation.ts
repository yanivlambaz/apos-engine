import type { Id, IdFactory } from "../models/index.js";
import { SOURCE_PRIORITY } from "../knowledge/SourcePriority.js";
import type { SourcePriority } from "../knowledge/SourcePriority.js";

/**
 * Approved knowledge source categories a citation may reference.
 *
 * General Web Search is intentionally excluded: per KNOWLEDGE_SYSTEM.md it is
 * used only as a last resort and is never "approved", so citations may only
 * point to Project Knowledge, the Vertical Pack, or Approved External sources.
 */
export type CitationSourceType = "project-knowledge" | "vertical-pack" | "approved-external";

/**
 * A single reference to the knowledge that backs (part of) an expert answer.
 *
 * A citation is a pointer only. No document content is read, parsed, or
 * retrieved to build one — "no web retrieval" and "architecture only" apply
 * here just as they do to the Knowledge Acquisition Engine.
 */
export interface Citation {
  readonly id: Id;
  readonly sourceType: CitationSourceType;
  readonly priority: SourcePriority;

  /** Identifier of the knowledge source this citation points to. */
  readonly sourceId: Id;

  /** Identifier of the specific document within the source, if known. */
  readonly documentId?: Id;

  /**
   * Human-readable pointer to the referenced knowledge (a file path, a
   * business object id, or a URL). This is a locator only.
   */
  readonly reference: string;
}

/**
 * Structural mapping from a citation source type to its Knowledge System
 * priority tier. This mirrors KNOWLEDGE_SYSTEM.md exactly and assigns no
 * business meaning beyond the documented ranking.
 */
export function priorityForCitationSourceType(sourceType: CitationSourceType): SourcePriority {
  switch (sourceType) {
    case "project-knowledge":
      return SOURCE_PRIORITY.PROJECT_KNOWLEDGE;
    case "vertical-pack":
      return SOURCE_PRIORITY.VERTICAL_PACK;
    case "approved-external":
      return SOURCE_PRIORITY.APPROVED_EXTERNAL_KNOWLEDGE;
    default: {
      const exhaustiveCheck: never = sourceType;
      throw new Error(`Unknown citation source type: ${String(exhaustiveCheck)}`);
    }
  }
}

/** Input required to construct a new {@link Citation}. */
export interface CreateCitationInput {
  readonly sourceType: CitationSourceType;
  readonly sourceId: Id;
  readonly reference: string;
  readonly documentId?: Id;
}

/**
 * Build a citation with its priority derived structurally from its source
 * type, so callers never have to (and cannot accidentally mis-rank a source).
 */
export function createCitation(idFactory: IdFactory, input: CreateCitationInput): Citation {
  const base: Citation = {
    id: idFactory("citation"),
    sourceType: input.sourceType,
    priority: priorityForCitationSourceType(input.sourceType),
    sourceId: input.sourceId,
    reference: input.reference
  };

  return input.documentId === undefined ? base : { ...base, documentId: input.documentId };
}
