"""Unit tests for deterministic synthetic enterprise estate generator."""

import json

from ai_evergreen.discovery.synthetic_generator import generate_synthetic_estate


def test_synthetic_estate_counts() -> None:
    """Verify that generated estate meets minimum specification counts per docs/Schema.md."""
    estate = generate_synthetic_estate(seed=20261010)
    counts = estate["metadata"]["counts"]

    assert counts["applications"] == 12, "Must contain exactly 12 applications across 4 risk tiers."
    assert counts["agents"] == 5, "Must contain 5 specialized agents."
    assert counts["models"] >= 3, (
        "Must contain baseline, candidate, and reference simulator models."
    )
    assert counts["tests"] >= 120, "Must contain at least 120 test assets."
    assert counts["incidents"] == 10, "Must contain 10 historical incidents."
    assert counts["critical_invariants"] >= 24, "Must contain critical invariant test assets."
    assert counts["seeded_defects"] >= 12, "Must contain all 12 seeded regression triggers."


def test_synthetic_estate_byte_identical_reproducibility() -> None:
    """Hypothesis H12: Given the same seed, generator produces 100% byte-identical output."""
    estate1 = generate_synthetic_estate(seed=42)
    estate2 = generate_synthetic_estate(seed=42)

    json1 = json.dumps(estate1, sort_keys=True)
    json2 = json.dumps(estate2, sort_keys=True)

    assert json1 == json2, "Re-running synthetic generator with fixed seed must be byte-identical!"
