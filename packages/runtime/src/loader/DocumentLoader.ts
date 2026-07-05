import { readFile } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";

import type { DocumentLoaderPort, LoadedDocument } from "../types/index.js";

/**
 * Options controlling how the {@link DocumentLoader} resolves paths.
 */
export interface DocumentLoaderOptions {
  /**
   * Directory that all relative paths are resolved against.
   *
   * Defaults to the current working directory. Callers typically point this at
   * the APOS repository root so kernel documents can be requested by their
   * repository-relative path.
   */
  readonly baseDirectory?: string;
}

/**
 * Loads APOS documents from disk.
 *
 * Single Responsibility: this module only reads files and returns their raw
 * text. It never parses kernel documents, extracts knowledge, selects patterns,
 * or calls a language model. Interpretation belongs to higher layers.
 *
 * The loader depends only on Node's filesystem primitives and the shared
 * contracts, so it stays independent of every other runtime module.
 */
export class DocumentLoader implements DocumentLoaderPort {
  private readonly baseDirectory: string;

  public constructor(options: DocumentLoaderOptions = {}) {
    this.baseDirectory = resolve(options.baseDirectory ?? process.cwd());
  }

  /**
   * Load a single document relative to the configured base directory.
   *
   * The resolved path is validated to stay inside the base directory so a
   * caller cannot accidentally traverse outside the intended document root.
   */
  public async load(relativePath: string): Promise<LoadedDocument> {
    const absolutePath = this.resolveWithinBase(relativePath);
    const content = await readFile(absolutePath, { encoding: "utf8" });

    return {
      relativePath,
      absolutePath,
      content
    };
  }

  /**
   * Load several documents, preserving the order of the input paths.
   *
   * Loads run concurrently because each read is independent; ordering of the
   * returned array still matches the requested order.
   */
  public async loadMany(
    relativePaths: readonly string[]
  ): Promise<readonly LoadedDocument[]> {
    return Promise.all(relativePaths.map((path) => this.load(path)));
  }

  /**
   * Resolve a caller-supplied path against the base directory and guard against
   * traversal outside of it.
   */
  private resolveWithinBase(relativePath: string): string {
    if (isAbsolute(relativePath)) {
      throw new Error(
        `DocumentLoader expects a relative path but received an absolute path: ${relativePath}`
      );
    }

    const absolutePath = resolve(this.baseDirectory, relativePath);
    const relativeToBase = relative(this.baseDirectory, absolutePath);

    const escapesBase =
      relativeToBase.startsWith("..") || isAbsolute(relativeToBase);

    if (escapesBase) {
      throw new Error(
        `DocumentLoader refused to read outside its base directory: ${relativePath}`
      );
    }

    return absolutePath;
  }
}
