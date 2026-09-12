# ZIVOZONE V1086 — CLEAN CORE

Clean production baseline derived from the original V1085 TRUE CORE.

## Architecture
- One HTML shell with no inline CSS or application JavaScript.
- One consolidated stylesheet: `styles.css`.
- One centralized public runtime configuration: `zivozone-config.js`.
- One minimal runtime bootstrap: `zivozone-runtime.js`.
- Main application remains in `zivozone-app.js`, with a single initialized `window.ZIVOZONE_INTERNAL` namespace.
- Firebase/Auth/Firestore are loaded before the application.

## Admin
- Admin email: `raefalbtish@gmail.com`

## Release checks
- JavaScript syntax checked with Node.js.
- Legacy inline bootstrap handlers removed from `index.html`.
- Core functionality preserved; legacy-compatible component CSS retained in the consolidated stylesheet.
