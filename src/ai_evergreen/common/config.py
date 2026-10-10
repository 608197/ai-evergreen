"""Type-safe configuration management using pydantic-settings.

Enforces fail-fast validation at startup for environment variables,
cloud spend budgets, token ceilings, and IAM credentials.
"""

from enum import Enum
from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(str, Enum):
    """Execution environment mode."""

    DEVELOPMENT = "development"
    TESTING = "testing"
    STAGING = "staging"
    PRODUCTION = "production"


class GraphBackend(str, Enum):
    """Underlying dependency graph storage engine."""

    NETWORKX = "networkx"
    NEO4J = "neo4j"


class ProviderMode(str, Enum):
    """Model provider execution mode."""

    BEDROCK = "bedrock"
    SIMULATOR = "simulator"
    OPENAI_COMPATIBLE = "openai_compatible"


class JiraAdapterMode(str, Enum):
    """Test asset management adapter mode."""

    MOCK = "mock"
    LIVE = "live"


class Settings(BaseSettings):
    """Central configuration for AI Evergreen Control Plane."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # Environment & Logging
    environment: Environment = Environment.DEVELOPMENT
    log_level: str = "INFO"
    log_format: str = "json"

    # Graph Engine
    graph_backend: GraphBackend = GraphBackend.NETWORKX
    neo4j_uri: Optional[str] = None
    neo4j_user: Optional[str] = None
    neo4j_password: Optional[str] = None

    # Model Provider Configuration
    primary_provider_mode: ProviderMode = ProviderMode.SIMULATOR
    second_provider_mode: ProviderMode = ProviderMode.SIMULATOR

    # AWS Bedrock / Ambient IAM Configuration
    aws_region: str = "us-east-1"
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_session_token: Optional[str] = None
    bedrock_current_model_id: str = "anthropic.claude-3-haiku-20240307-v1:0"
    bedrock_candidate_model_id: str = "anthropic.claude-3-5-haiku-20241022-v1:0"

    # OpenAI-Compatible Gateway Configuration
    openai_compatible_base_url: Optional[str] = None
    openai_compatible_api_key: Optional[str] = None

    # Jira / Xray Test Asset Management
    jira_adapter_mode: JiraAdapterMode = JiraAdapterMode.MOCK
    jira_base_url: Optional[str] = None
    jira_api_token: Optional[str] = None
    jira_user_email: Optional[str] = None

    # Strict Budgets & Resource Ceilings
    daily_cloud_budget_usd: float = Field(default=25.0, gt=0.0)
    per_event_token_budget: int = Field(default=200_000, gt=0)

    # Storage & Persistence
    metadata_db_url: str = "sqlite:///./data/metadata.db"
    evidence_local_path: str = "./evidence_store"

    # API Server
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_allowed_origins: list[str] = ["*"]

    # OpenTelemetry
    otel_exporter: str = "console"
    otel_endpoint: Optional[str] = None


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached singleton application settings."""
    return Settings()
