# ZIVOZONE V45 — Production Score Gate

## Goal
Move ZIVOZONE toward a publishable architecture where the browser cannot directly mint trusted XP/ZIVO rewards.

## Added
- Authenticated attempt submission bridge.
- Optional production backend endpoint using Firebase ID token.
- Offline queue for attempts.
- Safe Firestore fallback that records an attempt as `pending-server-validation`.
- Firestore rule preventing clients from writing `xp`, `coins`, `zivo`, or `reward` fields into pending attempts.

## Preserved
- V44 homepage hardening.
- V43 real cloud core.
- V42 cloud question history.
- V41 smart rotation.
- V40 challenge bank.
- Existing challenge engine, Dark Room, audio, news, ads, languages, ZIVO, XP, missions, competition and Firebase initialization.

## Critical deployment step
A truly server-authoritative score system still requires deploying a trusted backend/Cloud Function that:
1. Authenticates the Firebase ID token.
2. Loads the canonical challenge/question definition.
3. Validates answers and timing server-side.
4. Calculates score/XP/ZIVO.
5. Writes the authoritative result and reward.
6. Updates leaderboard atomically.

V45 intentionally does not pretend that this backend exists if no production endpoint is configured.

## Validation
- All JavaScript files passed `node --check`.
- No second Firebase initialization added.
- Existing reward fields are blocked from pending client attempts by Firestore rules.
