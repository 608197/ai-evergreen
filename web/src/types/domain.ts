export type Role =
  | 'app_owner'
  | 'qa_lead'
  | 'risk_approver'
  | 'data_owner'
  | 'sre'
  | 'platform_eng'
  | 'gov_audit'
  | 'executive';

export interface UserIdentity {
  id: string;
  name: string;
  role: Role;
  roleTitle: string;
  ownsOrApproves: string;
  initials: string;
  synthetic: boolean;
}

export type EventStage =
  | 'blast_radius'
  | 'plan'
  | 'results'
  | 'decision'
  | 'rollout'
  | 'record';

export type EventKind =
  | 'retirement'
  | 'upgrade'
  | 'price'
  | 'policy'
  | 'api'
  | 'availability';

export interface ChangeEvent {
  id: string;
  title: string;
  kind: EventKind;
  source: string;
  detectedAt: string;
  confidence: number;
  currentModelId: string;
  candidateModelId: string;
  deadline: string;
  stage: EventStage;
  status: 'open' | 'closed';
  correlationId: string;
  highestRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  appCount: number;
  outcomes: {
    migrate: number;
    canary: number;
    investigate: number;
    block: number;
  };
  summary: string;
  discoveryComplete: boolean;
}

export type WorkloadCriticality = 'low' | 'medium' | 'high' | 'critical';
export type WorkloadStatus = 'affected' | 'connected_not_affected' | 'unaffected';
export type OutcomeTreatment = 'migrate' | 'canary' | 'investigate' | 'block';

export interface Workload {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  criticality: WorkloadCriticality;
  workloadType: string;
  riskTier: 'Low' | 'Medium' | 'High' | 'Critical';
  riskRationale: string;
  environment: 'production' | 'staging' | 'sandbox';
  contractId: string;
  contractVersion: string;
  status: WorkloadStatus;
  connectionReason?: string;
  selectedTests: number;
  totalTests: number;
  outcome?: OutcomeTreatment;
  confidence?: number;
  kernelVerdict?: 'permit' | 'deny';
  kernelRuleId?: string;
  approvers: string[];
}

export type EvidenceClass =
  | 'runtime-observed'
  | 'configuration-declared'
  | 'code-inferred'
  | 'manually-attested'
  | 'LLM-inferred';

export type EdgeState = 'proposed' | 'confirmed' | 'overridden' | 'stale' | 'conflict';

export interface EdgeOverride {
  reason: string;
  owner: string;
  expiry: string;
  evidence: string;
}

export interface DependencyEdge {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  relationship: string;
  evidenceClass: EvidenceClass;
  confidence: number;
  lastVerified: string;
  state: EdgeState;
  isCriticalPath: boolean;
  sourceClaim?: string;
  override?: EdgeOverride;
}

export interface EvidenceEntry {
  id: string;
  eventId: string;
  ts: string;
  actorId: string;
  actorName: string;
  kind: string;
  summary: string;
  detail: string;
  hash: string;
  prevHash: string;
  injectedForDemo?: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  kind: 'decision' | 'gate' | 'rollout' | 'system';
  title: string;
  deepLink: string;
  createdAt: string;
  readAt: string | null;
  pinned: boolean;
}

export interface GateState {
  passed: boolean;
  blockingReason?: string;
  blockingCount?: number;
  actionText?: string;
  actionTarget?: string;
}

export type PlanDecision = 'include' | 'exclude' | 'proposed';
export type TestSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface PlanItem {
  id: string;
  eventId: string;
  workloadId: string;
  workloadName: string;
  testId: string;
  name: string;
  severity: TestSeverity;
  isCriticalPack: boolean;
  decision: PlanDecision;
  reasonCode?: string;
  reasonText?: string;
  provenance: 'rule-based' | 'ai-proposed' | 'human-entered';
  memoryRef?: string;
  mappedConfidence: number;
  lastRunStatus?: 'pass' | 'fail' | 'warn';
}

export interface MissingTest {
  id: string;
  eventId: string;
  workloadId: string;
  workloadName: string;
  title: string;
  gapDescription: string;
  severity: TestSeverity;
  status: 'proposed' | 'approved' | 'rejected';
  reviewerId?: string;
  reviewerName?: string;
  rationale?: string;
  provenance: 'ai-proposed' | 'human-entered';
  requiresSmeApproval: boolean;
}

export type EvaluationDimension =
  | 'deterministic'
  | 'schema'
  | 'semantic'
  | 'safety'
  | 'tool_use'
  | 'trajectory'
  | 'cost'
  | 'latency';

export type EvaluationCellStatus = 'pass' | 'warn' | 'fail' | 'na' | 'inconclusive';

