import type { Id } from "../models/index.js";
import type { KnowledgeSourceDescriptor, KnowledgeSourceType } from "./KnowledgeSource.js";
import { compareSourcePriority } from "./SourcePriority.js";
import type { SourcePriority } from "./SourcePriority.js";

/** Lifecycle status of a registered knowledge source. */
export type KnowledgeSourceStatus = "registered" | "discovering" | "loaded" | "indexed" | "error";

/** Registry record tracked for a single knowledge source. */
export interface KnowledgeSourceRecord {
  readonly sourceId: Id;
  readonly type: KnowledgeSourceType;
  readonly priority: SourcePriority;
  readonly status: KnowledgeSourceStatus;
  readonly lastIndexedAt?: string;
  readonly documentCount: number;
}

/** Read/write surface for the knowledge source registry. */
export interface KnowledgeRegistryPort {
  register(descriptor: KnowledgeSourceDescriptor): KnowledgeSourceRecord;
  updateStatus(sourceId: Id, status: KnowledgeSourceStatus): KnowledgeSourceRecord;
  recordIndexed(sourceId: Id, documentCount: number, indexedAt: string): KnowledgeSourceRecord;
  get(sourceId: Id): KnowledgeSourceRecord | undefined;
  all(): readonly KnowledgeSourceRecord[];
  allByPriority(): readonly KnowledgeSourceRecord[];
}

/**
 * Tracks every knowledge source known to the engine.
 *
 * Single Responsibility: the registry only records source metadata (id, type,
 * priority, status, last indexed time, document count). It never discovers,
 * loads, or indexes anything itself — those are the sources', loader's, and
 * index's jobs respectively. Duplicate source IDs are rejected immediately so
 * two sources can never silently overwrite one another's tracking record.
 */
export class KnowledgeRegistry implements KnowledgeRegistryPort {
  private readonly recordsBySourceId = new Map<Id, KnowledgeSourceRecord>();

  /** Register a new source, failing if its id is already tracked. */
  public register(descriptor: KnowledgeSourceDescriptor): KnowledgeSourceRecord {
    if (this.recordsBySourceId.has(descriptor.id)) {
      throw new Error(`KnowledgeRegistry rejected duplicate source id: ${descriptor.id}`);
    }

    const record: KnowledgeSourceRecord = {
      sourceId: descriptor.id,
      type: descriptor.type,
      priority: descriptor.priority,
      status: "registered",
      documentCount: 0
    };

    this.recordsBySourceId.set(descriptor.id, record);
    return record;
  }

  /** Move a tracked source to a new lifecycle status. */
  public updateStatus(sourceId: Id, status: KnowledgeSourceStatus): KnowledgeSourceRecord {
    const record = this.requireRecord(sourceId);
    const updated: KnowledgeSourceRecord = { ...record, status };
    this.recordsBySourceId.set(sourceId, updated);
    return updated;
  }

  /** Record that a source has been indexed, updating its document count. */
  public recordIndexed(
    sourceId: Id,
    documentCount: number,
    indexedAt: string
  ): KnowledgeSourceRecord {
    const record = this.requireRecord(sourceId);

    const updated: KnowledgeSourceRecord = {
      ...record,
      status: "indexed",
      documentCount,
      lastIndexedAt: indexedAt
    };

    this.recordsBySourceId.set(sourceId, updated);
    return updated;
  }

  /** Read the tracking record for a source, if it is registered. */
  public get(sourceId: Id): KnowledgeSourceRecord | undefined {
    return this.recordsBySourceId.get(sourceId);
  }

  /** Snapshot every tracked source in registration order. */
  public all(): readonly KnowledgeSourceRecord[] {
    return [...this.recordsBySourceId.values()];
  }

  /** Snapshot every tracked source, highest priority first. */
  public allByPriority(): readonly KnowledgeSourceRecord[] {
    return [...this.all()].sort((a, b) => compareSourcePriority(a.priority, b.priority));
  }

  private requireRecord(sourceId: Id): KnowledgeSourceRecord {
    const record = this.recordsBySourceId.get(sourceId);

    if (record === undefined) {
      throw new Error(`KnowledgeRegistry has no record for source: ${sourceId}`);
    }

    return record;
  }
}
