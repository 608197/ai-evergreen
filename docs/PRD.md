# Product Requirements Document — AI Evergreen

| Field | Value |
|---|---|
| Source | AI Evergreen — Concept Charter and Feasibility Spike Plan, v0.9, 03 September 2026 |
| Document owner | Puneet Saxena, Principal Architect |
| Status | Approved for spike; scoped strictly to the charter — no invented features |
| This document | Reorganizes the charter's business/scope content for agent and engineer consumption |

---

## 1. One-Line Description

AI Evergreen is an **Enterprise AI Qualification Control Plane**: when an AI
dependency changes, it detects the change, discovers the affected enterprise
applications, selects proportionate qualification evidence, discovers missing
test coverage, and recommends a treatment — migrate, canary, investigate, or
block — with mandatory human approval before any production promotion.

**Central proposition:** One AI dependency changes. AI Evergreen predicts the
enterprise blast radius, coordinates proportional qualification and preserves
reusable evidence as institutional memory — instead of dozens of disconnected
regression projects.

---

## 2. The Problem

Enterprises increasingly run multiple foundation models across applications,
agents and business units, combined with prompts, RAG, tools, APIs, MCP
servers, policies and guardrails. A single model release, retirement,
price change or policy shift can affect many workloads simultaneously, yet:

- Dependency discovery is manual and repeated per project.
- Full regression is often requested by default because risk is unclear.
- Existing tests may not cover behaviour introduced by a candidate model.
- Migration decisions and approval evidence are inconsistent across teams.
- Governance evidence is reconstructed *after* the change, not generated
  during it.
- Rollback criteria are frequently undefined or manually operated.

### Consequences (from the charter's current-state analysis)

| Consequence | Enterprise Effect | Control Gap |
|---|---|---|
| Unknown blast radius | Missed workloads or unnecessary work | No authoritative, fresh dependency map |
| Over-testing | Long migration lead time, avoidable cost | No defensible test exclusion logic |
| Under-testing | Silent behavioural regressions reach production | Tests inherited, not change-aware |
| Fragmented decisions | Different teams apply different thresholds | No common behavioural-contract discipline |
| Delayed adoption | Cheaper/better models remain unused | Qualification cost exceeds perceived benefit |
| Weak evidence | Audit/governance reconstructs after the fact | No qualification evidence record |
| Unsafe rollback | Business exposure continues after detection | No policy-bound rollback controller |

---

## 3. Core Insight

> **AI dependency is shared. Qualification obligation is workload-specific.**

A summarisation service and a refund-approving tool-using agent may use the
exact same underlying model, but they carry entirely different risk profiles.
Applying identical regression depth to both wastes effort on the low-risk
workload and under-controls the high-risk one. See `docs/Schema.md`
§Workload Risk Matrix for the full ten-workload-type breakdown.

---

## 4. Vision, Mission, Strategic Promise

**Vision:** Enterprises continuously evolve their AI estates without
restarting qualification from zero, because every change decision reuses
and strengthens institutional qualification intelligence.

**Mission (what the system does):**
- Maintain a living AI Dependency Graph.
- Detect external and internal AI dependency changes.
- Determine affected applications and business processes.
- Classify impact and risk.
- Select the minimum sufficient qualification scope.
- Discover missing validation evidence.
- Coordinate execution through existing enterprise tools.
- Recommend migration treatment.
- Support human-approved promotion.
- Verify production behaviour; roll back automatically within thresholds.
- Retain reproducible evidence.
- Anticipate likely AI dependency exposure before mandatory change deadlines
  (roadmap direction — event-driven handling is the spike's proven scope;
  predictive readiness is a future capability, not a spike deliverable).
- Preserve qualification outcomes as reusable institutional memory.
- Identify and prioritize AI technical debt (roadmap direction).

---

## 5. Target Users and Buyers

