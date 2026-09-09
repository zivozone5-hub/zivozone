# ZIVOZONE V47 — Challenge Center UI Hardening

The supplied screenshot showed literal `undefined` inside challenge cards. The issue came from mixed
challenge schemas: newer V40 packs use `description` and omit `icon`, while the main renderer expected
`desc` and `icon`.

V47 adds a normalization layer, safe icons, safe localized title/description handling, question counts,
deduplication, and a consistent responsive card layout. The Dark Room remains a separate special experience.

All previous challenge banks and Firebase/cloud/server layers are preserved.
