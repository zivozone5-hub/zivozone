# ZIVOZONE V1072 — App Check / AI final client fix

- Removed duplicate legacy App Check initialization from the compat runtime.
- ZIVO AI now uses the single default Firebase app instead of creating a second named app.
- ZIVO AI initializes modular App Check exactly once and waits for a real token before creating Firebase AI Logic.
- Cache-busted zivo-ai.js reference to v1072.0.

Console requirements remain mandatory: the reCAPTCHA Enterprise key must be SCORE-based, the exact same raw site key must be registered for ZIVOZONE WEB in Firebase App Check, and the production domains must be allowed on that key.
