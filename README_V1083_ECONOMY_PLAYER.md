# ZIVOZONE V1083 — Economy + Player

Based on V1082/V1073. Restores a visible player profile and creates a single responsive economy navigation for Profile, Wallet, Daily Mining and ZIVO HUB.

## Economy flow
- Challenges can reward ZIVO through the existing V101 economy layer.
- Daily mining is one claim every 24 hours and credits +0.50 ZIVO to the Firebase wallet when the existing economy transaction succeeds.
- Wallet and profile read the same economy balance, so mining and rewards appear together.
- XP/Level remains separate from ZIVO.

## Mobile
A fixed bottom dock keeps Profile, Wallet, Mining and ZIVO HUB visible on phones.

## Real-money purchase
Not activated. ZIVO remains an in-platform virtual currency. Real-money purchases require a server-side payment provider and verified webhook before production use.

## Deploy
firebase deploy --only hosting
