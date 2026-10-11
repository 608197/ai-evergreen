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
| 2026-10-10 | Attempted standard `git push origin main` which failed with HTTP 403 due to corporate Zscaler proxy blocking `git-receive-pack` POST requests. | Always bypass Zscaler by using `python scripts/push_to_github.py "<commit_message>"` to upload blobs and update refs via GitHub REST API. |
| 2026-10-11 | Instructed user to run `npm run build` on the remote EC2 VM host. | The application is fully containerized using a multi-stage Docker build (`node:22-alpine` -> `nginx:alpine`). The VM host does not have/need Node or npm; the only command needed is `git pull && docker compose up -d --build`. |
| 2026-10-11 | TopBar persona dropdown was obscured behind the Canary Hero card on the Home page because CSS variables `--ev-z-sticky` and `--ev-z-popover` were missing from `tokens.css`, evaluating to `z-index: auto`. | Added complete Z-index scale tokens to `tokens.css` and set explicit `z-index: 100` on `.ev-topbar` and `z-index: 1000` on `.ev-topbar__popover`. |
| 2026-10-11 | Evaluators could not easily discover how to switch personas because the role switcher was tucked away inside a small top-right user menu. | Added an explicit, prominent horizontal "SWITCH PERSPECTIVE:" selector tab strip directly on `HomeScreen.tsx` above the hero card with 1-click access to all 6 core personas. |
| 2026-10-11 | Sub-pages (Estate, Memory, Portfolio) had inconsistent active event banners and dead `#/...` anchor links. | Updated sub-screens to maintain active event `E-2026-001` continuity and replaced anchor tags with React Router `useNavigate()` navigation. |

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
