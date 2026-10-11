import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cloud,
  CheckCircle2,
  RefreshCw,
  Plus,
  Server,
  Database,
  ShieldCheck,
  Activity,
  GitBranch,
  Clock,
  ArrowRight,
} from 'lucide-react';
import './IntegrationsScreen.css';

interface Connector {
  id: string;
  name: string;
  category: 'provider' | 'cmdb' | 'testing' | 'gateway';
  vendor: string;
  description: string;
  status: 'connected' | 'standby' | 'syncing';
  lastSynced: string;
  details: Record<string, string | number>;
  modelsOrEntities?: string[];
  icon: any;
  badgeColor: string;
}

export const IntegrationsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [filterCategory, setFilterCategory] = useState<'all' | 'provider' | 'cmdb' | 'testing' | 'gateway'>('all');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const connectors: Connector[] = [
    {
      id: 'aws-bedrock',
      name: 'AWS Bedrock (Primary Sandbox)',
      category: 'provider',
      vendor: 'Amazon Web Services',
      description: 'Foundation model hosting, AgentCore invocations, and model deprecation event stream.',
      status: 'connected',
      lastSynced: '3 minutes ago',
      details: {
        Region: 'us-east-1',
        'IAM Role': 'arn:aws:iam::608197:role/AIEvergreenBedrockAccess',
        'Discovered Models': 'Atlas-1, Claude 3.5 Sonnet, Titan Express, Nova Micro',
        'Active Workloads': '6 enterprise workloads',
      },
      modelsOrEntities: ['Atlas-1 (Retiring in 14d)', 'Atlas-1b (Candidate)', 'Claude-3.5-Sonnet', 'Titan-Express', 'Nova-Micro'],
      icon: Cloud,
      badgeColor: '#0284c7',
    },
    {
      id: 'azure-openai',
      name: 'Azure OpenAI & Foundry',
      category: 'provider',
      vendor: 'Microsoft Azure',
      description: 'Secondary cloud provider adapter for cross-cloud qualification and emergency failover.',
      status: 'connected',
      lastSynced: '18 minutes ago',
      details: {
        Region: 'eastus2',
        Endpoint: 'https://corp-ai-evergreen.openai.azure.com',
        'Active Deployments': 3,
        Quota: '250K TPM allocated',
      },
      modelsOrEntities: ['GPT-4o (2026-08-06)', 'GPT-4o-mini', 'text-embedding-3-small'],
      icon: Server,
      badgeColor: '#2563eb',
    },
    {
      id: 'servicenow-cmdb',
      name: 'ServiceNow AI Control Tower & CMDB',
      category: 'cmdb',
      vendor: 'ServiceNow Enterprise',
      description: 'Ingests application ownership (Asha Rao, Marcus Lee), business criticality tiers, and SLA policies.',
      status: 'connected',
      lastSynced: '12 minutes ago',
      details: {
        'Instance URL': 'https://cognizant-iep.service-now.com',
        'Synced CIs': '6 AI Workloads, 14 Services',
        'Sync Frequency': 'Hourly polling + Webhooks',
        'Tier 1 Apps': 'Refund Agent, Claims Policy Assistant',
      },
      modelsOrEntities: ['Refund Agent (P1)', 'Claims Policy Assistant (P1)', 'Ticket Summariser (P2)', 'Customer Chat (P2)'],
      icon: Database,
      badgeColor: '#0d9488',
    },
    {
      id: 'github-scanner',
      name: 'Git Enterprise Dependency Scanners',
      category: 'cmdb',
      vendor: 'GitHub Enterprise / ADO',
      description: 'Static AST scanning of enterprise repositories to detect Bedrock SDK imports and prompt templates.',
      status: 'connected',
      lastSynced: '1 hour ago',
      details: {
        'Monitored Repos': '8 enterprise repositories',
        'Scan Strategy': 'PR Webhooks + Daily Deep Scan',
        'AST Parsers': 'Python (boto3, langchain), Node.js (@aws-sdk)',
        'Extracted Edges': '24 dependency edges discovered',
      },
      modelsOrEntities: ['refund-agent-service', 'claims-policy-rag', 'support-triage-worker', 'chat-assistant-api'],
      icon: GitBranch,
      badgeColor: '#475569',
    },
    {
      id: 'jira-xray',
      name: 'Jira & Xray Enterprise Test Platform',
      category: 'testing',
      vendor: 'Atlassian / Xray',
      description: 'Bi-directional test synchronization: pulls existing enterprise test suites, updates results with signed evidence.',
      status: 'connected',
      lastSynced: '5 minutes ago',
      details: {
        'Indexed Tests': '480 Test Cases indexed',
        'Test Projects': 'AI-EVERGREEN-QA, REGFUND-EVAL',
        'Evidence Link': 'Direct link to Xray Execution IDs',
        'Exclusion Export': 'Machine-readable exclusion rationales synced',
      },
      modelsOrEntities: ['480 Golden Test Cases', '134 Selected for Atlas-1', '346 Safely Excluded with Rationale'],
      icon: ShieldCheck,
      badgeColor: '#16a34a',
    },
    {
      id: 'cognizant-gateway',
      name: 'Cognizant AI Gateway / LiteLLM Proxy',
      category: 'gateway',
      vendor: 'Cognizant Core AI',
      description: 'Production traffic routing, canary traffic shifting (5% candidate), and sub-850ms automated rollback execution.',
      status: 'connected',
      lastSynced: 'Live Stream (<2s ago)',
      details: {
        'Gateway Endpoint': 'https://ai-gateway.internal.cognizant.com/v1',
        'Active Route': '95% Atlas-1 v1 / 5% Atlas-1b (Ticket Summariser)',
        'Rollback Armed': 'True (<850ms threshold)',
        'Avg Gateway Latency': '412ms (within 850ms SLA)',
      },
      modelsOrEntities: ['Active Canary: Ticket Summariser', 'Autonomous Rollback Controller: Armed'],
      icon: Activity,
      badgeColor: '#ea580c',
    },
  ];

  const filteredConnectors = filterCategory === 'all'
    ? connectors
    : connectors.filter((c) => c.category === filterCategory);

  const handleSync = (id: string, name: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setSyncingId(null);
      setToastMessage(`Successfully synchronized ${name}. 0 schema drift, catalog updated.`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 900);
  };

  const handleSyncAll = () => {
    setSyncingId('all');
    setTimeout(() => {
      setSyncingId(null);
      setToastMessage('All 6 enterprise connectors successfully polled. All estate assets fresh.');
      setTimeout(() => setToastMessage(null), 4000);
    }, 1200);
  };

  return (
    <div className="ev-integrations-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ev-integrations-toast">
          <CheckCircle2 size={16} className="toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="ev-integrations-header">
        <div className="ev-integrations-header-main">
          <div className="ev-integrations-title-row">
            <h1 className="ev-integrations-title">Enterprise Integrations & Connectors</h1>
            <span className="ev-integrations-live-badge">
              <span className="live-pulse" /> 6 / 6 Connected
            </span>
          </div>
          <p className="ev-integrations-subtitle">
            Configure live data feeds between AI Evergreen and your Foundation Model Providers, ServiceNow CMDB, Git Repositories, Jira/Xray Test Suites, and Runtime AI Gateways.
          </p>
        </div>

        <div className="ev-integrations-header-actions">
          <button
            type="button"
            className="btn-sync-all"
            onClick={handleSyncAll}
            disabled={syncingId === 'all'}
          >
            <RefreshCw size={14} className={syncingId === 'all' ? 'spin-icon' : ''} />
            <span>{syncingId === 'all' ? 'Syncing Estate...' : 'Sync All Sources'}</span>
          </button>
          <button
            type="button"
            className="btn-add-integration"
            onClick={() => setAddModalOpen(true)}
          >
            <Plus size={15} />
            <span>Add Integration</span>
          </button>
        </div>
      </header>

      {/* Aggregate Overview Bar */}
      <section className="ev-integrations-stats-bar">
        <div className="stat-pill">
          <span className="stat-label">Model Providers</span>
          <span className="stat-value">AWS Bedrock · Azure OpenAI</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-pill">
          <span className="stat-label">Discovered Models</span>
          <span className="stat-value">14 Models In Estate</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-pill">
          <span className="stat-label">ServiceNow CMDB</span>
          <span className="stat-value">6 Monitored Applications</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-pill">
          <span className="stat-label">Jira / Xray</span>
          <span className="stat-value">480 Test Cases Synced</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-pill">
          <span className="stat-label">AI Gateway Router</span>
          <span className="stat-value">Cognizant AI Gateway (Live)</span>
        </div>
      </section>

      {/* Category Filter Tabs */}
      <div className="ev-integrations-filter-row">
        <div className="category-tabs">
          <button
            type="button"
            className={`category-tab ${filterCategory === 'all' ? 'category-tab--active' : ''}`}
            onClick={() => setFilterCategory('all')}
          >
            All Connectors ({connectors.length})
          </button>
          <button
            type="button"
            className={`category-tab ${filterCategory === 'provider' ? 'category-tab--active' : ''}`}
            onClick={() => setFilterCategory('provider')}
          >
            AI Providers (2)
          </button>
          <button
            type="button"
            className={`category-tab ${filterCategory === 'cmdb' ? 'category-tab--active' : ''}`}
            onClick={() => setFilterCategory('cmdb')}
          >
            CMDB & Code Scanners (2)
          </button>
          <button
            type="button"
            className={`category-tab ${filterCategory === 'testing' ? 'category-tab--active' : ''}`}
            onClick={() => setFilterCategory('testing')}
          >
            Test Management (1)
          </button>
          <button
            type="button"
            className={`category-tab ${filterCategory === 'gateway' ? 'category-tab--active' : ''}`}
            onClick={() => setFilterCategory('gateway')}
          >
            Runtime AI Gateways (1)
          </button>
        </div>

        <button
          type="button"
          className="link-view-estate"
          onClick={() => navigate('/estate')}
        >
          <span>Explore Ingested Topology in Estate</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Connectors Grid */}
      <div className="ev-integrations-grid">
        {filteredConnectors.map((c) => {
          const IconComponent = c.icon;
          const isSyncing = syncingId === c.id;

          return (
            <article key={c.id} className="connector-card">
              <div className="connector-card-header">
                <div className="connector-title-group">
                  <div className="connector-icon-wrapper" style={{ backgroundColor: `${c.badgeColor}15`, color: c.badgeColor }}>
                    <IconComponent size={20} />
                  </div>
                  <div>
                    <h3 className="connector-name">{c.name}</h3>
                    <span className="connector-vendor">{c.vendor}</span>
                  </div>
                </div>

                <div className="connector-status-badge">
                  <span className="connector-dot" style={{ backgroundColor: c.status === 'connected' ? '#16a34a' : '#0284c7' }} />
                  <span className="connector-status-text">
                    {isSyncing ? 'Syncing...' : c.status === 'connected' ? 'Connected' : 'Standby'}
                  </span>
                </div>
              </div>

              <p className="connector-desc">{c.description}</p>

              {/* Technical Details Key-Value Table */}
              <div className="connector-details-table">
                {Object.entries(c.details).map(([key, val]) => (
                  <div key={key} className="detail-row">
                    <span className="detail-key">{key}:</span>
                    <span className="detail-val">{val}</span>
                  </div>
                ))}
              </div>

              {/* Models or Entities Tag Strip */}
              {c.modelsOrEntities && c.modelsOrEntities.length > 0 && (
                <div className="connector-entities-section">
                  <span className="entities-title">Discovered Assets:</span>
                  <div className="entities-chips">
                    {c.modelsOrEntities.map((item, idx) => (
                      <span key={idx} className="entity-chip">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Card Footer Actions */}
              <div className="connector-card-footer">
                <span className="last-synced-text">
                  <Clock size={12} /> Last synced {c.lastSynced}
                </span>

                <div className="card-footer-buttons">
                  <button
                    type="button"
                    className="btn-card-sync"
                    onClick={() => handleSync(c.id, c.name)}
                    disabled={isSyncing}
                    title="Poll connector for fresh schema & events"
                  >
                    <RefreshCw size={12} className={isSyncing ? 'spin-icon' : ''} />
                    <span>{isSyncing ? 'Syncing...' : 'Poll Now'}</span>
                  </button>
                  <button
                    type="button"
                    className="btn-card-config"
                    onClick={() => {
                      setToastMessage(`Configuration for ${c.name} opened in read-only audit mode.`);
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                  >
                    <span>Configure</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Add Integration Modal */}
      {addModalOpen && (
        <div className="add-connector-overlay" onClick={(e) => { if (e.target === e.currentTarget) setAddModalOpen(false); }}>
          <div className="add-connector-modal">
            <div className="add-modal-header">
              <div className="add-modal-title-group">
                <div className="add-icon-badge">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="add-modal-title">Add Enterprise Data Source</h3>
                  <span className="add-modal-subtitle">Connect a new provider, CMDB, or test management system</span>
                </div>
              </div>
              <button
                type="button"
                className="add-modal-close"
                onClick={() => setAddModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="add-modal-body">
              <label className="add-form-label">Supported Enterprise Adapters</label>
              <div className="adapter-selection-grid">
                <div className="adapter-choice adapter-choice--selected">
                  <Cloud size={20} className="adapter-choice-icon" />
                  <strong>Google Vertex AI</strong>
                  <span>Gemini 1.5 Pro, Flash & Model Garden</span>
                </div>
                <div className="adapter-choice">
                  <Server size={20} className="adapter-choice-icon" />
                  <strong>Databricks Mosaic AI</strong>
                  <span>MLflow Model Registry & Gateway</span>
                </div>
                <div className="adapter-choice">
                  <Database size={20} className="adapter-choice-icon" />
                  <strong>Snowflake Cortex AI</strong>
                  <span>Enterprise Cortex Functions</span>
                </div>
                <div className="adapter-choice">
                  <ShieldCheck size={20} className="adapter-choice-icon" />
                  <strong>IBM OpenPages / Governance</strong>
                  <span>GRC Compliance Audit Store</span>
                </div>
              </div>

              <div className="add-form-field">
                <label className="add-field-label">Integration Label</label>
                <input
                  type="text"
                  className="add-form-input"
                  defaultValue="Google Vertex AI Sandbox"
                />
              </div>

              <div className="add-form-field">
                <label className="add-field-label">GCP Project ID / Service Account Key</label>
                <input
                  type="text"
                  className="add-form-input"
                  defaultValue="cognizant-iep-ai-evergreen-prod"
                />
              </div>
            </div>

            <div className="add-modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setAddModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-confirm-add"
                onClick={() => {
                  setAddModalOpen(false);
                  setToastMessage('Vertex AI adapter registered. Beginning automated model asset discovery...');
                  setTimeout(() => setToastMessage(null), 4000);
                }}
              >
                Test & Connect Source
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
