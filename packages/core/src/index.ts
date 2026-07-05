/**
 * APOS Core Engine public API.
 *
 * This is the single entry point of `@apos/core`. It re-exports the domain
 * models, the port interfaces, and every concrete module, and it provides the
 * composition root (`createCoreEngine`) plus the {@link CoreEngine} facade that
 * coordinates the stages.
 *
 * The Core Engine is the intelligence layer of APOS. It plans, analyzes, loads
 * knowledge, generates (in memory), validates, and describes a deployment — but
 * it never writes files and never calls an LLM in this foundation.
 */
import { Analyzer } from "./analyzer/Analyzer.js";
import { DeploymentPlanner } from "./deployment/DeploymentPlanner.js";
import { Generator } from "./generator/Generator.js";
import { InMemoryVerticalPackRepository, KnowledgeBase } from "./knowledge/index.js";
import { Planner } from "./planner/Planner.js";
import { Validator } from "./validator/Validator.js";

import type {
  CoreEngineResult,
  Id,
  IdFactory,
  NaturalLanguageRequest,
  WebsiteSnapshot
} from "./models/index.js";
import type {
  AnalyzerPort,
  DeploymentPort,
  GeneratorPort,
  KnowledgePort,
  PlannerPort,
  ValidatorPort,
  VerticalPackRepository
} from "./types/index.js";

// Domain models.
export type {
  AnalysisResult,
  BusinessObject,
  ContentObject,
  CoreEngineResult,
  DeploymentPlan,
  ExecutionPlan,
  ExecutionStep,
  ExecutionStepKind,
  FileAction,
  FileOperation,
  GenerationResult,
  Id,
  IdFactory,
  NaturalLanguageRequest,
  PageDefinition,
  PageNode,
  PlanStatus,
  ValidationIssue,
  ValidationReport,
  ValidationSeverity,
  VerticalPack,
  WebsiteSnapshot
} from "./models/index.js";

// Port interfaces.
export type {
  AnalyzerPort,
  DeploymentInput,
  DeploymentPort,
  GenerationInput,
  GeneratorPort,
  KnowledgePort,
  PlannerPort,
  RequestInterpreter,
  ValidationInput,
  ValidatorPort,
  VerticalPackRepository
} from "./types/index.js";

// Concrete modules.
export { Planner } from "./planner/Planner.js";
export type { PlannerOptions } from "./planner/Planner.js";

export { Analyzer } from "./analyzer/Analyzer.js";

// APOS Knowledge Acquisition Engine (WP-005) and Vertical Pack loading (WP-003).
export {
  InMemoryVerticalPackRepository,
  KnowledgeBase,
  KnowledgeIndex,
  KnowledgeLoader,
  KnowledgeManager,
  KnowledgeRegistry,
  ProjectKnowledgeDirectorySource,
  SOURCE_PRIORITY,
  VerticalPackKnowledgeSource,
  compareSourcePriority,
  createPendingIndexEntry,
  describeSourcePriority,
  isHigherPriority
} from "./knowledge/index.js";
export type {
  ExternalKnowledgeSource,
  KnowledgeBaseOptions,
  KnowledgeDocumentRef,
  KnowledgeIndexEntry,
  KnowledgeIndexEntryStatus,
  KnowledgeIndexPort,
  KnowledgeLoaderOptions,
  KnowledgeLoaderPort,
  KnowledgeManagerOptions,
  KnowledgeRegistryPort,
  KnowledgeSource,
  KnowledgeSourceDescriptor,
  KnowledgeSourceRecord,
  KnowledgeSourceStatus,
  KnowledgeSourceType,
  LoadedKnowledgeSource,
  ProjectKnowledgeDirectorySourceOptions,
  SourcePriority,
  VerticalPackKnowledgeSourceOptions
} from "./knowledge/index.js";

export { Generator } from "./generator/Generator.js";

export { Validator } from "./validator/Validator.js";

export { DeploymentPlanner } from "./deployment/DeploymentPlanner.js";
export type { DeploymentPlannerOptions } from "./deployment/DeploymentPlanner.js";

// APOS Knowledge Object Model.
export {
  Article,
  Category,
  FAQ,
  Guide,
  Location,
  Object,
  ObjectRegistry,
  Procedure,
  Service
} from "./objects/index.js";
export type {
  ObjectInput,
  ObjectMetadata,
  ObjectRegistryReader,
  ObjectRelationship,
  ObjectSnapshot,
  ObjectStatus,
  ObjectTimestamps,
  ObjectValidationIssue,
  ObjectValidationResult,
  ObjectValidationSeverity
} from "./objects/index.js";

// APOS Expert Engine (WP-006): answers questions from approved knowledge only.
export {
  ConversationSession,
  ExpertEngine,
  InMemoryConversationRepository,
  clampConfidence,
  createCitation,
  createConversationContext,
  priorityForCitationSourceType
} from "./expert/index.js";
export type {
  AddMessageOptions,
  AnswerProviderInput,
  AnswerProviderPort,
  AnswerProviderResult,
  Citation,
  CitationSourceType,
  Conversation,
  ConversationContext,
  ConversationMessage,
  ConversationRepositoryPort,
  ConversationRole,
  ConversationSessionOptions,
  ConversationState,
  CreateCitationInput,
  CreateConversationContextOptions,
  ExpertEngineOptions,
  ExpertResponse,
  KnowledgeRetrievalPort
} from "./expert/index.js";

