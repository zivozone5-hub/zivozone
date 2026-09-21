# ZIVOZONE V1229 — Phase 1 (Trust & Legal)

Base: V1228 STATE_CACHE_READY. Look and features unchanged; this release fixes correctness, privacy and account security.

## Fixed / changed
1. **Login & register were dead in V1228**: `closeModal` was used 7x and defined nowhere, so `openModal()` threw before the auth form got its submit handler. Defined it; removed dead quiz-timer code and the dead `quit-game` action.
2. **Local (offline) accounts removed** — they stored passwords in plaintext in localStorage. Old data is purged on first load.
3. **Age gate**: `MIN_AGE` (13) in `core/config.js`; age field no longer pre-filled with 18.
4. **Analytics is opt-in**: GA4 and guest visitor stats only after consent (banner + footer "Privacy settings"). Logged-in `page_view` logging also needs consent.
5. **Guest telemetry fix**: it read `siteStats`, which rules never allowed; now write-only with bounded fields.
6. **Real pages**: `/privacy/`, `/terms/` (AR + EN), in sitemap, linked in footer of index + 12 story pages. SW serves them network-first.
7. **firestore.rules**: owner needs `email_verified`; mining wallet/ledger/mining must share one transaction (`lastMiningAt == request.time`); new players cannot start with a balance; event logs have fixed shape; guest visitor docs are size-bounded.
8. **Register no longer copies guest `coins`** into the new account (coins start at 0).
9. **Release tooling**: `scripts/release.py` now also stamps `core/config.js` and `stories/*/index.html`. One version everywhere: 1229.0.

## New gates
- `bash scripts/run_all_gates.sh` — runs everything; non-zero exit = do not deploy.
- `scripts/qa_phase1_trust.py` — privacy/security invariants.
- `node --expose-internals scripts/qa_undefined_identifiers.js` — finds identifiers used but never declared (fails on V1228, passes on V1229).

## Deploy order (important)
1. In Firebase Console > Authentication, make sure the admin account's email is **verified** (or signs in with Google). Otherwise the admin panel locks after step 3.
2. `bash scripts/run_all_gates.sh`
3. `firebase deploy --only firestore:rules,hosting`
4. On the live site: open an account modal (it must close with X), register with age 12 (must be rejected), register with a valid age, mine once, check the consent banner, open /privacy/ and /terms/.

## Verified vs not verified
- Verified: all repo gates; 26/26 Chromium end-to-end checks (banner, consent, purge, age gate, modal, legal pages, mobile overflow) WITHOUT network.
- NOT verified: real Firebase (sign-in, wallet, chat, AI), Firestore rules in the emulator, real devices.

## Still open (next phases)
- Reward claims are still forgeable from the browser and answer keys ship in JS → needs the server function (Phase 2).
- fr/fa UI is mostly copied from en/ar; 63% of questions are Arabic-only (Phase 4).
- Legal pages are a technical draft: have a lawyer review before ads/commercial launch. Contact address = admin email; change in `privacy/` and `terms/`.
- Mobile header overlaps the hero card; canonical apex vs www; ESPN/raw.githubusercontent dependencies.

## Update 1229.1 — honesty of the economy text
- UI text no longer claims a "real wallet" or "server-level protection" (no trusted server exists yet). ZIVO is described as a virtual points balance, matching the Terms.
- `qa_phase1_trust.py` now fails if those claims reappear. Re-allow them only after Phase 2 (server authority) exists.

## Decision: stay on the free plan (Spark)
- Cloud Functions need the Blaze plan, so server-side reward authority is postponed.
- Until then ZIVO stays **points only**. Do not add any cash-out, sale, or "earn money" wording.
- Balances created before a trusted ledger exists cannot be trusted; when real value is planned, start a fresh audited ledger.
- Trigger to revisit: before ANY feature that gives ZIVO monetary value (needs server authority + legal review).
