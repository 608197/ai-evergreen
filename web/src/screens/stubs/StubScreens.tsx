import React from 'react';
import { EmptyState } from '../../components/common/EmptyState';
import { Network, BrainCircuit, Sliders, TrendingUp } from 'lucide-react';

export const EstateScreenStub: React.FC = () => (
  <div style={{ padding: 'var(--ev-space-8)' }}>
    <EmptyState
      icon={Network}
      title="Estate Explorer"
      description="Interactive property graph and workload profile catalog. In Phase 5 (Tier B screens), this screen visualizes cross-cluster dependency topologies and AST contract definitions."
      actionText="Return to Home"
      onActionClick={() => window.location.href = '#/'}
    />
  </div>
);

export const MemoryScreenStub: React.FC = () => (
  <div style={{ padding: 'var(--ev-space-8)' }}>
    <EmptyState
      icon={BrainCircuit}
      title="Qualification Memory"
      description="Cross-event evidence reuse and memory bank. In Phase 5, this screen tracks test outcome reuse and contract version proposals."
      actionText="Return to Home"
      onActionClick={() => window.location.href = '#/'}
    />
  </div>
);

export const ControlsScreenStub: React.FC = () => (
  <div style={{ padding: 'var(--ev-space-8)' }}>
    <EmptyState
      icon={Sliders}
      title="Controls & Trusted Kernel"
      description="Deterministic policy rules and rollback configuration. In Phase 5, inspect rule K-014 and self-governance policies."
      actionText="Return to Home"
      onActionClick={() => window.location.href = '#/'}
    />
  </div>
);

export const PortfolioScreenStub: React.FC = () => (
  <div style={{ padding: 'var(--ev-space-8)' }}>
    <EmptyState
      icon={TrendingUp}
      title="Portfolio & Horizon (Roadmap Preview)"
      description="CIO / Enterprise Architect portfolio horizon and AI technical debt forecasting. Roadmap preview ribbon active."
      actionText="Return to Home"
      onActionClick={() => window.location.href = '#/'}
    />
  </div>
);

export const DecisionScreenStub: React.FC = () => (
  <div style={{ padding: 'var(--ev-space-8)' }}>
    <EmptyState
      icon={Sliders}
      title="Stage 4: Promotion Decision & Risk Calibration"
      description="Gate G3 passed. Human sign-off, calibrated risk assessment, and promotion action recommendation (Block / Investigate / Migrate) will be rendered here in Phase 3."
      actionText="Return to Results"
      onActionClick={() => (window.location.href = '#/events/E-2026-001/results')}
    />
  </div>
);

export const RolloutScreenStub: React.FC = () => (
  <div style={{ padding: 'var(--ev-space-8)' }}>
    <EmptyState
      icon={Sliders}
      title="Stage 5: Production Rollout & Canary Controller"
      description="Canary stages (1% -> 5% -> 25% -> 100%), metric breach monitors, and automatic rollback triggers will be rendered here in Phase 3."
      actionText="Return to Results"
      onActionClick={() => (window.location.href = '#/events/E-2026-001/results')}
    />
  </div>
);

export const EvidenceScreenStub: React.FC = () => (
  <div style={{ padding: 'var(--ev-space-8)' }}>
    <EmptyState
      icon={Sliders}
      title="Stage 6: Tamper-Evident Evidence Record"
      description="Full cryptographic SHA-256 audit ledger, machine-readable export, and verification seal will be rendered here in Phase 3."
      actionText="Return to Results"
      onActionClick={() => (window.location.href = '#/events/E-2026-001/results')}
    />
  </div>
);


