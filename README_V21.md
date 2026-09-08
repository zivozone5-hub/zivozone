# ZIVOZONE V21 — Cloud Progression Layer

Built directly on V20.

Added:
- Persistent player progression model (XP, level, games, streak, best score, recent history).
- Local resilience: progress is retained if the network/cloud write is temporarily unavailable.
- Cloud sync hooks that use an existing ZIVOZONE auth/Firebase progress API if exposed.
- Live Level/XP/Best HUD.
- Existing Firebase/auth code is preserved and not replaced.
- Existing V20 runner, V19 dark room, V18 challenge bank and V17 player system are preserved.
