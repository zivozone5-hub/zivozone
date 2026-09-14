# ZIVOZONE V1095 — PLAYER CORE

## Objective
Create one canonical player-facing state while preserving existing V17/V21/V26/V29 compatibility APIs.

## Canonical record
`localStorage: zivozone_player_core_v1095`

The record normalizes:
- uid, name, email, age
- level, XP
- ZIVO / coins alias
- games, best score, streak
- challenge history
- skill stats
- daily state
- schema version

## Compatibility
Legacy APIs are retained. `ZIVOZONE_PLAYER` and `ZIVOZONE_V21` resolve to the canonical player record after the bundle loads.

## Migration
On first load V1095 reads available legacy records from V17, V21, V29 and the authenticated player, selects the richest compatible record, normalizes it, and stores the canonical copy.

## Scope guard
V1095 does not redesign the home page and does not alter Dark Room flow. Economy authority remains separate; the Player Core never authoritatively adds ZIVO.

## Next gate
Before V1096, test registration/login, logout, player profile, challenge completion, XP persistence, and Firebase sync. Only after these pass should legacy writers be removed.
