"""Deterministic synthetic enterprise estate generator for AI Evergreen.

Generates a fully reproducible enterprise estate per docs/Schema.md §5:
- 12 Applications across 4 risk tiers (Critical, High, Medium, Low)
- 5 Specialized Agents with explicit Behavioural Contracts
- 2-3 Foundation Models (Baseline, Candidate, Simulator)
- 120 Test Assets (including critical invariants, duplicates, and seeded regressions)
- 10 Historical Incidents
- Seeded Regressions per docs/Risks.md §4
"""

import argparse
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Optional

from ai_evergreen.common.schemas import (
    BehaviouralContract,
    EvidenceClass,
    RiskTier,
    WorkloadEnvironment,
    WorkloadProfile,
)


def generate_synthetic_estate(
    seed: int = 20261010, generated_at: Optional[datetime] = None
) -> dict[str, Any]:
    """Generate a deterministic, byte-identical enterprise estate."""
    gen_time = generated_at or (
        datetime(2026, 10, 10, 0, 0, 0, tzinfo=timezone.utc) + timedelta(seconds=seed % 86400)
    )

    # 1. Models
    models = [
        {
            "model_id": "anthropic.claude-3-haiku-20240307-v1:0",
            "provider": "aws_bedrock",
            "name": "Claude 3 Haiku",
            "status": "active_baseline",
            "context_window": 200000,
            "cost_per_1k_input_usd": 0.00025,
            "cost_per_1k_output_usd": 0.00125,
        },
        {
            "model_id": "anthropic.claude-3-5-haiku-20241022-v1:0",
            "provider": "aws_bedrock",
            "name": "Claude 3.5 Haiku",
            "status": "upgrade_candidate",
            "context_window": 200000,
            "cost_per_1k_input_usd": 0.0008,
            "cost_per_1k_output_usd": 0.004,
        },
        {
            "model_id": "simulator.deterministic-v1",
            "provider": "simulator",
            "name": "Deterministic Reference Simulator",
            "status": "reference",
            "context_window": 128000,
            "cost_per_1k_input_usd": 0.0,
            "cost_per_1k_output_usd": 0.0,
        },
    ]

    # 2. 12 Applications
    app_specs = [
        # Critical Tier (Financial, Clinical, Compliance Autonomy)
        (
            "app-refund-agent",
            "Autonomous Refund Agent",
            "bp-order-mgmt",
            "payments@client.com",
            RiskTier.CRITICAL,
            1200.0,
            0.015,
        ),
        (
            "app-medical-triage",
            "Patient Triage Assistant",
            "bp-clinical-ops",
            "safety@client.com",
            RiskTier.CRITICAL,
            1000.0,
            0.020,
        ),
        (
            "app-kyc-aml-screener",
            "AML & Sanctions Screener",
            "bp-compliance",
            "compliance@client.com",
            RiskTier.CRITICAL,
            1500.0,
            0.018,
        ),
        # High Tier (Legal, Insurance, Contract Decisions)
        (
            "app-claims-adjuster",
            "Automated Claims Adjuster",
            "bp-insurance-claims",
            "claims@client.com",
            RiskTier.HIGH,
            2000.0,
            0.025,
        ),
        (
            "app-contract-analyzer",
            "Contract Clause Analyzer",
            "bp-legal-review",
            "legal@client.com",
            RiskTier.HIGH,
            3000.0,
            0.035,
        ),
        # Medium Tier (Internal Operations, HR, Engineering)
        (
            "app-hr-benefits-bot",
            "HR Benefits Assistant",
            "bp-human-resources",
            "hr-ops@client.com",
            RiskTier.MEDIUM,
            1800.0,
            0.010,
        ),
        (
            "app-it-service-desk",
            "IT Support Desk Helper",
            "bp-it-services",
            "it-support@client.com",
            RiskTier.MEDIUM,
            1200.0,
            0.008,
        ),
        (
            "app-code-review-bot",
            "Pull Request Review Assistant",
            "bp-engineering",
            "eng-ops@client.com",
            RiskTier.MEDIUM,
            2500.0,
            0.020,
        ),
        # Low Tier (Drafting, Internal Search, Summaries)
        (
            "app-meeting-summarizer",
            "Meeting Transcript Summarizer",
            "bp-knowledge-mgmt",
            "collab@client.com",
            RiskTier.LOW,
            4000.0,
            0.012,
        ),
        (
            "app-marketing-copywriter",
            "Marketing Copy Drafter",
            "bp-marketing",
            "content@client.com",
            RiskTier.LOW,
            3500.0,
            0.015,
        ),
        (
            "app-knowledge-faq",
            "Internal Knowledge Base Bot",
            "bp-knowledge-mgmt",
            "info@client.com",
            RiskTier.LOW,
            2000.0,
            0.005,
        ),
        (
            "app-release-notes-gen",
            "Release Notes Generator",
            "bp-product-ops",
            "pm@client.com",
            RiskTier.LOW,
            3000.0,
            0.010,
        ),
    ]

    applications: list[dict[str, Any]] = []
    for app_id, name, bp_id, owner, tier, latency, cost in app_specs:
        contract = BehaviouralContract(
            intended_purpose=f"Automate tasks for {name} within established enterprise boundaries.",
            approved_model_role="task_executor"
            if tier in (RiskTier.LOW, RiskTier.MEDIUM)
            else "autonomous_agent",
            system_prompt_version="v2.1.0",
            allowed_inputs=["user_query", "context_documents", "account_id"],
            allowed_outputs=["response", "status", "metadata"],
            required_schemas=[f"{name.replace(' ', '')}SchemaV1"],
            allowed_tools=["db_query", "knowledge_search"]
            if tier != RiskTier.CRITICAL
            else ["db_query", "ledger_txn", "verify_identity"],
            prohibited_tools=["drop_table", "grant_admin_access", "unlimited_credit"],
            policy_invariants=[
                f"Policy #{i + 1}: Output must strictly adhere to enterprise safety standards for {tier.value} tier."
                for i in range(2)
            ],
            required_evidence=[
                EvidenceClass.RUNTIME_OBSERVED.value,
                EvidenceClass.CONFIGURATION_DECLARED.value,
            ],
            business_outcome=f"Deliver verified service for {name}.",
            latency_threshold_ms=latency,
            token_cost_ceiling_usd=cost,
            safety_requirements=["no_pii_leakage", "prompt_injection_containment"],
            refusal_requirements=["refuse_system_prompt_extraction"],
            human_approval_requirement=(tier in (RiskTier.CRITICAL, RiskTier.HIGH)),
            critical_test_set=[
                f"test_{app_id.replace('-', '_')}_invariant_01",
                f"test_{app_id.replace('-', '_')}_invariant_02",
            ],
            shadow_canary_requirement=(tier in (RiskTier.CRITICAL, RiskTier.HIGH)),
            rollback_thresholds={
                "error_rate_delta_max": 0.005 if tier == RiskTier.CRITICAL else 0.02
            },
            residual_risk_owner=owner,
        )

        profile = WorkloadProfile(
            application_id=app_id,
            name=name,
            business_process_id=bp_id,
            owner=owner,
            criticality=tier,
            environment=WorkloadEnvironment.PRODUCTION,
            active_model_id="anthropic.claude-3-haiku-20240307-v1:0",
            contract=contract,
        )
        applications.append(profile.model_dump())

    # 3. 5 Specialized Agents
    agents = [
        {
            "agent_id": "agent-refund-specialist",
            "app_id": "app-refund-agent",
            "type": "react_agent",
            "tools": ["order_lookup", "ledger_post"],
        },
        {
            "agent_id": "agent-clinical-triage",
            "app_id": "app-medical-triage",
            "type": "plan_and_execute",
            "tools": ["vitals_check", "doctor_paging"],
        },
        {
            "agent_id": "agent-compliance-checker",
            "app_id": "app-kyc-aml-screener",
            "type": "deterministic_screener",
            "tools": ["ofac_lookup", "pep_check"],
        },
        {
            "agent_id": "agent-claims-evaluator",
            "app_id": "app-claims-adjuster",
            "type": "hierarchical_agent",
            "tools": ["policy_coverage", "fraud_score"],
        },
        {
            "agent_id": "agent-contract-auditor",
            "app_id": "app-contract-analyzer",
            "type": "doc_rag_agent",
            "tools": ["pdf_extractor", "clause_diff"],
        },
    ]

    # 4. 120 Test Assets (including Critical Invariants, Seeded Regressions, and Duplicates)
    tests: list[dict[str, Any]] = []
    test_id_counter = 1

    for app in applications:
        app_id = app["application_id"]
        # Add 2 Critical Invariant Tests per app (24 critical tests)
        for i in range(1, 3):
            tests.append(
                {
                    "test_id": f"test_{app_id.replace('-', '_')}_invariant_{i:02d}",
                    "workload_id": app_id,
                    "name": f"Critical Invariant #{i} for {app['name']}",
                    "category": "CRITICAL_INVARIANT",
                    "is_critical": True,
                    "assertion_type": "deterministic_schema_and_value",
                    "seeded_defect": None,
                    "input_payload": {"test_case": f"invariant_{i}_check", "seed": seed},
                }
            )
            test_id_counter += 1

        # Add 6 Standard Functional / Regression Tests per app (72 tests)
        for j in range(1, 7):
            tests.append(
                {
                    "test_id": f"test_{app_id.replace('-', '_')}_func_{j:02d}",
                    "workload_id": app_id,
                    "name": f"Functional Regression #{j} for {app['name']}",
                    "category": "FUNCTIONAL_REGRESSION",
                    "is_critical": False,
                    "assertion_type": "behavioral_rubric",
                    "seeded_defect": None,
                    "input_payload": {"test_case": f"functional_scenario_{j}"},
                }
            )
            test_id_counter += 1

    # Add 12 Duplicate / Redundant Tests (Tests designed to verify planner deduplication)
    for k in range(1, 13):
        target_app = applications[k % len(applications)]["application_id"]
        tests.append(
            {
                "test_id": f"test_duplicate_{k:02d}",
                "workload_id": target_app,
                "name": "Duplicate Scenario (Redundant with func_01)",
                "category": "REDUNDANT_DUPLICATE",
                "is_critical": False,
                "assertion_type": "behavioral_rubric",
                "redundant_with": f"test_{target_app.replace('-', '_')}_func_01",
                "seeded_defect": None,
                "input_payload": {"test_case": "duplicate_check"},
            }
        )
        test_id_counter += 1

    # Add 12 Seeded Defect Regressions per docs/Risks.md §4 (120 total tests reached)
    seeded_defects = [
        (
            "SEEDED_DEFECT_01_SCHEMA",
            "Missing or renamed JSON field in candidate response",
            "app-refund-agent",
            True,
        ),
        (
            "SEEDED_DEFECT_02_RAG_HALLUCINATION",
            "Hallucinated citation URL / non-existent case law",
            "app-contract-analyzer",
            True,
        ),
        (
            "SEEDED_DEFECT_03_TOOL_INVERSION",
            "Tool call order reversed: ledger_post before order_lookup",
            "app-refund-agent",
            True,
        ),
        (
            "SEEDED_DEFECT_04_REFUSAL_BYPASS",
            "Model fulfills forbidden system prompt extraction prompt",
            "app-kyc-aml-screener",
            True,
        ),
        (
            "SEEDED_DEFECT_05_LATENCY_SPIKE",
            "Latency increases by 250% over baseline ceiling",
            "app-claims-adjuster",
            False,
        ),
        (
            "SEEDED_DEFECT_06_TOKEN_COST_BLOWUP",
            "Response token volume doubles due to excessive preamble",
            "app-medical-triage",
            False,
        ),
        (
            "SEEDED_DEFECT_07_CONFIDENCE_DROP",
            "Model hallucinated confidence score exceeding empirical evidence",
            "app-contract-analyzer",
            False,
        ),
        (
            "SEEDED_DEFECT_08_INVALID_DECIMAL",
            "Floating point rounding error in financial amount",
            "app-refund-agent",
            True,
        ),
        (
            "SEEDED_DEFECT_09_PII_LEAK",
            "Customer SSN leaked in verbose summary",
            "app-kyc-aml-screener",
            True,
        ),
        (
            "SEEDED_DEFECT_10_POLICY_OMISSION",
            "Mandatory disclaimer statement omitted from output",
            "app-medical-triage",
            True,
        ),
        (
            "SEEDED_DEFECT_11_TOOL_SCHEMA_DRIFT",
            "Passed string instead of integer to lookup_order",
            "app-refund-agent",
            True,
        ),
        (
            "SEEDED_DEFECT_12_UNTERMINATED_LOOP",
            "Model enters repetitive generation cycle before hitting max_tokens",
            "app-claims-adjuster",
            False,
        ),
    ]

    for code, description, app_id, is_crit in seeded_defects:
        tests.append(
            {
                "test_id": f"test_seeded_{code.lower()}",
                "workload_id": app_id,
                "name": f"Seeded Defect Test: {code}",
                "category": "SEEDED_DEFECT",
                "is_critical": is_crit,
                "assertion_type": "deterministic_invariant_check",
                "seeded_defect": {
                    "defect_code": code,
                    "description": description,
                    "target_model": "anthropic.claude-3-5-haiku-20241022-v1:0",
                },
                "input_payload": {"test_case": f"seeded_{code}"},
            }
        )

    # 5. 10 Historical Incidents
    incidents = [
        {
            "incident_id": f"inc-2025-{i:03d}",
            "title": f"Historical Model Drift Event #{i}",
            "affected_app": applications[i % len(applications)]["application_id"],
            "date": f"2025-{(i % 12) + 1:02d}-15",
            "resolved": True,
        }
        for i in range(1, 11)
    ]

    return {
        "metadata": {
            "generator": "AI Evergreen Synthetic Estate Generator",
            "generated_at": gen_time.isoformat(),
            "seed": seed,
            "counts": {
                "applications": len(applications),
                "agents": len(agents),
                "models": len(models),
                "tests": len(tests),
                "incidents": len(incidents),
                "critical_invariants": sum(1 for t in tests if t["is_critical"]),
                "seeded_defects": len(seeded_defects),
            },
        },
        "models": models,
        "applications": applications,
        "agents": agents,
        "tests": tests,
        "incidents": incidents,
    }


def main() -> None:
    """CLI entrypoint to generate and serialize the synthetic estate."""
    parser = argparse.ArgumentParser(
        description="Generate synthetic enterprise estate for AI Evergreen."
    )
    parser.add_argument(
        "--seed", type=int, default=20261010, help="Fixed random seed for reproducible generation."
    )
    parser.add_argument(
        "--output", type=str, default="data/synthetic/estate.json", help="Target output file path."
    )
    args = parser.parse_args()

    estate = generate_synthetic_estate(seed=args.seed)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(estate, f, indent=2)

    print(f"Successfully generated synthetic estate to {output_path}")
    print(f"Counts: {estate['metadata']['counts']}")


if __name__ == "__main__":
    main()
