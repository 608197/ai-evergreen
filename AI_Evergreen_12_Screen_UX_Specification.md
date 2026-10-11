# AI Evergreen — 12-Screen UI/UX Specification

Build handoff for the connected solution: design system, shell, twelve screens, overlays, states, seed data, demo mode and acceptance tests

| **Product** | AI Evergreen: the Enterprise AI Qualification Control Plane for continuous, safe AI evolution |
|----|----|
| **Document** | 12-Screen UI/UX Specification, version 1.0 (build handoff) |
| **Date** | 09 Sep 2026 |
| **Document owner** | Puneet Saxena, Principal Architect |
| **Prepared by** | Microsoft 365 Copilot acting as UI/UX design lead |
| **Intended readers** | The builder (an AI coding model such as Gemini, or a front-end team), design reviewers, Techathon presenters |
| **Source material** | Concept Charter and Feasibility Spike Plan v0.9; scaffold documents (PRD, Architecture, Interfaces, Schema, Phases, Tasks, Risks, Design, Glossary); Techathon pitch deck |
| **Status** | Draft for build. Items tagged \[P\] are UI proposals not specified in the charter; everything else is derived from the charter or scaffold. |

> **READ FIRST**
>
> The product runs only on a synthetic estate in the spike. Every screen must carry a persistent “Sandbox · Synthetic data” marker, and no number may be shown as a result unless it is labelled “illustrative” or “measured”.

## How to use this document

This specification is written so that a builder who has never seen AI Evergreen can produce a working, connected, demo-ready front end without asking questions. It defines what to build, how it must look and behave, what data to seed, and how to prove it is finished.

#### Conventions

| **Marker** | **Meaning** | **What the builder does** |
|----|----|----|
| BUILD RULE box | A mandatory implementation instruction. | Implement exactly. If impossible, stop and report; do not substitute. |
| DESIGN RULE box | A principle that explains a visual or behavioural choice. | Apply wherever the same situation occurs, including places not described here. |
| HARD STOP box | A safety or honesty constraint that protects the credibility of the product. | Treat a violation as a failing test. |
| \[P\] tag | A UI proposal made by this document that the charter does not specify (for example placeholder thresholds). | Build it, and keep every such value in one constants file so it can be changed. |
| “illustrative” | A synthetic number used to make the demo concrete. | Show the word “illustrative” beside it. Never present it as a measured saving. |
| monospace | Literal identifiers: routes, field names, token names, component names. | Use exactly as written. |

#### Precedence when sources disagree

1.  The approved Concept Charter and the scaffold documents (Schema, Interfaces, Risks) win on **what the system does** and on **data names**.

2.  This specification wins on **how the interface looks and behaves**.

3.  If two parts of this specification disagree, the **design principles (section 4)** and the **HARD STOP** boxes win.

#### Recommended reading order for the builder

1.  Sections 1 to 3: what is being built and for whom. Section 4: the principles.

2.  Sections 5 and 6: design system and components. Build these first and reuse them everywhere.

3.  Sections 7 to 9: navigation, global shell, and the connected-solution rules (data store, state machines, gates, cross-screen effects).

4.  Section 10 (screens 1 to 12) and section 11 (overlays), in order.

5.  Sections 12 to 17: states, content design, glossary, accessibility, performance, Demo Director and seed data.

6.  Sections 18 to 20: build plan, acceptance tests, usability testing and open decisions.

#### Document map

- How to use this document
- 1. Executive summary: what will be built
- 2. Product context the interface must express
- 3. Users, roles and permissions
- 4. Design principles
- 5. Design system
  - 5.1 Colour tokens
  - 5.2 Semantic status mapping (use everywhere)
  - 5.3 Typography
  - 5.4 Spacing, grid and layout
  - 5.5 Shape, elevation, iconography and motion
- 6. Component library
  - 6.1 Component catalogue
  - 6.2 Core component state matrix
- 7. Navigation and information architecture
  - 7.1 Sitemap
  - 7.2 Rules
- 8. Global shell (on every screen)
  - 8.1 Wireframe
  - 8.2 Zone specification
  - 8.3 Global behaviours
- 9. Connected-solution architecture
  - 9.1 Recommended build stack \[P\]
  - 9.2 Suggested project structure
  - 9.3 Data store: entities and key fields
  - 9.4 API surface the mock adapter must implement
  - 9.5 State machines
  - 9.6 Gates (exact conditions)
  - 9.7 Cross-screen effects (what must update everywhere)
  - 9.8 Evidence chain, audit and notifications
  - 9.9 Persistence, reset and URL state
- 10. The twelve screens
  - 1. Command Center (Home)
  - 2. Event: Blast Radius
  - 3. Event: Regression Plan
  - 4. Event: Results
  - 5. Event: Recommendation and Approval
  - 6. Event: Rollout Monitor
  - 7. Event: Evidence Record
  - 8. Estate Explorer
  - 9. Workload Profile
  - 10. Qualification Memory
  - 11. Controls and Self-Governance
  - 12. Portfolio and Horizon
- 11. Overlays
  - O1. Test rationale drawer
  - O2. Approval confirmation modal
  - O3. Manual event entry
  - O4. Hard-stop interstitial
  - O5. Glossary popover and panel
- 12. State design across the product
  - State coverage matrix
- 13. Content design and microcopy
  - 13.1 Voice and tone
  - 13.2 Patterns
  - 13.3 Words and claims that must not appear
  - 13.4 Fixed labels
- 14. Glossary (charter section 1.3)
- 15. Accessibility (WCAG 2.2 AA)
  - 15.1 Requirements checklist
  - 15.2 Keyboard map
  - 15.3 Testing requirements
- 16. Performance and responsive rules
- 17. Demo Director mode and seed scenario
  - 17.1 Demo Director specification
  - 17.2 Ten-minute demo script
  - 17.3 Failure injections
  - 17.4 Seed data: the Atlas-1 retirement scenario
- 18. Build plan for the builder
  - Techathon mapping (compressed track)
  - Builder prompt to start the build
- 19. Acceptance tests, usability testing and UX metrics
  - 19.1 End-to-end acceptance tests
  - 19.2 Usability testing plan
  - 19.3 UX success metrics
- 20. Open decisions, assumptions and traceability
  - 20.1 Decisions to record
  - 20.2 Assumptions
  - 20.3 Traceability to the charter

## 1. Executive summary: what will be built

AI Evergreen needs **12 screens and 5 overlays**, delivered inside **one persistent application shell** and driven by **one shared in-memory data store**, so a decision made on one screen is immediately reflected on every other screen. Screens 2 to 7 are not separate pages; they are the six stages of a single **Event Workspace**, which is the heart of the product.

| **\#** | **Screen** | **Route** | **Question it answers** | **Tier** |
|----|----|----|----|----|
| 1 | Command Center | / | What needs me right now? | A |
| 2 | Event: Blast Radius | /events/:id/blast-radius | Who is truly affected? | A |
| 3 | Event: Regression Plan | /events/:id/plan | What will we test, and why? | A |
| 4 | Event: Results | /events/:id/results | How does the candidate behave compared with the current model? | A |
| 5 | Event: Recommendation and Approval | /events/:id/decision | What do we do, and who signs? | A |
| 6 | Event: Rollout Monitor | /events/:id/rollout | Is the change safe, live? | A |
| 7 | Event: Evidence Record | /events/:id/record | Can we prove it later? | A |
| 8 | Estate Explorer | /estate | What does our AI estate look like? | B |
| 9 | Workload Profile | /estate/workloads/:id | What is this application’s contract and history? | B |
| 10 | Qualification Memory | /memory | What has Evergreen learned? | B |
| 11 | Controls and Self-Governance | /controls | What rules bind the system, including itself? | B |
| 12 | Portfolio and Horizon | /portfolio | Where is our AI technical debt and what retires next? | B |

**Tier A** screens form the demonstrable core and must be built to full fidelity, including every state in section 12. **Tier B** screens must be fully navigable and populated from seed data but may be read-only; where a Tier B screen previews a future capability it carries a visible “Roadmap preview” ribbon.

| **Overlay** | **Name** | **Opened from** |
|----|----|----|
| O1 | Test rationale drawer | Screen 3 (any test row), Screen 4 (any case) |
| O2 | Approval confirmation modal | Screen 5 (approve), Screen 6 (manual rollback) |
| O3 | Manual event entry | Screen 1 (Log event), command palette |
| O4 | Hard-stop interstitial | Any screen, raised by the Trusted Kernel or an integrity failure |
| O5 | Glossary popover and panel | Any dotted-underlined term; Help menu |

#### The six decisions that shape the design

1.  **The pipeline is the spine.** The 14-step agentic loop in the charter collapses into six visible stages (Blast Radius, Plan, Results, Decision, Rollout, Record). The stage stepper is always on screen inside an event.

2.  **Machine proposals are labelled; rules decide.** Content is tagged Rule-based, AI-proposed or Human-entered. The Trusted Kernel result (Permit or Deny) is shown separately and cannot be overridden from the interface.

3.  **Uncertainty is first-class.** Confidence, residual gaps and stale data have their own visual treatment and wording.

4.  **Friction matches consequence.** Low-risk approvals take one confirmation; critical-risk approvals require typed confirmation, a written rationale and identity re-verification.

5.  **Red is reserved.** Red appears only for Block, hard stops and rollback. Risk tiers use a separate navy bar meter so “critical” never competes with “blocked”.

6.  **The demo is a product feature.** A Demo Director mode seeds the six-application scenario, guides the presenter, injects failures on demand and resets in under a second.

## 2. Product context the interface must express

AI Evergreen is an Enterprise AI Qualification Control Plane. When an AI dependency changes (a model release, retirement, price change or policy change) it finds the true blast radius across the enterprise, sets proportionate test depth per workload, finds missing tests, and recommends one of four treatments. A named human approves every production promotion. Evergreen orchestrates above existing tools (Jira, Xray, observability, gateways, evaluation platforms); it does not replace them.

#### 2.1 The four recommendation outcomes (core vocabulary)

| **Outcome** | **Meaning in plain English** | **What a human can do next** |
|----|----|----|
| Migrate | Evidence supports moving this workload to the candidate through shadow then full rollout. | Approve, request more evidence, reject. |
| Canary | Evidence supports a controlled, monitored partial rollout with automatic rollback inside pre-approved thresholds. | Approve the canary ladder, request more evidence, reject. |
| Investigate | Evidence is insufficient or conflicting; more is needed before any rollout. | Acknowledge, request more evidence (maximum two expansion cycles), assign to owner. |
| Block | A deterministic check or policy forbids the change for this workload. | Acknowledge. The outcome cannot be overridden in the interface. |

#### 2.2 The 14-step loop mapped to six visible stages

| **UI stage** | **Screen** | **Charter loop steps covered** | **Gate to leave the stage** |
|----|----|----|----|
| 1\. Blast Radius | 2 | Perceive, Investigate, Discover, Assess | G1: no unresolved critical dependency edge (each is confirmed or overridden with reason, owner, expiry and evidence). |
| 2\. Plan | 3 | Plan, including missing-test proposals | G2: plan approved by the Test Lead; every proposed high-risk test approved or rejected; Kernel validates the critical pack. |
| 3\. Results | 4 | Execute, Verify, Expand evidence | G3: run complete, or explicitly marked inconclusive. |
| 4\. Decision | 5 | Recommend, Request approval | G4: a signed approval exists for at least one Migrate or Canary item and the Kernel returns Permit. |
| 5\. Rollout | 6 | Migrate, Monitor, Roll back | G5: every rollout is complete, held, aborted or rolled back. |
| 6\. Record | 7 | Learn, plus the whole timeline | None. Available as soon as a decision exists and grows continuously. |

#### 2.3 Charter principles translated into interface behaviour

Each non-negotiable principle in the charter must be visible in the interface, not only enforced in the back end.

| **Principle (charter section 10)** | **How the interface must show it** |
|----|----|
| Evidence over assertion | Every dependency edge, test decision and recommendation displays source, evidence class, confidence and last-verified time. A claim with no source cannot be rendered. |
| Deterministic checks before probabilistic judgement | In Results, deterministic dimensions are the first columns; a deterministic failure visually dominates the row. |
| LLMs advise; policy determines allowed actions | AI-written text carries an “AI-proposed” tag. The Trusted Kernel verdict (Permit or Deny with rule ID) sits beside every recommendation and disables approval on Deny. |
| Human approval for production promotion | No control anywhere promotes a change except through overlay O2. Approvals show named identity, scope and expiry. |
| Automatic rollback only within approved thresholds | Rollout charts draw the pre-approved threshold as a band. Automatic rollback is labelled “within pre-authorised policy”; manual rollback needs two distinct people. |
| Explainable selection; no exclusion without rationale | Every excluded test shows a reason chip with a reason code. If data arrives without one, the UI shows a defect banner instead of a blank. |
| Critical invariants can never be excluded | Critical-pack tests show a lock and cannot be toggled. The tooltip says “Immutable for this event”. |
| Residual uncertainty must be surfaced | Each recommendation has a “What we do not know” block that cannot collapse to nothing; if there are no gaps it says so. |
| Reproducibility | A run-manifest chip (model versions, parameters, seed) on Results; “Reproduce this run” on the Record. |
| AI Evergreen governs its own dependencies | The Controls screen registers Evergreen itself as a workload, shows candidate versions of Evergreen and states that it cannot approve itself. |
| Customer-owned data; no raw production data | Sandbox marker on every screen; test inputs shown as synthetic; export buttons name exactly what they include. |

> **NOTE**
>
> Terminology is fixed by the charter glossary (20 terms; see section 14). Use the same word for the same thing everywhere: “blast radius”, “critical pack”, “last-known-good”, “behavioural contract”, “qualification”, “promotion”. Never introduce synonyms in labels.

## 3. Users, roles and permissions

The charter names thirteen buyer and user personas. The interface is designed around the nine who touch it directly. Demo mode lets the presenter switch between eight synthetic identities without logging out.

#### 3.1 Persona summary

| **Role** | **Job to be done in Evergreen** | **Main screens** | **What success feels like** |
|----|----|----|----|
| Application Owner | Decide whether my application can move, and sign for it. | 1, 2, 5, 9 | I never rediscover what the change touches, and I can defend my decision. |
| QA / Test Lead | Approve a defensible test scope and review proposed new tests. | 3, 4, 9 | I can see exactly why each test was kept or dropped. |
| Risk and Compliance Approver | Sign high-risk promotions with evidence I can defend later. | 5, 7, 11 | The record shows who approved what, on which evidence. |
| Data Owner | Co-approve rollouts that touch my data sources. | 5, 9 | I only see what I must approve, with the data impact stated. |
| SRE / Operations | Watch a rollout, hold it, or roll it back. | 1, 6 | I see a breach and the recovery clock the moment it happens. |
| AI Platform Engineer | Keep the dependency graph accurate; reuse one service across projects. | 2, 8, 11 | Stale, conflicting and orphaned items are obvious. |
| AI Governance / Internal Audit | Verify that controls operate and evidence is intact. | 7, 10, 11 | Integrity is checkable in one click. |
| Enterprise Architect | Understand dependencies and contracts across platforms. | 8, 9, 10 | The graph and contracts are readable and versioned. |
| CIO / CTO | See adoption speed and AI technical debt. | 1, 12 | I can see what retires next and what moving will cost. |

#### 3.2 Demo identities (synthetic)

These people do not exist. Show “Synthetic user” in the identity menu while Demo Director is active.

| **Display name** | **Role** | **Owns or approves in the seed data** |
|----|----|----|
| Asha Rao | Application Owner | Refund Agent, Claims Policy Assistant, Ticket Summariser, Customer Chat Assistant |
| Marcus Lee | QA / Test Lead | Regression plans; Invoice Field Extractor and Support Triage Classifier |
| Priya Menon | Risk and Compliance Approver | Critical or regulated promotions where the approval matrix names her; acknowledges Block items |
| Daniel Okafor | Data Owner | Claims Policy Assistant retrieval sources |
| Sofia Alvarez | SRE / Operations | Rollout, hold, manual rollback request |
| Ravi Kulkarni | AI Platform Engineer | Graph confirmations and overrides; second confirmer for manual rollback |
| Helen Ward | Governance and Audit | Read access to Record, Memory and Controls; export |
| Jonas Weber | Executive (CIO) | Read access to Home and Portfolio |

#### 3.3 Permission matrix

A = can act, C = can act as second confirmer, R = read, dash = no access. The approving authority for a promotion depends on workload type (the approval column of the workload risk matrix in the Schema document); the matrix shows generic rights and section 17 lists the exact approver per demo workload.

| **Action** | **App Owner** | **QA Lead** | **Risk Appr.** | **Data Owner** | **SRE** | **Platform Eng.** | **Gov / Audit** | **Exec** |
|----|----|----|----|----|----|----|----|----|
| View screens 1 to 7 | R | R | R | R | R | R | R | R (1) |
| Confirm or override a graph edge | A | – | – | – | – | A | R | – |
| Approve the regression plan | R | A | R | – | R | R | R | – |
| Approve or reject a proposed test | R | A | R | – | – | – | R | – |
| Sign a promotion (per workload authority) | A | A | A | A | A | – | – | – |
| Hold or resume a rollout | – | – | – | – | A | A | – | – |
| Request a manual rollback | – | – | – | – | A | A | – | – |
| Confirm a manual rollback (second person) | C | – | – | – | C | C | – | – |
| Propose a contract change (Profile) | A | – | – | – | – | A | R | – |
| View Controls and Memory | R | R | R | R | R | R | R | R |
| Export an evidence record | A | – | A | – | – | – | A | – |
| View Portfolio and Horizon | – | – | – | – | – | R | R | A |

> **BUILD RULE**
>
> Permission checks live in one function, can(role, action, context), used by every control. Disabled controls must explain why in a tooltip and an accessible description, for example “Only a Test Lead can approve the plan.”
>
> Separation of duties **[P]**: a person who confirmed or overrode a graph edge, or approved a proposed test, in an event cannot be the sole approver of the promotion in the same event. The approval panel shows this check and blocks with: “You took part in earlier steps of this event, so a different approver must sign.”

## 4. Design principles

Twelve principles govern every decision. When a situation is not covered by a screen specification, decide by principle, in the order listed.

| **\#** | **Principle** | **What it means in this product** | **Anti-pattern to reject** |
|----|----|----|----|
| 1 | One question per screen | Each screen answers one question (section 1). The page title is the question’s noun (“Blast radius”) and the primary action moves the user to the next question. | Dashboards that show everything; screens with two competing primary actions. |
| 2 | The pipeline is the spine | Inside an event the six-stage stepper is always visible and shows complete, current, available and locked stages, explaining locked stages in words. | Hidden tabs; silent disabled stages; a wizard that traps users. |
| 3 | Every machine decision has a Why within one click | Every exclusion, risk tier, recommendation, Kernel verdict and graph edge opens a plain-language reason with evidence, source and time. | Black-box scores; tooltips that only restate the label. |
| 4 | Show uncertainty; never round up | Confidence, residual gaps, stale data, judge disagreement and unresolved edges each have a named, visible treatment. “Unknown” is a valid value. | Showing 0.58 as “Good”; hiding gaps behind averages; green by default. |
| 5 | Friction matches consequence | Low: one confirmation. High: written rationale. Critical: typed confirmation, rationale and identity re-verification. No “approve all”. | The same one-click approval for a Refund Agent and a ticket summariser. |
| 6 | Colour never works alone | Every status pairs colour with an icon and a word. Charts add marker shapes and direct labels. Contrast meets WCAG 2.2 AA. | Red/green only; icons without labels; low-contrast grey text. |
| 7 | Role-aware first, complete second | Home shows what needs this person now, then everything else. Controls a person cannot use are present but disabled with a reason, so the process stays legible. | One layout for all roles; hiding actions so users cannot learn the process. |
| 8 | Progressive disclosure | Four levels: headline, summary, evidence, raw data. Users can stop at any level. | Raw JSON on first view; truncation with no way to expand. |
| 9 | Provenance on everything | Content is tagged Rule-based, AI-proposed or Human-entered with a source and time. The tag is a component, not decoration. | Mixing AI prose and rule output in one unlabelled paragraph. |
| 10 | Honesty over polish | Synthetic data, illustrative numbers and roadmap previews are labelled in place. | Impressive unlabelled percentages. |
| 11 | Append-only decisions | Approvals, overrides and rollbacks are never edited. A mistake is corrected by a new, linked decision. The UI shows history, not an edit pencil. | Editing a past approval; deleting an override. |
| 12 | Consistency over novelty | One component for one job. The same gesture means the same thing everywhere. | A new table style per screen; two ways to open a reason. |

> **DESIGN RULE**
>
> When two principles collide, safety wins: principles 4, 5, 9, 10 and 11 outrank speed, brevity and visual simplicity.

## 5. Design system

The palette and typefaces come from the approved Techathon pitch deck and the scaffold Design document, so the product matches everything else that carries the AI Evergreen name. Contrast ratios below were calculated against the real hex values; two tokens from the earlier palette fail for text and are restricted accordingly.

