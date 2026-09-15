# ZIVOZONE V1120 — TRUE UNIFIED CORE / CLEANED

## Canonical modules
State → Auth → Player → Challenges → Rewards → Economy → Cloud → UI.

## Restored
- Player Profile + Player Hub entry point.
- ZIVO Hub with Wallet + Mining.
- Canonical Rewards facade.
- Service worker shell updated to V1120; stale V1110/legacy shell references removed.

## Cleanup
Historical changelogs and archived runtime artifacts are not shipped. Active challenge compatibility remains isolated because the challenge engine still depends on its current bank/auth runtime. It must not be deleted until E2E challenge tests pass.

## Static QA
- All local script sources exist.
- All JavaScript files pass Node syntax validation.
- No `core/legacy/*` paths are referenced by `index.html` or the service worker.
- Rewards module is present and loaded before Economy.
