import type {
  DeploymentPlan,
  FileOperation,
  IdFactory,
  PageDefinition
} from "../models/index.js";
import type { DeploymentInput, DeploymentPort } from "../types/index.js";

/**
 * Options for constructing a {@link DeploymentPlanner}.
 */
export interface DeploymentPlannerOptions {
  readonly idFactory: IdFactory;

  /**
   * Pure function mapping a page route to the file path that would hold it.
   *
   * Path conventions are project-specific, so they are injected rather than
   * hardcoded. A deterministic default is provided by the composition root.
   */
  readonly routeToPath: (route: string) => string;
}

/**
 * Computes the set of file operations that *would* be applied to the project.
 *
 * Single Responsibility: this module only produces a plan. It never touches the
 * filesystem — no file is created, modified, or deleted. The plan is a pure
 * description derived by comparing generated pages against the routes the
 * analyzer found to already exist.
 *
 * Decision rule (structural, not business logic):
 *   - a generated page whose route already exists  -> "modify"
 *   - a generated page whose route does not exist   -> "create"
 */
export class DeploymentPlanner implements DeploymentPort {
  private readonly idFactory: IdFactory;

  private readonly routeToPath: (route: string) => string;

  public constructor(options: DeploymentPlannerOptions) {
    this.idFactory = options.idFactory;
    this.routeToPath = options.routeToPath;
  }

  public planDeployment(input: DeploymentInput): DeploymentPlan {
    const existingRoutes = new Set(input.analysis.existingRoutes);

    const operations: readonly FileOperation[] = input.generation.pageDefinitions.map(
      (page) => this.operationForPage(page, existingRoutes)
    );

    return {
      id: this.idFactory("deployment"),
      operations
    };
  }

  /** Derive the single file operation implied by one generated page. */
  private operationForPage(
    page: PageDefinition,
    existingRoutes: ReadonlySet<string>
  ): FileOperation {
    const exists = existingRoutes.has(page.route);

    return {
      action: exists ? "modify" : "create",
      path: this.routeToPath(page.route),
      reason: exists
        ? `Route ${page.route} already exists; page definition would update it.`
        : `Route ${page.route} is new; page definition would create it.`
    };
  }
}
