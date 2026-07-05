import type { Id, IdFactory } from "../models/index.js";
import type { KnowledgeDocumentRef } from "./KnowledgeSource.js";

/**
 * Lifecycle of a single index entry.
 *
 * Extraction is not implemented in this foundation, so every entry starts and
 * remains `pending` until a future extraction stage exists to advance it.
 */
export type KnowledgeIndexEntryStatus = "pending" | "indexed";

/**
 * The engine's internal representation of one piece of knowledge.
 *
 * `concepts` and `relatedEntryIds` are structural placeholders: they exist so a
 * future extraction and linking stage has somewhere to write results, but this
 * foundation never populates `concepts` from content (no AI extraction is
 * implemented).
 */
export interface KnowledgeIndexEntry {
  readonly id: Id;
  readonly sourceId: Id;
  readonly documentId: Id;
  readonly status: KnowledgeIndexEntryStatus;
  readonly concepts: readonly string[];
  readonly relatedEntryIds: readonly string[];
}

/** Read/write surface for the knowledge index. */
export interface KnowledgeIndexPort {
  upsert(entry: KnowledgeIndexEntry): void;
  getByDocumentId(documentId: Id): KnowledgeIndexEntry | undefined;
  queryBySource(sourceId: Id): readonly KnowledgeIndexEntry[];
  all(): readonly KnowledgeIndexEntry[];
  linkRelated(entryId: Id, relatedEntryId: Id): void;
}

/**
 * In-memory structure capable of representing extracted knowledge.
 *
 * Single Responsibility: the index only stores and retrieves entries. It never
 * extracts concepts, never reasons about content, and never generates
 * anything — it is the data structure a future extraction stage will populate.
 */
export class KnowledgeIndex implements KnowledgeIndexPort {
  private readonly entriesById = new Map<Id, KnowledgeIndexEntry>();

  private readonly entryIdByDocumentId = new Map<Id, Id>();

  /** Insert or replace an entry, indexed by both its own id and document id. */
  public upsert(entry: KnowledgeIndexEntry): void {
    this.entriesById.set(entry.id, entry);
    this.entryIdByDocumentId.set(entry.documentId, entry.id);
  }

  /** Look up the entry for a specific document, if one has been created. */
  public getByDocumentId(documentId: Id): KnowledgeIndexEntry | undefined {
    const entryId = this.entryIdByDocumentId.get(documentId);
    return entryId === undefined ? undefined : this.entriesById.get(entryId);
  }

  /** Query every entry that originated from a given source. */
  public queryBySource(sourceId: Id): readonly KnowledgeIndexEntry[] {
    return this.all().filter((entry) => entry.sourceId === sourceId);
  }

  /** Snapshot every entry currently in the index. */
  public all(): readonly KnowledgeIndexEntry[] {
    return [...this.entriesById.values()];
  }

  /**
   * Record that two entries relate to one another, in both directions.
   *
   * This only wires the relationship structurally; it never decides *whether*
   * two entries should be related, which requires extraction that does not
   * exist yet.
   */
  public linkRelated(entryId: Id, relatedEntryId: Id): void {
    this.addRelatedLink(entryId, relatedEntryId);
    this.addRelatedLink(relatedEntryId, entryId);
  }

  private addRelatedLink(entryId: Id, relatedEntryId: Id): void {
    const entry = this.entriesById.get(entryId);

    if (entry === undefined || entry.relatedEntryIds.includes(relatedEntryId)) {
      return;
    }

    this.entriesById.set(entryId, {
      ...entry,
      relatedEntryIds: [...entry.relatedEntryIds, relatedEntryId]
    });
  }
}

/**
 * Build a pending index entry for a freshly discovered document.
 *
 * This is the only way entries enter the index in this foundation: discovery
 * produces a placeholder pending entry with no concepts, ready for a future
 * extraction stage to fill in.
 */
export function createPendingIndexEntry(
  idFactory: IdFactory,
  documentRef: KnowledgeDocumentRef
): KnowledgeIndexEntry {
  return {
    id: idFactory("knowledge-index-entry"),
    sourceId: documentRef.sourceId,
    documentId: documentRef.id,
    status: "pending",
    concepts: [],
    relatedEntryIds: []
  };
}
