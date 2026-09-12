# ZIVOZONE V1064.3 — App Check / AI Logic fix

Changes:
- Removed the manual App Check token fetch from zivo-ai.js. Firebase AI Logic now obtains and manages the App Check token itself, including limited-use tokens.
- Kept reCAPTCHA Enterprise App Check initialized exactly once on the same modular Firebase app instance used by Firebase AI Logic.
- Improved the App Check error to show the actual hostname so a domain mismatch is immediately visible.
- Bumped the service-worker cache and zivo-ai.js query version to force the browser to load the corrected AI module.

Important:
- The reCAPTCHA Enterprise key must be the SITE KEY ID only, not the HTML script snippet.
- The key must allow the exact production hostname used by the site. For this project the intended production hostname is zivozone.com (and add www.zivozone.com if it is used).
- If testing on the Firebase Hosting URL zivozone-fc6ed.web.app, that hostname must also be allowed by the reCAPTCHA key, or test only on zivozone.com.
- In Firebase Console > Security > App Check > Apps, ZIVOZONE WEB must remain Registered with reCAPTCHA Enterprise.
- In Security > App Check > APIs, Firebase AI Logic must be enforced/verified as appropriate for the project.
