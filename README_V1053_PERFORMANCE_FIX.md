# ZIVOZONE V105.3 — Performance / Unresponsive Fix

- Removed the document-wide MutationObserver from the V103 UX layer.
- Removed the document-wide MutationObserver from the V44 runtime command layer.
- Rebinding now happens only on DOMContentLoaded, auth, and hash navigation events.
- Preserved Firebase config, Firestore rules, admin email, challenge engine, wallet/mining, terms UX, and luxury CSS.
- Cache-busting versions updated to 105.3.

Deploy with:
`firebase deploy --only hosting,firestore:rules`
