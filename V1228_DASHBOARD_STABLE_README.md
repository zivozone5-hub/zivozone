# ZIVOZONE V1228 — DASHBOARD STABLE / REAL DATA CORE

This release is based on V1227 and patches the Dashboard-facing architecture without adding fake
progress or placeholder game routing.

## Main changes

- Dynamic feature gate in `core/modules/runtime/router.js`
  - loads `games/manifest.json`
  - reconciles enabled manifest games, loaded runtime challenge banks and loaded module capabilities
  - hides unavailable `[data-game]`, `[data-challenge]`, puzzle/beauty/story/health cards
  - blocks stale challenge routes with a Toast:
    `هذه الغرفة يتم تجهيزها سينمائياً حالياً، انتظرنا قريباً!`
- Match Center uses `data/matches/index.json` and latest available static snapshot when today's file is missing.
  - Current snapshot available in this release: `2026-09-20.json`
  - UI fallback label: `نتائج الجولة الأخيرة`
- Player Hub reads numeric player values from `ZIVOZONE.State.playerData`.
  - New player defaults: level 1, XP 0, games 0, balance 0, best score 0, streak 0.
- `core/state.js` now has an explicit `playerData` slice.
- `core/modules/player.js` publishes its canonical player state into `State.playerData`.
- Daily Challenge resolves its displayed title from the live challenge bank and can consult
  `data/stories/index.json` / `data/news.json` instead of inventing a title.
- News remains defensive and data-driven from `data/news.json`, with validated fallback only when the source is empty.
- Challenge renderer emits `zivozone:challenges-rendered`, allowing the Router to reconcile the newly generated cards.
- Runtime asset query versions and Service Worker cache references were advanced to V1228.

## Deploy

Run Firebase deployment from this directory itself:

```bat
cd /d ZIVOZONE_V1228
firebase use zivozone-fc6ed
firebase deploy --only hosting
```

Do not deploy the parent directory.
