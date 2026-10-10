"""Unit tests for DependencyGraphEngine."""

import json
from pathlib import Path

import pytest

from ai_evergreen.common.exceptions import BlastRadiusUncertaintyError
from ai_evergreen.common.schemas import RiskTier
from ai_evergreen.graph.engine import DependencyGraphEngine


@pytest.fixture
def populated_graph() -> DependencyGraphEngine:
    engine = DependencyGraphEngine()
    estate_file = Path("data/synthetic/estate.json")
    with open(estate_file, "r", encoding="utf-8") as f:
        estate_data = json.load(f)
    engine.load_estate(estate_data)
    return engine


def test_graph_loads_all_nodes(populated_graph: DependencyGraphEngine) -> None:
    """Verify graph contains applications, models, agents, and test nodes."""
    graph = populated_graph.graph
    assert "anthropic.claude-3-haiku-20240307-v1:0" in graph
    assert "app-refund-agent" in graph
    assert graph.number_of_nodes() > 100


def test_blast_radius_reaches_all_downstream_apps(populated_graph: DependencyGraphEngine) -> None:
    """Changing Claude 3 Haiku affects all 12 workloads that depend on it."""
    hypothesis = populated_graph.calculate_blast_radius("anthropic.claude-3-haiku-20240307-v1:0")

    assert hypothesis.affected_count == 12
    assert hypothesis.highest_risk_tier == RiskTier.CRITICAL
    assert len(hypothesis.affected_workloads) == 12


def test_blast_radius_unknown_model_raises_error(populated_graph: DependencyGraphEngine) -> None:
    """Querying blast radius for a non-existent model raises BlastRadiusUncertaintyError."""
    with pytest.raises(BlastRadiusUncertaintyError):
        populated_graph.calculate_blast_radius("nonexistent.model.v99")


def test_export_subgraph_contains_expected_structure(
    populated_graph: DependencyGraphEngine,
) -> None:
    """Exporting subgraph returns nodes and edges suitable for visualization."""
    subgraph = populated_graph.export_subgraph_for_visualization(
        "anthropic.claude-3-haiku-20240307-v1:0"
    )
    assert "nodes" in subgraph
    assert "edges" in subgraph
    assert len(subgraph["nodes"]) > 0
    assert len(subgraph["edges"]) > 0
