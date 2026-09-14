# ZIVOZONE V1096 — TRUE CLEAN CORE

Production cleanup based on the supplied ZIVOZONE ZIP.

## Runtime
- `index.html` loads one application runtime: `zivozone-core.js`.
- One production CSS bundle: `zivozone.css`.
- Legacy source files are archived under `archive/legacy/` and are NOT loaded.
- Homepage structure and visual identity are preserved.

## Economy hardening
- Perfect challenge reward is server-side Firestore transaction based.
- 10/10 with zero timeout grants exactly +10 ZIVO once per event ID.
- Mining uses a rolling 24-hour cooldown and Firestore transaction.
- Duplicate challenge result listeners were reduced to the canonical `zivozone-result` event for reward processing.

## News
- The two rails remain independent.
- `data/news.json` is the source file used by the runtime.
- A fallback path remains available when the remote news source is unavailable.

## Firebase
- Firestore rules remain included.
- Storage rules are explicitly wired in `firebase.json`.

## Rollback
All non-production files from the supplied ZIP are retained in `archive/legacy/`.
