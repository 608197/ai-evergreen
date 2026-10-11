import React from 'react';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import { StatTile } from '../../components/common/StatTile';
import { StatusChip } from '../../components/common/StatusChip';
import {
  BrainCircuit,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import './MemoryScreen.css';

export const MemoryScreen: React.FC = () => {
  const {
    memoryPatterns,
    memoryReuseLog,
    contractProposals,
    events,
  } = useEvergreenStore();

  const pendingProposals = contractProposals.filter((p) => p.status === 'pending');

  return (
    <div className="memory-screen">
      {/* Header */}
      <header className="memory-header">
        <div className="memory-title-row">
          <BrainCircuit className="memory-title-icon" size={26} />
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

        {/* Section 1: Recurring Patterns */}
        <section className="memory-section">
          <div className="section-header">
            <div>
              <h2 className="section-heading">Discovered Behavioral Patterns</h2>
              <p className="section-subheading">
                Systemic model behaviors identified across past qualification cycles that inform automated test planning.
              </p>
            </div>
          </div>

          <div className="patterns-grid">
            {memoryPatterns.map((pat) => (
              <div key={pat.id} className="pattern-card">
                <div className="pattern-header">
                  <span className={`pattern-severity ${pat.severityCaught.toLowerCase()}`}>
                    {pat.severityCaught} Risk
                  </span>
                  {pat.isNew && <span className="pattern-new-tag">New Insight</span>}
                </div>

                <h3 className="pattern-title">{pat.title}</h3>
                <p className="pattern-desc">{pat.description}</p>

                <div className="pattern-cases">
                  <span className="cases-label">Observed In Past Events:</span>
                  <div className="events-tags">
                    {pat.sourceEvents.map((ev) => (
                      <span key={ev} className="event-tag">{ev}</span>
                    ))}
                  </div>
                </div>

                <div className="pattern-recommendation">
                  <strong>Evergreen Recommendation:</strong>
                  <p>{pat.recommendation}</p>
                </div>

                <div className="pattern-actions">
                  <a href="#/estate" className="pattern-action-link">
                    View affected workloads <ArrowRight size={13} />
                  </a>
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

          <div className="reuse-table-container">
            <table className="memory-table">
              <thead>
                <tr>
                  <th>Test ID</th>
                  <th>Test Probe Name</th>
                  <th>Workload Target</th>
                  <th>Original Event Source</th>
                  <th>Engineering Effort Avoided</th>
                  <th>Active In E-2026-001</th>
                </tr>
              </thead>
              <tbody>
                {memoryReuseLog.map((log) => (
                  <tr key={log.id}>
                    <td><code>{log.testId}</code></td>
                    <td><strong>{log.testName}</strong></td>
                    <td>{log.workloadName}</td>
                    <td><span className="event-pill">{log.sourceEventId}</span></td>
                    <td className="effort-cell">{log.effortAvoided}</td>
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
                  <p className="prop-q-reason">{prop.reason}</p>
                  <a
                    href={`#/estate/workloads/${prop.workloadId}`}
                    className="prop-q-link"
                  >
                    Review in Workload Profile <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Roadmap Preview */}
          <section className="memory-card roadmap-preview-card">
            <div className="roadmap-badge-strip">
              <Sparkles size={14} />
              <span>Roadmap preview. Illustrative data. Not part of the spike.</span>
            </div>
            <div className="roadmap-preview-content">
              <h3 className="roadmap-title">Predict Exposure Before Upstream Notices</h3>
              <p className="roadmap-desc">
                In Phase 3, AI Evergreen monitors provider release cadence, canary models, and benchmark drift
                to pre-calculate enterprise qualification plans before formal retirement notices are sent.
              </p>
              <div className="roadmap-capabilities">
                <div className="cap-pill">Automated Horizon Scanning</div>
                <div className="cap-pill">Pre-flight Zero-Day Simulation</div>
                <div className="cap-pill">Cross-Org Vulnerability Exchange</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
