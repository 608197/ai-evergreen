import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import { apiClient } from '../../api/client';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  AlertTriangle,
  Users,
  Compass,
  X,
  Volume2,
  VolumeX,
  BookOpen,
  Mic,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import './DemoDirector.css';

interface DemoStepInfo {
  step: number;
  screenId: string;
  screenName: string;
  chapterTitle: string;
  route: string;
  narrativeSummary: string;
  enterpriseRoi: string;
  userNextStep: string;
  presenterSays: string;
  action: string;
  expectedResult: string;
}

const DEMO_STEPS: DemoStepInfo[] = [
  {
    step: 1,
    screenId: 'S1',
    screenName: 'Command Cockpit',
    chapterTitle: 'Upstream Model Signal & Enterprise Alert',
    route: '/',
    narrativeSummary:
      'AWS Bedrock announced the retirement of Foundation Model Atlas-1 in 14 days. Instead of waiting for production outages or forcing 6 development teams to start manual triage, AI Evergreen automatically ingests the signal and isolates the enterprise blast radius.',
    enterpriseRoi:
      'Eliminates duplicate qualification projects across teams and prevents uncoordinated model migrations.',
    userNextStep:
      'Click "Review Impact on My Applications" on the active Hero card, or click Next below to inspect the blast radius graph.',
    presenterSays:
      'One model, Atlas-1, retires in 14 days. Today each team would start its own project.',
    action: 'Open the Atlas-1 card in the change event feed.',
    expectedResult: 'Event opens at Blast Radius with active discovery progress.',
  },
  {
    step: 2,
    screenId: 'S2',
    screenName: 'Blast Radius',
    chapterTitle: 'Enterprise Topology & Dependency Discovery',
    route: '/events/E-2026-001/blast-radius',
    narrativeSummary:
      'AI Evergreen scanned your ServiceNow CMDB and Git codebases to discover exactly 6 affected enterprise applications and 2 connected dependencies. It distinguishes active consumers from passive dependencies with evidence-backed confidence scores.',
    enterpriseRoi:
      '100% visibility into upstream AI dependencies with zero guesswork or manual spreadsheets.',
    userNextStep:
      'Notice that the Refund Agent edge has confidence 0.62 and is unconfirmed. A human must attest this critical path.',
    presenterSays:
      'Evergreen finds exactly who is affected: six applications, and two that are only connected.',
    action: 'Observe discovery status; review affected vs connected workloads; filter topology.',
    expectedResult: 'Six affected workloads, two hollow connected-not-affected nodes.',
  },
  {
    step: 3,
    screenId: 'S2',
    screenName: 'Gate G1 Attestation',
    chapterTitle: 'Human-in-the-Loop Attestation (Gate G1)',
    route: '/events/E-2026-001/blast-radius',
    narrativeSummary:
      'AI Evergreen enforces an ironclad operating principle: "Deterministic checks before probabilistic judgement." It refuses to guess on a critical payment edge. AI Platform Engineer Ravi Kulkarni must confirm the dependency before Gate G1 clears.',
    enterpriseRoi:
      'Guarantees that no downstream application is silently broken by incomplete dependency graphs.',
    userNextStep:
      'Switch persona to Ravi Kulkarni, click "Confirm Edge" on Refund Agent, and proceed to Regression Planning.',
    presenterSays:
      'It will not guess on a critical path. One edge needs a human.',
    action: 'Switch to Ravi Kulkarni; Confirm the Refund edge; Continue to Plan.',
    expectedResult: 'Gate G1 clears; Plan unlocks; signed record entry added to ledger.',
  },
  {
    step: 4,
    screenId: 'S3',
    screenName: 'Adaptive Plan',
    chapterTitle: 'Adaptive Test Selection & Machine-Readable Exclusions',
    route: '/events/E-2026-001/plan',
    narrativeSummary:
      'Running all 480 test cases from Jira/Xray would take 18.5 hours and cost thousands in API tokens. The Adaptive Planner selects 134 high-impact tests and excludes 346 with mandatory machine-readable rationales. Critical invariants can never be excluded.',
    enterpriseRoi:
      '72% reduction in qualification time and compute cost with 100% preservation of safety invariants.',
    userNextStep:
      'Click on any excluded test to view its audit rationale (Evidence Drawer O1), then inspect the locked Critical Invariant suite.',
    presenterSays:
      '134 of 480 tests, and every exclusion has a reason. Critical tests are locked.',
    action: 'Open an exclusion reason; inspect lock on critical invariant tests; review proposed test.',
    expectedResult: 'Evidence Drawer O1 shows machine-readable reason; critical pack locked.',
  },
  {
    step: 5,
    screenId: 'S3',
    screenName: 'Gate G2 & Test Synthesis',
    chapterTitle: 'Autonomous Test Synthesis (Gate G2)',
    route: '/events/E-2026-001/plan',
    narrativeSummary:
      'AI Evergreen detected a critical behavioral gap: the candidate model lacks a test verifying that policy checks execute before refunds. It synthesized missing test GEN-01 (MT-001) from behavioral contracts and requires QA Lead Marcus Lee to approve.',
    enterpriseRoi:
      'Finds zero-day testing blindspots before an AI model reaches production environments.',
    userNextStep:
      'As Marcus Lee, approve candidate test MT-001 and approve test scope to unlock the differential results matrix.',
    presenterSays:
      'It found a test nobody had written: the policy check must come first.',
    action: 'As Marcus Lee: approve the missing candidate test MT-001; Approve test scope.',
    expectedResult: 'Gate G2 clears; differential results matrix unlocks.',
  },
  {
    step: 6,
    screenId: 'S4',
    screenName: 'Results Matrix',
    chapterTitle: 'Item-Level Deterioration & Defect Isolation',
    route: '/events/E-2026-001/results',
    narrativeSummary:
      'Candidate model Atlas-1b showed a deceptive +3.2% rise in aggregate benchmark accuracy. However, our item-level deterioration detector caught a fatal Tool Inversion bug on Refund Agent where refunds execute without prior policy verification.',
    enterpriseRoi:
      'Prevents catastrophic aggregate-metric illusions where overall benchmark gains mask localized critical defects.',
    userNextStep:
      'Select Refund Agent in the table and click the Trajectory dimension cell to inspect the side-by-side workflow diff.',
    presenterSays:
      'Headline accuracy rose +3.2%, but aggregate gains hide regressions. Evergreen isolates item deterioration and blocks on critical defect DEFECT-008.',
    action: 'Select Refund Agent; click the Trajectory dimension cell to open differential diff.',
    expectedResult: 'Side-by-side agent workflow diff highlights dashed missing policy check step.',
  },
  {
    step: 7,
    screenId: 'S5',
    screenName: 'Treatment Decision',
    chapterTitle: 'Deterministic Policy & Trusted Kernel Deny',
    route: '/events/E-2026-001/decision',
    narrativeSummary:
      'LLMs advise; policy determines allowed actions. While the LLM evaluator recommended a conditional canary, the deterministic Trusted Kernel enforced Safety Rule K-014 and unconditionally DENIED promotion for Refund Agent. No prompt or human can override this hard stop.',
    enterpriseRoi:
      'Enforces regulatory compliance and safety guardrails that cannot be hallucinatively bypassed by AI agents.',
    userNextStep:
      'Review the 4 treatment buckets (Migrate: 2, Canary: 2, Investigate: 1, Block: 1) and click "Inspect Hard Stop" on Refund Agent.',
    presenterSays:
      'Four outcomes across six applications. The Kernel denies Refund; it cannot be approved by anyone.',
    action: 'Review Migrate, Canary, Investigate, Block treatments; click "Inspect Hard Stop" on Refund Agent.',
    expectedResult: 'Kernel Deny on K-014 prohibits promotion; Overlay O4 Hard Stop displays fail-closed alert.',
  },
  {
    step: 8,
    screenId: 'S5',
    screenName: 'Sign-Off Matrix',
    chapterTitle: 'Tiered Human Authority & Cryptographic Approvals',
    route: '/events/E-2026-001/decision',
    narrativeSummary:
      'Production promotion requires signed human approvals matched to risk tier. Low-risk Ticket Summariser requires single app-owner sign-off (Asha Rao); high-risk Claims Policy Assistant requires dual sign-off from Data Owner Daniel Okafor and Risk Lead Priya Menon.',
    enterpriseRoi:
      'Eliminates unauthorized AI deployments while preserving agility for routine low-risk workloads.',
    userNextStep:
      'Sign Ticket Summariser as Asha Rao and Claims Assistant as Daniel Okafor to queue safe candidates for promotion.',
    presenterSays:
      'Named humans sign, with friction that matches risk.',
    action: 'Sign Ticket Summariser as Asha Rao; dual-sign Claims as Daniel Okafor; sign Invoice as Marcus Lee.',
    expectedResult: 'Overlay O2 captures signed approval records; rollouts queued for promotion.',
  },
  {
    step: 9,
    screenId: 'S6',
    screenName: 'Canary Rollout',
    chapterTitle: 'AI Gateway Canary & Sub-Second Autonomous Rollback',
    route: '/events/E-2026-001/rollout',
    narrativeSummary:
      'Cognizant AI Gateway initiates a 5-step canary ladder routing 5% traffic to Atlas-1b. The Rollback Controller continuously monitors fixed SLA thresholds (<850ms latency). If degradation is detected, autonomous rollback restores last-known-good state in 850 milliseconds.',
    enterpriseRoi:
      'Zero-downtime canary deployments with guaranteed sub-second rollback protection before end-users notice.',
    userNextStep:
      'Click "Inject Canary Failure" to watch the autonomous rollback controller tripwire instantly revert traffic to 100% production.',
    presenterSays:
      'Canary runs inside pre-approved limits. Now a failure.',
    action: 'Inspect 5-step ladder; trigger "Canary degrades" failure injection.',
    expectedResult: 'Autonomous rollback executes in 850ms (<60s target); last-known-good restored.',
  },
  {
    step: 10,
    screenId: 'S7',
    screenName: 'Audit Record',
    chapterTitle: 'Cryptographic Merkle Proof & Replay Verification',
    route: '/events/E-2026-001/record',
    narrativeSummary:
      'Every model change, test result, human signature, and rollback event is sealed into an immutable SHA-256 Merkle evidence ledger. Any regulator or auditor can independently reproduce the exact qualification execution with zero variance.',
    enterpriseRoi:
      'Passes stringent EU AI Act, NIST AI RMF, and internal compliance audits with mathematical proof.',
    userNextStep:
      'Click "Verify Merkle Proof" and "Reproduce Evaluation Run" to verify mathematical tamper-resistance.',
    presenterSays:
      'Everything is provable and reproducible.',
    action: 'Inspect SHA-256 evidence chain; verify Merkle integrity; click "Reproduce Evaluation".',
    expectedResult: '100% cryptographic integrity verified; evaluation reproduced with zero variance.',
  },
  {
    step: 11,
    screenId: 'S10 & S9',
    screenName: 'Memory & Dossier',
    chapterTitle: 'Institutional Memory & Pattern Reuse',
    route: '/memory',
    narrativeSummary:
      'AI Evergreen stores behavioral contracts and regression profiles in Institutional Memory. When future models are evaluated, past qualification artifacts are automatically reused, saving 42% qualification time on this event.',
    enterpriseRoi:
      'Compound enterprise intelligence: every qualification event accelerates subsequent model transitions.',
    userNextStep:
      'Review the Discovered Behavioral Patterns and click on a contract proposal to view the Workload Dossier.',
    presenterSays:
      'What we learned becomes memory. The owner approves it.',
    action: 'Review Discovered Behavioral Patterns; click proposal to view Workload Dossier contract.',
    expectedResult: 'Contract proposal reviewed; approved version bump recorded.',
  },
  {
    step: 12,
    screenId: 'S11 & S12',
    screenName: 'Controls & Kernel',
    chapterTitle: 'System Self-Governance & 12 Safety Invariants',
    route: '/controls',
    narrativeSummary:
      'AI Evergreen governs itself. The candidate planner is forbidden from evaluating its own output. The platform deterministically verifies all 12 H1–H12 hypotheses and maintains strict integration boundaries with ServiceNow CMDB and Cognizant AI Gateway.',
    enterpriseRoi:
      'Guarantees provable platform safety and architecturally complements existing enterprise investments.',
    userNextStep:
      'Inspect the H1–H12 Verification Matrix and review the Build-vs-Integrate enterprise boundary architecture.',
    presenterSays:
      'Evergreen governs itself, passes all 12 H1–H12 safety gates, and maintains an explicit Build-vs-Integrate boundary with ServiceNow and Cognizant AI Gateway.',
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

  const [activeTab, setActiveTab] = useState<'guide' | 'presenter' | 'injections'>('guide');
  const [isSpeaking, setIsSpeaking] = useState(false);
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

  // Speech synthesis cleanup
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const currentStepInfo = DEMO_STEPS[demoStep - 1] || DEMO_STEPS[0];

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = `${currentStepInfo.chapterTitle}. ${currentStepInfo.narrativeSummary} Key enterprise impact: ${currentStepInfo.enterpriseRoi}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleNext = () => {
    if (isSpeaking && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    if (demoStep < DEMO_STEPS.length) {
      const nextStep = demoStep + 1;
      setDemoStep(nextStep);
      navigate(DEMO_STEPS[nextStep - 1].route);
    }
  };

  const handlePrev = () => {
    if (isSpeaking && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
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
    if (isSpeaking && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    resetScenario();
    apiClient.resetDemoState().catch(() => {});
    navigate('/');
    setResetConfirmed(true);
    setTimeout(() => setResetConfirmed(false), 2500);
  };

  if (!isDemoDirectorOpen) {
    return (
      <button
        type="button"
        className="ev-narrator-pill-launcher"
        onClick={() => setDemoDirectorOpen(true)}
        title="Open System Narrator & Interactive Guide (Ctrl+Alt+D)"
        aria-label="Open System Narrator"
      >
        <span className="narrator-pulse-dot" />
        <Sparkles size={14} className="narrator-icon" />
        <span className="narrator-pill-text">
          System Narrator · Ch {demoStep}/12: {currentStepInfo.screenName}
        </span>
      </button>
    );
  }

  return (
    <aside
      className="ev-demo-director ev-narrator-drawer"
      role="region"
      aria-label="System Narrator & Interactive Guide Panel"
    >
      {/* Header */}
      <div className="ev-demo-header">
        <div className="ev-demo-title-group">
          <Sparkles size={17} className="ev-demo-sparkle" aria-hidden="true" />
          <div>
            <span className="ev-demo-title">SYSTEM NARRATOR</span>
            <span className="ev-narrator-subtitle">Interactive Enterprise Guide</span>
          </div>
        </div>

        <div className="ev-narrator-header-actions">
          <span className="ev-demo-badge">Ch {demoStep}/12</span>
          <button
            type="button"
            className="ev-demo-close-btn"
            onClick={() => {
              if (isSpeaking && 'speechSynthesis' in window) window.speechSynthesis.cancel();
              setIsSpeaking(false);
              setDemoDirectorOpen(false);
            }}
            title="Minimize Narrator (Ctrl+Alt+D)"
            aria-label="Minimize Narrator"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="ev-narrator-tabs">
        <button
          type="button"
          className={`narrator-tab ${activeTab === 'guide' ? 'narrator-tab--active' : ''}`}
          onClick={() => setActiveTab('guide')}
        >
          <BookOpen size={13} />
          <span>Interactive Guide</span>
        </button>
        <button
          type="button"
          className={`narrator-tab ${activeTab === 'presenter' ? 'narrator-tab--active' : ''}`}
          onClick={() => setActiveTab('presenter')}
        >
          <Mic size={13} />
          <span>Presenter Script</span>
        </button>
        <button
          type="button"
          className={`narrator-tab ${activeTab === 'injections' ? 'narrator-tab--active' : ''}`}
          onClick={() => setActiveTab('injections')}
        >
          <AlertTriangle size={13} />
          <span>Failure Injections (8)</span>
        </button>
      </div>

      <div className="ev-demo-body">
        {/* TAB 1: INTERACTIVE ENTERPRISE GUIDE (Self-guided for users & evaluators) */}
        {activeTab === 'guide' && (
          <section className="ev-demo-card ev-narrator-card">
            <div className="ev-narrator-card-top">
              <span className="ev-demo-screen-tag">{currentStepInfo.screenId}</span>
              <span className="ev-narrator-chapter-chip">Chapter {currentStepInfo.step}</span>
              <button
                type="button"
                className={`ev-narrator-audio-btn ${isSpeaking ? 'ev-narrator-audio-btn--active' : ''}`}
                onClick={handleSpeak}
                title={isSpeaking ? 'Stop Audio Narration' : 'Listen to Audio Narration'}
              >
                {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                <span>{isSpeaking ? 'Stop Audio' : 'Listen'}</span>
              </button>
            </div>

            <h3 className="ev-narrator-headline">{currentStepInfo.chapterTitle}</h3>

            {/* What you are seeing */}
            <div className="narrator-section-block">
              <label className="narrator-block-label">WHAT YOU ARE SEEING</label>
              <p className="narrator-block-text">{currentStepInfo.narrativeSummary}</p>
            </div>

            {/* Enterprise ROI */}
            <div className="narrator-section-block narrator-section-block--roi">
              <label className="narrator-block-label narrator-block-label--roi">
                <TrendingUp size={12} /> ENTERPRISE VALUE & ROI
              </label>
              <p className="narrator-block-text">{currentStepInfo.enterpriseRoi}</p>
            </div>

            {/* User Next Step */}
            <div className="narrator-section-block narrator-section-block--next">
              <label className="narrator-block-label narrator-block-label--next">
                <ArrowRight size={12} /> RECOMMENDED ACTION
              </label>
              <p className="narrator-block-text">{currentStepInfo.userNextStep}</p>
            </div>

            {/* Chapter Stepper Buttons */}
            <div className="ev-demo-step-actions">
              <button
                type="button"
                className="ev-demo-btn ev-demo-btn--secondary"
                onClick={handlePrev}
                disabled={demoStep === 1}
                aria-label="Previous chapter"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                type="button"
                className="ev-demo-btn ev-demo-btn--jump"
                onClick={handleJump}
                title="Navigate directly to screen for this chapter"
              >
                <Compass size={13} /> Go to Screen
              </button>
              <button
                type="button"
                className="ev-demo-btn ev-demo-btn--primary"
                onClick={handleNext}
                disabled={demoStep === DEMO_STEPS.length}
                aria-label="Next chapter"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </section>
        )}

        {/* TAB 2: PRESENTER SCRIPT (Techathon Pitch Notes) */}
        {activeTab === 'presenter' && (
          <section className="ev-demo-card">
            <div className="ev-demo-card-header">
              <span className="ev-demo-screen-tag">{currentStepInfo.screenId}</span>
              <span className="ev-demo-screen-name">{currentStepInfo.screenName}</span>
            </div>

            <div className="ev-demo-cue-group">
              <label className="ev-demo-cue-label">PRESENTER SAYS (30-SECOND PITCH)</label>
              <blockquote className="ev-demo-quote">
                &ldquo;{currentStepInfo.presenterSays}&rdquo;
              </blockquote>
            </div>

            <div className="ev-demo-cue-group">
              <label className="ev-demo-cue-label">ACTION TO PERFORM</label>
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
              >
                <ChevronLeft size={14} /> Back
              </button>
              <button
                type="button"
                className="ev-demo-btn ev-demo-btn--jump"
                onClick={handleJump}
              >
                <Compass size={13} /> Go to Screen
              </button>
              <button
                type="button"
                className="ev-demo-btn ev-demo-btn--primary"
                onClick={handleNext}
                disabled={demoStep === DEMO_STEPS.length}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </section>
        )}

        {/* TAB 3: FAILURE INJECTIONS */}
        {activeTab === 'injections' && (
          <section className="ev-demo-section">
            <p className="ev-demo-injections-note">
              Deterministic validation: Every failure injection triggers a fail-closed hard stop and writes a verified audit record into the cryptographic ledger.
            </p>

            <div className="ev-demo-injections-list">
              <button
                type="button"
                className="ev-demo-inject-btn"
                onClick={() => injectFailure('stale_graph')}
              >
                <span className="ev-demo-inject-num">F1</span>
                <div>
                  <strong>Stale Graph (&gt;24h)</strong>
                  <span>Blocks G1 gate unconditionally</span>
                </div>
              </button>

              <button
                type="button"
                className="ev-demo-inject-btn"
                onClick={() => injectFailure('connector_outage')}
              >
                <span className="ev-demo-inject-num">F2</span>
                <div>
                  <strong>Connector Outage</strong>
                  <span>Simulates CMDB/Jira outage blocking evidence</span>
                </div>
              </button>

              <button
                type="button"
                className="ev-demo-inject-btn"
                onClick={() => injectFailure('evidence_integrity_fails')}
              >
                <span className="ev-demo-inject-num">F3</span>
                <div>
                  <strong>Evidence Tamper Defect</strong>
                  <span>Triggers Merkle audit verification failure</span>
                </div>
              </button>

              <button
                type="button"
                className="ev-demo-inject-btn"
                onClick={() => injectFailure('canary_degrades')}
              >
                <span className="ev-demo-inject-num">F4</span>
                <div>
                  <strong>Canary Degrades (&gt;850ms)</strong>
                  <span>Triggers autonomous sub-second rollback</span>
                </div>
              </button>
            </div>
          </section>
        )}

        {/* Active Persona Strip */}
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

        {/* Footer: Reset Scenario */}
        <div className="ev-demo-footer">
          <button
            type="button"
            className="ev-demo-reset-btn"
            onClick={handleReset}
            title="Reset scenario state back to initial seed data"
          >
            <RotateCcw size={13} />
            <span>{resetConfirmed ? 'Reset Successful!' : 'Reset Demo Scenario'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
