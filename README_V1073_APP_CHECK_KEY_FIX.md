# ZIVOZONE V1073 — App Check key correction

## What was fixed
The production reCAPTCHA Enterprise site key in `index.html` had a one-character transcription error.

- Wrong key in V1072: `6LcDYbctAAAAAHJP_2BRgSXi3cnq1iKxCNTIhZBW`
- Correct key from the registered **ZIVOZONE WEB** key in Google Cloud: `6LcDYbctAAAAAHJP_2BRgSXi3cnq1iKxCNTH1zBW`

This mismatch can cause the browser to fail reCAPTCHA Enterprise attestation and produce:
`AppCheck: ReCAPTCHA error (appCheck/recaptcha-error)`

## Important
The Google Cloud key shown in the console is a score-based Web key. The domain `zivozone.com` is sufficient to cover its subdomains, including `www.zivozone.com`.

Do not place the reCAPTCHA secret key in the frontend.

## Deploy
Run from the folder containing `firebase.json`:

```cmd
firebase deploy --only hosting
```

Then open `https://www.zivozone.com`, press Ctrl+F5, and test ZIVO AI.
