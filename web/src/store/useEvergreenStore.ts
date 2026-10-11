import { create } from 'zustand';
import { apiClient } from '../api/client';
import type {
  UserIdentity,
  ChangeEvent,
  EventKind,
  Workload,
  DependencyEdge,
  EvidenceEntry,
  NotificationItem,
  EventStage,
  GateState,
  EdgeOverride,
  PlanItem,
  MissingTest,
  EvaluationDimension,
  EvaluationCellResult,
  CaseComparison,
  RunManifest,
  Recommendation,
  ApprovalRecord,
  RolloutState,
  EstateEntity,
  EstateFilterState,
  BehaviouralContract,
  ContractProposal,
  MemoryPattern,
  MemoryReuseLogItem,
  KernelElementItem,
  HardStopItem,
  ApprovalAuthorityItem,
  SelfGovernanceDossier,
  ModelLifecycleItem,
  TechDebtMetrics,
  ManualEventPayload,
  HardStopState,
} from '../types/domain';
import {
  DEMO_IDENTITIES,
  INITIAL_CHANGE_EVENTS,
  INITIAL_WORKLOADS,
  INITIAL_DEPENDENCY_EDGES,
  createInitialEvidenceEntries,
  INITIAL_NOTIFICATIONS,
  INITIAL_PLAN_ITEMS,
  INITIAL_MISSING_TESTS,
  INITIAL_EVALUATION_RESULTS,
  INITIAL_CASE_COMPARISONS,
  INITIAL_RUN_MANIFEST,
  INITIAL_RECOMMENDATIONS,
  INITIAL_APPROVALS,
  INITIAL_ROLLOUTS,
  INITIAL_ESTATE_ENTITIES,
  INITIAL_CONTRACTS,
  INITIAL_CONTRACT_PROPOSALS,
  INITIAL_MEMORY_PATTERNS,
  INITIAL_MEMORY_REUSE_LOG,
  INITIAL_KERNEL_ELEMENTS,
  INITIAL_HARD_STOPS,
  INITIAL_APPROVAL_AUTHORITIES,
  INITIAL_SELF_GOVERNANCE,
  INITIAL_MODEL_LIFECYCLE,
  INITIAL_TECH_DEBT,
} from './seedData';
import { GENESIS_HASH, computeHash } from '../utils/crypto';


interface EvergreenState {
  // Current user & identities
  currentUser: UserIdentity;
  identities: UserIdentity[];
  setCurrentUser: (userId: string) => void;

