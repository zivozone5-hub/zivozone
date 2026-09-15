# ZIVOZONE V1127 — Unified Mobile Core

- One canonical Challenge Core owns challenge rendering, sessions, scoring, Dark Room and Forensic Lab.
- Dark Room and Forensic Lab are first-class featured experiences; cards enter directly without a start button.
- ZIVO HUB routes directly to the domain modules and exposes Dark Room + Forensic Lab prominently.
- One canonical News Core owns separate football and politics carousels. Headlines are ZIVOZONE-branded; source labels are hidden from the UI.
- Dead legacy launchers, quick docks, archived challenge styling and unused patch selectors are removed from the published bundle.
- Mobile-first responsive behavior is part of the core UI.


## V1128 update
See `CHANGELOG_V1127_REFACTOR.md` for a real structural refactor done
on top of this version: the `core/runtime.js` monolith was split into
real per-domain files, 6 dead/never-called modules were removed from
the page load, a real HUD/profile level-mismatch bug was fixed, and
the 4 conflicting `.topbar` CSS rules (one of them entirely inert)
were consolidated into 1.

## V1127 Architecture
- One canonical News Core: football rail + politics rail.
- One canonical Challenge Core: standard challenges + Dark Room + Forensic Lab.
- Dark Room and Forensic Lab are exposed in one prominent Signature section only.
- Mining is a standalone site-wide action backed by Firestore transaction + 24h cooldown + ledger entry.
- ZIVO Hub is player/navigation state; economy controls are not duplicated inside it.
