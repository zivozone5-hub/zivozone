# ZIVOZONE V1204 — Audio UX QA

## Scope
Central AudioManager, user-gesture policy, UI SFX delegation, Ambient/SFX volume separation, challenge result SFX, economy sounds, chat notifications, and lifecycle cleanup.

## Changes
- Reworked `core/modules/runtime/audio.js` around a single AudioManager.
- SFX decode/preload occurs after a real user gesture; page load never unlocks AudioContext.
- Added per-SFX throttle and Web Audio buffer playback with safe synthesized fallback.
- Ambient gain now honors `ambientVolume` rather than only the track preset.
- Removed duplicate challenge win/fail playback in `puzzle-room.js`.
- Chat notification now fires only for newly-added incoming documents.
- Economy wallet open/close and successful mining now emit the appropriate UI/economy SFX.

## Browser gesture policy
Audio is unlocked only from trusted `pointerdown` or `keydown` events. `boot.js` no longer calls `unlock()` on page load.

## QA gates
- JavaScript syntax: required.
- SFX registry: 9 entries required.
- Duplicate puzzle result SFX: removed.
- Chat notification: docChanges-based.
- Ambient volume propagation: required.
- Automated browser/Firebase E2E: environment-dependent and must not be marked PASS without an actual browser/Firebase run.
