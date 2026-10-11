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
  X,
  ExternalLink,
  Plus,
} from 'lucide-react';
import './HomeScreen.css';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
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

  // Stale edges count
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

  // Determine top zone ordering based on role per §8.2
  const isSRE = currentUser.role === 'sre';

  return (
    <div className="ev-home">
      {/* Zone 1: Greeting & Role Context Banner */}
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
              title="Log ad-hoc model change event (Overlay O3)"
            >
              <Plus size={16} />
              <span>Log event</span>
            </button>
          </div>
          <p className="ev-home__subtitle">
            {openEvents.length} qualification decisions waiting across {workloads.length} enterprise applications.
          </p>
        </div>

        {/* Headline KPI Stat Tiles */}
        <div className="ev-home__stats-row">
          <StatTile
            label="Pending Events"
            value={openEvents.length}
            proofType="measured"
            delta={{ value: '2 require review', positive: false }}
          />
          <StatTile
            label="Tests Selected"
            value="134 / 480"
            proofType="illustrative"
            delta={{ value: '72% scope reduction', positive: true }}
          />
          <StatTile
            label="Graph Health"
            value={isGraphStale ? 'Degraded' : '98.2%'}
            proofType="measured"
            delta={{
              value: !g1State.passed ? '1 critical edge unconfirmed' : 'All critical paths attested',
              positive: g1State.passed,
            }}
          />
        </div>
      </section>

      {/* Zone 2: Priority Cards & Operational Sidebars */}
      <div className="ev-home__grid">
        {/* Main Column */}
        <div className="ev-home__main-col">
          {/* SRE Banner (if SRE) */}
          {isSRE && (
            <div className="ev-home__sre-strip">
              <div className="ev-home__sre-header">
                <Activity size={18} className="ev-home__sre-icon" aria-hidden="true" />
                <span className="ev-home__sre-title">Active Rollouts</span>
              </div>
              <p className="ev-home__sre-body">
                No active canaries running. Rollouts start automatically after approval on the Decision screen.
              </p>
            </div>
          )}

          {/* Needs your decision section */}
          <section className="ev-home__decisions-section" aria-labelledby="needs-decision-heading">
            <div className="ev-home__section-header">
              <h2 id="needs-decision-heading" className="ev-home__section-title">
                Needs your decision
              </h2>
              <span className="ev-home__badge-count">{openEvents.length}</span>
            </div>

            <div className="ev-home__decision-cards">
              {/* Card 1: Atlas-1 Retirement */}
              <article className="ev-decision-card ev-decision-card--critical">
                <div className="ev-decision-card__header">
                  <div className="ev-decision-card__tags">
                    <span className="ev-decision-card__kind-tag">Retirement</span>
                    <span className="ev-decision-card__urgency">
                      <Clock size={12} aria-hidden="true" /> 3h remaining in window
                    </span>
                  </div>
                  <RiskMeter tier="critical" compact />
                </div>

                <h3 className="ev-decision-card__title">Model Atlas-1 retirement</h3>
                <p className="ev-decision-card__summary">
                  Provider A is retiring Atlas-1 v1. Blast radius discovered 6 enterprise applications affected with 1 critical tool-calling agent.
                </p>

                <div className="ev-decision-card__outcomes">
                  <RiskBadgeRow
                    counts={{ migrate: 2, canary: 2, investigate: 1, block: 1 }}
                  />
                  <div className="ev-decision-card__kernel-note">
                    <ShieldAlert size={14} className="ev-decision-card__kernel-icon" aria-hidden="true" />
                    <span>Kernel: 1 Deny (K-014 on Refund Agent)</span>
                  </div>
                </div>

                <div className="ev-decision-card__footer">
                  <span className="ev-decision-card__meta">Event ID: E-2026-001 · 6 apps</span>
                  <button
                    type="button"
                    className="ev-decision-card__action-btn"
                    onClick={() => navigate('/events/E-2026-001/blast-radius')}
                  >
                    <span>Review and decide</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </article>

              {/* Card 2: Orion-2 Price Change */}
              <article className="ev-decision-card">
                <div className="ev-decision-card__header">
                  <div className="ev-decision-card__tags">
                    <span className="ev-decision-card__kind-tag">Price Change</span>
                    <span className="ev-decision-card__urgency">
                      <Clock size={12} aria-hidden="true" /> 1d remaining
                    </span>
                  </div>
                  <RiskMeter tier="high" compact />
                </div>

                <h3 className="ev-decision-card__title">Orion-2 price & token policy change</h3>
                <p className="ev-decision-card__summary">
                  Provider B commercial terms change in 9 days. 3 applications affected. Awaiting regression plan sign-off from Test Lead.
                </p>

                <div className="ev-decision-card__outcomes">
                  <span className="ev-decision-card__stage-info">
                    Stage: <strong>Regression Plan</strong> (Awaiting sign-off)
                  </span>
                </div>

                <div className="ev-decision-card__footer">
                  <span className="ev-decision-card__meta">Event ID: E-2026-013 · 3 apps</span>
                  <button
                    type="button"
                    className="ev-decision-card__action-btn ev-decision-card__action-btn--secondary"
                    onClick={() => navigate('/events/E-2026-001/blast-radius')}
                  >
                    <span>Open event</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </article>
            </div>
          </section>

          {/* Change Events Table Section */}
          <section className="ev-home__table-section" aria-labelledby="all-events-heading">
            <div className="ev-home__table-header-row">
              <div>
                <h2 id="all-events-heading" className="ev-home__section-title">
                  All Qualification Events
                </h2>
                <span className="ev-home__table-subtitle">
                  Showing {filteredEvents.length} of {events.length} events
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
                    All
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
                    Closed (2)
                  </button>
                </div>

                <div className="ev-home__search-box">
                  <input
                    type="text"
                    className="ev-home__search-input"
                    placeholder="Filter events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="ev-home__search-clear"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="ev-home__table-wrapper">
              <table className="ev-home__table" aria-label="Change Events">
                <thead>
                  <tr>
                    <th scope="col">Event ID & Name</th>
                    <th scope="col">Type</th>
                    <th scope="col">Current Stage</th>
                    <th scope="col">Apps</th>
                    <th scope="col">Highest Risk</th>
                    <th scope="col">Outcomes</th>
                    <th scope="col" className="ev-home__th-action">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((evt) => (
                    <tr
                      key={evt.id}
                      className="ev-home__table-row"
                      onClick={() => navigate(`/events/${evt.id}/blast-radius`)}
                    >
                      <td className="ev-home__td-main">
                        <span className="ev-home__event-id">{evt.id}</span>
                        <strong className="ev-home__event-title">{evt.title}</strong>
                      </td>
                      <td>
                        <span className="ev-home__kind-badge">{evt.kind}</span>
                      </td>
                      <td>{renderStageIndicator(evt.stage)}</td>
                      <td>
                        <span className="ev-home__app-count">{evt.appCount} apps</span>
                      </td>
                      <td>
                        <RiskMeter tier={evt.highestRisk.toLowerCase() as any} compact />
                      </td>
                      <td>
                        {evt.status === 'open' && evt.outcomes.migrate > 0 ? (
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
                        {evt.id === 'E-2026-001' ? (
                          <button
                            type="button"
                            className="ev-home__row-action-btn"
                            onClick={() => navigate('/events/E-2026-001/blast-radius')}
                          >
                            Review & decide
                          </button>
                        ) : evt.id === 'E-2026-013' ? (
                          <button
                            type="button"
                            className="ev-home__row-action-btn ev-home__row-action-btn--secondary"
                            onClick={() => navigate('/events/E-2026-001/blast-radius')}
                          >
                            Approve plan
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="ev-home__row-action-btn ev-home__row-action-btn--ghost"
                            onClick={() => navigate('/events/E-2026-001/blast-radius')}
                          >
                            View record
                          </button>
                        )}
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
                  <span>Provider A (Current)</span>
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
                  <span>Provider C</span>
                </div>
                <span className="ev-side-card__item-badge">Supported</span>
              </li>
            </ul>
          </div>

          {/* Graph Health Card */}
          <div className="ev-side-card">
            <div className="ev-side-card__header">
              <ShieldAlert size={18} className="ev-side-card__icon" aria-hidden="true" />
              <h2 className="ev-side-card__title">Graph Health</h2>
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
