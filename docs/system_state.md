# AI Evergreen — System State & Ground Truth Reference

> **CRITICAL FOR ALL AGENTS & SESSIONS:**  
> This file is the **single source of live truth** for the current state of the AI Evergreen repository, running environment, architectural boundaries, and user directives.  
> **Read this file at the start of EVERY new session.** It guarantees zero loss of conversational context across agent resets, truncations, or new chat windows.

---

## 1. Live Environment & Deployment

| Attribute | Value / Configuration |
|---|---|
| **Remote Host** | AWS EC2 Linux VM (`ec2-16-171-21-81.eu-north-1.compute.amazonaws.com`) |
| **Internal IP** | `172.31.46.141` |
| **Web UI Port** | `8503` (`http://ec2-16-171-21-81.eu-north-1.compute.amazonaws.com:8503`) |
| **API Port** | `8003` (`http://ec2-16-171-21-81.eu-north-1.compute.amazonaws.com:8003`) |
| **Containerization** | Multi-stage Docker build in `web/Dockerfile` (`node:22-alpine` build stage -> `nginx:alpine` runtime). Orchestrated via `compose.yaml`. |
| **VM Update Workflow** | On the VM, the user runs: `git pull && docker compose up -d --build`. **NEVER** instruct the user to run `npm run build` on the VM host. Docker handles the entire build inside its container. |

---

## 2. Non-Negotiable Operating Directives (Hard Stops)

1. **Git Push via REST API Only**:  
   Corporate Zscaler proxy intercepts and 403-blocks standard `git push origin main`.  
   **ALWAYS execute:** `python scripts/push_to_github.py "<commit_message>"` to commit and push via the GitHub REST API using the personal access token.
2. **Deterministic Checks Before Probabilistic Judgement**:  
   Rule-based, schema, and policy checks run first and can block on their own. LLM judges run second and never override a deterministic failure.
3. **Evidence Over Assertion**:  
   Every claim (a dependency edge, a test selection, a risk score) must carry a source and confidence. Never hardcode fake 1.0 confidence.
4. **Human Approval Mandatory for Promotion**:  
   No code path promotes a candidate model/config to production without a signed human approval record.
5. **Rollback Within Fixed Thresholds**:  
   The Rollback Controller acts on versioned numeric tripwires (<850ms). It never queries an LLM at runtime for rollback decisions.
6. **Synthetic Estate Only**:  
   No real customer data, real Jira exports, or live production traces in this repository.
7. **Explainable Exclusions**:  
   Every excluded test must have a machine-readable rationale attached.
8. **Critical Invariants Immutable**:  
   Seeded critical regression catalogue entries cannot be modified or excluded to force test suites to pass.

---

## 3. UI Features & Screen Architecture

### 3.1 Home Screen (`HomeScreen.tsx` — Cockpit)
- **TopBar Shell**: Fixed single-line overflow-protected search pill with ellipsis and `Ctrl+K` trigger; redundant top-right persona dropdown removed in favor of in-page persona tabs.
- **Layer 1 — Greeting & Evaluator Perspective Switcher**:
  - One-click horizontal tab strip directly on the page:
    - `[AR] Asha (Application Owner)`
    - `[ML] Marcus (QA / Test Lead)`
    - `[PM] Priya (Risk and Compliance)`
    - `[SA] Sofia (SRE / Operations)`
    - `[RK] Ravi (AI Platform Engineer)`
    - `[JW] Jonas (Executive CIO)`
  - Instantaneous switching without hidden dropdowns.
- **Layer 2 — Persona Action Hero**: Dynamically swaps hero action card based on active persona (e.g., SRE Canary monitor, QA regression planner, Risk approval matrix).
- **Layer 2c — Persona KPI Dials**: Metric dials tailored to the active role (e.g., Seeded Defect Recall %, Test Reduction %, ROI, Unreasoned Exclusions).
- **Layer 3 — Fast-Track Scenarios**: 3 quick-launch cards for evaluators (Happy Path Migration, Seeded Defect Block, Autonomous Canary Rollback).
- **Layer 4 — Active Event Spotlight**: Deep dive into event `E-2026-001` (Atlas-1 Deprecation), 6 affected workloads, 1 unconfirmed edge blocking Gate G1.
- **Layer 5 — Change Events Triage Table**: Searchable, filterable list of enterprise AI change signals.

### 3.2 Enterprise Integrations & Connectors (`IntegrationsScreen.tsx`)
- Full enterprise integration management view mapping 6 core connectors:
  1. AWS Bedrock Model Registry (18 models tracked, polling 15m)
  2. Azure OpenAI & AI Foundry (8 deployments)
  3. ServiceNow CMDB & AI Control Tower (Syncs tiering & ownership)
  4. GitHub AST Dependency Scanner (Code AST parser)
  5. Jira & Xray Test Management (480 test cases indexed)
  6. Cognizant AI Gateway & LiteLLM Proxy (5% canary routing & <850ms rollback)
