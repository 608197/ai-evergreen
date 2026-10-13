import React, { useState } from 'react';
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
  Zap,
  ArrowRight,
  Check,
  Activity,
  LayoutGrid,
  Table as TableIcon,
  Flame,
  Award,
} from 'lucide-react';
import './ControlsScreen.css';

// 12 Feasibility Spike Hypotheses from Section 10 of Market Analysis & Charter
const SPIKE_HYPOTHESES = [
  { id: 'H1', category: 'blast', name: 'Blast-Radius Recall', target: '≥95% (0 High/Critical Misses)', measured: '100% (6/6 Affected Apps)', pct: 100, status: 'PASS', notes: 'Zero missed dependencies; transitivity detected' },
  { id: 'H2', category: 'blast', name: 'Direct vs Transitive Split', target: '100% Concordance', measured: '3 Direct / 3 Transitive', pct: 100, status: 'PASS', notes: 'Correctly partitions agent-mediated blast paths' },
  { id: 'H3', category: 'defect', name: 'Risk Rubric Concordance', target: '6/6 Workload Tiers Matched', measured: '6/6 Correctly Classified', pct: 100, status: 'PASS', notes: 'Tier 1 to 4 with deterministic overrides active' },
  { id: 'H4', category: 'defect', name: 'Critical Regressions Missed', target: 'Strictly 0 (Zero Tolerance)', measured: '0 Missed (12/12 Defect Catalog)', pct: 100, status: 'PASS', notes: '100% detection of seeded critical defects' },
  { id: 'H5', category: 'opt', name: 'Test Suite Optimization', target: '≥40% Compute Reduction', measured: '72% Reduction (134 of 480 Tests)', pct: 72, status: 'PASS', notes: 'Proportionate test selection without safety loss' },
  { id: 'H6', category: 'opt', name: 'Machine-Readable Exclusions', target: '100% Explained', measured: '100% Attached Reason Codes', pct: 100, status: 'PASS', notes: 'Zero unreasoned test exclusions in audit log' },
  { id: 'H7', category: 'defect', name: 'Planted Gap Discovery', target: 'Detected before Promotion', measured: 'Found (GEN-01 Parallel Tool Invariant)', pct: 100, status: 'PASS', notes: 'Autonomous missing-evidence proposal verified' },
  { id: 'H8', category: 'gov', name: 'Treatment Concordance', target: '6/6 Match Expert Panel', measured: '6/6 Matched Decisions', pct: 100, status: 'PASS', notes: '2 Migrate, 2 Canary, 1 Investigate, 1 Block' },
  { id: 'H9', category: 'gov', name: 'Unapproved Promotions', target: 'Strictly 0 (Zero Tolerance)', measured: '0 Promotions Allowed', pct: 100, status: 'PASS', notes: 'Hard Stop K-014 fail-closed gate verified' },
  { id: 'H10', category: 'gov', name: 'Cryptographic Trail Integrity', target: '100% Chain Completeness', measured: '100% SHA-256 Merkle Provenance', pct: 100, status: 'PASS', notes: 'Tamper-proof event-to-decision audit ledger' },
  { id: 'H11', category: 'opt', name: 'Repeat-Event Acceleration', target: '≥40% Faster Planning', measured: '42% Cycle Time Reduction', pct: 42, status: 'PASS', notes: 'Institutional Memory reuses approved evidence' },
  { id: 'H12', category: 'gov', name: 'Effort Model Accuracy', target: 'Within ±25% of Baseline', measured: '-18% Variance (Within Bounds)', pct: 82, status: 'PASS', notes: 'Calibrated against enterprise QA baseline' },
];

