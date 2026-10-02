# ZIVOZONE V1230.1 — Quad-Race

## Implemented
- Solo/Online mode chooser before every canonical challenge.
- Four-player matchmaking by challenge + approximate player level.
- Five-second server countdown.
- Server-selected 10-question match pack.
- Server-side answer validation and live progress broadcast.
- Accuracy-first ranking, then elapsed milliseconds as tie-breaker.
- Disconnect/forfeit handling without stopping the room.
- 15-second bot injection when a real room cannot fill.
- Local bot fallback when no realtime server is configured.
- Mobile-first queue, HUD, leaderboard and podium UI.
- Seven-language UI keys for the new feature.
- Direct-answer question support for numeric/text questions.
- Optional Firestore final-match persistence from Node.js via Firebase Admin.
- Firebase Hosting excludes the entire `server/` directory, including the private answer key.

## Important deployment model
Firebase Hosting still serves the normal ZIVOZONE web app. The realtime Quad-Race Node.js server is a separate process.

Set `QUAD_RACE_SERVER_URL` in `core/config.js` to the public Socket.IO server origin when you deploy the realtime server. If it remains empty, the site waits 15 seconds and then starts a clearly labeled local ZIVO BOT fallback; this fallback does not issue real ZIVO rewards.

## Security model
The browser receives question text/options but not the correct answer index. The Node.js server validates answers, timing, ordering, disconnects and final ranking.

Real ZIVO wallet issuance is intentionally not performed by the browser. Final Firestore persistence and future server-authoritative reward issuance belong on the trusted Node.js side when Firebase Admin credentials are configured.
