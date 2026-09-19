# ZIVOZONE V1202 — Production Integration Gate

## Scope
V1202 is the production-integration gate after V1201. It hardens the contracts connecting Match Center, game results, Economy, Wallet, Mining, Reward Claims, Ledger, and Firestore Rules.

## Root cause fixed
The mining client writes a `daily_mining` ledger entry in the same Firestore transaction that updates the wallet and mining cooldown. The previous ledger rule only authorized reward-claim ledger entries, so the mining transaction could be rejected by Firestore even though the wallet/mining rules were otherwise valid.

V1202 adds a narrowly scoped `daily_mining` ledger authorization:
- amount exactly `0.5`
- eventId equals ledger document id
- policy exactly `24h_mining`
- transaction must also advance the mining cooldown by at least 24 hours.

## Reward path
`game result → validated session → reward claim → wallet → ledger`

Challenge rewards remain restricted to perfect 10/10 validated results.

## Match Center
The existing 13-match, three-day snapshot is retained and validated. Home/away score mapping remains explicit and RTL-safe.

## E2E honesty
Static contracts are not represented as live Browser E2E or Firebase Emulator E2E. Those require an actual browser/emulator runtime and credentials/project configuration.
