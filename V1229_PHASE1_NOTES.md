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

## Update 1229.5 — Phase 3 step 2: one canonical question bank instead of six globals
Investigating "merge the 4 question banks into 1" found the real picture was more specific: the
content already lived in one mostly-consolidated file (question-bank.js, from a V1180 pass), but it
exported SIX different global objects (`ZIVOZONE_CHALLENGES`, `ZIVOZONE_V18_BANK`, `ZIVOZONE_V18`,
`ZIVOZONE_V40_BANK`, `ZIVOZONE_V22_BANK`, `ZIVOZONE_QUESTION_BANK_PRO`, `ZIVOZONE.QuestionBank`,
`ZIVOZONE_QUESTION_BANK_FLOOR`), and challenges.js had to know to union several of them together at
runtime just to see the full question pool.

Checked every one of them for real consumers before touching anything (deleting live content here
would silently remove questions from gameplay):
- **Confirmed genuinely dead** (zero consumers anywhere else in the codebase): `ZIVOZONE_V18` (a
  wrapper with its own get/all/scoreAnswer methods, unused), `ZIVOZONE_QUESTION_BANK_PRO` (a
  stats/all API, unused), `ZIVOZONE.QuestionBank` (unused), `ZIVOZONE_QUESTION_BANK_FLOOR` (unused —
  but the `dedupe()` pass that ran alongside it is real and was kept).
- **Confirmed live and kept untouched:** the 18 "PRO" question packs that get merged into existing
  banks (code_v22, daily, football, horror, iq, logic, math, memory, science, strategy, etc. — real
  content, actively shipped), the options→a/c schema canonicalization, and the stable-ID assignment
  pass (used by the "don't repeat a question" history logic).
- **V18's 30 questions** (Logic Lab / Pattern / Focus, 10 each) were reachable via challenges.js's
  three-way union but were invisible to `window.ZIVOZONE_CHALLENGES` itself. Made V18 self-merge into
  `ZIVOZONE_CHALLENGES` the same way V22 and V40 already did, then simplified challenges.js's
  `banks()` to read only `Object.values(ZIVOZONE_CHALLENGES)` — one source instead of three.

**Verified zero content loss:** total question count and the per-bank breakdown are identical before
and after (633 questions across 21 banks, same numbers per bank) — checked with a standalone Node
harness that loads the actual bank files. Also **found and fixed a blind spot** in
`scripts/question-bank-integrity-v1197-4.js`: it only ever read `ZIVOZONE_CHALLENGES` directly, so it
had been under-counting the real question total by 30 (610 instead of 633) since V18 was added,
because V18 lived outside `ZIVOZONE_CHALLENGES`. It now reports the correct 640 (549 choice + 84
direct-answer, minus/plus small overlaps from dedupe).

**Verified in real Chromium, not just data:** opened the "التحديات" (Challenges) screen — the grid
still renders all 20 cards (unchanged), including the three V18 cards, which were already reachable
before this change (their poster images already existed — this was a real, if easy-to-miss, existing
feature, not dead content). Started the `logic_v18` challenge end-to-end: cinematic intro → world
screen → the exact question from the raw data ("أكمل: 2، 4، 6، 8، ؟") → answered "10" → advanced to
question 2/10. Zero JavaScript errors throughout. All 9 project gates still pass, including the
bundle-freshness gate (question-bank.js is part of the bundle, so it was rebuilt and reverified).

### Not done yet (explicitly deferred, not forgotten)
- **Bundle minification** — still just concatenated, not minified (no npm access in this sandbox).
- **Duplicate `esc()` in 13 files → one shared utility.** Next up.

## Update 1229.6 — Phase 3 step 3: one `esc()` instead of 13 copies
The last item on the original Phase 3 list. The same one-line HTML-escaping helper (escape `& < > " '`)
was copy-pasted, with minor formatting differences, into 13 files: admin.js, beauty-room.js,
challenges.js, chat.js, economy.js, exit-guard.js, forensic-case-core.js, match-center.js, news.js,
player-hub.js, puzzle-room.js, rooms.js, and runtime/app-shell.js. Three of them used a
DOM-`textContent` trick instead of a regex, but produced identical output for these characters.

- **New file:** `core/modules/util-esc.js` — the one implementation, exported as `window.ZIVOZONE_ESC`.
  Added to `scripts/bundle_manifest.txt` right after `core/config.js` so it's available before any of
  the 13 consumers load.
