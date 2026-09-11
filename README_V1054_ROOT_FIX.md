# ZIVOZONE V105.4 — ROOT PERFORMANCE + SIGNATURE Z FIX

- Removed the remaining 5-second document-wide news DOM scan.
- News animation speed recalculates on actual news updates and resize only.
- Restored the original signature glowing Z orb in the hero.
- Restored a premium Z mark in the top brand.
- Kept Firebase/Firestore integration and existing admin/economy/challenge systems intact.

Deploy: firebase deploy --only hosting,firestore:rules
