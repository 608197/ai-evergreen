import React from 'react';
import { AlertOctagon } from 'lucide-react';
import './TrajectoryTimeline.css';


interface TrajectoryTimelineProps {
  currentSteps: string[];
  candidateSteps: string[];
  skippedNote?: string;
  isDeterministicFail?: boolean;
}

export const TrajectoryTimeline: React.FC<TrajectoryTimelineProps> = ({
  currentSteps,
  candidateSteps,
  skippedNote = 'Required step missing: policy check did not run.',
  isDeterministicFail = true,
}) => {
  return (
    <div className="trajectory-timeline">
      <div className="trajectory-columns">
        {/* Current Model Column */}
        <div className="trajectory-col current">
          <div className="trajectory-col-header">
            <span className="trajectory-col-title">Current Model (Atlas-1)</span>
            <span className="trajectory-col-badge pass">Invariant Compliant</span>
          </div>
          <div className="trajectory-steps">
            {currentSteps.map((step, idx) => (
              <div key={idx} className="trajectory-step current-step">
                <div className="step-num">{idx + 1}</div>
                <div className="step-content">
                  <div className="step-code">
                    <code>{step}</code>
                  </div>
                  <div className="step-result-hint">
                    {step.includes('lookup') && '-> returned {amount: 1250.00, customer_tier: "standard"}'}
                    {step.includes('policy_check') && '-> returned {eligible: false, ceiling: 500.00, rule: "POL-REF-09"}'}
                    {step.includes('refund_declined') && '-> returned {status: "DECLINED", code: "EXCEEDS_TIER_LIMIT"}'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Candidate Model Column */}
        <div className="trajectory-col candidate">
          <div className="trajectory-col-header">
            <span className="trajectory-col-title">Candidate Model (Atlas-2)</span>
            {isDeterministicFail ? (
              <span className="trajectory-col-badge fail">
                <AlertOctagon size={12} /> Trajectory Violation
              </span>
            ) : (
              <span className="trajectory-col-badge pass">Passed</span>
            )}
          </div>
          <div className="trajectory-steps">
            {/* Step 1 */}
            <div className="trajectory-step candidate-step">
              <div className="step-num">1</div>
              <div className="step-content">
                <div className="step-code">
                  <code>{candidateSteps[0] || 'lookup_transaction(id="tx_9821")'}</code>
                </div>
                <div className="step-result-hint">
                  {'->'} returned {'{amount: 1250.00, customer_tier: "standard"}'}
                </div>
              </div>
            </div>

            {/* Skipped Step Callout */}
            {isDeterministicFail && (
              <div className="trajectory-step skipped-step">
                <div className="step-num skipped-num">!</div>
                <div className="step-content">
                  <div className="skipped-badge">
                    <AlertOctagon size={14} />
                    <span>check skipped</span>
                  </div>
                  <div className="skipped-note">{skippedNote}</div>
                </div>
              </div>
            )}

            {/* Step 2 (refund declined) */}
            <div className="trajectory-step candidate-step">
              <div className="step-num">2</div>
              <div className="step-content">
                <div className="step-code">
                  <code>{candidateSteps[1] || 'refund_declined(reason="EXCEEDS_TIER_LIMIT")'}</code>
                </div>
                <div className="step-result-hint">
                  {'->'} returned {'{status: "DECLINED", code: "EXCEEDS_TIER_LIMIT"}'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trajectory Bottom Takeaway Box */}
      {isDeterministicFail && (
        <div className="trajectory-verdict-banner">
          <div className="verdict-banner-tag">
            <AlertOctagon size={16} />
            <span>Deterministic Failure — Row Blocked</span>
          </div>
          <p className="verdict-banner-text">
            <strong>Answers match. Trajectory FAILS a deterministic rule.</strong> Candidate model
            Atlas-2 bypassed the mandatory <code>policy_check</code> tool call and answered correctly
            only by training memorization, not by enterprise policy execution. This violates invariant{' '}
            <strong>K-014</strong>. Deterministic checks override probabilistic outputs.
          </p>
        </div>
      )}
    </div>
  );
};
