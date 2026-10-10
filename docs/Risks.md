# Risks — Register, Hard Stops, Security Threat Model, Seeded Regressions

Source: Concept Charter §19 (Seeded Regression Catalogue), §26 (Security
Requirements), §29 (Hard Stops), §33 (Risk Register). This file is meant to
be consulted continuously during the build, not read once — check it before
implementing any evaluator, the trusted kernel, or the rollback controller.

---

## 1. Hard Stops (Build-Breaking — See Also `AGENTS.md` §3)

Treat any of the following as a failed build, not a warning to note and
move past:

- Any missed critical dependency in the blast radius.
- Any undetected critical regression from the seeded catalogue below.
- Any autonomous production promotion (no code path bypasses human approval).
- Any candidate evaluating itself with no independent judge.
- Inability to explain an excluded test.
- Inability to reproduce a recommendation from its stored evidence.
- Failure to restore last-known-good on a triggered rollback.

---

## 2. Risk Register (Top Risks, Full Priority Order)

| ID | Risk | Likelihood | Impact | Mitigation | Contingency |
|---|---|---|---|---|---|
| R-01 | Incomplete dependency discovery | High | High | Conservative defaults, provenance, independent review | Full regression/manual mode; stop promotion |
| R-12 | Unsafe scope reduction | High | High | Trusted kernel validation, critical-pack union | Stop promotion; use LKG |
| R-13 | Data privacy exposure | High | High | Synthetic-only data, masking, minimisation | Mandatory privacy review before ingestion |
| R-17 | Failed rollback | High | High | Deterministic controller, break-glass runbook | Emergency stop; manual runbook |
| R-23 | Recursive Evergreen dependency | High | High | One-level recursive validation limit | External evaluator set required |
| R-02 | Stale graph | Medium | Medium | Conservative defaults, freshness thresholds | Mark stale; exclude from autonomous scope |
| R-03 | Poor test traceability | Medium | Medium | Provenance, mapping checks | Manual review |
| R-04 | Invalid generated tests | Medium | Medium | SME review before high-risk use | Discard invalid tests |
| R-05 | Judge bias | Medium | Medium | Independent judge, calibrated rubrics | Second judge / human review |
| R-06 | Model nondeterminism | Medium | Medium | Fixed seeds where available, repeated runs | Mark as inconclusive |
| R-07 | Provider rate limits | Medium | Medium | Central throttle, retry budget | Queue and retry with backoff |
| R-08 | Unavailable candidate model | Medium | Medium | Approved fallback path | Simulator or LKG, never silent substitution |
| R-09 | Cost overruns | Medium | Medium | Daily/per-event budgets and alarms | Stop runs; escalate |
| R-10 | Latency | Medium | Medium | Timeout + budget enforcement | Mark incomplete; sample more |
| R-11 | Excessive false positives | Medium | Medium | Tuned thresholds, expert review | Manual review of flagged cases |
| R-14 | Sensitive production traces | Medium | Medium | Minimisation, masking | Exclude from autonomous replay |
| R-15 | Tool/API incompatibility | Medium | Medium | Contract tests, versioned adapters | Fall back to manual mapping |
| R-16 | Canary contamination | Medium | Medium | Isolated canary traffic | Abort and roll back |
| R-18 | Platform lock-in | Medium | Medium | Provider-neutral core, adapter pattern | Swap adapter, not core logic |
| R-19 | Competitor absorption | Medium | Medium | Focus on institutional qualification memory (moat) | Reposition around compounding evidence |
| R-20 | Overclaiming savings | Medium | Medium | Hypothesis labels until measured | Report as hypothesis, not fact |
| R-21 | Insufficient Techathon time | Medium | Medium | Compressed 4-day track (`docs/Phases.md` §2) | Reduce workload portfolio |
| R-22 | Demo instability | Medium | Medium | Rehearsal, seeded fixtures | Fallback to recorded demo segment |

---

## 3. Security Threat Model (Summary — Full Detail in Original Charter §26)

**Posture:** zero trust, least privilege, customer-owned evidence, untrusted
model output by default, strong separation between recommendation and
deployment authority.

| Asset | Threat | Control | Owner |
|---|---|---|---|
| Dependency graph | Inject false dependency / delete critical edge | Provenance, confidence, source precedence, immutable changes | Enterprise Architecture |
| Evidence store | Alter test result or approval | Hashes, signatures, Object Lock, reconciliation | Security/SRE |
| Provider credential | Invoke models / exfiltrate data | Workload identity, secrets manager, scoped IAM, rotation | Platform Security |
| Planner prompt | Prompt injection changes plan | Content isolation, tool allowlists, policy validation, no deploy rights | Agent Engineer |
| Generated test | Unsafe code execution | Declarative schema, sandbox, no arbitrary code, review | Test Architect |
| Provider adapter | Endpoint redirection or tampering | Signed packages, SBOM, allowlist, TLS pinning | Security Architect |
| Approval identity | Impersonator approves unsafe promotion | MFA, signed identity, separation of duties, expiry | Identity Owner |
| Rollback control | Trigger or block rollback | Pre-authorized policy, dual control for manual override | SRE |
| Trace data | Leak sensitive content | Minimisation, masking, encryption, access controls | Data Privacy |
| Software supply chain | Compromised library/image | Locked deps, scanning, SBOM, signed images | DevSecOps |
| Tenant boundary | Read another tenant's evidence | Tenant isolation, per-tenant keys, authorization tests | Platform Security |

