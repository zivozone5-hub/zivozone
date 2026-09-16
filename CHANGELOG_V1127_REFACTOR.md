# ZIVOZONE V1127 → V1128 — Real Refactor (not another patch layer)

This pass fixes the specific pattern that caused the messy topbar and
the "too many internal operations" feeling: every previous version
added a new file/rule on top of the old ones instead of removing them.
This changelog documents exactly what changed, with evidence, so it
can be audited line by line — nothing here is cosmetic renaming.

## 1. `core/runtime.js` (144KB monolith) is gone — split into real files

The old file was literally 16 historical version-files concatenated
with `/* ===== CONSOLIDATED CORE SERVICE ===== */` comments between
them. It has been split into `core/modules/runtime/*.js`, one real
file per domain: `audio.js`, `i18n.js`, `ads.js`, `auth-core.js`,
`app-shell.js`, `dedupe.js`, `question-history.js`,
`server-adapter.js`, `engagement.js`, `live-hud.js`.

**Verified safe:** the extraction was done mechanically (each section
was already a self-contained `(() => {...})()` block) and diffed
byte-for-byte against the original file after stripping comments —
the code inside each function is untouched, only its file location
changed.

## 2. Six dead modules removed from the page load

Auditing which global objects are actually *called* anywhere in the
app (as opposed to just defined) found 6 of the 16 extracted modules
have zero real callers. They are moved to `dev/parked-legacy/` and no
longer loaded by `index.html`. Full evidence for each is in
`dev/parked-legacy/README.md`. Net effect: fewer scripts on every
page load, and no more pointless Firestore health-check network call
that `cloud-core.js` ran on every signed-in page view for a queue
that could never be filled.

## 3. Fixed a real bug: in-challenge level could disagree with profile level

`live-hud.js` (the small overlay shown during a challenge) was reading
a separate tracker (`ZIVOZONE_V21`) that computed XP/level with a
**different formula** than the canonical player profile
(`core/modules/player.js`). It now reads
`window.ZIVOZONE.Player.get()` directly, the same source the profile
page uses. Same numbers everywhere, always.

## 4. Topbar CSS: 4 conflicting rules → 1 canonical rule

`core/styles/index.css` had the *same* `.topbar` selector redefined
4 times, each with `!important`, each from a different historical
"redesign" — two of which explicitly say in their own comments that
they are "the final layer" / "the single source of truth going
forward" (V1088 and V1089), yet neither deleted what came before it.
A third, later attempt (V1089, "CLEAN HEADER / RESPONSIVE SHELL") was
never even wired up — it only applied to an element carrying the class
`z1089-header`, which no code anywhere ever adds — so ~74 lines of
that entire redesign (colors, grid layout, a gold wallet chip) were
completely inert and have been deleted outright.

The other 3 real, currently-rendering `.topbar` rules were merged
into one canonical rule holding today's actual computed values (verified
by resolving the CSS cascade by hand: last-declared `!important` wins
per property). Visually nothing changes — this is the same topbar,
just declared once instead of four times, so the next person editing
it only has one place to look.

**Before:** 4 `.topbar{...}` blocks, 1 dead 74-line skin.
**After:** 1 `.topbar{...}` block. Verified CSS still parses (balanced
braces) after the edit.

## 5. What this pass does NOT cover yet (be aware of these)

Being honest about scope — these are real, documented next steps, not
silently ignored:

- Other duplicated CSS class families found in the same audit
  (`.challenge-card` × 11, and ~10 more with 3–7 duplicate
  definitions) follow the exact same pattern as `.topbar` but were
  not individually resolved in this pass — recommend repeating the
  same fold-in technique used above, one component at a time, with a
  visual check after each.
- `server-adapter.js` (V46) is kept active because `auth.js` calls its
  `flush()`, but its `submit()` is still never called — see the note
  at the bottom of `dev/parked-legacy/README.md`.
- No build tool (Vite/esbuild) was introduced — the site still ships
  as plain unbundled files, which was a deliberate choice to avoid
  requiring a Node/npm build step you'd need to run before every
  deploy. This remains a good next investment if you want smaller,
  compressed bundles.
