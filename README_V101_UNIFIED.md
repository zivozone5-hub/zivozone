# ZIVOZONE V101 — Unified Mobile-First Economy

## What changed
- One responsive codebase for mobile and desktop.
- One primary ZIVO Wallet location directly below the top bar.
- One daily mining action: 0.50 ZIVO every 24 hours.
- Mining and rewards are server-authoritative through Firebase Functions.
- Challenge rewards are routed through one Reward Engine and written to one Wallet Ledger.
- XP, ZIVO and Tickets remain separate systems.
- Removed legacy floating wallet / quick-dock layers from the active UI.
- Mobile bottom navigation is reduced to five primary destinations.

## Deploy
```bash
firebase deploy --only firestore:rules
firebase deploy --only functions
firebase deploy --only hosting
```

## Important
ZIVO is currently an in-platform virtual currency. Daily mining is a reward mechanic, not blockchain mining and not a promise of financial value or external trading.
