# Phases — Delivery Plan

Source: Concept Charter §30 (Spike Execution Workstreams), §31 (Delivery
Plan), §31.1 (Compressed Techathon Track). This file is the week-level plan;
day-level checkboxes with pass/fail criteria are in `docs/Tasks.md`.

---

## 0. Which Track Are We Running?

- **Four-week feasibility spike** — full workstream set (WS-01 to WS-20),
  formal gates each Friday. Use this if Assumption A-05 (protected team
  capacity) holds.
- **Compressed Techathon track** — 4 days, minimum-outcome bar per day. Use
  this if A-05 is false or the Techathon submission window forces it.

Confirm which track applies in `docs/memory.md` before starting Day/Week 1 —
do not silently assume.

---

## 1. Four-Week Plan

| Period | Daily Checkpoints | Scope | Formal Exit Gate |
|---|---|---|---|
| **Week 1** | D1 architecture kickoff · D2 account/model access · D3 synthetic schema · D4 graph ingest · D5 baseline gate | Environment, architecture, synthetic estate, graph, baseline capture | **Gate 1:** reproducible estate and approved architecture |
| **Week 2** | D6 event feed · D7 blast radius · D8 test ingestion · D9 selection · D10 missing-test review | Change event, impact analysis, adaptive plan, generated-test candidates | **Gate 2:** affected set and regression plan explainable |
| **Week 3** | D11 evaluation harness · D12 trajectory checks · D13 recommendation · D14 approval/canary · D15 rollback/self-governance | Differential evidence, recommendation, controlled rollout and rollback | **Gate 3:** no critical misses; last-known-good restored |
| **Week 4** | D16 adversarial/failure tests · D17 repeated runs · D18 TCO · D19 final report · D20 demo/go-no-go | Measurements, risks, TCO, rehearsal and decision | **Gate 4:** sponsor decision on MVP (Go / Conditional Go / No-Go) |

**Gate discipline:** do not proceed to the next week's workstreams if the
current gate's criteria are unmet. If Gate 1 fails (e.g., synthetic estate
not reproducible), the correct action is to fix Week 1 scope, not to start
Week 2 work in parallel "to save time."

---

## 2. Compressed Techathon Track (4 Days)

| Phase | Duration | Minimum Outcome |
|---|---|---|
| Build foundation | Day 1 | Synthetic estate, graph, one real provider adapter, one simulator |
| Impact and scope | Day 2 | One change event, six affected apps, explainable test subset, one missing test |
| Qualification and recommendation | Day 3 | Current/candidate comparison and all four treatment outcomes represented |
| Rollout and demo | Day 4 | Human approval gate, simulated canary, seeded degradation, deterministic rollback, evidence record |

This is the track most likely to apply for the Techathon submission itself
— it corresponds directly to the PRD's "Techathon Demonstrable Core"
five-step loop (`docs/PRD.md` §9).

---

## 3. Workstreams (WS-01 to WS-20)

Every workstream shares the same completion criteria: **acceptance test
passed, evidence stored, owner sign-off.** Dependencies follow the critical
path: graph → plan → evaluate → recommend → rollout.

| ID | Workstream | Owner |
|---|---|---|
| WS-01 | Architecture and environment | Principal Architect |
| WS-02 | Synthetic enterprise estate | Data Engineer |
| WS-03 | Dependency discovery | Integration Engineer |
| WS-04 | Dependency graph | Data Engineer |
| WS-05 | Change event detection | Agent Engineer |
| WS-06 | Workload-risk classification | Responsible AI Lead |
| WS-07 | Test-asset ingestion | Test Architect |
| WS-08 | Adaptive regression planning | Test Architect |
| WS-09 | Missing-test generation | AI/ML Engineer |
| WS-10 | Differential evaluation | AI/ML Engineer |
| WS-11 | Trajectory and tool evaluation | Agent Engineer |
| WS-12 | Recommendation logic | Principal Architect |
| WS-13 | Approval workflow | Integration Engineer |
| WS-14 | Canary and rollback | SRE |
| WS-15 | Evidence store | Platform Engineer |
| WS-16 | Self-governance | Principal Architect |
| WS-17 | Security and Responsible AI | Security Architect |
| WS-18 | FinOps | FinOps Analyst |
| WS-19 | Evaluation and reporting | Test Architect |
| WS-20 | Demo engineering | Techathon Demo Lead |

---

## 4. Spike Deliverables Checklist (End of Spike)

Each deliverable's acceptance owner is the Workstream Owner + Product/Idea
Owner jointly. Check these off as they're produced, cross-reference against
`docs/Tasks.md` for the day they were completed:

- [ ] Approved Concept Charter *(already complete — this doc set derives from it)*
- [ ] Architecture decision record → tracked in `docs/Decisions.md`
- [ ] AI Dependency Graph schema → `docs/Schema.md`
- [ ] Behavioural-contract schema → `docs/Schema.md`
- [ ] Synthetic enterprise estate
- [ ] Provider and Jira adapters
- [ ] Dependency-discovery report
- [ ] Impact-analysis report
- [ ] Adaptive regression plan
- [ ] Missing-test report
- [ ] Differential evaluation results
- [ ] Migration recommendation
- [ ] Approval record
- [ ] Canary and rollback evidence
- [ ] Self-governance result
- [ ] Security threat model → `docs/Risks.md`
- [ ] Responsible AI assessment
- [ ] Cost report
- [ ] Final feasibility report
- [ ] MVP recommendation
- [ ] Techathon demo script
