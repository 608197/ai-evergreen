"""Integration tests for FastAPI REST API endpoints."""

from fastapi.testclient import TestClient

from ai_evergreen.api.main import app

client = TestClient(app)


def test_api_health_endpoint() -> None:
    """Verify system health endpoint returns 200 and healthy graph status."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["graph_nodes"] > 0


def test_api_event_ingestion_and_deduplication() -> None:
    """Verify change signal ingestion and deduplication."""
    payload = {
        "source": "aws_bedrock_runtime",
        "model_or_component_id": "anthropic.claude-3-haiku-20240307-v1:0",
        "current_version": "20240307-v1:0",
        "candidate_version": "20241022-v1:0",
        "change_type": "MODEL_DEPRECATION",
    }

    # 1. First Ingestion -> ACCEPTED
    res1 = client.post("/api/v1/events", json=payload)
    assert res1.status_code == 201
    data1 = res1.json()
    assert data1["status"] == "ACCEPTED"
    event_id = data1["event"]["event_id"]

    # 2. Duplicate Ingestion -> DUPLICATE_DROPPED
    res2 = client.post("/api/v1/events", json=payload)
    assert res2.status_code == 200
    assert res2.json()["status"] == "DUPLICATE_DROPPED"

    # 3. Query Blast Radius
    res3 = client.get(f"/api/v1/events/{event_id}/blast-radius")
    assert res3.status_code == 200
    blast = res3.json()["hypothesis"]
    assert blast["affected_count"] == 12


def test_api_qualification_run_and_human_approval() -> None:
    """Verify end-to-end qualification and human approval gate for both BLOCK and CANARY flows."""
    # Flow 1: Workload with seeded defect (app-refund-agent) -> Must be BLOCKED
    qual_res_block = client.post(
        "/api/v1/evaluations/run",
        json={
            "event_id": "evt-block-test",
            "workload_id": "app-refund-agent",
            "candidate_model_id": "anthropic.claude-3-5-haiku-20241022-v1:0",
        },
    )
    assert qual_res_block.status_code == 200
    rec_block = qual_res_block.json()["recommendation"]
    assert rec_block["treatment"] == "BLOCK"
    assert len(rec_block["failed_invariants"]) > 0

    # Inviolable rule: Approving a BLOCKED workload must return 403 Forbidden
    appr_block_res = client.post(
        "/api/v1/promotions/approve",
        json={
            "recommendation_id": rec_block["recommendation_id"],
            "approver_email": "rogue_actor@enterprise.com",
            "approver_role": "Tester",
            "status": "APPROVED",
            "decision_rationale": "Attempting unauthorized override.",
        },
    )
    assert appr_block_res.status_code == 403

    # Flow 2: Clean Workload without seeded defects (app-hr-benefits-bot) -> CANARY / MIGRATE
    qual_res_clean = client.post(
        "/api/v1/evaluations/run",
        json={
            "event_id": "evt-clean-test",
            "workload_id": "app-hr-benefits-bot",
            "candidate_model_id": "anthropic.claude-3-5-haiku-20241022-v1:0",
        },
    )
    assert qual_res_clean.status_code == 200
    rec_clean = qual_res_clean.json()["recommendation"]
    assert rec_clean["treatment"] in ("CANARY", "MIGRATE")

    # Authorize valid promotion
    appr_clean_res = client.post(
        "/api/v1/promotions/approve",
        json={
            "recommendation_id": rec_clean["recommendation_id"],
            "approver_email": "compliance_lead@enterprise.com",
            "approver_role": "Compliance Director",
            "status": "APPROVED",
            "decision_rationale": "Verified all invariant passes.",
        },
    )
    assert appr_clean_res.status_code == 200
    appr_data = appr_clean_res.json()
    assert appr_data["status"] == "AUTHORIZED"
    assert len(appr_data["approval_record"]["signature_hash"]) == 64


def test_api_canary_evaluation_and_rollback() -> None:
    """Verify live canary telemetry evaluation and automated rollback."""
    # 1. Healthy Telemetry -> CONTINUE_CANARY
    res_healthy = client.post(
        "/api/v1/canary/evaluate",
        json={
            "workload_id": "app-refund-agent",
            "current_metrics": {"error_rate_delta": 0.001, "p99_latency_ms": 1100.0},
        },
    )
    assert res_healthy.status_code == 200
    assert res_healthy.json()["action"] == "CONTINUE_CANARY"

    # 2. Breached Telemetry -> ROLLBACK_TO_LAST_KNOWN_GOOD
    res_breach = client.post(
        "/api/v1/canary/evaluate",
        json={
            "workload_id": "app-refund-agent",
            "current_metrics": {"error_rate_delta": 0.025, "p99_latency_ms": 1100.0},
        },
    )
    assert res_breach.status_code == 200
    breach_data = res_breach.json()
    assert breach_data["action"] == "ROLLBACK_TO_LAST_KNOWN_GOOD"
    assert breach_data["status"] == "RESTORED"


def test_api_estate_and_graph_endpoints() -> None:
    """Verify estate catalog and NetworkX graph serialization endpoint."""
    res = client.get("/api/v1/estate")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "LOADED"
    assert data["summary"]["workloads_count"] > 0
    assert len(data["graph"]["nodes"]) > 0
    assert len(data["graph"]["edges"]) > 0


def test_api_events_and_memory_endpoints() -> None:
    """Verify events, behavioural memory, and evidence endpoints."""
    # 1. Events list
    res_events = client.get("/api/v1/events")
    assert res_events.status_code == 200
    events_data = res_events.json()
    assert events_data["total"] >= 1
    event_id = events_data["events"][0]["event_id"]

    # Single event
    res_single = client.get(f"/api/v1/events/{event_id}")
    assert res_single.status_code == 200

    # 2. Memory & seeded invariants catalog
    res_mem = client.get("/api/v1/memory")
    assert res_mem.status_code == 200
    mem_data = res_mem.json()
    assert mem_data["total_invariants"] > 0
    assert mem_data["critical_invariants_count"] > 0

    # 3. Demo failure injection
    res_inj = client.post(
        "/api/v1/demo/inject-failure",
        json={"failure_type": "canary_degrades", "target_workload_id": "app-refund-agent"},
    )
    assert res_inj.status_code == 200
    assert res_inj.json()["audit"]["injected_for_demo"] is True

    # 4. Demo reset to baseline
    res_reset = client.post("/api/v1/demo/reset")
    assert res_reset.status_code == 200
    assert res_reset.json()["status"] == "SUCCESS"


