# ZIVOZONE V1058.1 — Challenge Cinema / Mobile First

## Implemented
- The entire challenge card is now the primary touch/click target.
- The old visible “ابدأ” button is hidden while its compatibility hook remains in the DOM.
- Keyboard Enter/Space also launches the challenge from the card.
- Challenge cards use a cinematic, image-like visual treatment with per-challenge color themes.
- Dark Room receives a dedicated red-lit horror atmosphere: vignette, pulse, scan/noise texture, red progress state, and stronger question-room lighting.
- Mobile challenge runner keeps the full question and answer content readable and scrollable instead of clipping it.
- Existing Firebase/auth/economy/challenge engines are preserved; this patch is additive and Spark-safe.
- No Cloud Functions or paid Firebase features are introduced.

## Deployment
Run from `v95build`:

`firebase deploy --only hosting,firestore:rules`

This release does not require Functions.
