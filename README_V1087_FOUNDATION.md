# ZIVOZONE V1087 — FOUNDATION

Unified player-facing foundation built from V1081.

## Included
- One Player Profile as the single source of player identity.
- Cloud-aware wallet view using the existing Firebase economy contract.
- 24-hour mining control connected to the existing ZIVO economy action.
- Unified ZIVO HUB replacing duplicate floating player/economy launchers.
- Activity and challenge history from existing player collections.
- Mobile-first responsive profile and hub.
- Player photo upload with client-side compression and account profile persistence.
- Login button remains the single account entry point; after login it is renamed to the player name by the existing auth runtime.
- Logout confirmation with a friendly retention message.
- No real-money payment processing added. ZIVO remains an in-platform virtual balance until a verified payment backend is implemented.

## Deployment
firebase deploy --only hosting
