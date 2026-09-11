# ZIVOZONE V1057 — SPARK FREE ECONOMY

- Firebase Functions removed: this version does not require Blaze.
- Daily mining is implemented with an atomic Firestore transaction and Security Rules: +0.50 ZIVO, then 24h cooldown.
- Challenge economy: only a registered user with a 10/10 non-timeout result can request +10 ZIVO.
- Any score other than 10/10 receives 0 ZIVO.
- Admin email is excluded from mining/rewards.
- XP remains separate from ZIVO.

## Important security boundary
This Spark edition uses Firestore Security Rules and atomic client transactions. It prevents casual direct wallet writes and enforces the two allowed economy deltas. Because the quiz itself runs in the browser, it cannot provide the same tamper resistance as server-side validation of every answer. For that level of protection, Firebase Functions/Cloud Run would require a paid Blaze project.