| Persona | Current Pain | Decision Required | Evergreen Output | Authority |
|---|---|---|---|---|
| CIO / CTO | Repeated migration burden, invisible estate | Fund, prioritize or stop | Portfolio impact and value report | Executive sponsor |
| Enterprise Architecture | Unknown cross-platform dependencies | Approve target architecture | Versioned dependency view, ADRs | Architecture authority |
| AI Platform Engineering | Teams independently qualify models | Standardize platform service | Reusable change event/qualification APIs | Service owner |
| Application Owner | Unclear application risk | Migrate, canary or block | Workload-specific recommendation | Business accountable |
| QA / Test Lead | Full regression due to uncertainty | Approve test scope | Selected/excluded tests with rationale | Quality authority |
| AI Governance | Prior approval invalidated by model change | Accept evidence and control posture | Qualification evidence record | Governance authority |
| Risk and Compliance | Material change without proportional control | Set thresholds and exceptions | Risk classification, residual uncertainty | Risk acceptance |
| SRE / Operations | Behavioural failure without outage | Authorize canary/rollback policy | Live thresholds, rollback evidence | Operational authority |
| FinOps | Expensive model remains in use | Approve optimization case | Cost per workload and event | Advisory/budget |
| Data Privacy | Trace/test data may contain PII | Approve data use | Data inventory, masking, retention | Privacy authority |
| Information Security | Adapters/agents cross trust boundaries | Approve security design | Threat model, least-privilege matrix | Security authority |
| Internal Audit | Evidence reconstructed after change | Assess control operation | Tamper-evident record, approvals | Independent assurance |

---

## 6. Scope

### 6.1 In Scope (spike)

- Discovery of application-to-model dependencies (repos, config, gateways, telemetry).
- Model version and provider tracking.
- Prompt, tool, API, MCP, RAG and policy dependency tracking.
- Model release and deprecation event handling.
- Project and owner mapping; risk classification.
- Existing test discovery and mapping; explainable selection/exclusion.
- Missing-test proposal (SME-reviewed before use).
- Differential current-vs-candidate evaluation (functional, semantic, safety,
  cost, latency, trajectory/tool-call).
- Qualification recommendation with mandatory approval workflow.
- Shadow and canary execution (simulated for the spike); automatic rollback
  within policy.
- Evidence retention; AI Evergreen self-governance (one-level recursion only).

### 6.2 Out of Scope for the Spike

- Complete enterprise-wide onboarding.
- Production deployment across all providers.
- Replacement of testing, governance, gateway or observability platforms.
- Universal regulatory certification or legal compliance determination.
- Uncontrolled autonomous promotion.
- Full commercial-grade user interface.
- Automatic resolution of every ownership gap.
- Guaranteed behavioural equivalence between models.
- Real production customer data.
- All workload types, all hyperscalers, all model providers.

### 6.3 Future Scope (do not build now — roadmap only)

Embedding/reranker changes · MCP-server and prompt-library changes · agent-
framework upgrades · guardrail-model/policy changes · vector-database changes
· fine-tuned-model changes · cross-agent dependency impact · multi-region
qualification · regulated-industry evidence packs.

---

## 7. Value Proposition (Hypotheses Until Measured)

| Value Lever | Mechanism | Status |
|---|---|---|
| Dependency discovery | Reuse code, config, gateway, trace evidence | Hypothesis |
| Impact analysis | One portfolio assessment vs. project-by-project | Hypothesis |
| Regression reduction | Select risk-relevant tests, preserve invariants | Hypothesis |
| Model adoption speed | Reuse evidence, standard execution path | Hypothesis |
| Missing coverage | Generate evidence proposals from change/contract gaps | Hypothesis |
| Decision consistency | Common contract and recommendation logic | Design intent |
| Production safety | Shadow, canary, deterministic rollback | Design intent |
| Audit readiness | Evidence generated during execution | Design intent |
| Investment reuse | Adapters orchestrate current tools, not replace | Confirmed design |

**Economic principle:** the primary value is faster, safer adoption of AI
change. Return compounds through avoided duplicate analysis, proportionate
regression, reusable evidence, and earlier retirement of AI technical debt.
All quantified savings remain hypotheses until measured in the spike.

---

## 8. Differentiation (Do Not Duplicate These Categories)

AI Evergreen does **not** replace: model lifecycle/governance products, AI
gateways (Portkey, Kong, LiteLLM), evaluation/observability platforms
(Braintrust, LangSmith, Langfuse, Arize, Fiddler), or enterprise testing
platforms. It reuses their signals and adds the missing cross-application
intelligence and orchestration layer. Full competitive mapping lives in the
Techathon pitch deck appendix, not duplicated here.

**Four defensible differentiators:**
1. Enterprise AI Dependency Graph.
2. Risk-based cross-application regression scoping.
3. Autonomous discovery of missing qualification evidence.
4. Institutional AI Qualification Memory that compounds across every event.

---

## 9. Spike Objective and Thesis

> **Thesis:** AI Evergreen can turn one AI dependency change into an
> explainable enterprise blast radius and proportionate qualification plan,
> while preserving critical-regression detection and creating reusable
> qualification intelligence.

