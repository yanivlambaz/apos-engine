import type { Id, IdFactory } from "../models/index.js";
import { createPendingIndexEntry, KnowledgeIndex } from "./KnowledgeIndex.js";
import type { KnowledgeIndexPort } from "./KnowledgeIndex.js";
import { KnowledgeLoader } from "./KnowledgeLoader.js";
import type { KnowledgeLoaderPort, LoadedKnowledgeSource } from "./KnowledgeLoader.js";
import { KnowledgeRegistry } from "./KnowledgeRegistry.js";
import type { KnowledgeRegistryPort, KnowledgeSourceRecord } from "./KnowledgeRegistry.js";
import type { KnowledgeSource } from "./KnowledgeSource.js";
import { compareSourcePriority } from "./SourcePriority.js";

/** Options for constructing a {@link KnowledgeManager}. */
export interface KnowledgeManagerOptions {
  /** Shared identifier factory used when creating index entries. */
  readonly idFactory: IdFactory;

  /** Every knowledge source the manager should track. */
  readonly sources: readonly KnowledgeSource[];

  /** Loader collaborator; defaults to a plain {@link KnowledgeLoader}. */
  readonly loader?: KnowledgeLoaderPort;

  /** Registry collaborator; defaults to a plain {@link KnowledgeRegistry}. */
  readonly registry?: KnowledgeRegistryPort;

  /** Index collaborator; defaults to a plain {@link KnowledgeIndex}. */
  readonly index?: KnowledgeIndexPort;
}

/**
 * Public entry point of the APOS Knowledge Acquisition Engine.
 *
 * Single Responsibility: the manager only coordinates its collaborators —
 * discovery (via sources), loading (via the loader), indexing (via the index),
 * and registry updates (via the registry). It never reasons about knowledge,
 * never answers questions, and never generates content. It prepares the
 * trusted knowledge base that the rest of APOS consumes.
 *
 * Every collaborator is injected as a port interface, so the manager itself
 * never depends on a concrete loader, registry, or index implementation
 * (Dependency Inversion), and any of them can be swapped without changing this
 * class (Open/Closed).
 */
export class KnowledgeManager {
  private readonly idFactory: IdFactory;

  private readonly sourcesById = new Map<Id, KnowledgeSource>();

  private readonly loader: KnowledgeLoaderPort;

  private readonly registry: KnowledgeRegistryPort;

  private readonly index: KnowledgeIndexPort;

  public constructor(options: KnowledgeManagerOptions) {
    this.idFactory = options.idFactory;
    this.loader = options.loader ?? new KnowledgeLoader();
    this.registry = options.registry ?? new KnowledgeRegistry();
    this.index = options.index ?? new KnowledgeIndex();

    for (const source of options.sources) {
      this.sourcesById.set(source.descriptor.id, source);
      this.registry.register(source.descriptor);
    }
  }

  /**
   * Discover, load and index a single source, then update the registry.
   *
   * This is the full acquisition cycle for one source. It never inspects
   * document content beyond the references the source itself discovers, and it
   * never creates a duplicate index entry for a document already indexed.
   */
  public async sync(sourceId: Id): Promise<KnowledgeSourceRecord> {
    const source = this.requireSource(sourceId);

    this.registry.updateStatus(sourceId, "discovering");

    const loaded: LoadedKnowledgeSource = await this.loader.load(source);

    for (const document of loaded.documents) {
      if (this.index.getByDocumentId(document.id) === undefined) {
        this.index.upsert(createPendingIndexEntry(this.idFactory, document));
      }
    }

    return this.registry.recordIndexed(sourceId, loaded.documents.length, loaded.loadedAt);
  }

  /**
   * Sync every registered source, highest priority first, per the Knowledge
   * System's priority model (Project Knowledge, then Vertical Pack, then
   * external tiers).
   */
  public async syncAll(): Promise<readonly KnowledgeSourceRecord[]> {
    const orderedSourceIds = [...this.sourcesById.values()]
      .sort((a, b) => compareSourcePriority(a.descriptor.priority, b.descriptor.priority))
      .map((source) => source.descriptor.id);

    const records: KnowledgeSourceRecord[] = [];

    for (const sourceId of orderedSourceIds) {
      records.push(await this.sync(sourceId));
    }

    return records;
  }

  /** Read-only access to the source registry. */
  public getRegistry(): KnowledgeRegistryPort {
    return this.registry;
  }

  /** Read-only access to the knowledge index. */
  public getIndex(): KnowledgeIndexPort {
    return this.index;
  }

  private requireSource(sourceId: Id): KnowledgeSource {
    const source = this.sourcesById.get(sourceId);

    if (source === undefined) {
      throw new Error(`KnowledgeManager has no registered source: ${sourceId}`);
    }

    return source;
  }
}
