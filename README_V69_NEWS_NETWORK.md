# ZIVOZONE V69 — Dual Arabic News Network

## Rail 1 — Sports
Global + Arab + Jordan football/sports headlines.

## Rail 2 — General
Arabic general news from Arab/international/Jordan sources.

## Architecture
Browser -> Firebase Callable `getNewsNetwork` -> RSS sources -> Firestore cache -> two continuous TV-style rails.

The browser never fetches third-party RSS feeds directly, avoiding GitHub Pages CORS problems.

Only headlines/metadata are displayed, with source attribution preserved. The full article remains on the source site.

Sources configured:
- BBC Sport RSS
- Sky News Arabia RSS
- Al Jazeera Arabic RSS
- BBC Arabic RSS
- Asharq Al-Awsat RSS
- Google News RSS queries for Jordan-focused discovery

Cache refresh: 15 minutes.
