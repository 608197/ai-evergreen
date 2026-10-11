# AI Evergreen — Seeded Scenario E-2026-001 Walkthrough Guide

This guide provides the complete, scripted 10-minute end-to-end demonstration and verification procedure for the canonical **Atlas-1 Retirement Scenario (`E-2026-001`)**, directly implementing **UX Specification §17 (Demo Director mode and seed scenario)**.

---

## 1. Demo Director Mode Overview

The **Demo Director** is an embedded controller built into the shell for presenters, reviewers, and jurors:
- **Launcher**:
  - Floating tab on the right screen edge (`Sparkles` **Demo**).
  - Quick action button in the TopBar tools row (`Sparkles` icon / `✦ System Narrator`).
  - User identity dropdown menu item (*"Demo Director Mode (Ctrl+Alt+D)"*).
  - Global hotkey: <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>D</kbd>.
  - Command Palette (<kbd>Ctrl</kbd>+<kbd>K</kbd> / <kbd>Cmd</kbd>+<kbd>K</kbd> -> *"Open Demo Director"*).
- **Capabilities**:
  - **12-Step Script Panel**: Displays step number, screen badge, presenter script, exact action, expected result, Back/Next navigation, and 1-click **"Go to Screen"** shortcut.
  - **Persona Switcher**: 1-click instant identity switching among all synthetic users without logging out.
  - **8 Failure Injections**: Demonstrates platform resilience and fail-closed safety invariants; every injection writes a signed `injectedForDemo: true` entry into the cryptographic ledger.
  - **Instant Scenario Reset**: Restores seed state in under 1 second.

---

## 2. The 12-Step Walkthrough Script

| # | Screen | Presenter Script | Exact Action | Expected System Result & Invariant Check |
|---|---|---|---|---|
| **1** | **S1 Command Center** (`/`) | *"One model, Atlas-1, retires in 14 days. Today each team would start its own project."* | Click the **Atlas-1 Retirement** card in the Active Change Events triage queue (or click Scenario 1 Fast-Track button). | Event context switches to `E-2026-001`; router navigates to Blast Radius (`/events/E-2026-001/blast-radius`). |
| **2** | **S2 Blast Radius** (`/events/E-2026-001/blast-radius`) | *"Evergreen finds exactly who is affected: six applications, and two that are only connected."* | Observe discovery topology; inspect affected workloads vs. connected-not-affected nodes. | 6 affected workloads identified; 2 connected-not-affected nodes displayed (Knowledge Search Widget & HR Policy Bot). Gate G1 is in `evaluating` status. |
| **3** | **S2 Blast Radius & Gate G1** | *"It will not guess on a critical path. One edge needs a human."* | 1. Switch persona to **Ravi Kulkarni** (AI Platform Engineer).<br>2. Click **Confirm** on the unconfirmed critical dependency edge for Refund Agent.<br>3. Click **Continue to Regression Plan**. | Edge status updates to confirmed; signed evidence block appended to ledger; **Gate G1 clears**; Screen 3 unlocks. |
| **4** | **S3 Regression Plan** (`/events/E-2026-001/plan`) | *"134 of 480 tests, and every exclusion has a reason. Critical tests are locked."* | 1. Hover/click an exclusion reason pill to open Overlay O1 (Evidence Drawer).<br>2. Inspect locked badge on Critical Invariant Pack tests (cannot be excluded). | Evidence Drawer displays machine-readable rationale for test exclusion; critical invariants are confirmed locked and immutable per Operating Principle #9. |
| **5** | **S3 Regression Plan & Gate G2** | *"It found a test nobody had written: the policy check must come first."* | 1. Switch persona to **Marcus Lee** (QA Lead).<br>2. Review missing test `MT-001` (Refund Agent policy check prerequisite) in Evidence Drawer and click **Approve Missing Test**.<br>3. Click **Approve Plan & Test Scope**. | Missing test approved; **Gate G2 clears** with separation-of-duties role check; Screen 4 unlocks. |
| **6** | **S4 Results Matrix** (`/events/E-2026-001/results`) | *"The candidate’s final answer is identical, but it skipped the policy check. Trajectory fails."* | 1. Select **Refund Agent** in the workload list.<br>2. Click the **Trajectory** dimension cell (`Fail`). | Side-by-side agent execution timeline compares Atlas-1 vs Atlas-2; highlights missing execution step (`policy_check`); deterministic failure rule K-014 triggered. |
| **7** | **S5 Treatment Decision** (`/events/E-2026-001/decision`) | *"Four outcomes across six applications. The Kernel denies Refund; it cannot be approved by anyone."* | 1. Inspect the 4 treatment buckets (Migrate 2, Canary 2, Investigate 1, Block 1).<br>2. Click **Inspect Hard Stop (Overlay O4)** on Refund Agent. | Refund Agent is locked with **Kernel: Deny (Rule K-014)**; Overlay O4 displays fail-closed alert banner with strictly NO bypass button. |
| **8** | **S5 Tiered Sign-Off** | *"Named humans sign, with friction that matches risk."* | 1. As **Asha Rao**, sign Ticket Summariser (Migrate).<br>2. As **Daniel Okafor**, co-sign Claims Policy Assistant (Canary).<br>3. As **Marcus Lee**, sign Invoice Extractor (Canary). | Overlay O2 captures role-governed sign-offs; cryptographic approval blocks appended to ledger; rollouts queued for promotion. |
| **9** | **S6 Canary Rollout** (`/events/E-2026-001/rollout`) | *"Canary runs inside pre-approved limits. Now a failure."* | In Demo Director (or Canary Monitor), click **Canary Degrades** failure injection. | Groundedness metric drops to 0.71 (below 0.85 threshold); Rollback Controller executes automated rollback in **850ms** (well within <60s SLA); LKG configuration restored. |
| **10** | **S7 Qualification Record** (`/events/E-2026-001/record`) | *"Everything is provable and reproducible."* | 1. Click **Verify Chain Integrity**.<br>2. Click **Reproduce Evaluation**.<br>3. Click **Export Qualification Record (JSON)**. | Chain integrity verified with SHA-256 Merkle hashes; deterministic replay yields 6/6 exact match; signed audit ledger downloaded. |
| **11** | **S10 & S9 Memory & Workload** (`/memory`) | *"What we learned becomes memory. The owner approves it."* | 1. Navigate to `/memory`; inspect Discovered Behavioral Patterns.<br>2. Click the pending contract proposal for Refund Agent.<br>3. In Screen 9 Workload Profile, review proposal diff and click **Approve & Version Bump**. | Behavioural contract increments from v1.4.0 to v1.5.0; memory log records permanent test reuse savings (~18h avoided). |
| **12** | **S11 & S12 Controls & Portfolio** (`/controls`) | *"Evergreen governs itself, and this is where it goes next."* | 1. Open `/controls`; inspect Self-Governance panel (Evergreen as a workload with independent judge).<br>2. Navigate to `/portfolio` to view executive AI technical debt metrics and retirement runway. | Self-governance invariants confirmed (no self-marking); roadmap preview ribbon displayed with 5-phase strategic milestones. |

