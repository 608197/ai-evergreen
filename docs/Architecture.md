# Architecture — AI Evergreen (Feasibility Spike)

Scope note: this document translates the charter's conceptual architecture
(§11), technical spike architecture (§20) and infrastructure requirements
(§21) into an implementation-ready structure. The **folder structure** is a
spike-scaffolding proposal (not literally specified in the charter) that
follows the charter's component boundaries and its "modular adapters" /
"configuration-driven providers" non-functional requirements.

---

## 1. Design Decision: Modular Monolith, Not Microservices

The charter lists 17 conceptual components, each with a defined production
target (often "managed service," "durable workflow engine," etc.). Building
17 separate deployables in a four-week spike would fail the charter's own
"Ease of Implementation" concern. Instead:

> **DESIGN DECISION:** The spike is one FastAPI application with 17 clearly
> bounded internal modules, each matching a conceptual component 1:1. Module
> boundaries are strict (see `docs/Interfaces.md`) so that splitting any
> module into a real microservice later is a deployment change, not a
> rewrite.

This directly follows the charter's spike-technology column ("Python
orchestration service," "Must build minimal") rather than its
production-target column (which is roadmap, not spike).

---

## 2. Component Map

Each row is one conceptual component from the charter, its purpose, and its
module in this repository.

| Component | Purpose | Module |
|---|---|---|
| Change Signal Monitor | Detect provider/internal changes | `change_signal/` |
| AI Estate Discovery Connectors | Discover estate metadata (repos, configs, gateways, traces) | `discovery/` |
| AI Dependency Graph | Represent dependencies as a versioned graph | `graph/` |
| Change Impact Agent | Reason over change + graph to hypothesize affected set | `impact_agent/` |
| Workload and Risk Classifier | Tier qualification depth | `risk/` |
| Test Asset Discovery Adapter | Find and map tests (Jira/Xray/ADO/repos) | `test_assets/` |
| Adaptive Regression Planner | Select/exclude tests with rationale | `regression/` |
| Missing-Test Generator | Propose absent tests | `missing_tests/` |
| Qualification Orchestrator | Coordinate execution (workflow) | `orchestrator/` |
| Deterministic Evaluator | Check hard invariants | `evaluators/deterministic/` |
| Probabilistic Evaluator | Score open-ended quality | `evaluators/probabilistic/` |
| Trajectory/Tool-Call Evaluator | Assess agent path | `evaluators/trajectory/` |
| Cost and Performance Evaluator | Compare economics/latency | `evaluators/cost/` |
| Evidence and Confidence Aggregator | Combine evidence, compute confidence | `evidence/aggregator.py` |
| Recommendation Engine | Propose migrate/canary/investigate/block | `recommendation/` |
| Human Approval Gateway | Capture accountable approval | `approval/` |
| Deployment/Canary Adapter | Execute approved rollout (simulated) | `deployment/` |
| Rollback Controller | Restore last-known-good | `rollback/` |
| Qualification Evidence Store | Retain immutable record | `evidence/store.py` |
| Trusted Kernel | Enforce inviolable controls | `trusted_kernel/` (see nested `AGENTS.md`) |
| Self-Qualification Environment | Qualify Evergreen's own changes | `self_governance/` |
| Dashboard/API | Expose status and evidence | `dashboard/`, `api/` |
| Provider Adapters | Bedrock + second adapter | `providers/` (see nested `AGENTS.md`) |

---

## 3. Data Flow — The Agentic Operating Loop

This is the charter's §14 loop, condensed to the sequence an engineer or
agent needs to implement it. Full per-step controls (timeouts, retries,
human checkpoints) are in `docs/Interfaces.md`.

```
Perceive        → normalize + dedupe a change event
Investigate     → summarize likely technical change, mark unknowns conservative
Discover        → traverse graph, request evidence, flag unresolved critical edges
Assess          → classify materiality + workload risk (rules set a risk floor)
Plan            → select tests, preserve critical invariants, propose missing tests
Execute         → run current vs. candidate (pinned versions, budgets, idempotent)
Verify          → deterministic evaluators first, then probabilistic/trajectory
Expand evidence → only if confidence is below threshold (max 2 expansion cycles)
Recommend       → migrate / canary / investigate / block (policy cannot be
                  overridden by an LLM)
Request approval→ route to accountable human approver; expire + fail closed
Migrate         → create candidate, route approved traffic (simulated adapter)
Monitor         → compare live metrics to pre-approved thresholds
Roll back       → if breached: restore last-known-good, deterministic trigger
Learn           → update graph/contracts/evidence; retain prior versions
```

---

## 4. Technology Stack (Spike)

