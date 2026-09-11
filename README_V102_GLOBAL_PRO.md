# ZIVOZONE V102 GLOBAL PRO

This build fixes the production UX and Firebase flow requested for ZIVOZONE.

## Included
- Admin account is **raefalbtish@gmail.com** only.
- Admin is shown as `ADMIN` in the top account control and does not get a player profile or mining wallet.
- Admin console remains available only to the owner account.
- Registration requires explicit acceptance of ZIVOZONE Terms of Use.
- Terms explain that ZIVO is a virtual in-platform unit, not cash, not an investment, and not automatically redeemable outside ZIVOZONE.
- Terms acceptance version/timestamp are stored with the account.
- Daily mining: first click credits **+0.50 ZIVO** immediately, then a compact **24:00:00** countdown appears; the next claim is available after 24 hours.
- Mining uses an atomic Firestore transaction on Spark as a secure fallback. If Cloud Functions are deployed later, the server callable is used first.
- Second/general news ticker is significantly slower on desktop and mobile.
- News ticker rejects URLs outside a curated safe-source allowlist; unsupported/broken sources are excluded rather than displayed as clickable news.
- Mobile-first economy UI remains compact and premium.

## IMPORTANT Firebase step
The previous deployment was Hosting-only. The Admin room and Spark mining fallback also depend on the Firestore rules being deployed.

Run from `v95build`:

```bat
firebase deploy --only firestore:rules,hosting
```

Do **not** deploy Functions unless your Firebase project is on a billing-enabled plan. The client has a Spark-safe mining fallback.

## Admin login
Use the existing Firebase Authentication account:

`raefalbtish@gmail.com`

The admin email is reserved for the admin account and cannot be used through the public registration form.
