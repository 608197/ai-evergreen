"""End-to-end integration tests for the complete AI Evergreen qualification lifecycle.

Tests the full 6-phase loop:
1. Signal Ingestion & Deduplication
2. Blast Radius Calculation
3. Adaptive Regression Scoping
4. Differential Evaluation
5. Trusted Kernel Policy Determination
6. Tamper-Evident Evidence Package Sealing
7. Automated Canary Telemetry & Fail-Safe Rollback
"""

import json
from datetime import datetime, timezone
from pathlib import Path

import pytest

from ai_evergreen.change_signal.monitor import ChangeSignalMonitor
from ai_evergreen.common.exceptions import (
    KernelViolationError,
)
from ai_evergreen.common.schemas import (
    ApprovalRecord,
    ApprovalStatus,
    RiskTier,
    TreatmentOutcome,
    WorkloadProfile,
)
from ai_evergreen.evaluators.harness import DifferentialEvaluatorHarness
from ai_evergreen.graph.engine import DependencyGraphEngine
from ai_evergreen.impact_agent.agent import ChangeImpactAgent
from ai_evergreen.providers.simulator_adapter import SimulatorAdapter
from ai_evergreen.recommendation.engine import RecommendationEngine
from ai_evergreen.regression.planner import AdaptiveRegressionPlanner
from ai_evergreen.rollback.controller import RollbackController
from ai_evergreen.trusted_kernel.kernel import TrustedKernel


@pytest.fixture
def estate_data() -> dict:
    estate_file = Path("data/synthetic/estate.json")
    with open(estate_file, "r", encoding="utf-8") as f:
        return json.load(f)


def test_full_end_to_end_qualification_and_governance_lifecycle(estate_data: dict) -> None:
    """Execute complete deterministic pipeline end-to-end."""
    # 1. Initialize Core Engine Components
    graph = DependencyGraphEngine()
    graph.load_estate(estate_data)
    monitor = ChangeSignalMonitor()
    impact = ChangeImpactAgent(graph)
    planner = AdaptiveRegressionPlanner()
    kernel = TrustedKernel()
    rec_engine = RecommendationEngine(kernel)
    rollback = RollbackController(kernel)

    baseline_adapter = SimulatorAdapter(provider_name="claude-3-haiku-baseline")
    candidate_adapter = SimulatorAdapter(provider_name="claude-3-5-haiku-candidate")
    harness = DifferentialEvaluatorHarness(
        baseline_adapter=baseline_adapter, candidate_adapter=candidate_adapter
    )

    # 2. Stage 1: Ingest Model Deprecation Signal
    raw_signal = {
        "source": "aws_bedrock_runtime",
        "model_or_component_id": "anthropic.claude-3-haiku-20240307-v1:0",
        "current_version": "20240307-v1:0",
        "candidate_version": "20241022-v1:0",
        "change_type": "MODEL_DEPRECATION",
    }
    event = monitor.ingest_raw_signal(source="aws_bedrock", payload=raw_signal)
    assert event is not None
    assert len(event.compute_dedup_hash()) == 64

    # 3. Stage 2: Calculate Deterministic Blast Radius
    hypothesis = impact.evaluate_impact(event)
    assert hypothesis.affected_count == 12
    assert hypothesis.highest_risk_tier == RiskTier.CRITICAL

    # 4. Stage 3: Scope Adaptive Regression Plan
    all_tests = estate_data["tests"]
    plan = planner.plan_regression(hypothesis, all_tests)
    assert plan.critical_tests_included_count > 0
    assert plan.included_test_count > 0

    # 5. Stage 4: Differential Qualification on Critical Workload: app-refund-agent
    refund_app = next(
        a for a in estate_data["applications"] if a["application_id"] == "app-refund-agent"
    )
    workload = WorkloadProfile.model_validate(refund_app)
    workload_tests = [
        item
        for item in plan.selected_tests
        if item.workload_id == workload.application_id and item.is_included
    ]

    tests_by_id = {t["test_id"]: t for t in all_tests}
    verdicts = []
    for item in workload_tests:
        test_payload = tests_by_id.get(item.test_id, {})
        verdict = harness.evaluate_test(
            workload=workload,
            test_item=item,
            test_payload=test_payload,
            baseline_model_id=workload.active_model_id,
            candidate_model_id="anthropic.claude-3-5-haiku-20241022-v1:0",
            correlation_id=event.event_id,
        )
        verdicts.append(verdict)

    # 6. Stage 5: Trusted Kernel Recommendation Generation
    recommendation, evidence_pkg = rec_engine.generate_recommendation(
        event_id=event.event_id,
        workload=workload,
        verdicts=verdicts,
        candidate_model_id="anthropic.claude-3-5-haiku-20241022-v1:0",
        correlation_id=event.event_id,
    )

    # For app-refund-agent, seeded defects (like schema or tool inversion) are present in the full estate tests
    # If any fail, treatment is BLOCK. If all pass, CANARY.
    has_deterministic_failure = any(not v.deterministic_passed for v in verdicts)
    if has_deterministic_failure:
        assert recommendation.treatment == TreatmentOutcome.BLOCK
    else:
        assert recommendation.treatment == TreatmentOutcome.CANARY

    # 7. Stage 6: Human Approval Gate & Cryptographic Sealing
    approval = ApprovalRecord(
        approval_id="appr-e2e-001",
        recommendation_id=recommendation.recommendation_id,
        workload_id=workload.application_id,
        candidate_model_id=recommendation.candidate_model_id,
        approver_email="chief_risk_officer@enterprise.com",
        approver_role="Enterprise Risk Officer",
        status=ApprovalStatus.APPROVED,
        decision_rationale="E2E test signoff.",
        signed_at=datetime.now(timezone.utc),
        correlation_id=event.event_id,
    )
    approval.signature_hash = approval.compute_signature_hash()

    if recommendation.treatment == TreatmentOutcome.BLOCK:
        with pytest.raises(KernelViolationError, match="Cannot promote a BLOCKED candidate model"):
            kernel.authorize_production_promotion(recommendation.treatment, approval)
    else:
        # Promotion allowed with signed approval
        kernel.authorize_production_promotion(recommendation.treatment, approval)
        evidence_pkg.approval_record = approval
        evidence_pkg.seal_package()
        assert len(evidence_pkg.package_digest) == 64

    # 8. Stage 7: Telemetry Breach & Automated Rollback
    breach_metrics = {"error_rate_delta": 0.015, "p99_latency_ms": 2500.0}
    rollback_result = rollback.evaluate_and_enforce_canary(workload, breach_metrics)
    assert rollback_result["action"] == "ROLLBACK_TO_LAST_KNOWN_GOOD"
    assert rollback_result["status"] == "RESTORED"
    assert rollback_result["restored_model_id"] == workload.active_model_id