### 5.1 Colour tokens

| **Token** | **Hex** | **Contrast on white** | **Allowed use** |
|----|----|----|----|
| navy | \#12304A | 13.6:1 | Primary text, headings, primary buttons, risk meter fill, table headers. |
| navy-deep | \#0B2036 | 16.5:1 | Hard-stop takeover background, Demo Director panel, dark surfaces. |
| teal | \#2B6F77 | 5.8:1 | Links, active navigation, Migrate chip, selected state, graph focus. White text on teal passes (5.8:1). |
| teal-light | \#E4EFEF | background | Selected rows, card tint, info callouts. Navy on it is 11.6:1; teal on it is 4.9:1. |
| slate | \#49575F | 7.5:1 | Body text and secondary labels. |
| slate-muted \[P\] | \#5B6870 | 5.7:1 | Captions, metadata, placeholder text. Replaces slate-soft for any text. |
| slate-soft | \#8A97A0 | 3.0:1 | Never for text. Disabled icons, decorative marks and chart gridlines only. |
| border-strong \[P\] | \#6B7983 | 4.5:1 | Borders of inputs, checkboxes and other interactive controls (meets 3:1 non-text contrast). |
| line-soft | \#D9DEDF | 1.4:1 | Decorative dividers and card outlines only. Never the sole boundary of a control. |
| red | \#B42318 | 6.6:1 | Reserved: Block, hard stop, rollback-triggered, destructive confirm. White text on red passes (6.6:1). |
| red-tint \[P\] | \#FBE9E7 | background | Background of Block cards and hard-stop banners. Red on it is 5.6:1. |
| gold | \#A8791A | 3.9:1 | Graphics and large text only (3:1). Canary and Investigate icons, chart markers. Never white text on gold. |
| gold-text \[P\] | \#7A5710 | 6.6:1 | Any gold-family text. On gold-tint it is 5.9:1. |
| gold-tint \[P\] | \#FBF1DC | background | Background of Canary, Investigate and warning banners. |
| cream | \#F7F6F2 | background | Page background. Navy on cream is 12.6:1. |
| white | \#FFFFFF | background | Cards, tables, inputs, drawers. |
| focus \[P\] | \#1F6FEB | 4.6:1 | Focus ring: 2 px ring with 2 px white offset on every interactive element. |

### 5.2 Semantic status mapping (use everywhere)

| **Meaning** | **Colour treatment** | **Icon (Lucide name)** | **Always-present label** |
|----|----|----|----|
| Migrate | Solid teal chip, white text | circle-check | Migrate |
| Canary | gold-tint chip, gold-text text, gold icon | activity | Canary |
| Investigate | gold-tint chip with dashed border, gold-text text | search | Investigate |
| Block | Solid red chip, white text | ban | Block |
| Kernel: Permit | Outlined teal chip | shield-check | Kernel: Permit |
| Kernel: Deny | Outlined red chip on red-tint | shield-x | Kernel: Deny |
| Pass / Warn / Fail / Not applicable / Inconclusive | Teal check, gold triangle, red cross, grey dash, grey question mark (all with a shape difference) | check, triangle-alert, x, minus, circle-help | Pass, Warn, Fail, N/A, Inconclusive |
| Stale / unresolved / conflict | gold-tint banner or chip | clock-alert, circle-help, git-compare | Stale, Unresolved, Conflict |
| Rule-based / AI-proposed / Human-entered | Navy outline / teal tint with sparkle / slate outline with person | cog, sparkles, user | Rule-based, AI-proposed, Human-entered |
| Rolled back | Solid red banner with timer | undo-2 | Rolled back |

> **DESIGN RULE**
>
> Risk tier is not a colour. Show it as a four-segment navy bar meter (Low = 1 segment, Medium = 2, High = 3, Critical = 4) with the word beside it. This keeps “Critical risk” from visually competing with “Block”.

### 5.3 Typography

| **Role** | **Family** | **Size / line height** | **Weight** | **Use** |
|----|----|----|----|----|
| Page title | Headings stack | 28 / 36 px | Bold | One per screen. The noun of the question (“Blast radius”). |
| Section title | Headings stack | 20 / 28 px | Bold | Card and panel titles. |
| Sub-title | UI stack | 16 / 24 px | Semibold | Group titles inside panels. |
| Body | UI stack | 14 / 20 px | Regular | Default UI text. |
| Table text | UI stack | 13 / 18 px | Regular | Dense tables. Never below 13 px. |
| Caption | UI stack | 12 / 16 px | Regular | Metadata, timestamps. Never below 12 px. |
| Overline | UI stack | 11 / 16 px caps, +6% tracking | Semibold | Section labels, zone labels. |
| Stat number | Headings stack | 32 / 36 px, tabular figures | Bold | Counters on Home and Portfolio. |
| Code and IDs | Mono stack | 12.5 / 18 px | Regular | Event IDs, model IDs, hashes, rule IDs, correlation IDs. |

> **BUILD RULE**
>
> Headings stack: Cambria, "Source Serif 4", Georgia, serif. UI stack: Calibri, Carlito, "Segoe UI", system-ui, sans-serif. Mono stack: ui-monospace, "Cascadia Mono", Consolas, monospace.
>
> Use tabular figures (font-variant-numeric: tabular-nums) in every numeric column and counter so values do not jitter when they update. Text must reflow at 200 % zoom without horizontal scrolling.

### 5.4 Spacing, grid and layout

| **Item** | **Value** |
|----|----|
| Spacing scale (4 px base) | 4, 8, 12, 16, 24, 32, 48, 64 px. No other values. |
| Page grid | 12 columns, 24 px gutters, fluid to a 1440 px maximum content width, centred beyond that. |
| Top bar height | 56 px, fixed. |
| Left rail width | 232 px expanded, 56 px collapsed. |
| Page header (title and primary action) | 64 px, sticky below the top bar. |
| Stage stepper (inside an event only) | 48 px, sticky below the page header. |
| Side panels and drawers | Right panel 360 px; evidence drawer 440 px; modal 560 px (confirmation) or 720 px (forms). |
| Table rows | Comfortable 40 px (default), compact 32 px (user toggle, remembered). |
| Minimum target size | 24 × 24 px for pointer targets, 44 × 44 px for touch devices (WCAG 2.2 target size). |

#### Breakpoints and behaviour

| **Width** | **Behaviour** |
|----|----|
| 1920 px and above | Content centred at 1440 px; spare width goes to a wider right panel (up to 440 px). |
| 1280 to 1919 px (primary target, tested at 1440 × 900) | Full layout as drawn in the wireframes. |
| 1024 to 1279 px | Left rail collapses to 56 px; right panels become slide-over drawers; tables keep their columns and scroll horizontally inside their own container. |
| 768 to 1023 px (tablet) | Single column. Read and decide are supported; the dependency graph is replaced by its list equivalent. |
| Below 768 px (mobile) \[P\] | Approver quick view only: Home decision queue, Decision screen in read mode, and low-risk approval. No graph, no heatmap, no rollout controls; those show “Open on a larger screen”. |

### 5.5 Shape, elevation, iconography and motion

| **Topic** | **Specification** |
|----|----|
| Corner radius | Controls 6 px; cards and panels 8 px; modals and drawers 12 px; chips fully rounded. |
| Elevation | Level 0 flat (page). Level 1 cards: 1 px line-soft border plus a soft 1 px shadow. Level 2 popovers. Level 3 drawers and modals with a 40 % navy-deep scrim. |
| Icons | Lucide, 16 px inline, 20 px in buttons and rail, 24 px in empty states. Stroke 1.75. An icon never stands alone without an accessible name; decorative icons are hidden from assistive technology. |
| Motion durations | Micro 120 ms (hover, chip change), standard 200 ms (panel, accordion), large 320 ms (drawer, modal). Easing: ease-out on enter, ease-in on exit. |
| Motion rules | Honour prefers-reduced-motion: replace slides with instant changes and cross-fades under 100 ms. Never flash more than three times per second. The rollback banner pulses once, not continuously. |
| Live updates | Numbers that change in place (rollout metrics, recovery timer) update without moving layout and announce changes politely to screen readers at most every 5 seconds. |

> **BUILD RULE**
>
> Implement tokens as CSS custom properties (for example --ev-navy) generated from one tokens file. No component may contain a literal hex value.

## 6. Component library

Build these once and reuse them on every screen. Each component has a single job; where two screens need the same behaviour they must use the same component (principle 12). Naming below is the component name to use in code.

### 6.1 Component catalogue

| **Component** | **Job** | **Anatomy and variants** | **Rules** |
|----|----|----|----|
| StatusChip | Show a status with colour, icon and word. | Variants: Migrate, Canary, Investigate, Block, Permit, Deny, Stale, Unresolved, Conflict, Pass, Warn, Fail, N/A, Inconclusive. Sizes: small (20 px), medium (24 px). | Always icon plus text. Colour never the only cue. Chips are not clickable unless wrapped in a button. |
| RiskMeter | Show risk tier. | Four navy segments plus word. Compact variant shows segments only with accessible text. | Never red. Tier changes announce “Risk tier High”. |
| ConfidenceMeter | Show confidence honestly. | A number (two decimals) and a band label: 0.90 and above High, 0.75 to 0.89 Moderate, 0.60 to 0.74 Low, below 0.60 Very low \[P\]. A thin bar with a tick at the band boundary. | Band label always shown. Below 0.75 adds the text “Confidence limits apply”. |
| ProvenanceTag | Label who or what produced a piece of content. | Rule-based, AI-proposed, Human-entered, plus source and time on hover and focus. | Required on every recommendation, rationale, generated test and graph edge. |
| EvidenceDrawer | The single “Why” surface. | Right drawer 440 px: Headline, Summary, Evidence list (source, class, confidence, last verified), Raw data (collapsed). | Every “Why” link opens this component. Esc closes. Focus returns to the trigger. |
| StageStepper | Show pipeline position inside an event. | Six steps with state: complete, current, available, locked. Each step shows a badge for open items (for example “1 to resolve”). | Locked steps explain why on focus and hover. See section 9.6. |
| GateBanner | Explain what blocks the next stage. | Gold-tint banner with a count, a plain sentence and a link to the first blocking item. | Appears at the top of a stage while its gate is unmet. Not dismissible until resolved. |
| KernelVerdict | Show the Trusted Kernel’s deterministic decision. | Permit or Deny chip, rule ID in mono, one-line reason, “View rule” link to Controls. | Placed beside every recommendation. On Deny, disables approval and cannot be overridden. |
| ThresholdChart | Show a live metric against its pre-approved limit. | Line chart with a shaded threshold band, current value label, breach marker (triangle), time axis in simulated time. | Direct labels. Marker shapes differ by series. Data table alternative available. |
| DiffViewer | Compare current and candidate output. | Two columns with synchronised scroll, changed spans highlighted with underline and marker (not colour alone), case selector, “Why flagged” note. | Shows synthetic input only. Long outputs collapse with “Show more”. |
| TrajectoryTimeline | Show an agent’s sequence of steps. | Vertical or horizontal steps: plan, model call, tool call, observation, decision. Changed step flagged; skipped step shown as a dashed placeholder. | A skipped required step is a Fail, regardless of final answer. |
| HeatmapGrid | Compare applications across evaluation dimensions. | Rows apps, columns Deterministic, Semantic, Safety, Tool use, Trajectory, Cost, Latency. Cells use shape plus colour plus text (P, W, F). | Deterministic columns come first and a Fail there outlines the whole row. |
| DependencyGraph | Show a focused slice of the AI Dependency Graph. | Nodes by type with icon, edges by evidence class (section 5.2 and screen 2), “Affected” versus “Connected, not affected” styling, 2-hop focus, minimap off. | Never render the whole estate; cap at 60 nodes with clustering. Always paired with a list equivalent. |
| DataTable | Dense, sortable, filterable lists. | Sticky header, row selection, density toggle, column picker, virtualised rows, saved filter chips. | Virtualise beyond 100 rows. Keyboard row navigation with J and K plus arrows. |
| ApprovalPanel | Capture a signed human decision. | Identity block, scope, expiry countdown, separation-of-duties check, Approve, Reject, Request more evidence. | Friction scales with risk (section 11, O2). No bulk approve. |
| RiskBadgeRow | Row of the four outcome counts. | Migrate n, Canary n, Investigate n, Block n as chips. | Counts are real and update live from the store. |
| StatTile | Single headline number. | Number, label, delta, and a “illustrative” or “measured” tag. | A tile without a tag is a defect. |
| Timeline | Chronological record. | Vertical rail, time, actor, event kind icon, summary, hash chip, expandable detail. | Append-only. No edit or delete controls. |
| HashChip | Show integrity. | Truncated SHA-256 (first 8 and last 4 characters), copy button, verified or broken state. | Broken state raises hard-stop O4. |
| EmptyState | Explain an empty area and offer the next step. | Icon (24 px), one sentence, one action, optional link. | Never a bare “No data”. |
| SkeletonBlock | Loading placeholder. | Shape matching the final content, shimmer disabled under reduced motion. | Shown after 200 ms of waiting; removed with a 120 ms fade. |
| Toast | Transient confirmation. | Bottom-left, 6 s, with Undo only where an undo exists. | Never the only record of a decision; decisions always go to the Record. |
| GlossaryTerm | Define a term in place. | Dotted underline, popover with plain definition and “Open glossary”. | All 20 charter terms are wired (section 14). |
| CommandPalette | Fast navigation and search. | Modal opened with Ctrl or Cmd plus K; groups: Go to, Events, Applications, Models, Actions. | Every result is also reachable by normal navigation. |
| RoleSwitcher | Demo-only identity switch. | Menu of eight synthetic identities, shown only when Demo Director is active. | Persistent “Synthetic user” label. |
| SandboxBadge | Remind users the data is synthetic. | Pill in the top bar: “Sandbox · Synthetic data”, plus a 24 px footer strip on Record and Controls. | Cannot be hidden. |
| FreshnessPill | Show graph and evidence freshness. | Dot, “Graph fresh 2 min ago”. Stale state becomes a gold pill and a banner. | Required by the charter dashboard rule: never a misleading stale view. |

### 6.2 Core component state matrix

Every interactive component implements all of these states. A component missing a state is incomplete.

| **Component** | **Default** | **Hover** | **Focus** | **Active** | **Disabled** | **Loading** | **Error** |
|----|----|----|----|----|----|----|----|
| Primary button | navy fill, white text | navy at 90 % plus raise 1 px | 2 px focus ring | navy-deep | slate-soft fill, slate-muted text, tooltip says why | spinner left of label, label stays | red outline, message below |
| Secondary button | white fill, navy outline | teal-light fill | focus ring | teal-light, darker border | dotted outline | spinner | red outline |
| Destructive button | red fill, white text | darker red | focus ring | darkest red | as primary | spinner | n/a |
| Text input | white, 1 px border-strong | border navy | 2 px focus ring | n/a | cream fill, muted text | n/a | red border, icon, message |
| Checkbox / radio | border-strong, 20 px | teal-light halo | focus ring | teal fill, white tick | slate-soft | n/a | red border |
| Row (table) | white / cream stripes off by default | teal-light at 40 % | focus ring inset | teal-light | muted text | skeleton | error row with retry |

## 7. Navigation and information architecture

### 7.1 Sitemap

```text
AI Evergreen
├── Home                       /                              Screen 1
├── Events                     /events                        (list is Screen 1's table, full page)
│    └── Event workspace       /events/:id/...                Screens 2-7
│         ├── Blast radius     /events/:id/blast-radius       Screen 2
│         ├── Plan             /events/:id/plan               Screen 3
│         ├── Results          /events/:id/results            Screen 4
│         ├── Decision         /events/:id/decision           Screen 5
│         ├── Rollout          /events/:id/rollout            Screen 6
│         └── Record           /events/:id/record             Screen 7
├── Estate                     /estate                        Screen 8
│    └── Workload profile      /estate/workloads/:id          Screen 9
├── Memory                     /memory                        Screen 10
├── Controls                   /controls                      Screen 11
├── Portfolio (roadmap)        /portfolio                     Screen 12
└── Overlays (no routes)       O1 rationale, O2 approval, O3 manual event, O4 hard stop, O5 glossary
```

### 7.2 Rules

| **Topic** | **Rule** |
|----|----|
| Left rail | Five destinations only: Home, Events, Estate, Memory, Controls. Portfolio sits under a “Roadmap” group at the bottom of the rail with a small “Preview” tag. Active item: teal text, teal-light fill, 3 px left bar, aria-current=page. |
| Breadcrumb | Home › Events › \[Event title\] › \[Stage\]. Each crumb is a link. In Estate: Estate › \[Workload\]. |
| Entering an event | From Home or Events, an event opens at its current stage, not at Blast Radius. A user can always go back to a completed stage; completed stages are read-only unless reopened (section 9.5). |
| Locked stages | Opening a locked stage by URL redirects to the current stage and shows a toast: “Decision is locked until the plan is approved.” with a link to the blocking item. |
| Deep links | Every screen state worth sharing is in the URL: ?app=refund-agent, ?tab=missing, ?test=T-0412, ?compare=event-id. Opening a link restores selection, scroll anchor and open drawer. |
| Back behaviour | Browser Back closes an open drawer first, then navigates. Overlays push a history entry so Back behaves predictably. |
| Cross-links | Application names are links to their Workload Profile everywhere; model names link to Estate filtered by model; event IDs link to the event; rule IDs link to Controls. |
| Search | Command palette indexes events, applications, models, tests, rules and glossary terms from the store. |
| Unknown route | Show a friendly “This page does not exist” with links to Home and the last event; never a blank page. |

## 8. Global shell (on every screen)

The shell is the only chrome. It is built once, never re-created per screen, and holds the user’s orientation, safety markers and primary tools.

### 8.1 Wireframe

