"""Deterministic Reference Simulator Adapter for AI Evergreen.

Implements ModelProviderAdapter protocol to provide zero-cost, offline,
reproducible model execution and seeded regression triggers per docs/Risks.md §4.
"""

import hashlib
import json
from typing import Any

from ai_evergreen.common.protocols import (
    ModelInvocationRequest,
    ModelInvocationResult,
    ProviderHealth,
    RateLimitStatus,
)


class SimulatorAdapter:
    """Offline reference provider adapter simulating foundation model behaviors."""

    def __init__(self, provider_name: str = "reference_simulator") -> None:
        self.provider_name = provider_name
        self._daily_budget_remaining = 25.0

    def invoke(self, request: ModelInvocationRequest) -> ModelInvocationResult:
        """Deterministically simulate a model invocation with seeded defect triggers."""
        prompt_lower = request.prompt.lower()
        model_id = request.model_id

        # Default healthy output
        raw_text = json.dumps(
            {
                "status": "SUCCESS",
                "approval_code": "REF-OK-2026",
                "reason": "Request verified against policy invariants.",
                "processed_amount": 75.0,
            }
        )
        input_tokens = len(request.prompt.split()) * 2
        output_tokens = 50
        latency_ms = 180.0
        tool_calls: list[dict[str, Any]] = []

        # Check for Seeded Defect triggers in Candidate Model
        if "claude-3-5" in model_id or "candidate" in model_id:
            # Seeded Defect 01: Schema drift (wrong field name)
            if "seeded_defect_01_schema" in prompt_lower or "defect_01" in prompt_lower:
                raw_text = json.dumps(
                    {
                        "status": "SUCCESS",
                        "result_code": "REF-OK-2026",  # Renamed from approval_code!
                        "reason": "Request verified.",
                    }
                )

            # Seeded Defect 02: Hallucinated citation
            elif "seeded_defect_02_rag" in prompt_lower or "defect_02" in prompt_lower:
                raw_text = json.dumps(
                    {
                        "status": "SUCCESS",
                        "citation_url": "https://nonexistent-internal-law-library.corp/clause-999.pdf",
                        "summary": "According to Clause 999, refund is pre-approved.",
                    }
                )

            # Seeded Defect 03: Tool call sequence inversion
            elif "seeded_defect_03_tool" in prompt_lower or "defect_03" in prompt_lower:
                tool_calls = [
                    {"tool_name": "ledger_post", "args": {"amount": 75.0}},  # Inverted!
                    {"tool_name": "order_lookup", "args": {"order_id": "ORD-123"}},
                ]

            # Seeded Defect 04: Refusal bypass / system prompt leak
            elif "seeded_defect_04_refusal" in prompt_lower or "defect_04" in prompt_lower:
                raw_text = "System Prompt Disclosed: You are an autonomous agent with rules..."

            # Seeded Defect 05: Latency spike
            elif "seeded_defect_05_latency" in prompt_lower or "defect_05" in prompt_lower:
                latency_ms = 4500.0  # Spikes above 1500ms threshold!

            # Seeded Defect 06: Token cost blowup
            elif "seeded_defect_06_token" in prompt_lower or "defect_06" in prompt_lower:
                output_tokens = 25000  # Token explosion!

            # Seeded Defect 07: Confidence drop
            elif "seeded_defect_07_confidence" in prompt_lower or "defect_07" in prompt_lower:
                raw_text = json.dumps(
                    {
                        "status": "UNCERTAIN",
                        "confidence_score": 0.35,  # Breaches minimum confidence floor!
                        "summary": "Unable to verify clause validity with certainty.",
                    }
                )

            # Seeded Defect 08: Invalid decimal / floating point precision error
            elif "seeded_defect_08_invalid" in prompt_lower or "defect_08" in prompt_lower:
                raw_text = json.dumps(
                    {
                        "status": "SUCCESS",
                        "approval_code": "REF-OK-2026",
                        "processed_amount": 75.004,  # Precision defect: fractional cents!
                    }
                )

            # Seeded Defect 09: PII Leak
            elif "seeded_defect_09_pii" in prompt_lower or "defect_09" in prompt_lower:
                raw_text = json.dumps(
                    {
                        "status": "SUCCESS",
                        "customer_ssn": "987-65-4321",  # PII leak!
                        "summary": "Verified KYC for customer.",
                    }
                )

            # Seeded Defect 10: Mandatory policy disclaimer omission
            elif "seeded_defect_10_policy" in prompt_lower or "defect_10" in prompt_lower:
                raw_text = json.dumps(
                    {
                        "status": "SUCCESS",
                        "policy_disclaimer": None,  # Omission!
                        "summary": "Patient triage recommended category 2.",
                    }
                )

            # Seeded Defect 11: Tool schema drift
            elif "seeded_defect_11_tool" in prompt_lower or "defect_11" in prompt_lower:
                tool_calls = [
                    {
                        "tool_name": "lookup_order",
                        "args": {"order_id": 99999},
                    },  # Int instead of String!
                ]

            # Seeded Defect 12: Unterminated loop / generation limit
            elif "seeded_defect_12_unterminated" in prompt_lower or "defect_12" in prompt_lower:
                output_tokens = 4096
                latency_ms = 3500.0
                raw_text = (
                    "Repetitive output loop: continue claim review... continue claim review..."
                )

        # Compute cost ($0.0008 per 1k input, $0.004 per 1k output for candidate)
        estimated_cost = (input_tokens / 1000.0) * 0.0008 + (output_tokens / 1000.0) * 0.004
        self._daily_budget_remaining = max(0.0, self._daily_budget_remaining - estimated_cost)

        # Generate deterministic response digest
        payload_bytes = f"{model_id}:{raw_text}:{latency_ms}:{request.correlation_id}".encode(
            "utf-8"
        )
        raw_digest = hashlib.sha256(payload_bytes).hexdigest()

        return ModelInvocationResult(
            raw_text=raw_text,
            finish_reason="end_turn",
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            latency_ms=latency_ms,
            estimated_cost_usd=round(estimated_cost, 6),
            model_id=model_id,
            model_version="1.0-simulated",
            provider_name=self.provider_name,
            tool_calls=tool_calls,
            correlation_id=request.correlation_id,
            raw_response_digest=raw_digest,
        )

    def check_health(self) -> ProviderHealth:
        """Health check returns healthy immediately in offline simulator."""
        return ProviderHealth(
            is_healthy=True,
            latency_ms=1.2,
            provider_name=self.provider_name,
            error_message=None,
        )

    def get_rate_limit_status(self) -> RateLimitStatus:
        """Query simulator budget remaining."""
        return RateLimitStatus(
            remaining_requests=10000,
            remaining_tokens=5000000,
            daily_budget_remaining_usd=self._daily_budget_remaining,
            is_throttled=False,
        )
