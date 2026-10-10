"""Architectural boundary and contract enforcement tests.

Automates design-time static assertions per AGENTS.md:
1. No component outside `ai_evergreen.providers` imports `boto3` or provider SDKs.
2. No LLM calls or provider adapter imports originate inside `ai_evergreen.trusted_kernel`.
3. Critical invariant tests cannot be excluded from regression suites.
"""

import ast
from pathlib import Path

import pytest

from ai_evergreen.common.schemas import (
    ApprovalRecord,
    ChangeEvent,
    EvaluationVerdict,
    EvidencePackage,
    ExclusionReasonCode,
    TestSelectionItem,
    TreatmentOutcome,
)


def get_all_python_files(directory: Path) -> list[Path]:
    """Return all .py files under a directory."""
    return list(directory.rglob("*.py"))


def get_imported_modules(file_path: Path) -> set[str]:
    """Parse a python file with AST and extract all imported top-level modules."""
    tree = ast.parse(file_path.read_text(encoding="utf-8"), filename=str(file_path))
    imports: set[str] = set()

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.add(alias.name.split(".")[0])
        elif isinstance(node, ast.ImportFrom) and node.module:
            imports.add(node.module.split(".")[0])

    return imports


def test_boto3_isolation_boundary() -> None:
    """AGENTS.md Principle 6: Business logic must never import AWS/Bedrock SDKs directly.

    Only src/ai_evergreen/providers/ is permitted to import boto3.
    """
    src_dir = Path(__file__).resolve().parents[2] / "src" / "ai_evergreen"
    forbidden_import = "boto3"

    violating_files: list[str] = []

    for py_file in get_all_python_files(src_dir):
        # Exclude providers directory from this assertion
        if "providers" in py_file.parts:
            continue

        imported_modules = get_imported_modules(py_file)
        if forbidden_import in imported_modules:
            violating_files.append(str(py_file.relative_to(src_dir)))

    assert not violating_files, (
        f"Architectural boundary breach! The following modules import '{forbidden_import}' "
        f"outside providers: {violating_files}"
    )


def test_trusted_kernel_isolation_boundary() -> None:
    """trusted_kernel/AGENTS.md: No LLM calls of any kind originate from trusted_kernel.

    It must remain deterministic-only and fail-closed.
    """
    kernel_dir = Path(__file__).resolve().parents[2] / "src" / "ai_evergreen" / "trusted_kernel"
    forbidden_imports = {"providers", "boto3", "openai", "anthropic"}

    violating_files: list[str] = []

    for py_file in get_all_python_files(kernel_dir):
        imported_modules = get_imported_modules(py_file)
        intersections = imported_modules.intersection(forbidden_imports)
        if intersections:
            violating_files.append(f"{py_file.name} imports {intersections}")

    assert not violating_files, (
        f"Trusted Kernel violation! Forbidden imports detected in kernel: {violating_files}"
    )


def test_critical_test_cannot_be_excluded() -> None:
    """Inviolable rule: A critical invariant test can never be excluded from regression."""
    with pytest.raises(ValueError, match="Inviolable rule breach: Critical invariant test"):
        TestSelectionItem(
            test_id="test_payment_invariant",
            workload_id="app-refund",
            test_name="Payment ceiling invariant",
            is_included=False,  # Excluded!
            is_critical_invariant=True,  # Critical!
            exclusion_reason_code=ExclusionReasonCode.REDUNDANT_WITH_CRITICAL_PACK,
            exclusion_rationale="Attempting to exclude critical test.",
        )


def test_non_critical_exclusion_requires_reason() -> None:
    """Audit rule: Excluded non-critical test must specify reason code and rationale."""
    with pytest.raises(ValueError, match="Audit rule breach: Excluded test"):
        TestSelectionItem(
            test_id="test_formatting",
            workload_id="app-refund",
            test_name="Formatting check",
            is_included=False,
            is_critical_invariant=False,
            exclusion_reason_code=None,  # Missing reason!
            exclusion_rationale=None,
        )


def test_valid_exclusion_succeeds() -> None:
    """Valid test exclusion with explicit reason code and rationale passes validation."""
    item = TestSelectionItem(
        test_id="test_formatting",
        workload_id="app-refund",
        test_name="Formatting check",
        is_included=False,
        is_critical_invariant=False,
        exclusion_reason_code=ExclusionReasonCode.REDUNDANT_WITH_CRITICAL_PACK,
        exclusion_rationale="Formatting is verified by deterministic schema check in step 1.",
    )
    assert item.is_included is False
    assert item.exclusion_reason_code == ExclusionReasonCode.REDUNDANT_WITH_CRITICAL_PACK


def test_change_event_dedup_hash_is_deterministic(sample_change_event: ChangeEvent) -> None:
    """Changing event timestamp or correlation ID does not alter deduplication hash."""
    h1 = sample_change_event.compute_dedup_hash()

    identical_event = sample_change_event.model_copy(update={"correlation_id": "different-corr-id"})
    h2 = identical_event.compute_dedup_hash()

    assert h1 == h2, "Deduplication hash must depend solely on functional change keys."


def test_evidence_package_tamper_detection(sample_approval_record: ApprovalRecord) -> None:
    """Tamper-evident seal: Altering verdicts or approval invalidates package digest."""
    verdict = EvaluationVerdict(
        test_id="test_refund_ceiling",
        workload_id="app-refund-agent",
        deterministic_passed=True,
        probabilistic_score=0.98,
        latency_ms=120.0,
        cost_usd=0.002,
    )

    pkg = EvidencePackage(
        package_id="pkg-2026-001",
        event_id="evt-2026-001",
        workload_id="app-refund-agent",
        baseline_model_id="claude-3-haiku",
        candidate_model_id="claude-3-5-haiku",
        treatment=TreatmentOutcome.CANARY,
        evaluation_verdicts=[verdict],
        approval_record=sample_approval_record,
        correlation_id="corr-123",
    )
    pkg.seal_package()
    original_digest = pkg.package_digest
    assert len(original_digest) == 64

    # Alter verdict list
    pkg.evaluation_verdicts.append(
        EvaluationVerdict(
            test_id="test_tampered",
            workload_id="app-refund-agent",
            deterministic_passed=False,
            latency_ms=50.0,
            cost_usd=0.001,
        )
    )
    pkg.seal_package()
    tampered_digest = pkg.package_digest

    assert original_digest != tampered_digest, (
        "Altered evidence package must yield different digest!"
    )
