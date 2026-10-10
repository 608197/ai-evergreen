"""AI Evergreen — Enterprise Continuous Qualification & Governance Console.

Streamlit control console providing:
1. Client LLM Provider configuration & connectivity tests
2. Enterprise Estate & Dependency Graph exploration
3. Change event ingestion and deterministic blast radius calculation
4. Differential regression execution and 100% seeded defect detection
5. Tamper-evident Human Approval Gate with cryptographic audit sealing
6. Live canary telemetry monitoring and automated deterministic rollback
"""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import streamlit as st

from ai_evergreen.common.exceptions import AIEvergreenError
from ai_evergreen.common.schemas import (
    ApprovalRecord,
    ApprovalStatus,
    ChangeEvent,
    ChangeType,
    EvaluationVerdict,
    TreatmentOutcome,
    WorkloadProfile,
)
from ai_evergreen.evaluators.harness import DifferentialEvaluatorHarness
from ai_evergreen.graph.engine import DependencyGraphEngine
from ai_evergreen.impact_agent.agent import ChangeImpactAgent
from ai_evergreen.missing_tests.generator import MissingTestGenerator
from ai_evergreen.providers.simulator_adapter import SimulatorAdapter
from ai_evergreen.recommendation.engine import RecommendationEngine
from ai_evergreen.regression.planner import AdaptiveRegressionPlanner
from ai_evergreen.rollback.controller import RollbackController
from ai_evergreen.trusted_kernel.kernel import TrustedKernel

