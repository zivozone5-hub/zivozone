# ZIVOZONE V91 — AUTH + ZIVO FIX

Fixes Firebase auth race conditions in the unified ZIVO wallet and reward flow. Wallet actions and perfect-score rewards now wait for Firebase Auth readiness before falling back to login. Runtime cache version is 91.0.
