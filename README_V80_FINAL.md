# ZIVOZONE V80 — Professional foundation

## What is actually implemented
- Firebase Auth account can be both a player account and the owner account. This is intentional.
- Owner account: raefalbtish@gmail.com / UID rBlzUigQ6DhgD4CK6VX3tS43PS43.
- Player cloud profile: level, XP, wins, games, last activity.
- Server-authoritative ZIVO wallet: summary + transaction ledger.
- Server-side game reward, daily reward and shop spending endpoints.
- Owner command center with users, players, active-now, daily visitors/logins/games and platform status.
- Owner bootstrap to grant admin custom claim.
- News system and existing ZIVOZONE experiences preserved.

## Required deployment
From the project root:
`firebase deploy --only functions,firestore:rules`
Then upload the site files to GitHub Pages.

## Economy roadmap
ZIVO is currently an internal platform asset/points system. It must not be presented as cash or a tradable token yet. Before any external token/value is introduced, add legal review, tokenomics, custody/security, anti-fraud, identity/abuse controls and a compliant external ledger/token layer.
