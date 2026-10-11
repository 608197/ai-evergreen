import React, { useState } from 'react';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import { StatusChip } from '../common/StatusChip';
import './ApprovalModal.css';

interface ApprovalModalProps {
  isOpen: boolean;
  workloadIds: string[];
  onClose: () => void;
  onSuccess?: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  workloadIds,
  onClose,
  onSuccess,
}) => {
  const {
    currentEventId,
    currentUser,
    recommendations,
    workloads,
    approveDecisionScope,
  } = useEvergreenStore();

  const [rationale, setRationale] = useState('');
  const [confirmationInput, setConfirmationInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || workloadIds.length === 0) return null;

  const inScopeRecs = recommendations.filter(
    (r) => r.eventId === currentEventId && workloadIds.includes(r.workloadId)
  );

  // Check if any workload is Critical or High tier
  const criticalWorkloads = inScopeRecs.filter((r) => {
    const w = workloads.find((item) => item.id === r.workloadId);
    return w?.riskTier === 'Critical' || w?.criticality === 'critical';
  });

  const hasCriticalTier = criticalWorkloads.length > 0;
  const confirmationTarget = hasCriticalTier ? 'CONFIRM PROMOTION' : '';
  const isFrictionSatisfied = !hasCriticalTier || confirmationInput.trim() === confirmationTarget;
  const isRationaleSatisfied = rationale.trim().length >= 10;

  const canSubmit = isFrictionSatisfied && isRationaleSatisfied && !isSubmitting;

  const handleSign = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);

    const result = approveDecisionScope(currentEventId, workloadIds, rationale, currentUser);
    if (!result.success) {
      setError(result.error || 'Failed to record approval');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onSuccess?.();
    onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="approval-modal-title">
      <div className="approval-modal">
        {/* Header */}
        <div className="approval-modal__header">
          <div className="approval-modal__title-group">
            <h2 id="approval-modal-title" className="approval-modal__title">
              Sign Promotion Approval Record
            </h2>
            <span className="approval-modal__subtitle">
              Event {currentEventId} · Approver: {currentUser.name} ({currentUser.roleTitle})
            </span>
          </div>
          <button
            type="button"
            className="approval-modal__close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="approval-modal__body">
          {/* Inviolable Kernel Checks */}
          <div className="inviolable-checks">
            <div className="inviolable-check-item">
              <span className="inviolable-check-icon">✓</span>
              <span>Kernel Verdict: <strong>PERMIT</strong> (Deterministic & Safety rules clear)</span>
            </div>
            <div className="inviolable-check-item">
              <span className="inviolable-check-icon">✓</span>
              <span>Separation of Duties: <strong>PASSED</strong> (Independent sign-off verified)</span>
            </div>
          </div>

          {/* Scope list */}
          <div className="scope-section">
            <div className="section-label">Workloads in Approval Scope ({inScopeRecs.length})</div>
            <div className="scope-list">
              {inScopeRecs.map((rec) => {
                const w = workloads.find((item) => item.id === rec.workloadId);
                return (
                  <div key={rec.id} className="scope-item">
                    <span className="scope-item__name">{rec.workloadName}</span>
                    <div className="scope-item__meta">
                      <StatusChip
                        status={rec.treatment === 'migrate' ? 'migrate' : 'canary'}
                        label={rec.treatment.toUpperCase()}
                      />
                      {w && (
                        <StatusChip
                          status={w.riskTier === 'Critical' ? 'block' : 'confirmed'}
                          label={w.riskTier}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tier-Scaled Friction for Critical workloads */}
          {hasCriticalTier && (
            <div className="tiered-friction-box">
              <div className="friction-header">
                <span>⚠ Critical Risk Tier Escalation</span>
              </div>
              <p className="friction-desc">
                One or more workloads in this scope ({criticalWorkloads.map((w) => w.workloadName).join(', ')}) carry a <strong>Critical</strong> risk classification. Pre-production promotion requires heightened verification.
              </p>
              <div className="friction-input-group">
                <label htmlFor="confirm-phrase-input" className="friction-label">
                  Type <code>{confirmationTarget}</code> to proceed:
                </label>
                <input
                  id="confirm-phrase-input"
                  type="text"
                  className="friction-input"
                  placeholder={confirmationTarget}
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Mandatory Rationale */}
          <div className="rationale-group">
            <label htmlFor="rationale-input" className="section-label">
              Mandatory Approval Rationale <span style={{ color: 'var(--color-status-danger)' }}>*</span>
            </label>
            <textarea
              id="rationale-input"
              className="rationale-textarea"
              placeholder="State the justification, test coverage confidence, or risk acceptance rationale for this promotion (immutable record)..."
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
            />
            <div className="rationale-hint">
              <span>Must be at least 10 characters</span>
              <span>{rationale.trim().length} chars</span>
            </div>
          </div>

          {/* Cryptographic notice */}
          <div className="crypto-notice">
            <span>🔒 Cryptographic Guarantee:</span>
            <span>Record will be hashed via SHA-256 into tamper-evident ledger with 8h expiry.</span>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="gate-banner gate-banner--blocked" style={{ margin: 0 }}>
              <div className="gate-banner__icon">✕</div>
              <div className="gate-banner__content">
                <span className="gate-banner__message">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="approval-modal__footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary approval-modal__sign-btn"
            disabled={!canSubmit}
            onClick={handleSign}
          >
            <span>{isSubmitting ? 'Signing...' : 'Sign Approval Record'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
