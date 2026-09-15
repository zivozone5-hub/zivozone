# V1110 Clean-Core Verification Contract

- No production `core/legacy/` runtime.
- JavaScript syntax check must pass.
- One canonical Math bank (`math-01` through `math-50`) with no overwrite.
- Canonical `ZIVOZONE.Auth`, `Player`, `Economy`, `Challenges`, `Cloud`, `App` contracts.
- Economy is the only ZIVO credit surface.
- Challenge progress is applied once; result events carry a core guard.
- Existing UI section IDs and Firebase configuration are unchanged.
