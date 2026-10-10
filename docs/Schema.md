# Schema — AI Evergreen

Source: Concept Charter §12 (AI Dependency Graph Model), §13 (Behavioural
Contract), §25 (Data Requirements). This is the single source of truth for
entity/field names — if code and this file ever disagree, this file wins and
the code must be updated to match, not the other way around.

---

## 1. AI Dependency Graph — Entities

Every entity below shares the same core attribute set: `name`,
`version_or_status`, `source`, `owner`, `last_verified`. Source of truth for
each is one of: Config, API, telemetry, or manual attestation. Retention:
active state + full qualification history (never delete, only supersede).

| Entity | Unique ID Field |
|---|---|
| business process | `business_process_id` |
| business capability | `business_capability_id` |
| application | `application_id` |
| AI service | `AI_service_id` |
| agent | `agent_id` |
| model provider | `model_provider_id` |
| model family | `model_family_id` |
| model version | `model_version_id` |
| endpoint | `endpoint_id` |
| prompt | `prompt_id` |
| configuration | `configuration_id` |
| embedding model | `embedding_model_id` |
| reranker | `reranker_id` |
| vector database | `vector_database_id` |
| knowledge source | `knowledge_source_id` |
| API | `API_id` |
| tool | `tool_id` |
| MCP server | `MCP_server_id` |
| agent framework | `agent_framework_id` |
| policy | `policy_id` |
| guardrail | `guardrail_id` |
| test case | `test_case_id` |
| dataset | `dataset_id` |
| production trace | `production_trace_id` |
| incident | `incident_id` |
| release | `release_id` |
| environment | `environment_id` |
| owner | `owner_id` |
| approver | `approver_id` |
| compliance classification | `compliance_classification_id` |

## 2. Relationships

| Relationship | Meaning |
|---|---|
| uses | Consumer directly uses component |
| invokes | Runtime call to a service/tool |
| depends on | Functional or operational dependency |
| retrieves from | RAG/data retrieval |
| guarded by | Policy or guardrail applied |
| evaluated by | Evaluator association |
| tested by | Test coverage mapping |
| owned by | Accountable owner |
| approved by | Approval authority |
| deployed in | Environment placement |
| supersedes | Version lineage |
| affected by | Change impact relation |
| rolled back to | Last-known-good target |

Evidence for any relationship: configuration, code reference, telemetry,
test mapping, or manual attestation.

## 3. Graph Governance Rules (Enforce These in Code)

| Control | Rule |
|---|---|
| Relationship confidence | 0.00–1.00 plus evidence class: runtime-observed, configuration-declared, code-inferred, manually-attested, or LLM-inferred |
| Source of truth | Runtime evidence outranks code/config for active usage; approved manual override outranks unresolved inference |
| Last verified | Mandatory on every actionable edge; stale thresholds vary by source class |
| Manual override | Requires named owner, reason, expiry, and supporting evidence |
| Conflict resolution | Retain competing claims, calculate precedence, surface unresolved conflict — **never silently overwrite** |
| Stale dependency | Mark stale, reduce confidence, exclude from autonomous migration until reverified |
| Orphan detection | Identify any workload/model/test/incident with no owner or application mapping |
| Versioning | Immutable graph snapshots per qualification event, plus a change log |
| Retention | Keep event snapshot + evidence for a policy-defined duration; delete raw data once references/hashes suffice |

---

## 4. Behavioural Contract — Field List

