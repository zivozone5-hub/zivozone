# ZIVOZONE V1089 — CLEAN CORE

## Purpose
V1089 is the engineering-hardening release derived from V1088 MOBILE NAV. V1088 remains the recovery reference; V1089 is the candidate baseline.

## Applied fixes
- Dark Room guest checkpoint no longer offers “Continue as Guest” after the registration gate.
- Wallet UI state is synchronized to the authoritative ZIVO economy balance instead of the legacy `coins` value.
- Added a single integration/orchestration contract (`zivo-core-v1089.js`).
- Removed legacy floating navigation/economy UI elements at runtime.
- Added runtime diagnostics for Auth/Economy contracts.
- Added a full-card click contract for challenge/game cards.
- Service worker cache bumped to V1089 and includes the new core file.
- Firebase Hosting excludes `docs/**` from production deployment; historical engineering files remain in the package.

## Important architecture rule
Firestore remains the authoritative balance store. LocalStorage may be used for UX preferences, language, audio state, adaptive question history, and guest-only progress, but must not become the source of truth for ZIVO balance.

## Candidate baseline status
V1089 is a CANDIDATE BASELINE pending live Firebase QA: Auth, Mining, Wallet persistence, 10/10 reward, duplicate reward attempt, Dark Room guest gate, news rails, and mobile breakpoints.
