# ZIVOZONE V1089 — Clean Engineering Shell

## Goal
V1089 is a structural cleanup release, not a feature expansion. The visual identity, routes, challenge content, and existing public IDs are preserved.

## Changes
- Reworked the header into a single responsive presentation layer for desktop, tablet, and mobile.
- Removed the full ZIVO Economy Hub from the header; the page keeps the full economy section while the header shows only a compact live wallet chip.
- Added active-route highlighting and cleaner mobile navigation behavior.
- Replaced the old text crown header mark with the real ZIVO app icon asset.
- Bumped asset cache-busting and Service Worker shell to V1089.
- Excluded `docs/**` from Firebase Hosting deployment so historical archives are not public runtime assets.
- Updated visible economy mode/version labels to V1089 naming without changing the economy contract.
- Preserved existing IDs and handlers for compatibility with the current application.

## Intentionally not changed
- Home page content and visual identity.
- XP/ZIVO/Tickets separation.
- Challenge banks and routes.
- Firebase project configuration.
- Existing authentication flow.

## Known next-stage engineering
The client-side ZIVO reward path still requires a server-authoritative callable/Cloud Function before ZIVO can be treated as a high-value or cash-equivalent asset. V1089 does not pretend to solve that without a backend deployment.
