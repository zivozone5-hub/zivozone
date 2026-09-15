# ZIVOZONE V1111 — UNIFIED NEWS CORE

## What changed
- Rebuilt the news ticker as one active `core/modules/news.js` implementation.
- Removed the V85 legacy news-separation runtime from the build and service-worker shell.
- Removed duplicate legacy CSS overrides for the ticker.
- Made the ticker compact on desktop and mobile.
- Fixed the continuous animation by dynamically repeating headlines until the sequence is wider than the visible window.
- Local `data/news.json` renders first; GitHub raw data is a background refresh source.
- Added timeout/error fallback and last-good local cache.
- Added Firebase no-cache headers for `data/news.json`.
- Kept the solution compatible with free/static hosting: Firebase Hosting + GitHub Actions + static JSON; no server, paid API, or Cloud Function required.

## Runtime contract
`window.ZIVOZONE_NEWS.load()` and `.refresh()` remain available.

## Deployment
Deploy the contents of this version normally with Firebase Hosting.