```text
┌────────────┬──────────────────────────────┬───────────────────┬─────────────────┬────────────────┐
│ Evergreen  │ [ Search...  Ctrl+K ]        │ Sandbox/Synthetic │ o Graph fresh 2m│ (3)  AR v      │
│            │                              │                   │                 │                │
├────────────┴┬─────────────────────────────┴───────────────────┴─────────────────┴────────────────┤
│ Home        │ Home > Events > Model Atlas-1 retirement > Decision          [ Primary action ]    │
│ Events      │                                                                                    │
│ Estate      │ [Blast radius]>[Plan]>[Results]>[Decision]>[Rollout]>[Record]    (stage stepper)   │
│ Memory      │                                                                                    │
│ Controls    │ [ Gate banner: what blocks the next stage, in one sentence ]                       │
│             │                                                                                    │
│ - Roadmap - │ Content area. One question. Screen specific layout.                                │
│ Portfolio   │                                                                                    │
│             │                                                                                    │
│ [ Collapse ]│                                                                                    │
│             │                                                                                    │
│             │                                                                                    │
├─────────────┴────────────────────────────────────────────────────────────────────────────────────┤
│ Footer strip (Record and Controls only): Sandbox . Synthetic data . Evidence integrity: verified │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Legend for all wireframes in this document: box-drawing characters show regions; \[ \] is a button or field; \> separates breadcrumbs or stages; \[x\] and \[v\] are cross and tick marks; \[L\] is a lock. These are notation, not icon choices; use the icons in section 5.2.

### 8.2 Zone specification

| **Zone** | **Contents** | **Behaviour** |
|----|----|----|
| Brand (top left) | Logo mark and “Evergreen” wordmark, 56 px bar. | Link to Home. Mark uses teal on white. |
| Command search (top centre) | Search field with “Ctrl+K” hint. | Opens the command palette (section 6). Placeholder: “Search events, applications, models, rules”. |
| Sandbox badge | Pill “Sandbox · Synthetic data”. | Always visible. Not removable. Tooltip: “Everything here is synthetic. No production data is used.” |
| Freshness pill | Dot plus “Graph fresh 2 min ago”. | Fresh = teal dot. Stale = gold pill with clock icon and a global banner: “Graph data is stale. Autonomous scope reduction is paused; full regression is recommended.” (Charter degraded-mode rule.) |
| Notifications (bell) | Count badge and a 360 px popover. | Groups: Needs your decision, Gate cleared, Rollout alerts, System. Each item deep-links. Marking read is per item; unread alerts about rollbacks and hard stops cannot be cleared in bulk. |
| Identity menu | Initials avatar, name, role. | Shows name, role, “Synthetic user” in demo, Help, Keyboard shortcuts, Density, Demo Director (demo builds only). In Demo Director, role switcher appears here. |
| Left rail | Five destinations, Roadmap group, collapse control. | 232 px or 56 px. Tooltips on collapsed items. Badge counts: Home shows decisions waiting. |
| Breadcrumb and page header | Breadcrumb, page title, one primary action on the right. | Sticky. The primary action is the single most likely next step (for example “Continue to Plan”). |
| Stage stepper | Six stages with state and badge. | Visible only inside an event. Keyboard: Left and Right arrows move between stages; Enter opens. |
| Banner stack | Zero or more banners under the stepper. | Priority order: 1 hard stop, 2 stale or degraded data, 3 gate unmet, 4 informational. Maximum two shown; the rest collapse into “+2 more”. |
| Footer strip | Sandbox, integrity status. | Shown on Record and Controls. Integrity state is a live check; failure raises O4. |
| Skip links and landmarks | “Skip to main content”, nav, main, aside landmarks. | Skip link is the first focusable element. |

### 8.3 Global behaviours

1.  **Role awareness.** The shell reads the current identity and role. Home re-orders its zones by role (section 10, screen 1). Controls the role cannot use remain visible and disabled with a reason.

2.  **Hard-stop takeover.** If the Kernel denies a promotion path, integrity verification fails, or a rollback fails, overlay O4 covers the content area. The shell stays so the user keeps orientation.

3.  **Unsaved decisions.** Drafts (a half-written rationale) are kept for the session; leaving the page asks “Keep this draft?”. Submitted decisions are never draftable.

4.  **Time.** All times display in the user’s time zone with the zone abbreviation; hover shows UTC. Rollout and recovery timers run on a simulated clock in demo mode (section 17).

5.  **Errors.** A global error never shows a stack trace. It shows what failed, what is safe, and what to do next (section 13).

6.  **Session safety.** After 15 minutes of inactivity, approval controls require re-verification of identity before they work again \[P\].

## 9. Connected-solution architecture

The twelve screens must behave as **one product**. This section defines the shared data store, the state machines, the gates and the cross-screen effects that make that true. A builder who follows it can wire the screens to a real backend later without redesign.

### 9.1 Recommended build stack \[P\]

| **Layer** | **Recommendation** | **Why** |
|----|----|----|
| Framework | React 18 with TypeScript, Vite, React Router. | Fast to build, strong component ecosystem, matches the earlier recommendation to leave Streamlit for this experience. |
| Styling | CSS custom properties from the tokens file plus utility classes (Tailwind acceptable if tokens are mapped). | Tokens must be the single source of colour and spacing. |
| State | One typed store (Zustand or Redux Toolkit) with selectors and a persisted slice. | Cross-screen effects come from shared state, not prop drilling. |
| Graph | React Flow or Cytoscape.js with a list equivalent. | Interactive 2-hop graph; list is the accessible primary. |
| Charts | Recharts or visx, with direct labels and data-table alternative. | Threshold bands and marker shapes are required. |
| Tables | TanStack Table with row virtualisation. | Long test tables and portfolios. |
| Data layer | A mock API adapter that implements the Interfaces API surface (below), backed by seed data in the store. | Lets the front end later switch to the FastAPI back end by changing one adapter. |
| Testing | Vitest, React Testing Library, Playwright, axe-core in CI. | Section 19 acceptance tests are automatable. |

### 9.2 Suggested project structure

```text
src/
├── app/            shell, router, providers, error boundary
├── tokens/         tokens.ts (colour, type, spacing) and tokens.css
├── components/     one folder per component in section 6
├── screens/        home, blast-radius, plan, results, decision, rollout, record,
│                   estate, workload, memory, controls, portfolio
├── overlays/       rationale-drawer, approval-modal, manual-event, hard-stop, glossary
├── store/          entities, selectors, actions, gates.ts, effects.ts, persist.ts
├── api/            mock-adapter.ts (implements API surface), types.ts
├── demo/           director.ts, injections.ts, seed/ (JSON seed files)
├── content/        glossary.ts, microcopy.ts, reason-codes.ts
└── tests/          unit, a11y (axe), e2e (Playwright, one script per demo step)
```

### 9.3 Data store: entities and key fields

Use the data names from the Schema document wherever they exist. Fields marked \[P\] are UI additions.

| **Entity** | **Key fields** |
|----|----|
| ChangeEvent | id, title, kind (retirement, upgrade, price, policy, api, availability), source, detectedAt, confidence, currentModelId, candidateModelId, deadline \[P\], stage, status (open, closed), correlationId |
| Workload | id, name, ownerId, criticality, workloadType (one of the 12 in the risk matrix), riskTier, environment, contractId, contractVersion, status. Includes Evergreen itself as a workload |
| Edge | id, fromId, toId, relationship (one of 13), evidenceClass (runtime-observed, configuration-declared, code-inferred, manually-attested, LLM-inferred), confidence 0.00 to 1.00, lastVerified, state (proposed, confirmed, overridden, stale, conflict), override {reason, owner, expiry, evidence} |
| Entity | id, type (the entity types listed in the Schema document), name, versionOrStatus, source, owner, lastVerified |
| Test | id, workloadId, name, severity, critical (bool), source (Xray, Jira, repository, generated), mappedConfidence |
| PlanItem | eventId, testId, decision (include, exclude, propose), reasonCode, reasonText, provenance, memoryRef \[P\] |
| MissingTest | id, workloadId, title, gapDescription, severity, status (proposed, approved, rejected), reviewerId, rationale, provenance |
| Result | eventId, workloadId, dimension (Deterministic, Semantic, Safety, Tool use, Trajectory, Cost, Latency), status (pass, warn, fail, n/a, inconclusive), score, uncertainty, judgeAgreement |
| Recommendation | eventId, workloadId, treatment (migrate, canary, investigate, block), confidence, kernelVerdict (permit, deny), kernelRuleId, reasons\[\], residualGaps\[\], provenance |
| Approval | id, eventId, workloadIds\[\], approverId, decision (approve, reject, more_evidence), scope, rationale, signedAt, expiresAt, supersedes |
| Rollout | eventId, workloadId, ladder \[shadow, 1, 5, 25, 100\], stage, state (queued, running, held, completed, aborted, rolled_back), lkgVersion, thresholds\[\], series\[\], startedAt, breachAt, recoveredAt |
| EvidenceEntry | id, eventId, ts, actorId, kind, summary, detail, hash, prevHash. Append-only hash chain |
| MemoryItem | id, kind (pattern, reused-test, contract-proposal), sourceEventIds\[\], summary, status, proposedBy, approvedBy |
| ContractProposal | id, workloadId, fromVersion, toVersion, diff, proposedBy, status (pending, approved, rejected) |
| Notification | id, userId, kind, title, deepLink, createdAt, readAt, pinned (true for rollback and hard stop) |

### 9.4 API surface the mock adapter must implement

These are the spike endpoints defined in the Interfaces document (section 5 there). The mock adapter returns store data and writes through the same actions the UI uses. Add endpoints only if a screen needs them; list them in the Decisions log.

| **Endpoint** | **Used by** |
|----|----|
| POST /events/change | O3 manual event entry; Demo Director event injection |
| GET /events | Screen 1 and the Events list |
| GET /graph/blast-radius/{event_id} | Screen 2 |
| GET /plans/{event_id} | Screen 3 |
| POST /runs/{event_id}/execute | Screen 3 to Screen 4 (execute approved plan) |
| GET /recommendations/{event_id} | Screens 4 and 5 |
| POST /approvals/{event_id} | O2 approval modal |
| POST /rollback/{event_id} | Screen 6 manual rollback |
| GET /evidence/{event_id} | Screen 7 |

> **BUILD RULE**
>
> Every request carries a correlationId that appears in the Record. Use one per event, and show it as a copyable chip on Screen 7 (charter non-functional requirement: correlation IDs).

### 9.5 State machines

#### Event stage status

| **From** | **To** | **Trigger** | **Effect** |
|----|----|----|----|
| locked | available | Previous stage gate met | Stepper unlocks; notification “Plan is ready” to the next owner. |
| available | in_progress | First edit or confirmation in the stage | Stepper shows current. |
| in_progress | complete | Stage gate met and user presses the primary action | Stage becomes read-only; Record entry written. |
| complete | reopened | A new fact invalidates it (for example a new unresolved edge) or an authorised user reopens | Downstream stages return to locked; a Record entry states why; approvals already signed for downstream items are marked superseded. |

#### Dependency edge

| **From** | **To** | **Trigger** | **Effect** |
|----|----|----|----|
| proposed | confirmed | Platform Engineer or owner confirms with evidence | Confidence stays; evidence class becomes manually-attested; counts toward G1. |
| proposed | overridden | Override with reason, named owner, expiry and supporting evidence (all four required) | Edge treated as included or excluded per override; expiry date shown; Record entry written. |
| any | stale | lastVerified older than the freshness threshold for its evidence class | Reduced confidence; excluded from autonomous migration until reverified; gold Stale chip. |
| any | conflict | Two claims disagree | Both retained (never overwritten); precedence calculated and shown; unresolved conflicts surfaced as blocking if the edge is critical. |

#### Recommendation and approval

| **State** | **Entered when** | **Allowed next actions** |
|----|----|----|
| proposed | Evidence aggregation ends (or two expansion cycles are exhausted) | Request more evidence; approve; reject. |
| kernel_denied | Kernel returns Deny | Acknowledge only. Approve is disabled and cannot be enabled by any role. |
| awaiting_approval | Approver opened the modal | Sign; cancel. |
| approved | Signed and Kernel returns Permit | Rollout starts (Migrate or Canary). Approval carries scope and expiry. |
| rejected | Approver rejects with a reason | Linked new decision may be made; nothing is edited. |
| expired | Approval expiry passes before rollout start | Fails closed. A new approval is required. Notification to the owner. |
| superseded | A reopened earlier stage invalidates the approval | Shown struck through with link to the newer decision. |

#### Rollout

| **State** | **Entered when** | **Behaviour** |
|----|----|----|
| queued | Approval signed | Waiting for the first ladder step to start. |
| running | A ladder step is active | Metrics stream; threshold bands drawn; next step requires the dwell time and no breach. |
| held | SRE or Platform Engineer holds | Traffic stays at the current step; reason required; resume available. |
| rolled_back | Automatic: a threshold breached within pre-authorised policy. Manual: two distinct confirmers | Traffic returns to last-known-good; red banner; recovery timer stops when LKG is healthy; Record entry. |
| completed | Last ladder step succeeded | Learn step runs: memory items proposed. |
| aborted | Operator aborts before traffic moves or deployment target fails validation | Stops cleanly; Record entry; no traffic change. |
| rollback_failed | Rollback does not reach LKG healthy within 2 minutes after trigger \[P\] | Hard stop O4 with the break-glass runbook link; owner and SRE paged (simulated). |

### 9.6 Gates (exact conditions)

| **Gate** | **Leaves** | **All of the following must be true** | **Locked-stage message** |
|---|---|---|---|
| G1 | Blast Radius to Plan | • Every edge on the path from the changed dependency to a critical workload is confirmed or overridden.<br>• Every affected workload has a risk tier with a rationale.<br>• No edge in the affected set has state conflict unresolved. | Plan is locked until 1 critical edge is confirmed or overridden. |
| G2 | Plan to Results | • The Test Lead approved the plan.<br>• Every proposed test for a high or critical workload is approved or rejected.<br>• Kernel validated that every critical-pack test is included. | Results is locked until the plan is approved. |
| G3 | Results to Decision | • Run complete, or marked inconclusive with a reason.<br>• At most two evidence-expansion cycles used. | Decision is locked until the run completes. |
| G4 | Decision to Rollout | • A signed approval exists for at least one Migrate or Canary item.<br>• Kernel returned Permit for it.<br>• Separation of duties check passed. | Rollout is locked until an item is approved. |
| G5 | Rollout to closed | • Every rollout is completed, held with reason, aborted or rolled back.<br>• Learn step ran. | Event stays open until every rollout is finished. |

### 9.7 Cross-screen effects (what must update everywhere)

This table is the contract that makes the screens a single solution. Every row must be implemented as a store action that updates all listed places in one step. Test each as an end-to-end case.

| **User action** | **Store effect** | **Places that must update immediately** |
|----|----|----|
| Confirm or override an edge (S2) | Edge state changes; G1 re-evaluated | S2 list and graph; stepper badge; GateBanner; Home row “Next action”; Record timeline; Workload Profile dependencies tab; Estate graph edge style. |
| Approve the regression plan (S3) | Plan locked; G2 evaluated; Kernel validates critical pack | S3 header summary; stepper; S4 unlocks; Home stage dots; Record. |
| Approve or reject a proposed test (S3) | MissingTest status changes; plan counts update | S3 right panel and counts; S4 expected coverage; Memory “pending reuse” count; Record. |
| Run completes (S4) | Results and Recommendations created | S4 heatmap; S5 cards; Home Risk badges; Decision queue count; notification to approvers. |
| Judges disagree (S4) | Result flagged inconclusive; recommendation moves to Investigate | S4 judge row; S5 card (treatment and residual gaps); Record. |
| Request more evidence (S5) | Expansion cycle +1 (maximum two); new results appended | S4 shows a second run column; S5 card shows “Expansion 1 of 2”; Record. |
| Sign approval (O2) | Approval created; G4; rollout queued | S5 card state; S6 starts; Home decision queue; Controls “recent approvals”; Record; notifications to SRE and owner. |
| Kernel denies (rule fires) | Recommendation forced to Block; approval disabled | S5 card and panel; Home risk badge; Controls rule hit counter; Record; if during rollout, O4. |
| Threshold breach (S6) | Rollback automatic within policy | S6 banner and timer; S5 card shows “Rolled back”; Home event risk and stage; Workload Profile history; Memory proposes a contract change; notifications pinned; Record. |
| Manual rollback confirmed (S6) | Second confirmer recorded | As above, with both identities in the Record. |
| Rollout completes (S6) | Learn step creates MemoryItems | Memory screen (new patterns and reusable tests); Workload Profile contract proposal queue; Portfolio retirement timeline updates; Record. |
| Approve a contract proposal (S9 or S10) | Contract version +1; owner approval recorded | S9 contract tab; S10 queue; S11 behavioural contract version list; Record. |
| Demo reset (Demo Director) | Store restored from seed in under 1 s | Every screen returns to the start of the scenario. |

### 9.8 Evidence chain, audit and notifications

1.  Every store action that changes a decision writes one EvidenceEntry with hash = SHA-256(prevHash + canonical JSON of the entry). The first entry hashes a fixed genesis value.

2.  The Record verifies the chain on load. A broken link shows the HashChip in a broken state and raises overlay O4 with “Evidence integrity check failed.”

3.  Notifications are generated by actions, not by screens: decisions waiting (to approvers), gate cleared (to the next stage owner), rollout alerts (to SRE and owner), contract proposals (to owners). Rollback and hard-stop notifications are pinned.

4.  Retention in the UI: the Record is never trimmed. Notifications older than 30 days collapse into “Earlier”.

### 9.9 Persistence, reset and URL state

| **Topic** | **Rule** |
|----|----|
| Persistence | The store persists to localStorage under one key so a refresh keeps the scenario. Preferences (density, rail collapsed) persist separately. |
| Reset | Demo Director’s reset restores the seed and clears the persisted key in under 1 second and returns to Home. |
| Selection state | Selected app, tab, test and compare target live in the URL query, not only in memory, so links reproduce views. |
| Simulated clock | A store-level clock drives timers. In demo mode one real second equals one simulated minute by default; a control lets the presenter pause, step or fast-forward. All displayed durations come from this clock. |
| Randomness | None. All demo data is deterministic so the demo is repeatable (charter reproducibility principle). |

## 10. The twelve screens

Each screen specification follows the same structure so the builder always knows where to look: identity and purpose, wireframe, zones, components, interactions, states, microcopy, accessibility and acceptance criteria. Wireframes show the desktop layout at 1440 px wide inside the global shell (section 8). Numbers inside wireframes use the seed scenario in section 17 and are illustrative.

| **Screen group** | **Screens** | **Fidelity** |
|----|----|----|
| Home | 1 Command Center | Full fidelity, all states. |
| Event workspace (the six pipeline stages) | 2 Blast Radius, 3 Regression Plan, 4 Results, 5 Recommendation and Approval, 6 Rollout Monitor, 7 Evidence Record | Full fidelity, all states, fully connected through the store. |
| Estate and learning | 8 Estate Explorer, 9 Workload Profile, 10 Qualification Memory | Navigable and seeded; read-mostly. Contract proposals and edge actions are live. |
| Governance and roadmap | 11 Controls and Self-Governance, 12 Portfolio and Horizon | 11 read-only and seeded; 12 is a labelled roadmap preview. |

### 1. Command Center (Home)

| **Screen ID and route** | S1 · / |
|----|----|
| **The one question it answers** | What needs me right now? |
| **Primary users** | Everyone. Zone order changes by role (see Zones). |
| **Reached from** | Login, brand link, breadcrumb Home, command palette. |
| **Leads to** | An event at its current stage (any of screens 2 to 7), Estate, Memory, Portfolio, O3. |
| **Data consumed** | ChangeEvent, Recommendation, Approval, Rollout, Workload, Edge (for graph health), Notification. |
| **Build tier** | A. Full fidelity. |

#### Purpose and design intent

Home is a task list first and a dashboard second. A person arriving should know within five seconds whether something is waiting for them and what it is. The design therefore leads with the decision queue and shows the portfolio of events beneath it.

Nothing on Home is decorative. Every tile either asks for an action or reports a status that links to the screen where the user can act on it.

#### Layout wireframe (desktop 1440 px wide; content area inside the global shell)

```text
┌─────────────────────────────────────────────────────────────────────────────┬────────────────────┐
│ Good morning, Asha . Application Owner                                      │ [ + Log event ]    │
│ Home                                                                        │                    │
├────────────────────────────────────────────────────────┬────────────────────┴────────────────────┤
│ NEEDS YOUR DECISION (2)                                │ MODEL HORIZON                           │
│                                                        │                                         │
│ > Atlas-1 retirement . 6 apps . 3h left                │ Atlas-1 retires in 14 d . 6 apps        │
│   M2 C2 I1 B1 . Kernel: 1 Deny                         │ Orion-2 price change in 9 d . 3 apps    │
│   [ Review and decide ]                                │                                         │
│                                                        │ GRAPH HEALTH                            │
│ > Orion-2 price change . 3 apps . 1d left              │ o Fresh 2 min . 2 stale edges           │
│   Awaiting plan approval   [ Open ]                    │ 1 unresolved critical edge              │
├────────────────────────────────────────────────────────┴─────────────────────────────────────────┤
│ ACTIVE ROLLOUTS: none running. Rollouts start after approval on a Decision screen.               │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CHANGE EVENTS                        [ Filter: All v ] [ Stage v ] [ Owner v ] [ Search ]        │
│                                                                                                  │
│ Event                    Stage          Apps  Highest risk  Outcomes       Next action           │
│ Atlas-1 retirement       *****o Dec     6     |||| Crit     M2 C2 I1 B1    [ Review and decide ] │
│ Orion-2 price change     **oooo Plan    3     |||o High     pending        [ Approve plan ]      │
│ Atlas-1.1 upgrade        ****** Done    4     |||o High     M3 B1          [ View record ]       │
│ Provider API change      ****** Done    2     ||oo Med      M2             [ View record ]       │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Zones, grid and content

| **Zone** | **Grid and size** | **Contents and behaviour** |
|----|----|----|
| Greeting and action | 12 col, 64 px | Greeting with name, role and scenario label. One primary action on the right: “Log event” (opens O3). Greeting never uses first-name familiarity in demo mode beyond the display name. |
| Decision queue | 7 of 12 col, left | One card per event that needs this person’s decision. Card: title and ID, apps affected, outcome counts as RiskBadgeRow, Kernel count (“1 Deny”), deadline countdown (“3h left”), primary button “Review and decide”. Sorted by earliest deadline. Empty state when none. |
| Model horizon and graph health | 5 of 12 col, right | Horizon: next retirements and price or policy changes with days remaining and apps affected; each row links to Portfolio or the event. Graph health: freshness, stale edges, unresolved critical edges, orphans. Each count links to Estate with the filter applied. |
| Active rollouts strip | 12 col, 96 px, appears only when a rollout runs | One mini-card per running rollout: app, ladder step, a threshold sparkline, state chip, recovery timer if rolling back. For SRE this strip moves above the decision queue. |
| Change events table | 12 col, flexible | DataTable. Columns: Event, six-dot stage, Apps, Highest risk (RiskMeter), Outcomes, Next action, Updated. Filters: status, kind, stage, owner; search. Default sort: needs my action first, then deadline. Row click opens the event at its current stage. |

#### Components used

- DataTable, RiskMeter, RiskBadgeRow, StatusChip, FreshnessPill, StatTile (graph health), EmptyState, SkeletonBlock, Toast.

#### Interactions and flows

1.  On load, skeletons show for the decision queue and table for up to 600 ms, then data appears. Zones reorder by role: Approver, Application Owner and QA Lead see the decision queue first; SRE sees the active rollouts strip first; Platform Engineer sees graph health first; Executive sees horizon and a summary row first.

2.  “Review and decide” opens the event at the Decision stage. If the event has not reached Decision, the button reads “Open” and the card shows the current stage.

3.  Clicking a Graph health count opens Estate filtered to that condition (for example stale edges).

