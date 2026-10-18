# ZIVOZONE — Security Audit (current as of V1230.133)

This replaces the previous version of this document, which referenced version numbers (1229.6,
1229.10) from well before the reward system, the Dark Room/Puzzle Room/Beauty Room/Health World
mini-games, and the exit-guard rework existed. Re-verified directly against the current
`firestore.rules` and `core/modules/economy.js` on this date rather than carried forward from memory.

## Bottom line, for someone about to call this site public
Nothing here blocks a public trial/beta launch. The remaining item (below) is a conscious trade-off
of staying on Firebase's free Spark plan, it only affects the soft in-site ZIVO/XP economy (which has
no real-world redemption value today), and it should simply be known, not hidden, before the site is
advertised or shared widely.

## Confirmed fixed: the reward-forgery "dead code" bug
An earlier round found that `perfectClaim()` — the function meant to require a genuine 10/10 quiz
result before paying out `challenge_reward` — was defined in `firestore.rules` but never actually
called from `validRewardClaim()`, making it dead code. **This is fixed**: `validRewardClaim()` now
requires `(type != 'challenge_reward' || perfectClaim())`, and `perfectClaim()` requires the claim
document to show `amount/total/correct == 10`, `timedOut == 0`, `policy == '10_of_10_only'`,
`source == 'game-platform'`, `validated == true`, and a `validatedSessionId` string. Confirmed live by
the `qa_game_platform.py` gate (`firestore reward guard` checks, part of `run_all_gates.sh`).

## Confirmed fixed: double-claiming
Every reward type writes to `/zivozone/wallet/ledger/{claimId}` where `claimId` is deterministic
(derived from the thing being rewarded, e.g. `"horror_game_clear"`), inside one Firestore transaction.
A second claim with the same `claimId` is rejected by the document-exists check before the write, so a
user cannot claim the same reward twice by replaying the claim call. Verified in `economy.js`'s
`credit()` and exercised live for `horror_reward`/`health_reward` in prior rounds' Playwright tests.

## Still open, by design: no server-side proof that a session was actually played
This is the one honest limitation to know before calling the site public. On Firebase's **free Spark
plan there are no Cloud Functions**, so nothing server-side can independently verify that a "10/10 quiz"
or "survived the Dark Room" claim corresponds to a real play session. Every field the rules check
(`validated`, `validatedSessionId`, `amount`, `total`, `correct`, `policy`, `source`) is written by the
**browser itself**, via `economy.js` reading from the in-page `GamePlatform`/`game-session.js` result —
there is no round-trip to any server that could catch a fabricated value.

Concretely: a user who opens the browser console and calls the Firestore JS SDK directly could still
construct a ledger document that satisfies every rule (a `challenge_reward` document with
`amount:10, total:10, correct:10, timedOut:0, policy:'10_of_10_only', source:'game-platform',
validated:true, validatedSessionId:'anything-long-enough'`) and have it accepted, without ever playing.
The same applies to the simpler mini-game rewards (`health_reward`, `beauty_reward`, `horror_reward`,
`story_reward`, `mission_reward`, `competition_reward`, `achievement_reward`) — their rules only check
that `policy` matches the reward type's own name, which is even less effort to fabricate than
`perfectClaim()`'s fuller schema.

**What this does and doesn't mean in practice:**
- It is not a vulnerability a casual visitor or even a motivated non-technical user will stumble into —
  it requires knowing how to open devtools and call the Firestore SDK with the exact expected schema.
- It only affects ZIVO coins / XP, which today have no real-world value and cannot be withdrawn,
  sold, or redeemed for anything outside the site — so the actual harm from someone forging one is a
  cosmetic high score, not a financial loss.
- The real fix (a Cloud Function that independently re-runs or verifies the game session server-side)
  requires Firebase's pay-as-you-go **Blaze** plan. This remains deliberately deferred per the
  standing instruction to stay on Spark unless the free tier is explicitly outgrown and the user
  approves the upgrade — **not forgotten, not newly discovered, a known and accepted trade-off.**
- If ZIVO/XP is ever turned into something with real value (cash-outs, real prizes, a paid tier that
  reads balances), this item stops being low-stakes and the Cloud Function fix would become mandatory
  before that feature ships — flagging this now so the trade-off is revisited if that direction changes.

## No new Cloud Functions, paid APIs, or second rules file
Confirmed again this round: `firestore.rules` remains the single rules file, and nothing added since
requires leaving the Spark (free) plan.

---

## V1230.132 / V1230.133 round — full site audit (2026-10-18)

A full cybersecurity/engineering review of the entire site was run this round, covering Firebase
Hosting exposure, the match-data CI pipeline, storage rules, response headers, and a Playwright
crawl of the live pages for console/runtime errors and basic accessibility. Two critical findings,
one minor hardening, and several smaller professional-grade fixes came out of it. All are deployed
to the repo and pushed to `origin/main`; the Firebase Hosting / Storage Rules changes still need the
project owner to run `firebase deploy` for them to take effect on the live site (see "Deploy status"
below) — nothing in this round changed anything on the live site by itself.

