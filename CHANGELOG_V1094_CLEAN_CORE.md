# ZIVOZONE V1094 — CLEAN CORE

- Established canonical Player progression writer: `ZIVOZONE_AUTH.savePlayerProgress()`.
- Added `progressionVersion: v1094` to progression documents.
- Kept ZIVO economy isolated from progression writes.
- Updated Player Hub to prefer Firebase/Auth player state over the legacy V21 local mirror.
- Added architecture contract documenting canonical service ownership.
- Preserved legacy adapters for rollback safety; no destructive deletion yet.
- No homepage redesign and no new user-facing feature added.