4.  “Log event” opens O3 (manual event entry). On submit, a new row appears at the top of the table with stage Blast Radius and a toast: “Event logged. Blast radius is being discovered.”

5.  Row hover shows the primary next action; Enter on a focused row opens the event.

6.  Filters are retained in the URL and in localStorage; a “Clear filters” chip appears when any filter is active.

#### State design

| **State** | **What the user sees and can do** |
|----|----|
| Empty | No open events: icon, “No open changes. Last event closed 3 days ago.” with links “View Memory” and “Log an event”. |
| Loading | Skeletons for queue cards and five table rows. |
| Partial | If horizon data fails, that card shows “Horizon unavailable. Retry” while the rest works. |
| Error | “We could not load your events. Nothing has changed. \[Retry\]” with a link to the status details. |
| Stale | Global stale banner; graph health tile turns gold; queue cards add “Data may be out of date”. |
| Hard stop | If any event has a hard stop, its card shows a red “Hard stop” chip and the row sorts to the top. |

#### Microcopy (use verbatim)

| **Where** | **Text** |
|----|----|
| Queue title | Needs your decision |
| Queue empty | Nothing is waiting for you. |
| Horizon title | Model horizon |
| Table empty filter | No events match these filters. \[Clear filters\] |
| Next action labels | Review and decide · Approve plan · Confirm 1 edge · View record · Watch rollout |

#### Keyboard, accessibility and responsive notes

- Landmarks: the queue is a section with a heading; the table is a real table with caption.

- Stage dots are a list with accessible text, for example “Stage 4 of 6: Decision”.

- Keyboard: Tab moves between zones; inside the table, J and K or arrows move rows; Enter opens; F focuses the filter bar.

- Responsive: below 1280 px the right column stacks under the queue; below 768 px only the queue and a simplified list remain.

#### Acceptance criteria

1.  With the seed loaded, Home shows exactly 2 decision cards for the Application Owner and the Atlas-1 card shows Migrate 2, Canary 2, Investigate 1, Block 1 once the run completes (before then it shows “Discovery in progress”).

2.  Signing an approval on Screen 5 reduces the queue count within one second without a refresh.

3.  A user with the SRE role sees the Active rollouts strip above the decision queue.

4.  The table never shows a stage or outcome without text; with colour removed, all information remains.

5.  No count on Home is displayed that cannot be traced to a store entity.

### 2. Event: Blast Radius

| **Screen ID and route** | S2 · /events/:id/blast-radius |
|----|----|
| **The one question it answers** | Who is truly affected? |
| **Primary users** | Application Owner, AI Platform Engineer, QA Lead. |
| **Reached from** | Home (event row), stepper, command palette. |
| **Leads to** | Screen 3 (Plan) when gate G1 is met; Screen 9 (Workload Profile); Screen 8 (Estate). |
| **Data consumed** | ChangeEvent, Workload, Edge, Entity, Notification, Recommendation (risk tier only). |
| **Build tier** | A. Full fidelity. |

#### Purpose and design intent

This screen turns one model change into a list of exactly which applications are materially affected, and separates them from applications that are merely connected. It is the first place the user sees the value of the dependency graph, so the list is the primary view and the graph supports it.

The screen also contains the only manual work in the first stage: confirming or overriding edges the system is not sure about. It must make that work fast and make its consequences obvious.

#### Layout wireframe (desktop 1440 px wide; content area inside the global shell)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Model Atlas-1 retirement . detected 09:12 . source: provider notice . confidence 0.94            │
│ [ Hold ]   [ Continue to Plan ] (locked)                                                         │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ! GATE G1: 1 critical edge is unresolved. Confirm or override it to continue.   [ Go to edge ]   │
├──────────────────────────────────────┬───────────────────────────────────────────────────────────┤
│ AFFECTED APPS (6)  [List|Graph]      │ GRAPH . focus Atlas-1 . 2 hops      [ Fit ] [ List view ] │
│                                      │                                                           │
│ Refund Agent       |||| Crit ! 1 edge│ [Refund]--[Agent]==(Atlas-1)==[Policy Tool]               │
│ Claims Policy Asst |||o High         │      '- - [Fallback model] (inferred 0.62) ?              │
│ Customer Chat Asst |||o High         │                                                           │
│ Invoice Extractor  |||o High         │ Edges: == runtime  -- config  .. code-inferred            │
│ Ticket Summariser  ||oo Med          │        <> attested  -. AI-inferred                        │
│ Support Triage     ||oo Med          │ (*) Affected   ( ) Connected, not affected                │
│                                      │                                                           │
│ [ ] Connected, not affected (2)      │                                                           │
├──────────────────────────────────────┴───────────────────────────────────────────────────────────┤
│ EVIDENCE . Refund Agent > Policy Tool > Fallback    [ Confirm ] [ Override... ] [ Why ]          │
│ Edge depends on . LLM-inferred . confidence 0.62 . verified 2 d ago . source: gateway diff       │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Zones, grid and content

| **Zone** | **Grid and size** | **Contents and behaviour** |
|----|----|----|
| Event header | 12 col, 64 px | Event title, detection time, source, detection confidence (ConfidenceMeter), a “Hold” secondary action, and the primary “Continue to Plan” (disabled with a reason until G1 is met). |
| Gate banner | 12 col, 48 px | GateBanner stating what blocks G1 and a link “Go to edge” that selects the blocking edge and opens the evidence panel. |
| Affected applications list | 5 of 12 col, left | Primary view. Rows sorted by risk then name. Each row: app name (link), RiskMeter, owner initials, a “1 edge” badge if it has unresolved edges, and a chevron. Group below: “Connected, not affected” (collapsed by default, toggle) showing apps that touch the changed model only through unused or fallback paths. |
| Focused graph | 7 of 12 col, right | DependencyGraph limited to 2 hops from the changed dependency, up to 60 nodes. Affected nodes have a filled style and bold outline; connected-not-affected have a hollow style. Edges follow the evidence-class pattern legend. Selecting a row in the list highlights its path in the graph and vice versa. |
| Evidence panel | 12 col, bottom, resizable 160 to 320 px | Provenance for the selected application or edge: edge type (one of 13 relationships), evidence class, confidence, last verified, source, who confirmed it. Actions: Confirm, Override, Why (opens EvidenceDrawer). Shows the risk-tier rationale and which workload type from the risk matrix applies. |

#### Components used

- DependencyGraph, DataTable (list), RiskMeter, ConfidenceMeter, ProvenanceTag, GateBanner, EvidenceDrawer, StageStepper, StatusChip (Stale, Unresolved, Conflict), SkeletonBlock, EmptyState.

#### Interactions and flows

1.  On first open the page shows “Discovering blast radius…” for up to 2 seconds in demo mode, then the six affected applications appear one by one from top to bottom (respecting reduced motion).

2.  Selecting an application in the list highlights its path to the changed model in the graph and fills the evidence panel with that path’s edges.

3.  Toggling “Show connected, not affected” adds two hollow nodes and their reasons (for example “Uses Atlas-1 only as a fallback with no calls in 90 days”). These never count toward the affected total.

4.  **Confirm** on an edge: sets state confirmed and class manually-attested, writes a Record entry, re-evaluates G1. If this clears the last blocker, the banner turns into a one-time success note and the primary action becomes active.

5.  **Override** opens a short form with four required fields: reason, named owner (defaults to the user), expiry date, and supporting evidence (link or note). Without all four, the submit button stays disabled and says what is missing.

6.  “Continue to Plan” moves the event to the Plan stage, marks Blast Radius complete (read-only), and focuses the Plan page title.

7.  Switching \[List\|Graph\] changes the emphasis, never the data. On narrow screens the graph is replaced by its list equivalent.

#### State design

| **State** | **What the user sees and can do** |
|----|----|
| Empty | No affected applications: “No applications depend on this model. Nothing to qualify. \[Close event\]” with an explanation of how that was determined. |
| Loading | Skeleton list and a graph placeholder with the text “Discovering blast radius…”. |
| Partial | Some connectors failed: banner “Discovery is incomplete: 2 sources did not respond. Uncertain workloads are included to be safe.” Affected list marks them with an “Included to be safe” chip (charter rule: include uncertain critical workloads). |
| Error | “We could not read the dependency graph. No scope can be reduced. Full regression is the safe default. \[Retry\] \[Continue with full regression\]”. |
| Stale | Edges older than their freshness threshold show a gold Stale chip and are excluded from autonomous decisions; a banner explains. |
| Conflict | Two sources disagree about an edge: both are shown side by side with precedence calculated; the edge is blocking if it lies on a path to a critical workload. |

#### Microcopy (use verbatim)

| **Where** | **Text** |
|----|----|
| Page title | Blast radius |
| Gate banner | 1 critical edge is unresolved. Confirm or override it to continue. |
| Connected toggle | Show applications that are connected but not affected (2) |
| Override form title | Override this edge |
| Override help | An override needs a reason, a named owner, an expiry date and supporting evidence. It is recorded and can be reviewed. |
| Disabled primary | Locked until the critical edge is confirmed or overridden. |

#### Keyboard, accessibility and responsive notes

- The list is the primary, fully accessible view. The graph is role=img with a text summary (“Atlas-1 is used by 6 applications through 9 relationships”) and each node is reachable by keyboard in list order.

- Edge pattern differences are also stated in text in the evidence panel (“Evidence class: LLM-inferred”).

- Keyboard: arrow keys move through the list; Enter selects; C confirms the selected edge; O opens override; Esc closes forms. Single-key shortcuts only act when a list row has focus and never perform irreversible actions without a confirm step.

- Responsive: below 1280 px the graph moves behind a “Graph” tab; the list remains first.

#### Acceptance criteria

1.  On first open with seed data, exactly six applications are listed as affected and exactly two as connected, not affected.

2.  “Continue to Plan” is disabled until the Refund Agent edge is confirmed or overridden, and the disabled control explains why in text.

3.  Confirming the edge enables “Continue to Plan” within one second and adds one Record entry with the confirmer’s identity.

4.  An override cannot be submitted unless reason, owner, expiry and evidence are all present.

5.  A user can complete the whole screen using only the keyboard and a screen reader reading the list.

6.  Applications marked “connected, not affected” are never counted in the header, Home or Plan.

### 3. Event: Regression Plan

| **Screen ID and route** | S3 · /events/:id/plan |
|----|----|
| **The one question it answers** | What will we test, and why? |
| **Primary users** | QA / Test Lead (approves), Application Owner (reviews), Risk Approver (reads). |
| **Reached from** | Screen 2 (gate G1 met), stepper. |
| **Leads to** | Screen 4 (Results) when gate G2 is met. |
| **Data consumed** | PlanItem, Test, MissingTest, Workload, Edge (rationale links), MemoryItem (reuse badges). |
| **Build tier** | A. Full fidelity. |

#### Purpose and design intent

This screen shows the proportionate test scope for each affected application and the reason for every test that is kept, dropped or newly proposed. Its credibility depends on one thing: every exclusion has a visible reason, and critical tests are visibly protected.

It is also where the quiet value of institutional memory shows: tests whose evidence was reused from earlier events carry a small badge naming the source event.

#### Layout wireframe (desktop 1440 px wide; content area inside the global shell)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Regression plan . 134 of 480 tests selected (illustrative) . Critical pack 100% [L]              │
│ [ Approve plan ]  (Test Lead)                                                                    │
├─────────────┬─────────────────────────────────────────────────────────┬──────────────────────────┤
│ APPS        │ TESTS . Refund Agent   [All v] [Included] [Excluded]    │ MISSING TESTS (2)        │
│             │                                                         │                          │
│ > Refund    │ [L] Policy check before refund Critical INCLUDE  Rule   │ * Tool order drift       │
│   52 / 140  │ [L] Refund amount limit        Critical INCLUDE  Rule   │   Gap: new step order    │
│   Claims RAG│ [v] Tool parameter schema      High     INCLUDE  AI     │   [Review] [Reject]      │
│   34 / 110  │ [x] Legacy greeting tone       Low      EXCLUDE  why >  │                          │
│   Chat Asst │ [x] Duplicate of T-0211        Low      EXCLUDE  why >  │ * Refusal wording        │
│   22 / 90   │ [+] Tool order drift (new)     High     PROPOSED AI     │   Chat Assistant         │
│   Invoice   │     [Reused] from event E-2026-012                      │   [Review] [Reject]      │
│   12 / 60   │                                                         │                          │
│   Summariser│                                                         │ SME approval needed      │
│   8 / 45    │                                                         │ for high risk tests      │
│   Triage    │                                                         │                          │
│   6 / 35    │                                                         │                          │
└─────────────┴─────────────────────────────────────────────────────────┴──────────────────────────┘
```

#### Zones, grid and content

| **Zone** | **Grid and size** | **Contents and behaviour** |
|----|----|----|
| Plan header | 12 col, 64 px | Summary “134 of 480 tests selected” with an “illustrative” tag until measured, “Critical pack 100% included” with a lock icon, and the primary “Approve plan” (visible to all, enabled only for the Test Lead). |
| Application rail | 2.5 of 12 col, left | One row per affected application: selected / total tests, a small bar, and risk tier. Selecting changes the centre pane. Applications with pending proposed tests show a gold dot. |
| Test table | 6 of 12 col, centre | DataTable for the selected application. Columns: lock (for critical-pack), test name (link to O1), severity, decision (Include, Exclude, Proposed) as StatusChip-style tags, reason chip (code), provenance tag, memory badge. Filters: decision, severity, provenance. Excluded rows show the reason chip inline; clicking it opens O1. |
| Missing-test panel | 3.5 of 12 col, right | Candidate tests proposed by the Missing-Test Generator for coverage gaps this change exposes. Each card: title, gap description, severity, ProvenanceTag “AI-proposed”, Review and Reject. High-risk workload candidates are marked “SME approval required”. |

#### Components used

- DataTable, ProvenanceTag, StatusChip, EvidenceDrawer (O1), GateBanner, StatTile, HashChip (plan version), ApprovalPanel (reduced form for plan approval).

#### Interactions and flows

1.  Selecting an application updates the table, the right panel and the URL (?app=).

2.  Included tests in the critical pack show a lock. Clicking a lock does nothing but shows the tooltip “Critical pack: always included. Immutable for this event.” A keyboard user hears the same text on focus.

3.  Clicking any reason chip or test name opens O1 (rationale drawer) with the reason code, plain-language explanation, supporting evidence and the rule or model that produced it.

4.  **Review** on a missing-test card opens O1 in review mode with the generated test in a read-only, declarative form (not code), the gap it addresses and two buttons: Approve for this event, Reject with reason. Approving a high-risk candidate requires the Test Lead role.

5.  **Approve plan** is enabled only when no high-risk proposed test is pending. On click a confirmation shows counts (“134 tests selected, 346 excluded with reasons, 2 new tests approved”). Approval locks the plan, runs Kernel validation of the critical pack, writes a Record entry with the plan version hash, and moves to Results.

6.  If Kernel validation fails (a critical test is missing), overlay O4 appears and the plan cannot be approved until the test is restored.

#### State design

| **State** | **What the user sees and can do** |
|----|----|
| Empty | An application with no mapped tests: “No tests are mapped to this application. Evergreen will propose coverage. \[Review proposals\]”. Full regression is selected by default. |
| Loading | Skeleton rows and a pulsing header number removed under reduced motion. |
| Partial | Test source unavailable (for example the test management system): banner “Test source did not respond. Full regression is recommended.” Selection reduction is disabled. |
| Error | “Plan could not be generated. No tests were excluded. \[Retry\] \[Use full regression\]”. |
| Defect | If any excluded row has no reason code the table shows a red defect banner “Data defect: an exclusion has no reason. This plan cannot be approved.” (charter: no exclusion without rationale). |
| Hard stop | Kernel rejects the plan: O4 with the rule ID and next steps. |

#### Microcopy (use verbatim)

| **Where** | **Text** |
|----|----|
| Header summary | 134 of 480 tests selected (illustrative). Critical pack included: 100%. |
| Lock tooltip | Critical pack: always included. Immutable for this event. |
| Reason chips | NOT_AFFECTED · DUPLICATE · OBSOLETE · COVERED_BY_PINNED_EVIDENCE · LOW_RISK_REDUNDANT (reason codes \[P\]; section 9.3) |
| Approve confirm | Approve this plan? 134 tests selected, 346 excluded with reasons, 2 new tests approved. Critical pack unchanged. |
| Disabled approve | Approve is available to a Test Lead once all proposed high-risk tests are reviewed. |

#### Keyboard, accessibility and responsive notes

- The test table uses aria-sort, row headers and an accessible description for each reason chip; locks have text alternatives.

- Keyboard: J and K move rows; Space toggles selection for bulk review (never for critical rows); Enter opens O1.

- Reduced motion: no animated bar fills.

- Responsive: below 1280 px the missing-test panel becomes a tab named “Proposed”.

#### Acceptance criteria

1.  Every excluded test in the seed shows a reason code; removing one in test data makes the defect banner appear and disables Approve plan.

2.  Critical-pack tests cannot be toggled by mouse, keyboard or API call.

3.  After approving the plan, Screen 4 unlocks, Home shows the stage as Results, and the Record contains a plan entry with a hash.

4.  A high-risk generated test cannot be approved by a non-Test-Lead role; the control explains why.

5.  The summary shows “illustrative” while seed data is in use and “measured” only when the numbers come from a real run.

### 4. Event: Results

| **Screen ID and route** | S4 · /events/:id/results |
|----|----|
| **The one question it answers** | How does the candidate behave compared with the current model? |
| **Primary users** | QA Lead, Application Owner, Risk Approver. |
| **Reached from** | Screen 3 (after plan approval), stepper. |
| **Leads to** | Screen 5 (Decision) when gate G3 is met. |
| **Data consumed** | Result, Recommendation (preview), Test, Rollout (none yet), run manifest. |
| **Build tier** | A. Full fidelity (if time is short, build as the second tab of Screen 3 but keep the same content). |

#### Purpose and design intent

Results compares the candidate with the current model across the dimensions the charter defines. It must make three things unmistakable: deterministic failures outrank everything else; agents are judged on the path they took, not only the answer; and disagreement between judges is shown as uncertainty, not averaged away.

#### Layout wireframe (desktop 1440 px wide; content area inside the global shell)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Results . run complete 4m 12s . manifest Atlas-1 v1 vs Atlas-2 . seed 4821   [ Reproduce ]       │
│ [ Continue to Decision ]                                                                         │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ HEATMAP         Determ.   Schema    Semantic   Safety   Tool use  Traject.   Cost   Latency      │
│ Refund Agent    [x] F     [v] P     [v] P      [v] P    [v] P     [x] F      [!] W  [v] P        │
│ Claims Policy   [v] P     [v] P     [!] W      [v] P    n/a       n/a        [v] P  [v] P        │
│ Customer Chat   [v] P     [v] P     [!] W      [!] W    n/a       n/a        [v] P  [v] P        │
│ Invoice Extract [v] P     [!] W     [v] P      [v] P    n/a       n/a        [v] P  [v] P        │
│ Ticket Summary  [v] P     [v] P     [v] P      [v] P    n/a       n/a        [v] P  [v] P        │
│ Support Triage  [v] P     [v] P     [v] P      [v] P    n/a       n/a        [v] P  [v] P        │
│ P pass   W warn   F fail   n/a not applicable. A deterministic Fail outlines its whole row.      │
├───────────────────────────────────────────────────────────┬──────────────────────────────────────┤
│ CASE . Refund Agent . C-0087 . refund request over limit  │ JUDGES . Chat . Semantic             │
│                                                           │                                      │
│ CURRENT: lookup > POLICY CHECK > refund > declined        │ Judge A: 0.82                        │
│ CANDIDATE: lookup > refund > declined   [!] check skipped │ Judge B: 0.64                        │
│ Answers match. Trajectory FAILS a deterministic rule.     │ Disagree (2 bands)                   │
│                                                           │ Human review needed                  │
│ [ Why flagged ]                                           │                                      │
│                                                           │ RUN MANIFEST   [ Copy ]              │
└───────────────────────────────────────────────────────────┴──────────────────────────────────────┘
```

#### Zones, grid and content

| **Zone** | **Grid and size** | **Contents and behaviour** |
|----|----|----|
| Run header | 12 col, 64 px | Run status and duration, the run manifest chip (model versions, parameters, seed), “Reproduce” (re-runs from the manifest; demo only simulates), and the primary “Continue to Decision”. |
| Heatmap | 12 col | HeatmapGrid: rows are applications, columns are dimensions in this fixed order: Deterministic, Schema, Semantic, Safety, Tool use, Trajectory, Cost, Latency. A Fail in a deterministic column outlines the entire row and adds the row note “Deterministic failure: this overrides other results.” Cells show a shape plus a letter and a numeric score on hover. |
| Case comparison | 8 of 12 col, bottom left | DiffViewer for the selected cell’s worst case: current output beside candidate output with changed spans marked. For agents, the TrajectoryTimeline replaces text diff; a skipped step appears as a dashed placeholder labelled “Required step missing”. |
| Judge and manifest panel | 4 of 12 col, bottom right | For each probabilistic dimension: judge scores with an uncertainty band, a “Judges disagree” flag when they differ by more than one confidence band, and a prompt “Human review needed”. Manifest panel lists pinned model versions, instruction and policy versions, seed and parameters. |

