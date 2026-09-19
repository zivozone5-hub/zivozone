# ZIVOZONE V1205 — FULL PLATFORM SFX COVERAGE

## Scope
Expanded the central AudioManager integration across platform UI interactions while preserving user-gesture gating.

## Coverage
- Buttons, links, summaries, and role=button controls receive subtle click SFX by default.
- Semantic primary actions receive heavy click SFX.
- data-sfx="click|heavy" remains the explicit override.
- data-sfx="none" or data-audio-ignore="true" suppresses automatic SFX.
- Menu open/close custom events retain menu_open/menu_close.
- Economy retains success_coin and purchase_burn hooks.
- Challenge win/fail retain challenge cues.
- Chat notification remains limited to newly added incoming messages.

## Audio Safety
- No automatic unlock on page load.
- User gesture unlock remains mandatory.
- SFX throttle prevents rapid duplicate playback.
- Missing audio assets fall back safely without crashing.
- Ambient and SFX volume/mute state are separate.

## QA
Static integration checks: PASS.
Browser E2E / Firebase Emulator E2E: NOT CLAIMED without a stable external browser/emulator runtime.
