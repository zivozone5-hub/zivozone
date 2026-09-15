# ZIVOZONE V1120 — UNIFIED CORE

Implemented order: State → Auth → Player → Challenges → Rewards → Economy → Cloud → UI → Legacy Removal.

## Canonical owners
- State: `core/modules/state.js`
- Auth boundary: `core/modules/auth.js`
- Player/Progress: `core/modules/player.js`
- Challenges: `core/modules/challenges.js`
- Rewards: `core/modules/rewards.js`
- Economy: `core/modules/economy.js`
- Cloud: `core/modules/cloud.js`
- UI: `core/modules/ui.js`

## Safety
Legacy challenge/auth runtime is isolated as compatibility infrastructure because the production challenge renderer still depends on it. Obsolete V34–V104 runtime scripts and the duplicate V1080/V1081 hubs are no longer loaded by `index.html`.

## Important fixes
- One State store with migration from V8/V17/V30/V35.
- Player reads/writes through State.
- Perfect 10/10 reward claim is idempotent per attempt instead of one global claim document.
- Rewards have one public contract.
- Economy is the sole ZIVO ledger writer.
- Boot diagnostics verify canonical modules.

## Next deletion gate
After browser smoke tests prove login/register/logout, challenge start/answer/finish, 10/10 +10 ZIVO, mining, wallet ledger, daily/mission/competition, news and admin routes, remaining compatibility files can be removed in a second controlled pass.
