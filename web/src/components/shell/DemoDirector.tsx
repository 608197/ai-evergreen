import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  AlertTriangle,
  Users,
  Compass,
  X,
  CheckCircle2,
} from 'lucide-react';
import './DemoDirector.css';

interface DemoStepInfo {
  step: number;
  screenId: string;
  screenName: string;
  route: string;
  presenterSays: string;
  action: string;
  expectedResult: string;
}

const DEMO_STEPS: DemoStepInfo[] = [
  {
    step: 1,
    screenId: 'S1',
    screenName: 'Command Center',
    route: '/',
    presenterSays: 'One model, Atlas-1, retires in 14 days. Today each team would start its own project.',
    action: 'Open the Atlas-1 card in the change event feed.',
    expectedResult: 'Event opens at Blast Radius with active discovery progress.',
  },
  {
    step: 2,
    screenId: 'S2',
    screenName: 'Blast Radius',
    route: '/events/E-2026-001/blast-radius',
    presenterSays: 'Evergreen finds exactly who is affected: six applications, and two that are only connected.',
    action: 'Observe discovery status; review affected vs connected workloads; filter topology.',
    expectedResult: 'Six affected workloads, two hollow connected-not-affected nodes.',
  },
  {
    step: 3,
    screenId: 'S2',
    screenName: 'Blast Radius & Gate G1',
    route: '/events/E-2026-001/blast-radius',
    presenterSays: 'It will not guess on a critical path. One edge needs a human.',
    action: 'Switch to Ravi Kulkarni; Confirm the Refund edge; Continue to Plan.',
    expectedResult: 'Gate G1 clears; Plan unlocks; signed record entry added to ledger.',
  },
  {
    step: 4,
    screenId: 'S3',
    screenName: 'Regression Plan',
    route: '/events/E-2026-001/plan',
    presenterSays: '134 of 480 tests, and every exclusion has a reason. Critical tests are locked.',
    action: 'Open an exclusion reason; inspect lock on critical invariant tests; review proposed test.',
    expectedResult: 'Evidence Drawer O1 shows machine-readable reason; critical pack locked.',
  },
  {
    step: 5,
    screenId: 'S3',
    screenName: 'Regression Plan & Gate G2',
    route: '/events/E-2026-001/plan',
    presenterSays: 'It found a test nobody had written: the policy check must come first.',
    action: 'As Marcus Lee: approve the missing candidate test MT-001; Approve test scope.',
    expectedResult: 'Gate G2 clears; differential results matrix unlocks.',
  },
  {
    step: 6,
    screenId: 'S4',
    screenName: 'Results Matrix',
    route: '/events/E-2026-001/results',
    presenterSays: 'Headline accuracy rose +3.2%, but Sept 2026 research shows aggregate gains hide regressions. Evergreen isolates item deterioration and blocks on critical defect DEFECT-008.',
    action: 'Select Refund Agent; click the Trajectory dimension cell to open differential diff.',
    expectedResult: 'Side-by-side agent workflow diff highlights dashed missing policy check step.',
  },
  {
    step: 7,
    screenId: 'S5',
    screenName: 'Treatment Decision',
    route: '/events/E-2026-001/decision',
    presenterSays: 'Four outcomes across six applications. The Kernel denies Refund; it cannot be approved by anyone.',
    action: 'Review Migrate, Canary, Investigate, Block treatments; click "Inspect Hard Stop" on Refund Agent.',
    expectedResult: 'Kernel Deny on K-014 prohibits promotion; Overlay O4 Hard Stop displays fail-closed alert.',
  },
  {
    step: 8,
    screenId: 'S5',
    screenName: 'Decision & Tiered Sign-Off',
    route: '/events/E-2026-001/decision',
    presenterSays: 'Named humans sign, with friction that matches risk.',
    action: 'Sign Ticket Summariser as Asha Rao; dual-sign Claims as Daniel Okafor; sign Invoice as Marcus Lee.',
    expectedResult: 'Overlay O2 captures signed approval records; rollouts queued for promotion.',
  },
  {
    step: 9,
    screenId: 'S6',
    screenName: 'Canary Rollout',
    route: '/events/E-2026-001/rollout',
    presenterSays: 'Canary runs inside pre-approved limits. Now a failure.',
    action: 'Inspect 5-step ladder; trigger "Canary degrades" failure injection.',
    expectedResult: 'Autonomous rollback executes in 850ms (<60s target); last-known-good restored.',
  },
  {
    step: 10,
    screenId: 'S7',
    screenName: 'Qualification Record',
    route: '/events/E-2026-001/record',
    presenterSays: 'Everything is provable and reproducible.',
    action: 'Inspect SHA-256 evidence chain; verify Merkle integrity; click "Reproduce Evaluation".',
    expectedResult: '100% cryptographic integrity verified; evaluation reproduced with zero variance.',
  },
  {
    step: 11,
    screenId: 'S10 & S9',
    screenName: 'Memory & Workload Dossier',
    route: '/memory',
    presenterSays: 'What we learned becomes memory. The owner approves it.',
    action: 'Review Discovered Behavioral Patterns; click proposal to view Workload Dossier contract.',
    expectedResult: 'Contract proposal reviewed; approved version bump recorded.',
  },
  {
    step: 12,
    screenId: 'S11 & S12',
    screenName: 'Controls & Portfolio',
    route: '/controls',
    presenterSays: 'Evergreen governs itself, passes all 12 H1–H12 safety gates, and maintains an explicit Build-vs-Integrate boundary with ServiceNow and Cognizant AI Gateway.',
    action: 'Inspect H1–H12 Verification Matrix and Build-vs-Integrate Boundary; view self-governance safeguards.',
    expectedResult: 'All 12 hypotheses passed (100% safety); architectural enterprise integration verified.',
  },
];

