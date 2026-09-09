# ZIVOZONE V57 — Cloud Identity & AI Gateway

## Core changes
- Added a unified cloud-account status layer.
- Added account entry UI without exposing credentials in client code.
- Added a local/offline activity queue foundation.
- Added a secure AI gateway contract: frontend calls `/api/ai` (or `ZIVOZONE_AI_ENDPOINT`), while secrets stay server-side.
- Existing player identity, ZIVO, XP, retention, game adapter and sports ticker are preserved.

## Production wiring required
The final production connection must use the project's real Firebase configuration and existing Auth/Firestore setup. This release intentionally does NOT invent a Firebase project ID, credentials, API keys, or backend URLs.

Recommended server contract:
- Auth: Firebase Authentication
- Player: `players/{uid}`
- Attempts: `players/{uid}/gameAttempts/{attemptId}`
- Wallet: `players/{uid}/wallet/ledger/{transactionId}`
- AI: authenticated HTTPS Cloud Function `/api/ai`
- Sports: authenticated/cached sports ingestion function -> normalized feed

Security rule:
Client never writes authoritative `zivo`, `xp`, `level`, reward amounts, leaderboard scores, or verified game results directly.
