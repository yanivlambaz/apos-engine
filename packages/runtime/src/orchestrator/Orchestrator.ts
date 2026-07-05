import type {
  AgentDescriptor,
  DispatcherPort,
  ExecutionReport,
  ExecutionReportBuilderPort,
  IdFactory,
  RuntimeRequest,
  WorkflowPort,
  WorkPackage
} from "../types/index.js";

/**
 * Collaborators the orchestrator coordinates.
 *
 * Every dependency is declared as a port interface, never a concrete class.
 * This is the Dependency Inversion Principle in practice: the orchestrator
 * knows *what* each collaborator does, not *how* it does it, so any collaborator
 * can be replaced (for testing or future evolution) without touching this file.
 */
export interface OrchestratorDependencies {
  /** Shared identifier factory used for work packages. */
  readonly idFactory: IdFactory;

  /** Routes work packages to agents. */
  readonly dispatcher: DispatcherPort;

  /** Tracks task lifecycle state. */
  readonly workflow: WorkflowPort;

  /**
   * Produces a fresh report builder for each run.
   *
   * A factory (rather than a single shared builder) guarantees every execution
   * starts with an empty, isolated event log.
   */
  readonly createReportBuilder: () => ExecutionReportBuilderPort;
}

/**
 * Coordinates a single runtime execution.
 *
 * Single Responsibility: the orchestrator only sequences its collaborators. It
 * creates a work package, asks the dispatcher to route it, drives the workflow
 * state machine, and records events into a report. It contains no routing logic
 * of its own, tracks no state itself, reads no files, and never calls a model.
 *
 * Because it depends solely on the shared port interfaces, the orchestrator is
 * fully decoupled from the concrete dispatcher, workflow, and report modules.
 */
export class Orchestrator {
  private readonly idFactory: IdFactory;

  private readonly dispatcher: DispatcherPort;

  private readonly workflow: WorkflowPort;

  private readonly createReportBuilder: () => ExecutionReportBuilderPort;

  public constructor(dependencies: OrchestratorDependencies) {
    this.idFactory = dependencies.idFactory;
    this.dispatcher = dependencies.dispatcher;
    this.workflow = dependencies.workflow;
    this.createReportBuilder = dependencies.createReportBuilder;
  }

  /**
   * Wrap a request in a work package.
   *
   * The required capability is copied onto the package only when the request
   * declared one, so the optional field is never explicitly set to `undefined`.
   */
  public createWorkPackage(request: RuntimeRequest): WorkPackage {
    const base: WorkPackage = {
      id: this.idFactory("work-package"),
      request
    };

    if (request.requiredCapability === undefined) {
      return base;
    }

    return {
      ...base,
      requiredCapability: request.requiredCapability
    };
  }

  /**
   * Coordinate a full execution for a request against the supplied agents.
   *
   * The method sequences collaborators through the standard lifecycle
   * (pending -> assigned -> running -> completed) and returns the assembled
   * report. It performs no business work at any step.
   */
  public run(
    request: RuntimeRequest,
    agents: readonly AgentDescriptor[]
  ): ExecutionReport {
    const workPackage = this.createWorkPackage(request);
    const report = this.createReportBuilder();

    const task = this.workflow.register(workPackage.id);
    report.record("pending", `Registered task ${task.id} for work package ${workPackage.id}.`);

    const assignment = this.dispatcher.dispatch(workPackage, agents);
    this.workflow.transition(task.id, "assigned");
    report.record(
      "assigned",
      `Dispatched to agent ${assignment.agentId}. ${assignment.reason}`
    );

    this.workflow.transition(task.id, "running");
    report.record("running", "Execution started (runtime coordination only).");

    this.workflow.transition(task.id, "completed");
    report.record(
      "completed",
      "Execution completed without business logic or LLM calls."
    );

    return report.build(workPackage.id, assignment.agentId, "completed");
  }
}
