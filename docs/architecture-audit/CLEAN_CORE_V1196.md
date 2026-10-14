# ZIVOZONE V1196 — CLEAN CORE + BEAUTY + REAL PUZZLES

## Canonical runtime
- `core/app.js` owns architecture metadata.
- `core/modules/challenges.js` owns challenge sessions and Dark Room.
- `core/modules/puzzle-room.js` owns the complete Puzzle Room.
- `core/modules/forensic-case-core.js` owns the Forensic Lab.
- `core/modules/runtime/exit-guard.js` is the only exit/return confirmation owner.
- `core/modules/beauty-room.js` owns the fourth Beauty Room.

## Removed from runtime surface
Old version README artifacts and duplicate exit documentation were removed from the distributable. No runtime module was deleted without a verified dependency because the existing core is still referenced by the boot graph.

## V1196 changes
- Exit controls are resilient after route changes and DOM re-renders.
- Full-site exit and all room returns use one confirmation guard.
- Puzzle Room uses complete playable mini-games with mobile controls.
- Added Beauty Room with skincare/body/hair education, gentle recipes, habits and an editorial accessories showcase.
- Beauty content is educational and does not diagnose or treat medical conditions.
