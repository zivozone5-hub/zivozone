# ZIVOZONE V1056.1 — Firestore Rules Syntax Fix

This patch fixes the missing closing brace in `firestore.rules` from V1056.
No application logic was changed.

Deploy from this folder:

`firebase deploy --only hosting,firestore:rules,functions`
