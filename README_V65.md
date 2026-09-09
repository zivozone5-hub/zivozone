# ZIVOZONE V65 — Integrated Live Sports + AI + Player Safety

- Single home sports ticker using the existing ZIVO banner; no duplicate ticker.
- News cache target: 24 hours. Global + Arabic + Jordanian feeds are aggregated server-side; match scores are included.
- AI is a Firebase callable using a server-side OpenAI Responses API key. No secret is placed in the static site.
- Existing challenge engine is canonical and remains inside the challenge center.
- Challenge cards now show a visual; forensic challenges use supplied evidence artwork, others get a clean contextual fallback.
- Canonical question timer remains 30 seconds and the visible challenge timer is 30.
- Server reward transaction updates player aggregates and wallet ledger; client cannot edit sensitive progression fields under Firestore rules.
- Mobile challenge cards and ticker are tightened for small screens.

Deployment requirement: set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) in Firebase Functions environment/Secret Manager before deploying functions.
