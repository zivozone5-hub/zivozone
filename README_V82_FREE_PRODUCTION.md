# ZIVOZONE V82 — FREE PRODUCTION

Consolidated production build for ZIVOZONE.

## Runtime
- All existing browser feature layers are preserved in `zivozone-runtime.js` in their original dependency order.
- Firebase Authentication and Firestore remain active.
- Player profile, XP, levels, results, activity tracking, ZIVO internal economy, and owner dashboard are included.
- The owner account is `raefalbtish@gmail.com` with the existing owner UID configured in Firestore Rules.
- The ZIVO economy is an internal platform-credit prototype on Spark. It is not cash and not a tradable token.

## News
- GitHub Actions refreshes `data/news.json` every hour.
- The site reads the live JSON from GitHub first, then falls back to the local copy.
- This means news updates do not require a Firebase Hosting deploy.

## Free-plan architecture
Cloud Functions are intentionally excluded from this production upload. They require Blaze in the current Firebase project. Server-authoritative game rewards and a future blockchain/token layer should be added later when the project is ready.

## Deploy
`firebase deploy --only hosting,firestore`
