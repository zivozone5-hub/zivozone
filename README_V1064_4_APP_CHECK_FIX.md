# ZIVOZONE V1064.4 — App Check / Firebase AI Logic fix

This build removes the duplicate App Check initialization from the legacy compat runtime and makes the Firebase AI Logic bridge use the DEFAULT Firebase app. App Check is initialized once on that same app before `getAI()`.

This addresses the architectural mismatch in the previous V1064.3 build. The reCAPTCHA Enterprise site key remains the raw site key:

`6LcDYbctAAAAAHJP_2BRgSXi3cnq1iKxCNTIhZBW`

Deploy from the extracted project directory:

`firebase deploy --only hosting`

After deployment, hard refresh `zivozone.com` (Ctrl+Shift+R) and test ZIVO AI.
