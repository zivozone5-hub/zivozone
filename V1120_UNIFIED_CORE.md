# ZIVOZONE V1120 — TRUE UNIFIED CORE PACKAGE

This package is the audited V1111 foundation repackaged into a single runtime boundary.

## Canonical order
State → Auth → Player → Challenges → Rewards → Economy → Cloud → UI

## Runtime boundary
All historical runtime scripts are consolidated into `core/runtime/compatibility-engine.js` and are no longer loaded as scattered `core/legacy/*.js` files. V1080/V1081 superseded core layers are excluded from the runtime bundle.

## Safety rule
The compatibility engine remains intentionally isolated because the challenge bank and challenge-center implementation still contain historical dependencies. It is not considered final application architecture; it is the controlled migration boundary for the next E2E-tested removal.

## Verification performed
- All JavaScript files syntax-checked.
- index.html script references checked against package files.
- No `core/legacy/*.js` references remain in index.html.
- V1080/V1081 runtime files are excluded.
- Canonical State, Auth, Player, Challenges, Economy, Cloud, Rewards and UI contracts are loaded.
