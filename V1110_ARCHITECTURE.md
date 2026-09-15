# ZIVOZONE V1110 — TRUE CLEAN CORE

V1101 is the engineering baseline. V1110 preserves the existing UI, routes and Firebase configuration while moving the production runtime to canonical modules.

## Canonical layers
- `core/services/` — infrastructure/content services (I18N, audio, news, fixtures, ads, dark room)
- `core/data/` — canonical challenge data
- `core/modules/auth.js` — account/session contract
- `core/modules/player.js` — XP/progress/player contract
- `core/modules/economy.js` — Wallet/Mining/Rewards/Ledger contract
- `core/modules/challenges.js` — challenge access contract
- `core/modules/cloud.js` — activity sync/queue contract
- `core/app.js` — application/UI orchestration

## Runtime policy
No `core/legacy/*` file is loaded by production. The old V1101 sources are retained only in `ARCHIVE/V1101_LEGACY_SOURCE` for rollback/reference.

## Preservation policy
The visual HTML/CSS layer, Firebase configuration, routes, challenge presentation, account flows, news rails, audio and existing feature entry points are preserved. Migration changes the ownership of behavior, not the product surface.
