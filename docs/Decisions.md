# Decisions — Architecture Decision Record (ADR) Log

Purpose: every architecturally meaningful choice gets one row here — not
just "big" decisions. If you change something in `trusted_kernel/`,
`providers/`, the graph schema, or any Hard Stop / acceptance threshold,
add a row **in the same change**, not after the fact. This is listed as a
named spike deliverable in the charter (§36, item 2).

Format: `ID | Date | Decision | Rationale | Status`. Status is one of:
`Proposed`, `Confirmed`, `Superseded`.

---

## Decisions Carried Over From the Approved Charter

| ID | Date | Decision | Rationale | Status |
|---|---|---|---|---|
| D-001 | 2026-09-02 | Reframe "Model Attestation Agent" as AI Evergreen | Attestation is an output; enterprise change-impact intelligence is the differentiated capability | Confirmed |
| D-002 | 2026-09-02 | Adopt three (later four) defensible differentiators | Dependency graph, cross-application risk-based scope and missing-evidence discovery remain under-served; institutional qualification memory added later as the fourth | Confirmed |
| D-003 | 2026-09-03 | Use AWS Bedrock/AgentCore as primary spike platform | Provides model access, tracing, evaluation and controlled rollout primitives without changing the provider-neutral core | Proposed |
| D-004 | 2026-09-03 | Require human approval for production promotion | Automated evidence may inform but must not authorize high-impact production change | Confirmed |
| D-005 | 2026-09-07 | Elevate positioning to "Enterprise AI Qualification Control Plane" | Shift narrative from regression-cost efficiency to continuous AI evolution and compounding qualification memory, for Techathon jury scoring | Confirmed |

## New Decisions (Add Rows Below — Do Not Renumber Existing IDs)

| ID | Date | Decision | Rationale | Status |
|---|---|---|---|---|
| D-006 | | | | |

---

## Decision-Writing Guidance

A good row answers three questions in the Rationale column: **what
alternative was considered, why it was rejected, and what would make us
revisit this.** A row that just restates the decision ("Decision: use
NetworkX. Rationale: it's simple.") is not useful to a future reader —
prefer: "Rationale: Neo4j adds setup overhead with no spike-stage query need;
revisit if the graph exceeds ~50k edges or needs Cypher-style traversal
the ORM can't express."
