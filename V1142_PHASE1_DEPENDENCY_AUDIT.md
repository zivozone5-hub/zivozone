# ZIVOZONE — Phase 1: Dependency Audit + Legacy Removal Map (V1141/V1142 baseline)

This is not opinion — every line below is a direct grep result against the
actual shipped code. Purpose: know exactly what exists before touching
anything, per the "Freeze → Audit → Extract → Rebuild" order.

## 1. Legacy global surface still alive
`window.ZIVOZONE_*` is written or read in **19 files**. The two that matter
most (real cross-module coupling, not just internal implementation detail):

**Auth has two live call paths, not one:**
- `core/modules/auth.js` exposes the official `ZIVOZONE.Auth` facade.
- But `core/modules/runtime/app-shell.js:17` and
  `core/modules/runtime/question-history.js:24` call
  `window.ZIVOZONE_AUTH` **directly**, skipping the facade entirely.
- Risk: any future change to `ZIVOZONE.Auth` (validation, logging, session
  handling) silently does not apply to these two call sites. This is the
  concrete version of "duplicate Auth API" — confirmed, not assumed.

**Challenges has six independent owners of one global:**
`window.ZIVOZONE_CHALLENGES` is read or written directly in
`question-bank.js`, `app-shell.js`, `dedupe.js`, `challenges.js`,
`daily.js`, and `boot.js`. No single file owns writes to it.

**Everything else on the legacy-global list** (`ZIVOZONE_CONFIG`,
`ZIVOZONE_I18N`, `ZIVOZONE_PLAYER`, `ZIVOZONE_AUDIO`, `ZIVOZONE_ADS`,
`ZIVOZONE_NEWS`, `ZIVOZONE_MONITOR`, `ZIVOZONE_ENGAGEMENT`,
`ZIVOZONE_FIXTURES`, `ZIVOZONE_MATCH_CENTER`, etc.) is used by 1–2 files
each — lower risk, but still outside the `ZIVOZONE.*` namespace the app
claims is canonical.

## 2. Firestore access — better contained than assumed, but the data model is still split
Only **3 files** talk to Firestore directly: `economy.js`, `cloud.js`,
`admin.js`. Nothing in the UI layer, Player Hub, Challenges, or News
touches Firestore directly — that boundary is already real, not aspirational.

But those 3 files write across **12 different top-level shapes**:
`users`, `players`, `zivozone`, `wallet`, `ledger`, `mining`,
`questionHistory`, `activity`, `visitors`, `siteStats`, `results`,
`rewardClaims`, `attempts` — with wallet-like data reachable through more
than one nesting (`players/{uid}/wallet` and `users/{uid}/zivozone/wallet`
both exist in the code). This is the real version of "no unified data
model" — confirmed by path, not by guess.

## 4. A real bug this audit caught (fixed now)
`core/modules/runtime/question-history.js` was calling
`window.ZIVOZONE_AUTH?.getCurrentUser?.()` — but `getCurrentUser` does not
exist anywhere on that object; the real method is `getUser()`. Because the
call used optional chaining, it never threw — it silently returned
`undefined` on every single call, every session, for every user, and the
function quietly fell back to raw `firebase.auth().currentUser` instead.
Fixed to call `getUser()`, the method that actually exists. This is the
concrete cost of two Auth naming surfaces existing at once: a typo against
the "wrong" one doesn't get caught by anything, including the current QA
script (JS syntax-checks fine either way).

## 5. Why app-shell.js still reads the legacy global directly (not fixed yet — needs a coordinated change, not a quick patch)
`core/modules/auth.js` (the canonical `ZIVOZONE.Auth` facade) loads
**after** `app-shell.js` and `question-history.js` in `index.html`
(auth-core.js → app-shell.js → dedupe.js → question-history.js → ... →
auth.js, much later). So today, at the moment `app-shell.js` runs, the
canonical `ZIVOZONE.Auth` object does not exist yet — only the underlying
`window.ZIVOZONE_AUTH` engine does. Reading the legacy global there isn't
sloppiness, it's the only object actually available at that point in the
boot sequence.

Making `app-shell.js` use the canonical facade instead requires three
coordinated changes together (not just one line): (1) move `auth.js`'s
`<script>` tag to load right after `auth-core.js`; (2) add `flushAttempts`
to the facade's exposed API — `app-shell.js` calls `A.flushAttempts()`,
which the facade doesn't currently expose; (3) rewrite `app-shell.js`'s
`A.getUser()` / `A.getPlayer()` calls to the facade's actual shape, which
exposes these as getters (`A.user` / `A.player`), not methods. Doing only
one of the three breaks the other two. Left as the next concrete PR rather
than rushed into this pass.

- The Auth and Challenges findings are safe to fix without touching
  Firestore or live user data: redirect the 2 direct-Auth call sites and
  centralize the 6 Challenges writers through one owner. Pure code
  refactor, testable by the existing syntax QA plus manual smoke-test.
- The Firestore data-model unification is a different risk class: it
  touches **live wallets and reward history for real users**. That needs a
  migration plan (dual-read/dual-write or a one-time backfill script) and
  a rollback path before any schema change ships — not a same-session
  rewrite. Doing it blind risks a player's balance silently reading as 0.

## Recommended order (matches the "no rewrite is one version" plan)
1. Fix the 2 Auth bypasses + centralize the 6 Challenges writers (safe, code-only).
2. Write the Firestore migration plan as a document, reviewed before any
   write path changes.
3. Only then touch the data model itself, behind a feature flag, with a
   rollback path.
