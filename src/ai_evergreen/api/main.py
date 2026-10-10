"""FastAPI REST API server for AI Evergreen Control Plane.

Implements all core API endpoints defined in docs/Interfaces.md §7:
- Change signal ingestion with deduplication
- Deterministic blast radius calculation
- Regression execution and differential qualification
- Tamper-evident human approval gate
- Live canary telemetry evaluation and automated rollback
"""

import json
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, AsyncGenerator, Optional

from fastapi import FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ai_evergreen.change_signal.monitor import ChangeSignalMonitor
from ai_evergreen.common.config import get_settings
from ai_evergreen.common.exceptions import AIEvergreenError
from ai_evergreen.common.schemas import (
    ApprovalRecord,
    ApprovalStatus,
    ChangeEvent,
    ChangeType,
    EvaluationVerdict,
    EvidencePackage,
    RecommendationRecord,
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

# Component Singletons
settings = get_settings()
graph_engine = DependencyGraphEngine()
signal_monitor = ChangeSignalMonitor()
impact_agent = ChangeImpactAgent(graph_engine)
regression_planner = AdaptiveRegressionPlanner()
trusted_kernel = TrustedKernel()
recommendation_engine = RecommendationEngine(trusted_kernel)
rollback_controller = RollbackController(trusted_kernel)
missing_test_gen = MissingTestGenerator()

# Simulator Adapters
baseline_adapter = SimulatorAdapter(provider_name="baseline-claude-3-haiku")
candidate_adapter = SimulatorAdapter(provider_name="candidate-claude-3-5-haiku")
eval_harness = DifferentialEvaluatorHarness(
    baseline_adapter=baseline_adapter, candidate_adapter=candidate_adapter
)

# In-memory session state
in_memory_events: dict[str, ChangeEvent] = {}
in_memory_recommendations: dict[str, RecommendationRecord] = {}
in_memory_evidence_packages: dict[str, EvidencePackage] = {}
estate_cache: dict[str, Any] = {}


def _ensure_estate_loaded() -> None:
    global estate_cache
    if not estate_cache:
        estate_path = Path("data/synthetic/estate.json")
        if estate_path.exists():
            with open(estate_path, "r", encoding="utf-8") as f:
                estate_cache = json.load(f)
                graph_engine.load_estate(estate_cache)


# Preload immediately
_ensure_estate_loaded()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Ensure estate and graph are loaded on startup."""
    _ensure_estate_loaded()
    yield


# Initialize Application
app = FastAPI(
    title="AI Evergreen Control Plane API",
    description="Enterprise-grade continuous qualification and drift governance engine for AI workloads.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
@app.get("/api/v1/health")
def get_health() -> dict[str, Any]:
    """Health check endpoint."""
    _ensure_estate_loaded()
    return {
        "status": "HEALTHY",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "graph_nodes": graph_engine.graph.number_of_nodes(),
        "graph_edges": graph_engine.graph.number_of_edges(),
        "environment": settings.environment.value,
    }


class IngestSignalRequest(BaseModel):
    source: str
    model_or_component_id: str
    current_version: str
    candidate_version: str
    change_type: ChangeType
    raw_payload_ref: Optional[str] = None


@app.post("/api/v1/events", status_code=status.HTTP_201_CREATED)
def ingest_change_signal(req: IngestSignalRequest, response: Response) -> dict[str, Any]:
    """Ingest a model change signal."""
    try:
        event = signal_monitor.ingest_raw_signal(
            source=req.source,
            payload=req.model_dump(),
        )
        if event is None:
            response.status_code = status.HTTP_200_OK
            return {"status": "DUPLICATE_DROPPED", "message": "Signal already processed."}
        in_memory_events[event.event_id] = event
        return {"status": "ACCEPTED", "event": event}
    except AIEvergreenError as err:
        raise HTTPException(status_code=400, detail=str(err)) from err


@app.get("/api/v1/events/{event_id}/blast-radius")
def get_blast_radius(event_id: str) -> dict[str, Any]:
    """Calculate deterministic blast radius for an ingested event."""
    if event_id not in in_memory_events:
        raise HTTPException(status_code=404, detail=f"Event {event_id} not found.")

    event = in_memory_events[event_id]
    try:
        hypothesis = impact_agent.evaluate_impact(event)
        return {"event_id": event_id, "hypothesis": hypothesis}
    except AIEvergreenError as err:
        raise HTTPException(status_code=400, detail=str(err)) from err


class QualificationRequest(BaseModel):
    event_id: str
    workload_id: str
    candidate_model_id: str


@app.post("/api/v1/evaluations/run")
def run_workload_qualification(req: QualificationRequest) -> dict[str, Any]:
    """Execute differential evaluation, consult Trusted Kernel, and produce recommendation."""
    if not estate_cache:
        raise HTTPException(status_code=500, detail="Estate not loaded.")

    workloads = {
        app["application_id"]: WorkloadProfile.model_validate(app)
        for app in estate_cache["applications"]
    }
    if req.workload_id not in workloads:
        raise HTTPException(status_code=404, detail=f"Workload {req.workload_id} not found.")

    workload = workloads[req.workload_id]
    all_tests = estate_cache.get("tests", [])

    # Scope tests with Adaptive Regression Planner
    hypothesis = graph_engine.calculate_blast_radius(workload.active_model_id)
    plan = regression_planner.plan_regression(hypothesis, all_tests)

    # Filter to included tests for this specific workload
    selected_for_workload = [
        item
        for item in plan.selected_tests
        if item.workload_id == req.workload_id and item.is_included
    ]

    verdicts: list[EvaluationVerdict] = []
    tests_by_id = {t["test_id"]: t for t in all_tests}

    for item in selected_for_workload:
        test_payload = tests_by_id.get(item.test_id, {})
        verdict = eval_harness.evaluate_test(
            workload=workload,
            test_item=item,
            test_payload=test_payload,
            baseline_model_id=workload.active_model_id,
            candidate_model_id=req.candidate_model_id,
            correlation_id=req.event_id,
        )
        verdicts.append(verdict)

    rec, evidence_pkg = recommendation_engine.generate_recommendation(
        event_id=req.event_id,
        workload=workload,
        verdicts=verdicts,
        candidate_model_id=req.candidate_model_id,
        correlation_id=req.event_id,
    )

    in_memory_recommendations[rec.recommendation_id] = rec
    in_memory_evidence_packages[rec.recommendation_id] = evidence_pkg

    return {
        "recommendation": rec,
        "evidence_package": evidence_pkg,
        "plan_summary": {
            "total_tests": len(selected_for_workload),
            "critical_tests": plan.critical_tests_included_count,
        },
    }


class ApprovalSubmission(BaseModel):
    recommendation_id: str
    approver_email: str
    approver_role: str
    status: ApprovalStatus
    decision_rationale: str


@app.post("/api/v1/promotions/approve")
def submit_human_approval(req: ApprovalSubmission) -> dict[str, Any]:
    """Record human approval gate decision and seal into evidence package."""
    if req.recommendation_id not in in_memory_recommendations:
        raise HTTPException(status_code=404, detail="Recommendation not found.")

    rec = in_memory_recommendations[req.recommendation_id]
    approval = ApprovalRecord(
        approval_id=f"appr-{req.recommendation_id}",
        recommendation_id=req.recommendation_id,
        workload_id=rec.workload_id,
        candidate_model_id=rec.candidate_model_id,
        approver_email=req.approver_email,
        approver_role=req.approver_role,
        status=req.status,
        decision_rationale=req.decision_rationale,
        signed_at=datetime.now(timezone.utc),
        correlation_id=rec.correlation_id,
    )
    approval.signature_hash = approval.compute_signature_hash()

    # Trusted Kernel authorization check
    try:
        trusted_kernel.authorize_production_promotion(outcome=rec.treatment, approval=approval)
    except AIEvergreenError as err:
        raise HTTPException(status_code=403, detail=str(err)) from err

    # Update Evidence Package with approval record
    evidence_pkg = in_memory_evidence_packages.get(req.recommendation_id)
    if evidence_pkg:
        evidence_pkg.approval_record = approval
        evidence_pkg.seal_package()

    return {
        "status": "AUTHORIZED",
        "approval_record": approval,
        "tamper_evident_seal": evidence_pkg.package_digest if evidence_pkg else None,
    }


class CanaryEvaluationRequest(BaseModel):
    workload_id: str
    current_metrics: dict[str, float]


@app.post("/api/v1/canary/evaluate")
def evaluate_canary_telemetry(req: CanaryEvaluationRequest) -> dict[str, Any]:
    """Evaluate live canary telemetry; automatically execute rollback if thresholds breached."""
    workloads = {
        app["application_id"]: WorkloadProfile.model_validate(app)
        for app in estate_cache.get("applications", [])
    }
    if req.workload_id not in workloads:
        raise HTTPException(status_code=404, detail="Workload not found.")

    workload = workloads[req.workload_id]
    result = rollback_controller.evaluate_and_enforce_canary(
        workload=workload,
        current_metrics=req.current_metrics,
    )
    return result
