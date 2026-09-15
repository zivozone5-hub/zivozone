# ZIVOZONE V1118 — REGRESSION REPAIR

- Restored V1080 player-hub functionality inside the canonical PlayerHub module.
- Restored achievement presentation and competition shortcuts without loading legacy runtimes.
- Fixed Hub mining action to call Economy.mine() instead of opening the wallet only.
- Preserved the unified Economy ledger and Firebase-backed wallet.
- Removed dead V1080/V1081 CSS sections from legacy-base.css.
- No new runtime layer or new service was introduced.
