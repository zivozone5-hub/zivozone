# ZIVOZONE V1117 — UNIFIED PLAYER HUB CORE

- Removed V1080/V1081 Player Hub runtime and presentation CSS.
- Rebuilt `core/modules/player-hub.js` as the single player-facing hub owner.
- Hub reads Auth, Player, Economy, Missions, Competition and Achievements at render time.
- Wallet/mining are linked to the canonical Economy Core.
- Admin can inspect/test Economy; Firestore remains the security authority.
- Removed duplicate hub launchers and old runtime references.
- News rails are now larger and more readable on desktop/mobile; Arabic headlines enter from the right as complete RTL headlines.
- Service Worker cache bumped to V1117.
- No paid backend or Firebase Functions added.
