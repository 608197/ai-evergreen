# Tasks — Day-Level Checklist with Pass/Fail Criteria

How to use this file: check a box only when the **acceptance criterion**
next to it is objectively true, not when the code "looks done." Update
`docs/memory.md` every time you close out a day. If a task depends on an
unresolved item from `docs/PRD.md` §12 (Open Questions), use the
conservative default listed there and note it inline.

Pick **one** track and delete/ignore the other section to avoid confusion in
a real repo — both are included here for completeness.

---

## Track A — Four-Week Feasibility Spike

### Week 1 — Foundation (Gate 1: reproducible estate + approved architecture)

**D1 — Architecture kickoff** (WS-01)
- [ ] `docs/Architecture.md`, `docs/Interfaces.md`, `docs/Schema.md` reviewed
      and signed off by Principal Architect. *AC: no open disagreement on
      component boundaries.*
- [ ] Repo scaffold created matching the folder structure in
      `docs/Architecture.md` §6. *AC: `uv run pytest` executes (even with
      zero tests) without import errors.*

**D2 — Account / model access** (WS-01, Assumption A-01)
- [ ] Sandbox AWS account confirmed with Bedrock access, budgets and alarms
      set. *AC: a test invocation to the pinned current model succeeds.*
- [ ] If A-01 is false: simulator adapter stood up instead. *AC: simulator
      responds to the same `ModelProviderAdapter` interface.*

**D3 — Synthetic schema** (WS-02)
- [ ] Synthetic data generator scaffolded per `docs/Schema.md` §5, fixed
      seed committed. *AC: re-running the generator produces byte-identical
      output.*
- [ ] Minimum volumes met: 12 applications, 5 agents, 2–3 providers,
      ≥120 tests, ≥50 traces, ≥10 incidents. *AC: counts verified
      programmatically, not eyeballed.*

**D4 — Graph ingest** (WS-04)
- [ ] Dependency graph populated from synthetic estate using the entity/
      relationship model in `docs/Schema.md` §1–2. *AC: every edge carries
      confidence + evidence_class + last_verified.*
- [ ] Orphan detection implemented. *AC: a deliberately-unowned synthetic
      workload is correctly flagged.*

**D5 — Baseline gate (Gate 1)**
- [ ] Data-quality scorecard run against `docs/Schema.md` §5.2 targets.
      *AC: all dimensions meet target or failures are explicitly logged
      with a remediation owner in `docs/memory.md`.*
- [ ] **Gate 1 sign-off:** reproducible estate + approved architecture.
      *AC: a second run of the full Week 1 pipeline from a clean checkout
      reproduces the same graph and data-quality scorecard.*

### Week 2 — Impact and Scope (Gate 2: affected set + plan explainable)

**D6 — Event feed** (WS-05)
- [ ] Change Signal Monitor ingests at least one mock model-change event.
      *AC: event normalized into the `ChangeEvent` shape in
      `docs/Interfaces.md`.*

**D7 — Blast radius** (WS-03, WS-04, WS-06)
- [ ] Change Impact Agent produces an affected-application hypothesis.
      *AC: dependency discovery recall ≥95% overall, 100% high-criticality
      against synthetic ground truth (`docs/PRD.md` §10).*
- [ ] Workload-risk classifier tiers each affected application.
      *AC: every affected application has a risk tier + rationale, no
      silent default.*

**D8 — Test ingestion** (WS-07)
- [ ] Test Asset Discovery Adapter maps synthetic tests to applications.
      *AC: ≥95% correct mapping, 100% for critical tests
      (`docs/Schema.md` §5.2).*

**D9 — Selection** (WS-08)
- [ ] Adaptive Regression Planner produces a plan with explicit
      inclusions/exclusions. *AC: every excluded test has a non-empty
      rationale string; zero critical tests excluded.*

**D10 — Missing-test review (Gate 2)**
- [ ] Missing-Test Generator proposes ≥1 candidate test for a known
      coverage gap. *AC: SME-reviewable output; ≥80% valid generated-test
      rate is the target, 100% review required before any high-risk use
      (`docs/PRD.md` §10).*
- [ ] **Gate 2 sign-off:** affected set and regression plan explainable end
      to end from a fresh event.

### Week 3 — Qualification and Rollout (Gate 3: no critical misses, LKG restored)

**D11 — Evaluation harness** (WS-09, WS-10)
- [ ] Deterministic evaluators run against seeded regression catalogue
      (`docs/Risks.md` §Seeded Regression Catalogue). *AC: 100% detection
      on defects marked "100% detection" threshold.*
- [ ] Differential (current vs. candidate) evaluation produces functional,
      safety, cost and latency comparison. *AC: results persisted with
      model IDs, versions, and parameters for reproducibility.*

