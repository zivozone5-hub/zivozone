# ZIVOZONE — Architecture (current state + recommended integration plan)

## Current architecture, as it actually is (verified by reading the code, not assumed)

```
Browser
  ├─ dist/app.bundle.js (one file, 48 modules concatenated — see V1229_PHASE1_NOTES.md 1229.4)
  │    ├─ Static content data: question-bank.js (questions, in-bundle, zero network cost per question)
  │    ├─ core/state.js: cache/pub-sub/write-behind-queue layer — BUILT, EXPORTED, UNUSED (see below)
  │    └─ Feature modules (economy, challenges, chat, admin, ...): each talks to Firestore directly
  ├─ data/news.json, data/matches/*.json — static, served from Hosting/CDN, not Firestore
  └─ Firestore — the actual source of truth for: player profiles, wallet balance, mining state,
       reward-claim ledger, public chat messages + presence, visitor stats, admin-visible aggregates
```

This is **already** a reasonable shape for a small-to-medium site: static/semi-static content bypasses
Firestore entirely, and only genuinely per-user state (wallet, progress, chat) touches it. The gap
between this and what the brief asks for is narrower than a full rewrite — it's specifically:
(1) one lazy-loaded feature was initializing for every visitor regardless of use (fixed, 1229.10),
(2) one write path fired far more often than the data needed (fixed, 1229.10), and
(3) a write-behind queue for the economy already exists but was never connected (not fixed — see plan
below, and the honest reasoning for not doing it blind).

## `core/state.js` — what it already does, in one paragraph
Every slice of app state (`player`, `economy`, `wallet`, `mining`, ...) lives in memory and is mirrored
to `localStorage` on every `set()`/`replace()`, so a page reload restores state instantly without
waiting on Firestore. `State.cache.swr(key, loader)` is a generic stale-while-revalidate helper: return
the cached value immediately, kick off exactly one background loader per key (deduplicated even if
called from multiple places at once), and only touch the UI again if the loader reports the value
actually changed. `State.economy.queue(mutation)` appends a mutation to a per-user local queue,
optimistically updates the UI, and schedules a flush; `State.economy.registerSync(fn)` is where a real
Firestore-writing function plugs in; the flush timer fires every 10 seconds, on tab-hide, and on
`pagehide`, and only clears an item from the local queue once the sync function confirms it landed.

## Why nothing currently calls it
Unknown — this predates the current work session and there's no comment or commit trail explaining it
(this codebase has no git history available in this environment). The most likely explanation, based
on the code itself, is that it was built as planned infrastructure and the corresponding call sites in
`economy.js`, `news.js`, and `match-center.js` were never migrated to use it before other priorities
took over. It is not broken — it's simply never invoked.

## Recommended integration plan (not implemented this round — see reasoning below)

### Low-risk, high-value: read-side caching (`State.cache.swr`)
This part is safe to wire up without touching money logic, because it only affects *reads* of data
that's either public or safe to show slightly stale for a few seconds:
- **Match Center** (`match-center.js`): wrap the existing ESPN/static-JSON fetch in
  `State.cache.swr('matches:' + day, loader)` instead of its own bespoke fetch-and-cache logic. Net
  effect: instant paint from cache on repeat visits, one deduplicated background fetch instead of
  potentially several if multiple components ask for the same day's matches.
- **News** (`news.js`): same pattern for `data/news.json` + the GitHub mirror. `news.js` already has
  its own cache/fallback chain (see 1229.3's dedup fix), so this would be a *replacement* of bespoke
  logic with the shared primitive, not new behavior — worth doing for consistency, not urgency.
- Risk: low. Worst case if something goes wrong is stale content shown for a few extra seconds, not a
  financial or data-integrity issue. This is safe to do without live Firebase access, since it doesn't
  change what's written anywhere — only recommended, not done this round, to keep this patch focused
  on the two verified fixes rather than opening several files' fetch logic at once without a live
  environment to check the result in.

### Higher-risk, requires live-Firestore testing before shipping: the economy write-behind queue
This is the part of the brief (Phases 6–8) that matters most and is riskiest to do blind. Concretely,
wiring `economy.js`'s `mine()` and `rewardChallenge()` through `State.economy.queue()` +
`registerSync()` means:
1. A mining click or a perfect-challenge completion would append to the local queue and update the UI
   optimistically, instead of immediately opening a Firestore transaction.
2. Every 10 seconds (or on tab-hide), the queued mutations for that user get handed to a sync function
   that must batch them into the *same* atomic Firestore operations `firestore.rules` currently
   expects — the mining doc + wallet update + ledger entry, tied together by `lastMiningAt ==
   request.time` (documented in 1229.6).
3. **The open question this needs a real answer to before shipping:** if a user mines *and* completes
   a perfect challenge within the same 10-second window, the queue would hand the sync function *two*
   mutations at once. Do they need two separate transactions (safe, matches current rules exactly) or
   can they be combined into one (more efficient, but the current rules were not written with a
   multi-mutation commit in mind, and getting this wrong could make either mutation silently fail the
   rules check for every user, not just an edge case). The safe answer is almost certainly "one
   transaction per mutation type, dispatched from one sync function call" — but that needs to be
   verified against the Firestore emulator, not assumed.
4. **Recommendation:** implement `registerEconomySync()` in `economy.js` so it internally still calls
   the *existing*, already-correct `runTransaction()` code for mining and rewards — one transaction per
   queued mutation, looped — rather than trying to design a new combined-transaction format. This gets
   the real win (writes batched into 10-second windows instead of firing immediately on every click,
   and an optimistic UI that doesn't wait on a round-trip) without changing the transaction logic that
   `firestore.rules` was actually written and reviewed against. Test with the Firebase emulator:
   offline queuing, duplicate mutation IDs, two tabs queuing simultaneously, and a flush that fails
   partway through (per Phase 21 of the brief) before this reaches production.

I have not implemented this migration in this pass because I have no Firebase project or emulator
available in this sandbox to run those specific tests against, and this project has consistently
avoided shipping untested changes to the reward/wallet transaction path for exactly that reason (see
1229.6). The plan above is concrete enough to hand to whoever has emulator access, or to bring back to
this conversation if emulator access becomes available here.

## What this project should NOT do (per the brief's own Phase 17–19, and confirmed correct)
- No Cloud Functions, Cloud Run, or paid APIs were added or assumed. Everything above works within the
  Firebase Spark (free) plan, matching the decision already made earlier in this project.
- No second core, second state, or second economy file was created. `core/state.js` is the one state
  layer; the plan above is to connect existing modules to it, not duplicate it.
- No existing feature was removed. `boot.js`, `auth.js`, `economy.js`, `challenges.js`, `news.js`,
  `match-center.js`, `admin.js` all keep their current public API; the recommended change is additive
  (new call sites using an existing, already-exported API), not a breaking rewrite.