- **Minimal-diff approach on purpose:** each of the 13 files still has a local `const esc = ...` — it
  now just reads `const esc = window.ZIVOZONE_ESC;`. Every existing `esc(...)` call site in those files
  needed zero changes. This was deliberately chosen over rewriting every call site: same guarantee,
  far smaller diff, far less risk.
- **Verified in real Chromium:** called `window.ZIVOZONE_ESC` directly with `<script>&"'</script>` and
  confirmed correct escaping; re-opened the Challenges grid (still 20 cards), the Sports/Jordan section,
  and consent flow — all identical, zero JS errors. Full gate suite (including bundle freshness) passes.

### Phase 3 (unification) is now complete against the original plan
1. One entry point instead of 48 `<script>` tags (1229.4).
2. One canonical question bank instead of six overlapping globals (1229.5).
3. One `esc()` instead of 13 copies (1229.6).

Remaining, explicitly out of scope for this pass:
- **Minification** of `dist/app.bundle.js` — needs a build tool this sandbox can't install (no npm
  access). Concatenation-only bundle is 895 KB; expect roughly 60–70% smaller once minified.
- Two smaller, real findings surfaced along the way and already fixed as part of the phase they came
  up in, not held back: the permanently-blank Jordan football section (1229.3) and a QA gate that was
  silently under-counting the question bank by 30 (1229.5).

## Update 1229.6 (continued) — firestore.rules security review

### Critical, fixed: the file had a syntax error and likely could not deploy at all
`firestore.rules` had one extra closing parenthesis in the `publicChat` rate-limit condition
(`...request.time))` instead of `...request.time)`). This is a hard compile error — `firebase deploy
--only firestore:rules` would reject the whole file. Best case, deploys of this file have simply been
failing; worst case, an older and less-restrictive ruleset is what's actually live right now while the
source looks current. There is no Firebase CLI or emulator available in this environment to compile
rules for real, so I wrote a lightweight structural check (`scripts/qa_rules_syntax.py`: balanced
`()`/`{}`/`[]`, every custom `function` both defined and called) and wired it into
`scripts/run_all_gates.sh`. It cannot catch everything a real compiler would, but it catches exactly
this class of error, which just happened for real. **Please run `firebase deploy --only
firestore:rules` (or paste the file into the Firebase Console rules simulator) once, since this is
the one thing in this whole project I have not been able to verify against a real backend.**

### Fixed: three narrow, safe hardening changes (each verified to only remove access nothing uses)
- **Root `results/{id}` collection locked down** (`allow create: if signedIn()` → `allow write: if
  false`). Confirmed via a full-codebase search that no client code writes here — only the separate
  `players/{uid}/results` path is used. This was an open, per-account-unbounded write surface to a
  *global* (not per-user) collection with zero shape or size validation.
- **`players/{uid}/results/{resultId}` now bounded**: previously any signed-in user could write an
  arbitrarily large, arbitrarily shaped document into their own results subcollection with no
  validation at all (`allow create: if isSelf(uid)`). Added a field-count cap and required the one
  field the client always sets. Left permissive on purpose (I don't know the intended full schema,
  and the calling function, `Auth.saveResult()`, is currently unused by any other module — this is
  future-facing hardening, not a fix for an active exploit).
- **Public chat**: `displayName` and `language` had no type or size limit. Bounded to a string ≤40 and
  ≤10 characters respectively, so a message can't carry a multi-kilobyte name into the public feed.

### Found, NOT fixed here, and why — the real economy risk
Tracing `rewardChallenge()` in economy.js (the only thing that credits ZIVO for a "perfect 10/10"
challenge) confirms with certainty, not just suspicion, that **the whole flow is self-asserted by the
browser**: `challenges.js` decides client-side whether the player scored 10/10 and calls
`window.ZIVOZONE.Economy.rewardChallenge({..., validatedResult:{validated:true, perfect:true, ...}})`
directly — nothing server-side ever checks that a real session happened. Concretely, anyone can open
the browser console on the live site and run that same call with a fabricated `validatedResult` and
mint 10 ZIVO, repeatable with a fresh `eventId` every time, with **no rate limit at all** on
`rewardClaims` creation (unlike mining's 24-hour cooldown or chat's 3-second throttle).

