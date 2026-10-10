# AGENTS.md — Provider Adapters (nested, overrides root for this folder)

This folder isolates every call to an external model provider. Root
`AGENTS.md` still applies; this adds stricter rules for this folder.

## Absolute Rules For This Folder

1. **Every provider gets its own adapter class implementing the shared
   `ModelProviderAdapter` interface** (see `docs/Interfaces.md`
   §Provider Adapter Contract). No component outside this folder should ever
   import `boto3` or a provider SDK directly — route through the interface.
2. **Two adapters minimum for the spike**: one real (Bedrock) and one
   simulator or second real provider, per `docs/PRD.md` assumption A-03.
   Do not let the simulator silently degrade into "always returns success" —
   it must be able to reproduce seeded failure modes too.
3. **No silent substitution.** If the configured model is unavailable, do
   not automatically call a different model ID. Either raise a typed
   `ProviderUnavailableError` for the orchestrator to handle, or fall back
   to the explicitly approved last-known-good / simulator path — and record
   a fallback event either way.
4. **Persist every call parameter.** Model ID, version, region, temperature,
   seed (where available), and token counts must be logged per call — this
   is what makes qualification evidence reproducible later.
5. **Untrusted output.** Anything returned by a provider (including
   generated text meant to be parsed as JSON) is untrusted input to the rest
   of the system. Validate against schema before passing it on; never
   `eval()` or blindly execute anything a model returns.
6. **Rate limits and budgets are enforced here, not upstream.** Central
   throttle/retry logic (capped attempts, exponential backoff) belongs in
   this folder so every component gets it for free.
7. **Credentials never appear in code.** Read from environment variables
   documented in `.env.example`, sourced from AWS Secrets Manager or a local
   `.env` excluded via `.gitignore` — never hardcoded, never logged.

## What Belongs Here

- `bedrock_adapter.py`, `simulator_adapter.py` (or a second real adapter).
- Shared retry/backoff/rate-limit utilities used by all adapters.
- Request/response logging for evidence purposes.

## What Does Not Belong Here

- Evaluation logic (does the output look correct?) → `evaluators/`
- Cost calculation across a qualification event → `evidence/`
