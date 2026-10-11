import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ShieldAlert,
  CheckCircle,
  Lock,
  AlertTriangle,
  Check,
  X,
  Search,
} from 'lucide-react';
import { StageStepper, type StageStep } from '../../components/common/StageStepper';
import { GateBanner } from '../../components/common/GateBanner';
import { StatusChip } from '../../components/common/StatusChip';
import { ProvenanceTag } from '../../components/common/ProvenanceTag';
import { EvidenceDrawer } from '../../components/overlays/EvidenceDrawer';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import type { PlanItem, MissingTest } from '../../types/domain';
import './PlanScreen.css';


export const PlanScreen: React.FC = () => {
  const { id = 'E-2026-001' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    currentUser,
    workloads,
    planItems,
    missingTests,
    isPlanApproved,
    approveMissingTest,
    rejectMissingTest,
    approvePlan,
    getGateG2,
  } = useEvergreenStore();

  const [selectedWorkloadFilter, setSelectedWorkloadFilter] = useState<string>('all');
  const [decisionFilter, setDecisionFilter] = useState<'all' | 'include' | 'exclude' | 'proposed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [roleWarning, setRoleWarning] = useState<string | null>(null);

  // Evidence Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState<any>(null);

  const gateG2 = getGateG2(id);

  // Filter plan items
  const filteredPlanItems = planItems.filter((item) => {
    if (item.eventId !== id) return false;
    if (selectedWorkloadFilter !== 'all' && item.workloadId !== selectedWorkloadFilter) return false;
    if (decisionFilter !== 'all' && item.decision !== decisionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.testId.toLowerCase().includes(q) ||
        (item.reasonCode && item.reasonCode.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenDrawerForTest = (item: PlanItem) => {
    setDrawerData({
      type: 'test',
      title: `${item.testId}: ${item.name}`,
      workloadName: item.workloadName,
      severity: item.severity,
      reasonCode: item.reasonCode,
      reasonText: item.reasonText,
      provenance: item.provenance,
      evidenceText: item.isCriticalPack
        ? 'Critical Invariant Pack (immutable): Required by enterprise risk policy for model qualification.'
        : item.reasonText,
    });
    setDrawerOpen(true);
  };

  const handleOpenDrawerForMissing = (mt: MissingTest) => {
    setDrawerData({
      type: 'missing_test',
      missingTestId: mt.id,
      title: mt.title,
      workloadName: mt.workloadName,
      severity: mt.severity,
      gapDescription: mt.gapDescription,
      requiresSmeApproval: mt.requiresSmeApproval,
      provenance: mt.provenance,
    });
    setDrawerOpen(true);
  };

  const handleApprovePlanClick = () => {
    if (currentUser.role !== 'qa_lead' && currentUser.role !== 'risk_approver') {
      setRoleWarning(
        `Current user ${currentUser.name} has role "${currentUser.roleTitle}". Approve is reserved for QA / Test Lead (e.g. Marcus Lee). Switch identity or continue as authorized lead.`
      );
      return;
    }
    setRoleWarning(null);
    setConfirmModalOpen(true);
  };

  const handleConfirmApproval = () => {
    const res = approvePlan(id, currentUser);
    if (res.success) {
      setConfirmModalOpen(false);
      navigate(`/events/${id}/results`);
    } else {
      setRoleWarning(res.error || 'Failed to approve plan.');
      setConfirmModalOpen(false);
    }
  };

  // Pipeline stages for StageStepper
  const stages: StageStep[] = [
    {
      id: 'blast_radius',
      index: 1,
      name: 'Blast Radius',
      state: 'complete',
    },
    {
      id: 'plan',
      index: 2,
      name: 'Regression Plan',
      state: 'current',
    },
    {
      id: 'results',
      index: 3,
      name: 'Results & Matrix',
      state: isPlanApproved ? 'available' : 'locked',
      lockReason: !isPlanApproved ? 'Locked until plan is approved' : undefined,
    },
    {
      id: 'decision',
      index: 4,
      name: 'Decision & Approval',
      state: 'locked',
      lockReason: 'Requires evaluation completion',
    },
    {
      id: 'rollout',
      index: 5,
      name: 'Rollout & Canary',
      state: 'locked',
      lockReason: 'Requires signed human approval',
    },
    {
      id: 'record',
      index: 6,
      name: 'Qualification Record',
      state: 'locked',
      lockReason: 'Finalized upon closure',
    },
  ];

  return (
    <div className="plan-screen">
      {/* Top Header */}
      <div className="plan-header">
        <div className="plan-header-main">
          <div className="plan-breadcrumbs">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{id}</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Proportionate Scope</span>
          </div>

          <div className="plan-title-row">
            <div>
              <div className="plan-tag-strip">
                <span className="plan-event-badge">EVENT {id}</span>
                <span className="plan-scope-badge">72% SCOPE REDUCTION</span>
              </div>
              <h1 className="plan-title">Atlas-1 Retirement · Proportionate Regression Scope</h1>
            </div>

            <div className="plan-actions">
              <button
                type="button"
                className="plan-approve-btn"
                disabled={!gateG2.passed && !isPlanApproved && gateG2.actionText !== 'Approve plan'}
                onClick={handleApprovePlanClick}
              >
                {isPlanApproved ? (
                  <>
                    <CheckCircle size={16} />
                    Plan Approved (View Results)
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Approve plan
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stat Summary Bar */}
          <div className="plan-stat-bar">
            <div className="stat-pill">
              <span className="stat-val">134 of 480</span>
              <span className="stat-label">tests selected (illustrative)</span>
            </div>
            <span className="stat-divider">•</span>
            <div className="stat-pill">
              <Lock size={13} className="text-brand" />
              <span className="stat-val">100%</span>
              <span className="stat-label">Critical pack included (immutable)</span>
            </div>
            <span className="stat-divider">•</span>
            <div className="stat-pill">
              <span className="stat-val">4m 12s</span>
              <span className="stat-label">estimated evaluation duration</span>
            </div>
          </div>
        </div>

        {/* 6-Stage Stepper */}
        <StageStepper
          stages={stages}
          currentStageId="plan"
          onSelectStage={(stageId) => {
            if (stageId === 'blast_radius') navigate(`/events/${id}/blast-radius`);
            if (stageId === 'results' && isPlanApproved) navigate(`/events/${id}/results`);
          }}
        />
      </div>

      {/* Role Warning Banner */}
      {roleWarning && (
        <div className="plan-role-warning">
          <AlertTriangle size={16} />
          <span>{roleWarning}</span>
          <button
            type="button"
            className="warning-dismiss"
            onClick={() => setRoleWarning(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Gate G2 Banner */}
      {!gateG2.passed && (
        <div className="plan-gate-container">
          <GateBanner
            gateId="G2"
            gateName="Test Scope Approval"
            blockingCount={gateG2.blockingCount || 1}
            message={gateG2.blockingReason || 'Review pending tests'}
            actionText={gateG2.actionText || 'Review missing test'}
            onActionClick={() => {
              const pending = missingTests.find((m) => m.status === 'proposed');
              if (pending) {
                handleOpenDrawerForMissing(pending);
              }
            }}
          />
        </div>
      )}



      {/* 3-Column Plan Layout */}
      <div className="plan-content-grid">
        {/* Left Rail: Workload Filter (2.5 col) */}
        <div className="plan-rail-workloads">
          <div className="rail-header">
            <h2 className="rail-title">Affected Workloads (6)</h2>
            <span className="rail-subtitle">Scope distribution</span>
          </div>

          <div className="workload-filter-list">
            <button
              type="button"
              className={`workload-filter-item ${selectedWorkloadFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedWorkloadFilter('all')}
            >
              <div className="filter-item-info">
                <span className="filter-item-name">All Workloads</span>
                <span className="filter-item-stat">134 / 480 selected</span>
              </div>
            </button>

            {workloads
              .filter((w) => w.status === 'affected')
              .map((w) => {
                const isSelected = selectedWorkloadFilter === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    className={`workload-filter-item ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedWorkloadFilter(w.id)}
                  >
                    <div className="filter-item-info">
                      <div className="filter-item-top">
                        <span className="filter-item-name">{w.name}</span>
                        <StatusChip
                          status={w.riskTier === 'Critical' ? 'block' : 'warn'}
                          label={w.riskTier}
                          size="small"
                        />

                      </div>
                      <div className="filter-item-bottom">
                        <span className="filter-item-stat">
                          {w.selectedTests} / {w.totalTests} tests
                        </span>
                        <span className="filter-critical-badge">
                          <Lock size={10} /> 100% Critical
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Center Rail: Selected Test Suite Table (6 col) */}
        <div className="plan-rail-table">
          <div className="table-toolbar">
            <div className="search-wrap">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Search tests or reason codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="test-search-input"
              />
            </div>

            <div className="decision-filter-pills">
              <button
                type="button"
                className={`filter-pill ${decisionFilter === 'all' ? 'active' : ''}`}
                onClick={() => setDecisionFilter('all')}
              >
                All ({filteredPlanItems.length})
              </button>
              <button
                type="button"
                className={`filter-pill ${decisionFilter === 'include' ? 'active' : ''}`}
                onClick={() => setDecisionFilter('include')}
              >
                Included
              </button>
              <button
                type="button"
                className={`filter-pill ${decisionFilter === 'exclude' ? 'active' : ''}`}
                onClick={() => setDecisionFilter('exclude')}
              >
                Excluded
              </button>
              <button
                type="button"
                className={`filter-pill ${decisionFilter === 'proposed' ? 'active' : ''}`}
                onClick={() => setDecisionFilter('proposed')}
              >
                Proposed
              </button>
            </div>
          </div>

          <div className="plan-table-container">
            <table className="plan-table">
              <thead>
                <tr>
                  <th>Test Name & ID</th>
                  <th>Severity</th>
                  <th>Decision</th>
                  <th>Reason Code & Rationale</th>
                  <th>Provenance</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlanItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`plan-tr ${item.isCriticalPack ? 'tr-critical-pack' : ''}`}
                    onClick={() => handleOpenDrawerForTest(item)}
                  >
                    <td>
                      <div className="test-identity">
                        <span className="test-name">{item.name}</span>
                        <div className="test-meta">
                          <code className="test-id">{item.testId}</code>
                          <span className="test-workload-hint">{item.workloadName}</span>
                          {item.isCriticalPack && (
                            <span className="critical-lock-tag" title="Seeded Critical Invariant">
                              <Lock size={11} /> Critical Invariant [L]
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <StatusChip
                        status={item.severity === 'Critical' ? 'block' : item.severity === 'High' ? 'warn' : 'unaffected'}
                        label={item.severity}
                        size="small"
                      />
                    </td>

                    <td>
                      <span className={`decision-badge decision-${item.decision}`}>
                        {item.decision === 'include' && 'Included'}
                        {item.decision === 'exclude' && 'Excluded'}
                        {item.decision === 'proposed' && 'Proposed'}
                      </span>
                    </td>

                    <td>
                      <div className="reason-cell">
                        {item.reasonCode ? (
                          <button
                            type="button"
                            className="reason-code-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDrawerForTest(item);
                            }}
                          >
                            <code>{item.reasonCode}</code>
                          </button>
                        ) : item.isCriticalPack ? (
                          <span className="reason-immutable">MANDATORY_INVARIANT</span>
                        ) : (
                          <span className="reason-none">AI_PLANNED</span>
                        )}
                        <span className="reason-text-preview" title={item.reasonText}>
                          {item.reasonText}
                        </span>
                      </div>
                    </td>

                    <td>
                      <ProvenanceTag kind={item.provenance} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Rail: Missing Tests / Coverage Gap Panel (3.5 col) */}
        <div className="plan-rail-missing">
          <div className="missing-header">
            <div className="missing-header-title">
              <AlertTriangle size={16} className="text-amber" />
              <span>Proposed Missing Tests ({missingTests.length})</span>
            </div>
            <p className="missing-header-desc">
              Identified by differential trace analysis & enterprise organizational memory.
            </p>
          </div>

          <div className="missing-list">
            {missingTests.map((mt) => {
              const isReviewed = mt.status === 'approved' || mt.status === 'rejected';

              return (
                <div key={mt.id} className={`missing-card status-${mt.status}`}>
                  <div className="missing-card-top">
                    <span className="missing-workload">{mt.workloadName}</span>
                    <StatusChip
                      status={mt.status === 'approved' ? 'pass' : mt.status === 'rejected' ? 'na' : 'warn'}
                      label={mt.status.toUpperCase()}
                      size="small"
                    />
                  </div>


                  <h3 className="missing-title">{mt.title}</h3>
                  <p className="missing-gap-desc">{mt.gapDescription}</p>

                  <div className="missing-provenance-row">
                    <ProvenanceTag kind={mt.provenance} />
                    {mt.requiresSmeApproval && (
                      <span className="sme-req-tag">
                        <ShieldAlert size={11} /> SME Sign-off Required
                      </span>
                    )}
                  </div>

                  {!isReviewed ? (
                    <div className="missing-actions">
                      <button
                        type="button"
                        className="missing-btn reject"
                        onClick={() => {
                          const reason = prompt('Please provide rejection rationale:');
                          if (reason) rejectMissingTest(mt.id, reason, currentUser);
                        }}
                      >
                        <X size={14} /> Reject
                      </button>
                      <button
                        type="button"
                        className="missing-btn approve"
                        onClick={() => approveMissingTest(mt.id, currentUser)}
                      >
                        <Check size={14} /> Approve Test
                      </button>
                    </div>
                  ) : (
                    <div className="missing-reviewed-note">
                      <CheckCircle size={13} />
                      <span>
                        {mt.status === 'approved' ? 'Approved into scope' : 'Excluded with recorded rationale'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Plan Approval */}
      {confirmModalOpen && (
        <div className="plan-modal-backdrop" role="dialog" aria-modal="true">
          <div className="plan-modal-dialog">
            <div className="plan-modal-header">
              <h2>Approve Proportionate Regression Scope</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setConfirmModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="plan-modal-body">
              <p>
                You are about to sign off on the regression qualification scope for event{' '}
                <strong>{id}</strong> as <strong>{currentUser.name}</strong> ({currentUser.roleTitle}).
              </p>

              <div className="modal-summary-box">
                <div className="modal-summary-row">
                  <span>Selected test count:</span>
                  <strong>134 tests (72% reduction)</strong>
                </div>
                <div className="modal-summary-row">
                  <span>Excluded tests:</span>
                  <strong>346 tests (100% with machine-readable reasons)</strong>
                </div>
                <div className="modal-summary-row">
                  <span>Critical pack integrity:</span>
                  <strong className="text-pass">100% included (0 dropped)</strong>
                </div>
                <div className="modal-summary-row">
                  <span>Audit trail:</span>
                  <span>A signed SHA-256 evidence entry will be recorded</span>
                </div>
              </div>

              <div className="modal-kernel-guarantee">
                <ShieldAlert size={16} className="text-brand" />
                <span>
                  The Trusted Kernel has verified that all critical enterprise invariants are included.
                  Evaluation execution will proceed on approval.
                </span>
              </div>
            </div>

            <div className="plan-modal-footer">
              <button
                type="button"
                className="modal-btn cancel"
                onClick={() => setConfirmModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-btn confirm"
                onClick={handleConfirmApproval}
              >
                Sign and Lock Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Drawer Overlay (O1) */}
      <EvidenceDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        data={drawerData}
      />
    </div>
  );
};
