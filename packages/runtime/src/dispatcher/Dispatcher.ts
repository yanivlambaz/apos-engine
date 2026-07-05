import type {
  AgentAssignment,
  AgentDescriptor,
  DispatcherPort,
  IdFactory,
  WorkPackage
} from "../types/index.js";

/**
 * Options controlling how the {@link Dispatcher} generates assignment IDs.
 */
export interface DispatcherOptions {
  /** Identifier factory shared with the rest of the runtime. */
  readonly idFactory: IdFactory;
}

/**
 * Decides which agent should receive a work package.
 *
 * Single Responsibility: the dispatcher performs structural routing only. It
 * matches a work package's required capability against agent capability tags.
 * It never executes the chosen agent, constructs prompts, calls a model, or
 * applies business rules about what the capabilities mean.
 *
 * Routing is deterministic:
 *   - If the work package declares a required capability, the first agent
 *     advertising that capability is selected.
 *   - If no capability is required, the first available agent is selected.
 *   - If no agent can satisfy the request, an error is thrown so the caller can
 *     handle the gap explicitly instead of silently proceeding.
 */
export class Dispatcher implements DispatcherPort {
  private readonly idFactory: IdFactory;

  public constructor(options: DispatcherOptions) {
    this.idFactory = options.idFactory;
  }

  /** Select an agent for the work package from the supplied candidates. */
  public dispatch(
    workPackage: WorkPackage,
    agents: readonly AgentDescriptor[]
  ): AgentAssignment {
    const required = workPackage.requiredCapability;

    if (required === undefined) {
      const firstAgent = agents[0];

      if (firstAgent === undefined) {
        throw new Error(
          `Dispatcher has no candidate agents for work package: ${workPackage.id}`
        );
      }

      return this.assign(
        workPackage,
        firstAgent,
        "No capability required; selected first available agent."
      );
    }

    const matchingAgent = agents.find((agent) =>
      agent.capabilities.includes(required)
    );

    if (matchingAgent === undefined) {
      throw new Error(
        `Dispatcher found no agent with capability "${required}" for work package: ${workPackage.id}`
      );
    }

    return this.assign(
      workPackage,
      matchingAgent,
      `Matched required capability "${required}".`
    );
  }

  /** Build an immutable assignment record for the selected agent. */
  private assign(
    workPackage: WorkPackage,
    agent: AgentDescriptor,
    reason: string
  ): AgentAssignment {
    return {
      id: this.idFactory("assignment"),
      workPackageId: workPackage.id,
      agentId: agent.id,
      reason
    };
  }
}
