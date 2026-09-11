# ZIVOZONE V1058 — Mobile First / Spark Free

This release is an additive hardening layer over V1057.

## Included
- Mobile-first challenge cards with full-card touch targets.
- Full question text visibility on mobile; no forced clipping of question/answer content.
- Premium challenge card styling.
- Rolling 24-hour mining cooldown instead of a UTC-calendar ledger lock.
- Mining reward remains +0.50 ZIVO per completed 24-hour cycle.
- Perfect challenge reward remains +10 ZIVO only for authenticated users completing 10/10 with no timeout.
- No Cloud Functions required.
- Existing Firebase initialization and admin console are preserved.
- News rails are visually compacted without replacing their data source.

## Important
The Spark plan cannot make a client-side economy fully tamper-proof. Firestore rules provide the enforced constraints available without Cloud Functions. For stronger server-authoritative scoring/rewards, a paid backend would be required.
