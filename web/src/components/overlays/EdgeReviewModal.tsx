import React, { useState } from 'react';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import { can } from '../../utils/permissions';
import { StatusChip } from '../common/StatusChip';
import { ConfidenceMeter } from '../common/ConfidenceMeter';
import { ProvenanceTag } from '../common/ProvenanceTag';
import type { DependencyEdge } from '../../types/domain';
import {
  X,
  AlertTriangle,
  CheckCircle,
  Shield,
  FileText,
  UserCheck,
} from 'lucide-react';
import './EdgeReviewModal.css';

interface EdgeReviewModalProps {
  edge: DependencyEdge;
  onClose: () => void;
}

export const EdgeReviewModal: React.FC<EdgeReviewModalProps> = ({ edge, onClose }) => {
  const { currentUser, confirmEdge, overrideEdge } = useEvergreenStore();

  const [mode, setMode] = useState<'confirm' | 'override'>('confirm');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideExpiry, setOverrideExpiry] = useState('30 days');
  const [overrideEvidence, setOverrideEvidence] = useState('');

  // Permission check
  const perm = can(currentUser.role, 'confirm_override_edge', { currentUser });

  const handleConfirm = () => {
    confirmEdge(edge.id, currentUser);
    onClose();
  };

  const handleOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) return;

    overrideEdge(
      edge.id,
      {
        reason: overrideReason,
        owner: currentUser.name,
        expiry: overrideExpiry,
        evidence: overrideEvidence || 'Manual architect exception',
      },
      currentUser
    );
    onClose();
  };

  return (
    <div className="ev-edge-modal-backdrop" onClick={onClose}>
      <div
        className="ev-edge-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edge-modal-title"
      >
        {/* Header */}
        <div className="ev-edge-modal__header">
          <div className="ev-edge-modal__title-wrap">
            <Shield size={20} className="ev-edge-modal__icon" aria-hidden="true" />
            <div>
              <h2 id="edge-modal-title" className="ev-edge-modal__title">
                Review Dependency Edge
              </h2>
              <span className="ev-edge-modal__sub">
                Edge ID: {edge.id} · {edge.relationship}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="ev-edge-modal__close-btn"
            onClick={onClose}
            aria-label="Close review dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="ev-edge-modal__content">
          {/* Critical path warning banner */}
          {edge.isCriticalPath && edge.state !== 'confirmed' && (
            <div className="ev-edge-modal__gate-warning" role="alert">
              <AlertTriangle size={18} className="ev-edge-modal__warning-icon" aria-hidden="true" />
              <div>
                <strong>Blocks Gate G1 (Regression Plan Lock)</strong>
                <p>
                  This edge lies on the critical path to <strong>{edge.fromName}</strong>. Gate G1 requires all critical dependency edges to be attested by a human before qualification tests can be planned.
                </p>
              </div>
            </div>
          )}

          {/* Edge Details Card */}
          <div className="ev-edge-modal__details-grid">
            <div className="ev-edge-modal__field">
              <span className="ev-edge-modal__field-label">From (Caller)</span>
              <span className="ev-edge-modal__field-value">
                <strong>{edge.fromName}</strong>
              </span>
            </div>

            <div className="ev-edge-modal__field">
              <span className="ev-edge-modal__field-label">To (Target)</span>
              <span className="ev-edge-modal__field-value">
                <strong>{edge.toName}</strong>
              </span>
            </div>

            <div className="ev-edge-modal__field">
              <span className="ev-edge-modal__field-label">Current State</span>
              <div className="ev-edge-modal__field-value">
                <StatusChip status={edge.state} size="small" />
              </div>
            </div>

            <div className="ev-edge-modal__field">
              <span className="ev-edge-modal__field-label">Evidence Provenance</span>
              <div className="ev-edge-modal__field-value">
                <ProvenanceTag
                  kind={
                    edge.evidenceClass === 'LLM-inferred'
                      ? 'ai-proposed'
                      : edge.evidenceClass === 'manually-attested'
                      ? 'human-entered'
                      : 'rule-based'
                  }
                  source={edge.evidenceClass}
                  timestamp={edge.lastVerified}
                />
              </div>
            </div>

            <div className="ev-edge-modal__field ev-edge-modal__field--full">
              <span className="ev-edge-modal__field-label">Confidence Score</span>
              <ConfidenceMeter score={edge.confidence} />
            </div>

            <div className="ev-edge-modal__field ev-edge-modal__field--full">
              <span className="ev-edge-modal__field-label">Discovery Claim / Evidence</span>
              <div className="ev-edge-modal__claim-box">
                {edge.sourceClaim || 'Dependency inferred from system prompt analysis.'}
              </div>
            </div>
          </div>

          {/* Mode Tabs: Confirm vs Override */}
          <div className="ev-edge-modal__tabs">
            <button
              type="button"
              className={`ev-edge-modal__tab ${mode === 'confirm' ? 'ev-edge-modal__tab--active' : ''}`}
              onClick={() => setMode('confirm')}
            >
              Attest / Confirm Edge
            </button>
            <button
              type="button"
              className={`ev-edge-modal__tab ${mode === 'override' ? 'ev-edge-modal__tab--active' : ''}`}
              onClick={() => setMode('override')}
            >
              Override Edge with Rationale
            </button>
          </div>

          {/* Tab 1: Confirm Mode */}
          {mode === 'confirm' && (
            <div className="ev-edge-modal__tab-body">
              <p className="ev-edge-modal__note">
                Confirming attests that <strong>{edge.fromName}</strong> indeed invokes <strong>{edge.toName}</strong>. This upgrades evidence to <em>manually-attested</em> and records a SHA-256 integrity block in the Qualification Record.
              </p>

              {!perm.allowed && (
                <div className="ev-edge-modal__permission-alert">
                  <UserCheck size={16} aria-hidden="true" />
                  <span>{perm.reason}</span>
                </div>
              )}

              <div className="ev-edge-modal__actions">
                <button
                  type="button"
                  className="ev-edge-modal__btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="ev-edge-modal__btn-primary"
                  onClick={handleConfirm}
                  disabled={!perm.allowed}
                  title={!perm.allowed ? perm.reason : undefined}
                >
                  <CheckCircle size={16} aria-hidden="true" />
                  <span>Confirm Edge as {currentUser.name}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Override Mode */}
          {mode === 'override' && (
            <form onSubmit={handleOverride} className="ev-edge-modal__tab-body">
              <p className="ev-edge-modal__note">
                An edge override removes or alters this dependency link with written accountability. All overrides expire and require an audit reason.
              </p>

              <div className="ev-edge-modal__form-group">
                <label htmlFor="override-reason" className="ev-edge-modal__form-label">
                  Override Rationale (Required) *
                </label>
                <textarea
                  id="override-reason"
                  className="ev-edge-modal__textarea"
                  rows={2}
                  placeholder="e.g. Verified in code: Policy Tool invocation was decommissioned in commit 8f9b2c..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  required
                />
              </div>

              <div className="ev-edge-modal__form-row">
                <div className="ev-edge-modal__form-group">
                  <label htmlFor="override-expiry" className="ev-edge-modal__form-label">
                    Expiry Window
                  </label>
                  <select
                    id="override-expiry"
                    className="ev-edge-modal__select"
                    value={overrideExpiry}
                    onChange={(e) => setOverrideExpiry(e.target.value)}
                  >
                    <option value="14 days">14 days</option>
                    <option value="30 days">30 days</option>
                    <option value="90 days">90 days</option>
                  </select>
                </div>

                <div className="ev-edge-modal__form-group">
                  <label htmlFor="override-evidence" className="ev-edge-modal__form-label">
                    Evidence Link / Reference
                  </label>
                  <input
                    type="text"
                    id="override-evidence"
                    className="ev-edge-modal__input"
                    placeholder="PR #492 or Jira ticket"
                    value={overrideEvidence}
                    onChange={(e) => setOverrideEvidence(e.target.value)}
                  />
                </div>
              </div>

              {!perm.allowed && (
                <div className="ev-edge-modal__permission-alert">
                  <UserCheck size={16} aria-hidden="true" />
                  <span>{perm.reason}</span>
                </div>
              )}

              <div className="ev-edge-modal__actions">
                <button
                  type="button"
                  className="ev-edge-modal__btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ev-edge-modal__btn-primary"
                  disabled={!perm.allowed || !overrideReason.trim()}
                  title={!perm.allowed ? perm.reason : undefined}
                >
                  <FileText size={16} aria-hidden="true" />
                  <span>Submit Override as {currentUser.name}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
