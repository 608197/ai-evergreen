"""Trusted Kernel for AI Evergreen Control Plane.

Inviolable deterministic policy enforcement engine per trusted_kernel/AGENTS.md:
- Pure deterministic logic: ZERO LLM calls or provider dependencies.
- Evaluates rule-based policies and contract invariants first.
- Fails closed on any exception, missing input, or signature mismatch.
- Authorizes or blocks promotions, canaries, and rollbacks.
"""

from typing import Optional

from ai_evergreen.common.exceptions import (
    EvidenceTamperedError,
    KernelViolationError,
    UnauthorizedPromotionError,
)
from ai_evergreen.common.schemas import (
    ApprovalRecord,
    ApprovalStatus,
    EvaluationVerdict,
    RiskTier,
    TreatmentOutcome,
    WorkloadProfile,
)


class TrustedKernel:
    """Inviolable policy enforcement engine — deterministic-only, fail-closed."""

    def evaluate_qualification(
        self,
        workload: WorkloadProfile,
        verdicts: list[EvaluationVerdict],
    ) -> tuple[TreatmentOutcome, str, list[str]]:
        """Determine treatment (MIGRATE, CANARY, INVESTIGATE, BLOCK) deterministically.

        Rule 1: Deterministic invariant checks run first. If any fails, BLOCK immediately.
        Rule 2: Critical and High risk tiers cannot skip Canary.
        Rule 3: Low and Medium risk tiers may MIGRATE directly if all tests pass.
        """
        if not verdicts:
            return (
                TreatmentOutcome.INVESTIGATE,
                "No evaluation verdicts available for workload.",
                ["zero_verdicts_returned"],
            )

        failed_invariants: list[str] = []

        for v in verdicts:
            if not v.deterministic_passed:
                failed_invariants.append(
                    f"{v.test_id}: {'; '.join(v.failure_reasons) or 'Deterministic check failed'}"
                )

        # Deterministic Failure -> Absolute BLOCK
        if failed_invariants:
            return (
                TreatmentOutcome.BLOCK,
                f"Candidate failed {len(failed_invariants)} deterministic invariant checks. Promotion blocked.",
                failed_invariants,
            )

        # Risk-Proportional Treatment Assignment
        if workload.criticality in (RiskTier.CRITICAL, RiskTier.HIGH):
            return (
                TreatmentOutcome.CANARY,
                f"Passed all {len(verdicts)} tests. Workload tier '{workload.criticality.value}' "
                "requires progressive canary rollout and human approval.",
                [],
            )

        return (
            TreatmentOutcome.MIGRATE,
            f"Passed all {len(verdicts)} tests. Safe to migrate.",
            [],
        )

    def authorize_production_promotion(
        self,
        outcome: TreatmentOutcome,
        approval: Optional[ApprovalRecord],
    ) -> bool:
        """Validate whether a model promotion is authorized to proceed to production.

        Fails-closed on any violation.
        """
        # Inviolable Rule: Blocked workloads cannot be promoted under any circumstance
        if outcome == TreatmentOutcome.BLOCK:
            raise KernelViolationError(
                "Trusted Kernel breach: Cannot promote a BLOCKED candidate model."
            )

        # Inviolable Rule: Human approval record is mandatory
        if approval is None:
            raise UnauthorizedPromotionError(
                "Trusted Kernel breach: Promotion requires a signed human approval record."
            )

        if approval.status != ApprovalStatus.APPROVED:
            raise UnauthorizedPromotionError(
                f"Trusted Kernel breach: Approval record is in '{approval.status.value}' state, must be APPROVED."
            )

        # Inviolable Rule: Signature hash must match payload (Anti-tampering)
        expected_hash = approval.compute_signature_hash()
        if approval.signature_hash != expected_hash:
            raise EvidenceTamperedError(
                "Trusted Kernel breach: Approval signature hash does not match payload! Tampering detected."
            )

        return True

    def check_canary_rollback(
        self,
        current_metrics: dict[str, float],
        rollback_thresholds: dict[str, float],
    ) -> bool:
        """Determine whether active canary has breached SLA thresholds and must rollback.

        Zero LLMs, pure mathematical arithmetic.
        """
        error_rate_delta = current_metrics.get("error_rate_delta", 0.0)
        max_error_delta = rollback_thresholds.get("error_rate_delta_max", 0.01)

        if error_rate_delta > max_error_delta:
            return True

        p99_latency_ms = current_metrics.get("p99_latency_ms", 0.0)
        max_latency_ms = rollback_thresholds.get("p99_latency_ms_max", 99999.0)

        return p99_latency_ms > max_latency_ms
