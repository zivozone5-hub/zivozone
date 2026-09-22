# ZIVOZONE V1229 — Phase 1 (Trust & Legal)

Base: V1228 STATE_CACHE_READY. Look and features unchanged; this release fixes correctness, privacy and account security.

## Fixed / changed
1. **Login & register were dead in V1228**: `closeModal` was used 7x and defined nowhere, so `openModal()` threw before the auth form got its submit handler. Defined it; removed dead quiz-timer code and the dead `quit-game` action.
2. **Local (offline) accounts removed** — they stored passwords in plaintext in localStorage. Old data is purged on first load.
3. **Age gate**: `MIN_AGE` (13) in `core/config.js`; age field no longer pre-filled with 18.
4. **Analytics is opt-in**: GA4 and guest visitor stats only after consent (banner + footer "Privacy settings"). Logged-in `page_view` logging also needs consent.
5. **Guest telemetry fix**: it read `siteStats`, which rules never allowed; now write-only with bounded fields.
6. **Real pages**: `/privacy/`, `/terms/` (AR + EN), in sitemap, linked in footer of index + 12 story pages. SW serves them network-first.
7. **firestore.rules**: owner needs `email_verified`; mining wallet/ledger/mining must share one transaction (`lastMiningAt == request.time`); new players cannot start with a balance; event logs have fixed shape; guest visitor docs are size-bounded.
8. **Register no longer copies guest `coins`** into the new account (coins start at 0).
9. **Release tooling**: `scripts/release.py` now also stamps `core/config.js` and `stories/*/index.html`. One version everywhere: 1229.0.

## New gates
- `bash scripts/run_all_gates.sh` — runs everything; non-zero exit = do not deploy.
- `scripts/qa_phase1_trust.py` — privacy/security invariants.
- `node --expose-internals scripts/qa_undefined_identifiers.js` — finds identifiers used but never declared (fails on V1228, passes on V1229).

## Deploy order (important)
1. In Firebase Console > Authentication, make sure the admin account's email is **verified** (or signs in with Google). Otherwise the admin panel locks after step 3.
2. `bash scripts/run_all_gates.sh`
3. `firebase deploy --only firestore:rules,hosting`
4. On the live site: open an account modal (it must close with X), register with age 12 (must be rejected), register with a valid age, mine once, check the consent banner, open /privacy/ and /terms/.

## Verified vs not verified
- Verified: all repo gates; 26/26 Chromium end-to-end checks (banner, consent, purge, age gate, modal, legal pages, mobile overflow) WITHOUT network.
- NOT verified: real Firebase (sign-in, wallet, chat, AI), Firestore rules in the emulator, real devices.

## Still open (next phases)
- Reward claims are still forgeable from the browser and answer keys ship in JS → needs the server function (Phase 2).
- fr/fa UI is mostly copied from en/ar; 63% of questions are Arabic-only (Phase 4).
- Legal pages are a technical draft: have a lawyer review before ads/commercial launch. Contact address = admin email; change in `privacy/` and `terms/`.
- Mobile header overlaps the hero card; canonical apex vs www; ESPN/raw.githubusercontent dependencies.

## Update 1229.1 — honesty of the economy text
- UI text no longer claims a "real wallet" or "server-level protection" (no trusted server exists yet). ZIVO is described as a virtual points balance, matching the Terms.
- `qa_phase1_trust.py` now fails if those claims reappear. Re-allow them only after Phase 2 (server authority) exists.

## Decision: stay on the free plan (Spark)
- Cloud Functions need the Blaze plan, so server-side reward authority is postponed.
- Until then ZIVO stays **points only**. Do not add any cash-out, sale, or "earn money" wording.
- Balances created before a trusted ledger exists cannot be trusted; when real value is planned, start a fresh audited ledger.
- Trigger to revisit: before ANY feature that gives ZIVO monetary value (needs server authority + legal review).

## Update 1229.2 — one news ticker instead of two rails
- The two stacked bars (football fading one headline at a time, politics fading below it) are now a single continuous strip, like a TV news channel banner: one "ZIVOZONE · عاجل" badge on the right, headlines scroll continuously right-to-left, sport (⚽ blue tag) and general (🌐 amber tag) items interleaved.
- Speed is constant (60px/s) regardless of headline count, so a short list doesn't crawl and a long one doesn't blur past.
- Respects `prefers-reduced-motion`: the strip becomes a static, horizontally-scrollable list instead of animating.
- Applied identically to index.html and all 12 story pages (same markup existed in all 13, replaced in one pass).
- No data change: same news.json / news-sources.json / GitHub-mirror fallback chain as before, only the rendering changed.
- Verified in real Chromium: 10/10 checks (single section, interleaving, animation runs and actually moves, seamless duplicate, reduced-motion, mobile no overflow, no JS errors).
- Known non-issue: the ticker sits below the hero, so it's below the fold on a first paint at common viewport heights — same position as the old two-rail block, not a regression.

