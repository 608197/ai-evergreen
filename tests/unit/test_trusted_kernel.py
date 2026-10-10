"""Unit tests for Trusted Kernel policy engine."""

import pytest

from ai_evergreen.common.exceptions import (
    EvidenceTamperedError,
    UnauthorizedPromotionError,
)
from ai_evergreen.common.schemas import (
    ApprovalRecord,
    EvaluationVerdict,
    TreatmentOutcome,
    WorkloadProfile,
)
from ai_evergreen.trusted_kernel.kernel import TrustedKernel


@pytest.fixture
def kernel() -> TrustedKernel:
    return TrustedKernel()


def test_kernel_blocks_on_deterministic_failure(
    kernel: TrustedKernel, sample_workload_profile: WorkloadProfile
) -> None:
    """Inviolable rule: If any deterministic check fails, treatment is strictly BLOCK."""
    failed_verdict = EvaluationVerdict(
        test_id="test_schema",
        workload_id=sample_workload_profile.application_id,
        deterministic_passed=False,
        failure_reasons=["Missing approval_code in response."],
        latency_ms=100.0,
        cost_usd=0.001,
    )

    treatment, rationale, failed_invariants = kernel.evaluate_qualification(
        workload=sample_workload_profile,
        verdicts=[failed_verdict],
    )

    assert treatment == TreatmentOutcome.BLOCK
    assert len(failed_invariants) == 1
    assert "deterministic invariant checks" in rationale.lower()


def test_kernel_assigns_canary_for_critical_workload(
    kernel: TrustedKernel, sample_workload_profile: WorkloadProfile
) -> None:
    """Inviolable rule: Critical workload passing all checks must receive CANARY, not direct MIGRATE."""
    passed_verdict = EvaluationVerdict(
        test_id="test_schema",
        workload_id=sample_workload_profile.application_id,
        deterministic_passed=True,
        probabilistic_score=1.0,
        latency_ms=100.0,
        cost_usd=0.001,
    )

    treatment, rationale, failed_invariants = kernel.evaluate_qualification(
        workload=sample_workload_profile,
        verdicts=[passed_verdict],
    )

    assert treatment == TreatmentOutcome.CANARY
    assert len(failed_invariants) == 0
    assert "progressive canary rollout" in rationale.lower()


def test_kernel_fails_closed_without_human_approval(kernel: TrustedKernel) -> None:
    """Inviolable rule: Promoting without human approval record is unauthorized."""
    with pytest.raises(
        UnauthorizedPromotionError, match="Promotion requires a signed human approval record"
    ):
        kernel.authorize_production_promotion(
            outcome=TreatmentOutcome.CANARY,
            approval=None,
        )


def test_kernel_detects_tampered_approval_signature(
    kernel: TrustedKernel, sample_approval_record: ApprovalRecord
) -> None:
    """Anti-tampering: If approval record fields are altered after signing, kernel raises EvidenceTamperedError."""
    tampered_record = sample_approval_record.model_copy(
        update={"approver_email": "impostor@attacker.com"}  # Tampered email!
    )

    with pytest.raises(EvidenceTamperedError, match="signature hash does not match payload"):
        kernel.authorize_production_promotion(
            outcome=TreatmentOutcome.CANARY,
            approval=tampered_record,
        )


def test_kernel_evaluates_canary_rollback_threshold(kernel: TrustedKernel) -> None:
    """Arithmetic SLA evaluation: error rate above ceiling triggers rollback."""
    thresholds = {"error_rate_delta_max": 0.005}

    # Healthy metric
    assert kernel.check_canary_rollback({"error_rate_delta": 0.002}, thresholds) is False

    # Breached metric
    assert kernel.check_canary_rollback({"error_rate_delta": 0.012}, thresholds) is True
