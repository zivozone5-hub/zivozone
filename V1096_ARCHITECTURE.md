# ZIVOZONE V1096 — ARCHITECTURE CORE

## Goal
Safe migration without changing the existing visual identity or deleting working functionality.

## Runtime
`core/runtime/zivo-runtime.js` remains the verified compatibility source-of-truth for this release. The migration is facade-first: new code gets one canonical public contract while legacy APIs remain available until dependency usage is proven safe to remove.

## Canonical modules
- `core/modules/auth.js` → `ZIVOZONE.Auth`
- `core/modules/player.js` → `ZIVOZONE.Player`
- `core/modules/economy.js` → `ZIVOZONE.Economy`
- `core/modules/challenges.js` → `ZIVOZONE.Challenges`
- `core/modules/news.js` → `ZIVOZONE_NEWS`
- `core/modules/ui.js` → `ZIVOZONE.UI`
- `core/app.js` → architecture manifest and migration boundary
- `core/styles/architecture.css` → canonical V1096 layer

## News
Two independent rails are wired:
- `#z50track` — Sports
- `#zivoGeneralTrack` — General

They use:
1. local cache
2. GitHub-hosted `data/news.json`
3. same-origin `data/news.json` fallback
4. safe Arabic fallback headlines if feeds are empty
5. duplicated sequence for continuous marquee
6. responsive speed recalculation on resize
7. reduced-motion support
8. safe URL allow-list

## Economy migration rule
Do not delete legacy economy functions in V1096. New modules must use `ZIVOZONE.Economy`. Legacy calls are removed only after a dependency map confirms zero live references.

## CSS migration rule
The news rail base styles are now owned by `core/styles/architecture.css`; the legacy bundle keeps the remaining historical styles to avoid visual regressions. Future CSS extraction should be selector-verified and incremental.

## Release
`V1096 ARCHITECTURE CORE`