## Update 1229.3 — fixed the real triple-fetch bug + a permanently-blank section
Investigating the "news/matches fetched 3x" item from the audit found the actual cause:
- `sports()` in app-shell.js called `window.ZIVOZONE_NEWS.load()` **and** `.loadJordan()` — which were the exact same function under two names — plus news.js independently re-triggered itself 120ms after `DOMContentLoaded`. Three calls to the same pipeline, each fetching both `data/news.json` and the GitHub mirror = 6 requests per page load.
- Fixed at the root: `load()` now uses an in-flight promise so concurrent calls collapse into one fetch, the redundant `.loadJordan()` call was removed, and the now-fully-redundant self-init timer in news.js was deleted (every page that loads news.js also loads app-shell.js, which already triggers the boot load). Verified in real Chromium: 2 fetches at boot (local + GitHub mirror, as designed), not 6. The manual "🔄 تحديث" refresh button still forces a fresh fetch, confirmed separately.
- Along the way, found `#jordan-news-list` ("🇯🇴 كرة القدم الأردنية · مصادر رسمية + مباشر") had **no renderer at all** — it was permanently blank under a "live" badge in V1228, for every user, always. Implemented a real one: it filters the same sports feed for Jordan-related keywords and shows an honest "لا توجد أخبار أردنية حالياً" message when the source has none today, instead of showing nothing under a false "live" claim.
- New gate `scripts/qa_no_duplicate_boot_fetch.py`: drives real Chromium on index.html and a story page, fails if `data/news.json` is fetched more than twice at boot. This regression class (a new caller quietly added later) is invisible to static analysis, so this gate exists specifically to catch it again if it comes back.
- Full regression re-run after this fix: 26/26 Phase-1 browser checks + 10/10 ticker checks, all still green.

## Update 1229.4 — Phase 3 step 1: one entry point instead of 48 `<script>` tags
The first structural piece of "unify instead of layering": index.html and all 12 story pages loaded
the exact same 48 local JavaScript files as 48 separate `<script>` tags, in the exact same order,
confirmed byte-for-byte identical across all 13 pages before touching anything.

- **What changed:** those 48 files are now concatenated, in their original execution order, into one
  file: `dist/app.bundle.js`. Each page now loads it with a single `<script>` tag instead of 48. Every
  file is untouched — same code, same order, just fetched once instead of 48 times. `zivo-ai.js` (an ES
  module with `import` statements from a CDN) and the 4 Firebase compat SDKs are deliberately left as
  separate tags; they cannot be concatenated into a classic-script bundle.
- **Source of truth:** `scripts/bundle_manifest.txt` — a plain, ordered, one-path-per-line list.
  Add/remove/reorder a core module there when the module list changes; `scripts/build_bundle.py` reads
  it and rebuilds. It intentionally does NOT re-derive the list from index.html on every run (that would
  be self-referential once the page only contains the bundle tag).
- **Wired into the release flow:** `python3 scripts/release.py <version>` now calls the bundler
  automatically, after stamping `core/config.js`/`core/boot.js`, so the bundle always embeds the new
  version strings.
- **New gate — `scripts/qa_bundle_freshness.py`:** rebuilds the bundle from current sources into a
  temp copy and fails if it doesn't match the committed `dist/app.bundle.js` byte-for-byte, so a source
  edit can never silently ship stale bundled code. Wired into `run_all_gates.sh`.
- **Fixed a gate that assumed the old architecture:** `qa_game_platform.py` checked for literal
  `<script src="game-registry.js">`-style tags in index.html. Updated it to accept either a literal tag
  or presence in the bundle manifest — the invariant it's protecting (the browser actually receives
  that module's code) is unchanged, only how it ships.
- **Measured effect:**
  - Local JS requests per page load: 49 (48 modules + zivo-ai.js) → 2 (bundle + zivo-ai.js).
  - Service-worker precache list (auto-derived from index.html's tags): 61 entries → 14.
  - Bundle is 895 KB unminified (sum of the 48 source files + `//# sourceURL=` markers for DevTools).
    No minification was applied — no bundler/minifier could be installed in this sandbox (no network
    access to npm). This is a real request-count and precache win; minification (shrinking that 895 KB)
    is separate future work once a build tool can be installed, and is called out below so it isn't
    silently treated as done.
- **A build-script bug caught by its own gate, worth recording:** the first version of `build_bundle.py`
  re-derived the file list from index.html on every run. The second time it ran (during freshness-gate
  development), index.html by then only contained the bundle tag, so it bundled the bundle into itself.
  Caught immediately because the freshness gate's byte-diff didn't match; fixed by moving to the static
  manifest file described above, and recovered by re-extracting the known-good pre-bundle 1229.3 state
  from the zip already delivered to the user rather than trying to hand-repair the corrupted files.
- **Verified in real Chromium** (index.html + a story page + mobile): 14/15 automated checks passed;
  the one "failure" was a bug in the *test's* URL matcher (it treated `.json` as containing `.js`), not
  a real regression — confirmed by hand that exactly 2 local `.js` files are requested. Login/register
  modal, the age gate, the consent banner, the news ticker, and the Jordan football section (see 1229.3)
  all work identically to before bundling, on both index.html and story pages.

### Not done yet (explicitly deferred, not forgotten)
- **Minification.** The bundle is concatenated but not minified/whitespace-stripped (no bundler could be
  installed here). Run it through esbuild/Terser once you have local npm access; expect roughly a 60-70%
  size reduction on top of today's request-count win.
- **Four duplicate question banks → one.** Not started this round.
- **Duplicate `esc()` in 13 files → one shared utility.** Not started this round.
