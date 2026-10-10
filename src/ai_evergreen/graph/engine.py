"""AI Dependency Graph Engine powered by NetworkX.

Provides deterministic graph reachability, confidence propagation,
and blast-radius calculation per docs/Architecture.md and docs/Schema.md.
"""

import uuid
from datetime import datetime, timezone
from typing import Any, Optional

import networkx as nx

from ai_evergreen.common.exceptions import BlastRadiusUncertaintyError
from ai_evergreen.common.schemas import (
    BlastRadiusHypothesis,
    EvidenceClass,
    RiskTier,
    WorkloadProfile,
)


class DependencyGraphEngine:
    """In-memory Directed Acyclic Graph (DAG) for AI enterprise dependencies."""

    def __init__(self) -> None:
        self.graph: nx.DiGraph = nx.DiGraph()
        self._workload_profiles: dict[str, WorkloadProfile] = {}

    def add_workload_profile(self, profile: WorkloadProfile) -> None:
        """Register and index a workload profile."""
        self._workload_profiles[profile.application_id] = profile

    def load_estate(self, estate_data: dict[str, Any]) -> None:
        """Ingest synthetic or discovered estate data into the NetworkX graph."""
        # 1. Add Models
        for m in estate_data.get("models", []):
            self.graph.add_node(
                m["model_id"],
                node_type="Model",
                name=m["name"],
                provider=m["provider"],
            )

        # 2. Add Applications and link to models
        for app in estate_data.get("applications", []):
            profile = WorkloadProfile.model_validate(app)
            self.add_workload_profile(profile)

            app_id = profile.application_id
            self.graph.add_node(
                app_id,
                node_type="Application",
                name=profile.name,
                criticality=profile.criticality.value,
                owner=profile.owner,
            )

            # Edge: Model -> Application (Model is consumed by Application)
            self.graph.add_edge(
                profile.active_model_id,
                app_id,
                relationship="SERVES_WORKLOAD",
                confidence=1.0,
                evidence_class=EvidenceClass.CONFIGURATION_DECLARED.value,
                source_ref="estate_ingestion",
            )

            # Business Process
            bp_id = profile.business_process_id
            self.graph.add_node(bp_id, node_type="BusinessProcess")
            self.graph.add_edge(
                app_id,
                bp_id,
                relationship="SUPPORTS_PROCESS",
                confidence=1.0,
                evidence_class=EvidenceClass.CONFIGURATION_DECLARED.value,
                source_ref="estate_ingestion",
            )

        # 3. Add Agents
        for agent in estate_data.get("agents", []):
            agent_id = agent["agent_id"]
            app_id = agent["app_id"]
            self.graph.add_node(agent_id, node_type="Agent", type=agent["type"])
            self.graph.add_edge(
                agent_id,
                app_id,
                relationship="EXECUTES_FOR_APP",
                confidence=1.0,
                evidence_class=EvidenceClass.CONFIGURATION_DECLARED.value,
                source_ref="estate_ingestion",
            )

        # 4. Add Test Assets
        for test in estate_data.get("tests", []):
            test_id = test["test_id"]
            app_id = test["workload_id"]
            self.graph.add_node(
                test_id,
                node_type="TestAsset",
                is_critical=test["is_critical"],
                category=test["category"],
            )
            self.graph.add_edge(
                test_id,
                app_id,
                relationship="VALIDATES_WORKLOAD",
                confidence=1.0,
                evidence_class=EvidenceClass.CODE_INFERRED.value,
                source_ref="test_registry",
            )

    def calculate_blast_radius(
        self,
        changed_model_id: str,
        correlation_id: Optional[str] = None,
        min_confidence: float = 0.5,
    ) -> BlastRadiusHypothesis:
        """Deterministically calculate affected workloads using graph reachability.

        Traverses downstream from changed_model_id to find all affected Applications.
        """
        if changed_model_id not in self.graph:
            raise BlastRadiusUncertaintyError(
                f"Model '{changed_model_id}' does not exist in dependency graph."
            )

        corr_id = correlation_id or f"corr-{uuid.uuid4().hex[:8]}"

        # Deterministic BFS / reachability traversal from changed model
        reachable_nodes = nx.descendants(self.graph, changed_model_id)
        affected_apps: list[WorkloadProfile] = []

        for node_id in reachable_nodes:
            node_attrs = self.graph.nodes[node_id]
            if node_attrs.get("node_type") == "Application" and node_id in self._workload_profiles:
                affected_apps.append(self._workload_profiles[node_id])

        # Sort affected apps deterministically by application_id
        affected_apps.sort(key=lambda a: a.application_id)

        # Determine highest risk tier among affected apps
        highest_tier = RiskTier.LOW
        tier_precedence = {
            RiskTier.CRITICAL: 4,
            RiskTier.HIGH: 3,
            RiskTier.MEDIUM: 2,
            RiskTier.LOW: 1,
        }

        for app in affected_apps:
            if tier_precedence[app.criticality] > tier_precedence[highest_tier]:
                highest_tier = app.criticality

        return BlastRadiusHypothesis(
            event_id=f"blast-{uuid.uuid4().hex[:8]}",
            affected_workloads=affected_apps,
            affected_count=len(affected_apps),
            highest_risk_tier=highest_tier,
            confidence_score=1.0,
            correlation_id=corr_id,
            generated_at=datetime.now(timezone.utc),
        )

    def get_application_tests(self, application_id: str) -> list[str]:
        """Return all test asset IDs validating an application."""
        predecessors = self.graph.predecessors(application_id)
        return [
            node for node in predecessors if self.graph.nodes[node].get("node_type") == "TestAsset"
        ]

    def export_subgraph_for_visualization(self, focus_model_id: str) -> dict[str, Any]:
        """Export subgraph nodes and edges for Streamlit / visual dashboard rendering."""
        if focus_model_id not in self.graph:
            return {"nodes": [], "edges": []}

        subgraph_nodes = {focus_model_id} | nx.descendants(self.graph, focus_model_id)
        sub = self.graph.subgraph(subgraph_nodes)

        nodes = [
            {
                "id": n,
                "label": sub.nodes[n].get("name", n),
                "type": sub.nodes[n].get("node_type", "Unknown"),
            }
            for n in sub.nodes()
        ]
        edges = [
            {
                "source": u,
                "target": v,
                "relationship": sub.edges[u, v].get("relationship", "CONNECTED"),
            }
            for u, v in sub.edges()
        ]

        return {"nodes": nodes, "edges": edges}
