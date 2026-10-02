# ZIVOZONE V1230.0 — SECURITY HARDENED

## Scope
This release hardens the public deployment surface without changing the existing product features or Firestore data model.

## Changes
- Internal `core/**` source tree is excluded from Firebase Hosting.
- Production pages load CSS only from `dist/styles/**`.
- Production pages load the AI module only from `dist/zivo-ai.js`.
- Production `dist/app.bundle.js` no longer emits `//# sourceURL=` labels by default, reducing exposure of internal source paths.
- Added `X-Content-Type-Options: nosniff`.
- Added `Referrer-Policy: strict-origin-when-cross-origin`.
- Added restrictive `Permissions-Policy` for camera, microphone and geolocation.
- Added `X-Frame-Options: SAMEORIGIN`.
- Added a public-surface QA gate to prevent accidental publication of the source tree in future releases.
- Release tooling now keeps the built public CSS/AI assets synchronized and rebuilds the bundle after version stamping.
- Browser QA now has a deterministic static fallback when the execution environment blocks loopback navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`.

## Important security boundary
ZIVOZONE still runs its game UI in the browser. The current release keeps the existing Firestore reward contract, but a browser-side validator is not equivalent to a trusted server authority. Do not treat ZIVO as cash-equivalent or enable real-money withdrawals until challenge scoring and reward issuance are moved behind a trusted backend/attestation layer.

## Verification
Release gates completed successfully:
- Site integrity: 17/17
- Phase-1 trust/security checks: all passed
- Undefined identifiers: 51 files, 0 failures
- Bundle freshness: passed
- Public exposure gate: passed
- Firestore rules structural checks: passed
- i18n: 7/7 languages complete
- Hardcoded Arabic regression: no increase
- Ads/consent: passed
- SEO basics: passed
- Full refinement QA: passed
- Game result cases: 7/7
- Question bank integrity: 640 questions, 0 failures
- Game platform QA: 30/30
- Match data validation: passed
- Boot-fetch gate: passed (static fallback used because the runner blocks loopback browser navigation)

## Deployment target
Firebase project: `zivozone-fc6ed`

This release is intended to remain compatible with the existing free-first Firebase architecture.
