# ZIVOZONE V1111 — ENGINEERING AUDIT & CLEAN FOUNDATION

## Decision
V1110 is accepted as the functional reference baseline. V1111 is a conservative structural cleanup:
- Removed `ARCHIVE/` from the deliverable because archived code is not part of the production runtime.
- No active feature was deleted based only on filename/version age.
- The active legacy runtime remains intentionally loaded because several canonical modules still depend on legacy contracts.
- This version is therefore a CLEAN FOUNDATION, not yet the final "zero-legacy" build.

## Verified
- 144 archive/package entries inspected before cleanup.
- 125 files at the V1110 root tree before removing `ARCHIVE`.
- 55 JavaScript files.
- All active JavaScript files pass `node --check`.
- All local script references in `index.html` resolve.
- Firebase Hosting already excludes `ARCHIVE/**` from deployment.
- `core/modules/economy.js` is the canonical live Economy implementation.
- Firestore rules contain explicit wallet/mining/reward claim controls.
- Math bank contains 50 questions per V1101 changelog.

## Critical architectural findings

### 1. Core is not fully independent yet
`core/modules/auth.js` is a compatibility facade over `window.ZIVOZONE_AUTH`.
`core/modules/challenges.js` depends on `window.ZIVOZONE_CHALLENGES` and `window.ZIVOZONE_START_CHALLENGE`.
Therefore Auth and Challenges are not yet true standalone Core modules.

### 2. Player has competing runtime contracts
`core/modules/player.js` publishes `ZIVOZONE.Player`, while legacy files still publish/modify `window.ZIVOZONE_PLAYER`.
The legacy app/player layer is still loaded, and `50-v1081-player.js` also writes `window.ZIVOZONE_PLAYER`.
This is a high-risk area for state divergence.

### 3. Challenge execution remains legacy-driven
The page still loads the legacy challenge bank, challenge center, rotation, score gate and server adapter.
The Core Challenges module currently delegates to the legacy starter.
This must be migrated before deleting those files.

### 4. Several old modules are still active
The active HTML loader still loads legacy files for:
- i18n/audio
- challenge bank/pack/rotation
- auth/app
- Dark Room
- server result submission
- news separation
- admin monitor
- engagement/pro layers
- old compatibility layers around challenge execution

They are not safe to delete merely because their filenames are old.

### 5. Storage contracts are mixed
Core modules use localStorage keys inherited from V32/V34/V35/V36/V31-era systems.
This is acceptable for compatibility, but the final architecture should define one canonical State contract and migrate old keys once.

## Target architecture for V1120+

```text
UI
 |
ZIVOZONE Core
 |
+-- Auth
+-- State
+-- Player
+-- Economy
+-- Challenges
+-- Rewards
+-- Missions
+-- Achievements
+-- Competition
+-- News
+-- Admin
+-- Cloud
 |
Firebase Auth + Firestore
```

Every feature should communicate through Core APIs/events, not through legacy globals.

## Deletion gate
A legacy file can be deleted only after:
1. Every exported function has a Core replacement.
2. Every DOM action has a Core/UI replacement.
3. Firebase reads/writes are covered by the new contract.
4. Mobile navigation and deep links work.
5. Guest/authenticated/admin states work.
6. Reward, wallet and XP math pass deterministic tests.
7. No duplicate global is written by another runtime.
8. No console errors occur during a complete smoke test.
9. The file is absent from `index.html` and Service Worker.
10. A rollback copy exists outside the production package until the migration is accepted.

## Recommended next implementation order

### Phase A — State + Auth
Create one canonical session/state store.
Migrate Auth from `ZIVOZONE_AUTH` into `ZIVOZONE.Auth`.
Keep a temporary read-only compatibility adapter, not a second implementation.

### Phase B — Challenge Engine
Move:
- bank lookup
- challenge start
- question rotation
- answer evaluation
- score
- timeout
- result event

into `ZIVOZONE.Challenges`.

### Phase C — Rewards / Math
Create one transaction contract:
`Challenge Result -> Reward Decision -> Economy Ledger -> Wallet`.
The perfect 10/10 reward must be idempotent and server-rule compatible.

### Phase D — Player + Cloud
Make Player the only owner of player state.
Move cloud activity and progression to one canonical Firestore contract.
Remove duplicate localStorage writers after migration.

### Phase E — UI
Make all cards/buttons use one event delegation layer.
Remove direct legacy DOM handlers.
Verify mobile-first layouts and all routes.

### Phase F — Legacy removal
Delete legacy files one batch at a time only after the deletion gate passes.

## Product improvements worth adding after the core is stable
- Player dashboard with XP, ZIVO, streak, achievements and recent activity.
- Player verification/profile completeness score.
- Challenge history and personal bests.
- Daily/weekly seasons.
- Leaderboards with anti-cheat/server validation.
- ZIVO transaction history.
- Admin dashboard for users, activity, rewards and moderation.
- PWA install/offline shell.
- Better challenge discovery/search/filtering.
- Shareable player card.
- Achievement/badge progression.
- Arabic-first UX with English fallback; keep other languages as content coverage permits.
- Feature flags so new experiments never require another legacy layer.

## Important product rule
Do not add another `Vxxxx` feature as a separate runtime layer. New functionality must be implemented inside the Core/module architecture and must reuse the canonical State, Player, Economy and UI contracts.

## Current engineering assessment
The project is a strong functional prototype with a good modular direction, but it is not yet a true clean-core production architecture. The largest remaining risk is duplicated runtime ownership, not visual design.

The next major release should therefore prioritize correctness and ownership boundaries before adding large new features.
