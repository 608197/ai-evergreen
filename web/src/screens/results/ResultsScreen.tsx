import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  RotateCcw,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Scale,
  Hash,
  Clock,
  Sparkles,
  AlertOctagon,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { StageStepper } from '../../components/common/StageStepper';

import { GateBanner } from '../../components/common/GateBanner';
import { HeatmapGrid } from '../../components/results/HeatmapGrid';
import { TrajectoryTimeline } from '../../components/results/TrajectoryTimeline';
import { DiffViewer } from '../../components/results/DiffViewer';
import { EvidenceDrawer } from '../../components/overlays/EvidenceDrawer';
import { useEvergreenStore } from '../../store/useEvergreenStore';
import type { EvaluationDimension } from '../../types/domain';
import './ResultsScreen.css';

export const ResultsScreen: React.FC = () => {
  const { id = 'E-2026-001' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    evaluationResults,
    caseComparisons,
    runManifest,
    selectedWorkloadId,
    setSelectedWorkloadId,
    selectedDimension,
    setSelectedDimension,
    setSelectedCaseId,
    reproduceRun,
    getGateG3,
  } = useEvergreenStore();


  const [reproducing, setReproducing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState<any>(null);

  const gateG3 = getGateG3(id);

  // Find active cell and case comparison
  const activeCell = evaluationResults.find(
    (r) => r.workloadId === selectedWorkloadId && r.dimension === selectedDimension
  );

  const activeCase =
    caseComparisons.find((c) => c.workloadId === selectedWorkloadId) ||
    caseComparisons[0];

  const handleSelectCell = (workloadId: string, dimension: EvaluationDimension) => {
    setSelectedWorkloadId(workloadId);
    setSelectedDimension(dimension);
    const matchingCase = caseComparisons.find((c) => c.workloadId === workloadId);
    if (matchingCase) {
      setSelectedCaseId(matchingCase.caseId);
    }
  };

  const handleReproduceClick = () => {
    setReproducing(true);
    setTimeout(() => {
      reproduceRun(id);
      setReproducing(false);
    }, 600);
  };

  const handleOpenJudgeDrawer = () => {
    if (activeCell?.judgeAgreement) {
      setDrawerData({
        type: 'judge_disagreement',
        title: `Semantic Judge Disagreement · ${activeCell.workloadName}`,
        workloadName: activeCell.workloadName,
        judgeDetails: {
          judgeA: activeCell.judgeAgreement.judgeA,
          judgeB: activeCell.judgeAgreement.judgeB,
          notes: activeCell.judgeAgreement.notes,
        },
      });
      setDrawerOpen(true);
    }
  };

  return (
    <div className="results-screen">
      {/* Top Header */}
      <div className="results-header">
        <div className="results-header-main">
          <div className="results-breadcrumbs">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{id}</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Evaluation Heatmap</span>
          </div>

          <div className="results-title-row">
            <div>
              <div className="results-tag-strip">
                <span className="results-status-badge">EVALUATION COMPLETE</span>
                <span className="results-manifest-badge">SEED {runManifest.seed}</span>
              </div>
              <h1 className="results-title">
                Atlas-1 Retirement · Evaluation Results Heatmap & Diff Viewer
              </h1>
            </div>

            <div className="results-header-actions">
              <button
                type="button"
                className={`results-reproduce-btn ${reproducing ? 'is-spinning' : ''}`}
                onClick={handleReproduceClick}
                disabled={reproducing}
                title="Re-run deterministic differential replay from manifest seed"
              >
                <RotateCcw size={15} />
                {reproducing ? 'Replaying...' : 'Reproduce Run'}
              </button>

              <button
                type="button"
                className="results-continue-btn"
                onClick={() => navigate(`/events/${id}/decision`)}
              >
                <span>Continue to Decision</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Stat & Manifest Strip */}
          <div className="results-stat-bar">
            <div className="stat-pill">
              <Clock size={13} className="stat-icon" />
              <span className="stat-val">{runManifest.duration}</span>
              <span className="stat-label">total qualification runtime</span>
            </div>
            <span className="stat-divider">•</span>
            <div className="stat-pill">
              <span className="stat-val">134 / 134</span>
              <span className="stat-label">tests executed (illustrative)</span>
            </div>
            <span className="stat-divider">•</span>
            <div className="stat-pill">
              <Hash size={13} className="stat-icon" />
              <code className="manifest-hash-code" title={runManifest.hash}>
                {runManifest.hash.substring(0, 22)}...
              </code>
              <span className="stat-label">immutable run hash</span>
            </div>
          </div>
        </div>

        {/* 6-Stage Stepper with Stage 3 active */}
        <StageStepper
          stages={[
            { id: 'blast_radius', index: 1, name: 'Blast Radius', state: 'complete' },
            { id: 'plan', index: 2, name: 'Regression Plan', state: 'complete' },
            { id: 'results', index: 3, name: 'Results & Matrix', state: 'current' },
            { id: 'decision', index: 4, name: 'Decision & Approval', state: 'available' },
            { id: 'rollout', index: 5, name: 'Rollout & Canary', state: 'locked', lockReason: 'Requires signed promotion approval' },
            { id: 'record', index: 6, name: 'Qualification Record', state: 'locked', lockReason: 'Finalized upon closure' },
          ]}
          currentStageId="results"
          onSelectStage={(stageId) => {
            if (stageId === 'blast_radius') navigate(`/events/${id}/blast-radius`);
            if (stageId === 'plan') navigate(`/events/${id}/plan`);
            if (stageId === 'decision') navigate(`/events/${id}/decision`);
          }}
        />
      </div>

      {/* Gate G3 Banner */}
      {!gateG3.passed && (
        <div className="results-gate-container">
          <GateBanner
            gateId="G3"
            gateName="Evidence Review"
            blockingCount={gateG3.blockingCount || 1}
            message={gateG3.blockingReason || 'Review evaluation evidence'}
            actionText={gateG3.actionText || 'Proceed to Decision'}
            onActionClick={() => navigate(`/events/${id}/decision`)}
          />
        </div>
      )}


      {/* Item-Level Deterioration Tracker Banner (Sept 2026 TestMu AI Benchmark) */}
      <div className="item-deterioration-banner">
        <div className="idb-top">
          <div className="idb-title-wrap">
            <AlertOctagon size={18} className="idb-alert-icon" />
            <div className="idb-title-group">
              <span className="idb-title">Item-Level Deterioration Tracking (September 2026 Research Benchmark)</span>
              <span className="idb-subtext">
                Headline benchmark accuracy rose by <strong>+3.2%</strong> (91.4% → 94.6%) — <em>aggregate gains routinely mask item-level regressions</em>
              </span>
            </div>
          </div>
          <span className="idb-policy-badge">
            <ShieldCheck size={13} /> ZERO CRITICAL DEGRADATIONS POLICY ENFORCED
          </span>
        </div>

        <div className="idb-metrics-grid">
          <div className="idb-metric-card">
            <span className="idb-card-label">Total Test Items</span>
            <span className="idb-card-val">134 Items</span>
            <span className="idb-card-sub">Executed scope</span>
          </div>
          <div className="idb-metric-card">
            <span className="idb-card-label">Maintained Pass</span>
            <span className="idb-card-val text-emerald">118 Items (88%)</span>
            <span className="idb-card-sub">Zero drift</span>
          </div>
          <div className="idb-metric-card">
            <span className="idb-card-label">Improved Items</span>
            <span className="idb-card-val text-cyan">15 Items (+11%)</span>
            <span className="idb-card-sub">Faster / higher semantic</span>
          </div>
          <div className="idb-metric-card critical-alert">
            <span className="idb-card-label">Critical Deterioration</span>
            <span className="idb-card-val text-rose font-bold">1 Seeded Defect</span>
            <span className="idb-card-sub text-rose-sub">DEFECT-008: Tool Inversion on APP-05</span>
          </div>
          <div className="idb-metric-card verdict-card">
            <span className="idb-card-label">Kernel Safety Gate</span>
            <span className="idb-verdict-tag blocked">
              <XCircle size={14} /> BLOCKED BY KERNEL
            </span>
            <span className="idb-card-sub">Hard Stop K-014 triggered</span>
          </div>
        </div>
      </div>

      {/* 12-Column Main Heatmap Section */}
      <div className="results-heatmap-section">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Differential Evaluation Matrix</h2>
            <p className="section-desc">
              Deterministic checks run first and can block on their own. Probabilistic judges run second and never override a deterministic failure.
            </p>
          </div>
          <div className="heatmap-guide-hint">
            <span>Click any cell to inspect differential traces & evaluator verdicts</span>
          </div>
        </div>

        <HeatmapGrid
          results={evaluationResults}
          selectedWorkloadId={selectedWorkloadId}
          selectedDimension={selectedDimension}
          onSelectCell={handleSelectCell}
        />
      </div>

      {/* Bottom Split Section: Case Comparison (8 cols) + Judges & Manifest (4 cols) */}
      <div className="results-inspection-grid">
        {/* Left (8 cols): Trajectory Timeline or Diff Viewer */}
        <div className="inspection-main-col">
          <div className="inspection-card">
            <div className="inspection-card-header">
              <div className="inspection-case-meta">
                <span className="case-eyebrow">DIFFERENTIAL CASE INSPECTION</span>
                <h3 className="case-title">{activeCase.title}</h3>
              </div>
            </div>

            <div className="inspection-card-body">
              {activeCase.isTrajectory ? (
                /* Trajectory Timeline for Refund Agent */
                <TrajectoryTimeline
                  currentSteps={activeCase.currentTrajectory || []}
                  candidateSteps={activeCase.candidateTrajectory || []}
                  skippedNote={activeCase.skippedStep}
                  isDeterministicFail={activeCase.isDeterministicFail}
                />
              ) : (
                /* Differential Text Diff Viewer for Semantic / Schema */
                <DiffViewer
                  currentText={activeCase.currentResponse || ''}
                  candidateText={activeCase.candidateResponse || ''}
                  explanation={activeCase.explanation}
                  verdictNote={activeCase.verdictNote}
                />
              )}
            </div>

          </div>
        </div>

        {/* Right (4 cols): Evaluator Judges & Manifest */}
        <div className="inspection-side-col">
          {/* Card 1: Judges Panel */}
          <div className="side-card">
            <div className="side-card-header">
              <Scale size={16} className="side-icon text-brand" />
              <h3 className="side-card-title">Evaluator Judges</h3>
            </div>

            <div className="side-card-body">
              {activeCell?.judgeAgreement ? (
                <div className="judge-disagreement-box">
                  <div className="disagreement-banner">
                    <AlertTriangle size={15} />
                    <span>Judges Disagree (2 bands)</span>
                  </div>
                  <p className="disagreement-desc">
                    {activeCell.judgeAgreement.notes}
                  </p>
                  <div className="judge-scores-strip">
                    <div className="score-item">
                      <span className="score-label">Judge A (Llama-3-70B)</span>
                      <span className="score-val pass">
                        {activeCell.judgeAgreement.judgeA.toFixed(2)}
                      </span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">Judge B (Mistral-Large)</span>
                      <span className="score-val warn">
                        {activeCell.judgeAgreement.judgeB.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="disagreement-drawer-btn"
                    onClick={handleOpenJudgeDrawer}
                  >
                    Why judges disagree (O1 Drawer)...
                  </button>
                </div>
              ) : (
                <div className="judge-consensus-box">
                  <div className="consensus-banner">
                    <CheckCircle size={15} className="text-pass" />
                    <span>Evaluator Consensus Achieved</span>
                  </div>
                  <p className="consensus-desc">
                    Deterministic checkers and dual semantic judges verified invariant conformance with &gt; 94% agreement.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Run Manifest */}
          <div className="side-card">
            <div className="side-card-header">
              <Hash size={16} className="side-icon" />
              <h3 className="side-card-title">Run Manifest</h3>
            </div>

            <div className="side-card-body">
              <div className="manifest-fields-list">
                <div className="manifest-field-row">
                  <span className="m-field-name">Current baseline:</span>
                  <span className="m-field-val">{runManifest.currentModel}</span>
                </div>
                <div className="manifest-field-row">
                  <span className="m-field-name">Candidate model:</span>
                  <span className="m-field-val">{runManifest.candidateModel}</span>
                </div>
                <div className="manifest-field-row">
                  <span className="m-field-name">Random seed:</span>
                  <code className="m-field-code">{runManifest.seed}</code>
                </div>
                <div className="manifest-field-row">
                  <span className="m-field-name">Total tests run:</span>
                  <span className="m-field-val">{runManifest.testsRun} of {runManifest.testsTotal}</span>
                </div>
                <div className="manifest-field-row">
                  <span className="m-field-name">SHA-256 seal:</span>
                  <code className="m-field-hash" title={runManifest.hash}>
                    {runManifest.hash.substring(0, 18)}...
                  </code>
                </div>
              </div>

              <div className="manifest-replay-note">
                <Sparkles size={13} />
                <span>Deterministic replay guaranteed by isolated sandbox.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Drawer Overlay (O1) */}
      <EvidenceDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        data={drawerData}
      />
    </div>
  );
};