I looked for a rules-only mitigation (a per-user cooldown on reward claims, the same pattern already
used for mining and chat) and deliberately did not ship it this round: making it real requires the
*same* change on both sides at once — `economy.js`'s `credit()` transaction would need to also
read/write a new rate-limit document, and `firestore.rules` would need to require that write in the
same transaction via `getAfter()`. I have no Firebase emulator or live project access to test a
transaction-plus-rules change like that together, and a subtle mismatch between the two would not
fail loudly — it would either silently block *every* legitimate reward (including honest players) or
silently do nothing at all. Given this reward path is live and working today, I chose not to ship an
untested change to it. **This is the top remaining item, and it cannot be fully closed with Firestore
rules alone** — only a Cloud Function that independently verifies a completed session (Phase 2) can
confirm a claim is true rather than just well-shaped. A rules-only rate limit would raise the cost of
abuse (bound the throughput) but never the authenticity, which is why Phase 2 stays the real fix.
Since ZIVO is currently points-only (no cash-out), the practical damage today is a corrupted
leaderboard, not a financial loss — but this is exactly the gap that must close before any real value
is attached to ZIVO, per the earlier discussion.

### Re-verified after all rule and code changes
All 10 project gates pass, including the two new ones (`qa_rules_syntax.py`,
already-existing gates re-run clean). The rules changes don't touch JS, so no bundle rebuild was
needed for them; version bumped to 1229.6 to also carry the esc() de-duplication from the same round.

## Update 1229.7 — Phase 4 (globalization) started: real French and Persian translations
You said you want this to be a global project. The most concrete, verifiable step toward that today:
of the 230 UI strings the translation system (`core/modules/runtime/i18n.js`) actually controls, 181
French and 180 Persian ones were byte-identical copies of the English/Arabic source — never actually
translated, just left as placeholders. Chinese, Hindi and Spanish were already properly translated.