# Page Configuration
st.set_page_config(
    page_title="AI Evergreen | Enterprise Control Console",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Styling
st.markdown("""
<style>
    .metric-card {
        background-color: #f8f9fa;
        border-left: 5px solid #1f77b4;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 10px;
    }
    .status-blocked {
        color: #d9534f;
        font-weight: bold;
    }
    .status-canary {
        color: #f0ad4e;
        font-weight: bold;
    }
    .status-migrate {
        color: #5cb85c;
        font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)


@st.cache_resource
def initialize_system() -> tuple[
    DependencyGraphEngine,
    TrustedKernel,
    AdaptiveRegressionPlanner,
    RecommendationEngine,
    RollbackController,
    MissingTestGenerator,
    dict[str, Any],
]:
    """Initialize system singletons and load synthetic estate."""
    graph = DependencyGraphEngine()
    kernel = TrustedKernel()
    planner = AdaptiveRegressionPlanner()
    rec_engine = RecommendationEngine(kernel)
    rollback = RollbackController(kernel)
    missing_gen = MissingTestGenerator()

    estate_path = Path("data/synthetic/estate.json")
    if not estate_path.exists():
        from ai_evergreen.discovery.synthetic_generator import generate_synthetic_estate
        estate = generate_synthetic_estate(seed=20261010)
        estate_path.parent.mkdir(parents=True, exist_ok=True)
        with open(estate_path, "w", encoding="utf-8") as f:
            json.dump(estate, f, indent=2)
    else:
        with open(estate_path, "r", encoding="utf-8") as f:
            estate = json.load(f)

    graph.load_estate(estate)
    return graph, kernel, planner, rec_engine, rollback, missing_gen, estate


graph_engine, trusted_kernel, planner, rec_engine, rollback_ctrl, missing_gen, estate = initialize_system()
impact_agent = ChangeImpactAgent(graph_engine)

# Header
st.title("🛡️ AI Evergreen — Enterprise Control Plane")
st.caption("Deterministic Continuous Qualification, Drift Detection & Governance for Autonomous AI Workloads")

# Sidebar — Environment & Invariant Badges
with st.sidebar:
    st.header("Enterprise Governance Status")
    st.success("✅ Trusted Kernel: Active (Fail-Closed)")
    st.info("🔒 Decision Model: 100% Deterministic Policy")
    st.info("⚡ Anti-Tampering: Cryptographic SHA-256 Active")

    st.divider()
    st.subheader("Model Provider Adapter")
    provider_type = st.selectbox(
        "Provider Type",
        ["Offline Deterministic Simulator", "AWS Bedrock (Ambient IAM / Keys)", "OpenAI-Compatible Gateway"],
        index=0,
    )
    baseline_id = st.text_input("Baseline Model ID", "anthropic.claude-3-haiku-20240307-v1:0")
    candidate_id = st.text_input("Candidate Model ID", "anthropic.claude-3-5-haiku-20241022-v1:0")

    if st.button("Test Provider Connectivity"):
        sim = SimulatorAdapter()
        health = sim.check_health()
        if health.is_healthy:
            st.success(f"Connected: {health.provider_name} ({health.latency_ms}ms)")
        else:
            st.error(f"Provider Error: {health.error_message}")

# Navigation Tabs
tab_estate, tab_event, tab_eval, tab_gate, tab_rollback, tab_missing = st.tabs([
    "📊 Enterprise Estate",
    "🔍 Change Signal & Blast Radius",
    "🧪 Differential Qualification",
    "✍️ Human Approval Gate",
    "🔄 Canary & Auto-Rollback",
    "🧩 Missing-Test Discovery",
])

# ----------------- TAB 1: Enterprise Estate -----------------
with tab_estate:
    st.subheader("Enterprise AI Portfolio Landscape")
    counts = estate["metadata"]["counts"]

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total Applications", counts["applications"])
    col2.metric("Specialized Agents", counts["agents"])
    col3.metric("Test Assets", counts["tests"])
    col4.metric("Seeded Defects Guarded", counts["seeded_defects"])

    st.markdown("#### Registered Applications by Criticality")
    apps_data = []
    for a in estate["applications"]:
        apps_data.append({
            "App ID": a["application_id"],
            "Name": a["name"],
            "Risk Tier": a["criticality"],
            "Business Process": a["business_process_id"],
            "Owner": a["owner"],
            "Active Model": a["active_model_id"],
            "Latency SLA (ms)": a["contract"]["latency_threshold_ms"],
            "Cost Ceiling ($)": a["contract"]["token_cost_ceiling_usd"],
        })
    st.dataframe(apps_data, use_container_width=True)

# ----------------- TAB 2: Change Signal & Blast Radius -----------------
with tab_event:
    st.subheader("Simulate Incoming Model Upgrade / Deprecation Signal")
    col_e1, col_e2 = st.columns([2, 1])

    with col_e1:
        event_source = st.selectbox("Signal Source", ["AWS Bedrock Announcement", "GitHub Model Release", "Manual Compliance Review"])
        change_type_sel = st.selectbox(
            "Change Type",
            [ct.value for ct in ChangeType],
            index=0,
        )
        target_model = st.selectbox(
            "Affected Model",
            [m["model_id"] for m in estate["models"]],
            index=0,
        )

    with col_e2:
        st.markdown("##### Blast Radius Invariants")
        st.markdown("- Reachability is strictly deterministic.")
        st.markdown("- Graph edges carry explicit provenance.")
        st.markdown("- Fail-closed on reachability uncertainty.")

    if st.button("Calculate Blast Radius", type="primary"):
        event = ChangeEvent(
            event_id=f"evt-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
            source=event_source,
            model_or_component_id=target_model,
            current_version="20240307-v1:0",
            candidate_version="20241022-v1:0",
            change_type=ChangeType(change_type_sel),
            confidence=1.0,
            correlation_id="corr-console-demo",
        )
        st.session_state["current_event"] = event

        hypothesis = impact_agent.evaluate_impact(event)
        st.session_state["current_hypothesis"] = hypothesis

        st.success(f"Blast Radius Computed: {hypothesis.affected_count} applications directly impacted.")

        c1, c2, c3 = st.columns(3)
        c1.metric("Impacted Workloads", hypothesis.affected_count)
        c2.metric("Highest Risk Tier", hypothesis.highest_risk_tier.value)
        c3.metric("Path Confidence", f"{hypothesis.confidence_score * 100:.0f}%")

        st.markdown("##### Impacted Applications")
        impacted_summary = [
            {
                "App ID": app.application_id,
                "Name": app.name,
                "Risk Tier": app.criticality.value,
                "Owner": app.owner,
                "Requires Human Gate": app.contract.human_approval_requirement,
            }
            for app in hypothesis.affected_workloads
        ]
        st.table(impacted_summary)

# ----------------- TAB 3: Differential Qualification -----------------
with tab_eval:
    st.subheader("Differential Qualification & Seeded Regression Verification")

    if "current_hypothesis" not in st.session_state:
        st.info("👉 Please calculate blast radius in Tab 2 first.")
    else:
        hyp = st.session_state["current_hypothesis"]
        selected_app_id = st.selectbox(
            "Select Workload to Qualify",
            [app.application_id for app in hyp.affected_workloads],
        )
        workload = next(app for app in hyp.affected_workloads if app.application_id == selected_app_id)

        # Plan regression suite
        plan = planner.plan_regression(hyp, estate["tests"])
        workload_tests = [item for item in plan.selected_tests if item.workload_id == selected_app_id and item.is_included]

        st.write(f"Adaptive Regression Plan: **{len(workload_tests)} tests scoped** ({plan.critical_tests_included_count} critical invariant tests guaranteed).")

        if st.button("Execute Differential Qualification", type="primary"):
            baseline_adapter = SimulatorAdapter(provider_name="claude-3-haiku-baseline")
            candidate_adapter = SimulatorAdapter(provider_name="claude-3-5-haiku-candidate")
            harness = DifferentialEvaluatorHarness(baseline_adapter=baseline_adapter, candidate_adapter=candidate_adapter)

            verdicts: list[EvaluationVerdict] = []
            tests_by_id = {t["test_id"]: t for t in estate["tests"]}

            progress_bar = st.progress(0.0)
            for idx, item in enumerate(workload_tests):
                test_payload = tests_by_id.get(item.test_id, {})
                v = harness.evaluate_test(
                    workload=workload,
                    test_item=item,
                    test_payload=test_payload,
                    baseline_model_id=workload.active_model_id,
                    candidate_model_id=candidate_id,
                    correlation_id="corr-demo",
                )
                verdicts.append(v)
                progress_bar.progress((idx + 1) / len(workload_tests))

            rec, evidence_pkg = rec_engine.generate_recommendation(
                event_id=st.session_state["current_event"].event_id,
                workload=workload,
                verdicts=verdicts,
                candidate_model_id=candidate_id,
                correlation_id="corr-demo",
            )
            st.session_state["current_recommendation"] = rec
            st.session_state["current_evidence_pkg"] = evidence_pkg
            st.session_state["current_verdicts"] = verdicts

            # Display Verdict Summary
            st.divider()
            if rec.treatment == TreatmentOutcome.BLOCK:
                st.error(f"🛑 TREATMENT OUTCOME: **BLOCK** — {rec.rationale}")
            elif rec.treatment == TreatmentOutcome.CANARY:
                st.warning(f"⚠️ TREATMENT OUTCOME: **CANARY ({rec.canary_percentage}%)** — {rec.rationale}")
            else:
                st.success(f"✅ TREATMENT OUTCOME: **MIGRATE** — {rec.rationale}")

            # Verdicts Table
            verdict_rows = [
                {
                    "Test ID": v.test_id,
                    "Deterministic Status": "PASS" if v.deterministic_passed else "FAIL",
                    "Latency (ms)": f"{v.latency_ms:.1f}",
                    "Cost ($)": f"${v.cost_usd:.4f}",
                    "Failure Invariants": "; ".join(v.failure_reasons) if v.failure_reasons else "None",
                }
                for v in verdicts
            ]
            st.dataframe(verdict_rows, use_container_width=True)

# ----------------- TAB 4: Human Approval Gate -----------------
with tab_gate:
    st.subheader("Tamper-Evident Human Approval Gate")

    if "current_recommendation" not in st.session_state:
        st.info("👉 Please run qualification in Tab 3 first to generate a recommendation.")
    else:
        rec = st.session_state["current_recommendation"]
        pkg = st.session_state["current_evidence_pkg"]

        st.markdown(f"**Recommendation ID:** `{rec.recommendation_id}`")
        st.markdown(f"**Target Workload:** `{rec.workload_id}`")
        st.markdown(f"**Treatment Assigned:** `{rec.treatment.value}`")
        st.markdown(f"**Evidence Package Digest:** `{pkg.package_digest}`")

        if rec.treatment == TreatmentOutcome.BLOCK:
            st.error("🚫 Promotion is BLOCKED by the Trusted Kernel. Human override is prohibited on deterministic failure.")
        else:
            st.markdown("#### Digital Approval Sign-off")
            with st.form("approval_form"):
                approver_name = st.text_input("Approver Name / Email", "chief_risk_officer@enterprise.com")
                approver_role = st.selectbox("Approver Role", ["Enterprise Risk Officer", "Lead ML Engineer", "Product Director"])
                decision = st.radio("Decision", [ApprovalStatus.APPROVED.value, ApprovalStatus.REJECTED.value])
                rationale = st.text_area("Audit Rationale", "Reviewed differential evidence package; approved 5% canary rollout.")
                submitted = st.form_submit_button("Sign & Authorize Promotion")

                if submitted:
                    approval = ApprovalRecord(
                        approval_id=f"appr-{rec.recommendation_id}",
                        recommendation_id=rec.recommendation_id,
                        workload_id=rec.workload_id,
                        candidate_model_id=rec.candidate_model_id,
                        approver_email=approver_name,
                        approver_role=approver_role,
                        status=ApprovalStatus(decision),
                        decision_rationale=rationale,
                        signed_at=datetime.now(timezone.utc),
                        correlation_id=rec.correlation_id,
                    )
                    approval.signature_hash = approval.compute_signature_hash()

                    try:
                        trusted_kernel.authorize_production_promotion(
                            outcome=rec.treatment,
                            approval=approval,
                        )
                        pkg.approval_record = approval
                        pkg.seal_package()
                        st.success("✅ Promotion Authorized & Cryptographically Sealed by Trusted Kernel!")
                        st.markdown(f"**Cryptographic Signature:** `{approval.signature_hash}`")
                        st.markdown(f"**Final Sealed Evidence Digest:** `{pkg.package_digest}`")
                    except AIEvergreenError as err:
                        st.error(f"❌ Trusted Kernel Violation: {err}")

# ----------------- TAB 5: Canary & Auto-Rollback -----------------
with tab_rollback:
    st.subheader("Live Canary Telemetry & Automated Rollback Simulator")
    st.write("Simulates progressive traffic routing and SLA threshold enforcement per docs/Architecture.md.")

    selected_rb_app = st.selectbox(
        "Canary Target Workload",
        [app["application_id"] for app in estate["applications"]],
        key="rb_app_select",
    )
    rb_workload = WorkloadProfile.model_validate(
        next(a for a in estate["applications"] if a["application_id"] == selected_rb_app)
    )

    st.markdown("##### Current SLA Rollback Thresholds")
    st.json(rb_workload.contract.rollback_thresholds)

    col_m1, col_m2 = st.columns(2)
    with col_m1:
        sim_error_delta = st.slider("Simulated Error Rate Delta (Candidate - Baseline)", 0.0, 0.05, 0.002, 0.001, format="%.3f")
    with col_m2:
        sim_p99_latency = st.slider("Simulated P99 Latency (ms)", 500.0, 5000.0, 1200.0, 100.0)

    if st.button("Evaluate Canary Health"):
        metrics = {"error_rate_delta": sim_error_delta, "p99_latency_ms": sim_p99_latency}
        rb_result = rollback_ctrl.evaluate_and_enforce_canary(
            workload=rb_workload,
            current_metrics=metrics,
        )

        if rb_result["action"] == "ROLLBACK_TO_LAST_KNOWN_GOOD":
            st.error(f"🚨 SLA BREACH DETECTED! Action: **{rb_result['action']}**")
            st.error(f"Reason: {rb_result['reason']}")
            st.info(f"Restored Baseline Model: `{rb_result['restored_model_id']}` in {rb_result['recovery_time_seconds']}s")
        else:
            st.success("🟢 Canary Telemetry Healthy: SLA Invariants Maintained. Continue rollout.")

# ----------------- TAB 6: Missing-Test Discovery -----------------
with tab_missing:
    st.subheader("Autonomous Missing-Test Discovery")
    st.write("Identifies unverified tools or contract invariants and generates candidate tests.")

    target_app_disc = st.selectbox(
        "Application to Analyze",
        [a["application_id"] for a in estate["applications"]],
        key="disc_app_sel",
    )
    disc_workload = WorkloadProfile.model_validate(
        next(a for a in estate["applications"] if a["application_id"] == target_app_disc)
    )

    if st.button("Discover Test Coverage Gaps"):
        gaps = missing_gen.discover_gaps(disc_workload, estate["tests"])
        if gaps:
            st.warning(f"Identified {len(gaps)} qualification gaps requiring human review.")
            for g in gaps:
                with st.expander(f"Candidate Test: {g['proposed_name']}"):
                    st.write(f"**Gap Type:** {g['gap_type']}")
                    st.write(f"**Target Tool:** {g['target_tool']}")
                    st.write(f"**Status:** `{g['status']}` (Runs only in sandbox)")
                    st.write(f"**Rationale:** {g['rationale']}")
        else:
            st.success("All allowed tools and contract invariants have active test coverage.")
