import type { BusinessObject, Id, VerticalPack } from "../models/index.js";
import type { KnowledgePort, VerticalPackRepository } from "../types/index.js";

/**
 * Options for constructing a {@link KnowledgeBase}.
 */
export interface KnowledgeBaseOptions {
  readonly repository: VerticalPackRepository;
}

/**
 * Loads a Vertical Pack and exposes its reusable business objects.
 *
 * Single Responsibility: this module only retrieves and surfaces business
 * knowledge. Critically, it contains *no* hardcoded business facts — the
 * Healthcare pack (siud.org) and every other vertical arrive through the
 * injected {@link VerticalPackRepository}. Swapping the repository swaps the
 * industry without touching the engine (Dependency Inversion).
 */
export class KnowledgeBase implements KnowledgePort {
  private readonly repository: VerticalPackRepository;

  public constructor(options: KnowledgeBaseOptions) {
    this.repository = options.repository;
  }

  /**
   * Load the pack for a vertical, failing loudly if it is not registered so a
   * caller never proceeds with missing knowledge.
   */
  public async load(verticalId: Id): Promise<VerticalPack> {
    const pack = await this.repository.find(verticalId);

    if (pack === undefined) {
      throw new Error(`KnowledgeBase found no Vertical Pack for vertical: ${verticalId}`);
    }

    return pack;
  }

  /**
   * Return the business objects of a given type from a loaded pack.
   *
   * This is a structural filter over pack contents; it assigns no meaning to
   * the `type` value, keeping the engine generic across industries.
   */
  public selectByType(pack: VerticalPack, type: string): readonly BusinessObject[] {
    return pack.businessObjects.filter((object) => object.type === type);
  }
}

/**
 * A simple, dependency-free source of Vertical Packs held in memory.
 *
 * This is the only repository shipped in the foundation. Disk- or network-
 * backed adapters implement the same {@link VerticalPackRepository} port and
 * can be introduced later without changing {@link KnowledgeBase}.
 */
export class InMemoryVerticalPackRepository implements VerticalPackRepository {
  private readonly packs: Map<Id, VerticalPack>;

  public constructor(packs: readonly VerticalPack[] = []) {
    this.packs = new Map(packs.map((pack) => [pack.id, pack]));
  }

  /** Register or replace a pack. */
  public register(pack: VerticalPack): void {
    this.packs.set(pack.id, pack);
  }

  public find(verticalId: Id): Promise<VerticalPack | undefined> {
    return Promise.resolve(this.packs.get(verticalId));
  }
}
