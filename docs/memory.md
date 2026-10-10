# Memory — Current State Log

**Read this file first, every session, before re-deriving project state from
scratch.** Update it last, every session — an unupdated memory file counts
as an incomplete task per `AGENTS.md` §7.

Format per entry: date, what changed, what's still open, what to do next.
Newest entry at the top.

---

## 2026-10-10 — Complete AI Evergreen Control Plane Built & Validated (Phases 1-6)

**What changed:**
- **Phase 1 (DevSecOps & Foundation)**: Local git repo, `.gitattributes`, `.editorconfig`, hardened `.gitignore`, multi-stage `Dockerfile`, `compose.yaml`, `.github/workflows/ci.yml`, and `pyproject.toml`.
- **Phase 2 (Core Domain Contracts & Boundaries)**:
  - Built `src/ai_evergreen/common/exceptions.py`, `config.py` (`pydantic-settings`), `protocols.py` (`ModelProviderAdapter`), and `schemas.py` (Pydantic v2 models with SHA-256 deduplication and digital signature hashing).
  - Enforced architectural boundary tests in `tests/contract/test_architecture_boundaries.py` (zero `boto3` outside `providers/`, zero LLM in `trusted_kernel/`, inviolable critical test exclusion prevention).
- **Phase 3 (Synthetic Estate & Dependency Graph)**:
  - Built `src/ai_evergreen/discovery/synthetic_generator.py` generating deterministic, byte-identical enterprise estate (`data/synthetic/estate.json`): 12 applications across 4 risk tiers, 5 specialized agents, 3 models, 120 tests (32 critical invariants), 10 incidents, and 12 seeded regression triggers.
  - Built `src/ai_evergreen/graph/engine.py` (NetworkX-powered reachability, blast radius calculation, and subgraph visualization).
- **Phase 4 (Agentic Engines & Inviolable Policy Kernel)**:
  - Built `src/ai_evergreen/providers/simulator_adapter.py` (100% offline, deterministic simulation of healthy outputs and 12 seeded defect triggers).
  - Built `src/ai_evergreen/change_signal/monitor.py` (signal ingestion and SHA-256 deduplication).
  - Built `src/ai_evergreen/impact_agent/agent.py` (propose-only blast radius evaluation).
  - Built `src/ai_evergreen/regression/planner.py` (adaptive test scoping: 100% critical test inclusion, machine-readable exclusion rationales).
  - Built `src/ai_evergreen/trusted_kernel/kernel.py` (inviolable deterministic policy kernel with 0 LLM calls, fail-closed enforcement of `MIGRATE`, `CANARY`, `INVESTIGATE`, `BLOCK`, and SLA-based canary rollback).
  - Built `src/ai_evergreen/evaluators/harness.py` (differential qualification harness evaluating schema, tool sequence, JSON validity, precision, and latency checks before probabilistic scores).
  - Built `src/ai_evergreen/recommendation/engine.py` and `src/ai_evergreen/rollback/controller.py`.
  - Built `src/ai_evergreen/missing_tests/generator.py` (incident-driven test candidate generation).
- **Phase 5 (Enterprise API & UI Console)**:
  - Built `src/ai_evergreen/api/main.py` (FastAPI REST API endpoints: health, events, blast-radius, evaluations, promotions/approve, canary/evaluate).
  - Built `dashboard/app.py` (Streamlit console with 6 interactive enterprise tabs: Client LLM onboarding, Estate Explorer, Change Ingestion & Blast Radius, Differential Qualification with Seeded Defect injection, Human Approval Gate with digital signatures, Live Canary Telemetry & Auto-Rollback, and Missing-Test Discovery).
- **Phase 6 (Verification & Hardening)**:
  - **26 out of 26 tests passing** across `tests/contract`, `tests/unit`, `tests/integration`, and `tests/e2e` in 7.04s.
  - **92.04% code coverage** (exceeding strict 80% requirement).
  - **100% seeded defect recall** verified across all 12 real-world defect categories.
  - **0 Ruff linter errors** and standard formatted code.
  - Comprehensive enterprise `README.md` created with architecture, EC2 CloudBoost deployment guide, and local quickstart.
