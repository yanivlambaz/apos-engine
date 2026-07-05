import type {
  IdFactory,
  RuntimeId,
  TaskRecord,
  TaskState,
  WorkflowPort
} from "../types/index.js";

/**
 * Legal state transitions for a tracked task.
 *
 * Encoding the allowed edges explicitly keeps the workflow a pure state
 * machine: it can reject illegal transitions without knowing anything about
 * what the states mean for the business.
 */
const ALLOWED_TRANSITIONS: Readonly<Record<TaskState, readonly TaskState[]>> = {
  pending: ["assigned", "failed"],
  assigned: ["running", "failed"],
  running: ["completed", "failed"],
  completed: [],
  failed: []
};

/**
 * Options controlling how the {@link Workflow} generates task identifiers.
 */
export interface WorkflowOptions {
  /**
   * Identifier factory shared with the rest of the runtime.
   *
   * Injecting the factory (rather than hard-coding one) preserves module
   * independence and lets the orchestrator apply a single ID strategy across
   * all collaborators.
   */
  readonly idFactory: IdFactory;
}

/**
 * Tracks the lifecycle state of runtime tasks.
 *
 * Single Responsibility: the workflow only records tasks and validates their
 * state transitions. It performs no work, loads nothing, and calls no model.
 * Because it depends solely on the shared contracts, it can be reused by any
 * coordinator without modification.
 */
export class Workflow implements WorkflowPort {
  private readonly idFactory: IdFactory;

  private readonly tasks = new Map<RuntimeId, TaskRecord>();

  public constructor(options: WorkflowOptions) {
    this.idFactory = options.idFactory;
  }

  /**
   * Begin tracking a task for a work package.
   *
   * New tasks always start in the `pending` state with a single-entry history.
   */
  public register(workPackageId: RuntimeId): TaskRecord {
    const record: TaskRecord = {
      id: this.idFactory("task"),
      workPackageId,
      state: "pending",
      history: ["pending"]
    };

    this.tasks.set(record.id, record);
    return record;
  }

  /**
   * Transition a tracked task to its next state.
   *
   * Throws when the task is unknown or when the requested transition is not
   * permitted by {@link ALLOWED_TRANSITIONS}. Returning a fresh immutable record
   * keeps callers from mutating internal state.
   */
  public transition(taskId: RuntimeId, next: TaskState): TaskRecord {
    const current = this.tasks.get(taskId);

    if (current === undefined) {
      throw new Error(`Workflow cannot transition unknown task: ${taskId}`);
    }

    const permitted = ALLOWED_TRANSITIONS[current.state];

    if (!permitted.includes(next)) {
      throw new Error(
        `Workflow rejected illegal transition for task ${taskId}: ${current.state} -> ${next}`
      );
    }

    const updated: TaskRecord = {
      ...current,
      state: next,
      history: [...current.history, next]
    };

    this.tasks.set(taskId, updated);
    return updated;
  }

  /** Read the current record for a task, if it is tracked. */
  public get(taskId: RuntimeId): TaskRecord | undefined {
    return this.tasks.get(taskId);
  }

  /** Snapshot every tracked task in insertion order. */
  public all(): readonly TaskRecord[] {
    return [...this.tasks.values()];
  }
}
