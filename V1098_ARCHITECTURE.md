# ZIVOZONE V1098 — ARCHITECTURE CORE / LEGACY REMOVAL PHASE 1

## Scope
Phase 1 removes the V26/V27/V28/V29 Player/Economy compatibility chain from the deployed runtime after static dependency audit.

## Removed from deployment
- V26 wallet/reward UI compatibility layer
- V27 cloud queue compatibility layer
- V28 cloud bridge + player center compatibility layer
- V29 player data + leaderboard compatibility layer

The original files are retained under `ARCHIVE/legacy-phase1/` for rollback/reference and are not loaded by `index.html`.

## Canonical Player
`core/modules/player.js` now derives player state from V35 progress + Firebase auth + the canonical economy API. V30 identity was updated to depend on V35 and the canonical economy instead of V26/V29.

## Downstream migrations
V31, V33, V34 and V37 no longer reference V26. They use V30 as the player identity facade.

## Safety checks
- Node syntax check across all deployed JavaScript files.
- Local script-reference audit: no missing local script files.
- No deployed references to `ZIVOZONE_V26`, `V27`, `V28`, `V29` or their removed script filenames.
- Legacy files remain archived for rollback.

## Rule
No additional legacy removal should be performed until the production deployment is manually smoke-tested for Auth, Player, Wallet, Mining, Challenges, News, Dark Room, Profile, Admin and Mobile navigation.


V1100: Economy migrated from legacy global core into core/modules/economy.js; Wallet, Mining, Perfect Rewards, Mission/Competition credits and Ledger use one canonical Economy contract. Legacy global economy is archived and not loaded.
