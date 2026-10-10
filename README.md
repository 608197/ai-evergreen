# AI Evergreen Control Plane

**Enterprise Continuous Qualification & Drift Governance Engine for AI Workloads**

[![CI Pipeline](https://github.com/enterprise/ai-evergreen/actions/workflows/ci.yml/badge.svg)](https://github.com/enterprise/ai-evergreen/actions/workflows/ci.yml)
[![Tests Passing](https://img.shields.io/badge/tests-26%20passed-success)](tests/)
[![Coverage](https://img.shields.io/badge/coverage-92.04%25-brightgreen)](tests/)
[![Deterministic Kernel](https://img.shields.io/badge/kernel-fail--closed%20%7C%20zero--LLM-blue)](src/ai_evergreen/trusted_kernel/)
[![Python 3.12+](https://img.shields.io/badge/python-3.12%2B-blue)](pyproject.toml)

> **"One AI dependency changes. AI Evergreen predicts the enterprise blast radius, coordinates proportional differential qualification, and enforces cryptographic, tamper-evident governance before production promotion."**

---

## 1. Executive Summary & Problem Proposition

Enterprise applications increasingly depend on non-deterministic Large Language Models (LLMs), agentic frameworks, and RAG retrieval pipelines. When model providers release silent weights updates, version deprecations, prompt adjustments, or context window expansions:
1. **Unpredictable Blast Radius**: Upstream changes silently break downstream multi-tenant agents and business workflows.
2. **Exhaustive Testing Paralysis**: Running full regression test suites on every minor dependency shift is cost-prohibitive and slow.
3. **The "Rogue Agent" & Compliance Crisis**: Autonomous agents cannot self-promote models without deterministic human oversight and cryptographic auditability.

**AI Evergreen** solves this with a **Deterministic Control Plane**:
- **Proportional Blast Radius Analysis**: NetworkX-powered dependency graph pinpoints exact downstream services affected.
- **Adaptive Test Scoping**: Automatically selects relevant regressions with an **inviolable 100% critical invariant rule**.
- **Differential Qualification Harness**: Runs deterministic schema, tool sequence, JSON validity, precision, and latency checks *before* evaluating probabilistic scores.
- **Fail-Closed Inviolable Trusted Kernel**: Pure Python policy engine with **zero LLM calls** that strictly blocks non-compliant models.
- **Tamper-Evident Governance**: SHA-256 sealed Evidence Packages and signed digital human approval gates.
- **Live SLA Canary & Auto-Rollback**: Automated detection of production telemetry breaches and instant rollback to the baseline model.

---

## 2. Inviolable Governance Principles (Zero Rogue Agents)

To ensure fair, ethical, transparent, observable, and strictly deterministic execution:

| Invariant | Enforcement Mechanism | Failure Consequence |
|---|---|---|
| **Zero LLM in Decision Kernel** | `TrustedKernel` is pure deterministic code with zero network or provider dependencies. Verified via AST boundary tests in `tests/contract/test_architecture_boundaries.py`. | Build rejected at CI gate. |
| **Fail-Closed Default** | If any evaluation data is ambiguous or deterministic check fails, outcome is strictly `BLOCK`. | Model cannot proceed to staging or production. |
| **100% Critical Invariant Tests** | `AdaptiveRegressionPlanner` and Pydantic validators forbid excluding critical tests under any circumstance. | Raises `ValueError` / validation failure. |
| **Mandatory Exclusion Rationale** | Any non-critical test exclusion requires a valid enum code (`OUT_OF_AFFECTED_SCOPE`, etc.) and a human-readable audit justification. | Excluded tests without reasons are rejected. |
| **Mandatory Signed Human Approval** | `TrustedKernel.authorize_production_promotion()` requires a cryptographically signed `ApprovalRecord`. | Attempting to promote without signoff raises `UnauthorizedPromotionError`. |
| **Tamper-Evident Evidence** | All evidence packages, test verdicts, and approval records calculate SHA-256 digests across canonical representations. | Altering a single byte causes `EvidenceTamperedError`. |
| **SLA Canary Rollback** | If canary error rate delta or p99 latency breaches policy thresholds, traffic is reverted to the last known good model. | Immediate automated rollback execution. |

---

## 3. High-Level Architecture & 6 Qualification Phases

```
                ┌────────────────────────────────────────────────────────┐
                │          1. Change Signal Ingestion & Dedup            │
                │     (Bedrock / Azure / Vertex / HuggingFace / API)     │
                └───────────────────────────┬────────────────────────────┘
                                            │ ChangeEvent (SHA-256 deduplicated)
                                            ▼
                ┌────────────────────────────────────────────────────────┐
                │            2. Dependency Graph Blast Radius            │
                │         (NetworkX Graph Engine + Impact Agent)         │
                └───────────────────────────┬────────────────────────────┘
                                            │ BlastRadiusHypothesis (Affected Apps)
                                            ▼
                ┌────────────────────────────────────────────────────────┐
                │              3. Adaptive Regression Scoping            │
                │      (100% Critical Tests + Scoped Non-Critical)       │
                └───────────────────────────┬────────────────────────────┘
                                            │ AdaptiveRegressionPlan
                                            ▼
                ┌────────────────────────────────────────────────────────┐
                │             4. Differential Qualification              │
                │  (Schema -> Tool Sequence -> Precision -> Probabilistic)│
                └───────────────────────────┬────────────────────────────┘
                                            │ List[EvaluationVerdict]
                                            ▼
                ┌────────────────────────────────────────────────────────┐
                │          5. Trusted Kernel Policy Determination        │
                │        (MIGRATE / CANARY / INVESTIGATE / BLOCK)        │
                └───────────────────────────┬────────────────────────────┘
                                            │ Tamper-Evident Evidence Package (SHA-256)
                                            ▼
                ┌────────────────────────────────────────────────────────┐
                │             6. Human Approval & Canary Telemetry       │
                │     (Cryptographic Signoff -> Automated Rollback)      │
                └────────────────────────────────────────────────────────┘
```

---

## 4. Synthetic Enterprise Estate & 100% Defect Detection

The system includes a fully reproducible, deterministic enterprise estate (`data/synthetic/estate.json`) featuring:
- **12 Enterprise Applications**: Spanning `CRITICAL` (Refund Agent, Medical Triage, KYC/AML), `HIGH` (Claims Adjuster, Contract Analyzer), `MEDIUM` (HR Bot, IT Desk, Code Review, Summarizer), and `LOW` (Marketing, FAQ, Release Notes).
- **5 Specialized Agents**: `financial_refund_agent`, `medical_intake_triage`, `regulatory_kyc_screener`, `claims_adjuster`, `legal_contract_auditor`.
- **120 Comprehensive Test Assets**: Including **32 Critical Invariant Tests** with zero-tolerance assertions.
- **12 Real-World Seeded Regression Triggers**:

| Defect ID | Defect Category | Real-World Failure Scenario | Detection Rate |
|---|---|---|---|
| `DEFECT_01` | JSON Schema Drift | Candidate returns top-level `refund_approved` boolean instead of required nested object. | **100%** |
| `DEFECT_02` | Markdown Code Fencing | Candidate wraps JSON output inside triple backticks (` ```json `), breaking downstream parsers. | **100%** |
| `DEFECT_03` | Tool Call Inversion | Candidate calls `ledger_post` before calling `order_lookup`, violating financial causal ordering. | **100%** |
| `DEFECT_04` | Tool Argument Type Drift | Candidate passes integer `10042` instead of required string identifier `"10042"`. | **100%** |
| `DEFECT_05` | System Prompt Ignored | Candidate includes speculative commentary violating explicit enterprise policy constraints. | **100%** |
| `DEFECT_06` | Refusal Inversion | Candidate outputs safety refusal on benign medical diagnostic prompt ("cannot provide advice"). | **100%** |
| `DEFECT_07` | Context Window Truncation | Candidate silently truncates final clauses in 45-page contract review prompt. | **100%** |
| `DEFECT_08` | Currency Precision Rounding | Financial refund calculated with 4 decimal places instead of fixed 2 decimal cents. | **100%** |
| `DEFECT_09` | Date Format Inversion | Regulatory report generated with `MM/DD/YYYY` instead of mandated ISO 8601 `YYYY-MM-DD`. | **100%** |
| `DEFECT_10` | PII Masking Regression | Patient SSN returned unmasked in response payload. | **100%** |
| `DEFECT_11` | Latency SLA Spike | P99 inference latency triples from 800ms to 2850ms, breaching operational SLA. | **100%** |
| `DEFECT_12` | Token Cost Surge | Token consumption increases by 320% due to verbose chain-of-thought generation. | **100%** |

*All 12 defects are verified with 100% recall in `tests/unit/test_seeded_regressions.py`.*

---

## 5. Deployment Topology: From Local Workstation to EC2 CloudBoost VM

Because the Amazon Linux EC2 CloudBoost instance cannot be connected directly from Antigravity, code flows through a secure GitHub repository and executes in an isolated Docker container:

```
+--------------------+        git push         +--------------------+
| Local Workstation  |  -------------------->  | GitHub Repository  |
| (Code + Tests)     |                         | (Remote Source)    |
+--------------------+                         +---------+----------+
                                                         |
                                             git pull    |
                                                         v
                                               +--------------------+
                                               | Amazon Linux VM    |
                                               | (EC2 CloudBoost)   |
                                               |                    |
                                               |   Docker Compose   |
                                               |   - API (:8000)    |
                                               |   - UI (:8501)     |
                                               +--------------------+
```

### Step 1: Push Local Build to GitHub

```powershell
# In Windows PowerShell:
cd "C:\Extra Work\IEP Techathon 2026\ai-evergreen"

# Add remote origin (replace with your repository URL)
git remote add origin https://github.com/<your-org-or-username>/ai-evergreen.git
git branch -M main
git push -u origin main
```

### Step 2: Pull and Run on Amazon Linux EC2 Instance

Connect to your Amazon Linux EC2 CloudBoost terminal via SSH, clone the repository, and start the containerized stack:

```bash
# 1. Clone repository
git clone https://github.com/<your-org-or-username>/ai-evergreen.git
cd ai-evergreen

# 2. Configure environment
cp .env.example .env

# 3. Start API and Dashboard services via Docker Compose
docker compose up --build -d

# 4. Verify running containers
docker compose ps
```

The containerized stack exposes:
- **FastAPI REST API**: `http://<EC2-HOST>:8000` (OpenAPI Docs at `/docs`)
- **Enterprise Streamlit Console**: `http://<EC2-HOST>:8501`

---

## 6. Enterprise UI: Streamlit Governance Console

The Streamlit dashboard (`dashboard/app.py`) provides 6 interactive tabs designed for enterprise operations, compliance officers, and AI engineers:

1. **Client LLM Connection & Credentials**:
   - Live configuration for **AWS Bedrock**, **AWS SageMaker**, **Azure OpenAI**, **Google Vertex AI**, **Anthropic Direct**, **Ollama (Self-Hosted)**, or the **Offline Deterministic Simulator**.
   - Tests credentials and IAM role assumptions before running any evaluation.
2. **Estate & Graph Explorer**:
   - Real-time visualization of 12 enterprise applications, active models, risk tiers, and dependency connections.
   - Filters workloads by criticality (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
3. **Change Ingestion & Blast Radius**:
   - Ingests model updates (e.g. Claude 3 Haiku deprecation $\rightarrow$ Claude 3.5 Haiku upgrade).
   - Computes deterministic blast radius and displays affected workloads with confidence scores.
4. **Differential Qualification & Defect Detection**:
   - Executes regression test suites across affected applications.
   - Evaluates deterministic invariants first (Schema, Tool Sequence, Precision, Latency) before probabilistic scores.
   - Interactive simulator allows triggering any of the **12 Seeded Defects** to observe immediate **BLOCK** enforcement.
5. **Human Approval Gate & Cryptographic Sealing**:
   - Enforces digital sign-off by Compliance Officers, Enterprise Risk Managers, or System Owners.
   - Computes SHA-256 digital signature hashes and seals Evidence Packages.
   - Strictly refuses authorization if the Trusted Kernel marked the candidate model as `BLOCK`.
6. **Live SLA Canary & Auto-Rollback**:
   - Monitors real-time canary error rates and latency telemetry.
   - Simulates telemetry SLA breaches (e.g., error rate delta $> 0.005$) and triggers instantaneous automated rollback to the baseline model.
7. **Missing-Test Discovery Engine**:
   - Analyzes recent incident reports and identifies coverage gaps.
   - Generates candidate test specifications with zero-tolerance invariants.

---

## 7. Local Development & Verification

### Prerequisites
- Python 3.12 or higher (Python 3.14 compatible)
- Docker & Docker Compose (optional for local containerized run)

### Running Locally without Containers

```bash
# 1. Install dependencies in editable mode
pip install -e ".[dev,dashboard]"

# 2. Run the complete test suite (26 tests across contract, unit, integration, and E2E)
python -m pytest tests/ -v

# 3. Run test coverage audit (Enforces >80% coverage; achieved: 92.04%)
python -m pytest tests/ --cov=src/ai_evergreen --cov-report=term-missing

# 4. Run Ruff SAST and linter
python -m ruff check src tests
python -m ruff format --check src tests

# 5. Start the REST API server
python -m uvicorn ai_evergreen.api.main:app --host 0.0.0.0 --port 8000

# 6. Start the Streamlit Dashboard (in a separate terminal)
python -m streamlit run dashboard/app.py --server.port 8501
```

---

## 8. Verification Results

| Quality Gate | Metric | Target | Result | Status |
|---|---|---|---|---|
| **Contract Boundaries** | Boto3 isolation & Kernel isolation | 0 leaks | 0 leaks detected | **PASSED** |
| **Unit & Integration Tests** | 26 test cases across all components | 100% pass | 26 passed in 7.04s | **PASSED** |
| **Code Coverage** | Line and branch coverage | $\ge 80\%$ | **92.04%** | **PASSED** |
| **Seeded Defect Recall** | 12 real-world regression triggers | 100% recall | 12/12 detected (100%) | **PASSED** |
| **Static Code Analysis (SAST)**| Ruff security & style rules | 0 errors | 0 errors | **PASSED** |
| **Reproducibility** | Synthetic estate serialization | Byte-identical | Identical SHA-256 | **PASSED** |

---

## 9. License

Proprietary enterprise solution built for IEP Techathon 2026.
