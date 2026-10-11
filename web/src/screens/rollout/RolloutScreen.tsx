import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import { StageStepper, type StageStep } from '../../components/common/StageStepper';
import { GateBanner } from '../../components/common/GateBanner';
import { StatusChip } from '../../components/common/StatusChip';
import { ThresholdChart } from '../../components/rollout/ThresholdChart';
import type { LadderStep } from '../../types/domain';
import './RolloutScreen.css';

export const RolloutScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentEventId,
    currentUser,
    identities,
    rollouts,
    selectedRolloutWorkloadId,
    setSelectedRolloutWorkloadId,
    holdRollout,
    resumeRollout,
    triggerSeededBreach,
    restoreLkg,
    getGateG4,
    getGateG5,
    triggerHardStop,
  } = useEvergreenStore();

  const gateG4 = getGateG4(currentEventId);
  const gateG5 = getGateG5(currentEventId);

  const stages: StageStep[] = [
    { id: 'blast_radius', index: 1, name: 'Blast Radius', state: 'complete' },
    { id: 'plan', index: 2, name: 'Regression Plan', state: 'complete' },
    { id: 'results', index: 3, name: 'Results & Matrix', state: 'complete' },
    { id: 'decision', index: 4, name: 'Decision & Approval', state: 'complete' },
    { id: 'rollout', index: 5, name: 'Rollout & Canary', state: 'current' },
    { id: 'record', index: 6, name: 'Qualification Record', state: 'available' },
  ];

  const handleSelectStage = (stageId: string) => {
    if (stageId === 'blast_radius') navigate(`/events/${currentEventId}/blast-radius`);
    else if (stageId === 'plan') navigate(`/events/${currentEventId}/plan`);
    else if (stageId === 'results') navigate(`/events/${currentEventId}/results`);
    else if (stageId === 'decision') navigate(`/events/${currentEventId}/decision`);
    else if (stageId === 'rollout') navigate(`/events/${currentEventId}/rollout`);
    else if (stageId === 'record') navigate(`/events/${currentEventId}/record`);
  };

  const activeRollout =
    rollouts.find((r) => r.workloadId === selectedRolloutWorkloadId) || rollouts[0];

  const isRolledBack = activeRollout?.status === 'rolled_back';
  const isHeld = activeRollout?.status === 'held';

  const ladderSteps: { id: LadderStep; label: string; desc: string }[] = [
    { id: 'shadow', label: 'Shadow', desc: '100% mirror' },
    { id: '1%', label: '1%', desc: 'Internal pilot' },
    { id: '5%', label: '5%', desc: 'General pilot' },
    { id: '25%', label: '25%', desc: 'Ramped traffic' },
    { id: '100%', label: '100%', desc: 'Full promotion' },
  ];

  const getStepStatus = (stepId: LadderStep) => {
    if (!activeRollout) return 'pending';
    if (isRolledBack) {
      if (stepId === activeRollout.currentLadderStep) return 'rolled-back';
    }
    const order: LadderStep[] = ['shadow', '1%', '5%', '25%', '100%'];
    const currentIdx = order.indexOf(activeRollout.currentLadderStep);
    const stepIdx = order.indexOf(stepId);

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'active';
    return 'pending';
  };

  const handleTriggerBreach = () => {
    if (!activeRollout) return;
    triggerSeededBreach(activeRollout.id);
    triggerHardStop({
      ruleId: 'K-008',
      ruleName: 'Canary Threshold Breach Rollback Guard',
      plainText:
        'Groundedness fell below pre-authorised threshold (0.71 < 0.85). Automated rollback triggered to restore Last-Known-Good configuration.',
      reason: `${activeRollout.workloadName} canary breached safety threshold during 5% live traffic ramp.`,
      eventId: currentEventId,
      workloadId: activeRollout.workloadId,
      workloadName: activeRollout.workloadName,
      safeStatusText: `Automated rollback executed. Last-Known-Good configuration (${activeRollout.lkgModel}) is serving 100% of traffic.`,
    });
  };

  const handleManualRestore = () => {
    if (!activeRollout) return;
    const secondApprover = identities.find((u) => u.id === 'user-daniel') || identities[1];
    restoreLkg(activeRollout.id, currentUser, secondApprover);
  };

  return (
    <div className="rollout-screen">
      {/* Stage Stepper */}
      <StageStepper
        stages={stages}
        currentStageId="rollout"
        onSelectStage={handleSelectStage}
      />

      {/* Gate Banners */}
      {!gateG4.passed && (
        <GateBanner
          gateId="G4"
          gateName="Decision to Rollout"
          blockingCount={gateG4.blockingCount || 1}
          message={gateG4.blockingReason || 'Signed approval required'}
          actionText="Back to Decision"
          onActionClick={() => navigate(`/events/${currentEventId}/decision`)}
        />
      )}

      <GateBanner
        gateId="G5"
        gateName="Rollout to Closed"
        blockingCount={gateG5.blockingCount || 0}
        message={
          gateG5.passed
            ? 'Gate G5 Passed: All canary and migration rollouts completed or rolled back.'
            : 'Rollout monitor active: event stays open until all workloads finish traffic ramp.'
        }
        actionText="View Cryptographic Evidence Record"
        onActionClick={() => navigate(`/events/${currentEventId}/record`)}
      />

      {/* Header */}
      <div className="rollout-screen__header">
        <div className="rollout-screen__title-area">
          <h1 className="rollout-screen__title">Step 6 · Production Rollout Monitor</h1>
          <p className="rollout-screen__subtitle">
            Automated threshold telemetry & Last-Known-Good rollback controller · Event {currentEventId}
          </p>
        </div>

        <div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/record')}
          >
            <span>Audit Ledger & Record</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Workload Tabs */}
      <div className="rollout-tabs" role="tablist">
        {rollouts.map((ro) => (
          <button
            key={ro.id}
            role="tab"
            aria-selected={ro.workloadId === activeRollout?.workloadId}
            className={`rollout-tab ${ro.workloadId === activeRollout?.workloadId ? 'rollout-tab--active' : ''}`}
            onClick={() => setSelectedRolloutWorkloadId(ro.workloadId)}
          >
            <span>{ro.workloadName}</span>
            <StatusChip
              status={
                ro.status === 'rolled_back'
                  ? 'fail'
                  : ro.status === 'held'
                  ? 'warn'
                  : ro.status === 'completed'
                  ? 'pass'
                  : 'canary'
              }
              label={ro.status.toUpperCase()}
            />
          </button>
        ))}
      </div>

      {/* Breach Alert Banner */}
      {isRolledBack && (
        <div className="rollback-breach-banner" role="alert">
          <span className="breach-icon">🚨</span>
          <div className="breach-content">
            <span className="breach-headline">
              AUTOMATIC ROLLBACK TRIGGERED: Groundedness breached pre-authorised threshold (0.71 &lt; 0.85)
            </span>
            <p className="breach-subtext">
              Rollback Controller executed an automated restore of Last-Known-Good configuration (<strong>{activeRollout?.lkgModel}</strong>, hash <code>{activeRollout?.lkgConfigHash}</code>). Zero human intervention required at runtime. Simulated recovery elapsed: <strong>{activeRollout?.recoveryTimer || '02:14'}</strong>.
            </p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '8px', alignSelf: 'flex-start' }}
              onClick={() =>
                triggerHardStop({
                  ruleId: 'K-008',
                  ruleName: 'Canary Threshold Breach Rollback Guard',
                  plainText:
                    'Groundedness fell below pre-authorised threshold (0.71 < 0.85). Automated rollback triggered to restore Last-Known-Good configuration.',
                  reason: `${activeRollout?.workloadName} canary breached safety threshold during 5% live traffic ramp.`,
                  eventId: currentEventId,
                  workloadId: activeRollout?.workloadId,
                  workloadName: activeRollout?.workloadName,
                  safeStatusText: `Automated rollback executed. Last-Known-Good configuration (${activeRollout?.lkgModel}) is serving 100% of traffic.`,
                })
              }
            >
              Inspect Hard Stop Notice (Overlay O4)
            </button>
          </div>
        </div>
      )}

      {/* Held Traffic Alert Banner */}
      {isHeld && (
        <div className="gate-banner gate-banner--blocked">
          <div className="gate-banner__icon">⏸</div>
          <div className="gate-banner__content">
            <span className="gate-banner__message">
              Traffic ramp held at {activeRollout?.currentLadderStep} step by {activeRollout?.heldBy}. Reason: "{activeRollout?.heldReason || 'Manual observation requested'}".
            </span>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => activeRollout && resumeRollout(activeRollout.id)}
          >
            Resume Traffic Ramp
          </button>
        </div>
      )}

      {/* 5-Stage Ladder Visualizer */}
      {activeRollout && (
        <div className="ladder-card">
          <div className="ladder-header">
            <div className="ladder-title">
              <span>Ramp Ladder ({activeRollout.treatment.toUpperCase()})</span>
              <StatusChip
                status={isRolledBack ? 'fail' : 'canary'}
                label={`STEP ${activeRollout.currentLadderStep}`}
              />
            </div>
            {!isRolledBack && activeRollout.status !== 'completed' && (
              <div className="dwell-timer-badge">
                <span>⏱ Dwell Countdown:</span>
                <strong>{activeRollout.dwellTimeRemaining} remaining</strong>
              </div>
            )}
          </div>

          <div className="ladder-steps-row">
            {ladderSteps.map((step) => {
              const status = getStepStatus(step.id);
              return (
                <div
                  key={step.id}
                  className={`ladder-step-box ladder-step-box--${status}`}
                >
                  <span className="ladder-step-num">{step.label}</span>
                  <span className="ladder-step-percent">{step.id}</span>
                  <span className="ladder-step-status">
                    {status === 'rolled-back'
                      ? 'ROLLED BACK'
                      : status === 'active'
                      ? 'ACTIVE (5% TRAFFIC)'
                      : status === 'completed'
                      ? 'COMPLETED'
                      : 'PENDING'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pre-authorised Threshold Telemetry Cards */}
      {activeRollout && (
        <div>
          <div className="telemetry-section-title">
            Pre-Authorised Telemetry Thresholds ({activeRollout.metrics.length} Monitored Invariants)
          </div>
          <div className="telemetry-grid">
            {activeRollout.metrics.map((m) => (
              <ThresholdChart key={m.id} metric={m} />
            ))}
          </div>
        </div>
      )}

      {/* Bottom Row: LKG Recovery Baseline & Actions Panel */}
      {activeRollout && (
        <div className="bottom-controls-grid">
          {/* LKG Card */}
          <div className="lkg-card">
            <div className="lkg-title">
              <span>Last-Known-Good Baseline</span>
              <StatusChip status="pass" label="VERIFIED HEALTHY" />
            </div>

            <div className="lkg-specs">
              <div className="lkg-spec-item">
                <span className="lkg-spec-label">Fallback Model Target:</span>
                <span className="lkg-spec-value">{activeRollout.lkgModel}</span>
              </div>
              <div className="lkg-spec-item">
                <span className="lkg-spec-label">Config State SHA:</span>
                <span className="lkg-spec-value">{activeRollout.lkgConfigHash}</span>
              </div>
              <div className="lkg-spec-item">
                <span className="lkg-spec-label">Recovery SLA:</span>
                <span className="lkg-spec-value">{activeRollout.recoveryTarget}</span>
              </div>
              <div className="lkg-spec-item">
                <span className="lkg-spec-label">Current Standby Status:</span>
                <span className="lkg-spec-value" style={{ color: 'var(--color-status-success)' }}>
                  Hot Standby Verified
                </span>
              </div>
            </div>
          </div>

          {/* Actions Panel */}
          <div className="actions-card">
            <span className="actions-card-title">Rollout Controls & Failure Simulation</span>

            <div className="actions-button-group">
              {/* Seeded Scenario Breach Button */}
              {!isRolledBack && (
                <button
                  type="button"
                  className="demo-breach-btn"
                  onClick={handleTriggerBreach}
                >
                  <span>⚡ Trigger Seeded Breach (Groundedness 0.71 Drop)</span>
                  <span>Simulate Failure →</span>
                </button>
              )}

              {/* Hold / Resume */}
              {!isRolledBack && (
                <button
                  type="button"
                  className="manual-rollback-btn"
                  onClick={() => {
                    if (isHeld) resumeRollout(activeRollout.id);
                    else holdRollout(activeRollout.id, 'Investigation requested by Operator', currentUser);
                  }}
                >
                  {isHeld ? 'Resume Traffic Ramp' : 'Hold Traffic Ramp at Current Step'}
                </button>
              )}

              {/* Manual Restore */}
              {!isRolledBack && (
                <button
                  type="button"
                  className="manual-rollback-btn"
                  onClick={handleManualRestore}
                >
                  Manual Dual-Confirm Rollback to LKG
                </button>
              )}

              {isRolledBack && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/record')}
                >
                  Inspect Incident in Cryptographic Evidence Record →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