**D12 — Trajectory checks** (WS-11)
- [ ] Trajectory/tool-call evaluator catches at least one seeded
      trajectory defect (e.g., "skipped policy check," "changed tool-call
      order"). *AC: 100% detection for defects marked Critical severity in
      the seeded catalogue.*

**D13 — Recommendation** (WS-12)
- [ ] Recommendation Engine produces migrate/canary/investigate/block for
      each affected application. *AC: zero unsafe migration recommendations
      against ground-truth treatment.*

**D14 — Approval / canary** (WS-13, WS-14)
- [ ] Human Approval Gateway requires a signed approval before any
      simulated promotion. *AC: attempting to promote without an approval
      record fails closed.*
- [ ] Simulated canary executes with pre-approved thresholds monitored.
      *AC: a seeded post-promotion regression is detectable within the
      canary window.*

**D15 — Rollback / self-governance (Gate 3)**
- [ ] Rollback Controller restores last-known-good on a seeded threshold
      breach. *AC: rollback recovery time ≤5 minutes in simulation
      (`docs/PRD.md` §10).*
- [ ] Self-Qualification Environment demonstrates one-level-only recursion.
      *AC: the candidate cannot spawn a second qualification run of itself.*
- [ ] **Gate 3 sign-off:** no critical misses; last-known-good restored
      successfully at least once under a seeded failure.

### Week 4 — Measurement and Decision (Gate 4: sponsor decision)

**D16 — Adversarial / failure tests** (WS-17)
- [ ] Run a subset of the failure scenarios (`docs/Risks.md`
      §Failure Scenario Coverage) — at minimum: dependency missed, false
      dependency, critical test excluded, evaluator timeout, rollback
      fails. *AC: each scenario resolves per its documented expected
      handling (execute/simulate/document/fail-closed), none silently
      ignored.*

**D17 — Repeated runs**
- [ ] Run the full event-to-recommendation pipeline three times on
      identical input. *AC: ≥90% materially same treatment across the
      three runs (`docs/PRD.md` §10 reproducibility threshold).*

**D18 — TCO** (WS-18)
- [ ] Cost ledger produced per `docs/Risks.md` §Cost Categories. *AC: cost
      per qualification event is measured, not estimated, and stays within
      the daily/per-event budgets in `.env.example`.*

**D19 — Final report** (WS-19)
- [ ] Final feasibility report drafted using the template in
      `docs/PRD.md` §11 (Go/No-Go framework) and the hypothesis results
      format below. *AC: every H1–H12 hypothesis has a Pass/Partial/Fail
      verdict with evidence reference.*

**D20 — Demo / Go-No-Go (Gate 4)** (WS-20)
- [ ] Demo rehearsed end to end using the five-step Techathon core
      (`docs/PRD.md` §9). *AC: runs without manual intervention from a
      clean environment.*
- [ ] **Gate 4 sign-off:** sponsor decision recorded — Go / Conditional Go
      / No-Go/Pivot — with named approving authority.

---

## Track B — Compressed 4-Day Techathon Track

**Day 1 — Build Foundation**
- [ ] Synthetic estate + dependency graph populated (reduced scope vs. full
      spike acceptable — document what was reduced in `docs/memory.md`).
- [ ] One real provider adapter (Bedrock) and one simulator adapter both
      respond to the shared interface.

**Day 2 — Impact and Scope**
- [ ] One model-change event ingested.
- [ ] Six affected applications identified with an explainable rationale
      per application.
- [ ] Adaptive regression plan produced with at least one exclusion
      rationale and one missing-test candidate.

**Day 3 — Qualification and Recommendation**
- [ ] Current-vs-candidate comparison run (functional + at least one of
      safety/cost/latency).
- [ ] All four treatment outcomes represented across the six applications
      (migrate, canary, investigate, block — not all four need to occur
      naturally; simulate at least one seeded scenario per outcome if
      needed to demonstrate the full decision space).

**Day 4 — Rollout and Demo**
- [ ] Human approval gate demonstrated (attempted bypass fails closed).
- [ ] Simulated canary + seeded degradation + deterministic rollback shown
      end to end.
- [ ] Evidence record produced and inspectable (even if minimal schema).
- [ ] Full demo rehearsed at least twice without manual recovery steps.

---

## Hypothesis Verdict Tracker (fill in during Week 4 / Day 3–4)

| ID | Hypothesis | Verdict | Evidence Ref |
|---|---|---|---|
| H1 | Dependency Discovery | | |
| H2 | Blast-Radius Analysis | | |
| H3 | Risk Classification | | |
| H4 | Adaptive Regression Selection | | |
| H5 | Missing-Test Discovery | | |
| H6 | Differential Qualification | | |
| H7 | Recommendation Quality | | |
| H8 | Controlled Migration | | |
| H9 | Safe Rollback | | |
| H10 | Self-Governance | | |
| H11 | Operating Cost | | |
| H12 | Reproducibility | | |
