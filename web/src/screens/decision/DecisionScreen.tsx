import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import { StageStepper, type StageStep } from '../../components/common/StageStepper';
import { GateBanner } from '../../components/common/GateBanner';
import { StatusChip } from '../../components/common/StatusChip';
import { ApprovalPanel } from '../../components/decision/ApprovalPanel';
import { ApprovalModal } from '../../components/overlays/ApprovalModal';
import './DecisionScreen.css';

export const DecisionScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentEventId,
    currentUser,
    recommendations,
    workloads,
    getGateG3,
    getGateG4,
    acknowledgeBlock,
    requestMoreEvidence,
    riskCalibrationTolerance,
    setRiskCalibrationTolerance,
    isCalibrationActive,
    setIsCalibrationActive,
    triggerHardStop,
  } = useEvergreenStore();

  const [selectedWorkloadIds, setSelectedWorkloadIds] = useState<string[]>([]);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  const gateG3 = getGateG3(currentEventId);
  const gateG4 = getGateG4(currentEventId);

  const stages: StageStep[] = [
    { id: 'blast_radius', index: 1, name: 'Blast Radius', state: 'complete' },
    { id: 'plan', index: 2, name: 'Regression Plan', state: 'complete' },
    { id: 'results', index: 3, name: 'Results & Matrix', state: 'complete' },
    { id: 'decision', index: 4, name: 'Decision & Approval', state: 'current' },
    {
      id: 'rollout',
      index: 5,
      name: 'Rollout & Canary',
      state: gateG4.passed ? 'available' : 'locked',
      lockReason: !gateG4.passed ? 'Requires signed promotion approval' : undefined,
    },
    {
      id: 'record',
      index: 6,
      name: 'Qualification Record',
      state: 'available',
    },
  ];

  const handleSelectStage = (stageId: string) => {
    if (stageId === 'blast_radius') navigate(`/events/${currentEventId}/blast-radius`);
    else if (stageId === 'plan') navigate(`/events/${currentEventId}/plan`);
    else if (stageId === 'results') navigate(`/events/${currentEventId}/results`);
    else if (stageId === 'decision') navigate(`/events/${currentEventId}/decision`);
    else if (stageId === 'rollout') {
      if (gateG4.passed) navigate(`/events/${currentEventId}/rollout`);
    } else if (stageId === 'record') navigate(`/events/${currentEventId}/record`);
  };

  const eventRecs = recommendations.filter((r) => r.eventId === currentEventId);

  // Group by strict specification order: Block, Investigate, Canary, Migrate
  const blockRecs = eventRecs.filter((r) => r.treatment === 'block');
  const investigateRecs = eventRecs.filter((r) => r.treatment === 'investigate');
  const canaryRecs = eventRecs.filter((r) => r.treatment === 'canary');
  const migrateRecs = eventRecs.filter((r) => r.treatment === 'migrate');

  const orderedRecs = [...blockRecs, ...investigateRecs, ...canaryRecs, ...migrateRecs];

  const handleToggleSelect = (workloadId: string) => {
    setSelectedWorkloadIds((prev) =>
      prev.includes(workloadId) ? prev.filter((id) => id !== workloadId) : [...prev, workloadId]
    );
  };

  return (
    <div className="decision-screen">
      {/* Stage Stepper */}
      <StageStepper
        stages={stages}
        currentStageId="decision"
        onSelectStage={handleSelectStage}
      />

      {/* Gate Banners */}
      {!gateG3.passed && (
        <GateBanner
          gateId="G3"
          gateName="Run to Decision"
          blockingCount={gateG3.blockingCount || 1}
          message={gateG3.blockingReason || 'Deterministic checks must pass'}
        />
      )}

      <GateBanner
        gateId="G4"
        gateName="Decision to Rollout"
        blockingCount={gateG4.blockingCount || 1}
        message={
          gateG4.passed
            ? 'Gate G4 Passed: Signed promotion approval recorded with Kernel Permit.'
            : 'Rollout is locked until at least one Canary or Migrate workload is signed.'
        }
        actionText={gateG4.passed ? 'Proceed to Rollout' : undefined}
        onActionClick={gateG4.passed ? () => navigate(`/events/${currentEventId}/rollout`) : undefined}
      />

      {/* Screen Header */}
      <div className="decision-screen__header">
        <div className="decision-screen__title-area">
          <h1 className="decision-screen__title">Step 5 · Qualification Decisions</h1>
          <p className="decision-screen__subtitle">
            Enterprise blast radius recommendations for Event {currentEventId} · Correlation CID-7F3A91
          </p>
        </div>

        <div className="decision-screen__header-actions">
          <button
            type="button"
            className={`sandbox-toggle-btn ${isCalibrationActive ? 'sandbox-toggle-btn--active' : ''}`}
            onClick={() => setIsCalibrationActive(!isCalibrationActive)}
          >
            <span>⚖ Risk Calibration Sandbox</span>
            <span>{isCalibrationActive ? '▲' : '▼'}</span>
          </button>
        </div>
      </div>

      {/* Calibration Sandbox Bar */}
      {isCalibrationActive && (
        <div className="calibration-sandbox-banner" role="region" aria-label="Risk calibration sandbox">
          <div className="calibration-sandbox__header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="calibration-badge">Simulation Mode</span>
              <strong style={{ fontSize: '0.85rem', color: '#fbbf24' }}>
                Enterprise Risk Tolerance Calibration Sandbox
              </strong>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
              Non-binding; does not affect Gate G4 or recorded evidence.
            </span>
          </div>
          <div className="calibration-slider-wrap">
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>0% (Ultra-Conservative)</span>
            <input
              type="range"
              min="0"
              max="100"
              value={riskCalibrationTolerance}
              onChange={(e) => setRiskCalibrationTolerance(Number(e.target.value))}
              className="calibration-slider"
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>100% (Aggressive)</span>
            <span className="calibration-value">{riskCalibrationTolerance}% Tolerance</span>
          </div>
        </div>
      )}

      {/* Priority Ordered Recommendations List */}
      <div className="decision-cards-list">
        <div className="priority-section-title">
          Ranked Recommendations ({orderedRecs.length} Applications) · Order: Block → Investigate → Canary → Migrate
        </div>

        {orderedRecs.map((rec) => {
          const w = workloads.find((item) => item.id === rec.workloadId);
          const isSelected = selectedWorkloadIds.includes(rec.workloadId);
          const isBlock = rec.treatment === 'block';
          const isInvestigate = rec.treatment === 'investigate';
          const isApproved = rec.status === 'approved';
          const isAcknowledged = rec.status === 'acknowledged';

          return (
            <div
              key={rec.id}
              className={`decision-card decision-card--${rec.treatment}`}
            >
              {/* Card Top Row */}
              <div className="decision-card__top">
                <div className="decision-card__left">
                  {/* Inviolable rule: BLOCK items have NO APPROVAL CHECKBOX */}
                  {!isBlock && !isInvestigate && (
                    <div className="decision-card__checkbox-wrap">
                      <input
                        type="checkbox"
                        className="decision-card__checkbox"
                        id={`check-${rec.id}`}
                        checked={isSelected}
                        onChange={() => handleToggleSelect(rec.workloadId)}
                        aria-label={`Select ${rec.workloadName} for approval scope`}
                      />
                    </div>
                  )}

                  <div className="decision-card__title-group">
                    <span className="decision-card__name">{rec.workloadName}</span>
                    <StatusChip
                      status={rec.treatment}
                      label={rec.treatment.toUpperCase()}
                    />
                    {w && (
                      <StatusChip
                        status={w.riskTier === 'Critical' ? 'block' : 'confirmed'}
                        label={w.riskTier}
                      />
                    )}
                    {isApproved && (
                      <StatusChip status="pass" label="SIGNED / APPROVED" />
                    )}
                    {isAcknowledged && (
                      <StatusChip status="confirmed" label="ACKNOWLEDGED BY OWNER" />
                    )}
                  </div>
                </div>

                <div className="decision-card__right">
                  <span className="confidence-metric">
                    Confidence: <strong>{Math.round(rec.confidence * 100)}%</strong> ({rec.confidenceTier})
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                    Provenance: {rec.provenance}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="decision-card__body">
                <div className="decision-reason-box">
                  <div className="decision-primary-reason">
                    <strong>Primary Reason:</strong> {rec.primaryReason}
                  </div>
                  {rec.unknowns && (
                    <div className="decision-unknowns">
                      <strong>Residual Gap / Unknowns:</strong> {rec.unknowns}
                    </div>
                  )}
                  {isBlock && rec.kernelRuleId && (
                    <div className="kernel-hardstop-badge">
                      <span>⛔ KERNEL HARD STOP [{rec.kernelRuleId}]</span>
                      <span>— Production promotion strictly prohibited</span>
                    </div>
                  )}
                </div>

                {/* Required Approvers */}
                <div className="decision-approvers-box">
                  <span className="approvers-title">Required Sign-offs</span>
                  <div className="approver-tag-list">
                    {rec.requiredApprovers.map((appr, idx) => (
                      <div key={idx} className="approver-tag">
                        <span>{appr.name} ({appr.role})</span>
                        <StatusChip
                          status={appr.signed || isApproved ? 'pass' : 'stale'}
                          label={appr.signed || isApproved ? 'SIGNED' : 'PENDING'}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="decision-card__actions">
                {isBlock && (
                  <div className="block-actions-group">
                    {!isAcknowledged && (
                      <button
                        type="button"
                        className="acknowledge-block-btn"
                        onClick={() => acknowledgeBlock(currentEventId, rec.workloadId, currentUser)}
                      >
                        Acknowledge Block (Record into Ledger)
                      </button>
                    )}
                    <button
                      type="button"
                      className="inspect-hardstop-btn"
                      onClick={() =>
                        triggerHardStop({
                          ruleId: rec.kernelRuleId || 'K-014',
                          ruleName: 'Deterministic Policy Check Enforcement',
                          plainText:
                            'Candidate skipped the policy check in trajectory step 3. Source: deterministic trajectory rule K-014.',
                          reason: `${rec.workloadName} failed deterministic invariant ${rec.kernelRuleId || 'K-014'} on test case c-refund-01.`,
                          eventId: currentEventId,
                          workloadId: rec.workloadId,
                          workloadName: rec.workloadName,
                        })
                      }
                      title="Inspect Hard-Stop Interstitial (Overlay O4)"
                    >
                      Inspect Hard Stop (Overlay O4)
                    </button>
                  </div>
                )}

                {isInvestigate && (
                  <button
                    type="button"
                    className="request-evidence-btn"
                    disabled={rec.expansionCycle >= 2}
                    onClick={() => requestMoreEvidence(currentEventId, rec.workloadId)}
                  >
                    {rec.expansionCycle >= 2
                      ? 'Maximum Probes Dispatched (2/2)'
                      : `Request More Evidence (Cycle ${rec.expansionCycle + 1}/2)`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Approval Panel */}
      <ApprovalPanel
        selectedIds={selectedWorkloadIds}
        onClearSelection={() => setSelectedWorkloadIds([])}
        onOpenModal={() => setIsApprovalModalOpen(true)}
      />

      {/* Approval Modal (Overlay O2) */}
      <ApprovalModal
        isOpen={isApprovalModalOpen}
        workloadIds={selectedWorkloadIds}
        onClose={() => setIsApprovalModalOpen(false)}
        onSuccess={() => {
          setSelectedWorkloadIds([]);
        }}
      />
    </div>
  );
};
