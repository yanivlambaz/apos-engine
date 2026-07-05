/**
 * APOS Core Engine domain models.
 *
 * This module defines the *data* the Core Engine passes between its stages. It
 * contains structure only: no behavior, no vertical-specific knowledge, and no
 * hardcoded business facts. The Healthcare vertical (siud.org) is the first
 * consumer, but nothing here is specific to it — every business detail arrives
 * at runtime through a Vertical Pack.
 *
 * Models are intentionally separate from the port interfaces in `../types`.
 * Data shapes rarely change; the behaviors that consume them evolve
 * independently.
 */

/**
 * Opaque identifier. The engine never parses identifier contents; callers and
 * ID factories decide how they are shaped.
 */
export type Id = string;

/**
 * Factory that mints identifiers from a semantic prefix. Injecting a single
 * factory lets the composition root apply one deterministic ID strategy across
 * every stage without any module embedding its own.
 */
export type IdFactory = (prefix: string) => Id;

/**
 * Lifecycle of an {@link ExecutionPlan} as it moves through the engine stages.
 * These are structural status markers, not business states.
 */
export type PlanStatus =
  | "draft"
  | "planned"
  | "analyzed"
  | "generated"
  | "validated"
  | "deployable";

/**
 * A request expressed in natural language.
 *
 * The engine captures the raw text and the target vertical. Interpreting the
 * text into concrete intent requires intelligence that is not implemented yet
 * (see `RequestInterpreter` in `../types`).
 */
export interface NaturalLanguageRequest {
  readonly id: Id;

  /** Vertical Pack this request targets (e.g. a healthcare site). */
  readonly verticalId: Id;

  /** Raw, unmodified natural-language instruction from the caller. */
  readonly text: string;

  /** Optional structured hints supplied alongside the free text. */
  readonly metadata?: Readonly<Record<string, string>>;
}

/**
 * The kind of work a plan step represents. These mirror the Core Engine's own
 * pipeline stages and are engine structure, not business logic.
 */
export type ExecutionStepKind =
  | "analyze"
  | "load-knowledge"
  | "generate"
  | "validate"
  | "plan-deployment";

/** A single ordered step within an {@link ExecutionPlan}. */
export interface ExecutionStep {
  readonly id: Id;
  readonly kind: ExecutionStepKind;

  /** Human-readable description of what the step will coordinate. */
  readonly description: string;
}

/**
 * A structured plan derived from a {@link NaturalLanguageRequest}. It describes
 * *what the engine will do*, not the generated output itself.
 */
export interface ExecutionPlan {
  readonly id: Id;
  readonly requestId: Id;
  readonly verticalId: Id;
  readonly status: PlanStatus;
  readonly steps: readonly ExecutionStep[];
}

/**
 * A single page discovered on the existing website.
 *
 * `kind` is a free-form structural tag (for example "service" or "article");
 * the engine does not attach meaning to specific values.
 */
export interface PageNode {
  readonly route: string;
  readonly title?: string;
  readonly kind?: string;
}

/**
 * A snapshot of the current website structure supplied to the analyzer.
 *
 * APOS manages and evolves *existing* sites, so the engine is always given the
 * current state to reason about rather than assuming a blank slate.
 */
export interface WebsiteSnapshot {
  readonly siteId: Id;
  readonly pages: readonly PageNode[];
}

/**
 * The analyzer's view of what already exists on the site.
 */
export interface AnalysisResult {
  readonly siteId: Id;

  /** Routes already present on the site. */
  readonly existingRoutes: readonly string[];

  /** Total number of pages observed in the snapshot. */
  readonly pageCount: number;

  /** Structural observations recorded during analysis. */
  readonly notes: readonly string[];
}

/**
 * A reusable business object provided by a Vertical Pack.
 *
 * Attributes are deliberately untyped (`unknown`) so the engine stays generic:
 * the shape of a healthcare "service" versus a legal "matter" is defined by the
 * pack, never by the engine.
 */
export interface BusinessObject {
  readonly id: Id;
  readonly type: string;
  readonly attributes: Readonly<Record<string, unknown>>;
}

/**
 * A loaded Vertical Pack: the business knowledge for a single industry/site.
 * The engine treats the contents as opaque, reusable objects.
 */
export interface VerticalPack {
  readonly id: Id;
  readonly name: string;
  readonly businessObjects: readonly BusinessObject[];
}

/**
 * A generated unit of content, expressed as data rather than files.
 */
export interface ContentObject {
  readonly id: Id;
  readonly type: string;
  readonly fields: Readonly<Record<string, unknown>>;
}

/**
 * A generated page definition. It references content objects by ID and names a
 * pattern to render with, but it is not a file and produces no output on disk.
 */
export interface PageDefinition {
  readonly id: Id;
  readonly route: string;
  readonly pattern: string;
  readonly contentObjectIds: readonly Id[];
}

/**
 * The generator's output: content objects and page definitions in memory only.
 */
export interface GenerationResult {
  readonly contentObjects: readonly ContentObject[];
  readonly pageDefinitions: readonly PageDefinition[];
}

/** Severity of a validation finding. */
export type ValidationSeverity = "error" | "warning";

/** A single validation finding. */
export interface ValidationIssue {
  readonly severity: ValidationSeverity;
  readonly code: string;
  readonly message: string;
}

/**
 * The validator's completeness report. `valid` is false when any `error`-level
 * issue is present.
 */
export interface ValidationReport {
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
}

/** The filesystem action a deployment operation would perform. */
export type FileAction = "create" | "modify" | "delete";

/**
 * A single planned filesystem change. This is a *description* only — the
 * deployment stage never touches the project.
 */
export interface FileOperation {
  readonly action: FileAction;
  readonly path: string;
  readonly reason: string;
}

/**
 * A deployment plan: the exact set of file operations that *would* be applied.
 * Producing this plan has no side effects.
 */
export interface DeploymentPlan {
  readonly id: Id;
  readonly operations: readonly FileOperation[];
}

/**
 * The aggregate result of a full Core Engine pass. Every stage's output is
 * surfaced so callers can inspect the reasoning without any file being written.
 */
export interface CoreEngineResult {
  readonly plan: ExecutionPlan;
  readonly analysis: AnalysisResult;
  readonly pack: VerticalPack;
  readonly generation: GenerationResult;
  readonly validation: ValidationReport;
  readonly deployment: DeploymentPlan;
}
