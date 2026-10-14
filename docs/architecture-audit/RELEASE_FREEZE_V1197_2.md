# ZIVOZONE V1197.2 — Release Candidate QA / Freeze Preparation

## Scope

This phase is the next step after V1197.1 Engineering Recovery Hardened.
It strengthens deterministic local QA without introducing a new Core, Runtime,
Economy, Challenge Engine, GameBridge, or GameRegistry.

## Changes

### 1. Result validation hardening

`core/modules/runtime/game-validator.js` now explicitly requires finite numeric
values for `total`, `correct`, `score`, and `duration` before range validation.
This makes rejection of `NaN`, `Infinity`, and non-finite numeric input explicit.

### 2. Release QA harness

Added:

- `scripts/qa_release_candidate.py`
- `scripts/qa_game_result_cases.js`

The harness checks:

- required architecture files
- JavaScript syntax
- Python syntax
- Game Registry contract
- SWF/Ruffle manifest contract
- runtime wiring
- GameBridge origin/source validation
- Game Result validation guards
- Economy validation contract
- Firestore reward guards
- Match Center data integrity
- absence of legacy browser Flash plugin runtime patterns

### 3. Functional result-case tests

The result-case suite verifies:

- valid result accepted
- duplicate result rejected
- NaN rejected
- Infinity rejected
- negative score rejected
- wrong game rejected
- timeout + completion rejected

## Current QA result

```text
PASS = 48
FAIL = 0
WARN = 2
STATUS = CANDIDATE — E2E REQUIRED
```

## Explicitly unverified

Two release gates remain intentionally open because the current build
environment does not provide the required infrastructure:

1. Browser E2E against a real browser session.
2. Firebase Emulator / deployed Firebase integration tests.

These are **not** converted into PASS merely because source files exist.

## Freeze gate

Do not label V1197.2 as a final production freeze until the following are
executed in a suitable environment:

- boot
- authentication
- logout
- return-to-site flow
- all four rooms
- Game Registry loading
- native game session
- SWF/Ruffle loading with a real licensed SWF asset
- GameBridge lifecycle
- result validation and replay rejection
- challenge completion
- reward claim
- wallet ledger update
- mining
- Match Center live/finished/upcoming states
- mobile viewport smoke test
- Firestore rules emulator tests

No new feature work should be introduced while these release gates are being
verified.
