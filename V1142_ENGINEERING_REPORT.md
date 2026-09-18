# ZIVOZONE V1142 — Dead CSS Layer Removal (Engineering Report)

## Why this pass happened
The V1127→V1141 reports correctly refactored the **JS runtime** (one module per
domain, no dead sub-modules loaded, verified via `scripts/qa_v1141.py`). They
never touched the **CSS**. Audit of `core/styles/index.css` and
`core/styles/core.css` showed the stylesheet was still a literal concatenation
of every historical visual skin (`styles.css`, V9, V49, V62, V100, V101, V103,
V104, V105, V1122, V1127, V1140), each one re-declaring selectors from the
skin before it. The JS was clean; the CSS was not.

## Method (verifiable, not a guess)
1. Parsed every top-level CSS rule (both files) into `(selector, declaration)`
   pairs.
2. Extracted every class name referenced anywhere in the shipped JS/HTML
   (`className=`, `class="..."`, `classList.add`, `document.getElementById`
   patterns, template literals, etc.) into one lookup set.
3. Flagged a CSS rule as dead **only if every class in its selector list**
   never appears anywhere in that lookup set — i.e. nothing on the page can
   ever match it, under any state, any screen size, any language.
4. Cross-checked a sample of flags by hand against the module that actually
   owns that UI (e.g. confirmed the live Dark Room renders `zdr-*`/`zcr-*`
   from `challenges.js`, not `.z19-*`/`.v20-*`/`.z1121-*`; the live wallet
   renders `zivo-economy-*`/`z101-modal-*` from `economy.js`, not
   `.z101-card`/`.z103-economy`; the live admin panel renders `zac-*` from
   `admin.js`, not `.z103-admin-*`/`.z104-admin-*`).
5. Removed only the confirmed-dead top-level rules. Rules inside `@media`
   blocks were **not** touched in this pass — left for a follow-up once there
   is a way to visually regression-test breakpoints (see "Not done" below).

## Result
| File | Dead rules removed | Bytes removed |
|---|---|---|
| `core/styles/index.css` | 326 | 35,947 |
| `core/styles/core.css` | 33 | 3,815 |
| **Total** | **359** | **~39.8 KB (~24% of shipped CSS)** |

Concretely, this deleted three fully superseded generations of the Dark Room
UI (`.zivo-dark-v19`/`.z19-*`, `.zivo-v20-runner`/`.v20-*`,
`.zivo-dark-v1121`/`.z1121-*`), one superseded economy widget skin
(`.z101-card/.z101-coin/.z101-btn/.z103-economy`), one superseded admin panel
skin (`.z103-admin-*`, `.z104-admin-*`), and ~30 smaller orphaned rules
(`.ad-rail`, `.horror-modal.phase-2/3`, `.pressure-hud`, `.match-alert`,
`.jordan-news-card`, `.football-card`, etc.) that had no owner left in the
current JS at all.

## Verified safe
- Brace balance confirmed on both files after removal.
- Re-ran the dead-selector scan after removal: 0 further matches (nothing
  live was caught in the sweep).
- Spot-checked that every selector a currently-shipping module actually
  renders (`.topbar`, `.hero`, `.challenge-card`, `.zdr-*`, `.zcr-*`,
  `.zivo-signature-zone`, `.mobile-nav`, `.zivo-economy-head`, `.zac-*`)
  is still present.
- `python3 scripts/qa_v1141.py` still passes unchanged.
- Cache-busting bumped `?v=1141.0 → ?v=1142.0` across `index.html` and the
  Service Worker cache name, so returning users actually receive the smaller
  file instead of serving the old one from cache.

## Intentionally not done (this pass)
- **Live-but-still-layered rules were not merged.** A number of selectors
  that ARE currently used (`.challenge-center-section`, `.challenge-card`,
  `.hero`, `.hero-orb-wrap`, `.brand-mark`, `.top-actions`, `.z101-economy`)
  are still re-declared 2–4 times across the old V101/V103/V104/V105 skin
  blocks, each later block overriding the earlier one with `!important`.
  The site renders correctly today because CSS cascade always resolves to
  the last declaration — but the file still carries the old, overridden
  declarations as dead weight, and the true "single canonical rule per
  selector" state your V1127 notes claimed was reached has not actually been
  reached for CSS. Collapsing these safely means computing the final
  cascade-resolved value per property per selector (including every
  `@media` context) and is a meaningfully higher-risk edit than deleting
  code nothing can reach — it needs a visual before/after diff (real browser
  screenshots across breakpoints), which this environment cannot do without
  a live/staging deployment. Recommend doing that as its own dedicated pass.
- `@media` rule bodies were not swept for dead selectors (same reasoning:
  lower risk tolerance without visual verification).
- No JS was changed. The JS module architecture was already sound in this
  audit — no dead globals, no duplicate `window.ZIVOZONE.X` owners, correct
  load order, `scripts/qa_v1141.py` passing.

## Suggested next step
A V1143 pass that: (1) resolves the remaining live-but-duplicated CSS
selectors into one rule each per breakpoint, verified against real
screenshots before/after; (2) sweeps `@media` bodies for the same class of
dead code found here.