- Real-time health badges, sync timers, credential security chips, interactive toggle switches, manual sync triggers, and webhook audit log feed. Accessible at `/integrations` and `/connectors`.

### 3.3 Interactive System Narrator & Audio Guide (`DemoDirector.tsx`)
- Elevated from Demo Director to **"✦ System Narrator"**.
- Launcher available via persistent TopBar pill, floating bottom-right tab, <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>D</kbd>, or Command Palette (<kbd>Ctrl</kbd>+<kbd>K</kbd>).
- Synthesized Web Speech API audio narration (`Audio Narration: Play / Stop`) with voice synthesis.
- 12 comprehensive chapters covering Elevator Pitch, Why We Win, Personas, Architecture, Invariant Tests, and ROI.
- 8 fail-safe failure injections writing signed `injectedForDemo: true` records to the cryptographic ledger.

### 3.4 Core Qualification Workflow Screens
1. **S1 Command Center / Home** (`/`)
2. **S2 Blast Radius** (`/events/:eventId/blast-radius`): Dependency graph discovery, affected vs connected workloads, Gate G1 edge confirmation.
3. **S3 Regression Plan** (`/events/:eventId/plan`): Proportionate test selection, machine-readable exclusion rationales, Gate G2 signoff.
4. **S4 Results Matrix** (`/events/:eventId/results`): Multi-dimensional evaluation, trajectory step comparisons, deterministic failure detection (Rule K-014).
5. **S5 Treatment Decision** (`/events/:eventId/decision`): Migrate / Canary / Investigate / Block buckets, Hard Stop O4, multi-persona signoffs.
6. **S6 Canary Rollout** (`/events/:eventId/rollout`): Live traffic routing, autonomous rollback controller (<850ms).
7. **S7 Qualification Record** (`/events/:eventId/record`): Cryptographic audit ledger, Merkle hash verification, reproducible evaluation export.
8. **S8 Estate** (`/estate`): Enterprise-wide connected topology, inventory, and qualification banners.
9. **S10 Memory** (`/memory`): Tabbed infographic intelligence center: Tab 1 "Discovered Behavioral Patterns" (dual-lane trajectory infographics, lead-indicator timeline, schema diffs, risk spectrum bar); Tab 2 "Seeded Invariant & Test Reuse Log" (~18h effort avoided distribution bar, visual test asset cards with lineage flows, cards/table toggle); Tab 3 "Contract Proposals & Roadmap" (red/green schema diffs, Phase 3 horizon radar).
10. **S11 Controls** (`/controls`): Tabbed executive governance center: Global 3-Stage Deterministic Pipeline (Kernel -> LLM Advisor -> Human Authority); Tab 1 "Deterministic Invariants & Hard Stops" (lifecycle phase circuit, 7 hard stops with O4 interstitial triggers, 8 kernel elements with hit-rate meters & card/table toggle); Tab 2 "Spike Acceptance Matrix" (12/12 unconditional GO dial, domain summary clusters, target vs measured differential bars); Tab 3 "Human Authority & Self-Governance" (criticality escalation ladder, recursive qualification flowchart with independent judge); Tab 4 "Enterprise Scope Boundary" (3-tier stack architecture diagram, build vs integrate vs out-of-scope matrix).
11. **S12 Portfolio** (`/portfolio`): Tabbed executive horizon scanning: Global Fleet Vital Health bar (14 models, 84% compliant, 2 deprecations <90d, 4.2h velocity); Tab 1 "AI Technical Debt & Fleet Risk" (77x cycle time acceleration comparison infographic, 5 technical debt breakdown cards with progress fills); Tab 2 "Model Lifecycle & Deprecation Runway" (Horizon view countdown Gantt timeline with vendor filter pills, rich lifecycle cards with affected workload chips); Tab 3 "Strategic Enterprise Roadmap" (5-Phase maturity roadmap flow from feasibility spike to autonomous closed-loop rollout with phase deliverable chips).
12. **Design Patterns** (`/gallery`): Tabbed design system showcase: Global Standards Header (Triple-Cue Rule, Navy Risk Scale, Provenance Tags, Token Purity, live toast trigger); Tab 1 "Deterministic Primitives" (14 StatusChip variants, 4-tier navy RiskMeters, ConfidenceMeters with limit alerts, ProvenanceTags); Tab 2 "Gates & Evidence Audit" (GateBanner, KernelVerdict permit/deny with rule inspect, SHA-256 HashChips with Hard Stop O4 trigger, 6-stage StageStepper); Tab 3 "Deep Evaluation & Telemetry" (Agent Trajectory Timeline with skipped step deterministic failure, Differential Response DiffViewer, Telemetry Threshold Charts with anomaly alert); Tab 4 "Layout, Feedback & Glossary" (RiskBadgeRow, StatTiles with illustrative/measured proof tags, 20-term interactive hover GlossaryTerm, EmptyState, and SkeletonBlock loading placeholders).

---

