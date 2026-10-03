# V1229.38 — Story Room Mini-World

- Dark Room controls changed to pointer/touch destination control; arrow pad removed.
- Stories Room keeps its existing archive and story navigation.
- Added embedded `مطارد الفصول` mini-game inside Stories Room.
- 10 levels, 3 story pages per level, auto-run, jump by mouse/touch, obstacles, timer, chapter portal.
- Level 10 is the hardest chapter.
- Exiting the mini-game returns to the Stories Room without replacing its content.
- Story navigation/close paths call mini-game cleanup.

QA:
- Site verification: PASS 17/17
- Game platform: PASS 30/30
- Bundle freshness: PASS
- i18n completeness: PASS 7/7
- i18n coverage: PASS
- Phase 1 trust/security: PASS
- Browser smoke: ENVIRONMENT BLOCKED (Playwright Chromium executable unavailable)
