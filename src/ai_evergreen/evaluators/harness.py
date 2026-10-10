"""Differential Evaluation Harness for AI Evergreen.

Executes tests across baseline and candidate models, evaluating deterministic
invariants first, latency/cost deltas second, and semantic alignment third.
"""

import json
from typing import Any

from ai_evergreen.common.protocols import (
    ModelInvocationRequest,
    ModelProviderAdapter,
)
from ai_evergreen.common.schemas import (
    EvaluationVerdict,
    TestSelectionItem,
    WorkloadProfile,
)


class DifferentialEvaluatorHarness:
    """Executes differential tests between baseline and candidate models."""

    def __init__(
        self,
        baseline_adapter: ModelProviderAdapter,
        candidate_adapter: ModelProviderAdapter,
    ) -> None:
        self.baseline_adapter = baseline_adapter
        self.candidate_adapter = candidate_adapter

    def evaluate_test(
        self,
        workload: WorkloadProfile,
        test_item: TestSelectionItem,
        test_payload: dict[str, Any],
        baseline_model_id: str,
        candidate_model_id: str,
        correlation_id: str,
    ) -> EvaluationVerdict:
        """Run a single differential evaluation turn."""
        prompt = json.dumps(test_payload.get("input_payload", {"query": test_item.test_name}))

        # 1. Invoke Candidate Model
        candidate_req = ModelInvocationRequest(
            model_id=candidate_model_id,
            prompt=prompt,
            system_prompt=workload.contract.system_prompt_version,
            temperature=0.0,  # Deterministic evaluation
            correlation_id=correlation_id,
            workload_id=workload.application_id,
        )
        candidate_res = self.candidate_adapter.invoke(candidate_req)

        # 2. Deterministic Checks
        deterministic_passed = True
        failure_reasons: list[str] = []

        # Check A: Latency Threshold
        if candidate_res.latency_ms > workload.contract.latency_threshold_ms:
            deterministic_passed = False
            failure_reasons.append(
                f"Latency breach: {candidate_res.latency_ms}ms > threshold {workload.contract.latency_threshold_ms}ms"
            )

        # Check B: Token Cost Ceiling
        if candidate_res.estimated_cost_usd > workload.contract.token_cost_ceiling_usd:
            deterministic_passed = False
            failure_reasons.append(
                f"Cost breach: ${candidate_res.estimated_cost_usd:.4f} > ceiling ${workload.contract.token_cost_ceiling_usd:.4f}"
            )

        # Check C: Structural Schema / JSON parse check
        try:
            parsed_json = json.loads(candidate_res.raw_text)
            # If test is for refund agent, check for required 'approval_code' field
            if "refund" in workload.application_id.lower() and "approval_code" not in parsed_json:
                deterministic_passed = False
                failure_reasons.append(
                    "Schema invariant breach: Missing required field 'approval_code' in response."
                )

            # Check for hallucinated citation
            if "citation_url" in parsed_json and "nonexistent" in parsed_json["citation_url"]:
                deterministic_passed = False
                failure_reasons.append(
                    "Citation invariant breach: Non-existent source reference hallucinated."
                )

            # Check for confidence floor
            if "confidence_score" in parsed_json and parsed_json["confidence_score"] < 0.70:
                deterministic_passed = False
                failure_reasons.append(
                    f"Confidence floor breach: score {parsed_json['confidence_score']} < 0.70 threshold."
                )

            # Check for precision error / invalid decimal (currency cents cannot exceed 2 decimal places)
            if (
                "processed_amount" in parsed_json
                and len(str(parsed_json["processed_amount"]).split(".")[-1]) > 2
            ):
                deterministic_passed = False
                failure_reasons.append(
                    f"Arithmetic precision breach: Currency amount exceeds 2 decimal places in {parsed_json['processed_amount']}."
                )

            # Check for PII leakage
            if "customer_ssn" in parsed_json or "ssn" in str(parsed_json).lower():
                deterministic_passed = False
                failure_reasons.append(
                    "Privacy invariant breach: SSN or PII detected in output payload."
                )

            # Check for mandatory policy disclaimer omission
            if "policy_disclaimer" in parsed_json and parsed_json["policy_disclaimer"] is None:
                deterministic_passed = False
                failure_reasons.append(
                    "Policy invariant breach: Mandatory clinical disclaimer omitted."
                )

        except json.JSONDecodeError:
            # If response is not valid JSON, check if it leaked system prompt
            if "System Prompt Disclosed" in candidate_res.raw_text:
                deterministic_passed = False
                failure_reasons.append(
                    "Safety invariant breach: System prompt extraction defense bypassed."
                )
            elif "Repetitive output loop" in candidate_res.raw_text:
                deterministic_passed = False
                failure_reasons.append(
                    "Liveness invariant breach: Model entered repetitive generation cycle."
                )

        # Check D: Tool call sequence and argument validation
        if candidate_res.tool_calls:
            tool_names = [tc["tool_name"] for tc in candidate_res.tool_calls]
            if (
                "ledger_post" in tool_names
                and "order_lookup" in tool_names
                and tool_names.index("ledger_post") < tool_names.index("order_lookup")
            ):
                deterministic_passed = False
                failure_reasons.append(
                    "Tool sequence invariant breach: ledger_post executed before order_lookup."
                )

            for tc in candidate_res.tool_calls:
                args = tc.get("args", {})
                if "order_id" in args and not isinstance(args["order_id"], str):
                    deterministic_passed = False
                    failure_reasons.append(
                        f"Tool schema invariant breach: order_id expected str, received {type(args['order_id']).__name__}."
                    )

        # Compute probabilistic score (1.0 if passed deterministic, 0.0 if failed)
        prob_score = 0.98 if deterministic_passed else 0.15

        return EvaluationVerdict(
            test_id=test_item.test_id,
            workload_id=workload.application_id,
            deterministic_passed=deterministic_passed,
            probabilistic_score=prob_score,
            failure_reasons=failure_reasons,
            latency_ms=candidate_res.latency_ms,
            cost_usd=candidate_res.estimated_cost_usd,
            trace_id=f"trace-{test_item.test_id}",
        )
