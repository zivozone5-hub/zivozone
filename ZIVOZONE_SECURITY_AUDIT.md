# ZIVOZONE — Security Audit (current as of V1230.13)

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