Every workload registered in the graph must have a Behavioural Contract with
these fields (all fields "define the provider-neutral acceptance boundary and
accountable evidence for this workload" — see the three sample contracts
below for how they're actually populated):

`intended_purpose`, `approved_model_role`, `system_prompt_version`,
`allowed_inputs`, `allowed_outputs`, `required_schemas`, `allowed_tools`,
`prohibited_tools`, `policy_invariants`, `required_evidence`,
`business_outcome`, `latency_threshold`, `token_cost_ceiling`,
`safety_requirements`, `refusal_requirements`, `human_approval_requirement`,
`critical_test_set`, `shadow_canary_requirement`, `rollback_thresholds`,
`residual_risk_owner`.

### 4.1 Sample Contract — Summarisation Service

| Field | Value |
|---|---|
| Purpose/role | Summarise internal service tickets; model may only transform supplied text |
| Inputs/outputs/tools | Text only; no tools; output summary schema with issue/action/owner |
| Invariants/thresholds | Required fields present; no invented owner; ≤500 ms target; cost ceiling placeholder |
| Required evidence | Exact schema + required facts; semantic completeness/factuality; 100 critical cases |
| Validation/approval | Offline differential plus shadow 10%; owner approval |
| Rollback | If mandatory-field failure > 0, or factuality drops beyond approved delta |

### 4.2 Sample Contract — RAG Assistant

| Field | Value |
|---|---|
| Purpose/role | Answer employee policy questions only from approved sources |
| Inputs/outputs/tools | Question + retrieved context; citation-required answer; no write tools |
| Invariants/thresholds | Must cite a valid source; abstain when evidence insufficient; PII rules |
| Required evidence | Citation validity, source access, groundedness, completeness, refusal tests, trace replay |
| Validation/approval | Offline + shadow; canary only after data owner and app owner approval |
| Rollback | On hallucinated citation, access-policy violation, or groundedness threshold breach |

### 4.3 Sample Contract — Refund Tool-Using Agent

| Field | Value |
|---|---|
| Purpose/role | Assess refund eligibility and create an approved refund within a delegated limit |
| Inputs/outputs/tools | Customer/order identifiers; tools: lookup, policy, approval, refund. Prohibited: direct DB write outside the refund API |
| Invariants/thresholds | Policy check before refund; amount/authorization limits; human approval above threshold; no PII leakage |
| Required evidence | Tool schema, order, parameters, policy invariant, business outcome, unsafe-trajectory checks |
| Validation/approval | Sandbox → shadow → 1/5/25% canary; business + SRE approval |
| Rollback | Immediate, on skipped policy check, unauthorized tool, wrong amount, or approval bypass |

---

## 5. Synthetic Data Specification

**No real PII, no real customer data, ever** — this applies to every fixture
generated for the spike (see `AGENTS.md` rule 7).

| Data Domain | Minimum Volume | Ground Truth Requirement |
|---|---|---|
| Applications | 12 | Known business process, owner, criticality, environment |
| Agents | 5 | Known model/tool/prompt dependencies and contracts |
| Models/providers | 2–3 providers, 4–6 versions | Known lifecycle, pricing placeholders, endpoint mapping |
| Tests | ≥120 | Known application mapping, criticality, duplicates, obsolete/missing cases |
| Traces | ≥50 | Known app, model, tool calls, outcomes, seeded failures |
| Incidents | ≥10 | Known affected dependency and severity |
| Approval rules | 1 per risk class | Known approver and promotion/rollback boundary |

### 5.1 Data Controls

- Generate with Python fixtures and a **fixed random seed** (reproducibility).
- JSON/JSONL plus an explicit schema and version — this file *is* that schema.
- Exclude PII by construction; test masking with synthetic markers only.
- Version scenarios and ground truth independently from model outputs.
- Restrict write access to the data engineer/test architect role; broad read
  only inside the sandbox.
- Run schema, referential-integrity, duplication, mapping, and distribution
  checks before a fixture is considered usable.
- Record lineage: generator version → test run → evidence package.

### 5.2 Data-Quality Scorecard (Provisional Targets)

| Dimension | Measure | Target | Failure Action |
|---|---|---|---|
| Completeness | Required fields populated / expected | ≥98% for ground-truth assets | Repair fixture; no run on missing critical field |
| Consistency | Cross-source values agreeing / compared | ≥95%; conflicts deliberately tagged | Route conflict to resolver |
| Freshness | Assets within scenario freshness window | 100% of active dependencies | Mark stale, block autonomous scope reduction |
| Ownership | Active workloads with named owner | 100% high-risk; ≥95% overall | Escalate orphan |
| Trace correlation | Traces linked to app/model/run | ≥98% | Exclude from autonomous replay |
| Test mapping | Tests correctly mapped to workload | ≥95%; 100% critical tests | Manual review |
| Ground-truth reliability | Double-reviewed seeded defects/outcomes | 100% seeded critical defects | Hard stop |