export interface EvaluationCellResult {
  workloadId: string;
  workloadName: string;
  dimension: EvaluationDimension;
  status: EvaluationCellStatus;
  score?: number;
  isDeterministic: boolean;
  judgeAgreement?: {
    judgeA: number;
    judgeB: number;
    agreementStatus: 'agree' | 'disagree';
    notes: string;
  };
  caseId?: string;
}

export interface CaseComparison {
  caseId: string;
  workloadId: string;
  workloadName: string;
  dimension: EvaluationDimension;
  title: string;
  isTrajectory: boolean;
  currentTrajectory?: string[];
  candidateTrajectory?: string[];
  skippedStep?: string;
  currentResponse?: string;
  candidateResponse?: string;
  explanation: string;
  verdictNote: string;
  isDeterministicFail: boolean;
}

export interface RunManifest {
  eventId: string;
  currentModel: string;
  candidateModel: string;
  seed: number;
  duration: string;
  status: 'complete' | 'running' | 'failed';
  testsTotal: number;
  testsRun: number;
  hash: string;
}

// Phase 3: Recommendation, Approval, Rollout & Record types
export type RecommendationTreatment = 'migrate' | 'canary' | 'investigate' | 'block';
export type KernelVerdictType = 'permit' | 'deny';
export type ConfidenceTier = 'high' | 'moderate' | 'low' | 'vlow';

export interface ApproverSignoff {
  name: string;
  role: string;
  signed: boolean;
  signedAt?: string;
}

export interface Recommendation {
  id: string;
  eventId: string;
  workloadId: string;
  workloadName: string;
  treatment: RecommendationTreatment;
  confidence: number;
  confidenceTier: ConfidenceTier;
  kernelVerdict: KernelVerdictType;
  kernelRuleId?: string;
  primaryReason: string;
  unknowns: string;
  provenance: string;
  requiredApprovers: ApproverSignoff[];
  status: 'proposed' | 'approved' | 'rejected' | 'acknowledged';
  approvedBy?: string;
  approvedAt?: string;
  expansionCycle: number;
}

export interface ApprovalRecord {
  id: string;
  eventId: string;
  workloadIds: string[];
  approverId: string;
  approverName: string;
  approverRole: string;
  decision: 'approve' | 'reject' | 'more_evidence';
  scope: string;
  rationale: string;
  signedAt: string;
  expiresAt: string;
  dutyCheck: boolean;
  kernelVerdict: KernelVerdictType;
  hash: string;
}

export type LadderStep = 'shadow' | '1%' | '5%' | '25%' | '100%';
export type RolloutStatus = 'queued' | 'running' | 'held' | 'completed' | 'rolled_back' | 'aborted' | 'rollback_failed';

export interface MetricPoint {
  timestamp: string;
  value: number;
}

export interface MetricTelemetry {
  id: string;
  name: string;
  unit: string;
  current: number;
  limit: number;
  comparator: '<' | '>';
  isBreach: boolean;
  history: MetricPoint[];
}

export interface RolloutState {
  id: string;
  eventId: string;
  workloadId: string;
  workloadName: string;
  treatment: 'canary' | 'migrate';
  approvers: string[];
  currentLadderStep: LadderStep;
  status: RolloutStatus;
  dwellTimeRemaining: string;
  heldBy?: string;
  heldReason?: string;
  lkgModel: string;
  lkgConfigHash: string;
  lkgHealthy: boolean;
  recoveryTimer?: string;
  recoveryTarget: string;
  metrics: MetricTelemetry[];
  breachInfo?: {
    metric: string;
    value: number;
    limit: number;
    timestamp: string;
  };
}

// Phase 4: Tier B Screens Types (Screens 8-12)

// Screen 8: Estate Explorer types
export type EstateEntityType = 'workload' | 'model' | 'gateway' | 'prompt_template' | 'vector_store';

export interface EstateEntity {
  id: string;
  name: string;
  type: EstateEntityType;
  provider?: string;
  status: 'active' | 'retiring' | 'deprecated' | 'stale' | 'orphan';
  riskTier?: 'Critical' | 'High' | 'Medium' | 'Low';
  ownerName?: string;
  lastVerified: string;
  version?: string;
  cluster?: string;
  description?: string;
  dependentCount?: number;
}

export interface EstateFilterState {
  entityTypes: EstateEntityType[];
  relationshipTypes: string[];
  evidenceClasses: string[];
  minConfidence: number;
  staleOnly: boolean;
  snapshotId: string;
  focusType: 'all' | 'model' | 'workload' | 'condition';
  focusId?: string;
}

