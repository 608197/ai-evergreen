"""Shared pytest fixtures for AI Evergreen Control Plane tests."""

from datetime import datetime, timezone

import pytest

from ai_evergreen.common.schemas import (
    ApprovalRecord,
    ApprovalStatus,
    BehaviouralContract,
    ChangeEvent,
    ChangeType,
    EvidenceClass,
    RiskTier,
    WorkloadEnvironment,
    WorkloadProfile,
)


@pytest.fixture
def sample_change_event() -> ChangeEvent:
    """Fixture returning a standard model deprecation ChangeEvent."""
    return ChangeEvent(
        event_id="evt-2026-001",
        source="aws_bedrock_runtime",
        model_or_component_id="anthropic.claude-3-haiku",
        current_version="20240307-v1:0",
        candidate_version="20241022-v1:0",
        change_type=ChangeType.MODEL_DEPRECATION,
        detected_at=datetime(2026, 10, 10, 10, 0, 0, tzinfo=timezone.utc),
        confidence=1.0,
        correlation_id="corr-test-12345",
    )


@pytest.fixture
def sample_behavioural_contract() -> BehaviouralContract:
    """Fixture returning a tier-1 customer-facing agent behavioural contract."""
    return BehaviouralContract(
        intended_purpose="Customer autonomous refund processing up to $100.",
        approved_model_role="autonomous_agent",
        system_prompt_version="v2.4.1",
        allowed_inputs=["customer_id", "order_id", "refund_reason", "amount"],
        allowed_outputs=["status", "approval_code", "reason"],
        required_schemas=["RefundResponseSchemaV2"],
        allowed_tools=["lookup_order", "process_refund_ledger", "issue_receipt"],
        prohibited_tools=["delete_customer", "grant_store_credit_unlimited"],
        policy_invariants=[
            "Refund amount must never exceed $100 without human manager sign-off.",
            "Must always verify customer order exists before initiating ledger transaction.",
        ],
        required_evidence=[EvidenceClass.RUNTIME_OBSERVED.value],
        business_outcome="Reduce tier-1 support ticket resolution time.",
        latency_threshold_ms=1500.0,
        token_cost_ceiling_usd=0.015,
        safety_requirements=["zero_pii_in_receipt_logs", "no_prompt_injection_bypass"],
        refusal_requirements=["must_refuse_unauthorized_override_tokens"],
        human_approval_requirement=True,
        critical_test_set=[
            "test_refund_ceiling_invariant",
            "test_unauthorized_ledger_call_blocked",
        ],
        shadow_canary_requirement=True,
        rollback_thresholds={"error_rate_delta_max": 0.005, "p99_latency_ms_max": 2000.0},
        residual_risk_owner="payment_ops_lead@enterprise.com",
    )


@pytest.fixture
def sample_workload_profile(sample_behavioural_contract: BehaviouralContract) -> WorkloadProfile:
    """Fixture returning a critical workload profile."""
    return WorkloadProfile(
        application_id="app-refund-agent",
        name="Autonomous Refund Agent",
        business_process_id="bp-order-management",
        owner="payments_engineering@enterprise.com",
        criticality=RiskTier.CRITICAL,
        environment=WorkloadEnvironment.PRODUCTION,
        active_model_id="anthropic.claude-3-haiku-20240307-v1:0",
        contract=sample_behavioural_contract,
    )


@pytest.fixture
def sample_approval_record() -> ApprovalRecord:
    """Fixture returning a valid human approval record."""
    record = ApprovalRecord(
        approval_id="appr-2026-001",
        recommendation_id="rec-2026-001",
        workload_id="app-refund-agent",
        candidate_model_id="anthropic.claude-3-5-haiku-20241022-v1:0",
        approver_email="chief_risk_officer@enterprise.com",
        approver_role="Chief Risk Officer",
        status=ApprovalStatus.APPROVED,
        decision_rationale="Passed all deterministic invariant checks; 5% canary approved.",
        signed_at=datetime(2026, 10, 10, 11, 0, 0, tzinfo=timezone.utc),
        correlation_id="corr-test-12345",
    )
    record.signature_hash = record.compute_signature_hash()
    return record
