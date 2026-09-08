# ZIVOZONE V10 — Cinematic Audio Upgrade

This release preserves the V9 application structure, Firebase/Auth/Firestore, challenge center, languages, sports/news and ad modules.

## Audio changes
- Home page remains silent.
- Each challenge starts its own continuous ambient track.
- Dark Room uses a dedicated cinematic horror bed plus stereo procedural movement.
- Real audio files are bundled locally under `assets/audio/` so GitHub Pages does not depend on an external audio host.
- Dark Room can trigger laugh/scream accent assets sparingly, with procedural spatial effects layered on top.
- Audio stops when leaving a challenge.
- Audio preferences remain stored locally.

## Important licensing note
The bundled audio files are original generated cinematic soundscapes. They are not copied from third-party libraries.
See `SOUND_SOURCES.md` for researched third-party CC0 / Pixabay sources that can be substituted later if exact recorded assets are desired.

## Firebase
No Firebase project configuration or Firestore data model was changed in this release.
