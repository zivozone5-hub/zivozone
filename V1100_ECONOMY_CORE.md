# ZIVOZONE V1100 — ECONOMY CORE

## Goal
Move the live economy implementation from the legacy `ZIVOZONE_ECONOMY` global runtime into the in-site `ZIVOZONE.Economy` module without changing the existing visual design.

## Canonical contract
- `ZIVOZONE.Economy.getWallet()`
- `ZIVOZONE.Economy.refresh()`
- `ZIVOZONE.Economy.open()`
- `ZIVOZONE.Economy.mine()`
- `ZIVOZONE.Economy.rewardPerfect()`
- `ZIVOZONE.Economy.credit(amount, meta)`
- `ZIVOZONE.Economy.addXP()`

## Economy flow
Wallet, mining, perfect-score rewards, mission/competition rewards and the transaction ledger now use the same Economy module. Mission/competition credits use one-time `rewardClaims/{claimId}` documents and atomic wallet+claim+ledger transactions.

## Safety
The old global economy file is archived and excluded from Firebase Hosting. Active code no longer depends on `ZIVOZONE_ECONOMY`. Existing wallet paths and balances are preserved.

## UI
The existing ZIVO wallet/mining section and wallet modal were moved into the Economy module so the page keeps the same appearance and behavior.
