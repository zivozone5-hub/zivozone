# ZIVOZONE V59 — Firebase Cloud Player Core

## Implemented
- Firebase-ready authentication bridge.
- Player profile sync: `players/{uid}`.
- Game attempt persistence: `players/{uid}/gameAttempts/{attemptId}`.
- Server-authoritative reward pipeline foundation.
- Append-only ZIVO wallet ledger foundation.
- Firestore security rules preventing client wallet writes.
- AI and sports integrations remain compatible.

## Critical deployment note
GitHub Pages cannot safely contain server secrets. Configure Firebase client settings through the existing project's public Firebase config, and keep AI/provider secrets inside Cloud Functions.

Before production rewards:
- implement per-game anti-cheat / server verification
- configure Firebase Auth providers
- deploy Functions and Firestore rules
- configure the real project ID
- test duplicate-attempt/idempotency behavior
- connect leaderboard queries only to verified score/XP fields
