"""Executable domain schemas for AI Evergreen Control Plane.

Translates markdown contracts from docs/Interfaces.md and docs/Schema.md
into strict Pydantic v2 models with deterministic validations and hash helpers.
"""

import hashlib
import json
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field, model_validator


class RiskTier(str, Enum):
    """Workload criticality risk tier."""

    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class TreatmentOutcome(str, Enum):
    """The four explicit qualification treatments."""

    MIGRATE = "MIGRATE"
    CANARY = "CANARY"
    INVESTIGATE = "INVESTIGATE"
    BLOCK = "BLOCK"


class EvidenceClass(str, Enum):
    """Provenance class for dependency claims and test assets."""

    RUNTIME_OBSERVED = "RUNTIME_OBSERVED"
    CONFIGURATION_DECLARED = "CONFIGURATION_DECLARED"
    CODE_INFERRED = "CODE_INFERRED"
    MANUALLY_ATTESTED = "MANUALLY_ATTESTED"
    LLM_INFERRED = "LLM_INFERRED"


class ChangeType(str, Enum):
    """Category of change event detected."""

    MODEL_VERSION_UPGRADE = "MODEL_VERSION_UPGRADE"
    MODEL_DEPRECATION = "MODEL_DEPRECATION"
    PRICE_PERFORMANCE_CHANGE = "PRICE_PERFORMANCE_CHANGE"
    SAFETY_BEHAVIOR_DRIFT = "SAFETY_BEHAVIOR_DRIFT"
    TOOL_SCHEMA_CHANGE = "TOOL_SCHEMA_CHANGE"


class ExclusionReasonCode(str, Enum):
    """Strict machine-readable reason codes for excluding tests from regression."""

    REDUNDANT_WITH_CRITICAL_PACK = "REDUNDANT_WITH_CRITICAL_PACK"
    OUT_OF_AFFECTED_SCOPE = "OUT_OF_AFFECTED_SCOPE"
    COVERED_BY_PROPERTY_TEST = "COVERED_BY_PROPERTY_TEST"
    DEPRECATED_TEST_ASSET = "DEPRECATED_TEST_ASSET"
    BUDGET_CONTAINMENT_HEURISTIC = "BUDGET_CONTAINMENT_HEURISTIC"


class ApprovalStatus(str, Enum):
    """Human approval lifecycle status."""

    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"


class WorkloadEnvironment(str, Enum):
    """Application deployment target environment."""

    PRODUCTION = "PRODUCTION"
    STAGING = "STAGING"
    DEVELOPMENT = "DEVELOPMENT"


class ChangeEvent(BaseModel):
    """Normalized change event representation."""

    event_id: str
    source: str
    model_or_component_id: str
    current_version: str
    candidate_version: str
    change_type: ChangeType
    detected_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    raw_payload_ref: Optional[str] = None
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    correlation_id: str

    def compute_dedup_hash(self) -> str:
        """Compute deterministic SHA-256 hash for deduplication."""
        raw = f"{self.source}:{self.model_or_component_id}:{self.current_version}:{self.candidate_version}:{self.change_type.value}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()


class EvidenceClaim(BaseModel):
    """A single graph dependency edge assertion with provenance."""

    claim_id: str
    entity_id: str
    target_entity_id: str
    relationship_type: str
    confidence: float = Field(ge=0.0, le=1.0)
    evidence_class: EvidenceClass
    source_ref: str
    observed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BehaviouralContract(BaseModel):
    """The 20-field Behavioral Contract governing an AI workload."""

    intended_purpose: str
    approved_model_role: str
    system_prompt_version: str
    allowed_inputs: list[str] = Field(default_factory=list)
    allowed_outputs: list[str] = Field(default_factory=list)
    required_schemas: list[str] = Field(default_factory=list)
    allowed_tools: list[str] = Field(default_factory=list)
    prohibited_tools: list[str] = Field(default_factory=list)
    policy_invariants: list[str] = Field(default_factory=list)
    required_evidence: list[str] = Field(default_factory=list)
    business_outcome: str
    latency_threshold_ms: float = Field(gt=0.0)
    token_cost_ceiling_usd: float = Field(gt=0.0)
    safety_requirements: list[str] = Field(default_factory=list)
    refusal_requirements: list[str] = Field(default_factory=list)
    human_approval_requirement: bool = True
    critical_test_set: list[str] = Field(default_factory=list)
    shadow_canary_requirement: bool = False
    rollback_thresholds: dict[str, float] = Field(default_factory=dict)
    residual_risk_owner: str


class WorkloadProfile(BaseModel):
    """Full operational profile for an AI application."""

    application_id: str
    name: str
    business_process_id: str
    owner: str
    criticality: RiskTier
    environment: WorkloadEnvironment = WorkloadEnvironment.PRODUCTION
    active_model_id: str
    contract: BehaviouralContract