- **Remote Git & Topology Note**: Remote repository `https://github.com/608197/ai-evergreen.git` created and authenticated via GitHub Personal Access Token (PAT). All future push operations from local and clone/pull operations inside the Amazon Linux EC2 VM must use PAT authentication.

**What's still open:**
- Commit all changes to local Git and push to GitHub remote repository.
- Pull and run `docker compose up --build -d` on the Amazon Linux EC2 VM.

**Next step:**
- Commit to git repository and provide the user with the remote push and EC2 execution commands.

---

## 2026-10-10 — Track B confirmed & Phase 1 Foundation established

**What changed:**
- Formally confirmed execution on Track B (Compressed 4-Day Techathon Track) with Enterprise Invariants (100% deterministic agents, zero rogue agent tolerance, fail-closed policy).
- Initialized local Git repository (`.git`).
- Created `.gitattributes` enforcing LF line endings across Windows and Linux container environments.
- Created `.editorconfig` setting 4-space indentation, UTF-8, and LF endings.
- Hardened `.gitignore` to cover coverage, hypothesis, and local environment artifacts.
- Created production-ready multi-stage `Dockerfile` (Python 3.12-slim, non-root user `appuser`, healthcheck).
- Created `compose.yaml` orchestrating FastAPI API and Streamlit Dashboard with persistent volume mounts.
- Created `.github/workflows/ci.yml` for automated linting, strict typing, tests, and pip-audit security scanning.
- Hardened `pyproject.toml` with strict mypy (`strict = true`), expanded Ruff SAST rules, `pydantic-settings`, and `pytest-cov`.

**What's still open:**
- Implementation of Phase 2 core domain contracts in `src/ai_evergreen/common/` (`schemas.py`, `protocols.py`, `config.py`, `exceptions.py`).
- Architectural boundary test suite in `tests/contract/test_architecture_boundaries.py`.
- Deterministic synthetic estate generator in `data/synthetic/`.

**Next step:**
- Implement Phase 2: executable domain contracts and type-safe settings in `src/ai_evergreen/common/`.
- Verify architectural boundary tests pass.

---

## 2026-09-07 — Documentation baseline created

**What changed:**
- Full Codex-ready documentation set created: `AGENTS.md`, `.codex/config.toml`,
  `README.md`, `.gitignore`, `.env.example`, and `docs/{PRD,Architecture,
  Interfaces,Schema,Phases,Tasks,Risks,Decisions,Design}.md`.
- Content is scoped strictly to the approved Concept Charter and Feasibility
  Spike Plan (v0.9, 03 September 2026) plus the elevated Techathon
  positioning agreed on 07 September 2026. No new features or scope were
  invented beyond what's in those two sources.
- Nested `AGENTS.md` files created for `src/ai_evergreen/trusted_kernel/`
  and `src/ai_evergreen/providers/` — the two highest-control-boundary
  components — with stricter rules than the root file.
- No application code exists yet. This is a documentation-and-scaffolding
  commit only.

**What's still open:**
- Track decision not yet made: four-week spike vs. compressed 4-day
  Techathon track (`docs/Phases.md` §0). Confirm and log here before
  starting Day/Week 1.
- Open Questions OQ-01 through OQ-18 (`docs/PRD.md` §12) remain unresolved
  — none block starting Day 1, but OQ-16 (candidate model pair) and OQ-15
  (preferred spike cloud) should be resolved before Day 2 (account/model
  access).
- Assumptions A-01 through A-06 (`docs/PRD.md` §13) not yet validated
  against real sandbox access — first real signal expected Day 2.

**Next step:**
- Human review/validation of this full documentation set (in progress per
  user's own review process).
- Once validated: confirm track (A vs. B), then begin Day 1 / D1 tasks in
  `docs/Tasks.md`.

---

## Template for Future Entries

```
## YYYY-MM-DD — Short summary

**What changed:**
-

**What's still open:**
-

**Next step:**
-
```
