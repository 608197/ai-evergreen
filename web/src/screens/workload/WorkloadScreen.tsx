import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import { StatusChip } from '../../components/common/StatusChip';
import {
  FileText,
  Code,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  ShieldCheck,
  Download,
  PlusCircle,
  ArrowRight,
  GitBranch,
  ChevronLeft,
  Activity,
} from 'lucide-react';
import './WorkloadScreen.css';

export const WorkloadScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const workloadId = id || 'app-claims';

  const {
    workloads,
    contracts,
    contractProposals,
    edges,
    approveContractProposal,
    rejectContractProposal,
    createContractProposal,
    currentUser,
  } = useEvergreenStore();

  const [activeTab, setActiveTab] = useState<'contract' | 'dependencies' | 'tests' | 'history' | 'incidents'>('contract');
  const [jsonView, setJsonView] = useState(false);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [proposalField, setProposalField] = useState('groundednessLimit');
  const [proposalValue, setProposalValue] = useState('');
  const [proposalReason, setProposalReason] = useState('');
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Workload and Contract
  const workload = workloads.find((w) => w.id === workloadId) || workloads[0];
  const contract = contracts[workloadId] || contracts['app-claims'];

  // Proposals for this workload
  const proposals = contractProposals.filter((p) => p.workloadId === workloadId);
  const pendingProposals = proposals.filter((p) => p.status === 'pending');

  // Dependencies for this workload
  const inboundEdges = edges.filter((e) => e.toId === workloadId);
  const outboundEdges = edges.filter((e) => e.fromId === workloadId);

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(contract, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract-${workloadId}-v${contract.version}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApproveProposal = (proposalId: string) => {
    approveContractProposal(proposalId, currentUser);
    setActionToast('Contract proposal approved! Live contract bumped to new version.');
    setTimeout(() => setActionToast(null), 3500);
  };

  const handleRejectProposal = (proposalId: string) => {
    rejectContractProposal(proposalId, currentUser, 'Rejected by App Owner during review');
    setActionToast('Proposal rejected and archived in evidence ledger.');
    setTimeout(() => setActionToast(null), 3500);
  };

  const handleCreateProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalValue.trim() || !proposalReason.trim()) return;

    createContractProposal({
      workloadId,
      workloadName: workload.name,
      fromVersion: `v${contract.version}`,
      toVersion: `v${(parseFloat(contract.version) + 0.1).toFixed(1)}`,
      field: proposalField,
      fieldLabel: proposalField.charAt(0).toUpperCase() + proposalField.slice(1),
      fromValue: 'Current defined baseline',
      toValue: proposalValue,
      reason: proposalReason,
      source: 'Manual',
      proposedBy: `${currentUser.name} (${currentUser.roleTitle})`,
    });

    setProposalModalOpen(false);
    setProposalValue('');
    setProposalReason('');
    setActionToast('New contract revision proposal submitted for review.');
    setTimeout(() => setActionToast(null), 3500);
  };

  return (
    <div className="workload-screen">
      {/* Top Breadcrumb & Header */}
      <header className="workload-header">
        <div className="workload-nav-back">
          <Link to="/estate" className="back-link">
            <ChevronLeft size={16} /> Back to Estate Explorer
          </Link>
        </div>

        <div className="workload-title-bar">
          <div className="workload-identity">
            <h1 className="workload-name">{workload.name}</h1>
            <span className="workload-id-badge">{workload.id}</span>
            <span className={`risk-tag ${workload.riskTier.toLowerCase()}`}>
              Risk: {workload.riskTier}
            </span>
            <span className="version-pill">Contract v{contract.version}</span>
            {contract.reviewDue && (
              <span className="review-due-tag">
                <AlertTriangle size={12} /> Annual Review Due
              </span>
            )}
          </div>

          <div className="workload-actions">
            <button className="btn-secondary" onClick={handleExportJson}>
              <Download size={14} /> Export contract (JSON)
            </button>
            <button className="btn-primary" onClick={() => setProposalModalOpen(true)}>
              <PlusCircle size={14} /> Propose contract change
            </button>
          </div>
        </div>

        {actionToast && (
          <div className="workload-toast" role="status">
            <CheckCircle2 size={14} /> {actionToast}
          </div>
        )}

        {/* Tab Strip */}
        <nav className="workload-tabs" aria-label="Workload views">
          <button
            className={`tab-btn ${activeTab === 'contract' ? 'active' : ''}`}
            onClick={() => setActiveTab('contract')}
          >
            <FileText size={15} />
            <span>20-Field Behavioural Contract</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'dependencies' ? 'active' : ''}`}
            onClick={() => setActiveTab('dependencies')}
          >
            <GitBranch size={15} />
            <span>Dependencies ({inboundEdges.length + outboundEdges.length})</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'tests' ? 'active' : ''}`}
            onClick={() => setActiveTab('tests')}
          >
            <ShieldCheck size={15} />
            <span>Tests & Verification</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={15} />
            <span>Version Audit Log</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'incidents' ? 'active' : ''}`}
            onClick={() => setActiveTab('incidents')}
          >
            <Activity size={15} />
            <span>Telemetry & Rollbacks</span>
          </button>
        </nav>
      </header>

      {/* Main Grid: Content + Proposal Rail */}
      <div className="workload-body">
        {/* Main Content Area */}
        <main className="workload-main-pane">
          {activeTab === 'contract' && (
            <div className="contract-view-wrapper">
              <div className="contract-view-toolbar">
                <div className="contract-meta-left">
                  <span>Last Reviewed: <strong>{contract.lastReviewed}</strong></span>
                  <span>Owner: <strong>{workload.ownerName}</strong></span>
                </div>
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => setJsonView(!jsonView)}
                >
                  <Code size={13} /> {jsonView ? 'Show structured fields' : 'Show as raw JSON'}
                </button>
              </div>

              {jsonView ? (
                <div className="json-container">
                  <pre>{JSON.stringify(contract, null, 2)}</pre>
                </div>
              ) : (
                <div className="contract-groups">
                  {/* Group 1: Purpose and Role */}
                  <section className="contract-group-card">
                    <div className="group-header">
                      <span className="group-num">Group 1 of 4</span>
                      <h2 className="group-title">Purpose and Role</h2>
                      <p className="group-subtitle">Core enterprise mandate, boundaries, and scope declarations.</p>
                    </div>
                    <dl className="contract-dl">
                      <div className="dl-row">
                        <dt>1. Primary Purpose</dt>
                        <dd>{contract.purposeAndRole.primaryPurpose}</dd>
                      </div>
                      <div className="dl-row">
                        <dt>2. Business Domain</dt>
                        <dd>{contract.purposeAndRole.businessDomain}</dd>
                      </div>
                      <div className="dl-row">
                        <dt>3. Target Audience</dt>
                        <dd>{contract.purposeAndRole.targetAudience}</dd>
                      </div>
                      <div className="dl-row">
                        <dt>4. Criticality Tier</dt>
                        <dd><span className="crit-text">{contract.purposeAndRole.criticalityTier}</span></dd>
                      </div>
                      <div className="dl-row">
                        <dt>5. Declared Scope</dt>
                        <dd>{contract.purposeAndRole.declaredScope}</dd>
                      </div>
                    </dl>
                  </section>

                  {/* Group 2: Allowed Behaviour */}
                  <section className="contract-group-card">
                    <div className="group-header">
                      <span className="group-num">Group 2 of 4</span>
                      <h2 className="group-title">Allowed Behaviour & Invariants</h2>
                      <p className="group-subtitle">Schema constraints, permitted tools, and non-negotiable deterministic rules.</p>
                    </div>
                    <dl className="contract-dl">
                      <div className="dl-row">
                        <dt>6. Input Schema</dt>
                        <dd><pre className="code-block">{contract.allowedBehaviour.inputSchema}</pre></dd>
                      </div>
                      <div className="dl-row">
                        <dt>7. Output Schema</dt>
                        <dd><pre className="code-block">{contract.allowedBehaviour.outputSchema}</pre></dd>
                      </div>
                      <div className="dl-row">
                        <dt>8. Allowed Tools</dt>
                        <dd className="tools-pills">
                          {contract.allowedBehaviour.allowedTools.map((t) => (
                            <span key={t} className="tool-pill allowed">{t}</span>
                          ))}
                        </dd>
                      </div>
                      <div className="dl-row">
                        <dt>9. Prohibited Tools</dt>
                        <dd className="tools-pills">
                          {contract.allowedBehaviour.prohibitedTools.map((t) => (
                            <span key={t} className="tool-pill prohibited">{t}</span>
                          ))}
                        </dd>
                      </div>
                      <div className="dl-row">
                        <dt>10. Deterministic Invariants</dt>
                        <dd>
                          <ul className="invariants-list">
                            {contract.allowedBehaviour.deterministicInvariants.map((inv) => (
                              <li key={inv} className="invariant-item">
                                <ShieldCheck size={14} className="inv-icon" />
                                <span>{inv}</span>
                              </li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    </dl>
                  </section>

                  {/* Group 3: Evidence and Thresholds */}
                  <section className="contract-group-card">
                    <div className="group-header">
                      <span className="group-num">Group 3 of 4</span>
                      <h2 className="group-title">Evidence and Qualification Thresholds</h2>
                      <p className="group-subtitle">Telemetry gates and quality metrics monitored during canary promotion.</p>
                    </div>
                    <dl className="contract-dl">
                      <div className="dl-row">
                        <dt>11. Groundedness Limit</dt>
                        <dd className="num-val">{(contract.evidenceAndThresholds.groundednessLimit * 100).toFixed(0)}% minimum score</dd>
                      </div>
                      <div className="dl-row">
                        <dt>12. Citation Validity Limit</dt>
                        <dd className="num-val">{(contract.evidenceAndThresholds.citationValidityLimit * 100).toFixed(0)}% citation precision</dd>
                      </div>
                      <div className="dl-row">
                        <dt>13. Latency p95 Max</dt>
                        <dd className="num-val">{contract.evidenceAndThresholds.latencyP95MaxMs} ms</dd>
                      </div>
                      <div className="dl-row">
                        <dt>14. Cost per 1k Band</dt>
                        <dd>{contract.evidenceAndThresholds.costPer1kBand}</dd>
                      </div>
                      <div className="dl-row">
                        <dt>15. Safety Abstention Policy</dt>
                        <dd>{contract.evidenceAndThresholds.safetyAbstentionPolicy}</dd>
                      </div>
                    </dl>
                  </section>

                  {/* Group 4: Approval and Rollback */}
                  <section className="contract-group-card">
                    <div className="group-header">
                      <span className="group-num">Group 4 of 4</span>
                      <h2 className="group-title">Approval Authority & Automated Rollback</h2>
                      <p className="group-subtitle">Mandatory human sign-off rules and autonomous telemetry breaker triggers.</p>
                    </div>
                    <dl className="contract-dl">
                      <div className="dl-row">
                        <dt>16. Required Approver Roles</dt>
                        <dd className="roles-list">
                          {contract.approvalAndRollback.requiredApproverRoles.map((r) => (
                            <span key={r} className="role-tag">{r}</span>
                          ))}
                        </dd>
                      </div>
                      <div className="dl-row">
                        <dt>17. Duty Separation Required</dt>
                        <dd>{contract.approvalAndRollback.dutySeparationRequired ? 'Mandatory (Two-person rule)' : 'Single owner permitted'}</dd>
                      </div>
                      <div className="dl-row">
                        <dt>18. Rollout Ladder Strategy</dt>
                        <dd>{contract.approvalAndRollback.rolloutLadderStrategy}</dd>
                      </div>
                      <div className="dl-row">
                        <dt>19. Automated Rollback Triggers</dt>
                        <dd>
                          <ul className="triggers-list">
                            {contract.approvalAndRollback.automatedRollbackTriggers.map((trig) => (
                              <li key={trig} className="trigger-item">
                                <AlertTriangle size={13} className="trig-icon" />
                                <span>{trig}</span>
                              </li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                      <div className="dl-row">
                        <dt>20. Last Known Good Fallback</dt>
                        <dd className="lkg-code">{contract.approvalAndRollback.lastKnownGoodFallback}</dd>
                      </div>
                    </dl>
                  </section>
                </div>
              )}
            </div>
          )}

          {activeTab === 'dependencies' && (
            <div className="dependencies-view">
              <h3 className="section-title">Inbound & Outbound Dependency Topology</h3>
              <div className="deps-grid">
                <div className="deps-card">
                  <h4>Inbound Upstream Providers ({outboundEdges.length})</h4>
                  <ul className="dep-items-list">
                    {outboundEdges.map((e) => (
                      <li key={e.id} className="dep-item">
                        <div>
                          <strong>{e.toName}</strong>
                          <div className="dep-meta">Relation: {e.relationship} | Source: {e.evidenceClass}</div>
                        </div>
                        <span className="dep-conf">{(e.confidence * 100).toFixed(0)}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="deps-card">
                  <h4>Outbound Consumers ({inboundEdges.length})</h4>
                  <ul className="dep-items-list">
                    {inboundEdges.map((e) => (
                      <li key={e.id} className="dep-item">
                        <div>
                          <strong>{e.fromName}</strong>
                          <div className="dep-meta">Relation: {e.relationship} | Source: {e.evidenceClass}</div>
                        </div>
                        <span className="dep-conf">{(e.confidence * 100).toFixed(0)}%</span>
                      </li>
                    ))}
                    {inboundEdges.length === 0 && (
                      <li className="dep-empty">No downstream consumer applications recorded.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="tests-view">
              <h3 className="section-title">Seeded Regression Tests for {workload.name}</h3>
              <div className="tests-table-card">
                <table className="workload-table">
                  <thead>
                    <tr>
                      <th>Test ID</th>
                      <th>Category</th>
                      <th>Invariant Rule</th>
                      <th>Pass Bar</th>
                      <th>Last Run Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>T-0211</code></td>
                      <td>Deterministic Schema</td>
                      <td>K-001 (Document Citation)</td>
                      <td>100% deterministic match</td>
                      <td><StatusChip status="pass" label="Pass" /></td>
                    </tr>
                    <tr>
                      <td><code>T-0103</code></td>
                      <td>Boundary / Tool Invariant</td>
                      <td>K-004 (Abstention Threshold)</td>
                      <td>Zero hallucination tolerance</td>
                      <td><StatusChip status="pass" label="Pass" /></td>
                    </tr>
                    <tr>
                      <td><code>T-0106</code></td>
                      <td>Agent Trajectory Check</td>
                      <td>K-014 (Sequence Verification)</td>
                      <td>Order: PolicyCheck &rarr; Gateway</td>
                      <td><StatusChip status="fail" label="Fail (Seeded)" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history-view">
              <h3 className="section-title">Contract Version Revision Audit Trail</h3>
              <div className="timeline-container">
                <div className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <strong>Contract v{contract.version} Activated</strong>
                      <span className="timeline-date">{contract.lastReviewed}</span>
                    </div>
                    <p>Production baseline approved with 20-field specification signed by {workload.ownerName}.</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <strong>Contract v{(parseFloat(contract.version) - 1.0).toFixed(1)} Initialized</strong>
                      <span className="timeline-date">2026-01-10</span>
                    </div>
                    <p>Initial enterprise AST discovery and schema baseline establishment.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="incidents-view">
              <h3 className="section-title">Telemetry Health & Breakers</h3>
              <div className="incident-card">
                <div className="incident-status pass">
                  <CheckCircle2 size={16} /> All Telemetry Breakers In Tolerance
                </div>
                <div className="telemetry-grid">
                  <div className="telem-box">
                    <span className="telem-label">Groundedness Limit</span>
                    <span className="telem-val">0.91 &ge; 0.85</span>
                  </div>
                  <div className="telem-box">
                    <span className="telem-label">Citation Precision</span>
                    <span className="telem-val">0.96 &ge; 0.95</span>
                  </div>
                  <div className="telem-box">
                    <span className="telem-label">p95 Latency</span>
                    <span className="telem-val">580ms &le; 900ms</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Right Rail: Contract Proposals */}
        <aside className="workload-proposals-rail">
          <div className="proposals-header">
            <h3>Pending Contract Proposals ({pendingProposals.length})</h3>
            <p className="proposals-subtitle">
              Proposals do not alter the live contract until approved by the application owner.
            </p>
          </div>

          <div className="proposals-list">
            {pendingProposals.map((prop) => (
              <div key={prop.id} className="proposal-card">
                <div className="proposal-card-header">
                  <span className="prop-source-badge">{prop.source} Proposal</span>
                  <span className="prop-version-bump">{prop.fromVersion} &rarr; {prop.toVersion}</span>
                </div>

                <div className="prop-field-label">Field: <strong>{prop.fieldLabel}</strong></div>

                <div className="prop-diff">
                  <div className="diff-from">
                    <span className="diff-label">Current:</span>
                    <div className="diff-val">{prop.fromValue}</div>
                  </div>
                  <div className="diff-arrow"><ArrowRight size={14} /></div>
                  <div className="diff-to">
                    <span className="diff-label">Proposed:</span>
                    <div className="diff-val highlight">{prop.toValue}</div>
                  </div>
                </div>

                <div className="prop-reason">
                  <span className="reason-label">Rationale:</span>
                  <p>{prop.reason}</p>
                </div>

                <div className="prop-author">
                  Proposed by: <strong>{prop.proposedBy}</strong>
                </div>

                <div className="proposal-actions">
                  <button
                    className="btn-primary full-width"
                    onClick={() => handleApproveProposal(prop.id)}
                  >
                    <CheckCircle2 size={14} /> Approve & Version Bump
                  </button>
                  <button
                    className="btn-secondary full-width"
                    onClick={() => handleRejectProposal(prop.id)}
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}

            {pendingProposals.length === 0 && (
              <div className="proposals-empty">
                <CheckCircle2 size={24} className="pass-icon" />
                <h4>No Pending Proposals</h4>
                <p>The 20-field behavioural contract is in sync with enterprise policy.</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Propose Contract Change Modal */}
      {proposalModalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>Propose Contract Revision: {workload.name}</h3>
            <p className="modal-subtitle">
              Enter proposed modifications. The change will be queued as a pending proposal requiring owner sign-off.
            </p>
            <form onSubmit={handleCreateProposalSubmit}>
              <div className="modal-field">
                <label>Contract Field to Revise:</label>
                <select
                  value={proposalField}
                  onChange={(e) => setProposalField(e.target.value)}
                  className="modal-select"
                >
                  <option value="groundednessLimit">Groundedness Limit (Threshold)</option>
                  <option value="citationValidityLimit">Citation Validity Limit (Threshold)</option>
                  <option value="latencyP95MaxMs">Latency p95 Max Limit (Threshold)</option>
                  <option value="deterministicInvariants">Deterministic Invariants (Allowed Behaviour)</option>
                  <option value="inputSchema">Input Schema (Allowed Behaviour)</option>
                  <option value="outputSchema">Output Schema (Allowed Behaviour)</option>
                  <option value="automatedRollbackTriggers">Automated Rollback Triggers</option>
                </select>
              </div>

              <div className="modal-field">
                <label>Proposed New Value:</label>
                <textarea
                  value={proposalValue}
                  onChange={(e) => setProposalValue(e.target.value)}
                  placeholder="e.g. 0.90 minimum score or new invariant rule..."
                  rows={2}
                  required
                />
              </div>

              <div className="modal-field">
                <label>Reason / Evidence Rationale:</label>
                <textarea
                  value={proposalReason}
                  onChange={(e) => setProposalReason(e.target.value)}
                  placeholder="e.g. Qualification evaluation in E-2026-001 showed candidate required higher precision..."
                  rows={2}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setProposalModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!proposalValue.trim() || !proposalReason.trim()}
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