// Screen 9: Behavioural Contract & Proposals
export interface ContractField {
  key: string;
  label: string;
  value: string;
  group: 'purpose' | 'behaviour' | 'evidence' | 'rollback';
  versionTag?: string;
  usedByRollout?: boolean;
}

export interface BehaviouralContract {
  workloadId: string;
  version: string;
  lastReviewed: string;
  reviewDue: boolean;
  purposeAndRole: {
    primaryPurpose: string;
    businessDomain: string;
    targetAudience: string;
    criticalityTier: string;
    declaredScope: string;
  };
  allowedBehaviour: {
    inputSchema: string;
    outputSchema: string;
    allowedTools: string[];
    prohibitedTools: string[];
    deterministicInvariants: string[];
  };
  evidenceAndThresholds: {
    groundednessLimit: number;
    citationValidityLimit: number;
    latencyP95MaxMs: number;
    costPer1kBand: string;
    safetyAbstentionPolicy: string;
  };
  approvalAndRollback: {
    requiredApproverRoles: string[];
    dutySeparationRequired: boolean;
    rolloutLadderStrategy: string;
    automatedRollbackTriggers: string[];
    lastKnownGoodFallback: string;
  };
}

export interface ContractProposal {
  id: string;
  workloadId: string;
  workloadName: string;
  fromVersion: string;
  toVersion: string;
  field: string;
  fieldLabel: string;
  fromValue: string;
  toValue: string;
  reason: string;
  source: 'Memory' | 'Manual';
  proposedAt: string;
  proposedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNote?: string;
}

// Screen 10: Qualification Memory types
export interface MemoryStatSummary {
  eventsRetained: number;
  patternsDiscovered: number;
  testsReused: number;
  proposalsPending: number;
}

export interface MemoryPattern {
  id: string;
  title: string;
  description: string;
  sourceEvents: string[];
  severityCaught: 'Critical' | 'High' | 'Medium' | 'Low';
  supportingCases: string[];
  recommendation: string;
  isNew?: boolean;
}

export interface MemoryReuseLogItem {
  id: string;
  testId: string;
  testName: string;
  workloadName: string;
  sourceEventId: string;
  effortAvoided: string;
  reusedInCurrentEvent: boolean;
}

// Screen 11: Controls and Self-Governance
export interface KernelElementItem {
  id: string;
  name: string;
  description: string;
  changeControlOwner: string;
  isDeterministicOnly: boolean;
  hitCount: number;
  lastHitRule?: string;
}

export interface HardStopItem {
  id: string;
  ruleId: string;
  name: string;
  plainText: string;
  stage: string;
  outcome: 'Deny' | 'Hold' | 'Escalate';
  charterRef: string;
  owner: string;
  lastReviewed: string;
}

export interface ApprovalAuthorityItem {
  workloadType: string;
  riskTier: string;
  expiryHours: number;
  requiredRoles: string[];
  dualConfirmForRollback: boolean;
}

export interface SelfGovernanceDossier {
  workloadName: string;
  plannerModel: string;
  judgeModel: string;
  instructionsPinned: boolean;
  activePolicies: string[];
  adapters: string[];
  currentVersion: string;
  candidateVersion: string;
  qualificationProgress: string;
  checksPassed: number;
  checksTotal: number;
  recursionRuleText: string;
}

// Screen 12: Portfolio and Horizon
export interface ModelLifecycleItem {
  id: string;
  name: string;
  provider: string;
  status: 'retiring_soon' | 'price_change' | 'supported' | 'already_retired';
  milestoneDate: string;
  milestoneDescription: string;
  daysRemaining: number;
  dependentAppCount: number;
  dependentAppIds: string[];
}

export interface TechDebtMetrics {
  deprecatedModelsInUse: number;
  staleAgents90d: number;
  unsupportedTools: number;
  orphanedWorkloads: number;
  medianChangeToDecisionHours: number;
}

// Phase 5 Overlays: O3, O4, O5
export interface ManualEventPayload {
  title: string;
  kind: 'retirement' | 'upgrade' | 'price_change' | 'policy_change' | 'api_change' | 'availability';
  targetModel: string;
  provider: string;
  effectiveDate: string;
  sourceClaim: string;
  confidence: number;
  description?: string;
}

export interface HardStopState {
  isOpen: boolean;
  ruleId: string;
  ruleName: string;
  plainText: string;
  reason: string;
  eventId?: string;
  workloadId?: string;
  workloadName?: string;
  safeStatusText: string;
  nextSteps: string[];
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface GlossaryEntry {
  term: string;
  definition: string;
  category?: string;
  charterRef?: string;
}


