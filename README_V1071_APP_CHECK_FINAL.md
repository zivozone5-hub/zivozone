# ZIVOZONE V1071 — App Check final fix

Fixed the V1070 deployment issue where the App Check site-key declaration was accidentally commented out by a literal `\\n` sequence. The browser therefore saw no `window.ZIVOZONE_SECURITY.appCheckSiteKey` and ZIVO AI displayed the Arabic invalid/not-configured key message.

The site key is now executed as JavaScript and remains the raw public reCAPTCHA Enterprise site key only.

Firebase App Check with reCAPTCHA Enterprise must use a valid score-based web site key registered for the production domains. App Check must be initialized before Firebase AI Logic requests.
