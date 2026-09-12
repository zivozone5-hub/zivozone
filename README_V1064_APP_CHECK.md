# ZIVOZONE V1064 — App Check / reCAPTCHA Enterprise

Integrated the registered Firebase App Check Web app with reCAPTCHA Enterprise.

## Changes
- Added `firebase-app-check-compat.js` to the main web app.
- Added the registered reCAPTCHA Enterprise site key to `window.ZIVOZONE_SECURITY`.
- Initializes App Check immediately after Firebase initialization and before Auth/Firestore.
- Enables App Check token auto-refresh.
- Initializes App Check for the separate modular Firebase AI Logic app used by `zivo-ai.js`.

## Important
This package sends App Check tokens, but Firebase product enforcement should be enabled only after deploying and monitoring valid traffic in Firebase Console > App Check.

The reCAPTCHA Enterprise site key is a public browser key. Do not put any reCAPTCHA secret or service-account credential in the frontend.
