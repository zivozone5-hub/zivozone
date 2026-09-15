# ZIVOZONE V1101 — CLEAN CORE PHASE 1

## Goal
Remove the historical `core/legacy` runtime layer without changing the current visual/UI contract.

## What changed
- Removed `core/legacy/` from the runtime tree.
- Removed historical V34/V35/V36/V39/V40/V41/V42/V43/V44/V46/V47/V48/V49/V50 patch scripts from deployment.
- Consolidated the still-required runtime services under `core/services/` with semantic names.
- Updated `index.html` and `sw.js` to use the consolidated service paths.
- Kept canonical `core/modules/` contracts intact.
- Added V1101 architecture diagnostics.

## Next phase
The files in `core/services/` are transitional. They must be refactored one service at a time into true canonical modules, starting with:
1. `auth-runtime.js` -> `core/modules/auth.js` (remove facade dependency)
2. `challenge-bank.js` + `secondary-bank.js` + `bank-expansion.js` -> `core/modules/challenge-bank.js`
3. `challenge-runtime.js` + `challenge-center.js` -> `core/modules/challenge-engine.js`
4. `dark-room.js` -> `core/modules/dark-room.js`
5. `cloud-progression.js` -> canonical Cloud/Player service
6. Remove remaining compatibility globals after consumers are migrated.

## Safety rule
No visual redesign and no feature deletion in this phase. This is a structural cleanup only.
