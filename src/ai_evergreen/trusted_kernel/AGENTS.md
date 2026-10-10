# AGENTS.md — Trusted Kernel (nested, overrides root for this folder)

This folder is the highest-control-boundary component in the entire system
(see `docs/Architecture.md` §Trusted Kernel). Root `AGENTS.md` still applies;
this file adds stricter, folder-specific rules that take precedence.

## Absolute Rules For This Folder

1. **No LLM calls of any kind originate from this folder.** Not for
   "summarizing a decision," not for "generating a friendlier error message."
   If you find yourself wanting to import an LLM client here, the logic
   belongs in `regression/`, `evaluators/`, or `impact_agent/` instead —
   this folder is deterministic-only, full stop.
2. **Every function here must be unit-testable without network access or
   mocks of an LLM.** If a test for this folder needs to mock a model call,
   that is a signal the logic is in the wrong place.
3. **Fail closed, always.** Any exception, timeout, or unexpected input in
   this folder must resolve to "deny" or "block," never to a default-allow.
4. **This code is independently reviewable.** Keep functions small,
   pure where possible, and avoid clever abstractions — a human reviewer
   (Security Authority / Architecture Authority per the charter's approval
   list) must be able to read this folder top to bottom and trust it.
5. **Changes here require an entry in `docs/Decisions.md`.** Even a small
   threshold change is a governance-relevant decision, not a routine commit.
6. **Never expand this folder's own privileges.** This layer enforces
   policy on everything else; it must not grant itself deploy rights,
   write access to production adapters, or bypass its own approval gate.

## What Belongs Here (and only here)

- Behavioural-contract validation logic.
- Policy enforcement (OPA/Rego or deterministic Python rules).
- The permit/deny decision for promotion, rollback authorization, and
  critical-test-exclusion checks.
- Evidence integrity checks (hash/signature verification).

## What Does Not Belong Here

- Test selection heuristics → `regression/`
- Risk classification → `risk/`
- Any narrative/explanation generation → `recommendation/`
