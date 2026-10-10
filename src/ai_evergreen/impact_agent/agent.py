"""Change Impact Agent for AI Evergreen.

Read-only / propose-only agent that computes the downstream blast radius
of a model or component change event using the AI Dependency Graph.
Zero deployment or execution rights per AGENTS.md.
"""

from ai_evergreen.common.schemas import BlastRadiusHypothesis, ChangeEvent
from ai_evergreen.graph.engine import DependencyGraphEngine


class ChangeImpactAgent:
    """Computes blast-radius hypothesis for a change event."""

    def __init__(self, graph_engine: DependencyGraphEngine) -> None:
        self.graph_engine = graph_engine

    def evaluate_impact(
        self,
        event: ChangeEvent,
        min_confidence: float = 0.5,
    ) -> BlastRadiusHypothesis:
        """Calculate affected workloads from a ChangeEvent using deterministic graph traversal."""
        return self.graph_engine.calculate_blast_radius(
            changed_model_id=event.model_or_component_id,
            correlation_id=event.correlation_id,
            min_confidence=min_confidence,
        )
