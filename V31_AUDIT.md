# ZIVOZONE V31 — Achievements

Audit:
- Core files present.
- JavaScript syntax passed before and after modifications.
- Existing Firebase/Auth, V29 leaderboard, V28 cloud queue, V30 player identity, ZIVO economy, challenge/audio/news/language/ad systems preserved.

Added:
- Achievement definitions and unlock tracking.
- Player achievement center.
- Progress counter.
- Shareable text player card using native share when available or clipboard fallback.
- Dark Room achievement detection when the existing challenge progress event identifies a horror/dark challenge.

Security:
Achievements are informational client-side badges until trusted server-side validation is enabled.
