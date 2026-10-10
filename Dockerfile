# ==============================================================================
# AI Evergreen — Multi-stage Enterprise Dockerfile
# Base: Python 3.12-slim (Debian bookworm)
# ==============================================================================

# --- Stage 1: Builder ---------------------------------------------------------
FROM python:3.12-slim AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml README.md ./
COPY src/ ./src/

# Install build backend and create wheels
RUN pip install --no-cache-dir --upgrade pip setuptools wheel hatchling && \
    pip wheel --no-cache-dir --wheel-dir=/build/wheels -e ".[dashboard,dev]"

# --- Stage 2: Runtime ---------------------------------------------------------
FROM python:3.12-slim AS runtime

LABEL org.opencontainers.image.title="AI Evergreen Control Plane" \
      org.opencontainers.image.description="Enterprise AI Qualification Control Plane" \
      org.opencontainers.image.version="0.1.0"

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/home/appuser/.local/bin:${PATH}" \
    PYTHONPATH="/app/src"

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create unprivileged application user
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -m -s /bin/bash appuser

WORKDIR /app

# Copy built wheels from builder stage and install
COPY --from=builder /build/wheels /wheels
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir /wheels/*.whl && \
    rm -rf /wheels

# Copy application source and documentation
COPY pyproject.toml README.md ./
COPY src/ ./src/
COPY docs/ ./docs/
COPY dashboard/ ./dashboard/
COPY data/ ./data/

# Create runtime directories with non-root ownership
RUN mkdir -p /app/data /app/evidence_store && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 8000 8501

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || curl -f http://localhost:8501/_stcore/health || exit 1

CMD ["uvicorn", "ai_evergreen.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
