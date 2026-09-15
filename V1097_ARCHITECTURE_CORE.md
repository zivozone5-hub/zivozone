# ZIVOZONE V1097 — ARCHITECTURE CORE

## Objective
Safely dismantle the monolithic V1096 runtime without changing the visual identity or removing behavior.

## Runtime migration
The former `core/runtime/zivo-runtime.js` has been split into 50 ordered compatibility modules under `core/legacy/`. Execution order is preserved exactly from V1096. These files are intentionally compatibility modules until their consumers are proven unused.

## Canonical contracts
- `ZIVOZONE.Auth` — authentication/session contract
- `ZIVOZONE.Player` — player/progression contract
- `ZIVOZONE.Economy` — wallet/mining/reward contract
- `ZIVOZONE.Challenges` — challenge bank/start contract
- `ZIVOZONE.News` — news rail engine
- `ZIVOZONE.UI` — UI primitives

## Economy migration
Legacy transaction engine remains authoritative. New callers should use `ZIVOZONE.Economy`. XP progression is delegated to the existing V35 progression engine during transition.

## CSS migration
`core/styles/index.css` is the single stylesheet entry point. The original stylesheet is isolated as `legacy-base.css`; architecture/news and economy styles are layered after it. The V101 economy inline style injector is disabled because the same CSS is now loaded from `economy.css`.

## Safety rules
1. Do not reorder `core/legacy/*.js` until dependency audit proves it safe.
2. Do not delete a legacy module until static references and runtime event consumers are zero.
3. Economy writes must remain transactional and cloud-backed.
4. Preserve `window.ZIVOZONE_*` compatibility APIs until migration completes.
