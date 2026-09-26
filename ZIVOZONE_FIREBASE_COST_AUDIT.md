# ZIVOZONE — Firebase Cost Audit (V1229.10)

Scope: a real, grep-and-read audit of every Firestore read, write, and realtime listener in the
current codebase — no invented APIs, no assumed collections. Two concrete fixes from this audit are
already implemented and verified (below). Everything else is reported honestly as found, including a
major piece of already-built-but-unused infrastructure.

## Method
`grep -rn "onSnapshot\|\.get()\|getDocs(\|setDoc(\|updateDoc(\|addDoc(\|\.batch()\|runTransaction(\|\.collection("` across `core/**/*.js`, then read every call site in context (not just the matched line) to classify it correctly.

## Realtime listeners (`onSnapshot`) — the full list, all 1(now 0-by-default) of them
There is exactly **one feature** in the entire codebase that uses `onSnapshot`: **public chat**
(`core/modules/chat.js`). It actually opens **two** listeners when active — the message feed and a
"who's online" presence query — plus a `setInterval` presence ping every 45s.

- **CRITICAL (fixed in 1229.10):** `chat.js` used to call `init()` unconditionally on every page load
  (`window.addEventListener('load', () => setTimeout(init, 500))`), which:
  1. Created a **second Firebase app** and signed the visitor in **anonymously**.
  2. Opened **both** `onSnapshot` listeners immediately.
  3. Started the 45-second presence-ping `setInterval` — forever, for the life of the tab.
  — for **every single visitor**, regardless of whether they ever open the chat panel. In practice
  the large majority of visitors never touch chat, so this was the single largest avoidable
  reads/listeners/writes source in the project, and it scales with total visitors, not with actual
  chat usage.
  **Fix:** `init()` (the Firebase/anonymous-auth/listeners part) now only runs the first time a
  visitor actually clicks the chat toggle. `mount()` (just the toggle button's DOM, no network) still
  runs on page load, or the button itself would never appear — verified this exact regression during
  the fix and corrected it before shipping. Verified with a mocked Firebase stub: the `ZIVO_CHAT`
  named app and `signInAnonymously()` are called **zero times** before the click and **exactly once**
  after it.

## Firestore writes — by feature

| Feature | File | Trigger | Frequency | Severity |
|---|---|---|---|---|
| Session presence (`players`, `users`, `siteStats/visitors/{day}`) | `auth.js` `touchSession()` | every in-app navigation (`hashchange`), every tab-refocus, plus a 5-min interval | **HIGH before fix** — an active user clicking through N sections triggered 3×N writes just to keep a timestamp fresh | **Fixed in 1229.10** — see below |
| Guest visitor tracking | `auth.js` `trackGuest()` | once per guest page load, gated by analytics consent (since 1229.0) | 1 write, consent-gated | LOW |
| Daily mining | `economy.js` | user clicks "mine", capped at once/24h **by the security rules themselves** (`resource.data.nextMiningAt <= request.time`), not just client logic | ≤1 write per user per day | LOW — already well-bounded |
| Perfect-challenge reward | `economy.js` | once per 10/10 challenge completion | Low, but see the forgery caveat already documented in `V1229_PHASE1_NOTES.md` (1229.6) — a cost audit doesn't change that finding | LOW (cost-wise) |
| Public chat message | `chat.js` `send()` | user sends a message, client-throttled to 1 per 3s and rules-enforced server-side too | Low, opt-in (chat is now lazy-loaded) | LOW |
| Chat presence ping | `chat.js` | every 45s while chat panel has ever been opened this session | Low now that it's opt-in | LOW |
| Admin dashboard load | `admin.js` | every time the admin opens the dashboard | Up to ~500 user reads + ~500 player reads + ~1000 dated visitor-stat reads + ~80 chat reads + ~500 ban reads, **plus up to 6 sub-collection reads for each of the first 80 rows** (≈480 more) | Single-user (site owner) tool, not a per-visitor cost, but will keep growing with total registered users — see Recommendations | MEDIUM, contained |

**HIGH, fixed in 1229.10 — `touchSession()`:** was writing to 3 documents on *every* in-app
navigation. Added a 60-second client-side throttle: repeated calls within 60s of the last real write
are now no-ops (a `force=true` escape hatch is kept for anything that later needs to bypass it). The
5-minute background interval already guarantees `lastSeenAt` never goes stale for long, so this loses
no real freshness. **Verification note, stated plainly:** this was checked by direct code review (the
guard is a single, simple, easily-audited `Date.now() - lastSessionTouchAt < 60000` check) and the
full project gate suite (all 12 gates, including every existing browser-driven test, still pass with
no regression). It was **not** verified against a live or emulated Firestore project — no such
environment is available in this sandbox — so please confirm presence/last-seen data still looks
correct in the Firebase console after deploying this specific change.

## Firestore reads — content data (questions, news, matches)
**Already static, already correct — nothing to fix here.** This matches what the brief calls Phase 3
almost exactly, and it was already true before this audit:
- **Questions**: `core/modules/question-bank.js` is plain JavaScript data shipped inside
  `dist/app.bundle.js` — zero Firestore reads per question, ever. Every visitor downloads the bundle
  once (cached by the service worker); no per-user, per-question network cost exists at all.
- **News**: fetched from `data/news.json` (Hosting/CDN), with a GitHub-hosted mirror as a fallback —
  not Firestore. See `core/modules/news.js`.
- **Matches**: fetched from `data/matches/*.json` (Hosting/CDN) with an ESPN endpoint as a live
  fallback — not Firestore. See `core/modules/match-center.js`.

## Major finding: a write-behind economy queue already exists — and is completely unused
`core/state.js` (475 lines) implements almost exactly what Phases 4–8 of your brief ask for:
cache-first reads, a stale-while-revalidate helper (`State.cache.swr`), and — specifically —
**`State.economy.queue()` / `State.economy.registerSync()` / a 10-second write-behind flush timer**,
with `visibilitychange`/`pagehide` flush-on-exit, idempotent mutation IDs, and an explicit code
comment: *"must perform an atomic Firestore transaction... never trust a client-provided absolute
wallet balance... prefer signed deltas + idempotent event IDs."* Whoever designed this had exactly the
right instincts.

**It is never called.** A full-codebase search for `ZIVOZONE_STATE`, `window.State.`, or
`registerEconomySync` outside `state.js` itself returns nothing. `economy.js` writes directly to
Firestore on every mining/reward action instead of routing through this queue — the infrastructure
this audit would otherwise recommend *building* already exists, dormant.

**Why I did not wire it up in this pass, stated plainly:** doing so changes the timing and batching of
every wallet mutation in a project that has no live Firebase project or emulator available here to
test against. The existing `firestore.rules` mining/reward logic (documented in 1229.6) ties a wallet
update to a specific claim/mining document via `getAfter()` and exact `request.time` equality *within
one atomic commit* — before routing mutations through a queue that can batch multiple pending items
into one flush, that rules logic needs to be re-verified against however the batched sync handler
actually commits its writes, or the 24-hour mining cooldown and reward-claim binding could silently
stop working for everyone. That is exactly the class of untested, financially-adjacent change this
project has consistently avoided shipping blind (see the reward-claim rate-limit decision in 1229.6
for the same reasoning). See `ZIVOZONE_ARCHITECTURE.md` for the concrete integration plan.

## Analytics
Already Firestore-free by design: page views and events go through Google Analytics 4
(`core/events.js`), gated behind opt-in consent (1229.0). No per-event Firestore writes exist anywhere
in the codebase. Guest visitor tracking (`siteStats/visitors`) is the one Firestore-adjacent analytics
write, and it is a single bounded document per guest per day, not a per-event log.

## What this audit did NOT cover
- Firebase Storage / bandwidth for images and video (Phase 13 of the brief) — not audited this round;
  a quick follow-up would be to grep for `firebase.storage()` usage and check asset sizes/formats.
- A live Cost Guard admin dashboard (Phase 14) — not built. It would itself need to read aggregated
  usage data from somewhere (Firebase's own usage API, which needs a paid plan to query
  programmatically, or self-tracked counters) — flagging this as a real cost/complexity trade-off
  rather than building a dashboard that shows fabricated numbers.

## Update 1229.11 — the multiplicative cost risk in "who's online" (fixed)
Directly answering "if traffic spikes suddenly, don't let cost spike with it": found and fixed a cost
pattern that scales **multiplicatively**, not linearly, in concurrent users — exactly the shape that
turns a popularity spike into a cost spike.

**The problem:** the chat panel's "who's online" count was a **live `onSnapshot` query** over
`publicChatPresence`. A Firestore listener re-delivers — and re-bills a read for — every document in
its result set **every time any one of them changes**. With N people chatting simultaneously, each
pinging their own presence every ~45s, the query's result set changes constantly, and each change
re-bills up to 100 document reads to **every client currently displaying the online count**. Cost here
scales roughly as (concurrent chatters) × (ping frequency) × (result set size) × (viewers of the
count) — a genuinely multiplicative shape. This is the single riskiest pattern found in either audit
pass, because it's invisible at low traffic (a handful of users barely notice) and compounds exactly
when a site goes viral.

**The fix:** the online count is now a plain periodic `.get()` (one bounded read, piggybacked on the
existing presence-ping timer, every 60 seconds) instead of a standing listener. A "who's online" number
does not need second-level precision — a reading that's up to 60 seconds stale is invisible to users
and turns the cost shape linear: one bounded read per viewer per minute, full stop, regardless of how
many other people are chatting at the same time. Verified with a mocked Firestore stub: opening chat
now triggers exactly one `.get()` call for the count (was one `.onSnapshot()` before), while the actual
message feed correctly keeps its `.onSnapshot()` listener — that one delivers new messages, which is
the feature itself and genuinely needs to be real-time, unlike a count.

Also raised the presence ping interval from 45s to 60s (fewer writes per active chatter) and the
"considered online" window from 120s to 150s to comfortably tolerate a missed ping or two without
someone flickering to "offline" and back.

This is now the audit's single highest-confidence fix for the stated goal (avoid a cost spike when
visitor numbers spike suddenly), because unlike the write-behind economy queue, it required no change
to any transaction or security-sensitive logic — it only changes how a non-critical, tolerant-of-
staleness number is fetched.

