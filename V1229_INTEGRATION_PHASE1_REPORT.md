# ZIVOZONE V1229 — Incremental Integration Phase 1

## Scope
This phase intentionally makes a small, low-risk integration change. No wallet, mining, reward, Firestore transaction, authentication, or feature architecture was rewritten.

## Changes
1. Centralized runtime version usage for:
   - `core/app.js`
   - `core/modules/match-center.js`
   - `core/modules/player-hub.js`
   - `core/modules/daily.js`
   - `core/modules/runtime/router.js`
2. These modules now consume `window.ZIVOZONE_CONFIG.APP_VERSION` instead of carrying stale `1228` cache/version values.
3. Fixed `scripts/build_bundle.py` so that running it without an explicit version automatically reads the canonical `APP_VERSION` from `core/config.js` instead of falling back to `dev`.
4. Rebuilt `dist/app.bundle.js` from the canonical 49-file manifest.
5. Regenerated all 13 bundled HTML entry pages through the existing build pipeline.

## Why this was done first
The previous build pipeline could silently reintroduce `?v=dev` into story pages even though the application release was `1229.18`. That created a source/build/runtime version inconsistency. Fixing the build authority first prevents later feature work from being built on stale cache-busting metadata.

## Verification
PASS:
- JavaScript syntax
- `verify_site.py` (17/17)
- Phase 1 trust/security invariants
- Undefined identifier audit (51 files)
- Bundle freshness (49 manifest files)
- Firestore rules structural audit
- i18n coverage (7 languages)
- i18n completeness (265 keys)
- Hardcoded Arabic baseline unchanged
- Ads/consent wiring
- SEO basics
- Existing V1228 full QA
- Game result validation
- Question bank integrity (640 questions)
- Game platform QA (30/30)
- Match data validation (13 matches across 3 snapshots)

## Browser verification
NOT PASS / ENVIRONMENT BLOCKED.
Chromium is installed at `/usr/bin/chromium`, but this execution environment blocked the local HTTP test server with `ERR_BLOCKED_BY_ADMINISTRATOR`. No browser success is claimed from this environment.

## Deliberately NOT changed yet
- Wallet transaction path
- Mining transaction path
- Challenge reward transaction path
- Firestore economy rules
- Authentication architecture
- Economy write-behind queue integration
- Match Center read caching
- News caching migration
- UI redesign
- Legacy deletion

These remain separate phases so each change can be tested and rolled back independently.
