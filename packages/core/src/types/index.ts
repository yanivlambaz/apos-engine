/**
 * APOS Core Engine port interfaces.
 *
 * These are the contracts every engine stage implements and depends on. Stages
 * never import one another's concrete classes; they depend only on the models
 * (`../models`) and on these ports. The composition root wires concrete
 * implementations together, which keeps each module independent and satisfies
 * the Dependency Inversion Principle.
 *
 * Where real behavior requires intelligence that is not implemented yet (for
 * example, understanding natural language, or generating real content), the
 * capability is expressed as an interface only. Concrete implementations remain
 * deliberately structural until an LLM-backed adapter is introduced.
 */
import type {
  AnalysisResult,
  DeploymentPlan,
  ExecutionPlan,
  GenerationResult,
  Id,
  NaturalLanguageRequest,
  ValidationReport,
  VerticalPack,
  WebsiteSnapshot
} from "../models/index.js";

/**
 * Converts a natural-language request into a structured {@link ExecutionPlan}.
 */
export interface PlannerPort {
  plan(request: NaturalLanguageRequest): ExecutionPlan;
}

/**
 * Optional intelligence used by a planner to interpret free-text intent.
 *
 * This capability requires an LLM and is therefore expressed as an interface
 * only. No concrete implementation ships in this foundation; a planner without
 * an interpreter falls back to the engine's deterministic pipeline plan.
 */
export interface RequestInterpreter {
  /**
   * Derive an ordered set of intent tags from the request text. Implementations
   * will be added once LLM integration is in scope.
   */
  interpret(request: NaturalLanguageRequest): readonly string[];
}

/**
 * Inspects a website snapshot and reports what already exists.
 */
export interface AnalyzerPort {
  analyze(snapshot: WebsiteSnapshot): AnalysisResult;
}

/**
 * Loads a Vertical Pack and exposes its reusable business objects.
 */
export interface KnowledgePort {
  load(verticalId: Id): Promise<VerticalPack>;
}

/**
 * Source of Vertical Packs.
 *
 * Abstracting the source keeps the knowledge module independent of *where*
 * packs come from (in-memory, disk, remote). No disk-backed adapter is included
 * in this foundation; only the in-memory repository is provided.
 */
export interface VerticalPackRepository {
  find(verticalId: Id): Promise<VerticalPack | undefined>;
}

/**
 * Inputs required to generate content and page definitions.
 */
export interface GenerationInput {
  readonly plan: ExecutionPlan;
  readonly analysis: AnalysisResult;
  readonly pack: VerticalPack;
}

/**
 * Produces content objects and page definitions in memory.
 *
 * The generator never writes files. Real generation depends on both business
 * knowledge and an LLM, so the shipped implementation is a structural skeleton;
 * this port is the stable contract that an intelligent generator will fulfil.
 */
export interface GeneratorPort {
  generate(input: GenerationInput): GenerationResult;
}

/**
 * Inputs required to validate a generated plan for completeness.
 */
export interface ValidationInput {
  readonly plan: ExecutionPlan;
  readonly generation: GenerationResult;
}

/**
 * Verifies the completeness and internal consistency of generated output.
 */
export interface ValidatorPort {
  validate(input: ValidationInput): ValidationReport;
}

/**
 * Inputs required to compute a deployment plan.
 */
export interface DeploymentInput {
  readonly generation: GenerationResult;
  readonly analysis: AnalysisResult;
}

/**
 * Computes the set of file operations that *would* be applied.
 *
 * This stage is strictly read-only with respect to the project: it describes
 * changes and never performs them.
 */
export interface DeploymentPort {
  planDeployment(input: DeploymentInput): DeploymentPlan;
}
