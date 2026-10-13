import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import { StatTile } from '../../components/common/StatTile';
import { StatusChip } from '../../components/common/StatusChip';
import {
  BrainCircuit,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
  Clock,
  TrendingUp,
  Workflow,
  ChevronDown,
  ChevronUp,
  Radar,
  CheckCircle2,
  GitCommit,
  Bot,
  FileText,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import './MemoryScreen.css';

export const MemoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    memoryPatterns,
    memoryReuseLog,
    contractProposals,
    events,
  } = useEvergreenStore();

  const [patternFilter, setPatternFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [expandedPatterns, setExpandedPatterns] = useState<Record<string, boolean>>({
    'mem-pat-1': true,
    'mem-pat-2': true,
    'mem-pat-3': true,
  });

  const togglePatternExpand = (id: string) => {
    setExpandedPatterns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const pendingProposals = contractProposals.filter((p) => p.status === 'pending');

  const filteredPatterns = memoryPatterns.filter((pat) => {
    if (patternFilter === 'all') return true;
    return pat.severityCaught.toLowerCase() === patternFilter;
  });

  return (
    <div className="memory-screen">
      {/* Header */}
      <header className="memory-header">
        <div className="memory-title-row">
          <BrainCircuit className="memory-title-icon" size={28} />
          <div>
            <h1 className="memory-title">Qualification Memory & Regression Catalogue</h1>
            <p className="memory-subtitle">
              Persistent enterprise evidence bank. Captures trajectory regressions, preserves test assets, and proposes contract revisions.
            </p>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="memory-body">
        {/* Top 4 StatTiles */}
        <section className="memory-stats-grid">
          <StatTile
            label="Events Retained"
            value={events.length + 11}
            subtext="Complete cryptographic runs stored"
            proofType="measured"
          />
          <StatTile
            label="Recurring Patterns"
            value={memoryPatterns.length}
            subtext="Cross-event behavioral shifts"
            proofType="measured"
          />
          <StatTile
            label="Tests Reused"
            value="47"
            subtext="~18 hours test authoring saved"
            proofType="measured"
          />
          <StatTile
            label="Proposals Pending"
            value={pendingProposals.length}
            subtext="Contract version bumps queued"
            proofType="measured"
          />
        </section>

        {/* Visual Graphic 1: Interactive Qualification Memory Lifecycle */}
        <section className="memory-pipeline-card">
          <div className="pipeline-header">
            <div className="pipeline-title-group">
              <Workflow size={20} className="pipeline-icon" />
              <div>
                <h3 className="pipeline-title">Enterprise Qualification Memory Lifecycle</h3>
                <p className="pipeline-subtitle">
                  Autonomous loop: How historical qualification runs shield active change events from zero-day regressions
                </p>
              </div>
            </div>
            <div className="pipeline-badge">
              <ShieldCheck size={14} /> Closed-Loop Learning Active
            </div>
          </div>

          <div className="pipeline-stages">
            {/* Stage 1 */}
            <div className="pipeline-stage">
              <div className="stage-number">01</div>
              <div className="stage-content">
                <div className="stage-tag">CRYPTO STORE</div>
                <div className="stage-val">{events.length + 11} Past Runs</div>
                <div className="stage-desc">Verifiable cryptographic execution logs preserved</div>
              </div>
            </div>

            <div className="pipeline-connector">
              <div className="connector-line" />
              <ArrowRight size={14} className="connector-arrow" />
            </div>

            {/* Stage 2 */}
            <div className="pipeline-stage">
              <div className="stage-number">02</div>
              <div className="stage-content">
                <div className="stage-tag">TRAJECTORY SHIFTS</div>
                <div className="stage-val">{memoryPatterns.length} Signatures</div>
                <div className="stage-desc">Systemic drift signatures categorized by risk tier</div>
              </div>
            </div>

            <div className="pipeline-connector">
              <div className="connector-line" />
              <ArrowRight size={14} className="connector-arrow" />
            </div>

            {/* Stage 3 */}
            <div className="pipeline-stage highlight-emerald">
              <div className="stage-number">03</div>
              <div className="stage-content">
                <div className="stage-tag">SEEDED REUSE</div>
                <div className="stage-val">47 Probes (18h)</div>
                <div className="stage-desc">Critical invariant probes auto-selected for reuse</div>
              </div>
            </div>

            <div className="pipeline-connector">
              <div className="connector-line" />
              <ArrowRight size={14} className="connector-arrow" />
            </div>

            {/* Stage 4 */}
            <div className="pipeline-stage highlight-brand">
              <div className="stage-number">04</div>
              <div className="stage-content">
                <div className="stage-tag">ACTIVE SHIELD</div>
                <div className="stage-val">E-2026-001</div>
                <div className="stage-desc">Zero regressions missed across 6 affected apps</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: Recurring Patterns */}
        <section className="memory-section">
          <div className="section-header-row">
            <div>
              <h2 className="section-heading">Discovered Behavioral Patterns</h2>
              <p className="section-subheading">
                Systemic model behaviors identified across past qualification cycles that inform automated test planning.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="pattern-filter-strip">
              <button
                type="button"
                className={`filter-pill ${patternFilter === 'all' ? 'active' : ''}`}
                onClick={() => setPatternFilter('all')}
              >
                All Patterns ({memoryPatterns.length})
              </button>
              <button
                type="button"
                className={`filter-pill ${patternFilter === 'critical' ? 'active' : ''}`}
                onClick={() => setPatternFilter('critical')}
              >
                Critical Risk (1)
              </button>
              <button
                type="button"
                className={`filter-pill ${patternFilter === 'high' ? 'active' : ''}`}
                onClick={() => setPatternFilter('high')}
              >
                High Risk (1)
              </button>
              <button
                type="button"
                className={`filter-pill ${patternFilter === 'medium' ? 'active' : ''}`}
                onClick={() => setPatternFilter('medium')}
              >
                Medium Risk (1)
              </button>
            </div>
          </div>

          <div className="patterns-grid">
            {filteredPatterns.map((pat) => (
              <div key={pat.id} className="pattern-card">
                {/* Pattern Header */}
                <div className="pattern-header">
                  <div className="pattern-header-left">
                    <span className={`pattern-severity ${pat.severityCaught.toLowerCase()}`}>
                      <AlertTriangle size={11} /> {pat.severityCaught} Risk
                    </span>
                    {pat.isNew && <span className="pattern-new-tag">New Insight</span>}
                  </div>
                  <div className="events-tags">
                    <span className="events-label">Sources:</span>
                    {pat.sourceEvents.map((ev) => (
                      <span key={ev} className="event-tag">{ev}</span>
                    ))}
                  </div>
                </div>

                <h3 className="pattern-title">{pat.title}</h3>

                {/* Visual Graphic 2: Visual Failure Trajectory Diagram */}
                {pat.id === 'mem-pat-1' && (
                  <div className="failure-trajectory-box">
                    <div className="trajectory-title">
                      <Zap size={13} /> Failure Signature: Multi-Step Tool Call Reordering
                    </div>
                    <div className="trajectory-flow">
                      <span className="traj-node">User Query</span>
                      <span className="traj-arrow">&rarr;</span>
                      <span className="traj-node fail">Disburse Funds ⚠️</span>
                      <span className="traj-arrow">&rarr;</span>
                      <span className="traj-node skip">Auth Check Bypassed</span>
                      <span className="traj-arrow">&rarr;</span>
                      <span className="traj-node shield"><ShieldCheck size={12} /> Evergreen K-014 Enforced</span>
                    </div>
                  </div>
                )}

                {pat.id === 'mem-pat-2' && (
                  <div className="failure-trajectory-box">
                    <div className="trajectory-title">
                      <Zap size={13} /> Failure Signature: Lead-Indicator Degradation Lag
                    </div>
                    <div className="trajectory-metrics-row">
                      <div className="traj-metric pass">
                        <span className="metric-name">Tone & Fluency</span>
                        <span className="metric-val">99% (Fluent)</span>
                      </div>
                      <div className="traj-metric-lead">
                        <ArrowRight size={13} />
                        <span>Drops 24-48h First</span>
                      </div>
                      <div className="traj-metric fail">
                        <span className="metric-name">Citation Validity</span>
                        <span className="metric-val">68% (Hallucinated §4.2.1)</span>
                      </div>
                      <div className="traj-metric shield">
                        <ShieldCheck size={13} />
                        <span>Probe T-0103 Guard</span>
                      </div>
                    </div>
                  </div>
                )}

                {pat.id === 'mem-pat-3' && (
                  <div className="failure-trajectory-box">
                    <div className="trajectory-title">
                      <Zap size={13} /> Failure Signature: Silent Key Omission Drift
                    </div>
                    <div className="trajectory-diff-mini">
                      <span className="diff-tag exp">Expected Schema</span>
                      <code>{`{ "taxCode": null }`}</code>
                      <span className="diff-vs">vs</span>
                      <span className="diff-tag act">Model Revision</span>
                      <code>{`{ } (Key Omitted ❌)`}</code>
                      <span className="traj-metric shield">
                        <ShieldCheck size={13} /> Strict Schema Assert
                      </span>
                    </div>
                  </div>
                )}

                {/* Supporting Cases Strip */}
                <div className="pattern-cases">
                  <span className="cases-label">Supporting Evidence Cases:</span>
                  <ul className="cases-list">
                    {pat.supportingCases.map((cs, i) => (
                      <li key={i} className="case-item">
                        <CheckCircle2 size={12} className="case-icon" />
                        <span>{cs}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendation Box */}
                <div className="pattern-recommendation">
                  <strong><ShieldCheck size={12} /> Evergreen Policy Recommendation:</strong>
                  <p>{pat.recommendation}</p>
                </div>

                {/* Expandable Deep Dive Evidence Text */}
                <div className="pattern-deepdive-container">
                  <button
                    type="button"
                    className="pattern-deepdive-btn"
                    onClick={() => togglePatternExpand(pat.id)}
                  >
                    <span>{expandedPatterns[pat.id] ? 'Hide' : 'View'} Full Trajectory Root Cause Analysis</span>
                    {expandedPatterns[pat.id] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  {expandedPatterns[pat.id] && (
                    <div className="pattern-deepdive-body">
                      <p className="pattern-desc">{pat.description}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pattern-actions">
                  <button
                    type="button"
                    onClick={() => navigate('/estate')}
                    className="pattern-action-link"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    View affected workloads in Estate <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Test Asset Reuse Log */}
        <section className="memory-section">
          <div className="section-header">
            <div>
              <h2 className="section-heading">Seeded Invariant & Test Reuse Log</h2>
              <p className="section-subheading">
                Test probes and invariant checkers automatically carried forward to prevent known historical regressions.
              </p>
            </div>
          </div>

          {/* Visual Graphic 3: Visual ROI & Avoided Effort Distribution */}
          <div className="reuse-visual-summary-card">
            <div className="reuse-summary-left">
              <div className="metric-highlight">
                <Clock className="metric-icon" size={28} />
                <div>
                  <div className="metric-big-num">~18 Hours Avoided</div>
                  <div className="metric-label">Engineering Effort Saved via Seeded Invariants</div>
                </div>
              </div>
              <div className="reuse-efficiency-badge">
                <TrendingUp size={14} /> +64% Authoring Acceleration
              </div>
            </div>

            <div className="reuse-summary-right">
              <div className="distribution-label">
                <span>Avoided Authoring Effort by Workload</span>
                <span className="dist-total">18h Total</span>
              </div>
              <div className="distribution-bar">
                <div className="dist-segment refund" style={{ width: '67%' }} title="Refund Agent: 12 Hours (67%)">
                  12h (Refund Agent)
                </div>
                <div className="dist-segment claims" style={{ width: '33%' }} title="Claims Policy Assistant: 6 Hours (33%)">
                  6h (Claims)
                </div>
              </div>
              <div className="dist-legend">
                <span className="legend-item">
                  <span className="legend-dot refund" /> Refund Agent (T-0106, T-0211) &mdash; 12h
                </span>
                <span className="legend-item">
                  <span className="legend-dot claims" /> Claims Policy (T-0103) &mdash; 6h
                </span>
              </div>
            </div>
          </div>

          {/* Reuse Table */}
          <div className="reuse-table-container">
            <table className="memory-table">
              <thead>
                <tr>
                  <th>Test ID</th>
                  <th>Test Probe Name</th>
                  <th>Workload Target</th>
                  <th>Original Event Source</th>
                  <th>Avoided Authoring Effort</th>
                  <th>Active In E-2026-001</th>
                </tr>
              </thead>
              <tbody>
                {memoryReuseLog.map((log) => (
                  <tr key={log.id}>
                    <td><code>{log.testId}</code></td>
                    <td>
                      <div className="test-name-cell">
                        <GitCommit size={14} className="test-icon" />
                        <strong>{log.testName}</strong>
                      </div>
                    </td>
                    <td>
                      <div className="workload-name-cell">
                        {log.workloadName.includes('Refund') ? (
                          <Bot size={13} className="workload-icon" />
                        ) : (
                          <FileText size={13} className="workload-icon" />
                        )}
                        <span>{log.workloadName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="event-pill-lineage">
                        <span className="event-pill-src">{log.sourceEventId}</span>
                        <span className="event-pill-arrow">&rarr;</span>
                        <span className="event-pill-dst">E-2026-001</span>
                      </span>
                    </td>
                    <td className="effort-cell">
                      <div className="effort-badge">
                        <Clock size={12} />
                        <span>{log.effortAvoided}</span>
                      </div>
                    </td>
                    <td>
                      {log.reusedInCurrentEvent ? (
                        <StatusChip status="pass" label="Reused in Plan" />
                      ) : (
                        <StatusChip status="unaffected" label="Dormant" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Pending Proposals & Roadmap Preview */}
        <div className="memory-dual-grid">
          {/* Pending Proposals Queue */}
          <section className="memory-card">
            <div className="card-header">
              <h3 className="card-title">Pending Contract Proposals ({pendingProposals.length})</h3>
              <span className="card-sub">Awaiting Owner Approval</span>
            </div>
            <div className="proposals-queue-list">
              {pendingProposals.map((prop) => (
                <div key={prop.id} className="proposal-queue-item">
                  <div className="prop-q-header">
                    <strong>{prop.workloadName}</strong>
                    <span className="prop-q-bump">{prop.fromVersion} &rarr; {prop.toVersion}</span>
                  </div>
                  <div className="prop-q-field">Field: <code>{prop.fieldLabel}</code></div>
                  
                  {/* Visual Graphic 4: Contract Diff Box */}
                  <div className="contract-diff-box">
                    <div className="diff-line removed">
                      <span className="diff-symbol">&minus;</span>
                      <span className="diff-ver-tag">{prop.fromVersion}</span>
                      <span className="diff-content">{prop.fromValue}</span>
                    </div>
                    <div className="diff-line added">
                      <span className="diff-symbol">&#43;</span>
                      <span className="diff-ver-tag">{prop.toVersion}</span>
                      <span className="diff-content">{prop.toValue}</span>
                    </div>
                  </div>

                  <p className="prop-q-reason"><strong>Trigger Reason:</strong> {prop.reason}</p>
                  <button
                    type="button"
                    onClick={() => navigate('/estate')}
                    className="prop-q-link"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    Review in Workload Profile <ExternalLink size={12} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Visual Graphic 5: Roadmap Preview with Horizon Radar */}
          <section className="memory-card roadmap-preview-card">
            <div className="roadmap-badge-strip">
              <Sparkles size={14} />
              <span>Roadmap preview. Illustrative data. Not part of the spike.</span>
            </div>
            
            <div className="roadmap-preview-content">
              <div className="roadmap-header-with-radar">
                <Radar size={28} className="roadmap-radar-icon" />
                <div>
                  <h3 className="roadmap-title">Predict Exposure Before Upstream Notices</h3>
                  <p className="roadmap-desc">
                    In Phase 3, AI Evergreen monitors provider release cadence, canary models, and benchmark drift
                    to pre-calculate enterprise qualification plans before formal retirement notices are sent.
                  </p>
                </div>
              </div>

              {/* Predictive Evolution Timeline */}
              <div className="roadmap-timeline">
                <div className="timeline-node active">
                  <div className="node-marker"><CheckCircle2 size={12} /></div>
                  <div className="node-info">
                    <span className="node-phase">Phase 1 (Current Spike)</span>
                    <span className="node-name">Deterministic Trajectory Memory</span>
                  </div>
                </div>

                <div className="timeline-connector active" />

                <div className="timeline-node current">
                  <div className="node-marker"><Layers size={12} /></div>
                  <div className="node-info">
                    <span className="node-phase">Phase 2</span>
                    <span className="node-name">Multi-Org Clustering</span>
                  </div>
                </div>

                <div className="timeline-connector future" />

                <div className="timeline-node future">
                  <div className="node-marker"><Radar size={12} /></div>
                  <div className="node-info">
                    <span className="node-phase">Phase 3 (Horizon)</span>
                    <span className="node-name">Zero-Day Horizon Simulation</span>
                  </div>
                </div>
              </div>

              <div className="roadmap-capabilities">
                <div className="cap-pill"><Radar size={11} /> Automated Horizon Scanning</div>
                <div className="cap-pill"><Zap size={11} /> Pre-flight Zero-Day Simulation</div>
                <div className="cap-pill"><ShieldCheck size={11} /> Cross-Org Vulnerability Exchange</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MemoryScreen;