#### Components used

- HeatmapGrid, DiffViewer, TrajectoryTimeline, ConfidenceMeter, HashChip (manifest hash), StatusChip, EvidenceDrawer, SkeletonBlock, EmptyState.

#### Interactions and flows

1.  After plan approval the run starts. In demo mode it plays as simulated progress (a thin progress bar and “Running 61 of 134 tests”) for about 8 seconds, then the heatmap populates row by row.

2.  Selecting a cell updates the case comparison to that application and dimension, and writes ?app=&dim= into the URL.

3.  A Fail in a deterministic column also updates the Home outcome counts and the S5 recommendation preview (Block) in the same store action.

4.  “Judges disagree” opens O1 in comparison mode showing each judge’s score and rationale; the item is marked inconclusive and sent to human review; the S5 recommendation for that application becomes Investigate.

5.  **Expand evidence** (available once per cycle, maximum two): adds a second run column with extra tests for uncertain applications and shows “Expansion 1 of 2”.

6.  “Continue to Decision” is enabled when the run is complete or inconclusive with a reason (G3).

#### State design

| **State** | **What the user sees and can do** |
|----|----|
| Empty | Before the run starts: “Results will appear here once the approved plan runs. \[Start run\]”. |
| Loading | Progress bar with “Running 61 of 134 tests”, skeleton heatmap rows. |
| Partial | Some cells pending: shown as grey “Pending” with a clock; the rest are usable. Decision stays locked until all cells have a result or an explicit inconclusive reason. |
| Error | An evaluator timed out: the cell shows “Inconclusive: evaluator timed out” and the row adds “Retry”. After two retries it stays inconclusive and the recommendation defaults to Investigate or Block. |
| Stale | Pricing or usage data stale: cost cells show “Incomplete: stale prices. Sampling more.” (charter). |
| Hard stop | A deterministic critical failure triggers an inline red notice on the row and a Block preview; O4 appears only if the Kernel itself raises it. |

#### Microcopy (use verbatim)

| **Where** | **Text** |
|----|----|
| Deterministic row note | Deterministic failure: this overrides other results. |
| Skipped step label | Required step missing: policy check did not run. |
| Judge disagreement | Judges disagree. Human review needed. We have not averaged them. |
| Inconclusive | Inconclusive: this does not count as a pass. |
| Manifest tooltip | Everything needed to repeat this run: model versions, parameters, seed, data and code versions. |

#### Keyboard, accessibility and responsive notes

- The heatmap is a real table; each cell’s text is “Refund Agent, Trajectory: Fail, score 0.00”. Shape and letter appear in every cell; colour is a third cue.

- Timeline steps are an ordered list; the skipped step is announced.

- Charts and diffs have a text equivalent (“Candidate skipped policy check before calling refund”).

- Responsive: below 1280 px the judge panel becomes a collapsible section under the case comparison.

#### Acceptance criteria

1.  In the seed, Refund Agent shows Deterministic and Trajectory as Fail while its final answer is identical to the current model’s.

2.  A skipped required step is shown as a Fail even when the output text matches.

3.  Judge disagreement is displayed as two scores and a flag; no averaged score is shown for that cell.

4.  Colour-blind simulation (deuteranopia, protanopia) still lets a user identify every Pass, Warn and Fail.

5.  Reproduce re-creates the same displayed results from the manifest in demo mode (deterministic, no randomness).

### 5. Event: Recommendation and Approval

| **Screen ID and route** | S5 · /events/:id/decision |
|----|----|
| **The one question it answers** | What do we do, and who signs? |
| **Primary users** | Approvers (Application Owner, Risk Approver, Data Owner, QA Lead), Executive (read). |
| **Reached from** | Screen 4 (gate G3 met), Home decision queue, notifications. |
| **Leads to** | Screen 6 (Rollout) when gate G4 is met; Screen 7. |
| **Data consumed** | Recommendation, Result, Approval, Workload (approval authority), Kernel rule hits, EvidenceEntry. |
| **Build tier** | A. Full fidelity. This is the most important screen in the product. |

#### Purpose and design intent

The decision screen turns evidence into one defensible, owned decision per application. It must feel serious: nothing here is casual. Each recommendation carries its reason, its uncertainty and the Kernel’s deterministic verdict, and approval is a deliberate act by a named human.

The screen is designed so that an approver can understand the whole situation without leaving it: the treatment, why, what is not known, who else must sign and what happens next.

#### Layout wireframe (desktop 1440 px wide; content area inside the global shell)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Decision . 6 apps . Block 1 . Investigate 1 . Canary 2 . Migrate 2    [ Filter v ] [ Sort v ]    │
├────────────────────────────────────────────────────────────────────┬─────────────────────────────┤
│ Refund Agent        [Block]  0.62 Low  Kernel: DENY K-014          │ APPROVAL                    │
│   Candidate skipped the policy check. Cannot be approved here.     │                             │
│   Why v   What we do not know v   AI-proposed                      │ You: Asha Rao               │
│ ----------------------------------------------------------------   │ Role: App Owner             │
│ Customer Chat Asst  [Investigate]  0.58 V.low  Kernel: Permit      │ Scope: 2 apps               │
│   Judges disagree. 1 test awaits SME review. [ More evidence ]     │ Expires in 8h 00m           │
│ ----------------------------------------------------------------   │ Duty check: OK              │
│ Claims Policy Asst  [Canary]  0.88 Mod  Kernel: Permit             │ Kernel: Permit 2/2          │
│   Why v   Unknowns v   Needs: Asha Rao + Daniel Okafor             │                             │
│ ----------------------------------------------------------------   │ [ Approve scope ]           │
│ Invoice Extractor [Canary] 0.84   Ticket Summariser [Migrate] 0.97 │ [ Reject ]                  │
│ Support Triage [Migrate] 0.95                                      │ [ More evidence ]           │
│                                                                    │                             │
│                                                                    │ Block items cannot be       │
│                                                                    │ approved here.              │
└────────────────────────────────────────────────────────────────────┴─────────────────────────────┘
```

#### Zones, grid and content

| **Zone** | **Grid and size** | **Contents and behaviour** |
|----|----|----|
| Decision header | 12 col, 64 px | Title with outcome counts (RiskBadgeRow), filter by outcome and sort by risk, confidence or name. Primary action is the sticky Approval panel, not a header button. |
| Recommendation cards | 8 of 12 col, left, scrolling list | One card per affected application, grouped Block, Investigate, Canary, Migrate. Card: app, treatment chip, ConfidenceMeter, KernelVerdict, one-sentence reason with ProvenanceTag, “Why” (opens O1), “What we do not know” (always present; if nothing is unknown it says so), required approvers with their status, and a selection checkbox for Migrate and Canary items only. |
| Approval panel | 4 of 12 col, right, sticky | ApprovalPanel: identity, role, scope (count of selected items and their names), expiry countdown by risk tier, separation-of-duties check, Kernel summary, and the actions Approve scope, Reject, Request more evidence. For Block items the panel shows “Block items cannot be approved here” and offers Acknowledge only. |

#### Components used

- StatusChip, ConfidenceMeter, KernelVerdict, ProvenanceTag, ApprovalPanel, EvidenceDrawer, RiskBadgeRow, overlay O2, GateBanner, HashChip.

#### Interactions and flows

1.  Cards arrive in a fixed priority so the hardest decision is first: Block, Investigate, Canary, Migrate.

2.  Ticking Migrate and Canary cards builds a scope in the Approval panel. Block and Investigate cards have no checkbox. There is no “select all” and no bulk approve.

3.  Opening “Why” shows the evidence in O1: the results that drove the treatment, the policy applied, the judge scores, and the residual gaps.

4.  **Approve scope** opens O2 (approval confirmation modal). Friction scales with the highest risk tier in the scope: Low or Medium one confirm; High requires a written rationale; Critical requires typing the application name, a rationale, and re-verifying identity.

5.  On signing, each approved card changes to “Approved by \[name\] at \[time\]”, the rollout is queued, Screen 6 unlocks, the Home queue count drops, and a Record entry is written.

6.  **Request more evidence** adds an expansion cycle (maximum two). After two, the button becomes “Maximum evidence reached: choose Investigate or Block” and the treatment cannot be Migrate or Canary.

7.  If the Kernel returns Deny for any item the card shows Deny with the rule ID, the checkbox is absent and no role can enable approval. The only available action is Acknowledge, which records that the owner has seen the Block.

8.  If a required co-approver is missing (for example a Data Owner on the RAG assistant), the card says “Waiting for Daniel Okafor (Data Owner)” and Approve is disabled for that item until they sign.

#### State design

| **State** | **What the user sees and can do** |
|----|----|
| Empty | Decision not ready: “Recommendations appear once the run completes. \[Back to Results\]”. |
| Loading | Skeleton cards with fixed height so the page does not jump. |
| Partial | Some applications still inconclusive: those cards show Investigate with the reason; others are actionable. |
| Error | “We could not load recommendations. Nothing has been approved. \[Retry\]”. |
| Expired approval | A signed approval that expired before rollout shows “Expired. A new approval is required.” and returns to awaiting approval. |
| Hard stop | Kernel Deny on any item: card in red tint, panel shows the explanation; if Kernel integrity fails, O4. |
| Separation of duties | “You took part in earlier steps of this event, so a different approver must sign.” Approve disabled with the reason. |

#### Microcopy (use verbatim)

| **Where** | **Text** |
|----|----|
| Block card reason | Blocked by policy. This cannot be approved here. |
| Unknowns block title | What we do not know |
| Unknowns none | No known gaps. This is not a guarantee of equivalence. |
| Approve button | Approve scope |
| Reject button | Reject with reason |
| Evidence request | Request more evidence (1 of 2) |
| Expiry | Expires in 3h 42m. If it expires, nothing moves. |

#### Keyboard, accessibility and responsive notes

- Cards are article elements with headings; each treatment and Kernel verdict is text, not colour only.

- The approval panel is a landmark complementary region; changes in scope are announced politely.

- Keyboard: Tab through cards; Space toggles a card’s checkbox; the Approve button is last in the focus order of the panel.

- Responsive: below 1280 px the panel docks to the bottom as a sticky bar that expands into a modal.

- Time pressure must not hide information: the expiry countdown is informational and never auto-approves.

#### Acceptance criteria

1.  A Block item has no approve control and no role can enable one, including in demo mode.

2.  Approving a scope that includes a Critical-risk workload requires typed confirmation, a written rationale and identity re-verification.

3.  No “approve all” or bulk approval exists anywhere in the interface.

4.  Every card shows “What we do not know” with content or an explicit “no known gaps” statement.

5.  After signing, Home, Screen 6, the Record and Controls (recent approvals) update within one second.

6.  A person who confirmed an edge or approved a test in this event is blocked from being the sole approver.

### 6. Event: Rollout Monitor

| **Screen ID and route** | S6 · /events/:id/rollout |
|----|----|
| **The one question it answers** | Is the change safe, live? |
| **Primary users** | SRE (primary), Application Owner, Platform Engineer. |
| **Reached from** | Screen 5 (after a signed approval), Home active rollouts strip, notifications. |
| **Leads to** | Screen 7 (Record); Screen 10 (new memory items after completion). |
| **Data consumed** | Rollout, Approval, Workload contract thresholds, EvidenceEntry, Notification. |
| **Build tier** | A. Full fidelity. This screen carries the demo’s emotional peak. |

#### Purpose and design intent

Rollout turns approved recommendations into a controlled, visible change. The user needs to see three things at a glance: which ladder step we are on, whether each metric is inside its pre-approved limit, and what the safe fallback is.

If a metric breaches its threshold, the system rolls back automatically within pre-authorised policy. The screen must make that moment legible and calm: what happened, what was done, how long it took, and that last-known-good is healthy again.

#### Layout wireframe (desktop 1440 px wide; content area inside the global shell)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Rollout . Claims Policy Assistant . approved by Asha Rao + Daniel Okafor . Canary                │
│ [ Hold ]   [ Request rollback ]                                                                  │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ LADDER  [Shadow] done > [1%] done > [5%] RUNNING 06:40 > [25%] > [100%]                          │
├────────────────────────────────────────────────────────────────┬─────────────────────────────────┤
│ GROUNDEDNESS (limit 0.85)       CITATION VALIDITY (0.95)       │ LAST-KNOWN-GOOD                 │
│ 1.0 |. . . . . . . . . .        1.0 |. . . . . . . . . .       │                                 │
│ 0.85|--------- limit ------     0.95|--------- limit ------    │ Atlas-1 v1 [healthy]            │
│ 0.71|        \_/!\ breach       0.97|. . . . . . . . . .       │ Config 7f3a..2c1d               │
│     +----------- time               +----------- time          │ [ Restore LKG ] (2 people)      │
│                                                                │                                 │
│ LATENCY p95 (limit 900 ms)      COST per 1k calls (+10% max)   │ RECOVERY TARGET                 │
│ 720 ms (inside band)            +4% (inside band)              │ 5 min or less (simulated)       │
├────────────────────────────────────────────────────────────────┴─────────────────────────────────┤
│ ! Groundedness 0.71 < limit 0.85. Rolled back automatically. Recovery 02:14   [ View record ]    │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Zones, grid and content

| **Zone** | **Grid and size** | **Contents and behaviour** |
|----|----|----|
| Rollout header | 12 col, 64 px | Application, approvers, current treatment (Canary or Migrate), and actions: Hold, Request rollback (both for SRE and Platform Engineer roles). |
| Stage ladder | 12 col, 56 px | Five steps: Shadow, 1%, 5%, 25%, 100%, each with a status (done, running with dwell timer, upcoming). An application switcher at the right when several are rolling out. The ladder never offers “skip a step”. |
| Metric charts | 8 of 12 col, grid of four | ThresholdChart per contract metric (for the Claims assistant: groundedness, citation validity, latency p95, cost per 1,000 calls). The pre-approved threshold is drawn as a band; the current value is labelled directly; a breach adds a triangle marker and text “Breach”. Each chart has a data-table toggle. |
| Last-known-good card | 4 of 12 col, right | LKG version and health, pinned configuration hash, the recovery target (charter: 5 minutes in simulation), and “Restore LKG”. Manual restore requires two distinct people through O2’s dual-confirmation variant. |
| Incident banner | 12 col, appears on breach | Red banner: what breached, what was done, the recovery timer, and a link to the Record entry. Pinned until acknowledged. |

#### Components used

- ThresholdChart, StatusChip, HashChip, Timeline (compact), ApprovalPanel (dual variant), Toast, overlay O2 and O4, FreshnessPill.

#### Interactions and flows

1.  A step advances only when its dwell time has passed and no metric is in breach. The advance is automatic inside the approved scope; a human is not asked again.

2.  **Hold** requires a reason. While held, traffic stays at the current step; the ladder shows “Held by Sofia Alvarez” and Resume becomes available.

3.  **Automatic rollback:** when any metric crosses its pre-approved threshold the rollout state becomes rolled_back, the banner appears, traffic returns to last-known-good, the recovery timer runs until LKG is healthy and then stops. A Record entry captures trigger, action and evidence.

4.  **Request rollback (manual):** opens O2 in dual-confirmation form. The requester selects a reason and a second, different person must confirm. The Record stores both identities.

5.  If LKG does not become healthy within 2 minutes \[P\] of the trigger, the rollout enters rollback_failed and O4 appears with the break-glass runbook and a note that owners have been alerted.

6.  On a successful completion at 100%, the Learn step creates memory items, updates the Workload Profile history, and shows a Toast “Rollout complete. 2 items proposed to Memory.”

#### State design

| **State** | **What the user sees and can do** |
|----|----|
| Empty | No approved rollouts: “Nothing is rolling out. Rollouts start after an approval on the Decision screen. \[Go to Decision\]”. |
| Loading | Charts skeleton; ladder shows “Starting…”. |
| Partial | A metric feed missing: that chart shows “No data. Rollout is held until the feed returns.” and the ladder auto-holds. |
| Error | “We lost the metric feed. Traffic is held at the current step. \[Retry\] \[Roll back\]”. |
| Stale | Metric older than its interval: the chart shows “Last updated 4 min ago” in gold, and advancement pauses. |
| Incident | Red banner and timer as above. |
| Hard stop | rollback_failed: O4 with the break-glass runbook. |

#### Microcopy (use verbatim)

| **Where** | **Text** |
|----|----|
| Breach banner | Groundedness breached the pre-approved limit (0.71 below 0.85). Rolled back automatically within pre-authorised policy. |
| Recovery | Last-known-good is healthy again. Recovery took 2m 14s. Target: 5m or less. |
| Hold prompt | Hold this rollout? Traffic stays where it is. A reason is required. |
| Manual rollback | Restore last-known-good? A second person must confirm. |
| Threshold tooltip | Pre-approved limit. Set in the approved contract. Not changeable here. |

#### Keyboard, accessibility and responsive notes

- Charts have role=img with a summary and a “Show data” table; the breach is announced once, assertively, as an alert.

- The recovery timer is text, updates at most every 5 seconds for assistive technology and every second visually.

- No flashing; the banner appears with a single, short emphasis (120 ms) unless reduced motion is on.

- Responsive: below 1280 px charts become a single column; the LKG card becomes a collapsible section.

#### Acceptance criteria

1.  In demo mode, injecting the “Canary degrades” failure causes an automatic rollback within 3 simulated minutes and shows a recovery time of 5 minutes or less.

2.  Rollback never asks for human approval inside the pre-authorised range, but a manual rollback requires two distinct people.

3.  A metric chart always shows its threshold band and a direct label for the current value.

4.  If LKG is not healthy within 2 minutes of a rollback trigger, O4 appears and the break-glass runbook is linked.

5.  Home, Screen 5, Workload Profile and the Record all reflect the rollback within one second.

### 7. Event: Evidence Record

| **Screen ID and route** | S7 · /events/:id/record |
|----|----|
| **The one question it answers** | Can we prove it later? |
| **Primary users** | Governance and Audit, Risk Approver, Application Owner, Platform Engineer. |
| **Reached from** | Stepper, Home (View record), Controls, Memory. |
| **Leads to** | Screen 9 (workload), Screen 11 (rule), Screen 10 (memory), exports. |
| **Data consumed** | EvidenceEntry (hash chain), all event entities, Approval, Rollout, run manifest. |
| **Build tier** | A. Minimum viable for the Techathon: timeline, integrity, export, reproduce. |

#### Purpose and design intent

The Record is the answer to the question an auditor or a sceptical executive will ask afterwards: who decided what, on which evidence, and can we trust that nothing was changed? It is read-only by design.

It is also where the reproducibility principle becomes visible: one action re-creates the run from its manifest.

#### Layout wireframe (desktop 1440 px wide; content area inside the global shell)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Record . Atlas-1 retirement . CID-7F3A91 [copy] . Integrity: verified [v] . 27 entries           │
│ [ Export PDF ] [ Export JSON ] [ Reproduce this run ]                                            │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TIMELINE                                            Compare with: [ E-2026-012 v ]               │
│                                                                                                  │
│ 09:12  System       Change detected: Atlas-1 retirement (0.94)          a41c..9e02               │
│ 09:20  R. Kulkarni  Confirmed edge Refund > Policy Tool > Fallback      17bd..c301               │
│ 09:44  M. Lee       Approved plan v1 (134 tests, 2 new)                 90e5..77a8               │
│ 10:03  System       Run complete (manifest 4821)                        d2f0..13bb               │
│ 10:21  A. Rao       Signed Ticket Summariser, Support Triage (Migrate)  5ac9..e610               │
│ 10:45  System       Rolled back Claims Policy (groundedness 0.71)       3e7d..0a4f               │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Footer: Sandbox . Synthetic data . Hash chain verified at 10:46   [ Verify again ]               │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Zones, grid and content

| **Zone** | **Grid and size** | **Contents and behaviour** |
|----|----|----|
| Record header | 12 col, 64 px | Event title, correlation ID chip, integrity status (HashChip group result: Verified or Broken), entry count, and actions Export PDF, Export JSON, Reproduce this run. |
| Timeline | 9 of 12 col | Timeline of EvidenceEntry items: time, actor (person, role, or System), kind icon, one-line summary, truncated hash. Expand shows the detail (approval scope, rationale, evidence links, before and after states). Filter by kind (Decision, Evidence, Approval, Rollout, Override) and by application. |
| Compare drawer | 3 of 12 col, right, collapsible | Select another event to compare plan size, outcome mix, time to decision and reused tests. Shows differences, not a score. |
| Footer strip | 12 col, 24 px | Sandbox marker and live integrity status with “Verify again”. |

#### Components used

- Timeline, HashChip, EvidenceDrawer, DataTable (filters), ProvenanceTag, SandboxBadge, Toast.

#### Interactions and flows

1.  On load the chain is verified (recompute each hash). The result appears in the header; a failure turns the chip red, shows “Evidence integrity check failed at entry 12” and raises O4.

2.  Expanding an entry shows the full detail. There is no edit and no delete control anywhere on the page.

3.  **Export PDF** produces a readable summary; **Export JSON** produces the machine-readable chain. The button text states what is included (“Includes decisions, evidence and hashes; synthetic data only”).

4.  **Reproduce this run** re-executes from the manifest and shows a side-by-side check: “Reproduced: same material recommendation for 6 of 6 applications.” In demo mode this is deterministic.

5.  Selecting a comparison event fills the right drawer with differences (for example “Plan size 134 vs 98”, “Reused tests 12 vs 0”).

#### State design

| **State** | **What the user sees and can do** |
|----|----|
| Empty | Event has no decisions yet: “The record starts when the first decision is made. Detection is already recorded.” The first system entries are always shown. |
| Loading | Skeleton timeline rows; the integrity chip shows “Verifying…”. |
| Partial | Some entries are still being written: header says “Recording…”. |
| Error | “We could not read the record. Nothing has been changed. \[Retry\]”. |
| Hard stop | Integrity failure: O4 and the whole timeline is marked as unverified. |

#### Microcopy (use verbatim)

| **Where** | **Text** |
|----|----|
| Integrity ok | Integrity verified: every entry matches its hash. |
| Integrity broken | Evidence integrity check failed. Do not rely on this record. Contact the platform owner. |
| Export note | Includes decisions, evidence and hashes. Synthetic data only. |
| Reproduce result | Reproduced: the same material recommendation for 6 of 6 applications. |

#### Keyboard, accessibility and responsive notes

- Timeline is an ordered list; each entry has a heading with time and actor. Hash chips have accessible names (“Hash starts a41c, ends 9e02”).

- Keyboard: arrows move through entries; Enter expands; E exports only after a visible confirmation.

- Responsive: the compare drawer becomes a dialog.

#### Acceptance criteria

1.  Changing any seeded entry’s text in test data breaks the chain and raises O4 on load.

2.  No control that edits or deletes an entry exists in the DOM.

3.  Reproduce returns a deterministic result and writes its own Record entry.

4.  Every approval entry shows the approver’s name, role, scope, rationale and expiry.

5.  Export buttons describe exactly what they include.

### 8. Estate Explorer

| **Screen ID and route** | S8 · /estate |
|----|----|
| **The one question it answers** | What does our AI estate look like? |
| **Primary users** | AI Platform Engineer, Enterprise Architect, Application Owner, Governance. |
| **Reached from** | Left rail, Home graph-health links, any application or model link. |
| **Leads to** | Screen 9 (workload), Screen 2 (when an edge belongs to an open event). |
| **Data consumed** | Entity (all entity types in the Schema document), Edge, Workload, ChangeEvent (to mark affected paths). |
| **Build tier** | B. Navigable and seeded; read-mostly. Edge confirm and override stay live. |

#### Purpose and design intent

Estate Explorer shows the living AI Dependency Graph: what exists, what depends on what, how sure we are, and where the data is old, conflicting or orphaned. It is the screen an architect opens to trust the graph, and the screen that explains why Blast Radius found what it found.

Because whole-estate graphs overwhelm, this screen always starts from a focus (a model, an application or a condition such as “stale edges”) and expands outward on request.

#### Layout wireframe (desktop 1440 px wide; content area inside the global shell)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Estate . 41 entities . Snapshot [Now v]  [Type v] [Relation v] [Evidence v] [Conf.] [ ] Stale    │
├──────────────────┬──────────────────────────────────────────────────────┬────────────────────────┤
│ FOCUS            │ [Policy]--[Refund]==(Atlas-1)==[Claims RAG]          │ INSPECTOR              │
│                  │      :                                               │                        │
│ (o) Model        │ [Fallback] .. (inferred)   [Summariser]--[Prompt v3] │ Atlas-1 (model)        │
│ ( ) Application  │                                                      │ Provider A             │
│ ( ) Condition    │ == runtime  -- config  .. code  <> attested          │ Retires in 14 days     │
│                  │ -. AI-inferred   [Stale] clock icon                  │ Used by 6 apps         │
│ Tabs             │ Clusters beyond 60 nodes.  [ Fit ] [ Expand 1 hop ]  │ Last verified 2 min    │
│ [Graph] [List]   │                                                      │ Edges: 9 total         │
│ [Orphans 0]      │                                                      │                        │
│ [Stale 2]        │                                                      │ [ Open in event ]      │
│ [Conflicts 0]    │                                                      │                        │
└──────────────────┴──────────────────────────────────────────────────────┴────────────────────────┘
```