export const ControlsScreen: React.FC = () => {
  const {
    kernelElements,
    hardStops,
    approvalAuthorities,
    selfGovernance,
    triggerHardStop,
  } = useEvergreenStore();

  // Tab state
  const [activeTab, setActiveTab] = useState<'invariants' | 'hypotheses' | 'authority' | 'boundary'>('invariants');

  // Hypotheses category filter
  const [hypoCategory, setHypoCategory] = useState<'all' | 'blast' | 'defect' | 'opt' | 'gov'>('all');

  // Kernel elements view mode
  const [kernelViewMode, setKernelViewMode] = useState<'cards' | 'table'>('cards');

  const filteredHypotheses = SPIKE_HYPOTHESES.filter((h) => {
    if (hypoCategory === 'all') return true;
    return h.category === hypoCategory;
  });

  return (
    <div className="controls-screen">
      {/* Header */}
      <header className="controls-header">
        <div className="controls-title-row">
          <Sliders className="controls-title-icon" size={28} />
          <div>
            <h1 className="controls-title">Controls &amp; Trusted Kernel Inspection</h1>
            <p className="controls-subtitle">
              Visible proof that AI Evergreen operates within strict deterministic boundaries, immutable hard stops, and self-governance limits.
            </p>
          </div>
        </div>

        {/* Read-Only Invariant Notice */}
        <div className="readonly-banner">
          <Lock size={15} />
          <span>
            <strong>Read-only audit view.</strong> No control on this screen can edit a rule or authorize an action.
            Kernel modifications require a versioned pull request with cryptographic sign-off.
          </span>
        </div>
      </header>

      {/* Main Body */}
      <div className="controls-body">
        {/* Global Hero Infographic: Deterministic-First Execution Architecture */}
        <section className="kernel-pipeline-card">
          <div className="k-pipeline-header">
            <div className="k-pipeline-title-group">
              <Zap size={20} className="k-pipeline-icon" />
              <div>
                <h3 className="k-pipeline-title">Deterministic-First Governance Architecture</h3>
                <p className="k-pipeline-subtitle">
                  Enforcing Operating Principle #2: Deterministic checks run before probabilistic judgment. LLMs advise; policy determines.
                </p>
              </div>
            </div>
            <div className="k-circuit-badge">
              <ShieldCheck size={14} /> Fail-Closed Security Circuit Active
            </div>
          </div>

          <div className="k-pipeline-stages">
            {/* Stage 1 */}
            <div className="k-pipeline-stage highlight-red">
              <div className="k-stage-number">01</div>
              <div className="k-stage-content">
                <div className="k-stage-tag">DETERMINISTIC KERNEL</div>
                <div className="k-stage-val">8 Hard-Coded Rules</div>
                <div className="k-stage-desc">Fail-closed blocks execute first; zero LLM override</div>
              </div>
            </div>

            <div className="k-pipeline-connector">
              <ArrowRight size={14} className="k-connector-arrow" />
            </div>

            {/* Stage 2 */}
            <div className="k-pipeline-stage highlight-cyan">
              <div className="k-stage-number">02</div>
              <div className="k-stage-content">
                <div className="k-stage-tag">PROBABILISTIC ADVISOR</div>
                <div className="k-stage-val">LLM Evaluators</div>
                <div className="k-stage-desc">Semantic judges score nuance; advisory only</div>
              </div>
            </div>

            <div className="k-pipeline-connector">
              <ArrowRight size={14} className="k-connector-arrow" />
            </div>

            {/* Stage 3 */}
            <div className="k-pipeline-stage highlight-emerald">
              <div className="k-stage-number">03</div>
              <div className="k-stage-content">
                <div className="k-stage-tag">HUMAN AUTHORITY</div>
                <div className="k-stage-val">Signed Sign-Off</div>
                <div className="k-stage-desc">Role-based promotion gate; zero autonomous deploy</div>
              </div>
            </div>
          </div>
        </section>

        {/* Primary Screen Tabs */}
        <nav className="controls-nav-tabs">
          <button
            type="button"
            className={`controls-nav-tab ${activeTab === 'invariants' ? 'active' : ''}`}
            onClick={() => setActiveTab('invariants')}
          >
            <Shield size={16} />
            <span>Deterministic Invariants &amp; Hard Stops</span>
            <span className="ctrl-tab-badge">{hardStops.length} Stops &bull; {kernelElements.length} Rules</span>
          </button>

          <button
            type="button"
            className={`controls-nav-tab ${activeTab === 'hypotheses' ? 'active' : ''}`}
            onClick={() => setActiveTab('hypotheses')}
          >
            <Award size={16} />
            <span>Spike Acceptance Matrix (H1&ndash;H12)</span>
            <span className="ctrl-tab-badge highlight">12/12 PASS</span>
          </button>

          <button
            type="button"
            className={`controls-nav-tab ${activeTab === 'authority' ? 'active' : ''}`}
            onClick={() => setActiveTab('authority')}
          >
            <Users size={16} />
            <span>Human Authority &amp; Self-Governance</span>
            <span className="ctrl-tab-badge">4 Tiers</span>
          </button>

          <button
            type="button"
            className={`controls-nav-tab ${activeTab === 'boundary' ? 'active' : ''}`}
            onClick={() => setActiveTab('boundary')}
          >
            <Layers size={16} />
            <span>Enterprise Scope Boundary &amp; Moat</span>
            <span className="ctrl-tab-badge">Build vs Integrate</span>
          </button>
        </nav>

        {/* =========================================================================
            TAB 1: Deterministic Invariants & Hard Stops
            ========================================================================= */}
        {activeTab === 'invariants' && (
          <div className="controls-tab-content">
            {/* Sub-Section 1: 7 Charter Hard Stops with Phase Circuit */}
            <section className="tab-card-block">
              <div className="block-header">
                <div>
                  <h3 className="block-title">7 Charter Hard Stops (Non-Negotiable)</h3>
                  <p className="block-sub">
                    Enforced by code, not prompt engineering. A violation terminates qualification immediately via fail-closed circuit.
                  </p>
                </div>
                <div className="circuit-summary-pill">
                  <Flame size={13} className="text-red-500" />
                  <span>Immediate Interstitial Trip (Overlay O4)</span>
                </div>
              </div>

              {/* Lifecycle Phase Strip */}
              <div className="lifecycle-phase-strip">
                <div className="phase-step">
                  <span className="phase-num">PHASE 1</span>
                  <span className="phase-name">Intake &amp; Discovery</span>
                  <div className="phase-tags">
                    <span className="tag-stop">HS-01</span>
                    <span className="tag-stop">HS-02</span>
                  </div>
                </div>
                <div className="phase-arrow">&rarr;</div>
                <div className="phase-step">
                  <span className="phase-num">PHASE 2</span>
                  <span className="phase-name">Regression Planning</span>
                  <div className="phase-tags">
                    <span className="tag-stop">HS-03</span>
                    <span className="tag-stop">HS-04</span>
                  </div>
                </div>
                <div className="phase-arrow">&rarr;</div>
                <div className="phase-step">
                  <span className="phase-num">PHASE 3</span>
                  <span className="phase-name">Evaluation Execution</span>
                  <div className="phase-tags">
                    <span className="tag-stop">HS-05</span>
                    <span className="tag-stop">HS-06</span>
                  </div>
                </div>
                <div className="phase-arrow">&rarr;</div>
                <div className="phase-step">
                  <span className="phase-num">PHASE 4</span>
                  <span className="phase-name">Promotion Gate</span>
                  <div className="phase-tags">
                    <span className="tag-stop">HS-07</span>
                  </div>
                </div>
              </div>

              {/* Hard Stops Cards Grid */}
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
                      <span className="hs-stage">Phase: <strong>{hs.stage}</strong></span>
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

            {/* Sub-Section 2: 8 Trusted Kernel Elements with Hit Meters */}
            <section className="tab-card-block">
              <div className="block-header">
                <div>
                  <h3 className="block-title">8 Trusted Kernel Deterministic Elements</h3>
                  <p className="block-sub">
                    Rule-based, tamper-resistant modules that execute prior to any probabilistic LLM advisor.
                  </p>
                </div>
                <div className="view-mode-toggle">
                  <button
                    type="button"
                    className={`view-mode-btn ${kernelViewMode === 'cards' ? 'active' : ''}`}
                    onClick={() => setKernelViewMode('cards')}
                  >
                    <LayoutGrid size={13} /> Infographic Cards
                  </button>
                  <button
                    type="button"
                    className={`view-mode-btn ${kernelViewMode === 'table' ? 'active' : ''}`}
                    onClick={() => setKernelViewMode('table')}
                  >
                    <TableIcon size={13} /> Data Table
                  </button>
                </div>
              </div>

              {kernelViewMode === 'cards' ? (
                <div className="kernel-cards-grid">
                  {kernelElements.map((el) => (
                    <div key={el.id} className="kernel-card">
                      <div className="kcard-top">
                        <div className="kcard-id-wrap">
                          <code className="kcard-id">{el.id}</code>
                          <span className="kcard-det-badge">
                            <Lock size={10} /> {el.isDeterministicOnly ? 'Deterministic Only' : 'Hybrid'}
                          </span>
                        </div>
                        <div className={`kcard-hit-pill ${el.hitCount > 0 ? 'active' : ''}`}>
                          <Activity size={12} />
                          <span>{el.hitCount} Hits</span>
                        </div>
                      </div>

                      <h4 className="kcard-title">{el.name}</h4>
                      <p className="kcard-desc">{el.description}</p>

                      {/* Execution Hit Meter */}
                      <div className="kcard-meter-block">
                        <div className="kcard-meter-labels">
                          <span>Active Event Shield Rate</span>
                          <strong>{el.hitCount > 0 ? `${el.hitCount} Interceptions` : 'Standing Guard'}</strong>
                        </div>
                        <div className="kcard-meter-bar">
                          <div
                            className="kcard-meter-fill"
                            style={{ width: `${Math.min(el.hitCount * 25, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="kcard-footer">
                        <div className="kcard-owner">
                          <span>Owner:</span>
                          <strong>{el.changeControlOwner}</strong>
                        </div>
                        {el.lastHitRule && (
                          <div className="kcard-last-hit">
                            <span>Last Rule:</span>
                            <code>{el.lastHitRule}</code>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="controls-table-container">
                  <table className="controls-table">
                    <thead>
                      <tr>
                        <th>Element ID</th>
                        <th>Element Name</th>
                        <th>Description &amp; Guarantees</th>
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
              )}
            </section>
          </div>
        )}

        {/* =========================================================================
            TAB 2: Spike Acceptance Matrix (H1–H12)
            ========================================================================= */}
        {activeTab === 'hypotheses' && (
          <div className="controls-tab-content">
            {/* Unconditional GO Scorecard Hero Infographic */}
            <div className="scorecard-hero">
              <div className="scorecard-left">
                <div className="scorecard-dial-wrap">
                  <div className="scorecard-radial">
                    <span className="scorecard-big-num">12/12</span>
                    <span className="scorecard-big-sub">PASSED</span>
                  </div>
                </div>
                <div className="scorecard-hero-text">
                  <div className="hero-status-pill">
                    <CheckCircle2 size={14} /> UNCONDITIONAL GO DEPLOYMENT BAR
                  </div>
                  <h3 className="scorecard-hero-title">100% Feasibility Spike Criteria Satisfied</h3>
                  <p className="scorecard-hero-desc">
                    All 12 formal hypotheses defined in Section 10 of the Charter have been met or exceeded.
                    Zero critical regressions missed across 6 enterprise workloads.
                  </p>
                </div>
              </div>

              <div className="scorecard-right-clusters">
                <div className="cluster-card">
                  <span className="cluster-label">Blast Radius Recall</span>
                  <span className="cluster-val">100%</span>
                  <span className="cluster-note">H1, H2 Verified</span>
                </div>
                <div className="cluster-card">
                  <span className="cluster-label">Critical Defects Missed</span>
                  <span className="cluster-val text-pass">0 Misses</span>
                  <span className="cluster-note">H3, H4, H7 Verified</span>
                </div>
                <div className="cluster-card">
                  <span className="cluster-label">Compute Reduction</span>
                  <span className="cluster-val">72%</span>
                  <span className="cluster-note">H5 (&ge;40% Target)</span>
                </div>
                <div className="cluster-card">
                  <span className="cluster-label">Promotion Integrity</span>
                  <span className="cluster-val">0 Breaches</span>
                  <span className="cluster-note">H8, H9, H10 Verified</span>
                </div>
              </div>
            </div>

            {/* Category Filter Strip */}
            <div className="hypo-filter-strip">
              <button
                type="button"
                className={`hypo-pill ${hypoCategory === 'all' ? 'active' : ''}`}
                onClick={() => setHypoCategory('all')}
              >
                All Gates (12)
              </button>
              <button
                type="button"
                className={`hypo-pill ${hypoCategory === 'blast' ? 'active' : ''}`}
                onClick={() => setHypoCategory('blast')}
              >
                Blast Radius Recall (2)
              </button>
              <button
                type="button"
                className={`hypo-pill ${hypoCategory === 'defect' ? 'active' : ''}`}
                onClick={() => setHypoCategory('defect')}
              >
                Defect Detection &amp; Recall (3)
              </button>
              <button
                type="button"
                className={`hypo-pill ${hypoCategory === 'opt' ? 'active' : ''}`}
                onClick={() => setHypoCategory('opt')}
              >
                Optimization &amp; Explainability (3)
              </button>
              <button
                type="button"
                className={`hypo-pill ${hypoCategory === 'gov' ? 'active' : ''}`}
                onClick={() => setHypoCategory('gov')}
              >
                Governance &amp; Audit Trail (4)
              </button>
            </div>

            {/* Hypotheses Grid with Target vs Measured Visual Meters */}
            <div className="hypotheses-grid">
              {filteredHypotheses.map((h) => (
                <div key={h.id} className="hypothesis-card">
                  <div className="h-header">
                    <div className="h-id-group">
                      <span className="h-id">{h.id}</span>
                      <span className="h-cat-chip">{h.category.toUpperCase()}</span>
                    </div>
                    <span className="h-status-tag">
                      <CheckCircle2 size={12} /> {h.status}
                    </span>
                  </div>

                  <h4 className="h-name">{h.name}</h4>

                  {/* Visual Progress Meter (Target vs Measured) */}
                  <div className="h-meter-block">
                    <div className="h-meter-labels">
                      <span className="h-target-label">Target: <strong>{h.target}</strong></span>
                      <span className="h-measured-label">{h.measured}</span>
                    </div>
                    <div className="h-meter-bar">
                      <div
                        className="h-meter-fill"
                        style={{ width: `${Math.min(h.pct, 100)}%` }}
                      />
                    </div>
                  </div>

                  <p className="h-notes">{h.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: Human Authority & Self-Governance
            ========================================================================= */}
        {activeTab === 'authority' && (
          <div className="controls-tab-content">
            {/* Workload Criticality Tier Ladder (Infographic) */}
            <section className="tab-card-block">
              <div className="block-header">
                <div>
                  <h3 className="block-title">Workload Criticality Escalation Ladder</h3>
                  <p className="block-sub">
                    Mandatory human roles and dual-confirmation locks required to authorize production promotion.
                  </p>
                </div>
                <div className="circuit-summary-pill">
                  <Lock size={13} />
                  <span>Immutable Sign-Off Gate</span>
                </div>
              </div>

              {/* Visual Tier Escalation Hierarchy */}
              <div className="tier-ladder-container">
                {approvalAuthorities.map((auth, idx) => (
                  <div key={auth.riskTier} className={`tier-ladder-step tier-${auth.riskTier.toLowerCase()}`}>
                    <div className="tier-step-rank">0{4 - idx}</div>
                    
                    <div className="tier-step-main">
                      <div className="tier-step-header">
                        <span className={`risk-tag ${auth.riskTier.toLowerCase()}`}>
                          {auth.riskTier} TIER
                        </span>
                        <span className="tier-workload-type">{auth.workloadType}</span>
                        <div className="tier-expiry-chip">
                          <Zap size={11} /> Expiry: {auth.expiryHours}h
                        </div>
                      </div>

                      <div className="tier-step-roles">
                        <span className="roles-label">Required Sign-Off Authority:</span>
                        <div className="roles-wrap">
                          {auth.requiredRoles.map((r) => (
                            <span key={r} className="role-tag">
                              <Users size={11} /> {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="tier-step-lock">
                      {auth.dualConfirmForRollback ? (
                        <div className="dual-lock-pill mandatory">
                          <Lock size={13} />
                          <span>Dual Confirmation Mandatory</span>
                        </div>
                      ) : (
                        <div className="dual-lock-pill standard">
                          <Check size={13} />
                          <span>Single Owner Sign-Off</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Recursive Self-Governance Safeguard Panel */}
            <section className="tab-card-block">
              <div className="block-header">
                <div>
                  <h3 className="block-title">Self-Governance &amp; Recursive Safeguards</h3>
                  <p className="block-sub">
                    AI Evergreen qualifies itself as an enterprise workload while strictly forbidding self-marking.
                  </p>
                </div>
              </div>

              <div className="self-gov-card">
                {/* Critical Invariant Callout */}
                <div className="self-gov-invariant-box">
                  <Shield size={22} className="invariant-icon" />
                  <div>
                    <strong>Operating Principle #10 &mdash; Self-Governance Invariant:</strong>
                    <p>
                      &ldquo;AI Evergreen can qualify itself. It cannot mark its own work or approve its own promotion.
                      Validation is limited to one level: the approved Evergreen qualifies the candidate, and the candidate
                      cannot start another qualification.&rdquo;
                    </p>
                  </div>
                </div>

                {/* Visual Independent Judge Flowchart */}
                <div className="self-gov-flowchart">
                  <div className="sg-node approved">
                    <span className="sg-node-type">APPROVED RUNTIME</span>
                    <strong>AI Evergreen v1.2</strong>
                    <span className="sg-node-meta">Pinned Orchestrator</span>
                  </div>

                  <div className="sg-arrow-col">
                    <span className="sg-arrow-label">Qualifies</span>
                    <ArrowRight size={16} />
                  </div>

                  <div className="sg-node candidate">
                    <span className="sg-node-type">CANDIDATE VERSION</span>
                    <strong>{selfGovernance.workloadName} ({selfGovernance.candidateVersion})</strong>
                    <span className="sg-node-meta">Stage: {selfGovernance.qualificationProgress}</span>
                  </div>

                  <div className="sg-arrow-col">
                    <span className="sg-arrow-label">Evaluated By</span>
                    <ArrowRight size={16} />
                  </div>

                  <div className="sg-node judge">
                    <span className="sg-node-type">INDEPENDENT JUDGE</span>
                    <strong>{selfGovernance.judgeModel}</strong>
                    <span className="sg-node-meta">Self-Marking Prohibited 🛡️</span>
                  </div>
                </div>

                {/* Progress Bar & Limits */}
                <div className="self-gov-progress">
                  <div className="progress-info">
                    <span>Self-Qualification Gate Progress:</span>
                    <strong>{selfGovernance.checksPassed} of {selfGovernance.checksTotal} Checks Passed (100%)</strong>
                  </div>
                  <div className="progress-bar-wrap">
                    <div
                      className="progress-fill"
                      style={{ width: `${(selfGovernance.checksPassed / selfGovernance.checksTotal) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="recursion-limit-callout">
                  <Info size={15} />
                  <span>
                    <strong>Recursion Depth Limit = 1:</strong> {selfGovernance.recursionRuleText}
                  </span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =========================================================================
            TAB 4: Enterprise Scope Boundary & Moat
            ========================================================================= */}
        {activeTab === 'boundary' && (
          <div className="controls-tab-content">
            {/* 3-Tier Enterprise Control Plane Architecture Infographic */}
            <section className="tab-card-block">
              <div className="block-header">
                <div>
                  <h3 className="block-title">3-Tier Enterprise Control Plane Architecture</h3>
                  <p className="block-sub">
                    Defensible scope alignment (Section 7). AI Evergreen does not duplicate commodity infrastructure; it acts as the orchestrating qualification control plane.
                  </p>
                </div>
                <div className="circuit-summary-pill">
                  <Cpu size={13} />
                  <span>Cognizant AI Ecosystem Aligned</span>
                </div>
              </div>

              {/* 3 Tier Stack Graphic */}
              <div className="architecture-stack-graphic">
                {/* Tier 1 */}
                <div className="arch-tier-row top">
                  <div className="tier-row-badge">TIER 1: ENTERPRISE SYSTEMS OF RECORD</div>
                  <div className="tier-row-content">
                    <div className="tier-sys-card">ServiceNow AI Control Tower / CMDB</div>
                    <div className="tier-sys-card">Wiz AI-SPM / Prisma Cloud</div>
                    <div className="tier-sys-card">Jira / Xray Test Management</div>
                    <div className="tier-sys-card">Enterprise GRC / ITSM</div>
                  </div>
                </div>

                <div className="arch-tier-connector">&uarr;&darr; Bidirectional Sync Adapters</div>

                {/* Tier 2 */}
                <div className="arch-tier-row core">
                  <div className="tier-row-badge core-badge">TIER 2: AI EVERGREEN QUALIFICATION CONTROL PLANE (PROPRIETARY MOAT)</div>
                  <div className="tier-core-grid">
                    <div className="tier-core-pill">Change Ingestor</div>
                    <div className="tier-core-pill">Qualification Graph</div>
                    <div className="tier-core-pill">Behavioral Contracts</div>
                    <div className="tier-core-pill">Deterministic Kernel</div>
                    <div className="tier-core-pill">Regression Planner</div>
                    <div className="tier-core-pill">Merkle Audit Store</div>
                  </div>
                </div>

                <div className="arch-tier-connector">&uarr;&darr; Canary Traffic Splitting &amp; Rollback Triggers (&lt;850ms)</div>

                {/* Tier 3 */}
                <div className="arch-tier-row bottom">
                  <div className="tier-row-badge">TIER 3: RUNTIME GATEWAYS &amp; MODEL PROVIDERS</div>
                  <div className="tier-row-content">
                    <div className="tier-sys-card">Cognizant AI Gateway / LiteLLM Proxy</div>
                    <div className="tier-sys-card">Amazon Bedrock Model Registry</div>
                    <div className="tier-sys-card">Azure OpenAI &amp; Foundry</div>
                    <div className="tier-sys-card">LangSmith / Arize Phoenix Tracing</div>
                  </div>
                </div>
              </div>

              {/* 3 Boundary Columns (Build / Integrate / Do Not Build) */}
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
                    <li><strong>Behavioural Contract Store:</strong> Versioned YAML/JSON non-negotiables &amp; tool schemas.</li>
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
                    <li><strong>Model Hosting &amp; Fine-Tuning:</strong> Handled by cloud hyperscalers (Bedrock, Azure OpenAI, Vertex AI).</li>
                    <li><strong>Generic LLM Routing &amp; Rate Limiting:</strong> Handled by Cognizant AI Gateway / LiteLLM.</li>
                    <li><strong>Generic AI Security Scanning:</strong> Handled by Wiz AI-SPM / Palo Alto Prisma.</li>
                    <li><strong>Token &amp; Cost Metering:</strong> Handled by Gateway / Cloud FinOps platforms.</li>
                    <li><strong>Standalone Enterprise CMDB:</strong> Handled by ServiceNow CSDM / Enterprise Architecture.</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlsScreen;
