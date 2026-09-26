# ZIVOZONE — Cost Model (Firebase Spark / free-tier reference)

These are **rough, order-of-magnitude estimates**, not a bill prediction. They're built from the real
write/read patterns found in `ZIVOZONE_FIREBASE_COST_AUDIT.md`, applied against Firebase's published
Spark-plan daily free quotas (50,000 reads/day, 20,000 writes/day, 20,000 deletes/day, 1 GiB stored,
10 GiB/month network egress — these are Google's standard published Spark limits, not numbers I
measured from this project's actual Firebase console, which I don't have access to). Treat every
number below as "roughly", not "exactly".

## Per-session Firestore cost, before vs. after this round's fixes

Assume a logged-in user who browses 8 sections in one sitting (a reasonably active session).

| | Before (pre-1229.10) | After (1229.10) |
|---|---|---|
| Session-presence writes (`touchSession`) | ~24 (3 docs × 8 navigations) | ~3–6 (throttled to at most one write-burst per 60s) |
| Chat listeners opened, even if chat is never used | 2 onSnapshot + 1 anonymous auth session | 0 |
| Chat presence writes, if chat never opened | 1 immediate + 1 every 45s forever | 0 |
| **Total writes, chat unused (majority case)** | **~24+** | **~3–6** |
| **Total writes, chat opened and used for 2 minutes** | ~24 + ~3 (2 min ÷ 45s pings) | ~3–6 + ~3 (same, now opt-in) |

The chat fix's impact is proportional to **what fraction of visitors never open chat** — for a typical
site that's the large majority, so the realistic session-weighted average write count drops
substantially, dominated by the `touchSession` fix which affects every session, not just chat users.

## Scaling scenarios

Firestore charges (and Spark's free quota counts) per read/write/delete, summed across all users, per
day — so "reads/session" × "sessions/day" is the number that matters, not concurrent users.

| Daily active users | Rough writes/day BEFORE (est.) | Rough writes/day AFTER (est.) | Spark free write quota |
|---|---|---|---|
| 1,000 | ~24,000 (already over quota on writes alone) | ~4,000–6,000 | 20,000/day |
| 10,000 | ~240,000 | ~40,000–60,000 | 20,000/day |
| 100,000 | ~2,400,000 | ~400,000–600,000 | 20,000/day |
| 1,000,000 | ~24,000,000 | ~4,000,000–6,000,000 | 20,000/day |

**Reading this table correctly:** even after the fix, anything past roughly 3,000–5,000 daily active
users **will exceed the Spark free write quota** on `touchSession` presence-tracking alone, before
counting mining, rewards, or chat. That is not a failure of this round's fixes — a presence system
that writes on navigation was always going to scale linearly with (users × sections visited), and no
client-side throttle changes that scaling shape, only its constant factor (roughly 4–6× reduction here).
**The only way to change the shape, not just the constant, is the write-behind queue described in
`ZIVOZONE_ARCHITECTURE.md`**, which turns "3 writes per navigation" into "at most 3 writes per 10-second
window regardless of how many actions happened in it" — a fundamentally different scaling curve, which
is exactly why that queue (currently dormant) is the highest-leverage next step for real growth, not
this round's throttle.

## Reads
The audit found no significant per-visitor Firestore read cost — questions are bundled JS, news and
matches are static JSON from Hosting, and the admin dashboard (the one place with real read volume) is
a single-operator tool, not a per-visitor cost. **Reads are not the growth risk here; writes are.**

## What actually needs to happen before this scales past a few thousand daily users
1. Wire up the write-behind queue for `touchSession` too (not just economy) — it's the same pattern,
   and presence data tolerates a 10-second delay far more easily than wallet mutations do, so this is
   arguably *lower* risk than the economy migration and could be done first.
2. Wire up the economy queue itself, following the integration plan and emulator-testing checklist in
   `ZIVOZONE_ARCHITECTURE.md` — this is the change that actually alters the scaling shape, not just the
   constant factor.
3. Beyond a few tens of thousands of daily users, re-audit the admin dashboard's read pattern (it
   currently reads the full users/players/visitor-stats collections on every open) — fine for one
   operator checking occasionally, wasteful if checked frequently as the underlying collections grow.

## Honesty about what this document is and isn't
This is a planning aid built from real code patterns and Google's published free-tier numbers, not a
guarantee. Actual Firestore document sizes, exact read patterns per screen, and real user behavior
(how many sections an average session actually visits) will shift every number here. Before relying on
this for a real budget or a "when do I need to upgrade to Blaze" decision, check the Firebase
console's actual usage graphs once real traffic exists — they will be accurate where this document can
only be a reasonable estimate.
