# Interfaces — Component Boundary Contracts

Purpose: this is the file that prevents two different Codex sessions (or two
engineers) from building components that don't fit together. If you are
implementing any module in `src/ai_evergreen/`, read your component's row
here **before** writing code, and do not change an Input/Output shape
without updating this file in the same change.

Source grounding: inputs/outputs/failure-modes/fallbacks below are drawn
directly from Concept Charter §11 (Conceptual Architecture table). Anything
marked **(spike scaffolding)** is a reasonable implementation proposal not
literally specified in the charter — flag it in `docs/Decisions.md` if you
change it materially.

---

## 1. Component Contracts

### Change Signal Monitor
- **Inputs:** provider feeds, release records.
- **Outputs:** normalized change event.
- **Data stored:** event metadata.
- **Failure mode → fallback:** missed/false event → manual event entry.
- **Security boundary:** read-only external boundary.
- **(spike scaffolding)** Suggested shape: `ChangeEvent{event_id, source,
  model_or_component_id, change_type, detected_at, raw_payload_ref,
  confidence}`.

### AI Estate Discovery Connectors
- **Inputs:** repos, configs, gateways, traces.
- **Outputs:** evidence claims.
- **Data stored:** raw refs, hashes.
- **Failure mode → fallback:** incomplete discovery → manual registration.
- **Security boundary:** connector-specific least privilege.
- **(spike scaffolding)** Each connector implements a shared
  `EvidenceClaim{entity_id, relationship, confidence, evidence_class,
  source_ref, observed_at}` output regardless of source system.

### AI Dependency Graph
- **Inputs:** evidence claims, manual overrides.
- **Outputs:** versioned graph.
- **Data stored:** nodes, edges, provenance (see `docs/Schema.md`).
- **Failure mode → fallback:** stale/conflicting graph → mark uncertain,
  require manual override.
- **Security boundary:** graph service boundary — write access restricted.

### Change Impact Agent
- **Inputs:** change event, graph, behavioural contracts.
- **Outputs:** affected-set hypothesis (plans + rationale).
- **Failure mode → fallback:** unsupported impact claim → rule-based
  conservative expansion (when uncertain, include more, not less).
- **Security boundary:** no direct deploy rights — this component only
  proposes, never executes.
- **Non-negotiable:** LLM planning bounded by deterministic rules; every
  claim must trace to graph evidence, not model assertion alone.

### Workload and Risk Classifier
- **Inputs:** metadata, behavioural contract, criticality.
- **Outputs:** risk class + classification evidence.
- **Failure mode → fallback:** misclassification → default to the higher
  risk tier, never the lower one.
- **Security boundary:** policy boundary.
- **Implementation note:** rules-first, small-model-assist only. The rule
  floor always overrides a model's classification suggestion.

### Test Asset Discovery Adapter
- **Inputs:** Jira, Xray, Azure DevOps, repos (or spike mock fixtures).
- **Outputs:** mapped test assets (IDs, mappings, provenance).
- **Failure mode → fallback:** wrong/missing mapping → manual mapping.
- **Security boundary:** read-only test scope by default.

### Adaptive Regression Planner
- **Inputs:** impact hypothesis, risk class, behavioural contracts, mapped tests.
- **Outputs:** executable plan (rules, selections, exclusions — every
  exclusion carries a rationale string, never blank).
- **Failure mode → fallback:** critical test excluded → critical-pack union
  forces inclusion; escalate to full regression if still uncertain.
- **Security boundary:** the Trusted Kernel validates every plan before execution.

### Missing-Test Generator
- **Inputs:** change gaps, behavioural contract, traces.
- **Outputs:** test candidates (prompt, generated test, rationale).
- **Failure mode → fallback:** invalid/unsafe test → human review, discard
  if not approved.
- **Security boundary:** sandbox only — generated tests never execute
  outside an isolated sandbox until SME-approved.

### Qualification Orchestrator
- **Inputs:** approved plan.
- **Outputs:** run state/results, checkpoints.
- **Failure mode → fallback:** partial execution → resume/retry, fail closed
  if it cannot resume cleanly.
- **Security boundary:** dedicated execution identity, least privilege.

### Deterministic Evaluator
- **Inputs:** outputs, traces, schemas.
- **Outputs:** pass/fail evidence.
- **Failure mode → fallback:** rule defect → pinned critical pack / manual check.
- **Security boundary:** lives inside the Trusted Kernel's validation path.

### Probabilistic Evaluator
- **Inputs:** outputs, rubrics, references.
- **Outputs:** scores + uncertainty, judge prompt/version/results recorded.
- **Failure mode → fallback:** bias/disagreement → second judge or human review.
- **Security boundary:** no decision authority — advisory only.

### Trajectory / Tool-Call Evaluator
- **Inputs:** traces, tool contracts.
- **Outputs:** trajectory findings (steps, diffs).
- **Failure mode → fallback:** hidden unsafe path → block on any
  deterministic violation, regardless of final-answer correctness.
- **Security boundary:** trace read boundary only.

