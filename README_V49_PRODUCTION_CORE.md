# ZIVOZONE V49 — PRODUCTION CORE

V49 is a controlled, additive hardening release on top of V48 Foundation.

## Preserved
- Firebase configuration and existing Auth/Firestore contract.
- Challenge banks and legacy archive.
- Single active UI controller.
- 10-second question timer.
- Correct/total scoring, XP and ZIVO rewards.
- Dark Room special path and challenge-only audio lifecycle.
- Identity 20-question test.
- Sports/news/ads modules and existing public UI.

## Hardening in V49
- Stable question IDs for legacy questions without IDs; prevents history resets caused by random IDs.
- Correct normalization for legacy `options + answer` question format, avoiding accidental free-text rendering.
- Shared timeout-safe JSON runtime fetch wrapper for sports/news sources.
- Horror event sounds are now actually exposed by the audio API.
- Safer modal close behavior and challenge cleanup.
- Extended runtime audit information.
- Cache-busting moved to V49.

## Rule
Do not create another UI engine. Extend the foundation or add one isolated service module.