The spike proves or disproves feasibility of: dependency discovery,
cross-application impact analysis, adaptive test selection, missing-evidence
discovery, differential qualification, controlled migration, rollback, and
self-governance. It does **not** attempt to prove production scalability,
full provider coverage, legal compliance, or commercial readiness.

### Techathon Demonstrable Core (five visible steps)

`Detect Change → Discover Blast Radius → Plan Proportionate Evidence →
Recommend Treatment → Learn from Outcome`

Canary, rollback, broad connector coverage, and self-governance are
design-backed extensions beyond this core — build them only if delivery
capacity permits, per `docs/Phases.md`.

### Winning Demo Outcome (target, not yet achieved)

One model-change event → 6 applications identified, each treated
differently → redundant test execution reduced without missing a seeded
critical defect → 1 previously missing critical test discovered and proposed
→ 4 distinct treatments produced (migrate / canary / investigate / block) →
evidence pattern retained for reuse in the next event.

---

## 10. Success Criteria — Acceptance Thresholds (Provisional)

| Threshold | Target | Measurement |
|---|---|---|
| Dependency discovery recall | ≥95% overall, 100% high-criticality | Graph vs. ground truth |
| No missed high-criticality application | 0 missed | Affected-set comparison |
| No missed seeded critical defect | 100% detected | Seed catalogue |
| False exclusion of important tests | ≤2% non-critical; 0% critical | Expert relevance labels |
| Valid generated-test rate | ≥80% overall; 100% reviewed before high-risk use | SME review |
| Unsupported dependency claim | ≤5%; none actioned without evidence | Claim provenance audit |
| Unsafe migration recommendation | 0 | Ground-truth treatment |
| Rollback recovery time | ≤5 minutes in simulation | Timed canary event |
| Reproducibility | ≥90% materially same treatment across repeated runs | Three repeated runs |
| Evidence completeness | 100% mandatory fields | Schema validation |
| Human review | 100% of promotions, high-risk generated tests, judge conflicts | Approval log |

Full hard-stop list is in `docs/Risks.md`.

---

## 11. Go / No-Go Decision Framework

| Outcome | Conditions |
|---|---|
| **GO** | Reliable dependency discovery; no missed critical regressions; material scope reduction; ≥1 useful missing test found; reproducible recommendations; rollback works; cost bounded; differentiation credible. |
| **CONDITIONAL GO** | Value demonstrated only for selected workload types; manual dependency curation remains; generated tests require approval; rollout stays recommendation-only. |
| **NO-GO / PIVOT** | Critical regressions missed; discovery unreliable; recommendations not reproducible; test generation creates unsafe confidence; cost exceeds avoided effort; solution duplicates customer tools without material value. |

---

## 12. Open Questions (Do Not Silently Assume — Escalate Instead)

| ID | Open Question | Default If Unresolved |
|---|---|---|
| OQ-01 | Authoritative source of dependency truth | Conservative assumption; block autonomous action if material |
| OQ-05 | Acceptable test-reduction target | Conservative assumption; block autonomous action if material |
| OQ-06 | LLM judge selection | Conservative assumption; block autonomous action if material |
| OQ-12 | Rollback authority | Conservative assumption; block autonomous action if material |
| OQ-13 | Production-data use | Conservative assumption; block autonomous action if material |
| OQ-16 | Candidate model pair | Conservative assumption; block autonomous action if material |
| OQ-18 | Techathon duration and team capacity | Conservative assumption; block autonomous action if material |

Full 18-item list is in the approved charter, §37. If a task depends on an
unresolved open question, use the conservative default and note it in
`docs/memory.md` rather than picking an arbitrary value.

---

## 13. Key Assumptions Gating Delivery

| ID | Assumption | If False |
|---|---|---|
| A-01 | Sanctioned AWS account with Bedrock access is available | Use local/mock provider adapter; A/B demo becomes simulated |
| A-02 | Synthetic Jira/Xray data may be used | Build a native JSON test-asset adapter only |
| A-03 | At least two model variants/providers can be invoked | Use one real model and one deterministic simulator |
| A-04 | OpenTelemetry traces can represent production-like activity | Use generated trace fixtures and a replay harness |
| A-05 | Four-week team capacity is protected | Switch to compressed Techathon track, reduced workload portfolio |
| A-06 | No real customer data is required | Mandatory privacy review and anonymisation pipeline if this changes |