  // Global UI & layout
  railCollapsed: boolean;
  setRailCollapsed: (collapsed: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  activeDrawer: {
    kind: 'evidence' | 'edge_review' | 'shortcuts' | null;
    data?: any;
  };
  openDrawer: (kind: 'evidence' | 'edge_review' | 'shortcuts', data?: any) => void;
  closeDrawer: () => void;

  // System freshness & degraded state
  isGraphStale: boolean;
  setGraphStale: (stale: boolean) => void;
  graphFreshnessLabel: string;

  // Domain Entities
  events: ChangeEvent[];
  currentEventId: string;
  setCurrentEventId: (id: string) => void;
  workloads: Workload[];
  edges: DependencyEdge[];
  evidenceChain: EvidenceEntry[];
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;

  // Phase 2 Entities: Plan, Tests, Evaluations
  planItems: PlanItem[];
  missingTests: MissingTest[];
  evaluationResults: EvaluationCellResult[];
  caseComparisons: CaseComparison[];
  runManifest: RunManifest;
  isPlanApproved: boolean;
  planApprovedAt?: string;
  planVersionHash?: string;
  isRunExecuting: boolean;
  runProgress: number;
  selectedWorkloadId: string;
  setSelectedWorkloadId: (id: string) => void;
  selectedCaseId: string;
  setSelectedCaseId: (id: string) => void;
  selectedDimension: EvaluationDimension;
  setSelectedDimension: (dim: EvaluationDimension) => void;

  // Phase 3 State
  recommendations: Recommendation[];
  approvals: ApprovalRecord[];
  rollouts: RolloutState[];
  selectedRolloutWorkloadId: string;
  setSelectedRolloutWorkloadId: (id: string) => void;
  riskCalibrationTolerance: number;
  setRiskCalibrationTolerance: (tolerance: number) => void;
  isCalibrationActive: boolean;
  setIsCalibrationActive: (active: boolean) => void;
  evidenceChainVerified: boolean;
  evidenceBrokenIndex?: number;

  // Gate evaluation
  getGateG1: (eventId?: string) => GateState;
  getGateG2: (eventId?: string) => GateState;
  getGateG3: (eventId?: string) => GateState;
  getGateG4: (eventId?: string) => GateState;
  getGateG5: (eventId?: string) => GateState;

  // Domain Actions
  confirmEdge: (edgeId: string, actor: UserIdentity) => void;
  overrideEdge: (edgeId: string, override: EdgeOverride, actor: UserIdentity) => void;
  setEventStage: (eventId: string, stage: EventStage) => void;
  approveMissingTest: (missingTestId: string, actor: UserIdentity) => void;
  rejectMissingTest: (missingTestId: string, reason: string, actor: UserIdentity) => void;
  approvePlan: (eventId: string, actor: UserIdentity) => { success: boolean; error?: string };
  reproduceRun: (eventId: string) => void;

  // Phase 3 Actions
  approveDecisionScope: (
    eventId: string,
    workloadIds: string[],
    rationale: string,
    actor: UserIdentity
  ) => { success: boolean; error?: string };
  rejectDecision: (eventId: string, workloadId: string, reason: string, actor: UserIdentity) => void;
  acknowledgeBlock: (eventId: string, workloadId: string, actor: UserIdentity) => void;
  requestMoreEvidence: (eventId: string, workloadId: string) => void;
  holdRollout: (rolloutId: string, reason: string, actor: UserIdentity) => void;
  resumeRollout: (rolloutId: string) => void;
  triggerSeededBreach: (rolloutId: string) => void;
  restoreLkg: (rolloutId: string, requester: UserIdentity, confirmer: UserIdentity) => void;
  verifyEvidenceChain: () => { verified: boolean; brokenIndex?: number };
  reproduceRecordRun: (eventId: string) => { success: boolean; matchCount: number; totalCount: number; hash: string };
  resetScenario: () => void;

  // Phase 4: Tier B State & Actions
  estateEntities: EstateEntity[];
  estateFilter: EstateFilterState;
  setEstateFilter: (filter: Partial<EstateFilterState>) => void;
  selectedEntityId: string | null;
  setSelectedEntityId: (id: string | null) => void;
  estateActiveTab: 'graph' | 'list' | 'orphans' | 'stale' | 'conflicts';
  setEstateActiveTab: (tab: 'graph' | 'list' | 'orphans' | 'stale' | 'conflicts') => void;

  contracts: Record<string, BehaviouralContract>;
  contractProposals: ContractProposal[];
  approveContractProposal: (proposalId: string, actor: UserIdentity) => void;
  rejectContractProposal: (proposalId: string, actor: UserIdentity, reason?: string) => void;
  createContractProposal: (proposal: Omit<ContractProposal, 'id' | 'proposedAt' | 'status'>) => void;

  memoryPatterns: MemoryPattern[];
  memoryReuseLog: MemoryReuseLogItem[];
  kernelElements: KernelElementItem[];
  hardStops: HardStopItem[];
  approvalAuthorities: ApprovalAuthorityItem[];
  selfGovernance: SelfGovernanceDossier;
  modelLifecycle: ModelLifecycleItem[];
  techDebt: TechDebtMetrics;

  // Phase 5: Overlays O3, O4, O5
  isManualEventModalOpen: boolean;
  setManualEventModalOpen: (open: boolean) => void;
  logManualEvent: (payload: ManualEventPayload, actor: UserIdentity) => string;

  hardStopState: HardStopState | null;
  triggerHardStop: (data: Partial<HardStopState> & { ruleId: string; plainText: string; reason: string }) => void;
  acknowledgeHardStop: (actor: UserIdentity) => void;
  closeHardStop: () => void;

  isGlossaryPanelOpen: boolean;
  setGlossaryPanelOpen: (open: boolean) => void;
  activeGlossaryTerm: string | null;
  setActiveGlossaryTerm: (term: string | null) => void;

  // Phase 6: Demo Director & Seed Scenario
  isDemoDirectorOpen: boolean;
  setDemoDirectorOpen: (open: boolean) => void;
  demoStep: number;
  setDemoStep: (step: number) => void;
  injectFailure: (type: 'stale_graph' | 'connector_outage' | 'judge_disagreement' | 'approval_expires' | 'canary_degrades' | 'rollback_fails' | 'evidence_integrity_fails' | 'kernel_unavailable') => void;

  // Backend Integration
  backendStatus: 'checking' | 'online' | 'offline';
  backendInfo?: { nodes: number; edges: number; environment: string };
  syncWithBackend: () => Promise<void>;
}


export const useEvergreenStore = create<EvergreenState>((set, get) => ({
  currentUser: DEMO_IDENTITIES[0], // Asha Rao
  identities: DEMO_IDENTITIES,
  setCurrentUser: (userId: string) => {
    const found = DEMO_IDENTITIES.find((u) => u.id === userId);
    if (found) {
      set({ currentUser: found });
    }
  },

  railCollapsed: false,
  setRailCollapsed: (collapsed: boolean) => set({ railCollapsed: collapsed }),

  commandPaletteOpen: false,
  setCommandPaletteOpen: (open: boolean) => set({ commandPaletteOpen: open }),

  activeDrawer: { kind: null },
  openDrawer: (kind, data) => set({ activeDrawer: { kind, data } }),
  closeDrawer: () => set({ activeDrawer: { kind: null } }),

  isGraphStale: false,
  setGraphStale: (stale: boolean) => set({ isGraphStale: stale }),
  graphFreshnessLabel: 'Graph fresh 2 min ago',

  events: INITIAL_CHANGE_EVENTS,
  currentEventId: 'E-2026-001',
  setCurrentEventId: (id: string) => set({ currentEventId: id }),
  workloads: INITIAL_WORKLOADS,
  edges: INITIAL_DEPENDENCY_EDGES,
  evidenceChain: createInitialEvidenceEntries(),
  notifications: INITIAL_NOTIFICATIONS,

  // Phase 2 State
  planItems: INITIAL_PLAN_ITEMS,
  missingTests: INITIAL_MISSING_TESTS,
  evaluationResults: INITIAL_EVALUATION_RESULTS,
  caseComparisons: INITIAL_CASE_COMPARISONS,
  runManifest: INITIAL_RUN_MANIFEST,
  isPlanApproved: false,
  planApprovedAt: undefined,
  planVersionHash: undefined,
  isRunExecuting: false,
  runProgress: 100,
  selectedWorkloadId: 'app-refund',
  setSelectedWorkloadId: (id: string) => set({ selectedWorkloadId: id }),
  selectedCaseId: 'c-refund-01',
  setSelectedCaseId: (id: string) => set({ selectedCaseId: id }),
  selectedDimension: 'trajectory',
  setSelectedDimension: (dim: EvaluationDimension) => set({ selectedDimension: dim }),

  // Phase 3 State
  recommendations: INITIAL_RECOMMENDATIONS,
  approvals: INITIAL_APPROVALS,
  rollouts: INITIAL_ROLLOUTS,
  selectedRolloutWorkloadId: 'app-claims',
  setSelectedRolloutWorkloadId: (id: string) => set({ selectedRolloutWorkloadId: id }),
  riskCalibrationTolerance: 50,
  setRiskCalibrationTolerance: (tolerance: number) => set({ riskCalibrationTolerance: tolerance }),
  isCalibrationActive: false,
  setIsCalibrationActive: (active: boolean) => set({ isCalibrationActive: active }),
  evidenceChainVerified: true,
  evidenceBrokenIndex: undefined,

  // Phase 4: Tier B State
  estateEntities: INITIAL_ESTATE_ENTITIES,
  estateFilter: {
    entityTypes: ['workload', 'model', 'gateway', 'prompt_template', 'vector_store'],
    relationshipTypes: [],
    evidenceClasses: [],
    minConfidence: 0.0,
    staleOnly: false,
    snapshotId: 'current',
    focusType: 'all',
  },
  setEstateFilter: (filter: Partial<EstateFilterState>) =>
    set((state) => ({ estateFilter: { ...state.estateFilter, ...filter } })),
  selectedEntityId: null,
  setSelectedEntityId: (id: string | null) => set({ selectedEntityId: id }),
  estateActiveTab: 'graph',
  setEstateActiveTab: (tab: 'graph' | 'list' | 'orphans' | 'stale' | 'conflicts') =>
    set({ estateActiveTab: tab }),

  contracts: INITIAL_CONTRACTS,
  contractProposals: INITIAL_CONTRACT_PROPOSALS,
  memoryPatterns: INITIAL_MEMORY_PATTERNS,
  memoryReuseLog: INITIAL_MEMORY_REUSE_LOG,
  kernelElements: INITIAL_KERNEL_ELEMENTS,
  hardStops: INITIAL_HARD_STOPS,
  approvalAuthorities: INITIAL_APPROVAL_AUTHORITIES,
  selfGovernance: INITIAL_SELF_GOVERNANCE,
  modelLifecycle: INITIAL_MODEL_LIFECYCLE,
  techDebt: INITIAL_TECH_DEBT,

  markNotificationRead: (id: string) => {

    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n
      ),
    }));
  },

  getGateG1: (_eventId = 'E-2026-001'): GateState => {
    const { edges, workloads } = get();
    // Critical workloads
    const criticalWorkloads = workloads.filter(
      (w) => w.status === 'affected' && (w.riskTier === 'Critical' || w.criticality === 'critical')
    );
    const criticalWorkloadIds = new Set(criticalWorkloads.map((w) => w.id));

    // Check edges on path to critical workloads
    const criticalEdges = edges.filter(
      (e) => e.isCriticalPath || criticalWorkloadIds.has(e.fromId)
    );

    const unconfirmedCriticalEdges = criticalEdges.filter(
      (e) => e.state !== 'confirmed' && e.state !== 'overridden'
    );

    const hasConflict = edges.some((e) => e.state === 'conflict');

    if (unconfirmedCriticalEdges.length > 0) {
      return {
        passed: false,
        blockingCount: unconfirmedCriticalEdges.length,
        blockingReason: `Plan is locked until ${unconfirmedCriticalEdges.length} critical edge is confirmed or overridden.`,
        actionText: 'Review edge',
        actionTarget: unconfirmedCriticalEdges[0].id,
      };
    }

    if (hasConflict) {
      return {
        passed: false,
        blockingCount: 1,
        blockingReason: 'Plan is locked until graph conflict is resolved.',
        actionText: 'Review conflict',
      };
    }

    return {
      passed: true,
    };
  },

  getGateG2: (eventId = 'E-2026-001'): GateState => {
    const { missingTests, isPlanApproved, planItems } = get();
    // 1. Pending high-risk proposed tests
    const pendingHighRisk = missingTests.filter(
      (mt) =>
        mt.eventId === eventId &&
        mt.status === 'proposed' &&
        (mt.severity === 'High' || mt.severity === 'Critical')
    );
    if (pendingHighRisk.length > 0) {
      return {
        passed: false,
        blockingCount: pendingHighRisk.length,
        blockingReason: `Plan is locked until ${pendingHighRisk.length} proposed high-risk test is reviewed.`,
        actionText: 'Review missing tests',
      };
    }

    // 2. Kernel critical pack invariant
    const criticalTests = planItems.filter((p) => p.eventId === eventId && p.isCriticalPack);
    const unincludedCritical = criticalTests.filter((p) => p.decision !== 'include');
    if (unincludedCritical.length > 0) {
      return {
        passed: false,
        blockingCount: unincludedCritical.length,
        blockingReason:
          'Kernel Hard Stop: Critical pack invariant violated. 100% of critical tests must be included.',
      };
    }

    // 3. Plan approval
    if (!isPlanApproved) {
      return {
        passed: false,
        blockingCount: 1,
        blockingReason: 'Results is locked until the plan is approved by the Test Lead.',
        actionText: 'Approve plan',
      };
    }

    return {
      passed: true,
    };
  },

  getGateG3: (_eventId = 'E-2026-001'): GateState => {
    const { runManifest, isRunExecuting } = get();
    if (isRunExecuting) {
      return {
        passed: false,
        blockingCount: 1,
        blockingReason: 'Decision is locked while qualification evaluation is executing.',
      };
    }
    if (runManifest.status !== 'complete') {
      return {
        passed: false,
        blockingCount: 1,
        blockingReason: 'Decision is locked until qualification run completes.',
      };
    }
    return {
      passed: true,
    };
  },

  getGateG4: (eventId = 'E-2026-001'): GateState => {
    const { recommendations, approvals } = get();
    const eventRecs = recommendations.filter((r) => r.eventId === eventId);
    const eventApprovals = approvals.filter((a) => a.eventId === eventId);

    // Rule 1: A signed approval must exist for at least one Migrate or Canary item
    const approvedWorkloadIds = new Set(eventApprovals.flatMap((a) => a.workloadIds));
    const approvedMigrateOrCanary = eventRecs.filter(
      (r) =>
        (r.treatment === 'migrate' || r.treatment === 'canary') &&
        (r.status === 'approved' || approvedWorkloadIds.has(r.workloadId))
    );

    if (approvedMigrateOrCanary.length === 0) {
      return {
        passed: false,
        blockingCount: 1,
        blockingReason: 'Rollout is locked until at least one Canary or Migrate item is approved.',
        actionText: 'Review recommendations',
      };
    }

    // Rule 2: Kernel must have returned Permit for all approved workloads
    const deniedApproved = approvedMigrateOrCanary.filter((r) => r.kernelVerdict === 'deny');
    if (deniedApproved.length > 0) {
      return {
        passed: false,
        blockingCount: deniedApproved.length,
        blockingReason: 'Kernel Hard Stop: Cannot promote an item with Kernel Deny.',
      };
    }

    return {
      passed: true,
    };
  },

  getGateG5: (eventId = 'E-2026-001'): GateState => {
    const { rollouts } = get();
    const eventRollouts = rollouts.filter((r) => r.eventId === eventId);
    const activeRollouts = eventRollouts.filter(
      (r) => r.status === 'running' || r.status === 'queued'
    );
    if (activeRollouts.length > 0) {
      return {
        passed: false,
        blockingCount: activeRollouts.length,
        blockingReason: 'Event stays open until every rollout is finished (completed or rolled back).',
      };
    }
    return {
      passed: true,
    };
  },

  confirmEdge: (edgeId: string, actor: UserIdentity) => {

    const state = get();
    const edge = state.edges.find((e) => e.id === edgeId);
    if (!edge) return;

    const updatedEdges = state.edges.map((e) =>
      e.id === edgeId
        ? ({
            ...e,
            state: 'confirmed' as const,
            evidenceClass: 'manually-attested' as const,
            lastVerified: 'Just now',
          })
        : e
    );

    // Compute hash chained evidence entry
    const prevEntry = state.evidenceChain[state.evidenceChain.length - 1];
    const prevHash = prevEntry ? prevEntry.hash : '0'.repeat(64);

    const newEntry: EvidenceEntry = {
      id: `ev-${Date.now()}`,
      eventId: state.currentEventId,
      ts: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.name,
      kind: 'edge_confirmed',
      summary: `Confirmed critical dependency edge: ${edge.fromName} → ${edge.toName}`,
      detail: `Attested by ${actor.name} (${actor.roleTitle}). Edge state marked confirmed; evidence class upgraded to manually-attested.`,
      prevHash,
      hash: '',
    };
    newEntry.hash = computeHash(prevHash + JSON.stringify(newEntry));

    // Check if Gate G1 is now cleared and update event
    set({
      edges: updatedEdges,
      evidenceChain: [...state.evidenceChain, newEntry],
    });
  },

  overrideEdge: (edgeId: string, override: EdgeOverride, actor: UserIdentity) => {
    const state = get();
    const edge = state.edges.find((e) => e.id === edgeId);
    if (!edge) return;

    const updatedEdges = state.edges.map((e) =>
      e.id === edgeId
        ? ({
            ...e,
            state: 'overridden' as const,
            override,
            lastVerified: 'Just now',
          })
        : e
    );

    const prevEntry = state.evidenceChain[state.evidenceChain.length - 1];
    const prevHash = prevEntry ? prevEntry.hash : '0'.repeat(64);

    const newEntry: EvidenceEntry = {
      id: `ev-${Date.now()}`,
      eventId: state.currentEventId,
      ts: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.name,
      kind: 'edge_overridden',
      summary: `Overrode dependency edge: ${edge.fromName} → ${edge.toName}`,
      detail: `Override rationale: "${override.reason}". Owner: ${override.owner}. Expiry: ${override.expiry}. Supporting evidence: ${override.evidence}.`,
      prevHash,
      hash: '',
    };
    newEntry.hash = computeHash(prevHash + JSON.stringify(newEntry));

    set({
      edges: updatedEdges,
      evidenceChain: [...state.evidenceChain, newEntry],
    });
  },

  setEventStage: (eventId: string, stage: EventStage) => {
    set((state) => ({
      events: state.events.map((e) =>
        e.id === eventId ? { ...e, stage } : e
      ),
    }));
  },

  approveMissingTest: (missingTestId: string, actor: UserIdentity) => {
    const state = get();
    const mt = state.missingTests.find((m) => m.id === missingTestId);
    if (!mt) return;

    const updatedMissing = state.missingTests.map((m) =>
      m.id === missingTestId
        ? {
            ...m,
            status: 'approved' as const,
            reviewerId: actor.id,
            reviewerName: actor.name,
          }
        : m
    );

    // Update corresponding plan item if exists
    const updatedPlanItems = state.planItems.map((p) =>
      p.workloadId === mt.workloadId && p.name.toLowerCase().includes(mt.title.toLowerCase().substring(0, 10))
        ? { ...p, decision: 'include' as const, provenance: 'human-entered' as const }
        : p
    );

    // Update workload selectedTests
    const updatedWorkloads = state.workloads.map((w) =>
      w.id === mt.workloadId ? { ...w, selectedTests: w.selectedTests + 1 } : w
    );

    const prevEntry = state.evidenceChain[state.evidenceChain.length - 1];
    const prevHash = prevEntry ? prevEntry.hash : '0'.repeat(64);
    const newEntry: EvidenceEntry = {
      id: `ev-${Date.now()}`,
      eventId: mt.eventId,
      ts: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.name,
      kind: 'missing_test_approved',
      summary: `Approved candidate test: "${mt.title}" for ${mt.workloadName}`,
      detail: `Coverage gap verified by ${actor.name} (${actor.roleTitle}): "${mt.gapDescription}". Added to active qualification regression scope.`,
      prevHash,
      hash: '',
    };
    newEntry.hash = computeHash(prevHash + JSON.stringify(newEntry));

    set({
      missingTests: updatedMissing,
      planItems: updatedPlanItems,
      workloads: updatedWorkloads,
      evidenceChain: [...state.evidenceChain, newEntry],
    });
  },

  rejectMissingTest: (missingTestId: string, reason: string, actor: UserIdentity) => {
    const state = get();
    const mt = state.missingTests.find((m) => m.id === missingTestId);
    if (!mt) return;

    const updatedMissing = state.missingTests.map((m) =>
      m.id === missingTestId
        ? {
            ...m,
            status: 'rejected' as const,
            reviewerId: actor.id,
            reviewerName: actor.name,
            rationale: reason,
          }
        : m
    );

    const updatedPlanItems = state.planItems.map((p) =>
      p.workloadId === mt.workloadId && p.name.toLowerCase().includes(mt.title.toLowerCase().substring(0, 10))
        ? {
            ...p,
            decision: 'exclude' as const,
            reasonCode: 'LOW_RISK_REDUNDANT',
            reasonText: reason,
          }
        : p
    );

    const prevEntry = state.evidenceChain[state.evidenceChain.length - 1];
    const prevHash = prevEntry ? prevEntry.hash : '0'.repeat(64);
    const newEntry: EvidenceEntry = {
      id: `ev-${Date.now()}`,
      eventId: mt.eventId,
      ts: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.name,
      kind: 'missing_test_rejected',
      summary: `Rejected candidate test: "${mt.title}" for ${mt.workloadName}`,
      detail: `Rejection rationale recorded by ${actor.name}: "${reason}". Test excluded from active scope.`,
      prevHash,
      hash: '',
    };
    newEntry.hash = computeHash(prevHash + JSON.stringify(newEntry));

    set({
      missingTests: updatedMissing,
      planItems: updatedPlanItems,
      evidenceChain: [...state.evidenceChain, newEntry],
    });
  },

  approvePlan: (eventId: string, actor: UserIdentity) => {
    const state = get();
    // Validate role: QA / Test Lead or Risk Approver required
    if (actor.role !== 'qa_lead' && actor.role !== 'risk_approver') {
      return {
        success: false,
        error: 'Approve is available to a Test Lead once all proposed high-risk tests are reviewed.',
      };
    }


    // Check pending high-risk tests
    const pendingHighRisk = state.missingTests.filter(
      (mt) =>
        mt.eventId === eventId &&
        mt.status === 'proposed' &&
        (mt.severity === 'High' || mt.severity === 'Critical')
    );
    if (pendingHighRisk.length > 0) {
      return {
        success: false,
        error: `Cannot approve plan: ${pendingHighRisk.length} high-risk proposed test awaits SME review.`,
      };
    }

    // Validate Kernel critical pack invariant
    const criticalTests = state.planItems.filter((p) => p.eventId === eventId && p.isCriticalPack);
    const unincludedCritical = criticalTests.filter((p) => p.decision !== 'include');
    if (unincludedCritical.length > 0) {
      return {
        success: false,
        error: 'Kernel Hard Stop: Critical pack invariant violated. All critical tests must be included.',
      };
    }

    const planHash = computeHash(`plan-v1-${eventId}-${Date.now()}`);
    const prevEntry = state.evidenceChain[state.evidenceChain.length - 1];
    const prevHash = prevEntry ? prevEntry.hash : '0'.repeat(64);

    const newEntry: EvidenceEntry = {
      id: `ev-${Date.now()}`,
      eventId,
      ts: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.name,
      kind: 'plan_approved',
      summary: `Approved proportionate regression plan (${planHash.substring(0, 12)}...)`,
      detail: `Approved by ${actor.name} (${actor.roleTitle}). 134 of 480 tests selected (72% scope reduction). Critical pack 100% verified by Kernel.`,
      prevHash,
      hash: '',
    };
    newEntry.hash = computeHash(prevHash + JSON.stringify(newEntry));

    // Update event stage to 'results'
    const updatedEvents = state.events.map((e) =>
      e.id === eventId ? { ...e, stage: 'results' as const } : e
    );

    set({
      isPlanApproved: true,
      planApprovedAt: new Date().toISOString(),
      planVersionHash: planHash,
      events: updatedEvents,
      evidenceChain: [...state.evidenceChain, newEntry],
    });

    return { success: true };
  },

  reproduceRun: (eventId: string) => {
    const state = get();
    const newHash = computeHash(`manifest-reproduce-${eventId}-${Date.now()}`);
    const prevEntry = state.evidenceChain[state.evidenceChain.length - 1];
    const prevHash = prevEntry ? prevEntry.hash : '0'.repeat(64);

    const newEntry: EvidenceEntry = {
      id: `ev-${Date.now()}`,
      eventId,
      ts: new Date().toISOString(),
      actorId: state.currentUser.id,
      actorName: state.currentUser.name,
      kind: 'run_reproduced',
      summary: `Reproduced evaluation run from manifest (seed ${INITIAL_RUN_MANIFEST.seed})`,
      detail: `Executed deterministic differential replay. Verified 100% result fidelity with zero variance. Manifest hash: ${newHash.substring(0, 16)}...`,
      prevHash,
      hash: '',
    };
    newEntry.hash = computeHash(prevHash + JSON.stringify(newEntry));

    set({
      runManifest: {
        ...state.runManifest,
        hash: newHash,
      },
      evidenceChain: [...state.evidenceChain, newEntry],
    });
  },

  approveDecisionScope: (
    eventId: string,
    workloadIds: string[],
    rationale: string,
    actor: UserIdentity
  ) => {
    const state = get();
    const eventRecs = state.recommendations.filter(
      (r) => r.eventId === eventId && workloadIds.includes(r.workloadId)
    );

    // Inviolable Rule: Kernel DENY cannot be approved by anyone, ever
    const blockedItems = eventRecs.filter((r) => r.kernelVerdict === 'deny');
    if (blockedItems.length > 0) {
      return {
        success: false,
        error: `Kernel Hard Stop: ${blockedItems.map((b) => b.workloadName).join(', ')} has Kernel DENY and cannot be approved.`,
      };
    }

    const now = new Date().toISOString();
    const expiry = new Date(Date.now() + 8 * 3600 * 1000).toISOString();
    const approvedNames = eventRecs.map((r) => r.workloadName);

    // Create Approval record with SHA-256
    const approvalHash = computeHash(`approval-${eventId}-${workloadIds.join(',')}-${now}`);
    const approvalRecord: ApprovalRecord = {
      id: `appr-${Date.now()}`,
      eventId,
      workloadIds,
      approverId: actor.id,
      approverName: actor.name,
      approverRole: actor.roleTitle,
      decision: 'approve',
      scope: approvedNames.join(', '),
      rationale,
      signedAt: now,
      expiresAt: expiry,
      dutyCheck: true,
      kernelVerdict: 'permit',
      hash: approvalHash,
    };

    // Update recommendation statuses
    const updatedRecommendations = state.recommendations.map((r) => {
      if (r.eventId === eventId && workloadIds.includes(r.workloadId)) {
        return {
          ...r,
          status: 'approved' as const,
          approvedBy: actor.name,
          approvedAt: now,
        };
      }
      return r;
    });

    // Write to immutable evidence chain
    const prevEntry = state.evidenceChain[state.evidenceChain.length - 1];
    const prevHash = prevEntry ? prevEntry.hash : GENESIS_HASH;
    const newEntry: EvidenceEntry = {
      id: `ev-${Date.now()}`,
      eventId,
      ts: now,
      actorId: actor.id,
      actorName: actor.name,
      kind: 'approval',
      summary: `Signed promotion approval for ${workloadIds.length} workloads: ${approvedNames.join(', ')}`,
      detail: `Approved by ${actor.name} (${actor.roleTitle}). Scope: ${approvedNames.join(', ')}. Rationale: "${rationale}". Expires: ${expiry}.`,
      prevHash,
      hash: '',
    };
    newEntry.hash = computeHash(prevHash + JSON.stringify(newEntry));

    // Update or add rollouts
    const updatedRollouts = [...state.rollouts];
    workloadIds.forEach((wId) => {
      const rec = eventRecs.find((r) => r.workloadId === wId);
      if (rec && !updatedRollouts.some((ro) => ro.workloadId === wId)) {
        updatedRollouts.push({
          id: `rollout-${wId}`,
          eventId,
          workloadId: wId,
          workloadName: rec.workloadName,
          treatment: rec.treatment as 'canary' | 'migrate',
          approvers: [`${actor.name} (${actor.roleTitle})`],
          currentLadderStep: rec.treatment === 'canary' ? '5%' : '100%',
          status: rec.treatment === 'canary' ? 'running' : 'completed',
          dwellTimeRemaining: rec.treatment === 'canary' ? '06:40' : '00:00',
          lkgModel: 'Atlas-1 v1.4.2',
          lkgConfigHash: '7f3a..2c1d',
          lkgHealthy: true,
          recoveryTarget: '5 min or less (simulated)',
          metrics: [
            {
              id: `metric-lat-${wId}`,
              name: 'LATENCY p95',
              unit: 'ms',
              current: 680,
              limit: 900,
              comparator: '>',
              isBreach: false,
              history: [
                { timestamp: '10:00', value: 650 },
                { timestamp: '10:30', value: 680 },
              ],
            },
          ],
        });
      }
    });

    set({
      recommendations: updatedRecommendations,
      approvals: [...state.approvals, approvalRecord],
      rollouts: updatedRollouts,
      evidenceChain: [...state.evidenceChain, newEntry],
    });

    return { success: true };
  },

  rejectDecision: (eventId: string, workloadId: string, reason: string, actor: UserIdentity) => {
    const state = get();
    const rec = state.recommendations.find((r) => r.eventId === eventId && r.workloadId === workloadId);
    if (!rec) return;

    const now = new Date().toISOString();
    const updatedRecommendations = state.recommendations.map((r) =>
      r.id === rec.id ? { ...r, status: 'rejected' as const } : r
    );

    const prevEntry = state.evidenceChain[state.evidenceChain.length - 1];
    const prevHash = prevEntry ? prevEntry.hash : GENESIS_HASH;
    const newEntry: EvidenceEntry = {
      id: `ev-${Date.now()}`,
      eventId,
      ts: now,
      actorId: actor.id,
      actorName: actor.name,
      kind: 'decision',
      summary: `Rejected recommendation for ${rec.workloadName}`,
      detail: `Rejected by ${actor.name} (${actor.roleTitle}). Reason: "${reason}".`,
      prevHash,
      hash: '',
    };
    newEntry.hash = computeHash(prevHash + JSON.stringify(newEntry));

    set({
      recommendations: updatedRecommendations,
      evidenceChain: [...state.evidenceChain, newEntry],
    });
  },

  acknowledgeBlock: (eventId: string, workloadId: string, actor: UserIdentity) => {
    const state = get();
    const rec = state.recommendations.find((r) => r.eventId === eventId && r.workloadId === workloadId);
    if (!rec) return;

    const now = new Date().toISOString();
    const updatedRecommendations = state.recommendations.map((r) =>
      r.id === rec.id ? { ...r, status: 'acknowledged' as const } : r
    );

    const prevEntry = state.evidenceChain[state.evidenceChain.length - 1];
    const prevHash = prevEntry ? prevEntry.hash : GENESIS_HASH;
    const newEntry: EvidenceEntry = {
      id: `ev-${Date.now()}`,
      eventId,
      ts: now,
      actorId: actor.id,
      actorName: actor.name,
      kind: 'decision',
      summary: `Acknowledged Block for ${rec.workloadName} (Kernel DENY ${rec.kernelRuleId || 'K-014'})`,
      detail: `Owner acknowledgment recorded by ${actor.name} (${actor.roleTitle}). Workload remains blocked from deployment.`,
      prevHash,
      hash: '',
    };
    newEntry.hash = computeHash(prevHash + JSON.stringify(newEntry));

    set({
      recommendations: updatedRecommendations,
      evidenceChain: [...state.evidenceChain, newEntry],
    });
  },

  requestMoreEvidence: (eventId: string, workloadId: string) => {
    const state = get();
    const rec = state.recommendations.find((r) => r.eventId === eventId && r.workloadId === workloadId);
    if (!rec || rec.expansionCycle >= 2) return;

    const nextCycle = rec.expansionCycle + 1;
    const now = new Date().toISOString();

    const updatedRecommendations = state.recommendations.map((r) =>
      r.id === rec.id ? { ...r, expansionCycle: nextCycle } : r
    );

    const prevEntry = state.evidenceChain[state.evidenceChain.length - 1];
    const prevHash = prevEntry ? prevEntry.hash : GENESIS_HASH;
    const newEntry: EvidenceEntry = {
      id: `ev-${Date.now()}`,
      eventId,
      ts: now,
      actorId: state.currentUser.id,
      actorName: state.currentUser.name,
      kind: 'evidence',
      summary: `Requested evidence expansion cycle ${nextCycle} of 2 for ${rec.workloadName}`,
      detail: `Dispatched 12 extra targeted probe tests to resolve evaluator discordance. Maximum expansion allowance: 2 cycles.`,
      prevHash,
      hash: '',
    };
    newEntry.hash = computeHash(prevHash + JSON.stringify(newEntry));

    set({
      recommendations: updatedRecommendations,
      evidenceChain: [...state.evidenceChain, newEntry],
    });
  },

  holdRollout: (rolloutId: string, reason: string, actor: UserIdentity) => {
    const state = get();
    const now = new Date().toISOString();
    const updatedRollouts = state.rollouts.map((ro) =>
      ro.id === rolloutId
        ? {
            ...ro,
            status: 'held' as const,
            heldBy: `${actor.name} (${actor.roleTitle})`,
            heldReason: reason,
          }
        : ro
    );

    const ro = state.rollouts.find((r) => r.id === rolloutId);
    const prevEntry = state.evidenceChain[state.evidenceChain.length - 1];
    const prevHash = prevEntry ? prevEntry.hash : GENESIS_HASH;
    const newEntry: EvidenceEntry = {
      id: `ev-${Date.now()}`,
      eventId: ro?.eventId || 'E-2026-001',
      ts: now,
      actorId: actor.id,
      actorName: actor.name,
      kind: 'rollout',
      summary: `Held rollout for ${ro?.workloadName || 'workload'}`,
      detail: `Traffic held at current step by ${actor.name} (${actor.roleTitle}). Reason: "${reason}".`,
      prevHash,
      hash: '',
    };
    newEntry.hash = computeHash(prevHash + JSON.stringify(newEntry));

    set({
      rollouts: updatedRollouts,
      evidenceChain: [...state.evidenceChain, newEntry],
    });
  },

  resumeRollout: (rolloutId: string) => {
    const state = get();
    const updatedRollouts = state.rollouts.map((ro) =>
      ro.id === rolloutId
        ? {
            ...ro,
            status: 'running' as const,
            heldBy: undefined,
            heldReason: undefined,
          }
        : ro
    );
    set({ rollouts: updatedRollouts });
  },

  triggerSeededBreach: (rolloutId: string) => {
    const state = get();
    const now = new Date().toISOString();
    const ro = state.rollouts.find((r) => r.id === rolloutId);
    if (!ro) return;

    // Mutate metric Groundedness to 0.71 (breaching 0.85 limit)
    const updatedRollouts = state.rollouts.map((item) => {
      if (item.id === rolloutId) {
        return {
          ...item,
          status: 'rolled_back' as const,
          recoveryTimer: '02:14',
          dwellTimeRemaining: '00:00',
          breachInfo: {
            metric: 'GROUNDEDNESS',
            value: 0.71,
            limit: 0.85,
            timestamp: new Date().toLocaleTimeString(),
          },
          metrics: item.metrics.map((m) => {
            if (m.name === 'GROUNDEDNESS') {
              return {
                ...m,
                current: 0.71,
                isBreach: true,
                history: [...m.history, { timestamp: '10:45', value: 0.71 }],
              };
            }
            return m;
          }),
        };
      }
      return item;
    });

    // Record SHA-256 evidence entry
    const prevEntry = state.evidenceChain[state.evidenceChain.length - 1];
    const prevHash = prevEntry ? prevEntry.hash : GENESIS_HASH;
    const newEntry: EvidenceEntry = {
      id: `ev-${Date.now()}`,
      eventId: ro.eventId,
      ts: now,
      actorId: 'system',
      actorName: 'Rollback Controller',
      kind: 'rollout',
      summary: `Rolled back ${ro.workloadName} (groundedness 0.71 < limit 0.85)`,
      detail: `Automated rollback triggered within pre-authorised threshold policy. Restored last-known-good ${ro.lkgModel} (config ${ro.lkgConfigHash}). Recovery time: 2m 14s.`,
      prevHash,
      hash: '',
    };
    newEntry.hash = computeHash(prevHash + JSON.stringify(newEntry));

    // Pinned notification
    const rollbackNotification: NotificationItem = {
      id: `notif-breach-${Date.now()}`,
      userId: state.currentUser.id,
      kind: 'rollout',
      title: `Rollback: Groundedness breached limit on ${ro.workloadName} (0.71 < 0.85). Restored LKG Atlas-1 v1.4.2 in 2m 14s.`,
      deepLink: `/events/${ro.eventId}/rollout`,
      createdAt: new Date().toISOString(),
      readAt: null,
      pinned: true,
    };

    set({
      rollouts: updatedRollouts,
      evidenceChain: [...state.evidenceChain, newEntry],
      notifications: [rollbackNotification, ...state.notifications],
    });
  },

  restoreLkg: (rolloutId: string, requester: UserIdentity, confirmer: UserIdentity) => {
    const state = get();
    const now = new Date().toISOString();
    const ro = state.rollouts.find((r) => r.id === rolloutId);
    if (!ro) return;

    const updatedRollouts = state.rollouts.map((item) =>
      item.id === rolloutId
        ? {
            ...item,
            status: 'rolled_back' as const,
            recoveryTimer: '01:45',
            dwellTimeRemaining: '00:00',
          }
        : item
    );

    const prevEntry = state.evidenceChain[state.evidenceChain.length - 1];
    const prevHash = prevEntry ? prevEntry.hash : GENESIS_HASH;
    const newEntry: EvidenceEntry = {
      id: `ev-${Date.now()}`,
      eventId: ro.eventId,
      ts: now,
      actorId: requester.id,
      actorName: `${requester.name} & ${confirmer.name}`,
      kind: 'rollout',
      summary: `Manual dual-confirmed rollback of ${ro.workloadName}`,
      detail: `Manual restore executed by ${requester.name} (${requester.roleTitle}) and confirmed by ${confirmer.name} (${confirmer.roleTitle}). Traffic restored to LKG ${ro.lkgModel}.`,
      prevHash,
      hash: '',
    };
    newEntry.hash = computeHash(prevHash + JSON.stringify(newEntry));

    set({
      rollouts: updatedRollouts,
      evidenceChain: [...state.evidenceChain, newEntry],
    });
  },

  verifyEvidenceChain: () => {
    const { evidenceChain } = get();
    if (evidenceChain.length === 0) return { verified: true };

    for (let i = 0; i < evidenceChain.length; i++) {
      const entry = evidenceChain[i];
      const expectedPrevHash = i === 0 ? GENESIS_HASH : evidenceChain[i - 1].hash;
      if (entry.prevHash !== expectedPrevHash) {
        set({ evidenceChainVerified: false, evidenceBrokenIndex: i });
        return { verified: false, brokenIndex: i };
      }
      const entryClean = { ...entry, hash: '' };
      const computed = computeHash(entry.prevHash + JSON.stringify(entryClean));
      if (entry.hash !== computed) {
        set({ evidenceChainVerified: false, evidenceBrokenIndex: i });
        return { verified: false, brokenIndex: i };
      }
    }

    set({ evidenceChainVerified: true, evidenceBrokenIndex: undefined });
    return { verified: true };
  },

  reproduceRecordRun: (eventId: string) => {
    const state = get();
    const now = new Date().toISOString();
    const prevEntry = state.evidenceChain[state.evidenceChain.length - 1];
    const prevHash = prevEntry ? prevEntry.hash : GENESIS_HASH;

    const newEntry: EvidenceEntry = {
      id: `ev-rep-${Date.now()}`,
      eventId,
      ts: now,
      actorId: state.currentUser.id,
      actorName: state.currentUser.name,
      kind: 'evidence',
      summary: `Reproduced run from manifest: 6 of 6 recommendations match`,
      detail: `Deterministic replay executed. Manifest hash: ${state.runManifest.hash.substring(0, 16)}... Zero variance across all 6 applications.`,
      prevHash,
      hash: '',
    };
    newEntry.hash = computeHash(prevHash + JSON.stringify(newEntry));

    set({
      evidenceChain: [...state.evidenceChain, newEntry],
    });

    return {
      success: true,
      matchCount: 6,
      totalCount: 6,
      hash: state.runManifest.hash,
    };
  },

  // Phase 4: Tier B Actions
  approveContractProposal: (proposalId: string, actor: UserIdentity) => {
    const state = get();
    const proposal = state.contractProposals.find((p) => p.id === proposalId);
    if (!proposal) return;

    const contract = state.contracts[proposal.workloadId];
    const newVersion = proposal.toVersion;
    const now = new Date().toISOString();

    const updatedContracts = { ...state.contracts };
    if (contract) {
      updatedContracts[proposal.workloadId] = {
        ...contract,
        version: newVersion,
        lastReviewed: now.substring(0, 10),
        reviewDue: false,
      };
    }

    const prevEntry = state.evidenceChain[state.evidenceChain.length - 1];
    const prevHash = prevEntry ? prevEntry.hash : GENESIS_HASH;
    const newEntry: EvidenceEntry = {
      id: `ev-prop-app-${Date.now()}`,
      eventId: state.currentEventId,
      ts: now,
      actorId: actor.id,
      actorName: actor.name,
      kind: 'approval',
      summary: `Approved contract proposal for ${proposal.workloadName} (${proposal.fromVersion} -> ${newVersion})`,
      detail: `Field '${proposal.fieldLabel}' updated to '${proposal.toValue}'. Reason: ${proposal.reason}`,
      prevHash,
      hash: '',
    };
    newEntry.hash = computeHash(prevHash + JSON.stringify(newEntry));

    set({
      contracts: updatedContracts,
      contractProposals: state.contractProposals.map((p) =>
        p.id === proposalId ? { ...p, status: 'approved' } : p
      ),
      evidenceChain: [...state.evidenceChain, newEntry],
    });
  },

  rejectContractProposal: (proposalId: string, actor: UserIdentity, reason?: string) => {
    const state = get();
    const proposal = state.contractProposals.find((p) => p.id === proposalId);
    if (!proposal) return;

    const now = new Date().toISOString();
    const prevEntry = state.evidenceChain[state.evidenceChain.length - 1];
    const prevHash = prevEntry ? prevEntry.hash : GENESIS_HASH;
    const newEntry: EvidenceEntry = {
      id: `ev-prop-rej-${Date.now()}`,
      eventId: state.currentEventId,
      ts: now,
      actorId: actor.id,
      actorName: actor.name,
      kind: 'decision',
      summary: `Rejected contract proposal for ${proposal.workloadName}`,
      detail: `Proposal ${proposalId} rejected by ${actor.name}.${reason ? ` Reason: ${reason}` : ''}`,
      prevHash,
      hash: '',
    };
    newEntry.hash = computeHash(prevHash + JSON.stringify(newEntry));

    set({
      contractProposals: state.contractProposals.map((p) =>
        p.id === proposalId ? { ...p, status: 'rejected', reviewNote: reason } : p
      ),
      evidenceChain: [...state.evidenceChain, newEntry],
    });
  },

  createContractProposal: (proposalData) => {
    const state = get();
    const newProp: ContractProposal = {
      ...proposalData,
      id: `prop-${Date.now()}`,
      proposedAt: new Date().toISOString(),
      status: 'pending',
    };

    set({
      contractProposals: [newProp, ...state.contractProposals],
    });
  },

  // Phase 5 Overlays: O3, O4, O5
  isManualEventModalOpen: false,
  setManualEventModalOpen: (open: boolean) => set({ isManualEventModalOpen: open }),

  logManualEvent: (payload: ManualEventPayload, actor: UserIdentity) => {
    const state = get();
    const eventNum = state.events.length + 1;
    const newId = `E-2026-${String(eventNum).padStart(3, '0')}`;
    const nowIso = new Date().toISOString();

    let mappedKind: EventKind = 'upgrade';
    if (payload.kind === 'retirement') mappedKind = 'retirement';
    else if (payload.kind === 'price_change') mappedKind = 'price';
    else if (payload.kind === 'policy_change') mappedKind = 'policy';
    else if (payload.kind === 'api_change') mappedKind = 'api';
    else if (payload.kind === 'availability') mappedKind = 'availability';

    const newEvent: ChangeEvent = {
      id: newId,
      title: payload.title || `${payload.targetModel} ${payload.kind.replace('_', ' ')}`,
      kind: mappedKind,
      status: 'open',
      stage: 'blast_radius',
      detectedAt: nowIso,
      source: payload.sourceClaim,
      confidence: payload.confidence ?? 0.70,
      currentModelId: payload.targetModel,
      candidateModelId: `${payload.targetModel}-vNext`,
      deadline: payload.effectiveDate || '30 days',
      correlationId: `corr-${newId.toLowerCase()}`,
      highestRisk: 'High',
      appCount: 2,
      outcomes: {
        migrate: 0,
        canary: 0,
        investigate: 0,
        block: 0,
      },
      summary: `Manual event logged for ${payload.targetModel} (${payload.kind}). Provider: ${payload.provider}.`,
      discoveryComplete: false,
    };

    // Append cryptographic entry to immutable evidence ledger
    const prevEntry = state.evidenceChain[state.evidenceChain.length - 1];
    const prevHash = prevEntry ? prevEntry.hash : '0'.repeat(64);

    const newEvidenceEntry: EvidenceEntry = {
      id: `ev-${Date.now()}`,
      eventId: newId,
      ts: nowIso,
      actorId: actor.id,
      actorName: actor.name,
      kind: 'manual_event_logged',
      summary: `Manual event logged for ${payload.targetModel} (${payload.kind})`,
      detail: `Provider: ${payload.provider}. Source claim: "${payload.sourceClaim}". Initial confidence: ${payload.confidence}. Attested by ${actor.name} (${actor.roleTitle}).`,
      prevHash,
      hash: '',
    };
    newEvidenceEntry.hash = computeHash(prevHash + JSON.stringify(newEvidenceEntry));

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: actor.id,
      kind: 'system',
      title: `Manual Event Logged: ${newId} (${payload.targetModel})`,
      deepLink: `/events/${newId}/blast-radius`,
      createdAt: nowIso,
      readAt: null,
      pinned: false,
    };

    set({
      events: [newEvent, ...state.events],
      currentEventId: newId,
      evidenceChain: [...state.evidenceChain, newEvidenceEntry],
      notifications: [newNotif, ...state.notifications],
      isManualEventModalOpen: false,
    });

    return newId;
  },

  hardStopState: null,
  triggerHardStop: (data: Partial<HardStopState> & { ruleId: string; plainText: string; reason: string }) => {
    set({
      hardStopState: {
        isOpen: true,
        ruleId: data.ruleId,
        ruleName: data.ruleName || `Kernel Deterministic Invariant ${data.ruleId}`,
        plainText: data.plainText,
        reason: data.reason,
        eventId: data.eventId || get().currentEventId,
        workloadId: data.workloadId || 'app-refund',
        workloadName: data.workloadName || 'Refund Agent',
        safeStatusText: data.safeStatusText || 'No traffic has changed. Last-known-good configuration is serving.',
        nextSteps: data.nextSteps || [
          'Inspect trajectory step differences in the Results Matrix (Screen 4).',
          'Review behavioural contract threshold definitions in Workload Dossier (Screen 9).',
          'Consult the break-glass / manual intervention procedure before re-running qualification.'
        ],
        acknowledgedBy: undefined,
        acknowledgedAt: undefined,
      },
    });
  },

  acknowledgeHardStop: (actor: UserIdentity) => {
    const state = get();
    if (!state.hardStopState) return;

    const nowIso = new Date().toISOString();
    const prevEntry = state.evidenceChain[state.evidenceChain.length - 1];
    const prevHash = prevEntry ? prevEntry.hash : '0'.repeat(64);

    const newEvidenceEntry: EvidenceEntry = {
      id: `ev-hs-${Date.now()}`,
      eventId: state.hardStopState.eventId || 'E-2026-001',
      ts: nowIso,
      actorId: actor.id,
      actorName: actor.name,
      kind: 'hard_stop_acknowledged',
      summary: `Hard stop acknowledged by ${actor.name} (${actor.roleTitle}) for rule ${state.hardStopState.ruleId}`,
      detail: `Reason: ${state.hardStopState.reason}. Action: Production promotion prohibited; fail-closed enforcement active.`,
      prevHash,
      hash: '',
    };
    newEvidenceEntry.hash = computeHash(prevHash + JSON.stringify(newEvidenceEntry));

    const newNotif: NotificationItem = {
      id: `notif-hs-${Date.now()}`,
      userId: actor.id,
      kind: 'system',
      title: `Hard Stop Acknowledged: ${state.hardStopState.ruleId} (${state.hardStopState.workloadName || 'workload'})`,
      deepLink: `/events/${state.hardStopState.eventId || 'E-2026-001'}/record`,
      createdAt: nowIso,
      readAt: null,
      pinned: true,
    };

    set({
      hardStopState: {
        ...state.hardStopState,
        acknowledgedBy: actor.name,
        acknowledgedAt: nowIso,
        isOpen: false,
      },
      evidenceChain: [...state.evidenceChain, newEvidenceEntry],
      notifications: [newNotif, ...state.notifications],
    });
  },

  closeHardStop: () => {
    const current = get().hardStopState;
    if (current) {
      set({ hardStopState: { ...current, isOpen: false } });
    }
  },

  isGlossaryPanelOpen: false,
  setGlossaryPanelOpen: (open: boolean) => set({ isGlossaryPanelOpen: open }),
  activeGlossaryTerm: null,
  setActiveGlossaryTerm: (term: string | null) => {
    set({
      activeGlossaryTerm: term,
      isGlossaryPanelOpen: term !== null ? true : get().isGlossaryPanelOpen,
    });
  },

  // Phase 6: Demo Director & Seed Scenario
  isDemoDirectorOpen: false,
  setDemoDirectorOpen: (open: boolean) => set({ isDemoDirectorOpen: open }),
  demoStep: 1,
  setDemoStep: (step: number) => set({ demoStep: step }),

  injectFailure: (type) => {
    const state = get();
    const nowIso = new Date().toISOString();
    const prevEntry = state.evidenceChain[state.evidenceChain.length - 1];
    const prevHash = prevEntry ? prevEntry.hash : '0'.repeat(64);

    let summary = '';
    let detail = '';

    if (type === 'stale_graph') {
      summary = 'Injected for demo: Stale graph condition simulated';
      detail = 'Dependency graph age exceeded 24h freshness SLA. Autonomous scope reduction paused; full regression recommended.';
      set({ isGraphStale: true });
    } else if (type === 'connector_outage') {
      summary = 'Injected for demo: Connector outage simulated';
      detail = 'Telemetry gateway and CMDB connectors timed out. Failing closed with cautious inclusion of uncertain workloads.';
    } else if (type === 'judge_disagreement') {
      summary = 'Injected for demo: Judge disagreement simulated';
      detail = 'Probabilistic judge models split on Customer Chat Assistant semantic evaluation (score variance 0.42). Workload flagged for human investigation.';
    } else if (type === 'approval_expires') {
      summary = 'Injected for demo: Approval record expired';
      detail = 'Approval record reached maximum TTL without promotion. Promotion capability locked until re-signed.';
    } else if (type === 'canary_degrades') {
      summary = 'Injected for demo: Canary threshold breach simulated';
      detail = 'Candidate groundedness dropped to 0.71 (limit >= 0.85). Rollback Controller restored last-known-good configuration in 850ms.';
      state.triggerSeededBreach('ro-claims');
    } else if (type === 'rollback_fails') {
      summary = 'Injected for demo: Rollback verification failure simulated';
      detail = 'LKG instance failed health probe after canary abortion. Triggering Hard Stop Interstitial and Break-Glass Runbook BG-004.';
      state.triggerHardStop({
        ruleId: 'HS-007',
        ruleName: 'Rollback Verification Failure',
        plainText: 'A failed rollback must escalate to a break-glass / manual runbook fallback.',
        reason: 'Automated rollback did not report healthy LKG within 2 minutes.',
        workloadName: 'Claims Policy Assistant',
        nextSteps: [
          'Invoke Break-Glass Runbook BG-004: Emergency Gateway Pinning.',
          'Verify edge router state in AWS Bedrock console.',
          'Notify SRE on-call (Daniel Okafor).',
        ],
      });
    } else if (type === 'evidence_integrity_fails') {
      summary = 'Injected for demo: Evidence ledger cryptographic integrity breach';
      detail = 'Merkle hash verification detected signature mismatch at entry #2. Untrusted record.';
      const corrupted = state.evidenceChain.map((entry, idx) =>
        idx === 1 ? { ...entry, hash: 'bad0000000000000000000000000000000000000000000000000000000000000' } : entry
      );
      set({ evidenceChain: corrupted, evidenceChainVerified: false, evidenceBrokenIndex: 1 });
      state.triggerHardStop({
        ruleId: 'HS-006',
        ruleName: 'Evidence Record Tamper-Evidence Failure',
        plainText: 'A recommendation that cannot be reproduced from its stored evidence record is void.',
        reason: 'Cryptographic hash mismatch in immutable evidence chain.',
        nextSteps: [
          'Inspect cryptographic audit log in Screen 7.',
          'Isolate affected qualification pipeline instance.',
          'Re-run deterministic evaluation pipeline from signed manifest.',
        ],
      });
    } else if (type === 'kernel_unavailable') {
      summary = 'Injected for demo: Trusted Kernel outage simulated';
      detail = 'Kernel control layer heartbeat lost. All promotion actions fail closed immediately.';
      state.triggerHardStop({
        ruleId: 'HS-005',
        ruleName: 'Trusted Kernel Availability Violation',
        plainText: 'LLMs advise; deterministic policy determines allowed actions. Kernel must be online.',
        reason: 'Deterministic Trusted Kernel is unreachable.',
        nextSteps: [
          'Check Trusted Kernel service status in AWS ECS/Kubernetes.',
          'Promotions and rollbacks paused until kernel quorum restored.',
        ],
      });
    }

    const injectedEntry: EvidenceEntry = {
      id: `ev-inj-${Date.now()}`,
      eventId: state.currentEventId,
      ts: nowIso,
      actorId: state.currentUser.id,
      actorName: state.currentUser.name,
      kind: `demo_injection_${type}`,
      summary,
      detail,
      prevHash,
      hash: '',
      injectedForDemo: true,
    };
    injectedEntry.hash = computeHash(prevHash + JSON.stringify(injectedEntry));

    const notif: NotificationItem = {
      id: `notif-inj-${Date.now()}`,
      userId: state.currentUser.id,
      kind: 'system',
      title: `[DEMO INJECTION] ${summary}`,
      deepLink: `/events/${state.currentEventId}/record`,
      createdAt: nowIso,
      readAt: null,
      pinned: true,
    };

    set((s) => ({
      evidenceChain: [...s.evidenceChain, injectedEntry],
      notifications: [notif, ...s.notifications],
    }));

    // Notify backend
    apiClient.injectDemoFailure(type).catch((err) => {
      console.warn('[Evergreen] Backend injection notification:', err);
    });
  },

  backendStatus: 'checking',
  backendInfo: undefined,
  syncWithBackend: async () => {
    try {
      const health = await apiClient.checkHealth();
      if (health && health.status === 'HEALTHY') {
        set({
          backendStatus: 'online',
          backendInfo: {
            nodes: health.graph_nodes,
            edges: health.graph_edges,
            environment: health.environment,
          },
        });
        const estate = await apiClient.fetchEstate();
        if (estate && estate.summary) {
          console.info(
            `[Evergreen] Synced ${estate.summary.workloads_count} workloads & ${estate.summary.graph_edges} edges from FastAPI backend.`
          );
        }
      } else {
        set({ backendStatus: 'offline' });
      }
    } catch {
      set({ backendStatus: 'offline' });
    }
  },

  resetScenario: () => {
    set({
      events: INITIAL_CHANGE_EVENTS,
      workloads: INITIAL_WORKLOADS,
      edges: INITIAL_DEPENDENCY_EDGES,
      evidenceChain: createInitialEvidenceEntries(),
      notifications: INITIAL_NOTIFICATIONS,
      isGraphStale: false,
      graphFreshnessLabel: 'Graph fresh 2 min ago',
      currentUser: DEMO_IDENTITIES[0],
      currentEventId: 'E-2026-001',
      activeDrawer: { kind: null },
      planItems: INITIAL_PLAN_ITEMS,
      missingTests: INITIAL_MISSING_TESTS,
      evaluationResults: INITIAL_EVALUATION_RESULTS,
      caseComparisons: INITIAL_CASE_COMPARISONS,
      runManifest: INITIAL_RUN_MANIFEST,
      isPlanApproved: false,
      planApprovedAt: undefined,
      planVersionHash: undefined,
      isRunExecuting: false,
      runProgress: 100,
      selectedWorkloadId: 'app-refund',
      selectedCaseId: 'c-refund-01',
      selectedDimension: 'trajectory',
      recommendations: INITIAL_RECOMMENDATIONS,
      approvals: INITIAL_APPROVALS,
      rollouts: INITIAL_ROLLOUTS,
      selectedRolloutWorkloadId: 'app-claims',
      riskCalibrationTolerance: 50,
      isCalibrationActive: false,
      evidenceChainVerified: true,
      evidenceBrokenIndex: undefined,
      estateEntities: INITIAL_ESTATE_ENTITIES,
      estateFilter: {
        entityTypes: ['workload', 'model', 'gateway', 'prompt_template', 'vector_store'],
        relationshipTypes: [],
        evidenceClasses: [],
        minConfidence: 0.0,
        staleOnly: false,
        snapshotId: 'current',
        focusType: 'all',
      },
      selectedEntityId: null,
      estateActiveTab: 'graph',
      contracts: INITIAL_CONTRACTS,
      contractProposals: INITIAL_CONTRACT_PROPOSALS,
      memoryPatterns: INITIAL_MEMORY_PATTERNS,
      memoryReuseLog: INITIAL_MEMORY_REUSE_LOG,
      kernelElements: INITIAL_KERNEL_ELEMENTS,
      hardStops: INITIAL_HARD_STOPS,
      approvalAuthorities: INITIAL_APPROVAL_AUTHORITIES,
      selfGovernance: INITIAL_SELF_GOVERNANCE,
      modelLifecycle: INITIAL_MODEL_LIFECYCLE,
      techDebt: INITIAL_TECH_DEBT,
      isManualEventModalOpen: false,
      hardStopState: null,
      isGlossaryPanelOpen: false,
      activeGlossaryTerm: null,
      isDemoDirectorOpen: false,
      demoStep: 1,
    });
  },
}));


