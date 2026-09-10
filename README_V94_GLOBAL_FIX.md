# ZIVOZONE V94 — ROOT FIX

This release consolidates the ZIVO wallet at the UI/integration level and removes the repeated auth/wallet race condition.

## What changed
- One visible gold ZIVO wallet launcher.
- Wallet opens through a stable Firebase Auth gate and retries until auth is ready.
- Unified Firestore wallet path: users/{uid}/zivozone/wallet.
- Unified ledger under that wallet.
- Perfect challenge result events are normalized through one reward gate.
- Perfect score is required for reward; timed-out rounds do not reward.
- Engagement bonus is only claimable with a perfect run.
- The public `ZIVOZONE_ECONOMY` bridge is overridden by this core so legacy challenge layers call one wallet.
- Cache busting uses V94.0.
- Spark compatible; no Cloud Functions.

## Important
ZIVO is an internal platform balance only. Without a trusted backend, the browser is not a secure issuer for a financial token.
