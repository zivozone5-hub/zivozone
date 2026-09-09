# ZIVOZONE V7 Premium

Upgrade layer over the existing ZIVOZONE Firebase project.

## Included
- Existing Firebase Authentication + Firestore persistence preserved.
- Existing 5-language system preserved: Arabic, English, Chinese, Hindi, Spanish.
- Expanded challenge engine and reliable event delegation for buttons.
- Infinite Dark Room mode with 10-question checkpoints and no right/wrong reveal.
- Strong adaptive stereo horror ambience using Web Audio API.
- Challenge-specific sound identities.
- 3D rotating Z brand effects.
- Live sports news loader using public ESPN site APIs, plus existing TheSportsDB match data.
- Independent ad presentation/control module.

## Upload
Replace the existing files in the GitHub Pages root with all files in this folder, including the new `news.js` and `ads.js`.
Do not change the Firebase configuration in `index.html`.

## Firebase
No Firebase credentials were changed. Existing Authentication and Firestore collections remain the source of truth for signed-in player data and results.

## V48 Production Hardening
- Added a compatibility bridge that normalizes legacy V18/V22/V40 challenge schemas so every challenge card resolves through one API.
- Added Firebase Functions client compatibility for the existing server scoring function.
- Added server-side canonical answer verification generated from the shipped challenge banks.
- Added question-ID based scoring to prevent the browser from choosing which answer key is used.
- Added offline/online queue flushing, Escape-to-close modal behavior, active navigation state, local-date daily reset handling, and runtime diagnostics.
- Existing Firebase project/config, Firestore rules, audio, sports/news, ads, profile, and legacy layers remain in place.
