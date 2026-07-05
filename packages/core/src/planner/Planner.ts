import type {
  ExecutionPlan,
  ExecutionStep,
  ExecutionStepKind,
  IdFactory,
  NaturalLanguageRequest
} from "../models/index.js";
import type { PlannerPort, RequestInterpreter } from "../types/index.js";

/**
 * The Core Engine's canonical pipeline. These stages are engine structure — the
 * fixed order in which any request is processed — not business logic.
 */
const PIPELINE: readonly {
  readonly kind: ExecutionStepKind;
  readonly description: string;
}[] = [
  { kind: "analyze", description: "Inspect the existing website structure." },
  { kind: "load-knowledge", description: "Load the Vertical Pack for the target site." },
  { kind: "generate", description: "Produce content objects and page definitions in memory." },
  { kind: "validate", description: "Verify the completeness of the generated output." },
  { kind: "plan-deployment", description: "Describe the file operations that would be applied." }
];

/**
 * Options for constructing a {@link Planner}.
 */
export interface PlannerOptions {
  readonly idFactory: IdFactory;

  /**
   * Optional interpreter used to understand the natural-language request.
   *
   * Interpreting free text requires an LLM, which is out of scope for this
   * foundation. When omitted (the default), the planner emits the engine's
   * deterministic pipeline plan without attempting to understand the text.
   */
  readonly interpreter?: RequestInterpreter;
}

/**
 * Converts a natural-language request into a structured execution plan.
 *
 * Single Responsibility: the planner only shapes a plan. It performs no
 * analysis, generation, validation, or deployment itself. It depends on the
 * {@link RequestInterpreter} port (not a concrete LLM client), so an
 * intelligent interpreter can be injected later without changing this class
 * (Open/Closed + Dependency Inversion).
 */
export class Planner implements PlannerPort {
  private readonly idFactory: IdFactory;

  private readonly interpreter: RequestInterpreter | undefined;

  public constructor(options: PlannerOptions) {
    this.idFactory = options.idFactory;
    this.interpreter = options.interpreter;
  }

  /**
   * Build an execution plan for the request.
   *
   * The plan always contains the engine's fixed pipeline steps. If an
   * interpreter is present, its derived intent tags are attached to the
   * generate step's description for downstream visibility; no business meaning
   * is assigned to them here.
   */
  public plan(request: NaturalLanguageRequest): ExecutionPlan {
    const intentTags = this.interpreter?.interpret(request) ?? [];

    const steps: readonly ExecutionStep[] = PIPELINE.map((stage) => ({
      id: this.idFactory("step"),
      kind: stage.kind,
      description:
        stage.kind === "generate" && intentTags.length > 0
          ? `${stage.description} (intent: ${intentTags.join(", ")})`
          : stage.description
    }));

    return {
      id: this.idFactory("plan"),
      requestId: request.id,
      verticalId: request.verticalId,
      status: "planned",
      steps
    };
  }
}
