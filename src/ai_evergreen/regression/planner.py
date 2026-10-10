"""Adaptive Regression Planner for AI Evergreen.

Scopes regression suites proportionally to workload risk and change blast radius.
Enforces zero critical test exclusion and attaches machine-readable rationales
to all excluded tests per AGENTS.md Principle 8.
"""

import uuid
from typing import Any

from ai_evergreen.common.schemas import (
    AdaptiveRegressionPlan,
    BlastRadiusHypothesis,
    ExclusionReasonCode,
    TestSelectionItem,
)


class AdaptiveRegressionPlanner:
    """Plans proportional regression test suites with machine-readable exclusion rationales."""

    def plan_regression(
        self,
        hypothesis: BlastRadiusHypothesis,
        test_catalog: list[dict[str, Any]],
    ) -> AdaptiveRegressionPlan:
        """Generate deterministic, explainable regression plan for affected workloads."""
        affected_app_ids = {app.application_id for app in hypothesis.affected_workloads}
        selected_items: list[TestSelectionItem] = []

        included_count = 0
        excluded_count = 0
        critical_count = 0
        estimated_cost = 0.0
        estimated_duration = 0.0

        for test in test_catalog:
            test_id = test["test_id"]
            workload_id = test["workload_id"]
            name = test.get("name", test_id)
            is_critical = bool(test.get("is_critical", False))
            is_redundant = bool(test.get("redundant_with"))

            # Rule 1: Is the workload even affected?
            if workload_id not in affected_app_ids:
                selected_items.append(
                    TestSelectionItem(
                        test_id=test_id,
                        workload_id=workload_id,
                        test_name=name,
                        is_included=False,
                        is_critical_invariant=False,
                        exclusion_reason_code=ExclusionReasonCode.OUT_OF_AFFECTED_SCOPE,
                        exclusion_rationale=f"Application '{workload_id}' is outside the calculated blast radius.",
                    )
                )
                excluded_count += 1
                continue

            # Rule 2: Critical Invariant tests must ALWAYS be included (Zero exclusion permitted)
            if is_critical:
                selected_items.append(
                    TestSelectionItem(
                        test_id=test_id,
                        workload_id=workload_id,
                        test_name=name,
                        is_included=True,
                        is_critical_invariant=True,
                        exclusion_reason_code=None,
                        exclusion_rationale=None,
                    )
                )
                included_count += 1
                critical_count += 1
                estimated_cost += 0.002
                estimated_duration += 1.5
                continue

            # Rule 3: Redundant / Duplicate tests can be excluded with machine-readable reason
            if is_redundant:
                primary_test = test.get("redundant_with")
                selected_items.append(
                    TestSelectionItem(
                        test_id=test_id,
                        workload_id=workload_id,
                        test_name=name,
                        is_included=False,
                        is_critical_invariant=False,
                        exclusion_reason_code=ExclusionReasonCode.REDUNDANT_WITH_CRITICAL_PACK,
                        exclusion_rationale=f"Functionality covered by primary test '{primary_test}'.",
                    )
                )
                excluded_count += 1
                continue

            # Standard functional test for affected app — include
            selected_items.append(
                TestSelectionItem(
                    test_id=test_id,
                    workload_id=workload_id,
                    test_name=name,
                    is_included=True,
                    is_critical_invariant=False,
                    exclusion_reason_code=None,
                    exclusion_rationale=None,
                )
            )
            included_count += 1
            estimated_cost += 0.001
            estimated_duration += 0.8

        return AdaptiveRegressionPlan(
            plan_id=f"plan-{uuid.uuid4().hex[:8]}",
            event_id=hypothesis.event_id,
            selected_tests=selected_items,
            total_tests_available=len(test_catalog),
            included_test_count=included_count,
            excluded_test_count=excluded_count,
            critical_tests_included_count=critical_count,
            estimated_cost_usd=round(estimated_cost, 4),
            estimated_duration_seconds=round(estimated_duration, 1),
            correlation_id=hypothesis.correlation_id,
        )
