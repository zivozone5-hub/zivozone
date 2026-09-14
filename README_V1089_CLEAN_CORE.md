# ZIVOZONE V1089 — CLEAN CORE

Derived from **V1088 MOBILE NAV**.

### Core contracts
- Auth: `ZIVOZONE_AUTH`
- Economy: `ZIVOZONE_ECONOMY`
- Player/Profile: existing player contract, synchronized with Economy ZIVO
- News: one public news integration surface
- Admin: owner-only surface
- PWA: V1089 service-worker shell

### Economy
- Mining: +0.50 ZIVO, 24-hour server timestamp window, atomic transaction.
- Perfect challenge: +10 ZIVO only for 10/10 with zero timeouts and a unique attempt/event id.
- Wallet display: Firestore economy balance is authoritative.

### Dark Room
Guests can enter and play, but at the configured registration gate they must register or leave. There is no guest bypass button.

### Development rule
Never patch V1089 in place for a feature release. Copy to V1090, implement the feature, test, then promote the approved version to the next official baseline.
