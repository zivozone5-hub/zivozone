# ZIVOZONE V1083 — Architecture Baseline

## Official admin identity
- Admin email: `raefalbtish@gmail.com`
- Admin name: `رائف البطوش`
- The admin account is excluded from player economy/mining/reward flows.

## Changes in V1083
1. Centralized the application admin identity in `zivozone-config.js`.
2. Updated client-side admin checks to consume the centralized configuration instead of repeating the email literal.
3. Kept `firestore.rules` explicit: Firebase Security Rules must contain the literal admin email because rules do not consume browser JavaScript configuration.
4. V1081 player wallet UI no longer treats its own LocalStorage ledger as a wallet source of truth.
5. V1081 wallet UI reads the authoritative ledger exposed by `ZIVOZONE_ECONOMY` after refreshing the cloud wallet.
6. Deprecated the old `ZIVOZONE_PLAYER.addLedger()` local mutation path.
7. Updated V1080/V1081 cache-busting versions in `index.html`.

## Architecture rule going forward
- Firestore/Firebase is the source of truth for ZIVO wallet state and transactions.
- LocalStorage may cache UI/profile preferences, but must not be used as the authoritative ZIVO balance or transaction ledger.
- Admin authorization must be enforced by Firebase Security Rules/backend authorization, not only by client-side UI checks.
- Future features should extend the core instead of adding another independent wallet/economy implementation.


## V1083 Unified Architecture
- Legacy V91–V1081 presentation/runtime layers were consolidated into `zivozone-app.js` and `styles.css`.
- Old versioned JS/CSS layer files are no longer loaded or deployed.
- The homepage navigation is intentionally reduced to the essential routes: Home, Challenges, Sports, and Player.
- ZIVO AI and Identity remain available from the Player area rather than occupying primary navigation.
- The consolidation is functional, not a feature deletion: the important behavior from the legacy layers is retained in the unified runtime.
- Next engineering phase: Core data model, wallet/economy security, player hub, XP/Level separation, and end-to-end tests.
