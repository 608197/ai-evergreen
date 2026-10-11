import React from 'react';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import {
  Sliders,
  Shield,
  Lock,
  AlertOctagon,
  Users,
  Info,
  CheckCircle2,
  Layers,
  ShieldCheck,
  ExternalLink,
  Cpu,
} from 'lucide-react';
import './ControlsScreen.css';

// 12 Feasibility Spike Hypotheses from Section 10 of Market Analysis & Charter
const SPIKE_HYPOTHESES = [
  { id: 'H1', name: 'Blast-Radius Recall', target: '≥95% (0 High/Critical Misses)', measured: '100% (6/6 Affected Apps)', status: 'PASS', notes: 'Zero missed dependencies; transitivity detected' },
  { id: 'H2', name: 'Direct vs Transitive Split', target: '100% Concordance', measured: '3 Direct / 3 Transitive', status: 'PASS', notes: 'Correctly partitions agent-mediated blast paths' },
  { id: 'H3', name: 'Risk Rubric Concordance', target: '6/6 Workload Tiers Matched', measured: '6/6 Correctly Classified', status: 'PASS', notes: 'Tier 1 to 4 with deterministic overrides active' },
  { id: 'H4', name: 'Critical Regressions Missed', target: 'Strictly 0 (Zero Tolerance)', measured: '0 Missed (12/12 Defect Catalog)', status: 'PASS', notes: '100% detection of seeded critical defects' },
  { id: 'H5', name: 'Test Suite Optimization', target: '≥40% Compute Reduction', measured: '58% Reduction (134 of 480 Tests)', status: 'PASS', notes: 'Proportionate test selection without safety loss' },
  { id: 'H6', name: 'Machine-Readable Exclusions', target: '100% Explained', measured: '100% Attached Reason Codes', status: 'PASS', notes: 'Zero unreasoned test exclusions in audit log' },
  { id: 'H7', name: 'Planted Gap Discovery', target: 'Detected before Promotion', measured: 'Found (GEN-01 Parallel Tool Invariant)', status: 'PASS', notes: 'Autonomous missing-evidence proposal verified' },
  { id: 'H8', name: 'Treatment Concordance', target: '6/6 Match Expert Panel', measured: '6/6 Matched Decisions', status: 'PASS', notes: '2 Migrate, 2 Canary, 1 Investigate, 1 Block' },
  { id: 'H9', name: 'Unapproved Promotions', target: 'Strictly 0 (Zero Tolerance)', measured: '0 Promotions Allowed', status: 'PASS', notes: 'Hard Stop K-014 fail-closed gate verified' },
  { id: 'H10', name: 'Cryptographic Trail Integrity', target: '100% Chain Completeness', measured: '100% SHA-256 Merkle Provenance', status: 'PASS', notes: 'Tamper-proof event-to-decision audit ledger' },
  { id: 'H11', name: 'Repeat-Event Acceleration', target: '≥40% Faster Planning', measured: '42% Cycle Time Reduction', status: 'PASS', notes: 'Institutional Memory reuses approved evidence' },
  { id: 'H12', name: 'Effort Model Accuracy', target: 'Within ±25% of Baseline', measured: '-18% Variance (Within Bounds)', status: 'PASS', notes: 'Calibrated against enterprise QA baseline' },
];

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
        {/* Section 0: 12 Qualification Safety Gates (H1–H12 Spiked Verification Matrix) */}
        <section className="controls-section hypotheses-section">
          <div className="section-header">
            <div>
              <div className="section-eyebrow-row">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span className="section-eyebrow">FEASIBILITY SPIKE ACCEPTANCE GATEWAY</span>
                <span className="unconditional-go-badge">UNCONDITIONAL GO (12/12 PASS)</span>
              </div>
              <h2 className="section-heading">12 Formal Spike Hypotheses & Safety Invariant Gates</h2>
              <p className="section-subheading">
                Verifiable proof against the pre-agreed feasibility charter thresholds (Section 10). Zero safety breaches permitted.
              </p>
            </div>
          </div>

          <div className="hypotheses-grid">
            {SPIKE_HYPOTHESES.map((h) => (
              <div key={h.id} className="hypothesis-card">
                <div className="h-header">
                  <span className="h-id">{h.id}</span>
                  <span className="h-status-tag"><CheckCircle2 size={12} /> {h.status}</span>
                </div>
                <h4 className="h-name">{h.name}</h4>
                <div className="h-metric-row">
                  <div className="h-metric-col">
                    <span className="h-label">Charter Threshold</span>
                    <span className="h-target">{h.target}</span>
                  </div>
                  <div className="h-metric-col">
                    <span className="h-label">Measured Value</span>
                    <span className="h-measured">{h.measured}</span>
                  </div>
                </div>
                <p className="h-notes">{h.notes}</p>
              </div>
            ))}
          </div>
        </section>

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

        {/* Section 5: Enterprise Scope & Build-vs-Integrate Boundary */}
        <section className="controls-section boundary-section">
          <div className="section-header">
            <div>
              <div className="section-eyebrow-row">
                <Layers size={16} className="text-brand-primary" />
                <span className="section-eyebrow">ENTERPRISE INTEGRATION ARCHITECTURE</span>
                <span className="boundary-badge">COGNIZANT AI ECOSYSTEM ALIGNED</span>
              </div>
              <h2 className="section-heading">Build vs. Integrate vs. Out-of-Scope Boundary Matrix</h2>
              <p className="section-subheading">
                Defensible architectural scope (Section 7). AI Evergreen does not duplicate commodity infrastructure; it acts as the orchestrating qualification control plane.
              </p>
            </div>
          </div>

          <div className="boundary-grid">
            {/* Column 1: BUILD */}
            <div className="boundary-col build-col">
              <div className="b-header">
                <Cpu size={16} className="text-brand-primary" />
                <h3 className="b-title">BUILD (AI Evergreen Core Moat)</h3>
                <span className="b-badge build-badge">Proprietary Whitespace</span>
              </div>
              <p className="b-desc">Change-triggered orchestration and compounding institutional memory layer.</p>
              <ul className="b-list">
                <li><strong>Change Event Ingestor:</strong> Normalizes model retirement, release, pricing, and policy signals.</li>
                <li><strong>Qualification Graph Engine:</strong> Extends enterprise graph with contracts, tests, and outcome edges.</li>
                <li><strong>Behavioural Contract Store:</strong> Versioned YAML/JSON non-negotiables & tool schemas.</li>
                <li><strong>Risk Classifier:</strong> 6-dimension rubric + deterministic overrides.</li>
                <li><strong>Adaptive Regression Planner:</strong> Minimum-sufficient selection + machine-readable exclusion rationales.</li>
                <li><strong>Missing-Test Synthesizer:</strong> Proactively generates tests for candidate delta capabilities (GEN-01).</li>
                <li><strong>Deterministic Trusted Kernel:</strong> Rule-based fail-closed assertions; zero LLM self-marking.</li>
                <li><strong>Append-Only Evidence Store:</strong> Tamper-resistant SHA-256 Merkle-tree audit ledger.</li>
                <li><strong>Institutional Qualification Memory:</strong> Cross-cycle compounding knowledge engine.</li>
              </ul>
            </div>

            {/* Column 2: INTEGRATE */}
            <div className="boundary-col integrate-col">
              <div className="b-header">
                <ExternalLink size={16} className="text-emerald-400" />
                <h3 className="b-title">INTEGRATE (Industry Standard Platforms)</h3>
                <span className="b-badge integrate-badge">Enterprise Adapters</span>
              </div>
              <p className="b-desc">Consumes authoritative enterprise systems of record and runtime gateways.</p>
              <ul className="b-list">
                <li><strong>ServiceNow AI Control Tower / CMDB:</strong> Reads asset identities, model/agent relationships, and ownership.</li>
                <li><strong>Wiz AI-SPM / Prisma Cloud:</strong> Ingests AI security posture, attack paths, and vulnerability findings.</li>
                <li><strong>Cognizant AI Gateway / LiteLLM:</strong> Enforces canary traffic splitting, routing, and &lt;850ms rollback.</li>
                <li><strong>Microsoft Foundry / Amazon Bedrock:</strong> Submits evaluation batches and collects raw execution metrics.</li>
                <li><strong>LangSmith / Arize Phoenix:</strong> Ingests multi-turn traces, latency, and token cost telemetry.</li>
                <li><strong>Jira / Xray Test Management:</strong> Links test evidence, defects, and accountable human sign-offs.</li>
                <li><strong>Enterprise GRC / ServiceNow ITSM:</strong> Writes immutable compliance audit change records.</li>
              </ul>
            </div>

            {/* Column 3: DO NOT BUILD */}
            <div className="boundary-col out-of-scope-col">
              <div className="b-header">
                <Lock size={16} className="text-slate-400" />
                <h3 className="b-title">DO NOT BUILD (Commodity / Out of Scope)</h3>
                <span className="b-badge oos-badge">Defensible Boundary</span>
              </div>
              <p className="b-desc">Commodity components deliberately excluded to prevent scope creep.</p>
              <ul className="b-list">
                <li><strong>Model Hosting & Fine-Tuning:</strong> Handled by cloud hyperscalers (Bedrock, Azure OpenAI, Vertex AI).</li>
                <li><strong>Generic LLM Routing & Rate Limiting:</strong> Handled by Cognizant AI Gateway / LiteLLM.</li>
                <li><strong>Generic AI Security Scanning:</strong> Handled by Wiz AI-SPM / Palo Alto Prisma.</li>
                <li><strong>Token & Cost Metering:</strong> Handled by Gateway / Cloud FinOps platforms.</li>
                <li><strong>Standalone Enterprise CMDB:</strong> Handled by ServiceNow CSDM / Enterprise Architecture.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
