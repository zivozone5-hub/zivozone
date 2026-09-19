# ZIVOZONE Unified Game Platform — V1197.1

## Purpose

V1197.1 hardens the existing V1197 Release Candidate without creating a second Core, Runtime, Economy, Challenge Engine, or Game Bridge.

The platform has one entry point for game lifecycle and result validation:

`Room → Game Platform → Game Session → Game Bridge/Adapter → Validated Result → Challenge/Economy`

## Architecture

- `core/modules/runtime/game-registry.js` — single manifest-backed registry.
- `core/modules/runtime/game-loader.js` — lazy loader; no game assets are loaded at boot.
- `core/modules/runtime/game-session.js` — lifecycle state machine and single-result session identity.
- `core/modules/runtime/game-bridge.js` — canonical iframe/postMessage bridge.
- `core/modules/runtime/game-adapters.js` — compatibility adapters, currently Ruffle for SWF.
- `core/modules/runtime/game-validator.js` — canonical result validator; rejects replay/duplicate/invalid results.
- `core/modules/runtime/game-telemetry.js` — lifecycle events without sensitive payloads.
- `core/modules/runtime/game-platform.js` — facade used by internal/native providers so they use the same validation path.

No room receives its own GameBridge.

## Registry

Games are declared in `games/manifest.json`.

Required fields:

- `gameId`
- `title`
- `room`
- `type`
- `engine`
- `version`
- `enabled`
- `rewardPolicy`

Optional fields include `src`, `asset`, `width`, `height`, `orientation`, `allowedOrigin`, `sandbox`, `difficulty`, and `category`.

A disabled or missing asset must never break the room.

## Lifecycle

`LOADING → READY → STARTED → PLAYING → PAUSED → COMPLETED | FAILED | TIMEOUT → CLOSED`

A session accepts one final result only.

## Game Protocol

Host → Game:

- `zivo:host:init`
- `zivo:host:start`
- `zivo:host:pause`
- `zivo:host:resume`
- `zivo:host:close`

Game → Host:

- `zivo:game:ready`
- `zivo:game:start`
- `zivo:game:progress`
- `zivo:game:result`
- `zivo:game:close`
- `zivo:game:error`

Every message is bound to the iframe source, exact allowed origin, session ID and game ID.

## Result Contract

A game returns only:

```json
{
  "sessionId": "...",
  "gameId": "...",
  "room": "...",
  "score": 0,
  "correct": 0,
  "total": 0,
  "duration": 0,
  "completed": true,
  "timedOut": false,
  "version": "1.0.0"
}
```

Game payloads must not contain:

- `zivo`
- `walletAmount`
- `rewardAmount`
- `walletBalance`

The validator adds the derived `perfect` flag after validation.

## SWF / Ruffle

SWF support is compatibility support for legacy games the project is authorized to use.

- Adobe Flash Player is not used.
- Browser Flash plugins are not used.
- SWF files are same-origin assets.
- Ruffle is loaded lazily only when a SWF game is opened.
- A missing/incompatible SWF produces a recoverable room-level error.

The default adapter URL is configurable with `window.ZIVOZONE_RUFFLE_URL`.

## Security Boundary

The intended flow is:

`Game → Validated Result → Challenge Engine → Reward Claim → Firestore → Wallet Ledger`

The game never writes Firebase wallet data and never receives a wallet balance.

Firestore rules now require challenge reward claims to carry the game-platform validation markers and a validation session ID, in addition to the existing 10/10 policy checks.

### Important deployment limitation

Client-side validation plus Firestore Security Rules on the Firebase Spark plan can prevent ordinary malformed/replayed writes and enforce the data contract, but it cannot prove that a hostile browser genuinely played a game. A fully trustless anti-cheat boundary requires trusted server-side attestation/logic (for example Cloud Functions or another trusted backend). This release does not pretend that browser code can provide that cryptographic guarantee.

## Rooms

Existing room engines remain owners of their domain logic:

- Puzzle Room — existing challenge/puzzle logic.
- Dark Room — existing staged challenge/cinema logic.
- Forensic Lab — `forensic-case-core.js` remains the case owner.
- Beauty Room — `beauty-room.js` remains the beauty-domain owner.

They share the unified Game Platform rather than creating room-specific bridges.

## Match Center

The V1197 Match Center remains the existing implementation. The data validator was corrected to validate V1197 snapshots and explicitly preserve home/away score mapping under RTL.

Static snapshots remain a reliability fallback; direct live enrichment is attempted without replacing a valid snapshot with an empty response.

## QA

Run:

```bash
python scripts/qa_game_platform.py
python scripts/validate_match_data.py
```

All project JavaScript files can also be syntax-checked with:

```bash
for f in $(find core -name '*.js'); do node --check "$f"; done
```

The static QA is contract QA, not browser E2E. Browser-level testing still requires a real browser environment and a deployed Firebase target.

## Adding a New Game

1. Add the asset/provider.
2. Add one manifest entry to `games/manifest.json`.
3. Use `GameLoader` / `GameBridge` for web/iframe games.
4. Use the Ruffle adapter for authorized SWF games.
5. Return only the result schema.
6. Never add wallet or reward logic to the game.

The target is:

`New game = Asset + Manifest Entry`

not a new Core or Runtime.
