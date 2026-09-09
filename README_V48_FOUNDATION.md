# ZIVOZONE V48 — FOUNDATION BASELINE

This is the new clean application baseline.

## Architecture
The previous UI/game engines are archived under `legacy/` and are NOT loaded by the public page.
The public page now has one application controller: `zivo-foundation.js`.

Loaded service/data modules:
- Firebase Compat 10.12.2
- `auth.js` — existing Firebase Auth + Firestore player persistence
- `challenges.js` — preserved challenge banks
- `audio.js` — challenge-only cinematic audio
- `news.js` — global sports news + Jordan football sources
- `fixtures.js` — major football fixtures + official Jordan schedule
- `ads.js` — independent ad controls
- `i18n.js` — existing localization
- `zivo-foundation.js` — single UI/game orchestration layer

## Preserved cloud contract
The existing Firebase project/config is kept in `index.html`.
Player documents remain under:
`players/{uid}`
Results remain under:
`players/{uid}/results`
Question history uses:
`players/{uid}/zivozone/questionHistory`

No second Firebase app is created.

## Core behavior
- 10 questions per challenge run.
- 10 seconds per question.
- Correct / wrong / timeout are counted.
- Final result is shown as `correct/total` and percentage.
- XP and ZIVO rewards are granted.
- Logged-in progress is synchronized through the existing Auth/Firestore layer.
- Local fallback remains available.
- Challenge audio starts only inside a challenge and is stopped on exit/result.
- Dark Room keeps its special experience and avoids immediate correct/wrong feedback.
- Identity test: 20 questions + short profile paragraph.
- Challenge cards have expressive visual markers.
- Duplicate legacy launchers are removed from the active runtime.
- Loader has CSS and JS fail-safe release paths.
- GitHub Pages cache-busting is set to V48.

## Validation target
The next development step should extend `zivo-foundation.js` or introduce a small isolated module, rather than adding another versioned event-handler layer.
