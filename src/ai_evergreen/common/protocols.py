"""Formal interface protocols and invocation models for Model Provider Adapters.

Enforces provider-neutral core design per AGENTS.md Principle 6.
"""

from typing import Any, Optional, Protocol, runtime_checkable

from pydantic import BaseModel, Field


class ModelInvocationRequest(BaseModel):
    """Normalized input payload for invoking any model provider."""

    model_id: str
    prompt: str
    system_prompt: Optional[str] = None
    temperature: float = Field(default=0.0, ge=0.0, le=2.0)
    max_tokens: int = Field(default=1024, gt=0)
    stop_sequences: list[str] = Field(default_factory=list)
    seed: Optional[int] = None
    tools: Optional[list[dict[str, Any]]] = None
    tool_choice: Optional[str] = None
    correlation_id: str
    workload_id: Optional[str] = None


class ModelInvocationResult(BaseModel):
    """Normalized response payload from any model provider."""

    raw_text: str
    finish_reason: str
    input_tokens: int = Field(ge=0)
    output_tokens: int = Field(ge=0)
    latency_ms: float = Field(ge=0.0)
    estimated_cost_usd: float = Field(ge=0.0)
    model_id: str
    model_version: Optional[str] = None
    provider_name: str
    tool_calls: list[dict[str, Any]] = Field(default_factory=list)
    correlation_id: str
    raw_response_digest: str  # SHA-256 digest of raw provider payload


class ProviderHealth(BaseModel):
    """Health check outcome for a model provider."""

    is_healthy: bool
    latency_ms: float = Field(ge=0.0)
    provider_name: str
    error_message: Optional[str] = None


class RateLimitStatus(BaseModel):
    """Current rate limit and quota consumption status."""

    remaining_requests: Optional[int] = None
    remaining_tokens: Optional[int] = None
    daily_budget_remaining_usd: float = Field(ge=0.0)
    is_throttled: bool = False


@runtime_checkable
class ModelProviderAdapter(Protocol):
    """Contract for all model provider adapters (Bedrock, OpenAI, Simulator).

    Business logic outside `ai_evergreen.providers` must interact strictly
    through this interface.
    """

    def invoke(self, request: ModelInvocationRequest) -> ModelInvocationResult:
        """Invoke the target model synchronously with normalized parameters."""
        ...

    def check_health(self) -> ProviderHealth:
        """Validate connectivity, credentials, and endpoint latency."""
        ...

    def get_rate_limit_status(self) -> RateLimitStatus:
        """Query current rate limits and remaining budget."""
        ...
