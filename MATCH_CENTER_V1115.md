# ZIVOZONE V1115 — MATCH CENTER CORE

## Engineering update

This version replaces the V1114 match presentation with one owned Match Center module. No additional UI layer or legacy fixture runtime is introduced.

### Core capabilities
- 11 major football competitions.
- Today / tomorrow / coming days / results navigation.
- League and status filtering.
- Live match strip.
- Cached scoreboard data for faster startup and resilience.
- Automatic refresh with request timeout.
- Match cards with larger, readable typography and club badges.
- One-click Match Details modal owned by the Match Center.
- Match Details tabs: summary, events, statistics.
- Details are requested only when the user opens a match, reducing unnecessary API traffic.
- Responsive mobile-first layout.
- Uses public scoreboard endpoints; no Firebase Functions or paid service is required.

### Legacy cleanup
- Removed `core/legacy/06-fixtures.js` because its fixture contract is now owned by `core/modules/match-center.js`.
- No duplicate fixture renderer is loaded by `index.html`.
- Existing `window.ZIVOZONE_FIXTURES.load()` contract is preserved for the rest of the application.
