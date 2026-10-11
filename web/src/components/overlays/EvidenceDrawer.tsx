import React, { useState } from 'react';
import { X, ShieldAlert, Clock, FileText, Check, AlertTriangle } from 'lucide-react';
import { ProvenanceTag } from '../common/ProvenanceTag';
import { StatusChip } from '../common/StatusChip';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import './EvidenceDrawer.css';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    type: 'test' | 'missing_test' | 'edge' | 'judge_disagreement' | 'case';
    title: string;
    workloadName?: string;
    severity?: 'Critical' | 'High' | 'Medium' | 'Low';
    reasonCode?: string;
    reasonText?: string;
    provenance?: 'rule-based' | 'ai-proposed' | 'human-entered';
    confidence?: number;
    ruleId?: string;
    evidenceText?: string;
    missingTestId?: string;
    gapDescription?: string;
    requiresSmeApproval?: boolean;
    judgeDetails?: {
      judgeA: number;
      judgeB: number;
      notes: string;
    };
  };
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const { currentUser, approveMissingTest, rejectMissingTest } = useEvergreenStore();
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (!isOpen || !data) return null;

  const handleApproveMissing = () => {
    if (data.missingTestId) {
      approveMissingTest(data.missingTestId, currentUser);
      onClose();
    }
  };

  const handleRejectMissing = () => {
    if (data.missingTestId && rejectReason.trim()) {
      rejectMissingTest(data.missingTestId, rejectReason.trim(), currentUser);
      onClose();
    }
  };

  return (
    <div className="ev-drawer-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="ev-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        aria-labelledby="drawer-heading"
      >
        <div className="ev-drawer-header">
          <div className="ev-drawer-header-meta">
            <span className="ev-drawer-eyebrow">
              {data.type === 'missing_test'
                ? 'Candidate Test Proposal (O1)'
                : data.type === 'judge_disagreement'
                ? 'Judge Disagreement Analysis (O1)'
                : 'Qualification Evidence Rationale (O1)'}
            </span>
            <h2 id="drawer-heading" className="ev-drawer-title">
              {data.title}
            </h2>
          </div>
          <button
            className="ev-drawer-close"
            onClick={onClose}
            aria-label="Close evidence drawer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="ev-drawer-body">
          {/* Workload & Meta strip */}
          <div className="ev-drawer-meta-strip">
            {data.workloadName && (
              <div className="ev-drawer-meta-item">
                <span className="ev-meta-label">Workload</span>
                <span className="ev-meta-value">{data.workloadName}</span>
              </div>
            )}
            {data.severity && (
              <div className="ev-drawer-meta-item">
                <span className="ev-meta-label">Severity</span>
                <StatusChip
                  status={data.severity === 'Critical' ? 'block' : 'warn'}
                  label={data.severity}
                  size="small"
                />

              </div>
            )}
            {data.provenance && (
              <div className="ev-drawer-meta-item">
                <span className="ev-meta-label">Provenance</span>
                <ProvenanceTag kind={data.provenance} />
              </div>
            )}
          </div>

          {/* Missing Test Special Review Mode */}
          {data.type === 'missing_test' && (
            <div className="ev-drawer-section ev-missing-test-callout">
              <div className="ev-callout-header">
                <AlertTriangle size={16} className="ev-icon-gold" />
                <span className="ev-callout-title">Generated Coverage Gap Specification</span>
              </div>
              <p className="ev-gap-desc">{data.gapDescription}</p>
              {data.requiresSmeApproval && (
                <div className="ev-sme-notice">
                  <ShieldAlert size={14} />
                  <span>
                    High-risk workload: Test Lead or Application Owner approval required before
                    inclusion.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Reason Code & Rationale */}
          {data.reasonCode && (
            <div className="ev-drawer-section">
              <h3 className="ev-section-title">Machine-Readable Reason Code</h3>
              <div className="ev-reason-code-badge">
                <code>{data.reasonCode}</code>
              </div>
              {data.reasonText && (
                <p className="ev-reason-explanation">{data.reasonText}</p>
              )}
            </div>
          )}

          {/* Judge Disagreement */}
          {data.judgeDetails && (
            <div className="ev-drawer-section">
              <h3 className="ev-section-title">Evaluator Judge Discordance</h3>
              <p className="ev-judge-subtitle">
                Judges disagree by 2 confidence bands. Scores are preserved without averaging to
                protect enterprise decision uncertainty.
              </p>
              <div className="ev-judge-cards-grid">
                <div className="ev-judge-card">
                  <span className="ev-judge-name">Judge A (Llama-3-70B-Instruct)</span>
                  <span className="ev-judge-score">{data.judgeDetails.judgeA.toFixed(2)}</span>
                  <span className="ev-judge-badge-pass">Acceptable Tone</span>
                </div>
                <div className="ev-judge-card">
                  <span className="ev-judge-name">Judge B (Mistral-Large-2)</span>
                  <span className="ev-judge-score">{data.judgeDetails.judgeB.toFixed(2)}</span>
                  <span className="ev-judge-badge-warn">Boundary Softening</span>
                </div>
              </div>
              <div className="ev-judge-notes-box">
                <strong>Verdict Note:</strong> {data.judgeDetails.notes}
              </div>
            </div>
          )}

          {/* Supporting Evidence / Rule ID */}
          <div className="ev-drawer-section">
            <h3 className="ev-section-title">Supporting Evidence & Invariant Linkage</h3>
            <div className="ev-evidence-box">
              <div className="ev-evidence-header">
                <FileText size={14} />
                <span>Deterministic Invariant / Source Contract</span>
              </div>
              <p className="ev-evidence-content">
                {data.evidenceText ||
                  'Enterprise Invariant K-014: All autonomous financial refund workflows must invoke pre-clearance policy inspection tool prior to issuing downstream settlement tokens. Bypassing tool trajectory voids candidate qualification.'}
              </p>
            </div>
          </div>

          {/* Audit Trail Note */}
          <div className="ev-drawer-section ev-audit-notice">
            <Clock size={14} />
            <span>
              All attestations and overrides append tamper-evident SHA-256 records to the Qualification
              Evidence Record.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        {data.type === 'missing_test' && (
          <div className="ev-drawer-footer">
            {!rejectMode ? (
              <>
                <button
                  type="button"
                  className="ev-button ev-button-secondary"
                  onClick={() => setRejectMode(true)}
                >
                  Reject with reason...
                </button>
                <button
                  type="button"
                  className="ev-button ev-button-primary"
                  onClick={handleApproveMissing}
                >
                  <Check size={16} />
                  Approve for this event
                </button>
              </>
            ) : (
              <div className="ev-reject-form">
                <input
                  type="text"
                  className="ev-input"
                  placeholder="Reason for rejecting candidate test (required)..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  autoFocus
                />
                <div className="ev-reject-actions">
                  <button
                    type="button"
                    className="ev-button ev-button-secondary"
                    onClick={() => setRejectMode(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="ev-button ev-button-primary"
                    disabled={!rejectReason.trim()}
                    onClick={handleRejectMissing}
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
