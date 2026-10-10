# Design — Spike Dashboard Style Guide

**Important scope note:** the Concept Charter specifies *what* the
Dashboard/API component must do (§11: "expose status and evidence," "show
freshness/errors, never a misleading stale view") but does not specify a
visual design system — that's expected, since a charter is a business/
architecture document, not a brand guide. The palette and typography below
are carried over from the already-approved Techathon pitch deck for visual
consistency across everything with the "AI Evergreen" name on it. Treat this
file as a **design proposal**, not a charter requirement — change it freely
if a better internal design system exists.

The spike UI itself (Streamlit or minimal React, per `docs/Architecture.md`)
should stay functional and low-effort. Do not spend build time on visual
polish beyond what's below — the acceptance bar for the dashboard is "shows
accurate, fresh status," not "looks like a finished product."

---

## 1. Color Palette

| Token | Hex | Usage |
|---|---|---|
| `navy` | `#12304A` | Primary brand color, headers, primary buttons |
| `navy-deep` | `#0B2036` | Dark backgrounds (if a dark-mode dashboard variant is built) |
| `teal` | `#2B6F77` | Secondary accent — links, active states, graph edges |
| `teal-light` | `#E4EFEF` | Light backgrounds for cards, icon circles |
| `slate` | `#49575F` | Body text on light backgrounds |
| `slate-soft` | `#8A97A0` | Captions, muted labels, secondary metadata |
| `red` (alert) | `#B42318` | **Reserved exclusively for Hard Stops / blocked / rollback-triggered states.** Never use for generic emphasis. |
| `gold` (highlight) | `#A8791A` | Reserved for stat callouts / "investigate" status only |
| `cream` | `#F7F6F2` | Default content background |
| `line-soft` | `#D9DEDF` | Table borders, hairlines |

**Status color mapping (use consistently across every screen):**

| Recommendation / State | Color |
|---|---|
| Migrate (safe) | `teal` |
| Canary (in progress / monitored) | `gold` |
| Investigate (uncertain) | `slate-soft` with `gold` icon |
| Block / Hard Stop / Rollback triggered | `red` |

---

## 2. Typography

| Role | Font | Notes |
|---|---|---|
| Headings | Cambria (or system serif fallback) | Matches the approved pitch deck; do not substitute a sans-serif for headings |
| Body / UI text | Calibri (or system sans-serif fallback) | All dashboard chrome, tables, form labels |
| Monospace | System monospace (e.g., `ui-monospace`) | Model IDs, event IDs, correlation IDs, JSON payloads — always monospace so IDs are visually distinct from prose |

---

## 3. Core Dashboard Screens (Minimum Set for the Spike)

1. **Change Event Feed** — list of ingested change events, each showing
   detection time, source, and current pipeline stage.
2. **Blast Radius View** — the affected-application set for a selected
   event, with risk tier and confidence per application (use the status
   color mapping above for risk tier badges).
3. **Regression Plan View** — selected/excluded tests with rationale
   visible on hover or expand — never hide the exclusion rationale behind
   an extra click if it can be avoided.
4. **Recommendation & Approval View** — the four possible treatments
   clearly distinguished by color, with an explicit, prominent approval
   action that requires a named identity (no anonymous approval clicks).
5. **Evidence / Audit View** — read-only view of the immutable evidence
   package for a completed event, including hashes/signatures if
   implemented.

**Freshness indicator (non-negotiable, per charter):** every screen that
shows graph or evidence data must display a last-updated timestamp and a
visibly different state (not just a subtle color change) when data is stale
— e.g., a banner, not just a muted timestamp.

---

## 4. Iconography

Use simple, outline-style icons (no photographic imagery, no human figures)
consistent with the pitch deck's abstract network/graph motif. Suggested
icon-to-concept mapping for consistency with the pitch deck:

| Concept | Icon Theme |
|---|---|
| Dependency graph | Network/nodes |
| Change event | Magnifying glass / search |
| Risk classification | Target / bullseye |
| Regression plan | Checklist |
| Missing test | Search + flag |
| Recommendation | Flag / signpost |
| Approval | Handshake or signature |
| Rollback | Undo arrow |
| Evidence store | Locked document |

---

## 5. What Not To Build

- No marketing-style landing page — this is an internal engineering/demo
  tool for the spike, not a customer-facing product.
- No user-account management system — a single sandbox identity per role
  (approver, viewer) is sufficient for the spike (see `docs/PRD.md` §6.2,
  full UI is explicitly out of scope).
- No animation or motion design — clarity and correctness over polish.
