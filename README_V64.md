# ZIVOZONE V64 — Challenge QA + Player Progression

This is an integration/QA release.

## Goals
- Keep the existing Challenge Center and existing game modal as the only challenge UI.
- Keep 30 seconds per question in the canonical game engine.
- Normalize challenge results into one contract.
- Persist lightweight progression locally as a fallback.
- Send attempts through the existing cloud player bridge when authenticated.
- Feed `zivozone:game-complete` / `zivozone:challenge-result` into progression automatically.
- Add no dashboard, no new home-page timer, and no duplicate challenge modal.

## Canonical result
`gameId, score, win, duration, questions, correct, timedOut, at`

## Cloud rule
The client records an attempt; reward authority must remain in the server-side verification function. Client-side XP/ZIVO must never be trusted for economic settlement.

## QA
`V64_QA_REPORT.json` contains the JavaScript syntax check and detected challenge source files.
