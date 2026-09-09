# ZIVOZONE V43 — Real Cloud Core

## Why this release
V42 introduced cloud question history, but the previous Firestore rules did not explicitly permit the new
`players/{uid}/zivozone/questionHistory` document. V43 closes that real integration gap.

## Added
- Real Firebase Auth + Firestore health check using the already initialized Firebase app.
- Authenticated player result writes to `players/{uid}/results`.
- Cloud question-history writes to `players/{uid}/zivozone/questionHistory`.
- Offline result queue in localStorage with automatic flush when the browser returns online.
- Visible cloud status indicator.
- No second Firebase initialization.

## Preserved
V42, V41, V40, V39, V38, V37 and V36 layers remain in place.
Existing Dark Room, audio, news, languages, advertisements, ZIVO, XP, missions, competition and challenge
engines are not replaced.

## Security
- Firestore ownership remains UID-based.
- Question content remains server-read-only.
- Sports cache remains backend-write-only.
- Client-side score data should not be considered authoritative for high-value rewards.
  Server-side validation should be added before real-world value is attached to ZIVO.

## Validation
- Core files present: PASS.
- All JavaScript files passed `node --check`: PASS.
- Firestore rules updated to authorize only the signed-in owner for question history.
