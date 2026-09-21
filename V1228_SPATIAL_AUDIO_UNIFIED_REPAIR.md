# ZIVOZONE V1228.1 — Spatial Audio Unified Repair

- One `AudioContext` only: `core/modules/audio.js`.
- HRTF `PannerNode` is used for ambient and spatial effects.
- `audio-spatial.js` is now a compatibility facade and never creates an AudioContext.
- Room navigation remains in `zivo-platform-app.js` and uses the canonical spatial room registry.
- Ambient transitions use a single crossfade path; duplicate legacy ambient playback is removed.
- Browser autoplay is respected: audio is unlocked only after user interaction.
