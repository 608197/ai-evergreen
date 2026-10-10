"""Missing Test Candidate Generator for AI Evergreen.

Identifies behavioral gaps in test suites and synthesizes reviewable candidate tests.
Generated tests are strictly tagged candidate_pending_human_review per AGENTS.md.
"""

import uuid
from datetime import datetime, timezone
from typing import Any

from ai_evergreen.common.schemas import WorkloadProfile


class MissingTestGenerator:
    """Discovers test coverage gaps and synthesizes reviewable candidate tests."""

    def discover_gaps(
        self,
        workload: WorkloadProfile,
        existing_test_catalog: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """Identify contract invariants that lack dedicated test assertions."""
        app_id = workload.application_id
        existing_tests = [t for t in existing_test_catalog if t.get("workload_id") == app_id]

        gaps: list[dict[str, Any]] = []

        # Check: Does every allowed tool have at least one test?
        covered_tools: set[str] = set()
        for t in existing_tests:
            input_payload = t.get("input_payload", {})
            for tool in workload.contract.allowed_tools:
                if tool in str(input_payload):
                    covered_tools.add(tool)

        uncovered_tools = set(workload.contract.allowed_tools) - covered_tools
        for tool in uncovered_tools:
            gaps.append(
                {
                    "candidate_test_id": f"gen-test-{uuid.uuid4().hex[:8]}",
                    "workload_id": app_id,
                    "gap_type": "UNTESTED_TOOL_INVOCATION",
                    "target_tool": tool,
                    "proposed_name": f"Generated Candidate Test: Verify {tool} schema and permission",
                    "status": "candidate_pending_human_review",
                    "generated_at": datetime.now(timezone.utc).isoformat(),
                    "rationale": f"Tool '{tool}' is in allowed_tools but has no specific test case in the baseline suite.",
                }
            )

        return gaps
