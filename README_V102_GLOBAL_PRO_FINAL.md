# ZIVOZONE V102 GLOBAL PRO FINAL

Admin: raefalbtish@gmail.com only. Admin is not a player.

Features in this build:
- Premium admin console with visitor/session/activity/player monitoring.
- Compact admin identity header.
- Daily mining +0.50 ZIVO every 24 hours with secured Firestore transaction fallback on Spark.
- Adaptive challenge difficulty: a perfect replay increases the next run target difficulty; question history persists locally and in Firestore.
- Mobile-first luxury challenge cards and answer feedback.
- General news ticker slower than sports ticker; news updater uses stable aggregation and filters unsafe/dead hosts.
- Registration requires acceptance of ZIVOZONE terms. ZIVO is explicitly virtual and platform-only.

Deploy from v95build:
`firebase deploy --only hosting,firestore:rules`
