# ZIVOZONE V60 — Real Player System + Challenge Reliability

Implemented:
- Universal 30-second challenge timer.
- Timer emits `zivozone:question-timeout` when time expires.
- Unified game completion pipeline compatible with V59 cloud attempts.
- Firebase-ready player identity/profile sync retained.
- AI frontend now uses a real backend gateway contract.
- Added Firebase Functions AI endpoint contract without exposing provider secrets.
- Challenge UI explicitly displays 30 seconds per question.

Important production step:
The AI endpoint returns a configuration error until a real AI provider is configured in Firebase Functions/Secret Manager. This is intentional: no fake AI and no secret in GitHub Pages.

Recommended final production wiring:
Firebase Auth -> Firestore Player -> Game Attempt -> Cloud verification -> Wallet Ledger -> Achievement -> AI context -> Leaderboard.
