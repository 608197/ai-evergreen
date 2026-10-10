"""Tests validating 100% detection recall for all seeded regression defects.

Verifies PRD §10 acceptance criterion:
Critical Defect Detection Recall = 100% (zero tolerance for missed breakages).
"""

import json
from pathlib import Path

import pytest

from ai_evergreen.common.schemas import (
    TestSelectionItem,
    TreatmentOutcome,
    WorkloadProfile,
)
from ai_evergreen.evaluators.harness import DifferentialEvaluatorHarness
from ai_evergreen.providers.simulator_adapter import SimulatorAdapter
from ai_evergreen.trusted_kernel.kernel import TrustedKernel


from typing import Any, cast


@pytest.fixture
def estate_data() -> dict[str, Any]:
    estate_file = Path("data/synthetic/estate.json")
    with open(estate_file, "r", encoding="utf-8") as f:
        return cast(dict[str, Any], json.load(f))


@pytest.fixture
def evaluator_harness() -> DifferentialEvaluatorHarness:
    baseline = SimulatorAdapter(provider_name="claude-3-haiku-baseline")
    candidate = SimulatorAdapter(provider_name="claude-3-5-haiku-candidate")
    return DifferentialEvaluatorHarness(baseline_adapter=baseline, candidate_adapter=candidate)


@pytest.fixture
def kernel() -> TrustedKernel:
    return TrustedKernel()


def test_100_percent_seeded_defect_detection(
    estate_data: dict[str, Any],
    evaluator_harness: DifferentialEvaluatorHarness,
    kernel: TrustedKernel,
) -> None:
    """Verify that every single seeded defect in the estate is detected and blocked with 100% recall."""
    seeded_tests = [t for t in estate_data["tests"] if t.get("seeded_defect")]
    assert len(seeded_tests) >= 5, "Must test at least 5 seeded defect types."

    apps_by_id = {
        app["application_id"]: WorkloadProfile.model_validate(app)
        for app in estate_data["applications"]
    }

    detected_defects = 0
    blocked_outcomes = 0

    for test in seeded_tests:
        workload = apps_by_id[test["workload_id"]]
        item = TestSelectionItem(
            test_id=test["test_id"],
            workload_id=test["workload_id"],
            test_name=test["name"],
            is_included=True,
            is_critical_invariant=test["is_critical"],
        )

        verdict = evaluator_harness.evaluate_test(
            workload=workload,
            test_item=item,
            test_payload=test,
            baseline_model_id="anthropic.claude-3-haiku-20240307-v1:0",
            candidate_model_id="anthropic.claude-3-5-haiku-20241022-v1:0",
            correlation_id="corr-seeded-test",
        )

        # Assertion 1: Evaluation harness flags the defect
        if not verdict.deterministic_passed:
            detected_defects += 1

        # Assertion 2: Trusted Kernel blocks the workload
        treatment, _rationale, _failed_invariants = kernel.evaluate_qualification(
            workload=workload,
            verdicts=[verdict],
        )

        if treatment == TreatmentOutcome.BLOCK:
            blocked_outcomes += 1

    # PRD §10 Acceptance Gate: 100% Critical Defect Detection Recall
    assert detected_defects == len(seeded_tests), (
        f"Critical failure! Detected {detected_defects}/{len(seeded_tests)} seeded defects. "
        "Detection recall must be 100%!"
    )
    assert blocked_outcomes == len(seeded_tests), (
        f"Safety failure! Trusted Kernel blocked {blocked_outcomes}/{len(seeded_tests)} defect runs. "
        "Must be 100% fail-closed!"
    )