### Critical finding 1 — public plaintext answer-key leak (fixed, V1230.132)
`firebase.json`'s hosting config serves the entire repo (`"public": "."`) except whatever is listed
under `"ignore"`. `functions/**` was never in that list, so `functions/data/answer-key.json` — a
484KB plaintext export of the correct answer to every quiz question, in every language — was
publicly fetchable by anyone who guessed or found the URL, even though no page actually linked to it.
**Fixed**: added `"functions/**"` to the ignore list, plus `Disallow: /functions/` in `robots.txt` as
a defense-in-depth signal to crawlers.

### Critical finding 2 — same leak via raw, unminified source (fixed, V1230.133)
The same answer data was *also* reachable a second way: `core/**` (the raw, fully-commented
pre-build source, as opposed to the minified `dist/` bundle actually loaded by the live pages) was
likewise never excluded from hosting. `core/modules/question-bank.js` embeds every correct answer
inline in its `Q(id, type, q, answers, correctIndex, ...)` calls, in clear text, with helpful
comments. Confirmed via a repo-wide search that no served HTML page references anything under
`core/` directly (everything live loads from `dist/app.bundle.js`), so excluding it has zero effect
on functionality. **Fixed**: added `"core/**"` to the hosting ignore list and removed the
now-pointless `/core/**` Cache-Control header rule that referenced it.

### Critical finding 3 — month-long broken match-data pipeline (fixed and verified live)
`scripts/fetch_matches.py` stamped `"version":"1197"` into every file it writes, while
`scripts/validate_match_data.py` (run right after it on every push and on a 15-minute cron) hard-
required that version to equal `"1201"`. Every single run failed validation for at least a month,
so `data/matches/*.json` stayed frozen on a stale 2026-09-20 snapshot while the live homepage's
Match Center kept requesting "today"'s file and getting 404s on every page load. **Fixed** by
correcting the three `"1197"` stamps to `"1201"` in `fetch_matches.py`. **Verified fixed in
production**, not just in theory: the workflow was manually dispatched after the fix, confirmed to
pass validation, and a near-simultaneous automatic run landed fresh match data (2026-10-11 through
2026-10-25) on `origin/main`.

### Hardening — storage.rules email-verification gap (fixed, V1230.132)
`storage.rules`'s admin check for `/reels/{fileName}` writes/deletes checked the admin email but,
unlike the equivalent check in `firestore.rules`, never required `email_verified == true`. Firebase
Auth doesn't allow a second account to register the exact same email, so this wasn't independently
exploitable — but it's a one-line fix for consistency between the two rule files, so it's done.

### Other hardening this round
- Added `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` to the sitewide
  response headers (was previously missing).
- Added `.well-known/security.txt` (RFC 9116) with a real contact address, so a security researcher
  who finds a problem has an obvious, standard way to report it responsibly instead of posting it
  publicly. Had to add a `"!.well-known/**"` negation to the hosting ignore list too, since the
  existing blanket dotfile-ignore rule (`"**/.*"`) would otherwise have swallowed it.
- Re-ran a Playwright crawl across the homepage (AR + EN), five room pages, two academy pages, a
  story page, privacy/terms, and the 404 page: zero console errors, zero broken local resources.
- Basic accessibility pass on the homepage (missing `alt` text, unlabeled buttons/inputs): clean.

### Known and accepted, not pursued further — public GitHub repository
The GitHub repo backing this site (`zivozone5-hub/zivozone`) is public, which means the full source
— including anything excluded from Firebase Hosting above — can simply be `git clone`d regardless
of any hosting-level fix. The owner was informed of this, and of the caveat that GitHub Pages on a
private repo needs a paid GitHub plan to keep serving (this repo has Pages enabled, with a `CNAME`
for `www.zivozone.com`, so it may be a live parallel deployment target). **Decision: do not change
repo visibility** — the owner explicitly asked to avoid any change that could affect the live site,
so this stays as an acknowledged, accepted trade-off rather than an open task. If this is revisited
later: GitHub → repo Settings → Danger Zone → "Change repository visibility" → Private, and confirm
the GitHub Pages plan situation first.

### Flagged, not attempted — eager bundle size
`core/modules/question-bank.js` (730KB raw) and `core/modules/i18n.js` (484KB raw) are the two
largest contributors to the ~600KB gzip JS the homepage loads eagerly. Splitting them (the question
bank by room category, i18n by active language only) could meaningfully cut first-load size, but is
a large, regression-risky refactor that deserves its own dedicated, carefully-tested session rather
than being folded into a general audit pass. Not started.

### Deploy status
Everything above is committed and pushed to `origin/main` (through V1230.133). The `firebase.json`
and `storage.rules` changes are config, not application code — they only take effect once the owner
runs `firebase deploy --only hosting` and `firebase deploy --only storage:rules` respectively. The
match-data pipeline fix is already live (GitHub Actions deploys data independently of `firebase
deploy`). No action in this round touched the live site directly.
