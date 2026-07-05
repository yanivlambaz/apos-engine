/**
 * APOS Expert Engine — public exports.
 *
 * Answers user questions from approved knowledge sources only, and records
 * conversations purely for future analysis. See ExpertEngine.ts for the full
 * architectural rationale.
 */

// Citation model.
export { createCitation, priorityForCitationSourceType } from "./Citation.js";
export type { Citation, CitationSourceType, CreateCitationInput } from "./Citation.js";

// Conversation data model.
export type { Conversation, ConversationState } from "./Conversation.js";
export type { ConversationMessage, ConversationRole } from "./ConversationMessage.js";

export { createConversationContext } from "./ConversationContext.js";
export type { ConversationContext, CreateConversationContextOptions } from "./ConversationContext.js";

export { ConversationSession } from "./ConversationSession.js";
export type { AddMessageOptions, ConversationSessionOptions } from "./ConversationSession.js";

export { InMemoryConversationRepository } from "./ConversationRepository.js";
export type { ConversationRepositoryPort } from "./ConversationRepository.js";

// Expert response model.
export { clampConfidence } from "./ExpertResponse.js";
export type { ExpertResponse } from "./ExpertResponse.js";

// Expert Engine.
export { ExpertEngine } from "./ExpertEngine.js";
export type {
  AnswerProviderInput,
  AnswerProviderPort,
  AnswerProviderResult,
  ExpertEngineOptions,
  KnowledgeRetrievalPort
} from "./ExpertEngine.js";