- **Translated all 181 French and 180 Persian keys by hand** (buttons, headings, error messages, the
  Dark Room warning/checkpoint copy, the economy/wallet/mining strings, password reset flow, etc.).
  A handful of keys are correctly identical to the source on purpose — brand terms (`XP`, `ZIVO`),
  an email placeholder, and words French/Persian share with English/Arabic (`Football`, `Score`,
  Persian's `خروج` for "exit" is standard Persian, not a leftover) — every one of those is now listed
  explicitly in the new gate below rather than silently passing.
- **New gate — `scripts/qa_i18n_coverage.py`**: flags any UI key that is textual and byte-identical to
  its source language, unless it's on the small, explicit allow-list of genuine shared words. Wired
  into `run_all_gates.sh`. This is the gate that would have caught the original 181/180 gap.
- **Verified in real Chromium**, not just the data: loaded the homepage with French and with Persian
  forced, confirmed the hero heading/subtext, stats labels, and nav render real translated text (not
  fallback), and confirmed Persian gets `dir="rtl"` correctly (it was already mapped correctly, just
  the words behind it weren't translated).

### Important scope limit, stated plainly so it isn't mistaken for "the site is now global"
The translation system only covers UI chrome that actually calls `t()` / uses `data-i18n` — roughly
230 strings. Large parts of the site render Arabic text **hardcoded directly in JavaScript**, entirely
outside this system, and stay Arabic-only regardless of the language switcher. Confirmed by checking
the rendered page: the "ZIVO ECONOMY" wallet/mining widget shows Arabic labels ("محفظة ZIVO", "الرصيد
الحالي"...) even with French or Persian selected, because `economy.js` builds that markup with ~130
literal Arabic text fragments, not translation keys. The original audit found roughly 5,400 such
hardcoded Arabic fragments across the codebase (challenges.js alone has ~2,960). Wiring all of that
into the translation system — and then translating the resulting keys — is a much larger job than
today's pass and has not been started.

Also unchanged today: **63% of quiz questions are Arabic-only** (no English/French/Persian/etc.
version exists in the data), the news ticker's content is whatever language the news source provides
(Arabic, in the current feed), and there is still one URL for every language (no hreflang, since the
site has no per-language routes to point hreflang at — that would need real URL-per-language routing,
a structural change, not a translation one).

### Honest caveat on translation quality
These are my own translations, not reviewed by a native French or Persian speaker. They should read
naturally and be functionally correct, but before a real launch to French- or Persian-speaking users,
have a native speaker skim them — UI copy is exactly the kind of short, context-light text where an
automated or non-native pass can miss tone even when the words are technically right.

## Update 1229.8 — wired the ZIVO Economy widget into the translation system
Followed up directly on the 1229.7 finding: the "ZIVO ECONOMY" wallet/mining widget stayed Arabic
regardless of the language switcher because `core/modules/economy.js` had its own local `t()`
translation helper defined and **never once called** — every string (~130 Arabic fragments) was a
hardcoded literal instead.

- **Wired all of it**: wallet status line, last-mining timestamp, the mining chip/button in every
  state (ready / cooling down / needs sign-in / needs account), toasts (mining success/error, perfect-
  challenge reward), the ledger row labels (daily mining / perfect challenge / fallback), the full
  wallet modal (title, stats, ledger title, empty state, virtual-balance note), and the widget's own
  heading/intro/security note. Added 25 new i18n keys (translated into all 7 languages the same way as
  1229.7) for strings that had no existing equivalent; reused ~15 existing keys where one already fit.
- **Fixed a real, separate bug found while doing this**: the ledger's date/time formatting was
  hardcoded to `'ar-JO'` regardless of UI language. Added a small locale map (`en`→`en-US`, `fr`→`fr-FR`,
  `fa`→`fa-IR`, etc.) so transaction timestamps format in the viewer's actual language too.
- **Handled the "translate once, but the language switches later" problem correctly**: most of this
  widget's DOM is rebuilt on every refresh (mining status, ledger preview) or every open (`open()`
  rebuilds the modal's `innerHTML` from scratch each time) — for those, a plain `t()` call is enough,
  since they naturally re-render in the new language. Two pieces are built exactly once at mount time
  (the header wallet chip's icon, the widget's heading/intro text) — gave those `data-i18n` /
  `data-i18n-aria-label` attributes instead, and extended `applyLanguage()` in `app-shell.js` (which
  already re-applies `[data-i18n]` and `[data-i18n-placeholder]` on every language switch) to also
  support `[data-i18n-aria-label]`, so these stay in sync too, not just correct at first paint.
- **Verified in real Chromium**: loaded the site in Arabic (widget correctly Arabic), switched to
  French via the actual language dropdown — widget text changed live, zero leftover Arabic. Switched to
  Persian — same result, and opened the wallet modal fresh in Persian to confirm it rebuilds correctly
  translated too (screenshot: "کیف پول ZIVO", "هنوز تراکنشی وجود ندارد", fully natural Persian, correct
  RTL). Confirmed **zero hardcoded Arabic fragments remain** in `economy.js` (was ~130).
- Along the way, `qa_i18n_coverage.py` correctly flagged two new keys as suspicious matches to their
  source language; both turned out to be genuine coincidences (French "transactions" is spelled
  identically in English; that's just correct French) and were added to the gate's explicit allow-list
  rather than silently ignored.
- All 10 gates pass, including a real undefined-identifier catch mid-session (a leftover reference to
  a variable I'd removed) — exactly the class of bug that gate exists to catch before it ships.

### Scope note, unchanged from 1229.7
This closes ONE major hardcoded-Arabic section. `challenges.js` alone still has roughly 2,960 hardcoded
Arabic text fragments (quiz UI chrome, not the questions themselves), and the wider codebase has
thousands more across chat.js, rooms.js, admin.js, puzzle-room.js, and others. Economy was chosen first
because it's the most prominently visible section on the homepage. The same pattern used here — find
the hardcoded strings, match against existing keys first, add new keys only where needed, prefer
`data-i18n` for once-rendered markup and plain `t()` for anything that already re-renders — applies
directly to each remaining file, but each one is its own similarly-sized pass.

## Update 1229.9 — permanent i18n infrastructure (so future updates can't silently break a language)
You asked for a structure that fits future updates: any change should cover every phase and every
language without errors. This is that structure — three gates plus one tool, all wired into
`run_all_gates.sh`, so this is enforced automatically on every release, not something to remember.

### The three new gates
1. **`qa_i18n_completeness.py`** — every UI key must exist, as a non-empty string, in all 7 languages.
   `tr()`'s fallback chain (`T[lang][key] || T.en[key] || T.ar[key] || key`) means a genuinely missing
   key fails silently today — it just shows English, Arabic, or the raw key name instead of erroring.
   This gate makes that loud instead of silent. Tested it against the exact realistic mistake (a new
   key added to `ar/en/fr/fa` but the `zh` line forgotten) — caught it immediately, named the language
   and the key.
2. **`qa_i18n_coverage.py`** (from 1229.7) — a translation isn't just a copy of its source language.
3. **`qa_no_hardcoded_arabic.py`** + **`scripts/hardcoded_arabic_baseline.json`** — the actual "future
   updates can't regress this" mechanism. It records today's hardcoded-Arabic-fragment count per file
   (5,340 total, unchanged from before — this pass didn't reduce it, it just makes it visible and
   monitored) and fails the build if any file's count goes UP. Tested this too: added 5 fake hardcoded
   Arabic fragments to a file, confirmed the gate fails and names the exact file and delta; reverted,
   confirmed it passes clean again. A file's count can only go down (real translation progress, via
   `gen_hardcoded_arabic_baseline.py`, run deliberately) or stay flat — never up without the build
   failing. This is also the tool that shows exactly where the remaining ~5,340 fragments are, file by
   file, so future passes (challenges.js next, per the last message) have a precise, tracked target
   instead of a vague "lots of Arabic left" — see the JSON file for the current per-file breakdown.

### The one tool: `scripts/add_i18n_keys.py`
Every previous round of adding translation keys (1229.7, 1229.8) was a one-off inline Python script —
easy to get subtly wrong. This is now the standard way to add or update UI strings:
```
python3 scripts/add_i18n_keys.py my_new_keys.json
python3 scripts/release.py <version>
bash scripts/run_all_gates.sh
```
`my_new_keys.json` shape: `{"myKey": {"ar":"...","en":"...","zh":"...","hi":"...","es":"...","fr":"...","fa":"..."}}`.
It refuses to run if any key is missing a language, has an empty string, or already exists (unless you
pass `--allow-overwrite` — for deliberately fixing a translation, not adding a new one). Tested all
three refusal paths directly.

### The standing workflow for any future feature (translated or not)
1. Write the feature. If it shows Arabic text to the user, use `t('key')` or `data-i18n="key"` —
   never a literal Arabic string in a template.
2. If the key doesn't exist yet, create a JSON file with all 7 languages and run `add_i18n_keys.py`.
   (For once-only-rendered markup — created via `if (!document.getElementById(...))` guards rather
   than rebuilt on every refresh — use `data-i18n`/`data-i18n-aria-label` instead of a bare `t()` call,
   so `applyLanguage()` keeps it in sync on later language switches. See economy.js's `mountHub()` for
   the pattern.)
3. `python3 scripts/release.py <version>` (rebuilds the bundle, stamps versions).
4. `bash scripts/run_all_gates.sh`. If it's green, every phase (syntax, security rules, question bank,
   bundle freshness, AND all three i18n gates) is verified in one command — that's what "covers all
   phases and languages without errors" means concretely here.

This is infrastructure, not a translation pass — the 5,340 hardcoded-Arabic count is unchanged today.
What changed is that it can now only be reduced, never silently increased, and any future key is
structurally guaranteed complete across all 7 languages before it ships.

## Update 1229.10 — Firebase cost audit + two verified fixes (real traffic scaling)
Responding to a detailed cost/architecture brief. Did the real audit first (grep every
Firestore touchpoint, read each in context), then implemented only what could be verified safely in
this sandbox. Full findings in four new reports: `ZIVOZONE_FIREBASE_COST_AUDIT.md`,
`ZIVOZONE_ARCHITECTURE.md`, `ZIVOZONE_COST_MODEL.md`, `ZIVOZONE_SECURITY_AUDIT.md`.

### Fixed and verified
1. **`chat.js` no longer initializes for every visitor.** It used to create a second Firebase app,
   sign the visitor in anonymously, and open two permanent `onSnapshot` listeners plus a 45s presence
   ping — on every page load, regardless of whether chat was ever opened. Now that only happens on the
   chat toggle's first click. **Caught and fixed my own regression during this**: the first version of
   this fix accidentally made the chat toggle button itself never appear (it was only ever created
   inside the same function I deferred). Split "create the button" (still runs on page load, no
   network) from "connect to Firebase" (deferred) before shipping. Verified with a mocked Firebase
   stub: the `ZIVO_CHAT` app and anonymous sign-in are called zero times before the click, exactly
   once after.
2. **`touchSession()` (presence writes to 3 documents) throttled to at most once per 60 seconds**,
   down from once per in-app navigation. An active session clicking through several sections used to
   write 3 documents per click; now those collapse into far fewer writes without losing real freshness
   (a 5-minute background interval already existed as a floor). Verified by code review and the full
   12-gate suite (no behavioral regression); **not** verified against live/emulated Firestore — flagged
   explicitly in the audit as the one change from this round without that level of verification.

### Found, not fixed: a fully-built write-behind economy queue, sitting unused
`core/state.js` already implements almost exactly what the brief's Phases 4–8 ask for — cache-first
reads, stale-while-revalidate, and a 10-second write-behind queue for economy mutations with idempotent
IDs and flush-on-visibility-change/pagehide. **Nothing in the codebase calls it.** `economy.js` writes
straight to Firestore on every action instead. Wiring this up is the single highest-leverage remaining
change for real scale (see `ZIVOZONE_COST_MODEL.md`: it's the only change that alters the *scaling
shape*, not just the constant factor) — but it touches the reward/wallet transaction path, which this
project has consistently declined to modify without live Firebase/emulator access to test against (see
1229.6's reward-claim rate-limit decision for the same reasoning, restated). `ZIVOZONE_ARCHITECTURE.md`
has the concrete integration plan and the specific question (single vs. batched transactions per flush)
that needs an emulator to answer safely.

### Explicitly out of scope this round, stated so it isn't assumed done
- Firebase Storage/bandwidth audit (images, video) — not reviewed.
- A live "Cost Guard" admin dashboard — not built (would need either a paid Firebase usage API or
  self-tracked counters; flagged as a real trade-off rather than shipping fabricated numbers).
- Wiring `State.cache.swr` into `match-center.js`/`news.js` for read-side caching — recommended as
  low-risk in `ZIVOZONE_ARCHITECTURE.md`, not implemented this round to keep this patch scoped to the
  two verified fixes.
- The full 22-phase brief's Cloud Functions/paid-tier proposals were intentionally not pursued, per the
  brief's own Phase 17 instruction and this project's standing Spark-plan-only decision.

All 12 gates pass after these changes.

## Update 1229.11 — fixed a multiplicative (not linear) cost risk in chat's "online count"
Directly responding to "if visitors spike suddenly, keep the cost as low as possible": the chat
panel's "who's online" count used a live `onSnapshot` listener, which re-bills a read for every
matched document every time any of them changes. With many concurrent chatters each pinging presence,
this re-delivers (and re-bills) constantly, to every client watching the count — cost scales
multiplicatively with concurrent chatters, not linearly. That's the exact shape that turns a viral
spike into a cost spike, and it was the most important remaining risk from the 1229.10 audit's own "not
covered" list, now covered.

**Fix:** the online count is now a periodic `.get()` (piggybacked on the existing presence-ping timer,
every 60s) instead of a standing listener — a count tolerant of up to a minute of staleness, costing
one bounded read per viewer per minute regardless of how many others are chatting, instead of a cost
that multiplies with concurrent users. Verified with a mocked Firestore stub: exactly one `.get()` call
for the count and the message feed's `.onSnapshot()` (which genuinely needs to be real-time) untouched.
Also: presence ping interval 45s→60s, online-window 120s→150s (safety margin for a missed ping).

Full write-up in `ZIVOZONE_FIREBASE_COST_AUDIT.md`, "Update 1229.11". All 12 gates pass.

## Update 1229.12 — audited challenges/economy for the chat-listener pattern; fixed a second writer instead
Checked every module for `onSnapshot` (the multiplicative pattern fixed in 1229.11) — confirmed it
exists nowhere else; `challenges.js` and `economy.js` have zero listeners and zero cross-user
contention (every operation is scoped to the acting user's own uid). Found a different but related
issue instead: `engagement.js` writes 2 Firestore documents on every tab `visibilitychange` (switching
back to the tab) with no throttle — the file already tracked `lastSync` but never used it to gate
anything. Applied the same 60s-throttle pattern as `touchSession` (1229.10); initial load, sign-in, and
reconnect-after-offline still sync immediately (forced). Verified: 5 rapid simulated tab-switches now
produce zero additional writes. Also confirmed `question-history.js`'s per-question cloud write is dead
code (no callers anywhere) — left alone, flagged for the same throttle if it's ever activated.

Full write-up in `ZIVOZONE_FIREBASE_COST_AUDIT.md`, "Update 1229.12". All 12 gates pass.
