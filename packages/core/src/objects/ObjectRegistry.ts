import { Object as AposObject } from "./Object.js";
import type { ObjectRelationship } from "./Object.js";
import type { Id } from "../models/index.js";

/** Severity for object-model structural validation. */
export type ObjectValidationSeverity = "error" | "warning";

/** A structural validation finding produced by the object registry. */
export interface ObjectValidationIssue {
  readonly severity: ObjectValidationSeverity;
  readonly code: string;
  readonly objectId?: Id;
  readonly message: string;
}

/** Result of validating registry contents. */
export interface ObjectValidationResult {
  readonly valid: boolean;
  readonly issues: readonly ObjectValidationIssue[];
}

/**
 * Read-only query surface for registered APOS Knowledge Objects.
 */
export interface ObjectRegistryReader {
  getById(id: Id): AposObject | undefined;
  queryByType(type: string): readonly AposObject[];
  all(): readonly AposObject[];
  getRelatedObjects(objectId: Id, relationshipType?: string): readonly AposObject[];
}

/**
 * Registry responsible for storing and querying APOS Knowledge Objects.
 *
 * The registry owns structural guarantees only:
 * - object IDs are unique
 * - required base fields are present
 * - relationships have target IDs and relationship labels
 * - relationships point to registered objects during validation
 *
 * It does not validate whether a Service should relate to a FAQ, whether a
 * Procedure belongs to Healthcare, or whether content is correct. Those are
 * vertical/business concerns outside the generic object model.
 */
export class ObjectRegistry implements ObjectRegistryReader {
  private readonly objectsById = new Map<Id, AposObject>();

  private readonly idsByType = new Map<string, Set<Id>>();

  /**
   * Register one object.
   *
   * Duplicate IDs fail immediately so callers cannot accidentally overwrite
   * knowledge. Type indexes are maintained for efficient type queries.
   */
  public register(object: AposObject): void {
    if (this.objectsById.has(object.id)) {
      throw new Error(`ObjectRegistry rejected duplicate object id: ${object.id}`);
    }

    this.objectsById.set(object.id, object);

    const existingTypeSet = this.idsByType.get(object.type);
    const typeSet = existingTypeSet ?? new Set<Id>();
    typeSet.add(object.id);
    this.idsByType.set(object.type, typeSet);
  }

  /** Register multiple objects in order. */
  public registerMany(objects: readonly AposObject[]): void {
    for (const object of objects) {
      this.register(object);
    }
  }

  /** Retrieve a single object by ID. */
  public getById(id: Id): AposObject | undefined {
    return this.objectsById.get(id);
  }

  /** Query objects by their generic object type. */
  public queryByType(type: string): readonly AposObject[] {
    const ids = this.idsByType.get(type);

    if (ids === undefined) {
      return [];
    }

    return [...ids]
      .map((id) => this.objectsById.get(id))
      .filter((object): object is AposObject => object !== undefined);
  }

  /** Snapshot every registered object in insertion order. */
  public all(): readonly AposObject[] {
    return [...this.objectsById.values()];
  }

  /**
   * Resolve objects referenced by one source object.
   *
   * Missing targets are omitted from this query and reported by `validate()`;
   * this keeps lookup ergonomic while preserving structural diagnostics.
   */
  public getRelatedObjects(
    objectId: Id,
    relationshipType?: string
  ): readonly AposObject[] {
    const source = this.objectsById.get(objectId);

    if (source === undefined) {
      return [];
    }

    return source.relationships
      .filter((relationship) =>
        relationshipType === undefined
          ? true
          : relationship.relationshipType === relationshipType
      )
      .map((relationship) => this.objectsById.get(relationship.targetId))
      .filter((object): object is AposObject => object !== undefined);
  }

  /**
   * Run structural validation over all registered objects.
   *
   * Duplicate IDs are already blocked on register, but validation remains useful
   * for required-field checks and relationship reference integrity.
   */
  public validate(): ObjectValidationResult {
    const issues: ObjectValidationIssue[] = [];

    for (const object of this.objectsById.values()) {
      this.validateRequiredFields(object, issues);
      this.validateTimestamps(object, issues);
      this.validateRelationships(object, issues);
    }

    return {
      valid: !issues.some((issue) => issue.severity === "error"),
      issues
    };
  }

  private validateRequiredFields(
    object: AposObject,
    issues: ObjectValidationIssue[]
  ): void {
    this.requireNonEmpty(object.id, "OBJECT_ID_EMPTY", "id", object, issues);
    this.requireNonEmpty(object.type, "OBJECT_TYPE_EMPTY", "type", object, issues);
    this.requireNonEmpty(object.title, "OBJECT_TITLE_EMPTY", "title", object, issues);
    this.requireNonEmpty(object.slug, "OBJECT_SLUG_EMPTY", "slug", object, issues);
  }

  private validateTimestamps(
    object: AposObject,
    issues: ObjectValidationIssue[]
  ): void {
    this.requireNonEmpty(
      object.timestamps.createdAt,
      "OBJECT_CREATED_AT_EMPTY",
      "timestamps.createdAt",
      object,
      issues
    );
    this.requireNonEmpty(
      object.timestamps.updatedAt,
      "OBJECT_UPDATED_AT_EMPTY",
      "timestamps.updatedAt",
      object,
      issues
    );
  }

  private validateRelationships(
    object: AposObject,
    issues: ObjectValidationIssue[]
  ): void {
    for (const relationship of object.relationships) {
      this.validateRelationshipShape(object, relationship, issues);
      this.validateRelationshipTarget(object, relationship, issues);
    }
  }

  private validateRelationshipShape(
    object: AposObject,
    relationship: ObjectRelationship,
    issues: ObjectValidationIssue[]
  ): void {
    this.requireNonEmpty(
      relationship.targetId,
      "RELATIONSHIP_TARGET_ID_EMPTY",
      "relationship.targetId",
      object,
      issues
    );
    this.requireNonEmpty(
      relationship.relationshipType,
      "RELATIONSHIP_TYPE_EMPTY",
      "relationship.relationshipType",
      object,
      issues
    );
  }

  private validateRelationshipTarget(
    object: AposObject,
    relationship: ObjectRelationship,
    issues: ObjectValidationIssue[]
  ): void {
    const target = this.objectsById.get(relationship.targetId);

    if (target === undefined) {
      issues.push({
        severity: "error",
        code: "RELATIONSHIP_TARGET_MISSING",
        objectId: object.id,
        message: `Object ${object.id} references missing object ${relationship.targetId}.`
      });
      return;
    }

    if (
      relationship.targetType !== undefined &&
      relationship.targetType !== target.type
    ) {
      issues.push({
        severity: "error",
        code: "RELATIONSHIP_TARGET_TYPE_MISMATCH",
        objectId: object.id,
        message: `Object ${object.id} expected ${relationship.targetId} to be type ${relationship.targetType}, but found ${target.type}.`
      });
    }
  }

  private requireNonEmpty(
    value: string,
    code: string,
    field: string,
    object: AposObject,
    issues: ObjectValidationIssue[]
  ): void {
    if (value.trim().length === 0) {
      issues.push({
        severity: "error",
        code,
        objectId: object.id,
        message: `Object ${object.id} has an empty ${field}.`
      });
    }
  }
}