// APOS Authority Intelligence Engine (WP-007): decides whether a completed
// conversation should become a permanent Authority Asset. Never generates
// content or pages.
export {
  AuthorityIntelligenceEngine,
  ConservativeAuthorityDecisionPolicy,
  InMemoryRecommendationRepository,
  NoOpDuplicateDetector,
  SearchIntentAnalyzer,
  UnknownCoverageAnalyzer,
  ZeroAuthorityScorer,
  clampUnitInterval
} from "./intelligence/index.js";
export type {
  AuthorityDecision,
  AuthorityDecisionInput,
  AuthorityDecisionOutput,
  AuthorityDecisionPolicyPort,
  AuthorityIntelligenceEngineOptions,
  AuthorityRecommendation,
  AuthorityRecommendationEvidence,
  AuthorityScore,
  AuthorityScoreDimensions,
  AuthorityScorerPort,
  AuthorityScoringInput,
  CoverageAnalyzerPort,
  CoverageResult,
  CoverageStatus,
  DuplicateDetectionResult,
  DuplicateDetectorPort,
  DuplicateMatch,
  RecommendationRepositoryPort,
  SearchIntentAnalysis,
  SearchIntentAnalyzerOptions,
  SearchIntentClassification,
  SearchIntentClassifierPort,
  SearchIntentType
} from "./intelligence/index.js";

/**
 * The set of ports the {@link CoreEngine} coordinates.
 *
 * Declaring dependencies as ports (never concrete classes) keeps the facade
 * decoupled from every stage's implementation (Dependency Inversion).
 */
export interface CoreEngineDependencies {
  readonly planner: PlannerPort;
  readonly analyzer: AnalyzerPort;
  readonly knowledge: KnowledgePort;
  readonly generator: GeneratorPort;
  readonly validator: ValidatorPort;
  readonly deployment: DeploymentPort;
}

/**
 * Coordinates a single pass of the Core Engine over a request and a snapshot of
 * an existing site.
 *
 * Single Responsibility: the facade only sequences the stages and aggregates
 * their output. It holds no business logic, writes no files, and calls no LLM.
 * Each stage is reachable individually through the exported classes; this
 * facade exists for callers that want the whole pipeline in one call.
 */
export class CoreEngine {
  private readonly planner: PlannerPort;

  private readonly analyzer: AnalyzerPort;

  private readonly knowledge: KnowledgePort;

  private readonly generator: GeneratorPort;

  private readonly validator: ValidatorPort;

  private readonly deployment: DeploymentPort;

  public constructor(dependencies: CoreEngineDependencies) {
    this.planner = dependencies.planner;
    this.analyzer = dependencies.analyzer;
    this.knowledge = dependencies.knowledge;
    this.generator = dependencies.generator;
    this.validator = dependencies.validator;
    this.deployment = dependencies.deployment;
  }

  /**
   * Run the full pipeline and return every stage's output.
   *
   * The order mirrors the planner's pipeline: analyze the existing site, load
   * knowledge, generate in memory, validate, then describe a deployment. No
   * file is ever written.
   */
  public async execute(
    request: NaturalLanguageRequest,
    snapshot: WebsiteSnapshot
  ): Promise<CoreEngineResult> {
    const plan = this.planner.plan(request);
    const analysis = this.analyzer.analyze(snapshot);
    const pack = await this.knowledge.load(request.verticalId);
    const generation = this.generator.generate({ plan, analysis, pack });
    const validation = this.validator.validate({ plan, generation });
    const deployment = this.deployment.planDeployment({ generation, analysis });

    return { plan, analysis, pack, generation, validation, deployment };
  }
}

/**
 * Build a deterministic, in-memory identifier factory. The counter lives inside
 * the closure so separate factories never share state, keeping output
 * predictable for tests and command-line use.
 */
export function createSequentialIdFactory(): IdFactory {
  let nextId = 1;

  return (prefix: string): Id => {
    const id = `${prefix}-${nextId.toString()}`;
    nextId += 1;
    return id;
  };
}

/**
 * Default, project-agnostic mapping from a page route to a file path. Injected
 * into the deployment planner so path conventions stay out of the engine core.
 */
export function defaultRouteToPath(route: string): string {
  const trimmed = route.replace(/^\/+/, "").replace(/\/+$/, "");
  const normalized = trimmed.length === 0 ? "index" : trimmed;
  return `content/${normalized}.json`;
}

/**
 * Options for the {@link createCoreEngine} composition root.
 */
export interface CreateCoreEngineOptions {
  /** Source of Vertical Packs. Defaults to an empty in-memory repository. */
  readonly repository?: VerticalPackRepository;

  /** Shared identifier factory. Defaults to a sequential one. */
  readonly idFactory?: IdFactory;

  /** Route-to-path mapping for deployment planning. */
  readonly routeToPath?: (route: string) => string;
}

/**
 * Composition root for the Core Engine.
 *
 * This is the only place aware of every concrete module. It shares one ID
 * factory across the stages, wires the knowledge base to a pack repository, and
 * injects the ports into the {@link CoreEngine} facade. Keeping composition here
 * lets each module stay unaware of the others.
 */
export function createCoreEngine(options: CreateCoreEngineOptions = {}): CoreEngine {
  const idFactory = options.idFactory ?? createSequentialIdFactory();
  const repository = options.repository ?? new InMemoryVerticalPackRepository();
  const routeToPath = options.routeToPath ?? defaultRouteToPath;

  const planner = new Planner({ idFactory });
  const analyzer = new Analyzer();
  const knowledge = new KnowledgeBase({ repository });
  const generator = new Generator();
  const validator = new Validator();
  const deployment = new DeploymentPlanner({ idFactory, routeToPath });

  return new CoreEngine({
    planner,
    analyzer,
    knowledge,
    generator,
    validator,
    deployment
  });
}
