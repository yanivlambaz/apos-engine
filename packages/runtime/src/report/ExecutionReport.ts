import type {
  ExecutionReport,
  ExecutionReportBuilderPort,
  IdFactory,
  RuntimeEvent,
  RuntimeId,
  TaskState
} from "../types/index.js";

/**
 * Options controlling how the {@link ExecutionReportBuilder} generates IDs.
 */
export interface ExecutionReportBuilderOptions {
  /** Identifier factory shared with the rest of the runtime. */
  readonly idFactory: IdFactory;
}

/**
 * Accumulates runtime events and produces an immutable {@link ExecutionReport}.
 *
 * Single Responsibility: this module only assembles reports. It does not decide
 * what happens during a run, load documents, route work, or call a model. The
 * orchestrator feeds it events and asks it to build the final report.
 *
 * The builder is mutable while events are being recorded and yields a frozen,
 * immutable snapshot when {@link build} is called, so a completed report can be
 * shared safely.
 */
export class ExecutionReportBuilder implements ExecutionReportBuilderPort {
  private readonly idFactory: IdFactory;

  private readonly events: RuntimeEvent[] = [];

  private sequence = 0;

  public constructor(options: ExecutionReportBuilderOptions) {
    this.idFactory = options.idFactory;
  }

  /**
   * Append an event to the report.
   *
   * Each event receives the next monotonic sequence number, giving callers a
   * deterministic ordering that does not depend on wall-clock time.
   */
  public record(state: TaskState, message: string): this {
    this.events.push({
      sequence: this.sequence,
      state,
      message
    });

    this.sequence += 1;
    return this;
  }

  /**
   * Produce the final report.
   *
   * The recorded events are copied into a frozen array so the returned report
   * cannot be mutated through the builder afterwards.
   */
  public build(
    workPackageId: RuntimeId,
    assignedAgentId: RuntimeId,
    finalState: Extract<TaskState, "completed" | "failed">
  ): ExecutionReport {
    return {
      id: this.idFactory("report"),
      workPackageId,
      assignedAgentId,
      finalState,
      events: Object.freeze([...this.events])
    };
  }
}
