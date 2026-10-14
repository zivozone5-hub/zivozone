# ZIVOZONE V1201 — Runtime / Economy Validation

## Scope
- Match Center: static 3-day snapshots + direct ESPN enrichment, RTL home/away score preservation.
- Navigation: enter → play → result → return home → re-enter lifecycle.
- Game results: canonical GameSession + GameResultValidator, duplicate-final protection.
- ZIVO: perfect 10/10 challenge reward, idempotent claim/ledger/wallet transaction.
- Mining: 0.50 ZIVO, 24-hour server-side cooldown enforced by Firestore rules.
- Wallet: reward increases require a matching consumed reward claim.
- Firebase Rules: reward claims require validated game-platform session evidence; direct minting is blocked.
- Guest reward handoff: validated session id is retained until authentication and retry is allowed after transient failure.

## Validation
- Match data: 13 matches across yesterday/today/tomorrow.
- Game Platform QA: 30/30 PASS.
- Game result QA: 7/7 PASS.
- Release QA baseline checks: 48 PASS, 0 FAIL; Browser E2E and Firebase Emulator remain environment-dependent and are not falsely marked passed.

## Baseline decision
V1201 is a hardened runtime/economy candidate. Do not mark FINAL BASELINE until production-browser and Firebase Emulator/production smoke tests are run.
