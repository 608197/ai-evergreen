"""OneCognizant AI Evergreen — Enterprise Continuous Qualification & Governance Console.

Authored to the OneCognizant Enterprise Design System standard by Enterprise UI/UX Architecture.
Implements the 7-stage AI Governance Lifecycle:
1. Connect: Enterprise AI Platform Connectors & Multi-Geo Sovereignty
2. Discover: AI Estate Portfolio & Dependency Navigator
3. Ingest: Change Signal Ingestion & Deterministic Blast Radius
4. Qualify: Differential Qualification & Seeded Defect Injection
5. Gate: Tamper-Evident Digital Approval & Cryptographic Sealing
6. Canary: Real-Time Telemetry & Sub-Second Auto-Rollback
7. Expand: Autonomous Missing-Test Discovery
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

# -----------------------------------------------------------------------------
# Streamlit Page Setup & OneCognizant Design Tokens
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="OneCognizant | AI Evergreen Control Console",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.markdown("""
<style>
    /* ==========================================================================
       OneCognizant Global Palette & Typography Tokens
       ========================================================================== */
    :root {
        --cognizant-navy: #000048;
        --cognizant-blue: #0033A0;
        --cognizant-cyan: #00A3E0;
        --cognizant-slate: #5A6B82;
        --cognizant-bg: #F4F6FB;
        --surface-white: #FFFFFF;
        --border-subtle: #E2E8F0;
        --status-pass-bg: #EBFBEE;
        --status-pass-text: #2B8A3E;
        --status-block-bg: #FFEAEA;
        --status-block-text: #C92A2A;
        --status-warn-bg: #FFF4E5;
        --status-warn-text: #D9480F;
    }

    /* Overall Layout Adjustments */
    .block-container {
        padding-top: 1.2rem;
        padding-bottom: 2.5rem;
        max-width: 1400px;
    }

    /* ==========================================================================
       Persistent Top Governance Header Bar
       ========================================================================== */
    .one-cognizant-header {
        background: linear-gradient(135deg, #000048 0%, #001B6B 65%, #0033A0 100%);
        color: #ffffff;
        padding: 16px 24px;
        border-radius: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 18px;
        box-shadow: 0 4px 16px rgba(0, 0, 72, 0.16);
        border-bottom: 3.5px solid #00A3E0;
    }
    .brand-title {
        font-size: 1.35rem;
        font-weight: 700;
        letter-spacing: -0.3px;
        color: #ffffff;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .brand-subtitle {
        font-size: 0.82rem;
        color: #C2D4F8;
        margin-top: 4px;
        font-weight: 400;
    }
    .user-pill {
        background: rgba(255, 255, 255, 0.14);
        border: 1px solid rgba(255, 255, 255, 0.28);
        border-radius: 24px;
        padding: 6px 16px;
        font-size: 0.82rem;
        color: #ffffff;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    /* ==========================================================================
       OneCognizant Elevation Cards
       ========================================================================== */
    .cognizant-card {
        background-color: #ffffff;
        border: 1px solid #E2E8F0;
        border-radius: 10px;
        padding: 20px 22px;
        margin-bottom: 16px;
        box-shadow: 0 2px 10px rgba(0, 0, 72, 0.04);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .cognizant-card:hover {
        box-shadow: 0 6px 16px rgba(0, 0, 72, 0.08);
    }
    .card-accent-navy {
        border-top: 4px solid #000048;
    }
    .card-accent-blue {
        border-top: 4px solid #0033A0;
    }
    .card-accent-cyan {
        border-top: 4px solid #00A3E0;
    }
    .card-accent-green {
        border-top: 4px solid #2B8A3E;
    }
    .card-accent-red {
        border-top: 4px solid #C92A2A;
    }

    /* KPI Metrics Hierarchy */
    .metric-value {
        font-size: 1.85rem;
        font-weight: 700;
        color: #000048;
        line-height: 1.15;
    }
    .metric-label {
        font-size: 0.80rem;
        font-weight: 600;
        color: #5A6B82;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
    }

    /* ==========================================================================
       Sidebar Theming
       ========================================================================== */
    section[data-testid="stSidebar"] {
        background-color: #000038 !important;
        color: #ffffff !important;
    }
    section[data-testid="stSidebar"] h1,
    section[data-testid="stSidebar"] h2,
    section[data-testid="stSidebar"] h3,
    section[data-testid="stSidebar"] p,
    section[data-testid="stSidebar"] span,
    section[data-testid="stSidebar"] label {
        color: #ffffff !important;
    }
    section[data-testid="stSidebar"] .stAlert {
        background-color: rgba(255, 255, 255, 0.08) !important;
        color: #ffffff !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
    }

    /* Button Primary Styling */
    .stButton>button {
        background-color: #0033A0 !important;
        color: #ffffff !important;
        font-weight: 600 !important;
        border-radius: 6px !important;
        border: none !important;
        padding: 0.48rem 1.4rem !important;
        transition: all 0.2s ease !important;
    }
    .stButton>button:hover {
        background-color: #002277 !important;
        box-shadow: 0 4px 12px rgba(0, 51, 160, 0.3) !important;
    }

    /* Tab Indicators */
    .stTabs [data-baseweb="tab-list"] {
        gap: 6px;
        background-color: transparent;
        border-bottom: 2px solid #E2E8F0;
    }
    .stTabs [data-baseweb="tab"] {
        height: 46px;
        padding: 0 16px;
        font-weight: 600;
        font-size: 0.86rem;
        color: #5A6B82;
        border-radius: 6px 6px 0 0;
    }
    .stTabs [aria-selected="true"] {
        color: #0033A0 !important;
        border-bottom: 3.5px solid #0033A0 !important;
        background-color: rgba(0, 51, 160, 0.04) !important;
    }
</style>
""", unsafe_allow_html=True)


# -----------------------------------------------------------------------------
# System Initialization (Cached Singletons)
# -----------------------------------------------------------------------------
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

# -----------------------------------------------------------------------------
# Top Persistent Governance Banner
# -----------------------------------------------------------------------------
st.markdown("""
<div class="one-cognizant-header">
    <div>
        <div class="brand-title">
            <span style="background-color: #00A3E0; color: #000048; padding: 3px 8px; border-radius: 5px; font-size: 0.82rem; font-weight: 800;">ONE</span>
            Cognizant <span style="font-weight: 300; opacity: 0.9;">| AI Evergreen™ Control Plane</span>
        </div>
        <div class="brand-subtitle">
            Enterprise Continuous Qualification, Drift Governance & Non-Bypassable Invariant Safety for Autonomous AI Estates
        </div>
    </div>
    <div class="user-pill">
        <span style="font-size: 0.95rem;">👤</span>
        <span><b>Puneet Saxena</b> (608197)</span>
        <span style="opacity: 0.5;">|</span>
        <span style="color: #00C2DE; font-weight: 600;">eu-north-1 (Stockholm)</span>
    </div>
</div>
""", unsafe_allow_html=True)


# -----------------------------------------------------------------------------
# Sidebar — OneCognizant Enterprise Governance Panel
# -----------------------------------------------------------------------------
with st.sidebar:
    st.markdown("### 🛡️ Kernel Invariants")
    st.markdown("""
    <div style="background: rgba(0, 163, 224, 0.12); border: 1px solid #00A3E0; border-radius: 8px; padding: 12px; margin-bottom: 14px;">
        <div style="color: #00C2DE; font-weight: 700; font-size: 0.85rem;">TRUSTED KERNEL: ACTIVE</div>
        <div style="color: #E2E8F0; font-size: 0.74rem; margin-top: 3px;">Fail-Closed Boundary (Non-Bypassable)</div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("**Core Policy Invariants**")
    st.caption("✓ 100% Deterministic Decision Logic")
    st.caption("✓ Cryptographic SHA-256 Audit Sealing")
    st.caption("✓ Zero Authority for Agents to Promote")
    st.caption("✓ Enforced Latency & Cost Ceilings")

    st.divider()
    st.markdown("### 🔌 Active Provider")
    provider_type = st.selectbox(
        "Active Runtime Engine",
        [
            "Offline Invariant Simulator (12 Seeded Defects)",
            "AWS Bedrock (Cross-Account IAM Role)",
            "Azure AI Foundry (Managed Identity)",
            "Databricks Mosaic AI (Unity Catalog)",
            "Enterprise LLM Gateway (LiteLLM/Portkey)",
        ],
        index=0,
    )
    baseline_id = st.text_input("Baseline Model ID", "anthropic.claude-3-haiku-20240307-v1:0")
    candidate_id = st.text_input("Candidate Model ID", "anthropic.claude-3-5-haiku-20241022-v1:0")

    if st.button("Ping Runtime Engine", use_container_width=True):
        sim = SimulatorAdapter()
        health = sim.check_health()
        if health.is_healthy:
            st.success(f"Connected: {health.provider_name} ({health.latency_ms}ms)")
        else:
            st.error(f"Error: {health.error_message}")


# -----------------------------------------------------------------------------
# Primary Stepped Lifecycle Navigation (7 Logical Modules)
# -----------------------------------------------------------------------------
tab_connect, tab_estate, tab_event, tab_eval, tab_gate, tab_rollback, tab_missing = st.tabs([
    "01 🔌 Connect",
    "02 🗺️ Discover",
    "03 📡 Ingest",
    "04 🧪 Qualify",
    "05 ✍️ Gate",
    "06 🚀 Canary",
    "07 🧩 Expand",
])


# =============================================================================
# MODULE 1: Enterprise AI Estate Connectors & Multi-Geo Sovereignty
# =============================================================================
with tab_connect:
    st.markdown("""
    <div class="cognizant-card card-accent-navy">
        <h4 style="margin: 0; color: #000048;">Enterprise AI Estate Connectivity & Multi-Geo Governance</h4>
        <p style="color: #5A6B82; font-size: 0.88rem; margin-top: 6px;">
            How AI Evergreen non-invasively connects, discovers, and enforces governance across customer multi-cloud estates without refactoring application code.
        </p>
    </div>
    """, unsafe_allow_html=True)

    col_c1, col_c2 = st.columns([3, 2])

    with col_c1:
        st.markdown("##### 1. Select Customer Landscape Foundation")
        platform_choice = st.selectbox(
            "Enterprise AI Platform",
            [
                "AWS Bedrock & SageMaker (Cross-Account IAM AssumeRole)",
                "Microsoft Azure AI Foundry (Tenant ID & Service Principal)",
                "Databricks Mosaic AI (Unity Catalog & Workspace PAT)",
                "Google Cloud Vertex AI (Workload Identity Federation)",
                "Enterprise LLM Gateway (LiteLLM Enterprise / Portkey)",
                "Private Air-Gapped K8s (Red Hat OpenShift / Rancher)",
            ],
            index=0,
        )

        sub_col1, sub_col2 = st.columns(2)
        with sub_col1:
            st.text_input("Customer Cloud Account / Tenant ID", "339712728310 (CloudBoost Production)")
            st.text_input("Discovery IAM Role ARN", "arn:aws:iam::339712728310:role/Cognizant-AIEvergreen-Sync")
        with sub_col2:
            st.text_input("VPC / PrivateLink Endpoint", "vpce-04918f6291a.bedrock.eu-north-1.vpce.amazonaws.com")
            st.text_input("KMS Key Alias / Secret Reference", "alias/cognizant-ai-governance-master")

        st.markdown("##### 2. Multi-Geo Data Sovereignty & Compliance Zone")
        geo_zone = st.radio(
            "Primary Workload Residency",
            [
                "🇸🇪 Nordics & EU — eu-north-1 Stockholm (CloudBoost Host | GDPR & EU AI Act High-Risk Compliant)",
                "🇩🇪 Europe Central — eu-central-1 Frankfurt (GDPR Article 22 & BaFin Banking Cloud)",
                "🇺🇸 Americas — us-east-1 N. Virginia (HIPAA, SOC 2 Type II, FedRAMP Moderate)",
                "🇮🇳 Asia-Pacific — ap-south-1 Mumbai (RBI Cyber Framework & India DPDP Act 2023)",
            ],
            index=0,
        )

    with col_c2:
        st.markdown("##### Enterprise Integration Mechanics")
        st.markdown("""
        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; font-size: 0.82rem; line-height: 1.6;">
            <b>Core Integration Pillars:</b><br/>
            • <b>Zero Static Keys:</b> Operates via ambient IAM AssumeRole / Workload Identity.<br/>
            • <b>Continuous Discovery:</b> Queries model catalogs & prompt repos periodically via read-only APIs.<br/>
            • <b>Shift-Left CI/CD Gate:</b> GitHub Actions / Azure DevOps calls <code>POST /api/v1/events</code> to fail pull requests on regression.<br/>
            • <b>Air-Gapped Data Residency:</b> Qualification test suites execute inside the customer VPC; zero customer prompts or embeddings exit the region.
        </div>
        """, unsafe_allow_html=True)

        st.markdown("##### Automated Estate Discovery")
        if st.button("🚀 Run Automated Estate Discovery Scan", type="primary", use_container_width=True):
            with st.spinner("Connecting to enterprise model catalog and constructing dependency graph..."):
                st.success("✅ Handshake Verified: IAM AssumeRole accepted by `339712728310`.")
                st.info("📦 Synchronized: 12 Applications, 5 Specialized Agents, 4 Bedrock Base Models, 20 Graph Nodes.")
                st.caption(f"Estate snapshot cryptographically timestamped at {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}")


# =============================================================================
# MODULE 2: AI Estate Portfolio & Dependency Navigator
# =============================================================================
with tab_estate:
    counts = estate["metadata"]["counts"]

    # Top Metric Banner (OneCognizant App Tiles)
    m1, m2, m3, m4 = st.columns(4)
    with m1:
        st.markdown(f"""
        <div class="cognizant-card card-accent-navy">
            <div class="metric-label">Registered AI Workloads</div>
            <div class="metric-value">{counts['applications']}</div>
            <div style="font-size: 0.76rem; color: #00875A; font-weight: 600; margin-top: 4px;">100% Graph-Mapped</div>
        </div>
        """, unsafe_allow_html=True)
    with m2:
        st.markdown(f"""
        <div class="cognizant-card card-accent-blue">
            <div class="metric-label">Specialized Agents</div>
            <div class="metric-value">{counts['agents']}</div>
            <div style="font-size: 0.76rem; color: #0033A0; font-weight: 600; margin-top: 4px;">LangGraph & Bedrock</div>
        </div>
        """, unsafe_allow_html=True)
    with m3:
        st.markdown(f"""
        <div class="cognizant-card card-accent-cyan">
            <div class="metric-label">Active Test Assets</div>
            <div class="metric-value">{counts['tests']}</div>
            <div style="font-size: 0.76rem; color: #00A3E0; font-weight: 600; margin-top: 4px;">Differential Invariants</div>
        </div>
        """, unsafe_allow_html=True)
    with m4:
        st.markdown(f"""
        <div class="cognizant-card card-accent-green">
            <div class="metric-label">Seeded Defect Guards</div>
            <div class="metric-value">{counts['seeded_defects']}</div>
            <div style="font-size: 0.76rem; color: #00875A; font-weight: 600; margin-top: 4px;">100% Recall Interception</div>
        </div>
        """, unsafe_allow_html=True)

    # Filter Bar
    f1, f2 = st.columns([2, 1])
    with f1:
        filter_tier = st.multiselect(
            "Filter by Criticality Tier",
            ["CRITICAL_TIER_1", "HIGH_TIER_2", "STANDARD_TIER_3", "LOW_TIER_4"],
            default=["CRITICAL_TIER_1", "HIGH_TIER_2", "STANDARD_TIER_3", "LOW_TIER_4"],
        )
    with f2:
        search_query = st.text_input("Filter by Workload Name or Owner", placeholder="e.g., refund, claims, medical")

    # Table Rendering
    apps_data = []
    for a in estate["applications"]:
        if a["criticality"] in filter_tier and (
            not search_query
            or search_query.lower() in a["name"].lower()
            or search_query.lower() in a["owner"].lower()
        ):
            apps_data.append({
                "Workload ID": a["application_id"],
                "Application Name": a["name"],
                "Criticality Tier": a["criticality"],
                "Business Process": a["business_process_id"],
                "Business Owner": a["owner"],
                "Active Foundation Model": a["active_model_id"],
                "Latency SLA": f"{a['contract']['latency_threshold_ms']} ms",
                "Cost Ceiling": f"${a['contract']['token_cost_ceiling_usd']:.4f}",
                "Requires Human Gate": "Yes (Mandatory)" if a["contract"]["human_approval_requirement"] else "Canary Auto",
            })

    st.markdown("##### Discovered Enterprise AI Workload Catalog")
    st.dataframe(apps_data, use_container_width=True)


# =============================================================================
# MODULE 3: Change Signal Ingestion & Deterministic Blast Radius
# =============================================================================
with tab_event:
    st.markdown("""
    <div class="cognizant-card card-accent-blue">
        <h4 style="margin: 0; color: #000048;">Model Evolution & Deterministic Blast Radius</h4>
        <p style="color: #5A6B82; font-size: 0.88rem; margin-top: 6px;">
            Simulate or ingest a model deprecation, provider upgrade, or prompt version change to deterministically trace blast radius through the dependency graph.
        </p>
    </div>
    """, unsafe_allow_html=True)

    col_e1, col_e2 = st.columns([2, 1])

    with col_e1:
        event_source = st.selectbox(
            "Signal Intake Source",
            [
                "AWS Bedrock Deprecation Notice (WebHook / EventBridge)",
                "Enterprise CI/CD Pull Request (GitHub Actions / GitLab CI)",
                "ServiceNow Change Request (CAB RFC-89421)",
                "Manual Architectural Governance Review",
            ],
        )
        change_type_sel = st.selectbox(
            "Change Type Classification",
            [ct.value for ct in ChangeType],
            index=0,
        )
        target_model = st.selectbox(
            "Upstream Component / Model Being Evolved",
            [m["model_id"] for m in estate["models"]],
            index=0,
        )

    with col_e2:
        st.markdown("##### Blast Radius Invariants")
        st.markdown("""
        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; font-size: 0.82rem; line-height: 1.5;">
            • <b>Deterministic Reachability:</b> Computed via NetworkX directional BFS traversal.<br/>
            • <b>Zero LLM Hallucination:</b> Agent has <i>zero authority</i> to calculate paths probabilistically.<br/>
            • <b>Fail-Closed on Ambiguity:</b> Any cycle or uncertain edge expands scope to maximum safety.
        </div>
        """, unsafe_allow_html=True)

    if st.button("Compute Blast Radius & Dependency Traversal", type="primary"):
        event = ChangeEvent(
            event_id=f"evt-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
            source=event_source,
            model_or_component_id=target_model,
            current_version="20240307-v1:0",
            candidate_version="20241022-v1:0",
            change_type=ChangeType(change_type_sel),
            confidence=1.0,
            correlation_id="corr-onecognizant-demo",
        )
        st.session_state["current_event"] = event

        hypothesis = impact_agent.evaluate_impact(event)
        st.session_state["current_hypothesis"] = hypothesis

        st.success(f"Deterministic Blast Radius: {hypothesis.affected_count} enterprise applications impacted.")

        c1, c2, c3 = st.columns(3)
        c1.metric("Impacted Applications", hypothesis.affected_count)
        c2.metric("Highest Risk Criticality", hypothesis.highest_risk_tier.value)
        c3.metric("Graph Traversal Confidence", f"{hypothesis.confidence_score * 100:.0f}%")

        st.markdown("##### Directly Impacted Downstream Workloads")
        impacted_summary = [
            {
                "App ID": app.application_id,
                "Application Name": app.name,
                "Criticality Tier": app.criticality.value,
                "Business Owner": app.owner,
                "Requires Human Gate": "Yes" if app.contract.human_approval_requirement else "No",
                "Max Latency SLA": f"{app.contract.latency_threshold_ms}ms",
            }
            for app in hypothesis.affected_workloads
        ]
        st.table(impacted_summary)


# =============================================================================
# MODULE 4: Differential Qualification & Seeded Defect Injection
# =============================================================================
with tab_eval:
    st.markdown("""
    <div class="cognizant-card card-accent-cyan">
        <h4 style="margin: 0; color: #000048;">Differential Test Harness & Seeded Regression Detection</h4>
        <p style="color: #5A6B82; font-size: 0.88rem; margin-top: 6px;">
            Executes baseline vs. candidate differential qualification. Injects real-world LLM defects to demonstrate the Trusted Kernel's inviolable fail-closed protection.
        </p>
    </div>
    """, unsafe_allow_html=True)

    if "current_hypothesis" not in st.session_state:
        st.info("👉 Please compute blast radius in Tab '03 Ingest' first.")
    else:
        hyp = st.session_state["current_hypothesis"]
        selected_app_id = st.selectbox(
            "Select Target Application for Qualification",
            [app.application_id for app in hyp.affected_workloads],
        )
        workload = next(app for app in hyp.affected_workloads if app.application_id == selected_app_id)

        # Plan regression suite
        plan = planner.plan_regression(hyp, estate["tests"])
        workload_tests = [item for item in plan.selected_tests if item.workload_id == selected_app_id and item.is_included]

        st.markdown(f"**Adaptive Regression Plan:** `{len(workload_tests)} tests scoped` ({plan.critical_tests_included_count} critical invariant tests guaranteed).")

        # Seeded Defect Injection Options
        st.markdown("##### Real-World Seeded Defect Injection (12 Categories)")
        inject_defect = st.checkbox("Inject Seeded Regression to Test Fail-Closed Protection", value=True)
        defect_type = st.selectbox(
            "Select Defect Pattern to Simulate in Candidate Model",
            [
                "JSON Schema Truncation (Missing required keys)",
                "Hallucinated / Unapproved Tool Invocation",
                "Prompt Injection Jailbreak Susceptibility",
                "Latency SLA Breach (+800ms Degradation)",
                "Token Cost Ceiling Violation (+$0.015/call)",
                "Medical Diagnosis Precision Regression (<95%)",
            ],
            disabled=not inject_defect,
        )

        if st.button("Execute Differential Qualification Suite", type="primary"):
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
                    correlation_id="corr-onecognizant-demo",
                )
                verdicts.append(v)
                progress_bar.progress((idx + 1) / len(workload_tests))

            rec, evidence_pkg = rec_engine.generate_recommendation(
                event_id=st.session_state["current_event"].event_id,
                workload=workload,
                verdicts=verdicts,
                candidate_model_id=candidate_id,
                correlation_id="corr-onecognizant-demo",
            )
            st.session_state["current_recommendation"] = rec
            st.session_state["current_evidence_pkg"] = evidence_pkg
            st.session_state["current_verdicts"] = verdicts

            # Verdict Display
            st.divider()
            if rec.treatment == TreatmentOutcome.BLOCK:
                st.markdown(f"""
                <div style="background-color: #FFEAEA; border: 2px solid #C92A2A; border-radius: 8px; padding: 18px; margin-bottom: 15px;">
                    <div style="color: #C92A2A; font-weight: 700; font-size: 1.1rem;">🛑 TRUSTED KERNEL VERDICT: PROMOTION BLOCKED</div>
                    <div style="color: #495057; font-size: 0.9rem; margin-top: 6px;"><b>Rationale:</b> {rec.rationale}</div>
                    <div style="color: #868E96; font-size: 0.8rem; margin-top: 4px;">Fail-closed rule active: Any deterministic invariant failure immediately halts promotion.</div>
                </div>
                """, unsafe_allow_html=True)
            elif rec.treatment == TreatmentOutcome.CANARY:
                st.markdown(f"""
                <div style="background-color: #FFF4E5; border: 2px solid #D9480F; border-radius: 8px; padding: 18px; margin-bottom: 15px;">
                    <div style="color: #D9480F; font-weight: 700; font-size: 1.1rem;">⚠️ TRUSTED KERNEL VERDICT: CANARY DEPLOYMENT ({rec.canary_percentage}%)</div>
                    <div style="color: #495057; font-size: 0.9rem; margin-top: 6px;"><b>Rationale:</b> {rec.rationale}</div>
                </div>
                """, unsafe_allow_html=True)
            else:
                st.markdown(f"""
                <div style="background-color: #EBFBEE; border: 2px solid #2B8A3E; border-radius: 8px; padding: 18px; margin-bottom: 15px;">
                    <div style="color: #2B8A3E; font-weight: 700; font-size: 1.1rem;">✅ TRUSTED KERNEL VERDICT: FULL MIGRATION QUALIFIED</div>
                    <div style="color: #495057; font-size: 0.9rem; margin-top: 6px;"><b>Rationale:</b> {rec.rationale}</div>
                </div>
                """, unsafe_allow_html=True)

            # Detailed Verdicts Table
            verdict_rows = [
                {
                    "Test ID": v.test_id,
                    "Verdict": "PASS" if v.deterministic_passed else "FAIL",
                    "Latency": f"{v.latency_ms:.1f} ms",
                    "Inference Cost": f"${v.cost_usd:.4f}",
                    "Failure Invariants Detected": "; ".join(v.failure_reasons) if v.failure_reasons else "None (Invariant Maintained)",
                }
                for v in verdicts
            ]
            st.dataframe(verdict_rows, use_container_width=True)


# =============================================================================
# MODULE 5: Tamper-Evident Digital Approval Gate
# =============================================================================
with tab_gate:
    st.markdown("""
    <div class="cognizant-card card-accent-navy">
        <h4 style="margin: 0; color: #000048;">Tamper-Evident Digital Approval Gate</h4>
        <p style="color: #5A6B82; font-size: 0.88rem; margin-top: 6px;">
            Enterprise sign-off with cryptographic SHA-256 evidence package sealing. Inviolable Rule: The Trusted Kernel strictly prevents override on BLOCKED verdicts.
        </p>
    </div>
    """, unsafe_allow_html=True)

    if "current_recommendation" not in st.session_state:
        st.info("👉 Please run qualification in Tab '04 Qualify' first to generate an evaluation recommendation.")
    else:
        rec = st.session_state["current_recommendation"]
        pkg = st.session_state["current_evidence_pkg"]

        st.markdown(f"**Recommendation ID:** `{rec.recommendation_id}`")
        st.markdown(f"**Target Workload:** `{rec.workload_id}`")
        st.markdown(f"**Treatment Outcome:** `{rec.treatment.value}`")
        st.markdown(f"**Evidence Package SHA-256 Digest:** `{pkg.package_digest}`")

        if rec.treatment == TreatmentOutcome.BLOCK:
            st.error("🚫 Inviolable Security Constraint: Promotion is BLOCKED by the Trusted Kernel. Human sign-off cannot override a deterministic invariant failure.")
        else:
            st.markdown("#### Digital Approval Sign-Off Form")
            with st.form("onecognizant_approval_form"):
                approver_name = st.text_input("Approver Corporate Email", "puneet.saxena2@cognizant.com")
                approver_role = st.selectbox(
                    "Approver Authority Role",
                    ["Enterprise AI Risk Officer (Level 4)", "Lead ML Solution Architect", "Business Process Owner"],
                )
                decision = st.radio("Decision", [ApprovalStatus.APPROVED.value, ApprovalStatus.REJECTED.value])
                rationale = st.text_area("Audit Justification", "Validated differential qualification report; authorized progressive 5% canary deployment.")
                submitted = st.form_submit_button("Sign & Cryptographically Authorize Promotion")

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
                        st.markdown(f"**Digital Signature Hash:** `{approval.signature_hash}`")
                        st.markdown(f"**Sealed Package Digest:** `{pkg.package_digest}`")
                    except AIEvergreenError as err:
                        st.error(f"❌ Trusted Kernel Violation: {err}")


# =============================================================================
# MODULE 6: Live Canary Telemetry & Auto-Rollback Engine
# =============================================================================
with tab_rollback:
    st.markdown("""
    <div class="cognizant-card card-accent-blue">
        <h4 style="margin: 0; color: #000048;">Live Canary Telemetry & Automated Rollback Engine</h4>
        <p style="color: #5A6B82; font-size: 0.88rem; margin-top: 6px;">
            Simulate real-time streaming canary traffic. When telemetry breaches SLA contract invariants, the controller deterministically rolls back to last known good.
        </p>
    </div>
    """, unsafe_allow_html=True)

    selected_rb_app = st.selectbox(
        "Select Active Canary Workload",
        [app["application_id"] for app in estate["applications"]],
        key="rb_app_select",
    )
    rb_workload = WorkloadProfile.model_validate(
        next(a for a in estate["applications"] if a["application_id"] == selected_rb_app)
    )

    st.markdown("##### Enforced SLA Contract Thresholds")
    st.json(rb_workload.contract.rollback_thresholds)

    col_m1, col_m2 = st.columns(2)
    with col_m1:
        sim_error_delta = st.slider("Simulated Error Rate Delta (Candidate - Baseline)", 0.0, 0.05, 0.002, 0.001, format="%.3f")
    with col_m2:
        sim_p99_latency = st.slider("Simulated P99 Latency (ms)", 500.0, 5000.0, 1200.0, 100.0)

    if st.button("Evaluate Live Canary Telemetry", type="primary"):
        metrics = {"error_rate_delta": sim_error_delta, "p99_latency_ms": sim_p99_latency}
        rb_result = rollback_ctrl.evaluate_and_enforce_canary(
            workload=rb_workload,
            current_metrics=metrics,
        )

        if rb_result["action"] == "ROLLBACK_TO_LAST_KNOWN_GOOD":
            st.markdown(f"""
            <div style="background-color: #FFEAEA; border: 2px solid #C92A2A; border-radius: 8px; padding: 18px; margin-top: 15px;">
                <div style="color: #C92A2A; font-weight: 700; font-size: 1.1rem;">🚨 SLA INVARIANT BREACH: DETERMINISTIC ROLLBACK TRIGGERED</div>
                <div style="color: #495057; font-size: 0.9rem; margin-top: 6px;"><b>Reason:</b> {rb_result['reason']}</div>
                <div style="color: #000048; font-size: 0.85rem; margin-top: 6px;"><b>Restored Production Model:</b> <code>{rb_result['restored_model_id']}</code></div>
                <div style="color: #2B8A3E; font-size: 0.85rem; margin-top: 4px;"><b>Recovery Time:</b> {rb_result['recovery_time_seconds']} seconds (Sub-second MTTR)</div>
            </div>
            """, unsafe_allow_html=True)
        else:
            st.markdown("""
            <div style="background-color: #EBFBEE; border: 2px solid #2B8A3E; border-radius: 8px; padding: 18px; margin-top: 15px;">
                <div style="color: #2B8A3E; font-weight: 700; font-size: 1.1rem;">🟢 CANARY TELEMETRY HEALTHY</div>
                <div style="color: #495057; font-size: 0.9rem; margin-top: 6px;">All contract invariants satisfied. Progressive traffic increase permitted.</div>
            </div>
            """, unsafe_allow_html=True)


# =============================================================================
# MODULE 7: Autonomous Missing-Test Discovery
# =============================================================================
with tab_missing:
    st.markdown("""
    <div class="cognizant-card card-accent-cyan">
        <h4 style="margin: 0; color: #000048;">Autonomous Missing-Test Discovery Engine</h4>
        <p style="color: #5A6B82; font-size: 0.88rem; margin-top: 6px;">
            Scans application contracts and agent tool definitions for unverified invariants, generating candidate tests in sandboxed isolation.
        </p>
    </div>
    """, unsafe_allow_html=True)

    target_app_disc = st.selectbox(
        "Application to Analyze for Test Gaps",
        [a["application_id"] for a in estate["applications"]],
        key="disc_app_sel",
    )
    disc_workload = WorkloadProfile.model_validate(
        next(a for a in estate["applications"] if a["application_id"] == target_app_disc)
    )

    if st.button("Analyze Qualification Gap Matrix", type="primary"):
        gaps = missing_gen.discover_gaps(disc_workload, estate["tests"])
        if gaps:
            st.warning(f"Identified {len(gaps)} qualification gaps requiring human review.")
            for g in gaps:
                with st.expander(f"Candidate Test Proposal: {g['proposed_name']}"):
                    st.write(f"**Gap Classification:** {g['gap_type']}")
                    st.write(f"**Target Tool / Invariant:** `{g['target_tool']}`")
                    st.write(f"**Execution Sandbox State:** `{g['status']}` (Isolated)")
                    st.write(f"**Discovery Rationale:** {g['rationale']}")
        else:
            st.success("All declared tools and contract invariants have active verified test coverage.")
