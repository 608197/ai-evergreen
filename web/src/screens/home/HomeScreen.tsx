import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import { RiskMeter } from '../../components/common/RiskMeter';
import { RiskBadgeRow } from '../../components/common/RiskBadgeRow';
import { StatTile } from '../../components/common/StatTile';
import {
  ArrowRight,
  Clock,
  ShieldAlert,
  AlertTriangle,
  Activity,
  Calendar,
  CheckCircle,
  ExternalLink,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import './HomeScreen.css';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    identities,
    setCurrentUser,
    events,
    workloads,
    edges,
    isGraphStale,
    getGateG1,
    setManualEventModalOpen,
  } = useEvergreenStore();

  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const g1State = getGateG1('E-2026-001');

  // Filtered change events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      if (
        searchQuery &&
        !e.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !e.id.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [events, statusFilter, searchQuery]);

  const openEvents = events.filter((e) => e.status === 'open');
  const staleEdges = edges.filter((e) => e.state === 'stale');

  // Stage step dots renderer
  const renderStageIndicator = (currentStage: string) => {
    const stages = ['blast_radius', 'plan', 'results', 'decision', 'rollout', 'record'];
    const currentIndex = stages.indexOf(currentStage);

    return (
      <div className="ev-home-stage-dots" title={`Current stage: ${currentStage.replace('_', ' ')}`}>
        {stages.map((s, idx) => {
          let dotClass = 'ev-home-stage-dot';
          if (idx < currentIndex) dotClass += ' ev-home-stage-dot--completed';
          else if (idx === currentIndex) dotClass += ' ev-home-stage-dot--current';
          return <span key={s} className={dotClass} />;
        })}
        <span className="ev-home-stage-label">
          {currentStage === 'blast_radius'
            ? 'Blast Radius'
            : currentStage.charAt(0).toUpperCase() + currentStage.slice(1)}
        </span>
      </div>
    );
  };

  // Helper for persona-specific content
  const role = currentUser.role;

  const renderPersonaHero = () => {
    switch (role) {
      case 'app_owner':
        return (
          <article className="ev-persona-hero ev-persona-hero--urgent">
            <div className="ev-persona-hero__header">
              <div className="ev-persona-hero__tag-group">
                <span className="ev-persona-hero__role-badge">APPLICATION OWNER COCKPIT</span>
                <span className="ev-persona-hero__time-tag">
                  <Clock size={13} /> 14 Days Until Deprecation
                </span>
              </div>
              <RiskMeter tier="critical" compact />
            </div>

            <h2 className="ev-persona-hero__title">
              Action Required: AWS Bedrock Retiring Atlas-1
            </h2>
            <p className="ev-persona-hero__summary">
              Your tier-1 workload <strong>Refund Agent</strong> is directly in the blast radius. Comprehensive qualification discovered a fatal tool-inversion failure on the Atlas-1b candidate. Automated promotion is <strong>blocked by Safety Invariant K-014</strong>.
            </p>

            <div className="ev-persona-hero__impact-strip">
              <div className="impact-item">
                <span className="impact-label">Impacted Workload:</span>
                <span className="impact-val">Refund Agent (Tier 1 P1)</span>
              </div>
              <div className="impact-item">
                <span className="impact-label">Evaluation Finding:</span>
                <span className="impact-val impact-val--alert">1 Critical Tool Inversion Defect</span>
              </div>
              <div className="impact-item">
                <span className="impact-label">Kernel Action:</span>
                <span className="impact-val impact-val--alert">Blocked (K-014 Invariant)</span>
              </div>
            </div>

            <div className="ev-persona-hero__footer">
              <span className="ev-persona-hero__meta">Active Qualification Event: E-2026-001</span>
              <div className="ev-persona-hero__actions">
                <button
                  type="button"
                  className="ev-persona-hero__primary-btn"
                  onClick={() => navigate('/events/E-2026-001/blast-radius')}
                >
                  <span>Review Impact on My Applications</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </article>
        );

      case 'qa_lead':
        return (
          <article className="ev-persona-hero ev-persona-hero--info">
            <div className="ev-persona-hero__header">
              <div className="ev-persona-hero__tag-group">
                <span className="ev-persona-hero__role-badge">QA & TEST LEAD COCKPIT</span>
                <span className="ev-persona-hero__time-tag">
                  <Clock size={13} /> 72% Scope Pruning
                </span>
              </div>
              <RiskMeter tier="high" compact />
            </div>

            <h2 className="ev-persona-hero__title">
              Adaptive Regression Plan Generated & Optimized
            </h2>
            <p className="ev-persona-hero__summary">
              Adaptive Planner selected <strong>134 targeted tests</strong> out of 480 total Jira/Xray suites, safely excluding 346 with machine-readable rationales. <strong>1 missing test gap was synthesized (GEN-01)</strong>. All 8 seeded defect regressions were successfully isolated.
            </p>

            <div className="ev-persona-hero__impact-strip">
              <div className="impact-item">
                <span className="impact-label">Jira Tests Indexed:</span>
                <span className="impact-val">480 Total Test Cases</span>
              </div>
              <div className="impact-item">
                <span className="impact-label">Selective Qualification:</span>
                <span className="impact-val">134 Selected (72% Savings)</span>
              </div>
              <div className="impact-item">
                <span className="impact-label">Seeded Defect Catch:</span>
                <span className="impact-val impact-val--success">100% (8/8 Defect Seeds Caught)</span>
              </div>
            </div>

            <div className="ev-persona-hero__footer">
              <span className="ev-persona-hero__meta">Awaiting Test Lead Approval on Plan</span>
              <div className="ev-persona-hero__actions">
                <button
                  type="button"
                  className="ev-persona-hero__primary-btn"
                  onClick={() => navigate('/events/E-2026-001/plan')}
                >
                  <span>Inspect Test Plan & Exclusions</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </article>
        );

      case 'risk_approver':
        return (
          <article className="ev-persona-hero ev-persona-hero--alert">
            <div className="ev-persona-hero__header">
              <div className="ev-persona-hero__tag-group">
                <span className="ev-persona-hero__role-badge">RISK & COMPLIANCE COCKPIT</span>
                <span className="ev-persona-hero__time-tag">
                  <ShieldCheck size={13} /> Trusted Kernel Gate
                </span>
              </div>
              <RiskMeter tier="critical" compact />
            </div>

            <h2 className="ev-persona-hero__title">
              Promotion Blocked by Safety Invariant K-014
            </h2>
            <p className="ev-persona-hero__summary">
              Candidate Model Atlas-1b was deterministically blocked from automated deployment due to tool-inversion failure on regulated workloads. <strong>Deterministic policy overrides all LLM advisories.</strong> A dual-signed human approval record is required to advance.
            </p>

            <div className="ev-persona-hero__impact-strip">
              <div className="impact-item">
                <span className="impact-label">Deterministic Check:</span>
                <span className="impact-val impact-val--alert">FAIL (K-014 Violation)</span>
              </div>
              <div className="impact-item">
                <span className="impact-label">Audit Evidence:</span>
                <span className="impact-val">Merkle Chain Sealed (SHA-256)</span>
              </div>
              <div className="impact-item">
                <span className="impact-label">Promotion Authority:</span>
                <span className="impact-val">Priya Menon (Risk Approver)</span>
              </div>
            </div>

            <div className="ev-persona-hero__footer">
              <span className="ev-persona-hero__meta">Event: E-2026-001 · Decision Pending</span>
              <div className="ev-persona-hero__actions">
                <button
                  type="button"
                  className="ev-persona-hero__primary-btn"
                  onClick={() => navigate('/events/E-2026-001/decision')}
                >
                  <span>Review Block Rationale & Evidence</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </article>
        );

      case 'sre':
        return (
          <article className="ev-persona-hero ev-persona-hero--success">
            <div className="ev-persona-hero__header">
              <div className="ev-persona-hero__tag-group">
                <span className="ev-persona-hero__role-badge">SRE & OPERATIONS COCKPIT</span>
                <span className="ev-persona-hero__time-tag">
                  <Activity size={13} /> Live AI Gateway Traffic
                </span>
              </div>
              <RiskMeter tier="low" compact />
            </div>

            <h2 className="ev-persona-hero__title">
              Active Gateway Canary in Progress: Ticket Summariser
            </h2>
            <p className="ev-persona-hero__summary">
              Cognizant AI Gateway is routing <strong>5% live traffic</strong> to Atlas-1b candidate. Live telemetry indicates <strong>P95 latency of 412ms</strong> (within 850ms threshold) and 0.02% error rate. Autonomous sub-second rollback controller is armed.
            </p>

            <div className="ev-persona-hero__impact-strip">
              <div className="impact-item">
                <span className="impact-label">Canary Route:</span>
                <span className="impact-val">5% Candidate / 95% Production</span>
              </div>
              <div className="impact-item">
                <span className="impact-label">Live P95 Latency:</span>
                <span className="impact-val impact-val--success">412ms (SLA &lt;850ms)</span>
              </div>
              <div className="impact-item">
                <span className="impact-label">Rollback Controller:</span>
                <span className="impact-val impact-val--success">Armed & Autonomous</span>
              </div>
            </div>

            <div className="ev-persona-hero__footer">
              <span className="ev-persona-hero__meta">Gateway Telemetry Streaming</span>
              <div className="ev-persona-hero__actions">
                <button
                  type="button"
                  className="ev-persona-hero__primary-btn"
                  onClick={() => navigate('/events/E-2026-001/rollout')}
                >
                  <span>View Live Canary Telemetry</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </article>
        );

      default:
        // Platform Engineer / Ravi Kulkarni (Default view for evaluators)
        return (
          <article className="ev-persona-hero ev-persona-hero--primary">
            <div className="ev-persona-hero__header">
              <div className="ev-persona-hero__tag-group">
                <span className="ev-persona-hero__role-badge">ENTERPRISE AI PLATFORM COCKPIT</span>
                <span className="ev-persona-hero__time-tag">
                  <Clock size={13} /> 14 Days Remaining in Window
                </span>
              </div>
              <RiskMeter tier="critical" compact />
            </div>

            <h2 className="ev-persona-hero__title">
              Upstream Event: AWS Bedrock Retiring Atlas-1
            </h2>
            <p className="ev-persona-hero__summary">
              Provider A announced retirement of Atlas-1 v1. Blast radius discovery identified <strong>6 enterprise applications</strong> and 24 dependency edges affected, with 1 unconfirmed critical edge on Refund Agent blocking the G1 gate.
            </p>

            <div className="ev-persona-hero__impact-strip">
              <div className="impact-item">
                <span className="impact-label">Blast Radius Scope:</span>
                <span className="impact-val">6 Applications · 24 Edges</span>
              </div>
              <div className="impact-item">
                <span className="impact-label">G1 Gate Pre-requisite:</span>
                <span className="impact-val impact-val--alert">
                  {!g1State.passed ? '1 Edge Blocks G1 (Refund Agent)' : 'Passed'}
                </span>
              </div>
              <div className="impact-item">
                <span className="impact-label">Candidate Model:</span>
                <span className="impact-val">Atlas-1b (Fine-tuned adapter)</span>
              </div>
            </div>

            <div className="ev-persona-hero__footer">
              <span className="ev-persona-hero__meta">Event ID: E-2026-001 · 6 apps affected</span>
              <div className="ev-persona-hero__actions">
                <button
                  type="button"
                  className="ev-persona-hero__primary-btn"
                  onClick={() => navigate('/events/E-2026-001/blast-radius')}
                >
                  <span>Start Qualification & Review Blast Radius</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </article>
        );
    }
  };

  // Render role-specific KPI dials
  const renderPersonaKPIs = () => {
    switch (role) {
      case 'app_owner':
        return (
          <>
            <StatTile
              label="My Monitored Apps"
              value="4 Apps"
              proofType="measured"
              delta={{ value: '2 Tier-1 Critical (Refund, Claims)', positive: true }}
            />
            <StatTile
              label="Active Threats"
              value="1 Deprecation"
              proofType="measured"
              delta={{ value: 'Atlas-1 EOL in 14 days', positive: false }}
            />
            <StatTile
              label="Production Gate"
              value="Blocked"
              proofType="measured"
              delta={{ value: 'K-014 Safety Invariant Violation', positive: false }}
            />
          </>
        );

      case 'qa_lead':
        return (
          <>
            <StatTile
              label="Test Optimization"
              value="134 / 480"
              proofType="measured"
              delta={{ value: '72% runtime saved via pruning', positive: true }}
            />
            <StatTile
              label="Defect Detection Rate"
              value="100%"
              proofType="measured"
              delta={{ value: '8 of 8 planted seeds isolated', positive: true }}
            />
            <StatTile
              label="Synthesized Test Gaps"
              value="1 Generated"
              proofType="illustrative"
              delta={{ value: 'GEN-01 claims assertion', positive: true }}
            />
          </>
        );

      case 'risk_approver':
        return (
          <>
            <StatTile
              label="Deterministic Invariants"
              value="12 / 12 Verified"
              proofType="measured"
              delta={{ value: 'Hypotheses H1–H12 audited', positive: true }}
            />
            <StatTile
              label="Active Hard Stops"
              value="1 Blocked"
              proofType="measured"
              delta={{ value: 'Rule K-014: Tool Inversion on P1', positive: false }}
            />
            <StatTile
              label="Audit Ledger Integrity"
              value="100% Sealed"
              proofType="measured"
              delta={{ value: '0 unapproved promotions allowed', positive: true }}
            />
          </>
        );

      case 'sre':
        return (
          <>
            <StatTile
              label="Active Canary Traffic"
              value="5% Candidate"
              proofType="measured"
              delta={{ value: 'Ticket Summariser route active', positive: true }}
            />
            <StatTile
              label="Gateway P95 Latency"
              value="412 ms"
              proofType="measured"
              delta={{ value: 'Within 850ms enterprise SLA', positive: true }}
            />
            <StatTile
              label="Rollback Controller"
              value="Armed"
              proofType="measured"
              delta={{ value: 'Sub-850ms automated tripwire', positive: true }}
            />
          </>
        );

      default:
        return (
          <>
            <StatTile
              label="Enterprise Estate"
              value="14 Models · 6 Apps"
              proofType="measured"
              delta={{ value: '24 dependency edges active', positive: true }}
            />
            <StatTile
              label="Qualification Scope"
              value="134 / 480 Tests"
              proofType="illustrative"
              delta={{ value: '72% scope reduction', positive: true }}
            />
            <StatTile
              label="Graph Attestation"
              value={isGraphStale ? 'Degraded' : '98.2%'}
              proofType="measured"
              delta={{
                value: !g1State.passed ? '1 critical edge unconfirmed' : 'All paths attested',
                positive: g1State.passed,
              }}
            />
          </>
        );
    }
  };

  return (
    <div className="ev-home">
      {/* Hero Section & Greeting */}
      <section className="ev-home__hero">
        <div className="ev-home__hero-content">
          <div className="ev-home__greeting-row">
            <div className="ev-home__greeting-left">
              <h1 className="ev-home__greeting">
                Good morning, {currentUser.name.split(' ')[0]}.
              </h1>
              <span className="ev-home__role-pill">{currentUser.roleTitle}</span>
            </div>
            <button
              type="button"
              className="ev-home__log-event-btn"
              onClick={() => setManualEventModalOpen(true)}
              title="Log ad-hoc model change event"
            >
              <Plus size={16} />
              <span>Log event</span>
            </button>
          </div>
          <p className="ev-home__subtitle">
            {openEvents.length} active qualification event waiting across {workloads.length} enterprise applications.
          </p>

          {/* Layer 2a: Evaluator Perspective Switcher Strip */}
          <div className="ev-home-persona-selector" aria-label="Switch Persona Perspective">
            <div className="persona-selector-label">
              <Users size={14} className="persona-selector-icon" />
              <span>SWITCH PERSPECTIVE:</span>
            </div>
            <div className="persona-selector-chips" role="tablist">
              {identities.filter(u => ['user-asha', 'user-marcus', 'user-priya', 'user-sofia', 'user-ravi', 'user-jonas'].includes(u.id)).map((id) => {
                const isActive = id.id === currentUser.id;
                return (
                  <button
                    key={id.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`persona-chip ${isActive ? 'persona-chip--active' : ''}`}
                    onClick={() => setCurrentUser(id.id)}
                    title={`Switch view to ${id.name} (${id.roleTitle})`}
                  >
                    <span className="persona-chip-avatar">{id.initials}</span>
                    <div className="persona-chip-text">
                      <span className="persona-chip-name">{id.name.split(' ')[0]}</span>
                      <span className="persona-chip-role">({id.roleTitle.split('/')[0].trim()})</span>
                    </div>
                    {isActive && <span className="persona-chip-dot" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Persona-Specific Dynamic Hero Card */}
        {renderPersonaHero()}

        {/* Persona-Specific Dynamic KPI Dials */}
        <div className="ev-home__stats-row">
          {renderPersonaKPIs()}
        </div>
      </section>

      {/* Layer 3: Fast-Track Techathon Interactive Scenarios (For Evaluators & Judges) */}
      <section className="ev-home-scenarios" aria-labelledby="scenarios-heading">
        <div className="scenarios-header">
          <div className="scenarios-title-group">
            <Sparkles size={18} className="scenarios-sparkle-icon" />
            <h2 id="scenarios-heading" className="scenarios-title">
              Fast-Track Qualification Scenarios (Interactive Walkthroughs)
            </h2>
          </div>
          <span className="scenarios-caption">
            Click any scenario to see how AI Evergreen automates qualification end-to-end:
          </span>
        </div>

        <div className="scenarios-grid">
          {/* Scenario 1: Deprecation with Seeded Failure */}
          <div
            className="scenario-card scenario-card--critical"
            onClick={() => navigate('/events/E-2026-001/blast-radius')}
          >
            <div className="scenario-card-top">
              <span className="scenario-number-tag">SCENARIO 1</span>
              <span className="scenario-type-badge scenario-type-badge--red">Urgent Deprecation</span>
            </div>
            <h3 className="scenario-card-title">Model EOL & Seeded Defect Catch</h3>
            <p className="scenario-card-desc">
              AWS Bedrock retires Atlas-1. Graph discovers 6 apps. Eval isolates a fatal tool inversion defect on Refund Agent. Kernel blocks promotion.
            </p>
            <div className="scenario-card-action">
              <span>Run Scenario 1 (Full 6-Stage Pipeline)</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* Scenario 2: Minor Checkpoint Canary */}
          <div
            className="scenario-card scenario-card--success"
            onClick={() => navigate('/events/E-2026-001/rollout')}
          >
            <div className="scenario-card-top">
              <span className="scenario-number-tag">SCENARIO 2</span>
              <span className="scenario-type-badge scenario-type-badge--green">Routine Upgrade</span>
            </div>
            <h3 className="scenario-card-title">Routine Upgrade & Canary Deploy</h3>
            <p className="scenario-card-desc">
              Minor model version upgrade. 100% of regression tests pass with zero regressions. Cognizant AI Gateway deploys a 5% canary route.
            </p>
            <div className="scenario-card-action">
              <span>Inspect Canary Telemetry & Rollback</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* Scenario 3: Pricing & Adaptive Test Pruning */}
          <div
            className="scenario-card scenario-card--warning"
            onClick={() => navigate('/events/E-2026-001/plan')}
          >
            <div className="scenario-card-top">
              <span className="scenario-number-tag">SCENARIO 3</span>
              <span className="scenario-type-badge scenario-type-badge--amber">Commercial Terms</span>
            </div>
            <h3 className="scenario-card-title">Price Change & Test Pruning</h3>
            <p className="scenario-card-desc">
              Provider B adjusts token pricing. Adaptive Planner prunes 72% redundant test cases, saving 18.5 test hours while preserving 100% safety.
            </p>
            <div className="scenario-card-action">
              <span>Inspect Test Optimization Plan</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </section>

      {/* Layer 4: Events Table & Operational Sidebar Grid */}
      <div className="ev-home__grid">
        {/* Main Column */}
        <div className="ev-home__main-col">
          {/* Change Events Table Section */}
          <section className="ev-home__table-section" aria-labelledby="all-events-heading">
            <div className="ev-home__table-header-row">
              <div>
                <h2 id="all-events-heading" className="ev-home__section-title">
                  All Qualification Events
                </h2>
                <span className="ev-home__table-subtitle">
                  Showing {filteredEvents.length} of {events.length} enterprise change events
                </span>
              </div>

              {/* Filters */}
              <div className="ev-home__filters">
                <div className="ev-home__filter-group">
                  <button
                    type="button"
                    className={`ev-home__filter-btn ${statusFilter === 'all' ? 'ev-home__filter-btn--active' : ''}`}
                    onClick={() => setStatusFilter('all')}
                  >
                    All ({events.length})
                  </button>
                  <button
                    type="button"
                    className={`ev-home__filter-btn ${statusFilter === 'open' ? 'ev-home__filter-btn--active' : ''}`}
                    onClick={() => setStatusFilter('open')}
                  >
                    Open ({openEvents.length})
                  </button>
                  <button
                    type="button"
                    className={`ev-home__filter-btn ${statusFilter === 'closed' ? 'ev-home__filter-btn--active' : ''}`}
                    onClick={() => setStatusFilter('closed')}
                  >
                    Closed ({events.length - openEvents.length})
                  </button>
                </div>

                <div className="ev-home__search-box">
                  <input
                    type="search"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ev-home__search-input"
                    aria-label="Search events by name or ID"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="ev-home__search-clear"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Events Table */}
            <div className="ev-home__table-wrapper">
              <table className="ev-home__table" aria-label="Change Events Table">
                <thead>
                  <tr>
                    <th scope="col" className="ev-home__th-id">Event ID</th>
                    <th scope="col">Event Details</th>
                    <th scope="col">Severity</th>
                    <th scope="col">Pipeline Stage</th>
                    <th scope="col">Outcomes</th>
                    <th scope="col" className="ev-home__th-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((evt) => (
                    <tr
                      key={evt.id}
                      className="ev-home__table-row"
                      onClick={() => navigate('/events/E-2026-001/blast-radius')}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') navigate('/events/E-2026-001/blast-radius');
                      }}
                    >
                      <td className="ev-home__td-id">
                        <span className="ev-home__event-id">{evt.id}</span>
                      </td>
                      <td className="ev-home__td-title">
                        <div className="ev-home__title-cell">
                          <strong className="ev-home__event-title">{evt.title}</strong>
                          <span className="ev-home__event-meta">
                            {evt.source} · {evt.appCount} apps · Detected {evt.detectedAt}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`ev-home__severity-badge ev-home__severity-badge--${evt.highestRisk.toLowerCase()}`}>
                          {evt.highestRisk}
                        </span>
                      </td>
                      <td>
                        {renderStageIndicator(evt.stage)}
                      </td>
                      <td>
                        {evt.outcomes ? (
                          <RiskBadgeRow counts={evt.outcomes} />
                        ) : evt.status === 'closed' ? (
                          <span className="ev-home__closed-tag">
                            <CheckCircle size={13} aria-hidden="true" /> Archived
                          </span>
                        ) : (
                          <span className="ev-home__pending-tag">Pending analysis</span>
                        )}
                      </td>
                      <td className="ev-home__td-action" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="ev-home__row-action-btn"
                          onClick={() => navigate('/events/E-2026-001/blast-radius')}
                        >
                          Review & decide
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sidebar Column: Horizon & Graph Health */}
        <aside className="ev-home__side-col" aria-label="Operational Health and Horizon">
          {/* Model Horizon Card */}
          <div className="ev-side-card">
            <div className="ev-side-card__header">
              <Calendar size={18} className="ev-side-card__icon" aria-hidden="true" />
              <h2 className="ev-side-card__title">Model Horizon</h2>
            </div>
            <p className="ev-side-card__desc">Upcoming model deprecations and provider updates:</p>
            <ul className="ev-side-card__list">
              <li className="ev-side-card__item ev-side-card__item--urgent">
                <div className="ev-side-card__item-main">
                  <strong>Atlas-1 v1</strong>
                  <span>AWS Bedrock (Current)</span>
                </div>
                <span className="ev-side-card__item-badge ev-side-card__item-badge--red">
                  Retires in 14d
                </span>
              </li>
              <li className="ev-side-card__item ev-side-card__item--warning">
                <div className="ev-side-card__item-main">
                  <strong>Orion-2</strong>
                  <span>Provider B (Alternative)</span>
                </div>
                <span className="ev-side-card__item-badge ev-side-card__item-badge--gold">
                  Price in 9d
                </span>
              </li>
              <li className="ev-side-card__item">
                <div className="ev-side-card__item-main">
                  <strong>Nova-3</strong>
                  <span>AWS Bedrock</span>
                </div>
                <span className="ev-side-card__item-badge">Supported</span>
              </li>
            </ul>
          </div>

          {/* Graph Health Card */}
          <div className="ev-side-card">
            <div className="ev-side-card__header">
              <ShieldAlert size={18} className="ev-side-card__icon" aria-hidden="true" />
              <h2 className="ev-side-card__title">Estate Graph Health</h2>
            </div>
            <div className="ev-side-card__health-status">
              <div className="ev-side-card__status-row">
                <span className="ev-side-card__status-dot" />
                <span className="ev-side-card__status-text">Freshness: Fresh 2 min ago</span>
              </div>
              <div className="ev-side-card__metric-row">
                <span className="ev-side-card__metric-label">Stale edges:</span>
                <span className="ev-side-card__metric-val">{staleEdges.length} detected</span>
              </div>
              <div className="ev-side-card__metric-row">
                <span className="ev-side-card__metric-label">Unconfirmed critical:</span>
                <span className="ev-side-card__metric-val ev-side-card__metric-val--alert">
                  {!g1State.passed ? '1 edge blocks G1' : '0 (Passed)'}
                </span>
              </div>
            </div>

            {!g1State.passed && (
              <div className="ev-side-card__alert-box">
                <AlertTriangle size={14} className="ev-side-card__alert-icon" aria-hidden="true" />
                <div className="ev-side-card__alert-text">
                  Refund Agent → Policy Tool unconfirmed (0.62 conf).
                </div>
              </div>
            )}

            <button
              type="button"
              className="ev-side-card__link-btn"
              onClick={() => navigate('/events/E-2026-001/blast-radius')}
            >
              <span>View edge in Blast Radius</span>
              <ExternalLink size={14} aria-hidden="true" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
