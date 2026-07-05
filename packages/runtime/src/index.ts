import { Dispatcher } from "./dispatcher/Dispatcher.js";
import { DocumentLoader } from "./loader/DocumentLoader.js";
import { Orchestrator } from "./orchestrator/Orchestrator.js";
import { ExecutionReportBuilder } from "./report/ExecutionReport.js";
import { Workflow } from "./workflow/Workflow.js";

import type { IdFactory, RuntimeId } from "./types/index.js";

export { Orchestrator } from "./orchestrator/Orchestrator.js";
export type { OrchestratorDependencies } from "./orchestrator/Orchestrator.js";

export { Dispatcher } from "./dispatcher/Dispatcher.js";
export type { DispatcherOptions } from "./dispatcher/Dispatcher.js";

export { DocumentLoader } from "./loader/DocumentLoader.js";
export type { DocumentLoaderOptions } from "./loader/DocumentLoader.js";

export { Workflow } from "./workflow/Workflow.js";
export type { WorkflowOptions } from "./workflow/Workflow.js";

export { ExecutionReportBuilder } from "./report/ExecutionReport.js";
export type { ExecutionReportBuilderOptions } from "./report/ExecutionReport.js";

export type {
  AgentAssignment,
  AgentDescriptor,
  DispatcherPort,
  DocumentLoaderPort,
  ExecutionReport,
  ExecutionReportBuilderPort,
  IdFactory,
  LoadedDocument,
  RuntimeEvent,
  RuntimeId,
  RuntimeRequest,
  TaskRecord,
  TaskState,
  WorkflowPort,
  WorkPackage
} from "./types/index.js";

/**
 * Build a deterministic, in-memory identifier factory.
 *
 * The counter lives inside the closure so separate factories never share state.
 * Determinism keeps runtime output predictable for tests and command-line use.
 */
export function createSequentialIdFactory(): IdFactory {
  let nextId = 1;

  return (prefix: string): RuntimeId => {
    const id = `${prefix}-${nextId.toString()}`;
    nextId += 1;
    return id;
  };
}

/**
 * Options accepted by {@link createRuntime}.
 */
export interface CreateRuntimeOptions {
  /** Override the shared identifier factory (defaults to a sequential one). */
  readonly idFactory?: IdFactory;

  /** Base directory the document loader resolves paths against. */
  readonly baseDirectory?: string;
}

/**
 * Fully wired runtime returned by {@link createRuntime}.
 *
 * The loader is intentionally exposed as a sibling of the orchestrator rather
 * than a dependency of it: document loading and execution coordination are
 * independent responsibilities that higher layers compose as needed.
 */
export interface Runtime {
  readonly orchestrator: Orchestrator;
  readonly loader: DocumentLoader;
}

/**
 * Composition root for the APOS Runtime Core.
 *
 * This is the one place that knows about every concrete module. It constructs
 * the collaborators, shares a single identifier factory across them, and injects
 * the ports into the orchestrator. Keeping composition here lets every module
 * stay unaware of the others.
 */
export function createRuntime(options: CreateRuntimeOptions = {}): Runtime {
  const idFactory = options.idFactory ?? createSequentialIdFactory();

  const dispatcher = new Dispatcher({ idFactory });
  const workflow = new Workflow({ idFactory });

  const loader = new DocumentLoader(
    options.baseDirectory === undefined
      ? {}
      : { baseDirectory: options.baseDirectory }
  );

  const orchestrator = new Orchestrator({
    idFactory,
    dispatcher,
    workflow,
    createReportBuilder: () => new ExecutionReportBuilder({ idFactory })
  });

  return { orchestrator, loader };
}
