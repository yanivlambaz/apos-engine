// Vertical Pack loading port used by the Core Engine pipeline (WP-003).
export { InMemoryVerticalPackRepository, KnowledgeBase } from "./KnowledgeBase.js";
export type { KnowledgeBaseOptions } from "./KnowledgeBase.js";

// APOS Knowledge Acquisition Engine (WP-005).
export {
  SOURCE_PRIORITY,
  compareSourcePriority,
  describeSourcePriority,
  isHigherPriority
} from "./SourcePriority.js";
export type { SourcePriority } from "./SourcePriority.js";

export { ProjectKnowledgeDirectorySource, VerticalPackKnowledgeSource } from "./KnowledgeSource.js";
export type {
  ExternalKnowledgeSource,
  KnowledgeDocumentRef,
  KnowledgeSource,
  KnowledgeSourceDescriptor,
  KnowledgeSourceType,
  ProjectKnowledgeDirectorySourceOptions,
  VerticalPackKnowledgeSourceOptions
} from "./KnowledgeSource.js";

export { KnowledgeLoader } from "./KnowledgeLoader.js";
export type { KnowledgeLoaderOptions, KnowledgeLoaderPort, LoadedKnowledgeSource } from "./KnowledgeLoader.js";

export { createPendingIndexEntry, KnowledgeIndex } from "./KnowledgeIndex.js";
export type { KnowledgeIndexEntry, KnowledgeIndexEntryStatus, KnowledgeIndexPort } from "./KnowledgeIndex.js";

export { KnowledgeRegistry } from "./KnowledgeRegistry.js";
export type {
  KnowledgeRegistryPort,
  KnowledgeSourceRecord,
  KnowledgeSourceStatus
} from "./KnowledgeRegistry.js";

export { KnowledgeManager } from "./KnowledgeManager.js";
export type { KnowledgeManagerOptions } from "./KnowledgeManager.js";
