"""Unit tests for Adaptive Regression Planner."""

import json
from pathlib import Path

import pytest

from ai_evergreen.common.schemas import (
    BlastRadiusHypothesis,
    ExclusionReasonCode,
    RiskTier,
    WorkloadProfile,
)
from ai_evergreen.regression.planner import AdaptiveRegressionPlanner


@pytest.fixture
def test_catalog() -> list[dict]:
    estate_file = Path("data/synthetic/estate.json")
    with open(estate_file, "r", encoding="utf-8") as f:
        estate_data = json.load(f)
    return estate_data["tests"]


@pytest.fixture
def affected_workloads() -> list[WorkloadProfile]:
    estate_file = Path("data/synthetic/estate.json")
    with open(estate_file, "r", encoding="utf-8") as f:
        estate_data = json.load(f)
    # Only pick 1 affected workload: app-refund-agent
    return [
        WorkloadProfile.model_validate(app)
        for app in estate_data["applications"]
        if app["application_id"] == "app-refund-agent"
    ]


def test_planner_includes_100_percent_of_critical_tests(
    test_catalog: list[dict], affected_workloads: list[WorkloadProfile]
) -> None:
    """Inviolable rule: All critical invariant tests for affected apps must be included."""
    planner = AdaptiveRegressionPlanner()
    hypothesis = BlastRadiusHypothesis(
        event_id="evt-test",
        affected_workloads=affected_workloads,
        affected_count=1,
        highest_risk_tier=RiskTier.CRITICAL,
        confidence_score=1.0,
        correlation_id="corr-test",
    )

    plan = planner.plan_regression(hypothesis, test_catalog)

    # All critical tests for app-refund-agent must be included
    refund_critical_tests = [
        t for t in test_catalog if t["workload_id"] == "app-refund-agent" and t["is_critical"]
    ]
    assert len(refund_critical_tests) > 0

    plan_items = {item.test_id: item for item in plan.selected_tests}
    for crit in refund_critical_tests:
        item = plan_items[crit["test_id"]]
        assert item.is_included is True, (
            f"Critical test '{crit['test_id']}' was improperly excluded!"
        )


def test_planner_excludes_unaffected_workloads_with_reason(
    test_catalog: list[dict], affected_workloads: list[WorkloadProfile]
) -> None:
    """Out-of-scope tests must be excluded with OUT_OF_AFFECTED_SCOPE reason code."""
    planner = AdaptiveRegressionPlanner()
    hypothesis = BlastRadiusHypothesis(
        event_id="evt-test",
        affected_workloads=affected_workloads,
        affected_count=1,
        highest_risk_tier=RiskTier.CRITICAL,
        confidence_score=1.0,
        correlation_id="corr-test",
    )

    plan = planner.plan_regression(hypothesis, test_catalog)

    medical_tests = [
        item for item in plan.selected_tests if item.workload_id == "app-medical-triage"
    ]
    assert len(medical_tests) > 0
    for item in medical_tests:
        assert item.is_included is False
        assert item.exclusion_reason_code == ExclusionReasonCode.OUT_OF_AFFECTED_SCOPE
        assert "outside the calculated blast radius" in item.exclusion_rationale
