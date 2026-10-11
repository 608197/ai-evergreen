import React, { useState } from 'react';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import { StatusChip } from '../../components/common/StatusChip';
import {
  Network,
  Filter,
  Download,
  RefreshCw,
  Search,
  Layers,
  AlertTriangle,
  Clock,
  Shield,
  ExternalLink,
  ChevronRight,
  Database,
  Cpu,
  Server,
  FileCode,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import type { EstateEntityType } from '../../types/domain';
import './EstateScreen.css';

export const EstateScreen: React.FC = () => {
  const {
    estateEntities,
    edges,
    estateFilter,
    setEstateFilter,
    selectedEntityId,
    setSelectedEntityId,
    estateActiveTab,
    setEstateActiveTab,
    confirmEdge,
    overrideEdge,
    currentUser,
  } = useEvergreenStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Filter entities
  const filteredEntities = estateEntities.filter((entity) => {
    if (!estateFilter.entityTypes.includes(entity.type)) return false;
    if (estateFilter.staleOnly && entity.status !== 'stale' && entity.status !== 'orphan') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = entity.name.toLowerCase().includes(q);
      const matchId = entity.id.toLowerCase().includes(q);
      const matchCluster = entity.cluster?.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchCluster) return false;
    }
    return true;
  });

  // Selected Entity
  const selectedEntity = selectedEntityId
    ? estateEntities.find((e) => e.id === selectedEntityId)
    : null;

  // Selected Edge
  const selectedEdge = selectedEdgeId
    ? edges.find((e) => e.id === selectedEdgeId)
    : null;

  // Tab counts
  const orphanCount = estateEntities.filter((e) => e.status === 'orphan').length;
  const staleCount = estateEntities.filter((e) => e.status === 'stale').length + 2; // includes stale edges
  const conflictCount = edges.filter((e) => e.state === 'conflict').length;

  const handleTypeToggle = (type: EstateEntityType) => {
    const current = estateFilter.entityTypes;
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    setEstateFilter({ entityTypes: next });
  };

  const handleExportSnapshot = () => {
    const snapshot = {
      timestamp: new Date().toISOString(),
      entities: filteredEntities,
      edges: edges,
      filter: estateFilter,
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estate-snapshot-${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleForceSync = () => {
    setSyncToast('Syncing with Kong API Gateway & Bedrock telemetry...');
    setTimeout(() => {
      setSyncToast('Estate graph synced. 18 entities and 14 edges verified fresh.');
      setTimeout(() => setSyncToast(null), 3500);
    }, 900);
  };

  const getEntityIcon = (type: EstateEntityType) => {
    switch (type) {
      case 'workload':
        return <Layers size={16} className="entity-icon workload" />;
      case 'model':
        return <Cpu size={16} className="entity-icon model" />;
      case 'gateway':
        return <Server size={16} className="entity-icon gateway" />;
      case 'prompt_template':
        return <FileCode size={16} className="entity-icon prompt" />;
      case 'vector_store':
        return <Database size={16} className="entity-icon vector" />;
    }
  };

  return (
    <div className="estate-screen">
      {/* Header */}
      <header className="estate-header">
        <div className="estate-header-content">
          <div className="estate-title-row">
            <Network className="estate-title-icon" size={24} />
            <div>
              <h1 className="estate-title">AI Estate Dependency Inventory & Graph Explorer</h1>
              <p className="estate-subtitle">
                Read-mostly enterprise graph view across models, gateways, prompt templates, and application workloads.
              </p>
            </div>
          </div>
          <div className="estate-header-actions">
            <button className="btn-secondary" onClick={handleExportSnapshot}>
              <Download size={14} /> Export snapshot
            </button>
            <button className="btn-primary" onClick={handleForceSync}>
              <RefreshCw size={14} /> Force sync
            </button>
          </div>
        </div>

        {syncToast && (
          <div className="estate-toast" role="status">
            <CheckCircle2 size={14} /> {syncToast}
          </div>
        )}

        {/* Filter Bar */}
        <div className="estate-filter-bar">
          <div className="filter-group-types">
            <span className="filter-label"><Filter size={13} /> Entity types:</span>
            {(['workload', 'model', 'gateway', 'prompt_template', 'vector_store'] as EstateEntityType[]).map((t) => (
              <label key={t} className="checkbox-chip">
                <input
                  type="checkbox"
                  checked={estateFilter.entityTypes.includes(t)}
                  onChange={() => handleTypeToggle(t)}
                />
                <span className="chip-text">
                  {t === 'prompt_template' ? 'Prompt' : t === 'vector_store' ? 'Vector' : t.charAt(0).toUpperCase() + t.slice(1)}
                </span>
              </label>
            ))}
          </div>

          <div className="filter-group-controls">
            <label className="filter-confidence">
              <span className="filter-label">Min Confidence:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={estateFilter.minConfidence}
                onChange={(e) => setEstateFilter({ minConfidence: parseFloat(e.target.value) })}
              />
              <span className="confidence-val">{(estateFilter.minConfidence * 100).toFixed(0)}%</span>
            </label>

            <label className="checkbox-chip stale-toggle">
              <input
                type="checkbox"
                checked={estateFilter.staleOnly}
                onChange={(e) => setEstateFilter({ staleOnly: e.target.checked })}
              />
              <span className="chip-text">Stale / unverified only</span>
            </label>

            <div className="snapshot-select-wrap">
              <span className="filter-label">Snapshot:</span>
              <select
                value={estateFilter.snapshotId}
                onChange={(e) => setEstateFilter({ snapshotId: e.target.value })}
                className="snapshot-dropdown"
              >
                <option value="current">Current live (2 min ago)</option>
                <option value="snap-2026-08-31">Snapshot 2026-08-31</option>
                <option value="snap-2026-08-15">Snapshot 2026-08-15</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout: 3 Columns */}
      <div className="estate-body">
        {/* Left Tabs / Rail */}
        <aside className="estate-nav-rail">
          <nav className="estate-tabs" aria-label="Estate views">
            <button
              className={`estate-tab-btn ${estateActiveTab === 'graph' ? 'active' : ''}`}
              onClick={() => setEstateActiveTab('graph')}
            >
              <Network size={15} />
              <span>Graph view</span>
              <span className="tab-badge">{filteredEntities.length}</span>
            </button>
            <button
              className={`estate-tab-btn ${estateActiveTab === 'list' ? 'active' : ''}`}
              onClick={() => setEstateActiveTab('list')}
            >
              <Layers size={15} />
              <span>List view</span>
              <span className="tab-badge">{filteredEntities.length}</span>
            </button>
            <button
              className={`estate-tab-btn ${estateActiveTab === 'orphans' ? 'active' : ''}`}
              onClick={() => setEstateActiveTab('orphans')}
            >
              <AlertTriangle size={15} />
              <span>Orphans</span>
              {orphanCount > 0 && <span className="tab-badge warning">{orphanCount}</span>}
            </button>
            <button
              className={`estate-tab-btn ${estateActiveTab === 'stale' ? 'active' : ''}`}
              onClick={() => setEstateActiveTab('stale')}
            >
              <Clock size={15} />
              <span>Stale</span>
              {staleCount > 0 && <span className="tab-badge warning">{staleCount}</span>}
            </button>
            <button
              className={`estate-tab-btn ${estateActiveTab === 'conflicts' ? 'active' : ''}`}
              onClick={() => setEstateActiveTab('conflicts')}
            >
              <Shield size={15} />
              <span>Conflicts</span>
              <span className="tab-badge">{conflictCount}</span>
            </button>
          </nav>

          <div className="estate-search-wrap">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search entities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="estate-search-input"
            />
          </div>

          <div className="estate-legend">
            <div className="legend-title">Cluster Types</div>
            <div className="legend-item"><span className="dot dot-workload"></span> Workload</div>
            <div className="legend-item"><span className="dot dot-model"></span> Foundation Model</div>
            <div className="legend-item"><span className="dot dot-gateway"></span> Gateway / Proxy</div>
            <div className="legend-item"><span className="dot dot-prompt"></span> Prompt Template</div>
            <div className="legend-item"><span className="dot dot-vector"></span> Vector Store</div>
          </div>
        </aside>

        {/* Center Canvas */}
        <main className="estate-center-pane">
          {estateActiveTab === 'graph' && (
            <div className="estate-graph-canvas">
              <div className="canvas-header-info">
                <span>Showing <strong>{filteredEntities.length}</strong> nodes (capped at 60 to prevent clutter)</span>
                <span className="node-count-pill">Live Topology</span>
              </div>

              {/* Functional Clusters View */}
              <div className="clusters-grid">
                {/* Cluster 1: Customer Operations */}
                <div className="cluster-card">
                  <div className="cluster-title">Customer Operations</div>
                  <div className="cluster-nodes">
                    {filteredEntities
                      .filter((e) => e.cluster === 'Customer Operations' || e.id === 'app-refund' || e.id === 'app-chat')
                      .map((node) => (
                        <div
                          key={node.id}
                          className={`node-pill ${node.type} ${selectedEntityId === node.id ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedEntityId(node.id);
                            setSelectedEdgeId(null);
                          }}
                        >
                          {getEntityIcon(node.type)}
                          <span className="node-name">{node.name}</span>
                          {node.riskTier && (
                            <span className={`risk-tag ${node.riskTier.toLowerCase()}`}>{node.riskTier}</span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Cluster 2: Insurance & Finance */}
                <div className="cluster-card">
                  <div className="cluster-title">Insurance & Finance</div>
                  <div className="cluster-nodes">
                    {filteredEntities
                      .filter((e) => e.cluster === 'Insurance Underwriting' || e.cluster === 'Finance Automation')
                      .map((node) => (
                        <div
                          key={node.id}
                          className={`node-pill ${node.type} ${selectedEntityId === node.id ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedEntityId(node.id);
                            setSelectedEdgeId(null);
                          }}
                        >
                          {getEntityIcon(node.type)}
                          <span className="node-name">{node.name}</span>
                          {node.riskTier && (
                            <span className={`risk-tag ${node.riskTier.toLowerCase()}`}>{node.riskTier}</span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Cluster 3: Foundation Models & AI Gateway */}
                <div className="cluster-card">
                  <div className="cluster-title">Core Foundation Models & Gateways</div>
                  <div className="cluster-nodes">
                    {filteredEntities
                      .filter((e) => e.type === 'model' || e.type === 'gateway')
                      .map((node) => (
                        <div
                          key={node.id}
                          className={`node-pill ${node.type} ${selectedEntityId === node.id ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedEntityId(node.id);
                            setSelectedEdgeId(null);
                          }}
                        >
                          {getEntityIcon(node.type)}
                          <span className="node-name">{node.name}</span>
                          {node.status === 'retiring' && <span className="risk-tag critical">Retiring 14d</span>}
                          {node.status === 'deprecated' && <span className="risk-tag fail">Retired</span>}
                          {node.status === 'active' && <span className="risk-tag pass">Active</span>}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Cluster 4: Prompts, Vector Stores & Support */}
                <div className="cluster-card">
                  <div className="cluster-title">Knowledge, Prompts & Support</div>
                  <div className="cluster-nodes">
                    {filteredEntities
                      .filter(
                        (e) =>
                          e.type === 'prompt_template' ||
                          e.type === 'vector_store' ||
                          e.cluster === 'Support Services' ||
                          e.cluster === 'Legacy Tools'
                      )
                      .map((node) => (
                        <div
                          key={node.id}
                          className={`node-pill ${node.type} ${selectedEntityId === node.id ? 'selected' : ''} ${
                            node.status === 'orphan' ? 'orphan-pill' : ''
                          }`}
                          onClick={() => {
                            setSelectedEntityId(node.id);
                            setSelectedEdgeId(null);
                          }}
                        >
                          {getEntityIcon(node.type)}
                          <span className="node-name">{node.name}</span>
                          {node.status === 'orphan' && <span className="risk-tag warn">Orphan</span>}
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Edge Connectivity Strip */}
              <div className="edges-strip">
                <div className="edges-title">Sample Verified Topology Edges (Click to inspect):</div>
                <div className="edges-list">
                  {edges.slice(0, 6).map((edge) => (
                    <button
                      key={edge.id}
                      className={`edge-item-btn ${selectedEdgeId === edge.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedEdgeId(edge.id);
                        setSelectedEntityId(null);
                      }}
                    >
                      <span className="edge-pair">{edge.fromName} &rarr; {edge.toName}</span>
                      <span className={`edge-state-badge ${edge.state}`}>{edge.state}</span>
                      <span className="edge-conf">{(edge.confidence * 100).toFixed(0)}%</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {estateActiveTab === 'list' && (
            <div className="estate-table-container">
              <table className="estate-table">
                <thead>
                  <tr>
                    <th>Entity</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Risk Tier</th>
                    <th>Cluster</th>
                    <th>Owner</th>
                    <th>Last Verified</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntities.map((entity) => (
                    <tr
                      key={entity.id}
                      className={selectedEntityId === entity.id ? 'selected-row' : ''}
                      onClick={() => {
                        setSelectedEntityId(entity.id);
                        setSelectedEdgeId(null);
                      }}
                    >
                      <td>
                        <div className="table-entity-cell">
                          {getEntityIcon(entity.type)}
                          <div>
                            <div className="cell-title">{entity.name}</div>
                            <div className="cell-sub">{entity.id}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="type-badge">{entity.type}</span></td>
                      <td>
                        <StatusChip
                          status={
                            entity.status === 'active'
                              ? 'pass'
                              : entity.status === 'retiring'
                              ? 'warn'
                              : entity.status === 'orphan'
                              ? 'warn'
                              : 'fail'
                          }
                          label={entity.status}
                        />
                      </td>
                      <td>
                        {entity.riskTier ? (
                          <span className={`risk-tag ${entity.riskTier.toLowerCase()}`}>{entity.riskTier}</span>
                        ) : (
                          <span className="muted-dash">&mdash;</span>
                        )}
                      </td>
                      <td>{entity.cluster || 'Core'}</td>
                      <td>{entity.ownerName || 'Unassigned'}</td>
                      <td className="cell-time">{entity.lastVerified}</td>
                      <td>
                        {entity.type === 'workload' ? (
                          <a
                            href={`#/estate/workloads/${entity.id}`}
                            className="btn-text-link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Contract <ChevronRight size={12} />
                          </a>
                        ) : (
                          <button
                            className="btn-text-link"
                            onClick={() => setSelectedEntityId(entity.id)}
                          >
                            Inspect
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {estateActiveTab === 'orphans' && (
            <div className="estate-special-view">
              <div className="special-view-banner warn">
                <AlertTriangle size={18} />
                <div>
                  <strong>1 Orphan Workload Identified: Knowledge Search Widget</strong>
                  <p>Has unconfirmed dependency link to retired foundation model Atlas-0. No recorded team owner.</p>
                </div>
              </div>
              <div className="orphan-card">
                <div className="orphan-header">
                  <div>
                    <h3>app-search-widget</h3>
                    <p>Internal Knowledge Search Widget</p>
                  </div>
                  <span className="risk-tag warn">Orphan</span>
                </div>
                <div className="orphan-details">
                  <div><strong>Upstream:</strong> Atlas-0 (Legacy Claude 2.1 - Deprecated 120d ago)</div>
                  <div><strong>Risk:</strong> Medium - Unmonitored legacy traffic passing through proxy</div>
                  <div><strong>Recommended Action:</strong> Reassign owner to IT Support or deprecate gateway endpoint.</div>
                </div>
              </div>
            </div>
          )}

          {estateActiveTab === 'stale' && (
            <div className="estate-special-view">
              <div className="special-view-banner">
                <Clock size={18} />
                <div>
                  <strong>Stale Dependencies Detected (Verified &gt; 30 days ago)</strong>
                  <p>Telemetry traces have not re-confirmed these routes in the active qualification window.</p>
                </div>
              </div>
              <ul className="stale-list">
                <li className="stale-item">
                  <div>
                    <strong>Knowledge Search Widget &rarr; Atlas-0</strong>
                    <div className="stale-meta">Last verified: 120 days ago via Config repo</div>
                  </div>
                  <button className="btn-secondary btn-sm" onClick={handleForceSync}>Trigger Probe</button>
                </li>
                <li className="stale-item">
                  <div>
                    <strong>Ticket Summariser &rarr; ServiceNow Gateway</strong>
                    <div className="stale-meta">Last verified: 45 days ago via Gateway logs</div>
                  </div>
                  <button className="btn-secondary btn-sm" onClick={handleForceSync}>Trigger Probe</button>
                </li>
              </ul>
            </div>
          )}

          {estateActiveTab === 'conflicts' && (
            <div className="estate-special-view">
              <div className="special-view-banner pass">
                <CheckCircle2 size={18} />
                <div>
                  <strong>0 Graph Topological Conflicts</strong>
                  <p>All AST and gateway routing edges are consistent with enterprise ingress policy.</p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Right Inspector Panel */}
        <aside className="estate-inspector">
          {selectedEntity ? (
            <div className="inspector-content">
              <div className="inspector-header">
                <span className="inspector-type">{selectedEntity.type.toUpperCase()}</span>
                <h3 className="inspector-title">{selectedEntity.name}</h3>
                <span className="inspector-id">{selectedEntity.id}</span>
              </div>

              <div className="inspector-body">
                <div className="inspector-prop">
                  <span className="prop-label">Status</span>
                  <StatusChip
                    status={selectedEntity.status === 'active' ? 'pass' : 'warn'}
                    label={selectedEntity.status}
                  />
                </div>

                {selectedEntity.riskTier && (
                  <div className="inspector-prop">
                    <span className="prop-label">Risk Tier</span>
                    <span className={`risk-tag ${selectedEntity.riskTier.toLowerCase()}`}>
                      {selectedEntity.riskTier}
                    </span>
                  </div>
                )}

                <div className="inspector-prop">
                  <span className="prop-label">Owner</span>
                  <span className="prop-value">{selectedEntity.ownerName || 'Unassigned'}</span>
                </div>

                <div className="inspector-prop">
                  <span className="prop-label">Cluster</span>
                  <span className="prop-value">{selectedEntity.cluster || 'Core Infrastructure'}</span>
                </div>

                <div className="inspector-prop">
                  <span className="prop-label">Last Verified</span>
                  <span className="prop-value">{selectedEntity.lastVerified}</span>
                </div>

                {selectedEntity.description && (
                  <div className="inspector-prop description">
                    <span className="prop-label">Description</span>
                    <p className="prop-desc">{selectedEntity.description}</p>
                  </div>
                )}

                {selectedEntity.type === 'workload' && (
                  <div className="inspector-action-box">
                    <p className="action-hint">Inspect 20-field behavioural contract and proposals:</p>
                    <a
                      href={`#/estate/workloads/${selectedEntity.id}`}
                      className="btn-primary full-width"
                    >
                      Open Workload Dossier & Contract <ExternalLink size={14} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : selectedEdge ? (
            <div className="inspector-content">
              <div className="inspector-header">
                <span className="inspector-type">TOPOLOGY EDGE</span>
                <h3 className="inspector-title">{selectedEdge.fromName} &rarr; {selectedEdge.toName}</h3>
                <span className="inspector-id">{selectedEdge.id}</span>
              </div>

              <div className="inspector-body">
                <div className="inspector-prop">
                  <span className="prop-label">Relationship</span>
                  <span className="prop-value">{selectedEdge.relationship}</span>
                </div>

                <div className="inspector-prop">
                  <span className="prop-label">Evidence Source</span>
                  <span className="prop-value">{selectedEdge.evidenceClass}</span>
                </div>

                <div className="inspector-prop">
                  <span className="prop-label">Confidence</span>
                  <span className="prop-value">{(selectedEdge.confidence * 100).toFixed(0)}%</span>
                </div>

                <div className="inspector-prop">
                  <span className="prop-label">Confirmation State</span>
                  <span className={`edge-state-badge ${selectedEdge.state}`}>{selectedEdge.state}</span>
                </div>

                <div className="inspector-edge-actions">
                  {selectedEdge.state !== 'confirmed' && (
                    <button
                      className="btn-primary full-width"
                      onClick={() => confirmEdge(selectedEdge.id, currentUser)}
                    >
                      <CheckCircle2 size={14} /> Confirm Edge
                    </button>
                  )}
                  <button
                    className="btn-secondary full-width"
                    onClick={() => setOverrideModalOpen(true)}
                  >
                    <Sliders size={14} /> Override Edge
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="inspector-empty">
              <Network size={32} className="muted-icon" />
              <h4>No Element Selected</h4>
              <p>Click on any node in the canvas or a dependency edge to inspect its provenance, contract, and verification status.</p>
            </div>
          )}
        </aside>
      </div>

      {/* Override Modal */}
      {overrideModalOpen && selectedEdge && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>Override Edge State: {selectedEdge.fromName} &rarr; {selectedEdge.toName}</h3>
            <p className="modal-subtitle">
              Overrides require a signed rationale and will be recorded in the append-only evidence ledger.
            </p>
            <div className="modal-field">
              <label>Override Rationale (Required):</label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Enter justification (e.g. Telemetry verified in secondary gateway logs)..."
                rows={3}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setOverrideModalOpen(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                disabled={!overrideReason.trim()}
                onClick={() => {
                  overrideEdge(
                    selectedEdge.id,
                    {
                      reason: overrideReason,
                      owner: currentUser.name,
                      expiry: '30d',
                      evidence: 'Manual override via Estate Explorer',
                    },
                    currentUser
                  );
                  setOverrideModalOpen(false);
                  setOverrideReason('');
                }}
              >
                Sign & Save Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
