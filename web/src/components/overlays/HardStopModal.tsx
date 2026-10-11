import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import {
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  FileText,
  ExternalLink,
  LifeBuoy,
} from 'lucide-react';
import './HardStopModal.css';

export const HardStopModal: React.FC = () => {
  const navigate = useNavigate();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const {
    hardStopState,
    acknowledgeHardStop,
    closeHardStop,
    currentUser,
  } = useEvergreenStore();

  useEffect(() => {
    if (hardStopState?.isOpen) {
      // Focus moves to the heading; Esc DOES NOT dismiss per charter rule
      headingRef.current?.focus();
    }
  }, [hardStopState?.isOpen]);

  if (!hardStopState || !hardStopState.isOpen) return null;

  const handleAcknowledge = () => {
    acknowledgeHardStop(currentUser);
  };

  const handleViewRecord = () => {
    closeHardStop();
    const eventId = hardStopState.eventId || 'E-2026-001';
    navigate(`/events/${eventId}/record`);
  };

  return (
    <div
      className="hard-stop-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="hard-stop-heading"
      aria-describedby="hard-stop-desc"
    >
      <div className="hard-stop-container">
        {/* Top Warning Strip */}
        <div className="hard-stop-banner-bar">
          <div className="banner-bar-left">
            <AlertOctagon size={20} className="banner-alert-icon" />
            <span>CRITICAL INVARIANT HARD STOP</span>
          </div>
          <span className="banner-badge">FAIL CLOSED · NO BYPASS</span>
        </div>

        {/* Content Body */}
        <div className="hard-stop-card">
          <div className="hard-stop-header">
            <h1
              id="hard-stop-heading"
              className="hard-stop-title"
              tabIndex={-1}
              ref={headingRef}
            >
              Hard stop
            </h1>
            <p id="hard-stop-desc" className="hard-stop-lead">
              {hardStopState.reason}
            </p>
          </div>

          {/* Section 1: Rule Details */}
          <div className="hard-stop-rule-box">
            <div className="rule-box-header">
              <ShieldAlert size={16} className="rule-icon" />
              <span className="rule-box-label">Triggered Deterministic Rule:</span>
              <strong className="rule-id-tag">{hardStopState.ruleId}</strong>
            </div>
            <div className="rule-text-content">
              {hardStopState.plainText}
            </div>
            <div className="rule-box-footer">
              <a
                href="#/controls"
                className="rule-link"
                onClick={() => closeHardStop()}
              >
                Inspect in Controls & Governance <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Section 2: What is Safe */}
          <div className="hard-stop-safe-banner">
            <ShieldCheck size={18} className="safe-icon" />
            <div>
              <strong className="safe-title">Current Safety Guarantee:</strong>
              <p className="safe-text">{hardStopState.safeStatusText}</p>
            </div>
          </div>

          {/* Section 3: What to do next (Numbered List) */}
          <div className="hard-stop-next-steps">
            <h3 className="next-steps-heading">Mandatory Remediation Protocol:</h3>
            <ol className="next-steps-list">
              {hardStopState.nextSteps.map((step, idx) => (
                <li key={idx} className="step-item">
                  <span className="step-num">{idx + 1}</span>
                  <span className="step-desc">{step}</span>
                </li>
              ))}
              <li className="step-item break-glass">
                <span className="step-num">{hardStopState.nextSteps.length + 1}</span>
                <span className="step-desc">
                  <strong>Break-Glass Runbook (BG-004):</strong> If operational continuity mandates manual override, obtain cryptographic dual-key authorization from the Head of AI Safety and Head of Enterprise Architecture.
                </span>
              </li>
            </ol>
          </div>

          {/* Acknowledgment Notice */}
          <div className="hard-stop-notice">
            <LifeBuoy size={14} />
            <span>
              Per Charter Principle 3: LLMs advise; policy determines allowed actions. There is no autonomous bypass for a deterministic invariant failure.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="hard-stop-actions">
            <button
              type="button"
              className="btn-view-record"
              onClick={handleViewRecord}
            >
              <FileText size={15} />
              View Qualification Record
            </button>
            <button
              type="button"
              className="btn-acknowledge"
              onClick={handleAcknowledge}
            >
              <CheckCircle2 size={16} />
              Acknowledge & Record ({currentUser.name})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
