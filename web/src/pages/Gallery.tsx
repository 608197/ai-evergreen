import React, { useState } from 'react';
import { StatusChip } from '../components/common/StatusChip';
import type { StatusVariant } from '../components/common/StatusChip';
import { RiskMeter } from '../components/common/RiskMeter';
import type { RiskTier } from '../components/common/RiskMeter';
import { ConfidenceMeter } from '../components/common/ConfidenceMeter';
import { ProvenanceTag } from '../components/common/ProvenanceTag';
import type { ProvenanceKind } from '../components/common/ProvenanceTag';
import { GateBanner } from '../components/common/GateBanner';
import { KernelVerdict } from '../components/common/KernelVerdict';
import { RiskBadgeRow } from '../components/common/RiskBadgeRow';
import { StatTile } from '../components/common/StatTile';
import { HashChip } from '../components/common/HashChip';
import { SandboxBadge } from '../components/common/SandboxBadge';
import { FreshnessPill } from '../components/common/FreshnessPill';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonBlock } from '../components/common/SkeletonBlock';
import { Toast } from '../components/common/Toast';
import type { ToastType } from '../components/common/Toast';
import { GlossaryTerm } from '../components/common/GlossaryTerm';
import { StageStepper } from '../components/common/StageStepper';
import type { StageStep } from '../components/common/StageStepper';
import { TrajectoryTimeline } from '../components/results/TrajectoryTimeline';
import { DiffViewer } from '../components/results/DiffViewer';
import { ThresholdChart } from '../components/rollout/ThresholdChart';
import { ShieldCheck } from 'lucide-react';

import './Gallery.css';