#### Zones, grid and content

| **Zone** | **Grid and size** | **Contents and behaviour** |
|----|----|----|
| Filter bar | 12 col, 56 px | Entity type chips generated from the entity list in the Schema document (do not hard-code the count), relationship type (13 types), evidence class (5), confidence slider, “Stale only”, and a snapshot selector for the immutable per-event graph snapshots. |
| Focus and tabs | 2 of 12 col, left | Choose focus by model, application or condition. Tabs: Graph, List, Orphans, Stale, Conflicts. Each tab has a count badge. |
| Canvas | 7 of 12 col, centre | DependencyGraph with node icons by type, evidence-class edge patterns, stale clock icons, affected paths highlighted when an event is open. Maximum 60 nodes; beyond that, clusters with counts that expand on click. |
| Inspector | 3 of 12 col, right | Selected node or edge: type, version or status, source, owner, last verified, confidence, evidence class, history, and actions (Confirm, Override, Open in event, Open workload). |

#### Components used

- DependencyGraph, DataTable (list tab), StatusChip, FreshnessPill, ProvenanceTag, EvidenceDrawer, EmptyState.

#### Interactions and flows

1.  Choosing a focus re-centres the graph with a 2-hop neighbourhood; “Expand 1 hop” adds one more ring with a visible node cap.

2.  Selecting a node or edge fills the Inspector; double-click or Enter on a workload opens Screen 9.

3.  The snapshot selector shows the graph as it was at an earlier event. Snapshots are read-only and labelled “Snapshot of E-2026-012, 12 Aug”.

4.  Orphans tab lists workloads, models, tests or incidents with no owner or application mapping, each with “Assign owner”.

5.  Stale and Conflict tabs list edges with the reason and the next action (“Reverify”, “Resolve conflict”). Conflicting claims are shown side by side, never overwritten.

#### State design

| **State** | **What the user sees and can do** |
|----|----|
| Empty | Filters match nothing: “Nothing matches these filters. \[Clear filters\]”. |
| Loading | Skeleton canvas with the label “Loading estate…”. |
| Partial | Some sources missing: gold banner “2 sources are not connected. The graph may be incomplete.” |
| Error | “We could not load the graph. \[Retry\]”. The list tab stays available from cache with a Cached tag. |
| Stale | Gold clock icons on edges older than their freshness threshold; header pill turns gold. |
| Too large | “Showing 60 of 212 nodes. Use filters or expand a cluster.” |

#### Microcopy (use verbatim)

| **Where**      | **Text**                                           |
|----------------|----------------------------------------------------|
| Focus prompt   | Start from a model, an application or a condition. |
| Stale chip     | Stale: last verified 18 days ago                   |
| Cap notice     | Showing 60 of 212 nodes. Refine with filters.      |
| Snapshot label | Snapshot taken at event E-2026-012. Read only.     |

#### Keyboard, accessibility and responsive notes

- The List tab is the accessible primary; the graph has role=img with a summary and keyboard-reachable nodes in a logical order.

- Edge patterns are also named in the Inspector text.

- Keyboard: arrow keys move between neighbours; Enter opens inspector; Tab leaves the canvas.

- Responsive: below 1024 px only List, Orphans, Stale and Conflicts remain.

#### Acceptance criteria

1.  The graph never renders more than 60 nodes without clustering.

2.  The same edge shown on Screen 2 and Screen 8 has the same state, confidence and last-verified time.

3.  Confirming an edge on Screen 8 updates Screen 2 and Home graph health immediately.

4.  Conflicting claims are shown together with precedence; none is hidden or overwritten.

5.  The entity-type filter is generated from data, not hard-coded.

### 9. Workload Profile

| **Screen ID and route** | S9 · /estate/workloads/:id |
|----|----|
| **The one question it answers** | What is this application’s contract and history? |
| **Primary users** | Application Owner, QA Lead, Risk Approver, Platform Engineer, Audit. |
| **Reached from** | Any application name link, Screen 8, Screen 2, Screen 5. |
| **Leads to** | Screen 2 or 7 of events that touched it; Screen 10 for related memory. |
| **Data consumed** | Workload, Behavioural contract (20 fields), Edge, Test, Result history, Incident, ContractProposal. |
| **Build tier** | B. Navigable and seeded; contract proposals are live. |

#### Purpose and design intent

The Workload Profile is the one place where everything about an application meets: who owns it, how risky it is, the behavioural contract that defines acceptable behaviour, what it depends on, which tests protect it, and what has happened to it.

The contract is shown as readable fields grouped by purpose, not as raw JSON, because owners must be able to read and approve it.

#### Layout wireframe (desktop 1440 px wide; content area inside the global shell)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Claims Policy Assistant . RAG . Owner: Asha Rao . |||o High . Contract v3  [ Propose change ]    │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [Contract]  [Dependencies]  [Tests]  [History]  [Incidents]                                      │
├────────────────────────────────────────────────────────────────┬─────────────────────────────────┤
│ PURPOSE AND ROLE                                               │ PENDING PROPOSALS (1)           │
│ Answers policy questions only from approved sources.           │                                 │
│                                                                │ v3 to v4 (from Memory)          │
│ ALLOWED BEHAVIOUR                                              │ Add test: every citation        │
│ In: question plus retrieved context. Out: cited answer.        │ resolves to an approved         │
│ Tools: none that write. Prohibited: external web calls.        │ source                          │
│                                                                │ [ Review ]                      │
│ EVIDENCE AND THRESHOLDS                                        │                                 │
│ Must cite a valid source. Abstain if evidence is weak.         │ OWNERS                          │
│ Groundedness limit 0.85. Latency p95 900 ms.                   │ Asha Rao (App owner)            │
│                                                                │ Daniel Okafor (Data)            │
│ APPROVAL AND ROLLBACK                                          │                                 │
│ Shadow, then canary after owner and data owner approve.        │                                 │
│ Roll back on bad citation, access breach or low groundedness.  │                                 │
└────────────────────────────────────────────────────────────────┴─────────────────────────────────┘
```

#### Zones, grid and content

| **Zone** | **Grid and size** | **Contents and behaviour** |
|----|----|----|
| Profile header | 12 col, 80 px | Name, workload type (one of 12), owner, RiskMeter, environment, contract version, last event. Primary action: “Propose contract change” (owner or Platform Engineer). |
| Tabs | 12 col, 48 px | Contract, Dependencies, Tests, History, Incidents. Tab choice is stored in the URL. |
| Contract tab | 8 of 12 col | The 20 contract fields grouped under Purpose and role, Allowed behaviour, Evidence and thresholds, Approval and rollback. Each field has a plain label, the value, and a version marker. A “Show as JSON” toggle is available for experts, collapsed by default. |
| Right rail | 4 of 12 col | Pending contract proposals (with diff), owners and approvers, and links to related events and memory patterns. |
| Dependencies tab | 12 col | A table of edges: target, relationship, evidence class, confidence, last verified, state. A mini graph beside it. |
| Tests tab | 12 col | Mapped tests by severity, critical-pack marked with a lock, coverage notes, and generated tests with their status. |
| History tab | 12 col | Events that touched this workload with outcome, approvals and rollbacks, each linking to its Record. |
| Incidents tab | 12 col | Linked incidents with severity and affected dependency. |

#### Components used

- RiskMeter, DataTable, StatusChip, ProvenanceTag, DependencyGraph (mini), Timeline (History), EvidenceDrawer, EmptyState.

#### Interactions and flows

1.  Changing tab keeps scroll position per tab and updates ?tab=.

2.  **Propose contract change** opens a form with the changed fields and a required reason; submitting creates a ContractProposal (pending) visible to owners and approvers; it never edits the live contract.

3.  **Review** on a pending proposal shows a field-by-field diff; the owner approves or rejects. Approval increments the contract version and writes a Record entry.

4.  Contract thresholds that drive Rollout are labelled “Used by Rollout Monitor” and are read-only here except through a proposal.

#### State design

| **State** | **What the user sees and can do** |
|----|----|
| Empty | No contract yet: “This application has no behavioural contract. Evergreen cannot reduce its tests safely. \[Draft contract\]” and full regression is the default. |
| Loading | Skeleton blocks. |
| Partial | Some tabs unavailable: the tab shows “Data unavailable” while others work. |
| Error | “We could not load this application. \[Retry\]”. |
| Stale | Contract older than its review date: gold chip “Review due”. |

#### Microcopy (use verbatim)

| **Where** | **Text** |
|----|----|
| No contract | This application has no behavioural contract. |
| Proposal note | A proposal does not change the live contract until the owner approves it. |
| JSON toggle | Show as JSON (for experts) |

#### Keyboard, accessibility and responsive notes

- Tabs follow the ARIA tabs pattern with arrow-key navigation.

- Contract fields use a definition list (dl) so assistive technology reads label then value.

- The diff uses text markers (Added, Removed, Changed) in addition to colour.

#### Acceptance criteria

1.  All 20 contract fields from the Schema document are present, grouped as specified, for each seeded workload.

2.  A contract proposal never alters the live contract until approved by the owner.

3.  Approving a proposal updates this screen, Screen 10 and Screen 11’s contract version list within one second.

4.  Every link from History opens the correct event Record.

### 10. Qualification Memory

| **Screen ID and route** | S10 · /memory |
|----|----|
| **The one question it answers** | What has Evergreen learned? |
| **Primary users** | Application Owner, QA Lead, Governance, Enterprise Architect. |
| **Reached from** | Left rail, Learn step toast, S3 reuse badges, S9 proposals. |
| **Leads to** | The source events (S7), Workload Profile (S9). |
| **Data consumed** | MemoryItem, ContractProposal, ChangeEvent history, Test reuse links. |
| **Build tier** | B. Seeded and navigable. Predictive items are a labelled roadmap preview. |

#### Purpose and design intent

Memory is where the product’s long-term moat becomes visible. Each closed event contributes patterns and reusable evidence; the next event draws on them. The screen shows what has been learned, where it was reused, and what is waiting for a human to approve.

Memory never changes critical controls by itself. Anything that would change a contract waits for owner approval (charter: no automatic relaxation of critical controls).

#### Layout wireframe (desktop 1440 px wide; content area inside the global shell)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Memory . learned from 4 events . 12 tests reused in the current event (illustrative)             │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [ Events retained 4 ]  [ Patterns 3 ]  [ Tests reused 12 ]  [ Proposals 2 ]   (illustrative)     │
├───────────────────────────────────────────────────────────┬──────────────────────────────────────┤
│ PATTERNS                                                  │ PROPOSALS FOR OWNER APPROVAL         │
│                                                           │                                      │
│ 1. Retirements: policy-order tests caught 2 defects       │ Claims Policy v3 to v4               │
│    Seen in E-2026-009, -011, -012   [ Open ]              │ Add citation-resolves test           │
│ 2. RAG: citation validity drops first on candidates       │ [ Review ]                           │
│ 3. Extraction: optional fields vary across versions       │ Invoice Extractor v2 to v3           │
│                                                           │ Treat optional field N as            │
│ REUSE LOG (current event)                                 │ required   [ Review ]                │
│ T-0211 reused from E-2026-012 (Refund Agent)              │                                      │
│                                                           │ ROADMAP PREVIEW                      │
│                                                           │ Predict exposure before the          │
│                                                           │ provider notice arrives              │
└───────────────────────────────────────────────────────────┴──────────────────────────────────────┘
```

#### Zones, grid and content

| **Zone** | **Grid and size** | **Contents and behaviour** |
|----|----|----|
| Summary tiles | 12 col, 96 px | Four StatTiles: events retained, patterns, tests reused, proposals pending. Every tile carries “illustrative” or “measured”. |
| Patterns | 7 of 12 col | Cards describing recurring findings across events with source events, severity of what was caught, and “Open” to see the supporting cases. |
| Reuse log | 7 of 12 col | Table of tests and evidence reused in the current event, source event, and effort avoided (labelled). |
| Proposals queue | 5 of 12 col | Contract-change proposals created by the Learn step. Each can be reviewed, approved or rejected only by the workload owner (and a second approver where the workload requires). |
| Roadmap preview | 5 of 12 col, ribbon | A visibly distinct card with a “Roadmap preview” ribbon showing the future predictive capability. Not interactive. |

#### Components used

- StatTile, DataTable, ProvenanceTag, StatusChip, EmptyState, GlossaryTerm.

#### Interactions and flows

1.  “Open” on a pattern shows the supporting cases and events in O1.

2.  Reuse log rows link to the source event Record and to the test in Screen 3, showing the same reuse badge.

3.  Approving or rejecting a proposal writes a Record entry and updates Screen 9 and Screen 11.

4.  When a rollout completes, new items appear with a “New” chip for 24 simulated hours.

#### State design

| **State** | **What the user sees and can do** |
|----|----|
| Empty | First run: “Memory builds as events close. After this event you will see patterns here.” |
| Loading | Skeleton tiles and rows. |
| Partial | Source event missing: the item says “Source event is archived” and keeps its summary. |
| Error | “We could not load Memory. \[Retry\]”. |

#### Microcopy (use verbatim)

| **Where** | **Text** |
|----|----|
| Reuse note | Reused from E-2026-012. The evidence is still valid for this change. |
| Proposal note | Memory can propose. Only the owner can approve. |
| Roadmap ribbon | Roadmap preview. Not part of the spike. |

#### Keyboard, accessibility and responsive notes

- Tiles and cards are headings with descriptive text; the roadmap ribbon is text, not only a colour.

- Keyboard: proposals are reachable in reading order; review dialogs trap focus and return it on close.

#### Acceptance criteria

1.  A reuse badge on Screen 3 and the Reuse log on Screen 10 show the same source event for the same test.

2.  No contract change is ever applied by Memory without an owner approval entry in the Record.

3.  The roadmap preview card is visibly labelled and not interactive.

### 11. Controls and Self-Governance

| **Screen ID and route** | S11 · /controls |
|----|----|
| **The one question it answers** | What rules bind the system, including itself? |
| **Primary users** | Governance and Audit, Risk Approver, Security, Platform Engineer, Enterprise Architect. |
| **Reached from** | Left rail, Kernel verdict links, rule IDs anywhere. |
| **Leads to** | Source events where a rule fired (S7), Workload Profile (S9). |
| **Data consumed** | Kernel rules and hit counts, Approval matrix, Thresholds, Evergreen candidate versions, recent Approvals. |
| **Build tier** | B. Read-only and seeded. |

#### Purpose and design intent

Controls makes the system’s governance visible and checkable. It lists the rules the Trusted Kernel enforces, the thresholds and approval authority per risk class, the hard stops, and Evergreen’s own versions. Its most important message is the rule that Evergreen cannot approve itself.

Everything here is read-only: the page exists so people can see the rules, not change them. A rule change is a governed decision outside the UI.

