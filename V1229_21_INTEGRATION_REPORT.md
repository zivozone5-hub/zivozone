# ZIVOZONE V1229.21 — Integrated Runtime/State Pass

## Scope
Applied incrementally on V1229.20. No new Core, Runtime, Economy, Router, or i18n layer was introduced.

## Changes
- Economy now publishes its cloud-authoritative wallet/mining snapshot into the existing `ZIVOZONE.State` read model after refresh.
- Logout state clears the corresponding State slices instead of leaving stale wallet/mining data in the in-app state layer.
- State cache namespace advanced to `zivozone:v1229:` to avoid mixing older cached slices with the current release.
- Economy persisted mode/version markers advanced from legacy 1202/1127 labels to V1229.
- Economy module-ready event now reports V1229 instead of the stale 1202 value.
- Boot diagnostics now read the centralized application version instead of a hardcoded release number.
- Config advanced to `1229.21` / `1229.21-clean-core`.
- Bundle rebuilt from the official 49-file manifest.

## Validation
- Site verification: 17/17 PASS
- Bundle freshness: PASS
- i18n coverage: PASS — 298 keys
- i18n completeness: PASS — 7/7 languages
- Firestore rules structural QA: PASS
- Game platform QA: 30/30 PASS
- Game result cases: 7/7 PASS
- Match data validation: PASS
- SEO basics: PASS
- Ads/consent wiring: PASS

## Environment limitation
Playwright/browser-dependent QA remains NOT TESTED in this environment because the required Playwright browser executable is unavailable. This is not counted as a site PASS.

## Baseline
This archive is the new incremental baseline: `ZIVOZONE V1229.21`.
