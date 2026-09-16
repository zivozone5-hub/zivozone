# ZIVOZONE V1146 — TRUE FREE MATCH CORE

## Root cause fixed
V1145 could burst dozens of cross-origin ESPN requests simultaneously. The provider can answer with temporary 403/429/network failures, causing the module to conclude that every provider failed.

## Engineering changes
- Primary endpoint: `site.web.api.espn.com` soccer league scoreboard.
- Secondary endpoint: `site.api.espn.com`.
- Third fallback: ESPN CDN scoreboard feed.
- Concurrency limited to 2 requests.
- Plain GET requests with no custom Accept/User-Agent headers.
- A valid empty scoreboard is treated as a successful provider response.
- Only leagues that actually return usable data appear in the UI.
- Cache key reset for V1146 so V1145 failure state is not reused.
- No UI layer, overlay, legacy module, proxy, API key, or paid service added.