## Update 1229.12 — audited challenges + economy for the same multiplicative pattern; found a second unthrottled writer instead
Systematically re-checked every module for `onSnapshot` and any other listener-based pattern, since
1229.11 fixed the one confirmed case (chat's online count). Result: **`onSnapshot` appears nowhere else
in the codebase** — chat was the only file using it, and both of its uses are now handled correctly
(count is polled, message feed is a legitimate listener). `challenges.js` and `economy.js` have zero
listeners and zero cross-user contention risk: every read/write in `economy.js` is scoped to
`users/{the-acting-user's-own-uid}/...`, so no user's mining or reward transaction can ever contend
with another user's — there is no multiplicative risk here regardless of how many people play at once.

**A second, real, previously-unfixed cost issue was found instead** (same *class* of bug as
`touchSession`, not the same multiplicative shape as chat's listener): `core/modules/runtime/
engagement.js` writes 2 Firestore documents on every `visibilitychange` event — i.e., every time a
signed-in visitor switches back to the tab, which for a real session (checking messages, coming back,
repeatedly) can happen dozens of times — with **no throttle at all**, stacking on top of the
already-throttled `touchSession` writes. Notably, the file already tracked `s.lastSync` after every
successful sync but never used it to gate anything — the fix was making it do what it was clearly
built to do.

**Fix:** `sync()` now only performs the actual 2-document write if at least 60 seconds have passed
since the last real sync (same threshold and pattern as `touchSession`, 1229.10); the initial
post-load sync, a fresh sign-in, and reconnecting after being offline explicitly bypass the throttle
(`force=true`) since those are genuinely meaningful moments to sync promptly. The local, no-cost
`activeSeconds` counter (`tick()`, every 5s) is completely unaffected — only the Firestore write is
throttled, not the underlying stat.

**Verified** with a mocked Firestore stub: the forced initial/auth syncs write as expected, then five
rapid simulated `visibilitychange` events in immediate succession produce **zero** additional writes.

**Also found, and left alone on purpose:** `core/modules/runtime/question-history.js` has a `record()`
function that would write to Firestore on every answered question if it were called — but a full-
codebase search shows **it is never called from anywhere**. This is dead code with zero current cost
impact (matching the pattern found earlier in the question-bank consolidation, 1229.5), not an active
risk, so it was left as-is rather than "optimized" for a call path that doesn't exist yet. If this
feature is wired up later, it should get the same throttle treatment before it ships.

### Summary after two audit passes (1229.10, 1229.11, 1229.12)
- **Multiplicative-with-concurrent-users risk**: found once (chat's online count), fixed (1229.11).
  None remain — confirmed by re-checking every file for `onSnapshot`.
- **Unthrottled per-user write amplification**: found twice (`touchSession` in 1229.10,
  `engagement.js` sync in 1229.12), both fixed with the same 60-second-throttle pattern.
- **Dead/unused write paths**: `question-history.js`'s `record()`, and the write-behind economy queue
  in `core/state.js` (1229.10) — neither costs anything today; the former should be throttled if
  activated, the latter is the recommended next real architecture step once live Firebase testing is
  available (see `ZIVOZONE_ARCHITECTURE.md`).
