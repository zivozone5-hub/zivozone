# ZIVOZONE V1085 — TRUE CORE

This build is a structural cleanup of V1084.

## Architecture
- One public runtime API: `window.ZIVOZONE_CORE`.
- Historical version modules are implementation details under `window.ZIVOZONE_INTERNAL`.
- Home is intentionally minimal: brand, primary challenge CTA, account CTA, and core stats.
- News rails are removed from the landing flow; sports remains a dedicated section.
- Player tools (identity, AI, wallet) remain accessible from Player/Profile surfaces.
- Firebase configuration, authentication, Firestore rules, challenge banks, and existing media assets are preserved.

## Important
The internal modules were not blindly deleted because challenge/economy/cloud behavior still depends on their tested logic. They are encapsulated behind the single Core facade instead of being exposed as separate public version layers.
