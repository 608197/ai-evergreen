import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import { StageStepper, type StageStep } from '../../components/common/StageStepper';
import { GateBanner } from '../../components/common/GateBanner';
import { DependencyGraph } from '../../components/graph/DependencyGraph';
import { EdgeReviewModal } from '../../components/overlays/EdgeReviewModal';
import { StatusChip } from '../../components/common/StatusChip';
import { ConfidenceMeter } from '../../components/common/ConfidenceMeter';
import { ProvenanceTag } from '../../components/common/ProvenanceTag';
import { Toast } from '../../components/common/Toast';
import type { DependencyEdge } from '../../types/domain';
import {
  ArrowRight,
  Network,
  Table as TableIcon,
  Search,
  CheckCircle,
  Lock,
} from 'lucide-react';
import './BlastRadiusScreen.css';

export const BlastRadiusScreen: React.FC = () => {
  const { id = 'E-2026-001' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    events,
    workloads,
    edges,
    getGateG1,
    setEventStage,
  } = useEvergreenStore();

  const currentEvent = events.find((e) => e.id === id) || events[0];
  const g1State = getGateG1(id);

  const [viewMode, setViewMode] = useState<'graph' | 'table'>('graph');
  const [showConnectedOnly, setShowConnectedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEdgeForReview, setSelectedEdgeForReview] = useState<DependencyEdge | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Stepper configuration
  const stages: StageStep[] = [
    {
      id: 'blast_radius',
      index: 1,
      name: 'Blast Radius',
      state: 'current',
    },
    {
      id: 'plan',
      index: 2,
      name: 'Regression Plan',
      state: g1State.passed ? 'available' : 'locked',
      lockReason: !g1State.passed ? 'Locked until Gate G1 passes' : undefined,
    },
    {
      id: 'results',
      index: 3,
      name: 'Results & Matrix',
      state: 'locked',
      lockReason: 'Requires test plan approval',
    },
    {
      id: 'decision',
      index: 4,
      name: 'Decision & Approval',
      state: 'locked',
      lockReason: 'Requires results evaluation',
    },
    {
      id: 'rollout',
      index: 5,
      name: 'Rollout & Canary',
      state: 'locked',
      lockReason: 'Requires signed human approval',
    },
    {
      id: 'record',
      index: 6,
      name: 'Qualification Record',
      state: 'locked',
      lockReason: 'Finalized upon closure',
    },
  ];

  // Critical unconfirmed edge
  const criticalUnconfirmedEdge = edges.find(
    (e) => e.isCriticalPath && e.state !== 'confirmed' && e.state !== 'overridden'
  );

  // Handle stage navigation
  const handleContinueToPlan = () => {
    if (!g1State.passed) return;
    setEventStage(currentEvent.id, 'plan');
    setToastMessage('Gate G1 satisfied. Proceeding to Stage 2: Regression Plan.');
    navigate(`/events/${currentEvent.id}/plan`);
  };

  const handleEdgeSelect = (edge: DependencyEdge) => {
    setSelectedEdgeForReview(edge);
  };

  // Filtered edges for table view
  const filteredEdges = edges.filter((e) => {
    if (!showConnectedOnly && e.state === 'stale') return false;
    if (
      searchQuery &&
      !e.fromName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !e.toName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !e.relationship.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="ev-blast-screen">
      {/* Toast Alert */}
      {toastMessage && (
        <Toast
          id="blast-toast"
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Top Header Strip with Breadcrumb & Primary Action */}
      <div className="ev-blast-header">
        <div className="ev-blast-header__main">
          <nav className="ev-blast-breadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="ev-blast-breadcrumb__link">Home</Link>
            <span className="ev-blast-breadcrumb__sep">/</span>
            <span className="ev-blast-breadcrumb__current">
              {currentEvent.id}: {currentEvent.title}
            </span>
          </nav>
          <h1 className="ev-blast-title">Blast Radius Discovery</h1>
          <p className="ev-blast-subtitle">
            Question: <em>Who is truly affected by this dependency change?</em>
          </p>
        </div>

        {/* Primary Action Button (Header) */}
        <div className="ev-blast-header__actions">
          <button
            type="button"
            className="ev-blast-primary-btn"
            disabled={!g1State.passed}
            onClick={handleContinueToPlan}
            title={
              !g1State.passed
                ? 'Plan is locked until 1 critical edge is confirmed or overridden.'
                : 'Continue to Stage 2 (Regression Plan)'
            }
          >
            {!g1State.passed ? (
              <Lock size={16} aria-hidden="true" />
            ) : (
              <CheckCircle size={16} aria-hidden="true" />
            )}
            <span>Continue to Plan</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Pipeline Spine: 6-Stage Stepper */}
      <section className="ev-blast-stepper-wrap" aria-label="Qualification Pipeline">
        <StageStepper
          stages={stages}
          currentStageId="blast_radius"
          onSelectStage={(stageId: string) => {
            if (stageId === 'plan' && g1State.passed) {
              handleContinueToPlan();
            }
          }}
        />
      </section>

      {/* Stage Gate G1 Banner */}
      {!g1State.passed && criticalUnconfirmedEdge ? (
        <div className="ev-blast-gate-wrap">
          <GateBanner
            gateId="G1"
            gateName="Blast Radius Critical Edge Attestation"
            blockingCount={1}
            message="1 unconfirmed critical edge blocks Regression Plan: Refund Agent → Policy Tool (0.62 confidence, LLM-inferred). Deterministic policy requires human attestation before test scoping."
            actionText="Review critical edge"
            onActionClick={() => setSelectedEdgeForReview(criticalUnconfirmedEdge)}
          />
        </div>
      ) : (
        <div className="ev-blast-g1-cleared" role="status">
          <CheckCircle size={16} className="ev-blast-cleared-icon" aria-hidden="true" />
          <span className="ev-blast-cleared-text">
            <strong>Gate G1 Satisfied:</strong> All critical dependency edges are attested. Regression Plan unlocked.
          </span>
        </div>
      )}

      {/* Controls & Summary Bar */}
      <div className="ev-blast-toolbar">
        <div className="ev-blast-summary-pills">
          <span className="ev-blast-pill ev-blast-pill--primary">
            6 affected applications
          </span>
          <span className="ev-blast-pill">
            2 connected, not affected
          </span>
          <span className="ev-blast-pill ev-blast-pill--muted">
            1 candidate model (Atlas-2)
          </span>
        </div>

        <div className="ev-blast-controls">
          {/* Search */}
          <div className="ev-blast-search">
            <Search size={14} className="ev-blast-search-icon" aria-hidden="true" />
            <input
              type="text"
              className="ev-blast-search-input"
              placeholder="Search dependencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Connected Not Affected Toggle */}
          <label className="ev-blast-toggle-label">
            <input
              type="checkbox"
              className="ev-blast-checkbox"
              checked={showConnectedOnly}
              onChange={(e) => setShowConnectedOnly(e.target.checked)}
            />
            <span>Show connected, not affected (2)</span>
          </label>

          {/* View Toggle */}
          <div className="ev-blast-view-toggle" role="group" aria-label="View representation">
            <button
              type="button"
              className={`ev-blast-view-btn ${viewMode === 'graph' ? 'ev-blast-view-btn--active' : ''}`}
              onClick={() => setViewMode('graph')}
              aria-pressed={viewMode === 'graph'}
            >
              <Network size={15} aria-hidden="true" />
              <span>Graph View</span>
            </button>
            <button
              type="button"
              className={`ev-blast-view-btn ${viewMode === 'table' ? 'ev-blast-view-btn--active' : ''}`}
              onClick={() => setViewMode('table')}
              aria-pressed={viewMode === 'table'}
            >
              <TableIcon size={15} aria-hidden="true" />
              <span>Data Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport: Graph or Table */}
      <section className="ev-blast-main-view">
        {viewMode === 'graph' ? (
          <DependencyGraph
            workloads={workloads}
            edges={edges}
            showConnectedOnly={showConnectedOnly}
            onSelectEdge={handleEdgeSelect}
          />
        ) : (
          <div className="ev-blast-table-card">
            <table className="ev-blast-table" aria-label="Dependency Edge Matrix">
              <thead>
                <tr>
                  <th scope="col">From (Caller)</th>
                  <th scope="col">Relationship</th>
                  <th scope="col">To (Target)</th>
                  <th scope="col">Evidence Class</th>
                  <th scope="col">Confidence</th>
                  <th scope="col">State</th>
                  <th scope="col" className="ev-blast-th-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEdges.map((edge) => {
                  const isUnconfirmed = edge.state !== 'confirmed' && edge.state !== 'overridden';
                  return (
                    <tr
                      key={edge.id}
                      className={`ev-blast-table-row ${isUnconfirmed ? 'ev-blast-table-row--unconfirmed' : ''}`}
                    >
                      <td>
                        <strong>{edge.fromName}</strong>
                        {edge.isCriticalPath && (
                          <span className="ev-blast-crit-badge">Critical Path</span>
                        )}
                      </td>
                      <td>
                        <span className="ev-blast-rel-tag">{edge.relationship}</span>
                      </td>
                      <td>
                        <strong>{edge.toName}</strong>
                      </td>
                      <td>
                        <ProvenanceTag
                          kind={
                            edge.evidenceClass === 'LLM-inferred'
                              ? 'ai-proposed'
                              : edge.evidenceClass === 'manually-attested'
                              ? 'human-entered'
                              : 'rule-based'
                          }
                          source={edge.evidenceClass}
                        />
                      </td>
                      <td>
                        <ConfidenceMeter score={edge.confidence} />
                      </td>
                      <td>
                        <StatusChip status={edge.state} size="small" />
                      </td>
                      <td className="ev-blast-td-action">
                        <button
                          type="button"
                          className={`ev-blast-edge-btn ${isUnconfirmed ? 'ev-blast-edge-btn--highlight' : ''}`}
                          onClick={() => handleEdgeSelect(edge)}
                        >
                          {isUnconfirmed ? 'Review & Attest' : 'View / Override'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Edge Review Modal Overlay */}
      {selectedEdgeForReview && (
        <EdgeReviewModal
          edge={selectedEdgeForReview}
          onClose={() => {
            setSelectedEdgeForReview(null);
            setToastMessage('Edge attestation recorded in Qualification Record hash chain.');
          }}
        />
      )}
    </div>
  );
};