- The hardcoded admin email in `firestore.rules` / `config.js` was
  flagged in the review but not changed here — that requires a
  Firebase custom-claim change on the account itself, done from the
  Firebase console, not just a code edit.

## 6. Added (V1129): free-plan-compatible reward-claim hardening

The client confirmed the project stays on Firebase's free Spark plan,
which rules out Cloud Functions (they require Blaze). Firestore
security rules alone can verify that a reward claim's fields are
*internally consistent* (e.g. `correct == 10 && total == 10`), but
they cannot verify that a challenge was actually played — a
technically capable user could still write a well-formed claim
straight to the Firestore REST API without touching the game UI.
Cloud Functions would close that gap completely; without them, the
next-best, zero-cost mitigation is to make abuse slow and rate-limited
instead of instant and unlimited:

- `wallet.updatedAt` must now equal `request.time` (the real server
  clock) on every update — a forged write can no longer claim an
  arbitrary timestamp.
- The +10 perfect-score reward now requires at least 20 seconds since
  the wallet's last update; mission/competition rewards (+1/+2/+5)
  require at least 5 seconds. Genuine gameplay always exceeds these
  windows, so real players notice nothing, while a scripted claim loop
  is throttled to roughly the same trickle a human could produce
  manually instead of an unlimited drain.

This was applied directly to `firestore.rules`. **Test it in the
Firebase console's Rules Playground (or `firebase emulators:start`)
before deploying** — this sandbox has no network access to run the
Firestore rules linter itself, so treat this as reviewed-by-hand, not
compiler-verified.

## 7. Added (V1130): challenge cards rebuilt to match reference mockup

The client provided a reference design image and asked for an exact
rebuild of the challenge cards — a circular themed icon + a "Level X"
pill — replacing the previous text tag + question-count row.

**Real colors, not guesses:** the reference image's pixels were
sampled directly (Python/PIL) rather than eyeballed. Primary button:
solid `#0058FD` with a `#3D82FF` glossy top highlight. Level badge:
`#001547` fill with a light blue border. These exact values are now
in `core/styles/index.css`.

**What changed:**
- `core/modules/challenges.js`: each challenge bank now gets a themed
  accent color (`CATEGORY_ACCENT` — football/blue, knowledge
  categories/purple, strategy/green, daily/gold) and a "level" number
  computed from the **real average per-question difficulty already in
  the question bank** (not a fabricated value) — `levelFor()`.
- New markup per card: `.challenge-meta-row` holding
  `.challenge-icon-badge` (the bank's existing emoji icon, now shown
  in a themed circular badge) and `.level-badge` (the pill).
- Card border now tints toward each challenge's accent color via a
  `--card-accent` CSS variable, matching the reference image's
  color-coded card borders.
- Dark Room / Forensic Lab cards are untouched — the reference image
  doesn't cover that cinematic/narrative card type, so they keep
  their existing "FULL SCREEN" / "CASE LAB" tag treatment.

**Honest scope note:** this rebuild was verified for the base desktop
layout (syntax-checked, brace-balanced, and cross-checked against the
sampled reference colors). The `.challenge-card` CSS carries several
`!important` mobile-breakpoint overrides from earlier versions
(≤900px, ≤600px, ≤480px) that were not individually re-verified
against this new markup in this pass — the new icon badge and level
pill should still render correctly since they don't depend on the
old `.card-tag`/`.challenge-count` classes those breakpoints target,
but a visual check on an actual phone screen is recommended before
calling mobile "done."

## File map: old → new

| Old | New |
|---|---|
| `core/runtime.js` (144KB, 1265 lines) | `core/modules/runtime/{audio,i18n,ads,auth-core,app-shell,dedupe,question-history,server-adapter,engagement,live-hud}.js` |
| — (6 dead sub-modules inside runtime.js) | `dev/parked-legacy/{rotation-v18,rotation-v22,cloud-progression-v21,cloud-core-v43,score-gate-v45,smart-metrics-v23}.js` |
