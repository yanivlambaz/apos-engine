import type { Id } from "../models/index.js";
import type { AuthorityRecommendation } from "./AuthorityRecommendation.js";

/**
 * Stores Authority Recommendations produced by the Authority Intelligence
 * Engine.
 *
 * Single Responsibility: this module only persists and retrieves
 * recommendation records. It performs no scoring, no decision-making, and no
 * content generation.
 */
export interface RecommendationRepositoryPort {
  save(recommendation: AuthorityRecommendation): void;
  getById(recommendationId: Id): AuthorityRecommendation | undefined;
  getByConversationId(conversationId: Id): AuthorityRecommendation | undefined;
  all(): readonly AuthorityRecommendation[];
}

/**
 * In-memory recommendation store.
 *
 * Enforces "every analyzed conversation must produce exactly one
 * recommendation" by rejecting a second, different recommendation for a
 * conversation that already has one.
 */
export class InMemoryRecommendationRepository implements RecommendationRepositoryPort {
  private readonly recommendationsById = new Map<Id, AuthorityRecommendation>();

  private readonly recommendationIdByConversationId = new Map<Id, Id>();

  public save(recommendation: AuthorityRecommendation): void {
    const existingId = this.recommendationIdByConversationId.get(recommendation.conversationId);

    if (existingId !== undefined && existingId !== recommendation.id) {
      throw new Error(
        `Conversation ${recommendation.conversationId} already has recommendation ${existingId}; only one recommendation per conversation is allowed.`
      );
    }

    this.recommendationsById.set(recommendation.id, recommendation);
    this.recommendationIdByConversationId.set(recommendation.conversationId, recommendation.id);
  }

  public getById(recommendationId: Id): AuthorityRecommendation | undefined {
    return this.recommendationsById.get(recommendationId);
  }

  public getByConversationId(conversationId: Id): AuthorityRecommendation | undefined {
    const id = this.recommendationIdByConversationId.get(conversationId);
    return id === undefined ? undefined : this.recommendationsById.get(id);
  }

  public all(): readonly AuthorityRecommendation[] {
    return [...this.recommendationsById.values()];
  }
}
