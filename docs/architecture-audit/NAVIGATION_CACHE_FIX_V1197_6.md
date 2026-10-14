# ZIVOZONE V1197.6 — Navigation / Cache Recovery Fix

## Problem
After leaving a room/challenge and returning to the site, parts of the shell could remain stale or require Ctrl+F5.

## Fix
- Versioned Service Worker cache moved from V1180 to V1197.6.
- Application JS/CSS now use network-first with cache fallback.
- Old ZIVOZONE shell caches are deleted on activation.
- Home return performs a unified UI reset.
- Challenge, puzzle, beauty, cinematic, player overlay, modal, scroll and body state are cleared.
- `pageshow` and `zivozone-home-reset` recover the home shell without requiring a hard refresh.

## Acceptance
Normal return to the site must restore the complete navigation and controls without Ctrl+F5.
