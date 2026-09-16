# ZIVOZONE V1130 — UNIFIED BROADCAST + REGIONAL MATCH CENTER

## Engineering scope
- Added a dedicated global-news stream (`world`) while retaining the existing sports and Jordan news streams.
- Added two synchronized broadcast rails: top and bottom, with controlled rotation and pause/play.
- Preserved the existing 19px headline typography.
- Expanded Match Center with Jordan, Iraq, Qatar, UAE and Egypt leagues.
- Results mode now means exactly the previous three calendar days.
- Added a regional static feed (`data/regional-matches.json`) designed as a replaceable provider layer.
- Regional match details open safely without attempting unsupported ESPN event-summary calls.
- Activated wallet/mining directly inside ZIVO HUB.
- Bumped architecture/version markers to V1130.
- JS syntax validation passed with `node --check` for all active JavaScript modules.

## Data architecture
Major international leagues continue to use the existing public ESPN scoreboard provider.
Regional leagues use a dedicated JSON feed so the UI remains deployable on Firebase/GitHub free hosting and does not require a paid server.

The regional feed is intentionally isolated from the UI. It can later be replaced by a scheduled API/Cloud Function/GitHub Action without rewriting Match Center.

## Important operational note
The regional JSON is a deployable snapshot, not a claim of permanent real-time coverage. A future scheduled updater should replace `data/regional-matches.json` from an approved provider.
