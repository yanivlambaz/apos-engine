import type { Id } from "../models/index.js";

/**
 * Generic lifecycle status for APOS Knowledge Objects.
 *
 * These states describe object management only. They do not encode publishing,
 * medical, legal, healthcare, SEO, or website-generation rules.
 */
export type ObjectStatus = "draft" | "active" | "archived" | "deprecated";

/**
 * Generic metadata bag attached to every APOS object.
 *
 * Metadata is intentionally opaque so verticals can attach their own structured
 * data without the core object model hardcoding business fields.
 */
export type ObjectMetadata = Readonly<Record<string, unknown>>;

/**
 * Records when an object was created and last updated.
 *
 * Values are strings so callers can choose their own serialization strategy
 * (ISO dates are recommended), and the core model remains storage-agnostic.
 */
export interface ObjectTimestamps {
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Generic relationship between APOS Knowledge Objects.
 *
 * Relationships intentionally use free-form `relationshipType` labels. The core
 * model knows that objects can reference one another, but it does not know which
 * relationships are semantically valid for a vertical. That keeps examples such
 * as Service -> FAQ or Location -> Service as data, never engine rules.
 */
export interface ObjectRelationship {
  /** Target object identifier. */
  readonly targetId: Id;

  /**
   * Optional target type hint used for structural checks and faster filtering.
   * The registry validates it against the target object when both are present.
   */
  readonly targetType?: string;

  /** Caller-defined relationship label, such as "supports" or "references". */
  readonly relationshipType: string;

  /** Optional metadata about the relationship itself. */
  readonly metadata?: ObjectMetadata;
}

/**
 * Constructor input shared by every APOS object.
 *
 * Concrete subclasses provide their fixed `type`; callers provide only the
 * generic object fields and optional relationships.
 */
export interface ObjectInput {
  readonly id: Id;
  readonly title: string;
  readonly slug: string;
  readonly status: ObjectStatus;
  readonly metadata?: ObjectMetadata;
  readonly relationships?: readonly ObjectRelationship[];
  readonly timestamps: ObjectTimestamps;
}

/**
 * Full data snapshot shared by every APOS Knowledge Object.
 */
export interface ObjectSnapshot extends ObjectInput {
  readonly type: string;
  readonly metadata: ObjectMetadata;
  readonly relationships: readonly ObjectRelationship[];
}

/**
 * The abstract base object shared by every APOS Knowledge Object.
 *
 * APOS manages Knowledge Objects; pages are only projections built elsewhere.
 * This class therefore models reusable knowledge only. It has no rendering,
 * routing, deployment, website-generation, or business-validation behavior.
 */
export abstract class Object {
  public readonly id: Id;

  public readonly type: string;

  public readonly title: string;

  public readonly slug: string;

  public readonly status: ObjectStatus;

  public readonly metadata: ObjectMetadata;

  public readonly relationships: readonly ObjectRelationship[];

  public readonly timestamps: ObjectTimestamps;

  protected constructor(type: string, input: ObjectInput) {
    this.id = input.id;
    this.type = type;
    this.title = input.title;
    this.slug = input.slug;
    this.status = input.status;
    this.metadata = input.metadata ?? {};
    this.relationships = input.relationships ?? [];
    this.timestamps = input.timestamps;
  }

  /**
   * Return a plain immutable data snapshot of the object.
   *
   * Consumers can persist or inspect the snapshot without depending on class
   * instances. This is structural data only; it does not generate pages.
   */
  public toSnapshot(): ObjectSnapshot {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      slug: this.slug,
      status: this.status,
      metadata: this.metadata,
      relationships: this.relationships,
      timestamps: this.timestamps
    };
  }
}
