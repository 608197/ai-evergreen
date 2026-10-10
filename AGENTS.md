# AGENTS.md — AI Evergreen (Feasibility Spike)

This file is read automatically by Codex CLI (and any AGENTS.md-compatible agent)
at the start of every session. It contains only what an agent cannot reliably
infer from the code itself. It does **not** restate the folder structure, the
package list, or anything already visible in `docs/Architecture.md` —
read that file for structure, and this file for judgment calls.

Nested `AGENTS.md` files exist under specific service folders
(e.g. `src/ai_evergreen/trusted_kernel/AGENTS.md`). Codex merges root → nested,
with the nested file taking precedence for that folder. Do not delete nested
files or move their rules up here — they are deliberately scoped tighter.

---

## 1. What This Project Is

AI Evergreen is an **Enterprise AI Qualification Control Plane**: when an AI
dependency changes (model release, retirement, price change, policy change),
it discovers the enterprise blast radius, selects proportionate qualification
evidence, and recommends migrate / canary / investigate / block — always with
a human approving production promotion.

This repository is the **four-week feasibility spike** (or its compressed
4-day Techathon track), not a production build. Full scope, non-goals and
acceptance thresholds are in `docs/PRD.md`. If a task looks like it belongs to
"Future scope" in that file, stop and flag it — do not build it anyway
because it seems useful.

---

## 2. Non-Negotiable Operating Principles

These are enforced by code, not by prompting a model to "be careful." If you
are implementing a feature that seems to require violating one of these,
**stop and raise it** rather than finding a workaround.

1. **Evidence over assertion.** Every claim (a dependency edge, a test
   selection, a risk classification) must carry a source and a confidence
   score. Never hardcode a "confidence: 1.0" to make a demo pass.
2. **Deterministic checks before probabilistic judgement.** Rule-based /
   schema / policy checks run first and can block on their own. LLM judges
   run second and never override a deterministic failure.
3. **LLMs advise; policy determines allowed actions.** No LLM output is ever
   used directly to authorize a deploy, a rollback, or a test exclusion.
   It proposes; a deterministic policy layer (the Trusted Kernel) decides.
4. **Human approval is mandatory for production promotion.** There is no
   code path — not even a "spike shortcut" — where a candidate model or
   config reaches a production-simulated state without a signed human
   approval record.
5. **Automatic rollback only within pre-approved thresholds.** The Rollback
   Controller acts on fixed, versioned thresholds. It never asks an LLM
   "should I roll back?" at runtime.
6. **Provider-neutral core, provider-specific adapters.** Business logic
   (graph, planner, evaluator, kernel) must never import an AWS/Bedrock SDK
   directly. All provider calls go through the adapter interface in
   `src/ai_evergreen/providers/`.
7. **No raw production data, ever, in this repository.** This is a synthetic
   estate only (see `docs/Schema.md` §Synthetic Data). If any task
   references real customer data, real Jira tickets, or real trace exports,
   stop and flag it — do not proceed.
8. **Explainable test selection and exclusion.** Every excluded test needs a
   machine-readable reason attached to it. "No reason" is not a valid state
   — treat it as a bug, not a TODO.
9. **Critical invariants can never be excluded.** The seeded critical
   regression catalogue (`docs/Risks.md` §Seeded Regression Catalogue) is
   immutable per qualification event. Never edit or silently drop an entry
   from it to make a test suite pass faster.
10. **AI Evergreen governs itself, but cannot mark its own homework.** If you
    are building the self-qualification path, the candidate planner must
    never be the sole evaluator of its own output. See
    `src/ai_evergreen/self_governance/AGENTS.md` if/when that folder exists.

---

## 3. Hard Stops (Treat as Build-Breaking, Not Warnings)

If a change you are making would cause any of the following, do not commit it
— surface it instead:

- A missed critical-severity dependency in the blast radius.
- A missed seeded critical regression (100% detection is the bar, not "close").
- Any code path that promotes a candidate to a production-simulated state
  without a recorded human approval.
- A candidate model or component evaluating itself with no independent judge.
- An excluded test with no attached rationale.
- A recommendation that cannot be reproduced from its stored evidence record.
- A failed rollback with no break-glass / manual runbook fallback documented.

