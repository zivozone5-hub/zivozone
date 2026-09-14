# ZIVOZONE V1094 — CLEAN CORE

## Objective
V1094 is a structural cleanup release. It does not redesign the homepage and does not introduce new product features.

## Canonical ownership
- Authentication: `ZIVOZONE_AUTH`
- Player progression: `ZIVOZONE_AUTH.getPlayer()` / `ZIVOZONE_AUTH.savePlayerProgress()`
- ZIVO economy: `ZIVOZONE_ECONOMY`
- Challenge runtime: `ZIVOZONE_V20`
- News: `ZIVOZONE_NEWS` / `ZIVOZONE_V85_NEWS`

## Economy boundary
Progression writes must not mutate ZIVO. ZIVO remains owned by the economy transaction layer and Firestore rules.

## Compatibility
Legacy V21 progression remains as a compatibility adapter. It synchronizes progression through the canonical Auth writer instead of inventing a second cloud schema.

## Migration principle
Do not delete legacy modules in this release. First route consumers toward canonical services, then remove unreachable code only after QA proves there are no remaining callers.

## QA targets
1. Register/login/logout
2. Player progression persistence
3. Wallet balance persistence
4. Mining 24h rule
5. Perfect challenge reward exactly once
6. News rails after dynamic render
7. Dark Room guest gate
8. Mobile click targets
9. Firebase rules regression
10. Reload/cache update behavior
