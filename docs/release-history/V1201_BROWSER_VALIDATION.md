# ZIVOZONE V1201 — Browser Release Validation

## Scope
- Home boot and route shell
- Navigation lifecycle
- Challenge/room return-to-home contract
- Match Center data contract
- Forensic / Puzzle / Beauty room presence
- Game result validation and economy guard

## Static/CLI gate
PASS: 15/15 release checks
PASS: 49/49 JavaScript syntax checks
PASS: 13 match records across yesterday/today/tomorrow snapshots
PASS: 610-question integrity baseline
PASS: 25 forensic cases × 10 questions × 10 evidence × 5 stages

## Environment limitation
A deterministic Chromium E2E runner and Firebase Emulator are not available in this environment. The release therefore remains CANDIDATE until those two runtime gates are executed in a browser/Firebase environment.

## V1201 hardening changes
- stale runtime version labels normalized to V1201
- index cache-busting references normalized to v1201.0
- service-worker shell cache normalized to v1201
- retained single-core architecture; no legacy runtime layer added
