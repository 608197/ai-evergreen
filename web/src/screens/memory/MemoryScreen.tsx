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
  LayoutGrid,
  Table as TableIcon,
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

  // Primary screen tabs
  const [activeTab, setActiveTab] = useState<'patterns' | 'reuse' | 'proposals'>('patterns');

  // Filter for patterns tab
  const [patternFilter, setPatternFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [expandedPatterns, setExpandedPatterns] = useState<Record<string, boolean>>({
    'mem-pat-1': false,
    'mem-pat-2': false,
    'mem-pat-3': false,
  });

  // View toggle for reuse tab (cards vs table)
  const [reuseViewMode, setReuseViewMode] = useState<'cards' | 'table'>('cards');

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

        {/* Global Infographic: Qualification Memory Lifecycle Pipeline */}
        <section className="memory-pipeline-card">
          <div className="pipeline-header">
            <div className="pipeline-title-group">
              <Workflow size={20} className="pipeline-icon" />
              <div>
                <h3 className="pipeline-title">Enterprise Qualification Memory Flow</h3>
                <p className="pipeline-subtitle">
                  Autonomous closed-loop: How historical qualification cycles shield active change events from zero-day regressions
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
                <div className="stage-desc">Verifiable cryptographic logs preserved</div>
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
                <div className="stage-desc">Systemic drift signatures categorized by risk</div>
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
                <div className="stage-desc">Critical invariant probes auto-selected</div>
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
                <div className="stage-desc">Zero regressions missed across 6 apps</div>
              </div>
            </div>
          </div>
        </section>

        {/* Primary Screen Tabs */}
        <nav className="memory-nav-tabs">
          <button
            type="button"
            className={`memory-nav-tab ${activeTab === 'patterns' ? 'active' : ''}`}
            onClick={() => setActiveTab('patterns')}
          >
            <Zap size={16} />
            <span>Discovered Behavioral Patterns</span>
            <span className="tab-counter-badge">{memoryPatterns.length}</span>
          </button>

          <button
            type="button"
            className={`memory-nav-tab ${activeTab === 'reuse' ? 'active' : ''}`}
            onClick={() => setActiveTab('reuse')}
          >
            <Clock size={16} />
            <span>Seeded Invariant &amp; Test Reuse Log</span>
            <span className="tab-counter-badge highlight">47 Probes / 18h Saved</span>
          </button>

          <button
            type="button"
            className={`memory-nav-tab ${activeTab === 'proposals' ? 'active' : ''}`}
            onClick={() => setActiveTab('proposals')}
          >
            <GitCommit size={16} />
            <span>Contract Proposals &amp; Roadmap</span>
            <span className="tab-counter-badge">{pendingProposals.length}</span>
          </button>
        </nav>

        {/* TAB 1: Discovered Behavioral Patterns */}
        {activeTab === 'patterns' && (
          <section className="memory-tab-content">
            {/* Infographic Spectrum & Filter Bar */}
            <div className="patterns-infographic-header">
              <div className="spectrum-summary">
                <div className="spectrum-title-block">
                  <span className="spectrum-eyebrow">RISK SPECTRUM ANALYSIS</span>
                  <h3 className="spectrum-title">3 Systemic Failure Modes Identified Across Estate</h3>
                </div>

                <div className="spectrum-bar-wrap">
                  <div className="spectrum-bar">
                    <div className="spec-segment crit" style={{ width: '33.3%' }} title="Critical: Tool Order Drift (1)">
                      1 Critical
                    </div>
                    <div className="spec-segment high" style={{ width: '33.3%' }} title="High: Citation Validity Drift (1)">
                      1 High
                    </div>
                    <div className="spec-segment med" style={{ width: '33.3%' }} title="Medium: Silent Key Omission (1)">
                      1 Medium
                    </div>
                  </div>
                  <div className="spec-legend">
                    <span className="spec-leg-item"><span className="dot crit" /> Financial Authorization</span>
                    <span className="spec-leg-item"><span className="dot high" /> RAG Citation Hallucination</span>
                    <span className="spec-leg-item"><span className="dot med" /> Schema Key Omission</span>
                  </div>
                </div>
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
                  Critical (1)
                </button>
                <button
                  type="button"
                  className={`filter-pill ${patternFilter === 'high' ? 'active' : ''}`}
                  onClick={() => setPatternFilter('high')}
                >
                  High (1)
                </button>
                <button
                  type="button"
                  className={`filter-pill ${patternFilter === 'medium' ? 'active' : ''}`}
                  onClick={() => setPatternFilter('medium')}
                >
                  Medium (1)
                </button>
              </div>
            </div>

            {/* Pattern Infographic Cards Grid */}
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

                  {/* Visual Infographic 1: Dual-Lane Flowchart for Tool Drift */}
                  {pat.id === 'mem-pat-1' && (
                    <div className="infographic-box">
                      <div className="infographic-box-title">
                        <Zap size={12} /> TRAJECTORY ANOMALY INFOGRAPHIC
                      </div>
                      <div className="dual-lane-flow">
                        <div className="lane unsafe">
                          <span className="lane-badge red">UNSAFE CANDIDATE</span>
                          <div className="lane-steps">
                            <span className="lane-step">Prompt</span>
                            <span className="lane-arrow">&rarr;</span>
                            <span className="lane-step fail">Disburse $500 ⚠️</span>
                            <span className="lane-arrow">&rarr;</span>
                            <span className="lane-step bypass">Auth Skipped! 💥</span>
                          </div>
                        </div>
                        <div className="lane safe">
                          <span className="lane-badge green">EVERGREEN SHIELD</span>
                          <div className="lane-steps">
                            <span className="lane-step">Prompt</span>
                            <span className="lane-arrow">&rarr;</span>
                            <span className="lane-step pass">Pre-Auth Enforced ✓</span>
                            <span className="lane-arrow">&rarr;</span>
                            <span className="lane-step pass">Disburse $500 🛡️</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Visual Infographic 2: Degradation Timeline for RAG Citations */}
                  {pat.id === 'mem-pat-2' && (
                    <div className="infographic-box">
                      <div className="infographic-box-title">
                        <Zap size={12} /> LEAD-INDICATOR TIMELINE INFOGRAPHIC
                      </div>
                      <div className="timeline-infographic">
                        <div className="time-col">
                          <span className="time-tag">T0 (Release)</span>
                          <div className="metric-pill pass">Fluency: 99%</div>
                          <div className="metric-pill pass">Citations: 98%</div>
                        </div>
                        <div className="time-arrow-col">
                          <span className="time-gap">48h Lag</span>
                          <ArrowRight size={14} className="time-arrow" />
                        </div>
                        <div className="time-col drift">
                          <span className="time-tag warn">T+24h (Drift)</span>
                          <div className="metric-pill pass">Fluency: 99% (Deceptive)</div>
                          <div className="metric-pill fail">Citations: 68% ⚠️</div>
                        </div>
                        <div className="time-arrow-col">
                          <span className="time-gap">Collapse</span>
                          <ArrowRight size={14} className="time-arrow" />
                        </div>
                        <div className="time-col alert">
                          <span className="time-tag red">T+48h</span>
                          <div className="metric-pill shield">
                            <ShieldCheck size={11} /> Probe T-0103 Halts Canary
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Visual Infographic 3: Side-by-Side Schema Diff for Key Omission */}
                  {pat.id === 'mem-pat-3' && (
                    <div className="infographic-box">
                      <div className="infographic-box-title">
                        <Zap size={12} /> SCHEMA CONTRACT DRIFT INFOGRAPHIC
                      </div>
                      <div className="schema-diff-infographic">
                        <div className="schema-card exp">
                          <span className="schema-label">EXPECTED CONTRACT</span>
                          <code>{`{\n  "vendor": "Acme",\n  "taxCode": null\n}`}</code>
                        </div>
                        <div className="schema-vs-col">
                          <span className="schema-vs">VS</span>
                          <ArrowRight size={14} />
                        </div>
                        <div className="schema-card act">
                          <span className="schema-label red">MODEL REVISION (OMITTED)</span>
                          <code>{`{\n  "vendor": "Acme"\n  // taxCode missing ❌\n}`}</code>
                        </div>
                      </div>
                      <div className="schema-shield-pill">
                        <ShieldCheck size={12} /> Strict Schema Assertion: Prevents ERP NullPointer Crashes
                      </div>
                    </div>
                  )}

                  {/* Key Infographic Metric Chips */}
                  <div className="pattern-meta-strip">
                    <div className="meta-chip">
                      <span className="meta-label">TARGET:</span>
                      <strong>
                        {pat.id === 'mem-pat-1' && 'Refund Agent (Critical)'}
                        {pat.id === 'mem-pat-2' && 'Claims Policy Assistant (High)'}
                        {pat.id === 'mem-pat-3' && 'Invoice Extractor (Medium)'}
                      </strong>
                    </div>
                    <div className="meta-chip">
                      <span className="meta-label">ENFORCED INVARIANT:</span>
                      <code>
                        {pat.id === 'mem-pat-1' && 'Rule K-014'}
                        {pat.id === 'mem-pat-2' && 'Probe T-0103'}
                        {pat.id === 'mem-pat-3' && 'Rule K-010'}
                      </code>
                    </div>
                  </div>

                  {/* Supporting Cases */}
                  <div className="pattern-cases">
                    <span className="cases-label">Supporting Empirical Evidence:</span>
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
                    <strong><ShieldCheck size={12} /> Evergreen Policy Guardrail:</strong>
                    <p>{pat.recommendation}</p>
                  </div>

                  {/* Expandable Deep Dive Evidence Accordion */}
                  <div className="pattern-deepdive-container">
                    <button
                      type="button"
                      className="pattern-deepdive-btn"
                      onClick={() => togglePatternExpand(pat.id)}
                    >
                      <span>{expandedPatterns[pat.id] ? 'Hide' : 'Expand'} Full Trajectory Root Cause Analysis</span>
                      {expandedPatterns[pat.id] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                    {expandedPatterns[pat.id] && (
                      <div className="pattern-deepdive-body">
                        <p className="pattern-desc">{pat.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Link */}
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
        )}

        {/* TAB 2: Seeded Invariant & Test Reuse Log */}
        {activeTab === 'reuse' && (
          <section className="memory-tab-content">
            {/* ROI Infographic Banner */}
            <div className="reuse-visual-summary-card">
              <div className="reuse-summary-left">
                <div className="metric-highlight">
                  <Clock className="metric-icon" size={32} />
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
                  <span>Avoided Authoring Effort by Target Workload</span>
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

            {/* View Mode Switcher Header */}
            <div className="reuse-controls-bar">
              <div className="reuse-controls-left">
                <h3 className="reuse-section-title">Carried-Forward Test Assets ({memoryReuseLog.length})</h3>
                <span className="reuse-section-sub">Immutable seeded regression probes automatically bound to E-2026-001</span>
              </div>
              <div className="view-mode-toggle">
                <button
                  type="button"
                  className={`view-mode-btn ${reuseViewMode === 'cards' ? 'active' : ''}`}
                  onClick={() => setReuseViewMode('cards')}
                >
                  <LayoutGrid size={14} /> Infographic Cards
                </button>
                <button
                  type="button"
                  className={`view-mode-btn ${reuseViewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setReuseViewMode('table')}
                >
                  <TableIcon size={14} /> Data Table
                </button>
              </div>
            </div>

            {/* View Mode 1: Infographic Asset Cards */}
            {reuseViewMode === 'cards' ? (
              <div className="reuse-cards-grid">
                {memoryReuseLog.map((log) => (
                  <div key={log.id} className="reuse-asset-card">
                    <div className="asset-card-top">
                      <div className="asset-id-chip">
                        <GitCommit size={14} />
                        <code>{log.testId}</code>
                      </div>
                      <StatusChip status="pass" label="Reused in Plan" />
                    </div>

                    <h4 className="asset-card-name">{log.testName}</h4>

                    <div className="asset-card-workload">
                      {log.workloadName.includes('Refund') ? (
                        <Bot size={15} className="workload-bot-icon" />
                      ) : (
                        <FileText size={15} className="workload-doc-icon" />
                      )}
                      <strong>{log.workloadName}</strong>
                    </div>

                    {/* Infographic Lineage Pipeline */}
                    <div className="asset-lineage-flow">
                      <div className="lineage-origin">
                        <span className="lineage-label">ORIGIN EVENT</span>
                        <span className="lineage-val">{log.sourceEventId}</span>
                      </div>
                      <div className="lineage-arrow-wrap">
                        <span className="lineage-line" />
                        <ArrowRight size={13} className="lineage-arrow-icon" />
                      </div>
                      <div className="lineage-active">
                        <span className="lineage-label">BOUND TO</span>
                        <span className="lineage-val active">E-2026-001</span>
                      </div>
                    </div>

                    {/* Avoided Effort Meter */}
                    <div className="asset-effort-meter">
                      <Clock size={14} className="meter-clock" />
                      <div className="meter-info">
                        <span className="meter-val">{log.effortAvoided}</span>
                        <div className="meter-bar">
                          <div
                            className="meter-bar-fill"
                            style={{
                              width: log.testId === 'T-0106' ? '80%' : log.testId === 'T-0103' ? '60%' : '40%',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* View Mode 2: Table */
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
            )}
          </section>
        )}

        {/* TAB 3: Contract Proposals & Roadmap */}
        {activeTab === 'proposals' && (
          <section className="memory-tab-content">
            <div className="memory-dual-grid">
              {/* Pending Proposals Queue */}
              <div className="memory-card">
                <div className="card-header">
                  <h3 className="card-title">Pending Contract Proposals ({pendingProposals.length})</h3>
                  <span className="card-sub">Awaiting Owner Verification</span>
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
              </div>

              {/* Visual Graphic 5: Roadmap Preview with Horizon Radar */}
              <div className="memory-card roadmap-preview-card">
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
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default MemoryScreen;
