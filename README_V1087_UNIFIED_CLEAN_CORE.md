# ZIVOZONE V1087 — UNIFIED CLEAN CORE / MOBILE FIRST

This build is a structural consolidation of the V1081 feature-complete project.

## Principles
- Preserve the existing homepage content and visual language.
- Preserve existing feature engines, Firebase integration, challenge banks, Player, ZIVO Hub, Admin, Auth, Dark Room, AI, news and economy.
- Consolidate versioned CSS and JS entry points into `zivozone.css` and `zivozone-app.js`.
- Do not delete a feature merely because its source file was versioned; its code is retained inside the unified application bundle.
- Mobile is the primary interaction target. Desktop presentation is intentionally kept close to the source.
- No new paid backend or external service is introduced.

## Feature preservation map
- `zivozone-runtime.js` → included in `zivozone-app.js`
- `zivo-global-core.js` → included in `zivozone-app.js`
- `zivo-v103-pro.js` → included in `zivozone-app.js`
- `zivo-v104-pro.js` → included in `zivozone-app.js`
- `zivo-v1062-royal.js` → included in `zivozone-app.js`
- `zivo-v1080-core.js` → included in `zivozone-app.js`
- `zivo-v1081-player.js` → included in `zivozone-app.js`
- all corresponding CSS + inline style blocks → `zivozone.css`

## QA before production
1. Guest home and all homepage CTAs.
2. Challenge Center and all challenge cards.
3. Expanded question bank selection.
4. Auth: register, login, logout, password reset.
5. Player profile and ZIVO Hub.
6. Wallet and Mining.
7. Admin owner access.
8. Dark Room start, questions, audio, effects, exit and result.
9. ZIVO AI.
10. Sports/news rails and fixtures.
11. PWA/service worker and offline shell.
12. Mobile widths 320, 360, 390, 430 and desktop.

This build is a candidate clean baseline; live Firebase operations still require browser testing with real accounts.
