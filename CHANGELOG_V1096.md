# ZIVOZONE V1096 ARCHITECTURE CORE

- Activated both Arabic news rails with cache/network/fallback handling.
- Extracted the primary news engine from the monolithic runtime into `core/modules/news.js`.
- Added a single `ZIVOZONE` public contract.
- Added canonical Auth, Player, Economy, Challenges and UI facades.
- Added architecture manifest and migration boundary.
- Added modular architecture CSS and moved the news rail base CSS out of the legacy bundle.
- Fixed Service Worker cache target from a missing bundle path to the actual runtime.
- Preserved legacy APIs and visual structure to minimize regression risk.
- No destructive removal of legacy dependencies in this release.
