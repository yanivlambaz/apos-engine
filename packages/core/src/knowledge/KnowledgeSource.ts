import { readdir } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";

import type { Id, IdFactory } from "../models/index.js";
import type { VerticalPackRepository } from "../types/index.js";
import { SOURCE_PRIORITY } from "./SourcePriority.js";
import type { SourcePriority } from "./SourcePriority.js";

/**
 * Structural category of a knowledge source.
 *
 * These are the source kinds this foundation supports, per KNOWLEDGE_SYSTEM.md:
 * a project's own knowledge directory, its Vertical Pack, and external
 * knowledge (represented as an interface only).
 */
export type KnowledgeSourceType = "project-knowledge" | "vertical-pack" | "external-knowledge";

/**
 * A reference to a single document discovered inside a knowledge source.
 *
 * This is a pointer only. Reading and interpreting document content (parsing)
 * is explicitly out of scope until a future document-parsing stage exists.
 */
export interface KnowledgeDocumentRef {
  readonly id: Id;
  readonly sourceId: Id;

  /**
   * Source-specific locator: a path relative to the source's root, a business
   * object id, or a URI. The engine never inspects this beyond passing it
   * along; only the originating source knows how to resolve it further.
   */
  readonly reference: string;

  readonly discoveredAt: string;
}

/** Stable metadata identifying a knowledge source. */
export interface KnowledgeSourceDescriptor {
  readonly id: Id;
  readonly type: KnowledgeSourceType;
  readonly priority: SourcePriority;
  readonly label: string;
}

/**
 * A discoverable knowledge source.
 *
 * Single Responsibility: a source only knows how to enumerate the documents it
 * holds. It never reads document content, never ranks or merges knowledge
 * across sources, and never performs extraction — those responsibilities
 * belong to the loader, the index, and a future parsing/extraction stage that
 * does not exist yet.
 */
export interface KnowledgeSource {
  readonly descriptor: KnowledgeSourceDescriptor;

  /** Enumerate the documents currently available in this source. */
  discover(): Promise<readonly KnowledgeDocumentRef[]>;
}

/**
 * External knowledge access, expressed as an interface only.
 *
 * APOS may one day retrieve approved external knowledge or general web
 * results, but no concrete implementation ships in this foundation — "no web
 * search implementation" is a hard requirement. `approved` distinguishes
 * Approved External Knowledge (priority 3) from General Web Search
 * (priority 4), per KNOWLEDGE_SYSTEM.md.
 */
export interface ExternalKnowledgeSource extends KnowledgeSource {
  readonly approved: boolean;
}

/**
 * File extensions KNOWLEDGE_SYSTEM.md lists as supported project knowledge
 * documents. This governs discovery only; content is never read or parsed.
 */
const SUPPORTED_PROJECT_KNOWLEDGE_EXTENSIONS: ReadonlySet<string> = new Set([
  ".pdf",
  ".docx",
  ".md",
  ".txt",
  ".html",
  ".csv",
  ".json"
]);

/** Options for constructing a {@link ProjectKnowledgeDirectorySource}. */
export interface ProjectKnowledgeDirectorySourceOptions {
  readonly id: Id;
  readonly idFactory: IdFactory;

  /** Path to the project's `knowledge/` directory. */
  readonly directory: string;

  /** Clock used to timestamp discovery; defaults to the current time. */
  readonly clock?: () => string;
}

/**
 * Discovers documents inside a project's `knowledge/` directory.
 *
 * Per KNOWLEDGE_SYSTEM.md, every APOS implementation contains a `knowledge/`
 * directory, and any supported file placed inside it becomes part of the
 * project's expert knowledge. This class only enumerates such files; it never
 * reads or parses their contents.
 */
export class ProjectKnowledgeDirectorySource implements KnowledgeSource {
  public readonly descriptor: KnowledgeSourceDescriptor;

  private readonly idFactory: IdFactory;

  private readonly directory: string;

  private readonly clock: () => string;

  public constructor(options: ProjectKnowledgeDirectorySourceOptions) {
    this.descriptor = {
      id: options.id,
      type: "project-knowledge",
      priority: SOURCE_PRIORITY.PROJECT_KNOWLEDGE,
      label: "Project Knowledge Base"
    };
    this.idFactory = options.idFactory;
    this.directory = resolve(options.directory);
    this.clock = options.clock ?? (() => new Date().toISOString());
  }

  /**
   * Recursively enumerate supported files under the configured directory.
   *
   * A missing directory yields an empty result rather than throwing, since a
   * brand-new project may not have created `knowledge/` yet. Unsupported file
   * types are silently skipped.
   */
  public async discover(): Promise<readonly KnowledgeDocumentRef[]> {
    const filePaths = await this.listSupportedFiles(this.directory);
    const discoveredAt = this.clock();

    return filePaths.map((filePath) => ({
      id: this.idFactory("knowledge-document"),
      sourceId: this.descriptor.id,
      reference: relative(this.directory, filePath),
      discoveredAt
    }));
  }

  private async listSupportedFiles(directory: string): Promise<readonly string[]> {
    let entries;

    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return [];
    }

    const files: string[] = [];

    for (const entry of entries) {
      const entryPath = join(directory, entry.name);

      if (entry.isDirectory()) {
        files.push(...(await this.listSupportedFiles(entryPath)));
      } else if (
        entry.isFile() &&
        SUPPORTED_PROJECT_KNOWLEDGE_EXTENSIONS.has(extname(entry.name).toLowerCase())
      ) {
        files.push(entryPath);
      }
    }

    return files;
  }
}

/** Options for constructing a {@link VerticalPackKnowledgeSource}. */
export interface VerticalPackKnowledgeSourceOptions {
  readonly id: Id;
  readonly idFactory: IdFactory;
  readonly verticalId: Id;
  readonly repository: VerticalPackRepository;
  readonly clock?: () => string;
}

/**
 * Discovers the business objects exposed by a Vertical Pack.
 *
 * Per KNOWLEDGE_SYSTEM.md, the Vertical Pack is always loaded before external
 * knowledge and ranks immediately below the Project Knowledge Base. This class
 * reuses the existing {@link VerticalPackRepository} port rather than
 * duplicating pack-loading logic; it treats each business object as one
 * discoverable document reference without interpreting its attributes.
 */
export class VerticalPackKnowledgeSource implements KnowledgeSource {
  public readonly descriptor: KnowledgeSourceDescriptor;

  private readonly idFactory: IdFactory;

  private readonly verticalId: Id;

  private readonly repository: VerticalPackRepository;

  private readonly clock: () => string;

  public constructor(options: VerticalPackKnowledgeSourceOptions) {
    this.descriptor = {
      id: options.id,
      type: "vertical-pack",
      priority: SOURCE_PRIORITY.VERTICAL_PACK,
      label: "Vertical Pack"
    };
    this.idFactory = options.idFactory;
    this.verticalId = options.verticalId;
    this.repository = options.repository;
    this.clock = options.clock ?? (() => new Date().toISOString());
  }

  /**
   * Enumerate the business objects of the configured vertical, if its pack has
   * been registered. A missing pack yields an empty result rather than
   * throwing, since discovery should not fail a whole sync cycle.
   */
  public async discover(): Promise<readonly KnowledgeDocumentRef[]> {
    const pack = await this.repository.find(this.verticalId);

    if (pack === undefined) {
      return [];
    }

    const discoveredAt = this.clock();

    return pack.businessObjects.map((object) => ({
      id: this.idFactory("knowledge-document"),
      sourceId: this.descriptor.id,
      reference: object.id,
      discoveredAt
    }));
  }
}