## 4. Evaluator Personas & Approval Matrix

| Persona ID | Name | Role Title | Key Responsibility & Scope |
|---|---|---|---|
| `user-asha` | Asha Rao | Application Owner | Owns Refund Agent, Claims Policy Assistant, Ticket Summariser |
| `user-marcus` | Marcus Lee | QA / Test Lead | Owns regression plans, missing test approvals, test scope signoff |
| `user-priya` | Priya Menon | Risk & Compliance Approver | Critical and regulated promotions, unreasoned exclusion blocks |
| `user-daniel` | Daniel Okafor | Data Owner | Claims Policy Assistant retrieval sources |
| `user-sofia` | Sofia Alvarez | SRE / Operations | Canary rollout, hold, autonomous tripwire thresholds, manual rollback |
| `user-ravi` | Ravi Kulkarni | AI Platform Engineer | Graph confirmations (Gate G1), dependency overrides |
| `user-helen` | Helen Ward | Governance & Audit | Read access to Record, Memory, Controls, and audit export |
| `user-jonas` | Jonas Weber | Executive (CIO) | AI portfolio technical debt, enterprise ROI, strategic runway |

---

## 5. Seeded Scenario E-2026-001 (Atlas-1 Deprecation)

- **Trigger**: AWS Bedrock announces Atlas-1 retirement in 14 days.
- **Affected Set**: 6 enterprise workloads impacted (Refund Agent, Claims Policy Assistant, Ticket Summariser, Invoice Field Extractor, Customer Chat Assistant, Support Triage Classifier). 2 connected-not-affected workloads (Knowledge Search Widget, HR Policy Bot).
- **Gate G1 Block**: Refund Agent dependency edge from Bedrock requires human confirmation by Ravi Kulkarni.
- **Gate G2 Signoff**: Missing test `MT-001` (prerequisite policy check for Refund Agent) discovered and approved by Marcus Lee.
- **Key Deterministic Failure**: Refund Agent with Atlas-2 skips the mandatory policy check step. Trajectory evaluation detects failure; Trusted Kernel enforces **Deny (Rule K-014)**. Strictly NO bypass button.
- **Canary Autonomous Rollback**: Ticket Summariser canary groundness drops to 0.71 (below 0.85 SLA); Rollback Controller executes automated rollback in **850ms**.
- **Full Walkthrough Script**: Documented in [`docs/demo_walkthrough_guide.md`](file:///c:/Extra%20Work/IEP%20Techathon%202026/ai-evergreen/docs/demo_walkthrough_guide.md).

---

## 6. CSS Stacking Context & Design Tokens

- **Z-Index Scale** (defined in `web/src/styles/tokens.css`):
  - `--ev-z-base: 0`
  - `--ev-z-sticky: 100` (TopBar sticky header)
  - `--ev-z-drawer: 500` (Evidence drawer)
  - `--ev-z-popover: 1000` (TopBar dropdowns, identity menu)
  - `--ev-z-modal: 2000` (Command palette, keyboard shortcuts modal, manual event modal)
  - `--ev-z-toast: 3000` (Notifications)
- **TopBar Rule**: Always preserve `z-index: 100` on `.ev-topbar` and `z-index: 1000` on `.ev-topbar__popover` so dropdowns are never obscured by page hero cards.

---

## 7. Python Retention Auditor (`scripts/audit_retention.py`)

A deterministic validation engine that runs locally and pre-push to enforce memory retention and prevent drift:
- **Memory Integrity**: Validates presence of `docs/system_state.md`, `docs/memory.md`, `docs/lessons-learned.md`, and `docs/demo_walkthrough_guide.md`.
- **Route Drift**: Extracts routes from `web/src/App.tsx` and asserts they are documented in `docs/system_state.md`.
- **Persona Drift**: Extracts persona IDs from `web/src/store/seedData.ts` and asserts they exist in `docs/system_state.md`.
- **Connector Drift**: Asserts all 6 enterprise connectors are accounted for.
- **Token Density**: Asserts `docs/system_state.md` remains lean (<500 lines, <35KB) for fast agent context ingestion.
- **Secret & Invariant Scanner**: Confirms no raw credentials or forbidden bypasses.
- **Git Freshness**: Warns or blocks if code changes are made without updating documentation.
- **Automated Gate**: Directly invoked inside `scripts/push_to_github.py` before any upload.

---

## 8. Instructions for Future Sessions

When starting any new session:
1. **Read this file (`docs/system_state.md`)** to instantly inherit all system architecture, deployment facts, and user directives.
2. **Read the latest entry in `docs/memory.md`** for immediate context on what was changed in the previous turn.
3. **Always run `python scripts/audit_retention.py`** to confirm memory health and zero drift.
4. **Always use `python scripts/push_to_github.py "<message>"`** to push commits.
5. **Always run `npm run build` in `web/`** to verify clean compilation before pushing.
6. **Update this file and `docs/memory.md`** whenever any architectural change or user directive is added.
