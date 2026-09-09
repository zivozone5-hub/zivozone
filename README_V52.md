# ZIVOZONE V52 — Live Sports + Authoritative ZIVO Economy

- Added Firebase callable `getSportsBroadcast` for live-ish ESPN scoreboard/news aggregation through the server.
- Added server-authoritative `submitChallengeAttempt` with idempotent attempt IDs, wallet ledger, XP/level updates and leaderboard projection.
- Added Firestore rules preventing clients from directly changing economy fields or wallet transactions.
- Challenge answers from the existing client engine are submitted to the server after a verified login session.
- The TV ticker is positioned immediately above Challenge Center and is populated from the server when Functions are deployed.

## Deployment requirement
From the project root run `firebase deploy --only functions,firestore` after selecting the `zivozone-fc6ed` Firebase project. GitHub Pages only serves the frontend; Cloud Functions must be deployed to activate server scoring, wallet rewards and live broadcast data.
