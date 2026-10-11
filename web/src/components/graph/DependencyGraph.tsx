import React, { useState } from 'react';
import type { Workload, DependencyEdge } from '../../types/domain';
import { StatusChip } from '../common/StatusChip';
import { RiskMeter } from '../common/RiskMeter';
import './DependencyGraph.css';

interface DependencyGraphProps {
  workloads: Workload[];
  edges: DependencyEdge[];
  showConnectedOnly: boolean;
  onSelectEdge: (edge: DependencyEdge) => void;
  onSelectWorkload?: (workload: Workload) => void;
}

export const DependencyGraph: React.FC<DependencyGraphProps> = ({
  workloads,
  edges,
  showConnectedOnly,
  onSelectEdge,
  onSelectWorkload,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('app-refund');

  // Filter workloads based on toggle
  const visibleWorkloads = workloads.filter(
    (w) => showConnectedOnly || w.status === 'affected'
  );

  const selectedWorkload = workloads.find((w) => w.id === selectedNodeId);

  // Layout node coordinates (SVG canvas: 860 x 540)
  // Hop 0 (Center right): Atlas-1 v1 model
  const modelNode = { id: 'model-atlas-1', label: 'Atlas-1 v1', sub: 'Changed Dependency', x: 700, y: 260, type: 'model' };

  // Hop 1 (Intermediate components)
  const intermediateNodes: Record<string, { id: string; label: string; sub: string; x: number; y: number; type: string }> = {
    'tool-policy-refund': { id: 'tool-policy-refund', label: 'Refund Policy Tool', sub: 'Tool Component', x: 440, y: 80, type: 'tool' },
    'kb-underwriting': { id: 'kb-underwriting', label: 'Underwriting Guidelines', sub: 'Vector Store', x: 440, y: 240, type: 'kb' },
    'model-atlas-0': { id: 'model-atlas-0', label: 'Atlas-0 (Retired)', sub: 'Legacy Dependency', x: 700, y: 470, type: 'legacy' },
  };

  // Hop 2 (Enterprise Applications on Left)
  const workloadCoords: Record<string, { x: number; y: number }> = {
    'app-refund': { x: 120, y: 60 },
    'app-claims': { x: 120, y: 135 },
    'app-chat': { x: 120, y: 210 },
    'app-invoice': { x: 120, y: 285 },
    'app-ticket': { x: 120, y: 360 },
    'app-triage': { x: 120, y: 435 },
    'app-search-widget': { x: 120, y: 505 },
    'app-hr-bot': { x: 120, y: 575 },
  };

  const getNodePos = (id: string) => {
    if (id === modelNode.id) return { x: modelNode.x, y: modelNode.y };
    if (intermediateNodes[id]) return { x: intermediateNodes[id].x, y: intermediateNodes[id].y };
    if (workloadCoords[id]) return workloadCoords[id];
    return { x: 400, y: 300 };
  };

  return (
    <div className="ev-graph-container">
      {/* Topology SVG */}
      <div className="ev-graph-canvas-wrap">
        <svg
          className="ev-graph-svg"
          viewBox="0 0 880 620"
          role="img"
          aria-label="2-hop dependency graph for Atlas-1 retirement"
        >
          <defs>
            {/* Arrow marker for confirmed edges */}
            <marker
              id="arrow-navy"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 8 4, 0 8" fill="#12304A" />
            </marker>
            {/* Arrow marker for unconfirmed/proposed edge */}
            <marker
              id="arrow-gold"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 8 4, 0 8" fill="#A8791A" />
            </marker>
            {/* Arrow marker for connected not affected */}
            <marker
              id="arrow-slate"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 8 4, 0 8" fill="#8A97A0" />
            </marker>
          </defs>

          {/* SVG Gridlines */}
          <line x1="280" y1="20" x2="280" y2="600" stroke="#E4EFEF" strokeDasharray="4 4" />
          <line x1="570" y1="20" x2="570" y2="600" stroke="#E4EFEF" strokeDasharray="4 4" />
          <text x="180" y="24" className="ev-graph-col-label">HOP 2: WORKLOADS</text>
          <text x="420" y="24" className="ev-graph-col-label">HOP 1: COMPONENTS</text>
          <text x="680" y="24" className="ev-graph-col-label">HOP 0: DEPENDENCY</text>

          {/* Render Edges */}
          {edges.map((edge) => {
            const fromPos = getNodePos(edge.fromId);
            const toPos = getNodePos(edge.toId);
            const isUnconfirmed = edge.state !== 'confirmed' && edge.state !== 'overridden';
            const isConnectedOnly = edge.state === 'stale';

            if (isConnectedOnly && !showConnectedOnly) return null;

            // Curve calculation
            const dx = toPos.x - fromPos.x;
            const midX = fromPos.x + dx * 0.5;
            const pathData = `M ${fromPos.x + 85} ${fromPos.y + 16} C ${midX} ${fromPos.y + 16}, ${midX} ${toPos.y + 16}, ${toPos.x - 70} ${toPos.y + 16}`;

            return (
              <g
                key={edge.id}
                className={`ev-graph-edge-group ${isUnconfirmed ? 'ev-graph-edge-group--unconfirmed' : ''}`}
                onClick={() => onSelectEdge(edge)}
              >
                <path
                  d={pathData}
                  className={`ev-graph-edge-path ${
                    isUnconfirmed
                      ? 'ev-graph-edge-path--gold'
                      : isConnectedOnly
                      ? 'ev-graph-edge-path--slate'
                      : 'ev-graph-edge-path--navy'
                  }`}
                  markerEnd={
                    isUnconfirmed
                      ? 'url(#arrow-gold)'
                      : isConnectedOnly
                      ? 'url(#arrow-slate)'
                      : 'url(#arrow-navy)'
                  }
                />

                {/* Edge Label Pill */}
                {isUnconfirmed ? (
                  <g
                    transform={`translate(${midX - 52}, ${(fromPos.y + toPos.y) / 2 - 10})`}
                    className="ev-graph-edge-badge"
                  >
                    <rect
                      width="104"
                      height="20"
                      rx="10"
                      className="ev-graph-badge-rect ev-graph-badge-rect--gold"
                    />
                    <text x="52" y="14" textAnchor="middle" className="ev-graph-badge-text">
                      ⚠ 0.62 Conf · Review
                    </text>
                  </g>
                ) : (
                  <g
                    transform={`translate(${midX - 35}, ${(fromPos.y + toPos.y) / 2 - 8})`}
                    className="ev-graph-edge-label-simple"
                  >
                    <text x="35" y="10" textAnchor="middle" className="ev-graph-edge-rel-text">
                      {edge.relationship}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Model Node (Hop 0) */}
          <g
            className="ev-graph-node-group ev-graph-node-group--model"
            transform={`translate(${modelNode.x - 70}, ${modelNode.y})`}
          >
            <rect width="140" height="48" rx="6" className="ev-graph-node-rect ev-graph-node-rect--model" />
            <text x="70" y="20" textAnchor="middle" className="ev-graph-node-title">
              {modelNode.label}
            </text>
            <text x="70" y="36" textAnchor="middle" className="ev-graph-node-sub">
              {modelNode.sub}
            </text>
          </g>

          {/* Intermediate Nodes (Hop 1) */}
          {Object.values(intermediateNodes).map((node) => {
            if (node.type === 'legacy' && !showConnectedOnly) return null;
            return (
              <g
                key={node.id}
                className="ev-graph-node-group ev-graph-node-group--tool"
                transform={`translate(${node.x - 65}, ${node.y})`}
              >
                <rect width="130" height="42" rx="6" className="ev-graph-node-rect ev-graph-node-rect--tool" />
                <text x="65" y="18" textAnchor="middle" className="ev-graph-node-title">
                  {node.label}
                </text>
                <text x="65" y="32" textAnchor="middle" className="ev-graph-node-sub">
                  {node.sub}
                </text>
              </g>
            );
          })}

          {/* Workload Nodes (Hop 2) */}
          {visibleWorkloads.map((w) => {
            const coords = workloadCoords[w.id] || { x: 120, y: 100 };
            const isSelected = selectedNodeId === w.id;
            const isCritical = w.criticality === 'critical' || w.riskTier === 'Critical';
            const isConnectedOnly = w.status === 'connected_not_affected';

            return (
              <g
                key={w.id}
                className={`ev-graph-node-group ${isSelected ? 'ev-graph-node-group--selected' : ''}`}
                transform={`translate(${coords.x - 85}, ${coords.y})`}
                onClick={() => {
                  setSelectedNodeId(w.id);
                  if (onSelectWorkload) onSelectWorkload(w);
                }}
              >
                <rect
                  width="170"
                  height="42"
                  rx="6"
                  className={`ev-graph-node-rect ${
                    isCritical
                      ? 'ev-graph-node-rect--critical'
                      : isConnectedOnly
                      ? 'ev-graph-node-rect--hollow'
                      : 'ev-graph-node-rect--workload'
                  }`}
                />
                <text x="14" y="18" className="ev-graph-node-title">
                  {w.name}
                </text>
                <text x="14" y="32" className="ev-graph-node-sub">
                  {w.workloadType} · {w.riskTier}
                </text>
                {/* Risk tag indicator on right */}
                <circle
                  cx="156"
                  cy="21"
                  r="5"
                  fill={
                    w.riskTier === 'Critical'
                      ? '#12304A'
                      : w.riskTier === 'High'
                      ? '#2B6F77'
                      : '#8A97A0'
                  }
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Node Sidebar Detail */}
      {selectedWorkload && (
        <aside className="ev-graph-inspector" aria-label="Workload Inspection">
          <div className="ev-graph-inspector__header">
            <div>
              <h3 className="ev-graph-inspector__title">{selectedWorkload.name}</h3>
              <span className="ev-graph-inspector__type">
                {selectedWorkload.workloadType} · v{selectedWorkload.contractVersion}
              </span>
            </div>
            <StatusChip
              status={
                selectedWorkload.status === 'affected'
                  ? selectedWorkload.outcome || 'proposed'
                  : 'unaffected'
              }
              size="small"
            />
          </div>

          <div className="ev-graph-inspector__body">
            <div className="ev-graph-inspector__field">
              <span className="ev-graph-inspector__label">Risk Classification</span>
              <div className="ev-graph-inspector__val-row">
                <RiskMeter tier={selectedWorkload.riskTier.toLowerCase() as any} compact />
                <span className="ev-graph-inspector__tier-text">{selectedWorkload.riskTier} Risk</span>
              </div>
            </div>

            <div className="ev-graph-inspector__field">
              <span className="ev-graph-inspector__label">Risk Rationale</span>
              <p className="ev-graph-inspector__desc">{selectedWorkload.riskRationale}</p>
            </div>

            {selectedWorkload.connectionReason && (
              <div className="ev-graph-inspector__field">
                <span className="ev-graph-inspector__label">Dependency Connection Status</span>
                <p className="ev-graph-inspector__desc">{selectedWorkload.connectionReason}</p>
              </div>
            )}

            <div className="ev-graph-inspector__field">
              <span className="ev-graph-inspector__label">Owner & Approvers</span>
              <span className="ev-graph-inspector__val">
                {selectedWorkload.approvers.join(', ')}
              </span>
            </div>

            <div className="ev-graph-inspector__field">
              <span className="ev-graph-inspector__label">Tests In Scope</span>
              <span className="ev-graph-inspector__val">
                {selectedWorkload.selectedTests} / {selectedWorkload.totalTests} tests selected
              </span>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};
