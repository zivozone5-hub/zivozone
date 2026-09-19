# ZIVOZONE V1188 — CLEAN CORE

## Changes
- One centralized exit confirmation system: `core/modules/runtime/exit-guard.js`.
- Removed the duplicate exit-confirmation implementation from `core/modules/ui.js`.
- Challenge questions now use a strict **20-second timer per question**.
- Standard challenge sessions use 20 questions; Dark Room uses 30.
- Every challenge bank is expanded to a minimum of 50 banked questions at runtime by `question-bank-expansion.js` while preserving the original canonical pool.
- Added distinct room color identities.
- Added public text-only chat in the main screen corner.
- Chat uses a secondary anonymous Firebase identity, message length limits, client throttling, Firestore rate-state checks, owner bans, and App Check initialization when configured.
- Admin Center now includes public chat monitoring and ban/unban controls.
- Existing visitor telemetry remains active for registered and guest visitors.

## Firebase chat setup
Enable **Anonymous** sign-in in Firebase Authentication. If App Check is used, keep the configured reCAPTCHA Enterprise site key and enable enforcement in Firebase App Check after testing. Firebase recommends App Check plus restrictive Security Rules and emulator testing for production hardening.

## Architecture rule
No second challenge runtime or second exit runtime was introduced. The new modules are single-purpose Core modules and the duplicate UI exit engine was removed.
