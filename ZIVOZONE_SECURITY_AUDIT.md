# ZIVOZONE — Security Audit (this round)

The full `firestore.rules` security review — the syntax bug that likely blocked every rules deploy,
the locked-down unused root `results` collection, the bounded `players/{uid}/results` writes, the
bounded public-chat fields, and the confirmed, still-open reward-claim self-assertion vulnerability —
was already done and documented in `V1229_PHASE1_NOTES.md` under "Update 1229.6 — firestore.rules
security review". That review stands; this document only covers what's new in this round.

## What changed in 1229.10, and its security impact: none
Both fixes this round (chat lazy-init, `touchSession` throttling) are **client-side call-frequency
changes only**. Neither touches `firestore.rules`, neither changes what data can be read or written by
whom, and neither introduces a new write path. Specifically:

- **Chat lazy-init**: delays *when* `chat.js` connects to Firebase and opens listeners. It does not
  change the security rules governing `publicChat`, `publicChatPresence`, or `publicChatRate` — those
  are unchanged from 1229.6, and the client still cannot do anything through the lazy-loaded path that
  it couldn't already do once chat was open. There is no new attack surface: a motivated attacker could
  already call `window.ZIVOZONE.Chat.init()` themselves at any time (it's a public, frozen export), so
  the fix changes default behavior for typical visitors, not what's reachable via the console.
- **`touchSession` throttling**: this is a client-side no-op guard on a function whose writes were
  already validated only by `isSelf(uid)` in the rules (a user can only touch their own presence
  documents) — throttling how *often* the client attempts an already-authorized write changes nothing
  about who is authorized to make it. No new bypass is possible; a user could already call
  `touchSession(true)` (the force parameter, present for exactly this reason) as often as they liked
  before this change too, since nothing server-side rate-limited it either before or after.

## Confirmed still open (carried forward from 1229.6, restated so it isn't lost)
The reward-claim forgery path — `challenges.js` deciding client-side whether a player scored 10/10 and
calling `Economy.rewardChallenge()` directly, with no server-side verification — remains open. This
round's cost audit surfaced a **new, related risk worth naming explicitly**: today there is no
rate-limit on `rewardClaims` creation (confirmed again in this pass while reading `economy.js`'s
`credit()` function). Combined with `core/state.js`'s dormant write-behind queue, if that queue were
wired up to the economy **without** also adding server-side verification, it would not fix this
vulnerability — a forged claim queued locally and flushed every 10 seconds is exactly as forgeable as
one sent immediately, just batched. **Wiring up the write-behind queue is a cost optimization, not a
security fix, and should not be mistaken for one.** The only real fix remains a Cloud Function that
independently verifies a completed session server-side (Phase 2 of the earlier roadmap), which this
project has deliberately deferred while staying on the Firebase Spark (free) plan.

## No new Cloud Functions, paid APIs, or second security-rules file
Per the brief's own Phase 17–19 constraints: nothing in this round requires leaving the Spark plan, and
`firestore.rules` remains the single rules file — no parallel or legacy rules were introduced.
