import type { Id } from "../models/index.js";
import type { KnowledgeDocumentRef, KnowledgeSource } from "./KnowledgeSource.js";

/** Result of loading one knowledge source. */
export interface LoadedKnowledgeSource {
  readonly sourceId: Id;
  readonly documents: readonly KnowledgeDocumentRef[];
  readonly loadedAt: string;
}

/** Loads knowledge sources. */
export interface KnowledgeLoaderPort {
  load(source: KnowledgeSource): Promise<LoadedKnowledgeSource>;
}

/** Options for constructing a {@link KnowledgeLoader}. */
export interface KnowledgeLoaderOptions {
  /** Clock used to timestamp a load; defaults to the current time. */
  readonly clock?: () => string;
}

/**
 * Loads knowledge sources by invoking their discovery step.
 *
 * Single Responsibility: the loader only loads. It performs no reasoning, no
 * analysis, and no content generation — it does not decide what a document
 * means, only that it was discovered and when. Interpreting a source's
 * documents belongs to a future extraction stage, not to this class.
 */
export class KnowledgeLoader implements KnowledgeLoaderPort {
  private readonly clock: () => string;

  public constructor(options: KnowledgeLoaderOptions = {}) {
    this.clock = options.clock ?? (() => new Date().toISOString());
  }

  /** Load a single source by asking it to discover its documents. */
  public async load(source: KnowledgeSource): Promise<LoadedKnowledgeSource> {
    const documents = await source.discover();

    return {
      sourceId: source.descriptor.id,
      documents,
      loadedAt: this.clock()
    };
  }
}
