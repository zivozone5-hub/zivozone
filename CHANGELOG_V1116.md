# ZIVOZONE V1116 — CORE UX + ECONOMY + NEWS READABILITY

## Engineering objective
A structural update of the existing Core, not another visual layer. The wallet/mining UI and news ticker now have one canonical owner each.

## Economy Core
- `core/modules/economy.js` is now the single owner of Wallet + Mining presentation and behavior.
- Removed the legacy economy presentation mutation from V103.
- Removed the V1089 header-wallet mutation; the canonical Economy Core now owns the header wallet status.
- Added a clear ZIVO Hub with:
  - current balance
  - wallet access
  - daily mining amount
  - 24-hour countdown
  - visual mining progress
  - last mining operation
  - quick ledger preview
- Mining is no longer client-blocked for the site owner; the same Firestore rules still enforce the transaction contract.
- Mining now uses a unique ledger entry per successful claim and a strict 24-hour server-backed cooldown.
- Added clearer success/error feedback.

## News Core
- `core/modules/news.js` now displays one complete Arabic headline at a time.
- A headline enters from the right and exits to the left as a complete RTL sentence.
- No character-level marquee, so Arabic text is not visually reversed on mobile.
- Mobile font increased and spacing simplified for readability.
- Sports and general feeds are kept separate when data exists.
- Removed the duplicate legacy news workflow/runtime.
- One GitHub Actions RSS pipeline now updates `data/news.json` hourly.
- No paid API, Firebase Function, or server required.

## Free-hosting architecture
`RSS -> GitHub Actions -> data/news.json -> Firebase Hosting -> Core`

Firebase Hosting serves the static data and application; GitHub Actions performs the periodic free ingestion step.

## Cache / deployment
- Asset query version bumped to `1116.0`.
- Service-worker shell cache bumped to `zivozone-shell-v1116-core-1`.
- `data/news.json` remains `no-cache` in Firebase Hosting headers.

## Validation
`python scripts/validate_v1116.py` passes with the current snapshot.