| Layer | Spike Choice | Notes |
|---|---|---|
| Language / API framework | Python 3.12 + FastAPI 0.115+ | Typed OpenAPI, async support |
| Graph store | NetworkX + SQLite (default) or Neo4j Community 5.x | Default to NetworkX unless a task genuinely needs property-graph queries |
| Metadata DB | SQLite (default) or PostgreSQL 16 | Transactional state/evidence metadata |
| Event queue | In-memory queue (default) or Amazon SQS | Decouple events from qualification runs |
| Workflow | Deterministic Python state machine (default) or Step Functions/Temporal dev server | Durable checkpoints, resumable |
| Provider adapters | `boto3` Bedrock Runtime + one OpenAI-compatible/simulator adapter | Never call an SDK outside `providers/` |
| Test asset adapter | Mock REST fixture (JSON) by default; optional Jira Cloud API | Reuse existing enterprise tests, don't replace them |
| Git/config scanner | Python AST/regex + config parsers | Dependency evidence only, treat repo content as untrusted |
| Observability | OpenTelemetry Collector 0.110+ | Portable traces; PII filters on sensitive spans |
| Test runner | pytest 8.x + jsonschema | Deterministic control over generated/declarative tests |
| Evaluation | Pluggable adapter (DeepEval/Opik/Phoenix or custom rubric) | Avoid platform lock-in |
| Dashboard | Streamlit 1.39+ (default) or minimal React | Fast demo; show data freshness/errors, never a misleading stale view |
| Policy engine | OPA/Rego or deterministic Python rules | Lives only in `trusted_kernel/` |
| Secrets | AWS Secrets Manager (sandbox) / local `.env` excluded from source | Never in code or logs |
| Package management | `uv` (preferred) or Poetry, committed lockfile | |
| Vulnerability scanning | pip-audit / Trivy | |
| SBOM | CycloneDX or Syft | |
| CI/CD | GitHub Actions / Azure DevOps / Jenkins | unit, contract, security, IaC gates |

---

## 5. Infrastructure (Spike Posture)

- **Local dev:** 8 vCPU, 16 GB RAM, 40 GB free, Docker/Podman.
- **Concurrency:** start at 5 concurrent model calls, 2 concurrent
  qualification runs.
- **AWS account:** dedicated sandbox, budgets + alarms configured before
  first run, no production data ever.
- **Environments:** dev, test, qualification, shadow, canary, production
  simulation, rollback — all simulated within the sandbox for the spike.
- **Resilience defaults:** exponential backoff with capped retries, event/run
  idempotency keys, SQS DLQ or local failed-event store, workflow state
  persisted after every step, degraded mode = no autonomous scope reduction
  if the graph or a test source is unavailable (fail toward full regression,
  never toward silently skipping).
- **IaC:** Terraform 1.9+ or AWS CDK 2.x if infrastructure is provisioned;
  no secrets in repo or state outputs.

---

## 6. Folder Structure (Proposed Scaffold)

```
ai-evergreen/
├── AGENTS.md
├── README.md
├── .gitignore
├── .env.example
├── .codex/
│   └── config.toml
├── docs/
│   ├── PRD.md
│   ├── Architecture.md          (this file)
│   ├── Interfaces.md
│   ├── Schema.md
│   ├── Phases.md
│   ├── Tasks.md
│   ├── Risks.md
│   ├── Decisions.md
│   ├── Design.md
│   ├── memory.md
│   └── lessons-learned.md
├── pyproject.toml
├── src/
│   └── ai_evergreen/
│       ├── __init__.py
│       ├── api/                  # FastAPI routers, main.py
│       ├── change_signal/
│       ├── discovery/
│       ├── graph/
│       ├── impact_agent/
│       ├── risk/
│       ├── test_assets/
│       ├── regression/
│       ├── missing_tests/
│       ├── orchestrator/
│       ├── evaluators/
│       │   ├── deterministic/
│       │   ├── probabilistic/
│       │   ├── trajectory/
│       │   └── cost/
│       ├── evidence/              # aggregator.py, store.py
│       ├── recommendation/
│       ├── approval/
│       ├── deployment/
│       ├── rollback/
│       ├── trusted_kernel/        # nested AGENTS.md — deterministic-only
│       ├── self_governance/
│       ├── providers/             # nested AGENTS.md — adapter isolation
│       ├── dashboard/
│       └── common/                # shared Pydantic schemas, config, logging
├── tests/
│   ├── unit/
│   ├── contract/                  # component-boundary contract tests
│   └── evaluation/                 # H1-H12 hypothesis measurement scripts
├── data/
│   ├── synthetic/                  # generator scripts + fixed-seed outputs
│   └── fixtures/                   # Jira/Xray/trace JSON fixtures
└── evidence_store/                  # local write-once evidence output (gitignored)
```

Each `src/ai_evergreen/<module>/` folder should contain, at minimum:
`__init__.py`, the module's core logic, and a `schemas.py` re-exporting the
relevant Pydantic models from `common/` — see `docs/Interfaces.md` for the
exact contract each module must satisfy.

---

## 7. Non-Functional Requirements (Mandatory, Not Optional)

Per the charter's §23.1, these apply to every module in this repository:
modular adapters, configuration-driven providers, deterministic replay,
correlation IDs on every request/event, auditability, idempotency, explicit
error handling (no silent catches), testability, observability, portability,
maintainability. If a task's implementation doesn't satisfy one of these,
treat it as incomplete, not "good enough for the demo."