---

## 4. Seeded Regression Catalogue

Use these as the ground-truth defects your evaluation harness must detect.
**"In suite?" = Yes** means the test already exists in the synthetic
fixture; **"Generate?" = Yes** means the Missing-Test Generator is expected
to discover and propose it — do not pre-seed it into the base test suite.

| Seeded Defect | Workload | Severity | In Suite? | Generate? | Expected Outcome | Threshold |
|---|---|---|---|---|---|---|
| Wrong JSON field | Structured output | High | Yes | No | Block | 100% detection |
| Missing mandatory field | Extraction | Critical | Yes | No | Block | 100% |
| Semantically incorrect valid output | Classification/RAG | High | Yes | No | Investigate/block | ≥95% detection |
| Hallucinated citation | RAG | Critical | Yes | No | Block | 100% |
| Retrieval grounding failure | RAG | Critical | Yes | No | Block | 100% |
| Incorrect tool selection | Tool agent | Critical | Yes | No | Block | 100% |
| Correct tool, wrong parameters | Refund agent | Critical | Yes | No | Block | 100% |
| Changed tool-call order | Refund agent | High | No | **Yes** | Canary/block | Generated test valid |
| Skipped policy check | Refund agent | Critical | No | **Yes** | Block | 100% |
| Repeated tool loop | Tool agent | High | Yes | No | Block | 100% |
| Unauthorized tool invocation | Tool agent | Critical | Yes | No | Block | 100% |
| Excessive token usage | All | Medium | Yes | No | Canary/investigate | ≥95% |
| Unacceptable latency | All | High | Yes | No | Canary/block | ≥95% |
| Changed refusal behaviour | Conversational | High | No | **Yes** | Investigate/block | ≥90% valid tests |
| Sensitive-data leakage | Sensitive workflow | Critical | Yes | No | Block | 100% |
| Prompt-injection susceptibility | RAG/tool agent | Critical | No | **Yes** | Block | 100% |
| Lower task completion | Agent | High | Yes | No | Investigate | ≥95% |
| Correct final answer, unsafe trajectory | Refund agent | Critical | No | **Yes** | Block | 100% |
| Inconsistent repeated answer | Open-ended | Medium | Yes | No | Canary/investigate | Within contract delta |
| Incorrect rollback recommendation | Evergreen (self) | Critical | Yes | No | **Hard stop** | 100% |

---

## 5. Failure Scenario Coverage (Categories — See `docs/PRD.md` for Handling Rule)

Every scenario in every category resolves to one of: execute, simulate,
document, or **fail closed for critical uncertainty**. Do not invent a fifth
outcome (e.g., "ignore and continue") for any scenario.

- **Model-change scenarios (14):** retirement, optional upgrade, cheaper
  migration, same-provider upgrade, cross-provider migration, API change,
  context-window change, pricing change, structured-output behaviour change,
  refusal behaviour change, tool-use behaviour change, latency profile
  change, temporary unavailability, candidate withdrawn mid-qualification.
- **Workload scenarios (10):** summarisation, classification, extraction,
  RAG, structured JSON output, tool-using agent, multi-agent workflow,
  autonomous business action, sensitive-data workflow, regulated/high-risk
  workflow.
- **Dependency scenarios (12):** declared-in-config, telemetry-only visible,
  gateway-hidden model, fallback model exists, dynamic model selection,
  one-project-many-models, many-projects-one-model, shadow application with
  no owner, stale record, conflicting repo/runtime evidence, indirect
  dependency via internal AI service, Evergreen's own planner-model upgrade.
- **Test asset scenarios (11):** complete/incomplete Jira coverage,
  duplicate tests, obsolete tests, conflicting expected results,
  manual-only tests, no golden dataset, PII in traces, missing outcome
  labels, tests mapped to wrong application, critical invariant absent.
- **Failure scenarios (18):** dependency missed/false, critical test
  excluded, non-critical over-selected, invalid test generated, judge
  disagreement, evaluator timeout, provider rate limit, model endpoint
  failure, graph unavailable, Jira unavailable, trace unavailable, cost
  budget exceeded, partial execution, canary metric degrades, rollback
  fails, approval times out, evidence inconsistency.

---

## 6. Cost Categories (Spike vs. Production)

| Category | Spike Treatment | Production Treatment |
|---|---|---|
| Cloud infrastructure | Daily sandbox cost tracked; stop when idle | Control-plane compute, HA, database, network |
| Model tokens | Per-call and per-event budgets | Workload/event volumes and provider mix |
| Evaluator tokens | Deterministic first; sample probabilistic judges | Calibrated judge portfolio and caching |
| Graph/database | Community/local or low-cost managed | Scale, HA, backup and licence decision |
| Test execution | Record runtime and infrastructure | Existing runner licence/capacity |
| Developer effort | Four-week role-based effort placeholder | Implementation, hardening, integration |
| Maintenance/support | Not included as a fact | Adapters, provider changes, on-call |

**Cost guardrails:** set a daily cloud budget + alarm before the first run;
set a per-qualification token budget and deny unexplained overrun; cache
stable deterministic/reference results; use lower-cost judges for low-risk
cases, escalate only uncertain/high-risk cases; cap concurrency to provider
quota; automatically shut down non-required environments.