#### Layout wireframe (desktop 1440 px wide; content area inside the global shell)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Controls . Trusted Kernel v1.4 (deterministic only) . Last independent review: 02 Sep 2026 [P]   │
├────────────────────────────────────────────────────────┬─────────────────────────────────────────┤
│ KERNEL ELEMENTS (8)         Change control  Hits       │ SELF-GOVERNANCE                         │
│ Behavioural contracts       Owner review    0          │                                         │
│ Deterministic orchestration Signed release  0          │ Evergreen is a workload.                │
│ Fixed critical test packs   Test authority  0          │ Planner: Planner-1 (pinned)             │
│ Provider adapters           Contract tests  0          │ Judge: Judge-1 (independent)            │
│ Policy enforcement          Security / gov. 1 K-014    │ Candidate: Evergreen 0.9.2              │
│ Human approval              Duty separation 0          │ Qualifying: 5 of 7 checks               │
│ Evidence integrity          Write once      0          │                                         │
│ Rollback controls           SRE runbook     1          │ Evergreen cannot approve its            │
│                                                        │ own promotion. One level only.          │
│ HARD STOPS (7) [ View ]   APPROVAL MATRIX [ View ]     │                                         │
│                                                        │ RECENT APPROVALS (3)                    │
└────────────────────────────────────────────────────────┴─────────────────────────────────────────┘
```

#### Zones, grid and content

| **Zone** | **Grid and size** | **Contents and behaviour** |
|----|----|----|
| Kernel elements | 7 of 12 col | A table of the eight Kernel elements with responsibility, change-control owner and hit counts for the open event. A row with a hit links to its rule detail and source event. |
| Rules and hard stops | 7 of 12 col | Rule IDs, plain-language text, the stage they apply to, and the outcome (Deny, Hold, Escalate). Hard stops listed exactly as in the charter (seven). |
| Approval matrix and thresholds | 7 of 12 col | Approval authority per workload type (from the risk matrix), expiry per risk tier \[P\], and which roles can sign. |
| Self-governance panel | 5 of 12 col | Evergreen registered as a workload: planner model, judge model, instructions, policies, adapters, release version; the candidate version and its qualification progress; the one-level recursion rule stated in words; recent approvals. |

#### Components used

- DataTable, StatusChip, KernelVerdict, ProvenanceTag, HashChip, SandboxBadge, GlossaryTerm.

#### Interactions and flows

1.  Selecting a rule opens its detail: ID, text, owner, last change, hits and the events where it fired.

2.  Selecting the candidate Evergreen version shows the independent evaluator set that is qualifying it and states “The candidate cannot be its own judge.”

3.  Recent approvals link to their Record entries.

4.  A change history shows who last changed each rule and when; there is no edit control.

#### State design

| **State** | **What the user sees and can do** |
|----|----|
| Empty | Not applicable: rules always exist. If the rule set cannot load, show the error state. |
| Loading | Skeleton table. |
| Error | “We could not load the rule set. Promotions stay blocked until it loads. \[Retry\]”. Fail closed. |
| Hard stop | If the Kernel is unreachable, show O4 and state that promotions are blocked. |

#### Microcopy (use verbatim)

| **Where** | **Text** |
|----|----|
| Self rule | AI Evergreen can qualify itself. It cannot mark its own work or approve its own promotion. |
| Read only | These rules are read-only here. Changes follow the governed process and appear in the Record. |
| Recursion | Validation is limited to one level: the approved Evergreen qualifies the candidate, and the candidate cannot start another qualification. |

#### Keyboard, accessibility and responsive notes

- Tables use captions and row headers; hit counts have text labels, not only icons.

- The self-governance rule is plain text in a visible region, not a tooltip.

#### Acceptance criteria

1.  Every one of the eight Kernel elements and seven hard stops from the charter is displayed.

2.  No control on this screen can edit a rule or approve anything.

3.  The self-approval rule is visible without hovering.

4.  Rule IDs shown on Screen 5 link to the matching rule here.

### 12. Portfolio and Horizon

| **Screen ID and route** | S12 · /portfolio |
|----|----|
| **The one question it answers** | Where is our AI technical debt and what retires next? |
| **Primary users** | CIO / CTO, Enterprise Architect, Platform leadership. |
| **Reached from** | Left rail (Roadmap group), Home horizon card. |
| **Leads to** | Screen 8 (Estate) filtered to the selected model; Screen 1. |
| **Data consumed** | Model lifecycle seed, application counts, technical-debt seed, adoption metrics (all illustrative). |
| **Build tier** | B. Roadmap preview only. Must carry a persistent preview ribbon. |

#### Purpose and design intent

The Portfolio is the executive view: when models retire, how many applications each retirement touches, and where AI technical debt (deprecated models, stale agents, unsupported tools) is accumulating. It points to the roadmap (predictive change intelligence, AI technical debt management) without claiming those capabilities exist in the spike.

#### Layout wireframe (desktop 1440 px wide; content area inside the global shell)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Portfolio and Horizon      [ ROADMAP PREVIEW . illustrative data ]                               │
├──────────────────────────────────────────────────────────┬───────────────────────────────────────┤
│ MODEL LIFECYCLE (next 12 months)                         │ AI TECHNICAL DEBT (illustrative)      │
│                                                          │                                       │
│ Atlas-1  |=====|!| retires in 14 d        6 apps         │ Deprecated models in use: 3           │
│ Orion-2  |==========>  price change in 9 d  3 apps       │ Stale agents (90 d): 4                │
│ Nova-3   |======================>  supported  2 apps     │ Unsupported tools: 2                  │
│ Atlas-0  |x| already retired             1 orphan        │ Orphaned workloads: 1                 │
│          Jan  Mar  May  Jul  Sep  Nov                    │                                       │
│                                                          │ ADOPTION SPEED                        │
│                                                          │ Median change to decision: 4h         │
├──────────────────────────────────────────────────────────┴───────────────────────────────────────┤
│ ROADMAP: 1 Model change (now) > 2 Agent change > 3 AI tech debt > 4 Predictive > 5 Autonomous    │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Zones, grid and content

| **Zone** | **Grid and size** | **Contents and behaviour** |
|----|----|----|
| Preview ribbon | 12 col, 32 px, sticky | “Roadmap preview. Illustrative data. Not part of the spike.” Always visible. |
| Model lifecycle timeline | 7 of 12 col | A horizontal timeline of models with milestones (support end, price or policy change), a “today” marker and the count of dependent applications. Clicking a row opens Estate filtered to that model. |
| Technical debt and adoption | 5 of 12 col | StatTiles for deprecated models in use, stale agents, unsupported tools, orphaned workloads, and median change-to-decision time. Each tile carries “illustrative”. |
| Roadmap strip | 12 col | The five roadmap phases from the pitch deck, with phase 1 marked “Now” and the rest “Future”. |

#### Components used

- StatTile, DataTable (list alternative to the timeline), StatusChip, EmptyState, GlossaryTerm.

#### Interactions and flows

1.  Selecting a timeline row opens Screen 8 with that model as focus.

2.  A list/timeline toggle gives an accessible, sortable table of the same data.

3.  Tiles link to the underlying Estate filter (for example orphans).

#### State design

| **State** | **What the user sees and can do** |
|----|----|
| Empty | “No lifecycle data yet. Connect provider notices to see what retires next.” (roadmap preview). |
| Loading | Skeleton tiles and timeline rows. |
| Error | “We could not load the portfolio. \[Retry\]”. |

#### Microcopy (use verbatim)

| **Where** | **Text** |
|----|----|
| Ribbon | Roadmap preview. Illustrative data. Not part of the spike. |
| Tile tag | illustrative |
| Roadmap phase 4 | Predictive change intelligence (future) |

#### Keyboard, accessibility and responsive notes

- The timeline has a table alternative reachable by a visible toggle; each bar has text labels.

- No information is conveyed by bar colour alone.

#### Acceptance criteria

1.  The roadmap ribbon is visible on scroll and cannot be dismissed.

2.  Every number is tagged illustrative.

3.  No control on this screen implies that predictive capability already works.

## 11. Overlays

Overlays never replace screens; they interrupt them for a specific, bounded purpose. Each traps focus, closes with Esc (except O4), returns focus to its trigger, and pushes a history entry so the browser Back button closes it.

### O1. Test rationale drawer

| **Opened from** | Reason chip, test name, “Why” links, missing-test Review, judge disagreement. |
|---|---|
| **Form** | Right drawer 440 px, scrim not required (non-modal) so the page stays readable. |
| **Contents** | • Headline: the decision in one sentence (“Excluded: duplicate of T-0211”).<br>• Summary: plain-language reason and the rule or model that produced it, with ProvenanceTag.<br>• Evidence: source, evidence class, confidence, last verified, linked cases.<br>• Raw data: collapsed by default (JSON). |
| **Modes** | Read, Review (missing tests: shows the declarative test, Approve and Reject with reason), Compare (judge disagreement: two scores and rationales). |
| **Close** | Esc, close button, click outside. Focus returns to the trigger. |

### O2. Approval confirmation modal

The signature moment. Friction scales with the highest risk tier in the scope; the modal is never skipped and never pre-filled.

| **Risk tier in scope** | **What the approver must do** | **Approval expiry \[P\]** |
|----|----|----|
| Low | Read the summary and press Sign. | 24 hours |
| Medium | Read the summary and press Sign. | 12 hours |
| High | Enter a written rationale (minimum 20 characters) and press Sign. | 8 hours |
| Critical | Type the application name, enter a written rationale, re-verify identity, then press Sign. | 4 hours |

| **Element** | **Specification** |
|----|----|
| Header | “Approve \[n\] applications”. Names each application, its treatment and the Kernel Permit result. |
| Summary | What will happen (rollout ladder), what is excluded, uncertainty carried, and the expiry time. |
| Identity | Named identity, role and time. Identity re-verification uses the organisation’s sign-in (single sign-on or passkey) and must not require remembering or transcribing a code (WCAG 3.3.8). |
| Separation of duties | Check result shown. If failed, Sign is disabled with the reason. |
| Dual-confirmation variant | Used for manual rollback: requester enters a reason; a second, different person confirms in the same modal or from a notification. Both identities are stored. |
| Buttons | Primary Sign (navy; for rollback, red Roll back), secondary Cancel. Focus starts on the first required field, not on Sign. |
| After signing | The modal closes, cards update, a Toast confirms, and the Record gains an entry. The Toast offers no Undo; corrections are new, linked decisions. |

### O3. Manual event entry

| **Field** | **Rule** |
|----|----|
| Change kind | Required. Retirement, upgrade, price change, policy change, API change, availability. |
| Model or component | Required. Searchable list of models in the estate; unknown values allowed with a warning “Not in the estate. Evergreen will discover dependencies from available evidence.” |
| Provider | Required. |
| Effective date | Required for retirement and price change. |
| Source link or note | Required: where did this information come from? (charter: external text is untrusted; a source is mandatory). |
| Confidence | Defaults to 0.70 for manual entries \[P\] with the note “Manual entries start with lower confidence.” |
| Submit | Creates the event, starts discovery, writes a Record entry, shows a Toast and opens Blast Radius. |

### O4. Hard-stop interstitial

The strongest interruption in the product. It exists for conditions the charter defines as hard stops or for loss of integrity, and it must be unmistakable and calm.

| **Aspect** | **Specification** |
|---|---|
| Triggers | Kernel Deny on a promotion path; evidence integrity failure; Kernel unavailable; rollback failed; critical edge missing from a plan; any condition listed in the Controls hard-stop list. |
| Look | Covers the content area (not the shell) on a navy-deep background with a red header bar and the heading “Hard stop”. White text on navy-deep and white on red both pass contrast. |
| Content | • What happened, in one sentence.<br>• Rule that fired (ID, text) with a link to Controls.<br>• What is safe: for example “No traffic has changed” or “Last-known-good is serving”.<br>• What to do next: a numbered list, including the break-glass runbook if applicable. |
| Actions | “Acknowledge” (records who saw it) and “View record”. There is no “Continue anyway”. Navigation away is allowed; the hard stop remains pinned in Home and notifications until resolved. |
| Focus | Focus moves to the heading; Esc does not dismiss. Screen readers announce it as an alert dialog. |

### O5. Glossary popover and panel

| **Aspect** | **Specification** |
|----|----|
| Trigger | Any GlossaryTerm (dotted underline) on hover, focus or tap; Help menu opens the full panel. |
| Popover | Term, one-sentence definition, “Open glossary” link. Dismiss with Esc or by moving away. |
| Panel | Alphabetical list of the 20 charter terms (section 14) with search. Each definition is verbatim from the charter. |

## 12. State design across the product

This is where most prototypes look unfinished. Every screen must implement every state below that applies to it. The patterns here are the shared rules; each screen section adds specifics.

| **State** | **Pattern** | **Rule** |
|----|----|----|
| Empty | EmptyState: 24 px icon, one sentence saying why it is empty, one action. | Never “No data”. Say what will fill it and how. |
| Loading | SkeletonBlock matching final shape after 200 ms; progress text for long operations (“Running 61 of 134 tests”). | No spinner-only screens. Reserve layout space to prevent jumps. |
| Partial | Usable content plus a gold banner naming what is missing and the safe consequence. | Incomplete data must make the system more cautious, never less (include uncertain critical workloads). |
| Error | Plain message: what failed, what is safe, what to do. “Retry” plus a safe fallback. | No codes or stack traces. Offer the full-regression fallback where scope reduction is affected. |
| Stale | Gold clock chips and banner; autonomous scope reduction paused. | Charter degraded mode: stale graph or test source blocks autonomous reduction. |
| Offline | Banner “You are offline. Decisions cannot be signed.”; read-only data from cache labelled Cached. | Approvals and rollbacks never work offline. |
| Permission denied | Control visible but disabled with a reason; direct URLs show “You do not have access to this action”. | Never hide the process; always explain who can act. |
| Hard stop | Overlay O4. | Fail closed. No bypass. |
| Expired | Struck-through with “Expired” and a link to the successor action. | An expired approval never moves traffic. |
| Inconclusive | Grey question mark chip “Inconclusive”. | Never counts as a pass. |
| Success | Toast for minor actions; inline banner for gate clearance. Decisions always go to the Record. | A Toast is never the only evidence of a decision. |

### State coverage matrix

X = must be implemented and tested. Dash = not applicable.

| **Screen** | **Empty** | **Loading** | **Partial** | **Error** | **Stale** | **Hard stop** | **Perm. denied** |
|----|----|----|----|----|----|----|----|
| S1 Command Center | X | X | X | X | X | X | X |
| S2 Blast Radius | X | X | X | X | X | – | X |
| S3 Regression Plan | X | X | X | X | X | X | X |
| S4 Results | X | X | X | X | X | X | X |
| S5 Decision | X | X | X | X | X | X | X |
| S6 Rollout | X | X | X | X | X | X | X |
| S7 Record | X | X | X | X | – | X | X |
| S8 Estate | X | X | X | X | X | – | X |
| S9 Workload | X | X | X | X | X | – | X |
| S10 Memory | X | X | X | X | – | – | X |
| S11 Controls | – | X | – | X | – | X | X |
| S12 Portfolio | X | X | – | X | – | – | X |

## 13. Content design and microcopy

### 13.1 Voice and tone

| **Quality** | **Means** | **Example** |
|----|----|----|
| Plain | Short sentences, everyday words, no jargon without a glossary link. | “Candidate skipped the policy check.” not “Trajectory invariant violation detected.” |
| Candid | State what is known and unknown. No reassurance without evidence. | “Confidence is low. Two judges disagree.” |
| Calm | No alarm words except for real hard stops. No exclamation marks. | “Rolled back automatically. Last-known-good is healthy.” |
| Accountable | Name the person and the time for decisions. | “Approved by Asha Rao at 10:21.” |
| Consistent | One term per concept (section 14). | Always “blast radius”, never “impact zone”. |

### 13.2 Patterns

| **Pattern** | **Formula** | **Example** |
|----|----|----|
| Why text | Decision, because evidence, source. | “Block, because the candidate skipped the policy check. Source: deterministic trajectory rule K-014.” |
| Error | What failed. What is safe. What to do. | “We could not read the graph. No scope was reduced. \[Retry\] \[Use full regression\]”. |
| Disabled control tooltip | Who can do this or what must happen first. | “Locked until the critical edge is confirmed or overridden.” |
| Confirmation | What will happen, scope, what is not affected. | “Approve 2 applications. Rollout starts in shadow. Nothing else changes.” |
| Empty state | Why empty, how it fills, one action. | “No open changes. Last event closed 3 days ago. \[View Memory\]”. |
| Numbers | Always with unit and label; add “illustrative” or “measured”. | “134 of 480 tests (illustrative)”. |
| Dates and times | Local time with zone; hover shows UTC; relative time for under 24 hours. | “Today 10:21 IST” with hover “04:51 UTC”. |

### 13.3 Words and claims that must not appear

> **HARD STOP**
>
> Do not use: “guarantee”, “certified”, “compliant”, “legally compliant”, “equivalent”, “zero risk”, “fully autonomous”, “AI approved”.
>
> Reasons: the charter states AI Evergreen does not certify legal compliance, gives no guarantee of behavioural equivalence, and never approves promotion by itself.
>
> Use instead: “evidence supports”, “no known gaps (not a guarantee)”, “recommended”, “approved by [name]”.

### 13.4 Fixed labels

| **Concept** | **Label** | **Never use** |
|----|----|----|
| Affected set | Blast radius | Impact zone, footprint |
| Critical tests that cannot be excluded | Critical pack | Golden set, must-run list |
| Safe restore point | Last-known-good (LKG) | Backup, snapshot (Estate uses “snapshot” only for graph versions) |
| Acceptance boundary for a workload | Behavioural contract | Policy file, spec |
| Evidence for a decision | Qualification evidence record | Audit log |
| Moving to the candidate | Promotion | Release, go-live |
| Deterministic gate | Trusted Kernel | Guardrail, safety layer |
| Four outcomes | Migrate, Canary, Investigate, Block | Approve, Hold, Pass, Fail (those describe human actions or test results, not treatments) |

## 14. Glossary (charter section 1.3)

These twenty definitions are reproduced from the charter glossary and power the GlossaryTerm component. Use them verbatim.

| **Term** | **Definition** |
|----|----|
| AI Evergreen | The provider-neutral intelligence and orchestration layer that coordinates enterprise qualification when an AI dependency changes. |
| AI Change Impact Agent | The principal autonomous component that discovers affected workloads, plans proportionate evidence and recommends treatment. |
| AI Dependency Graph | Versioned graph linking business processes, applications, AI components, models, tests, owners, environments and evidence. |
| Model change event | A release, retirement, deprecation, API shift, pricing change, policy change or availability event affecting a model dependency. |
| Behavioural contract | Provider-neutral, versioned statement of intended purpose, allowed behaviour, evidence, thresholds and rollback rules for a workload. |
| Qualification | Collection and assessment of evidence needed to decide whether a candidate change is acceptable for a defined workload. |
| Regression scope | The tests, traces, invariants and evaluations required for a specific change and workload. |
| Golden dataset | Curated, versioned examples with trusted outputs or grading criteria. |
| Production trace replay | Controlled execution of representative, sanitized historical interactions against current and candidate configurations. |
| Differential evaluation | Comparison of current and candidate behaviour under equivalent inputs and controlled settings. |
| Deterministic evaluator | Rule-based evaluator with reproducible outcomes, such as schema, policy, field, tool or threshold checks. |
| Probabilistic evaluator | Statistical or model-based evaluator for semantic, qualitative or open-ended behaviour. |
| Agent trajectory | The sequence of plans, model calls, tool calls, observations, retries and decisions taken to reach an outcome. |
| Shadow deployment | Candidate receives mirrored traffic but cannot affect the user or business system. |
| Canary deployment | Candidate receives a controlled subset of live or simulated traffic under monitored thresholds. |
| Promotion | Authorized change making a candidate configuration the active production configuration. |
| Rollback | Restoration of a defined last-known-good configuration after a breach or failure. |
| Trusted kernel | Small deterministic control layer enforcing policies, evidence integrity, approval and rollback independently of changeable models. |
| Last-known-good release | Previously approved configuration retained for deterministic restoration. |
| Qualification evidence record | Immutable or tamper-evident record of scope, execution, results, uncertainty, approvals, deployment and rollback events. |

## 15. Accessibility (WCAG 2.2 AA)

Accessibility is a release criterion, not a polish item. The product makes safety decisions, so every user must be able to understand and make them.

### 15.1 Requirements checklist

| **WCAG criterion** | **Requirement in this product** |
|----|----|
| 1.1.1 Non-text content | Every icon has a text alternative or is hidden as decorative; the graph and charts have text summaries and data tables. |
| 1.3.1 Info and relationships | Real headings, lists, tables with headers and captions, dl for contract fields, landmarks. |
| 1.4.1 Use of colour | Status uses icon, shape and word in addition to colour (section 5.2). |
| 1.4.3 Contrast (minimum) | Text 4.5:1 or better using the allowed tokens in section 5.1; slate-soft and gold are never used for text. |
| 1.4.10 Reflow; 1.4.4 Resize | No horizontal scrolling at 320 px width for text content and at 200 % zoom; tables scroll inside their own region. |
| 1.4.11 Non-text contrast | Control borders use border-strong (4.5:1); focus ring 3:1 minimum; chart lines and threshold bands 3:1. |
| 2.1.1 Keyboard; 2.1.2 No trap | Everything operable by keyboard; modals trap focus and always have an exit (except O4, which still has Acknowledge). |
| 2.4.3 Focus order; 2.4.7 Focus visible | Logical order; visible 2 px focus ring with offset on every interactive element. |
| 2.4.11 Focus not obscured | Sticky headers and the sticky approval panel must never cover the focused element; use scroll padding equal to header heights. |
| 2.5.8 Target size (minimum) | 24 × 24 px minimum; 44 × 44 px on touch. |
| 3.2.6 Consistent help | Help and glossary are in the same place on every screen (identity menu and ? button). |
| 3.3.1, 3.3.3 Error identification and suggestion | Errors state what is wrong and how to fix it, next to the field. |
| 3.3.7 Redundant entry | Do not make the user re-enter information already provided in the same event (for example rationale carries into the Record). |
| 3.3.8 Accessible authentication | Identity re-verification uses single sign-on or passkey; no cognitive tests or transcription of codes. |
| 4.1.2 Name, role, value; 4.1.3 Status messages | ARIA used correctly; toasts, gate changes and rollout alerts announced through live regions (polite by default, assertive only for rollback and hard stop). |

### 15.2 Keyboard map

| **Keys** | **Action** | **Scope** |
|----|----|----|
| Ctrl or Cmd + K | Open command palette | Everywhere |
| G then H, E, S, M, C | Go to Home, Events, Estate, Memory, Controls | Everywhere (two-key sequence; disabled in text fields) |
| J / K or Down / Up | Move to next or previous row or card | Lists and tables |
| Enter | Open the selected item | Lists and tables |
| Space | Toggle selection (never on locked critical rows) | Lists with selection |
| Left / Right | Previous or next stage | Stage stepper when focused |
| C and O | Confirm or Override the selected edge (focus must be on an edge row; Override opens a form, Confirm asks once) | Screen 2 list |
| Esc | Close the topmost overlay or drawer | Everywhere except O4 |
| ? | Show keyboard shortcuts | Everywhere |

> **DESIGN RULE**
>
> No single-key shortcut may perform an irreversible or safety-relevant action. Approve, Reject, Hold, Roll back and Restore always require visiting a button and passing through O2.

### 15.3 Testing requirements

1.  Automated: axe-core on every screen state in CI; zero serious or critical violations.

2.  Manual: keyboard-only pass of each demo step; screen reader pass (NVDA with Firefox or Chrome, VoiceOver with Safari) of screens 2, 5, 6 and 7.

3.  Visual: grayscale and colour-blind simulations (deuteranopia, protanopia, tritanopia) of the heatmap, status chips and graph edges.

4.  Zoom and reflow: 200 % and 400 % browser zoom, and 320 px width for text content.

5.  Motion: reduced-motion preference on; confirm no information relies on animation.

## 16. Performance and responsive rules

| **Area** | **Rule** |
|----|----|
| First render | Interactive within 2 seconds on a typical laptop with seed data. |
| Interaction | Responses under 100 ms for selection and filtering; under 300 ms for drawer and modal opening. |
| Graph | Maximum 60 nodes rendered; beyond that, cluster with counts. Layout computed once per focus change. Pause animation when the tab is hidden. |
| Tables | Virtualise beyond 100 rows; never render more than about 60 DOM rows at once. Sort and filter on the store, not the DOM. |
| Charts | Maximum 600 points per series; downsample older data. Update at most once per second. |
| Live updates | Batch store updates per animation frame; announce to assistive technology no more than every 5 seconds. |
| Bundle | Split by route; the graph and charts load only on screens that need them; target under 300 KB of script on the first route (compressed). |
| Images and icons | Icons as inline SVG from one sprite; no raster images required. |
| Responsive | See section 5.4. Desktop-first; tablet read and decide; mobile approver quick view only. |
| Resilience | Every list handles 0, 1, 10 and 10,000 items without layout breakage (tested with synthetic extremes). |

## 17. Demo Director mode and seed scenario

The demo is part of the product. A jury sees a story in about ten minutes; the interface must make that story easy to tell, repeat and recover from.

### 17.1 Demo Director specification

| **Element** | **Specification** |
|----|----|
| Launcher | A small “Demo” button in the identity menu and the key combination Ctrl+Alt+D. Demo builds only. A dark navy-deep side panel (320 px) slides in from the right and can be collapsed to a thin tab. |
| Script panel | Shows the current step number, the sentence the presenter says, the exact action to take and the expected result, with Previous and Next buttons. “Highlight target” draws a pulsing outline (single pulse under reduced motion) on the next control. |
| Role switcher | Switch between the eight synthetic identities without logging out. Shows “Synthetic user”. |
| Clock control | Simulated clock: pause, step (+1 min), speed (1×, 5×, 30×). All timers in the product follow this clock. |
| Failure injections | Buttons that trigger the failures listed below; each writes a clearly marked “Injected for demo” entry to the Record. |
| Reset | “Reset scenario” restores seed and returns to Home in under 1 second. Requires a single confirm. |
| Safety | Demo Director cannot approve anything, bypass a gate, or alter the Kernel. It can only move the clock, switch identity, inject failures and reset. |

> **HARD STOP**
>
> The Record must mark every injected event as “Injected for demo”. The demo must never present injected failures as real incidents.

### 17.2 Ten-minute demo script

| **\#** | **Screen** | **Presenter says** | **Action** | **Expected result** |
|----|----|----|----|----|
| 1 | S1 | One model, Atlas-1, retires in 14 days. Today each team would start its own project. | Open the Atlas-1 card. | Event opens at Blast Radius. |
| 2 | S2 | Evergreen finds exactly who is affected: six applications, and two that are only connected. | Watch discovery; toggle “connected, not affected”. | Six affected, two hollow nodes. |
| 3 | S2 | It will not guess on a critical path. One edge needs a human. | Switch to Ravi Kulkarni; Confirm the Refund edge; Continue to Plan. | G1 clears; Plan unlocks; Record entry. |
| 4 | S3 | 134 of 480 tests, and every exclusion has a reason. Critical tests are locked. | Open an exclusion reason; hover a lock; open the missing test. | O1 shows reason; lock tooltip; proposed test card. |
| 5 | S3 | It found a test nobody had written: the policy check must come first. | As Marcus Lee: approve the new test; Approve plan. | G2 clears; Results unlocks. |
| 6 | S4 | The candidate’s final answer is identical, but it skipped the policy check. Trajectory fails. | Open the Refund Agent trajectory cell. | Dashed missing step; row outlined. |
| 7 | S5 | Four outcomes across six applications. The Kernel denies Refund; it cannot be approved by anyone. | Show Block, Investigate, Canary, Migrate; open “What we do not know”. | Kernel: Deny; no approve control. |
| 8 | S5 | Named humans sign, with friction that matches risk. | As Asha Rao sign Ticket Summariser; as Daniel Okafor co-sign Claims; as Marcus Lee sign Invoice and Triage. | Approvals recorded; rollouts queued. |
| 9 | S6 | Canary runs inside pre-approved limits. Now a failure. | Inject “Canary degrades”. | Auto rollback; red banner; recovery about 2m 14s. |
| 10 | S7 | Everything is provable and reproducible. | Open Record; verify integrity; Reproduce. | Integrity verified; reproduced 6 of 6. |
| 11 | S10, S9 | What we learned becomes memory. The owner approves it. | Open Memory; review a proposal as the owner. | Contract version increments. |
| 12 | S11, S12 | Evergreen governs itself, and this is where it goes next. | Open Controls then Portfolio. | Self-governance rule; roadmap preview ribbon. |

### 17.3 Failure injections

| **Injection** | **Effect** | **What it demonstrates** |
|----|----|----|
| Stale graph | Edges age past threshold; freshness pill turns gold | Degraded mode: no autonomous scope reduction; full regression recommended. |
| Connector outage | Two discovery sources time out | Partial state: uncertain workloads included to be safe. |
| Judge disagreement | Two judges split on a case | Inconclusive, human review, recommendation moves to Investigate. |
| Approval expires | Approval passes its expiry before rollout | Fails closed; new approval required. |
| Canary degrades | Groundedness drops below its limit | Automatic rollback within pre-authorised policy. |
| Rollback fails | LKG not healthy within 2 minutes | Hard stop O4 and the break-glass runbook. |
| Evidence integrity fails | One entry’s hash mismatches | Hard stop O4 and untrusted record. |
| Kernel unavailable | Kernel cannot be reached | Fail closed; promotions blocked. |

### 17.4 Seed data: the Atlas-1 retirement scenario

All names are synthetic. “Atlas-1” and “Atlas-2” are fictional model names; do not use real vendor model names. Seed files are deterministic JSON. Seed contracts are demo-specific and need not match the sample contracts in the Schema document.

> **HARD STOP**
>
> These numbers are synthetic and illustrative. They exist so the demo is concrete and repeatable. Never describe them as measured results or as evidence that the product reduces tests by any percentage.

#### Models

| **Model** | **Role** | **Status** |
|----|----|----|
| Atlas-1 v1 | Current (Provider A) | Retires in 14 days |
| Atlas-2 | Candidate (Provider A) | Available |
| Orion-2 | Alternative (Provider B) | Price change in 9 days |
| Nova-3 | Alternative (Provider C) | Supported |
| Atlas-0 | Legacy | Already retired; one orphan application still references it |

#### Affected applications (6) and their outcomes

| **Application** | **Workload type** | **Risk** | **Tests selected / total** | **Outcome** | **Conf.** | **Kernel** | **Approvers** |
|----|----|----|----|----|----|----|----|
| Refund Agent | Tool-using agent | Critical | 52 / 140 | Block | 0.62 | Deny K-014 | Acknowledge: Asha Rao, Priya Menon |
| Customer Chat Assistant | Customer conversational AI | High | 22 / 90 | Investigate | 0.58 | Permit | Asha Rao (CX owner) |
| Claims Policy Assistant | RAG | High | 34 / 110 | Canary | 0.88 | Permit | Asha Rao + Daniel Okafor |
| Invoice Field Extractor | Extraction | High | 12 / 60 | Canary | 0.84 | Permit | Marcus Lee |
| Ticket Summariser | Summarisation | Medium | 8 / 45 | Migrate | 0.97 | Permit | Asha Rao |
| Support Triage Classifier | Classification | Medium | 6 / 35 | Migrate | 0.95 | Permit | Marcus Lee |

Totals: 134 of 480 tests selected (illustrative). Outcome mix: Migrate 2, Canary 2, Investigate 1, Block 1. Connected, not affected (2): Knowledge Search Widget (uses Atlas-1 only as a fallback with no calls in 90 days) and HR Policy Bot (configuration declares Atlas-0, a retired model; shown as an orphan reference).

#### Result matrix (matches Screen 4)

| **Application** | **Determ.** | **Schema** | **Semantic** | **Safety** | **Tool use** | **Trajectory** | **Cost** | **Latency** |
|----|----|----|----|----|----|----|----|----|
| Refund Agent | Fail | Pass | Pass | Pass | Pass | Fail | Warn | Pass |
| Claims Policy Assistant | Pass | Pass | Warn | Pass | N/A | N/A | Pass | Pass |
| Customer Chat Assistant | Pass | Pass | Warn (judges disagree) | Warn | N/A | N/A | Pass | Pass |
| Invoice Field Extractor | Pass | Warn | Pass | Pass | N/A | N/A | Pass | Pass |
| Ticket Summariser | Pass | Pass | Pass | Pass | N/A | N/A | Pass | Pass |
| Support Triage Classifier | Pass | Pass | Pass | Pass | N/A | N/A | Pass | Pass |

#### Key seeded facts

| **Item** | **Seed value** |
|----|----|
| Unresolved critical edge | Refund Agent to Policy Tool to Fallback model, class LLM-inferred, confidence 0.62, last verified 2 days ago. Must be confirmed or overridden to pass G1. |
| Proposed missing tests | \(1\) Refund Agent: policy check must precede the refund call (trajectory), high severity. (2) Customer Chat Assistant: refusal wording shift, high severity, left pending SME review so the app stays Investigate. |
| Reason codes used | NOT_AFFECTED, DUPLICATE, OBSOLETE, COVERED_BY_PINNED_EVIDENCE, LOW_RISK_REDUNDANT, plus CRITICAL_PACK for included critical tests. |
| Kernel rule hit | K-014: a required policy check must precede any refund action. Fires for Refund Agent. |
| Canary degradation (injection) | Claims Policy Assistant groundedness falls from 0.91 to 0.71 against a 0.85 limit at the 5 % step; automatic rollback; recovery 2m 14s. |
| Memory reuse | 12 tests reused from E-2026-012 across Refund Agent and Claims Policy Assistant (illustrative). |
| Contract proposals | Claims Policy v3 to v4: add test that every citation resolves to an approved source. Invoice Extractor v2 to v3: treat optional field N as required. |
| Other events | E-2026-013 Orion-2 price change at Plan stage with 3 apps including a Critical, Permit workload (Payment Dispute Agent) used to test critical-approval friction; E-2026-012 and E-2026-011 closed. |
| Run manifest | Seed 4821, temperature 0, Atlas-1 v1 against Atlas-2, run duration 4m 12s (simulated). |

## 18. Build plan for the builder

Build in phases. After each phase, stop and report what works, what is missing and any deviation from this document before starting the next. This keeps the connected solution coherent.

| **Phase** | **Build** | **Exit criteria** |
|----|----|----|
| 0\. Foundations | Tokens, typography, icons, the components in section 6 with all states, and a gallery page. | Gallery shows every component and state; contrast and focus verified. |
| 1\. Shell and store | Global shell, router, store with all entities, seed loader, can(), audit hash chain, simulated clock, mock API adapter. | Shell renders; seed loads; reset works in under 1 s; hash chain verifies. |
| 2\. Core path A | Screens 1, 2 and 3 with overlay O1 and O3. | Demo steps 1 to 5 run end to end; G1 and G2 enforced. |
| 3\. Core path B | Screens 4, 5, 6, 7 with O2 and O4. | Demo steps 6 to 10 run end to end; Kernel Deny and rollback work. |
| 4\. Demo Director | Script panel, role switcher, clock, injections, reset. | All eight injections work and are marked in the Record. |
| 5\. Tier B screens | Screens 8 to 12 with seeded data and O5. | All screens navigable; cross-screen effects in section 9.7 pass. |
| 6\. Hardening | States, accessibility, keyboard, performance, responsive, content review. | All tests in section 19 pass; axe has zero serious or critical violations. |

### Techathon mapping (compressed track)

| **Day** | **Build focus** |
|----|----|
| Day 1 | Phases 0 and 1; Screens 1 and 2 with seed data. |
| Day 2 | Screens 3 and 4; critical pack lock; missing test; results heatmap. |
| Day 3 | Screens 5 and 6; approval modal; Kernel Deny; rollout and automatic rollback. |
| Day 4 | Screen 7, Demo Director, polish, rehearsal; Tier B screens as stubs with seeded data. |

### Builder prompt to start the build

> **PROMPT FOR THE BUILDER**
>
> You are building AI Evergreen’s front end from the attached specification. Follow it exactly. Build phase 0 first, then stop and report. Use React, TypeScript and the tokens in section 5; do not hard-code colours. Implement one shared store and the cross-screen effects in section 9.7. Use only the synthetic seed data in section 17. Never display a number without “illustrative” or “measured”. Do not add features that are not in the specification; list any assumption you make. After each phase, list what is complete, what is missing, and any deviation.

## 19. Acceptance tests, usability testing and UX metrics

### 19.1 End-to-end acceptance tests

| **ID** | **Scenario** | **Expected result** |
|----|----|----|
| T01 | Load seed; open Home as Asha. | Two decision cards; Atlas-1 shows “Discovery in progress”. |
| T02 | Open Atlas-1; wait for discovery. | Six affected, two connected-not-affected; G1 banner for the Refund edge. |
| T03 | Try “Continue to Plan” before confirming. | Disabled with a text reason. |
| T04 | Confirm the Refund edge as Ravi. | Plan unlocks; stepper updates; Record entry; Home row updates. |
| T05 | Open Plan; open an exclusion. | O1 shows a reason code; no exclusion lacks a reason. |
| T06 | Try to toggle a critical-pack test. | Not possible by mouse, keyboard or script. |
| T07 | Approve the missing test as Marcus; approve plan. | Results unlocks; plan version hash in Record. |
| T08 | View Results. | Refund Agent shows Deterministic and Trajectory Fail with identical final answer; Chat shows judges disagree. |
| T09 | Open Decision. | Block, Investigate, Canary, Migrate present; Refund shows Kernel Deny and no approve control. |
| T10 | Try approving as a person who confirmed the edge, as sole approver. | Blocked with the separation-of-duties message. |
| T11 | Sign Ticket Summariser as Asha. | Approval recorded; rollout queued; Home queue count drops. |
| T12 | Sign Claims as Asha only. | Waiting for Daniel Okafor; item not approved until he signs. |
| T13 | Critical-friction fixture (Payment Dispute Agent). | Typed name, rationale and re-verification all required. |
| T14 | Inject “Canary degrades”. | Auto rollback; banner; recovery 5 min or less; Home and Decision reflect it. |
| T15 | Inject “Rollback fails”. | O4 with break-glass runbook. |
| T16 | Open Record; verify chain. | Verified; tamper with a seed entry in test mode raises O4. |
| T17 | Reproduce run. | Same material recommendation for 6 of 6. |
| T18 | Approve a contract proposal on Memory. | Contract version increments on Workload Profile and Controls. |
| T19 | Inject “Stale graph”. | Gold pill and banner; scope reduction paused; Plan offers full regression. |
| T20 | Reset scenario. | Back to start in under 1 s; no residue. |

### 19.2 Usability testing plan

Run five short sessions (30 minutes each) on a clickable build before freezing the design: one Application Owner, one QA Lead, one Approver, one SRE, one Architect. Use the synthetic scenario and ask them to think aloud.

| **Task** | **Success looks like** | **Watch for** |
|----|----|----|
| Find what needs you on Home. | Opens the correct event within 15 seconds. | Hesitation between queue and table. |
| Explain why a test was excluded. | Finds the reason within 20 seconds. | Not noticing the reason chip. |
| Decide on the Claims assistant. | States treatment, why and what is unknown. | Ignoring “What we do not know”. |
| Respond to a rollback. | Describes what happened and what is safe. | Confusion about whether traffic is safe. |
| Prove the decision later. | Finds the approver, time and evidence in the Record. | Not finding integrity status. |

### 19.3 UX success metrics

| **Metric** | **How measured** | **Target for the spike \[P\]** |
|----|----|----|
| Time to decision | From opening an event to signing the first approval, in a rehearsed run. | Under 4 minutes for the demo path. |
| Rationale open rate | Share of exclusions or recommendations where “Why” is opened in usability sessions. | At least 60 %. |
| Approval error rate | Wrong-scope or mis-signed approvals in sessions. | Zero. |
| Breach to rollback visible | Time from breach to the banner appearing. | Under 2 seconds. |
| Task success | Share of usability tasks completed unaided. | At least 80 %. |
| Accessibility | axe violations (serious or critical). | Zero. |

## 20. Open decisions, assumptions and traceability

### 20.1 Decisions to record

| **ID** | **Decision** | **Proposed** | **Owner** |
|----|----|----|----|
| D-007 | Front-end stack for the experience (replaces the Streamlit default for the demo). | React and TypeScript with the mock adapter; Streamlit only if the team cannot build the screens above. | Principal Architect |
| UX-01 | Confidence band cut-offs (0.90, 0.75, 0.60). | As in section 6; confirm with the Test Lead. | QA Lead |
| UX-02 | Approval expiry per risk tier (24, 12, 8, 4 hours). | As in section O2; confirm with Governance. | Risk Approver |
| UX-03 | Rollback failure window (2 minutes) and recovery target (5 minutes, from the charter threshold). | As written. | SRE |
| UX-04 | Mobile scope (approver quick view). | Optional; drop if time is short. | Product owner |
| UX-05 | Separation-of-duties rule in the approval panel. | Enabled by default. | Governance |
| UX-06 | Entity-type count: the Schema document lists 30 entity rows while its heading and traceability text say 29. | Generate filters from data; check charter section 12 and correct the document that is wrong. | Principal Architect |

### 20.2 Assumptions

- Audience: the jury and an internal Techathon review; the first release is a demonstration on a synthetic estate.

- Primary device: a laptop at 1440 × 900; the presenter uses one browser.

- The back end is not required for the demo; a mock adapter provides data. The adapter matches the Interfaces API surface so the real back end can replace it.

- A full commercial-grade UI is out of scope per the charter; this specification defines a demo-grade experience that is also a credible starting point for the real one.

### 20.3 Traceability to the charter

| **Charter element** | **Where it appears in the interface** |
|----|----|
| Operating loop (14 steps) | Six-stage stepper; section 2.2; screens 2 to 7. |
| Operating principles (15) | Section 2.3 and design principles (section 4). |
| AI Dependency Graph (entities, relationships, governance rules) | Screens 2, 8, 9; section 5.2 edge patterns; section 9.5 edge state machine. |
| Behavioural contract (20 fields) | Screen 9 Contract tab; thresholds drive Screen 6. |
| Workload risk matrix (12 types) | Risk tier, approvers and rollback severity on screens 2, 5, 9, 11. |
| Missing-test generation and critical pack | Screen 3; seeded tests; O1 review mode. |
| Evaluators (deterministic first) | Screen 4 column order and row outline. |
| Recommendation engine and Kernel | Screen 5 cards, Kernel verdict, Controls. |
| Human approval and separation of duties | Screen 5, overlay O2, permission matrix. |
| Shadow, canary, deterministic rollback | Screen 6 ladder, thresholds, LKG, recovery. |
| Evidence store and reproducibility | Screen 7 hash chain, export, Reproduce. |
| Self-governance | Screen 11 self-governance panel and one-level rule. |
| Institutional memory | Screen 10 and reuse badges on Screen 3. |
| Hard stops (7) | Overlay O4 and the Controls hard-stop list. |
| Dashboard freshness rule | FreshnessPill, stale banner, section 12. |
| Roadmap (phases 1 to 5) | Screen 12 roadmap strip with preview ribbon. |
