# ZIVOZONE V72 — Full Production News Rail

This release keeps the complete ZIVOZONE site and replaces only the news-rail runtime.

## News architecture
- GitHub Actions updates `data/news.json` once every 24 hours.
- The website reads the generated JSON directly from GitHub Pages.
- Two rails are displayed: Sports and General.
- Visible headlines are Arabic-only.
- Every item keeps its source and original URL when available.
- The ticker duplicates the sequence and calculates animation duration from content width, creating a continuous TV-style loop.
- Desktop reading speed is approximately 42 px/s; mobile is approximately 30 px/s.
- Browser cache lasts up to 24 hours, with a background freshness check.
- No Firebase Cloud Functions or Blaze billing is required for this news feature.

## Important
Do not remove `data/news.json` or `.github/workflows/news.yml`.
