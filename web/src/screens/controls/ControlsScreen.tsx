import React from 'react';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import {
  Sliders,
  Shield,
  Lock,
  AlertOctagon,
  Users,
  Info,
} from 'lucide-react';
import './ControlsScreen.css';

export const ControlsScreen: React.FC = () => {
  const {
    kernelElements,
    hardStops,
    approvalAuthorities,
    selfGovernance,
    triggerHardStop,
  } = useEvergreenStore();

  return (
    <div className="controls-screen">
      {/* Header */}
      <header className="controls-header">
        <div className="controls-title-row">
          <Sliders className="controls-title-icon" size={26} />
          <div>
            <h1 className="controls-title">Controls & Trusted Kernel Inspection</h1>
            <p className="controls-subtitle">
              Visible proof that AI Evergreen operates within strict deterministic boundaries, immutable hard stops, and self-governance limits.
            </p>
          </div>
        </div>

        {/* Read-Only Invariant Notice */}
        <div className="readonly-banner">
          <Lock size={16} />
          <span>
            <strong>Read-only audit view.</strong> No control on this screen can edit a rule or authorize an action.
            Kernel modifications require a versioned repository pull request with cryptographic sign-off.
          </span>
        </div>
      </header>

      {/* Main Body */}
      <div className="controls-body">
        {/* Section 1: 8 Trusted Kernel Elements */}
        <section className="controls-section">
          <div className="section-header">
            <div>
              <h2 className="section-heading">8 Trusted Kernel Deterministic Elements</h2>
              <p className="section-subheading">
                Rule-based, tamper-resistant modules that execute prior to any probabilistic LLM advisor.
              </p>
            </div>
          </div>

          <div className="controls-table-container">
            <table className="controls-table">
              <thead>
                <tr>
                  <th>Element ID</th>
                  <th>Element Name</th>
                  <th>Description & Guarantees</th>
                  <th>Change Control Owner</th>
                  <th>Deterministic Only</th>
                  <th>Active Hit Count</th>
                  <th>Last Hit Rule</th>
                </tr>
              </thead>
              <tbody>
                {kernelElements.map((el) => (
                  <tr key={el.id}>
                    <td><code>{el.id}</code></td>
                    <td><strong>{el.name}</strong></td>
                    <td className="desc-cell">{el.description}</td>
                    <td>{el.changeControlOwner}</td>
                    <td>
                      {el.isDeterministicOnly ? (
                        <span className="det-tag"><Lock size={11} /> 100% Deterministic</span>
                      ) : (
                        <span className="prob-tag">Hybrid Checked</span>
                      )}
                    </td>
                    <td className="hit-cell">
                      <span className={`hit-badge ${el.hitCount > 0 ? 'active' : ''}`}>
                        {el.hitCount} hits
                      </span>
                    </td>
                    <td>
                      {el.lastHitRule ? (
                        <code className="last-hit-code">{el.lastHitRule}</code>
                      ) : (
                        <span className="muted-dash">&mdash;</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: 7 Charter Hard Stops */}
        <section className="controls-section">
          <div className="section-header">
            <div>
              <h2 className="section-heading">7 Charter Hard Stops (Non-Negotiable)</h2>
              <p className="section-subheading">
                Enforced by code, not prompt engineering. A violation terminates qualification immediately.
              </p>
            </div>
          </div>

          <div className="hardstops-grid">
            {hardStops.map((hs) => (
              <div key={hs.id} className="hardstop-card">
                <div className="hs-header">
                  <span className="hs-id">{hs.id}</span>
                  <span className={`hs-outcome ${hs.outcome.toLowerCase()}`}>
                    {hs.outcome === 'Deny' ? <AlertOctagon size={12} /> : <Shield size={12} />}
                    {hs.outcome}
                  </span>
                </div>
                <div className="hs-quote">
                  &ldquo;{hs.plainText}&rdquo;
                </div>
                <div className="hs-footer">
                  <span className="hs-stage">Stage: <strong>{hs.stage}</strong></span>
                  <button
                    type="button"
                    className="hs-preview-btn"
                    onClick={() =>
                      triggerHardStop({
                        ruleId: hs.id,
                        ruleName: hs.plainText.split('.')[0],
                        plainText: hs.plainText,
                        reason: `Deterministic safety rule ${hs.id} verified from Governance Controls.`,
                      })
                    }
                    title="Preview Hard Stop Interstitial Modal (Overlay O4)"
                  >
                    Preview Interstitial (O4)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Approval Authority Matrix */}
        <section className="controls-section">
          <div className="section-header">
            <div>
              <h2 className="section-heading">Human Approval Authority Matrix</h2>
              <p className="section-subheading">
                Mandatory human roles required to authorize production promotion by workload criticality tier.
              </p>
            </div>
          </div>

          <div className="controls-table-container">
            <table className="controls-table">
              <thead>
                <tr>
                  <th>Criticality Tier</th>
                  <th>Workload Examples</th>
                  <th>Approval Expiry</th>
                  <th>Required Sign-off Roles</th>
                  <th>Dual Confirmation Required</th>
                </tr>
              </thead>
              <tbody>
                {approvalAuthorities.map((auth) => (
                  <tr key={auth.riskTier}>
                    <td>
                      <span className={`risk-tag ${auth.riskTier.toLowerCase()}`}>
                        {auth.riskTier}
                      </span>
                    </td>
                    <td>{auth.workloadType}</td>
                    <td><span className="expiry-text">{auth.expiryHours} hours</span></td>
                    <td>
                      <div className="roles-wrap">
                        {auth.requiredRoles.map((r) => (
                          <span key={r} className="role-tag">{r}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {auth.dualConfirmForRollback ? (
                        <span className="dual-confirm-yes">
                          <Users size={12} /> Mandatory (App Owner + Risk Lead)
                        </span>
                      ) : (
                        <span className="dual-confirm-no">App Owner Only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Self-Governance Panel */}
        <section className="controls-section self-gov-section">
          <div className="section-header">
            <div>
              <h2 className="section-heading">Self-Governance & Recursive Qualification Safeguards</h2>
              <p className="section-subheading">
                AI Evergreen treats itself as an governed enterprise workload while strictly forbidding self-marking.
              </p>
            </div>
          </div>

          <div className="self-gov-card">
            {/* The Critical Invariant Callout */}
            <div className="self-gov-invariant-box">
              <Shield size={20} className="invariant-icon" />
              <div>
                <strong>Charter Self-Governance Invariant:</strong>
                <p>
                  &ldquo;AI Evergreen can qualify itself. It cannot mark its own work or approve its own promotion.
                  Validation is limited to one level: the approved Evergreen qualifies the candidate, and the candidate
                  cannot start another qualification.&rdquo;
                </p>
              </div>
            </div>

            <div className="self-gov-grid">
              <div className="self-gov-detail">
                <span className="gov-label">Governed Meta-Workload</span>
                <span className="gov-value">{selfGovernance.workloadName}</span>
              </div>
              <div className="self-gov-detail">
                <span className="gov-label">Candidate Version</span>
                <span className="gov-value">{selfGovernance.candidateVersion} (Stage: {selfGovernance.qualificationProgress})</span>
              </div>
              <div className="self-gov-detail">
                <span className="gov-label">Planner Model (Self-Proposer)</span>
                <span className="gov-value pinned">{selfGovernance.plannerModel} ({selfGovernance.instructionsPinned ? 'Pinned Instructions' : 'Unpinned'})</span>
              </div>
              <div className="self-gov-detail">
                <span className="gov-label">Independent Evaluator Model</span>
                <span className="gov-value independent">
                  {selfGovernance.judgeModel} (Independent Judge Enforced)
                </span>
              </div>
            </div>

            <div className="self-gov-progress">
              <div className="progress-info">
                <span>Self-Qualification Gate Progress:</span>
                <strong>{selfGovernance.checksPassed} of {selfGovernance.checksTotal} Checks Passed</strong>
              </div>
              <div className="progress-bar-wrap">
                <div
                  className="progress-fill"
                  style={{ width: `${(selfGovernance.checksPassed / selfGovernance.checksTotal) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="recursion-limit-callout">
              <Info size={14} />
              <span>
                <strong>Recursion Depth Limit = 1:</strong> {selfGovernance.recursionRuleText}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
