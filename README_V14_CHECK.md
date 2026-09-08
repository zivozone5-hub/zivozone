# ZIVOZONE V14 — V11 base checked

This build keeps the V11-based application and Firebase configuration intact.

Fix applied:
- Removed the direct browser fetch to Google News RSS from `news.js`.
- GitHub Pages browsers block that RSS request with CORS.
- Jordan football news now renders reliable official JFA/Petra sources in-page and provides a Google News search fallback link.
- No Firebase configuration or Firestore rules were changed.

Console warnings seen from browser extensions are not part of the ZIVOZONE application.
