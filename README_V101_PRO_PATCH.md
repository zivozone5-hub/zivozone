# ZIVOZONE V101 PRO PATCH

- Admin email: `raefalbtish@gmail.com` only. The admin account is excluded from player creation and player statistics.
- General news rail is significantly slower than sports rail.
- News updater removes direct fragile feeds and uses Google News RSS queries as the stable aggregation source.
- Daily mining: +0.50 ZIVO every 24h. Uses Cloud Function when available and a secured Firestore transaction fallback for Spark hosting.
- Wallet/mining controls are compact and mobile-first.
- Challenge cards and admin console receive a premium mobile UI layer.

## Important
The Firebase Authentication account for `raefalbtish@gmail.com` must exist before signing in. The code does not create an admin account automatically.

## Deploy
From `v95build`:

```bash
firebase deploy --only hosting,firestore:rules
```

If you later upgrade Firebase to Blaze and want Cloud Functions, deploy them separately:

```bash
firebase deploy --only functions
```
