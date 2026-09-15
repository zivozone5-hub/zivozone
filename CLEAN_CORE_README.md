# ZIVOZONE V1095 — CLEAN CORE SAFE

This build is a conservative engineering refactor of V1095.

## Guarantees
- Official Admin email remains `raefalbtish@gmail.com`.
- Existing runtime behavior is preserved as the priority.
- Historical archive/changelog folders are excluded from the production package.
- Runtime is moved to `core/runtime/zivo-runtime.js`.
- Configuration is centralized in `core/config.js`.
- Non-invasive diagnostics are available through `window.ZIVOZONE_CLEAN_CORE`.
- No paid service, VPS, paid API, or new backend is introduced.

## Important
This build deliberately does NOT perform blind dead-code deletion. V1095 contains many legacy/additive layers whose runtime dependencies must be proven before removal. This version establishes a safer structural baseline first.

## Next engineering stage
Use the diagnostics and dependency inventory to merge duplicated Player/Economy/Event implementations one subsystem at a time, with regression tests after each migration.