---

## 4. Engineering Conventions Specific to This Codebase

- **Language / framework:** Python 3.12, FastAPI. Do not introduce a second
  web framework "because it's faster to prototype in" — consistency across
  a 17-component system matters more than marginal speed on one component.
- **Package management:** `uv` (preferred) or Poetry with a committed
  lockfile. Never install a package ad hoc without adding it to the lockfile.
- **Schema validation:** Pydantic + JSON Schema for every component
  boundary. If you add a new field to an entity in `docs/Schema.md`, update
  the schema file in the same change — do not let code and docs drift.
- **Graph store:** NetworkX + SQLite for the spike by default (Neo4j
  Community only if a task explicitly calls for property-graph queries the
  spike genuinely needs). Do not default to Neo4j just because it's more
  "production-like" — that adds setup friction with no spike benefit.
- **Testing bar:** pytest + jsonschema + contract tests must pass before a
  task is considered done. "It ran once in my session" is not done.
- **Determinism first:** Any evaluator you write should default to
  deterministic (rule-based) logic. Only reach for an LLM-based evaluator
  when the charter's evaluation design explicitly calls for a probabilistic
  or trajectory evaluator (see `docs/Interfaces.md`).
- **No silent provider fallback.** If a Bedrock call fails, do not silently
  swap in a different model. Use the approved simulator adapter and record
  a fallback event — see `src/ai_evergreen/providers/AGENTS.md`.
- **Secrets:** never write a real key into `.env`, code, or a commit.
  `.env.example` documents required variables with placeholder values only.

---

## 5. Explicitly Out of Scope for This Repository

Do not build these even if a task description seems to invite it — they are
recorded as "Future scope" or "Out of scope for the spike" in the approved
charter (see `docs/PRD.md` §7):

- Full enterprise-wide onboarding or real production deployment.
- Replacement of Jira/Xray/ADO, CI/CD, observability, gateway, or governance
  platforms — this system orchestrates them, it does not replace them.
- Universal regulatory certification or a legal compliance determination.
- Uncontrolled autonomous promotion of any kind.
- A full commercial-grade UI. A minimal Streamlit/FastAPI dashboard is
  sufficient for the spike (see `docs/Design.md`).
- Embedding/reranker changes, MCP-server changes, agent-framework upgrades,
  vector-database changes, fine-tuned-model changes, cross-agent dependency
  impact, multi-region qualification, regulated-industry evidence packs —
  all explicitly deferred to product roadmap phases beyond this spike.

---

## 6. Where To Look Before Asking / Guessing

| Question | File |
|---|---|
| What are we building, for whom, and what's explicitly out of scope? | `docs/PRD.md` |
| What are the components, data flow, tech stack, folder layout? | `docs/Architecture.md` |
| What is the exact input/output contract for a given component? | `docs/Interfaces.md` |
| What does the dependency graph / behavioural contract schema look like? | `docs/Schema.md` |
| What week / gate are we in, and what must be true to pass it? | `docs/Phases.md` |
| What is today's specific checklist item and its pass/fail bar? | `docs/Tasks.md` |
| What could go wrong, and what's the seeded regression catalogue? | `docs/Risks.md` |
| Why was a past architectural choice made? | `docs/Decisions.md` |
| What does the minimal dashboard look and feel like? | `docs/Design.md` |
| What has already been built, and what's the current state? | `docs/memory.md` |
| What mistakes has an agent made before on this repo, and the fix? | `docs/lessons-learned.md` |

If none of these answer the question and the charter doesn't cover it either,
add it to the Open Questions table in `docs/PRD.md` rather than guessing
silently.

---

## 7. Session Discipline

- At the **start** of a session, read `docs/memory.md` first — do not
  re-derive project state from scratch by re-reading every doc.
- At the **end** of a session (or any time you complete a checklist item in
  `docs/Tasks.md`), update `docs/memory.md` with what changed and update the
  checkbox in `docs/Tasks.md`. Treat an unupdated memory file as an
  incomplete task.
- If you make a mistake that cost meaningful rework, log it in
  `docs/lessons-learned.md` in the format shown in that file — one line is
  enough, but do not skip it.