export const DemoDirector: React.FC = () => {
  const navigate = useNavigate();
  const {
    isDemoDirectorOpen,
    setDemoDirectorOpen,
    demoStep,
    setDemoStep,
    currentUser,
    identities,
    setCurrentUser,
    injectFailure,
    resetScenario,
  } = useEvergreenStore();

  const [injectionsOpen, setInjectionsOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [resetConfirmed, setResetConfirmed] = useState(false);

  // Global hotkey Ctrl+Alt+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        setDemoDirectorOpen(!isDemoDirectorOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDemoDirectorOpen, setDemoDirectorOpen]);

  if (!isDemoDirectorOpen) {
    return (
      <button
        type="button"
        className="ev-demo-tab-launcher"
        onClick={() => setDemoDirectorOpen(true)}
        title="Open Demo Director (Ctrl+Alt+D)"
        aria-label="Open Demo Director mode"
      >
        <Sparkles size={14} aria-hidden="true" />
        <span>Demo</span>
      </button>
    );
  }

  const currentStepInfo = DEMO_STEPS[demoStep - 1] || DEMO_STEPS[0];

  const handleNext = () => {
    if (demoStep < DEMO_STEPS.length) {
      const nextStep = demoStep + 1;
      setDemoStep(nextStep);
      navigate(DEMO_STEPS[nextStep - 1].route);
    }
  };

  const handlePrev = () => {
    if (demoStep > 1) {
      const prevStep = demoStep - 1;
      setDemoStep(prevStep);
      navigate(DEMO_STEPS[prevStep - 1].route);
    }
  };

  const handleJump = () => {
    navigate(currentStepInfo.route);
  };

  const handleReset = () => {
    resetScenario();
    navigate('/');
    setResetConfirmed(true);
    setTimeout(() => setResetConfirmed(false), 2500);
  };

  return (
    <aside
      className="ev-demo-director"
      role="region"
      aria-label="Demo Director Control Panel"
    >
      {/* Header */}
      <div className="ev-demo-header">
        <div className="ev-demo-title-group">
          <Sparkles size={16} className="ev-demo-sparkle" aria-hidden="true" />
          <span className="ev-demo-title">DEMO DIRECTOR</span>
          <span className="ev-demo-badge">Step {demoStep}/12</span>
        </div>
        <button
          type="button"
          className="ev-demo-close-btn"
          onClick={() => setDemoDirectorOpen(false)}
          title="Collapse Demo Director"
          aria-label="Collapse Demo Director"
        >
          <X size={15} />
        </button>
      </div>

      <div className="ev-demo-body">
        {/* Step Guide Card */}
        <section className="ev-demo-card">
          <div className="ev-demo-card-header">
            <span className="ev-demo-screen-tag">{currentStepInfo.screenId}</span>
            <span className="ev-demo-screen-name">{currentStepInfo.screenName}</span>
          </div>

          <div className="ev-demo-cue-group">
            <label className="ev-demo-cue-label">PRESENTER SAYS</label>
            <blockquote className="ev-demo-quote">
              &ldquo;{currentStepInfo.presenterSays}&rdquo;
            </blockquote>
          </div>

          <div className="ev-demo-cue-group">
            <label className="ev-demo-cue-label">ACTION</label>
            <p className="ev-demo-cue-text">{currentStepInfo.action}</p>
          </div>

          <div className="ev-demo-cue-group">
            <label className="ev-demo-cue-label">EXPECTED RESULT</label>
            <p className="ev-demo-cue-result">{currentStepInfo.expectedResult}</p>
          </div>

          <div className="ev-demo-step-actions">
            <button
              type="button"
              className="ev-demo-btn ev-demo-btn--secondary"
              onClick={handlePrev}
              disabled={demoStep === 1}
              aria-label="Previous step"
            >
              <ChevronLeft size={14} /> Back
            </button>
            <button
              type="button"
              className="ev-demo-btn ev-demo-btn--jump"
              onClick={handleJump}
              title="Navigate directly to screen for this step"
            >
              <Compass size={13} /> Go to Screen
            </button>
            <button
              type="button"
              className="ev-demo-btn ev-demo-btn--primary"
              onClick={handleNext}
              disabled={demoStep === DEMO_STEPS.length}
              aria-label="Next step"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </section>

        {/* Role Switcher */}
        <section className="ev-demo-section">
          <button
            type="button"
            className="ev-demo-section-toggle"
            onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
            aria-expanded={roleSwitcherOpen}
          >
            <div className="ev-demo-section-title">
              <Users size={14} />
              <span>Active Persona: <strong>{currentUser.name}</strong></span>
            </div>
            <span className="ev-demo-pill">{currentUser.roleTitle}</span>
          </button>

          {roleSwitcherOpen && (
            <div className="ev-demo-role-grid">
              {identities.map((id) => (
                <button
                  key={id.id}
                  type="button"
                  className={`ev-demo-role-chip ${id.id === currentUser.id ? 'ev-demo-role-chip--active' : ''}`}
                  onClick={() => setCurrentUser(id.id)}
                >
                  <span className="ev-demo-avatar">{id.initials}</span>
                  <div className="ev-demo-role-meta">
                    <span className="ev-demo-name">{id.name}</span>
                    <span className="ev-demo-title-sub">{id.roleTitle}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 8 Failure Injections */}
        <section className="ev-demo-section">
          <button
            type="button"
            className="ev-demo-section-toggle"
            onClick={() => setInjectionsOpen(!injectionsOpen)}
            aria-expanded={injectionsOpen}
          >
            <div className="ev-demo-section-title">
              <AlertTriangle size={14} />
              <span>Failure Injections (8)</span>
            </div>
            <span className="ev-demo-pill">Fail-Closed</span>
          </button>

          {injectionsOpen && (
            <div className="ev-demo-injections-list">
              <p className="ev-demo-injections-note">
                Every failure injection writes a verified &ldquo;Injected for demo&rdquo; entry into the cryptographic ledger.
              </p>

              <button
                type="button"
                className="ev-demo-inject-btn"
                onClick={() => injectFailure('stale_graph')}
              >
                <div className="ev-demo-inject-title">1. Stale Graph</div>
                <div className="ev-demo-inject-desc">Ages graph past 24h SLA; pauses autonomous reduction.</div>
              </button>

              <button
                type="button"
                className="ev-demo-inject-btn"
                onClick={() => injectFailure('connector_outage')}
              >
                <div className="ev-demo-inject-title">2. Connector Outage</div>
                <div className="ev-demo-inject-desc">Discovery sources time out; uncertain workloads included safely.</div>
              </button>

              <button
                type="button"
                className="ev-demo-inject-btn"
                onClick={() => injectFailure('judge_disagreement')}
              >
                <div className="ev-demo-inject-title">3. Judge Disagreement</div>
                <div className="ev-demo-inject-desc">Probabilistic judges split; treatment moves to Investigate.</div>
              </button>

              <button
                type="button"
                className="ev-demo-inject-btn"
                onClick={() => injectFailure('approval_expires')}
              >
                <div className="ev-demo-inject-title">4. Approval Expires</div>
                <div className="ev-demo-inject-desc">Sign-off passes TTL before rollout; promotion fails closed.</div>
              </button>

              <button
                type="button"
                className="ev-demo-inject-btn"
                onClick={() => {
                  injectFailure('canary_degrades');
                  navigate('/events/E-2026-001/rollout');
                }}
              >
                <div className="ev-demo-inject-title">5. Canary Degrades</div>
                <div className="ev-demo-inject-desc">Groundedness drops to 0.76; triggers automated rollback in 850ms.</div>
              </button>

              <button
                type="button"
                className="ev-demo-inject-btn"
                onClick={() => injectFailure('rollback_fails')}
              >
                <div className="ev-demo-inject-title">6. Rollback Fails</div>
                <div className="ev-demo-inject-desc">LKG fails health probe; triggers Hard Stop O4 and Break-Glass Runbook.</div>
              </button>

              <button
                type="button"
                className="ev-demo-inject-btn"
                onClick={() => {
                  injectFailure('evidence_integrity_fails');
                  navigate('/events/E-2026-001/record');
                }}
              >
                <div className="ev-demo-inject-title">7. Evidence Integrity Fails</div>
                <div className="ev-demo-inject-desc">Tampers block hash in ledger; triggers Hard Stop O4 and voids promotion.</div>
              </button>

              <button
                type="button"
                className="ev-demo-inject-btn"
                onClick={() => injectFailure('kernel_unavailable')}
              >
                <div className="ev-demo-inject-title">8. Kernel Unavailable</div>
                <div className="ev-demo-inject-desc">Trusted Kernel heartbeat lost; promotion actions blocked immediately.</div>
              </button>
            </div>
          )}
        </section>

        {/* Reset Scenario */}
        <div className="ev-demo-reset-wrapper">
          <button
            type="button"
            className={`ev-demo-reset-btn ${resetConfirmed ? 'ev-demo-reset-btn--done' : ''}`}
            onClick={handleReset}
            title="Reset scenario back to original seed state (< 1s)"
          >
            {resetConfirmed ? (
              <>
                <CheckCircle2 size={14} /> Scenario Reset Complete
              </>
            ) : (
              <>
                <RotateCcw size={14} /> Reset Scenario (Seed State)
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
