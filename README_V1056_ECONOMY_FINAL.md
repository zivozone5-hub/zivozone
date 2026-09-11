# ZIVOZONE V1056 — Economy Final

## Economy policy
- Registered Firebase users only can receive ZIVO. Guests never receive ZIVO.
- A challenge pays **exactly 10 ZIVO only at 10/10 with no timeout**.
- Any other challenge score pays **0 ZIVO**. XP/progression remains separate.
- Daily mining pays **+0.50 ZIVO** immediately when claimed and locks for exactly 24 hours from that claim.
- Wallet/mining/ledger writes are server-authoritative; the browser cannot directly mint or modify ZIVO.
- Duplicate perfect rewards are blocked by an idempotent ledger event.
- Question history is still player-owned and can sync without the previous permission error.

## Required deployment
From the `v95build` folder:

```cmd
firebase use
firebase deploy --only hosting,firestore:rules,functions
```

After deployment, hard refresh the site with `Ctrl+F5`.

## Admin
The admin account remains `raefalbtish@gmail.com`. The admin account is excluded from player mining/rewards.
