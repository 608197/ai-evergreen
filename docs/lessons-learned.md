# Lessons Learned — Mistake → Correction Log

Purpose: generic AI-agent instruction files lose effectiveness over time
because they repeat what the agent can already infer from the code. This
file exists to hold the opposite kind of knowledge — specific mistakes made
*on this repository*, and the correction, so the same mistake isn't repeated
in a later session (possibly by a different agent, or a different person).

One line per entry is enough. Do not skip logging a mistake because it feels
minor — small recurring mistakes are exactly what this file prevents.

Format: `Date | What went wrong | Correction / rule going forward`

---

| Date | What Went Wrong | Correction Going Forward |
|---|---|---|
| _(none yet — first entries will appear once the build starts)_ | | |

---

## Guidance for Writing a Good Entry

**Weak entry (too generic, don't write this):**
> "Agent wrote bad code, had to fix it."

**Strong entry (specific, non-obvious, actionable):**
> "Agent implemented cost budget enforcement inside `orchestrator/` instead
> of `providers/`, causing it to be bypassed when `evaluators/` called a
> provider directly. Correction: all budget/rate-limit enforcement must live
> in `providers/` per its `AGENTS.md`, with no exceptions — added an explicit
> note there."

If a mistake reveals a gap in `AGENTS.md`, `docs/Architecture.md`, or
`docs/Interfaces.md`, update that file in the same change — this log records
*that it happened*, the source-of-truth docs record *the rule going
forward*.
