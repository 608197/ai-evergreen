"""Domain exception taxonomy for AI Evergreen Control Plane.

All exceptions inherit from AIEvergreenError to enforce explicit,
deterministic error handling and fail-closed behaviors across all 17 modules.
"""

from typing import Any, Optional


class AIEvergreenError(Exception):
    """Base exception for all domain errors within AI Evergreen."""

    def __init__(self, message: str, details: Optional[dict[str, Any]] = None) -> None:
        super().__init__(message)
        self.message = message
        self.details = details or {}


class KernelViolationError(AIEvergreenError):
    """Raised when an inviolable Trusted Kernel policy is breached.

    The Trusted Kernel must fail-closed on this error.
    """


class PolicyViolationError(AIEvergreenError):
    """Raised when an agent proposal or action violates an established policy invariant."""


class ProviderUnavailableError(AIEvergreenError):
    """Raised when an upstream model provider or adapter fails, times out, or returns 5xx."""


class BlastRadiusUncertaintyError(AIEvergreenError):
    """Raised when dependency reachability or blast radius calculation is ambiguous."""


class StaleDependencyError(AIEvergreenError):
    """Raised when graph dependency edges exceed maximum age without fresh evidence."""


class RollbackThresholdBreachError(AIEvergreenError):
    """Raised during canary evaluation when error/latency thresholds breach SLA."""


class EvidenceTamperedError(AIEvergreenError):
    """Raised when an evidence package fails cryptographic SHA-256 verification."""


class UnauthorizedPromotionError(AIEvergreenError):
    """Raised when candidate promotion is attempted without a signed human approval record."""


class BudgetExceededError(AIEvergreenError):
    """Raised when a qualification run breaches token limits or daily cloud spend."""


class ContractValidationError(AIEvergreenError):
    """Raised when an entity or behavioral contract fails structural or semantic validation."""
