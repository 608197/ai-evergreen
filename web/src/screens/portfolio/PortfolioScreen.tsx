import React from 'react';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import {
  TrendingUp,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import './PortfolioScreen.css';

export const PortfolioScreen: React.FC = () => {
  const {
    modelLifecycle,
    techDebt,
  } = useEvergreenStore();

  return (
    <div className="portfolio-screen">
      {/* Persistent Roadmap Preview Ribbon */}
      <div className="portfolio-roadmap-ribbon" role="region" aria-label="Roadmap preview notice">
        <Sparkles size={16} />
        <span>Roadmap preview. Illustrative data. Not part of the spike.</span>
      </div>

      {/* Header */}
      <header className="portfolio-header">
        <div className="portfolio-title-row">
          <TrendingUp className="portfolio-title-icon" size={26} />
          <div>
            <h1 className="portfolio-title">Executive Portfolio & Horizon Scanning</h1>
            <p className="portfolio-subtitle">
              Strategic AI fleet lifecycle management, dependency runway forecasting, and technical debt quantification for enterprise leadership.
            </p>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="portfolio-body">
        {/* Section 1: AI Technical Debt Metrics */}
        <section className="portfolio-section">
          <div className="section-header">
            <div>
              <h2 className="section-heading">AI Technical Debt Metrics</h2>
              <p className="section-subheading">
                Enterprise exposure to unmonitored, outdated, or deprecated AI models and unverified tool connections.
              </p>
            </div>
            <span className="illustrative-tag">Illustrative</span>
          </div>

          <div className="portfolio-metrics-grid">
            <div className="metric-tile-card">
              <span className="metric-illustrative">illustrative</span>
              <span className="metric-label">Deprecated Models in Use</span>
              <span className="metric-number warn">{techDebt.deprecatedModelsInUse}</span>
              <span className="metric-subtext">3 production workloads impacted</span>
            </div>

            <div className="metric-tile-card">
              <span className="metric-illustrative">illustrative</span>
              <span className="metric-label">Stale Contracts (&gt; 90 Days)</span>
              <span className="metric-number warn">{techDebt.staleAgents90d}</span>
              <span className="metric-subtext">Annual policy review overdue</span>
            </div>

            <div className="metric-tile-card">
              <span className="metric-illustrative">illustrative</span>
              <span className="metric-label">Unsupported Tools</span>
              <span className="metric-number fail">{techDebt.unsupportedTools}</span>
              <span className="metric-subtext">Legacy SQL & custom regex wrappers</span>
            </div>

            <div className="metric-tile-card">
              <span className="metric-illustrative">illustrative</span>
              <span className="metric-label">Orphaned Workloads</span>
              <span className="metric-number fail">{techDebt.orphanedWorkloads}</span>
              <span className="metric-subtext">No designated business owner</span>
            </div>

            <div className="metric-tile-card highlight">
              <span className="metric-illustrative">illustrative</span>
              <span className="metric-label">Median Qualification Velocity</span>
              <span className="metric-number pass">{techDebt.medianChangeToDecisionHours}h</span>
              <span className="metric-subtext">Industry baseline: 18.5 days</span>
            </div>
          </div>
        </section>

        {/* Section 2: Model Lifecycle & Retirement Runway */}
        <section className="portfolio-section">
          <div className="section-header">
            <div>
              <h2 className="section-heading">Foundation Model Retirement Runway</h2>
              <p className="section-subheading">
                Upstream provider deprecation schedules and affected internal application fleet.
              </p>
            </div>
            <span className="illustrative-tag">Illustrative</span>
          </div>

          <div className="lifecycle-grid">
            {modelLifecycle.map((item) => (
              <div key={item.id} className="lifecycle-card">
                <div className="lifecycle-header">
                  <div>
                    <h3 className="lifecycle-model-name">{item.name}</h3>
                    <span className="lifecycle-provider">{item.provider}</span>
                  </div>
                  <span className={`lifecycle-status-tag ${item.status}`}>
                    {item.daysRemaining !== null
                      ? item.daysRemaining > 0
                        ? `${item.daysRemaining} days left`
                        : 'Retiring today'
                      : 'Retired'}
                  </span>
                </div>

                <div className="lifecycle-meta">
                  <div className="meta-row">
                    <Calendar size={13} />
                    <span>Retirement Date: <strong>{item.milestoneDate}</strong></span>
                  </div>
                  <div className="meta-row">
                    <Layers size={13} />
                    <span>Dependent Applications: <strong>{item.dependentAppCount}</strong></span>
                  </div>
                </div>

                <div className="lifecycle-apps-list">
                  <span className="apps-title">Affected Workloads:</span>
                  <div className="apps-tags">
                    {item.dependentAppIds.map((app) => (
                      <a
                        key={app}
                        href="#/estate"
                        className="app-pill-link"
                      >
                        {app}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="lifecycle-action">
                  <a href="#/events/E-2026-001/blast-radius" className="btn-secondary btn-sm full-width">
                    View Qualification Blast Radius <ArrowRight size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: 5-Phase Strategic Roadmap Strip */}
        <section className="portfolio-section">
          <div className="section-header">
            <div>
              <h2 className="section-heading">Strategic AI Evergreen Roadmap</h2>
              <p className="section-subheading">
                Evolution from feasibility spike to autonomous closed-loop enterprise AI fleet governance.
              </p>
            </div>
          </div>

          <div className="roadmap-strip">
            {/* Phase 1: Current */}
            <div className="roadmap-phase current">
              <div className="phase-num">Phase 1</div>
              <h4 className="phase-name">Feasibility Spike</h4>
              <span className="phase-time">Current &bull; 4 Weeks</span>
              <p className="phase-desc">
                12-screen UX specification, 17 architectural components, deterministic Trusted Kernel, and seeded regression detection.
              </p>
              <span className="phase-badge active">Active Baseline</span>
            </div>

            {/* Phase 2 */}
            <div className="roadmap-phase planned">
              <div className="phase-num">Phase 2</div>
              <h4 className="phase-name">Enterprise Pilot</h4>
              <span className="phase-time">Q1 2027</span>
              <p className="phase-desc">
                Multi-tenant RBAC, real Kong API Gateway adapter, ServiceNow change ticket orchestration, and live telemetry feeds.
              </p>
              <span className="phase-badge">Planned</span>
            </div>

            {/* Phase 3 */}
            <div className="roadmap-phase planned">
              <div className="phase-num">Phase 3</div>
              <h4 className="phase-name">Automated Horizon Scanning</h4>
              <span className="phase-time">Q2 2027</span>
              <p className="phase-desc">
                Pre-qualification against unannounced upstream candidate releases and automated pull-request test generation.
              </p>
              <span className="phase-badge">Planned</span>
            </div>

            {/* Phase 4 */}
            <div className="roadmap-phase planned">
              <div className="phase-num">Phase 4</div>
              <h4 className="phase-name">Multi-Cloud Fleet Governance</h4>
              <span className="phase-time">Q3 2027</span>
              <p className="phase-desc">
                Cross-provider model arbitration across AWS Bedrock, Microsoft Azure OpenAI, and Google Cloud Vertex AI.
              </p>
              <span className="phase-badge">Planned</span>
            </div>

            {/* Phase 5 */}
            <div className="roadmap-phase planned">
              <div className="phase-num">Phase 5</div>
              <h4 className="phase-name">Autonomous Closed-Loop Rollout</h4>
              <span className="phase-time">Q4 2027</span>
              <p className="phase-desc">
                Self-healing canary promotion with instant deterministic circuit breakers and zero human latency for low-risk tier.
              </p>
              <span className="phase-badge">Planned</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