---

## 3. Failure Injections & Safety Invariant Demonstrations

The Demo Director provides 8 scripted failure injections per **UX Specification §17.3**:

| # | Failure Injection | System Behavior | What It Demonstrates |
|---|---|---|---|
| **1** | **Stale Graph** | Graph age exceeds 24h freshness SLA; freshness badge turns gold; autonomous scope reduction is paused. | **Degraded Mode**: Fallback to full regression when dependency graph data is unverified. |
| **2** | **Connector Outage** | Two discovery connectors time out; system issues a cautious partial-estate warning. | **Cautious Inclusion**: Incomplete data makes the system more conservative, never less. |
| **3** | **Judge Disagreement** | Two LLM judge models split on Customer Chat Assistant semantic evaluation (variance >0.40). | **Human Escalation**: Inconclusive probabilistic judgements move treatment to Investigate. |
| **4** | **Approval Expires** | Sign-off record passes its time-to-live before deployment begins. | **Fail-Closed Governance**: Expired approvals never move traffic; re-authorization required. |
| **5** | **Canary Degrades** | Candidate groundedness drops below threshold limit (0.71 < 0.85). | **Autonomous Rollback**: Deterministic rollback executed in 850ms without asking an LLM. |
| **6** | **Rollback Fails** | LKG fails health check; triggers Hard Stop O4 and Break-Glass Runbook (`BG-004`). | **Break-Glass Accountability**: System stops fail-closed and directs SRE to emergency runbooks. |
| **7** | **Evidence Integrity Fails** | Tampered hash injected into block #2; Merkle verification detects cryptographic mismatch. | **Tamper Evidence**: Recommendations without verifiable evidence records are voided immediately. |
| **8** | **Kernel Unavailable** | Trusted Kernel heartbeat is lost; all promotion paths lock down. | **Deterministic Supremacy**: Promotions cannot proceed without active kernel policy enforcement. |

---

## 4. Reset & Verification

To reset the scenario at any time during testing or presenting:
- Click **Reset Scenario (Seed State)** in the Demo Director panel.
- The platform restores initial seed states, resets all 6 application treatments, clears injected faults, and returns to the Command Center in `< 1 second`.