export const Gallery: React.FC = () => {
  // Toast state
  const [toasts, setToasts] = useState<Array<{ id: string; type: ToastType; message: string; subtext?: string }>>([
    { id: '1', type: 'success', message: 'Gate G1 passed', subtext: 'Refund Agent critical edge confirmed by Ravi Kulkarni' },
  ]);

  // Stepper state
  const [currentStage, setCurrentStage] = useState('plan');

  const stepperStages: StageStep[] = [
    { id: 'blast-radius', index: 1, name: 'Blast Radius', state: 'complete' },
    { id: 'plan', index: 2, name: 'Regression Plan', state: 'current', openBadge: '1 proposed' },
    { id: 'results', index: 3, name: 'Results Heatmap', state: 'available' },
    { id: 'decision', index: 4, name: 'Decision & Approval', state: 'locked', lockReason: 'Complete test run first (Gate G3)' },
    { id: 'rollout', index: 5, name: 'Rollout Monitor', state: 'locked', lockReason: 'Human approval required (Gate G4)' },
    { id: 'record', index: 6, name: 'Evidence Record', state: 'available' },
  ];

  const statusVariants: StatusVariant[] = [
    'migrate', 'canary', 'investigate', 'block',
    'permit', 'deny', 'pass', 'warn', 'fail',
    'na', 'inconclusive', 'stale', 'unresolved', 'conflict'
  ];

  const riskTiers: RiskTier[] = ['low', 'medium', 'high', 'critical'];
  const provenanceKinds: ProvenanceKind[] = ['rule-based', 'ai-proposed', 'human-entered'];

  return (
    <div className="ev-gallery-page">
      <header className="ev-gallery-header">
        <div className="ev-gallery-title-wrap">
          <SandboxBadge />
          <h1 className="ev-gallery-title">AI Evergreen Component Foundation Gallery</h1>
          <p className="ev-gallery-subtitle">
            Specification §6 Component Library & Design System Tokens Verification
          </p>
        </div>
        <div className="ev-gallery-header-meta">
          <FreshnessPill />
          <span className="ev-gallery-rule-tag">Phase 0 Foundations · Pass/Fail Verified</span>
        </div>
      </header>

      {/* Toast Notification Container */}
      <div className="ev-gallery-toast-container">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            id={t.id}
            type={t.type}
            message={t.message}
            subtext={t.subtext}
            onClose={(id) => setToasts(toasts.filter((x) => x.id !== id))}
            onUndo={() => alert('Undo triggered')}
          />
        ))}
      </div>

      <main className="ev-gallery-content">
        {/* SECTION 1: StatusChips */}
        <section className="ev-gallery-section">
          <h2 className="ev-section-title">1. StatusChip Component (§5.2, §6.1)</h2>
          <p className="ev-section-desc">
            Rule: Always pairs colour with an icon and a text label. Colour is never the sole cue.
          </p>
          <div className="ev-gallery-grid-chips">
            {statusVariants.map((s) => (
              <div key={s} className="ev-chip-item">
                <StatusChip status={s} />
                <span className="ev-chip-subtext">{s} (medium)</span>
                <StatusChip status={s} size="small" />
                <span className="ev-chip-subtext">{s} (small)</span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: RiskMeter */}
        <section className="ev-gallery-section">
          <h2 className="ev-section-title">2. RiskMeter Component (§5.2, §6.1)</h2>
          <p className="ev-section-desc">
            Rule: Risk tier is NOT a colour. Four navy segments (1 to 4). Never red.
          </p>
          <div className="ev-gallery-row">
            {riskTiers.map((tier) => (
              <div key={tier} className="ev-card-sample">
                <RiskMeter tier={tier} />
                <span className="ev-chip-subtext">Compact:</span>
                <RiskMeter tier={tier} compact />
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: ConfidenceMeter */}
        <section className="ev-gallery-section">
          <h2 className="ev-section-title">3. ConfidenceMeter Component (§6.1)</h2>
          <p className="ev-section-desc">
            Rule: Number (2 decimals) + band label. Below 0.75 triggers explicit warning: "Confidence limits apply".
          </p>
          <div className="ev-gallery-row">
            <div className="ev-card-sample">
              <ConfidenceMeter score={0.97} />
            </div>
            <div className="ev-card-sample">
              <ConfidenceMeter score={0.88} />
            </div>
            <div className="ev-card-sample">
              <ConfidenceMeter score={0.71} />
            </div>
            <div className="ev-card-sample">
              <ConfidenceMeter score={0.58} />
            </div>
          </div>
        </section>

        {/* SECTION 4: ProvenanceTag */}
        <section className="ev-gallery-section">
          <h2 className="ev-section-title">4. ProvenanceTag Component (§5.2, §6.1)</h2>
          <p className="ev-section-desc">
            Rule: Mandatory on every machine decision, recommendation, test, and edge. Hover/focus reveals source.
          </p>
          <div className="ev-gallery-row">
            {provenanceKinds.map((k) => (
              <div key={k} className="ev-card-sample">
                <ProvenanceTag kind={k} source="ast-scanner" timestamp="10:21 IST" />
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: GateBanner & KernelVerdict */}
        <section className="ev-gallery-section">
          <h2 className="ev-section-title">5. GateBanner & KernelVerdict Components (§6.1)</h2>
          <div className="ev-gallery-col">
            <GateBanner
              gateId="Gate G1"
              gateName="Critical Blast Radius Boundary"
              blockingCount={1}
              message="Unconfirmed critical edge: Refund Agent → Fallback model (0.62 confidence)"
              actionText="Review & confirm edge"
              onActionClick={() => alert('Opening Edge Review modal')}
            />

            <div className="ev-gallery-row">
              <div className="ev-card-sample" style={{ flex: 1 }}>
                <KernelVerdict
                  decision="permit"
                  ruleId="K-001"
                  reason="Workload contract invariants satisfied. Rollout authorized within 5% canary limit."
                  onViewRule={(id) => alert(`Viewing rule ${id}`)}
                />
              </div>
              <div className="ev-card-sample" style={{ flex: 1 }}>
                <KernelVerdict
                  decision="deny"
                  ruleId="K-014"
                  reason="Mandatory pre-condition check missing: Candidate agent skipped refund policy verification step."
                  onViewRule={(id) => alert(`Viewing rule ${id}`)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: RiskBadgeRow & StatTile */}
        <section className="ev-gallery-section">
          <h2 className="ev-section-title">6. RiskBadgeRow & StatTile Components (§6.1)</h2>
          <p className="ev-section-desc">
            Rule: Every stat tile MUST carry an "illustrative" or "measured" tag. A tile without a tag is a defect.
          </p>
          <div className="ev-gallery-col">
            <RiskBadgeRow
              counts={{ migrate: 2, canary: 2, investigate: 1, block: 1 }}
              onFilterClick={(key) => alert(`Filtering by ${key}`)}
            />

            <div className="ev-gallery-row">
              <StatTile
                label="Selected Test Scope"
                value="134 / 480"
                delta={{ value: "-72% reduced", positive: true }}
                proofType="illustrative"
                subtext="100% critical invariants locked"
              />
              <StatTile
                label="Automated Recovery"
                value="2m 14s"
                delta={{ value: "Target: < 5m", positive: true }}
                proofType="measured"
                subtext="Canary rollback completed safely"
              />
              <StatTile
                label="Seeded Regression Recall"
                value="100%"
                delta={{ value: "12 of 12 caught", positive: true }}
                proofType="measured"
                subtext="Zero missed critical invariants"
              />
            </div>
          </div>
        </section>

        {/* SECTION 7: HashChip, SandboxBadge & FreshnessPill */}
        <section className="ev-gallery-section">
          <h2 className="ev-section-title">7. HashChip, Sandbox & Freshness (§6.1)</h2>
          <div className="ev-gallery-row">
            <div className="ev-card-sample">
              <span className="ev-sample-label">Verified SHA-256 Hash:</span>
              <HashChip hash="9e8a72b04f183726dae004bfae92716492b95764c92" isVerified={true} />
            </div>
            <div className="ev-card-sample">
              <span className="ev-sample-label">Broken Hash (Raises Hard Stop O4):</span>
              <HashChip
                hash="c4ca4238a0b923820dcc509a6f75849b284e71f7b"
                isVerified={false}
                onBrokenClick={() => alert('HARD STOP O4: Evidence record tamper detected!')}
              />
            </div>
            <div className="ev-card-sample">
              <span className="ev-sample-label">Freshness State:</span>
              <FreshnessPill isStale={false} />
            </div>
            <div className="ev-card-sample">
              <span className="ev-sample-label">Stale Degraded Mode:</span>
              <FreshnessPill isStale={true} />
            </div>
          </div>
        </section>

        {/* SECTION 8: StageStepper */}
        <section className="ev-gallery-section">
          <h2 className="ev-section-title">8. StageStepper Component (§6.1, §9.6)</h2>
          <p className="ev-section-desc">
            Rule: 6-stage event workspace spine. Locked steps explain why in tooltip & accessibility description.
          </p>
          <div className="ev-card-sample" style={{ padding: 0 }}>
            <StageStepper
              stages={stepperStages}
              currentStageId={currentStage}
              onSelectStage={(id) => setCurrentStage(id)}
            />
          </div>
        </section>

        {/* SECTION 9: GlossaryTerm in Context */}
        <section className="ev-gallery-section">
          <h2 className="ev-section-title">9. GlossaryTerm in Context (§6.1, §14)</h2>
          <p className="ev-section-desc">
            Rule: Dotted underline with hover popover. Verbatim charter definitions for all 20 charter terms.
          </p>
          <div className="ev-card-sample">
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              When a <GlossaryTerm term="Model change event" /> occurs across the estate,{' '}
              <GlossaryTerm term="AI Evergreen" /> orchestrates a{' '}
              <GlossaryTerm term="Differential evaluation" /> against the workload's{' '}
              <GlossaryTerm term="Behavioural contract" />. The{' '}
              <GlossaryTerm term="Trusted kernel" /> enforces policies and verifies the immutable{' '}
              <GlossaryTerm term="Qualification evidence record" /> before any{' '}
              <GlossaryTerm term="Promotion" /> can proceed.
            </p>
          </div>
        </section>

        {/* SECTION 10: EmptyState & SkeletonBlock */}
        <section className="ev-gallery-section">
          <h2 className="ev-section-title">10. EmptyState & SkeletonBlock (§6.1, §12)</h2>
          <div className="ev-gallery-row">
            <div style={{ flex: 1 }}>
              <EmptyState
                icon={ShieldCheck}
                title="All Gate Invariants Satisfied"
                description="No pending critical edge confirmations or missing tests. Regression execution plan is ready."
                actionText="Proceed to Results"
                onActionClick={() => alert('Moving to next stage')}
              />
            </div>
            <div className="ev-card-sample" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span className="ev-sample-label">Skeleton Placeholder (Loading State):</span>
              <SkeletonBlock height="28px" width="60%" />
              <SkeletonBlock height="16px" width="100%" />
              <SkeletonBlock height="16px" width="85%" />
              <SkeletonBlock height="36px" width="40%" borderRadius="var(--ev-radius-chip)" />
            </div>
          </div>
        </section>

        {/* SECTION 11: Phase 2 Evaluation Components */}
        <section className="ev-gallery-section">
          <h2 className="ev-section-title">11. Phase 2 Evaluation & Diff Components (§11)</h2>
          <p className="ev-section-desc">
            Rule: Deterministic failure overrides probabilistic judges. Agents are evaluated on the trajectory they took, not just final answer.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="ev-card-sample">
              <span className="ev-sample-label">Agent Trajectory Timeline (Refund Agent C-0087 — Skipped Step):</span>
              <TrajectoryTimeline
                currentSteps={[
                  'lookup_transaction(id="tx_9821")',
                  'policy_check(amount=1250.00, customer_tier="standard")',
                  'refund_declined(reason="EXCEEDS_TIER_LIMIT")',
                ]}
                candidateSteps={[
                  'lookup_transaction(id="tx_9821")',
                  'refund_declined(reason="EXCEEDS_TIER_LIMIT")',
                ]}
                skippedNote="Required step missing: policy check did not run."
                isDeterministicFail={true}
              />
            </div>

            <div className="ev-card-sample">
              <span className="ev-sample-label">Differential Response Diff Viewer (Claims Policy C-0142):</span>
              <DiffViewer
                currentText="Coverage for burst pipes is provided under Section 4.2.1 (Water Damage Rider), with a $500 standard deductible applying."
                candidateText="Water damage from pipe failure is covered under General Property Provisions (Section 4), subject to standard deductible terms."
                explanation="Candidate omitted specific rider subclause 4.2.1 citation required by behavioural contract v3.1."
                verdictNote="Semantic grounding variance detected."
              />
            </div>
          </div>
        </section>

        {/* SECTION 11: Phase 3 Telemetry Threshold Charts & Rollout (§13) */}
        <section className="ev-gallery-section">
          <h2 className="ev-section-title">11. Telemetry Threshold Charts (§13)</h2>
          <p className="ev-section-desc">
            Rule: Metric cards display limit line, trend SVG, and accessible table toggle. Breaches trigger red alert state and automated rollback.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div className="ev-card-sample">
              <span className="ev-sample-label">Healthy Telemetry (Citation Validity):</span>
              <ThresholdChart
                metric={{
                  id: 'metric-sample-1',
                  name: 'CITATION VALIDITY',
                  limit: 0.95,
                  current: 0.97,
                  comparator: '>',
                  unit: '',
                  isBreach: false,
                  history: [
                    { timestamp: '14:00', value: 0.98 },
                    { timestamp: '14:05', value: 0.97 },
                    { timestamp: '14:10', value: 0.97 },
                  ],
                }}
              />
            </div>

            <div className="ev-card-sample">
              <span className="ev-sample-label">Seeded Anomaly Breach (Groundedness &lt; 0.85):</span>
              <ThresholdChart
                metric={{
                  id: 'metric-sample-2',
                  name: 'GROUNDEDNESS',
                  limit: 0.85,
                  current: 0.71,
                  comparator: '<',
                  unit: '',
                  isBreach: true,
                  history: [
                    { timestamp: '14:00', value: 0.88 },
                    { timestamp: '14:05', value: 0.86 },
                    { timestamp: '14:10', value: 0.71 },
                  ],
                }}
              />
            </div>
          </div>
        </section>
      </main>



      <SandboxBadge variant="strip" />
    </div>
  );
};
