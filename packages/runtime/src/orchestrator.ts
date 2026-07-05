import type {
  AgentAssignment,
  AnalysisResult,
  RuntimeAgent,
  RuntimeEvent,
  RuntimeId,
  RuntimeReport,
  RuntimeRequest,
  WorkPackage
} from "./types.js";

/**
 * Creates stable runtime identifiers for skeleton records.
 *
 * The default implementation is deliberately local and deterministic. It avoids
 * external services, persistence, randomness, and time-based behavior so the
 * runtime foundation remains easy to test and safe to embed in future commands.
 */
export type RuntimeIdFactory = (prefix: string) => RuntimeId;

/**
 * Configuration accepted by the APOS orchestrator.
 *
 * Options are intentionally limited to infrastructure concerns. Business rules,
 * vertical-pack knowledge, generator configuration, validator configuration, and
 * model clients do not belong in this runtime skeleton.
 */
export interface OrchestratorOptions {
  /**
   * Optional ID factory for callers that need to connect runtime records to an
   * external tracing, storage, or command system.
   */
  readonly idFactory?: RuntimeIdFactory;
}

/**
 * Runtime coordinator for APOS.
 *
 * The orchestrator owns the shape of the execution lifecycle, but not the work
 * performed inside that lifecycle. It does not call LLMs, choose APOS patterns,
 * execute generators, invoke validators, inspect vertical-pack content, or make
 * business decisions.
 */
export class Orchestrator {
  private readonly idFactory: RuntimeIdFactory;

  /**
   * Creates an orchestrator with optional infrastructure customization.
   *
   * A caller may provide an ID factory when integrating with a larger runtime.
   * Without one, IDs are generated from a private counter for deterministic
   * skeleton behavior.
   */
  public constructor(options: OrchestratorOptions = {}) {
    const defaultIdFactory = createDefaultIdFactory();
    this.idFactory = options.idFactory ?? defaultIdFactory;
  }

  /**
   * Performs structural request analysis.
   *
   * This method records that a request has entered the runtime and preserves the
   * caller-provided request envelope. It intentionally does not infer business
   * objects, select patterns, load documents, or call any model.
   */
  public analyze(request: RuntimeRequest): AnalysisResult {
    return {
      id: this.idFactory("analysis"),
      request,
      status: "analyzed",
      notes: [
        "Request accepted by runtime skeleton.",
        "No business logic, pattern selection, generator execution, validator execution, or LLM call was performed."
      ]
    };
  }

  /**
   * Creates a coordination-only work package from an analysis result.
   *
   * The package is a runtime handoff record. It does not contain generated
   * assets, validation findings, QA approval, or business-specific instructions.
   */
  public createWorkPackage(analysis: AnalysisResult): WorkPackage {
    return {
      id: this.idFactory("work-package"),
      analysis,
      status: "work_package_created"
    };
  }

  /**
   * Assigns an externally defined agent to a work package.
   *
   * Assignment is bookkeeping only. The runtime does not evaluate agent fitness,
   * construct prompts, start an agent process, or call an LLM.
   */
  public assignAgent(workPackage: WorkPackage, agent: RuntimeAgent): WorkPackage {
    const assignment: AgentAssignment = {
      id: this.idFactory("assignment"),
      agent,
      workPackageId: workPackage.id
    };

    return {
      ...workPackage,
      status: "agent_assigned",
      assignedAgent: assignment
    };
  }

  /**
   * Runs the skeletal runtime lifecycle for a work package.
   *
   * This method emits lifecycle events and completes immediately. Future runtime
   * packages can replace these placeholders with dependency loading, pattern
   * resolution, generator execution, validator invocation, reporting, and
   * recovery while preserving the public orchestration surface.
   */
  public run(workPackage: WorkPackage): RuntimeReport {
    const runningPackage: WorkPackage = {
      ...workPackage,
      status: "running"
    };

    const completedPackage: WorkPackage = {
      ...runningPackage,
      status: "completed"
    };

    const events: readonly RuntimeEvent[] = [
      {
        status: workPackage.status,
        message: "Runtime received work package."
      },
      {
        status: runningPackage.status,
        message: "Runtime skeleton entered running state without executing business logic."
      },
      {
        status: completedPackage.status,
        message: "Runtime skeleton completed without calling generators, validators, or LLMs."
      }
    ];

    return {
      id: this.idFactory("run"),
      status: "completed",
      workPackage: completedPackage,
      events
    };
  }
}

/**
 * Builds the default in-memory ID factory.
 *
 * Keeping the counter inside a closure prevents global mutable state from
 * leaking across orchestrator instances while still making generated IDs
 * predictable for tests and command-line integrations.
 */
function createDefaultIdFactory(): RuntimeIdFactory {
  let nextId = 1;

  return (prefix: string): RuntimeId => {
    const id = `${prefix}-${nextId.toString()}`;
    nextId += 1;
    return id;
  };
}
