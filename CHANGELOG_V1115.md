# V1115 — Match Center Engineering Upgrade

- Rebuilt Match Center as a single core module.
- Expanded coverage to 11 football competitions.
- Added cached scoreboard loading and controlled refresh.
- Added lazy match-detail loading (summary/events/statistics).
- Increased card readability and information density without increasing page clutter.
- Removed the unused legacy fixture module `core/legacy/06-fixtures.js`.
- Preserved the `ZIVOZONE_FIXTURES.load()` public contract.
- No paid backend service or Firebase Function added.
