"""Recommendation Engine for AI Evergreen Control Plane.

Consults the Trusted Kernel to formulate immutable treatment recommendations
and seals the complete evaluation evidence into tamper-evident packages.
"""

import uuid
from datetime import datetime, timezone

from ai_evergreen.common.schemas import (
    EvaluationVerdict,
    EvidencePackage,
    RecommendationRecord,
    TreatmentOutcome,
    WorkloadProfile,
)
from ai_evergreen.trusted_kernel.kernel import TrustedKernel


class RecommendationEngine:
    """Formulates qualification recommendations and seals evidence packages."""

    def __init__(self, kernel: TrustedKernel) -> None:
        self.kernel = kernel

    def generate_recommendation(
        self,
        event_id: str,
        workload: WorkloadProfile,
        verdicts: list[EvaluationVerdict],
        candidate_model_id: str,
        correlation_id: str,
    ) -> tuple[RecommendationRecord, EvidencePackage]:
        """Query Trusted Kernel and produce recommendation plus sealed evidence package."""
        treatment, rationale, failed_invariants = self.kernel.evaluate_qualification(
            workload=workload,
            verdicts=verdicts,
        )

        canary_pct = 5 if treatment == TreatmentOutcome.CANARY else None
        rec_id = f"rec-{uuid.uuid4().hex[:8]}"

        rec = RecommendationRecord(
            recommendation_id=rec_id,
            event_id=event_id,
            workload_id=workload.application_id,
            candidate_model_id=candidate_model_id,
            treatment=treatment,
            confidence=1.0 if not failed_invariants else 0.2,
            rationale=rationale,
            deterministic_passed=(len(failed_invariants) == 0),
            failed_invariants=failed_invariants,
            canary_percentage=canary_pct,
            correlation_id=correlation_id,
            created_at=datetime.now(timezone.utc),
        )

        package = EvidencePackage(
            package_id=f"pkg-{uuid.uuid4().hex[:8]}",
            event_id=event_id,
            workload_id=workload.application_id,
            baseline_model_id=workload.active_model_id,
            candidate_model_id=candidate_model_id,
            treatment=treatment,
            evaluation_verdicts=verdicts,
            approval_record=None,
            correlation_id=correlation_id,
            created_at=datetime.now(timezone.utc),
        )
        package.seal_package()

        return rec, package
