# ZIVOZONE Dark Room — V1 Gameplay

Integrated directly into `core/modules/challenges.js` and `core/styles/core.css`.

## Gameplay
- No quiz/question flow for the Dark Room.
- Player enters a playable survival world.
- Collect 3 hidden signals.
- Manage a degrading light/battery meter.
- Avoid the pursuing shadow entity; 3 encounters cause failure.
- Navigate around fixed walls/obstacles.
- Reach the final door after collecting all 3 signals.
- Keyboard controls: WASD / arrow keys.
- Mobile controls: on-screen directional pad.
- Final score is based on recovered signals and remaining battery.
- Results are validated through the existing GamePlatform/GameSession/GameResultValidator.

## Architecture
- No new runtime layer.
- No new question bank.
- No new Firebase subsystem.
- Uses the existing Challenges Core mount and existing Game Platform.
- Registered as `dark-room-world-001` with provider engine `zivo-darkroom`.

## QA
- JavaScript syntax: PASS
- Site verification: 17/17 PASS
- Game platform: 30/30 PASS
- Game result security: 7/7 PASS
- Bundle freshness: PASS
- i18n completeness: PASS (298 keys × 7 languages)
- i18n coverage: PASS
- Browser smoke: BLOCKED by execution environment (`ERR_BLOCKED_BY_ADMINISTRATOR` on localhost)
