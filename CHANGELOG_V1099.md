# ZIVOZONE V1099 — PLAYER CORE MIGRATION

## Goal
Move V30 → V31 → V32 → V33 → V34 → V35 → V36 → V37 functionality into the canonical in-site Core without keeping their legacy runtime files loaded.

## Migrated
- V30 + V35 → `core/modules/player.js` / `ZIVOZONE.Player` + `ZIVOZONE.Progress`
- V31 → `core/modules/achievements.js`
- V32 → `core/modules/daily.js`
- V33 → `core/modules/competition.js`
- V34 → `core/modules/missions.js`
- V36 → `core/modules/cloud.js`
- V37 → `core/modules/player-hub.js`

## UX cleanup
- Removed floating launchers for V30–V39 from the main site.
- Added a compact player-tools row inside the existing Profile section.
- Removed obsolete cloud/floating status UI.
- Removed V38/V39/V40/V43/V44 script dependencies from the deployment.
- Removed duplicate Firebase App Check script tag.

## Compatibility
Existing localStorage keys are preserved so player progress, achievements, daily state, competition state, missions and cloud queue are not discarded.

## Safety
Legacy source files are not shipped in the deployment ZIP. A private working backup was retained outside the release package for rollback during QA.
