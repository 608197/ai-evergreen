import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import {
  TrendingUp,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Gauge,
  Activity,
  Milestone,
  Filter,
} from 'lucide-react';
import './PortfolioScreen.css';

type PortfolioTab = 'debt' | 'lifecycle' | 'roadmap';

export const PortfolioScreen: React.FC = () => {
  const navigate = useNavigate();
  const { modelLifecycle, techDebt } = useEvergreenStore();
  const [activeTab, setActiveTab] = useState<PortfolioTab>('debt');
  const [providerFilter, setProviderFilter] = useState<string>('all');

  const filteredModels = modelLifecycle.filter((item) => {
    if (providerFilter === 'all') return true;
    return item.provider.toLowerCase().includes(providerFilter.toLowerCase());
  });

  return (
    <div className="portfolio-screen">
      {/* Persistent Roadmap Preview Ribbon */}
      <div className="portfolio-roadmap-ribbon" role="region" aria-label="Roadmap preview notice">
        <Sparkles size={16} />
        <span>Roadmap preview. Illustrative enterprise telemetry &amp; lifecycle forecasting. Not part of the spike.</span>
      </div>

      {/* Header */}
      <header className="portfolio-header">
        <div className="portfolio-title-row">
          <TrendingUp className="portfolio-title-icon" size={26} />
          <div>
            <h1 className="portfolio-title">Executive Portfolio &amp; Horizon Scanning</h1>
            <p className="portfolio-subtitle">
              Strategic AI fleet lifecycle management, dependency runway forecasting, and technical debt quantification for enterprise leadership.
            </p>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="portfolio-body">
        {/* Global Executive Infographic: Fleet Vital Statistics Bar */}
        <div className="portfolio-vitals-card">
          <div className="vitals-header">
            <div className="vitals-title-group">
              <Activity className="vitals-icon" size={18} />
              <div>
                <h3 className="vitals-title">Enterprise AI Fleet Vital Health</h3>
                <p className="vitals-subtitle">Consolidated governance metrics across AWS Bedrock, Azure, and Anthropic</p>
              </div>
            </div>
            <span className="vitals-status-badge">
              <ShieldCheck size={14} /> 84% Fleet Compliant
            </span>
          </div>

          <div className="vitals-grid">
            <div className="vital-item">
              <span className="vital-label">Active AI Models</span>
              <span className="vital-value">14 Models</span>
              <span className="vital-sub">4 Upstream Providers</span>
            </div>
            <div className="vital-item highlight-warn">
              <span className="vital-label">Deprecations &lt; 90 Days</span>
              <span className="vital-value text-warn">2 Pending</span>
              <span className="vital-sub">Claude 3 Sonnet (47d)</span>
            </div>
            <div className="vital-item highlight-pass">
              <span className="vital-label">Mean Qualification Velocity</span>
              <span className="vital-value text-pass">4.2 Hours</span>
              <span className="vital-sub">Legacy: 18.5 Days (-99%)</span>
            </div>
            <div className="vital-item">
              <span className="vital-label">Mission-Critical Workloads</span>
              <span className="vital-value">9 Protected</span>
              <span className="vital-sub">100% Invariants Seeded</span>
            </div>
          </div>
        </div>

        {/* In-Page Navigation Tabs */}
        <nav className="portfolio-nav-tabs" aria-label="Portfolio sections">
          <button
            type="button"
            className={`portfolio-nav-tab ${activeTab === 'debt' ? 'active' : ''}`}
            onClick={() => setActiveTab('debt')}
          >
            <Gauge size={16} />
            <span>AI Technical Debt &amp; Fleet Risk</span>
            <span className="port-tab-badge">5 Metrics · 3 Hotspots</span>
          </button>

          <button
            type="button"
            className={`portfolio-nav-tab ${activeTab === 'lifecycle' ? 'active' : ''}`}
            onClick={() => setActiveTab('lifecycle')}
          >
            <Clock size={16} />
            <span>Model Lifecycle &amp; Deprecation Runway</span>
            <span className="port-tab-badge highlight">4 Models · 9 Workloads</span>
          </button>

          <button
            type="button"
            className={`portfolio-nav-tab ${activeTab === 'roadmap' ? 'active' : ''}`}
            onClick={() => setActiveTab('roadmap')}
          >
            <Milestone size={16} />
            <span>Strategic Enterprise Roadmap</span>
            <span className="port-tab-badge">5 Phases · Q4 2027</span>
          </button>
        </nav>

        {/* TAB 1: AI Technical Debt Metrics */}
        {activeTab === 'debt' && (
          <div className="portfolio-tab-content">
            {/* Infographic: Qualification Velocity Acceleration Bar */}
            <div className="velocity-infographic-card">
              <div className="v-info-header">
                <div className="v-info-title-group">
                  <Activity size={18} className="text-pass" />
                  <div>
                    <h3 className="v-info-title">Qualification Cycle Time Acceleration</h3>
                    <p className="v-info-sub">Comparing manual enterprise qualification against AI Evergreen autonomous orchestration</p>
                  </div>
                </div>
                <span className="v-speedup-pill">77x Faster Turnaround</span>
              </div>

              <div className="v-comparison-lanes">
                <div className="v-lane legacy">
                  <div className="v-lane-labels">
                    <span className="lane-name">Legacy Enterprise IT Governance (Manual Committees &amp; Siloed QA)</span>
                    <span className="lane-time">18.5 Days (444 Hours)</span>
                  </div>
                  <div className="v-bar-track">
                    <div className="v-bar-fill legacy-fill" style={{ width: '100%' }}>
                      <span>444h</span>
                    </div>
                  </div>
                </div>

                <div className="v-lane evergreen">
                  <div className="v-lane-labels">
                    <span className="lane-name">AI Evergreen Control Plane (Differential Blast Radius &amp; Automated Canary)</span>
                    <span className="lane-time text-pass"><strong>4.2 Hours (-99.05% Lead Time)</strong></span>
                  </div>
                  <div className="v-bar-track">
                    <div className="v-bar-fill evergreen-fill" style={{ width: '4.2%' }}>
                      <span>4.2h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Debt Breakdown Cards */}
            <div className="portfolio-section-block">
              <div className="section-header">
                <div>
                  <h2 className="section-heading">AI Technical Debt Exposure Breakdown</h2>
                  <p className="section-subheading">
                    Enterprise exposure to unmonitored, outdated, or deprecated AI models and unverified tool connections.
                  </p>
                </div>
                <span className="illustrative-tag">Illustrative Telemetry</span>
              </div>

              <div className="portfolio-metrics-grid">
                <div className="metric-tile-card">
                  <div className="metric-top-row">
                    <span className="metric-illustrative">illustrative</span>
                    <AlertTriangle size={16} className="text-warn" />
                  </div>
                  <span className="metric-label">Deprecated Models in Use</span>
                  <span className="metric-number warn">{techDebt.deprecatedModelsInUse}</span>
                  <div className="metric-bar-wrap">
                    <div className="metric-bar-fill warn" style={{ width: '40%' }} />
                  </div>
                  <span className="metric-subtext">6 production workloads impacted (Atlas-1 active)</span>
                </div>

                <div className="metric-tile-card">
                  <div className="metric-top-row">
                    <span className="metric-illustrative">illustrative</span>
                    <Clock size={16} className="text-warn" />
                  </div>
                  <span className="metric-label">Stale Contracts (&gt; 90 Days)</span>
                  <span className="metric-number warn">{techDebt.staleAgents90d}</span>
                  <div className="metric-bar-wrap">
                    <div className="metric-bar-fill warn" style={{ width: '25%' }} />
                  </div>
                  <span className="metric-subtext">Annual policy review overdue</span>
                </div>

                <div className="metric-tile-card">
                  <div className="metric-top-row">
                    <span className="metric-illustrative">illustrative</span>
                    <AlertTriangle size={16} className="text-fail" />
                  </div>
                  <span className="metric-label">Unsupported Tools</span>
                  <span className="metric-number fail">{techDebt.unsupportedTools}</span>
                  <div className="metric-bar-wrap">
                    <div className="metric-bar-fill fail" style={{ width: '60%' }} />
                  </div>
                  <span className="metric-subtext">Legacy SQL &amp; custom regex wrappers</span>
                </div>

                <div className="metric-tile-card">
                  <div className="metric-top-row">
                    <span className="metric-illustrative">illustrative</span>
                    <Layers size={16} className="text-fail" />
                  </div>
                  <span className="metric-label">Orphaned Workloads</span>
                  <span className="metric-number fail">{techDebt.orphanedWorkloads}</span>
                  <div className="metric-bar-wrap">
                    <div className="metric-bar-fill fail" style={{ width: '30%' }} />
                  </div>
                  <span className="metric-subtext">No designated business owner</span>
                </div>

                <div className="metric-tile-card highlight">
                  <div className="metric-top-row">
                    <span className="metric-illustrative">illustrative</span>
                    <CheckCircle2 size={16} className="text-pass" />
                  </div>
                  <span className="metric-label">Median Qualification Velocity</span>
                  <span className="metric-number pass">{techDebt.medianChangeToDecisionHours}h</span>
                  <div className="metric-bar-wrap">
                    <div className="metric-bar-fill pass" style={{ width: '92%' }} />
                  </div>
                  <span className="metric-subtext">Industry benchmark: 18.5 days</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Model Lifecycle & Retirement Runway */}
        {activeTab === 'lifecycle' && (
          <div className="portfolio-tab-content">
            {/* Infographic: Deprecation Runway Timeline Bar */}
            <div className="runway-gantt-card">
              <div className="runway-gantt-header">
                <div>
                  <h3 className="runway-gantt-title">Upstream Model Deprecation Timeline (Horizon View)</h3>
                  <p className="runway-gantt-sub">Timeline of vendor retirement cutoffs and internal qualification buffer</p>
                </div>
                <div className="filter-pill-group">
                  <Filter size={13} className="filter-icon" />
                  <button
                    type="button"
                    className={`filter-btn ${providerFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setProviderFilter('all')}
                  >
                    All Providers (4)
                  </button>
                  <button
                    type="button"
                    className={`filter-btn ${providerFilter === 'anthropic' ? 'active' : ''}`}
                    onClick={() => setProviderFilter('anthropic')}
                  >
                    Anthropic (1)
                  </button>
                  <button
                    type="button"
                    className={`filter-btn ${providerFilter === 'amazon' ? 'active' : ''}`}
                    onClick={() => setProviderFilter('amazon')}
                  >
                    Amazon (1)
                  </button>
                  <button
                    type="button"
                    className={`filter-btn ${providerFilter === 'cohere' ? 'active' : ''}`}
                    onClick={() => setProviderFilter('cohere')}
                  >
                    Cohere (1)
                  </button>
                </div>
              </div>

              <div className="runway-timeline-lanes">
                {filteredModels.map((item) => {
                  const days = item.daysRemaining || 0;
                  const pct = Math.min(100, Math.max(10, Math.round((days / 365) * 100)));
                  const urgencyClass = days <= 60 ? 'urgent-red' : days <= 120 ? 'warn-amber' : 'normal-teal';
                  return (
                    <div key={item.id} className="runway-lane">
                      <div className="runway-lane-meta">
                        <strong className="lane-model-name">{item.name}</strong>
                        <span className="lane-provider">{item.provider}</span>
                      </div>
                      <div className="runway-lane-bar-wrap">
                        <div className={`runway-lane-bar ${urgencyClass}`} style={{ width: `${pct}%` }}>
                          <span>{item.daysRemaining} days remaining</span>
                        </div>
                      </div>
                      <div className="runway-lane-date">
                        <span>{item.milestoneDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Model Lifecycle Cards Grid */}
            <div className="lifecycle-grid">
              {filteredModels.map((item) => (
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
                        <button
                          key={app}
                          type="button"
                          onClick={() => navigate('/estate')}
                          className="app-pill-link"
                          style={{ border: 'none', cursor: 'pointer', textAlign: 'left' }}
                        >
                          {app}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="lifecycle-action">
                    <button
                      type="button"
                      onClick={() => navigate('/events/E-2026-001/blast-radius')}
                      className="btn-secondary btn-sm full-width"
                      style={{ cursor: 'pointer' }}
                    >
                      View Qualification Blast Radius <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: 5-Phase Strategic Roadmap Strip */}
        {activeTab === 'roadmap' && (
          <div className="portfolio-tab-content">
            {/* Infographic Roadmap Milestone Chain */}
            <div className="roadmap-hero-card">
              <div className="roadmap-hero-header">
                <Milestone size={20} className="roadmap-hero-icon" />
                <div>
                  <h2 className="roadmap-hero-title">Strategic AI Evergreen Maturity Roadmap</h2>
                  <p className="roadmap-hero-desc">
                    Evolutionary trajectory from current feasibility spike to autonomous closed-loop enterprise AI fleet governance.
                  </p>
                </div>
              </div>

              <div className="roadmap-pipeline-flow">
                <div className="pipeline-node current">
                  <span className="node-num">01</span>
                  <span className="node-title">Spike Baseline</span>
                  <span className="node-tag">Current</span>
                </div>
                <div className="pipeline-arrow">&rarr;</div>

                <div className="pipeline-node planned">
                  <span className="node-num">02</span>
                  <span className="node-title">Enterprise Pilot</span>
                  <span className="node-tag">Q1 2027</span>
                </div>
                <div className="pipeline-arrow">&rarr;</div>

                <div className="pipeline-node planned">
                  <span className="node-num">03</span>
                  <span className="node-title">Automated Scan</span>
                  <span className="node-tag">Q2 2027</span>
                </div>
                <div className="pipeline-arrow">&rarr;</div>

                <div className="pipeline-node planned">
                  <span className="node-num">04</span>
                  <span className="node-title">Multi-Cloud</span>
                  <span className="node-tag">Q3 2027</span>
                </div>
                <div className="pipeline-arrow">&rarr;</div>

                <div className="pipeline-node planned">
                  <span className="node-num">05</span>
                  <span className="node-title">Closed-Loop</span>
                  <span className="node-tag">Q4 2027</span>
                </div>
              </div>
            </div>

            {/* Detailed Phase Cards */}
            <div className="roadmap-strip">
              {/* Phase 1: Current */}
              <div className="roadmap-phase current">
                <div className="phase-header-row">
                  <div className="phase-num">Phase 1</div>
                  <span className="phase-badge active">Active Baseline</span>
                </div>
                <h4 className="phase-name">Feasibility Spike</h4>
                <span className="phase-time">Current &bull; 4 Weeks</span>
                <p className="phase-desc">
                  12-screen UX specification, 17 architectural components, deterministic Trusted Kernel, and seeded regression detection.
                </p>
                <div className="phase-deliverables">
                  <span className="deliv-chip">&bull; NetworkX Graph Store</span>
                  <span className="deliv-chip">&bull; SQLite Merkle Ledger</span>
                  <span className="deliv-chip">&bull; Seeded Regression Matrix</span>
                </div>
              </div>

              {/* Phase 2 */}
              <div className="roadmap-phase planned">
                <div className="phase-header-row">
                  <div className="phase-num">Phase 2</div>
                  <span className="phase-badge">Planned</span>
                </div>
                <h4 className="phase-name">Enterprise Pilot</h4>
                <span className="phase-time">Q1 2027</span>
                <p className="phase-desc">
                  Multi-tenant RBAC, real Kong API Gateway adapter, ServiceNow change ticket orchestration, and live telemetry feeds.
                </p>
                <div className="phase-deliverables">
                  <span className="deliv-chip">&bull; Kong Gateway Live Adapter</span>
                  <span className="deliv-chip">&bull; ServiceNow CMDB Bi-directional Sync</span>
                  <span className="deliv-chip">&bull; Okta SSO &amp; RBAC</span>
                </div>
              </div>

              {/* Phase 3 */}
              <div className="roadmap-phase planned">
                <div className="phase-header-row">
                  <div className="phase-num">Phase 3</div>
                  <span className="phase-badge">Planned</span>
                </div>
                <h4 className="phase-name">Automated Horizon Scanning</h4>
                <span className="phase-time">Q2 2027</span>
                <p className="phase-desc">
                  Pre-qualification against unannounced upstream candidate releases and automated pull-request test generation.
                </p>
                <div className="phase-deliverables">
                  <span className="deliv-chip">&bull; Upstream Vendor Webhook Ingest</span>
                  <span className="deliv-chip">&bull; Synthetic Canary Probe Synthesis</span>
                  <span className="deliv-chip">&bull; Automated Pull-Request Assertions</span>
                </div>
              </div>

              {/* Phase 4 */}
              <div className="roadmap-phase planned">
                <div className="phase-header-row">
                  <div className="phase-num">Phase 4</div>
                  <span className="phase-badge">Planned</span>
                </div>
                <h4 className="phase-name">Multi-Cloud Fleet Governance</h4>
                <span className="phase-time">Q3 2027</span>
                <p className="phase-desc">
                  Cross-provider model arbitration across AWS Bedrock, Microsoft Azure OpenAI, and Google Cloud Vertex AI.
                </p>
                <div className="phase-deliverables">
                  <span className="deliv-chip">&bull; Vertex AI Adapter</span>
                  <span className="deliv-chip">&bull; Azure OpenAI Live Adapter</span>
                  <span className="deliv-chip">&bull; Cost vs Latency Arbitrage Engine</span>
                </div>
              </div>

              {/* Phase 5 */}
              <div className="roadmap-phase planned">
                <div className="phase-header-row">
                  <div className="phase-num">Phase 5</div>
                  <span className="phase-badge">Planned</span>
                </div>
                <h4 className="phase-name">Autonomous Closed-Loop Rollout</h4>
                <span className="phase-time">Q4 2027</span>
                <p className="phase-desc">
                  Self-healing canary promotion with instant deterministic circuit breakers and zero human latency for low-risk tier.
                </p>
                <div className="phase-deliverables">
                  <span className="deliv-chip">&bull; Tier 4 Autonomous Promotion</span>
                  <span className="deliv-chip">&bull; Instant Sub-second Circuit Breaker</span>
                  <span className="deliv-chip">&bull; Continuous Trajectory Health Monitor</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