### Cost and Performance Evaluator
- **Inputs:** usage, pricing, timing.
- **Outputs:** cost/latency metrics.
- **Failure mode → fallback:** stale prices/noise → mark incomplete, sample more.
- **Security boundary:** read-only billing metadata.

### Evidence and Confidence Aggregator
- **Inputs:** all evaluator results.
- **Outputs:** confidence score + explicit residual-gaps list.
- **Failure mode → fallback:** false confidence → conservative floor,
  surface residual risk rather than rounding up.
- **Security boundary:** trusted decision boundary.

### Recommendation Engine
- **Inputs:** evidence, policy, risk class.
- **Outputs:** migrate / canary / investigate / block + rationale.
- **Failure mode → fallback:** unsafe recommendation → policy overrides to block.
- **Security boundary:** no deploy rights.
- **Non-negotiable:** policy gates the LLM's narrative; the LLM cannot
  override a policy-driven "block" outcome.

### Human Approval Gateway
- **Inputs:** recommendation, evidence.
- **Outputs:** signed decision (identity, timestamp, scope).
- **Failure mode → fallback:** impersonation/timeout → fail closed.
- **Security boundary:** strong auth boundary (MFA, separation of duties).

### Deployment / Canary Adapter
- **Inputs:** signed approval, config.
- **Outputs:** deployment state (version, traffic split).
- **Failure mode → fallback:** wrong target/partial deploy → stop and roll back.
- **Security boundary:** scoped deploy identity — cannot self-authorize.

### Rollback Controller
- **Inputs:** threshold breach signal, last-known-good config.
- **Outputs:** rollback result (trigger, action, evidence).
- **Failure mode → fallback:** rollback failure → emergency stop / manual runbook.
- **Security boundary:** highest-control boundary in the system.

### Qualification Evidence Store
- **Inputs:** plans, results, approvals.
- **Outputs:** immutable evidence package (metadata, artifacts, hashes).
- **Failure mode → fallback:** tampering/inconsistency → write-once backup,
  reconciliation job.
- **Security boundary:** customer-owned, encrypted store.

### Trusted Kernel
- **Inputs:** contracts, policies, approvals.
- **Outputs:** permit/deny decisions, pinned config + audit trail.
- **Failure mode → fallback:** kernel defect → fail closed, manual break-glass.
- **Security boundary:** separate deployment/admin boundary from everything else.
- See `src/ai_evergreen/trusted_kernel/AGENTS.md` for absolute rules.

### Self-Qualification Environment
- **Inputs:** current vs. candidate AI Evergreen version.
- **Outputs:** independent result (runs + evidence).
- **Failure mode → fallback:** recursive self-validation risk → limited to
  **one level only** (currently-approved Evergreen qualifies the candidate;
  the candidate cannot spawn another qualification run).
- **Security boundary:** isolated account/environment/namespace.

### Dashboard / API
- **Inputs:** service APIs.
- **Outputs:** views/exports.
- **Failure mode → fallback:** misleading/stale display → always show
  freshness/error state, never a silent stale view.
- **Security boundary:** user-facing boundary — standard auth applies.

---

## 2. Provider Adapter Contract (spike scaffolding)

All provider adapters implement one shared interface so `orchestrator/` and
`evaluators/` never need to know which provider they're talking to:

```python
class ModelProviderAdapter(Protocol):
    def invoke(self, request: ModelInvocationRequest) -> ModelInvocationResult: ...
    def health_check(self) -> ProviderHealth: ...
```

`ModelInvocationRequest` must carry: `model_id`, `model_version`, `prompt_or_
messages`, `temperature`, `seed` (if supported), `max_tokens`,
`correlation_id`. `ModelInvocationResult` must carry: `output`, `raw_response
_ref`, `token_usage`, `latency_ms`, `provider_request_id`. See
`src/ai_evergreen/providers/AGENTS.md` for the rules governing this folder.

---

## 3. API Surface (spike scaffolding — not in the charter, proposed for the FastAPI app)

Minimal REST surface sufficient to run the five-step demonstrable core end
to end and drive the dashboard. Extend only as a task genuinely requires it.

| Method & Path | Purpose |
|---|---|
| `POST /events/change` | Ingest a normalized change event (or trigger from a mock feed) |
| `GET /graph/blast-radius/{event_id}` | Return the discovered affected-application set |
| `GET /plans/{event_id}` | Return the adaptive regression plan (selections + exclusions + rationale) |
| `POST /runs/{event_id}/execute` | Trigger the qualification orchestrator for an approved plan |
| `GET /recommendations/{event_id}` | Return the migrate/canary/investigate/block recommendation |
| `POST /approvals/{event_id}` | Record a signed human approval or rejection |
| `POST /rollback/{event_id}` | Trigger a manual rollback (in addition to automatic threshold-based rollback) |
| `GET /evidence/{event_id}` | Return the immutable qualification evidence package |

Every endpoint requires a `correlation_id` and must log it through the whole
downstream chain — this is what makes an evidence record reproducible later.
