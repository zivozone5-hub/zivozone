# ZIVOZONE V1070 — Firebase AI Logic + App Check fix

This build fixes the client-side App Check initialization path for ZIVO AI.

## What was fixed
- Uses Firebase App Check with `ReCaptchaEnterpriseProvider`.
- Enables App Check token auto-refresh.
- Waits for a real App Check token before creating/using Firebase AI Logic.
- Retries token acquisition once with a forced refresh.
- Stops hiding App Check initialization failures; the UI can now show the real cause.
- Keeps `gemini-3.5-flash-lite`, which is currently a supported Firebase AI Logic model.
- Keeps the existing ZIVOZONE functionality and Firebase project configuration.

## CRITICAL Firebase Console check
The Firebase App Check registration field **reCAPTCHA Enterprise site key** must contain ONLY:

6LcDYbctAAAAAHJP_2BRgSXi3cnq1iKxCNTIhZBW

Do NOT paste:
- `<script ...>`
- `<!-- reCAPTCHA Enterprise -->`
- a full JavaScript snippet

The reCAPTCHA Enterprise key must be a Web/score-based key and its allowed domains must include the production domains you actually use, such as:
- zivozone.com
- www.zivozone.com (if used)
- zivozone-fc6ed.web.app

After correcting the console registration, deploy this package.

## Deploy
From the extracted folder:

firebase deploy --only hosting

## Important
Do not put a reCAPTCHA secret key or service-account credential in the frontend.