class BlastRadiusHypothesis(BaseModel):
    """Calculated affected applications and risk landscape from a change event."""

    event_id: str
    affected_workloads: list[WorkloadProfile]
    affected_count: int
    highest_risk_tier: RiskTier
    confidence_score: float = Field(ge=0.0, le=1.0)
    correlation_id: str
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TestSelectionItem(BaseModel):
    """An individual test asset scoped for or excluded from regression."""

    __test__ = False  # Inform pytest this is a domain model, not a test suite

    test_id: str
    workload_id: str
    test_name: str
    is_included: bool
    is_critical_invariant: bool
    exclusion_reason_code: Optional[ExclusionReasonCode] = None
    exclusion_rationale: Optional[str] = None

    @model_validator(mode="after")
    def validate_exclusion_has_rationale(self) -> "TestSelectionItem":
        """Inviolable rule: If excluded, machine-readable reason and rationale are required."""
        if not self.is_included:
            if self.is_critical_invariant:
                raise ValueError(
                    f"Inviolable rule breach: Critical invariant test '{self.test_id}' cannot be excluded!"
                )
            if self.exclusion_reason_code is None or not self.exclusion_rationale:
                raise ValueError(
                    f"Audit rule breach: Excluded test '{self.test_id}' must provide reason code and rationale."
                )
        return self


class AdaptiveRegressionPlan(BaseModel):
    """The scoped regression test execution plan."""

    plan_id: str
    event_id: str
    selected_tests: list[TestSelectionItem]
    total_tests_available: int
    included_test_count: int
    excluded_test_count: int
    critical_tests_included_count: int
    estimated_cost_usd: float = Field(ge=0.0)
    estimated_duration_seconds: float = Field(ge=0.0)
    correlation_id: str


class EvaluationVerdict(BaseModel):
    """Result of running differential evaluation on a test case."""

    test_id: str
    workload_id: str
    deterministic_passed: bool
    probabilistic_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    failure_reasons: list[str] = Field(default_factory=list)
    latency_ms: float = Field(ge=0.0)
    cost_usd: float = Field(ge=0.0)
    trace_id: Optional[str] = None


class RecommendationRecord(BaseModel):
    """The qualification recommendation for a workload."""

    recommendation_id: str
    event_id: str
    workload_id: str
    candidate_model_id: str
    treatment: TreatmentOutcome
    confidence: float = Field(ge=0.0, le=1.0)
    rationale: str
    deterministic_passed: bool
    failed_invariants: list[str] = Field(default_factory=list)
    canary_percentage: Optional[int] = Field(default=None, ge=1, le=100)
    correlation_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ApprovalRecord(BaseModel):
    """Tamper-evident human approval gate record."""

    approval_id: str
    recommendation_id: str
    workload_id: str
    candidate_model_id: str
    approver_email: str
    approver_role: str
    status: ApprovalStatus
    decision_rationale: str
    signed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    correlation_id: str
    signature_hash: str = ""

    def compute_signature_hash(self) -> str:
        """Generate SHA-256 signature for immutable human audit."""
        payload = {
            "approval_id": self.approval_id,
            "recommendation_id": self.recommendation_id,
            "workload_id": self.workload_id,
            "candidate_model_id": self.candidate_model_id,
            "approver_email": self.approver_email,
            "approver_role": self.approver_role,
            "status": self.status.value,
            "decision_rationale": self.decision_rationale,
            "signed_at": self.signed_at.isoformat(),
            "correlation_id": self.correlation_id,
        }
        serialized = json.dumps(payload, sort_keys=True)
        return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


class EvidencePackage(BaseModel):
    """Immutable, tamper-evident qualification evidence package."""

    package_id: str
    event_id: str
    workload_id: str
    baseline_model_id: str
    candidate_model_id: str
    treatment: TreatmentOutcome
    evaluation_verdicts: list[EvaluationVerdict]
    approval_record: Optional[ApprovalRecord] = None
    correlation_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    package_digest: str = ""

    def seal_package(self) -> "EvidencePackage":
        """Compute SHA-256 seal across all verdicts and approval state."""
        raw_data: dict[str, Any] = {
            "package_id": self.package_id,
            "event_id": self.event_id,
            "workload_id": self.workload_id,
            "baseline_model_id": self.baseline_model_id,
            "candidate_model_id": self.candidate_model_id,
            "treatment": self.treatment.value,
            "verdict_count": len(self.evaluation_verdicts),
            "correlation_id": self.correlation_id,
            "approval_id": self.approval_record.approval_id if self.approval_record else None,
        }
        serialized = json.dumps(raw_data, sort_keys=True)
        self.package_digest = hashlib.sha256(serialized.encode("utf-8")).hexdigest()
        return self
